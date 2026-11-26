import { NextResponse } from "next/server.js";
import { CAREER_ANALYSIS_PROMPT_VERSION } from "./prompt.ts";
import {
  API_ERROR_STATUS,
  analyzeRequestSchema,
  isApiErrorCode,
  MAX_REQUEST_BYTES,
  type AnalyzeRequest,
  type ApiErrorDetail,
  type ApiErrorCode,
  type ApiErrorResponse,
  type CareerAnalysis,
} from "./schema.ts";

export type CareerAnalyzer = (input: AnalyzeRequest) => Promise<CareerAnalysis>;

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export const ANALYSIS_ABUSE_LIMIT = 12;
export const ANALYSIS_ABUSE_WINDOW_MS = 60_000;
const ANALYSIS_ABUSE_MAP_LIMIT = 5_000;

type AbuseWindow = { count: number; resetAt: number };
type AbuseCheck = { allowed: true } | { allowed: false; retryAfterSeconds: number };

const analysisAbuseWindows = new Map<string, AbuseWindow>();

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_REQUEST: "The request body is invalid.",
  INVALID_CONTENT_TYPE: "Content-Type must be application/json.",
  INVALID_ORIGIN: "This request origin is not allowed.",
  TOO_MANY_REQUESTS: "Too many analysis requests. Please try again shortly.",
  PAYLOAD_TOO_LARGE: "The request body is too large.",
  MISSING_API_KEY: "Career analysis is not configured.",
  RATE_LIMITED: "The AI provider is rate limiting requests. Please try again later.",
  PROVIDER_TIMEOUT: "The AI provider timed out. Please try again.",
  PROVIDER_ERROR: "The AI provider could not complete the analysis.",
  INVALID_AI_RESPONSE: "The AI provider returned an invalid analysis response.",
  INTERNAL_ERROR: "An unexpected error occurred.",
};

type BodyReadResult = { ok: true; text: string } | { ok: false; code: "PAYLOAD_TOO_LARGE" };

function hasJsonContentType(request: Request): boolean {
  const contentType = request.headers.get("content-type")?.toLowerCase();
  return !!contentType && contentType.includes("application/json");
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);

    if (originUrl.host === requestUrl.host) {
      return true;
    }

    if (process.env.NODE_ENV !== "production") {
      return (
        originUrl.hostname === "localhost" ||
        originUrl.hostname === "127.0.0.1" ||
        originUrl.hostname === "[::1]"
      );
    }

    return false;
  } catch {
    return false;
  }
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) {
    return `ip:${forwarded}`;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return `ip:${realIp}`;
  }

  const userAgent = request.headers.get("user-agent")?.trim().slice(0, 200);
  return `client:${userAgent || "unknown"}`;
}

function consumeAnalysisSlot(request: Request): AbuseCheck {
  const now = Date.now();
  const key = getClientKey(request);
  const current = analysisAbuseWindows.get(key);

  if (!current || current.resetAt <= now) {
    if (analysisAbuseWindows.size >= ANALYSIS_ABUSE_MAP_LIMIT) {
      for (const [entryKey, entry] of analysisAbuseWindows) {
        if (entry.resetAt <= now) {
          analysisAbuseWindows.delete(entryKey);
        }
      }

      if (analysisAbuseWindows.size >= ANALYSIS_ABUSE_MAP_LIMIT) {
        analysisAbuseWindows.clear();
      }
    }

    analysisAbuseWindows.set(key, {
      count: 1,
      resetAt: now + ANALYSIS_ABUSE_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (current.count >= ANALYSIS_ABUSE_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true };
}

function errorResponse(
  code: ApiErrorCode,
  details?: ApiErrorDetail[],
  extraHeaders: Record<string, string> = {}
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    error: {
      code,
      message: ERROR_MESSAGES[code],
      ...(details && details.length > 0 ? { details } : {}),
    },
  };

  return NextResponse.json(body, {
    status: API_ERROR_STATUS[code],
    headers: { ...NO_STORE_HEADERS, ...extraHeaders },
  });
}

function asApiFailure(error: unknown): ApiErrorCode | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = (error as Record<string, unknown>).code;
  return isApiErrorCode(code) ? code : null;
}

async function readBodyWithLimit(request: Request): Promise<BodyReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return { ok: false, code: "PAYLOAD_TOO_LARGE" };
  }

  if (!request.body) {
    return { ok: true, text: "" };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    total += value.byteLength;
    if (total > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return { ok: false, code: "PAYLOAD_TOO_LARGE" };
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return { ok: true, text };
}

export async function handleAnalyzeRequest(
  request: Request,
  analyzer: CareerAnalyzer
): Promise<NextResponse> {
  try {
    if (!hasJsonContentType(request)) {
      return errorResponse("INVALID_CONTENT_TYPE");
    }

    if (!isAllowedOrigin(request)) {
      return errorResponse("INVALID_ORIGIN");
    }

    const abuseCheck = consumeAnalysisSlot(request);
    if (!abuseCheck.allowed) {
      return errorResponse("TOO_MANY_REQUESTS", undefined, {
        "Retry-After": String(abuseCheck.retryAfterSeconds),
      });
    }

    const body = await readBodyWithLimit(request);
    if (!body.ok) {
      return errorResponse(body.code);
    }

    let json: unknown;
    try {
      json = JSON.parse(body.text);
    } catch {
      return errorResponse("INVALID_REQUEST");
    }

    const parsed = analyzeRequestSchema.safeParse(json);
    if (!parsed.success) {
      const details: ApiErrorDetail[] = parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "body",
        message: issue.message,
      }));

      return errorResponse("INVALID_REQUEST", details);
    }

    const data = await analyzer(parsed.data);

    return NextResponse.json(
      {
        data,
        meta: {
          promptVersion: CAREER_ANALYSIS_PROMPT_VERSION,
          generatedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    return errorResponse(asApiFailure(error) ?? "INTERNAL_ERROR");
  }
}

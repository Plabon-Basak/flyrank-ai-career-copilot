import type {
  AnalyzeRequest,
  AnalyzeSuccessResponse,
  ApiErrorCode,
  ApiErrorDetail,
  CareerAnalysis,
} from "./types.ts";

const API_ERROR_CODES = new Set<ApiErrorCode>([
  "INVALID_REQUEST",
  "INVALID_CONTENT_TYPE",
  "INVALID_ORIGIN",
  "TOO_MANY_REQUESTS",
  "PAYLOAD_TOO_LARGE",
  "MISSING_API_KEY",
  "RATE_LIMITED",
  "PROVIDER_TIMEOUT",
  "PROVIDER_ERROR",
  "INVALID_AI_RESPONSE",
  "INTERNAL_ERROR",
]);

const FALLBACK_MESSAGES: Record<ApiErrorCode, string> = {
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

export class AnalysisApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(
    code: ApiErrorCode,
    message: string = FALLBACK_MESSAGES[code],
    status = 500,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = "AnalysisApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isApiErrorResponse(value: unknown): value is {
  error: { code: ApiErrorCode; message: string; details?: ApiErrorDetail[] };
} {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false;
  }

  const code = value.error.code;
  if (typeof code !== "string" || !API_ERROR_CODES.has(code as ApiErrorCode)) {
    return false;
  }

  if (typeof value.error.message !== "string") {
    return false;
  }

  if (value.error.details === undefined) {
    return true;
  }

  return (
    Array.isArray(value.error.details) &&
    value.error.details.every(
      (detail) =>
        isRecord(detail) &&
        typeof detail.path === "string" &&
        typeof detail.message === "string"
    )
  );
}

function isCareerAnalysis(value: unknown): value is CareerAnalysis {
  if (!isRecord(value)) {
    return false;
  }

  const roadmapValid =
    Array.isArray(value.learningRoadmap) &&
    value.learningRoadmap.every(
      (item) =>
        isRecord(item) &&
        typeof item.skill === "string" &&
        (item.priority === "high" || item.priority === "medium" || item.priority === "low") &&
        typeof item.timeframe === "string" &&
        typeof item.action === "string"
    );

  return (
    typeof value.overallMatchScore === "number" &&
    Number.isInteger(value.overallMatchScore) &&
    value.overallMatchScore >= 0 &&
    value.overallMatchScore <= 100 &&
    typeof value.summary === "string" &&
    isStringArray(value.matchedSkills) &&
    isStringArray(value.missingSkills) &&
    isStringArray(value.resumeImprovements) &&
    isStringArray(value.atsFeedback) &&
    roadmapValid &&
    isStringArray(value.limitations)
  );
}

function isAnalyzeSuccessResponse(value: unknown): value is AnalyzeSuccessResponse {
  if (!isRecord(value) || !isRecord(value.meta)) {
    return false;
  }

  return (
    typeof value.meta.promptVersion === "string" &&
    typeof value.meta.generatedAt === "string" &&
    isCareerAnalysis(value.data)
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new AnalysisApiError("INTERNAL_ERROR", "The analysis response could not be read.", response.status);
  }
}

export async function postAnalysis(
  request: AnalyzeRequest,
  options: { signal?: AbortSignal } = {}
): Promise<AnalyzeSuccessResponse> {
  let response: Response;

  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AnalysisApiError("INTERNAL_ERROR", "The analysis request was cancelled.");
    }

    throw new AnalysisApiError("INTERNAL_ERROR", "Unable to reach the analysis service.");
  }

  const payload = await readJson(response);

  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new AnalysisApiError(
        payload.error.code,
        payload.error.message,
        response.status,
        payload.error.details
      );
    }

    throw new AnalysisApiError("INTERNAL_ERROR", "The analysis service returned an unexpected error.", response.status);
  }

  if (!isAnalyzeSuccessResponse(payload)) {
    throw new AnalysisApiError("INTERNAL_ERROR", "The analysis response was incomplete.", response.status);
  }

  return payload;
}

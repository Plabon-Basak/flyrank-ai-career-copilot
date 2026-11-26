import { ApiError, GoogleGenAI } from "@google/genai";
import type { GenerateContentParameters, GenerateContentResponse } from "@google/genai";
import { buildCareerAnalysisPrompt } from "./prompt.ts";
import {
  careerAnalysisJsonSchema,
  careerAnalysisSchema,
  type AnalyzeRequest,
  type CareerAnalysis,
} from "./schema.ts";

if (typeof window !== "undefined") {
  throw new Error("This module is server-only.");
}

export const GEMINI_REQUEST_TIMEOUT_MS = 30_000;

export type ProviderConfig = {
  apiKey: string;
  model: string;
};

export type GeminiClientLike = {
  models: {
    generateContent: (params: GenerateContentParameters) => Promise<GenerateContentResponse>;
  };
};

export type AnalysisProviderErrorCode =
  | "MISSING_API_KEY"
  | "RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_ERROR"
  | "INVALID_AI_RESPONSE";

const PROVIDER_ERROR_MESSAGES: Record<AnalysisProviderErrorCode, string> = {
  MISSING_API_KEY: "Gemini API configuration is incomplete.",
  RATE_LIMITED: "The AI provider is rate limiting requests. Please try again later.",
  PROVIDER_TIMEOUT: "The AI provider timed out. Please try again.",
  PROVIDER_ERROR: "The AI provider could not complete the analysis.",
  INVALID_AI_RESPONSE: "The AI provider returned an invalid analysis response.",
};

export class AnalysisProviderError extends Error {
  readonly code: AnalysisProviderErrorCode;

  constructor(code: AnalysisProviderErrorCode, message = PROVIDER_ERROR_MESSAGES[code]) {
    super(message);
    this.name = "AnalysisProviderError";
    this.code = code;
  }
}

export function readProviderConfig(env: NodeJS.ProcessEnv = process.env): ProviderConfig {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const model = env.GEMINI_MODEL?.trim();

  if (!apiKey || !model) {
    throw new AnalysisProviderError("MISSING_API_KEY");
  }

  return { apiKey, model };
}

export function createGeminiClient(config: ProviderConfig): GeminiClientLike {
  return new GoogleGenAI({
    apiKey: config.apiKey,
    httpOptions: {
      timeout: GEMINI_REQUEST_TIMEOUT_MS,
    },
  });
}

function parseJsonText(text: string | undefined): unknown {
  if (!text) {
    throw new AnalysisProviderError("INVALID_AI_RESPONSE");
  }

  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fenced ? fenced[1] : trimmed;

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new AnalysisProviderError("INVALID_AI_RESPONSE");
  }
}

export function mapProviderError(error: unknown): AnalysisProviderError {
  if (error instanceof AnalysisProviderError) {
    return error;
  }

  if (error instanceof ApiError) {
    if (error.status === 429) {
      return new AnalysisProviderError("RATE_LIMITED");
    }

    if (error.status === 408 || error.status === 504) {
      return new AnalysisProviderError("PROVIDER_TIMEOUT");
    }

    return new AnalysisProviderError("PROVIDER_ERROR");
  }

  if (error instanceof Error) {
    const name = error.name.toLowerCase();
    const message = error.message.toLowerCase();

    if (
      name.includes("timeout") ||
      name.includes("abort") ||
      message.includes("timeout") ||
      message.includes("timed out") ||
      message.includes("aborted")
    ) {
      return new AnalysisProviderError("PROVIDER_TIMEOUT");
    }

    if (
      name.includes("rate") ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("429")
    ) {
      return new AnalysisProviderError("RATE_LIMITED");
    }
  }

  return new AnalysisProviderError("PROVIDER_ERROR");
}

export async function analyzeCareer(
  input: AnalyzeRequest,
  client?: GeminiClientLike,
  model?: string
): Promise<CareerAnalysis> {
  let activeClient = client;
  let activeModel = model;

  if (!activeClient) {
    const config = readProviderConfig();
    activeClient = createGeminiClient(config);
    activeModel = config.model;
  }

  if (!activeModel) {
    throw new AnalysisProviderError("MISSING_API_KEY");
  }

  try {
    const response = await activeClient.models.generateContent({
      model: activeModel,
      contents: buildCareerAnalysisPrompt(input),
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: careerAnalysisJsonSchema,
        temperature: 0.2,
        maxOutputTokens: 4_096,
      },
    });

    const parsed = parseJsonText(response.text);
    const validated = careerAnalysisSchema.safeParse(parsed);

    if (!validated.success) {
      throw new AnalysisProviderError("INVALID_AI_RESPONSE");
    }

    return validated.data;
  } catch (error) {
    throw mapProviderError(error);
  }
}

import { z } from "zod";

export const MAX_REQUEST_BYTES = 64 * 1024;
export const MAX_TEXT_LENGTH = 20_000;

const boundedText = (min: number, max: number) => z.string().trim().min(min).max(max);

export const analyzeRequestSchema = z.strictObject({
  resumeText: boundedText(40, MAX_TEXT_LENGTH).describe("Full resume text to analyze."),
  jobDescription: boundedText(40, MAX_TEXT_LENGTH).describe("Full job description to compare against."),
  profile: z
    .strictObject({
      targetRole: boundedText(1, 120).optional(),
      skills: z.array(boundedText(1, 80)).max(40).optional(),
    })
    .optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const careerAnalysisSchema = z.strictObject({
  overallMatchScore: z.number().int().min(0).max(100),
  summary: boundedText(20, 1_200),
  matchedSkills: z.array(boundedText(1, 80)).max(25),
  missingSkills: z.array(boundedText(1, 80)).max(25),
  resumeImprovements: z.array(boundedText(10, 300)).min(1).max(12),
  atsFeedback: z.array(boundedText(10, 300)).min(1).max(12),
  learningRoadmap: z
    .array(
      z.strictObject({
        skill: boundedText(1, 80),
        priority: z.enum(["high", "medium", "low"]),
        timeframe: boundedText(1, 40),
        action: boundedText(10, 300),
      })
    )
    .max(12),
  limitations: z.array(boundedText(10, 300)).min(1).max(8),
});

export type CareerAnalysis = z.infer<typeof careerAnalysisSchema>;

const unsupportedResponseJsonSchemaKeys = new Set(["$schema", "minLength", "maxLength"]);

function stripUnsupportedResponseJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUnsupportedResponseJsonSchema);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !unsupportedResponseJsonSchemaKeys.has(key))
        .map(([key, nested]) => [key, stripUnsupportedResponseJsonSchema(nested)])
    );
  }

  return value;
}

export const careerAnalysisJsonSchema = stripUnsupportedResponseJsonSchema(
  z.toJSONSchema(careerAnalysisSchema, { target: "draft-2020-12" })
) as Record<string, unknown>;

export const API_ERROR_STATUS = {
  INVALID_REQUEST: 400,
  INVALID_CONTENT_TYPE: 415,
  INVALID_ORIGIN: 403,
  TOO_MANY_REQUESTS: 429,
  PAYLOAD_TOO_LARGE: 413,
  MISSING_API_KEY: 503,
  RATE_LIMITED: 429,
  PROVIDER_TIMEOUT: 504,
  PROVIDER_ERROR: 502,
  INVALID_AI_RESPONSE: 502,
  INTERNAL_ERROR: 500,
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_STATUS;

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[];
  };
};

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && value in API_ERROR_STATUS;
}

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_CONTENT_TYPE"
  | "INVALID_ORIGIN"
  | "TOO_MANY_REQUESTS"
  | "PAYLOAD_TOO_LARGE"
  | "MISSING_API_KEY"
  | "RATE_LIMITED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_ERROR"
  | "INVALID_AI_RESPONSE"
  | "INTERNAL_ERROR";

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

export type AnalyzeRequestProfile = {
  targetRole?: string;
  skills?: string[];
};

export type AnalyzeRequest = {
  resumeText: string;
  jobDescription: string;
  profile?: AnalyzeRequestProfile;
};

export type LearningRoadmapItem = {
  skill: string;
  priority: "high" | "medium" | "low";
  timeframe: string;
  action: string;
};

export type CareerAnalysis = {
  overallMatchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  resumeImprovements: string[];
  atsFeedback: string[];
  learningRoadmap: LearningRoadmapItem[];
  limitations: string[];
};

export type AnalysisMeta = {
  promptVersion: string;
  generatedAt: string;
};

export type AnalyzeSuccessResponse = {
  data: CareerAnalysis;
  meta: AnalysisMeta;
};

export type AnalyzeFormValues = {
  resumeText: string;
  jobDescription: string;
  targetRole: string;
  skills: string;
};

export type AnalyzeFormField =
  | "resumeText"
  | "jobDescription"
  | "targetRole"
  | "skills"
  | "payload";

export type AnalyzeFormErrors = Partial<Record<AnalyzeFormField, string>>;

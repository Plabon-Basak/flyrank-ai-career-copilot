import type {
  AnalyzeFormErrors,
  AnalyzeFormValues,
  AnalyzeRequest,
} from "./types.ts";

export const MIN_TEXT_LENGTH = 40;
export const MAX_TEXT_LENGTH = 20_000;
export const MAX_TARGET_ROLE_LENGTH = 120;
export const MAX_SKILLS = 40;
export const MAX_SKILL_LENGTH = 80;
export const MAX_REQUEST_BYTES = 64 * 1024;

type ValidationIssueKey =
  | "resumeText"
  | "jobDescription"
  | "profile.targetRole"
  | "profile.skills"
  | "payload";

type ValidationResult = {
  isValid: boolean;
  errors: Partial<Record<ValidationIssueKey, string>>;
  normalized: AnalyzeRequest;
};

export function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

export function getRequestBytes(request: AnalyzeRequest): number {
  return new TextEncoder().encode(JSON.stringify(request)).byteLength;
}

export function validateAnalyzeRequest(request: AnalyzeRequest): ValidationResult {
  const errors: Partial<Record<ValidationIssueKey, string>> = {};

  const resumeText = typeof request.resumeText === "string" ? request.resumeText.trim() : "";
  const jobDescription =
    typeof request.jobDescription === "string" ? request.jobDescription.trim() : "";

  if (resumeText.length < MIN_TEXT_LENGTH) {
    errors.resumeText = `Enter at least ${MIN_TEXT_LENGTH} characters of resume text.`;
  } else if (resumeText.length > MAX_TEXT_LENGTH) {
    errors.resumeText = `Resume text must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`;
  }

  if (jobDescription.length < MIN_TEXT_LENGTH) {
    errors.jobDescription = `Enter at least ${MIN_TEXT_LENGTH} characters of job description.`;
  } else if (jobDescription.length > MAX_TEXT_LENGTH) {
    errors.jobDescription = `Job description must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`;
  }

  const targetRole = request.profile?.targetRole?.trim();
  if (targetRole && targetRole.length > MAX_TARGET_ROLE_LENGTH) {
    errors["profile.targetRole"] = `Target role must be ${MAX_TARGET_ROLE_LENGTH} characters or fewer.`;
  }

  const skills = request.profile?.skills ?? [];
  if (skills.length > MAX_SKILLS) {
    errors["profile.skills"] = `Enter no more than ${MAX_SKILLS} skills.`;
  } else if (skills.some((skill) => skill.trim().length > MAX_SKILL_LENGTH)) {
    errors["profile.skills"] = `Each skill must be ${MAX_SKILL_LENGTH} characters or fewer.`;
  }

  const normalized: AnalyzeRequest = {
    resumeText,
    jobDescription,
    ...(targetRole || skills.length > 0
      ? {
          profile: {
            ...(targetRole ? { targetRole } : {}),
            ...(skills.length > 0 ? { skills: skills.map((skill) => skill.trim()) } : {}),
          },
        }
      : {}),
  };

  if (getRequestBytes(normalized) > MAX_REQUEST_BYTES) {
    errors.payload = "The analysis request is too large. Shorten the resume or job description.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalized,
  };
}

export function validateAnalyzeForm(values: AnalyzeFormValues): {
  isValid: boolean;
  errors: AnalyzeFormErrors;
  request: AnalyzeRequest;
} {
  const skills = parseSkills(values.skills);
  const result = validateAnalyzeRequest({
    resumeText: values.resumeText,
    jobDescription: values.jobDescription,
    profile: {
      ...(values.targetRole.trim() ? { targetRole: values.targetRole } : {}),
      ...(skills.length > 0 ? { skills } : {}),
    },
  });

  const errors: AnalyzeFormErrors = {};
  if (result.errors.resumeText) errors.resumeText = result.errors.resumeText;
  if (result.errors.jobDescription) errors.jobDescription = result.errors.jobDescription;
  if (result.errors["profile.targetRole"]) errors.targetRole = result.errors["profile.targetRole"];
  if (result.errors["profile.skills"]) errors.skills = result.errors["profile.skills"];
  if (result.errors.payload) errors.payload = result.errors.payload;

  return {
    isValid: result.isValid,
    errors,
    request: result.normalized,
  };
}

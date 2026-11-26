import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeRequestSchema,
  careerAnalysisJsonSchema,
  careerAnalysisSchema,
} from "../src/lib/ai/schema.ts";

const validRequest = {
  resumeText:
    "Senior frontend engineer with 8 years building React and TypeScript applications across fintech and SaaS products.",
  jobDescription:
    "We need a senior frontend engineer with React, TypeScript, accessibility, testing, and design systems experience.",
  profile: {
    targetRole: "Senior Frontend Engineer",
    skills: ["React", "TypeScript"],
  },
};

const validAnalysis = {
  overallMatchScore: 82,
  summary: "The resume shows strong React and TypeScript evidence with partial design systems coverage.",
  matchedSkills: ["React", "TypeScript"],
  missingSkills: ["Accessibility measurement"],
  resumeImprovements: ["Add quantified outcomes for recent React projects."],
  atsFeedback: ["Include the exact job title in the resume headline."],
  learningRoadmap: [
    {
      skill: "Accessibility",
      priority: "high",
      timeframe: "2 weeks",
      action: "Complete an accessibility audit checklist and add evidence to the resume.",
    },
  ],
  limitations: ["The match score is an AI estimate and not a hiring or ATS guarantee."],
};

function containsKey(value, key) {
  if (Array.isArray(value)) {
    return value.some((item) => containsKey(item, key));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([entryKey, nested]) => entryKey === key || containsKey(nested, key)
    );
  }

  return false;
}

test("analyzeRequestSchema accepts a valid request", () => {
  const parsed = analyzeRequestSchema.parse(validRequest);
  assert.equal(parsed.profile.targetRole, "Senior Frontend Engineer");
});

test("analyzeRequestSchema rejects empty, oversized, and unknown fields", () => {
  assert.equal(analyzeRequestSchema.safeParse({ ...validRequest, resumeText: "" }).success, false);
  assert.equal(
    analyzeRequestSchema.safeParse({ ...validRequest, resumeText: "x".repeat(20_001) }).success,
    false
  );
  assert.equal(
    analyzeRequestSchema.safeParse({ ...validRequest, unexpected: true }).success,
    false
  );
});

test("careerAnalysisSchema rejects invalid model output", () => {
  assert.equal(careerAnalysisSchema.safeParse(validAnalysis).success, true);
  assert.equal(
    careerAnalysisSchema.safeParse({ ...validAnalysis, overallMatchScore: 101 }).success,
    false
  );
  assert.equal(
    careerAnalysisSchema.safeParse({ ...validAnalysis, resumeImprovements: [] }).success,
    false
  );
  assert.equal(
    careerAnalysisSchema.safeParse({ ...validAnalysis, inventedField: true }).success,
    false
  );
});

test("Gemini JSON schema covers all required fields without unsupported length keywords", () => {
  assert.deepEqual(
    new Set(careerAnalysisJsonSchema.required),
    new Set(Object.keys(validAnalysis))
  );
  assert.equal(containsKey(careerAnalysisJsonSchema, "minLength"), false);
  assert.equal(containsKey(careerAnalysisJsonSchema, "maxLength"), false);
});

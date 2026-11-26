import assert from "node:assert/strict";
import test from "node:test";
import {
  AnalysisProviderError,
  analyzeCareer,
  mapProviderError,
  readProviderConfig,
} from "../src/lib/ai/provider.ts";

const validRequest = {
  resumeText:
    "Senior frontend engineer with 8 years building React and TypeScript applications across fintech and SaaS products.",
  jobDescription:
    "We need a senior frontend engineer with React, TypeScript, accessibility, testing, and design systems experience.",
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

function fakeClient(responseText) {
  return {
    models: {
      async generateContent() {
        return { text: responseText };
      },
    },
  };
}

function failingClient(error) {
  return {
    models: {
      async generateContent() {
        throw error;
      },
    },
  };
}

test("readProviderConfig requires server-side Gemini configuration", () => {
  assert.throws(
    () => readProviderConfig({}),
    (error) => error instanceof AnalysisProviderError && error.code === "MISSING_API_KEY"
  );

  assert.deepEqual(readProviderConfig({ GEMINI_API_KEY: " key ", GEMINI_MODEL: " model " }), {
    apiKey: "key",
    model: "model",
  });
});

test("analyzeCareer validates a structured mocked Gemini response", async () => {
  const client = fakeClient(`\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``);
  const result = await analyzeCareer(validRequest, client, "test-model");
  assert.deepEqual(result, validAnalysis);
});

test("analyzeCareer rejects malformed or invalid mocked responses", async () => {
  await assert.rejects(
    () => analyzeCareer(validRequest, fakeClient("not json"), "test-model"),
    (error) => error.code === "INVALID_AI_RESPONSE"
  );

  await assert.rejects(
    () =>
      analyzeCareer(
        validRequest,
        fakeClient(JSON.stringify({ ...validAnalysis, overallMatchScore: 900 })),
        "test-model"
      ),
    (error) => error.code === "INVALID_AI_RESPONSE"
  );
});

test("mapProviderError maps provider failures to stable safe codes", () => {
  const timeout = new Error("Request timed out");
  timeout.name = "RequestTimeoutError";
  assert.equal(mapProviderError(timeout).code, "PROVIDER_TIMEOUT");

  const rateLimit = new Error("429 too many requests");
  assert.equal(mapProviderError(rateLimit).code, "RATE_LIMITED");

  const providerFailure = new Error("upstream failed with internal details");
  assert.equal(mapProviderError(providerFailure).code, "PROVIDER_ERROR");
});

test("analyzeCareer maps a mocked timeout to PROVIDER_TIMEOUT", async () => {
  const timeout = new Error("The operation was aborted due to timeout");
  timeout.name = "AbortError";

  await assert.rejects(
    () => analyzeCareer(validRequest, failingClient(timeout), "test-model"),
    (error) => error.code === "PROVIDER_TIMEOUT"
  );
});

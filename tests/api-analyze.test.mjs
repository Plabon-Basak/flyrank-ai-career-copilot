import assert from "node:assert/strict";
import test from "node:test";
import { ANALYSIS_ABUSE_LIMIT, handleAnalyzeRequest } from "../src/lib/ai/handler.ts";
import { MAX_REQUEST_BYTES } from "../src/lib/ai/schema.ts";

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

function request(body, headers = {}) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

async function mockAnalyzer() {
  return validAnalysis;
}

test("POST route exports only the POST method", async () => {
  const route = await import("../src/app/api/analyze/route.ts");
  assert.deepEqual(Object.keys(route), ["POST"]);
});

test("analyze handler returns validated analysis with no-store caching", async () => {
  const response = await handleAnalyzeRequest(
    request(JSON.stringify(validRequest)),
    mockAnalyzer
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(body.data, validAnalysis);
  assert.equal(body.meta.promptVersion, "2026-11-23.v1");
});

test("analyze handler rejects unsupported content types and disallowed browser origins", async () => {
  const wrongContentType = await handleAnalyzeRequest(
    request(JSON.stringify(validRequest), { "content-type": "text/plain" }),
    mockAnalyzer
  );

  assert.equal(wrongContentType.status, 415);
  assert.equal((await wrongContentType.json()).error.code, "INVALID_CONTENT_TYPE");

  const wrongOrigin = await handleAnalyzeRequest(
    request(JSON.stringify(validRequest), { origin: "https://evil.example" }),
    mockAnalyzer
  );

  assert.equal(wrongOrigin.status, 403);
  assert.equal((await wrongOrigin.json()).error.code, "INVALID_ORIGIN");

  const sameOrigin = await handleAnalyzeRequest(
    request(JSON.stringify(validRequest), { origin: "http://localhost" }),
    mockAnalyzer
  );

  assert.equal(sameOrigin.status, 200);
});

test("analyze handler rejects malformed and invalid requests", async () => {
  const malformed = await handleAnalyzeRequest(request("{"), mockAnalyzer);
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, "INVALID_REQUEST");

  const invalid = await handleAnalyzeRequest(
    request(JSON.stringify({ ...validRequest, resumeText: "too short" })),
    mockAnalyzer
  );
  const invalidBody = await invalid.json();

  assert.equal(invalid.status, 400);
  assert.equal(invalidBody.error.code, "INVALID_REQUEST");
  assert.ok(invalidBody.error.details.length > 0);
});

test("analyze handler rejects oversized requests", async () => {
  const response = await handleAnalyzeRequest(
    request("{}", { "content-length": String(MAX_REQUEST_BYTES + 1) }),
    mockAnalyzer
  );

  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, "PAYLOAD_TOO_LARGE");
});

test("analyze handler maps stable provider errors without leaking raw messages", async () => {
  const analyzer = async () => {
    throw Object.assign(new Error("secret provider detail"), { code: "MISSING_API_KEY" });
  };
  const response = await handleAnalyzeRequest(request(JSON.stringify(validRequest)), analyzer);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "MISSING_API_KEY");
  assert.equal(JSON.stringify(body).includes("secret provider detail"), false);
});

test("analyze handler maps rate limits and unknown errors", async () => {
  const rateLimited = await handleAnalyzeRequest(
    request(JSON.stringify(validRequest)),
    async () => {
      throw { code: "RATE_LIMITED" };
    }
  );
  assert.equal(rateLimited.status, 429);
  assert.equal((await rateLimited.json()).error.code, "RATE_LIMITED");

  const unknown = await handleAnalyzeRequest(request(JSON.stringify(validRequest)), async () => {
    throw new Error("unexpected internal detail");
  });
  const unknownBody = await unknown.json();

  assert.equal(unknown.status, 500);
  assert.equal(unknownBody.error.code, "INTERNAL_ERROR");
  assert.equal(JSON.stringify(unknownBody).includes("unexpected internal detail"), false);
});

test("analyze handler applies a best-effort in-process abuse limit", async () => {
  const headers = { "x-forwarded-for": "203.0.113.19" };

  for (let index = 0; index < ANALYSIS_ABUSE_LIMIT; index += 1) {
    const response = await handleAnalyzeRequest(
      request(JSON.stringify(validRequest), headers),
      mockAnalyzer
    );
    assert.equal(response.status, 200);
  }

  const blocked = await handleAnalyzeRequest(
    request(JSON.stringify(validRequest), headers),
    mockAnalyzer
  );
  const blockedBody = await blocked.json();

  assert.equal(blocked.status, 429);
  assert.equal(blockedBody.error.code, "TOO_MANY_REQUESTS");
  assert.ok(blocked.headers.get("retry-after"));
});

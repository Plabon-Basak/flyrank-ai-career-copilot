import assert from "node:assert/strict";
import test, { afterEach, mock } from "node:test";
import { AnalysisApiError, postAnalysis } from "../src/lib/analyze/api.ts";

const request = {
  resumeText: "Senior frontend engineer with eight years of React and TypeScript experience.",
  jobDescription: "We need a senior frontend engineer with React, TypeScript, and accessibility skills.",
  profile: { targetRole: "Senior Frontend Engineer", skills: ["React"] },
};

const successPayload = {
  data: {
    overallMatchScore: 82,
    summary: "Strong React and TypeScript evidence with partial accessibility coverage.",
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["Accessibility"],
    resumeImprovements: ["Add measurable project outcomes."],
    atsFeedback: ["Mirror the exact job title."],
    learningRoadmap: [
      { skill: "Accessibility", priority: "high", timeframe: "2 weeks", action: "Complete an accessibility checklist." },
    ],
    limitations: ["AI estimate only, not an actual ATS score."],
  },
  meta: { promptVersion: "2026-11-23.v1", generatedAt: "2026-11-23T00:00:00.000Z" },
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  mock.reset();
});

test("postAnalysis sends the expected request and parses success", async () => {
  const fetchMock = mock.fn(async () => jsonResponse(successPayload));
  globalThis.fetch = fetchMock;

  const controller = new AbortController();
  const result = await postAnalysis(request, { signal: controller.signal });

  assert.deepEqual(result, successPayload);
  assert.equal(fetchMock.mock.calls.length, 1);
  const [url, init] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "/api/analyze");
  assert.equal(init.method, "POST");
  assert.equal(init.cache, "no-store");
  assert.equal(init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(init.body), request);
  assert.equal(init.signal, controller.signal);
});

test("postAnalysis preserves backend validation errors and details", async () => {
  const errorBody = {
    error: {
      code: "INVALID_REQUEST",
      message: "The request body is invalid.",
      details: [{ path: "resumeText", message: "Too small." }],
    },
  };
  globalThis.fetch = mock.fn(async () => jsonResponse(errorBody, 400));

  await assert.rejects(postAnalysis(request), (error) => {
    assert.ok(error instanceof AnalysisApiError);
    assert.equal(error.code, "INVALID_REQUEST");
    assert.equal(error.status, 400);
    assert.deepEqual(error.details, errorBody.error.details);
    return true;
  });
});

test("postAnalysis preserves provider error codes", async () => {
  globalThis.fetch = mock.fn(async () =>
    jsonResponse({ error: { code: "PROVIDER_TIMEOUT", message: "Timed out." } }, 504)
  );

  await assert.rejects(postAnalysis(request), (error) => {
    assert.equal(error.code, "PROVIDER_TIMEOUT");
    assert.equal(error.status, 504);
    return true;
  });
});

test("postAnalysis handles network failures safely", async () => {
  globalThis.fetch = mock.fn(async () => {
    throw new Error("network down");
  });

  await assert.rejects(postAnalysis(request), (error) => {
    assert.ok(error instanceof AnalysisApiError);
    assert.equal(error.code, "INTERNAL_ERROR");
    assert.equal(error.message, "Unable to reach the analysis service.");
    return true;
  });
});

test("postAnalysis handles malformed responses safely", async () => {
  globalThis.fetch = mock.fn(async () => new Response("not json", { status: 200 }));
  await assert.rejects(postAnalysis(request), (error) => error.code === "INTERNAL_ERROR");

  globalThis.fetch = mock.fn(async () => jsonResponse({ data: successPayload.data }, 200));
  await assert.rejects(postAnalysis(request), (error) => error.code === "INTERNAL_ERROR");
});

test("postAnalysis handles aborted requests safely", async () => {
  const controller = new AbortController();
  globalThis.fetch = mock.fn(async (_url, init) => {
    return new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  });

  const pending = postAnalysis(request, { signal: controller.signal });
  controller.abort();

  await assert.rejects(pending, (error) => {
    assert.ok(error instanceof AnalysisApiError);
    assert.equal(error.message, "The analysis request was cancelled.");
    return true;
  });
});

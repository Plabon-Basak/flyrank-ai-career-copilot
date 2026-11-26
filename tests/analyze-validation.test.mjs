import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_SKILL_LENGTH,
  MAX_SKILLS,
  MAX_TARGET_ROLE_LENGTH,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
  getRequestBytes,
  parseSkills,
  validateAnalyzeForm,
  validateAnalyzeRequest,
} from "../src/lib/analyze/validation.ts";

const validText = "Career achievement ".repeat(4);
const validJob = "Senior engineer role ".repeat(4);

function validForm(overrides = {}) {
  return {
    resumeText: validText,
    jobDescription: validJob,
    targetRole: "Senior Frontend Engineer",
    skills: "React, TypeScript, accessibility",
    ...overrides,
  };
}

test("validateAnalyzeForm accepts valid input and normalizes request fields", () => {
  const result = validateAnalyzeForm(validForm({ resumeText: `  ${validText}  ` }));

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.request.resumeText, validText.trim());
  assert.deepEqual(result.request.profile, {
    targetRole: "Senior Frontend Engineer",
    skills: ["React", "TypeScript", "accessibility"],
  });
});

test("validateAnalyzeForm reports empty and too-short required fields", () => {
  const result = validateAnalyzeForm(validForm({ resumeText: "", jobDescription: "short" }));

  assert.equal(result.isValid, false);
  assert.match(result.errors.resumeText, /at least/);
  assert.match(result.errors.jobDescription, /at least/);
});

test("required text length boundaries match the backend", () => {
  const min = "x".repeat(MIN_TEXT_LENGTH);
  const tooShort = "x".repeat(MIN_TEXT_LENGTH - 1);
  const max = "y".repeat(MAX_TEXT_LENGTH);
  const tooLong = "y".repeat(MAX_TEXT_LENGTH + 1);

  assert.equal(validateAnalyzeRequest({ resumeText: min, jobDescription: min }).isValid, true);
  assert.equal(validateAnalyzeRequest({ resumeText: tooShort, jobDescription: min }).isValid, false);
  assert.equal(validateAnalyzeRequest({ resumeText: max, jobDescription: min }).isValid, true);
  assert.equal(validateAnalyzeRequest({ resumeText: tooLong, jobDescription: min }).isValid, false);
});

test("optional profile fields are validated and omitted when blank", () => {
  const withoutProfile = validateAnalyzeForm(validForm({ targetRole: "  ", skills: " , , " }));
  assert.equal(withoutProfile.isValid, true);
  assert.equal(withoutProfile.request.profile, undefined);

  const longRole = validateAnalyzeForm(
    validForm({ targetRole: "a".repeat(MAX_TARGET_ROLE_LENGTH + 1) })
  );
  assert.equal(longRole.isValid, false);
  assert.match(longRole.errors.targetRole, /Target role/);

  const tooManySkills = validateAnalyzeForm(
    validForm({ skills: Array.from({ length: MAX_SKILLS + 1 }, (_, i) => `skill${i}`).join(",") })
  );
  assert.equal(tooManySkills.isValid, false);
  assert.match(tooManySkills.errors.skills, /no more than/);

  const longSkill = validateAnalyzeForm(
    validForm({ skills: "a".repeat(MAX_SKILL_LENGTH + 1) })
  );
  assert.equal(longSkill.isValid, false);
  assert.match(longSkill.errors.skills, /Each skill/);
});

test("oversized payloads are rejected before submission", () => {
  const request = {
    resumeText: "r".repeat(40_000),
    jobDescription: "j".repeat(40_000),
  };

  assert.ok(getRequestBytes(request) > 64 * 1024);
  const result = validateAnalyzeRequest(request);
  assert.equal(result.isValid, false);
  assert.match(result.errors.payload, /too large/);
});

test("parseSkills trims and drops empty values", () => {
  assert.deepEqual(parseSkills(" React, , TypeScript , "), ["React", "TypeScript"]);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeProfile,
  isValidEmail,
  validateProfile
} = require("../validation.js");

function validProfile(overrides = {}) {
  return {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    targetRole: "Software Engineer",
    experienceLevel: "Mid-level",
    workArrangement: "Hybrid",
    skills: "Algorithms, technical writing",
    ...overrides
  };
}

test("valid profile returns no errors", () => {
  const result = validateProfile(validProfile());
  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test("missing required fields produce field-specific errors", () => {
  const result = validateProfile({ skills: "Research" });
  assert.equal(result.isValid, false);
  assert.equal(result.errors.fullName, "Enter your full name.");
  assert.equal(result.errors.email, "Enter your email address.");
  assert.equal(result.errors.targetRole, "Enter your target job role.");
  assert.equal(result.errors.experienceLevel, "Select your experience level.");
  assert.equal(result.errors.workArrangement, "Select your preferred work arrangement.");
});

test("invalid email format is rejected", () => {
  const result = validateProfile(validProfile({ email: "ada-at-example" }));
  assert.equal(result.isValid, false);
  assert.match(result.errors.email, /valid email address/i);
  assert.equal(isValidEmail("ada-at-example"), false);
});

test("whitespace-only required fields are treated as missing", () => {
  const result = validateProfile(validProfile({
    fullName: "   ",
    email: "\t  ",
    targetRole: "\n  ",
    experienceLevel: " ",
    workArrangement: "  "
  }));
  assert.equal(result.isValid, false);
  assert.equal(Object.keys(result.errors).length, 5);
});

test("values are trimmed and skills remain optional", () => {
  const result = validateProfile(validProfile({
    fullName: "  Ada Lovelace  ",
    email: " ada@example.com ",
    targetRole: " Software Engineer ",
    skills: "   "
  }));

  assert.equal(result.isValid, true);
  assert.equal(result.normalized.fullName, "Ada Lovelace");
  assert.equal(result.normalized.email, "ada@example.com");
  assert.equal(result.normalized.targetRole, "Software Engineer");
  assert.equal(result.normalized.skills, "");
});

test("normalizeProfile trims all string fields", () => {
  assert.deepEqual(normalizeProfile({
    fullName: " Ada ", email: " ada@example.com ", targetRole: " Developer ",
    experienceLevel: " Entry-level ", workArrangement: " Remote ", skills: " JS "
  }), {
    fullName: "Ada",
    email: "ada@example.com",
    targetRole: "Developer",
    experienceLevel: "Entry-level",
    workArrangement: "Remote",
    skills: "JS"
  });
});

test("invalid experience level and work arrangement are rejected", () => {
  const result = validateProfile(validProfile({
    experienceLevel: "Executive",
    workArrangement: "Unknown"
  }));
  assert.equal(result.isValid, false);
  assert.match(result.errors.experienceLevel, /valid experience level/i);
  assert.match(result.errors.workArrangement, /valid work arrangement/i);
});

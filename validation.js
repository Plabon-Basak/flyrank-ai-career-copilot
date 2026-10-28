(function (root, factory) {
  const validation = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = validation;
  }

  if (root) {
    root.ProfileValidation = validation;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const EXPERIENCE_LEVELS = ["Student", "Entry-level", "Mid-level", "Senior"];
  const WORK_ARRANGEMENTS = ["Remote", "Hybrid", "On-site"];

  function trimValue(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeProfile(profile) {
    const source = profile && typeof profile === "object" ? profile : {};
    return {
      fullName: trimValue(source.fullName),
      email: trimValue(source.email),
      targetRole: trimValue(source.targetRole),
      experienceLevel: trimValue(source.experienceLevel),
      workArrangement: trimValue(source.workArrangement),
      skills: trimValue(source.skills)
    };
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateProfile(profile) {
    const normalized = normalizeProfile(profile);
    const errors = {};

    if (!normalized.fullName) errors.fullName = "Enter your full name.";
    if (!normalized.email) {
      errors.email = "Enter your email address.";
    } else if (!isValidEmail(normalized.email)) {
      errors.email = "Enter a valid email address (for example, name@example.com).";
    }
    if (!normalized.targetRole) errors.targetRole = "Enter your target job role.";
    if (!normalized.experienceLevel) {
      errors.experienceLevel = "Select your experience level.";
    } else if (!EXPERIENCE_LEVELS.includes(normalized.experienceLevel)) {
      errors.experienceLevel = "Select a valid experience level.";
    }
    if (!normalized.workArrangement) {
      errors.workArrangement = "Select your preferred work arrangement.";
    } else if (!WORK_ARRANGEMENTS.includes(normalized.workArrangement)) {
      errors.workArrangement = "Select a valid work arrangement.";
    }

    return { isValid: Object.keys(errors).length === 0, errors, normalized };
  }

  return {
    EXPERIENCE_LEVELS,
    WORK_ARRANGEMENTS,
    trimValue,
    normalizeProfile,
    isValidEmail,
    validateProfile
  };
});

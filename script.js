(() => {
  "use strict";

  const STORAGE_KEY = "aiCareerCopilot.careerProfile.v1";
  const form = document.getElementById("career-profile-form");
  const resetButton = document.getElementById("reset-button");
  const statusMessage = document.getElementById("form-status");
  const fieldNames = ["fullName", "email", "targetRole", "experienceLevel", "workArrangement", "skills"];
  const fieldElements = Object.fromEntries(fieldNames.map((name) => [name, form.elements[name]]));
  let lastSavedProfile = null;

  function profileFromForm() {
    return Object.fromEntries(fieldNames.map((name) => [name, fieldElements[name].value]));
  }

  function populateForm(profile) {
    const normalized = ProfileValidation.normalizeProfile(profile);
    fieldNames.forEach((name) => {
      fieldElements[name].value = normalized[name] || "";
    });
    clearErrors();
  }

  function clearErrors() {
    fieldNames.forEach((name) => {
      const element = fieldElements[name];
      element.removeAttribute("aria-invalid");
      const errorElement = document.getElementById(`${element.id}-error`);
      if (errorElement) errorElement.textContent = "";
    });
  }

  function showErrors(errors) {
    clearErrors();
    Object.entries(errors).forEach(([name, message]) => {
      const element = fieldElements[name];
      if (!element) return;
      element.setAttribute("aria-invalid", "true");
      const errorElement = document.getElementById(`${element.id}-error`);
      if (errorElement) errorElement.textContent = message;
    });

    const firstInvalidName = Object.keys(errors)[0];
    if (firstInvalidName && fieldElements[firstInvalidName]) {
      fieldElements[firstInvalidName].focus();
    }
  }

  function setStatus(message, type) {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
    statusMessage.setAttribute("role", type === "error" ? "alert" : "status");
    statusMessage.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    if (!message) return;
    statusMessage.classList.add(type);
    statusMessage.textContent = message;
  }

  function loadSavedProfile() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const result = ProfileValidation.validateProfile(parsed);
      if (result.isValid || Object.keys(result.errors).every((name) => name === "skills")) {
        lastSavedProfile = result.normalized;
        populateForm(lastSavedProfile);
      }
    } catch (error) {
      setStatus("Saved profile data could not be loaded.", "error");
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = ProfileValidation.validateProfile(profileFromForm());

    if (!result.isValid) {
      showErrors(result.errors);
      setStatus("Please correct the highlighted fields before saving.", "error");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.normalized));
      lastSavedProfile = result.normalized;
      populateForm(result.normalized);
      setStatus("Career profile saved successfully.", "success");
    } catch (error) {
      setStatus("The profile could not be saved in this browser.", "error");
    }
  });

  resetButton.addEventListener("click", () => {
    populateForm(lastSavedProfile || {});
    setStatus(lastSavedProfile ? "Form restored to the last saved profile." : "Form reset to blank values.", "success");
  });

  loadSavedProfile();
})();

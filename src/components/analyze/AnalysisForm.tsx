"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  MAX_SKILL_LENGTH,
  MAX_TARGET_ROLE_LENGTH,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
  validateAnalyzeForm,
} from "@/lib/analyze/validation.ts";
import type { AnalyzeFormErrors, AnalyzeFormValues, AnalyzeRequest } from "@/lib/analyze/types.ts";

const STORAGE_KEY = "aiCareerCopilot.careerProfile.v1";

const emptyValues: AnalyzeFormValues = {
  resumeText: "",
  jobDescription: "",
  targetRole: "",
  skills: "",
};

type AnalysisFormProps = {
  loading: boolean;
  onAnalyze: (request: AnalyzeRequest) => void;
};

export default function AnalysisForm({ loading, onAnalyze }: AnalysisFormProps) {
  const [values, setValues] = useState<AnalyzeFormValues>(emptyValues);
  const [errors, setErrors] = useState<AnalyzeFormErrors>({});
  const editedPrefillFields = useRef({ targetRole: false, skills: false });
  const resumeRef = useRef<HTMLTextAreaElement>(null);
  const jobRef = useRef<HTMLTextAreaElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const profile = parsed as Record<string, unknown>;
      const savedRole = typeof profile.targetRole === "string" ? profile.targetRole.trim() : "";
      const savedSkills = typeof profile.skills === "string" ? profile.skills.trim() : "";

      setValues((current) => ({
        ...current,
        targetRole: editedPrefillFields.current.targetRole ? current.targetRole : current.targetRole || savedRole,
        skills: editedPrefillFields.current.skills ? current.skills : current.skills || savedSkills,
      }));
    } catch {
      return;
    }
  }, []);

  function updateField(field: keyof AnalyzeFormValues, value: string) {
    if (field === "targetRole" || field === "skills") {
      editedPrefillFields.current[field] = true;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, payload: undefined }));
  }

  function fieldError(field: keyof AnalyzeFormErrors) {
    const message = errors[field];
    return message ? (
      <p id={`${field}-error`} className="mt-2 text-sm text-red-400" role="alert">
        {message}
      </p>
    ) : null;
  }

  function describedBy(field: "resumeText" | "jobDescription" | "targetRole" | "skills") {
    const ids = [`${field}-counter`];
    if (errors[field]) ids.push(`${field}-error`);
    return ids.join(" ");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateAnalyzeForm(values);
    setErrors(result.errors);

    if (!result.isValid) {
      if (result.errors.resumeText) resumeRef.current?.focus();
      else if (result.errors.jobDescription) jobRef.current?.focus();
      else if (result.errors.targetRole) roleRef.current?.focus();
      else if (result.errors.skills) skillsRef.current?.focus();
      return;
    }

    onAnalyze(result.request);
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={loading}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
    >
      <div className="grid gap-7">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="resumeText" className="text-sm font-medium">
              Resume text <span className="text-red-400">*</span>
            </label>
            <p id="resumeText-counter" className="text-xs text-slate-400">
              {values.resumeText.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
            </p>
          </div>
          <textarea
            ref={resumeRef}
            id="resumeText"
            name="resumeText"
            rows={10}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Paste your current resume text here..."
            className={inputClass}
            value={values.resumeText}
            onChange={(event) => updateField("resumeText", event.target.value)}
            aria-invalid={!!errors.resumeText}
            aria-describedby={describedBy("resumeText")}
            disabled={loading}
          />
          {fieldError("resumeText")}
          {!errors.resumeText && (
            <p className="mt-2 text-xs text-slate-400">Minimum {MIN_TEXT_LENGTH} characters.</p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="jobDescription" className="text-sm font-medium">
              Job description <span className="text-red-400">*</span>
            </label>
            <p id="jobDescription-counter" className="text-xs text-slate-400">
              {values.jobDescription.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
            </p>
          </div>
          <textarea
            ref={jobRef}
            id="jobDescription"
            name="jobDescription"
            rows={10}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Paste the job description here..."
            className={inputClass}
            value={values.jobDescription}
            onChange={(event) => updateField("jobDescription", event.target.value)}
            aria-invalid={!!errors.jobDescription}
            aria-describedby={describedBy("jobDescription")}
            disabled={loading}
          />
          {fieldError("jobDescription")}
          {!errors.jobDescription && (
            <p className="mt-2 text-xs text-slate-400">Minimum {MIN_TEXT_LENGTH} characters.</p>
          )}
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="targetRole" className="text-sm font-medium">
                Target role <span className="text-slate-400">(optional)</span>
              </label>
              <p id="targetRole-counter" className="text-xs text-slate-400">
                {values.targetRole.length} / {MAX_TARGET_ROLE_LENGTH}
              </p>
            </div>
            <input
              ref={roleRef}
              id="targetRole"
              name="targetRole"
              type="text"
              maxLength={MAX_TARGET_ROLE_LENGTH}
              autoComplete="organization-title"
              placeholder="e.g. Senior Frontend Engineer"
              className={inputClass}
              value={values.targetRole}
              onChange={(event) => updateField("targetRole", event.target.value)}
              aria-invalid={!!errors.targetRole}
              aria-describedby={describedBy("targetRole")}
              disabled={loading}
            />
            {fieldError("targetRole")}
          </div>

          <div>
            <label htmlFor="skills" className="text-sm font-medium">
              Skills <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              ref={skillsRef}
              id="skills"
              name="skills"
              rows={3}
              className={inputClass}
              value={values.skills}
              onChange={(event) => updateField("skills", event.target.value)}
              aria-invalid={!!errors.skills}
              aria-describedby={describedBy("skills")}
              disabled={loading}
              placeholder="React, TypeScript, accessibility"
            />
            <p id="skills-counter" className="mt-2 text-xs text-slate-400">
              Comma-separated. Each skill up to {MAX_SKILL_LENGTH} characters.
            </p>
            {fieldError("skills")}
          </div>
        </div>

        {errors.payload && (
          <p className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300" role="alert">
            {errors.payload}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Resume and job-description text is sent to Google’s Gemini API for analysis. Avoid
            submitting information you do not want processed by Google.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Analyze resume"}
          </button>
        </div>
      </div>
    </form>
  );
}

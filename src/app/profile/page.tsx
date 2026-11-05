
"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "aiCareerCopilot.careerProfile.v1";

const EXPERIENCE_LEVELS = ["Student", "Entry-level", "Mid-level", "Senior"];
const WORK_ARRANGEMENTS = ["Remote", "Hybrid", "On-site"];

type Profile = {
  fullName: string;
  email: string;
  targetRole: string;
  experienceLevel: string;
  workArrangement: string;
  skills: string;
};

type ProfileErrors = Partial<Record<keyof Profile, string>>;

const emptyProfile: Profile = {
  fullName: "",
  email: "",
  targetRole: "",
  experienceLevel: "",
  workArrangement: "",
  skills: "",
};

function validateProfile(profile: Profile): ProfileErrors {
  const errors: ProfileErrors = {};

  const normalized = Object.fromEntries(
    Object.entries(profile).map(([key, value]) => [key, value.trim()])
  ) as Profile;

  if (!normalized.fullName) {
    errors.fullName = "Enter your full name.";
  }

  if (!normalized.email) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    errors.email = "Enter a valid email address (for example, name@example.com).";
  }

  if (!normalized.targetRole) {
    errors.targetRole = "Enter your target job role.";
  }

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

  return errors;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [lastSavedProfile, setLastSavedProfile] = useState<Profile | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [loaded, setLoaded] = useState(false);


  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(stored) as Partial<Profile>;
          const restored = { ...emptyProfile, ...parsed };

          if (
            typeof restored.fullName === "string" &&
            typeof restored.email === "string" &&
            typeof restored.targetRole === "string" &&
            typeof restored.experienceLevel === "string" &&
            typeof restored.workArrangement === "string" &&
            typeof restored.skills === "string"
          ) {
            const normalized = Object.fromEntries(
              Object.entries(restored).map(([key, value]) => [
                key,
                value.trim(),
              ])
            ) as Profile;

            const validationErrors = validateProfile(normalized);

            if (Object.keys(validationErrors).length === 0) {
              setProfile(normalized);
              setLastSavedProfile(normalized);
            }
          }
        }
      } catch {
        if (active) {
          setStatus("Saved profile data could not be loaded.");
          setStatusType("error");
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);


  function updateField(name: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }

    setStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = Object.fromEntries(
      Object.entries(profile).map(([key, value]) => [key, value.trim()])
    ) as Profile;

    const validationErrors = validateProfile(normalized);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("Please correct the highlighted fields before saving.");
      setStatusType("error");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setProfile(normalized);
      setLastSavedProfile(normalized);
      setStatus("Career profile saved successfully.");
      setStatusType("success");
    } catch {
      setStatus("The profile could not be saved in this browser.");
      setStatusType("error");
    }
  }

  function handleReset() {
    const restored = lastSavedProfile ?? emptyProfile;

    setProfile({ ...restored });
    setErrors({});
    setStatus(
      lastSavedProfile
        ? "Form restored to the last saved profile."
        : "Form reset to blank values."
    );
    setStatusType("success");
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

  function fieldError(name: keyof Profile) {
    return errors[name] ? (
      <p className="mt-2 text-sm text-red-400" role="alert">
        {errors[name]}
      </p>
    ) : null;
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-300">
        Loading career profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            ← Back to dashboard
          </Link>

          <p className="mt-8 text-sm font-semibold tracking-wide text-cyan-400">
            FLYRANK CAREER COPILOT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Career Profile Settings
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Tell us where you are in your career and what you are looking for.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          {status && (
            <div
              role={statusType === "error" ? "alert" : "status"}
              aria-live={statusType === "error" ? "assertive" : "polite"}
              className={`mb-6 rounded-lg border p-4 text-sm ${
                statusType === "error"
                  ? "border-red-900 bg-red-950/40 text-red-300"
                  : "border-emerald-900 bg-emerald-950/40 text-emerald-300"
              }`}
            >
              {status}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                className={inputClass}
                value={profile.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {fieldError("fullName")}
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={profile.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {fieldError("email")}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="targetRole" className="text-sm font-medium">
                Target job role <span className="text-red-400">*</span>
              </label>
              <input
                id="targetRole"
                name="targetRole"
                autoComplete="organization-title"
                placeholder="e.g. Machine Learning Engineer"
                className={inputClass}
                value={profile.targetRole}
                onChange={(e) => updateField("targetRole", e.target.value)}
                aria-invalid={!!errors.targetRole}
              />
              {fieldError("targetRole")}
            </div>

            <div>
              <label htmlFor="experienceLevel" className="text-sm font-medium">
                Experience level <span className="text-red-400">*</span>
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                className={inputClass}
                value={profile.experienceLevel}
                onChange={(e) =>
                  updateField("experienceLevel", e.target.value)
                }
                aria-invalid={!!errors.experienceLevel}
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {fieldError("experienceLevel")}
            </div>

            <div>
              <label htmlFor="workArrangement" className="text-sm font-medium">
                Preferred work arrangement{" "}
                <span className="text-red-400">*</span>
              </label>
              <select
                id="workArrangement"
                name="workArrangement"
                className={inputClass}
                value={profile.workArrangement}
                onChange={(e) =>
                  updateField("workArrangement", e.target.value)
                }
                aria-invalid={!!errors.workArrangement}
              >
                <option value="">Select work arrangement</option>
                {WORK_ARRANGEMENTS.map((arrangement) => (
                  <option key={arrangement} value={arrangement}>
                    {arrangement}
                  </option>
                ))}
              </select>
              {fieldError("workArrangement")}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="skills" className="text-sm font-medium">
                Skills and interests
              </label>
              <textarea
                id="skills"
                name="skills"
                rows={4}
                placeholder="e.g. Python, machine learning, data analysis"
                className={inputClass}
                value={profile.skills}
                onChange={(e) => updateField("skills", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Reset
            </button>

            <button
              type="submit"
              className="rounded-lg bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Save profile
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Your profile is stored locally in this browser.
        </p>
      </div>
    </main>
  );
}

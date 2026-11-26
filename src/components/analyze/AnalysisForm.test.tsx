import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnalysisForm from "./AnalysisForm";
import type { AnalyzeRequest } from "@/lib/analyze/types";

const STORAGE_KEY = "aiCareerCopilot.careerProfile.v1";

const VALID_RESUME =
  "Senior frontend engineer with eight years of React, TypeScript, and accessibility experience.";
const VALID_JOB =
  "Looking for a frontend engineer with React, TypeScript, testing, and design systems skills.";

function renderForm(props?: Partial<{ loading: boolean; onAnalyze: (request: AnalyzeRequest) => void }>) {
  const onAnalyze = props?.onAnalyze ?? vi.fn<(request: AnalyzeRequest) => void>();
  const loading = props?.loading ?? false;
  const view = render(<AnalysisForm loading={loading} onAnalyze={onAnalyze} />);
  return { ...view, onAnalyze };
}

describe("AnalysisForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all expected form fields and submit action", () => {
    renderForm();

    expect(screen.getByLabelText(/resume text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^skills/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze resume/i })).toBeInTheDocument();
  });

  it("updates input values and character counters", async () => {
    const user = userEvent.setup();
    renderForm();

    const resume = screen.getByLabelText(/resume text/i);
    const job = screen.getByLabelText(/job description/i);
    const role = screen.getByLabelText(/target role/i);

    await user.type(resume, "Hello resume");
    await user.type(job, "Hello job");
    await user.type(role, "Frontend Engineer");

    expect(resume).toHaveValue("Hello resume");
    expect(job).toHaveValue("Hello job");
    expect(role).toHaveValue("Frontend Engineer");
    expect(screen.getByText("12 / 20,000 characters")).toBeInTheDocument();
    expect(screen.getByText("9 / 20,000 characters")).toBeInTheDocument();
    expect(screen.getByText("17 / 120")).toBeInTheDocument();
  });

  it("shows validation errors for invalid submission and focuses first invalid field", async () => {
    const user = userEvent.setup();
    const { onAnalyze } = renderForm();

    await user.click(screen.getByRole("button", { name: /analyze resume/i }));

    expect(onAnalyze).not.toHaveBeenCalled();
    expect(
      screen.getByText("Enter at least 40 characters of resume text.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter at least 40 characters of job description.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/resume text/i)).toHaveFocus();
    expect(screen.getByLabelText(/resume text/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/job description/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("calls onAnalyze with normalized request for valid submission", async () => {
    const user = userEvent.setup();
    const onAnalyze = vi.fn();
    renderForm({ onAnalyze });

    await user.type(screen.getByLabelText(/resume text/i), `  ${VALID_RESUME}  `);
    await user.type(screen.getByLabelText(/job description/i), `  ${VALID_JOB}  `);
    await user.type(screen.getByLabelText(/target role/i), "  Senior Frontend Engineer  ");
    await user.type(screen.getByLabelText(/^skills/i), " React, , TypeScript , accessibility ");

    await user.click(screen.getByRole("button", { name: /analyze resume/i }));

    expect(onAnalyze).toHaveBeenCalledTimes(1);
    expect(onAnalyze).toHaveBeenCalledWith({
      resumeText: VALID_RESUME,
      jobDescription: VALID_JOB,
      profile: {
        targetRole: "Senior Frontend Engineer",
        skills: ["React", "TypeScript", "accessibility"],
      },
    });
  });

  it("prefills target role and skills from localStorage", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ targetRole: "  Product Engineer  ", skills: "  React, Node  " })
    );

    renderForm();

    expect(await screen.findByLabelText(/target role/i)).toHaveValue("Product Engineer");
    expect(screen.getByLabelText(/^skills/i)).toHaveValue("React, Node");
  });

  it("disables controls and exposes loading accessibility attributes while loading", () => {
    const { container } = renderForm({ loading: true });

    expect(container.querySelector("form")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText(/resume text/i)).toBeDisabled();
    expect(screen.getByLabelText(/job description/i)).toBeDisabled();
    expect(screen.getByLabelText(/target role/i)).toBeDisabled();
    expect(screen.getByLabelText(/^skills/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
  });
});

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnalyzePage from "./page";
import { AnalysisApiError, postAnalysis } from "@/lib/analyze/api";
import type { AnalyzeSuccessResponse } from "@/lib/analyze/types";

vi.mock("@/lib/analyze/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analyze/api")>("@/lib/analyze/api");
  return {
    ...actual,
    postAnalysis: vi.fn(),
  };
});

const postAnalysisMock = vi.mocked(postAnalysis);

const VALID_RESUME =
  "Senior frontend engineer with eight years of React, TypeScript, and accessibility experience.";
const VALID_JOB =
  "Looking for a frontend engineer with React, TypeScript, testing, and design systems skills.";

const successResponse: AnalyzeSuccessResponse = {
  data: {
    overallMatchScore: 84,
    summary: "Strong fit with some accessibility gaps.",
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["Accessibility audits"],
    resumeImprovements: ["Quantify impact."],
    atsFeedback: ["Mirror key job terms."],
    learningRoadmap: [
      { skill: "Accessibility", priority: "high", timeframe: "2 weeks", action: "Run audits." },
    ],
    limitations: ["AI estimate only."],
  },
  meta: { promptVersion: "2026-11-23.v1", generatedAt: "2026-11-23T12:00:00.000Z" },
};

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/resume text/i), VALID_RESUME);
  await user.type(screen.getByLabelText(/job description/i), VALID_JOB);
  await user.click(screen.getByRole("button", { name: /analyze resume/i }));
}

describe("AnalyzePage", () => {
  beforeEach(() => {
    localStorage.clear();
    postAnalysisMock.mockReset();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      setTimeout(() => cb(0), 0);
      return 0;
    });
  });

  it("renders initial page content and empty state", () => {
    render(<AnalyzePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Resume Analysis" })).toBeInTheDocument();
    expect(screen.getByText("CAREER DEVELOPMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No analysis yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /update career profile/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("submits valid data, shows loading state, and renders results on success", async () => {
    const user = userEvent.setup();
    let resolveRequest!: (value: AnalyzeSuccessResponse) => void;
    postAnalysisMock.mockImplementation(
      () =>
        new Promise<AnalyzeSuccessResponse>((resolve) => {
          resolveRequest = resolve;
        })
    );

    render(<AnalyzePage />);
    await fillAndSubmit(user);

    expect(postAnalysisMock).toHaveBeenCalledTimes(1);
    expect(postAnalysisMock.mock.calls[0][0]).toEqual({
      resumeText: VALID_RESUME,
      jobDescription: VALID_JOB,
    });
    expect(screen.getByText("Analyzing your resume against the job description…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();

    resolveRequest(successResponse);

    expect(await screen.findByRole("heading", { name: "Your resume analysis" })).toBeInTheDocument();
    expect(screen.getByText("Strong fit with some accessibility gaps.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "No analysis yet" })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Your resume analysis" })).toHaveFocus();
    });
  });

  it("shows API error feedback and retries with last request", async () => {
    const user = userEvent.setup();
    postAnalysisMock
      .mockRejectedValueOnce(
        new AnalysisApiError("PROVIDER_TIMEOUT", "The AI provider timed out. Please try again.", 504)
      )
      .mockResolvedValueOnce(successResponse);

    render(<AnalyzePage />);
    await fillAndSubmit(user);

    expect(await screen.findByRole("alert")).toHaveTextContent("Analysis could not be completed.");
    expect(screen.getByText("The AI provider timed out. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry analysis" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry analysis" }));

    await waitFor(() => expect(postAnalysisMock).toHaveBeenCalledTimes(2));
    expect(postAnalysisMock.mock.calls[1][0]).toEqual(postAnalysisMock.mock.calls[0][0]);
    expect(await screen.findByRole("heading", { name: "Your resume analysis" })).toBeInTheDocument();
  });

  it("renders validation error details from API error", async () => {
    const user = userEvent.setup();
    postAnalysisMock.mockRejectedValueOnce(
      new AnalysisApiError("INVALID_REQUEST", "The request body is invalid.", 400, [
        { path: "resumeText", message: "Too small." },
      ])
    );

    render(<AnalyzePage />);
    await fillAndSubmit(user);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("resumeText");
    expect(alert).toHaveTextContent("Too small.");
  });
});

import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnalysisResults from "./AnalysisResults";
import type { AnalysisMeta, CareerAnalysis } from "@/lib/analyze/types";

const meta: AnalysisMeta = {
  promptVersion: "2026-11-23.v1",
  generatedAt: "2026-11-23T12:00:00.000Z",
};

function makeData(overrides: Partial<CareerAnalysis> = {}): CareerAnalysis {
  return {
    overallMatchScore: 82,
    summary: "Strong React evidence with room to improve accessibility.",
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["Accessibility testing"],
    resumeImprovements: ["Add measurable impact for key projects."],
    atsFeedback: ["Include the exact job title in the headline."],
    learningRoadmap: [
      {
        skill: "Accessibility",
        priority: "high",
        timeframe: "2 weeks",
        action: "Audit components with keyboard and screen reader checks.",
      },
    ],
    limitations: ["This is an AI estimate, not an ATS score."],
    ...overrides,
  };
}

describe("AnalysisResults", () => {
  it("renders summary, score meter, metadata, and key sections", () => {
    render(<AnalysisResults data={makeData()} meta={meta} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Your resume analysis" })
    ).toBeInTheDocument();
    expect(screen.getByText("ANALYSIS RESULTS")).toBeInTheDocument();
    expect(screen.getByText(/Prompt 2026-11-23\.v1/)).toBeInTheDocument();

    const meter = screen.getByRole("meter", { name: "Overall match score" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "82");
    expect(meter).toHaveAttribute("aria-valuetext", "82 out of 100");
    expect(screen.getByText("82")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Summary" })).toBeInTheDocument();
    expect(
      screen.getByText("Strong React evidence with room to improve accessibility.")
    ).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent(/AI estimate/i);
  });

  it("renders provided analysis details and recommendations", () => {
    render(
      <AnalysisResults
        data={makeData({
          matchedSkills: ["React", "TypeScript", "Testing"],
          missingSkills: ["GraphQL"],
          resumeImprovements: ["Quantify performance wins.", "Add leadership examples."],
          atsFeedback: ["Mirror keywords from the job description."],
          limitations: ["Results depend on provided text quality."],
        })}
        meta={meta}
      />
    );

    const matched = screen.getByRole("heading", { name: "Matched skills" }).closest("section");
    const missing = screen.getByRole("heading", { name: "Missing skills" }).closest("section");
    const improvements = screen
      .getByRole("heading", { name: "Resume improvements" })
      .closest("section");
    const ats = screen.getByRole("heading", { name: "ATS feedback" }).closest("section");
    const limitations = screen.getByRole("heading", { name: "Limitations" }).closest("section");

    expect(matched).not.toBeNull();
    expect(within(matched as HTMLElement).getByText("React")).toBeInTheDocument();
    expect(within(matched as HTMLElement).getByText("Testing")).toBeInTheDocument();
    expect(within(missing as HTMLElement).getByText("GraphQL")).toBeInTheDocument();
    expect(within(improvements as HTMLElement).getByText("Quantify performance wins.")).toBeInTheDocument();
    expect(within(ats as HTMLElement).getByText("Mirror keywords from the job description.")).toBeInTheDocument();
    expect(within(limitations as HTMLElement).getByText("Results depend on provided text quality.")).toBeInTheDocument();
  });

  it("renders learning roadmap items with priority and timeframe", () => {
    render(
      <AnalysisResults
        data={makeData({
          learningRoadmap: [
            {
              skill: "Accessibility",
              priority: "high",
              timeframe: "2 weeks",
              action: "Run an accessibility audit.",
            },
            {
              skill: "Design systems",
              priority: "medium",
              timeframe: "1 month",
              action: "Build a token-based component.",
            },
          ],
        })}
        meta={meta}
      />
    );

    const roadmap = screen.getByRole("heading", { name: "Learning roadmap" }).closest("section");
    expect(roadmap).not.toBeNull();
    expect(within(roadmap as HTMLElement).getByText("Accessibility")).toBeInTheDocument();
    expect(within(roadmap as HTMLElement).getByText("high")).toBeInTheDocument();
    expect(within(roadmap as HTMLElement).getByText("2 weeks")).toBeInTheDocument();
    expect(within(roadmap as HTMLElement).getByText("Run an accessibility audit.")).toBeInTheDocument();
    expect(within(roadmap as HTMLElement).getByText("Design systems")).toBeInTheDocument();
    expect(within(roadmap as HTMLElement).getByText("medium")).toBeInTheDocument();
  });

  it("shows safe empty-state messages when optional lists are empty", () => {
    render(
      <AnalysisResults
        data={makeData({
          matchedSkills: [],
          missingSkills: [],
          resumeImprovements: [],
          atsFeedback: [],
          learningRoadmap: [],
          limitations: [],
        })}
        meta={meta}
      />
    );

    expect(screen.getByText("No matching skills identified.")).toBeInTheDocument();
    expect(screen.getByText("No missing skills identified.")).toBeInTheDocument();
    expect(screen.getByText("No resume improvements provided.")).toBeInTheDocument();
    expect(screen.getByText("No ATS feedback provided.")).toBeInTheDocument();
    expect(screen.getByText("No learning roadmap provided.")).toBeInTheDocument();
    expect(screen.getByText("No limitations provided.")).toBeInTheDocument();
  });

  it("falls back to raw timestamp when generatedAt is invalid", () => {
    render(
      <AnalysisResults
        data={makeData()}
        meta={{ promptVersion: "v-test", generatedAt: "not-a-date" }}
      />
    );

    const time = screen.getByText("not-a-date");
    expect(time.tagName.toLowerCase()).toBe("time");
    expect(time).toHaveAttribute("dateTime", "not-a-date");
  });
});

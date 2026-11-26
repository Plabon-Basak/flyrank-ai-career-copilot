"use client";

import type { Ref } from "react";
import type { AnalysisMeta, CareerAnalysis } from "@/lib/analyze/types.ts";

type AnalysisResultsProps = {
  data: CareerAnalysis;
  meta: AnalysisMeta;
  headingRef?: Ref<HTMLHeadingElement>;
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function priorityClass(priority: "high" | "medium" | "low"): string {
  if (priority === "high") return "bg-red-400/10 text-red-300";
  if (priority === "medium") return "bg-amber-400/10 text-amber-300";
  return "bg-emerald-400/10 text-emerald-300";
}

function StringList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <li className="text-sm text-slate-400">{emptyText}</li>;
  }

  return (
    <>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="text-sm leading-6 text-slate-300">
          {item}
        </li>
      ))}
    </>
  );
}

export default function AnalysisResults({ data, meta, headingRef }: AnalysisResultsProps) {
  return (
    <section
      aria-labelledby="analysis-results-heading"
      className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
    >
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-cyan-400">ANALYSIS RESULTS</p>
          <h2
            ref={headingRef}
            id="analysis-results-heading"
            tabIndex={-1}
            className="mt-2 text-2xl font-bold outline-none"
          >
            Your resume analysis
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Prompt {meta.promptVersion}
          <span className="mx-2">•</span>
          <time dateTime={meta.generatedAt}>{formatTimestamp(meta.generatedAt)}</time>
        </p>
      </div>

      <div
        role="meter"
        aria-label="Overall match score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={data.overallMatchScore}
        aria-valuetext={`${data.overallMatchScore} out of 100`}
        className="mt-7 rounded-xl border border-cyan-900/60 bg-cyan-950/30 p-6"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-300">Overall match score</p>
            <p className="mt-2 text-4xl font-bold text-white">{data.overallMatchScore}</p>
            <p className="mt-1 text-xs text-slate-400">out of 100</p>
          </div>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${data.overallMatchScore}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-amber-900/60 bg-amber-950/20 p-4 text-sm leading-6 text-amber-200" role="note">
        This score is an AI estimate based only on the supplied resume and job description. It is not
        a hiring guarantee, an employer decision, or an actual applicant tracking system score.
      </p>

      <section aria-labelledby="summary-heading" className="mt-8">
        <h3 id="summary-heading" className="text-lg font-semibold text-white">
          Summary
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{data.summary}</p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="matched-skills-heading" className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          <h3 id="matched-skills-heading" className="text-lg font-semibold text-white">
            Matched skills
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <StringList items={data.matchedSkills} emptyText="No matching skills identified." />
          </ul>
        </section>

        <section aria-labelledby="missing-skills-heading" className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          <h3 id="missing-skills-heading" className="text-lg font-semibold text-white">
            Missing skills
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <StringList items={data.missingSkills} emptyText="No missing skills identified." />
          </ul>
        </section>
      </div>

      <section aria-labelledby="resume-improvements-heading" className="mt-8">
        <h3 id="resume-improvements-heading" className="text-lg font-semibold text-white">
          Resume improvements
        </h3>
        <ol className="mt-4 list-decimal space-y-2 pl-5">
          <StringList items={data.resumeImprovements} emptyText="No resume improvements provided." />
        </ol>
      </section>

      <section aria-labelledby="ats-feedback-heading" className="mt-8">
        <h3 id="ats-feedback-heading" className="text-lg font-semibold text-white">
          ATS feedback
        </h3>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <StringList items={data.atsFeedback} emptyText="No ATS feedback provided." />
        </ul>
      </section>

      <section aria-labelledby="learning-roadmap-heading" className="mt-8">
        <h3 id="learning-roadmap-heading" className="text-lg font-semibold text-white">
          Learning roadmap
        </h3>
        {data.learningRoadmap.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No learning roadmap provided.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {data.learningRoadmap.map((item, index) => (
              <li key={`${item.skill}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-semibold text-white">{item.skill}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${priorityClass(item.priority)}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-slate-400">{item.timeframe}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.action}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="limitations-heading" className="mt-8">
        <h3 id="limitations-heading" className="text-lg font-semibold text-white">
          Limitations
        </h3>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <StringList items={data.limitations} emptyText="No limitations provided." />
        </ul>
      </section>
    </section>
  );
}

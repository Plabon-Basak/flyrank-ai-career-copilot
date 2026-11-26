"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AnalysisForm from "@/components/analyze/AnalysisForm.tsx";
import AnalysisResults from "@/components/analyze/AnalysisResults.tsx";
import { AnalysisApiError, postAnalysis } from "@/lib/analyze/api.ts";
import type { AnalyzeRequest, AnalyzeSuccessResponse } from "@/lib/analyze/types.ts";

type AnalysisStatus = "idle" | "loading" | "success" | "error";

export default function AnalyzePage() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalyzeSuccessResponse | null>(null);
  const [error, setError] = useState<AnalysisApiError | null>(null);
  const [lastRequest, setLastRequest] = useState<AnalyzeRequest | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const activeController = useRef<AbortController | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    return () => {
      activeController.current?.abort();
    };
  }, []);

  async function runAnalysis(request: AnalyzeRequest) {
    activeController.current?.abort();

    const controller = new AbortController();
    activeController.current = controller;

    setLastRequest(request);
    setStatus("loading");
    setError(null);
    setAnnouncement("Analyzing your resume. Please wait.");

    try {
      const response = await postAnalysis(request, { signal: controller.signal });
      if (controller.signal.aborted) return;

      setResult(response);
      setStatus("success");
      setAnnouncement("Analysis complete. Results are now available.");
      requestAnimationFrame(() => {
        resultsHeadingRef.current?.focus({ preventScroll: true });
      });
    } catch (caught) {
      if (controller.signal.aborted) return;

      const apiError =
        caught instanceof AnalysisApiError
          ? caught
          : new AnalysisApiError("INTERNAL_ERROR", "An unexpected error occurred.");

      setError(apiError);
      setStatus("error");
      setAnnouncement(`Analysis failed. ${apiError.message}`);
    } finally {
      if (activeController.current === controller) {
        activeController.current = null;
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold tracking-wide text-cyan-400">CAREER DEVELOPMENT</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Resume Analysis</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Compare your resume against a job description and discover opportunities to improve your
          application.
        </p>

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {status === "loading" && (
          <p className="mt-6 rounded-lg border border-cyan-900/60 bg-cyan-950/30 p-4 text-sm text-cyan-200">
            Analyzing your resume against the job description…
          </p>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300" role="alert">
            <p className="font-semibold">Analysis could not be completed.</p>
            <p className="mt-1">{error.message}</p>
            {error.details && error.details.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {error.details.map((detail, index) => (
                  <li key={`${detail.path}-${index}`}>
                    <span className="text-red-200">{detail.path}</span>: {detail.message}
                  </li>
                ))}
              </ul>
            )}
            {lastRequest && (
              <button
                type="button"
                onClick={() => void runAnalysis(lastRequest)}
                className="mt-4 rounded-lg border border-red-700 px-4 py-2 font-semibold text-red-100 transition hover:bg-red-900/40"
              >
                Retry analysis
              </button>
            )}
          </div>
        )}

        <div className="mt-8">
          <AnalysisForm loading={status === "loading"} onAnalyze={(request) => void runAnalysis(request)} />
        </div>

        {result ? (
          <AnalysisResults data={result.data} meta={result.meta} headingRef={resultsHeadingRef} />
        ) : (
          <section
            aria-labelledby="analysis-empty-heading"
            className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8"
          >
            <div className="flex size-14 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl text-cyan-400">
              ▤
            </div>
            <h2 id="analysis-empty-heading" className="mt-6 text-xl font-semibold">
              No analysis yet
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Add your resume and a job description above, then choose “Analyze resume” to see the
              match score, skill gaps, resume suggestions, ATS feedback, and learning roadmap.
            </p>
            <Link
              href="/profile"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Update career profile →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

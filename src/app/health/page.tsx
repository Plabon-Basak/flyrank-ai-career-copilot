
"use client";

import { useEffect, useState } from "react";

type HealthData = {
  status: string;
  application: string;
  framework: string;
  timestamp: string;
};

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialHealth() {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Health check request failed.");
        }

        const data: HealthData = await response.json();

        if (active) {
          setHealth(data);
        }
      } catch {
        if (active) {
          setError("Unable to retrieve application health.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialHealth();

    return () => {
      active = false;
    };
  }, []);

  async function checkHealth() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Health check request failed.");
      }

      const data: HealthData = await response.json();
      setHealth(data);
    } catch {
      setError("Unable to retrieve application health.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold tracking-wide text-cyan-400">
          SYSTEM STATUS
        </p>
        <h1 className="mt-3 text-3xl font-bold">Application Health</h1>
        <p className="mt-3 text-slate-400">
          Check the current status of the Career Copilot application.
        </p>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          {loading ? (
            <p className="text-sm text-slate-400">
              Checking application health...
            </p>
          ) : error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : health ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-400">Overall status</span>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-400">
                  {health.status}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-400">Application</span>
                <span className="text-sm">{health.application}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-400">Framework</span>
                <span className="text-sm">{health.framework}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-400">Last checked</span>
                <span className="text-right text-sm text-slate-300">
                  {new Date(health.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ) : null}

          <button
            onClick={checkHealth}
            disabled={loading}
            className="mt-7 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Refresh health status"}
          </button>
        </section>
      </div>
    </main>
  );
}


import Link from "next/link";

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold tracking-wide text-cyan-400">
          CAREER DEVELOPMENT
        </p>
        <h1 className="mt-3 text-3xl font-bold">Resume Analysis</h1>
        <p className="mt-3 text-slate-400">
          Compare your resume against a job description and discover
          opportunities to improve your application.
        </p>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex size-14 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl text-cyan-400">
            ▤
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            AI resume analysis is coming soon
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Resume upload, job description matching, ATS compatibility
            assessment, and AI-generated recommendations are planned features.
            They are not available in this version yet.
          </p>
          <Link
            href="/profile"
            className="mt-6 inline-flex rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Update career profile →
          </Link>
        </section>
      </div>
    </main>
  );
}

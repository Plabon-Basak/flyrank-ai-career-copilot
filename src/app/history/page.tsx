
export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold tracking-wide text-cyan-400">
          YOUR ACTIVITY
        </p>
        <h1 className="mt-3 text-3xl font-bold">Analysis History</h1>
        <p className="mt-3 text-slate-400">
          Review your previous resume analyses and career progress.
        </p>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-800 text-2xl text-cyan-400">
            ◷
          </div>
          <h2 className="mt-5 text-xl font-semibold">No analyses yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            Your resume analysis history will appear here once the analysis
            feature is implemented.
          </p>
        </section>
      </div>
    </main>
  );
}

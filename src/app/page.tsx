
const activities = [
  {
    title: "Career profile",
    description: "Your professional information",
    status: "Ready",
    icon: "◈",
  },
  {
    title: "Resume analysis",
    description: "Compare your resume with a job description",
    status: "Coming soon",
    icon: "▤",
  },
  {
    title: "Analysis history",
    description: "Review your previous analyses",
    status: "Coming soon",
    icon: "◷",
  },
];

const quickActions = [
  { label: "Update career profile", href: "/profile", icon: "◈" },
  { label: "Analyze a resume", href: "/analyze", icon: "▤" },
  { label: "View analysis history", href: "/history", icon: "◷" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-12 flex flex-col justify-between gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-cyan-400">
              FLYRANK CAREER COPILOT
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Your career workspace
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Build your professional profile and prepare for your next opportunity.
            </p>
          </div>

          <a
            href="/profile"
            className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Manage profile →
          </a>
        </header>

        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Career profile</p>
            <p className="mt-3 text-2xl font-bold text-white">Available</p>
            <p className="mt-2 text-sm text-emerald-400">Profile settings implemented</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Resume analyses</p>
            <p className="mt-3 text-2xl font-bold text-white">0</p>
            <p className="mt-2 text-sm text-slate-400">Analysis feature not implemented yet</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-slate-400">Application status</p>
            <p className="mt-3 text-2xl font-bold text-white">In development</p>
            <p className="mt-2 text-sm text-cyan-400">FE-04 project setup</p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="mb-5 text-xl font-semibold">Your workspace</h2>

            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xl text-cyan-400">
                    {activity.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white">{activity.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {activity.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <h2 className="mb-5 text-xl font-semibold">Quick actions</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg p-4 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-cyan-400"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span>{action.label}</span>
                    <span className="ml-auto">→</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-900/60 bg-cyan-950/30 p-5">
              <p className="text-sm font-semibold text-cyan-300">
                Project roadmap
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The application is being developed in stages. Resume analysis,
                history, and AI-powered career recommendations are planned
                features, not yet available.
              </p>
            </div>
          </aside>
        </section>

        <footer className="mt-14 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          FlyRank Career Copilot · Built with Next.js and TypeScript
        </footer>
      </div>
    </main>
  );
}

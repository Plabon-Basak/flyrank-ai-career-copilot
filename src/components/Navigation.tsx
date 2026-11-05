
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Profile", href: "/profile" },
  { label: "Analyze", href: "/analyze" },
  { label: "History", href: "/history" },
  { label: "Health", href: "/health" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          FlyRank<span className="text-cyan-400">.</span>
          <span className="ml-2 text-sm font-medium text-slate-400">
            Career Copilot
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, BriefcaseBusiness, FileText, History, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interviews/new", label: "New Interview", icon: BriefcaseBusiness },
  { href: "/interviews/history", label: "History", icon: History },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/question-bank", label: "Question Bank", icon: BookOpen },
  { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/interviews/report/demo", label: "Demo Report", icon: BarChart3 }
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden min-h-screen w-72 border-r bg-slate-950/70 p-4 lg:block">
      <Link href="/" className="flex items-center gap-3 px-2 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500 text-sm font-bold text-white">AI</div>
        <div>
          <p className="font-semibold text-white">InterviewAI</p>
          <p className="text-xs text-muted-foreground">Coach & Simulator</p>
        </div>
      </Link>
      <nav className="mt-8 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-slate-900 hover:text-white",
                active && "bg-indigo-500/15 text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

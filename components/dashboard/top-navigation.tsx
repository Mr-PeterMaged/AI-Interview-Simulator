import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function TopNavigation() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-slate-950/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <Menu className="h-5 w-5 lg:hidden" />
        <div>
          <p className="text-sm font-semibold text-white">AI Interview Workspace</p>
          <p className="text-xs text-muted-foreground">Private, adaptive, and server-side secured</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border px-3 py-2 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Local camera processing where supported
        </div>
        <Button asChild size="sm">
          <Link href="/interviews/new">Start</Link>
        </Button>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <UserButton /> : null}
      </div>
    </header>
  );
}

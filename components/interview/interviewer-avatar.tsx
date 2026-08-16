import { Mic2 } from "lucide-react";

export function InterviewerAvatar({ personality }: { personality: string }) {
  return (
    <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-cyan-300/30 bg-gradient-to-br from-indigo-500/40 to-cyan-400/20 shadow-glow">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950">
        <Mic2 className="h-8 w-8 text-cyan-200" />
      </div>
      <span className="sr-only">{personality}</span>
    </div>
  );
}

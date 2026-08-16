import { clampScore } from "@/lib/utils";

export function ScoreRing({ score, size = 118 }: { score: number; size?: number }) {
  const safeScore = clampScore(score);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90">
        <circle cx="52" cy="52" r={radius} stroke="rgba(148,163,184,0.18)" strokeWidth="10" fill="none" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-2xl font-semibold text-white">{safeScore}</span>
    </div>
  );
}

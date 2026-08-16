import { clampScore } from "@/lib/utils";
import type { ReadinessLevel } from "@/types/report";

export function readinessFromScore(score: number): ReadinessLevel {
  const safeScore = clampScore(score);
  if (safeScore >= 85) return "Strong Candidate";
  if (safeScore >= 72) return "Interview Ready";
  if (safeScore >= 55) return "Developing";
  return "Not Ready";
}

export function average(scores: number[]) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

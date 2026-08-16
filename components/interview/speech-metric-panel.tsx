import type { SpeechMetrics } from "@/types/interview";

export function SpeechMetricPanel({ metrics }: { metrics?: SpeechMetrics }) {
  const items = [
    ["Words", metrics?.wordCount ?? 0],
    ["WPM", metrics?.wordsPerMinute ?? 0],
    ["Fillers", metrics?.fillerWordCount ?? 0],
    ["Pauses", metrics?.longPauseCount ?? 0]
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border bg-slate-950/60 p-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

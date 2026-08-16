"use client";

import { Textarea } from "@/components/ui/textarea";

export function LiveTranscript({
  transcript,
  onChange
}: {
  transcript: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Live transcript</h3>
        <span className="text-xs text-muted-foreground">Estimated browser transcription</span>
      </div>
      <Textarea value={transcript} onChange={(event) => onChange(event.target.value)} className="min-h-64 resize-none" placeholder="Your spoken answer appears here. You can also type if speech recognition is unavailable." />
    </div>
  );
}

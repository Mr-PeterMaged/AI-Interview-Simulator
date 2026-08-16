"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { analyzeSpeech } from "@/lib/speech-utils";

const questions: Record<string, string> = {
  Communication: "Explain a complex idea to a non-technical stakeholder in under two minutes.",
  Behavioral: "Tell me about a time you received difficult feedback and what changed afterward.",
  HR: "Why are you interested in this role and this company?",
  Technical: "Describe how you would investigate a slow production endpoint.",
  Confidence: "What is your strongest professional trait, and what evidence supports it?",
  "STAR Method": "Tell me about a project where your action directly improved the outcome."
};

export function PracticeClient() {
  const [skill, setSkill] = useState("Communication");
  const [answer, setAnswer] = useState("");
  const metrics = analyzeSpeech({ transcript: answer, durationSeconds: 90 });
  const score = Math.min(94, Math.max(52, 55 + metrics.wordCount / 4 - metrics.fillerWordCount * 3));

  return (
    <div className="space-y-8">
      <PageHeader title="Practice mode" description="Fast, low-friction drills for one skill at a time." />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="glass">
          <CardHeader><CardTitle>Skill focus</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={skill} onChange={(event) => setSkill(event.target.value)} options={Object.keys(questions).map((item) => ({ label: item, value: item }))} />
            <div className="rounded-lg border bg-slate-950/60 p-5">
              <Badge>{skill}</Badge>
              <h2 className="mt-4 text-xl font-semibold text-white">{questions[skill]}</h2>
            </div>
            <Button onClick={() => setSkill(Object.keys(questions)[Math.floor(Math.random() * Object.keys(questions).length)])}>
              <Sparkles className="h-4 w-4" /> Generate quick question
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Your answer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="min-h-56" placeholder="Type your answer, or practice aloud and paste the transcript." />
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Score" value={Math.round(score)} />
              <Stat label="Words" value={metrics.wordCount} />
              <Stat label="WPM" value={metrics.wordsPerMinute} />
              <Stat label="Fillers" value={metrics.fillerWordCount} />
            </div>
            <div className="rounded-md bg-slate-950/60 p-4 text-sm text-muted-foreground">
              {metrics.recommendations[0]} Add measurable evidence and close with impact.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-slate-950/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

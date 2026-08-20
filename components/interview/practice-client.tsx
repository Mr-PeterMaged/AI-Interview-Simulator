"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { analyzeSpeech } from "@/lib/speech-utils";

const questions: Record<string, string> = {
  Communication: "Explain a complex idea to a non-technical stakeholder in under two minutes.",
  Behavioral: "Tell me about a time you received difficult feedback and what changed afterward.",
  HR: "Why are you interested in this role and this company?",
  Technical: "Describe how you would investigate a slow production endpoint.",
  Confidence: "What is your strongest professional trait, and what evidence supports it?",
  "STAR Method": "Tell me about a project where your action directly improved the outcome."
};

type Evaluation = {
  scores: { overall: number };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export function PracticeClient() {
  const [skill, setSkill] = useState("Communication");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const metrics = analyzeSpeech({ transcript: answer, durationSeconds: 90 });

  async function getFeedback() {
    if (!answer.trim()) return;
    setLoading(true);
    setError(null);
    setEvaluation(null);
    try {
      const response = await fetch("/api/ai/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questions[skill], transcript: answer, jobTitle: skill, interviewType: "Practice" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to get feedback");
      setEvaluation(data.evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to get feedback");
    } finally {
      setLoading(false);
    }
  }

  function changeSkill(nextSkill: string) {
    setSkill(nextSkill);
    setEvaluation(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Practice mode" description="Fast, low-friction drills for one skill at a time, scored by the same AI as full interviews." />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="glass">
          <CardHeader><CardTitle>Skill focus</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={skill} onChange={(event) => changeSkill(event.target.value)} options={Object.keys(questions).map((item) => ({ label: item, value: item }))} />
            <div className="rounded-lg border bg-slate-950/60 p-5">
              <Badge>{skill}</Badge>
              <h2 className="mt-4 text-xl font-semibold text-white">{questions[skill]}</h2>
            </div>
            <Button onClick={() => changeSkill(Object.keys(questions)[Math.floor(Math.random() * Object.keys(questions).length)])}>
              <Sparkles className="h-4 w-4" /> Generate quick question
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Your answer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="min-h-56" placeholder="Type your answer, or practice aloud and paste the transcript." />
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Words" value={metrics.wordCount} />
              <Stat label="WPM" value={metrics.wordsPerMinute} />
              <Stat label="Fillers" value={metrics.fillerWordCount} />
            </div>
            <Button onClick={getFeedback} disabled={loading || !answer.trim()}>
              {loading ? "Evaluating..." : "Get AI feedback"}
            </Button>
            {error ? <ErrorState message={error} /> : null}
            {evaluation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md bg-slate-950/60 p-4">
                  <p className="text-sm font-medium text-white">Overall score</p>
                  <p className="text-2xl font-semibold text-cyan-200">{evaluation.scores.overall}/100</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <FeedbackList title="Strengths" items={evaluation.strengths} tone="emerald" />
                  <FeedbackList title="Weaknesses" items={evaluation.weaknesses} tone="rose" />
                  <FeedbackList title="Suggestions" items={evaluation.suggestions} tone="cyan" />
                </div>
              </div>
            ) : null}
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

const feedbackToneClasses = {
  emerald: { label: "text-emerald-300", item: "bg-emerald-500/10 text-emerald-100" },
  rose: { label: "text-rose-300", item: "bg-rose-500/10 text-rose-100" },
  cyan: { label: "text-cyan-300", item: "bg-cyan-500/10 text-cyan-100" }
};

function FeedbackList({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "rose" | "cyan" }) {
  const classes = feedbackToneClasses[tone];
  return (
    <div>
      <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${classes.label}`}>{title}</p>
      <ul className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item} className={`rounded-md p-2 ${classes.item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

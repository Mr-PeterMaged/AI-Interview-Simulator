"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { ErrorState } from "@/components/shared/error-state";

type Analysis = {
  extractedSkills: string[];
  projects: string[];
  experienceSummary: string;
  strengths: string[];
  suggestedTopics: string[];
};

export function ResumeAnalyzerClient() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file?: File) {
    if (!file) return;
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      if (data.resumeText) setResumeText(data.resumeText);
      else if (data.message) setError(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to analyze resume");
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze resume");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Resume analyzer" description="Extract interview topics, strengths, gaps, and resume-based practice targets." />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="glass">
          <CardHeader><CardTitle>Upload or paste resume</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".txt,.pdf,.docx" onChange={(event) => upload(event.target.files?.[0])} />
            <Textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} className="min-h-80" placeholder="Paste resume text here." />
            <Button onClick={analyze} disabled={loading || resumeText.length < 20}>
              <Upload className="h-4 w-4" /> {loading ? "Analyzing..." : "Analyze resume"}
            </Button>
            {error ? <ErrorState message={error} /> : null}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>AI resume insights</CardTitle></CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <ScoreRing score={78} />
                  <div>
                    <p className="text-sm text-muted-foreground">Resume strength score</p>
                    <p className="mt-2 text-white">{analysis.experienceSummary}</p>
                  </div>
                </div>
                <Insight label="Detected skills" values={analysis.extractedSkills} />
                <Insight label="Projects" values={analysis.projects} />
                <Insight label="Strengths" values={analysis.strengths} />
                <Insight label="Potential interview topics" values={analysis.suggestedTopics} />
                <Button asChild><Link href="/interviews/new"><FileText className="h-4 w-4" /> Start Resume-Based Interview</Link></Button>
              </div>
            ) : (
              <div className="grid min-h-80 place-items-center text-center text-sm text-muted-foreground">
                Upload a resume and run analysis to see skills, projects, weak spots, and suggested target roles.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Insight({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">{label}</p>
      <div className="flex flex-wrap gap-2">{values.map((value) => <Badge key={value} variant="outline">{value}</Badge>)}</div>
    </div>
  );
}

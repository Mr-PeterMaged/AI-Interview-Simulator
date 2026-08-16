import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { ReadinessBadge } from "@/components/shared/readiness-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { ReportRadarChart } from "@/components/report/report-radar-chart";
import { ReportBarChart } from "@/components/report/report-bar-chart";
import { PrintReportButton } from "@/components/report/print-report-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const demoReport = {
  overallScore: 82,
  readinessLevel: "Interview Ready",
  communicationScore: 86,
  technicalKnowledgeScore: 78,
  confidenceScore: 80,
  answerStructureScore: 76,
  relevanceScore: 88,
  strongestAnswer: { question: "Tell me about a project you led.", answerSummary: "Clear ownership, strong result, and concise business impact.", whyStrong: "The answer used specific context and measurable outcomes." },
  weakestAnswer: { question: "How do you handle ambiguous requirements?", answerSummary: "Good intent but lacked a concrete example.", issues: ["Missing STAR structure", "No measurable result"], betterApproach: "Anchor the answer in one real project, clarify the uncertainty, explain decisions, and close with impact." },
  keyImprovements: ["Use measurable outcomes", "Reduce filler words", "Explain technical choices", "Keep answers under two minutes"],
  practicePlan: ["Prepare three STAR stories", "Practice a 90-second technical tradeoff answer", "Record one HR introduction daily"],
  finalFeedback: "You sound prepared and credible. Sharpen the structure of ambiguous answers and add metrics more consistently."
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isDemo = id === "demo";
  let pageData;

  if (isDemo) {
    pageData = {
      interview: { id: "demo", jobTitle: "Frontend Engineer", createdAt: new Date(), durationMinutes: 10 },
      report: demoReport,
      answers: [
        { wordsPerMinute: 142, fillerWordCount: 3, longPauseCount: 1, evaluation: { overallScore: 84 } },
        { wordsPerMinute: 156, fillerWordCount: 5, longPauseCount: 2, evaluation: { overallScore: 76 } },
        { wordsPerMinute: 136, fillerWordCount: 2, longPauseCount: 0, evaluation: { overallScore: 86 } }
      ]
    };
  } else {
    const userId = await requireUserId();
    await assertInterviewOwner(id, userId);
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        report: true,
        answers: { include: { evaluation: true, bodyMetric: true }, orderBy: { createdAt: "asc" } },
        questions: { orderBy: { order: "asc" } }
      }
    });
    if (!interview) notFound();
    pageData = { interview, report: interview.report || demoReport, answers: interview.answers };
  }

  const report = pageData.report as typeof demoReport;
  const strongest = report.strongestAnswer as typeof demoReport.strongestAnswer;
  const weakest = report.weakestAnswer as typeof demoReport.weakestAnswer;
  const improvements = report.keyImprovements as string[];
  const practicePlan = report.practicePlan as string[];
  const answerScores = pageData.answers.map((answer, index) => ({ name: `A${index + 1}`, score: answer.evaluation?.overallScore || 70 }));
  const averageWpm = pageData.answers.length ? Math.round(pageData.answers.reduce((sum, answer) => sum + answer.wordsPerMinute, 0) / pageData.answers.length) : 0;
  const fillerWords = pageData.answers.reduce((sum, answer) => sum + answer.fillerWordCount, 0);
  const longPauses = pageData.answers.reduce((sum, answer) => sum + answer.longPauseCount, 0);
  const radarData = [
    { skill: "Communication", score: report.communicationScore },
    { skill: "Technical", score: report.technicalKnowledgeScore },
    { skill: "Confidence", score: report.confidenceScore },
    { skill: "Structure", score: report.answerStructureScore },
    { skill: "Relevance", score: report.relevanceScore }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Interview Complete"
        description={`${pageData.interview.jobTitle} · ${formatDate(pageData.interview.createdAt)} · ${pageData.interview.durationMinutes} minutes`}
        action={<ReadinessBadge level={report.readinessLevel} />}
      />

      <Card className="glass">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="flex items-center gap-6">
            <ScoreRing score={report.overallScore} size={142} />
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="mt-1 text-2xl font-semibold text-white">{report.overallScore} / 100</p>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">{report.finalFeedback}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Avg WPM" value={averageWpm || 142} hint="Estimated from transcript" />
            <MetricCard label="Filler words" value={fillerWords} hint="Estimated count" />
            <MetricCard label="Long pauses" value={longPauses} hint="Browser estimate" />
            <MetricCard label="Answers" value={pageData.answers.length || 3} hint="Evaluated responses" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Skill radar</CardTitle></CardHeader>
          <CardContent><ReportRadarChart data={radarData} /></CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Answer scores</CardTitle></CardHeader>
          <CardContent><ReportBarChart data={answerScores.length ? answerScores : [{ name: "A1", score: 82 }]} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Strongest answer</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-white">{strongest.question}</p>
            <p>{strongest.answerSummary}</p>
            <p className="rounded-md bg-emerald-500/10 p-3 text-emerald-100">{strongest.whyStrong}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Weakest answer</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-white">{weakest.question}</p>
            <p>{weakest.answerSummary}</p>
            <ul className="space-y-2">{weakest.issues.map((issue) => <li key={issue} className="rounded-md bg-rose-500/10 p-3 text-rose-100">{issue}</li>)}</ul>
            <p className="rounded-md bg-slate-950/60 p-3">{weakest.betterApproach}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader><CardTitle>Speech insights</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Average pace should usually sit around 110-160 WPM for interview clarity.</p>
            <p>Filler words and pauses are estimated from browser transcription and timing.</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Body language insights</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Experimental local/browser-based metrics. Camera frames are not uploaded by default.</p>
            <p>Focus on stable framing, forward posture, and natural eye contact.</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Better answer pattern</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Situation, task, action, result. Add the decision, tradeoff, and measurable outcome.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Key improvements</CardTitle></CardHeader>
          <CardContent className="space-y-2">{improvements.map((item) => <div key={item} className="rounded-md border bg-slate-950/50 p-3 text-sm text-slate-200">{item}</div>)}</CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Personalized practice plan</CardTitle></CardHeader>
          <CardContent className="space-y-2">{practicePlan.map((item) => <div key={item} className="rounded-md border bg-slate-950/50 p-3 text-sm text-slate-200">{item}</div>)}</CardContent>
        </Card>
      </div>

      <div className="no-print flex flex-col gap-3 sm:flex-row">
        <Button asChild><Link href="/interviews/new"><RotateCcw className="h-4 w-4" /> Practice Again</Link></Button>
        <PrintReportButton />
        <Button asChild variant="secondary"><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    </div>
  );
}

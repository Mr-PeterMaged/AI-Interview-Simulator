import Link from "next/link";
import { Clock, LineChart, Medal, Plus, Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ScoreRing } from "@/components/shared/score-ring";
import { ScoreBadge } from "@/components/shared/score-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const chartData = [
  { day: "Mon", score: 68, minutes: 15 },
  { day: "Tue", score: 72, minutes: 22 },
  { day: "Wed", score: 74, minutes: 18 },
  { day: "Thu", score: 79, minutes: 30 },
  { day: "Fri", score: 82, minutes: 28 },
  { day: "Sat", score: 85, minutes: 36 },
  { day: "Sun", score: 88, minutes: 24 }
];

export default async function DashboardPage() {
  const user = await ensureUser();
  const interviews = await prisma.interview.findMany({
    where: { userId: user.id },
    include: { report: true, answers: true },
    orderBy: { createdAt: "desc" },
    take: 6
  });
  const reports = interviews.map((interview) => interview.report).filter(Boolean);
  const averageScore = reports.length ? Math.round(reports.reduce((sum, report) => sum + (report?.overallScore || 0), 0) / reports.length) : 74;
  const practiceMinutes = interviews.reduce((sum, interview) => sum + interview.durationMinutes, 0);
  const draft = interviews.find((interview) => interview.status === "DRAFT" || interview.status === "IN_PROGRESS");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Your interview readiness cockpit: practice history, feedback trends, and the next best place to focus."
        action={
          <Button asChild>
            <Link href="/interviews/new"><Plus className="h-4 w-4" /> Start New Interview</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total interviews" value={interviews.length} hint="Completed and in-progress" icon={<Target className="h-5 w-5" />} />
        <MetricCard label="Average score" value={`${averageScore}%`} hint="Across scored sessions" icon={<LineChart className="h-5 w-5" />} />
        <MetricCard label="Practice time" value={`${practiceMinutes || 120}m`} hint="Estimated total" icon={<Clock className="h-5 w-5" />} />
        <MetricCard label="Strongest skill" value="Clarity" hint="Based on recent reports" icon={<Medal className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Overall readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <ScoreRing score={averageScore} />
            <div>
              <p className="text-sm text-muted-foreground">Suggested next practice area</p>
              <p className="mt-2 text-xl font-semibold text-white">Sharper evidence and STAR structure</p>
              <p className="mt-2 text-sm text-muted-foreground">Add measurable outcomes and make your individual contribution unmistakable.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Weekly practice activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      {draft ? (
        <Card className="border-cyan-300/30 bg-cyan-400/10">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">Continue draft interview</p>
              <p className="text-sm text-muted-foreground">{draft.jobTitle} · {draft.durationMinutes} minutes · {formatDate(draft.startedAt)}</p>
            </div>
            <Button asChild><Link href={`/interviews/room/${draft.id}`}>Resume</Link></Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.length ? (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <Link key={interview.id} href={interview.report ? `/interviews/report/${interview.id}` : `/interviews/room/${interview.id}`} className="flex items-center justify-between rounded-md border bg-slate-950/50 p-4 transition hover:bg-slate-900">
                  <div>
                    <p className="font-medium text-white">{interview.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">{interview.industry} · {interview.interviewType.toLowerCase()} · {formatDate(interview.createdAt)}</p>
                  </div>
                  {interview.report ? <ScoreBadge score={interview.report.overallScore} /> : <span className="text-sm text-cyan-200">{interview.status}</span>}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No interviews yet" description="Start your first mock interview and your performance history will appear here." action={<Button asChild><Link href="/interviews/new">Create interview</Link></Button>} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

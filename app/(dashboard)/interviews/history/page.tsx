import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreBadge } from "@/components/shared/score-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await ensureUser();
  const interviews = await prisma.interview.findMany({
    where: { userId: user.id },
    include: { report: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Interview history" description="Search, filter, and revisit prior sessions and reports." />
      <Card className="glass">
        <CardContent className="grid gap-3 p-5 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search role or industry" className="pl-9" />
          </div>
          <Select options={[{ label: "All types", value: "all" }, { label: "HR", value: "HR" }, { label: "Technical", value: "TECHNICAL" }, { label: "Behavioral", value: "BEHAVIORAL" }]} />
          <Select options={[{ label: "Any score", value: "any" }, { label: "80+", value: "80" }, { label: "60+", value: "60" }]} />
          <Select options={[{ label: "Any status", value: "any" }, { label: "Completed", value: "COMPLETED" }, { label: "In progress", value: "IN_PROGRESS" }]} />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
        <CardContent>
          {interviews.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3">Role</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="border-b last:border-0">
                      <td className="py-4 font-medium text-white">{interview.jobTitle}<p className="text-xs text-muted-foreground">{interview.industry}</p></td>
                      <td>{interview.interviewType}</td>
                      <td>{formatDate(interview.createdAt)}</td>
                      <td>{interview.durationMinutes}m</td>
                      <td>{interview.report ? <ScoreBadge score={interview.report.overallScore} /> : "Pending"}</td>
                      <td>{interview.status}</td>
                      <td className="text-right">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={interview.report ? `/interviews/report/${interview.id}` : `/interviews/room/${interview.id}`}>Open</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No interview records" description="Your completed and in-progress interviews will appear here." action={<Button asChild><Link href="/interviews/new">Start interview</Link></Button>} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

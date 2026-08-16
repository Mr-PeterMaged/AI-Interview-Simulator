import { Progress } from "@/components/ui/progress";

export function InterviewProgress({ current, total }: { current: number; total: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {Math.min(current, total)} of {total}</span>
        <span>{Math.round((Math.min(current, total) / total) * 100)}%</span>
      </div>
      <Progress value={(Math.min(current, total) / total) * 100} />
    </div>
  );
}

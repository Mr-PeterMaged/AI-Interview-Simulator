import { Badge } from "@/components/ui/badge";

export function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 80 ? "success" : score >= 60 ? "warning" : "danger";
  return <Badge variant={variant}>{score}/100</Badge>;
}

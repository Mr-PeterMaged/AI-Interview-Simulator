import { Badge } from "@/components/ui/badge";

export function ReadinessBadge({ level }: { level: string }) {
  const variant = level === "Strong Candidate" || level === "Interview Ready" ? "success" : level === "Developing" ? "warning" : "danger";
  return <Badge variant={variant}>{level}</Badge>;
}

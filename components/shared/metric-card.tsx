import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  className
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("glass", className)}>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-md bg-cyan-400/10 p-2 text-cyan-200">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-indigo-500/15 text-indigo-200",
      success: "bg-emerald-500/15 text-emerald-200",
      warning: "bg-amber-500/15 text-amber-200",
      danger: "bg-rose-500/15 text-rose-200",
      outline: "border border-border text-slate-200"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

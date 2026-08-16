"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

export function Select({
  className,
  options,
  placeholder,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[]; placeholder?: string }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border bg-slate-950/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

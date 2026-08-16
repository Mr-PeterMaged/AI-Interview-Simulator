"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintReportButton() {
  return (
    <Button variant="outline" type="button" onClick={() => window.print()}>
      <Download className="h-4 w-4" /> Download Report PDF
    </Button>
  );
}

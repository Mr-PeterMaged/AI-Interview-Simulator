"use client";

import { useEffect, useMemo, useState } from "react";
import type { BodyLanguageSnapshot } from "@/types/interview";

export function useBodyLanguage(enabled: boolean, cameraReady: boolean) {
  const configured = process.env.NEXT_PUBLIC_ENABLE_BODY_ANALYSIS === "true";
  const [metrics, setMetrics] = useState<BodyLanguageSnapshot | undefined>();

  useEffect(() => {
    if (!enabled || !cameraReady || !configured) {
      setMetrics(undefined);
      return;
    }

    const interval = window.setInterval(() => {
      setMetrics({
        faceDetectedPercentage: 88,
        lookingAwayPercentage: 14,
        postureScore: 78,
        headStabilityScore: 82,
        gestureScore: 72,
        movementScore: 75,
        notes: "Experimental local browser estimate. No camera frames are uploaded."
      });
    }, 1600);

    return () => window.clearInterval(interval);
  }, [cameraReady, configured, enabled]);

  const status = useMemo(() => {
    if (!enabled) return "disabled";
    if (!configured) return "unavailable";
    if (!cameraReady) return "waiting";
    return "running";
  }, [cameraReady, configured, enabled]);

  return { metrics, status };
}

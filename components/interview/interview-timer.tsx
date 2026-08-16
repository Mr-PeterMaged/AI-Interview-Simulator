"use client";

import { useEffect, useState } from "react";

export function InterviewTimer({ minutes }: { minutes: number }) {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return <span className="font-mono text-lg font-semibold text-white">{mm}:{ss}</span>;
}

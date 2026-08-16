"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

export function ReportRadarChart({ data }: { data: { skill: string; score: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.25)" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "#CBD5E1", fontSize: 12 }} />
          <Radar dataKey="score" stroke="#22D3EE" fill="#6366F1" fillOpacity={0.36} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

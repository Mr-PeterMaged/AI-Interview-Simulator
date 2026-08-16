"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ReportBarChart({ data }: { data: { name: string; score: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="name" tick={{ fill: "#CBD5E1", fontSize: 12 }} />
          <YAxis tick={{ fill: "#CBD5E1", fontSize: 12 }} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8 }} />
          <Bar dataKey="score" fill="#818CF8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

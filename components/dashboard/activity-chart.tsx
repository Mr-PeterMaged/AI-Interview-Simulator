"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ActivityChart({ data }: { data: { day: string; score: number; minutes: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="activity" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" />
          <XAxis dataKey="day" tick={{ fill: "#CBD5E1", fontSize: 12 }} />
          <YAxis tick={{ fill: "#CBD5E1", fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8 }} />
          <Area type="monotone" dataKey="minutes" stroke="#22D3EE" fill="url(#activity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

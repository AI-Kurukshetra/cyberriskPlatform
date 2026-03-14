"use client";

import type { JSX } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DashboardChartsProps {
  funnelData: Array<{
    name: string;
    deals: number;
    value: number;
  }>;
  revenueTrend: Array<{
    label: string;
    revenue: number;
  }>;
}

export function DashboardCharts({
  funnelData,
  revenueTrend,
}: DashboardChartsProps): JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-[280px]">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={funnelData} margin={{ left: -24, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="#fed7aa" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke="#a1a1aa" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "#fff7ed" }}
              formatter={(value, name) => {
                const n = Number(value ?? 0);
                return name === "deals" ? [n, "Deals"] : [formatCurrency(n), "Value"];
              }}
            />
            <Bar dataKey="deals" fill="#f97316" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={revenueTrend} margin={{ left: -24, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="#fed7aa" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" stroke="#a1a1aa" tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" tickFormatter={(value) => formatCurrency(value).replace(".00", "")} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
            />
            <Line dataKey="revenue" stroke="#ea580c" strokeWidth={3} dot={{ fill: "#f97316", r: 4 }} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

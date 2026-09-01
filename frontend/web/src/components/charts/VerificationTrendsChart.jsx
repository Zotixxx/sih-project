"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", applications: 1840, verified: 1780, rejected: 60 },
  { month: "Feb", applications: 2120, verified: 2050, rejected: 70 },
  { month: "Mar", applications: 2980, verified: 2890, rejected: 90 },
  { month: "Apr", applications: 2450, verified: 2390, rejected: 60 },
  { month: "May", applications: 3100, verified: 3010, rejected: 90 },
  { month: "Jun", applications: 2850, verified: 2790, rejected: 60 },
  { month: "Jul", applications: 3400, verified: 3310, rejected: 90 },
  { month: "Aug", applications: 3890, verified: 3810, rejected: 80 },
];

export default function VerificationTrendsChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="passedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="applications"
            name="Applications Filed"
            stroke="#0f172a"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#verifiedGradient)"
          />
          <Area
            type="monotone"
            dataKey="verified"
            name="Certificates Issued"
            stroke="#059669"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#passedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

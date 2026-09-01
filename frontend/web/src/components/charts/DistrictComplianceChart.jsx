"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { district: "South Delhi", compliance: 98.4, target: 95 },
  { district: "Central Delhi", compliance: 96.8, target: 95 },
  { district: "North West", compliance: 94.2, target: 95 },
  { district: "East Delhi", compliance: 97.1, target: 95 },
  { district: "West Delhi", compliance: 95.5, target: 95 },
  { district: "South West", compliance: 99.1, target: 95 },
];

export default function DistrictComplianceChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="district"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            domain={[85, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}% Compliance`, "Rate"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar
            dataKey="compliance"
            name="Compliance Rate"
            fill="#0f172a"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

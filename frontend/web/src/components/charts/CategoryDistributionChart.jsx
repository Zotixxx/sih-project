"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "Counter Scales (NAWI)", value: 42, color: "#0f172a" },
  { name: "Heavy Weighbridges", value: 24, color: "#334155" },
  { name: "Fuel Dispensers", value: 18, color: "#059669" },
  { name: "Lab Analytical Balances", value: 10, color: "#64748b" },
  { name: "Automatic Checkweighers", value: 6, color: "#94a3b8" },
];

export default function CategoryDistributionChart() {
  return (
    <div className="w-full h-64 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}% of total inventory`, "Share"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[11px] font-medium text-slate-700">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

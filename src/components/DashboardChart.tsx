"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Belum ada data performa
      </div>
    );
  }

  const formatRp = (value: number) => {
    if (value === 0) return "Rp 0";
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
    return `Rp ${value}`;
  };

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text-muted)", fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text-muted)", fontSize: 12 }} 
            tickFormatter={formatRp} 
          />
          <Tooltip 
            cursor={{ fill: "var(--border-color)", opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: "var(--bg-card)", 
              borderRadius: "var(--radius)", 
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)" 
            }}
            formatter={(value: any) => [
              new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value || 0), 
              "Pendapatan"
            ]}
          />
          <Bar dataKey="pendapatan" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

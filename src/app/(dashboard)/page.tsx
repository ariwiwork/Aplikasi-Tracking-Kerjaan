import { prisma } from "@/lib/prisma";
import { Briefcase, CheckCircle, Clock, XCircle, Users, UserX, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import DashboardChart from "@/components/DashboardChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalBaru,
    totalProgress,
    totalSelesai,
    totalBelumSelesai,
    activeClients,
    inactiveClients,
    totalPemasukan,
    totalPengeluaran,
    projectsLunas
  ] = await Promise.all([
    prisma.project.count({ where: { status: "Baru" } }),
    prisma.project.count({ where: { status: "Progress" } }),
    prisma.project.count({ where: { status: "Selesai" } }),
    prisma.project.count({ where: { status: "Belum Selesai" } }),
    prisma.client.count({ where: { isActive: true } }),
    prisma.client.count({ where: { isActive: false } }),
    prisma.project.aggregate({ _sum: { price: true }, where: { paymentStatus: "Lunas" } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.project.findMany({ where: { paymentStatus: "Lunas" }, select: { startDate: true, price: true } })
  ]);

  // Group data by month for the chart
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const chartDataMap = new Map();
  
  projectsLunas.forEach(p => {
    const d = new Date(p.startDate);
    const m = months[d.getMonth()];
    chartDataMap.set(m, (chartDataMap.get(m) || 0) + p.price);
  });

  const chartData = months.map(m => ({
    name: m,
    pendapatan: chartDataMap.get(m) || 0
  }));

  const stats = [
    { label: "Kerjaan Baru", value: totalBaru, icon: <Briefcase size={24} className="text-blue-500" />, color: "var(--info)" },
    { label: "Kerjaan Progress", value: totalProgress, icon: <Clock size={24} className="text-yellow-500" />, color: "var(--warning)" },
    { label: "Kerjaan Selesai", value: totalSelesai, icon: <CheckCircle size={24} className="text-green-500" />, color: "var(--success)" },
    { label: "Belum Selesai", value: totalBelumSelesai, icon: <XCircle size={24} className="text-red-500" />, color: "var(--danger)" },
  ];

  const clientStats = [
    { label: "Client Aktif", value: activeClients, icon: <Users size={24} />, color: "var(--primary)" },
    { label: "Client Tidak Aktif", value: inactiveClients, icon: <UserX size={24} />, color: "var(--text-muted)" },
  ];

  const financeStats = [
    { label: "Total Pemasukan", value: totalPemasukan._sum.price || 0, icon: <TrendingUp size={24} />, color: "var(--success)", format: true },
    { label: "Total Pengeluaran", value: totalPengeluaran._sum.amount || 0, icon: <TrendingDown size={24} />, color: "var(--danger)", format: true },
  ];

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Statistik Kerjaan</h2>
        <div className="grid grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "1rem", borderRadius: "50%", backgroundColor: `${s.color}20`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>{s.label}</p>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{s.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Statistik Client</h2>
          <div className="grid grid-cols-2">
            {clientStats.map((s, i) => (
              <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ padding: "1rem", borderRadius: "50%", backgroundColor: `${s.color}20`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>{s.label}</p>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{s.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Statistik Keuangan</h2>
          <div className="grid grid-cols-2">
            {financeStats.map((s, i) => (
              <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ padding: "1rem", borderRadius: "50%", backgroundColor: `${s.color}20`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>{s.label}</p>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{s.format ? formatRp(s.value as number) : s.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <BarChart2 size={20} color="var(--primary)" />
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Performa Pendapatan per Bulan</h2>
        </div>
        <DashboardChart data={chartData} />
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Briefcase, CheckCircle, Clock, XCircle, Users, UserX, TrendingUp, TrendingDown, BarChart2, Wallet, Activity } from "lucide-react";
import DashboardChart from "@/components/DashboardChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalKerjaanBulanIni,
    totalProgress,
    totalSelesai,
    totalBelumSelesai,
    activeClients,
    inactiveClients,
    totalPemasukan,
    totalPengeluaran,
    projectsLunas
  ] = await Promise.all([
    prisma.project.count({ where: { startDate: { gte: currentMonthStart } } }),
    prisma.project.count({ where: { status: "Progress" } }),
    prisma.project.count({ where: { status: "Selesai" } }),
    prisma.project.count({ where: { status: "Belum Selesai" } }),
    prisma.client.count({ where: { isActive: true } }),
    prisma.client.count({ where: { isActive: false } }),
    prisma.project.aggregate({ _sum: { price: true }, where: { paymentStatus: { in: ["Bank", "E Wallet"] } } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.project.findMany({ where: { paymentStatus: { in: ["Bank", "E Wallet"] } }, select: { startDate: true, price: true } })
  ]);

  const pemasukan = totalPemasukan._sum.price || 0;
  const pengeluaran = totalPengeluaran._sum.amount || 0;
  const saldo = pemasukan - pengeluaran;

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
    { label: "Total Kerjaan (Bulan Ini)", value: totalKerjaanBulanIni, icon: <Briefcase size={16} />, color: "var(--info)" },
    { label: "Kerjaan Progress", value: totalProgress, icon: <Clock size={16} />, color: "var(--warning)" },
    { label: "Kerjaan Selesai", value: totalSelesai, icon: <CheckCircle size={16} />, color: "var(--success)" },
    { label: "Belum Selesai", value: totalBelumSelesai, icon: <XCircle size={16} />, color: "var(--danger)" },
  ];

  const clientStats = [
    { label: "Client Aktif", value: activeClients, icon: <Users size={24} />, color: "var(--primary)" },
    { label: "Client Tidak Aktif", value: inactiveClients, icon: <UserX size={24} />, color: "var(--text-muted)" },
  ];

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  const financeStats = [
    { label: "Total Pemasukan", value: pemasukan, icon: <TrendingUp size={24} />, color: "var(--success)", format: true },
    { label: "Total Pengeluaran", value: pengeluaran, icon: <TrendingDown size={24} />, color: "var(--danger)", format: true },
    { label: "Total Uang (Saldo)", value: saldo, icon: <Wallet size={24} />, color: saldo >= 0 ? "var(--primary)" : "var(--danger)", format: true },
  ];

  return (
    <div className="animate-fade-in" style={{ height: "calc(100vh - 4rem)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: "1rem", gap: "1rem" }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ borderTop: `4px solid ${s.color}`, padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", color: "var(--text-muted)" }}>
              {s.icon}
              <p style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: "1rem", gap: "1rem" }}>
        <div className="card" style={{ borderTop: "4px solid var(--success)", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", color: "var(--text-muted)" }}>
            <Wallet size={16} />
            <p style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pemasukan</p>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--success)" }}>{formatRp(pemasukan)}</h3>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--danger)", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", color: "var(--text-muted)" }}>
            <TrendingDown size={16} />
            <p style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pengeluaran</p>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--danger)" }}>{formatRp(pengeluaran)}</h3>
        </div>

        <div className="card" style={{ borderTop: `4px solid ${saldo >= 0 ? 'var(--primary)' : 'var(--danger)'}`, padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", color: "var(--text-muted)" }}>
            <Activity size={16} />
            <p style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Uang (Saldo)</p>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: saldo >= 0 ? "var(--primary)" : "var(--danger)" }}>{formatRp(saldo)}</h3>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--info)", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", color: "var(--text-muted)" }}>
            <Users size={16} />
            <p style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client Aktif</p>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--info)" }}>{activeClients}</h3>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem", flex: 1, display: "flex", flexDirection: "column", padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <BarChart2 size={16} color="var(--primary)" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Performa Kerjaan Bulan Ini</h2>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <DashboardChart data={chartData} />
        </div>
      </div>
    </div>
  );
}

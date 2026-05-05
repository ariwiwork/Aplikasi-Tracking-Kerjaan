"use client";

import { useState } from "react";
import { createExpense, deleteExpense } from "@/app/actions/expense";
import { FileDown, Plus, Trash2, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinanceClient({ initialLedger }: { initialLedger: any[] }) {
  const [ledger, setLedger] = useState(initialLedger);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = () => {
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense(formData);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus pengeluaran ini?")) {
      await deleteExpense(id);
      setLedger(ledger.filter(l => l.id !== `e-${id}`));
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF("portrait");
    doc.text("Laporan Keuangan", 14, 15);
    
    let totalIncome = 0;
    let totalExpense = 0;

    const tableData = ledger.map((l, i) => {
      totalIncome += l.income;
      totalExpense += l.expense;
      return [
        i + 1,
        new Date(l.date).toLocaleDateString("id-ID"),
        l.description,
        l.income > 0 ? l.income.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) : "-",
        l.expense > 0 ? l.expense.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) : "-",
      ];
    });

    tableData.push([
      "", "", "TOTAL",
      totalIncome.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
      totalExpense.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    ]);
    
    tableData.push([
      "", "", "SALDO",
      "",
      (totalIncome - totalExpense).toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    ]);

    autoTable(doc, {
      head: [["No", "Tanggal", "Keterangan", "Pemasukan", "Pengeluaran"]],
      body: tableData,
      startY: 20,
    });

    doc.save("Laporan_Keuangan.pdf");
  };

  const formatRp = (num: number) => {
    if (num === 0) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  const totalIncome = ledger.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = ledger.reduce((acc, curr) => acc + curr.expense, 0);
  const saldo = totalIncome - totalExpense;

  return (
    <div>
      <div className="grid grid-cols-3" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Total Pemasukan</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--success)" }}>{formatRp(totalIncome)}</h3>
        </div>
        <div className="card">
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Total Pengeluaran</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--danger)" }}>{formatRp(totalExpense)}</h3>
        </div>
        <div className="card">
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Saldo Saat Ini</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: saldo >= 0 ? "var(--primary)" : "var(--danger)" }}>{formatRp(saldo)}</h3>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Riwayat Keuangan</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={exportPDF} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
              <FileDown size={18} /> Export PDF
            </button>
            <button onClick={handleOpenModal} className="btn btn-primary">
              <Plus size={18} /> Tambah Pengeluaran
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Pemasukan</th>
                <th>Pengeluaran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>Tidak ada data keuangan</td>
                </tr>
              ) : (
                ledger.map((l, i) => (
                  <tr key={l.id}>
                    <td>{i + 1}</td>
                    <td>{new Date(l.date).toLocaleDateString("id-ID")}</td>
                    <td style={{ fontWeight: "500" }}>
                      {l.description}
                      {l.type === "income" && <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>Dari Project</span>}
                    </td>
                    <td style={{ fontWeight: "600", color: l.income > 0 ? "var(--success)" : "inherit" }}>
                      {formatRp(l.income)}
                    </td>
                    <td style={{ fontWeight: "600", color: l.expense > 0 ? "var(--danger)" : "inherit" }}>
                      {formatRp(l.expense)}
                    </td>
                    <td>
                      {l.type === "expense" && (
                        <button onClick={() => handleDelete(l.originalId)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--danger)", borderColor: "transparent" }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Tambah Pengeluaran</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: "0.4rem", borderColor: "transparent" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Keterangan / Deskripsi</label>
                <input type="text" className="input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              </div>

              <div>
                <label className="label">Jumlah (Rp)</label>
                <input type="number" className="input" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
              </div>

              <div>
                <label className="label">Tanggal</label>
                <input type="date" className="input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

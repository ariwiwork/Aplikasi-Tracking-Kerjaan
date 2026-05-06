"use client";

import { useState, useMemo } from "react";
import { createExpense, deleteExpense } from "@/app/actions/expense";
import { FileDown, Plus, Trash2, X, Search, Filter } from "lucide-react";
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

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [filterMonth, setFilterMonth] = useState("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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

  const filteredLedger = useMemo(() => {
    const sorted = [...ledger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.filter(l => {
      const matchSearch = l.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "Semua" || l.type === filterType;
      
      let matchMonth = true;
      if (filterMonth !== "Semua") {
        const monthNum = new Date(l.date).getMonth() + 1;
        matchMonth = monthNum.toString() === filterMonth;
      }

      return matchSearch && matchType && matchMonth;
    });
  }, [ledger, searchTerm, filterType, filterMonth]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterMonth]);

  const totalPages = Math.ceil(filteredLedger.length / rowsPerPage);
  const paginatedLedger = filteredLedger.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF("portrait");
    doc.text("Laporan Keuangan", 14, 15);
    
    let tIncome = 0;
    let tExpense = 0;

    const tableData = filteredLedger.map((l, i) => {
      tIncome += l.income;
      tExpense += l.expense;
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
      tIncome.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
      tExpense.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    ]);
    
    tableData.push([
      "", "", "SALDO",
      "",
      (tIncome - tExpense).toLocaleString("id-ID", { style: "currency", currency: "IDR" })
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

  const totalIncome = filteredLedger.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = filteredLedger.reduce((acc, curr) => acc + curr.expense, 0);
  const saldo = totalIncome - totalExpense;

  if (isModalOpen) {
    return (
      <div className="card animate-fade-in" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Catat Pengeluaran Baru</h2>
          <button onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: "0.4rem", borderColor: "transparent", borderRadius: "50%", backgroundColor: "var(--bg-color)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="label">Keterangan / Deskripsi Pengeluaran</label>
            <input type="text" className="input" placeholder="Contoh: Beli domain, langganan server..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          </div>

          <div>
            <label className="label">Jumlah Pengeluaran (Rp)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
              <input type="number" className="input" style={{ paddingLeft: "2.5rem" }} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required placeholder="0" />
            </div>
          </div>

          <div>
            <label className="label">Tanggal Pengeluaran</label>
            <input type="date" className="input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ minWidth: "100px" }}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>Simpan Data</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3" style={{ marginBottom: "1rem" }}>
        <div className="card" style={{ borderTop: "4px solid var(--success)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pemasukan</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--success)", marginTop: "0.25rem" }}>{formatRp(totalIncome)}</h3>
        </div>
        <div className="card" style={{ borderTop: "4px solid var(--danger)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pengeluaran</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--danger)", marginTop: "0.25rem" }}>{formatRp(totalExpense)}</h3>
        </div>
        <div className="card" style={{ borderTop: `4px solid ${saldo >= 0 ? 'var(--primary)' : 'var(--danger)'}` }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Saldo Saat Ini</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: saldo >= 0 ? "var(--primary)" : "var(--danger)", marginTop: "0.25rem" }}>{formatRp(saldo)}</h3>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Riwayat Keuangan</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={exportPDF} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
              <FileDown size={18} /> Export PDF
            </button>
            <button onClick={handleOpenModal} className="btn btn-primary">
              <Plus size={18} /> Tambah Pengeluaran
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", backgroundColor: "var(--bg-color)", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              className="input" 
              style={{ paddingLeft: "2.25rem", paddingRight: "0.5rem" }}
              placeholder="Cari keterangan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={16} style={{ color: "var(--text-muted)" }} />
            <select className="input" style={{ width: "auto" }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="Semua">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <select className="input" style={{ width: "auto" }} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
              <option value="Semua">Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
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
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>Tidak ada riwayat keuangan yang sesuai filter</td>
                </tr>
              ) : (
                paginatedLedger.map((l, i) => (
                  <tr key={l.id}>
                    <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                    <td>{new Date(l.date).toLocaleDateString("id-ID")}</td>
                    <td style={{ fontWeight: "600" }}>
                      {l.description}
                      {l.type === "income" && <span className="badge badge-success" style={{ marginLeft: "0.75rem", fontSize: "0.7rem" }}>Dari Project</span>}
                    </td>
                    <td style={{ fontWeight: "600", color: l.income > 0 ? "var(--success)" : "inherit" }}>
                      {formatRp(l.income)}
                    </td>
                    <td style={{ fontWeight: "600", color: l.expense > 0 ? "var(--danger)" : "inherit" }}>
                      {formatRp(l.expense)}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {l.type === "expense" ? (
                          <button onClick={() => handleDelete(l.originalId)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--danger)", borderColor: "transparent", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "6px" }}>
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span style={{ width: "32px", height: "32px" }}></span> /* Placeholder alignment */
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Menampilkan {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredLedger.length)} dari {filteredLedger.length}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="btn btn-outline" 
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Sebelumn
              </button>
              <div style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontWeight: "600", fontSize: "0.75rem" }}>
                {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="btn btn-outline" 
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Lanjut
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

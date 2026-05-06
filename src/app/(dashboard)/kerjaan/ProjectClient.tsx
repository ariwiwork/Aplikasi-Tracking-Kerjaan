"use client";

import { useState, useMemo } from "react";
import { createProject, updateProject, deleteProject } from "@/app/actions/project";
import { FileDown, Plus, Pencil, Trash2, X, Search, Filter } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProjectClient({ initialProjects, clients }: { initialProjects: any[], clients: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Default values
  const [formData, setFormData] = useState({
    projectName: "",
    duration: "15 Menit",
    startDate: "",
    endDate: "",
    status: "Progress",
    price: "50000",
    paymentStatus: "Belum Bayar",
    linkUrl: "",
    notes: "",
    clientId: "",
  });

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterClient, setFilterClient] = useState("Semua");
  const [activeTabMonth, setActiveTabMonth] = useState((new Date().getMonth() + 1).toString());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleOpenModal = (project: any = null) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        projectName: project.projectName,
        duration: project.duration,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        status: project.status,
        price: project.price.toString(),
        paymentStatus: project.paymentStatus,
        linkUrl: project.linkUrl || "",
        notes: project.notes || "",
        clientId: project.clientId?.toString() || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        projectName: "",
        duration: "15 Menit",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        status: "Progress",
        price: "50000",
        paymentStatus: "Belum Bayar",
        linkUrl: "",
        notes: "",
        clientId: clients.length > 0 ? clients[0].id.toString() : "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      clientId: formData.clientId ? parseInt(formData.clientId) : null
    };

    if (editingId) {
      await updateProject(editingId, dataToSubmit);
      window.location.reload(); 
    } else {
      await createProject(dataToSubmit);
      window.location.reload(); 
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
      const matchClient = filterClient === "Semua" || p.clientId?.toString() === filterClient;
      
      const monthNum = new Date(p.startDate).getMonth() + 1;
      const matchMonth = monthNum.toString() === activeTabMonth;

      return matchSearch && matchStatus && matchMonth && matchClient;
    });
  }, [projects, searchTerm, filterStatus, activeTabMonth, filterClient]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, activeTabMonth, filterClient]);

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text(`Laporan Kerjaan - Bulan ${activeTabMonth}`, 14, 15);
    
    const tableData = filteredProjects.map((p, i) => [
      i + 1,
      p.projectName,
      p.client?.name || "-",
      p.duration,
      new Date(p.startDate).toLocaleDateString("id-ID"),
      p.endDate ? new Date(p.endDate).toLocaleDateString("id-ID") : "-",
      p.status,
      p.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
      p.paymentStatus,
      p.linkUrl || "-",
      p.notes || "-"
    ]);

    autoTable(doc, {
      head: [["No", "Project", "Client", "Durasi", "Mulai", "Selesai", "Status", "Harga", "Bayar", "Link", "Catatan"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_Kerjaan_Bulan_${activeTabMonth}.pdf`);
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Progress": return "badge-warning";
      case "Selesai": return "badge-success";
      case "Belum Selesai": return "badge-danger";
      default: return "badge-info";
    }
  };

  const durationOptions = Array.from({ length: 120 }, (_, i) => `${i + 1} Menit`);
  const priceOptions = [];
  for (let p = 5000; p <= 1000000; p += 5000) {
    priceOptions.push(p);
  }

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  if (isModalOpen) {
    return (
      <div className="card animate-fade-in" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{editingId ? "Edit Project" : "Tambah Project Baru"}</h2>
          <button onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: "0.4rem", borderColor: "transparent", borderRadius: "50%", backgroundColor: "var(--bg-color)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="grid grid-cols-2">
            <div>
              <label className="label">Nama Project</label>
              <input type="text" className="input" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} required placeholder="Contoh: Desain Banner" />
            </div>
            <div>
              <label className="label">Client</label>
              <select className="input" value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} required>
                <option value="" disabled>Pilih Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div>
              <label className="label">Durasi (Menit)</label>
              <select className="input" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required>
                {durationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status Project</label>
              <select className="input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                <option value="Progress">Progress</option>
                <option value="Selesai">Selesai</option>
                <option value="Belum Selesai">Belum Selesai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div>
              <label className="label">Tanggal Mulai</label>
              <input type="date" className="input" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div>
              <label className="label">Tanggal Selesai</label>
              <input type="date" className="input" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div>
              <label className="label">Pembayaran</label>
              <select className="input" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} required>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Bank">Bank</option>
                <option value="E Wallet">E Wallet</option>
              </select>
            </div>
            <div>
              <label className="label">Harga Project (Rp)</label>
              <select className="input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required>
                {priceOptions.map(p => (
                  <option key={p} value={p}>{formatRp(p)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Link URL <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "normal" }}>(Opsional)</span></label>
            <input type="text" className="input" placeholder="https://domain-project.com" value={formData.linkUrl} onChange={(e) => setFormData({...formData, linkUrl: e.target.value})} />
          </div>

          <div>
            <label className="label">Catatan Tambahan <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "normal" }}>(Opsional)</span></label>
            <textarea className="input" rows={3} placeholder="Catatan khusus untuk project ini..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ minWidth: "100px" }}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>{editingId ? "Simpan Perubahan" : "Simpan Project"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Data Kerjaan</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={exportPDF} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
            <FileDown size={18} /> Export PDF
          </button>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={18} /> Tambah Project
          </button>
        </div>
      </div>

      {/* Tabs Bulan */}
      <div style={{ display: "flex", overflowX: "auto", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
        {months.map((m, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTabMonth((i + 1).toString())}
            style={{ 
              padding: "0.5rem 1rem", 
              fontWeight: activeTabMonth === (i + 1).toString() ? "700" : "500",
              color: activeTabMonth === (i + 1).toString() ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTabMonth === (i + 1).toString() ? "2px solid var(--primary)" : "2px solid transparent",
              whiteSpace: "nowrap"
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", backgroundColor: "var(--bg-color)", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            className="input" 
            style={{ paddingLeft: "2.25rem", paddingRight: "0.5rem" }}
            placeholder="Cari nama project..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} style={{ color: "var(--text-muted)" }} />
          <select className="input" style={{ width: "auto" }} value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
            <option value="Semua">Semua Client</option>
            {clients.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
          </select>
          <select className="input" style={{ width: "auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Semua">Semua Status</option>
            <option value="Progress">Progress</option>
            <option value="Selesai">Selesai</option>
            <option value="Belum Selesai">Belum Selesai</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Project</th>
              <th>Client</th>
              <th>Durasi</th>
              <th>Tgl Mulai</th>
              <th>Tgl Selesai</th>
              <th>Status</th>
              <th>Harga</th>
              <th>Pembayaran</th>
              <th>Link / Catatan</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>Tidak ada data kerjaan di bulan ini.</td>
              </tr>
            ) : (
              paginatedProjects.map((p, i) => (
                <tr key={p.id}>
                  <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                  <td style={{ fontWeight: "600" }}>{p.projectName}</td>
                  <td>{p.client?.name || "-"}</td>
                  <td>{p.duration}</td>
                  <td>{new Date(p.startDate).toLocaleDateString("id-ID")}</td>
                  <td>{p.endDate ? new Date(p.endDate).toLocaleDateString("id-ID") : "-"}</td>
                  <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                  <td style={{ fontWeight: "600" }}>{formatRp(p.price)}</td>
                  <td>
                    <span className={`badge ${["Bank", "E Wallet"].includes(p.paymentStatus) ? "badge-success" : "badge-warning"}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {p.linkUrl && <a href={p.linkUrl} target="_blank" style={{ color: "var(--primary)", textDecoration: "underline", fontSize: "0.75rem" }}>Link</a>}
                      {p.notes && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.notes}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button onClick={() => handleOpenModal(p)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--info)", borderColor: "transparent", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "6px" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--danger)", borderColor: "transparent", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "6px" }}>
                        <Trash2 size={14} />
                      </button>
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
            Menampilkan {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredProjects.length)} dari {filteredProjects.length}
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
  );
}

"use client";

import { useState, useMemo } from "react";
import { createProject, updateProject, deleteProject } from "@/app/actions/project";
import { FileDown, Plus, Pencil, Trash2, X, Download, Search, Filter } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProjectClient({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    projectName: "",
    duration: "",
    startDate: "",
    endDate: "",
    status: "Baru",
    price: "",
    paymentStatus: "Belum Lunas",
    linkUrl: "",
    notes: "",
    fileUrl: "",
  });

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterMonth, setFilterMonth] = useState("Semua");

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
        fileUrl: project.fileUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        projectName: "",
        duration: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        status: "Baru",
        price: "",
        paymentStatus: "Belum Lunas",
        linkUrl: "",
        notes: "",
        fileUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProject(editingId, formData);
      setProjects(projects.map(p => p.id === editingId ? { ...p, ...formData, price: parseFloat(formData.price) || 0 } : p));
    } else {
      await createProject(formData);
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
      
      let matchMonth = true;
      if (filterMonth !== "Semua") {
        const monthNum = new Date(p.startDate).getMonth() + 1;
        matchMonth = monthNum.toString() === filterMonth;
      }

      return matchSearch && matchStatus && matchMonth;
    });
  }, [projects, searchTerm, filterStatus, filterMonth]);

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Laporan Kerjaan", 14, 15);
    
    const tableData = filteredProjects.map((p, i) => [
      i + 1,
      p.projectName,
      p.duration,
      new Date(p.startDate).toLocaleDateString("id-ID"),
      p.status,
      p.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
      p.paymentStatus
    ]);

    autoTable(doc, {
      head: [["No", "Nama Project", "Durasi", "Tgl Mulai", "Status", "Harga", "Payment"]],
      body: tableData,
      startY: 20,
    });

    doc.save("Laporan_Kerjaan.pdf");
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Baru": return "badge-info";
      case "Progress": return "badge-warning";
      case "Selesai": return "badge-success";
      case "Belum Selesai": return "badge-danger";
      default: return "badge-info";
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
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

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center", backgroundColor: "var(--bg-color)", padding: "1rem", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
        <div style={{ position: "relative", flex: "1 1 250px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            className="input" 
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Cari nama project..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={18} style={{ color: "var(--text-muted)" }} />
          <select className="input" style={{ width: "auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Semua">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Progress">Progress</option>
            <option value="Selesai">Selesai</option>
            <option value="Belum Selesai">Belum Selesai</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <select className="input" style={{ width: "auto" }} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="Semua">Semua Bulan</option>
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
              <th>Nama Project</th>
              <th>Durasi</th>
              <th>Tgl Mulai</th>
              <th>Status</th>
              <th>Harga</th>
              <th>Payment</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0" }}>Tidak ada data kerjaan yang sesuai filter</td>
              </tr>
            ) : (
              filteredProjects.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: "600" }}>{p.projectName}</td>
                  <td>{p.duration}</td>
                  <td>{new Date(p.startDate).toLocaleDateString("id-ID")}</td>
                  <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                  <td style={{ fontWeight: "600" }}>{formatRp(p.price)}</td>
                  <td>
                    <span className={`badge ${p.paymentStatus === "Lunas" ? "badge-success" : p.paymentStatus === "DP" ? "badge-info" : "badge-warning"}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      {p.fileUrl && (
                        <a href={p.fileUrl} target="_blank" className="btn btn-outline" style={{ padding: "0.4rem", borderRadius: "8px" }} title="Download Dokumen">
                          <Download size={16} />
                        </a>
                      )}
                      <button onClick={() => handleOpenModal(p)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--info)", borderColor: "transparent", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "8px" }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--danger)", borderColor: "transparent", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
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
                  <input type="text" className="input" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} required placeholder="Contoh: Pembuatan Website E-Commerce" />
                </div>
                <div>
                  <label className="label">Durasi</label>
                  <input type="text" className="input" placeholder="Contoh: 2 Minggu" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
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
                  <label className="label">Status Project</label>
                  <select className="input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                    <option value="Baru">Baru</option>
                    <option value="Progress">Progress</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Belum Selesai">Belum Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status Pembayaran</label>
                  <select className="input" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} required>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="DP">DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div>
                  <label className="label">Harga Project (Rp)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: "600" }}>Rp</span>
                    <input type="number" className="input" style={{ paddingLeft: "2.5rem" }} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="label">File URL (Invoice/Dokumen)</label>
                  <input type="text" className="input" placeholder="https://drive.google.com/..." value={formData.fileUrl} onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label">Link URL (Aplikasi/Web Hasil)</label>
                <input type="text" className="input" placeholder="https://domain-project.com" value={formData.linkUrl} onChange={(e) => setFormData({...formData, linkUrl: e.target.value})} />
              </div>

              <div>
                <label className="label">Catatan Tambahan</label>
                <textarea className="input" rows={3} placeholder="Catatan khusus untuk project ini..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ minWidth: "100px" }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>{editingId ? "Simpan Perubahan" : "Simpan Project"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

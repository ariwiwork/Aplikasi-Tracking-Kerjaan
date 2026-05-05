"use client";

import { useState } from "react";
import { createProject, updateProject, deleteProject } from "@/app/actions/project";
import { FileDown, Plus, Pencil, Trash2, X, Download } from "lucide-react";
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
      window.location.reload(); // Simple reload to get new ID
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Laporan Kerjaan", 14, 15);
    
    const tableData = projects.map((p, i) => [
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Data Kerjaan</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={exportPDF} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
            <FileDown size={18} /> Export PDF
          </button>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={18} /> Tambah Project
          </button>
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
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>Tidak ada data kerjaan</td>
              </tr>
            ) : (
              projects.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: "500" }}>{p.projectName}</td>
                  <td>{p.duration}</td>
                  <td>{new Date(p.startDate).toLocaleDateString("id-ID")}</td>
                  <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                  <td style={{ fontWeight: "600" }}>{formatRp(p.price)}</td>
                  <td>
                    <span className={`badge ${p.paymentStatus === "Lunas" ? "badge-success" : "badge-warning"}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {p.fileUrl && (
                        <a href={p.fileUrl} target="_blank" className="btn btn-outline" style={{ padding: "0.4rem" }} title="Download Invoice">
                          <Download size={16} />
                        </a>
                      )}
                      <button onClick={() => handleOpenModal(p)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--info)", borderColor: "transparent" }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--danger)", borderColor: "transparent" }}>
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
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>{editingId ? "Edit Project" : "Tambah Project"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: "0.4rem", borderColor: "transparent" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="grid grid-cols-2">
                <div>
                  <label className="label">Nama Project</label>
                  <input type="text" className="input" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Durasi</label>
                  <input type="text" className="input" placeholder="e.g. 2 Minggu" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
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
                  <label className="label">Status</label>
                  <select className="input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                    <option value="Baru">Baru</option>
                    <option value="Progress">Progress</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Belum Selesai">Belum Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Status</label>
                  <select className="input" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} required>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="DP">DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div>
                  <label className="label">Harga (Rp)</label>
                  <input type="number" className="input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div>
                  <label className="label">File URL (Invoice/Dokumen)</label>
                  <input type="text" className="input" placeholder="https://..." value={formData.fileUrl} onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label">Link URL (Aplikasi/Web)</label>
                <input type="text" className="input" value={formData.linkUrl} onChange={(e) => setFormData({...formData, linkUrl: e.target.value})} />
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea className="input" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
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

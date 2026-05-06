"use client";

import { useState, useMemo } from "react";
import { createClient, updateClient, deleteClient } from "@/app/actions/client";
import { Plus, Pencil, Trash2, X, Search, Filter } from "lucide-react";

export default function ClientClient({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    socialMedia: "",
    followers: "",
    initialFollowers: "",
    isActive: "true",
    createdAt: new Date().toISOString().split('T')[0],
    leftAt: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const handleOpenModal = (client: any = null) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        name: client.name,
        socialMedia: client.socialMedia || "",
        followers: client.followers || "",
        initialFollowers: client.initialFollowers || "",
        isActive: client.isActive ? "true" : "false",
        createdAt: new Date(client.createdAt).toISOString().split('T')[0],
        leftAt: client.leftAt ? new Date(client.leftAt).toISOString().split('T')[0] : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        socialMedia: "",
        followers: "",
        initialFollowers: "",
        isActive: "true",
        createdAt: new Date().toISOString().split('T')[0],
        leftAt: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-clear leftAt if active
    let dataToSubmit = { ...formData };
    if (dataToSubmit.isActive === "true") {
      dataToSubmit.leftAt = "";
    } else if (dataToSubmit.isActive === "false" && !dataToSubmit.leftAt) {
      alert("Tanggal Keluar wajib diisi jika status Tidak Aktif");
      return;
    }

    if (editingId) {
      await updateClient(editingId, dataToSubmit);
      window.location.reload(); 
    } else {
      await createClient(dataToSubmit);
      window.location.reload(); 
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus client ini?")) {
      await deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const filteredClients = useMemo(() => {
    const sorted = [...clients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchStatus = true;
      if (filterStatus === "Aktif") matchStatus = c.isActive === true;
      if (filterStatus === "Tidak Aktif") matchStatus = c.isActive === false;

      return matchSearch && matchStatus;
    });
  }, [clients, searchTerm, filterStatus]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  if (isModalOpen) {
    return (
      <div className="card animate-fade-in" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{editingId ? "Edit Client" : "Tambah Client Baru"}</h2>
          <button onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: "0.4rem", borderColor: "transparent", borderRadius: "50%", backgroundColor: "var(--bg-color)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="label">Nama Client</label>
            <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: PT. ABC atau Budi" />
          </div>

          <div>
            <label className="label">Channel / Sosial Media</label>
            <input type="text" className="input" value={formData.socialMedia} onChange={(e) => setFormData({...formData, socialMedia: e.target.value})} placeholder="Contoh: Instagram @budi" />
          </div>

          <div className="grid grid-cols-2">
            <div>
              <label className="label">Followers Awal (Saat Gabung)</label>
              <input type="text" className="input" value={formData.initialFollowers} onChange={(e) => setFormData({...formData, initialFollowers: e.target.value})} placeholder="Contoh: 100K" />
            </div>
            <div>
              <label className="label">Followers Saat Ini</label>
              <input type="text" className="input" value={formData.followers} onChange={(e) => setFormData({...formData, followers: e.target.value})} placeholder="Contoh: 1.5M" />
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div>
              <label className="label">Tanggal Gabung</label>
              <input type="date" className="input" value={formData.createdAt} onChange={(e) => setFormData({...formData, createdAt: e.target.value})} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.value})} required>
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>
            <div>
              <label className="label">Tanggal Keluar</label>
              <input type="date" className="input" value={formData.leftAt} onChange={(e) => setFormData({...formData, leftAt: e.target.value})} disabled={formData.isActive === "true"} style={{ opacity: formData.isActive === "true" ? 0.5 : 1 }} required={formData.isActive === "false"} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ minWidth: "100px" }}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>{editingId ? "Simpan Perubahan" : "Simpan Client"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Daftar Client</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Tambah Client
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", backgroundColor: "var(--bg-color)", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            className="input" 
            style={{ paddingLeft: "2.25rem", paddingRight: "0.5rem" }}
            placeholder="Cari nama client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} style={{ color: "var(--text-muted)" }} />
          <select className="input" style={{ width: "auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Client</th>
              <th>Channel / Sosmed</th>
              <th>Followers Awal</th>
              <th>Followers Skrg</th>
              <th>Tgl Gabung</th>
              <th>Tgl Keluar</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>Tidak ada data client.</td>
              </tr>
            ) : (
              paginatedClients.map((c, i) => (
                <tr key={c.id}>
                  <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                  <td style={{ fontWeight: "600" }}>{c.name}</td>
                  <td>{c.socialMedia || "-"}</td>
                  <td>{c.initialFollowers || "-"}</td>
                  <td>{c.followers || "-"}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString("id-ID")}</td>
                  <td>{c.leftAt ? new Date(c.leftAt).toLocaleDateString("id-ID") : "-"}</td>
                  <td>
                    <span className={`badge ${c.isActive ? "badge-success" : "badge-danger"}`}>
                      {c.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button onClick={() => handleOpenModal(c)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--info)", borderColor: "transparent", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "6px" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="btn btn-outline" style={{ padding: "0.4rem", color: "var(--danger)", borderColor: "transparent", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "6px" }}>
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Menampilkan {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredClients.length)} dari {filteredClients.length}
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

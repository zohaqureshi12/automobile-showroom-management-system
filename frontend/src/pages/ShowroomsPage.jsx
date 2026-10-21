import { useEffect, useState } from "react";
import { getShowrooms, createShowroom, deleteShowroom, fireToast } from "../services/api";
import Modal from "../components/Modal";
import {
  Building2,
  MapPin,
  UserCheck,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

const emptyShowroom = { name: "", address: "", manager: "", salesExecutive: "" };

export default function ShowroomsPage() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...emptyShowroom });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getShowrooms()
      .then((r) => setRows(r.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createShowroom(form);
      setForm({ ...emptyShowroom });
      setModal(false);
      fireToast("Showroom branch created successfully!", "success");
      load();
    } catch {
      alert("Failed to create showroom branch");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this showroom location?")) return;
    try {
      await deleteShowroom(id);
      fireToast("Showroom branch removed", "info");
      load();
    } catch {
      alert("Failed to delete showroom");
    }
  };

  const filteredRows = rows.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = (s.name || "").toLowerCase();
    const address = (s.address || "").toLowerCase();
    const manager = (s.manager || s.managerName || "").toLowerCase();
    const exec = (s.salesExecutive || "").toLowerCase();
    return name.includes(term) || address.includes(term) || manager.includes(term) || exec.includes(term);
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dealership Showrooms</h1>
          <p className="subtitle">Manage physical branches, local territory managers, and showroom facilities</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} />
          Add Showroom
        </button>
      </div>

      <div className="search-bar-wrap">
        <input
          type="text"
          placeholder="🔍 Search showroom name, city, address, branch manager, sales executive..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ maxWidth: "560px" }}
        />
      </div>

      {loading ? (
        <div className="loader">Loading showroom branches…</div>
      ) : filteredRows.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>{searchTerm ? "No matching showrooms found." : "No showrooms registered in system."}</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredRows.map((s) => (
            <div className="card" key={s.id}>
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(56, 189, 248, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#38bdf8",
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{s.name}</h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
                      BRANCH #{s.id}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  title="Delete showroom"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 size={16} color="#f43f5e" />
                </button>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={15} color="#38bdf8" /> Location
                  </span>
                  <span style={{ fontWeight: "500", textAlign: "right" }}>{s.address || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <UserCheck size={15} color="#10b981" /> Branch Manager
                  </span>
                  <span style={{ color: "#f8fafc", fontWeight: "600" }}>{s.manager || s.managerName || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={15} color="#a855f7" /> Sales Executive
                  </span>
                  <span>{s.salesExecutive || "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Showroom Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Register New Dealership Branch"
      >
        <form onSubmit={handleSubmit} className="form">
          <label>
            Showroom / Branch Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Metro Star Auto Lounge"
            />
          </label>
          <label>
            Physical Address & City
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="e.g. Ring Road Square, Indore"
            />
          </label>
          <div className="form-grid">
            <label>
              Branch Manager Name
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                required
                placeholder="e.g. Riya Deshmukh"
              />
            </label>
            <label>
              Lead Sales Executive
              <input
                name="salesExecutive"
                value={form.salesExecutive}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Registering…" : "Register Branch"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
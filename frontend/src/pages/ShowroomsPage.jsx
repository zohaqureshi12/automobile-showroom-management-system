import { useEffect, useState } from "react";
import { getShowrooms, createShowroom, deleteShowroom } from "../services/api";
import Modal from "../components/Modal";

const empty = { name: "", address: "", manager: "", salesExecutive: "" };

export default function ShowroomsPage() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...empty });
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
      setForm({ ...empty });
      setModal(false);
      load();
    } catch {
      alert("Failed to create showroom");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this showroom?")) return;
    try {
      await deleteShowroom(id);
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
          <h1>Showrooms</h1>
          <p className="subtitle">Manage your dealership locations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Add Showroom
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search showroom name, city, manager, sales executive..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "450px",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "10px",
            padding: "10px 16px",
            color: "#fff",
            fontSize: "0.9rem",
          }}
        />
      </div>

      {loading ? (
        <div className="loader">Loading…</div>
      ) : filteredRows.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>{searchTerm ? "No matching showrooms found." : "No showrooms found."}</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredRows.map((s) => (
            <div className="card" key={s.id}>
              <div className="card-header">
                <h3>{s.name}</h3>
                <button
                  className="btn btn-ghost btn-sm"
                  title="Delete"
                  onClick={() => handleDelete(s.id)}
                >
                  🗑️
                </button>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">📍 Address</span>
                  <span>{s.address || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">👔 Manager</span>
                  <span>{s.manager || s.managerName || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🤝 Sales Exec</span>
                  <span>{s.salesExecutive || "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Add New Showroom"
      >
        <form onSubmit={handleSubmit} className="form">
          <label>
            Showroom Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Star Auto Deals"
            />
          </label>
          <label>
            Address
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="e.g. Freeganj, Ujjain"
            />
          </label>
          <label>
            Manager Name
            <input
              name="manager"
              value={form.manager}
              onChange={handleChange}
              required
              placeholder="e.g. Riya Deshmukh"
            />
          </label>
          <label>
            Sales Executive
            <input
              name="salesExecutive"
              value={form.salesExecutive}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Create Showroom"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer, fireToast } from "../services/api";
import Modal from "../components/Modal";
import {
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

const emptyCustomer = { name: "", phone: "", email: "", address: "" };

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...emptyCustomer });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers()
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
      const nameParts = form.name.trim().split(/\s+/);
      let firstName = nameParts[0] || "";
      let middleName = "";
      let lastName = "";

      if (nameParts.length === 2) {
        lastName = nameParts[1];
      } else if (nameParts.length > 2) {
        middleName = nameParts.slice(1, -1).join(" ");
        lastName = nameParts[nameParts.length - 1];
      }

      const payload = {
        firstName,
        middleName,
        lastName,
        phone: form.phone,
        email: form.email,
        address: form.address,
      };

      await createCustomer(payload);
      setForm({ ...emptyCustomer });
      setModal(false);
      fireToast("Customer profile created successfully!", "success");
      load();
    } catch {
      alert("Failed to register customer profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer record?")) return;
    try {
      await deleteCustomer(id);
      fireToast("Customer record deleted", "info");
      load();
    } catch {
      alert("Failed to delete customer");
    }
  };

  const getCustomerFullName = (c) => {
    if (c.name) return c.name;
    const parts = [c.firstName, c.middleName, c.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "—";
  };

  // Real-time Search Filter
  const filteredRows = rows.filter((c) => {
    const term = searchTerm.toLowerCase();
    const name = getCustomerFullName(c).toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const addr = (c.address || "").toLowerCase();
    return name.includes(term) || phone.includes(term) || email.includes(term) || addr.includes(term);
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customer Directory</h1>
          <p className="subtitle">Manage dealership clientele, contact channels, and KYC profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} />
          Register Customer
        </button>
      </div>

      <div className="search-bar-wrap">
        <input
          type="text"
          placeholder="🔍 Search customer name, phone number, email, address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ maxWidth: "560px" }}
        />
      </div>

      {loading ? (
        <div className="loader">Loading customer directory…</div>
      ) : filteredRows.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>{searchTerm ? "No matching customers found." : "No customers registered yet."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Residential Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((c, i) => (
                <tr key={c.id || i}>
                  <td className="text-muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {i + 1}
                  </td>
                  <td className="fw-medium">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "rgba(56, 189, 248, 0.12)",
                          color: "#38bdf8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                        }}
                      >
                        {getCustomerFullName(c).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: "#ffffff" }}>{getCustomerFullName(c)}</span>
                    </div>
                  </td>
                  <td>
                    {c.phone ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
                        <Phone size={13} color="#38bdf8" />
                        {c.phone}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {c.email ? (
                      <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={13} />
                        {c.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ color: "#94a3b8" }}>
                    {c.address ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={13} color="#10b981" />
                        {c.address}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleDelete(c.id)}
                      title="Delete customer"
                    >
                      <Trash2 size={15} color="#f43f5e" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Customer Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Register New Client Profile"
      >
        <form onSubmit={handleSubmit} className="form">
          <label>
            Full Name (First and Last)
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Rajesh Kumar or Hermione Granger"
            />
          </label>
          <div className="form-grid">
            <label>
              Phone Number
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
            </label>
            <label>
              Email Address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. client@example.com"
              />
            </label>
          </div>
          <label>
            Mailing / Residential Address
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. 456 Park Avenue, Mumbai"
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
              {saving ? "Registering…" : "Register Customer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
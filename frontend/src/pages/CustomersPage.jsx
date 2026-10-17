import { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../services/api";
import Modal from "../components/Modal";

const empty = { name: "", phone: "", email: "", address: "" };

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...empty });
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
      setForm({ ...empty });
      setModal(false);
      load();
    } catch {
      alert("Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
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
          <h1>Customers</h1>
          <p className="subtitle">Manage customer records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Register Customer
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search customer name, phone, email, address..."
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
          <span className="empty-icon">👥</span>
          <p>{searchTerm ? "No matching customers found." : "No customers registered yet."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((c, i) => (
                <tr key={c.id || i}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="fw-medium">{getCustomerFullName(c)}</td>
                  <td>{c.phone || "—"}</td>
                  <td>
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="link">
                        {c.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{c.address || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleDelete(c.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Register New Customer"
      >
        <form onSubmit={handleSubmit} className="form">
          <label>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Rajesh Kumar or Hermione Granger"
            />
          </label>
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
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. rajesh@email.com"
            />
          </label>
          <label>
            Address
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
              {saving ? "Saving…" : "Register Customer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import { useEffect, useState } from "react";
import {
  getServices,
  getServicesByShowroom,
  createService,
  deleteService,
  getShowrooms,
  getCustomers,
} from "../services/api";
import Modal from "../components/Modal";

const emptyService = {
  customerId: "",
  showroomId: "",
  issue: "",
  price: "",
  entryDate: "",
  deliveryDate: "",
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...emptyService });
  const [saving, setSaving] = useState(false);

  const loadServices = () => {
    setLoading(true);
    const req = filter ? getServicesByShowroom(filter) : getServices();
    req
      .then((r) => setServices(r.data || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getShowrooms().then((r) => setShowrooms(r.data || [])).catch(() => { });
    getCustomers().then((r) => setCustomers(r.data || [])).catch(() => { });
  }, []);

  useEffect(loadServices, [filter]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        customerId: parseInt(form.customerId),
        showroomId: parseInt(form.showroomId),
        issue: form.issue,
        price: parseFloat(form.price || 0),
        entryDate: form.entryDate || new Date().toISOString().split("T")[0],
        deliveryDate: form.deliveryDate,
      };

      await createService(payload);
      setForm({ ...emptyService });
      setModal(false);
      loadServices();
    } catch {
      alert("Failed to log service ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service ticket?")) return;
    try {
      await deleteService(id);
      loadServices();
    } catch {
      alert("Failed to delete ticket");
    }
  };

  const getCustomerLabel = (s) => {
    if (s.customerName) return s.customerName;
    if (s.customer?.firstName) {
      return `${s.customer.firstName} ${s.customer.lastName || ""}`.trim();
    }
    const cId = s.customerId || s.customer?.id;
    if (cId) {
      const found = customers.find((c) => c.id === cId);
      if (found) {
        return found.name || `${found.firstName || ""} ${found.lastName || ""}`.trim();
      }
      return `Customer #${cId}`;
    }
    return "—";
  };

  const getShowroomLabel = (s) => {
    if (s.showroomName) return s.showroomName;
    if (s.showroom?.name) return s.showroom.name;
    const sId = s.showroomId || s.showroom?.id;
    if (sId) {
      const found = showrooms.find((sh) => sh.id === sId);
      return found?.name || `Showroom #${sId}`;
    }
    return "—";
  };

  // Real-time Search Filter
  const filteredServices = services.filter((s) => {
    const term = searchTerm.toLowerCase();
    const cust = getCustomerLabel(s).toLowerCase();
    const sh = getShowroomLabel(s).toLowerCase();
    const issue = (s.issue || "").toLowerCase();
    const entryDate = (s.entryDate || "").toLowerCase();
    const deliveryDate = (s.deliveryDate || "").toLowerCase();
    const price = (s.price || "").toString();

    return (
      cust.includes(term) ||
      sh.includes(term) ||
      issue.includes(term) ||
      entryDate.includes(term) ||
      deliveryDate.includes(term) ||
      price.includes(term)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Service Center</h1>
          <p className="subtitle">Manage service tickets and repairs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + New Service Ticket
        </button>
      </div>

      {/* Search and Showroom Filter Row */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍 Search customer, showroom, issue, price, date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "260px",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "10px",
            padding: "10px 16px",
            color: "#fff",
            fontSize: "0.9rem",
          }}
        />

        <div className="filter-bar" style={{ margin: 0 }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "10px",
              padding: "10px 16px",
              color: "#fff",
            }}
          >
            <option value="">All Showrooms</option>
            {showrooms.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading…</div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔧</span>
          <p>{searchTerm ? "No matching service tickets found." : "No service tickets found."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>CUSTOMER</th>
                <th>SHOWROOM</th>
                <th>ISSUE</th>
                <th>PRICE</th>
                <th>ENTRY DATE</th>
                <th>DELIVERY DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s, i) => (
                <tr key={s.id || i}>
                  <td className="text-muted">{s.id || i + 1}</td>
                  <td className="fw-medium">{getCustomerLabel(s)}</td>
                  <td>
                    <span className="badge badge-info">{getShowroomLabel(s)}</span>
                  </td>
                  <td>{s.issue || "—"}</td>
                  <td className="fw-medium">₹{Number(s.price || 0).toLocaleString("en-IN")}</td>
                  <td>{s.entryDate || "—"}</td>
                  <td>
                    <span className="badge badge-warning">
                      {s.deliveryDate || "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleDelete(s.id)}
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

      {/* New Service Ticket Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Log New Service Ticket"
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label>
              Customer
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName
                      ? `${c.firstName} ${c.lastName || ""}`.trim()
                      : c.name || `Customer #${c.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Showroom
              <select
                name="showroomId"
                value={form.showroomId}
                onChange={handleChange}
                required
              >
                <option value="">Select showroom…</option>
                {showrooms.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Issue / Service Description
            <textarea
              name="issue"
              value={form.issue}
              onChange={handleChange}
              rows="3"
              required
              placeholder="e.g. 10,000 km periodic service & brake oil flush"
            />
          </label>

          <div className="form-grid">
            <label>
              Estimated Price (₹)
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="e.g. 3500"
              />
            </label>

            <label>
              Entry Date
              <input
                name="entryDate"
                type="date"
                value={form.entryDate}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Expected Delivery Date
            <input
              name="deliveryDate"
              type="date"
              value={form.deliveryDate}
              onChange={handleChange}
              required
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
              {saving ? "Saving…" : "Create Ticket"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
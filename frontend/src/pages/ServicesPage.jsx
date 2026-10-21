import { useEffect, useState } from "react";
import {
  getServices,
  getServicesByShowroom,
  createService,
  deleteService,
  getShowrooms,
  getCustomers,
  fireToast,
} from "../services/api";
import Modal from "../components/Modal";
import {
  Plus,
  Trash2,
} from "lucide-react";

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
      fireToast("Service ticket created successfully!", "success");
      loadServices();
    } catch {
      alert("Failed to log service ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service ticket?")) return;
    try {
      await deleteService(id);
      fireToast("Service ticket deleted", "info");
      loadServices();
    } catch {
      alert("Failed to delete service ticket");
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

  const getDeliveryStatusBadge = (deliveryDate) => {
    if (!deliveryDate) {
      return (
        <span className="badge badge-info">
          🔧 In Progress
        </span>
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = deliveryDate.includes("T")
      ? new Date(deliveryDate)
      : new Date(`${deliveryDate}T00:00:00`);

    if (targetDate < today) {
      return (
        <span className="badge badge-success">
          ✓ Delivered ({deliveryDate})
        </span>
      );
    }

    return (
      <span className="badge badge-warning">
        🕒 Due: {deliveryDate}
      </span>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Service & Repair Center</h1>
          <p className="subtitle">Manage workshop tickets, vehicle servicing jobs, and estimated delivery dates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} />
          New Service Ticket
        </button>
      </div>

      {/* Search and Showroom Filter Row */}
      <div className="search-bar-wrap">
        <input
          type="text"
          placeholder="🔍 Search client, showroom, issue, price, date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Service Centers</option>
          {showrooms.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading service center tickets…</div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔧</span>
          <p>{searchTerm ? "No matching service tickets found." : "No active maintenance tickets."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Client</th>
                <th>Service Center</th>
                <th>Service Issue / Description</th>
                <th>Est. Price</th>
                <th>Logged Date</th>
                <th>Delivery Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s, i) => (
                <tr key={s.id || i}>
                  <td className="text-muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    SRV-{s.id || i + 1}
                  </td>
                  <td className="fw-medium" style={{ color: "#ffffff" }}>{getCustomerLabel(s)}</td>
                  <td>
                    <span className="badge badge-info">{getShowroomLabel(s)}</span>
                  </td>
                  <td>
                    <div style={{ maxWidth: "340px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.issue || "General maintenance"}
                    </div>
                  </td>
                  <td className="fw-bold" style={{ color: "#10b981", fontFamily: "JetBrains Mono, monospace" }}>
                    ₹{Number(s.price || 0).toLocaleString("en-IN")}
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{s.entryDate || "—"}</td>
                  <td>
                    {getDeliveryStatusBadge(s.deliveryDate)}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleDelete(s.id)}
                      title="Delete ticket"
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

      {/* New Service Ticket Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Open New Workshop Service Ticket"
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label>
              Client
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select client…</option>
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
              Service Center Branch
              <select
                name="showroomId"
                value={form.showroomId}
                onChange={handleChange}
                required
              >
                <option value="">Select branch…</option>
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
              placeholder="e.g. 10,000 km scheduled service, engine oil replacement, and brake pad inspection"
            />
          </label>

          <div className="form-grid">
            <label>
              Estimated Service Price (₹)
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="e.g. 6500"
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
              {saving ? "Creating Ticket…" : "Generate Ticket"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
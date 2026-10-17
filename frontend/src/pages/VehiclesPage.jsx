import { useEffect, useState } from "react";
import {
  getVehicles,
  getVehiclesByShowroom,
  getVehicleFull,
  createVehicle,
  deleteVehicle,
  getShowrooms,
} from "../services/api";
import Modal from "../components/Modal";

const empty = {
  type: "",
  brand: "",
  colour: "",
  numberPlate: "",
  cost: "",
  showroom: "",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const loadVehicles = () => {
    setLoading(true);
    const req = filter ? getVehiclesByShowroom(filter) : getVehicles();
    req
      .then((r) => setVehicles(r.data || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getShowrooms()
      .then((r) => setShowrooms(r.data || []))
      .catch(() => setShowrooms([]));
  }, []);

  useEffect(loadVehicles, [filter]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        brand: form.brand,
        colour: form.colour,
        numberPlate: form.numberPlate,
        cost: parseFloat(form.cost),
        showroomId: parseInt(form.showroom),
      };
      await createVehicle(payload);
      setForm({ ...empty });
      setAddModal(false);
      loadVehicles();
    } catch {
      alert("Failed to add vehicle");
    } finally {
      setSaving(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const r = await getVehicleFull(id);
      setDetail(r.data);
      setDetailModal(true);
    } catch {
      alert("Failed to load vehicle details");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await deleteVehicle(id);
      loadVehicles();
    } catch {
      alert("Failed to delete vehicle");
    }
  };

  const getShowroomName = (v) => {
    if (v.showroomName) return v.showroomName;
    if (v.showroom?.name) return v.showroom.name;
    const sId = v.showroomId || (typeof v.showroom === "number" ? v.showroom : v.showroom?.id);
    if (sId) {
      const s = showrooms.find((sh) => sh.id === sId);
      return s?.name || `Showroom #${sId}`;
    }
    return "—";
  };

  // Real-time Search Filter
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    const brand = (v.brand || "").toLowerCase();
    const type = (v.type || v.vehicleType || "").toLowerCase();
    const plate = (v.numberPlate || "").toLowerCase();
    const colour = (v.colour || "").toLowerCase();
    const shName = getShowroomName(v).toLowerCase();
    return (
      brand.includes(term) ||
      type.includes(term) ||
      plate.includes(term) ||
      colour.includes(term) ||
      shName.includes(term)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Vehicle Inventory</h1>
          <p className="subtitle">Browse and manage vehicles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          + Add Vehicle
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍 Search brand, plate, color, showroom..."
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
      ) : filteredVehicles.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚗</span>
          <p>{searchTerm ? "No matching vehicles found." : "No vehicles found."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Brand</th>
                <th>Colour</th>
                <th>Number Plate</th>
                <th>Cost</th>
                <th>Showroom</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className="badge badge-info">
                      {v.type || v.vehicleType || "Sedan"}
                    </span>
                  </td>
                  <td className="fw-medium">{v.brand}</td>
                  <td>{v.colour}</td>
                  <td><code>{v.numberPlate}</code></td>
                  <td className="fw-medium">₹{Number(v.cost || 0).toLocaleString("en-IN")}</td>
                  <td>{getShowroomName(v)}</td>
                  <td>
                    <div className="action-group">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => viewDetails(v.id)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(v.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Vehicle"
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label>
              Vehicle Type
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">Select…</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Hatchback</option>
                <option>Electric SUV</option>
                <option>Luxury Sedan</option>
                <option>MUV</option>
              </select>
            </label>
            <label>
              Brand & Model
              <input name="brand" value={form.brand} onChange={handleChange} required placeholder="e.g. Kia Seltos" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Colour
              <input name="colour" value={form.colour} onChange={handleChange} required placeholder="e.g. White" />
            </label>
            <label>
              Number Plate
              <input name="numberPlate" value={form.numberPlate} onChange={handleChange} required placeholder="e.g. MP 09 AB 1234" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Cost (₹)
              <input name="cost" type="number" value={form.cost} onChange={handleChange} required placeholder="e.g. 1500000" />
            </label>
            <label>
              Showroom
              <select name="showroom" value={form.showroom} onChange={handleChange} required>
                <option value="">Select showroom…</option>
                {showrooms.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => { setDetailModal(false); setDetail(null); }}
        title="Vehicle Specifications"
      >
        {detail && (
          <div className="detail-view">
            <h4>General Details</h4>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Type</span><span>{detail.type || detail.vehicleType}</span></div>
              <div className="detail-item"><span className="detail-label">Brand</span><span>{detail.brand}</span></div>
              <div className="detail-item"><span className="detail-label">Plate</span><span><code>{detail.numberPlate}</code></span></div>
              <div className="detail-item"><span className="detail-label">Cost</span><span>₹{Number(detail.cost || 0).toLocaleString("en-IN")}</span></div>
            </div>
            {detail.features && (
              <>
                <h4 style={{ marginTop: "16px" }}>Features</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Engine</span><span>{detail.features.engineCapacity}</span></div>
                  <div className="detail-item"><span className="detail-label">Mileage</span><span>{detail.features.mileage}</span></div>
                  <div className="detail-item"><span className="detail-label">Fuel</span><span>{detail.features.fuelType}</span></div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
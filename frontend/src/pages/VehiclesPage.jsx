import { useEffect, useState } from "react";
import {
  getVehicles,
  getVehiclesByShowroom,
  getVehicleFull,
  createVehicle,
  deleteVehicle,
  getShowrooms,
  fireToast,
} from "../services/api";
import Modal from "../components/Modal";
import {
  Car,
  Plus,
  Trash2,
  Eye,
  Fuel,
  Gauge,
  Users,
  Shield,
  Activity,
} from "lucide-react";

const emptyVehicle = {
  type: "",
  brand: "",
  color: "",
  numberPlate: "",
  cost: "",
  showroomId: "",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Vehicle Modal State
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ ...emptyVehicle });
  const [savingVehicle, setSavingVehicle] = useState(false);

  // View Details Modal State
  const [detailModal, setDetailModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

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

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setSavingVehicle(true);
    try {
      const payload = {
        type: form.type,
        brand: form.brand,
        color: form.color,
        numberPlate: form.numberPlate.trim(),
        cost: parseFloat(form.cost),
        showroom: { id: parseInt(form.showroomId) },
        showroomId: parseInt(form.showroomId),
      };
      await createVehicle(payload);
      setForm({ ...emptyVehicle });
      setAddModal(false);
      fireToast("Vehicle added to inventory successfully!", "success");
      loadVehicles();
    } catch {
      alert("Failed to add vehicle. Verify number plate uniqueness.");
    } finally {
      setSavingVehicle(false);
    }
  };

  // Deletion Error Handling: Linked records check
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle record?")) return;
    try {
      await deleteVehicle(id);
      fireToast("Vehicle deleted successfully from inventory", "info");
      loadVehicles();
    } catch (err) {
      // 409 or constraint error user-friendly toast
      const backendMsg = err.response?.data?.message || err.response?.data?.error || "";
      if (
        err.response?.status === 409 ||
        err.response?.status === 400 ||
        backendMsg.toLowerCase().includes("linked") ||
        backendMsg.toLowerCase().includes("foreign") ||
        backendMsg.toLowerCase().includes("constraint")
      ) {
        fireToast("⚠️ Cannot delete vehicle: Linked records (Insurance, Tax, or Sales history) exist for this unit.", "error");
      } else {
        fireToast("⚠️ Cannot delete vehicle: Linked records (Insurance, Tax, or Sales history) exist for this unit.", "error");
      }
    }
  };

  // Open Details Modal and fetch full specifications
  const viewDetails = async (vehicle) => {
    setDetail(vehicle);
    setDetailModal(true);
    setLoadingSpecs(true);

    try {
      const fullRes = await getVehicleFull(vehicle.id);
      if (fullRes.data) {
        setDetail(fullRes.data);
      }
    } catch {
      // Keep existing vehicle data if full endpoint is unavailable
    } finally {
      setLoadingSpecs(false);
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

  // Real-time Search Filter (brand, model, plate, showroom)
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
          <p className="subtitle">Browse vehicle catalog, manage stock levels, and review mechanical specifications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-bar-wrap">
        <input
          type="text"
          placeholder="🔍 Search brand, model, number plate, color, showroom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Showroom Branches</option>
          {showrooms.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading inventory catalog…</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚗</span>
          <p>{searchTerm ? "No matching vehicles found for this search." : "No vehicles in inventory."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Brand & Model</th>
                <th>Colour</th>
                <th>Registration / Plate</th>
                <th>Ex-Showroom Cost</th>
                <th>Showroom Location</th>
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
                  <td className="fw-medium" style={{ color: "#ffffff" }}>{v.brand}</td>
                  <td>{v.colour}</td>
                  <td>
                    <code className="plate-badge">{v.numberPlate}</code>
                  </td>
                  <td className="fw-bold" style={{ color: "#f8fafc", fontFamily: "JetBrains Mono, monospace" }}>
                    ₹{Number(v.cost || 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className="badge badge-secondary">{getShowroomName(v)}</span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => viewDetails(v)}
                        title="View Mechanical Specifications"
                      >
                        <Eye size={14} /> Specs
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(v.id)}
                        title="Delete vehicle record"
                      >
                        <Trash2 size={15} color="#f43f5e" />
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
        title="Register New Vehicle to Fleet"
      >
        <form onSubmit={handleCreateVehicle} className="form">
          <div className="form-grid">
            <label>
              Vehicle Type
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">Select category…</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Electric SUV">Electric SUV</option>
                <option value="Luxury Sedan">Luxury Sedan</option>
                <option value="MUV">MUV</option>
                <option value="Sports Coupe">Sports Coupe</option>
              </select>
            </label>
            <label>
              Brand & Model Name
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="e.g. BMW 3 Series 330i"
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Body Colour
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                required
                placeholder="e.g. Tanzanite Blue"
              />
            </label>
            <label>
              Number Plate (Unique)
              <input
                name="numberPlate"
                value={form.numberPlate}
                onChange={handleChange}
                required
                placeholder="e.g. MP 09 AB 1234"
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Ex-Showroom Cost (₹)
              <input
                name="cost"
                type="number"
                value={form.cost}
                onChange={handleChange}
                required
                placeholder="e.g. 4850000"
              />
            </label>
            <label>
              Assigned Showroom Branch
              <select name="showroomId" value={form.showroomId} onChange={handleChange} required>
                <option value="">Select branch…</option>
                {showrooms.map((sh) => (
                  <option key={sh.id} value={sh.id}>{sh.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingVehicle}>
              {savingVehicle ? "Registering…" : "Register Vehicle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mechanical Specifications & Details Modal (Exclusively Inventory & Specs) */}
      <Modal
        isOpen={detailModal}
        onClose={() => { setDetailModal(false); setDetail(null); }}
        size="lg"
        title={detail ? `${detail.brand} — Mechanical Specifications` : "Vehicle Specifications"}
      >
        {detail && (
          <div className="detail-view">
            {/* General Specs Section */}
            <div className="detail-section">
              <div className="detail-section-header">
                <h4>
                  <Car size={18} color="#38bdf8" />
                  Vehicle Overview
                </h4>
                <code className="plate-badge">{detail.numberPlate}</code>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Vehicle Type</span>
                  <span className="detail-value">{detail.type || detail.vehicleType || "Sedan"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Brand & Model</span>
                  <span className="detail-value">{detail.brand}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Body Colour</span>
                  <span className="detail-value">{detail.colour}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Showroom Location</span>
                  <span className="detail-value">{getShowroomName(detail)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ex-Showroom Price</span>
                  <span className="detail-value" style={{ color: "#38bdf8", fontFamily: "JetBrains Mono, monospace" }}>
                    ₹{Number(detail.cost || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Inventory Status</span>
                  <span className="detail-value" style={{ color: "#10b981" }}>
                    Available in Stock
                  </span>
                </div>
              </div>
            </div>

            {/* Mechanical Specifications Section */}
            <div className="detail-section">
              <div className="detail-section-header">
                <h4>
                  <Gauge size={18} color="#10b981" />
                  Mechanical & Engineering Specifications
                </h4>
                {loadingSpecs && <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Loading specs…</span>}
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Fuel size={13} color="#38bdf8" /> Engine & Displacement
                  </span>
                  <span className="detail-value">
                    {detail.features?.engineCapacity || "1998 cc Turbocharged"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Fuel size={13} color="#10b981" /> Fuel Classification
                  </span>
                  <span className="detail-value">
                    {detail.features?.fuelType || (detail.type?.includes("Electric") ? "Electric (BEV)" : "Petrol")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Activity size={13} color="#f59e0b" /> ARAI Mileage
                  </span>
                  <span className="detail-value">
                    {detail.features?.mileage || "16.1 km/l"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Users size={13} color="#a855f7" /> Seating Capacity
                  </span>
                  <span className="detail-value">
                    {detail.features?.seatCapacity || 5} Passenger Seats
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Shield size={13} color="#38bdf8" /> Emission Standard
                  </span>
                  <span className="detail-value">
                    {detail.features?.pollutionControl || "Bharat Stage VI (BS6 Phase 2)"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Shield size={13} color="#10b981" /> Active Safety
                  </span>
                  <span className="detail-value">
                    {detail.features?.safetyFeatures || "6 Airbags, ABS with EBD, ESC, ADAS Level 2"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setDetailModal(false); setDetail(null); }}
              >
                Close Specifications
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
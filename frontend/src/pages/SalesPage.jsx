import { useEffect, useState } from "react";
import {
  getSales,
  createSale,
  deleteSale,
  getCustomers,
  getVehicles,
  getPaymentsBySale,
  createPayment,
} from "../services/api";
import Modal from "../components/Modal";

const emptySale = { customerId: "", vehicleId: "", date: "", target: "", offer: "" };
const emptyPayment = { method: "CASH", amount: "", paymentDate: "" };

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [saleModal, setSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({ ...emptySale });
  const [saving, setSaving] = useState(false);

  const [payModal, setPayModal] = useState(false);
  const [activeSale, setActiveSale] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payForm, setPayForm] = useState({ ...emptyPayment });
  const [payLoading, setPayLoading] = useState(false);

  const loadSales = () => {
    setLoading(true);
    getSales()
      .then((r) => setSales(r.data || []))
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
    getCustomers().then((r) => setCustomers(r.data || [])).catch(() => { });
    getVehicles().then((r) => setVehicles(r.data || [])).catch(() => { });
  }, []);

  const handleSaleChange = (e) =>
    setSaleForm({ ...saleForm, [e.target.name]: e.target.value });

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        customerId: parseInt(saleForm.customerId),
        vehicleId: parseInt(saleForm.vehicleId),
        date: saleForm.date,
        target: parseFloat(saleForm.target),
        quantity: 1,
        offer: saleForm.offer || "Standard Delivery",
      };
      await createSale(payload);
      setSaleForm({ ...emptySale });
      setSaleModal(false);
      loadSales();
    } catch {
      alert("Failed to record sale. Ensure vehicle is not already sold.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sale record?")) return;
    try {
      await deleteSale(id);
      loadSales();
    } catch {
      alert("Failed to delete sale");
    }
  };

  const openPayments = async (sale) => {
    setActiveSale(sale);
    setPayModal(true);
    setPayLoading(true);
    try {
      const r = await getPaymentsBySale(sale.id);
      setPayments(r.data || []);
    } catch {
      setPayments([]);
    } finally {
      setPayLoading(false);
    }
  };

  const handlePayChange = (e) =>
    setPayForm({ ...payForm, [e.target.name]: e.target.value });

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!activeSale) return;
    try {
      await createPayment({
        saleId: activeSale.id,
        customerId: activeSale.customerId,
        method: payForm.method,
        amount: parseFloat(payForm.amount),
        paymentDate: payForm.paymentDate,
      });
      setPayForm({ ...emptyPayment });
      const r = await getPaymentsBySale(activeSale.id);
      setPayments(r.data || []);
    } catch {
      alert("Failed to record payment");
    }
  };

  const getCustomerName = (s) => {
    if (s.customerName) return s.customerName;
    if (s.customer?.firstName) {
      return `${s.customer.firstName} ${s.customer.lastName || ""}`.trim();
    }
    if (s.customerId) {
      const c = customers.find((c) => c.id === s.customerId);
      return c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : `#${s.customerId}`;
    }
    return "—";
  };

  const getVehicleLabel = (s) => {
    if (s.vehicleNumberPlate) return s.vehicleNumberPlate;
    if (s.vehicle?.brand) return `${s.vehicle.brand} (${s.vehicle.numberPlate || ""})`;
    if (s.vehicleId) {
      const v = vehicles.find((v) => v.id === s.vehicleId);
      return v ? `${v.brand} (${v.numberPlate})` : `#${s.vehicleId}`;
    }
    return "—";
  };

  const getShowroomName = (s) => {
    if (s.showroomName) return s.showroomName;
    const v = vehicles.find((v) => v.id === s.vehicleId || v.numberPlate === s.vehicleNumberPlate);
    return v?.showroomName || (v?.showroom ? v.showroom.name : "—");
  };

  // Real-time Search Filter
  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    const cust = getCustomerName(s).toLowerCase();
    const veh = getVehicleLabel(s).toLowerCase();
    const sh = getShowroomName(s).toLowerCase();
    const offer = (s.offer || "").toLowerCase();
    const date = (s.date || s.saleDate || "").toLowerCase();
    return cust.includes(term) || veh.includes(term) || sh.includes(term) || offer.includes(term) || date.includes(term);
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sales & Payments</h1>
          <p className="subtitle">Track deals, showroom branches, and payment records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setSaleModal(true)}>
          + New Sale
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search customer, vehicle plate, showroom, offer, date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "480px",
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
      ) : filteredSales.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💰</span>
          <p>{searchTerm ? "No matching sales found." : "No sales recorded yet."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Showroom</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Target Price</th>
                <th>Offer / Scheme</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s, i) => (
                <tr key={s.id || i}>
                  <td className="text-muted">{s.id || i + 1}</td>
                  <td className="fw-medium">{getVehicleLabel(s)}</td>
                  <td>
                    <span className="badge badge-info">{getShowroomName(s)}</span>
                  </td>
                  <td>{getCustomerName(s)}</td>
                  <td>{s.date || s.saleDate || "—"}</td>
                  <td>₹{Number(s.target || s.targetPrice || 0).toLocaleString("en-IN")}</td>
                  <td>
                    <span className="badge badge-success">
                      {s.offer || "No Offer"}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openPayments(s)}
                      >
                        💳 Payments
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(s.id)}
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

      {/* New Sale Modal */}
      <Modal
        isOpen={saleModal}
        onClose={() => setSaleModal(false)}
        title="Record New Sale"
      >
        <form onSubmit={handleSaleSubmit} className="form">
          <label>
            Customer
            <select name="customerId" value={saleForm.customerId} onChange={handleSaleChange} required>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName ? `${c.firstName} ${c.lastName || ""}` : c.name || `Customer #${c.id}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vehicle
            <select name="vehicleId" value={saleForm.vehicleId} onChange={handleSaleChange} required>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} — {v.numberPlate} (₹{Number(v.cost || 0).toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </label>
          <label>
            Sale Date
            <input name="date" type="date" value={saleForm.date} onChange={handleSaleChange} required />
          </label>
          <label>
            Target Price (₹)
            <input name="target" type="number" value={saleForm.target} onChange={handleSaleChange} required />
          </label>
          <label>
            Offer / Scheme Applied
            <input
              name="offer"
              type="text"
              placeholder="e.g. Festival Cash Discount"
              value={saleForm.offer}
              onChange={handleSaleChange}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setSaleModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Record Sale"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payments Modal */}
      <Modal
        isOpen={payModal}
        onClose={() => { setPayModal(false); setActiveSale(null); setPayments([]); }}
        title={`Payments for Sale #${activeSale?.id || ""}`}
      >
        {payLoading ? (
          <div className="loader">Loading payments…</div>
        ) : (
          <>
            {payments.length > 0 ? (
              <div className="table-wrapper compact">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={p.id || i}>
                        <td>
                          <span className={`badge ${(p.method || p.paymentMode) === "CASH" ? "badge-success" :
                              (p.method || p.paymentMode) === "LOAN" ? "badge-warning" :
                                "badge-info"
                            }`}>
                            {p.method || p.paymentMode}
                          </span>
                        </td>
                        <td>₹{Number(p.amount || 0).toLocaleString("en-IN")}</td>
                        <td>{p.paymentDate || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted" style={{ textAlign: "center", padding: "1rem" }}>
                No payments recorded yet.
              </p>
            )}

            <hr className="divider" />
            <h4 style={{ marginBottom: "0.75rem" }}>Add Payment</h4>
            <form onSubmit={handlePaySubmit} className="form">
              <div className="form-grid">
                <label>
                  Payment Method
                  <select name="method" value={payForm.method} onChange={handlePayChange} required>
                    <option value="CASH">Cash</option>
                    <option value="LOAN">Loan</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </label>
                <label>
                  Amount (₹)
                  <input name="amount" type="number" value={payForm.amount} onChange={handlePayChange} required />
                </label>
              </div>
              <label>
                Payment Date
                <input name="paymentDate" type="date" value={payForm.paymentDate} onChange={handlePayChange} required />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Record Payment</button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
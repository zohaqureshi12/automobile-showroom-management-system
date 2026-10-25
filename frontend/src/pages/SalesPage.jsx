import { useEffect, useState } from "react";
import {
  getSales,
  createSale,
  deleteSale,
  getCustomers,
  getVehicles,
  getShowrooms,
  getPaymentsBySale,
  createPayment,
  getTaxByVehicle,
  createTax,
  updateTax,
  getInsuranceByVehicle,
  createInsurance,
  updateInsurance,
  fireToast,
} from "../services/api";
import Modal from "../components/Modal";
import {
  FileText,
  CreditCard,
  Trash2,
  Printer,
  Plus,
  Tag,
  Car,
  Receipt,
  ShieldCheck,
  Edit3,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";

const emptySale = { customerId: "", showroomId: "", vehicleId: "", date: "", target: "", offer: "" };
const emptyPayment = { method: "CASH", amount: "", paymentDate: "" };
const emptyTax = { vehicleTax: "", roadTax: "", paid: true };
const emptyInsurance = { expiryDate: "", familyDetails: "", bankDetails: "" };

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [selectedShowroomFilter, setSelectedShowroomFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // New Sale Modal State
  const [saleModal, setSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({ ...emptySale });
  const [saving, setSaving] = useState(false);

  // Payments Modal State
  const [payModal, setPayModal] = useState(false);
  const [activeSale, setActiveSale] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payForm, setPayForm] = useState({ ...emptyPayment });
  const [payLoading, setPayLoading] = useState(false);

  // Invoice & Compliance Drawer State
  const [complianceModal, setComplianceModal] = useState(false);
  const [activeDrawerSale, setActiveDrawerSale] = useState(null);
  const [complianceTab, setComplianceTab] = useState("invoice"); // 'invoice' | 'compliance'

  // Tax State for Active Sale
  const [taxData, setTaxData] = useState(null);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [taxForm, setTaxForm] = useState({ ...emptyTax });
  const [savingTax, setSavingTax] = useState(false);

  // Insurance State for Active Sale
  const [insuranceData, setInsuranceData] = useState(null);
  const [isEditingInsurance, setIsEditingInsurance] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState({ ...emptyInsurance });
  const [savingInsurance, setSavingInsurance] = useState(false);

  const [loadingCompliance, setLoadingCompliance] = useState(false);

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
    getShowrooms().then((r) => setShowrooms(r.data || [])).catch(() => { });
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
      fireToast("Sale recorded successfully!", "success");
      loadSales();
    } catch {
      alert("Failed to record sale. Ensure vehicle is not already sold.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sale record?")) return;
    try {
      await deleteSale(id);
      fireToast("Sale record deleted", "info");
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
      fireToast("Payment logged successfully!", "success");
      const r = await getPaymentsBySale(activeSale.id);
      setPayments(r.data || []);
    } catch {
      alert("Failed to record payment");
    }
  };

  // Open Invoice & Compliance Drawer
  const openInvoiceAndCompliance = async (sale) => {
    setActiveDrawerSale(sale);
    setComplianceModal(true);
    setComplianceTab("invoice");
    setIsEditingTax(false);
    setIsEditingInsurance(false);
    setLoadingCompliance(true);

    const vehicleId = sale.vehicleId || sale.vehicle?.id;

    if (vehicleId) {
      try {
        const taxRes = await getTaxByVehicle(vehicleId);
        setTaxData(taxRes.data);
        setTaxForm({
          vehicleTax: taxRes.data.vehicleTax || "",
          roadTax: taxRes.data.roadTax || "",
          paid: taxRes.data.paid ?? true,
        });
      } catch {
        setTaxData(null);
        setTaxForm({ ...emptyTax });
      }

      try {
        const insRes = await getInsuranceByVehicle(vehicleId);
        setInsuranceData(insRes.data);
        setInsuranceForm({
          expiryDate: insRes.data.expiryDate || "",
          familyDetails: insRes.data.familyDetails || "",
          bankDetails: insRes.data.bankDetails || "",
        });
      } catch {
        setInsuranceData(null);
        setInsuranceForm({ ...emptyInsurance });
      }
    } else {
      setTaxData(null);
      setInsuranceData(null);
    }

    setLoadingCompliance(false);
  };

  // Tax Save / Update Handler inside Invoice & Compliance Drawer
  const handleSaveTax = async (e) => {
    e.preventDefault();
    const vehicleId = activeDrawerSale?.vehicleId || activeDrawerSale?.vehicle?.id;
    if (!vehicleId) return;

    setSavingTax(true);
    try {
      const payload = {
        vehicleTax: parseFloat(taxForm.vehicleTax || 0),
        roadTax: parseFloat(taxForm.roadTax || 0),
        paid: taxForm.paid === true || taxForm.paid === "true",
      };

      if (taxData && taxData.id) {
        const res = await updateTax(vehicleId, payload);
        setTaxData(res.data);
        fireToast("Road tax record updated successfully!", "success");
      } else {
        const res = await createTax(vehicleId, payload);
        setTaxData(res.data);
        fireToast("Road tax record created successfully!", "success");
      }
      setIsEditingTax(false);
    } catch (err) {
      alert("Failed to save tax record. " + (err.response?.data?.message || ""));
    } finally {
      setSavingTax(false);
    }
  };

  // Insurance Save / Update Handler inside Invoice & Compliance Drawer
  const handleSaveInsurance = async (e) => {
    e.preventDefault();
    const vehicleId = activeDrawerSale?.vehicleId || activeDrawerSale?.vehicle?.id;
    if (!vehicleId) return;

    setSavingInsurance(true);
    try {
      const payload = {
        expiryDate: insuranceForm.expiryDate,
        familyDetails: insuranceForm.familyDetails,
        bankDetails: insuranceForm.bankDetails,
      };

      if (insuranceData && insuranceData.id) {
        const res = await updateInsurance(vehicleId, payload);
        setInsuranceData(res.data);
        fireToast("Insurance policy updated successfully!", "success");
      } else {
        const res = await createInsurance(vehicleId, payload);
        setInsuranceData(res.data);
        fireToast("Insurance policy attached successfully!", "success");
      }
      setIsEditingInsurance(false);
    } catch (err) {
      alert("Failed to save insurance policy. " + (err.response?.data?.message || ""));
    } finally {
      setSavingInsurance(false);
    }
  };

  const getCustomerObj = (s) => {
    const cId = s.customerId || s.customer?.id;
    return customers.find((c) => c.id === cId) || s.customer || null;
  };

  const getCustomerName = (s) => {
    if (s.customerName) return s.customerName;
    const c = getCustomerObj(s);
    if (c) {
      if (c.name) return c.name;
      const parts = [c.firstName, c.middleName, c.lastName].filter(Boolean);
      if (parts.length > 0) return parts.join(" ");
    }
    return s.customerId ? `Customer #${s.customerId}` : "—";
  };

  const getVehicleObj = (s) => {
    const vId = s.vehicleId || s.vehicle?.id;
    return vehicles.find((v) => v.id === vId || v.numberPlate === s.vehicleNumberPlate) || s.vehicle || null;
  };

  const getVehicleLabel = (s) => {
    if (s.vehicleNumberPlate) return s.vehicleNumberPlate;
    const v = getVehicleObj(s);
    if (v) return `${v.brand} (${v.numberPlate})`;
    return s.vehicleId ? `Vehicle #${s.vehicleId}` : "—";
  };

  const getVehiclePlate = (s) => {
    if (s.vehicleNumberPlate) return s.vehicleNumberPlate;
    const v = getVehicleObj(s);
    return v?.numberPlate || "—";
  };

  const getShowroomName = (s) => {
    if (s.showroomName) return s.showroomName;
    const v = getVehicleObj(s);
    return v?.showroomName || (v?.showroom ? v.showroom.name : "Star Auto Dealership");
  };

  const getShowroomId = (s) => {
    if (s.showroomId) return Number(s.showroomId);
    if (s.showroom?.id) return Number(s.showroom.id);
    const v = getVehicleObj(s);
    if (v) {
      if (v.showroomId) return Number(v.showroomId);
      if (v.showroom?.id) return Number(v.showroom.id);
      if (typeof v.showroom === "number") return Number(v.showroom);
    }
    return null;
  };

  // Real-time Search and Showroom Filter
  const filteredSales = sales.filter((s) => {
    // 1. Showroom branch filter
    const matchesShowroom =
      selectedShowroomFilter === "ALL" ||
      s.showroomId == selectedShowroomFilter ||
      s.showroom?.id == selectedShowroomFilter ||
      getShowroomId(s) == selectedShowroomFilter;

    if (!matchesShowroom) return false;

    // 2. Search text filter
    const term = searchTerm.toLowerCase();
    const cust = getCustomerName(s).toLowerCase();
    const veh = getVehicleLabel(s).toLowerCase();
    const sh = getShowroomName(s).toLowerCase();
    const offer = (s.offer || "").toLowerCase();
    const date = (s.date || s.saleDate || "").toLowerCase();

    return (
      cust.includes(term) ||
      veh.includes(term) ||
      sh.includes(term) ||
      offer.includes(term) ||
      date.includes(term)
    );
  });

  // Filter Vehicles for Sale Form to In-Stock Only (+ Showroom filter if selected)
  const soldVehicleIds = new Set(sales.map((s) => s.vehicleId || s.vehicle?.id).filter(Boolean));
  const availableVehicles = vehicles
    .filter((v) => !soldVehicleIds.has(v.id))
    .filter((v) => {
      if (!saleForm.showroomId) return true;
      const sId = v.showroomId || v.showroom?.id || (typeof v.showroom === "number" ? v.showroom : null);
      return sId == saleForm.showroomId;
    });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sales & Invoicing</h1>
          <p className="subtitle">Track completed vehicle deals, payment schedules, and manage statutory Tax & Insurance compliance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setSaleModal(true)}>
          <Plus size={16} />
          Record Sale
        </button>
      </div>

      <div className="search-bar-wrap">
        <input
          type="text"
          placeholder="🔍 Search customer name, vehicle plate, showroom branch, offer, date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedShowroomFilter}
          onChange={(e) => setSelectedShowroomFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Showrooms</option>
          {showrooms.map((sh) => (
            <option key={sh.id} value={sh.id}>
              {sh.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading sales & deal records…</div>
      ) : filteredSales.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💰</span>
          <p>{searchTerm ? "No matching sales records found." : "No sales recorded yet."}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Vehicle & Plate</th>
                <th>Showroom Location</th>
                <th>Purchaser</th>
                <th>Date</th>
                <th>Agreed Price</th>
                <th>Offer / Scheme</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s, i) => (
                <tr key={s.id || i}>
                  <td className="text-muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    #{s.id || i + 1}
                  </td>
                  <td className="fw-medium">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Car size={16} color="#38bdf8" />
                      <span>{getVehicleLabel(s)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{getShowroomName(s)}</span>
                  </td>
                  <td style={{ color: "#ffffff", fontWeight: "600" }}>{getCustomerName(s)}</td>
                  <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{s.date || s.saleDate || "—"}</td>
                  <td className="fw-bold" style={{ color: "#38bdf8", fontFamily: "JetBrains Mono, monospace" }}>
                    ₹{Number(s.target || s.targetPrice || 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className="badge badge-success">
                      <Tag size={12} /> {s.offer || "Standard Delivery"}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      {/* Invoice & Compliance Button */}
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openInvoiceAndCompliance(s)}
                        title="View Official Invoice, Road Tax & Insurance"
                      >
                        <FileText size={14} /> Invoice & Compliance
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openPayments(s)}
                        title="View / Record Payment Transactions"
                      >
                        <CreditCard size={14} /> Payments
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(s.id)}
                        title="Delete sale record"
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

      {/* New Sale Modal */}
      <Modal
        isOpen={saleModal}
        onClose={() => setSaleModal(false)}
        title="Record New Dealership Sale"
      >
        <form onSubmit={handleSaleSubmit} className="form">
          <div className="form-grid">
            <label>
              Customer
              <select name="customerId" value={saleForm.customerId} onChange={handleSaleChange} required>
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName ? `${c.firstName} ${c.lastName || ""}` : c.name || `Customer #${c.id}`} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Showroom Branch (Filters In-Stock Units)
              <select
                name="showroomId"
                value={saleForm.showroomId}
                onChange={(e) => setSaleForm({ ...saleForm, showroomId: e.target.value, vehicleId: "" })}
              >
                <option value="">All Branches</option>
                {showrooms.map((sh) => (
                  <option key={sh.id} value={sh.id}>{sh.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Vehicle to Sell (In-Stock Only)
            <select
              name="vehicleId"
              value={saleForm.vehicleId}
              onChange={(e) => {
                const selectedV = vehicles.find((item) => item.id == e.target.value);
                setSaleForm({
                  ...saleForm,
                  vehicleId: e.target.value,
                  target: saleForm.target || (selectedV?.cost ? selectedV.cost.toString() : ""),
                });
              }}
              required
            >
              <option value="">Select in-stock vehicle…</option>
              {availableVehicles.length === 0 ? (
                <option value="" disabled>No vehicles currently in stock</option>
              ) : (
                availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} — {v.numberPlate} (₹{Number(v.cost || 0).toLocaleString("en-IN")})
                  </option>
                ))
              )}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Sale Date
              <input name="date" type="date" value={saleForm.date} onChange={handleSaleChange} required />
            </label>
            <label>
              Target Sale Price (₹)
              <input
                name="target"
                type="number"
                value={saleForm.target}
                onChange={handleSaleChange}
                required
                placeholder="e.g. 1500000"
              />
            </label>
          </div>
          <label>
            Offer / Scheme Applied
            <input
              name="offer"
              type="text"
              placeholder="e.g. Corporate Discount + Free 1st Year Roadside Assist"
              value={saleForm.offer}
              onChange={handleSaleChange}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setSaleModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Recording…" : "Confirm Sale"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payments Modal */}
      <Modal
        isOpen={payModal}
        onClose={() => { setPayModal(false); setActiveSale(null); setPayments([]); }}
        title={`Payment Ledger for Deal #${activeSale?.id || ""}`}
      >
        {payLoading ? (
          <div className="loader">Loading ledger…</div>
        ) : (
          <>
            {payments.length > 0 ? (
              <div className="table-wrapper compact">
                <table>
                  <thead>
                    <tr>
                      <th>Mode</th>
                      <th>Amount Paid</th>
                      <th>Payment Date</th>
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
                        <td className="fw-bold" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="text-muted">{p.paymentDate || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted" style={{ textAlign: "center", padding: "1.25rem" }}>
                No payments logged yet for this sale.
              </p>
            )}

            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "1.5rem 0" }} />
            <h4 style={{ color: "#fff", marginBottom: "0.85rem", fontSize: "0.95rem" }}>Log New Payment</h4>
            <form onSubmit={handlePaySubmit} className="form">
              <div className="form-grid">
                <label>
                  Payment Method
                  <select name="method" value={payForm.method} onChange={handlePayChange} required>
                    <option value="CASH">Cash</option>
                    <option value="LOAN">Auto Loan / Financing</option>
                    <option value="CHEQUE">Bank Cheque / DD</option>
                    <option value="NEFT_RTGS_UPI">NEFT / RTGS / UPI</option>
                  </select>
                </label>
                <label>
                  Amount (₹)
                  <input name="amount" type="number" value={payForm.amount} onChange={handlePayChange} required placeholder="e.g. 500000" />
                </label>
              </div>
              <label>
                Payment Date
                <input name="paymentDate" type="date" value={payForm.paymentDate} onChange={handlePayChange} required />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Log Payment</button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Invoice & Compliance Drawer Modal */}
      <Modal
        isOpen={complianceModal}
        onClose={() => { setComplianceModal(false); setActiveDrawerSale(null); }}
        size="lg"
        title={activeDrawerSale ? `Deal #${activeDrawerSale.id} — Invoice & Compliance Management` : "Invoice & Compliance"}
      >
        {activeDrawerSale && (
          <div>
            {/* Drawer Tab Navigation */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", marginBottom: "16px" }}>
              <button
                className={`btn btn-sm ${complianceTab === "invoice" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setComplianceTab("invoice")}
              >
                <FileText size={14} /> Printable Tax Invoice
              </button>
              <button
                className={`btn btn-sm ${complianceTab === "compliance" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setComplianceTab("compliance")}
              >
                <ShieldCheck size={14} /> Tax & Insurance Compliance
              </button>
            </div>

            {/* TAB 1: PRINTABLE TAX INVOICE VIEW */}
            {complianceTab === "invoice" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const invoice = document.getElementById("printable-tax-invoice");
                      if (!invoice) return;

                      const printWindow = window.open("", "_blank", "width=900,height=700");
                      if (!printWindow) {
                        alert("Please allow pop-ups to print the invoice.");
                        return;
                      }

                      printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: Arial, sans-serif;
            color: #0f172a;
            background: white;
            margin: 0;
          }
          .invoice-card {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
            border-radius: 0;
            color: #0f172a;
            background: white;
          }
          * { box-sizing: border-box; }
          table { width: 100%; border-collapse: collapse; }
          tr { break-inside: avoid; }
        </style>
      </head>
      <body>${invoice.outerHTML}</body>
    </html>
  `);

                      printWindow.document.close();
                      printWindow.onload = () => {
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                      };
                    }}
                    style={{ gap: "8px" }}
                  >
                    <Printer size={16} /> Print Tax Invoice
                  </button>
                </div>

                <div className="invoice-card" id="printable-tax-invoice">
                  {/* Header */}
                  <div className="invoice-header">
                    <div>
                      <div className="dealership-title">AUTOSHOWROOM ENTERPRISE</div>
                      <div className="dealership-tagline">Automobile Dealership & Authorized Service Network</div>
                      <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "4px" }}>
                        GSTIN: <strong>23AAACA1234F1Z5</strong> • CIN: U50100MP2024PTC012345
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                        Branch: <strong>{getShowroomName(activeDrawerSale)}</strong>
                      </div>
                    </div>
                    <div className="invoice-title-block">
                      <div className="invoice-title">TAX INVOICE</div>
                      <div className="invoice-number">
                        INV-{String(activeDrawerSale.id || "001").padStart(6, "0")}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                        Date: <strong>{activeDrawerSale.date || activeDrawerSale.saleDate || "Current"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Customer / Vehicle Grid */}
                  <div className="invoice-grid">
                    <div>
                      <div className="invoice-section-title">Billed To (Purchaser)</div>
                      <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "1rem" }}>
                        {getCustomerName(activeDrawerSale)}
                      </div>
                      {(() => {
                        const c = getCustomerObj(activeDrawerSale);
                        return c ? (
                          <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px", lineHeight: "1.4" }}>
                            {c.phone && <div>Phone: {c.phone}</div>}
                            {c.email && <div>Email: {c.email}</div>}
                            {c.address && <div>Address: {c.address}</div>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div>
                      <div className="invoice-section-title">Sold Vehicle & Unit Details</div>
                      <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "1rem" }}>
                        {getVehicleLabel(activeDrawerSale)}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px" }}>
                        <div>Registration Plate: <strong>{getVehiclePlate(activeDrawerSale)}</strong></div>
                        <div>Showroom Branch: {getShowroomName(activeDrawerSale)}</div>
                        <div>Delivery Scheme: {activeDrawerSale.offer || "Standard Delivery"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th>HSN / SAC</th>
                        <th>Coverage / Status</th>
                        <th style={{ textAlign: "right" }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>
                          <strong>{getVehicleLabel(activeDrawerSale)}</strong>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            Ex-Showroom Base Vehicle Unit • Registration: {getVehiclePlate(activeDrawerSale)}
                          </div>
                        </td>
                        <td>8703</td>
                        <td>1 Unit Sold</td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ₹{Math.round((Number(activeDrawerSale.target || activeDrawerSale.targetPrice || 0) / 1.28)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Central GST (CGST @ 14%)</td>
                        <td>9983</td>
                        <td>Statutory Levy</td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ₹{Math.round((Number(activeDrawerSale.target || activeDrawerSale.targetPrice || 0) * 0.14)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>State GST (SGST @ 14%)</td>
                        <td>9983</td>
                        <td>Statutory Levy</td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ₹{Math.round((Number(activeDrawerSale.target || activeDrawerSale.targetPrice || 0) * 0.14)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>
                          <strong>State Road Tax & RTO Registration</strong>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {taxData ? `Vehicle Tax: ₹${Number(taxData.vehicleTax || 0).toLocaleString("en-IN")} • Road Tax: ₹${Number(taxData.roadTax || 0).toLocaleString("en-IN")}` : "Direct RTO Clearance"}
                          </div>
                        </td>
                        <td>9991</td>
                        <td>
                          <span style={{ fontWeight: "600", color: taxData?.paid ? "#059669" : "#d97706" }}>
                            {taxData ? (taxData.paid ? "PAID" : "PENDING") : "Included in OTR"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ₹{Number(taxData?.roadTax || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>
                          <strong>Comprehensive Motor Insurance Policy</strong>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {insuranceData ? `Policy: ${insuranceData.bankDetails || "Comprehensive Coverage"} • Exp: ${insuranceData.expiryDate || "1 Year"}` : "Standard 1st Year Comprehensive Policy"}
                          </div>
                        </td>
                        <td>9971</td>
                        <td>
                          <span style={{ fontWeight: "600", color: "#0284c7" }}>
                            {insuranceData ? `Nominee: ${insuranceData.familyDetails || "Primary"}` : "Active"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          Included
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Summary */}
                  <div className="invoice-summary">
                    <div className="invoice-summary-box">
                      <div className="invoice-summary-row">
                        <span>Base Vehicle Cost:</span>
                        <span>₹{Math.round(Number(activeDrawerSale.target || 0) / 1.28).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="invoice-summary-row">
                        <span>Combined GST (28%):</span>
                        <span>₹{Math.round(Number(activeDrawerSale.target || 0) * 0.28).toLocaleString("en-IN")}</span>
                      </div>
                      {taxData && taxData.roadTax > 0 && (
                        <div className="invoice-summary-row">
                          <span>Road Tax Levy:</span>
                          <span>₹{Number(taxData.roadTax).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {activeDrawerSale.offer && (
                        <div className="invoice-summary-row" style={{ color: "#059669" }}>
                          <span>Offer / Scheme:</span>
                          <span>{activeDrawerSale.offer}</span>
                        </div>
                      )}
                      <div className="invoice-summary-row total">
                        <span>Total Payable Target:</span>
                        <span>₹{Number(activeDrawerSale.target || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="invoice-footer">
                    <div>
                      <div style={{ fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Terms & Conditions:</div>
                      <ol style={{ paddingLeft: "16px", lineHeight: "1.4" }}>
                        <li>All vehicles carry manufacturer standard warranty.</li>
                        <li>Goods once sold are subject to standard dealership terms.</li>
                        <li>This is a computer-generated tax invoice.</li>
                      </ol>
                    </div>
                    <div className="invoice-signature">
                      <div className="signature-line" />
                      <div>Authorized Signatory</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>AutoShowroom Management</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TAX & INSURANCE COMPLIANCE MANAGEMENT */}
            {complianceTab === "compliance" && (
              <div className="detail-view">
                {loadingCompliance ? (
                  <div className="loader">Loading compliance records…</div>
                ) : (
                  <>
                    {/* Tax Section */}
                    <div className="detail-section">
                      <div className="detail-section-header">
                        <h4>
                          <Receipt size={18} color="#f59e0b" />
                          Road Tax & RTO Filing
                        </h4>
                        {taxData && !isEditingTax && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setIsEditingTax(true);
                              setTaxForm({
                                vehicleTax: taxData.vehicleTax || "",
                                roadTax: taxData.roadTax || "",
                                paid: taxData.paid ?? true,
                              });
                            }}
                          >
                            <Edit3 size={14} /> Edit Tax
                          </button>
                        )}
                      </div>

                      {taxData && !isEditingTax ? (
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Vehicle Tax</span>
                            <span className="detail-value" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                              ₹{Number(taxData.vehicleTax || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">State Road Tax</span>
                            <span className="detail-value" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                              ₹{Number(taxData.roadTax || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Payment Status</span>
                            <div>
                              {taxData.paid ? (
                                <span className="badge badge-success">
                                  <CheckCircle size={12} /> PAID
                                </span>
                              ) : (
                                <span className="badge badge-warning">
                                  <AlertCircle size={12} /> PENDING
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Combined Tax</span>
                            <span className="detail-value" style={{ color: "#10b981", fontFamily: "JetBrains Mono, monospace" }}>
                              ₹{(Number(taxData.vehicleTax || 0) + Number(taxData.roadTax || 0)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: "0.85rem" }}>
                            {taxData ? "Update registered Road Tax details for this vehicle:" : "No road tax record found for this sold unit. File tax details below:"}
                          </p>
                          <form onSubmit={handleSaveTax}>
                            <div className="form-grid-3">
                              <label>
                                Vehicle Tax (₹)
                                <input
                                  type="number"
                                  placeholder="e.g. 18500"
                                  value={taxForm.vehicleTax}
                                  onChange={(e) => setTaxForm({ ...taxForm, vehicleTax: e.target.value })}
                                  required
                                />
                              </label>
                              <label>
                                State Road Tax (₹)
                                <input
                                  type="number"
                                  placeholder="e.g. 42000"
                                  value={taxForm.roadTax}
                                  onChange={(e) => setTaxForm({ ...taxForm, roadTax: e.target.value })}
                                  required
                                />
                              </label>
                              <label>
                                Tax Status
                                <select
                                  value={taxForm.paid ? "true" : "false"}
                                  onChange={(e) => setTaxForm({ ...taxForm, paid: e.target.value === "true" })}
                                >
                                  <option value="true">PAID</option>
                                  <option value="false">PENDING</option>
                                </select>
                              </label>
                            </div>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "1rem" }}>
                              {taxData && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setIsEditingTax(false)}
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={savingTax}
                              >
                                {savingTax ? "Saving…" : taxData ? "Update Tax Record" : "+ Add Road Tax"}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Insurance Section */}
                    <div className="detail-section">
                      <div className="detail-section-header">
                        <h4>
                          <ShieldCheck size={18} color="#10b981" />
                          Insurance Policy Coverage
                        </h4>
                        {insuranceData && !isEditingInsurance && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setIsEditingInsurance(true);
                              setInsuranceForm({
                                expiryDate: insuranceData.expiryDate || "",
                                familyDetails: insuranceData.familyDetails || "",
                                bankDetails: insuranceData.bankDetails || "",
                              });
                            }}
                          >
                            <Edit3 size={14} /> Edit Policy
                          </button>
                        )}
                      </div>

                      {insuranceData && !isEditingInsurance ? (
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Policy Expiry Date</span>
                            <span className="detail-value" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Calendar size={14} color="#10b981" />
                              {insuranceData.expiryDate || "—"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Nominee / Family Details</span>
                            <span className="detail-value" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <User size={14} color="#38bdf8" />
                              {insuranceData.familyDetails || "—"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Bank & Provider Details</span>
                            <span className="detail-value" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <CreditCard size={14} color="#f59e0b" />
                              {insuranceData.bankDetails || "—"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Policy Status</span>
                            <div>
                              <span className="badge badge-success">
                                <CheckCircle size={12} /> ACTIVE POLICY
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: "0.85rem" }}>
                            {insuranceData ? "Update insurance policy information:" : "No policy currently bound to this vehicle. Register policy below:"}
                          </p>
                          <form onSubmit={handleSaveInsurance}>
                            <div className="form-grid-3">
                              <label>
                                Policy Expiry Date
                                <input
                                  type="date"
                                  value={insuranceForm.expiryDate}
                                  onChange={(e) => setInsuranceForm({ ...insuranceForm, expiryDate: e.target.value })}
                                  required
                                />
                              </label>
                              <label>
                                Nominee / Family Details
                                <input
                                  type="text"
                                  placeholder="e.g. Sneha Roy (Spouse)"
                                  value={insuranceForm.familyDetails}
                                  onChange={(e) => setInsuranceForm({ ...insuranceForm, familyDetails: e.target.value })}
                                  required
                                />
                              </label>
                              <label>
                                Bank & Provider Details
                                <input
                                  type="text"
                                  placeholder="e.g. HDFC ERGO Comprehensive / Policy #4912"
                                  value={insuranceForm.bankDetails}
                                  onChange={(e) => setInsuranceForm({ ...insuranceForm, bankDetails: e.target.value })}
                                  required
                                />
                              </label>
                            </div>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "1rem" }}>
                              {insuranceData && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setIsEditingInsurance(false)}
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={savingInsurance}
                              >
                                {savingInsurance ? "Saving…" : insuranceData ? "Update Policy" : "+ Add Insurance Policy"}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
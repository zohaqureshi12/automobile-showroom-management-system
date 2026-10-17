import { useEffect, useState } from "react";
import {
  getSales,
  getVehicles,
  getServices,
  getShowrooms,
  getCustomers,
} from "../services/api";
import Modal from "../components/Modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#06b6d4", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#6366f1"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [breakdownModal, setBreakdownModal] = useState(false);
  const [breakdownType, setBreakdownType] = useState("");
  const [selectedShowroom, setSelectedShowroom] = useState(null);

  useEffect(() => {
    Promise.all([
      getSales().catch(() => ({ data: [] })),
      getVehicles().catch(() => ({ data: [] })),
      getServices().catch(() => ({ data: [] })),
      getShowrooms().catch(() => ({ data: [] })),
      getCustomers().catch(() => ({ data: [] })),
    ]).then(([resSales, resVehicles, resServices, resShowrooms, resCustomers]) => {
      setSales(resSales.data || []);
      setVehicles(resVehicles.data || []);
      setServices(resServices.data || []);
      setShowrooms(resShowrooms.data || []);
      setCustomers(resCustomers.data || []);
      setLoading(false);
    });
  }, []);

  const getShowroomId = (item, type = "vehicle") => {
    if (item.showroomId) return Number(item.showroomId);
    if (item.showroom?.id) return Number(item.showroom.id);
    if (typeof item.showroom === "number") return item.showroom;

    if (type === "sale") {
      const v = vehicles.find(
        (veh) => veh.id === item.vehicleId || veh.numberPlate === item.vehicleNumberPlate
      );
      if (v) return getShowroomId(v, "vehicle");
    }
    return null;
  };

  const totalSalesRevenue = sales.reduce(
    (acc, s) => acc + Number(s.target || s.targetPrice || 0),
    0
  );
  const totalServiceRevenue = services.reduce(
    (acc, s) => acc + Number(s.price || 0),
    0
  );
  const totalRevenue = totalSalesRevenue + totalServiceRevenue;

  const soldVehicleIds = new Set(
    sales.map((s) => s.vehicleId || s.vehicle?.id).filter(Boolean)
  );
  const inStockVehicles = vehicles.filter((v) => !soldVehicleIds.has(v.id));

  const revenueByShowroomMap = {};
  showrooms.forEach((sh) => {
    revenueByShowroomMap[sh.id] = 0;
  });

  sales.forEach((s) => {
    const sId = getShowroomId(s, "sale");
    if (sId) {
      revenueByShowroomMap[sId] =
        (revenueByShowroomMap[sId] || 0) + Number(s.target || s.targetPrice || 0);
    }
  });

  services.forEach((srv) => {
    const sId = getShowroomId(srv, "service");
    if (sId) {
      revenueByShowroomMap[sId] =
        (revenueByShowroomMap[sId] || 0) + Number(srv.price || 0);
    }
  });

  const barChartData = showrooms.map((sh) => {
    const rev = revenueByShowroomMap[sh.id] || 0;
    return {
      name: sh.name.replace(" Showroom", "").replace(" Motors", ""),
      fullName: sh.name,
      revenue: Math.round((rev / 100000) * 10) / 10,
      rawRevenue: rev,
    };
  });

  const brandSalesMap = {};
  sales.forEach((s) => {
    let brand = "Other";
    const v = vehicles.find(
      (veh) => veh.id === s.vehicleId || veh.numberPlate === s.vehicleNumberPlate
    );
    if (v?.brand) brand = v.brand.split(" ")[0];
    brandSalesMap[brand] = (brandSalesMap[brand] || 0) + 1;
  });

  const pieChartData = Object.entries(brandSalesMap).map(([name, value]) => ({
    name,
    value,
  }));

  const handleCardClick = (type) => {
    setBreakdownType(type);
    setSelectedShowroom(null);
    setBreakdownModal(true);
  };

  const getBreakdownData = () => {
    return showrooms.map((sh) => {
      const shVehicles = vehicles.filter((v) => getShowroomId(v, "vehicle") === sh.id);
      const shSales = sales.filter((s) => getShowroomId(s, "sale") === sh.id);
      const shServices = services.filter((srv) => getShowroomId(srv, "service") === sh.id);

      const rev =
        shSales.reduce((acc, s) => acc + Number(s.target || 0), 0) +
        shServices.reduce((acc, s) => acc + Number(s.price || 0), 0);

      const inStock = shVehicles.filter((v) => !soldVehicleIds.has(v.id)).length;

      return {
        id: sh.id,
        name: sh.name,
        manager: sh.manager || "—",
        revenue: rev,
        inStock,
        salesCount: shSales.length,
        servicesCount: shServices.length,
        items: {
          vehicles: shVehicles.filter((v) => !soldVehicleIds.has(v.id)),
          sales: shSales,
          services: shServices,
        },
      };
    });
  };

  const activeDrilldown = selectedShowroom
    ? getBreakdownData().find((sh) => sh.id === selectedShowroom.id)
    : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Executive Dashboard</h1>
          <p className="subtitle">Real-time enterprise performance metrics</p>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading enterprise analytics…</div>
      ) : (
        <>
          <div className="kpi-grid">
            <div
              className="kpi-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick("revenue")}
            >
              <div className="kpi-icon" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
                ₹
              </div>
              <div style={{ flex: 1 }}>
                <div className="kpi-label">TOTAL REVENUE ↗</div>
                <div className="kpi-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  {sales.length} sales + {services.length} services
                </span>
              </div>
            </div>

            <div
              className="kpi-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick("inventory")}
            >
              <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                🚗
              </div>
              <div style={{ flex: 1 }}>
                <div className="kpi-label">IN-STOCK VEHICLES ↗</div>
                <div className="kpi-value">{inStockVehicles.length}</div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  {vehicles.length} total inventory
                </span>
              </div>
            </div>

            <div
              className="kpi-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick("sales")}
            >
              <div className="kpi-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
                🛒
              </div>
              <div style={{ flex: 1 }}>
                <div className="kpi-label">COMPLETED SALES ↗</div>
                <div className="kpi-value">{sales.length}</div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  across {showrooms.length} showrooms
                </span>
              </div>
            </div>

            <div
              className="kpi-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick("services")}
            >
              <div className="kpi-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                🔧
              </div>
              <div style={{ flex: 1 }}>
                <div className="kpi-label">SERVICE TICKETS ↗</div>
                <div className="kpi-value">{services.length}</div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  active maintenance tickets
                </span>
              </div>
            </div>
          </div>

          <div className="charts-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "20px", marginTop: "24px" }}>
            <div className="chart-card" style={{ background: "#111827", padding: "24px", borderRadius: "16px", border: "1px solid #1f2937" }}>
              <h3 style={{ marginBottom: "16px", fontSize: "1.05rem" }}>Revenue by Showroom (₹ in Lakhs)</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} unit="L" />
                    <Tooltip
                      formatter={(val, name, props) => [`₹${props.payload.rawRevenue.toLocaleString("en-IN")}`, "Total Revenue"]}
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card" style={{ background: "#111827", padding: "24px", borderRadius: "16px", border: "1px solid #1f2937" }}>
              <h3 style={{ marginBottom: "16px", fontSize: "1.05rem" }}>Sales by Vehicle Brand</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData.length > 0 ? pieChartData : [{ name: "No Sales", value: 1 }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Showroom-wise Breakdown Modal */}
      <Modal
        isOpen={breakdownModal}
        onClose={() => {
          setBreakdownModal(false);
          setSelectedShowroom(null);
        }}
        title={
          selectedShowroom
            ? `${selectedShowroom.name}`
            : `Showroom-Wise ${breakdownType === "revenue"
              ? "Revenue Breakdown"
              : breakdownType === "inventory"
                ? "In-Stock Inventory"
                : breakdownType === "sales"
                  ? "Completed Sales"
                  : "Service Tickets"
            }`
        }
      >
        {!selectedShowroom ? (
          <div className="table-wrapper compact">
            <table>
              <thead>
                <tr>
                  <th>Showroom</th>
                  <th>Manager</th>
                  {breakdownType === "revenue" && <th>Revenue Generated</th>}
                  {breakdownType === "inventory" && <th>In Stock</th>}
                  {breakdownType === "sales" && <th>Sales Count</th>}
                  {breakdownType === "services" && <th>Active Tickets</th>}
                </tr>
              </thead>
              <tbody>
                {getBreakdownData().map((sh) => (
                  <tr
                    key={sh.id}
                    style={{ cursor: "pointer", transition: "background 0.2s" }}
                    onClick={() => setSelectedShowroom(sh)}
                    title="Click to view details"
                  >
                    <td className="fw-medium" style={{ color: "#38bdf8" }}>
                      {sh.name}
                    </td>
                    <td className="text-muted">{sh.manager}</td>
                    {breakdownType === "revenue" && (
                      <td className="fw-bold" style={{ color: "#06b6d4" }}>
                        ₹{sh.revenue.toLocaleString("en-IN")}
                      </td>
                    )}
                    {breakdownType === "inventory" && (
                      <td>
                        <span className="badge badge-success">{sh.inStock} Units</span>
                      </td>
                    )}
                    {breakdownType === "sales" && (
                      <td>
                        <span className="badge badge-info">{sh.salesCount} Deals</span>
                      </td>
                    )}
                    {breakdownType === "services" && (
                      <td>
                        <span className="badge badge-warning">{sh.servicesCount} Tickets</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setSelectedShowroom(null)}
              >
                ← Back to Showrooms
              </button>
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                Manager: <strong>{activeDrilldown?.manager}</strong>
              </span>
            </div>

            {breakdownType === "services" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                {activeDrilldown?.items.services.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>No service tickets registered for this branch.</p>
                ) : (
                  activeDrilldown?.items.services.map((srv) => (
                    <div
                      key={srv.id}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h4 style={{ color: "#f8fafc", fontSize: "0.95rem" }}>{srv.issue}</h4>
                        <span className="badge badge-warning">{srv.deliveryDate ? `Due: ${srv.deliveryDate}` : "In Progress"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
                        <span>Logged: {srv.entryDate || "Recent"}</span>
                        <span style={{ fontSize: "1rem", fontWeight: "700", color: "#10b981" }}>
                          ₹{Number(srv.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {breakdownType === "inventory" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", maxHeight: "400px", overflowY: "auto" }}>
                {activeDrilldown?.items.vehicles.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: "center", gridColumn: "1 / -1", padding: "20px" }}>No units in stock at this branch.</p>
                ) : (
                  activeDrilldown?.items.vehicles.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        padding: "14px",
                      }}
                    >
                      <span className="badge badge-info" style={{ marginBottom: "8px" }}>{v.type || v.vehicleType || "Sedan"}</span>
                      <h4 style={{ color: "#ffffff", fontSize: "1rem", marginBottom: "4px" }}>{v.brand}</h4>
                      <code style={{ fontSize: "0.8rem", color: "#38bdf8", display: "block", marginBottom: "8px" }}>{v.numberPlate}</code>
                      <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>
                        ₹{Number(v.cost || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {(breakdownType === "sales" || breakdownType === "revenue") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                {activeDrilldown?.items.sales.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>No completed sales recorded for this branch.</p>
                ) : (
                  activeDrilldown?.items.sales.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.95rem" }}>
                          {s.customerName || `Customer #${s.customerId}`}
                        </span>
                        <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#06b6d4" }}>
                          ₹{Number(s.target || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
                        <span>Unit: <code style={{ color: "#38bdf8" }}>{s.vehicleNumberPlate || "—"}</code> • {s.date || "Completed"}</span>
                        {s.offer && <span className="badge badge-success">{s.offer}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
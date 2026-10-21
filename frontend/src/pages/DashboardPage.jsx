import { useEffect, useState } from "react";
import {
  getSales,
  getVehicles,
  getServices,
  getShowrooms,
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
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Car,
  ShoppingBag,
  Wrench,
  ArrowUpRight,
  Building2,
  ChevronRight,
} from "lucide-react";

const PIE_COLORS = ["#38bdf8", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#6366f1", "#14b8a6"];

// Custom Glassmorphic Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, _label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "12px",
          padding: "10px 14px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {data.fullName}
        </p>
        <p style={{ color: "#38bdf8", fontSize: "1.05rem", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
          ₹{Number(data.rawRevenue || 0).toLocaleString("en-IN")}
        </p>
        <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
          ({data.revenue} Lakhs)
        </span>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "12px",
          padding: "10px 14px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
        }}
      >
        <p style={{ color: "#fff", fontWeight: "600", fontSize: "0.85rem", marginBottom: "2px" }}>
          {data.name}
        </p>
        <p style={{ color: data.payload.fill || "#38bdf8", fontSize: "0.95rem", fontWeight: "700" }}>
          {data.value} {data.value === 1 ? "unit sold" : "units sold"}
        </p>
      </div>
    );
  }
  return null;
};

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [showrooms, setShowrooms] = useState([]);

  const [breakdownModal, setBreakdownModal] = useState(false);
  const [breakdownType, setBreakdownType] = useState("");
  const [selectedShowroom, setSelectedShowroom] = useState(null);

  useEffect(() => {
    Promise.all([
      getSales().catch(() => ({ data: [] })),
      getVehicles().catch(() => ({ data: [] })),
      getServices().catch(() => ({ data: [] })),
      getShowrooms().catch(() => ({ data: [] })),
    ]).then(([resSales, resVehicles, resServices, resShowrooms]) => {
      setSales(resSales.data || []);
      setVehicles(resVehicles.data || []);
      setServices(resServices.data || []);
      setShowrooms(resShowrooms.data || []);
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
      name: sh.name.replace(" Showroom", "").replace(" Motors", "").slice(0, 14),
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
          <p className="subtitle">Real-time enterprise metrics & dealership analytics</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="badge badge-success" style={{ padding: "0.4rem 0.8rem" }}>
            ● Live Sync Active
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading enterprise analytics…</div>
      ) : (
        <>
          {/* 4 Hero KPI Cards */}
          <div className="kpi-grid">
            {/* 1. Total Revenue */}
            <div
              className="kpi-card"
              onClick={() => handleCardClick("revenue")}
              title="Click for Branch Breakdown"
            >
              <div className="kpi-icon" style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.25)" }}>
                <TrendingUp size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="kpi-label">
                  <span>Total Revenue</span>
                  <ArrowUpRight size={14} color="#38bdf8" />
                </div>
                <div className="kpi-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
                <div className="kpi-subtext">
                  <span>{sales.length} sales + {services.length} services</span>
                </div>
              </div>
            </div>

            {/* 2. In-Stock Units */}
            <div
              className="kpi-card"
              onClick={() => handleCardClick("inventory")}
              title="Click for Inventory Breakdown"
            >
              <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.25)" }}>
                <Car size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="kpi-label">
                  <span>In-Stock Units</span>
                  <ArrowUpRight size={14} color="#10b981" />
                </div>
                <div className="kpi-value">{inStockVehicles.length}</div>
                <div className="kpi-subtext">
                  <span>out of {vehicles.length} total units</span>
                </div>
              </div>
            </div>

            {/* 3. Completed Sales */}
            <div
              className="kpi-card"
              onClick={() => handleCardClick("sales")}
              title="Click for Sales Breakdown"
            >
              <div className="kpi-icon" style={{ background: "rgba(168, 85, 247, 0.12)", color: "#a855f7", borderColor: "rgba(168, 85, 247, 0.25)" }}>
                <ShoppingBag size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="kpi-label">
                  <span>Completed Sales</span>
                  <ArrowUpRight size={14} color="#a855f7" />
                </div>
                <div className="kpi-value">{sales.length}</div>
                <div className="kpi-subtext">
                  <span>across {showrooms.length} branch locations</span>
                </div>
              </div>
            </div>

            {/* 4. Service Tickets */}
            <div
              className="kpi-card"
              onClick={() => handleCardClick("services")}
              title="Click for Services Breakdown"
            >
              <div className="kpi-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.25)" }}>
                <Wrench size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="kpi-label">
                  <span>Service Tickets</span>
                  <ArrowUpRight size={14} color="#f59e0b" />
                </div>
                <div className="kpi-value">{services.length}</div>
                <div className="kpi-subtext">
                  <span>active maintenance tickets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Grid */}
          <div className="charts-grid">
            {/* Bar Chart: Revenue by Showroom */}
            <div className="chart-card">
              <h3>
                <span>Branch Revenue Performance (₹ Lakhs)</span>
                <span className="badge badge-info">{showrooms.length} Branches</span>
              </h3>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barCyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} unit="L" tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="revenue" fill="url(#barCyanGrad)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Sales by Vehicle Brand */}
            <div className="chart-card">
              <h3>
                <span>Sales Share by Brand</span>
                <span className="badge badge-secondary">{pieChartData.length} Brands</span>
              </h3>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData.length > 0 ? pieChartData : [{ name: "No Sales", value: 1 }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      stroke="rgba(15, 23, 42, 0.6)"
                      strokeWidth={2}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span style={{ color: "#94a3b8", fontSize: "0.8rem", marginRight: "12px" }}>{val}</span>}
                    />
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
        size="lg"
        title={
          selectedShowroom
            ? `${selectedShowroom.name} — Branch Metrics`
            : `Branch Breakdown: ${breakdownType === "revenue"
              ? "Total Revenue Generated"
              : breakdownType === "inventory"
                ? "In-Stock Vehicle Inventory"
                : breakdownType === "sales"
                  ? "Completed Vehicle Sales"
                  : "Service Center Tickets"
            }`
        }
      >
        {!selectedShowroom ? (
          <div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Select any branch to inspect granular deals, units, and customer tickets:
            </p>
            <div className="table-wrapper compact">
              <table>
                <thead>
                  <tr>
                    <th>Branch Location</th>
                    <th>Manager</th>
                    {breakdownType === "revenue" && <th>Revenue Generated</th>}
                    {breakdownType === "inventory" && <th>In Stock</th>}
                    {breakdownType === "sales" && <th>Total Deals</th>}
                    {breakdownType === "services" && <th>Tickets</th>}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getBreakdownData().map((sh) => (
                    <tr
                      key={sh.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedShowroom(sh)}
                    >
                      <td className="fw-medium" style={{ color: "#38bdf8" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Building2 size={16} />
                          <span>{sh.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{sh.manager}</td>
                      {breakdownType === "revenue" && (
                        <td className="fw-bold" style={{ color: "#38bdf8", fontFamily: "JetBrains Mono, monospace" }}>
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
                      <td>
                        <button className="btn btn-sm btn-ghost" style={{ padding: "4px 8px" }}>
                          Inspect <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setSelectedShowroom(null)}
              >
                ← Back to Showrooms List
              </button>
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                Branch Manager: <strong style={{ color: "#f8fafc" }}>{activeDrilldown?.manager}</strong>
              </span>
            </div>

            {/* Drilldown view by category */}
            {breakdownType === "services" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
                {activeDrilldown?.items.services.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                    No service tickets registered for this branch.
                  </p>
                ) : (
                  activeDrilldown?.items.services.map((srv) => (
                    <div
                      key={srv.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        padding: "14px 18px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h4 style={{ color: "#f8fafc", fontSize: "0.95rem", fontWeight: "600" }}>{srv.issue}</h4>
                        {getDeliveryStatusBadge(srv.deliveryDate)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
                        <span>Logged: {srv.entryDate || "Recent"}</span>
                        <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "#10b981", fontFamily: "JetBrains Mono, monospace" }}>
                          ₹{Number(srv.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {breakdownType === "inventory" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", maxHeight: "420px", overflowY: "auto" }}>
                {activeDrilldown?.items.vehicles.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: "center", gridColumn: "1 / -1", padding: "24px" }}>
                    No available units currently in stock at this branch.
                  </p>
                ) : (
                  activeDrilldown?.items.vehicles.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        padding: "14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span className="badge badge-info">{v.type || v.vehicleType || "Sedan"}</span>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{v.colour}</span>
                      </div>
                      <h4 style={{ color: "#ffffff", fontSize: "1rem", marginBottom: "4px" }}>{v.brand}</h4>
                      <code className="plate-badge" style={{ display: "inline-block", marginBottom: "8px" }}>{v.numberPlate}</code>
                      <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc", fontFamily: "JetBrains Mono, monospace" }}>
                        ₹{Number(v.cost || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {(breakdownType === "sales" || breakdownType === "revenue") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
                {activeDrilldown?.items.sales.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                    No completed sales recorded for this branch.
                  </p>
                ) : (
                  activeDrilldown?.items.sales.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.95rem" }}>
                          {s.customerName || `Customer #${s.customerId}`}
                        </span>
                        <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#38bdf8", fontFamily: "JetBrains Mono, monospace" }}>
                          ₹{Number(s.target || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
                        <span>Unit: <code className="plate-badge" style={{ fontSize: "0.75rem" }}>{s.vehicleNumberPlate || "—"}</code> • {s.date || "Completed"}</span>
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
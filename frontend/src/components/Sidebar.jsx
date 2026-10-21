import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Building2,
  Receipt,
  Users,
  Wrench,
  Gauge,
  Menu,
} from "lucide-react";

const navItems = [
  { section: "Overview" },
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { section: "Management" },
  { to: "/vehicles", label: "Inventory", icon: Car },
  { to: "/showrooms", label: "Showrooms", icon: Building2 },
  { to: "/sales", label: "Sales & Invoices", icon: Receipt },
  { to: "/customers", label: "Customers", icon: Users },
  { section: "Operations" },
  { to: "/services", label: "Service Center", icon: Wrench },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
        <span className="mobile-brand">AutoShowroom</span>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "show" : ""}`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <NavLink to="/" className="sidebar-brand" onClick={closeMobile}>
          <div className="sidebar-brand-icon">
            <Gauge />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">AutoShowroom</span>
            <span className="sidebar-brand-sub">Enterprise Suite</span>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={`section-${i}`} className="sidebar-section-label">
                {item.section}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobile}
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">v2.0 — Enterprise Edition</div>
        </div>
      </aside>
    </>
  );
}

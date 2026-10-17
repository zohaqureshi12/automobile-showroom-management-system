import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Showrooms", icon: "🏢" },
    { to: "/vehicles", label: "Vehicles", icon: "🚗" },
    { to: "/customers", label: "Customers", icon: "👥" },
    { to: "/sales", label: "Sales & Payments", icon: "💰" },
    { to: "/services", label: "Service Center", icon: "🔧" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">🏎️</span>
          <span className="brand-text">AutoShowroom</span>
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${open ? "open" : ""}`} />
        </button>

        <ul className={`navbar-links ${open ? "show" : ""}`}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

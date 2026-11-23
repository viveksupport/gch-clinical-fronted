import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/goldcare-logo.svg";
import { Icon } from "./Icon";
import "../../css/Sidebar.css"
import { clearSession } from "../../utils/session";
import { canRead } from "../../utils/access";
import { useQueryClient } from "@tanstack/react-query";
import { NAV_GROUPS } from "../../utils/navItems";   // the sidebar links (shared with App.jsx's routes)

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();     // the shared API cache (TanStack Query)

  function onSignOut() {
    clearSession();                         // forget the logged-in user
    queryClient.clear();                    // forget their cached API data too
    navigate("/", { replace: true });   // replace: the Back button won't reopen the dashboard
  }

  return (
    <aside className="gcd-sidebar">
      <div className="gcd-brand">
        <img className="gcd-brand__logo" src={logo} alt="Gold Care Homes" />
        <span>
          <span className="gcd-brand__name">Gold Care Homes</span>
          <span className="gcd-brand__sub">Clinical analytics</span>
        </span>
      </div>

      <nav className="gcd-nav">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => canRead(item.code));   // keep only what this user can open
          if (items.length === 0) return null;                              // hide a group with nothing left
          return (
            <div key={group.label}>
              <p className="gcd-nav__label">{group.label}</p>
              {items.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    `gcd-nav__item ${isActive ? "gcd-nav__item--active" : ""}`
                  }
                >
                  {Icon[item.icon]}
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <button type="button" className="gcd-nav__item gcd-signout" onClick={onSignOut}>
        {Icon.logout}
        Sign out
      </button>
    </aside>
  );
}
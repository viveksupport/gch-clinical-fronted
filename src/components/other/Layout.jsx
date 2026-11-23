// Layout.jsx
// The frame around every dashboard page: the sidebar on the left, the page on the right.
// It is also the "guard": only logged-in users get in. Anyone else goes to the login page,
// which then brings them back to the page they wanted.

import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getSession } from "../../utils/session";
import "../../css/Layout.css";

export default function Layout() {
  const location = useLocation();
  const session = getSession();

  // Not logged in (or the session has run out): back to the login page, remembering where they were going
  if (!session) return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />;

  return (
    <div className="gcd-shell">
      <Sidebar />
      <div className="gcd-main-col">
        <Outlet />
      </div>
    </div>
  );
}

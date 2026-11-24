import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/other/Layout";
import RequireAccess from "./components/other/RequireAccess";
import Login from "./pages/Login";
import ComingSoon from "./pages/ComingSoon";
import Occupancy from "./pages/Occupancy";
import { NAV_GROUPS, HOME_PATH } from "./utils/navItems";

// Every sidebar item becomes a route. None of the pages are built yet, so each shows "coming soon".
// When a page is ready, give it its own <Route> above the generated ones, for example:
//   <Route path="/cqc" element={<RequireAccess code="..."><CQC /></RequireAccess>} />
const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);
const OCCUPANCY = NAV_ITEMS.find((item) => item.key === "occupancy");

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<Layout />}>
        {/* Login sends users to /dashboard by default: here that is the first clinical page */}
        <Route path="/dashboard" element={<Navigate to={HOME_PATH} replace />} />

        {/* Built pages (left out of the generated "coming soon" routes below) */}
        <Route path="/occupancy" element={<RequireAccess code={OCCUPANCY.code}><Occupancy /></RequireAccess>} />

        {NAV_ITEMS.filter((item) => item !== OCCUPANCY).map((item) => (
          <Route
            key={item.key}
            path={item.path}
            element={<RequireAccess code={item.code}><ComingSoon title={item.label} /></RequireAccess>}
          />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

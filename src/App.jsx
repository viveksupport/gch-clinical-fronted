import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/other/Layout";
import RequireAccess from "./components/other/RequireAccess";
import Login from "./pages/Login";
import ComingSoon from "./pages/ComingSoon";
import { NAV_GROUPS, HOME_PATH } from "./utils/navItems";

// Every sidebar item becomes a route. None of the pages are built yet, so each shows "coming soon".
// When a page is ready, give it its own <Route> above the generated ones, for example:
//   <Route path="/cqc" element={<RequireAccess code="..."><CQC /></RequireAccess>} />
const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<Layout />}>
        {/* Login sends users to /dashboard by default: here that is the first clinical page */}
        <Route path="/dashboard" element={<Navigate to={HOME_PATH} replace />} />

        {NAV_ITEMS.map((item) => (
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

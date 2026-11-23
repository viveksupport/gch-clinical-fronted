// ComingSoon.jsx
// Shown for a page that isn't built yet. It sits inside the normal frame (sidebar + page header),
// so the user can keep moving between pages.
//   <ComingSoon title="Wound Summary" />
// When a real page is ready, point its route in App.jsx to that page instead.

import { Clock } from "lucide-react";
import logo from "../assets/goldcare-logo.svg";
import PageHeader from "../components/other/PageHeader";
import "../css/ComingSoon.css";

export default function ComingSoon({ title }) {
  return (
    <main className="page">
      <PageHeader title={title} subtitle="Clinical analytics" />

      <div className="cs">
        <div className="cs__card">
          <img className="cs__logo" src={logo} alt="Gold Care Homes" />

          <span className="cs__badge">
            <Clock size={14} />
            Under construction
          </span>

          <h2 className="cs__title">{title ? `${title} is coming soon` : "Coming soon"}</h2>

          <p className="cs__text">
            This page is on its way. We are putting the finishing touches on it —
            check back shortly.
          </p>
        </div>
      </div>
    </main>
  );
}

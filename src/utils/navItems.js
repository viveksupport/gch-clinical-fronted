// navItems.js
// The one list of clinical pages. Both the sidebar (Sidebar.jsx) and the routes (App.jsx)
// are built from it, so adding a page here adds its link AND its address in one go.
//
// Each item:
//   key    unique name
//   path   the URL the page lives at
//   label  the text in the sidebar (also the "... is coming soon" title)
//   icon   a key from components/other/Icon.jsx
//   code   (optional) the feature code the user needs to open it; no code = everyone can open it

// TODO(human): give each item its feature `code` (like "DASH_FB" in the marketing app)
// once the clinical feature codes exist in the backend. Until then every page is open to all logged-in users.

export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { key: "cqc", path: "/cqc", label: "CQC", icon: "cqc" },
      { key: "occupancy", path: "/occupancy", label: "Occupancy", icon: "occupancy" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { key: "wound", path: "/wound-summary", label: "Wound Summary", icon: "wound" },
      { key: "infection", path: "/infection-register", label: "Infection Register", icon: "infection" },
      { key: "dependency", path: "/dependency", label: "Dependency", icon: "dependency" },
    ],
  },
  {
    label: "Assessments",
    items: [
      { key: "smoking", path: "/smoking-assessment", label: "Smoking Assessment", icon: "smoking" },
      { key: "behaviour", path: "/behaviour-assessment", label: "Behaviour Assessment", icon: "behaviour" },
      { key: "fallsRisk", path: "/falls-risk-assessment", label: "Falls Risk Assessment", icon: "fallsRisk" },
    ],
  },
  {
    label: "Reports",
    items: [
      { key: "fallsReport", path: "/falls-report-analysis", label: "Falls Report Analysis", icon: "fallsReport" },
    ],
  },
];

// The first page in the list: where users land after signing in.
export const HOME_PATH = NAV_GROUPS[0].items[0].path;

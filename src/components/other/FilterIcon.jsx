// FilterIcon.jsx
// The small line icons used in the filter bar.
//   name = which icon: "filters", "calendar", "home", "target" or "reset"
//   size = width and height in pixels

// Each icon is one SVG path (a list of drawing instructions) on a 16 x 16 grid.
const ICON_PATHS = {
  filters: "M2 4h7M12 4h2M2 8h2M7 8h7M2 12h8M13 12h1M9 2.5v3M4 6.5v3M10 10.5v3",
  calendar: "M2.5 4h11v9.5h-11zM2.5 7h11M5.5 2.5v3M10.5 2.5v3",
  home: "M3 13.5v-11h6v11M9 6.5h4v7M2 13.5h12M5.5 5.5h1M5.5 8h1M5.5 10.5h1M11 9h.5M11 11h.5",
  target: "M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  reset: "M2.5 8a5.5 5.5 0 1 0 1.700-4M2.5 2.5V5H5",
};

export default function Icon({ name, size = 14 }) {
  return (
    <svg className="ico" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d={ICON_PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

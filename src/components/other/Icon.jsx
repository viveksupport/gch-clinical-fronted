
// ---- small icons used by the sidebar and pages ----
// The clinical ones come from lucide-react; logout is an inline SVG at the same size and stroke, so they all look alike.
import {
  Accessibility, BedDouble, Bandage, Brain, Cigarette, ClipboardCheck,
  FileChartColumn, ShieldPlus, TriangleAlert,
} from "lucide-react";

const lucide = { size: 16, strokeWidth: 2 };

export const Icon = {
  // ---- clinical ----
  cqc: <ClipboardCheck {...lucide} />,
  occupancy: <BedDouble {...lucide} />,
  wound: <Bandage {...lucide} />,
  infection: <ShieldPlus {...lucide} />,
  smoking: <Cigarette {...lucide} />,
  behaviour: <Brain {...lucide} />,
  dependency: <Accessibility {...lucide} />,
  fallsRisk: <TriangleAlert {...lucide} />,
  fallsReport: <FileChartColumn {...lucide} />,

  // ---- shared ----
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
  ),
};
// KpiCards.jsx
// The row of KPI cards at the top of the Occupancy page (two rows of four on a wide screen).
// The numbers come from the API's kpi_count (POST /clinical/service_users → services/service_users_service.get_kpi_counts).
//
// Props:
//   kpi      = the API's kpi_count: { cqc_bed_count, occupied_bed_days, occupancy (average beds in use per day),
//              occupancy_rate, new_admission, recent_discharge,
//              recent_deaths, hospital_admission, suspended_profiles, net_movement }
//   inPeriod = how many service users are in the list for the period (shown under Occupancy)

import { Activity, ArrowLeftRight, BedDouble, CirclePause, Hospital, LogIn, LogOut, Users } from "lucide-react";

// 1234 → "1,234"
function niceNumber(value) {
  return (value ?? 0).toLocaleString();
}

// Net movement with its sign: 2 → "+2", -1 → "−1", 0 → "0"
function signedNumber(value) {
  if (value > 0) return `+${niceNumber(value)}`;
  if (value < 0) return `−${niceNumber(Math.abs(value))}`;   // a real minus sign, not a hyphen
  return "0";
}

// An average with one decimal: 116.13 → "116.1", 120 → "120.0"
function niceAverage(value) {
  return (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// The API's occupancy_rate as a share of the CQC beds: 92.3 → "92.3% of beds"
function bedShare(rate) {
  if (rate == null) return "No CQC beds found";
  return `${rate.toFixed(1)}% of beds`;
}

// Net movement's colour: red when more left than arrived, green when more arrived, grey when even
function netColour(value) {
  if (value < 0) return "red";
  if (value > 0) return "green";
  return "grey";
}

// One card: a coloured edge, the label and icon, the big number and a short line under it
function KpiCard({ label, value, note, icon, colour }) {
  return (
    <div className={`occ-kpi occ-kpi--${colour}`}>
      <div className="occ-kpi__top">
        <span className="occ-kpi__label">{label}</span>
        <span className="occ-kpi__icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="occ-kpi__value">{value}</div>
      <div className="occ-kpi__note">{note}</div>
    </div>
  );
}

export default function KpiCards({ kpi, inPeriod }) {
  if (!kpi) return null;   // the API sent no kpi_count: show no cards rather than zeros

  // The eight cards, in the order they appear: [label, value, note, icon, colour]
  const cards = [
    ["CQC beds", niceNumber(kpi.cqc_bed_count), "Registered beds", <BedDouble size={20} />, "blue"],
    ["Avg occupancy", niceAverage(kpi.occupancy),
      `${bedShare(kpi.occupancy_rate)} · ${niceNumber(inPeriod)} residents in period`, <Users size={20} />, "teal"],
    ["New admissions", niceNumber(kpi.new_admission), "Files opened in period", <LogIn size={20} />, "green"],
    ["Recent discharges", niceNumber(kpi.recent_discharge), "Files closed in period", <LogOut size={20} />, "blue"],
    ["Recent deaths", niceNumber(kpi.recent_deaths), "Closed as deceased", <Activity size={20} />, "grey"],
    ["Hospital admissions", niceNumber(kpi.hospital_admission), "Suspended for hospital", <Hospital size={20} />, "amber"],
    ["Suspended profiles", niceNumber(kpi.suspended_profiles), "Suspended in period", <CirclePause size={20} />, "amber"],
    ["Net movement", signedNumber(kpi.net_movement), "Admissions − discharges", <ArrowLeftRight size={20} />, netColour(kpi.net_movement)],
  ];

  return (
    <section className="occ-kpis" aria-label="Key figures">
      {cards.map(([label, value, note, icon, colour]) => (
        <KpiCard key={label} label={label} value={value} note={note} icon={icon} colour={colour} />
      ))}
    </section>
  );
}

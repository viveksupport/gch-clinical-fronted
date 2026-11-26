// HomeKpiTable.jsx
// The care home summary on the Occupancy page: one row per care home for ONE month, with a portfolio total underneath.
// The month and year are picked in the bar above the table.
//
// Props:
//   month         = the month shown now: "2026-10"
//   onMonthChange = called with the new month ("2026-09") when a different month or year is picked
//   result        = useHomeKpis(): { data: [home rows], total, loading, error }

import { Building2 } from "lucide-react";
import Dropdown from "../other/Dropdown";
import { thisMonth } from "../../utils/filterDates";
import "../../css/FilterBar.css";   // the Dropdown's look (its rules also apply under .dd-host)

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const YEARS_BACK = 4;   // the year list: this year and the 4 before it

// The month choices for a year: every month, but only up to this month in the current year (no future months)
function monthOptions(year) {
  const [nowYear, nowMonth] = thisMonth().split("-").map(Number);
  const lastMonth = year === nowYear ? nowMonth : 12;
  return MONTH_NAMES.slice(0, lastMonth).map((name, index) => [String(index + 1).padStart(2, "0"), name]);
}

// The year choices: this year and the few before it, newest first
function yearOptions() {
  const nowYear = Number(thisMonth().slice(0, 4));
  return Array.from({ length: YEARS_BACK + 1 }, (_, index) => [String(nowYear - index), String(nowYear - index)]);
}

// "2026-10" → "October 2026"
function monthTitle(month) {
  return `${LONG_MONTH_NAMES[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
}

// 1234 → "1,234"
function niceNumber(value) {
  return (value ?? 0).toLocaleString();
}

// An average with one decimal: 112.6 → "112.6", 120 → "120.0"
function niceAverage(value) {
  return (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// 96.04 → "96.0%", nothing → "—" (a home with no CQC beds)
function nicePercent(value) {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

// Net movement with its sign: 2 → "+2", -1 → "−1", 0 → "0"
function signedNumber(value) {
  if (value > 0) return `+${niceNumber(value)}`;
  if (value < 0) return `−${niceNumber(Math.abs(value))}`;   // a real minus sign, not a hyphen
  return "0";
}

// Occupancy % band: "good" from 95%, "warn" from 90%, "bad" below (also used by the legend)
function rateBand(value) {
  if (value == null) return "none";
  if (value >= 95) return "good";
  if (value >= 90) return "warn";
  return "bad";
}

// Net movement colour: green when more arrived, red when more left, grey when even
function netBand(value) {
  if (value > 0) return "good";
  if (value < 0) return "bad";
  return "zero";
}

// The CQC rating's colour: "Requires Improvement" → "requires-improvement"
function ratingClass(rating) {
  const known = ["outstanding", "good", "requires-improvement", "inadequate"];
  const key = (rating || "").trim().toLowerCase().replace(/\s+/g, "-");
  return known.includes(key) ? key : "none";
}

// The nine number columns, in order (three per group): [key, heading, what it counts (shown on hover)]
const COLUMNS = [
  ["beds", "CQC beds", "Registered beds from the home's CQC record"],
  ["occupied", "Avg occupied", "Average beds in use per day: each resident's days in the home this month, added up, ÷ days in the month"],
  ["rate", "Occupancy %", "Avg occupied ÷ CQC beds"],
  ["admissions", "Admissions", "Residents who moved in during the month"],
  ["discharges", "Discharges", "Files closed during the month"],
  ["net", "Net change", "Admissions − discharges"],
  ["hospital", "Hospital admissions", "Suspended during the month for a hospital admission"],
  ["deaths", "Deaths", "Files closed during the month as Deceased (expected or unexpected)"],
  ["suspended", "Suspensions", "Suspended during the month, for any reason"],
];

// A count cell: zero is shown faded, so the numbers that matter stand out
function Count({ value, className = "" }) {
  return <td className={`num ${className} ${value ? "" : "occ-zero"}`}>{niceNumber(value)}</td>;
}

// Occupancy %: a thin bar (filled up to the %) with the number beside it
function RateCell({ value }) {
  const width = value == null ? 0 : Math.min(value, 100);
  return (
    <td className="num">
      <span className={`occ-rate occ-rate--${rateBand(value)}`}>
        <span className="occ-rate__track"><span className="occ-rate__fill" style={{ width: `${width}%` }} /></span>
        <span className="occ-rate__text">{nicePercent(value)}</span>
      </span>
    </td>
  );
}

// The number cells shared by each home's row and the total row, in their three groups
function FigureCells({ figures }) {
  return (
    <>
      {/* Capacity */}
      <td className="num grp">{niceNumber(figures.cqc_bed_count)}</td>
      <td className="num occ-strong">{niceAverage(figures.occupancy)}</td>
      <RateCell value={figures.occupancy_rate} />
      {/* Resident movement */}
      <Count value={figures.new_admission} className="grp" />
      <Count value={figures.recent_discharge} />
      <td className={`num occ-strong occ-net--${netBand(figures.net_movement)}`}>{signedNumber(figures.net_movement)}</td>
      {/* Clinical events */}
      <Count value={figures.hospital_admission} className="grp" />
      <Count value={figures.recent_deaths} />
      <Count value={figures.suspended_profiles} />
    </>
  );
}

export default function HomeKpiTable({ month, onMonthChange, result }) {
  const year = month.slice(0, 4);
  const monthNumber = month.slice(5, 7);

  const onMonth = (value) => onMonthChange(`${year}-${value}`);

  // A new year: keep the same month, unless it would be in the future (then use this month)
  const onYear = (value) => {
    const wanted = `${value}-${monthNumber}`;
    onMonthChange(wanted > thisMonth() ? thisMonth() : wanted);   // "YYYY-MM" text sorts like a date
  };

  let content;
  if (result.loading) content = <p className="occ-none">Loading care home summary…</p>;
  else if (result.error) content = <p className="occ-none">Could not load the care home summary ({result.error}).</p>;
  else if (result.data.length === 0) content = <p className="occ-none">No care homes to show.</p>;
  else content = (
    <div className="occ-table-wrap">
      <table className="occ-table occ-home-table">
        {/* column widths: the name and rating, then nine equal number columns */}
        <colgroup>
          <col className="occ-col-home" />
          <col className="occ-col-rating" />
          {COLUMNS.map(([key]) => <col key={key} />)}
        </colgroup>
        <thead>
          <tr className="occ-group-row">
            <th rowSpan={2}>Care home</th>
            <th rowSpan={2}>CQC rating</th>
            <th colSpan={3} className="grp">Capacity</th>
            <th colSpan={3} className="grp">Resident movement</th>
            <th colSpan={3} className="grp">Clinical events</th>
          </tr>
          <tr className="occ-sub-row">
            {COLUMNS.map(([key, title, help], index) => (
              <th key={key} className={`num ${index % 3 === 0 ? "grp" : ""}`} title={help}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.data.map((home) => (
            <tr key={home.home_unique_id}>
              <td className="occ-name">{home.care_home_name || home.home_unique_id}</td>
              <td>
                <span className={`occ-rating occ-rating--${ratingClass(home.cqc_rating)}`}>
                  <span className="occ-rating__dot" aria-hidden="true" />
                  {home.cqc_rating || "Not rated"}
                </span>
              </td>
              <FigureCells figures={home} />
            </tr>
          ))}
        </tbody>
        {result.total && (
          <tfoot>
            <tr>
              <td>Portfolio total</td>
              <td className="occ-foot-note">{result.data.length} {result.data.length === 1 ? "home" : "homes"}</td>
              <FigureCells figures={result.total} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );

  return (
    <section className="occ-card occ-list occ-summary" aria-label="Care home summary">
      <div className="occ-list__head">
        <div>
          <h2 className="occ-title"><Building2 size={18} aria-hidden="true" /> Care home summary</h2>
          <p>{monthTitle(month)} · average daily occupancy, movement and clinical events within the month</p>
        </div>
      </div>

      {/* The month and year bar, on top of the list */}
      <div className="occ-list__filters">
        <div className="occ-filter dd-host">
          <span className="occ-filter__label">Month</span>
          <Dropdown className="pill" label="Month" value={monthNumber} options={monthOptions(Number(year))} onChange={onMonth} />
        </div>
        <div className="occ-filter dd-host">
          <span className="occ-filter__label">Year</span>
          <Dropdown className="pill" label="Year" value={year} options={yearOptions()} onChange={onYear} />
        </div>

        {/* what the occupancy colours mean */}
        <div className="occ-legend" aria-label="Occupancy colours">
          <span className="occ-legend__item occ-rate--good"><i /> 95% and above</span>
          <span className="occ-legend__item occ-rate--warn"><i /> 90–94.9%</span>
          <span className="occ-legend__item occ-rate--bad"><i /> Below 90%</span>
        </div>
      </div>

      {content}
    </section>
  );
}

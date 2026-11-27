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

// The rating as CQC writes it ("Requires improvement"), whatever case the data has; nothing → "Not rated"
function ratingText(rating) {
  const text = (rating || "").trim().toLowerCase();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Not rated";
}

// The column groups, left to right. Each says WHEN its figures are measured (note), because they differ:
// capacity is a monthly average, movement and deaths happen within the month, and suspension is the
// status right now (suspended_status today, open files only), not a count of events in the month.
// columns: [key, heading, what it counts (shown on hover)]
const GROUPS = [
  {
    title: "Capacity", note: "Monthly average",
    columns: [
      ["beds", "CQC beds", "Registered beds from the home's CQC record"],
      ["occupied", "Avg occupied", "Average beds in use per day: each resident's days in the home this month, added up, ÷ days in the month"],
      ["rate", "Occupancy %", "Avg occupied ÷ CQC beds"],
    ],
  },
  {
    title: "Resident movement", note: "In the month",
    columns: [
      ["admissions", "Admissions", "Residents who moved in during the month"],
      ["discharges", "Discharges", "Files closed during the month, for any reason (deaths included)"],
      ["net", "Net change", "Admissions − discharges"],
    ],
  },
  {
    title: "Deaths", note: "In the month",
    columns: [
      ["deaths", "Deaths", "Files closed during the month as Deceased (expected or unexpected); also counted in Discharges"],
    ],
  },
  {
    title: "Suspension", note: "Current", live: true,
    columns: [
      ["hospital", "Hospital admission", "Open files suspended right now with the category Hospital admission"],
      ["suspended", "All suspended", "Open files suspended right now, for any reason (hospital admissions included)"],
    ],
  },
];

// Every number column in order, for the column widths
const COLUMNS = GROUPS.flatMap((group) => group.columns);

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

// The number cells shared by each home's row and the total row, in the same order as GROUPS
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
      {/* Deaths */}
      <Count value={figures.recent_deaths} className="grp" />
      {/* Suspension (current) */}
      <Count value={figures.hospital_admission} className="grp" />
      <Count value={figures.suspended_profiles} className="occ-strong" />
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
        {/* column widths: the name and rating, a wider occupancy column (bar + %), then equal number columns */}
        <colgroup>
          <col className="occ-col-home" />
          <col className="occ-col-rating" />
          {COLUMNS.map(([key]) => <col key={key} className={`occ-col-${key}`} />)}
        </colgroup>
        <thead>
          <tr className="occ-group-row">
            <th colSpan={2}>
              <span className="occ-grp__title">Care home</span>
              <span className="occ-grp__note">Latest CQC report</span>
            </th>
            {GROUPS.map((group) => (
              <th key={group.title} colSpan={group.columns.length} className="grp">
                <span className="occ-grp__title">{group.title}</span>
                <span className={`occ-grp__note ${group.live ? "occ-grp__note--live" : ""}`}>{group.note}</span>
              </th>
            ))}
          </tr>
          <tr className="occ-sub-row">
            <th>Name</th>
            <th>CQC rating</th>
            {GROUPS.flatMap((group) => group.columns.map(([key, title, help], index) => (
              <th key={key} className={`num ${index === 0 ? "grp" : ""}`} title={help}>{title}</th>
            )))}
          </tr>
        </thead>
        <tbody>
          {result.data.map((home) => (
            <tr key={home.home_unique_id}>
              <td className="occ-name">{home.care_home_name || home.home_unique_id}</td>
              <td>
                <span className={`occ-rating occ-rating--${ratingClass(home.cqc_rating)}`}>
                  <span className="occ-rating__dot" aria-hidden="true" />
                  {ratingText(home.cqc_rating)}
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
          <h2 className="occ-title"><Building2 size={16} aria-hidden="true" /> Care home summary</h2>
          <p>{monthTitle(month)} · average daily occupancy, movement and deaths within the month, and who is suspended now</p>
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

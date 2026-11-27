// YearMatrix.jsx
// The Financial Year Performance Matrix on the Occupancy page: one row per care home, one column per month (Apr – Mar),
// each cell coloured red / amber / green for the metric picked in the Metric dropdown. An "All homes" row gives each
// month's total; it is not coloured, because the home thresholds don't fit added-up numbers.
// Months after this one are shown empty; this month is highlighted and counted up to today.
//
// Props:
//   result = useYearKpis(): { data: the API reply or null, loading, error }

import { useMemo, useState } from "react";
import { Grid3x3 } from "lucide-react";
import Dropdown from "../other/Dropdown";
import "../../css/FilterBar.css";   // the Dropdown's look (its rules also apply under .dd-host)

// 96.04 → "96.0" (the % is in the metric's name, so the cells stay short), nothing → "—" (a home with no CQC beds)
const rate = (value) => (value == null ? "—" : value.toFixed(1));
// "2026-11-27" → "27 Nov"
const shortDate = (text) => new Date(`${text}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
// Net movement with its sign: 2 → "+2", -1 → "−1" (a real minus sign), 0 → "0"
const signed = (value) => (value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "0");
const plain = (value) => (value ?? 0).toLocaleString();

// The metrics: which field to show, how to write it, and its red / amber / green bands.
//   band(value) → "good" | "warn" | "bad" | "none";  legend = the three bands' meanings, good first
const METRICS = {
  occupancy: {
    label: "Occupancy %", field: "occupancy_rate", format: rate,
    band: (v) => (v == null ? "none" : v >= 95 ? "good" : v >= 90 ? "warn" : "bad"),
    legend: ["95% and above", "90–94.9%", "Below 90%"],
  },
  admissions: {
    label: "New admissions", field: "new_admission", format: plain,
    band: (v) => (v >= 4 ? "good" : v >= 2 ? "warn" : "bad"),
    legend: ["Strong intake (4+)", "Moderate (2–3)", "Low (0–1)"],
  },
  discharges: {
    label: "Discharges", field: "recent_discharge", format: plain,
    band: (v) => (v <= 1 ? "good" : v <= 3 ? "warn" : "bad"),
    legend: ["Low (0–1)", "Moderate (2–3)", "High (4+)"],
  },
  net: {
    label: "Net movement", field: "net_movement", format: signed,
    band: (v) => (v > 0 ? "good" : v === 0 ? "warn" : "bad"),
    legend: ["Growing (+1 or more)", "Even (0)", "Shrinking (−1 or less)"],
  },
  deaths: {
    label: "Deaths", field: "recent_deaths", format: plain,
    band: (v) => (v === 0 ? "good" : v <= 2 ? "warn" : "bad"),
    legend: ["None", "1–2", "3 or more"],
  },
};
const METRIC_OPTIONS = Object.entries(METRICS).map(([key, metric]) => [key, metric.label]);
const BANDS = ["good", "warn", "bad"];

// A row's figures by month: { "2026-04": {...}, ... }
const byMonth = (months) => Object.fromEntries(months.map((month) => [month.month, month]));

export default function YearMatrix({ result }) {
  const [metricKey, setMetricKey] = useState("occupancy");
  const metric = METRICS[metricKey];
  const reply = result.data;

  // Each home's months (and the portfolio's) as lookups, worked out once per reply
  const rows = useMemo(() => (reply
    ? reply.data.map((home) => ({ id: home.home_unique_id, name: home.care_home_name, months: byMonth(home.months) }))
    : []), [reply]);
  const portfolio = useMemo(() => (reply ? byMonth(reply.portfolio.months) : null), [reply]);

  const thisMonth = reply?.months.find((month) => month.is_partial);

  let content;
  if (result.loading) content = <p className="occ-none">Loading the financial year…</p>;
  else if (result.error) content = <p className="occ-none">Could not load the financial year ({result.error}).</p>;
  else if (!reply || rows.length === 0) content = <p className="occ-none">No care homes to show.</p>;
  else content = (
    <div className="occ-table-wrap">
      <table className="occ-table occ-matrix">
        <thead>
          <tr>
            <th className="occ-matrix__home">Care home</th>
            {reply.months.map((month) => (
              <th key={month.month} className={month.is_partial ? "occ-matrix__now" : ""}
                title={month.is_partial ? `Counted up to ${shortDate(reply.data_until)}` : undefined}>
                {month.month_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="occ-name occ-matrix__home" title={row.name || row.id}>{row.name || row.id}</td>
              {reply.months.map((month) => {
                const figures = row.months[month.month];
                if (!figures) return <td key={month.month} className="occ-matrix__cell"><span className="occ-chip occ-chip--empty" /></td>;
                const value = figures[metric.field];
                return (
                  <td key={month.month} className={`occ-matrix__cell ${month.is_partial ? "occ-matrix__now" : ""}`}>
                    <span className={`occ-chip occ-chip--${metric.band(value)}`}>{metric.format(value)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="occ-matrix__home">All homes</td>
            {reply.months.map((month) => {
              const figures = portfolio[month.month];
              return <td key={month.month}>{figures ? metric.format(figures[metric.field]) : ""}</td>;
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <section className="occ-card occ-list occ-summary occ-matrix-card" aria-label="Financial year performance">
      <div className="occ-list__head">
        <div>
          <h2 className="occ-title"><Grid3x3 size={16} aria-hidden="true" /> Financial year performance (Apr – Mar)</h2>
          <p>Spot recurring occupancy shortfalls, discharge spikes and months with more deaths, home by home</p>
        </div>
        <div className="occ-filter dd-host">
          <span className="occ-filter__label">Metric</span>
          <Dropdown className="pill" label="Metric" value={metricKey} options={METRIC_OPTIONS} onChange={setMetricKey} />
        </div>
      </div>

      {/* What the colours mean for the picked metric */}
      <div className="occ-list__filters">
        <span className="occ-filter__label">RAG thresholds</span>
        <div className="occ-legend" aria-label={`${metric.label} colours`}>
          {BANDS.map((band, index) => (
            <span key={band} className={`occ-legend__item occ-rate--${band}`}><i /> {metric.legend[index]}</span>
          ))}
        </div>
      </div>

      {content}

      {reply && (
        <div className="occ-card-foot">
          <span>{thisMonth ? `${thisMonth.month_name} counted to ${shortDate(reply.data_until)}. ` : ""}All homes is not coloured.</span>
          <strong>FY {reply.financial_year}</strong>
        </div>
      )}
    </section>
  );
}

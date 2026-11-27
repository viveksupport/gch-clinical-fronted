// MovementChart.jsx
// Resident movement over the current financial year (Apr – Mar), for all the selected homes together:
//   1. Admissions and discharges: two bars per month, side by side.
//   2. Net movement (admissions − discharges): one bar per month, up for a gain, down for a loss.
// The header adds the year so far (admissions, discharges, net). Bars grow in when the chart first appears;
// hovering a month brings it forward in both charts (the others fade back) and shows its numbers beside it.
// Months still to come are shaded and labelled. Drawn as plain SVG (no chart library), sized to the card's width.
//
// Props:
//   result = useYearKpis(): { data: the API reply or null, loading, error }   (the same data as YearMatrix)

import { useId, useLayoutEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

const PAD = { top: 12, right: 8, bottom: 26, left: 36 };   // room for the y labels (left) and month names (bottom)
const TIP_WIDTH = 180;                                        // the hover box's width (it sits beside the month)

// The axis top for a largest value: a round number with about 5 steps, close above it. 410 → { max: 500, step: 100 }
function niceScale(largest) {
  const rough = Math.max(largest, 1) / 5;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 5, 10].map((n) => n * power).find((n) => n >= rough));   // whole people: never below 1
  return { max: Math.ceil(Math.max(largest, 1) / step) * step, step };
}

const ticks = (from, to, step) => Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => from + i * step);
// "2026-11-27" → "27 Nov"
const shortDate = (text) => new Date(`${text}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const signed = (value) => (value > 0 ? `+${value.toLocaleString()}` : value < 0 ? `−${Math.abs(value).toLocaleString()}` : "0");
const netClass = (value) => (value > 0 ? "occ-net--good" : value < 0 ? "occ-net--bad" : "occ-net--zero");

// A bar with 4px rounded corners on its data end only (the end away from the baseline)
function barPath(x, y, width, height, roundTop) {
  const r = Math.min(4, width / 2, height);
  if (roundTop) {
    return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
  }
  return `M${x},${y} H${x + width} V${y + height - r} Q${x + width},${y + height} ${x + width - r},${y + height} H${x + r} Q${x},${y + height} ${x},${y + height - r} Z`;
}

// The width of an element, kept up to date as the window resizes
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

// The bar fills: each colour strong at the data end, a little lighter towards the baseline.
// [name, CSS colour, data end at the top?]
const FILLS = [["in", "var(--series-in)", true], ["out", "var(--series-out)", true], ["gain", "var(--good)", true], ["loss", "var(--bad)", false]];

function Gradients({ id }) {
  return (
    <defs>
      {FILLS.map(([name, colour, dataAtTop]) => (
        <linearGradient key={name} id={`${id}-${name}`} x1="0" y1={dataAtTop ? "0" : "1"} x2="0" y2={dataAtTop ? "1" : "0"}>
          <stop offset="0%" style={{ stopColor: colour }} />
          <stop offset="100%" style={{ stopColor: colour, stopOpacity: 0.72 }} />
        </linearGradient>
      ))}
      {/* light diagonal lines for the months still to come */}
      <pattern id={`${id}-future`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" className="occ-chart__hatch" />
      </pattern>
    </defs>
  );
}

// One chart: the y grid and labels, the month names, the shaded months to come, and a hover target per month.
// bars(figures, x, band, y, fill) draws a month's bars; fill(name) gives a bar colour's gradient.
function Chart({ id, width, height, months, scale, hovered, onHover, bars, label, futureLabel }) {
  const plotW = Math.max(width - PAD.left - PAD.right, 0);
  const plotH = height - PAD.top - PAD.bottom;
  const band = plotW / months.length;                        // each month's slot
  const y = (value) => PAD.top + ((scale.max - value) / (scale.max - scale.min)) * plotH;
  const fill = (name) => `url(#${id}-${name})`;
  const firstFuture = months.findIndex((month) => month.is_future);

  return (
    <svg width={width} height={height} role="img" aria-label={label} className={`occ-chart__svg${hovered != null ? " is-focus" : ""}`}>
      <Gradients id={id} />
      {firstFuture >= 0 && (
        <g className="occ-chart__future">
          <rect x={PAD.left + firstFuture * band} y={PAD.top} width={(months.length - firstFuture) * band} height={plotH}
            fill={`url(#${id}-future)`} />
          {futureLabel && (
            <text x={PAD.left + ((firstFuture + months.length) / 2) * band} y={PAD.top + 16}>Months to come</text>
          )}
        </g>
      )}
      {ticks(scale.min, scale.max, scale.step).map((value) => (
        <g key={value}>
          <line x1={PAD.left} x2={width - PAD.right} y1={y(value)} y2={y(value)}
            className={value === 0 ? "occ-chart__zero" : "occ-chart__grid"} />
          <text x={PAD.left - 8} y={y(value)} className="occ-chart__ylabel">{value.toLocaleString()}</text>
        </g>
      ))}
      {months.map((month, index) => {
        const x = PAD.left + index * band;
        return (
          <g key={month.month} className={`occ-chart__month${hovered === index ? " is-hovered" : ""}`} style={{ "--i": index }}>
            {hovered === index && <rect x={x} y={PAD.top} width={band} height={plotH} rx="6" className="occ-chart__hover" />}
            {month.figures && <g className="occ-chart__bars">{bars(month.figures, x, band, y, fill)}</g>}
            <text x={x + band / 2} y={height - 8} className={`occ-chart__xlabel${month.is_partial ? " occ-chart__xlabel--now" : ""}`}>
              {month.month_name}
            </text>
            {/* the hover target: the whole month slot, bigger than the bars */}
            {month.figures && (
              <rect x={x} y={PAD.top} width={band} height={plotH} fill="transparent"
                onMouseEnter={() => onHover(index)} onMouseLeave={() => onHover(null)} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function MovementChart({ result }) {
  const id = useId().replace(/:/g, "");           // unique gradient ids for this chart
  const [plotRef, width] = useWidth();
  const [hovered, setHovered] = useState(null);   // the month index under the mouse, in either chart
  const reply = result.data;

  // The 12 months, each with the portfolio's figures (none for months still to come)
  const figuresByMonth = Object.fromEntries((reply?.portfolio.months ?? []).map((month) => [month.month, month]));
  const months = (reply?.months ?? []).map((month) => ({ ...month, figures: figuresByMonth[month.month] }));
  const withData = months.filter((month) => month.figures);

  // The year so far, for the header
  const yearSoFar = (field) => withData.reduce((sum, month) => sum + month.figures[field], 0);
  const admissions = yearSoFar("new_admission");
  const discharges = yearSoFar("recent_discharge");
  const net = admissions - discharges;

  const largest = Math.max(0, ...withData.flatMap((m) => [m.figures.new_admission, m.figures.recent_discharge]));
  const movementScale = { min: 0, ...niceScale(largest) };
  // room above the tallest bar for its value label
  if (largest > movementScale.max - movementScale.step * 0.4) movementScale.max += movementScale.step;
  // Net movement: the step comes from the whole range (gains + losses), so there are about 5 gridlines in all,
  // not a line for every unit; then each side is only as deep as its own biggest value
  // (+3 and −4 give +4 .. −6 in steps of 2, not +3 .. −5 in steps of 1)
  const nets = withData.map((m) => m.figures.net_movement);
  const biggestGain = Math.max(0, ...nets);
  const biggestLoss = Math.max(0, ...nets.map((value) => -value));
  const { step: netStep } = niceScale(biggestGain + biggestLoss);
  const netScale = {
    // a loss's label sits under its bar: when the biggest loss nearly reaches the bottom line, go one step deeper,
    // so the label never runs into the month names
    min: biggestLoss ? -Math.ceil(biggestLoss / netStep + 0.4) * netStep : 0,
    max: Math.max(Math.ceil(biggestGain / netStep), biggestLoss ? 0 : 1) * netStep,   // all zero: still one step up
    step: netStep,
  };

  const band = (Math.max(width - PAD.left - PAD.right, 0)) / Math.max(months.length, 1);
  const barW = Math.min(26, (band - 16) / 2);          // two bars per month, 2px apart; wider on a wide card
  const showBarValues = barW >= 16;                    // a value over each bar only when the bars are wide enough for it

  const movementBars = (figures, x, slot, y, fill) => {
    const left = x + slot / 2 - barW - 1;
    return [["new_admission", "in", left], ["recent_discharge", "out", left + barW + 2]]
      .map(([field, colour, barX]) => figures[field] > 0 && (
        <g key={field}>
          <path className="occ-chart__bar" fill={fill(colour)} d={barPath(barX, y(figures[field]), barW, y(0) - y(figures[field]), true)} />
          {showBarValues && <text x={barX + barW / 2} y={y(figures[field]) - 5} className="occ-chart__barvalue">{figures[field]}</text>}
        </g>
      ));
  };

  const netW = Math.min(40, band - 16);
  const netBars = (figures, x, slot, y, fill) => {
    const value = figures.net_movement;
    const barX = x + slot / 2 - netW / 2;
    const top = y(Math.max(value, 0));
    const height = Math.abs(y(value) - y(0));
    return (
      <>
        {value !== 0 && (
          <path className={`occ-chart__bar${value < 0 ? " occ-chart__bar--down" : ""}`} fill={fill(value > 0 ? "gain" : "loss")}
            d={barPath(barX, top, netW, height, value > 0)} />
        )}
        <text x={x + slot / 2} y={value >= 0 ? y(value) - 6 : y(value) + 14} className="occ-chart__value">{signed(value)}</text>
      </>
    );
  };

  // The hover box sits beside the month (right of it, or left near the card's right edge), so it never covers its bars
  const tip = hovered != null ? months[hovered] : null;
  const slotRight = PAD.left + (hovered + 1) * band;
  const tipX = slotRight + 8 + TIP_WIDTH <= width ? slotRight + 8 : PAD.left + hovered * band - 8 - TIP_WIDTH;

  let content;
  if (result.loading) content = <p className="occ-none">Loading the financial year…</p>;
  else if (result.error) content = <p className="occ-none">Could not load the financial year ({result.error}).</p>;
  else if (!reply || withData.length === 0) content = <p className="occ-none">No movement to show.</p>;
  else content = width > 0 && (
    <>
      <div className="occ-chart__legend" aria-hidden="true">
        <span><i className="occ-chart__key--in" /> Admissions</span>
        <span><i className="occ-chart__key--out" /> Discharges</span>
      </div>
      <div className="occ-chart__plots">
        <Chart id={`${id}a`} width={width} height={230} months={months} scale={movementScale} hovered={hovered} onHover={setHovered}
          bars={movementBars} futureLabel label="Admissions and discharges per month, this financial year" />

        <h3 className="occ-chart__title">Net movement <span>admissions − discharges · up = gain, down = loss</span></h3>
        <Chart id={`${id}b`} width={width} height={170} months={months} scale={netScale} hovered={hovered} onHover={setHovered}
          bars={netBars} label="Net movement per month, this financial year" />

        {tip && (
          <div className="occ-chart__tip" style={{ left: tipX, width: TIP_WIDTH }} role="status">
            <strong>{tip.month_name} {tip.month.slice(0, 4)}{tip.is_partial ? ` (to ${shortDate(reply.data_until)})` : ""}</strong>
            <span><i className="occ-chart__key--in" /> Admissions <b>{tip.figures.new_admission}</b></span>
            <span><i className="occ-chart__key--out" /> Discharges <b>{tip.figures.recent_discharge}</b></span>
            <span className="occ-chart__tip-net">Net movement <b className={netClass(tip.figures.net_movement)}>{signed(tip.figures.net_movement)}</b></span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <section className="occ-card occ-list occ-summary occ-movement" aria-label="Resident movement this financial year">
      <div className="occ-list__head">
        <div>
          <h2 className="occ-title"><TrendingUp size={16} aria-hidden="true" /> Resident movement (Apr – Mar)</h2>
          <p>Admissions and discharges each month, and the net change, for the selected homes together</p>
        </div>
        {withData.length > 0 && (
          <dl className="occ-stats" aria-label="Financial year so far">
            <div className="occ-stat">
              <dt><i className="occ-chart__key--in" /> Admissions</dt>
              <dd>{admissions.toLocaleString()}</dd>
            </div>
            <div className="occ-stat">
              <dt><i className="occ-chart__key--out" /> Discharges</dt>
              <dd>{discharges.toLocaleString()}</dd>
            </div>
            <div className="occ-stat">
              <dt>Net movement</dt>
              <dd className={netClass(net)}>{signed(net)}</dd>
            </div>
          </dl>
        )}
      </div>
      <div className="occ-chart" ref={plotRef}>{content}</div>
      {reply && (
        <div className="occ-card-foot">
          <span>Totals above are the financial year so far. Hover a month for its numbers.</span>
          <strong>FY {reply.financial_year}</strong>
        </div>
      )}
    </section>
  );
}

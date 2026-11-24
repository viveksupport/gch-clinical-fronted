// filterDates.js
// Date helpers for the filter bar (FilterBar.jsx): the "Date range" choices, the From / To month lists,
// and the filters a page starts with. All dates are "YYYY-MM-DD" text; month keys are "YYYY-MM".

// Short month names in calendar order. MONTH_NAMES[0] is "Jan".
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Writes a number with two digits.   takes: 5   returns: "05"
function twoDigits(number) {
  return String(number).padStart(2, "0");
}

// Turns a JavaScript date into "YYYY-MM-DD" text.
function toDateText(date) {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

// The month part of a date.   takes: "2025-10-17"   returns: "2025-10" (a "month key")
export function monthKeyOf(dateText) {
  return dateText.slice(0, 7);
}

// takes: "2025-10"   returns: { year: 2025, month: 9, longLabel: "Oct 2025" }   (month 0 = January)
function monthInfo(monthKey) {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7)) - 1;
  return { year, month, longLabel: MONTH_NAMES[month] + " " + year };
}

// Moves a month key forwards or backwards.   takes: ("2025-10", 3)   returns: "2026-01"
function addMonths(monthKey, count) {
  const { year, month } = monthInfo(monthKey);
  return monthKeyOf(toDateText(new Date(year, month + count, 1)));   // JavaScript rolls the year over for us
}

// takes: "2025-10"   returns: "2025-10-01"
export function firstDayOfMonth(monthKey) {
  return monthKey + "-01";
}

// The last day of a month, but never later than today.   takes: "2025-10"   returns: "2025-10-31"
export function lastDayOfMonth(monthKey) {
  const { year, month } = monthInfo(monthKey);
  const lastDay = toDateText(new Date(year, month + 1, 0));   // day 0 of the next month = the last day of this month
  const today = toDateText(new Date());
  return lastDay > today ? today : lastDay;                   // "YYYY-MM-DD" text sorts like a date
}

// The last few months, including this one: from the 1st of the first month to today.
function lastMonths(count) {
  const thisMonth = monthKeyOf(toDateText(new Date()));
  return { startDate: firstDayOfMonth(addMonths(thisMonth, -(count - 1))), endDate: toDateText(new Date()) };
}

// A financial year (April to March).   takes: 0 = this one, 1 = the one before
function financialYear(yearsAgo) {
  const now = new Date();
  const currentStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;   // month 3 = April
  const startYear = currentStartYear - yearsAgo;
  const firstMonthKey = `${startYear}-04`;
  return {
    label: `FY ${startYear}/${twoDigits((startYear + 1) % 100)}`,
    startDate: firstDayOfMonth(firstMonthKey),
    endDate: lastDayOfMonth(addMonths(firstMonthKey, 11)),
  };
}

// The "Date range" choices, as [value, text shown].
export function presetOptions(rangeChoices) {
  if (rangeChoices) {
    return rangeChoices.map((choice) => [choice, choice === "custom" ? "Custom" : choice === "1" ? "Last 1 month" : `Last ${choice} months`]);
  }
  return [
    ["6", "Last 6 months"],
    ["12", "Last 12 months"],
    ["24", "Last 24 months"],
    ["fy0", financialYear(0).label],
    ["fy1", financialYear(1).label],
    ["custom", "Custom"],
  ];
}

// The start and end date of a "Date range" choice, counted from today ("custom" has none: null).
export function presetDates(preset) {
  if (/^\d+$/.test(preset)) return lastMonths(Number(preset));
  if (preset === "fy0") return financialYear(0);
  if (preset === "fy1") return financialYear(1);
  return null;
}

// The choices in the From / To month lists, oldest first, up to this month.
export function monthOptions(firstMonth) {
  const thisMonth = monthKeyOf(toDateText(new Date()));
  let monthKey = firstMonth || addMonths(thisMonth, -35);
  const options = [];
  while (monthKey <= thisMonth) {
    options.push([monthKey, monthInfo(monthKey).longLabel]);
    monthKey = addMonths(monthKey, 1);
  }
  return options;
}

// The filters a page starts with: a date range choice and all care homes.
//   takes: "6"   returns: { preset: "6", startDate: "2026-06-01", endDate: "2026-11-24", homeIds: [] }
export function startingFilters(preset = "6") {
  return { preset, ...presetDates(preset), homeIds: [] };   // homeIds [] = all care homes
}

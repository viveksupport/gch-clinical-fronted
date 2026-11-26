// ServiceUserTable.jsx
// The list of service users on the Occupancy page: everyone whose file overlaps the period.
// A file status filter (All / Open / Closed), a closed category filter (closed_category from the API),
// a suspended category filter (suspended_category from the API),
// a search box (home, name or reason) and pages of PAGE_SIZE rows, so long lists stay quick.
//
// Props:
//   users = the period's service users (utils/serviceUserRules.js): [{ care_home_name, user_id, first_name, ..., is_death, is_hospital }]

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Dropdown from "../other/Dropdown";
import "../../css/FilterBar.css";   // the Dropdown's look (its rules also apply under .dd-host)

const PAGE_SIZE = 50;

// "2026-06-01" → "01 Jun 2026", nothing → "—"
function niceDate(dateText) {
  if (!dateText) return "—";
  return new Date(dateText + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fullName(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
}

// "open" → "Open", "closed" → "Closed", nothing → "—"
function statusText(fileStatus) {
  return fileStatus ? fileStatus.charAt(0).toUpperCase() + fileStatus.slice(1) : "—";
}

// The text a row is searched by, worked out once per row: the categories shown in the list,
// and the free-text reasons behind them.
function searchText(user) {
  return [user.care_home_name, fullName(user), user.closed_category, user.suspended_category,
    user.suspended_reason, user.closed_reason]
    .filter(Boolean).join(" ").toLowerCase();
}

// The file status choices in the dropdown above the list: [value, text]. "closed" includes the deceased.
const STATUS_CHOICES = [["all", "All"], ["open", "Open"], ["closed", "Closed"]];

// The closed categories the backend sorts closed_reason into (closed_category,
// etl/clinical/transform/service_users_mapper.py CLOSED_CATEGORIES). Open files have none, so a category hides them.
const CLOSED_CATEGORIES = ["Left", "Deceased-Expected", "Deceased-Unexpected", "Discharged", "Transferred", "Other"];
const CLOSED_OPTIONS = [["all", "All"], ...CLOSED_CATEGORIES.map((category) => [category, category])];

// The suspended categories the backend sorts suspended_reason into (suspended_category,
// etl/clinical/transform/service_users_mapper.py SUSPENDED_CATEGORIES), in the same order. The value is the category itself.
const REASONS = [
  "Medical Appointment",
  "Emergency Department presentation",
  "Hospital admission",
  "Day Trip",
  "Holiday",
  "Other",
];

// The category a row is suspended for, or null when the person is not suspended
// (a reason on someone not suspended is the note from coming back, so it is not counted).
function reasonOf(user) {
  if (!user.suspended_status) return null;
  return user.suspended_category || "Other";
}

// The suspended category choices in the dropdown: [value, text].
const REASON_OPTIONS = [["all", "All"], ...REASONS.map((category) => [category, category])];

export default function ServiceUserTable({ users }) {
  const [status, setStatus] = useState("all");
  const [closed, setClosed] = useState("all");
  const [reason, setReason] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => users.map((user) => ({ user, text: searchText(user), reason: reasonOf(user) })), [users]);

  // The file status choices, each with how many rows it would show: "Open (2,656)".
  const statusOptions = useMemo(() => {
    const openCount = rows.filter((row) => row.user.file_status === "open").length;
    const counts = { all: rows.length, open: openCount, closed: rows.length - openCount };
    return STATUS_CHOICES.map(([value, text]) => [value, value === "all" ? text : `${text} (${counts[value].toLocaleString()})`]);
  }, [rows]);

  const byStatus = status === "all" ? rows
    : rows.filter((row) => (row.user.file_status === "open") === (status === "open"));
  const byClosed = closed === "all" ? byStatus : byStatus.filter((row) => row.user.closed_category === closed);
  const byReason = reason === "all" ? byClosed : byClosed.filter((row) => row.reason === reason);
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matching = words.length ? byReason.filter((row) => words.every((word) => row.text.includes(word))) : byReason;

  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);   // the list got shorter (new search or filters): stay in range
  const shown = matching.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const onSearch = (event) => { setSearch(event.target.value); setPage(0); };
  const onStatus = (value) => { setStatus(value); setPage(0); };
  const onClosed = (value) => { setClosed(value); setPage(0); };
  const onReason = (value) => { setReason(value); setPage(0); };

  return (
    <section className="occ-card occ-list" aria-label="Service users">
      <div className="occ-list__head">
        <div>
          <h2>Service users</h2>
          <p>{matching.length.toLocaleString()} {matching.length === 1 ? "service user" : "service users"} in the period</p>
        </div>
        <label className="occ-search">
          <Search size={15} aria-hidden="true" />
          <input type="search" value={search} onChange={onSearch} placeholder="Search home, name or reason…" aria-label="Search service users" />
        </label>
      </div>

      {/* The list's own filters, in a row of their own under the title */}
      <div className="occ-list__filters">
        <div className="occ-filter dd-host">
          <span className="occ-filter__label">File status</span>
          <Dropdown className="pill" label="File status" value={status} active={status !== "all"}
            options={statusOptions} onChange={onStatus} />
        </div>
        <div className="occ-filter occ-filter--wide dd-host">
          <span className="occ-filter__label">Suspended category</span>
          <Dropdown className="pill" label="Suspended category" value={reason} active={reason !== "all"}
            options={REASON_OPTIONS} onChange={onReason} />
        </div>
        <div className="occ-filter occ-filter--wide dd-host">
          <span className="occ-filter__label">Closed category</span>
          <Dropdown className="pill" label="Closed category" value={closed} active={closed !== "all"}
            options={CLOSED_OPTIONS} onChange={onClosed} />
        </div>
      </div>

      <div className="occ-table-wrap">
        <table className="occ-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>File opened</th>
              <th>File closed</th>
              <th>Closed category</th>
              <th>Closed reason</th>
              <th>Suspended status</th>
              <th>Suspended date</th>
              <th>Suspended category</th>
              <th>Suspended reason</th>
              <th>Home name</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ user }) => (
              <tr key={user.user_id}>
                <td className="occ-name">{fullName(user)}</td>
                <td>
                  {/* file_status straight from the API: "open" or "closed" */}
                  <span className={`occ-tag occ-tag--${user.file_status === "open" ? "open" : "closed"}`}>
                    {statusText(user.file_status)}
                  </span>
                </td>
                <td>{niceDate(user.file_opened)}</td>
                <td>{niceDate(user.file_closed)}</td>
                <td>{user.closed_category || "—"}</td>
                <td className="occ-reason" title={user.closed_reason || undefined}>{user.closed_reason || "—"}</td>
                <td>
                  {user.suspended_status
                    ? <span className="occ-tag occ-tag--suspended">Yes</span>
                    : <span className="occ-tag occ-tag--closed">No</span>}
                </td>
                <td>{niceDate(user.suspended_date)}</td>
                <td>{user.suspended_category || "—"}</td>
                <td className="occ-reason" title={user.suspended_reason || undefined}>{user.suspended_reason || "—"}</td>
                <td>{user.care_home_name || "—"}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={11} className="occ-none">No service users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="occ-pager">
          <span>
            {(currentPage * PAGE_SIZE + 1).toLocaleString()}–{Math.min((currentPage + 1) * PAGE_SIZE, matching.length).toLocaleString()} of {matching.length.toLocaleString()}
          </span>
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page"><ChevronLeft size={16} /></button>
          <span>Page {currentPage + 1} of {pageCount}</span>
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount - 1} aria-label="Next page"><ChevronRight size={16} /></button>
        </div>
      )}
    </section>
  );
}

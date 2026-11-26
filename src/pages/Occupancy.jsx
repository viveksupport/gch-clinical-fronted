// Occupancy.jsx
// The Occupancy page: the page header, the filter bar (date range + care homes), the KPI cards and the list of service users.
//
// How it is built:
//   1. State:  the filters (period and care homes).
//   2. Homes:  the list of care homes comes from the master data API (useMasterData),
//              already cut down to the homes this user may see.
//   3. Data:   POST /clinical/service_users (useServiceUsers) gives the service users in the selected homes during
//              the period: file_opened <= end AND (file_closed IS NULL OR file_closed >= start),
//              plus kpi_count (the KPI cards' numbers for the same homes and period).
//   3b. Summary: POST /clinical/home_kpis (useHomeKpis): each care home's KPIs for ONE month, picked in the
//              summary's own Month / Year bar (summaryMonth).
//   4. Body:   KpiCards on top, then ServiceUserTable, then HomeKpiTable.

import { useState } from "react";
import PageHeader from "../components/other/PageHeader";
import FilterBar from "../components/other/FilterBar";
import Loader from "../components/other/Loader";
import KpiCards from "../components/occupancy/KpiCards";
import HomeKpiTable from "../components/occupancy/HomeKpiTable";
import ServiceUserTable from "../components/occupancy/ServiceUserTable";
import { startingFilters, thisMonth } from "../utils/filterDates";
import { useMasterData } from "../hooks/useMasterData";
import { useServiceUsers } from "../hooks/useServiceUsers";
import { useHomeKpis } from "../hooks/useHomeKpis";
import "../css/Occupancy.css";

// Starts on the last 6 months and all care homes, like the marketing pages.
const DEFAULT_FILTERS = startingFilters("6");

// The "Date range" choices on this page: last 1, 3 or 6 months, or a custom From / To range.
const RANGE_CHOICES = ["1", "3", "6", "custom"];

export default function Occupancy() {
  // ---- 1. The filters ----
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const updateFilters = (changes) => setFilters((old) => ({ ...old, ...changes }));   // change some, keep the rest
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // ---- 2. The care homes: the picked ones, or all of them ----
  const master = useMasterData();   // { homes, loading, error }
  const homeIds = filters.homeIds.length > 0 ? filters.homeIds : master.homes.map((home) => home.id);

  // ---- 3. The data: the service users in the homes during the period ----
  const serviceUsers = useServiceUsers(filters.startDate, filters.endDate, homeIds);
  const users = serviceUsers.data;   // shown exactly as the API sends it

  // ---- 3b. The care home summary: one month (its own Month / Year bar), the same homes (all of them by default) ----
  const [summaryMonth, setSummaryMonth] = useState(thisMonth());   // "2026-11"
  const homeKpis = useHomeKpis(summaryMonth, homeIds);             // { data, total, loading, error }

  // ---- 4. The page body ----
  let body;
  if (master.loading) body = <Loader text="Loading care homes…" />;
  else if (master.error) body = <p className="empty">Could not load care homes ({master.error}). Check the API is running.</p>;
  else if (master.homes.length === 0) body = <p className="empty">No care homes are linked to your account.</p>;
  else if (serviceUsers.loading) body = <Loader text="Loading service users…" />;
  else if (serviceUsers.error) body = <p className="empty">Could not load service users ({serviceUsers.error}). Check the API is running.</p>;
  else body = (
    <>
      <KpiCards kpi={serviceUsers.kpi} inPeriod={users.length} />
      <ServiceUserTable users={users} />
      <HomeKpiTable month={summaryMonth} onMonthChange={setSummaryMonth} result={homeKpis} />
    </>
  );

  return (
    <main className="page">
      <PageHeader title="Occupancy" subtitle="Residents and bed occupancy across your care homes." />

      <FilterBar filters={filters} homes={master.homes} defaultFilters={DEFAULT_FILTERS} rangeChoices={RANGE_CHOICES}
        updateFilters={updateFilters} onReset={resetFilters} />

      <div className="occ">{body}</div>
    </main>
  );
}

// useServiceUsers.js
// The Occupancy page's data: { data, kpi, loading, error }.
//
//   useServiceUsers(startDate, endDate, homeIds)
//     the service users in these homes during the period (data = the list, [] until it arrives)
//     and the KPI cards' numbers (kpi = the reply's kpi_count, null until it arrives).
//     Each period / set of homes is cached on its own, so going back to earlier filters is instant.

import { getServiceUsers } from "../api/serviceusersapi";
import { useDateRangeQuery } from "./useApiQuery";

export function useServiceUsers(startDate, endDate, homeIds) {
  const query = useDateRangeQuery("serviceUsers", getServiceUsers, startDate, endDate, homeIds);
  return {
    ...query,
    data: query.data?.data ?? [],             // the reply's list ([] until it arrives)
    kpi: query.data?.kpi_count ?? null,       // the reply's kpi_count (null until it arrives)
  };
}

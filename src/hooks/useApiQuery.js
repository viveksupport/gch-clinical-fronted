// useApiQuery.js
// The building blocks every data hook in this folder uses (TanStack Query: one shared cache for the app).
// Every hook gives back the same three things, like useMasterData:
//   data    = the API reply (null until it arrives)
//   loading = true while waiting for the reply
//   error   = the error message if the call failed ("" if it worked)

import { useQuery } from "@tanstack/react-query";

// TanStack's answer → { data, loading, error }
function resultOf(query) {
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? "",
  };
}

// For a POST with a date range and care homes, for example the clock records.
//   name      = the name of this data in the cache, for example "custrClock"
//   apiCall   = the API function: apiCall(startDate, endDate, homeIds)
//   startDate = "2026-10-01", endDate = "2026-10-31"
//   homeIds   = the selected homes' ids (home_unique_ids): ["A-1", "B-2"]
// Each different date range / set of homes is its own entry in the cache, so going back to
// filters used before shows the data at once. Nothing is asked for until there are homes and dates.
export function useDateRangeQuery(name, apiCall, startDate, endDate, homeIds) {
  const idsText = homeIds.join(",");   // text: the same homes always give the same cache key
  const query = useQuery({
    queryKey: [name, startDate, endDate, idsText],
    queryFn: () => apiCall(startDate, endDate, homeIds),
    enabled: Boolean(idsText && startDate && endDate),
  });
  return resultOf(query);
}

// useApiQuery.js
// The building blocks every data hook in this folder uses (TanStack Query: one shared cache for the app).
// Every hook gives back the same three things, like useMasterData:
//   data    = the API reply (null until it arrives)
//   loading = true while waiting for the reply
//   error   = the error message if the call failed ("" if it worked)

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// TanStack's answer → { data, loading, error }
function resultOf(query) {
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? "",
  };
}

// For a GET that returns a whole list (no filters), for example every home's CQC ratings.
//   name    = the name of this data in the cache, for example "cqcReviews"
//   apiCall = the function that calls the API (from src/api)
// Loaded once, then reused for 5 minutes (the default in main.jsx) by every page that asks for it.
export function useListQuery(name, apiCall) {
  const query = useQuery({
    queryKey: [name],
    queryFn: apiCall,
  });
  return resultOf(query);
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

// Turns a hook's answer into the rows a page uses: { rows, loading, error }.
//   makeRows = a function that turns the API reply into rows (it must be defined outside the component)
// The rows are worked out again only when a new reply arrives, not on every redraw.
export function useRows(query, makeRows) {
  const rows = useMemo(() => (query.data ? makeRows(query.data) : []), [query.data, makeRows]);
  return { rows, loading: query.loading, error: query.error };
}

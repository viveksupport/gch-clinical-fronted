// useYearKpis.js
// The financial year matrix's data: { data, loading, error }.
//
//   useYearKpis(homeIds)
//     homeIds = the homes' ids (home_unique_ids)
//     data    = the whole API reply (null until it arrives): months, data (one row per home), portfolio
//     The year is always the current financial year, so only the homes are in the cache key.

import { useQuery } from "@tanstack/react-query";
import { getYearKpis } from "../api/yearkpisapi";

export function useYearKpis(homeIds) {
  const idsText = homeIds.join(",");   // text: the same homes always give the same cache key
  const query = useQuery({
    queryKey: ["yearKpis", idsText],
    queryFn: () => getYearKpis(homeIds),
    enabled: Boolean(idsText),         // nothing is asked for until there are homes
  });
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? "",
  };
}

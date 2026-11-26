// useHomeKpis.js
// The care home summary's data: { data, total, loading, error }.
//
//   useHomeKpis(month, homeIds)
//     month   = "2026-10"
//     homeIds = the homes' ids (home_unique_ids)
//     data  = one row per home ([] until it arrives), total = every home added together (null until it arrives).
//     Each month / set of homes is cached on its own, so going back to a month seen before is instant.

import { useQuery } from "@tanstack/react-query";
import { getHomeKpis } from "../api/homekpisapi";

export function useHomeKpis(month, homeIds) {
  const idsText = homeIds.join(",");   // text: the same homes always give the same cache key
  const query = useQuery({
    queryKey: ["homeKpis", month, idsText],
    queryFn: () => getHomeKpis(month, homeIds),
    enabled: Boolean(month && idsText),   // nothing is asked for until there are homes
  });
  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? "",
  };
}

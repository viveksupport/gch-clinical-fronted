// useMasterData.js
// The care homes the logged-in user may see: loaded ONCE from /master_data and shared by every page
// (TanStack Query cache), then cut down to the home_ids in the login session.
//
// Every page gets the same three things:
//   homes   = [{ id, name }, ...] sorted A to Z   (id = home_unique_id, what the APIs need)
//   loading = true while waiting for the first reply
//   error   = the error message if the call failed ("" if it worked)

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMasterData } from "../api/masterdataapi";
import { getSession } from "../utils/session";

// The API reply { status, message, count, data: [...] } → [{ id, name }, ...] sorted by name
function homesFromReply(masterReply) {
  const rows = Array.isArray(masterReply?.data) ? masterReply.data : [];
  return rows
    .filter((row) => row && row.care_home_name && row.home_unique_id)   // leave out rows without a name or an id
    .map((row) => ({ id: String(row.home_unique_id), name: String(row.care_home_name) }))
    .sort((first, second) => first.name.localeCompare(second.name));
}

export function useMasterData() {
  const query = useQuery({
    queryKey: ["masterData"],     // the name of this data in the cache
    queryFn: getMasterData,       // the API call
    staleTime: Infinity,          // never reload during this visit (the homes list rarely changes)
  });

  // The homes this user may see, as text: "H1,H2" ("" when none).
  // Text, not a list: getSession() makes a new list every time, and useMemo would treat it as changed.
  const allowedText = (getSession()?.home_ids || []).join(",");

  // Only the allowed homes; worked out again only when the reply or the allowed homes change
  const homes = useMemo(() => {
    const allowed = new Set(allowedText ? allowedText.split(",") : []);
    return homesFromReply(query.data).filter((home) => allowed.has(home.id));
  }, [query.data, allowedText]);

  return {
    homes,
    loading: query.isLoading,
    error: query.error?.message ?? "",
  };
}

// masterdataapi.js
// The list of care homes (used by the filters on every page). Backend: APIs/routers/master.py
//   GET /master_data   returns: { status, message, count, data: [{ home_unique_id, care_home_name, post_code, page_id, ... }, ...] }
//   The pages here use home_unique_id and care_home_name; the other columns are for the admin app.

import { get } from "./client";

export function getMasterData() {
  return get("/master_data");
}

// homekpisapi.js
// Each care home's occupancy KPIs for one month. Backend: api/clinical/routers/service_user_month.py
//   POST /clinical/service_user_month   body: { month: "2026-10", home_unique_ids: [...] }
//   returns: { status, message, count,
//              data: [{ home_unique_id, care_home_name, cqc_rating, cqc_bed_count, occupancy, occupancy_rate,
//                       new_admission, recent_discharge, net_movement, hospital_admission, recent_deaths,
//                       suspended_profiles }, ...],
//              total: { the same counts for every home added together } }

import { postwithbody } from "./client";

export function getHomeKpis(month, homeIds) {
  return postwithbody("/clinical/service_user_month", {
    month,
    home_unique_ids: homeIds,
  });
}

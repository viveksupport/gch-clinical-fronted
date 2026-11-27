// yearkpisapi.js
// The current financial year (Apr – Mar) month by month, per care home. Backend: api/clinical/routers/service_user_year.py
//   POST /clinical/service_user_year   body: { home_unique_ids: [...] }
//   returns: { status, message, financial_year: "2026/27", data_until,
//              months: [{ month: "2026-04", month_name: "Apr", is_partial, is_future }, ... 12],
//              count,
//              data: [{ home_unique_id, care_home_name,
//                       months: [{ month, occupancy_rate, new_admission, recent_discharge,
//                                  net_movement, recent_deaths }] }],
//              portfolio: { months: [...] } }

import { postwithbody } from "./client";

export function getYearKpis(homeIds) {
  return postwithbody("/clinical/service_user_year", { home_unique_ids: homeIds });
}

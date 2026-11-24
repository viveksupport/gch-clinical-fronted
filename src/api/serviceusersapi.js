// serviceusersapi.js
// Service users (PCS). Backend: api/clinical/routers/service_users.py
//   POST /clinical/service_users   body: { start_date, end_date, home_unique_ids: [...] }  (one home, several, or all)
//   returns: { status, message, count, data: [{ home_unique_id, user_id, first_name, last_name, file_opened,
//              file_closed, file_status, closed_reason, suspended_status, suspended_date, suspended_reason,
//              room, is_day_care, care_home_name, ... }] }
//   Only the service users whose file overlaps the period:
//     file_opened <= end_date AND (file_closed IS NULL OR file_closed >= start_date)

import { postwithbody } from "./client";

export function getServiceUsers(startDate, endDate, homeIds) {
  return postwithbody("/clinical/service_users", {
    start_date: startDate,
    end_date: endDate,
    home_unique_ids: homeIds,
  });
}

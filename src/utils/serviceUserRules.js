// serviceUserRules.js
// Gets the period's service users (POST /clinical/service_users, already only the files that overlap the period)
// ready for the Occupancy page.
//
// Files closed as a duplicate / opened in error are left out: they were never real residents.
// closed_reason and suspended_reason are free text typed in PCS, so deaths and hospital stays are found by keyword:
//   is_death     the file is closed and the reason says the person died
//   is_hospital  the person is suspended and the reason says hospital / emergency department

// closed_reason values seen in PCS: "Deceased-Expected", "RIP", "R.I.P", "passed away", "Died in hospital", ...
const DEATH_PATTERN = /deceas|\br\.?\s*i\.?\s*p\b|passed\s*away|\bdied\b|\bdeath\b/i;
// suspended_reason values: "Hospital admission", "In hospital", "Emergency department presentation", ...
const HOSPITAL_PATTERN = /hospital|emergency\s*department|\bA\s*&\s*E\b/i;
// closed_reason values for files opened by mistake: "duplicate", "DUPCLICATE", "Double entry", "Error entry", "In error", ...
const DUPLICATE_PATTERN = /dup\w*cate|double\s*entry|^error\b|error\s*entry|in\s*error|by\s*mistake/i;

const matches = (pattern, text) => Boolean(text) && pattern.test(text);

// The API list without duplicate files, each row with is_death and is_hospital added.
export function prepareServiceUsers(users) {
  return users
    .filter((user) => !matches(DUPLICATE_PATTERN, user.closed_reason))
    .map((user) => ({
      ...user,
      is_death: Boolean(user.file_closed) && matches(DEATH_PATTERN, user.closed_reason),
      is_hospital: Boolean(user.suspended_status) && matches(HOSPITAL_PATTERN, user.suspended_reason),
    }));
}

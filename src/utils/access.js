// access.js
// Checks a feature code against the logged-in user's features (from the session).
import { getSession } from "./session";

function accessMap() {
  const list = getSession()?.features ?? [];
  return Object.fromEntries(
    list.map((f) => [f.feature_code, { read: f.can_read || f.can_write, write: f.can_write }])
  );
}

// true when the user can see the page for this code (no code = page not locked)
export function canRead(code) {
  if (!code) return true;
  return Boolean(accessMap()[code]?.read);
}

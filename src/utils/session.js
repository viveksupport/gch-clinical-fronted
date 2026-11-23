// session.js
// Remembers who is logged in, for this browser tab, using sessionStorage.
//
// HOW IT WORKS
//   saveSession(user)  after a successful login: stores the user's details (never the password)
//   getSession()       anywhere: gives the logged-in user, or null when nobody is logged in
//   clearSession()     on sign out: forgets the user
//
// sessionStorage keeps the data until this browser TAB is closed (a refresh keeps it).
// The session also ends by itself after SESSION_HOURS, even if the tab stays open.
//
// IMPORTANT: this only decides what the WEBSITE shows. It does not protect the API:
// anyone can still call the API directly. Protecting the API needs a token checked by the server.

const SESSION_KEY = "gch_user";   // the name the data is stored under
const SESSION_HOURS = 8;          // how long a login lasts

// Stores the logged-in user.
//   takes: { user_name, first_name, last_name, roles, features, home_ids, all_feature_codes } from the login reply
export function saveSession(user) {
  const session = {
    user_name: user.user_name,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    // role names only: ["Admin"]
    roles: (user.roles || []).map((role) => role.role_name),
    // what this user can open: [{ feature_code: "DASH_FB", can_read: true, can_write: true }]
    features: (user.features || []).map((feature) => ({
      feature_code: feature.feature_code,
      can_read: Boolean(feature.can_read),
      can_write: Boolean(feature.can_write),
    })),
    // the care homes this user can see
    home_ids: user.home_ids || [],
    expires_at: Date.now() + SESSION_HOURS * 60 * 60 * 1000,   // now + 8 hours, in milliseconds
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));   // sessionStorage only stores text
  } catch {
    // storage is blocked (for example a private window with strict settings): the login still works until a refresh
  }
}

// The logged-in user, or null when nobody is logged in (or the session has run out or is broken).
export function getSession() {
  try {
    const text = sessionStorage.getItem(SESSION_KEY);
    if (!text) return null;

    const session = JSON.parse(text);   // text back into an object
    if (!session?.user_name || !(session.expires_at > Date.now())) {
      sessionStorage.removeItem(SESSION_KEY);   // run out or broken: forget it
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// Forgets the logged-in user (sign out).
export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // nothing to do
  }
}

// The user's name for display: "Vivek Kanthariya", or the user name when there is no first or last name.
export function displayName(session) {
  const name = `${session?.first_name || ""} ${session?.last_name || ""}`.trim();
  return name || session?.user_name || "";
}

// The user's roles for display: "Admin" or "Admin, Marketing" ("" when they have none).
export function roleText(session) {
  return (session?.roles || []).join(", ");
}
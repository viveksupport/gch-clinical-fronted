// UserBadge.jsx
// The logged-in user's card, for the right-hand side of a page header:
//   a round avatar with their initials (and a green "online" dot), a greeting,
//   their full name and their role.
// It reads the user from the login session (utils/session.js), so nothing is asked of the API.
//
// It is shown on every page through PageHeader.jsx.

import { getSession, displayName, roleText } from "../../utils/session";
import "../../css/UserBadge.css";

// "Good morning" before 12:00, "Good afternoon" until 18:00, otherwise "Good evening" (the PC's own clock).
function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Up to two initials: "Vivek Kanthariya" -> "VK", "marketing" -> "MA"
function initialsOf(user) {
  const first = String(user.first_name || "").trim();
  const last = String(user.last_name || "").trim();
  if (first || last) return ((first[0] || "") + (last[0] || "")).toUpperCase();
  return String(user.user_name || "?").slice(0, 2).toUpperCase();
}

export default function UserBadge() {
  const user = getSession();
  if (!user) return null;   // nobody logged in: show nothing

  const name = displayName(user);   // "Sandip Panchal" (or the user name)
  const role = roleText(user);      // "Admin" (or "" when they have no role)

  return (
    <div className="user-badge" title={role ? `${name} · ${role}` : name}>
      <span className="user-badge__avatar" aria-hidden="true">
        {initialsOf(user)}
        <i className="user-badge__status" />
      </span>
      <span className="user-badge__text">
        <span className="user-badge__greet">{greeting()}</span>
        <span className="user-badge__name">{name}</span>
        {role && <span className="user-badge__dept">{role}</span>}
      </span>
    </div>
  );
}

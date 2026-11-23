// loginapi.js
// Login. Backend: APIs/routers/auth.py
//   POST /login   body: { "user_name": "...", "password": "..." }
//   returns: { status: true,  message: "Login successful", data: { user_name, first_name, last_name, role_ids, roles, features, home_ids } }

import { postwithbody } from "./client";

export function login(user_name, password) {
  return postwithbody("/login", {
    user_name: user_name.trim(),   // no spaces before or after the user name
    password: password,            // the password is sent exactly as typed
  });
}

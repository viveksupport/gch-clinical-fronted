// Login.jsx
// The sign-in page.
//
// HOW IT WORKS
//   1. Already logged in? Go straight to the dashboard.
//   2. The user types a user name and password; validationLogin() checks them before sending.
//   3. login() calls POST /login. On success, saveSession() remembers the user for this tab,
//      and the page moves to the page the user wanted (or the dashboard).
//   4. On failure, the API's message is shown ("Invalid username or password"), or a connection message.

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/goldcare-logo.svg";
import "../css/Login.css";
import { validationLogin } from "../utils/validation";
import { login } from "../api/loginapi";
import { getSession, saveSession } from "../utils/session";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);   // true while waiting for the API (stops double clicks)
  const navigate = useNavigate();
  const location = useLocation();

  // The page the user tried to open before being sent here (Layout.jsx passes it), otherwise the dashboard
  const nextPage = location.state?.from || "/dashboard";

  // 1. Already logged in: no need to sign in again
  if (getSession()) return <Navigate to={nextPage} replace />;

  async function handleSubmit(event) {
    event.preventDefault();   // stops the browser reloading the page
    if (loading) return;

    // 2. Check the form first
    const message = validationLogin(userName, password);
    if (message) {
      setError(message);
      return;
    }

    setError("");
    setLoading(true);
    try {
      // 3. Ask the API
      const reply = await login(userName, password);

      if (reply?.status && reply.data?.user_name) {
        saveSession(reply.data);                  // remember the user for this tab
        setPassword("");                          // don't keep the password in memory
        navigate(nextPage, { replace: true });    // replace: the Back button won't return to the login page
        return;
      }

      // 4. Wrong details (or a switched-off account): the API's own message
      setError(reply?.message || "Invalid username or password");
    } catch (err) {
      // The API could not be reached, or replied with an error code (for example 422 or 500)
      setError(err.message.includes("Server replied")
        ? "Sign in failed. Please try again."
        : "Cannot reach the server. Check the API is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gc-login">
      <div className="gc-login__card">
        <img className="gc-login__logo" src={logo} alt="Gold Care Homes" />
        <h1 className="gc-login__title">Sign in</h1>
        <p className="gc-login__hint">Use your work credentials to open the dashboard.</p>

        <form className="gc-login__form" onSubmit={handleSubmit} noValidate>
          <label className="gc-login__label" htmlFor="user_name">User name</label>
          <input
            className="gc-login__input"
            id="user_name"
            type="text"
            autoComplete="username"
            autoFocus
            maxLength={50}
            value={userName}
            onChange={(event) => { setUserName(event.target.value); setError(""); }}
            placeholder="Your user name"
            disabled={loading}
          />

          <label className="gc-login__label" htmlFor="password">Password</label>
          <input
            className="gc-login__input"
            id="password"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            value={password}
            onChange={(event) => { setPassword(event.target.value); setError(""); }}
            placeholder="••••••••"
            disabled={loading}
          />

          {error && <p className="gc-login__error" role="alert">{error}</p>}

          <button type="submit" className="gc-login__button" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

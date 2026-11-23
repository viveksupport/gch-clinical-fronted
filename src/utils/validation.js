// validation.js
// Checks the login form before anything is sent to the API.
//   returns: "" when everything is fine, otherwise the message to show

export function validationLogin(userName, password) {
  const name = String(userName ?? "").trim();
  if (!name) return "Enter your user name";
  if (name.length > 50) return "User name must be 50 characters or fewer";
  if (!password) return "Enter your password";
  if (password.length > 128) return "Password must be 128 characters or fewer";
  return "";
}

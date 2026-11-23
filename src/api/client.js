// client.js
// The one place that knows the API's address and how to talk to it.
// Every other file in src/api uses get() or postwithbody() from here, so the address, the headers
// and the error handling are set once (and a login token can be added here later, for every call).
//
// The API address: set VITE_API_URL in a .env file next to package.json to change it
// (for example VITE_API_URL=http://192.168.8.130:8080); otherwise http://localhost:8080 is used.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Turns a failed reply into an Error with a clear message, using the API's own explanation when there is one.
//   FastAPI sends { "detail": "start_date must be on or before end_date" } (400) or a list of field problems (422).
async function errorFrom(response) {
  let detail = "";
  try {
    const body = await response.json();
    detail = typeof body?.detail === "string" ? body.detail
      : Array.isArray(body?.detail) ? body.detail.map((item) => item.msg).filter(Boolean).join("; ")
      : "";
  } catch {
    // the reply was not JSON: keep just the status code
  }
  return new Error(`Server replied ${response.status}${detail ? ": " + detail : ""}`);
}

// Sends a POST request with a JSON body, and returns the reply as a JavaScript object.
//   path = the part after the address, for example "/facebook_page_data"
//   body = the data to send, as a JavaScript object
export async function postwithbody(path, body) {
  const response = await fetch(BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },   // tells the API the body is JSON
    body: JSON.stringify(body),                         // turns the object into JSON text
  });
  if (!response.ok) throw await errorFrom(response);    // for example 400, 404, 422 or 500
  return response.json();
}

// Sends a GET request (no body), and returns the reply as a JavaScript object.
export async function get(path) {
  const response = await fetch(BASE_URL + path, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw await errorFrom(response);
  return response.json();
}

// NoAccess.jsx
// Shown in place of a page the user's account can't open.
export default function NoAccess() {
  return (
    <main style={{ padding: 40 }}>
      <h1>No access</h1>
      <p>Your account doesn't have access to this page. Ask an admin if you need it.</p>
    </main>
  );
}
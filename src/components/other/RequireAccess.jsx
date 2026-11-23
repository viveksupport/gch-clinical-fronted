// RequireAccess.jsx
// The page sends its feature code; the page shows only if the user may read it.
//   <RequireAccess code="DASH_FB"><Facebook /></RequireAccess>
import { canRead } from "../../utils/access";
import NoAccess from "../../pages/NoAccess";

export default function RequireAccess({ code, children }) {
  return canRead(code) ? children : <NoAccess />;
}
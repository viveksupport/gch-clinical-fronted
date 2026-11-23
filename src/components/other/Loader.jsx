// Loader.jsx
// The loading screen every page shows while its data is on the way:
// the Gold Care Homes logo with a slow "breathing" glow, a gold ring turning around it,
// the message underneath (for example "Loading CQC data…") and three bouncing dots.
//
// Use it anywhere:
//   import Loader from "../components/other/Loader";
//   if (loading) return <Loader text="Loading CQC data…" />;
//
// Props:
//   text  = the message under the logo (default "Loading…")
//
// The styles are in Loader.css. Everything moves with CSS only, and it stays still for people
// who have "reduce motion" switched on in their computer settings.

import logo from "../../assets/goldcare-logo.svg";
import "../../css/Loader.css";

export default function Loader({ text = "Loading…" }) {
  return (
    // role="status" + aria-live: screen readers read the message out
    <div className="gcd-loader" role="status" aria-live="polite">
      <div className="gcd-loader__badge" aria-hidden="true">
        <span className="gcd-loader__ring" />           {/* the turning gold ring */}
        <span className="gcd-loader__glow" />           {/* the soft breathing glow behind the logo */}
        <img className="gcd-loader__logo" src={logo} alt="" />
      </div>

      <p className="gcd-loader__text">{text}</p>

      <span className="gcd-loader__dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  );
}

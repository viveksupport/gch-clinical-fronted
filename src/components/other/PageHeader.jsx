// PageHeader.jsx
// The header at the top of every dashboard page: the title and a short description on the left,
// the logged-in user's card (UserBadge) on the right.
// One component for every page, so they all look the same and a change here changes them all.
//
// Props:
//   title     the page title, for example "Custr Clock Analytics"
//   subtitle  (optional) the line under the title
//   children  (optional) anything extra to show on the right, before the user card
//
// Use:
//   import PageHeader from "../components/other/PageHeader";
//   <PageHeader title="Food safety" subtitle="Food hygiene ratings and risk across the portfolio" />

import UserBadge from "./UserBadge";
import "../../css/PageHeader.css";

export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header page-header--with-user">
      <div className="page-header__text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="page-header__side">
        {children}
        <UserBadge />
      </div>
    </header>
  );
}

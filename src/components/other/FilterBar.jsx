// FilterBar.jsx
// The row of filters under the page header: date range, from month, to month and care homes.
// It is the same filter bar as the marketing app's pages (without the monthly target), so they look and work the same.
//
// The filter bar does not keep the filters itself. It shows the values it is given,
// and tells the page when the user changes one (by calling updateFilters).
//
// Props:
//   filters        = the current filters: { preset, startDate, endDate, homeIds }
//   homes          = every care home: [{ name, id }, ...]
//   defaultFilters = the filters the page started with (to know whether anything has been changed)
//   updateFilters  = call with the filters to change, for example updateFilters({ homeIds: ["A-1"] })
//   onReset        = call to put every filter back to how it started
//   firstMonth     = (optional) the earliest month in the From / To lists, for example "2016-01" (default: the last 36 months)
//   rangeChoices   = (optional) only these "Date range" choices, for example ["1", "3", "6", "custom"].
//                    Without "custom" in the list, the From / To month boxes are hidden.
//
// Use:
//   import FilterBar from "../components/other/FilterBar";
//   import { startingFilters } from "../utils/filterDates";
//   const DEFAULT_FILTERS = startingFilters("6");
//   <FilterBar filters={filters} homes={homes} defaultFilters={DEFAULT_FILTERS} updateFilters={...} onReset={...} />

import Icon from "./FilterIcon";
import Dropdown from "./Dropdown";
import MultiDropdown from "./MultiDropdown";
import { firstDayOfMonth, lastDayOfMonth, monthKeyOf, monthOptions, presetDates, presetOptions } from "../../utils/filterDates";
import "../../css/FilterBar.css";

// ---- The component ----

export default function FilterBar({ filters, homes, defaultFilters, updateFilters, onReset, firstMonth, rangeChoices }) {
  const homeOptions = homes.map((home) => [home.id, home.name]);
  const selectedCount = filters.homeIds.length > 0 ? filters.homeIds.length : homes.length;   // [] means every home

  const fromMonth = monthKeyOf(filters.startDate);
  const toMonth = monthKeyOf(filters.endDate);

  // A From or To month was picked. If From is after To, they are swapped; the range becomes "Custom".
  const setMonths = (monthA, monthB) => {
    const earlier = monthA <= monthB ? monthA : monthB;
    const later = monthA <= monthB ? monthB : monthA;
    updateFilters({ startDate: firstDayOfMonth(earlier), endDate: lastDayOfMonth(later), preset: "custom" });
  };

  // A "Date range" choice was picked: set its dates too ("Custom" keeps the dates as they are).
  const choosePreset = (preset) => {
    const dates = presetDates(preset);
    updateFilters(dates ? { preset, ...dates } : { preset });
  };

  // True when every filter still has its starting value (the reset button is then greyed out).
  const isDefault = Object.keys(defaultFilters).every((key) => JSON.stringify(filters[key]) === JSON.stringify(defaultFilters[key]));

  return (
    <div className="fbar" aria-label="Filters">
      <div className="fbar-in">
        <div className="fgroup">
          <span className="ftitle"><Icon name="filters" />Filters</span>

          {/* Date range */}
          <Dropdown className="pill" icon="calendar" label="Date range" value={filters.preset} active={filters.preset !== defaultFilters.preset}
            options={presetOptions(rangeChoices)} onChange={choosePreset} />

          {/* From month – To month */}
          {(!rangeChoices || rangeChoices.includes("custom")) && (
            <span className="frange">
              <Dropdown className="pill" label="From month" value={fromMonth} active={filters.preset === "custom"} options={monthOptions(firstMonth)} onChange={(monthKey) => setMonths(monthKey, toMonth)} />
              <span>–</span>
              <Dropdown className="pill" label="To month" value={toMonth} active={filters.preset === "custom"} options={monthOptions(firstMonth)} onChange={(monthKey) => setMonths(fromMonth, monthKey)} />
            </span>
          )}

          {/* Care homes: tick one, several, or "All care homes" */}
          <MultiDropdown className="pill" icon="home" label="Care homes" allText="All care homes" itemName="care homes"
            options={homeOptions} selected={filters.homeIds} active={filters.homeIds.length > 0}
            onChange={(homeIds) => updateFilters({ homeIds })} />
        </div>

        {/* Right-hand side: how many homes are selected, and the reset button */}
        <div className="fmeta">
          <span><strong>{selectedCount}</strong> of {homes.length} homes</span>
          <button type="button" className="freset" onClick={onReset} disabled={isDefault} aria-label="Reset filters" title="Reset filters">
            <Icon name="reset" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

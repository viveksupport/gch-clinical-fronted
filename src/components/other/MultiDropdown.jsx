// MultiDropdown.jsx
// A dropdown where several options can be ticked at once, with an "All" option at the top.
// It looks like Dropdown.jsx and uses the same CSS, plus a tick box in front of each option.
//
// How the selection is stored:
//   selected = [] (an empty list)        means "All" (every option counts as ticked)
//   selected = ["id-1", "id-3"]          means only those options are ticked
// Unticking "All" leaves just the first option ticked.
//
// Props:
//   options   = [[value, text shown], ...]
//   selected  = the values ticked now (an empty list means "All")
//   onChange  = called with the new list of values whenever the ticks change
//   allText   = the text of the "All" option, for example "All care homes"
//   itemName  = what the options are called, for the button text, for example "care homes" -> "3 care homes"
//   label     = a name for screen readers
//   className = (optional) extra CSS classes, for example "pill"
//   icon      = (optional) the name of an icon to show on the left
//   active    = (optional) true to tint the dropdown, showing its filter has been changed

import { useEffect, useRef, useState } from "react";
import Icon from "./FilterIcon";

export default function MultiDropdown({ options, selected, onChange, allText, itemName, label, className = "", icon, active = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);   // 0 = the "All" row, 1 = the first option, ...
  const [alignRight, setAlignRight] = useState(false);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  const allValues = options.map(([value]) => value);
  const isAll = selected.length === 0;
  const isTicked = (value) => isAll || selected.includes(value);

  // The text on the button: "All care homes", the one home's name, or "3 care homes".
  let buttonText = allText;
  if (selected.length === 1) buttonText = options.find(([value]) => value === selected[0])?.[1] ?? allText;
  if (selected.length > 1) buttonText = `${selected.length} ${itemName}`;

  // While the list is open, close it when the user clicks anywhere outside the dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event) => { if (!boxRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // Keep the highlighted row in view when moving with the arrow keys.
  useEffect(() => {
    const list = listRef.current;
    const item = isOpen && list ? list.children[highlightedIndex] : null;
    if (!item) return;
    const itemBottom = item.offsetTop + item.offsetHeight;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (itemBottom > list.scrollTop + list.clientHeight) list.scrollTop = itemBottom - list.clientHeight;
  }, [isOpen, highlightedIndex]);

  const openList = () => {
    const box = boxRef.current.getBoundingClientRect();
    setAlignRight(box.left + 300 > window.innerWidth);   // near the right edge of the window: open leftwards
    setHighlightedIndex(0);
    setIsOpen(true);
  };

  // Click "All":
  //   - when it is not ticked, tick it: clear the list, which means every option
  //   - when it is already ticked, untick it: only the first option stays ticked
  const chooseAll = () => {
    if (isAll) onChange(allValues.slice(0, 1));   // slice(0, 1) = a list with just the first value
    else onChange([]);
  };

  // Tick or untick one option. The list stays open, so several can be picked in a row.
  const toggle = (value) => {
    let ticked;
    if (isAll) ticked = allValues.filter((other) => other !== value);    // from "All": untick just this one
    else if (selected.includes(value)) ticked = selected.filter((other) => other !== value);
    else ticked = [...selected, value];

    if (ticked.length === 0) return;                          // the last ticked option cannot be unticked
    if (ticked.length === allValues.length) ticked = [];      // everything ticked is the same as "All"
    onChange(allValues.filter((other) => ticked.includes(other)));   // keep the options' own order
  };

  // Row 0 is "All"; row 1 onwards are the options.
  const chooseRow = (row) => (row === 0 ? chooseAll() : toggle(allValues[row - 1]));
  const rowCount = options.length + 1;

  const onKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openList(); }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setHighlightedIndex((row) => Math.min(rowCount - 1, row + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setHighlightedIndex((row) => Math.max(0, row - 1)); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseRow(highlightedIndex); }
    else if (event.key === "Tab") setIsOpen(false);
  };

  // A small square box, with a tick drawn inside when ticked.
  const tickBox = (ticked) => (
    <span className={"dd-box" + (ticked ? " on" : "")} aria-hidden="true">
      {ticked && (
        <svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </span>
  );

  return (
    <div className={`dd multi ${className}${isOpen ? " open" : ""}${active ? " active" : ""}`} ref={boxRef}>
      {/* The button that shows what is ticked */}
      <button type="button" className="dd-btn" aria-haspopup="listbox" aria-expanded={isOpen} aria-label={label}
        onClick={() => (isOpen ? setIsOpen(false) : openList())} onKeyDown={onKeyDown}>
        {icon && <Icon name={icon} />}
        <span className="dd-val">{buttonText}</span>
        <svg className="dd-arrow" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* The list: "All" first, then one row per option */}
      {isOpen && (
        <ul className={"dd-list" + (alignRight ? " right" : "")} role="listbox" aria-multiselectable="true" ref={listRef}>
          <li role="option" aria-selected={isAll}
            className={"dd-opt dd-all" + (isAll ? " sel" : "") + (highlightedIndex === 0 ? " act" : "")}
            onPointerEnter={() => setHighlightedIndex(0)} onClick={chooseAll}>
            {tickBox(isAll)}<span>{allText}</span>
          </li>
          {options.map(([value, text], index) => (
            <li key={value} role="option" aria-selected={isTicked(value)}
              className={"dd-opt" + (!isAll && isTicked(value) ? " sel" : "") + (highlightedIndex === index + 1 ? " act" : "")}
              onPointerEnter={() => setHighlightedIndex(index + 1)} onClick={() => toggle(value)}>
              {tickBox(isTicked(value))}<span>{text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

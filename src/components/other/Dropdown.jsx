// Dropdown.jsx
// A dropdown list, used in place of the browser's own select box so it can be styled.
// It works with the mouse and with the keyboard (arrow keys, Enter, Escape, or typing a letter).
//
// Props:
//   value     = the value of the option selected now
//   onChange  = called with the new value when a different option is picked
//   options   = [[value, text shown], ...]
//   label     = a name for screen readers
//   id        = (optional) lets a <label htmlFor="..."> point at this dropdown
//   className = (optional) extra CSS classes, for example "pill" for the rounded filter-bar style
//   icon      = (optional) the name of an icon to show on the left
//   active    = (optional) true to tint the dropdown, showing its filter has been changed

import { useEffect, useRef, useState } from "react";
import Icon from "./FilterIcon";

export default function Dropdown({ id, value, onChange, options, label, className = "", icon, active = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);   // the option under the mouse or the arrow keys
  const [alignRight, setAlignRight] = useState(false);           // true = the list opens leftwards
  const boxRef = useRef(null);    // the whole dropdown
  const listRef = useRef(null);   // the open list of options

  // The position of the selected option in the list (the first option if nothing matches).
  const selectedIndex = Math.max(0, options.findIndex((option) => String(option[0]) === String(value)));

  // While the list is open, close it when the user clicks anywhere outside the dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event) => { if (!boxRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // Keep the highlighted option in view when moving with the arrow keys.
  // This scrolls the list itself, never the page.
  useEffect(() => {
    const list = listRef.current;
    const item = isOpen && list ? list.children[highlightedIndex] : null;
    if (!item) return;
    const itemBottom = item.offsetTop + item.offsetHeight;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;                                        // item is above the visible part
    else if (itemBottom > list.scrollTop + list.clientHeight) list.scrollTop = itemBottom - list.clientHeight;   // item is below it
  }, [isOpen, highlightedIndex]);

  const openList = () => {
    const box = boxRef.current.getBoundingClientRect();
    setAlignRight(box.left + 300 > window.innerWidth);   // near the right edge of the window: open leftwards
    setHighlightedIndex(selectedIndex);
    setIsOpen(true);
  };

  // Pick the option at this position. onChange is only called if it is a different option.
  const choose = (index) => {
    setIsOpen(false);
    const chosenValue = options[index][0];
    if (String(chosenValue) !== String(value)) onChange(chosenValue);
  };

  const onKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openList(); }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setHighlightedIndex((index) => Math.min(options.length - 1, index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setHighlightedIndex((index) => Math.max(0, index - 1)); }
    else if (event.key === "Home") { event.preventDefault(); setHighlightedIndex(0); }
    else if (event.key === "End") { event.preventDefault(); setHighlightedIndex(options.length - 1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(highlightedIndex); }
    else if (event.key === "Tab") setIsOpen(false);
    else if (event.key.length === 1) {
      // A letter was typed: jump to the first option starting with it.
      const matchIndex = options.findIndex((option) => String(option[1]).toLowerCase().startsWith(event.key.toLowerCase()));
      if (matchIndex >= 0) setHighlightedIndex(matchIndex);
    }
  };

  return (
    <div className={`dd ${className}${isOpen ? " open" : ""}${active ? " active" : ""}`} ref={boxRef}>
      {/* The button that shows the selected option */}
      <button type="button" id={id} className="dd-btn" aria-haspopup="listbox" aria-expanded={isOpen} aria-label={label}
        onClick={() => (isOpen ? setIsOpen(false) : openList())} onKeyDown={onKeyDown}>
        {icon && <Icon name={icon} />}
        <span className="dd-val">{options[selectedIndex]?.[1]}</span>
        <svg className="dd-arrow" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* The list of options, only drawn while open */}
      {isOpen && (
        <ul className={"dd-list" + (alignRight ? " right" : "")} role="listbox" ref={listRef}>
          {options.map(([optionValue, text], index) => (
            <li key={optionValue} role="option" aria-selected={index === selectedIndex}
              className={"dd-opt" + (index === selectedIndex ? " sel" : "") + (index === highlightedIndex ? " act" : "")}
              onPointerEnter={() => setHighlightedIndex(index)} onClick={() => choose(index)}>
              <span>{text}</span>
              {index === selectedIndex && (
                <svg className="dd-check" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

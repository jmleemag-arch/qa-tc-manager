import { useEffect, useRef, useState } from "react";
import {
  IS_WORKING_FILTER_ALL,
  IS_WORKING_FILTER_OPTIONS,
} from "../constants/testCaseConstants";

function FilterIcon() {
  return (
    <svg
      className="tc-working-filter-icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M1.5 2.5h13l-5 6v4.5l-3-1.5V8.5l-5-6z" />
    </svg>
  );
}

function WorkingFilterButton({ workingFilter, onWorkingFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onWorkingFilterChange(value);
    setIsOpen(false);
  };

  const activeLabel =
    IS_WORKING_FILTER_OPTIONS.find((option) => option.value === workingFilter)
      ?.label ?? "전체";

  return (
    <div className="tc-working-filter-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`tc-working-filter-btn ${
          workingFilter !== IS_WORKING_FILTER_ALL ? "active" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`작동 여부 필터: ${activeLabel}`}
        title={`작동 여부 필터 (${activeLabel})`}
      >
        <FilterIcon />
      </button>

      {isOpen && (
        <div className="tc-working-filter-menu">
          {IS_WORKING_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                workingFilter === option.value
                  ? "tc-working-filter-option active"
                  : "tc-working-filter-option"
              }
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkingFilterButton;

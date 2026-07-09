import { useMemo } from "react";
import {
  getDefaultVersionForYear,
  getVersionsForYear,
  groupIssueVersionsByYear,
} from "../utils/issueVersionUtils";

function VersionYearVersionPicker({
  versions,
  selectedYear,
  selectedVersion,
  onYearChange,
  onVersionChange,
  yearLabel = "년도",
  versionLabel = "버전",
  className = "",
}) {
  const yearGroups = useMemo(
    () => groupIssueVersionsByYear(versions),
    [versions]
  );

  const versionsInYear = useMemo(
    () => getVersionsForYear(versions, selectedYear),
    [versions, selectedYear]
  );

  const handleYearChange = (year) => {
    onYearChange(year);
    onVersionChange(getDefaultVersionForYear(versions, year));
  };

  if (yearGroups.length === 0) {
    return (
      <div className={`tr-version-picker-empty ${className}`.trim()}>
        등록된 버전이 없습니다.
      </div>
    );
  }

  return (
    <div className={`tr-version-picker ${className}`.trim()}>
      <div className="tr-version-picker-years" role="tablist" aria-label={yearLabel}>
        <span className="tr-version-picker-label">{yearLabel}</span>
        <div className="tr-version-year-tabs">
          {yearGroups.map((group) => (
            <button
              key={group.yearLabel}
              type="button"
              role="tab"
              aria-selected={selectedYear === group.yearLabel}
              className={
                selectedYear === group.yearLabel
                  ? "tr-version-year-tab active"
                  : "tr-version-year-tab"
              }
              onClick={() => handleYearChange(group.yearLabel)}
            >
              {group.yearLabel}
            </button>
          ))}
        </div>
      </div>

      <label className="tr-version-picker-select">
        <span>{versionLabel}</span>
        <select
          value={selectedVersion}
          onChange={(e) => onVersionChange(e.target.value)}
          disabled={versionsInYear.length === 0}
        >
          {versionsInYear.length === 0 ? (
            <option value="">버전 없음</option>
          ) : (
            versionsInYear.map((version) => (
              <option key={version.version} value={version.version}>
                {version.version}
              </option>
            ))
          )}
        </select>
      </label>
    </div>
  );
}

export default VersionYearVersionPicker;

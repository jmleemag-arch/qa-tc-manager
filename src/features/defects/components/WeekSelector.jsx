import { useMemo, useRef } from "react";
import {
  formatWeekRangeLabel,
  getAdjacentWeekAnchor,
  getWeekOfMonthLabel,
  getWeekRange,
  resolveWeekAnchorFromDate,
} from "../utils/newIssueUtils";

function WeekSelector({
  weekAnchorDate,
  weeksWithData,
  issues,
  onWeekChange,
}) {
  const dateInputRef = useRef(null);
  const { startDate, endDate } = useMemo(
    () => getWeekRange(weekAnchorDate),
    [weekAnchorDate]
  );
  const prevWeekAnchor = useMemo(
    () => getAdjacentWeekAnchor(weekAnchorDate, weeksWithData, -1),
    [weekAnchorDate, weeksWithData]
  );
  const nextWeekAnchor = useMemo(
    () => getAdjacentWeekAnchor(weekAnchorDate, weeksWithData, 1),
    [weekAnchorDate, weeksWithData]
  );

  const handlePrevWeek = () => {
    if (prevWeekAnchor) {
      onWeekChange(prevWeekAnchor);
    }
  };

  const handleNextWeek = () => {
    if (nextWeekAnchor) {
      onWeekChange(nextWeekAnchor);
    }
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.click();
  };

  const handleDatePick = (event) => {
    const pickedDate = event.target.value;

    if (!pickedDate) {
      return;
    }

    onWeekChange(resolveWeekAnchorFromDate(pickedDate, issues));
    event.target.value = "";
  };

  if (weeksWithData.length === 0) {
    return null;
  }

  return (
    <div className="df-week-selector">
      <button
        type="button"
        className="df-week-nav-btn"
        onClick={handlePrevWeek}
        disabled={!prevWeekAnchor}
        aria-label="이전 주차"
      >
        ‹
      </button>
      <div className="df-week-label">
        <strong>{getWeekOfMonthLabel(weekAnchorDate)}</strong>
        <span>{formatWeekRangeLabel(startDate, endDate)}</span>
        <button
          type="button"
          className="df-week-calendar-btn"
          onClick={handleCalendarClick}
          aria-label="날짜로 주차 선택"
          title="날짜로 주차 선택"
        >
          📅
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="df-week-date-input"
          onChange={handleDatePick}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      <button
        type="button"
        className="df-week-nav-btn"
        onClick={handleNextWeek}
        disabled={!nextWeekAnchor}
        aria-label="다음 주차"
      >
        ›
      </button>
    </div>
  );
}

export default WeekSelector;

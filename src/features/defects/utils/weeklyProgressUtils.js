import { ISSUE_ROUND_STATUS } from "../constants/defectConstants.js";

export const WEEKLY_STATUS_FILTER_ALL = "전체";

export const WEEKLY_STATUS_FILTER_OPTIONS = [
  WEEKLY_STATUS_FILTER_ALL,
  "미작성",
  "작성 중",
  "작성 완료",
];

export const WEEKLY_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function toDisplayStatus(status) {
  if (status === ISSUE_ROUND_STATUS.COMPLETED) {
    return "작성 완료";
  }

  if (status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    return "작성 중";
  }

  return "미작성";
}

export function toDbStatusFilter(displayStatus) {
  if (displayStatus === "작성 완료") {
    return ISSUE_ROUND_STATUS.COMPLETED;
  }

  if (displayStatus === "작성 중") {
    return ISSUE_ROUND_STATUS.IN_PROGRESS;
  }

  if (displayStatus === "미작성") {
    return ISSUE_ROUND_STATUS.NOT_STARTED;
  }

  return "";
}

export function formatPeriodLabel(thursdayDate) {
  if (!thursdayDate) {
    return "-";
  }

  const thursday = new Date(thursdayDate);
  const start = new Date(thursday);
  start.setDate(thursday.getDate() - 3);
  const end = new Date(thursday);
  end.setDate(thursday.getDate() + 3);

  const format = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  return `${format(start)} ~ ${format(end)}`;
}

export function formatDotDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).replaceAll("-", ".");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function calculateCompletionRate(total, newCount) {
  if (!total || total <= 0 || newCount === null || newCount === undefined) {
    return 0;
  }

  return Math.round(((total - newCount) / total) * 100);
}

export function getProgressFraction(round) {
  if (round.total === null || round.total === undefined) {
    return null;
  }

  if (round.status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    if (round.inProgress === null || round.inProgress === undefined) {
      return null;
    }

    return {
      numerator: round.inProgress,
      denominator: round.total,
    };
  }

  if (
    round.status === ISSUE_ROUND_STATUS.COMPLETED &&
    round.newCount !== null &&
    round.newCount !== undefined
  ) {
    return {
      numerator: round.newCount,
      denominator: round.total,
    };
  }

  return null;
}

export function getCompletionPercent(round) {
  if (round.status === ISSUE_ROUND_STATUS.NOT_STARTED) {
    return 0;
  }

  if (round.status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    return 0;
  }

  return calculateCompletionRate(round.total, round.newCount);
}

export function getProgressTone(percent, status) {
  if (status === ISSUE_ROUND_STATUS.COMPLETED && percent >= 100) {
    return "complete";
  }

  if (percent > 0) {
    return "active";
  }

  return "idle";
}

export function getFractionTone(status) {
  if (status === ISSUE_ROUND_STATUS.COMPLETED) {
    return "green";
  }

  if (status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    return "orange";
  }

  return "gray";
}

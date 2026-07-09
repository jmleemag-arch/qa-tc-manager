import { formatDateOnly } from "./weekUtils.js";

export const ISSUE_ROUND_STATUS = {
  NOT_STARTED: "미작성",
  IN_PROGRESS: "작성중",
  COMPLETED: "작성완료",
};

export function getThursdaysInMonth(year, month) {
  const thursdays = [];
  const cursor = new Date(year, month - 1, 1);

  while (cursor.getMonth() === month - 1) {
    if (cursor.getDay() === 4) {
      thursdays.push(new Date(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return thursdays;
}

export function buildRoundLabel(month, weekOfMonth) {
  return `${month}월 ${weekOfMonth}주차`;
}

export function buildYearLabel(year) {
  return `${year}년`;
}

export function getThursdayWeekMeta(thursdayDate) {
  const date = new Date(thursdayDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const thursdays = getThursdaysInMonth(year, month);
  const weekOfMonth =
    thursdays.findIndex(
      (entry) => formatDateOnly(entry) === formatDateOnly(date)
    ) + 1;

  return {
    year,
    month,
    weekOfMonth,
    thursdayDate: date,
    roundLabel: buildRoundLabel(month, weekOfMonth),
    yearLabel: buildYearLabel(year),
  };
}

export function buildThursdayRoundsInRange(startDate, endDate) {
  const rounds = [];
  const cursor = new Date(startDate);
  const end = new Date(endDate);

  cursor.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    if (cursor.getDay() === 4) {
      rounds.push(getThursdayWeekMeta(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return rounds;
}

export function getVersionDateRange(version) {
  const year = version.year ?? new Date().getFullYear();
  const start = version.startDate
    ? new Date(version.startDate)
    : new Date(year, 0, 1);
  const end = version.endDate
    ? new Date(version.endDate)
    : new Date(year, 11, 31);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function sortIssueRounds(rounds = []) {
  return [...rounds].sort((left, right) => {
    if (right.year !== left.year) {
      return right.year - left.year;
    }

    if (right.month !== left.month) {
      return right.month - left.month;
    }

    if (right.weekOfMonth !== left.weekOfMonth) {
      return right.weekOfMonth - left.weekOfMonth;
    }

    return (right.dbId ?? 0) - (left.dbId ?? 0);
  });
}

export function deriveRoundStatus({ total, inProgress, newCount, status }) {
  if (status === ISSUE_ROUND_STATUS.COMPLETED) {
    return ISSUE_ROUND_STATUS.COMPLETED;
  }

  const hasAnyValue =
    total !== null &&
    total !== undefined &&
    inProgress !== null &&
    inProgress !== undefined &&
    newCount !== null &&
    newCount !== undefined;

  if (!hasAnyValue) {
    return ISSUE_ROUND_STATUS.NOT_STARTED;
  }

  return ISSUE_ROUND_STATUS.IN_PROGRESS;
}

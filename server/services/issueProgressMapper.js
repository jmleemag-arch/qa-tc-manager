import { formatDateOnly } from "../utils/weekUtils.js";
import {
  buildRoundLabel,
  buildYearLabel,
  ISSUE_ROUND_STATUS,
  sortIssueRounds,
} from "../utils/issueRoundUtils.js";

function formatDotDate(value) {
  if (!value) {
    return "";
  }

  return formatDateOnly(value).replaceAll("-", ".");
}

function buildPeriodLabel(thursdayDate) {
  const thursday = new Date(thursdayDate);
  const start = new Date(thursday);
  start.setDate(thursday.getDate() - 3);
  const end = new Date(thursday);
  end.setDate(thursday.getDate() + 3);

  return `${formatDotDate(start)} ~ ${formatDotDate(end)}`;
}

function toDisplayStatus(status) {
  if (status === ISSUE_ROUND_STATUS.COMPLETED) {
    return "작성 완료";
  }

  if (status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    return "작성 중";
  }

  return "미작성";
}

function calculateCompletionRate(total, newCount) {
  if (total === null || total === undefined || total <= 0) {
    return 0;
  }

  if (newCount === null || newCount === undefined) {
    return 0;
  }

  return Math.round(((total - newCount) / total) * 100);
}

function getProgressFraction(record) {
  if (record.total === null || record.total === undefined) {
    return null;
  }

  if (record.status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    if (record.inProgress === null || record.inProgress === undefined) {
      return null;
    }

    return {
      numerator: record.inProgress,
      denominator: record.total,
    };
  }

  if (
    record.status === ISSUE_ROUND_STATUS.COMPLETED &&
    record.newCount !== null &&
    record.newCount !== undefined
  ) {
    return {
      numerator: record.newCount,
      denominator: record.total,
    };
  }

  return null;
}

function getCompletionPercent(record) {
  if (record.status === ISSUE_ROUND_STATUS.NOT_STARTED) {
    return 0;
  }

  if (record.status === ISSUE_ROUND_STATUS.IN_PROGRESS) {
    return 0;
  }

  return calculateCompletionRate(record.total, record.newCount);
}

export function toIssueProgressRoundResponse(record) {
  const versionName = record.version?.versionName ?? "";
  const fraction = getProgressFraction(record);
  const completionPercent = getCompletionPercent(record);

  return {
    dbId: record.id,
    id: `${versionName}-${record.year}-${record.month}-${record.weekOfMonth}`,
    versionId: record.versionId,
    versionName,
    year: record.year,
    month: record.month,
    weekOfMonth: record.weekOfMonth,
    roundLabel: buildRoundLabel(record.month, record.weekOfMonth),
    yearLabel: buildYearLabel(record.year),
    thursdayDate: formatDateOnly(record.thursdayDate),
    period: buildPeriodLabel(record.thursdayDate),
    total: record.total,
    inProgress: record.inProgress,
    newCount: record.newCount,
    status: record.status,
    displayStatus: toDisplayStatus(record.status),
    author: record.createdBy ?? "",
    writtenDate: record.writtenAt ? formatDotDate(record.writtenAt) : "",
    progressFraction: fraction,
    progressLabel: fraction
      ? `${fraction.numerator} / ${fraction.denominator}`
      : "-",
    completionPercent,
    createdAt: formatDateOnly(record.createdAt),
    updatedAt: formatDateOnly(record.updatedAt),
  };
}

export function sortIssueProgressRows(rows = []) {
  return sortIssueRounds(rows);
}

export { sortIssueRounds };

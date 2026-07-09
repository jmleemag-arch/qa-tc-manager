import { formatDateOnly } from "../utils/weekUtils.js";
import {
  buildRoundLabel,
  buildYearLabel,
  sortIssueRounds,
} from "../utils/issueRoundUtils.js";

export function toIssueProgressRoundResponse(record) {
  const versionName = record.version?.versionName ?? "";

  return {
    dbId: record.id,
    id: `${versionName}-${record.year}-${record.month}-${record.weekOfMonth}`,
    versionName,
    year: record.year,
    month: record.month,
    weekOfMonth: record.weekOfMonth,
    roundLabel: buildRoundLabel(record.month, record.weekOfMonth),
    yearLabel: buildYearLabel(record.year),
    thursdayDate: formatDateOnly(record.thursdayDate),
    total: record.total,
    inProgress: record.inProgress,
    newCount: record.newCount,
    status: record.status,
  };
}

export function sortIssueProgressRows(rows = []) {
  return sortIssueRounds(rows);
}

export { sortIssueRounds };

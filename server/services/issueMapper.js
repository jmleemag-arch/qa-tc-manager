import { formatDateOnly } from "../utils/weekUtils.js";
import { buildRoundLabel } from "../utils/issueRoundUtils.js";

export const ISSUE_REDMINE_STATUS = {
  PENDING: "대기",
  SYNCED: "등록완료",
  FAILED: "Redmine 등록 실패",
};

export function toIssueResponse(issue) {
  const issueId = issue.redmineIssueId
    ? `#${issue.redmineIssueId}`
    : `#${issue.id}`;

  return {
    id: issue.id,
    issueId,
    title: issue.title,
    description: issue.description ?? "",
    project: issue.project ?? "",
    menu: issue.menu ?? "",
    priority: issue.priority ?? "",
    severity: issue.severity ?? "",
    assignee: issue.assignee ?? "",
    redmineStatus: issue.redmineStatus ?? ISSUE_REDMINE_STATUS.PENDING,
    redmineUrl: issue.redmineUrl ?? "",
    redmineError: issue.redmineError ?? "",
    registeredAt: formatDateOnly(issue.createdOn),
    createdOn: issue.createdOn.toISOString(),
    roundYear: issue.roundYear ?? null,
    roundMonth: issue.roundMonth ?? null,
    roundWeek: issue.roundWeek ?? null,
    roundLabel:
      issue.roundMonth && issue.roundWeek
        ? buildRoundLabel(issue.roundMonth, issue.roundWeek)
        : "",
    thursdayDate: issue.thursdayDate
      ? formatDateOnly(issue.thursdayDate)
      : "",
    weekStart: formatDateOnly(issue.weekStart),
    weekEnd: formatDateOnly(issue.weekEnd),
  };
}

export function toIssueRoundResponse(round) {
  return {
    year: round.year,
    month: round.month,
    weekOfMonth: round.weekOfMonth,
    roundLabel: buildRoundLabel(round.month, round.weekOfMonth),
    thursdayDate: formatDateOnly(round.thursdayDate),
    count: round.count ?? 0,
    roundKey: `${round.year}-${round.month}-${round.weekOfMonth}`,
  };
}

export function toWeekResponse(weekStart, weekEnd, count) {
  return {
    weekStart: formatDateOnly(weekStart),
    weekEnd: formatDateOnly(weekEnd),
    count,
  };
}

import { formatDateOnly } from "../utils/weekUtils.js";

export function toIssueResponse(issue) {
  const issueId = issue.redmineIssueId
    ? `#${issue.redmineIssueId}`
    : `#${issue.id}`;

  return {
    id: issue.id,
    issueId,
    title: issue.title,
    menu: issue.menu ?? "",
    severity: issue.severity ?? "",
    assignee: issue.assignee ?? "",
    registeredAt: formatDateOnly(issue.createdOn),
    createdOn: issue.createdOn.toISOString(),
    weekStart: formatDateOnly(issue.weekStart),
    weekEnd: formatDateOnly(issue.weekEnd),
  };
}

export function toWeekResponse(weekStart, weekEnd, count) {
  return {
    weekStart: formatDateOnly(weekStart),
    weekEnd: formatDateOnly(weekEnd),
    count,
  };
}

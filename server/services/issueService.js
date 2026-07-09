import { getIssueRepository } from "../repositories/issueDataSource.js";
import { toIssueResponse, toWeekResponse } from "./issueMapper.js";

export async function listIssues(filters = {}) {
  const repository = getIssueRepository();
  const result = await repository.findIssues(filters);

  return {
    items: result.items.map(toIssueResponse),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}

export async function getIssueWeeks() {
  const repository = getIssueRepository();
  const weeks = await repository.findIssueWeeks();

  return weeks.map((week) =>
    toWeekResponse(week.weekStart, week.weekEnd, week.count)
  );
}

export async function getIssueAssignees() {
  const repository = getIssueRepository();
  return repository.findIssueAssignees();
}

export async function getIssueById(id) {
  const repository = getIssueRepository();
  const issue = await repository.findIssueById(id);

  if (!issue) {
    return null;
  }

  return toIssueResponse(issue);
}

export async function createIssue(payload) {
  const repository = getIssueRepository();
  const issue = await repository.createIssue(payload);
  return toIssueResponse(issue);
}

export async function updateIssue(id, payload) {
  const repository = getIssueRepository();
  const issue = await repository.findIssueById(id);

  if (!issue) {
    return null;
  }

  const updated = await repository.updateIssue(id, payload);
  return toIssueResponse(updated);
}

export async function syncIssuesFromRedmine() {
  throw new Error("REDMINE_SYNC_NOT_IMPLEMENTED");
}

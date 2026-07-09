import { createRedmineIssue } from "../integrations/redmineClient.js";
import { getIssueRepository } from "../repositories/issueDataSource.js";
import { notifyAllActiveUsers } from "./notificationService.js";
import {
  ISSUE_REDMINE_STATUS,
  toIssueResponse,
  toIssueRoundResponse,
} from "./issueMapper.js";

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

export async function getIssueRounds({ year } = {}) {
  const repository = getIssueRepository();
  const rounds = await repository.findIssueRounds({ year });

  return rounds.map(toIssueRoundResponse);
}

export async function getIssueWeeks() {
  const repository = getIssueRepository();
  const weeks = await repository.findIssueWeeks();

  return weeks.map((week) => ({
    weekStart: week.weekStart.toISOString().slice(0, 10),
    weekEnd: week.weekEnd.toISOString().slice(0, 10),
    count: week.count,
  }));
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

async function pushIssueToRedmine(issue, payload) {
  const repository = getIssueRepository();

  try {
    const redmineIssue = await createRedmineIssue({
      title: payload.title ?? issue.title,
      description: payload.description ?? issue.description,
      project: payload.project ?? issue.project,
      assignee: payload.assignee ?? issue.assignee,
      priority: payload.priority ?? issue.priority,
      menu: payload.menu ?? issue.menu,
    });

    const updated = await repository.updateIssueRedmineResult(issue.id, {
      redmineIssueId: redmineIssue.id,
      redmineUrl: redmineIssue.url,
      redmineStatus: ISSUE_REDMINE_STATUS.SYNCED,
      redmineError: null,
    });

    const response = toIssueResponse(updated);

    await notifyAllActiveUsers({
      type: "issue_registered",
      message: `${response.issueId} ${response.title}`,
      targetType: "issue",
      targetId: response.id,
    }).catch(() => {});

    return response;
  } catch (error) {
    const updated = await repository.updateIssueRedmineResult(issue.id, {
      redmineStatus: ISSUE_REDMINE_STATUS.FAILED,
      redmineError: error.message,
    });

    return toIssueResponse(updated);
  }
}

export async function createIssue(payload) {
  const repository = getIssueRepository();
  const draft = await repository.createIssueDraft(payload);

  return pushIssueToRedmine(draft, payload);
}

export async function retryRedmineIssue(id) {
  const repository = getIssueRepository();
  const issue = await repository.findIssueById(id);

  if (!issue) {
    return null;
  }

  return pushIssueToRedmine(issue, issue);
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

import "dotenv/config";

function getRedmineConfig() {
  const baseUrl = String(process.env.REDMINE_URL ?? "").trim().replace(/\/$/, "");
  const apiKey = String(process.env.REDMINE_API_KEY ?? "").trim();
  const projectId = String(process.env.REDMINE_PROJECT_ID ?? "").trim();
  const mockMode =
    process.env.REDMINE_MOCK === "true" || !baseUrl || !apiKey || !projectId;

  return {
    baseUrl,
    apiKey,
    projectId,
    mockMode,
    menuCustomFieldId: process.env.REDMINE_MENU_CUSTOM_FIELD_ID ?? "",
    priorityMap: {
      Low: Number(process.env.REDMINE_PRIORITY_LOW_ID ?? 1),
      Normal: Number(process.env.REDMINE_PRIORITY_NORMAL_ID ?? 2),
      High: Number(process.env.REDMINE_PRIORITY_HIGH_ID ?? 3),
      Urgent: Number(process.env.REDMINE_PRIORITY_URGENT_ID ?? 4),
    },
  };
}

export function buildRedmineIssueUrl(issueId) {
  const { baseUrl, mockMode } = getRedmineConfig();

  if (mockMode) {
    return `https://redmine.example/issues/${issueId}`;
  }

  return `${baseUrl}/issues/${issueId}`;
}

export async function createRedmineIssue(payload) {
  const config = getRedmineConfig();
  const projectId = payload.project || config.projectId;
  const priorityName = payload.priority || "Normal";
  const priorityId =
    config.priorityMap[priorityName] ?? config.priorityMap.Normal;

  if (config.mockMode) {
    const mockId = String(
      5000 + Math.floor(Math.random() * 9000) + Date.now() % 1000
    );

    return {
      id: mockId,
      url: buildRedmineIssueUrl(mockId),
      mock: true,
    };
  }

  const issueBody = {
    issue: {
      project_id: projectId,
      subject: payload.title,
      description: payload.description ?? "",
      priority_id: priorityId,
    },
  };

  if (payload.assignee) {
    issueBody.issue.assigned_to_id = await resolveAssigneeId(
      payload.assignee,
      config
    );
  }

  const customFields = [];

  if (payload.menu && config.menuCustomFieldId) {
    customFields.push({
      id: Number(config.menuCustomFieldId),
      value: payload.menu,
    });
  }

  if (customFields.length > 0) {
    issueBody.issue.custom_fields = customFields;
  }

  const response = await fetch(`${config.baseUrl}/issues.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": config.apiKey,
    },
    body: JSON.stringify(issueBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `REDMINE_CREATE_FAILED: ${response.status} ${errorText.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const issueId = String(data.issue?.id ?? "");

  if (!issueId) {
    throw new Error("REDMINE_CREATE_FAILED: missing issue id");
  }

  return {
    id: issueId,
    url: buildRedmineIssueUrl(issueId),
    mock: false,
  };
}

async function resolveAssigneeId(assigneeName, config) {
  const response = await fetch(
    `${config.baseUrl}/users.json?status=1&name=${encodeURIComponent(assigneeName)}`,
    {
      headers: {
        "X-Redmine-API-Key": config.apiKey,
      },
    }
  );

  if (!response.ok) {
    return undefined;
  }

  const data = await response.json();
  const matchedUser = (data.users ?? []).find(
    (user) =>
      user.firstname === assigneeName ||
      user.lastname === assigneeName ||
      `${user.firstname} ${user.lastname}`.trim() === assigneeName
  );

  return matchedUser?.id;
}

export function getDefaultRedmineProject() {
  return getRedmineConfig().projectId;
}

export function isRedmineMockMode() {
  return getRedmineConfig().mockMode;
}

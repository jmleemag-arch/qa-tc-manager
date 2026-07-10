import XLSX from "xlsx";
import { prisma } from "../db.js";
import { formatDateOnly } from "../utils/weekUtils.js";

import { formatRunDisplayId } from "./testRunMapper.js";

const DASHBOARD_LIMIT = 5;
const COMPLETED_RESULTS = new Set(["O", "X", "BLOCK", "N/A"]);

function isActiveVersion(version) {
  const status = String(version.status ?? "").toLowerCase();
  return (
    status.includes("active") ||
    status.includes("progress") ||
    status.includes("활성") ||
    status.includes("진행")
  );
}

function toDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toRelativeDay(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000
  );

  if (diffDays <= 0) {
    return "오늘";
  }

  return `${diffDays}일 전`;
}

function toVersionResponse(version) {
  if (!version) {
    return null;
  }

  return {
    id: version.id,
    versionName: version.versionName,
    status: version.status,
    startDate: version.startDate ? formatDateOnly(version.startDate) : "",
    endDate: version.endDate ? formatDateOnly(version.endDate) : "",
  };
}

function pickCurrentVersion(versions, versionId) {
  const requestedId = Number(versionId);

  if (Number.isFinite(requestedId)) {
    const requested = versions.find((version) => version.id === requestedId);

    if (requested) {
      return requested;
    }
  }

  return (
    versions.find(isActiveVersion) ??
    versions[0] ??
    null
  );
}

function normalizeRunStatus(status, progress) {
  const rawStatus = String(status ?? "");

  if (progress >= 100 || rawStatus.includes("완료")) {
    return "완료";
  }

  if (rawStatus.includes("중단") || rawStatus.toLowerCase().includes("stop")) {
    return "중단";
  }

  if (progress > 0 || rawStatus.includes("진행")) {
    return "진행 중";
  }

  return "준비";
}

function toRunResponse(run, sequence) {
  const totalCount = run.items.length;
  const completedCount = run.items.filter((item) =>
    COMPLETED_RESULTS.has(String(item.result ?? ""))
  ).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const lastExecutedAt =
    run.items
      .map((item) => item.executedAt)
      .filter(Boolean)
      .sort((left, right) => right - left)[0] ??
    run.completedAt ??
    run.startedAt ??
    run.createdAt;

  return {
    id: run.id,
    runId: formatRunDisplayId(sequence, new Date(run.createdAt).getFullYear()),
    name: run.runName,
    versionName: run.version?.versionName ?? "",
    progress,
    status: normalizeRunStatus(run.status, progress),
    lastExecutedAt: toDateTime(lastExecutedAt),
  };
}

function getIssueStatusKey(issue) {
  const status = String(issue.redmineStatus ?? "").toLowerCase();

  if (status.includes("closed") || status.includes("종료")) {
    return "closed";
  }

  if (status.includes("retest") || status.includes("재검증")) {
    return "retest";
  }

  if (status.includes("resolved") || status.includes("해결")) {
    return "resolved";
  }

  if (status.includes("progress") || status.includes("진행")) {
    return "inProgress";
  }

  return "new";
}

function toIssueResponse(issue) {
  return {
    id: issue.id,
    issueId: issue.redmineIssueId ? `#${issue.redmineIssueId}` : `#${issue.id}`,
    status: issue.redmineStatus ?? "신규",
    title: issue.title,
    registeredAt: formatDateOnly(issue.createdOn),
    redmineUrl: issue.redmineUrl ?? "",
    redmineError: issue.redmineError ?? "",
  };
}

function getRoundStatus(round) {
  if (round.status?.includes("완료")) {
    return "작성 완료";
  }

  if (
    round.total !== null ||
    round.inProgress !== null ||
    round.newCount !== null ||
    round.status?.includes("작성")
  ) {
    return "작성 중";
  }

  return "미작성";
}

function toWeeklyReportResponse(round) {
  const thursday = new Date(round.thursdayDate);
  const start = new Date(thursday);
  start.setDate(thursday.getDate() - 3);
  const end = new Date(thursday);
  end.setDate(thursday.getDate() + 3);

  return {
    id: round.id,
    label: `${round.month}월 ${round.weekOfMonth}주차`,
    period: `${formatDateOnly(start)} ~ ${formatDateOnly(end)}`,
    status: getRoundStatus(round),
    createdAt: formatDateOnly(round.createdAt),
  };
}

function toNoticeResponse(notice) {
  return {
    id: notice.id,
    category: notice.category,
    title: notice.title,
    content: notice.content ?? "",
    createdBy: notice.createdBy ?? "",
    createdAt: formatDateOnly(notice.createdAt),
  };
}

const NOTIFICATION_KIND_LABELS = {
  mention: "멘션",
  assignee: "담당자 지정",
  issue_registered: "신규 등록",
  test_run_complete: "테스트 런 완료",
  version_release: "릴리스",
  status_change: "상태 변경",
};

function getNotificationKind(type) {
  return NOTIFICATION_KIND_LABELS[type] ?? "알림";
}

async function getUser(userId) {
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { userId: String(userId).trim() },
  });
}

async function getTasks({ user, versionId }) {
  if (!user) {
    return [];
  }

  const [notifications, issues, retestIssues] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: DASHBOARD_LIMIT,
    }),
    prisma.issue.findMany({
      where: {
        versionId,
        assignee: {
          in: [user.name, user.userId],
        },
        NOT: {
          redmineStatus: {
            contains: "재검증",
          },
        },
      },
      orderBy: [{ createdOn: "desc" }, { id: "desc" }],
      take: DASHBOARD_LIMIT,
    }),
    prisma.issue.findMany({
      where: {
        versionId,
        assignee: {
          in: [user.name, user.userId],
        },
        redmineStatus: {
          contains: "재검증",
        },
      },
      orderBy: [{ createdOn: "desc" }, { id: "desc" }],
      take: DASHBOARD_LIMIT,
    }),
  ]);

  return [
    ...notifications.map((notification) => ({
      id: `notification-${notification.id}`,
      kind: getNotificationKind(notification.type),
      title: notification.message,
      when: toRelativeDay(notification.createdAt),
      targetType: notification.targetType ?? "notification",
      targetId: notification.targetId ?? notification.id,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    })),
    ...retestIssues.map((issue) => ({
      id: `retest-${issue.id}`,
      kind: "재검증 요청",
      title: `${issue.redmineIssueId ? `#${issue.redmineIssueId} ` : ""}${issue.title}`,
      when: toRelativeDay(issue.createdOn),
      targetType: "issue",
      targetId: issue.id,
      isRead: false,
      createdAt: issue.createdOn.toISOString(),
    })),
    ...issues.map((issue) => ({
      id: `issue-${issue.id}`,
      kind: "담당 TC",
      title: `${issue.redmineIssueId ? `#${issue.redmineIssueId} ` : ""}${issue.title}`,
      when: toRelativeDay(issue.createdOn),
      targetType: "issue",
      targetId: issue.id,
      isRead: false,
      createdAt: issue.createdOn.toISOString(),
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, DASHBOARD_LIMIT);
}

async function getTestRuns(versionId) {
  const runs = await prisma.testRun.findMany({
    where: { versionId },
    include: {
      version: { select: { versionName: true } },
      items: { select: { result: true, executedAt: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: DASHBOARD_LIMIT,
  });

  const totalRuns = await prisma.testRun.findMany({
    select: { id: true, createdAt: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const sequenceById = new Map(
    totalRuns.map((run, index) => [run.id, index + 1])
  );

  return runs
    .map((run) => toRunResponse(run, sequenceById.get(run.id) ?? run.id))
    .sort((left, right) => {
      const leftComplete = left.status === "완료" ? 1 : 0;
      const rightComplete = right.status === "완료" ? 1 : 0;

      if (leftComplete !== rightComplete) {
        return leftComplete - rightComplete;
      }

      return 0;
    })
    .slice(0, DASHBOARD_LIMIT);
}

async function getDefectData(versionId) {
  const issues = await prisma.issue.findMany({
    where: { versionId },
    orderBy: [{ createdOn: "desc" }, { id: "desc" }],
  });
  const summaryConfig = [
    ["new", "신규"],
    ["inProgress", "진행 중"],
    ["resolved", "해결"],
    ["retest", "재검증"],
    ["closed", "종료"],
  ];
  const counts = Object.fromEntries(summaryConfig.map(([key]) => [key, 0]));

  issues.forEach((issue) => {
    counts[getIssueStatusKey(issue)] += 1;
  });

  return {
    summary: summaryConfig.map(([key, label]) => ({
      key,
      label,
      count: counts[key],
    })),
    recent: issues.slice(0, DASHBOARD_LIMIT).map(toIssueResponse),
  };
}

async function getWeeklyReports(versionId) {
  const rounds = await prisma.issueProgressRound.findMany({
    where: { versionId },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
      { weekOfMonth: "desc" },
      { id: "desc" },
    ],
    take: DASHBOARD_LIMIT,
  });

  return rounds.map(toWeeklyReportResponse);
}

async function getNotices() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: DASHBOARD_LIMIT,
  });

  return notices.map(toNoticeResponse);
}

export async function getDashboardOverview({ versionId, userId } = {}) {
  const versions = await prisma.version.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const currentVersion = pickCurrentVersion(versions, versionId);
  const currentVersionId = currentVersion?.id ?? null;
  const user = await getUser(userId);

  if (!currentVersionId) {
    return {
      currentVersion: null,
      versions: [],
      myTasks: [],
      testRuns: [],
      defectSummary: [],
      recentDefects: [],
      weeklyReports: [],
      notices: await getNotices(),
    };
  }

  const [
    myTasks,
    testRuns,
    defectData,
    weeklyReports,
    notices,
  ] = await Promise.all([
    getTasks({ user, versionId: currentVersionId }),
    getTestRuns(currentVersionId),
    getDefectData(currentVersionId),
    getWeeklyReports(currentVersionId),
    getNotices(),
  ]);

  return {
    currentVersion: toVersionResponse(currentVersion),
    versions: versions.map(toVersionResponse),
    myTasks,
    testRuns,
    defectSummary: defectData.summary,
    recentDefects: defectData.recent,
    weeklyReports,
    notices,
  };
}

export async function buildWeeklyReportWorkbook({ roundId, versionId } = {}) {
  const where = {};

  if (roundId) {
    const round = await prisma.issueProgressRound.findUnique({
      where: { id: Number(roundId) },
    });

    if (round) {
      where.roundYear = round.year;
      where.roundMonth = round.month;
      where.roundWeek = round.weekOfMonth;
      where.versionId = round.versionId;
    }
  } else if (versionId) {
    where.versionId = Number(versionId);
  }

  const issues = await prisma.issue.findMany({
    where,
    orderBy: [{ createdOn: "desc" }, { id: "desc" }],
  });

  const rows = issues.map((issue, index) => ({
    "No.": index + 1,
    "Redmine 번호": issue.redmineIssueId ? `#${issue.redmineIssueId}` : `#${issue.id}`,
    제목: issue.title,
    메뉴: issue.menu ?? "",
    담당자: issue.assignee ?? "",
    우선순위: issue.priority ?? "",
    등록일: formatDateOnly(issue.createdOn),
    "Redmine URL": issue.redmineUrl ?? "",
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "weekly-report");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

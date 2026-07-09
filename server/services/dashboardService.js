import { prisma } from "../db.js";
import {
  computeTestRunStats,
  formatRunCreatedAt,
  formatRunDisplayId,
  toTestRunItemResponse,
} from "./testRunMapper.js";

const STATUS_COLORS = {
  completed: "#22c55e",
  inProgress: "#3b82f6",
  failed: "#ef4444",
  waiting: "#94a3b8",
};

function formatDelta(current, previous) {
  const diff = current - previous;

  if (diff === 0) {
    return "변동 없음";
  }

  const sign = diff > 0 ? "▲" : "▼";
  return `${sign} ${Math.abs(diff)} 지난주 대비`;
}

function formatPercent(value, total) {
  if (!total) {
    return "0%";
  }

  return `${((value / total) * 100).toFixed(1)}%`;
}

function getWeekAgoDate() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

function countResultBuckets(items = []) {
  return items.reduce(
    (counts, item) => {
      const result = item.result ?? "NT";

      if (result === "O") {
        counts.passCount += 1;
      } else if (result === "X" || result === "BLOCK") {
        counts.failCount += 1;
      } else {
        counts.emptyCount += 1;
      }

      return counts;
    },
    { passCount: 0, failCount: 0, emptyCount: 0 }
  );
}

function mapRunStatusKey(status) {
  switch (status) {
    case "완료":
      return "completed";
    case "진행 중":
      return "inProgress";
    case "실패":
      return "failed";
    default:
      return "waiting";
  }
}

export async function getDashboardStats() {
  const weekAgo = getWeekAgoDate();

  const [
    totalTestCases,
    testCasesLastWeek,
    totalTestRuns,
    testRunsLastWeek,
    totalDefects,
    defectsLastWeek,
    runItems,
    recentRuns,
  ] = await Promise.all([
    prisma.testCase.count(),
    prisma.testCase.count({
      where: { createdAt: { gte: weekAgo } },
    }),
    prisma.testRun.count(),
    prisma.testRun.count({
      where: { createdAt: { gte: weekAgo } },
    }),
    prisma.issue.count(),
    prisma.issue.count({
      where: { createdOn: { gte: weekAgo } },
    }),
    prisma.testRunItem.findMany({
      select: { result: true },
    }),
    prisma.testRun.findMany({
      include: {
        version: { select: { versionName: true } },
        items: { include: { testCase: true }, orderBy: { id: "asc" } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
    }),
  ]);

  const allRuns = await prisma.testRun.findMany({
    include: {
      items: { include: { testCase: true }, orderBy: { id: "asc" } },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const resultCounts = countResultBuckets(runItems);
  const resultTotal =
    resultCounts.passCount + resultCounts.failCount + resultCounts.emptyCount;

  const statusCounts = {
    completed: 0,
    inProgress: 0,
    failed: 0,
    waiting: 0,
  };

  allRuns.forEach((run) => {
    const testCases = run.items.map((item, index) =>
      toTestRunItemResponse(item, index)
    );
    const stats = computeTestRunStats(testCases);
    const key = mapRunStatusKey(stats.status);
    statusCounts[key] += 1;
  });

  const testRunTotal = allRuns.length || 1;
  const segments = [
    {
      key: "completed",
      label: "완료",
      count: statusCounts.completed,
      percent: Number(((statusCounts.completed / testRunTotal) * 100).toFixed(1)),
      color: STATUS_COLORS.completed,
    },
    {
      key: "inProgress",
      label: "진행 중",
      count: statusCounts.inProgress,
      percent: Number(((statusCounts.inProgress / testRunTotal) * 100).toFixed(1)),
      color: STATUS_COLORS.inProgress,
    },
    {
      key: "failed",
      label: "실패",
      count: statusCounts.failed,
      percent: Number(((statusCounts.failed / testRunTotal) * 100).toFixed(1)),
      color: STATUS_COLORS.failed,
    },
    {
      key: "waiting",
      label: "대기",
      count: statusCounts.waiting,
      percent: Number(((statusCounts.waiting / testRunTotal) * 100).toFixed(1)),
      color: STATUS_COLORS.waiting,
    },
  ];

  const runIdBase = await prisma.testRun.count();
  const recentTestRuns = recentRuns.map((run, index) => {
    const testCases = run.items.map((item, itemIndex) =>
      toTestRunItemResponse(item, itemIndex)
    );
    const stats = computeTestRunStats(testCases);
    const sequence = runIdBase - index;
    const year = new Date(run.createdAt).getFullYear();

    return {
      runId: formatRunDisplayId(Math.max(sequence, 1), year),
      runName: run.runName,
      targetMenu: run.targetMenu ?? "",
      status: stats.status,
      progress:
        stats.totalCount > 0
          ? Math.round((stats.completedCount / stats.totalCount) * 100)
          : 0,
      createdAt: formatRunCreatedAt(run.createdAt),
    };
  });

  return {
    summaryCards: {
      totalTestCases,
      totalTestCasesSub: formatDelta(testCasesLastWeek, 0).replace(
        "지난주 대비",
        "최근 7일"
      ),
      passCount: resultCounts.passCount,
      passCountSub: formatPercent(resultCounts.passCount, resultTotal),
      failCount: resultCounts.failCount,
      failCountSub: formatPercent(resultCounts.failCount, resultTotal),
      emptyCount: resultCounts.emptyCount,
      emptyCountSub: formatPercent(resultCounts.emptyCount, resultTotal),
      totalTestRuns,
      totalTestRunsSub: formatDelta(testRunsLastWeek, 0).replace(
        "지난주 대비",
        "최근 7일"
      ),
      totalDefects,
      totalDefectsSub: formatDelta(defectsLastWeek, 0).replace(
        "지난주 대비",
        "최근 7일"
      ),
    },
    testRunStatus: {
      total: allRuns.length,
      segments,
    },
    recentTestRuns,
  };
}

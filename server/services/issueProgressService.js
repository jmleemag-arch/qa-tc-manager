import { prisma } from "../db.js";
import { formatDateOnly } from "../utils/weekUtils.js";
import {
  buildThursdayRoundsInRange,
  getVersionDateRange,
  ISSUE_ROUND_STATUS,
} from "../utils/issueRoundUtils.js";
import {
  sortIssueRounds,
  toIssueProgressRoundResponse,
} from "./issueProgressMapper.js";

const ROUND_INCLUDE = {
  version: {
    select: {
      id: true,
      versionName: true,
    },
  },
};

async function ensureRoundsForVersion(version) {
  const { start, end } = getVersionDateRange(version);
  const expectedRounds = buildThursdayRoundsInRange(start, end);

  for (const round of expectedRounds) {
    await prisma.issueProgressRound.upsert({
      where: {
        versionId_year_month_weekOfMonth: {
          versionId: version.id,
          year: round.year,
          month: round.month,
          weekOfMonth: round.weekOfMonth,
        },
      },
      create: {
        versionId: version.id,
        year: round.year,
        month: round.month,
        weekOfMonth: round.weekOfMonth,
        thursdayDate: round.thursdayDate,
        status: ISSUE_ROUND_STATUS.NOT_STARTED,
      },
      update: {},
    });
  }
}

async function ensureAllVersionRounds() {
  const versions = await prisma.version.findMany({
    select: {
      id: true,
      versionName: true,
      year: true,
      startDate: true,
      endDate: true,
    },
  });

  for (const version of versions) {
    await ensureRoundsForVersion(version);
  }
}

export async function listIssueProgressByVersion() {
  await ensureAllVersionRounds();

  const records = await prisma.issueProgressRound.findMany({
    include: ROUND_INCLUDE,
    orderBy: [
      { year: "desc" },
      { month: "desc" },
      { weekOfMonth: "desc" },
      { id: "desc" },
    ],
  });

  const grouped = {};

  for (const record of records) {
    const row = toIssueProgressRoundResponse(record);
    const versionKey = row.versionName;

    if (!grouped[versionKey]) {
      grouped[versionKey] = [];
    }

    grouped[versionKey].push(row);
  }

  Object.keys(grouped).forEach((versionKey) => {
    grouped[versionKey] = sortIssueRounds(grouped[versionKey]);
  });

  return grouped;
}

function parseCounts(payload) {
  const hasTotal = payload.total !== undefined && payload.total !== "";
  const hasInProgress =
    payload.inProgress !== undefined && payload.inProgress !== "";
  const hasNewCount = payload.newCount !== undefined && payload.newCount !== "";

  return {
    total: hasTotal ? Number(payload.total) : null,
    inProgress: hasInProgress ? Number(payload.inProgress) : null,
    newCount: hasNewCount ? Number(payload.newCount) : null,
    hasAllCounts: hasTotal && hasInProgress && hasNewCount,
  };
}

function validateCounts(total, inProgress, newCount) {
  if (
    [total, inProgress, newCount].some(
      (value) => value === null || !Number.isFinite(value) || value < 0
    )
  ) {
    throw new Error("INVALID_COUNTS");
  }

  if (inProgress > total || newCount > total) {
    throw new Error("INVALID_COUNT_RANGE");
  }
}

export async function updateIssueProgressRound(id, payload) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const existing = await prisma.issueProgressRound.findUnique({
    where: { id: numericId },
    include: ROUND_INCLUDE,
  });

  if (!existing) {
    return null;
  }

  const { total, inProgress, newCount, hasAllCounts } = parseCounts(payload);
  const requestedStatus = payload.status;
  const createdBy = String(payload.createdBy ?? payload.author ?? "").trim();

  if (requestedStatus === ISSUE_ROUND_STATUS.COMPLETED) {
    if (!hasAllCounts) {
      throw new Error("COMPLETE_REQUIRES_ALL_COUNTS");
    }

    validateCounts(total, inProgress, newCount);
  } else if (hasAllCounts) {
    validateCounts(total, inProgress, newCount);
  } else if (
    [total, inProgress, newCount].some(
      (value) => value !== null && (!Number.isFinite(value) || value < 0)
    )
  ) {
    throw new Error("INVALID_COUNTS");
  }

  const nextStatus =
    requestedStatus === ISSUE_ROUND_STATUS.COMPLETED
      ? ISSUE_ROUND_STATUS.COMPLETED
      : hasAllCounts
        ? ISSUE_ROUND_STATUS.IN_PROGRESS
        : ISSUE_ROUND_STATUS.NOT_STARTED;

  const data = {
    total,
    inProgress,
    newCount,
    status: nextStatus,
  };

  if (createdBy) {
    data.createdBy = createdBy;
  }

  if (nextStatus === ISSUE_ROUND_STATUS.COMPLETED) {
    data.writtenAt = new Date();
  } else if (hasAllCounts && !existing.writtenAt) {
    data.writtenAt = new Date();
  }

  const record = await prisma.issueProgressRound.update({
    where: { id: numericId },
    data,
    include: ROUND_INCLUDE,
  });

  return toIssueProgressRoundResponse(record);
}

function buildRoundWhere(filters = {}) {
  const where = {};

  if (filters.versionId) {
    where.versionId = Number(filters.versionId);
  }

  if (filters.year) {
    where.year = Number(filters.year);
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search?.trim()) {
    const keyword = filters.search.trim();
    const monthMatch = keyword.match(/(\d+)\s*월\s*(\d+)\s*주차/);

    if (monthMatch) {
      where.month = Number(monthMatch[1]);
      where.weekOfMonth = Number(monthMatch[2]);
    } else if (/^\d{4}$/.test(keyword)) {
      where.year = Number(keyword);
    } else if (/^\d{1,2}$/.test(keyword)) {
      where.month = Number(keyword);
    }
  }

  if (filters.startDate || filters.endDate) {
    where.thursdayDate = {};

    if (filters.startDate) {
      where.thursdayDate.gte = new Date(`${filters.startDate}T00:00:00`);
    }

    if (filters.endDate) {
      where.thursdayDate.lte = new Date(`${filters.endDate}T23:59:59`);
    }
  }

  return where;
}

export async function listIssueProgressRounds(filters = {}) {
  await ensureAllVersionRounds();

  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.max(Number(filters.pageSize) || 10, 1);
  const where = buildRoundWhere(filters);

  const [records, total, years] = await Promise.all([
    prisma.issueProgressRound.findMany({
      where,
      include: ROUND_INCLUDE,
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { weekOfMonth: "desc" },
        { id: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.issueProgressRound.count({ where }),
    prisma.issueProgressRound.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  return {
    items: records.map(toIssueProgressRoundResponse),
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
    years: years.map((entry) => entry.year),
  };
}

export async function getIssueOverviewStats() {
  const issues = await prisma.issue.findMany({
    orderBy: [{ createdOn: "desc" }, { id: "desc" }],
  });

  const menuCounts = new Map();

  issues.forEach((issue) => {
    const menu = String(issue.menu ?? "기타").split(">")[0].trim() || "기타";
    menuCounts.set(menu, (menuCounts.get(menu) ?? 0) + 1);
  });

  const menuDistribution = [...menuCounts.entries()]
    .map(([menu, count]) => ({ menu, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.menu.localeCompare(right.menu)
    );

  const severityConfig = {
    Critical: { key: "critical", label: "Critical", color: "#ef4444" },
    High: { key: "critical", label: "Critical", color: "#ef4444" },
    Major: { key: "major", label: "Major", color: "#f97316" },
    Medium: { key: "major", label: "Major", color: "#f97316" },
    Minor: { key: "minor", label: "Minor", color: "#eab308" },
    Low: { key: "minor", label: "Minor", color: "#eab308" },
    Trivial: { key: "trivial", label: "Trivial", color: "#94a3b8" },
  };

  const severityCounts = new Map();

  issues.forEach((issue) => {
    const severity = String(issue.severity ?? "Trivial").trim() || "Trivial";
    const config = severityConfig[severity] ?? severityConfig.Trivial;
    const current = severityCounts.get(config.key) ?? {
      ...config,
      count: 0,
    };

    current.count += 1;
    severityCounts.set(config.key, current);
  });

  const segmentOrder = ["critical", "major", "minor", "trivial"];
  const segments = segmentOrder
    .map((key) => severityCounts.get(key))
    .filter(Boolean);
  const total = issues.length;
  const severityDistribution = {
    total,
    segments: segments.map((segment) => ({
      ...segment,
      percent: total ? Number(((segment.count / total) * 100).toFixed(1)) : 0,
    })),
  };

  const recentIssues = issues.slice(0, 5).map((issue) => {
    const severity = String(issue.severity ?? "").trim();
    const isHighSeverity = ["Critical", "High", "Major"].includes(severity);

    return {
      id: issue.redmineIssueId ? `#${issue.redmineIssueId}` : `#${issue.id}`,
      title: issue.title,
      result: isHighSeverity ? "X" : "O",
      date: formatDateOnly(issue.createdOn),
    };
  });

  return {
    menuDistribution,
    severityDistribution,
    recentIssues,
  };
}

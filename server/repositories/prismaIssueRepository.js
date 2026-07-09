import { prisma } from "../db.js";
import {
  buildThursdayRoundsInRange,
  getThursdayWeekMeta,
} from "../utils/issueRoundUtils.js";
import { getWeekRangeFromDate } from "../utils/weekUtils.js";

function buildWhereClause({
  weekStart,
  weekEnd,
  roundYear,
  roundMonth,
  roundWeek,
  search,
  assignee,
} = {}) {
  const where = {};

  if (roundYear && roundMonth && roundWeek) {
    where.roundYear = Number(roundYear);
    where.roundMonth = Number(roundMonth);
    where.roundWeek = Number(roundWeek);
  } else if (weekStart && weekEnd) {
    where.createdOn = {
      gte: new Date(`${weekStart}T00:00:00`),
      lte: new Date(`${weekEnd}T23:59:59`),
    };
  }

  if (assignee && assignee !== "담당자 전체") {
    where.assignee = assignee;
  }

  if (search?.trim()) {
    const keyword = search.trim();
    where.OR = [
      { title: { contains: keyword } },
      { redmineIssueId: { contains: keyword.replace("#", "") } },
    ];
  }

  return where;
}

function buildRoundMeta(dateValue) {
  const createdOn = new Date(`${dateValue}T00:00:00`);
  const thursdayMeta = getThursdayWeekMeta(createdOn);
  const { weekStart, weekEnd } = getWeekRangeFromDate(dateValue);

  return {
    createdOn,
    weekStart,
    weekEnd,
    roundYear: thursdayMeta.year,
    roundMonth: thursdayMeta.month,
    roundWeek: thursdayMeta.weekOfMonth,
    thursdayDate: thursdayMeta.thursdayDate,
  };
}

export async function findIssues(filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.max(Number(filters.pageSize) || 20, 1);
  const where = buildWhereClause(filters);

  const [items, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy: [{ createdOn: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.issue.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function findIssueRounds({ year } = {}) {
  const targetYear = Number(year) || new Date().getFullYear();
  const generatedRounds = buildThursdayRoundsInRange(
    new Date(targetYear, 0, 1),
    new Date(targetYear, 11, 31)
  );

  const groupedCounts = await prisma.issue.groupBy({
    by: ["roundYear", "roundMonth", "roundWeek", "thursdayDate"],
    where: {
      roundYear: targetYear,
    },
    _count: { _all: true },
  });

  const countMap = new Map(
    groupedCounts.map((row) => [
      `${row.roundYear}-${row.roundMonth}-${row.roundWeek}`,
      row._count._all,
    ])
  );

  return generatedRounds
    .map((round) => ({
      year: round.year,
      month: round.month,
      weekOfMonth: round.weekOfMonth,
      thursdayDate: round.thursdayDate,
      count:
        countMap.get(`${round.year}-${round.month}-${round.weekOfMonth}`) ?? 0,
    }))
    .sort((left, right) => {
      if (right.year !== left.year) {
        return right.year - left.year;
      }

      if (right.month !== left.month) {
        return right.month - left.month;
      }

      return right.weekOfMonth - left.weekOfMonth;
    });
}

export async function findIssueWeeks() {
  const rows = await prisma.issue.groupBy({
    by: ["weekStart", "weekEnd"],
    _count: { _all: true },
    orderBy: { weekStart: "asc" },
  });

  return rows.map((row) => ({
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    count: row._count._all,
  }));
}

export async function findIssueAssignees() {
  const rows = await prisma.issue.findMany({
    where: {
      assignee: {
        not: null,
      },
    },
    distinct: ["assignee"],
    select: { assignee: true },
    orderBy: { assignee: "asc" },
  });

  return rows.map((row) => row.assignee).filter(Boolean);
}

export async function findIssueById(id) {
  return prisma.issue.findUnique({
    where: { id: Number(id) },
  });
}

export async function createIssueDraft(payload) {
  const dateValue =
    payload.registeredAt ??
    payload.createdOn ??
    new Date().toISOString().slice(0, 10);
  const roundMeta = buildRoundMeta(dateValue);

  return prisma.issue.create({
    data: {
      title: payload.title,
      description: payload.description ?? "",
      project: payload.project ?? "",
      menu: payload.menu ?? "",
      priority: payload.priority ?? "",
      severity: payload.severity ?? payload.priority ?? "",
      assignee: payload.assignee ?? "",
      redmineStatus: "대기",
      createdOn: roundMeta.createdOn,
      roundYear: roundMeta.roundYear,
      roundMonth: roundMeta.roundMonth,
      roundWeek: roundMeta.roundWeek,
      thursdayDate: roundMeta.thursdayDate,
      weekStart: roundMeta.weekStart,
      weekEnd: roundMeta.weekEnd,
    },
  });
}

export async function updateIssueRedmineResult(id, payload) {
  return prisma.issue.update({
    where: { id: Number(id) },
    data: {
      redmineIssueId: payload.redmineIssueId ?? undefined,
      redmineUrl: payload.redmineUrl ?? undefined,
      redmineStatus: payload.redmineStatus,
      redmineError: payload.redmineError ?? null,
    },
  });
}

export async function createIssue(payload) {
  const dateValue =
    payload.registeredAt ??
    payload.createdOn ??
    new Date().toISOString().slice(0, 10);
  const roundMeta = buildRoundMeta(dateValue);

  return prisma.issue.create({
    data: {
      redmineIssueId: String(payload.redmineIssueId ?? payload.issueId ?? "")
        .replace("#", "")
        .trim() || null,
      title: payload.title,
      description: payload.description ?? "",
      project: payload.project ?? "",
      menu: payload.menu ?? "",
      priority: payload.priority ?? "",
      severity: payload.severity ?? payload.priority ?? "",
      assignee: payload.assignee ?? "",
      redmineStatus: payload.redmineStatus ?? "등록완료",
      redmineUrl: payload.redmineUrl ?? null,
      redmineError: payload.redmineError ?? null,
      createdOn: roundMeta.createdOn,
      roundYear: roundMeta.roundYear,
      roundMonth: roundMeta.roundMonth,
      roundWeek: roundMeta.roundWeek,
      thursdayDate: roundMeta.thursdayDate,
      weekStart: roundMeta.weekStart,
      weekEnd: roundMeta.weekEnd,
    },
  });
}

export async function updateIssue(id, payload) {
  const data = {};

  if (payload.title !== undefined) {
    data.title = payload.title;
  }

  if (payload.description !== undefined) {
    data.description = payload.description;
  }

  if (payload.project !== undefined) {
    data.project = payload.project;
  }

  if (payload.menu !== undefined) {
    data.menu = payload.menu;
  }

  if (payload.priority !== undefined) {
    data.priority = payload.priority;
  }

  if (payload.severity !== undefined) {
    data.severity = payload.severity;
  }

  if (payload.assignee !== undefined) {
    data.assignee = payload.assignee;
  }

  if (payload.registeredAt !== undefined || payload.createdOn !== undefined) {
    const dateValue = payload.registeredAt ?? payload.createdOn;
    const roundMeta = buildRoundMeta(dateValue);

    data.createdOn = roundMeta.createdOn;
    data.roundYear = roundMeta.roundYear;
    data.roundMonth = roundMeta.roundMonth;
    data.roundWeek = roundMeta.roundWeek;
    data.thursdayDate = roundMeta.thursdayDate;
    data.weekStart = roundMeta.weekStart;
    data.weekEnd = roundMeta.weekEnd;
  }

  return prisma.issue.update({
    where: { id: Number(id) },
    data,
  });
}

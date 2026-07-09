import { prisma } from "../db.js";
import { getWeekRangeFromDate } from "../utils/weekUtils.js";

function buildWhereClause({ weekStart, weekEnd, search, assignee } = {}) {
  const where = {};

  if (weekStart && weekEnd) {
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

  return rows
    .map((row) => row.assignee)
    .filter(Boolean);
}

export async function findIssueById(id) {
  return prisma.issue.findUnique({
    where: { id: Number(id) },
  });
}

export async function createIssue(payload) {
  const createdOn = new Date(`${payload.registeredAt ?? payload.createdOn}T00:00:00`);
  const { weekStart, weekEnd } = getWeekRangeFromDate(
    payload.registeredAt ?? payload.createdOn
  );

  return prisma.issue.create({
    data: {
      redmineIssueId: String(payload.redmineIssueId ?? payload.issueId ?? "")
        .replace("#", "")
        .trim() || null,
      title: payload.title,
      menu: payload.menu ?? "",
      severity: payload.severity ?? "",
      assignee: payload.assignee ?? "",
      createdOn,
      weekStart,
      weekEnd,
    },
  });
}

export async function updateIssue(id, payload) {
  const data = {};

  if (payload.title !== undefined) {
    data.title = payload.title;
  }

  if (payload.menu !== undefined) {
    data.menu = payload.menu;
  }

  if (payload.severity !== undefined) {
    data.severity = payload.severity;
  }

  if (payload.assignee !== undefined) {
    data.assignee = payload.assignee;
  }

  if (payload.registeredAt !== undefined || payload.createdOn !== undefined) {
    const dateValue = payload.registeredAt ?? payload.createdOn;
    const createdOn = new Date(`${dateValue}T00:00:00`);
    const { weekStart, weekEnd } = getWeekRangeFromDate(dateValue);

    data.createdOn = createdOn;
    data.weekStart = weekStart;
    data.weekEnd = weekEnd;
  }

  return prisma.issue.update({
    where: { id: Number(id) },
    data,
  });
}

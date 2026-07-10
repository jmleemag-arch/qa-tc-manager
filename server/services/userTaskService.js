import { prisma } from "../db.js";
import { formatDateOnly } from "../utils/weekUtils.js";

export const TASK_TYPES = {
  RETEST_REQUEST: "retest_request",
  ASSIGNED_TC: "assigned_tc",
  STATUS_CHANGE: "status_change",
  MENTION: "mention",
};

export const TASK_TYPE_LABELS = {
  [TASK_TYPES.RETEST_REQUEST]: "재검증 요청",
  [TASK_TYPES.ASSIGNED_TC]: "담당 TC",
  [TASK_TYPES.STATUS_CHANGE]: "상태 변경",
  [TASK_TYPES.MENTION]: "멘션",
};

export const TASK_STATUS = {
  PENDING: "미처리",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
};

export const TASK_TAB = {
  ALL: "all",
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

const TAB_STATUS_MAP = {
  [TASK_TAB.PENDING]: TASK_STATUS.PENDING,
  [TASK_TAB.IN_PROGRESS]: TASK_STATUS.IN_PROGRESS,
  [TASK_TAB.COMPLETED]: TASK_STATUS.COMPLETED,
};

function toTaskResponse(task) {
  return {
    id: task.id,
    type: task.type,
    typeLabel: TASK_TYPE_LABELS[task.type] ?? task.type,
    title: task.title,
    content: task.content ?? "",
    relatedItem: task.relatedItem ?? "",
    targetType: task.targetType ?? "",
    targetId: task.targetId ?? null,
    priority: task.priority,
    status: task.status,
    statusLabel:
      task.status === TASK_STATUS.IN_PROGRESS ? "진행 중" : task.status,
    assignee: task.user?.name ?? "",
    requester: task.requester ?? "",
    createdAt: formatDateOnly(task.createdAt),
    dueDate: task.dueDate ? formatDateOnly(task.dueDate) : "",
    versionId: task.versionId ?? null,
    versionName: task.version?.versionName ?? "",
  };
}

async function resolveUser(userId) {
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { userId: String(userId).trim() },
  });
}

function buildWhere(filters, dbUserId) {
  const where = { userId: dbUserId };

  if (filters.tab && filters.tab !== TASK_TAB.ALL) {
    where.status = TAB_STATUS_MAP[filters.tab];
  }

  if (filters.type && filters.type !== "전체") {
    const typeEntry = Object.entries(TASK_TYPE_LABELS).find(
      ([, label]) => label === filters.type
    );
    if (typeEntry) {
      where.type = typeEntry[0];
    }
  }

  if (filters.status && filters.status !== "전체") {
    const statusValue =
      filters.status === "진행 중" ? TASK_STATUS.IN_PROGRESS : filters.status;
    where.status = statusValue;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(`${filters.startDate}T00:00:00`);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(`${filters.endDate}T23:59:59`);
    }
  }

  if (filters.search?.trim()) {
    const keyword = filters.search.trim();
    where.OR = [
      { title: { contains: keyword } },
      { content: { contains: keyword } },
      { relatedItem: { contains: keyword } },
    ];
  }

  return where;
}

export async function listUserTasks(filters = {}) {
  const user = await resolveUser(filters.userId);

  if (!user) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      tabCounts: {
        all: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
      },
    };
  }

  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.max(Number(filters.pageSize) || 10, 1);
  const where = buildWhere(filters, user.id);
  const baseWhere = { userId: user.id };

  const [items, total, allCount, pendingCount, inProgressCount, completedCount] =
    await Promise.all([
      prisma.userTask.findMany({
        where,
        include: {
          user: { select: { name: true } },
          version: { select: { versionName: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userTask.count({ where }),
      prisma.userTask.count({ where: baseWhere }),
      prisma.userTask.count({
        where: { ...baseWhere, status: TASK_STATUS.PENDING },
      }),
      prisma.userTask.count({
        where: { ...baseWhere, status: TASK_STATUS.IN_PROGRESS },
      }),
      prisma.userTask.count({
        where: { ...baseWhere, status: TASK_STATUS.COMPLETED },
      }),
    ]);

  return {
    items: items.map(toTaskResponse),
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
    tabCounts: {
      all: allCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
    },
  };
}

export async function updateUserTask(id, userId, payload) {
  const user = await resolveUser(userId);

  if (!user) {
    return null;
  }

  const existing = await prisma.userTask.findFirst({
    where: {
      id: Number(id),
      userId: user.id,
    },
  });

  if (!existing) {
    return null;
  }

  const data = {};

  if (payload.status) {
    data.status =
      payload.status === "진행 중" ? TASK_STATUS.IN_PROGRESS : payload.status;
  }

  if (payload.priority) {
    data.priority = payload.priority;
  }

  const updated = await prisma.userTask.update({
    where: { id: existing.id },
    data,
    include: {
      user: { select: { name: true } },
      version: { select: { versionName: true } },
    },
  });

  return toTaskResponse(updated);
}

export async function getDashboardTasks({ userId, versionId, limit = 5 } = {}) {
  const user = await resolveUser(userId);

  if (!user) {
    return [];
  }

  const where = {
    userId: user.id,
    status: { not: TASK_STATUS.COMPLETED },
  };

  if (versionId) {
    where.OR = [{ versionId: Number(versionId) }, { versionId: null }];
  }

  const tasks = await prisma.userTask.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Number(limit) || 5,
  });

  return tasks.map((task) => ({
    id: `task-${task.id}`,
    taskId: task.id,
    kind: TASK_TYPE_LABELS[task.type] ?? "알림",
    title: task.title,
    when: toRelativeDay(task.createdAt),
    targetType: task.targetType ?? "task",
    targetId: task.targetId ?? task.id,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
  }));
}

function toRelativeDay(value) {
  const date = new Date(value);
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

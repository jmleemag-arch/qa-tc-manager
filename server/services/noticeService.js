import { prisma } from "../db.js";
import { formatDateOnly } from "../utils/weekUtils.js";

function toNoticeResponse(notice) {
  return {
    id: notice.id,
    category: notice.category,
    title: notice.title,
    content: notice.content ?? "",
    createdBy: notice.createdBy ?? "",
    createdAt: formatDateOnly(notice.createdAt),
    updatedAt: formatDateOnly(notice.updatedAt),
  };
}

export async function listNotices({ limit, page, pageSize } = {}) {
  const hasPagination = page !== undefined || pageSize !== undefined;
  const resolvedPage = Math.max(Number(page) || 1, 1);
  const resolvedPageSize = Math.max(
    Number(pageSize) || Number(limit) || 20,
    1
  );

  if (!hasPagination && limit) {
    const notices = await prisma.notice.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: resolvedPageSize,
    });

    return notices.map(toNoticeResponse);
  }

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (resolvedPage - 1) * resolvedPageSize,
      take: resolvedPageSize,
    }),
    prisma.notice.count(),
  ]);

  return {
    items: notices.map(toNoticeResponse),
    total,
    page: resolvedPage,
    pageSize: resolvedPageSize,
    totalPages: Math.max(Math.ceil(total / resolvedPageSize), 1),
  };
}

export async function getNoticeById(id) {
  const notice = await prisma.notice.findUnique({
    where: { id: Number(id) },
  });

  return notice ? toNoticeResponse(notice) : null;
}

export async function createNotice(payload) {
  const title = String(payload.title ?? "").trim();

  if (!title) {
    throw new Error("NOTICE_TITLE_REQUIRED");
  }

  const notice = await prisma.notice.create({
    data: {
      category: String(payload.category ?? "공지").trim() || "공지",
      title,
      content: payload.content ?? "",
      createdBy: payload.createdBy ?? null,
    },
  });

  return toNoticeResponse(notice);
}

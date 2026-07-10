import { prisma } from "../server/db.js";
import {
  getThursdayWeekMeta,
  ISSUE_ROUND_STATUS,
} from "../server/utils/issueRoundUtils.js";

const DEMO_ROWS = [
  {
    dateValue: "2026-12-31",
    total: null,
    inProgress: null,
    newCount: null,
    status: ISSUE_ROUND_STATUS.NOT_STARTED,
    author: "",
  },
  {
    dateValue: "2026-12-24",
    total: 5,
    inProgress: 2,
    newCount: 5,
    status: ISSUE_ROUND_STATUS.IN_PROGRESS,
    author: "이주미",
    writtenAt: "2026-12-24",
  },
  {
    dateValue: "2026-12-17",
    total: 12,
    inProgress: 0,
    newCount: 0,
    status: ISSUE_ROUND_STATUS.COMPLETED,
    author: "홍길동",
    writtenAt: "2026-12-18",
  },
  {
    dateValue: "2026-12-10",
    total: 7,
    inProgress: 0,
    newCount: 0,
    status: ISSUE_ROUND_STATUS.COMPLETED,
    author: "홍길동",
    writtenAt: "2026-12-11",
  },
  {
    dateValue: "2026-12-03",
    total: 7,
    inProgress: 0,
    newCount: 0,
    status: ISSUE_ROUND_STATUS.COMPLETED,
    author: "이주미",
    writtenAt: "2026-12-05",
  },
  {
    dateValue: "2026-11-26",
    total: 5,
    inProgress: 2,
    newCount: 5,
    status: ISSUE_ROUND_STATUS.IN_PROGRESS,
    author: "이주미",
    writtenAt: "2026-11-27",
  },
  {
    dateValue: "2026-11-19",
    total: 17,
    inProgress: 7,
    newCount: 10,
    status: ISSUE_ROUND_STATUS.COMPLETED,
    author: "이주미",
    writtenAt: "2026-11-20",
  },
  {
    dateValue: "2026-11-12",
    total: 4,
    inProgress: 1,
    newCount: 3,
    status: ISSUE_ROUND_STATUS.COMPLETED,
    author: "홍길동",
    writtenAt: "2026-11-13",
  },
  {
    dateValue: "2026-11-05",
    total: 8,
    inProgress: 2,
    newCount: 2,
    status: ISSUE_ROUND_STATUS.COMPLETED,
    author: "홍길동",
    writtenAt: "2026-11-06",
  },
];

async function seedWeeklyProgressDemo() {
  const version = await prisma.version.findFirst({
    where: {
      OR: [{ versionName: "26.2.0" }, { status: { contains: "진행" } }],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  if (!version) {
    throw new Error("No active version found for weekly progress demo seed.");
  }

  for (const row of DEMO_ROWS) {
    const meta = getThursdayWeekMeta(new Date(`${row.dateValue}T00:00:00`));

    await prisma.issueProgressRound.upsert({
      where: {
        versionId_year_month_weekOfMonth: {
          versionId: version.id,
          year: meta.year,
          month: meta.month,
          weekOfMonth: meta.weekOfMonth,
        },
      },
      create: {
        versionId: version.id,
        year: meta.year,
        month: meta.month,
        weekOfMonth: meta.weekOfMonth,
        thursdayDate: meta.thursdayDate,
        total: row.total,
        inProgress: row.inProgress,
        newCount: row.newCount,
        status: row.status,
        createdBy: row.author || null,
        writtenAt: row.writtenAt ? new Date(`${row.writtenAt}T12:00:00`) : null,
      },
      update: {
        total: row.total,
        inProgress: row.inProgress,
        newCount: row.newCount,
        status: row.status,
        createdBy: row.author || null,
        writtenAt: row.writtenAt ? new Date(`${row.writtenAt}T12:00:00`) : null,
      },
    });
  }

  console.log(
    `Seeded ${DEMO_ROWS.length} weekly progress demo rows for version ${version.versionName}.`
  );
}

seedWeeklyProgressDemo()
  .catch((error) => {
    console.error("Weekly progress demo seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

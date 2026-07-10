import { prisma } from "../server/db.js";

const NOTICE_COUNT = 100;
const CATEGORIES = ["공지", "알림", "릴리즈"];
const TITLE_PREFIX = {
  공지: "QA 운영 공지",
  알림: "시스템 알림",
  릴리즈: "릴리즈 안내",
};

async function seedNoticesOnly() {
  await prisma.notice.deleteMany();

  for (let index = 1; index <= NOTICE_COUNT; index += 1) {
    const category = CATEGORIES[(index - 1) % CATEGORIES.length];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (index - 1));
    createdAt.setHours(9 + (index % 8), index % 60, 0, 0);

    await prisma.notice.create({
      data: {
        category,
        title: `${TITLE_PREFIX[category]} #${String(NOTICE_COUNT - index + 1).padStart(3, "0")} - ${category} 항목 ${index}`,
        content: `${category} 내용 ${index}번입니다. QA Manager 공지사항 목록 페이지 구성 확인용 데이터입니다.`,
        createdBy: index % 3 === 0 ? "qa-manager" : "admin",
        createdAt,
      },
    });
  }

  console.log(`Seeded ${NOTICE_COUNT} notices.`);
}

seedNoticesOnly()
  .catch((error) => {
    console.error("Notice seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

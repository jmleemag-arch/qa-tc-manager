import { prisma } from "../server/db.js";
import {
  TASK_STATUS,
  TASK_TYPES,
} from "../server/services/userTaskService.js";

const TASK_SEED_ROWS = [
  {
    type: TASK_TYPES.RETEST_REQUEST,
    title: "#5339 Client 경고 설정 저장 오류 재검증 요청",
    content: "재현 환경: Chrome 120 / Windows 11",
    relatedItem: "#5339",
    targetType: "issue",
    targetId: 1,
    priority: "높음",
    status: TASK_STATUS.PENDING,
    requester: "홍길동",
    dueDate: "2026-07-10",
  },
  {
    type: TASK_TYPES.ASSIGNED_TC,
    title: "로그인 기능 테스트 케이스 확인",
    content: "TC-LOGIN-001 ~ TC-LOGIN-012",
    relatedItem: "TC-LOGIN-001",
    targetType: "testCase",
    targetId: 1,
    priority: "보통",
    status: TASK_STATUS.PENDING,
    requester: "시스템",
    dueDate: "2026-07-10",
  },
  {
    type: TASK_TYPES.STATUS_CHANGE,
    title: "#5331 네트워크 연결 실패 오류 상태 변경",
    content: "진행 중 → 재검증 요청",
    relatedItem: "#5331",
    targetType: "issue",
    targetId: 2,
    priority: "보통",
    status: TASK_STATUS.PENDING,
    requester: "시스템",
    dueDate: "2026-07-09",
  },
  {
    type: TASK_TYPES.MENTION,
    title: "@이주미 확인 부탁드립니다.",
    content: "대시보드 차트 데이터 검증 요청",
    relatedItem: "#5342",
    targetType: "issue",
    targetId: 3,
    priority: "낮음",
    status: TASK_STATUS.PENDING,
    requester: "홍길동",
    dueDate: "2026-07-08",
  },
  {
    type: TASK_TYPES.ASSIGNED_TC,
    title: "대시보드 위젯 로딩 지연 TC 점검",
    content: "TC-DASH-004 ~ TC-DASH-009",
    relatedItem: "TC-DASH-004",
    targetType: "testCase",
    targetId: 2,
    priority: "높음",
    status: TASK_STATUS.IN_PROGRESS,
    requester: "시스템",
    dueDate: "2026-07-11",
  },
  {
    type: TASK_TYPES.RETEST_REQUEST,
    title: "#5340 알림 배지 카운트 불일치 재검증",
    content: "알림 12건 표시 / 실제 9건",
    relatedItem: "#5340",
    targetType: "issue",
    targetId: 4,
    priority: "높음",
    status: TASK_STATUS.IN_PROGRESS,
    requester: "이주미",
    dueDate: "2026-07-11",
  },
  {
    type: TASK_TYPES.STATUS_CHANGE,
    title: "#5328 결함 상태 종료 처리 확인",
    content: "종료 전 회귀 테스트 필요",
    relatedItem: "#5328",
    targetType: "issue",
    targetId: 5,
    priority: "보통",
    status: TASK_STATUS.COMPLETED,
    requester: "시스템",
    dueDate: "2026-07-05",
  },
  {
    type: TASK_TYPES.MENTION,
    title: "주차별 진행 현황 작성 요청",
    content: "12월 4주차 현황 작성",
    relatedItem: "12월 4주차",
    targetType: "task",
    targetId: null,
    priority: "보통",
    status: TASK_STATUS.COMPLETED,
    requester: "QA Manager",
    dueDate: "2026-07-03",
  },
];

async function seedMyTasks() {
  await prisma.userTask.deleteMany();

  const [tester, jumi, version] = await Promise.all([
    prisma.user.findUnique({ where: { userId: "tester1" } }),
    prisma.user.findUnique({ where: { userId: "lee-jumi" } }),
    prisma.version.findFirst({
      where: { OR: [{ versionName: "26.2.0" }, { status: { contains: "진행" } }] },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  if (!tester) {
    return;
  }

  for (const [index, row] of TASK_SEED_ROWS.entries()) {
    const assignee = index % 3 === 0 && jumi ? jumi : tester;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - index);

    await prisma.userTask.create({
      data: {
        userId: assignee.id,
        versionId: version?.id ?? null,
        type: row.type,
        title: row.title,
        content: row.content,
        relatedItem: row.relatedItem,
        targetType: row.targetType,
        targetId: row.targetId,
        priority: row.priority,
        status: row.status,
        requester: row.requester,
        dueDate: row.dueDate ? new Date(`${row.dueDate}T12:00:00`) : null,
        createdAt,
      },
    });
  }

  console.log(`Seeded ${TASK_SEED_ROWS.length} user tasks.`);
}

seedMyTasks()
  .catch((error) => {
    console.error("My tasks seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

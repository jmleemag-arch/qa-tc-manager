import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_VERSION_NAME = "26.9.0-demo";
const DEMO_ISSUE_ID = "DEMO-001";

function getWeekStartDate(date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getWeekEndDate(weekStartDate) {
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + 6);
  return end;
}

function getThursdayDate(weekStartDate) {
  const thursday = new Date(weekStartDate);
  thursday.setDate(thursday.getDate() + 3);
  return thursday;
}

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstThursday = new Date(firstDay);
  const offset = (4 - firstDay.getDay() + 7) % 7;
  firstThursday.setDate(firstDay.getDate() + offset);

  if (date < firstThursday) {
    return 1;
  }

  return Math.floor((date.getDate() - firstThursday.getDate()) / 7) + 1;
}

async function ensureUsers() {
  const users = [
    { userId: "tester1", password: "test1234", name: "김철수", role: "admin" },
    { userId: "lee-jumi", password: "test1234", name: "이주미", role: "lead" },
    {
      userId: "qa-manager",
      password: "test1234",
      name: "QA Manager",
      role: "tester",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { userId: user.userId },
      create: { ...user, status: "active" },
      update: { ...user, status: "active" },
    });
  }
}

async function ensureVersion() {
  const version = await prisma.version.upsert({
    where: { versionName: DEMO_VERSION_NAME },
    create: {
      versionName: DEMO_VERSION_NAME,
      year: 2026,
      status: "진행중",
      startDate: new Date("2026-07-01T00:00:00"),
      endDate: null,
      description: "저장/조회 확인용 데모 버전",
    },
    update: {
      status: "진행중",
      description: "저장/조회 확인용 데모 버전",
    },
  });

  const menus = ["Total", "대시보드", "테스트케이스", "결함관리"];

  for (const [index, name] of menus.entries()) {
    await prisma.submenu.upsert({
      where: {
        versionId_name: {
          versionId: version.id,
          name,
        },
      },
      create: {
        versionId: version.id,
        name,
        isDefault: index < 2,
        sortOrder: index,
        isActive: true,
      },
      update: {
        isDefault: index < 2,
        sortOrder: index,
        isActive: true,
      },
    });
  }

  return version;
}

async function ensureTestCases(versionId) {
  const cases = [
    {
      caseCode: "DEMO-TC-001",
      menu: "대시보드",
      submenu: "요약 카드",
      checkItem: "대시보드 요약 데이터가 DB 값으로 표시된다",
      checkMethod: "로그인 후 대시보드 진입",
      expectedResult: "버전, TC, 결함, 테스트런 건수가 표시된다",
    },
    {
      caseCode: "DEMO-TC-002",
      menu: "테스트케이스",
      submenu: "저장",
      checkItem: "신규 테스트케이스 저장 후 새로고침해도 유지된다",
      checkMethod: "TC 추가 후 브라우저 새로고침",
      expectedResult: "추가한 TC가 DB에서 다시 조회된다",
    },
    {
      caseCode: "DEMO-TC-003",
      menu: "결함관리",
      submenu: "신규 이슈",
      checkItem: "신규 결함 등록 데이터가 저장된다",
      checkMethod: "결함 등록 후 목록 재조회",
      expectedResult: "등록한 결함이 목록에 남아 있다",
    },
  ];

  const created = [];

  for (const [index, testCase] of cases.entries()) {
    const record = await prisma.testCase.upsert({
      where: {
        versionId_caseCode: {
          versionId,
          caseCode: testCase.caseCode,
        },
      },
      create: {
        versionId,
        ...testCase,
        actualResult: "O",
        note: "데모 데이터",
        sortOrder: index,
      },
      update: {
        ...testCase,
        actualResult: "O",
        note: "데모 데이터",
        sortOrder: index,
      },
    });

    created.push(record);
  }

  return created;
}

async function ensureTestRun(versionId, testCases) {
  const existing = await prisma.testRun.findFirst({
    where: {
      versionId,
      runName: "데모 저장 확인 런",
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.testRun.create({
    data: {
      versionId,
      runName: "데모 저장 확인 런",
      targetMenu: "대시보드",
      status: "대기",
      startedAt: new Date(),
      items: {
        create: testCases.map((testCase) => ({
          testCaseId: testCase.id,
          result: "NT",
        })),
      },
    },
  });
}

async function ensureIssue() {
  const createdOn = new Date("2026-07-09T00:00:00");
  const weekStart = getWeekStartDate(createdOn);
  const weekEnd = getWeekEndDate(weekStart);
  const thursdayDate = getThursdayDate(weekStart);

  const existingIssue = await prisma.issue.findFirst({
    where: { redmineIssueId: DEMO_ISSUE_ID },
    select: { id: true },
  });

  const issueData = {
    redmineIssueId: DEMO_ISSUE_ID,
    title: "데모 결함: 저장 확인용 이슈",
    description: "DB 저장과 재조회 확인을 위한 데모 결함입니다.",
    project: "qa-manager",
    menu: "대시보드 > 요약 카드",
    priority: "Normal",
    severity: "Medium",
    assignee: "김철수",
    redmineStatus: "등록완료",
    redmineUrl: `https://redmine.example/issues/${DEMO_ISSUE_ID}`,
    createdOn,
    roundYear: thursdayDate.getFullYear(),
    roundMonth: thursdayDate.getMonth() + 1,
    roundWeek: getWeekOfMonth(thursdayDate),
    thursdayDate,
    weekStart,
    weekEnd,
  };

  if (existingIssue) {
    await prisma.issue.update({
      where: { id: existingIssue.id },
      data: {
        title: issueData.title,
        description: issueData.description,
        redmineStatus: issueData.redmineStatus,
      },
    });
    return;
  }

  await prisma.issue.create({
    data: {
      redmineIssueId: DEMO_ISSUE_ID,
      title: "데모 결함: 저장 확인용 이슈",
      description: "DB 저장과 재조회 확인을 위한 데모 결함입니다.",
      project: "qa-manager",
      menu: "대시보드 > 요약 카드",
      priority: "Normal",
      severity: "Medium",
      assignee: "김철수",
      redmineStatus: "등록완료",
      redmineUrl: `https://redmine.example/issues/${DEMO_ISSUE_ID}`,
      createdOn,
      roundYear: thursdayDate.getFullYear(),
      roundMonth: thursdayDate.getMonth() + 1,
      roundWeek: getWeekOfMonth(thursdayDate),
      thursdayDate,
      weekStart,
      weekEnd,
    },
  });
}

async function main() {
  await ensureUsers();
  const version = await ensureVersion();
  const testCases = await ensureTestCases(version.id);
  await ensureTestRun(version.id, testCases);
  await ensureIssue();

  const counts = {
    users: await prisma.user.count(),
    versions: await prisma.version.count(),
    testCases: await prisma.testCase.count(),
    testRuns: await prisma.testRun.count(),
    issues: await prisma.issue.count(),
  };

  console.log(`Demo data ensured for ${DEMO_VERSION_NAME}.`);
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

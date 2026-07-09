import { PrismaClient } from "@prisma/client";
import { DEMO_USERS } from "../src/features/auth/constants/authConstants.js";
import { issueProgressVersions } from "../src/features/defects/data/defectMockData.js";
import { newRegisteredIssues } from "../src/features/defects/data/newIssueMockData.js";
import {
  getThursdayWeekMeta,
  ISSUE_ROUND_STATUS,
} from "../server/utils/issueRoundUtils.js";
import { testCases as mockTestCases } from "../src/features/testcases/data/testCaseMockData.js";
import { testRuns as mockTestRuns } from "../src/features/testruns/data/testRunMockData.js";
import {
  APP_BUILD_LABEL,
  APP_VERSION,
  DEFAULT_APP_SETTINGS,
} from "../src/features/settings/constants/settingsConstants.js";

const prisma = new PrismaClient();

const VERSION_YEAR_BASE = 2000;

function parseVersionYear(versionName) {
  const match = String(versionName).match(/^(\d{2})\./);
  return match ? VERSION_YEAR_BASE + Number(match[1]) : new Date().getFullYear();
}

function normalizeVersionStatus(status) {
  if (status === "진행 중") {
    return "진행중";
  }

  return status;
}

function parseDateInput(value) {
  if (!value || value === "예정") {
    return null;
  }

  const normalized = String(value).replaceAll(".", "-");
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getWeekStartDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function getWeekEndDate(weekStartDate) {
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + 6);
  return end;
}

function buildAppSettings() {
  return {
    session: {
      sessionTimeoutMinutes: DEFAULT_APP_SETTINGS.sessionTimeoutMinutes,
      sessionWarningEnabled: DEFAULT_APP_SETTINGS.sessionWarningEnabled,
    },
    basic: {
      dateFormat: DEFAULT_APP_SETTINGS.dateFormat,
      fixDefaultMenus: DEFAULT_APP_SETTINGS.fixDefaultMenus,
      menuSortOrder: DEFAULT_APP_SETTINGS.menuSortOrder,
      allowedFileExtensions: DEFAULT_APP_SETTINGS.allowedFileExtensions,
      maxFileSizeMb: DEFAULT_APP_SETTINGS.maxFileSizeMb,
      autoSaveEnabled: DEFAULT_APP_SETTINGS.autoSaveEnabled,
      pageSize: DEFAULT_APP_SETTINGS.pageSize,
      recentItemsCount: DEFAULT_APP_SETTINGS.recentItemsCount,
    },
    notifications: {
      notifyMention: DEFAULT_APP_SETTINGS.notifyMention,
      notifyAssignee: DEFAULT_APP_SETTINGS.notifyAssignee,
      notifyVersionRelease: DEFAULT_APP_SETTINGS.notifyVersionRelease,
      notifyIssueRegistered: DEFAULT_APP_SETTINGS.notifyIssueRegistered,
      notifyTestRunComplete: DEFAULT_APP_SETTINGS.notifyTestRunComplete,
      notifyEmailEnabled: DEFAULT_APP_SETTINGS.notifyEmailEnabled,
      notifyBrowserEnabled: DEFAULT_APP_SETTINGS.notifyBrowserEnabled,
      notifyQuietHoursEnabled: DEFAULT_APP_SETTINGS.notifyQuietHoursEnabled,
      quietHoursStart: DEFAULT_APP_SETTINGS.quietHoursStart,
      quietHoursEnd: DEFAULT_APP_SETTINGS.quietHoursEnd,
    },
    integrations: {
      webhookEnabled: DEFAULT_APP_SETTINGS.webhookEnabled,
      webhookUrl: DEFAULT_APP_SETTINGS.webhookUrl,
      slackEnabled: DEFAULT_APP_SETTINGS.slackEnabled,
      slackWebhookUrl: DEFAULT_APP_SETTINGS.slackWebhookUrl,
      teamsEnabled: DEFAULT_APP_SETTINGS.teamsEnabled,
    },
    version_policy: {
      versionYearBase: DEFAULT_APP_SETTINGS.versionYearBase,
      versionAutoGroup: DEFAULT_APP_SETTINGS.versionAutoGroup,
      defaultVersionStatus: DEFAULT_APP_SETTINGS.defaultVersionStatus,
      versionNamingHint: DEFAULT_APP_SETTINGS.versionNamingHint,
    },
    test_run_policy: {
      testRunDefaultTab: DEFAULT_APP_SETTINGS.testRunDefaultTab,
      testRunAutoStatusComplete: DEFAULT_APP_SETTINGS.testRunAutoStatusComplete,
      testRunRequireVersion: DEFAULT_APP_SETTINGS.testRunRequireVersion,
      testRunDefaultPageSize: DEFAULT_APP_SETTINGS.testRunDefaultPageSize,
    },
    permissions: DEFAULT_APP_SETTINGS.rolePermissions,
    managed_users: DEFAULT_APP_SETTINGS.managedUsers,
    system: {
      lastBackupAt: DEFAULT_APP_SETTINGS.lastBackupAt,
      appVersion: APP_VERSION,
      appBuildLabel: APP_BUILD_LABEL,
    },
  };
}

async function seedVersions() {
  for (const item of issueProgressVersions) {
    const versionName = item.version;
    const year = parseVersionYear(versionName);

    const version = await prisma.version.upsert({
      where: { versionName },
      create: {
        versionName,
        year,
        status: normalizeVersionStatus(item.status),
        startDate: parseDateInput(item.startDate ?? item.registeredAt),
        endDate: parseDateInput(item.endDate),
        description: item.description ?? "",
      },
      update: {
        year,
        status: normalizeVersionStatus(item.status),
        startDate: parseDateInput(item.startDate ?? item.registeredAt),
        endDate: parseDateInput(item.endDate),
        description: item.description ?? "",
      },
    });

    const defaultMenus = ["Total", "대시보드"];
    for (const [index, name] of defaultMenus.entries()) {
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
          isDefault: true,
          sortOrder: index,
          isActive: true,
        },
        update: {
          isDefault: true,
          sortOrder: index,
          isActive: true,
        },
      });
    }
  }
}

async function seedUsers() {
  const roleByUserId = {
    tester1: "admin",
    "lee-jumi": "lead",
    "qa-manager": "tester",
  };

  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        password: user.password,
        name: user.name,
        role: roleByUserId[user.id] ?? "tester",
        status: "active",
      },
      update: {
        password: user.password,
        name: user.name,
        role: roleByUserId[user.id] ?? "tester",
        status: "active",
      },
    });
  }
}

async function seedIssues() {
  await prisma.issue.deleteMany();

  for (const issue of newRegisteredIssues) {
    const createdOn = new Date(`${issue.registeredAt}T00:00:00`);
    const weekStart = getWeekStartDate(issue.registeredAt);
    const weekEnd = getWeekEndDate(weekStart);
    const roundMeta = getThursdayWeekMeta(createdOn);

    await prisma.issue.create({
      data: {
        redmineIssueId: issue.issueId.replace("#", ""),
        title: issue.title,
        description: issue.title,
        project: "qa-manager",
        menu: issue.menu,
        priority: issue.severity,
        severity: issue.severity,
        assignee: issue.assignee,
        redmineStatus: "등록완료",
        redmineUrl: `https://redmine.example/issues/${issue.issueId.replace("#", "")}`,
        createdOn,
        roundYear: roundMeta.year,
        roundMonth: roundMeta.month,
        roundWeek: roundMeta.weekOfMonth,
        thursdayDate: roundMeta.thursdayDate,
        weekStart,
        weekEnd,
      },
    });
  }
}

async function seedTestCases() {
  const version = await prisma.version.findUnique({
    where: { versionName: "26.1.0" },
  });

  if (!version) {
    return;
  }

  await prisma.testCase.deleteMany();

  for (const [index, testCase] of mockTestCases.entries()) {
    await prisma.testCase.create({
      data: {
        versionId: version.id,
        caseCode: testCase.id,
        menu: testCase.menu,
        submenu: testCase.subMenu,
        checkItem: testCase.checkItem,
        checkMethod: testCase.checkMethod,
        expectedResult: testCase.checkResult,
        actualResult: testCase.isWorking,
        note: testCase.note,
        sortOrder: index,
      },
    });
  }
}

async function seedTestRuns() {
  await prisma.testRun.deleteMany();

  const defaultVersion = await prisma.version.findUnique({
    where: { versionName: "26.1.0" },
  });

  if (!defaultVersion) {
    return;
  }

  const testCases = await prisma.testCase.findMany({
    where: { versionId: defaultVersion.id },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  for (const run of mockTestRuns) {
    const [datePart, timePart = "00:00"] = String(run.createdAt).split(" ");
    const createdAt = new Date(`${datePart}T${timePart}:00`);

    const menuTestCases = testCases.filter(
      (testCase) =>
        run.targetMenu === "전체" || testCase.menu === run.targetMenu
    );
    const selectedCases = menuTestCases.slice(0, run.totalCount || 0);

    await prisma.testRun.create({
      data: {
        versionId: defaultVersion.id,
        runName: run.runName,
        targetMenu: run.targetMenu,
        status: run.status,
        createdAt,
        startedAt: createdAt,
        completedAt:
          run.status === "완료" || run.status === "실패" ? createdAt : null,
        items:
          selectedCases.length > 0
            ? {
                create: selectedCases.map((testCase, index) => {
                  let result = "NT";

                  if (index < run.passCount) {
                    result = "O";
                  } else if (index < run.passCount + run.failCount) {
                    result = "X";
                  } else if (
                    index <
                    run.passCount + run.failCount + run.blockCount
                  ) {
                    result = "BLOCK";
                  }

                  return {
                    testCaseId: testCase.id,
                    result,
                    executedAt: result === "NT" ? null : createdAt,
                  };
                }),
              }
            : undefined,
      },
    });
  }
}

async function seedIssueProgressRounds() {
  await prisma.issueProgressRound.deleteMany();

  for (const versionData of issueProgressVersions) {
    const version = await prisma.version.findUnique({
      where: { versionName: versionData.version },
      select: { id: true },
    });

    if (!version) {
      continue;
    }

    for (const row of versionData.rows ?? []) {
      const snapshotDate = new Date(`${row.dateValue}T00:00:00`);
      const meta = getThursdayWeekMeta(snapshotDate);
      const hasData =
        row.total !== null &&
        row.inProgress !== null &&
        row.newCount !== null &&
        (row.total > 0 || row.inProgress > 0 || row.newCount > 0);

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
          status: hasData
            ? ISSUE_ROUND_STATUS.COMPLETED
            : ISSUE_ROUND_STATUS.NOT_STARTED,
        },
        update: {
          total: row.total,
          inProgress: row.inProgress,
          newCount: row.newCount,
          status: hasData
            ? ISSUE_ROUND_STATUS.COMPLETED
            : ISSUE_ROUND_STATUS.NOT_STARTED,
        },
      });
    }
  }
}

async function seedAppSettings() {
  const settings = buildAppSettings();

  for (const [key, value] of Object.entries(settings)) {
    await prisma.appSetting.upsert({
      where: { key },
      create: {
        key,
        value: JSON.stringify(value),
      },
      update: {
        value: JSON.stringify(value),
      },
    });
  }
}

async function seedNotifications() {
  await prisma.notification.deleteMany();

  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "issue_registered",
        message: "QA Manager DB 기반 알림이 활성화되었습니다.",
        targetType: "system",
        isRead: false,
      },
    });
  }
}

async function main() {
  await seedAppSettings();
  await seedUsers();
  await seedVersions();
  await seedTestCases();
  await seedTestRuns();
  await seedIssueProgressRounds();
  await seedIssues();
  await seedNotifications();

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

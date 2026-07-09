import { PrismaClient } from "@prisma/client";
import { DEMO_USERS } from "../src/features/auth/constants/authConstants.js";
import { issueProgressVersions } from "../src/features/defects/data/defectMockData.js";
import { newRegisteredIssues } from "../src/features/defects/data/newIssueMockData.js";
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
        name: user.name,
        role: roleByUserId[user.id] ?? "tester",
        status: "active",
      },
      update: {
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

    await prisma.issue.create({
      data: {
        redmineIssueId: issue.issueId.replace("#", ""),
        title: issue.title,
        menu: issue.menu,
        severity: issue.severity,
        assignee: issue.assignee,
        createdOn,
        weekStart,
        weekEnd,
      },
    });
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

async function main() {
  await seedAppSettings();
  await seedUsers();
  await seedVersions();
  await seedIssues();

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

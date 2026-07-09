import { prisma } from "../db.js";

const DEFAULT_SETTINGS = {
  session: {
    sessionTimeoutMinutes: 10,
    sessionWarningEnabled: true,
  },
  basic: {
    dateFormat: "YYYY-MM-DD",
    fixDefaultMenus: true,
    menuSortOrder: "custom",
    allowedFileExtensions: ".png, .jpg, .jpeg, .gif, .pdf, .docx, .xlsx",
    maxFileSizeMb: 10,
    autoSaveEnabled: true,
    pageSize: 20,
    recentItemsCount: 10,
  },
  notifications: {
    notifyMention: true,
    notifyAssignee: true,
    notifyVersionRelease: true,
    notifyIssueRegistered: true,
    notifyTestRunComplete: true,
    notifyEmailEnabled: false,
    notifyBrowserEnabled: true,
    notifyQuietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  },
  integrations: {
    webhookEnabled: false,
    webhookUrl: "",
    slackEnabled: false,
    slackWebhookUrl: "",
    teamsEnabled: false,
  },
  version_policy: {
    versionYearBase: 2000,
    versionAutoGroup: true,
    defaultVersionStatus: "예정",
    versionNamingHint: "YY.M.P (예: 26.1.0)",
  },
  test_run_policy: {
    testRunDefaultTab: "run-list",
    testRunAutoStatusComplete: true,
    testRunRequireVersion: true,
    testRunDefaultPageSize: 20,
  },
  permissions: {
    admin: {
      dashboard: true,
      testcases: true,
      testruns: true,
      defects: true,
      reports: true,
      settings: true,
    },
    lead: {
      dashboard: true,
      testcases: true,
      testruns: true,
      defects: true,
      reports: true,
      settings: false,
    },
    tester: {
      dashboard: true,
      testcases: true,
      testruns: true,
      defects: true,
      reports: false,
      settings: false,
    },
    viewer: {
      dashboard: true,
      testcases: true,
      testruns: true,
      defects: true,
      reports: true,
      settings: false,
    },
  },
  managed_users: [
    {
      id: "tester1",
      name: "김철수",
      role: "admin",
      status: "active",
      lastLogin: "2025-07-09 09:12",
    },
    {
      id: "lee-jumi",
      name: "이주미",
      role: "lead",
      status: "active",
      lastLogin: "2025-07-09 08:45",
    },
    {
      id: "qa-manager",
      name: "QA Manager",
      role: "tester",
      status: "active",
      lastLogin: "2025-07-08 17:30",
    },
  ],
  custom_menu_pool: [],
  system: {
    lastBackupAt: "",
    appVersion: "0.1.0",
    appBuildLabel: "2025.07.09",
  },
};

function parseSettingValue(rawValue, fallback) {
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

export function getDefaultSettings() {
  return DEFAULT_SETTINGS;
}

export async function getAllSettings() {
  const rows = await prisma.appSetting.findMany();
  const merged = { ...DEFAULT_SETTINGS };

  rows.forEach((row) => {
    merged[row.key] = parseSettingValue(row.value, merged[row.key] ?? null);
  });

  return merged;
}

export async function getSettingSection(key) {
  const row = await prisma.appSetting.findUnique({
    where: { key },
  });

  if (!row) {
    return DEFAULT_SETTINGS[key] ?? null;
  }

  return parseSettingValue(row.value, DEFAULT_SETTINGS[key] ?? null);
}

export async function upsertSettingSection(key, value) {
  const row = await prisma.appSetting.upsert({
    where: { key },
    create: {
      key,
      value: JSON.stringify(value),
    },
    update: {
      value: JSON.stringify(value),
    },
  });

  return parseSettingValue(row.value, value);
}

export async function updateSettings(payload = {}) {
  const entries = Object.entries(payload);
  const updated = {};

  for (const [key, value] of entries) {
    updated[key] = await upsertSettingSection(key, value);
  }

  return {
    ...(await getAllSettings()),
    ...updated,
  };
}

export async function getSessionSettings() {
  const settings = await getAllSettings();
  return settings.session;
}

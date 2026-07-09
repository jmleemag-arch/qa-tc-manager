import { DEFAULT_APP_SETTINGS } from "../features/settings/constants/settingsConstants.js";

export function mapServerSettingsToClient(sections = {}) {
  return {
    ...DEFAULT_APP_SETTINGS,
    sessionTimeoutMinutes:
      sections.session?.sessionTimeoutMinutes ??
      DEFAULT_APP_SETTINGS.sessionTimeoutMinutes,
    sessionWarningEnabled:
      sections.session?.sessionWarningEnabled ??
      DEFAULT_APP_SETTINGS.sessionWarningEnabled,
    dateFormat: sections.basic?.dateFormat ?? DEFAULT_APP_SETTINGS.dateFormat,
    fixDefaultMenus:
      sections.basic?.fixDefaultMenus ?? DEFAULT_APP_SETTINGS.fixDefaultMenus,
    menuSortOrder:
      sections.basic?.menuSortOrder ?? DEFAULT_APP_SETTINGS.menuSortOrder,
    allowedFileExtensions:
      sections.basic?.allowedFileExtensions ??
      DEFAULT_APP_SETTINGS.allowedFileExtensions,
    maxFileSizeMb:
      sections.basic?.maxFileSizeMb ?? DEFAULT_APP_SETTINGS.maxFileSizeMb,
    autoSaveEnabled:
      sections.basic?.autoSaveEnabled ?? DEFAULT_APP_SETTINGS.autoSaveEnabled,
    pageSize: sections.basic?.pageSize ?? DEFAULT_APP_SETTINGS.pageSize,
    recentItemsCount:
      sections.basic?.recentItemsCount ?? DEFAULT_APP_SETTINGS.recentItemsCount,
    managedUsers:
      sections.managed_users ?? DEFAULT_APP_SETTINGS.managedUsers,
    rolePermissions:
      sections.permissions ?? DEFAULT_APP_SETTINGS.rolePermissions,
    notifyMention:
      sections.notifications?.notifyMention ?? DEFAULT_APP_SETTINGS.notifyMention,
    notifyAssignee:
      sections.notifications?.notifyAssignee ??
      DEFAULT_APP_SETTINGS.notifyAssignee,
    notifyVersionRelease:
      sections.notifications?.notifyVersionRelease ??
      DEFAULT_APP_SETTINGS.notifyVersionRelease,
    notifyIssueRegistered:
      sections.notifications?.notifyIssueRegistered ??
      DEFAULT_APP_SETTINGS.notifyIssueRegistered,
    notifyTestRunComplete:
      sections.notifications?.notifyTestRunComplete ??
      DEFAULT_APP_SETTINGS.notifyTestRunComplete,
    notifyEmailEnabled:
      sections.notifications?.notifyEmailEnabled ??
      DEFAULT_APP_SETTINGS.notifyEmailEnabled,
    notifyBrowserEnabled:
      sections.notifications?.notifyBrowserEnabled ??
      DEFAULT_APP_SETTINGS.notifyBrowserEnabled,
    notifyQuietHoursEnabled:
      sections.notifications?.notifyQuietHoursEnabled ??
      DEFAULT_APP_SETTINGS.notifyQuietHoursEnabled,
    quietHoursStart:
      sections.notifications?.quietHoursStart ??
      DEFAULT_APP_SETTINGS.quietHoursStart,
    quietHoursEnd:
      sections.notifications?.quietHoursEnd ?? DEFAULT_APP_SETTINGS.quietHoursEnd,
    webhookEnabled:
      sections.integrations?.webhookEnabled ??
      DEFAULT_APP_SETTINGS.webhookEnabled,
    webhookUrl:
      sections.integrations?.webhookUrl ?? DEFAULT_APP_SETTINGS.webhookUrl,
    slackEnabled:
      sections.integrations?.slackEnabled ?? DEFAULT_APP_SETTINGS.slackEnabled,
    slackWebhookUrl:
      sections.integrations?.slackWebhookUrl ??
      DEFAULT_APP_SETTINGS.slackWebhookUrl,
    teamsEnabled:
      sections.integrations?.teamsEnabled ?? DEFAULT_APP_SETTINGS.teamsEnabled,
    versionYearBase:
      sections.version_policy?.versionYearBase ??
      DEFAULT_APP_SETTINGS.versionYearBase,
    versionAutoGroup:
      sections.version_policy?.versionAutoGroup ??
      DEFAULT_APP_SETTINGS.versionAutoGroup,
    defaultVersionStatus:
      sections.version_policy?.defaultVersionStatus ??
      DEFAULT_APP_SETTINGS.defaultVersionStatus,
    versionNamingHint:
      sections.version_policy?.versionNamingHint ??
      DEFAULT_APP_SETTINGS.versionNamingHint,
    testRunDefaultTab:
      sections.test_run_policy?.testRunDefaultTab ??
      DEFAULT_APP_SETTINGS.testRunDefaultTab,
    testRunAutoStatusComplete:
      sections.test_run_policy?.testRunAutoStatusComplete ??
      DEFAULT_APP_SETTINGS.testRunAutoStatusComplete,
    testRunRequireVersion:
      sections.test_run_policy?.testRunRequireVersion ??
      DEFAULT_APP_SETTINGS.testRunRequireVersion,
    testRunDefaultPageSize:
      sections.test_run_policy?.testRunDefaultPageSize ??
      DEFAULT_APP_SETTINGS.testRunDefaultPageSize,
    lastBackupAt:
      sections.system?.lastBackupAt ?? DEFAULT_APP_SETTINGS.lastBackupAt,
    appVersion: sections.system?.appVersion,
    appBuildLabel: sections.system?.appBuildLabel,
  };
}

export function mapClientSettingsToServer(settings = {}) {
  return {
    session: {
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      sessionWarningEnabled: settings.sessionWarningEnabled,
    },
    basic: {
      dateFormat: settings.dateFormat,
      fixDefaultMenus: settings.fixDefaultMenus,
      menuSortOrder: settings.menuSortOrder,
      allowedFileExtensions: settings.allowedFileExtensions,
      maxFileSizeMb: settings.maxFileSizeMb,
      autoSaveEnabled: settings.autoSaveEnabled,
      pageSize: settings.pageSize,
      recentItemsCount: settings.recentItemsCount,
    },
    notifications: {
      notifyMention: settings.notifyMention,
      notifyAssignee: settings.notifyAssignee,
      notifyVersionRelease: settings.notifyVersionRelease,
      notifyIssueRegistered: settings.notifyIssueRegistered,
      notifyTestRunComplete: settings.notifyTestRunComplete,
      notifyEmailEnabled: settings.notifyEmailEnabled,
      notifyBrowserEnabled: settings.notifyBrowserEnabled,
      notifyQuietHoursEnabled: settings.notifyQuietHoursEnabled,
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
    },
    integrations: {
      webhookEnabled: settings.webhookEnabled,
      webhookUrl: settings.webhookUrl,
      slackEnabled: settings.slackEnabled,
      slackWebhookUrl: settings.slackWebhookUrl,
      teamsEnabled: settings.teamsEnabled,
    },
    version_policy: {
      versionYearBase: settings.versionYearBase,
      versionAutoGroup: settings.versionAutoGroup,
      defaultVersionStatus: settings.defaultVersionStatus,
      versionNamingHint: settings.versionNamingHint,
    },
    test_run_policy: {
      testRunDefaultTab: settings.testRunDefaultTab,
      testRunAutoStatusComplete: settings.testRunAutoStatusComplete,
      testRunRequireVersion: settings.testRunRequireVersion,
      testRunDefaultPageSize: settings.testRunDefaultPageSize,
    },
    permissions: settings.rolePermissions,
    managed_users: settings.managedUsers,
    system: {
      lastBackupAt: settings.lastBackupAt,
      appVersion: settings.appVersion,
      appBuildLabel: settings.appBuildLabel,
    },
  };
}

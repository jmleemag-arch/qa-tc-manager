export const SETTINGS_STORAGE_KEY = "qa-manager-app-settings";
export const SETTINGS_SAVED_EVENT = "qa-settings-saved";

export const SETTINGS_SECTIONS = [
  { id: "basic", label: "기본 설정" },
  { id: "users", label: "사용자 관리" },
  { id: "permissions", label: "권한 관리" },
  { id: "notifications", label: "알림 설정" },
  { id: "integrations", label: "연동 설정" },
  { id: "versions", label: "버전 설정" },
  { id: "testruns", label: "테스트 런 설정" },
  { id: "backup", label: "백업 및 복원" },
  { id: "system", label: "시스템 정보" },
];

export const EDITABLE_SECTION_IDS = new Set([
  "basic",
  "users",
  "permissions",
  "notifications",
  "integrations",
  "versions",
  "testruns",
]);

export const SESSION_TIMEOUT_OPTIONS = [
  { value: 5, label: "5분" },
  { value: 10, label: "10분" },
  { value: 15, label: "15분" },
  { value: 30, label: "30분" },
  { value: 60, label: "60분" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-07-09)" },
  { value: "YYYY.MM.DD", label: "YYYY.MM.DD (2025.07.09)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (09/07/2025)" },
];

export const MENU_SORT_OPTIONS = [
  { value: "custom", label: "사용자 정의 순서" },
  { value: "alphabetical", label: "가나다순" },
  { value: "recent", label: "최근 사용 순" },
];

export const FILE_SIZE_OPTIONS = [
  { value: 5, label: "5MB" },
  { value: 10, label: "10MB" },
  { value: 20, label: "20MB" },
  { value: 50, label: "50MB" },
];

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10개" },
  { value: 20, label: "20개" },
  { value: 50, label: "50개" },
  { value: 100, label: "100개" },
];

export const RECENT_ITEMS_OPTIONS = [
  { value: 5, label: "5개" },
  { value: 10, label: "10개" },
  { value: 20, label: "20개" },
];

export const USER_ROLE_OPTIONS = [
  { value: "admin", label: "관리자" },
  { value: "lead", label: "QA 리드" },
  { value: "tester", label: "QA 테스터" },
  { value: "viewer", label: "조회 전용" },
];

export const USER_STATUS_OPTIONS = [
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

export const VERSION_STATUS_OPTIONS = [
  { value: "planned", label: "예정" },
  { value: "in-progress", label: "진행 중" },
  { value: "completed", label: "완료" },
];

export const TEST_RUN_TAB_OPTIONS = [
  { value: "run-list", label: "테스트 런 목록" },
  { value: "summary", label: "요약 카드 중심" },
];

export const DEFAULT_APP_SETTINGS = {
  sessionTimeoutMinutes: 10,
  sessionWarningEnabled: true,
  dateFormat: "YYYY-MM-DD",
  fixDefaultMenus: true,
  menuSortOrder: "custom",
  allowedFileExtensions: ".png, .jpg, .jpeg, .gif, .pdf, .docx, .xlsx",
  maxFileSizeMb: 10,
  autoSaveEnabled: true,
  pageSize: 20,
  recentItemsCount: 10,

  managedUsers: [
    { id: "tester1", name: "김철수", role: "admin", status: "active", lastLogin: "2025-07-09 09:12" },
    { id: "lee-jumi", name: "이주미", role: "lead", status: "active", lastLogin: "2025-07-09 08:45" },
    { id: "qa-manager", name: "QA Manager", role: "tester", status: "active", lastLogin: "2025-07-08 17:30" },
  ],

  rolePermissions: {
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

  webhookEnabled: false,
  webhookUrl: "",
  slackEnabled: false,
  slackWebhookUrl: "",
  teamsEnabled: false,

  versionYearBase: 2000,
  versionAutoGroup: true,
  defaultVersionStatus: "planned",
  versionNamingHint: "YY.M.P (예: 26.1.0)",

  testRunDefaultTab: "run-list",
  testRunAutoStatusComplete: true,
  testRunRequireVersion: true,
  testRunDefaultPageSize: 20,

  lastBackupAt: "",
};

export const PERMISSION_MODULES = [
  { key: "dashboard", label: "대시보드" },
  { key: "testcases", label: "테스트 케이스" },
  { key: "testruns", label: "테스트 런" },
  { key: "defects", label: "결함 관리" },
  { key: "reports", label: "보고서" },
  { key: "settings", label: "설정" },
];

export const BACKUP_STORAGE_KEYS = [
  "qa-manager-app-settings",
  "qa-manager-test-cases",
  "qa-manager-test-case-versions",
  "qa-manager-test-case-custom-menu-pool",
  "qa-manager-issue-progress-versions",
];

export const SETTINGS_SAVED_MESSAGE = "설정이 저장되었습니다.";
export const BACKUP_EXPORT_SUCCESS_MESSAGE = "백업 파일을 다운로드했습니다.";
export const BACKUP_IMPORT_SUCCESS_MESSAGE = "백업 데이터를 복원했습니다. 페이지를 새로고침합니다.";
export const BACKUP_IMPORT_FAIL_MESSAGE = "백업 파일 형식이 올바르지 않습니다.";

export const APP_VERSION = "0.1.0";
export const APP_BUILD_LABEL = "2025.07.09";

export const MENU_IDS = {
  DASHBOARD: "dashboard",
  VERSIONS: "versions",
  TEST_CASES: "testcases",
  TEST_RUNS: "testruns",
  DEFECTS_NEW_ISSUES: "defects-new-issues",
  DEFECTS_PROGRESS: "defects-progress",
  DEFECTS_SEARCH: "defects-search",
  SETTINGS: "settings",
  NOTIFICATIONS: "notifications",
};

export const SIDEBAR_GROUPS = [
  {
    items: [{ id: MENU_IDS.DASHBOARD, label: "대시보드" }],
  },
  {
    label: "테스트 관리",
    items: [
      { id: MENU_IDS.VERSIONS, label: "버전 관리" },
      { id: MENU_IDS.TEST_CASES, label: "테스트 케이스" },
      { id: MENU_IDS.TEST_RUNS, label: "테스트 런" },
    ],
  },
  {
    label: "결함 관리",
    items: [
      { id: MENU_IDS.DEFECTS_NEW_ISSUES, label: "신규 등록 이슈" },
      { id: MENU_IDS.DEFECTS_PROGRESS, label: "주차별 진행 현황" },
      { id: MENU_IDS.DEFECTS_SEARCH, label: "검색/필터" },
    ],
  },
  {
    label: "설정",
    items: [
      { id: MENU_IDS.SETTINGS, label: "설정" },
    ],
  },
];

const MENU_ROUTE_SLUGS = {
  [MENU_IDS.DASHBOARD]: "dashboard",
  [MENU_IDS.VERSIONS]: "versions",
  [MENU_IDS.TEST_CASES]: "testcases",
  [MENU_IDS.TEST_RUNS]: "testruns",
  [MENU_IDS.DEFECTS_NEW_ISSUES]: "defects/new-issues",
  [MENU_IDS.DEFECTS_PROGRESS]: "defects/progress",
  [MENU_IDS.DEFECTS_SEARCH]: "defects/search",
  [MENU_IDS.SETTINGS]: "settings",
  [MENU_IDS.NOTIFICATIONS]: "notifications",
};

const SLUG_TO_MENU_ID = Object.fromEntries(
  Object.entries(MENU_ROUTE_SLUGS).map(([menuId, slug]) => [slug, menuId])
);

SLUG_TO_MENU_ID.defects = MENU_IDS.DEFECTS_PROGRESS;

export const PAGE_TITLES = {
  [MENU_IDS.DASHBOARD]: "대시보드",
  [MENU_IDS.VERSIONS]: "버전 관리",
  [MENU_IDS.TEST_CASES]: "테스트 케이스",
  [MENU_IDS.TEST_RUNS]: "테스트 런",
  [MENU_IDS.DEFECTS_NEW_ISSUES]: "신규 등록 이슈",
  [MENU_IDS.DEFECTS_PROGRESS]: "주차별 진행 현황",
  [MENU_IDS.DEFECTS_SEARCH]: "검색/필터",
  [MENU_IDS.SETTINGS]: "설정",
  [MENU_IDS.NOTIFICATIONS]: "알림",
};

export const PLACEHOLDER_ALERT = "준비 중인 페이지입니다.";

export function getMenuSlug(menuId) {
  return MENU_ROUTE_SLUGS[menuId] ?? MENU_ROUTE_SLUGS[MENU_IDS.DASHBOARD];
}

export function getMenuIdFromSlug(slug) {
  return SLUG_TO_MENU_ID[slug] ?? MENU_IDS.DASHBOARD;
}

export function getAllMenuIds() {
  return SIDEBAR_GROUPS.flatMap((group) => group.items.map((item) => item.id));
}

/** @deprecated Use MENU_IDS and SIDEBAR_GROUPS */
export const APP_SIDEBAR_MENUS = getAllMenuIds().map(
  (id) => PAGE_TITLES[id]
);

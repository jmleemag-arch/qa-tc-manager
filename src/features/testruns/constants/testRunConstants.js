export const TEST_RUN_STATUS = {
  WAITING: "대기",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  FAILED: "실패",
};

export const STATUS_FILTER_ALL = "전체 상태";

export const STATUS_FILTER_OPTIONS = [
  STATUS_FILTER_ALL,
  TEST_RUN_STATUS.WAITING,
  TEST_RUN_STATUS.IN_PROGRESS,
  TEST_RUN_STATUS.COMPLETED,
  TEST_RUN_STATUS.FAILED,
];

export const MENU_FILTER_ALL = "전체 메뉴";

export const MENU_FILTER_OPTIONS = [
  MENU_FILTER_ALL,
  "접속페이지",
  "대시보드",
  "장애 현황",
  "플로우 맵",
  "서버/단말 상태",
  "네트워크 노드 상태",
  "이벤트",
  "진단/분석",
  "검색",
  "서비스통계",
  "설정",
  "기타",
];

export const APP_SIDEBAR_MENUS = [
  "대시보드",
  "테스트 케이스",
  "테스트 런",
  "결함 관리",
  "보고서",
  "설정",
];

export const ACTIVE_TEST_RUN_MENU = "테스트 런";

export const TARGET_MENU_PLACEHOLDER = "대상 메뉴를 선택하세요";

export const TARGET_MENU_OPTIONS = [
  "접속페이지",
  "대시보드",
  "장애 현황",
  "플로우 맵",
  "서버/단말 상태",
  "네트워크 노드 상태",
  "이벤트",
  "진단/분석",
  "검색",
  "서비스통계",
  "설정",
  "기타",
];

export const RUN_NAME_REQUIRED_ALERT = "런 이름을 입력해주세요.";
export const TARGET_MENU_REQUIRED_ALERT = "대상 메뉴를 선택해주세요.";
export const TEST_CASE_REQUIRED_ALERT = "테스트 케이스를 선택해주세요.";

export const EXECUTION_RESULT_OPTIONS = ["O", "X", "BLOCK", "NT"];

export const DELETE_TEST_RUN_CONFIRM =
  "선택한 테스트 런을 삭제하시겠습니까?";
export const EXCEL_DOWNLOAD_EMPTY_ALERT = "다운로드할 테스트 런이 없습니다.";

export const CREATE_RUN_ALERT = "테스트 런 생성 기능은 추후 구현 예정입니다.";
export const VIEW_ALL_RUNS_ALERT =
  "전체 테스트 런 목록은 추후 구현 예정입니다.";
export const COMING_SOON_ALERT = "해당 메뉴는 추후 구현 예정입니다.";

export const SUMMARY_CARD_CONFIG = [
  { key: "totalRuns", label: "전체 테스트 런", tone: "blue", subKey: "totalRunsSub" },
  { key: "failed", label: "실패", tone: "red" },
  { key: "completed", label: "완료", tone: "green" },
  { key: "inProgress", label: "진행 중", tone: "purple" },
  { key: "waiting", label: "대기", tone: "gray" },
  { key: "latestRunDate", label: "최근 실행", tone: "sky", subKey: "latestRunTime" },
];

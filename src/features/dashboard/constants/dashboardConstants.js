export const SUMMARY_CARD_CONFIG = [
  { key: "totalTestCases", label: "전체 테스트 케이스", tone: "blue", subKey: "totalTestCasesSub" },
  { key: "passCount", label: "정상(O)", tone: "green", subKey: "passCountSub" },
  { key: "failCount", label: "비정상(X)", tone: "red", subKey: "failCountSub" },
  { key: "emptyCount", label: "미작성(-)", tone: "gray", subKey: "emptyCountSub" },
  { key: "totalTestRuns", label: "전체 테스트 런", tone: "sky", subKey: "totalTestRunsSub" },
  { key: "totalDefects", label: "전체 결함", tone: "purple", subKey: "totalDefectsSub" },
];

export const SUMMARY_ICONS = {
  totalTestCases: "☰",
  passCount: "✓",
  failCount: "✕",
  emptyCount: "−",
  totalTestRuns: "▦",
  totalDefects: "⚠",
};

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

export const TEST_RUN_STATUS = {
  COMPLETED: "완료",
  IN_PROGRESS: "진행 중",
  WAITING: "대기",
  FAILED: "실패",
};

export const VIEW_ALL_TEST_CASES_ALERT =
  "테스트 케이스 전체 보기 기능은 추후 구현 예정입니다.";
export const VIEW_ALL_DEFECTS_ALERT =
  "결함 관리 페이지는 추후 구현 예정입니다.";

export const DEFECT_TREND_LEGEND = [
  { key: "registered", label: "등록", color: "#3b82f6" },
  { key: "resolved", label: "해결", color: "#22c55e" },
  { key: "remaining", label: "잔여", color: "#f59e0b" },
];

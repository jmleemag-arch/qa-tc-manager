export const ISSUE_ROUND_STATUS = {
  NOT_STARTED: "미작성",
  IN_PROGRESS: "작성중",
  COMPLETED: "작성완료",
};

export const ISSUE_REDMINE_STATUS = {
  SYNCED: "등록완료",
  FAILED: "Redmine 등록 실패",
};

export const ISSUE_PRIORITY_OPTIONS = ["Low", "Normal", "High", "Urgent"];

export const ISSUE_MENU_OPTIONS = [
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

export const DELETE_ISSUE_VERSION_CONFIRM =
  "버전을 삭제하시겠습니까? 등록된 주차 회차도 함께 삭제됩니다.";

export const ASSIGNEE_FILTER_ALL = "담당자 전체";

export const NEW_ISSUE_PAGE_SIZE_OPTIONS = [10, 20, 50];

export const NEW_ISSUE_EXCEL_ALERT = "엑셀 다운로드는 추후 구현 예정입니다.";
export const NEW_ISSUE_EXCEL_EMPTY_ALERT =
  "다운로드할 신규 등록 이슈가 없습니다.";

export const ISSUE_ROUND_STATUS_TONE = {
  [ISSUE_ROUND_STATUS.NOT_STARTED]: "waiting",
  [ISSUE_ROUND_STATUS.IN_PROGRESS]: "in-progress",
  [ISSUE_ROUND_STATUS.COMPLETED]: "completed",
};

export const WEEKLY_STATUS_FILTER_ALL = "전체";

export const WEEKLY_STATUS_FILTER_OPTIONS = [
  WEEKLY_STATUS_FILTER_ALL,
  "미작성",
  "작성 중",
  "작성 완료",
];

export const WEEKLY_PAGE_SIZE_OPTIONS = [10, 20, 50];

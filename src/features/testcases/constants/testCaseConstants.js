export const PROJECT_NAME = "Sample Project";

export const HEADER_MENUS = [
  "개요",
  "테스트 케이스",
  "테스트 런",
  "결함",
  "보고서",
  "설정",
];

export const ACTIVE_HEADER_MENU = "테스트 케이스";

export const TOTAL_MENU = "Total";

export const TC_MENUS = [
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
];

export const SIDEBAR_MENUS = [TOTAL_MENU, ...TC_MENUS];

export const VERSION_FILTER_ALL = "ALL";

export const INITIAL_TEST_CASE_VERSIONS = [
  {
    id: "v1.0",
    name: "v1.0",
    description: "Initial login checks",
  },
  {
    id: "v1.1",
    name: "v1.1",
    description: "Login exception checks",
  },
  {
    id: "v1.2",
    name: "v1.2",
    description: "Session management checks",
  },
];

export const EXCEL_DOWNLOAD_EMPTY_ALERT =
  "다운로드할 테스트 케이스가 없습니다.";

export const MENU_SELECT_ALERT = "메뉴를 먼저 선택해주세요.";

export const DELETE_SELECT_ALERT = "삭제할 TC를 선택해주세요.";

export const IS_WORKING_OPTIONS = ["O", "X"];

export const IS_WORKING_FILTER_ALL = "ALL";

export const IS_WORKING_FILTER_OPTIONS = [
  { value: IS_WORKING_FILTER_ALL, label: "전체" },
  { value: "O", label: "O" },
  { value: "X", label: "X" },
];

export const EDITABLE_TEST_CASE_FIELDS = [
  { name: "subMenu", label: "서브메뉴", type: "text" },
  { name: "checkItem", label: "점검항목", type: "text", fullWidth: true },
  {
    name: "checkMethod",
    label: "확인 방법",
    type: "textarea",
    fullWidth: true,
  },
  {
    name: "checkResult",
    label: "확인 결과",
    type: "textarea",
    fullWidth: true,
  },
  { name: "note", label: "비고", type: "textarea", fullWidth: true },
];

export const SEARCHABLE_FIELDS = [
  "id",
  "subMenu",
  "checkItem",
  "checkMethod",
  "checkResult",
  "note",
];

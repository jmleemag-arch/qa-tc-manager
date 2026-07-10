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

export const FIXED_VERSION_MENUS = [TOTAL_MENU, "대시보드"];

export const TC_MENUS = [
  "장애 현황",
  "플로우 맵",
  "서버 / 단말 상태",
  "네트워크 노드 상태",
  "웹페이지 현황",
  "진단/분석",
  "이벤트",
  "검색",
  "서비스 통계",
  "설정",
];

export const INSERTABLE_MENU_POOL = [...TC_MENUS];

export const SIDEBAR_MENUS = [...FIXED_VERSION_MENUS, ...TC_MENUS];

export const INITIAL_TEST_CASE_VERSIONS = [
  {
    id: "26.1.0",
    name: "26.1.0",
    description: "",
    menus: [TOTAL_MENU, "대시보드", "장애 현황"],
  },
  {
    id: "26.1.1",
    name: "26.1.1",
    description: "",
    menus: [TOTAL_MENU, "대시보드", "장애 현황", "플로우 맵"],
  },
  {
    id: "26.2.0",
    name: "26.2.0",
    description: "",
    menus: [TOTAL_MENU, "대시보드", "장애 현황", "플로우 맵"],
  },
];

export const EXCEL_DOWNLOAD_EMPTY_ALERT =
  "다운로드할 테스트 케이스가 없습니다.";

export const MENU_SELECT_ALERT = "메뉴를 먼저 선택해주세요.";

export const DELETE_SELECT_ALERT = "삭제할 TC를 선택해주세요.";

export function getDeleteVersionConfirmMessage(versionName) {
  return `${versionName} 버전을 정말 삭제하시겠습니까?\n\n삭제 후 복구할 수 없으며, 이 버전의 테스트 케이스·테스트 런·주차별 진행 현황도 함께 삭제됩니다.`;
}

export const IS_WORKING_EMPTY_VALUE = "";

export const IS_WORKING_OPTIONS = ["O", "X", "N/A", "N/T"];

export const IS_WORKING_FILTER_ALL = "ALL";

export const IS_WORKING_FILTER_OPTIONS = [
  { value: IS_WORKING_FILTER_ALL, label: "전체" },
  { value: IS_WORKING_EMPTY_VALUE, label: "미지정" },
  { value: "O", label: "O" },
  { value: "X", label: "X" },
  { value: "N/A", label: "N/A" },
  { value: "N/T", label: "N/T" },
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

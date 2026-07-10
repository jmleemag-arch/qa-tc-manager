export const MY_TASK_TABS = [
  { id: "all", label: "전체" },
  { id: "pending", label: "미처리" },
  { id: "in_progress", label: "진행 중" },
  { id: "completed", label: "완료" },
];

export const MY_TASK_TYPE_OPTIONS = [
  "전체 유형",
  "재검증 요청",
  "담당 TC",
  "상태 변경",
  "멘션",
];

export const MY_TASK_STATUS_OPTIONS = [
  "전체 상태",
  "미처리",
  "진행 중",
  "완료",
];

export const MY_TASK_PAGE_SIZE_OPTIONS = [10, 20, 50];

export const MY_TASK_TYPE_TONE = {
  "재검증 요청": "orange",
  "담당 TC": "blue",
  "상태 변경": "yellow",
  "멘션": "purple",
};

export const MY_TASK_PRIORITY_TONE = {
  "높음": "high",
  "보통": "normal",
  "낮음": "low",
};

export const MY_TASK_STATUS_TONE = {
  "미처리": "pending",
  "진행 중": "in-progress",
  "완료": "completed",
};

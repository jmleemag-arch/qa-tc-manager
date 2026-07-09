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

export const TEST_RUN_STATUS = {
  COMPLETED: "완료",
  IN_PROGRESS: "진행 중",
  WAITING: "대기",
  FAILED: "실패",
};

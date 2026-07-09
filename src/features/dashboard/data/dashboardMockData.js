export const summaryCards = {
  totalTestCases: 582,
  totalTestCasesSub: "▲ 12 지난주 대비",
  passCount: 412,
  passCountSub: "70.8%",
  failCount: 128,
  failCountSub: "22.0%",
  emptyCount: 42,
  emptyCountSub: "7.2%",
  totalTestRuns: 12,
  totalTestRunsSub: "▲ 3 이번 주",
  totalDefects: 18,
  totalDefectsSub: "▲ 4 이번 주",
};

export const testRunStatus = {
  total: 12,
  segments: [
    { key: "completed", label: "완료", count: 7, percent: 58.3, color: "#22c55e" },
    { key: "inProgress", label: "진행 중", count: 3, percent: 25.0, color: "#3b82f6" },
    { key: "failed", label: "실패", count: 2, percent: 16.7, color: "#ef4444" },
    { key: "waiting", label: "대기", count: 0, percent: 0, color: "#94a3b8" },
  ],
};

export const recentTestRuns = [
  {
    runId: "TR-2026-00012",
    runName: "2026-07-08 접속페이지 정기 점검",
    targetMenu: "접속페이지",
    status: "완료",
    progress: 100,
    createdAt: "2026-07-08 10:30",
  },
  {
    runId: "TR-2026-00011",
    runName: "2026-07-07 대시보드 기능 확인",
    targetMenu: "대시보드",
    status: "진행 중",
    progress: 60,
    createdAt: "2026-07-07 14:20",
  },
  {
    runId: "TR-2026-00010",
    runName: "2026-07-06 전체 회귀 테스트",
    targetMenu: "전체",
    status: "완료",
    progress: 100,
    createdAt: "2026-07-06 09:15",
  },
  {
    runId: "TR-2026-00009",
    runName: "2026-07-05 설정 메뉴 테스트",
    targetMenu: "설정",
    status: "진행 중",
    progress: 36,
    createdAt: "2026-07-05 16:45",
  },
  {
    runId: "TR-2026-00008",
    runName: "2026-07-04 이벤트 로그 확인",
    targetMenu: "이벤트",
    status: "대기",
    progress: 0,
    createdAt: "2026-07-04 11:00",
  },
];

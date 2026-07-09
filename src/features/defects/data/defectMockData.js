export const issueProgressVersions = [
  {
    version: "26.1.0",
    registeredAt: "2026.04.01",
    status: "완료",
    rows: [
      { id: "26.1.0-2026-04-01", dateValue: "2026-04-01", total: 10, inProgress: 8, newCount: 6 },
      { id: "26.1.0-2026-04-08", dateValue: "2026-04-08", total: 24, inProgress: 20, newCount: 12 },
    ],
  },
  {
    version: "26.1.1",
    registeredAt: "2026.05.21",
    status: "완료",
    rows: [
      { id: "26.1.1-2026-05-21", dateValue: "2026-05-21", total: 0, inProgress: 0, newCount: 0 },
      { id: "26.1.1-2026-05-28", dateValue: "2026-05-28", total: 13, inProgress: 13, newCount: 13 },
      { id: "26.1.1-2026-06-04", dateValue: "2026-06-04", total: 72, inProgress: 71, newCount: 69 },
      { id: "26.1.1-2026-06-11", dateValue: "2026-06-11", total: 91, inProgress: 90, newCount: 86 },
      { id: "26.1.1-2026-06-18", dateValue: "2026-06-18", total: 105, inProgress: 103, newCount: 91 },
      { id: "26.1.1-2026-06-25", dateValue: "2026-06-25", total: 127, inProgress: 118, newCount: 96 },
      { id: "26.1.1-2026-07-02", dateValue: "2026-07-02", total: 141, inProgress: 125, newCount: 102 },
      { id: "26.1.1-2026-07-09", dateValue: "2026-07-09", total: 155, inProgress: 127, newCount: 108 },
      { id: "26.1.1-2026-07-16", dateValue: "2026-07-16", total: 170, inProgress: 146, newCount: 113 },
    ],
  },
  {
    version: "26.2.0",
    registeredAt: "2026.05.21",
    status: "진행 중",
    rows: [
      { id: "26.2.0-2026-05-21", dateValue: "2026-05-21", total: 0, inProgress: 0, newCount: 0 },
      { id: "26.2.0-2026-05-28", dateValue: "2026-05-28", total: 8, inProgress: 8, newCount: 8 },
      { id: "26.2.0-2026-06-04", dateValue: "2026-06-04", total: 12, inProgress: 12, newCount: 12 },
      { id: "26.2.0-2026-06-11", dateValue: "2026-06-11", total: 28, inProgress: 28, newCount: 28 },
      { id: "26.2.0-2026-06-18", dateValue: "2026-06-18", total: 28, inProgress: 28, newCount: 28 },
    ],
  },
  {
    version: "26.3.0",
    registeredAt: "예정",
    status: "예정",
    startDate: "2026-08-01",
    endDate: "2026-10-31",
    description: "다음 릴리스 준비 버전",
    rows: [],
  },
  {
    version: "27.1.0",
    registeredAt: "2027.01.15",
    status: "예정",
    startDate: "2027-01-15",
    endDate: "2027-03-31",
    description: "2027년 첫 릴리스",
    rows: [],
  },
];

export const issueMenuDistribution = [
  { menu: "접속페이지", count: 128 },
  { menu: "대시보드", count: 95 },
  { menu: "장애 현황", count: 72 },
  { menu: "플로우 맵", count: 58 },
  { menu: "이벤트", count: 46 },
  { menu: "설정", count: 41 },
];

export const recentIssues = [
  { id: "TC-009", title: "대시보드 차트 데이터 확인", result: "O", date: "2026-07-08" },
  { id: "TC-008", title: "브라우저 호환성 확인", result: "X", date: "2026-07-08" },
];

export const issueSeverityDistribution = {
  total: 18,
  segments: [
    { key: "critical", label: "Critical", count: 2, percent: 11.1, color: "#ef4444" },
    { key: "major", label: "Major", count: 6, percent: 33.3, color: "#f97316" },
    { key: "minor", label: "Minor", count: 7, percent: 38.9, color: "#eab308" },
    { key: "trivial", label: "Trivial", count: 3, percent: 16.7, color: "#94a3b8" },
  ],
};

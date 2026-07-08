import { MENU_FILTER_ALL, TEST_RUN_STATUS } from "../constants/dashboardConstants";

export function buildDonutGradient(segments) {
  const activeSegments = segments.filter((segment) => segment.count > 0);

  if (activeSegments.length === 0) {
    return { background: "#e2e8f0" };
  }

  let currentPercent = 0;
  const gradientParts = activeSegments.map((segment) => {
    const nextPercent = currentPercent + segment.percent;
    const part = `${segment.color} ${currentPercent}% ${nextPercent}%`;
    currentPercent = nextPercent;
    return part;
  });

  return { background: `conic-gradient(${gradientParts.join(", ")})` };
}

export function getTestRunStatusTone(status) {
  switch (status) {
    case TEST_RUN_STATUS.COMPLETED:
      return "completed";
    case TEST_RUN_STATUS.IN_PROGRESS:
      return "in-progress";
    case TEST_RUN_STATUS.WAITING:
      return "waiting";
    case TEST_RUN_STATUS.FAILED:
      return "failed";
    default:
      return "waiting";
  }
}

export function getProgressTone(progress) {
  if (progress >= 100) {
    return "complete";
  }

  if (progress > 0) {
    return "active";
  }

  return "idle";
}

export function filterMenuTestCaseCounts(menuTestCaseCounts, menuFilter) {
  if (menuFilter === MENU_FILTER_ALL) {
    return menuTestCaseCounts;
  }

  return menuTestCaseCounts.filter((item) => item.menu === menuFilter);
}

export function getMaxMenuCount(menuTestCaseCounts) {
  if (menuTestCaseCounts.length === 0) {
    return 0;
  }

  return Math.max(...menuTestCaseCounts.map((item) => item.count));
}

export function getTrendMaxValue(defectTrend) {
  const values = defectTrend.flatMap((week) => [
    week.registered,
    week.resolved,
    week.remaining,
  ]);

  return Math.max(...values, 1);
}

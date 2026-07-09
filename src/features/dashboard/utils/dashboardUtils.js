import { TEST_RUN_STATUS } from "../constants/dashboardConstants";

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

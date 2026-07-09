import {
  MENU_FILTER_ALL,
  RUN_NAME_REQUIRED_ALERT,
  STATUS_FILTER_ALL,
  TARGET_MENU_REQUIRED_ALERT,
  TEST_CASE_REQUIRED_ALERT,
  TEST_RUN_STATUS,
  VERSION_REQUIRED_ALERT,
} from "../constants/testRunConstants";

export function calculateProgress(completedCount, totalCount) {
  if (!totalCount || totalCount <= 0) {
    return 0;
  }

  return Math.round((completedCount / totalCount) * 100);
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

export function getStatusTone(status) {
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

function parseCreatedDate(createdAt) {
  return createdAt.split(" ")[0];
}

export function sortTestRunsByCreatedAt(testRuns = []) {
  const runs = Array.isArray(testRuns) ? testRuns : [];

  return [...runs].sort((left, right) => {
    const createdAtDiff = right.createdAt.localeCompare(left.createdAt);

    if (createdAtDiff !== 0) {
      return createdAtDiff;
    }

    return (right.dbId ?? 0) - (left.dbId ?? 0);
  });
}

export function filterTestRuns(
  testRuns = [],
  {
    statusFilter = STATUS_FILTER_ALL,
    menuFilter = MENU_FILTER_ALL,
    searchText = "",
    startDate = "",
    endDate = "",
  } = {}
) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const runs = Array.isArray(testRuns) ? testRuns : [];

  return sortTestRunsByCreatedAt(
    runs.filter((run) => {
      const isStatusMatched =
        statusFilter === STATUS_FILTER_ALL || run.status === statusFilter;

      const isMenuMatched =
        menuFilter === MENU_FILTER_ALL || run.targetMenu === menuFilter;

      const isSearchMatched =
        !normalizedSearch ||
        run.runId.toLowerCase().includes(normalizedSearch) ||
        run.runName.toLowerCase().includes(normalizedSearch);

      const runDate = parseCreatedDate(run.createdAt);
      const isStartDateMatched = !startDate || runDate >= startDate;
      const isEndDateMatched = !endDate || runDate <= endDate;

      return (
        isStatusMatched &&
        isMenuMatched &&
        isSearchMatched &&
        isStartDateMatched &&
        isEndDateMatched
      );
    })
  );
}

export function getSummaryStats(testRuns = []) {
  const runs = Array.isArray(testRuns) ? testRuns : [];
  const latestRun = getRecentTestRuns(runs, 1)[0];
  const totalRuns = runs.length;
  const completed = runs.filter(
    (run) => run.status === TEST_RUN_STATUS.COMPLETED
  ).length;
  const inProgress = runs.filter(
    (run) => run.status === TEST_RUN_STATUS.IN_PROGRESS
  ).length;
  const failed = runs.filter((run) => run.status === TEST_RUN_STATUS.FAILED)
    .length;
  const waiting = runs.filter((run) => run.status === TEST_RUN_STATUS.WAITING)
    .length;
  const formatPercent = (count) =>
    totalRuns ? `${((count / totalRuns) * 100).toFixed(1)}%` : "0%";

  return {
    totalRuns,
    totalRunsSub: "▲ 3 이번 주",
    inProgress,
    inProgressSub: formatPercent(inProgress),
    completed,
    completedSub: formatPercent(completed),
    failed,
    failedSub: formatPercent(failed),
    waiting,
    waitingSub: formatPercent(waiting),
    totalTcCount: runs.reduce((sum, run) => sum + (run.totalCount ?? 0), 0),
    latestRunDate: latestRun ? parseCreatedDate(latestRun.createdAt) : "-",
    latestRunTime: latestRun ? latestRun.createdAt.split(" ")[1] ?? "" : "",
  };
}

export function getRecentTestRuns(testRuns = [], limit = 5) {
  return sortTestRunsByCreatedAt(testRuns).slice(0, limit);
}

export function getStatusDistribution(testRuns = []) {
  const runs = Array.isArray(testRuns) ? testRuns : [];

  return {
    completed: runs.filter(
      (run) => run.status === TEST_RUN_STATUS.COMPLETED
    ).length,
    inProgress: runs.filter(
      (run) => run.status === TEST_RUN_STATUS.IN_PROGRESS
    ).length,
    failed: runs.filter((run) => run.status === TEST_RUN_STATUS.FAILED)
      .length,
    waiting: runs.filter((run) => run.status === TEST_RUN_STATUS.WAITING)
      .length,
  };
}

export function getTestCasesByMenu(allTestCases = [], targetMenu) {
  if (!targetMenu) {
    return [];
  }

  const testCases = Array.isArray(allTestCases) ? allTestCases : [];

  return testCases.filter((testCase) => testCase.menu === targetMenu);
}

export function formatTestCaseDisplayId(index) {
  return `TC-${String(index + 1).padStart(3, "0")}`;
}

export function mapTestCasesToRunTestCases(selectedTestCases) {
  return selectedTestCases.map((testCase, index) => ({
    uid: testCase.uid,
    originalId: testCase.id,
    displayId: formatTestCaseDisplayId(index),
    menu: testCase.menu,
    subMenu: testCase.subMenu ?? "",
    checkItem: testCase.checkItem ?? "",
    checkMethod: testCase.checkMethod ?? "",
    checkResult: testCase.checkResult ?? "",
    isWorking: "NT",
    note: testCase.note ?? "",
  }));
}

export function generateRunId(existingRuns = []) {
  const runs = Array.isArray(existingRuns) ? existingRuns : [];
  const nextNumber = runs.length + 1;

  return `TR-2026-${String(nextNumber).padStart(5, "0")}`;
}

export function formatRunCreatedAt(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function buildTestRunCreatePayload({
  runName,
  targetMenu,
  targetVersion,
  selectedTestCases,
}) {
  return {
    runName: runName.trim(),
    targetMenu,
    targetVersion,
    testCaseIds: selectedTestCases
      .map((testCase) => Number(testCase.uid))
      .filter((id) => Number.isFinite(id)),
  };
}

export function validateTestRunCreateForm({
  runName,
  targetMenu,
  targetVersion,
  selectedCount,
}) {
  if (!runName.trim()) {
    return RUN_NAME_REQUIRED_ALERT;
  }

  if (!targetVersion) {
    return VERSION_REQUIRED_ALERT;
  }

  if (!targetMenu) {
    return TARGET_MENU_REQUIRED_ALERT;
  }

  if (selectedCount === 0) {
    return TEST_CASE_REQUIRED_ALERT;
  }

  return null;
}

function countExecutionResults(testCases = []) {
  return testCases.reduce(
    (counts, testCase) => {
      switch (testCase.isWorking) {
        case "O":
          counts.passCount += 1;
          break;
        case "X":
          counts.failCount += 1;
          break;
        case "BLOCK":
          counts.blockCount += 1;
          break;
        default:
          counts.ntCount += 1;
          break;
      }

      return counts;
    },
    { passCount: 0, failCount: 0, blockCount: 0, ntCount: 0 }
  );
}

export function deriveTestRunStatus(counts, totalCount) {
  if (!totalCount) {
    return TEST_RUN_STATUS.WAITING;
  }

  if (counts.ntCount === totalCount) {
    return TEST_RUN_STATUS.WAITING;
  }

  if (counts.ntCount > 0) {
    return TEST_RUN_STATUS.IN_PROGRESS;
  }

  if (counts.failCount > 0 || counts.blockCount > 0) {
    return TEST_RUN_STATUS.FAILED;
  }

  if (counts.passCount === totalCount) {
    return TEST_RUN_STATUS.COMPLETED;
  }

  return TEST_RUN_STATUS.FAILED;
}

export function computeTestRunStats(testCases = []) {
  const cases = Array.isArray(testCases) ? testCases : [];
  const counts = countExecutionResults(cases);
  const totalCount = cases.length;
  const completedCount =
    counts.passCount + counts.failCount + counts.blockCount;

  return {
    totalCount,
    completedCount,
    passCount: counts.passCount,
    failCount: counts.failCount,
    blockCount: counts.blockCount,
    ntCount: counts.ntCount,
    status: deriveTestRunStatus(counts, totalCount),
  };
}

export function applyTestRunStats(testRun) {
  const stats = computeTestRunStats(testRun.testCases);

  return {
    ...testRun,
    ...stats,
  };
}

export function updateTestRunCaseResult(testRuns, runId, uid, result) {
  const runs = Array.isArray(testRuns) ? testRuns : [];

  return runs.map((run) => {
    if (run.runId !== runId) {
      return run;
    }

    const updatedTestCases = (run.testCases ?? []).map((testCase) => {
      if (testCase.uid !== uid) {
        return testCase;
      }

      return {
        ...testCase,
        isWorking: result,
      };
    });

    return applyTestRunStats({
      ...run,
      testCases: updatedTestCases,
    });
  });
}

export function deleteTestRun(testRuns, runId) {
  const runs = Array.isArray(testRuns) ? testRuns : [];

  return runs.filter((run) => run.runId !== runId);
}

export function findTestRunById(testRuns, runId) {
  const runs = Array.isArray(testRuns) ? testRuns : [];
  const normalizedId = String(runId ?? "");

  return (
    runs.find(
      (run) =>
        String(run.runId) === normalizedId ||
        String(run.dbId) === normalizedId
    ) ?? null
  );
}

const TEST_RUN_STATUS = {
  WAITING: "대기",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  FAILED: "실패",
};

export function formatRunDisplayId(id, year = new Date().getFullYear()) {
  return `TR-${year}-${String(id).padStart(5, "0")}`;
}

export function formatRunCreatedAt(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
        case "N/A":
          counts.naCount += 1;
          break;
        case "N/T":
          counts.ntCount += 1;
          break;
        default:
          counts.unsetCount += 1;
          break;
      }

      return counts;
    },
    { passCount: 0, failCount: 0, naCount: 0, ntCount: 0, unsetCount: 0 }
  );
}

function deriveTestRunStatus(counts, totalCount) {
  if (!totalCount) {
    return TEST_RUN_STATUS.WAITING;
  }

  if (counts.unsetCount === totalCount) {
    return TEST_RUN_STATUS.WAITING;
  }

  if (counts.unsetCount > 0) {
    return TEST_RUN_STATUS.IN_PROGRESS;
  }

  if (counts.failCount > 0 || counts.naCount > 0) {
    return TEST_RUN_STATUS.FAILED;
  }

  if (counts.passCount === totalCount) {
    return TEST_RUN_STATUS.COMPLETED;
  }

  return TEST_RUN_STATUS.FAILED;
}

export function computeTestRunStats(testCases = []) {
  const counts = countExecutionResults(testCases);
  const totalCount = testCases.length;
  const completedCount =
    counts.passCount +
    counts.failCount +
    counts.naCount +
    counts.ntCount;

  return {
    totalCount,
    completedCount,
    passCount: counts.passCount,
    failCount: counts.failCount,
    naCount: counts.naCount,
    ntCount: counts.ntCount,
    unsetCount: counts.unsetCount,
    status: deriveTestRunStatus(counts, totalCount),
  };
}

function formatTestCaseDisplayId(index) {
  return `TC-${String(index + 1).padStart(3, "0")}`;
}

export function toTestRunItemResponse(item, index) {
  const testCase = item.testCase;

  return {
    uid: String(testCase.id),
    originalId: testCase.caseCode,
    displayId: formatTestCaseDisplayId(index),
    menu: testCase.menu,
    subMenu: testCase.submenu ?? "",
    checkItem: testCase.checkItem ?? "",
    checkMethod: testCase.checkMethod ?? "",
    checkResult: testCase.expectedResult ?? "",
    isWorking: item.result ?? "",
    note: testCase.note ?? "",
  };
}

export function toTestRunResponse(record, sequenceNumber) {
  const testCases = (record.items ?? [])
    .sort((a, b) => a.id - b.id)
    .map((item, index) => toTestRunItemResponse(item, index));
  const stats = computeTestRunStats(testCases);
  const createdYear = record.createdAt
    ? new Date(record.createdAt).getFullYear()
    : new Date().getFullYear();
  const runSequence = sequenceNumber ?? record.id;

  return {
    dbId: record.id,
    runId: formatRunDisplayId(runSequence, createdYear),
    runName: record.runName,
    targetMenu: record.targetMenu ?? "",
    targetVersion: record.version?.versionName ?? null,
    ...stats,
    createdAt: formatRunCreatedAt(record.createdAt),
    testCases,
  };
}

import { prisma } from "../db.js";
import {
  computeTestRunStats,
  formatRunDisplayId,
  toTestRunItemResponse,
  toTestRunResponse,
} from "./testRunMapper.js";

const TEST_RUN_INCLUDE = {
  version: {
    select: {
      id: true,
      versionName: true,
    },
  },
  items: {
    include: {
      testCase: true,
    },
    orderBy: {
      id: "asc",
    },
  },
};

async function loadRunContext() {
  const records = await prisma.testRun.findMany({
    include: TEST_RUN_INCLUDE,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const dbIdToSequence = new Map();
  const displayIdToDbId = new Map();

  records.forEach((record, index) => {
    const sequence = index + 1;
    const year = new Date(record.createdAt).getFullYear();
    const displayId = formatRunDisplayId(sequence, year);

    dbIdToSequence.set(record.id, sequence);
    displayIdToDbId.set(displayId, record.id);
  });

  return { records, dbIdToSequence, displayIdToDbId };
}

export function parseRunIdentifier(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const text = String(value).trim();
  const match = text.match(/^TR-\d{4}-(\d+)$/i);

  if (match) {
    return Number(match[1]);
  }

  const numericId = Number(text);
  return Number.isFinite(numericId) ? numericId : null;
}

function resolveDbId(identifier, { records, displayIdToDbId }) {
  const text = String(identifier ?? "").trim();

  if (!text) {
    return null;
  }

  if (displayIdToDbId.has(text)) {
    return displayIdToDbId.get(text);
  }

  const numericId = Number(text);

  if (Number.isFinite(numericId)) {
    const matchedRecord = records.find((record) => record.id === numericId);
    return matchedRecord?.id ?? null;
  }

  return null;
}

async function resolveVersionId(versionName) {
  if (!versionName) {
    return null;
  }

  const version = await prisma.version.findUnique({
    where: { versionName: String(versionName) },
    select: { id: true },
  });

  return version?.id ?? null;
}

async function getTestRunRecord(id) {
  const context = await loadRunContext();
  const dbId = resolveDbId(id, context);

  if (!dbId) {
    return null;
  }

  return context.records.find((record) => record.id === dbId) ?? null;
}

export async function listTestRuns() {
  const { records, dbIdToSequence } = await loadRunContext();

  return [...records]
    .sort((left, right) => {
      const createdAtDiff = right.createdAt - left.createdAt;

      if (createdAtDiff !== 0) {
        return createdAtDiff;
      }

      return right.id - left.id;
    })
    .map((record) =>
      toTestRunResponse(record, dbIdToSequence.get(record.id))
    );
}

export async function getTestRunById(id) {
  const context = await loadRunContext();
  const dbId = resolveDbId(id, context);

  if (!dbId) {
    return null;
  }

  const record = context.records.find((entry) => entry.id === dbId);

  if (!record) {
    return null;
  }

  return toTestRunResponse(record, context.dbIdToSequence.get(record.id));
}

export async function createTestRun(payload) {
  const runName = String(payload.runName ?? "").trim();
  const targetMenu = String(payload.targetMenu ?? "").trim();
  const versionName = payload.targetVersion ?? payload.versionName ?? null;
  const versionId = await resolveVersionId(versionName);
  const testCaseIds = (payload.testCaseIds ?? [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  if (!runName) {
    throw new Error("RUN_NAME_REQUIRED");
  }

  if (!versionId) {
    throw new Error("VERSION_REQUIRED");
  }

  if (!targetMenu) {
    throw new Error("TARGET_MENU_REQUIRED");
  }

  if (testCaseIds.length === 0) {
    throw new Error("TEST_CASE_REQUIRED");
  }

  const testCases = await prisma.testCase.findMany({
    where: {
      id: {
        in: testCaseIds,
      },
    },
    select: { id: true },
  });

  if (testCases.length !== testCaseIds.length) {
    throw new Error("TEST_CASE_NOT_FOUND");
  }

  const record = await prisma.testRun.create({
    data: {
      versionId,
      runName,
      targetMenu,
      status: "대기",
      startedAt: new Date(),
      items: {
        create: testCaseIds.map((testCaseId) => ({
          testCaseId,
          result: "NT",
        })),
      },
    },
    include: TEST_RUN_INCLUDE,
  });

  return getTestRunById(record.id);
}

export async function deleteTestRun(id) {
  const context = await loadRunContext();
  const dbId = resolveDbId(id, context);

  if (!dbId) {
    return false;
  }

  const existing = context.records.find((record) => record.id === dbId);

  if (!existing) {
    return false;
  }

  await prisma.testRun.delete({
    where: { id: dbId },
  });

  return true;
}

export async function updateTestRunItemResult(runId, testCaseId, result) {
  const context = await loadRunContext();
  const numericRunId = resolveDbId(runId, context);
  const numericTestCaseId = Number(testCaseId);

  if (!numericRunId || !Number.isFinite(numericTestCaseId)) {
    return null;
  }

  const item = await prisma.testRunItem.findUnique({
    where: {
      testRunId_testCaseId: {
        testRunId: numericRunId,
        testCaseId: numericTestCaseId,
      },
    },
  });

  if (!item) {
    return null;
  }

  await prisma.testRunItem.update({
    where: { id: item.id },
    data: {
      result: String(result ?? "NT"),
      executedAt: new Date(),
    },
  });

  const record = await getTestRunRecord(numericRunId);

  if (!record) {
    return null;
  }

  const testCases = record.items.map((entry, index) =>
    toTestRunItemResponse(entry, index)
  );
  const stats = computeTestRunStats(testCases);
  const completedAt =
    stats.status === "완료" || stats.status === "실패"
      ? new Date()
      : null;

  await prisma.testRun.update({
    where: { id: numericRunId },
    data: {
      status: stats.status,
      completedAt,
    },
  });

  return getTestRunById(numericRunId);
}

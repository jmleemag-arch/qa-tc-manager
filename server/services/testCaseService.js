import { prisma } from "../db.js";
import {
  toTestCaseCreateData,
  toTestCaseResponse,
  toTestCaseUpdateData,
} from "./testCaseMapper.js";

const TEST_CASE_INCLUDE = {
  version: {
    select: {
      id: true,
      versionName: true,
    },
  },
};

async function resolveVersionId(versionName) {
  if (!versionName) {
    return null;
  }

  const numericVersionId = Number(versionName);

  if (Number.isInteger(numericVersionId)) {
    const version = await prisma.version.findUnique({
      where: { id: numericVersionId },
      select: { id: true },
    });

    return version?.id ?? null;
  }

  const version = await prisma.version.findUnique({
    where: { versionName: String(versionName) },
    select: { id: true },
  });

  return version?.id ?? null;
}

async function resolveRequiredVersionId(versionName) {
  const versionId = await resolveVersionId(versionName);

  if (!versionId) {
    throw new Error("VERSION_REQUIRED");
  }

  return versionId;
}

async function generateCaseCode(versionId) {
  const cases = await prisma.testCase.findMany({
    where: { versionId },
    select: { caseCode: true },
  });

  const maxSequence = cases.reduce((maxValue, testCase) => {
    const match = testCase.caseCode.match(/^TC-(\d+)$/i);

    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number(match[1]));
  }, 0);

  return `TC-${String(maxSequence + 1).padStart(3, "0")}`;
}

export async function listTestCases({ versionName, versionId: versionIdParam } = {}) {
  const versionIdentifier = versionIdParam ?? versionName;
  const versionId = versionIdentifier
    ? await resolveVersionId(versionIdentifier)
    : undefined;
  const where = {};

  if (versionIdentifier && versionId) {
    where.versionId = versionId;
  } else if (versionIdentifier && !versionId) {
    return [];
  }

  const records = await prisma.testCase.findMany({
    where,
    include: TEST_CASE_INCLUDE,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return records.map(toTestCaseResponse);
}

export async function getTestCaseById(id) {
  const record = await prisma.testCase.findUnique({
    where: { id: Number(id) },
    include: TEST_CASE_INCLUDE,
  });

  if (!record) {
    return null;
  }

  return toTestCaseResponse(record);
}

export async function createTestCase(payload) {
  const versionName = payload.versionId ?? payload.versionName ?? null;
  const versionId = await resolveRequiredVersionId(versionName);
  const createData = toTestCaseCreateData(payload, versionId);

  if (!createData.menu) {
    throw new Error("MENU_REQUIRED");
  }

  const sortOrder =
    payload.sortOrder ??
    (await prisma.testCase.count({
      where: versionId ? { versionId } : {},
    }));

  const caseCode =
    String(payload.id ?? payload.caseCode ?? "").trim() ||
    (await generateCaseCode(versionId));

  const record = await prisma.testCase.create({
    data: {
      ...createData,
      caseCode,
      sortOrder: Number(sortOrder),
    },
    include: TEST_CASE_INCLUDE,
  });

  return toTestCaseResponse(record);
}

export async function updateTestCase(id, payload) {
  const scopedVersionName = payload.versionName ?? payload.versionId ?? null;
  const scopedVersionId = scopedVersionName
    ? await resolveVersionId(scopedVersionName)
    : null;
  const existing = await prisma.testCase.findUnique({
    where: { id: Number(id) },
  });

  if (
    !existing ||
    (scopedVersionName && existing.versionId !== scopedVersionId)
  ) {
    return null;
  }

  const record = await prisma.testCase.update({
    where: { id: Number(id) },
    data: toTestCaseUpdateData(payload),
    include: TEST_CASE_INCLUDE,
  });

  return toTestCaseResponse(record);
}

export async function deleteTestCase(id, { versionName } = {}) {
  const scopedVersionId = versionName ? await resolveVersionId(versionName) : null;
  const existing = await prisma.testCase.findUnique({
    where: { id: Number(id) },
  });

  if (!existing || (versionName && existing.versionId !== scopedVersionId)) {
    return false;
  }

  await prisma.testCase.delete({
    where: { id: Number(id) },
  });

  return true;
}

export async function bulkDeleteTestCases(ids = [], { versionName } = {}) {
  const numericIds = ids.map((id) => Number(id)).filter((id) => Number.isFinite(id));
  const scopedVersionId = versionName ? await resolveVersionId(versionName) : null;

  if (numericIds.length === 0) {
    return 0;
  }

  const result = await prisma.testCase.deleteMany({
    where: {
      id: {
        in: numericIds,
      },
      ...(versionName ? { versionId: scopedVersionId } : {}),
    },
  });

  return result.count;
}

export async function reorderTestCases({ versionName, orderedIds = [] }) {
  const versionId = await resolveRequiredVersionId(versionName);
  const numericIds = orderedIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));

  await prisma.$transaction(
    numericIds.map((id, index) =>
      prisma.testCase.updateMany({
        where: { id, versionId },
        data: { sortOrder: index },
      })
    )
  );

  return listTestCases({ versionName });
}

export async function deleteTestCasesByVersionName(versionName) {
  const versionId = await resolveVersionId(versionName);

  if (!versionId) {
    return 0;
  }

  const result = await prisma.testCase.deleteMany({
    where: { versionId },
  });

  return result.count;
}

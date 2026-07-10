import { prisma } from "../db.js";
import {
  normalizeVersionStatus,
  parseDateInput,
  parseVersionYear,
  toVersionResponse,
} from "../utils/versionUtils.js";

const VERSION_INCLUDE = {
  submenus: {
    orderBy: { sortOrder: "asc" },
  },
};

const FIXED_SUBMENUS = ["Total", "대시보드"];

async function findCopySourceVersion() {
  return prisma.version.findFirst({
    where: {
      testCases: {
        some: {},
      },
    },
    include: {
      submenus: {
        orderBy: { sortOrder: "asc" },
      },
      testCases: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      },
    },
    orderBy: [{ year: "desc" }, { versionName: "desc" }, { id: "desc" }],
  });
}

async function getYearBase() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "version_policy" },
  });

  if (!setting) {
    return 2000;
  }

  try {
    const parsed = JSON.parse(setting.value);
    return parsed.versionYearBase ?? 2000;
  } catch {
    return 2000;
  }
}

function mapVersionWithSubmenus(version) {
  const response = toVersionResponse(version);

  response.submenus = (version.submenus ?? []).map((submenu) => ({
    id: submenu.id,
    name: submenu.name,
    isDefault: submenu.isDefault,
    sortOrder: submenu.sortOrder,
    isActive: submenu.isActive,
  }));

  return response;
}

export async function listVersions({ year } = {}) {
  const versions = await prisma.version.findMany({
    where: year ? { year: Number(year) } : undefined,
    include: VERSION_INCLUDE,
    orderBy: [{ year: "asc" }, { versionName: "asc" }],
  });

  return versions.map(mapVersionWithSubmenus);
}

export async function getVersionById(id) {
  const version = await prisma.version.findUnique({
    where: { id: Number(id) },
    include: VERSION_INCLUDE,
  });

  if (!version) {
    return null;
  }

  return mapVersionWithSubmenus(version);
}

export async function getVersionByName(versionName) {
  const version = await prisma.version.findUnique({
    where: { versionName },
    include: VERSION_INCLUDE,
  });

  if (!version) {
    return null;
  }

  return mapVersionWithSubmenus(version);
}

export async function createVersion(payload) {
  const yearBase = await getYearBase();
  const versionName = String(payload.versionName ?? payload.version ?? "").trim();

  if (!versionName) {
    throw new Error("VERSION_NAME_REQUIRED");
  }

  const year = payload.year ?? parseVersionYear(versionName, yearBase);
  const status = normalizeVersionStatus(payload.status);
  const copySourceVersion =
    payload.copyTestCases === false ? null : await findCopySourceVersion();

  const version = await prisma.version.create({
    data: {
      versionName,
      year: Number(year),
      status,
      startDate: parseDateInput(payload.startDate),
      endDate: parseDateInput(payload.endDate),
      description: payload.description?.trim() ?? "",
    },
    include: VERSION_INCLUDE,
  });

  const defaultMenus =
    copySourceVersion?.submenus?.length > 0
      ? copySourceVersion.submenus.map((submenu) => submenu.name)
      : FIXED_SUBMENUS;

  await prisma.submenu.createMany({
    data: defaultMenus.map((name, index) => ({
      versionId: version.id,
      name,
      isDefault: FIXED_SUBMENUS.includes(name),
      sortOrder: index,
      isActive: true,
    })),
  });

  if (copySourceVersion?.testCases?.length > 0) {
    await prisma.testCase.createMany({
      data: copySourceVersion.testCases.map((testCase, index) => ({
        versionId: version.id,
        caseCode: testCase.caseCode,
        menu: testCase.menu,
        submenu: testCase.submenu,
        checkItem: testCase.checkItem,
        checkMethod: testCase.checkMethod,
        expectedResult: testCase.expectedResult,
        actualResult: testCase.actualResult,
        note: testCase.note,
        sortOrder: testCase.sortOrder ?? index,
      })),
    });
  }

  return getVersionById(version.id);
}

export async function updateVersion(id, payload) {
  const existing = await prisma.version.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    return null;
  }

  const yearBase = await getYearBase();
  const nextVersionName =
    payload.versionName !== undefined
      ? String(payload.versionName).trim()
      : existing.versionName;

  await prisma.version.update({
    where: { id: Number(id) },
    data: {
      versionName: nextVersionName,
      year:
        payload.year !== undefined
          ? Number(payload.year)
          : parseVersionYear(nextVersionName, yearBase),
      status:
        payload.status !== undefined
          ? normalizeVersionStatus(payload.status)
          : existing.status,
      startDate:
        payload.startDate !== undefined
          ? parseDateInput(payload.startDate)
          : existing.startDate,
      endDate:
        payload.endDate !== undefined
          ? parseDateInput(payload.endDate)
          : existing.endDate,
      description:
        payload.description !== undefined
          ? String(payload.description).trim()
          : existing.description,
    },
  });

  return getVersionById(id);
}

export async function updateVersionSubmenus(id, menuNames = []) {
  const versionId = Number(id);
  const existing = await prisma.version.findUnique({
    where: { id: versionId },
  });

  if (!existing) {
    return null;
  }

  const optionalMenus = menuNames.filter(
    (menu) => menu && !FIXED_SUBMENUS.includes(menu)
  );
  const normalizedMenus = [...FIXED_SUBMENUS, ...optionalMenus];

  await prisma.$transaction(async (tx) => {
    await tx.submenu.deleteMany({
      where: { versionId },
    });

    await tx.submenu.createMany({
      data: normalizedMenus.map((name, index) => ({
        versionId,
        name,
        isDefault: FIXED_SUBMENUS.includes(name),
        sortOrder: index,
        isActive: true,
      })),
    });
  });

  return getVersionById(versionId);
}

export async function deleteVersion(id) {
  const versionId = Number(id);
  const existing = await prisma.version.findUnique({
    where: { id: versionId },
  });

  if (!existing) {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    await tx.testRun.deleteMany({
      where: { versionId },
    });

    await tx.testCase.deleteMany({
      where: { versionId },
    });

    await tx.version.delete({
      where: { id: versionId },
    });
  });

  return true;
}

export async function deleteVersionByName(versionName) {
  const existing = await prisma.version.findUnique({
    where: { versionName },
  });

  if (!existing) {
    return false;
  }

  return deleteVersion(existing.id);
}

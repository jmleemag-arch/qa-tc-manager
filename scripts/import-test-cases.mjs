import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { prisma } from "../server/db.js";
import {
  FIXED_VERSION_MENUS,
  TC_MENUS,
} from "../src/features/testcases/constants/testCaseConstants.js";

const VALID_IS_WORKING = new Set(["O", "X", "N/A", "N/T"]);
const DEFAULT_VERSION_NAME = "26.1.0";
const BATCH_SIZE = 200;
const SKIP_SHEETS = new Set(["Total", "기타"]);

const SHEET_TO_MENU_MAP = {
  "서버단말 상태": "서버 / 단말 상태",
  "서버_단말 상태": "서버 / 단말 상태",
  진단분석: "진단/분석",
  "진단_분석": "진단/분석",
  서비스통계: "서비스 통계",
};

const MENU_ALIASES = {
  "장애현황": "장애 현황",
  "플로우맵": "플로우 맵",
  "서버/단말 상태": "서버 / 단말 상태",
  "네트워크노드 상태": "네트워크 노드 상태",
  "서비스 통계": "서비스 통계",
};

const COLUMN_ALIASES = {
  id: ["id"],
  menu: ["메뉴", "menu"],
  subMenu: ["서브메뉴", "submenu", "sub menu"],
  subMenu2: ["서브메뉴 2", "submenu 2"],
  checkItem: ["점검항목", "테스트 제목", "check item", "checkitem"],
  checkMethod: ["확인 방법", "테스트 방법", "check method", "checkmethod"],
  checkResult: ["확인 결과", "기대 결과", "check result", "expected result"],
  isWorking: ["작동 여부", "is working", "isworking", "actual result"],
  note: ["비고", "note"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeMenuName(value, fallbackMenu = "") {
  const trimmed = String(value ?? "").trim();
  const resolved = trimmed || String(fallbackMenu ?? "").trim();

  if (!resolved) {
    return "";
  }

  if (MENU_ALIASES[resolved]) {
    return MENU_ALIASES[resolved];
  }

  if (SHEET_TO_MENU_MAP[resolved]) {
    return SHEET_TO_MENU_MAP[resolved];
  }

  const knownMenus = [
    ...FIXED_VERSION_MENUS,
    ...TC_MENUS,
    "기타",
    "접속페이지",
    "성능 현황",
    "경고 현황 (disable)",
    "URL 모니터링 현황",
  ];

  const exactMatch = knownMenus.find(
    (menu) => normalizeHeader(menu) === normalizeHeader(resolved)
  );

  return exactMatch ?? resolved;
}

function sheetNameToMenu(sheetName) {
  if (SHEET_TO_MENU_MAP[sheetName]) {
    return SHEET_TO_MENU_MAP[sheetName];
  }

  return normalizeMenuName(sheetName.replaceAll("_", " "));
}

function findColumnIndex(headers, aliases) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedAliases = aliases.map((alias) => normalizeHeader(alias));

  return normalizedHeaders.findIndex((header) =>
    normalizedAliases.includes(header)
  );
}

function buildColumnMap(headers) {
  const map = {};

  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const index = findColumnIndex(headers, aliases);
    map[key] = index >= 0 ? index : null;
  }

  return map;
}

function cellValue(row, index) {
  if (index === null || index === undefined || index < 0) {
    return "";
  }

  const value = row[index];
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalizeIsWorking(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized || normalized.toLowerCase() === "null") {
    return null;
  }

  return VALID_IS_WORKING.has(normalized) ? normalized : null;
}

function buildSubMenu(row, columnMap, sheetMenu) {
  const parts = [];
  const excelMenu = cellValue(row, columnMap.menu);

  if (
    excelMenu &&
    normalizeHeader(excelMenu) !== normalizeHeader(sheetMenu)
  ) {
    parts.push(excelMenu);
  }

  const primarySubMenu = cellValue(row, columnMap.subMenu);
  const secondarySubMenu = cellValue(row, columnMap.subMenu2);

  if (primarySubMenu) {
    parts.push(primarySubMenu);
  }

  if (secondarySubMenu) {
    parts.push(secondarySubMenu);
  }

  return parts.join(" / ");
}

function normalizeCaseCode(value, fallbackIndex) {
  const normalized = String(value ?? "").trim();

  if (normalized && !/^#ERROR!/i.test(normalized)) {
    return normalized;
  }

  return `TC-${String(fallbackIndex).padStart(4, "0")}`;
}

function isSummaryRow(row, columnMap) {
  const checkItem = cellValue(row, columnMap.checkItem);
  const checkMethod = cellValue(row, columnMap.checkMethod);

  if (!checkItem && !checkMethod) {
    return true;
  }

  if (/^TC[-\s]?총|^총\s|^Version|^fail/i.test(checkItem)) {
    return true;
  }

  return false;
}

function findHeaderIndex(rows) {
  for (let index = 0; index < Math.min(rows.length, 15); index += 1) {
    const row = rows[index] ?? [];
    const normalized = row.map((cell) => normalizeHeader(cell));
    const hasId = normalized.includes("id");
    const hasCheckItem =
      normalized.includes("점검항목") ||
      normalized.includes("테스트 제목") ||
      normalized.includes("check item") ||
      normalized.includes("checkitem");

    if (hasId && hasCheckItem) {
      return index;
    }
  }

  return -1;
}

function parseRowsFromSheet(rows, sheetName) {
  const headerIndex = findHeaderIndex(rows);

  if (headerIndex < 0) {
    return [];
  }

  const headers = rows[headerIndex] ?? [];
  const columnMap = buildColumnMap(headers);
  const sheetMenu = sheetNameToMenu(sheetName);
  const parsedRows = [];

  if (columnMap.checkItem === null) {
    return [];
  }

  for (let index = headerIndex + 1; index < rows.length; index += 1) {
    const row = rows[index] ?? [];

    if (isSummaryRow(row, columnMap)) {
      continue;
    }

    const checkItem = cellValue(row, columnMap.checkItem);

    if (!checkItem) {
      continue;
    }

    parsedRows.push({
      caseCode: cellValue(row, columnMap.id),
      menu: sheetMenu,
      subMenu: buildSubMenu(row, columnMap, sheetMenu),
      checkItem,
      checkMethod: cellValue(row, columnMap.checkMethod),
      checkResult: cellValue(row, columnMap.checkResult),
      isWorking: normalizeIsWorking(cellValue(row, columnMap.isWorking)),
      note: cellValue(row, columnMap.note),
    });
  }

  return parsedRows;
}

function readWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Import file not found: ${filePath}`);
  }

  return XLSX.readFile(filePath, {
    type: "file",
    raw: false,
    cellDates: false,
  });
}

function collectRowsFromWorkbook(workbook) {
  const combinedRows = [];

  for (const sheetName of workbook.SheetNames) {
    if (SKIP_SHEETS.has(sheetName)) {
      continue;
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });
    const parsedRows = parseRowsFromSheet(rows, sheetName);

    combinedRows.push(
      ...parsedRows.map((row) => ({
        ...row,
        sourceSheet: sheetName,
      }))
    );
  }

  return combinedRows;
}

function parseVersionName(filePath, explicitVersionName) {
  if (explicitVersionName) {
    return explicitVersionName;
  }

  const match = path.basename(filePath).match(/(\d{2}\.\d+\.\d+)/);
  return match?.[1] ?? DEFAULT_VERSION_NAME;
}

async function resolveVersion(versionName) {
  const version = await prisma.version.findUnique({
    where: { versionName },
  });

  if (!version) {
    throw new Error(`Version '${versionName}' was not found. Run db seed first.`);
  }

  return version;
}

function assignCaseCodes(rows) {
  const usedCodes = new Set();

  return rows.map((row, index) => {
    let caseCode = normalizeCaseCode(row.caseCode, index + 1);

    while (usedCodes.has(caseCode)) {
      caseCode = normalizeCaseCode("", index + 1 + usedCodes.size);
    }

    usedCodes.add(caseCode);

    return {
      ...row,
      caseCode,
      sortOrder: index,
    };
  });
}

async function importTestCases(filePath, versionNameArg) {
  const versionName = parseVersionName(filePath, versionNameArg);
  const version = await resolveVersion(versionName);
  const workbook = readWorkbook(filePath);
  const parsedRows = assignCaseCodes(collectRowsFromWorkbook(workbook));

  if (parsedRows.length === 0) {
    throw new Error(`No test case rows found in '${path.basename(filePath)}'.`);
  }

  const deleted = await prisma.testCase.deleteMany({
    where: { versionId: version.id },
  });

  for (let index = 0; index < parsedRows.length; index += BATCH_SIZE) {
    const batch = parsedRows.slice(index, index + BATCH_SIZE);

    await prisma.testCase.createMany({
      data: batch.map((row) => ({
        versionId: version.id,
        caseCode: row.caseCode,
        menu: row.menu,
        submenu: row.subMenu || null,
        checkItem: row.checkItem,
        checkMethod: row.checkMethod || null,
        expectedResult: row.checkResult || null,
        actualResult: row.isWorking,
        note: row.note || null,
        sortOrder: row.sortOrder,
      })),
    });
  }

  const menuCounts = parsedRows.reduce((counts, row) => {
    counts[row.menu] = (counts[row.menu] ?? 0) + 1;
    return counts;
  }, {});

  console.log(
    JSON.stringify(
      {
        versionName,
        sheetCount: workbook.SheetNames.filter((name) => !SKIP_SHEETS.has(name))
          .length,
        deletedCount: deleted.count,
        importedCount: parsedRows.length,
        menuCounts,
      },
      null,
      2
    )
  );
}

const filePath = process.argv[2];
const versionName = process.argv[3];

if (!filePath) {
  console.error("Usage: node scripts/import-test-cases.mjs <file-path> [version-name]");
  process.exit(1);
}

importTestCases(path.resolve(filePath), versionName)
  .catch((error) => {
    console.error("Test case import failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

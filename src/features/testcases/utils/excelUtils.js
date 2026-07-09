import * as XLSX from "xlsx";
import { SIDEBAR_MENUS, TOTAL_MENU } from "../constants/testCaseConstants";
import { formatTestCaseId } from "./testCaseUtils";

const EXCEL_HEADERS = [
  "ID",
  "메뉴",
  "서브메뉴",
  "점검항목",
  "확인 방법",
  "확인 결과",
  "작동 여부",
  "비고",
];

const EXCEL_FILE_NAME = "QA_TC_List.xlsx";
const TOTAL_SHEET_NAME = "Total";

const MENU_SHEET_NAME_MAP = {
  "서버 / 단말 상태": "서버_단말 상태",
  "진단/분석": "진단_분석",
};

const EXCEL_MENU_ORDER = [...SIDEBAR_MENUS.filter((menu) => menu !== TOTAL_MENU), "기타"];

function toSheetName(menu) {
  if (MENU_SHEET_NAME_MAP[menu]) {
    return MENU_SHEET_NAME_MAP[menu];
  }

  return menu.replace(/[\\/?*[\]:]/g, "").slice(0, 31);
}

function testCaseToRow(testCase, excelId) {
  return [
    excelId,
    testCase.menu,
    testCase.subMenu,
    testCase.checkItem,
    testCase.checkMethod,
    testCase.checkResult,
    testCase.isWorking,
    testCase.note,
  ];
}

function groupTestCasesByMenu(testCases) {
  return testCases.reduce((groups, testCase) => {
    const menu = testCase.menu;

    if (!groups[menu]) {
      groups[menu] = [];
    }

    groups[menu].push(testCase);
    return groups;
  }, {});
}

function getOrderedMenus(menusInData) {
  const menuSet = new Set(menusInData);
  const orderedMenus = EXCEL_MENU_ORDER.filter((menu) => menuSet.has(menu));
  const extraMenus = menusInData.filter((menu) => !EXCEL_MENU_ORDER.includes(menu));

  return [...orderedMenus, ...extraMenus];
}

function createWorksheet(rows) {
  return XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...rows]);
}

function applyTotalSheetFilters(worksheet, rowCount) {
  worksheet["!autofilter"] = {
    ref: `A1:H${rowCount + 1}`,
  };
}

export const downloadTestCasesExcel = (testCases) => {
  const workbook = XLSX.utils.book_new();
  const groupedTestCases = groupTestCasesByMenu(testCases);

  const totalRows = testCases.map((testCase, index) =>
    testCaseToRow(testCase, formatTestCaseId(index + 1))
  );
  const totalWorksheet = createWorksheet(totalRows);

  applyTotalSheetFilters(totalWorksheet, totalRows.length);
  XLSX.utils.book_append_sheet(workbook, totalWorksheet, TOTAL_SHEET_NAME);

  const menus = getOrderedMenus(Object.keys(groupedTestCases));

  menus.forEach((menu) => {
    const menuTestCases = groupedTestCases[menu];

    if (!menuTestCases || menuTestCases.length === 0) {
      return;
    }

    const menuRows = menuTestCases.map((testCase, index) =>
      testCaseToRow(testCase, formatTestCaseId(index + 1))
    );
    const menuWorksheet = createWorksheet(menuRows);

    XLSX.utils.book_append_sheet(workbook, menuWorksheet, toSheetName(menu));
  });

  XLSX.writeFile(workbook, EXCEL_FILE_NAME);
};

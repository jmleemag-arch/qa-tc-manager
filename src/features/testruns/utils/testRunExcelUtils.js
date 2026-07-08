import * as XLSX from "xlsx";
import { EXCEL_DOWNLOAD_EMPTY_ALERT } from "../constants/testRunConstants";
import { calculateProgress } from "./testRunUtils";

const LIST_FILE_NAME = "QA_Test_Run_List.xlsx";

const LIST_HEADERS = [
  "런 ID",
  "런 이름",
  "대상 메뉴",
  "전체 TC 수",
  "완료 수",
  "O",
  "X",
  "BLOCK",
  "NT",
  "진행률",
  "상태",
  "생성일",
];

const DETAIL_HEADERS = [
  "ID",
  "메뉴",
  "서브메뉴",
  "점검항목",
  "확인 방법",
  "확인 결과",
  "실행 결과",
  "비고",
];

function testRunToListRow(testRun) {
  const progress = calculateProgress(
    testRun.completedCount,
    testRun.totalCount
  );

  return [
    testRun.runId,
    testRun.runName,
    testRun.targetMenu,
    testRun.totalCount,
    testRun.completedCount,
    testRun.passCount,
    testRun.failCount,
    testRun.blockCount,
    testRun.ntCount,
    `${progress}%`,
    testRun.status,
    testRun.createdAt,
  ];
}

function testCaseToDetailRow(testCase) {
  return [
    testCase.displayId || testCase.originalId || testCase.id,
    testCase.menu,
    testCase.subMenu,
    testCase.checkItem,
    testCase.checkMethod,
    testCase.checkResult,
    testCase.isWorking,
    testCase.note,
  ];
}

export function downloadTestRunListExcel(testRuns) {
  const runs = Array.isArray(testRuns) ? testRuns : [];

  if (runs.length === 0) {
    alert(EXCEL_DOWNLOAD_EMPTY_ALERT);
    return;
  }

  const rows = runs.map(testRunToListRow);
  const worksheet = XLSX.utils.aoa_to_sheet([LIST_HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Test Runs");
  XLSX.writeFile(workbook, LIST_FILE_NAME);
}

export function downloadTestRunDetailExcel(testRun) {
  if (!testRun) {
    alert(EXCEL_DOWNLOAD_EMPTY_ALERT);
    return;
  }

  const testCases = testRun.testCases ?? [];

  if (testCases.length === 0) {
    alert(EXCEL_DOWNLOAD_EMPTY_ALERT);
    return;
  }

  const rows = testCases.map(testCaseToDetailRow);
  const worksheet = XLSX.utils.aoa_to_sheet([DETAIL_HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();
  const fileName = `QA_Test_Run_Detail_${testRun.runId}.xlsx`;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Test Run Detail");
  XLSX.writeFile(workbook, fileName);
}

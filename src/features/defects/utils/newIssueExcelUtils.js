import * as XLSX from "xlsx";
import { NEW_ISSUE_EXCEL_EMPTY_ALERT } from "../constants/defectConstants";

const HEADERS = [
  "No.",
  "Redmine 이슈 번호",
  "제목",
  "메뉴",
  "담당자",
  "우선순위",
  "등록일",
  "Redmine URL",
];

function issueToRow(issue, index) {
  return [
    index + 1,
    issue.issueId,
    issue.title,
    issue.menu,
    issue.assignee,
    issue.priority,
    issue.registeredAt,
    issue.redmineUrl || "",
  ];
}

export function downloadNewIssuesExcel(issues, roundLabel = "") {
  const rows = Array.isArray(issues) ? issues : [];

  if (rows.length === 0) {
    alert(NEW_ISSUE_EXCEL_EMPTY_ALERT);
    return;
  }

  const worksheet = XLSX.utils.aoa_to_sheet([
    HEADERS,
    ...rows.map((issue, index) => issueToRow(issue, index)),
  ]);
  const workbook = XLSX.utils.book_new();
  const sheetName = roundLabel || "New Issues";
  const safeFileLabel = (roundLabel || "new_issues").replaceAll(" ", "_");

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `QA_New_Issues_${safeFileLabel}.xlsx`);
}

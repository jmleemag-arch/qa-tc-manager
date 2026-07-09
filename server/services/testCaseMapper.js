export function toTestCaseResponse(record) {
  return {
    uid: String(record.id),
    dbId: record.id,
    id: record.caseCode,
    versionId: record.version?.versionName ?? null,
    menu: record.menu,
    subMenu: record.submenu ?? "",
    checkItem: record.checkItem,
    checkMethod: record.checkMethod ?? "",
    checkResult: record.expectedResult ?? "",
    isWorking: record.actualResult ?? "O",
    note: record.note ?? "",
    sortOrder: record.sortOrder,
  };
}

export function toTestCaseCreateData(payload, versionId) {
  return {
    versionId: versionId ?? null,
    menu: String(payload.menu ?? "").trim(),
    submenu: String(payload.subMenu ?? payload.submenu ?? "").trim(),
    checkItem: String(payload.checkItem ?? "").trim(),
    checkMethod: String(payload.checkMethod ?? "").trim() || null,
    expectedResult: String(payload.checkResult ?? payload.expectedResult ?? "").trim() || null,
    actualResult: String(payload.isWorking ?? payload.actualResult ?? "O").trim() || "O",
    note: String(payload.note ?? "").trim() || null,
  };
}

export function toTestCaseUpdateData(payload) {
  const data = {};

  if (payload.menu !== undefined) {
    data.menu = String(payload.menu).trim();
  }

  if (payload.subMenu !== undefined || payload.submenu !== undefined) {
    data.submenu = String(payload.subMenu ?? payload.submenu ?? "").trim();
  }

  if (payload.checkItem !== undefined) {
    data.checkItem = String(payload.checkItem).trim();
  }

  if (payload.checkMethod !== undefined) {
    data.checkMethod = String(payload.checkMethod).trim() || null;
  }

  if (payload.checkResult !== undefined || payload.expectedResult !== undefined) {
    data.expectedResult =
      String(payload.checkResult ?? payload.expectedResult ?? "").trim() || null;
  }

  if (payload.isWorking !== undefined || payload.actualResult !== undefined) {
    data.actualResult =
      String(payload.isWorking ?? payload.actualResult ?? "").trim() || "O";
  }

  if (payload.note !== undefined) {
    data.note = String(payload.note).trim() || null;
  }

  if (payload.sortOrder !== undefined) {
    data.sortOrder = Number(payload.sortOrder);
  }

  return data;
}

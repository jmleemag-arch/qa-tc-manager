import {
  FIXED_VERSION_MENUS,
  IS_WORKING_FILTER_ALL,
  SEARCHABLE_FIELDS,
  TC_MENUS,
  TOTAL_MENU,
} from "../constants/testCaseConstants";

export function ensureVersionMenus(menus = []) {
  const optionalMenus = menus.filter(
    (menu) => !FIXED_VERSION_MENUS.includes(menu)
  );

  return [...FIXED_VERSION_MENUS, ...optionalMenus];
}

export function isFixedVersionMenu(menu) {
  return FIXED_VERSION_MENUS.includes(menu);
}

export function isTestCaseVisibleInVersion(testCase, versionId, versionMenus) {
  if (testCase.versionId === versionId) {
    return true;
  }

  if (!testCase.versionId && versionMenus.includes(testCase.menu)) {
    return true;
  }

  return false;
}

export function filterTestCases(
  testCases,
  selectedMenu,
  searchText,
  workingFilter = IS_WORKING_FILTER_ALL,
  versionContext = null
) {
  const normalizedSearch = searchText.toLowerCase().trim();

  return testCases.filter((tc) => {
    const isVersionMatched = versionContext
      ? isTestCaseVisibleInVersion(
          tc,
          versionContext.versionId,
          versionContext.menus
        )
      : true;

    const isMenuMatched =
      !selectedMenu ||
      selectedMenu === TOTAL_MENU ||
      tc.menu === selectedMenu;

    const isWorkingMatched =
      workingFilter === IS_WORKING_FILTER_ALL ||
      (workingFilter === "" && !tc.isWorking) ||
      tc.isWorking === workingFilter;

    if (!normalizedSearch) {
      return isVersionMatched && isMenuMatched && isWorkingMatched;
    }

    const isSearchMatched = SEARCHABLE_FIELDS.some((field) =>
      String(tc[field] ?? "")
        .toLowerCase()
        .includes(normalizedSearch)
    );

    return (
      isVersionMatched && isMenuMatched && isWorkingMatched && isSearchMatched
    );
  });
}

export function formatTestCaseId(sequenceNumber) {
  return `TC-${String(sequenceNumber).padStart(3, "0")}`;
}

/** 현재 화면 목록 기준 표시용 ID 부여 (Total=전체, 개별 메뉴=해당 메뉴) */
export function assignDisplayIds(testCases) {
  return testCases.map((testCase, index) => ({
    ...testCase,
    displayId: formatTestCaseId(index + 1),
  }));
}

export function createEmptyTestCase(menu, uid, versionId = null) {
  return {
    uid,
    id: "",
    menu,
    versionId,
    subMenu: "",
    checkItem: "",
    checkMethod: "",
    checkResult: "",
    isWorking: null,
    note: "",
  };
}

export function updateTestCase(testCases, uid, formData) {
  return testCases.map((testCase) => {
    if (testCase.uid !== uid) {
      return testCase;
    }

    return {
      ...testCase,
      subMenu: formData.subMenu.trim(),
      checkItem: formData.checkItem.trim(),
      checkMethod: formData.checkMethod.trim(),
      checkResult: formData.checkResult.trim(),
      isWorking: formData.isWorking || null,
      note: formData.note.trim(),
    };
  });
}

export function reorderTestCases(testCases, dragUid, dropUid) {
  if (dragUid === dropUid) {
    return testCases;
  }

  const fromIndex = testCases.findIndex((testCase) => testCase.uid === dragUid);
  const toIndex = testCases.findIndex((testCase) => testCase.uid === dropUid);

  if (fromIndex === -1 || toIndex === -1) {
    return testCases;
  }

  const nextCases = [...testCases];
  const [movedCase] = nextCases.splice(fromIndex, 1);
  nextCases.splice(toIndex, 0, movedCase);

  return nextCases;
}

export function deleteTestCases(testCases, uids) {
  const uidSet = new Set(uids);

  return testCases.filter((testCase) => !uidSet.has(testCase.uid));
}

export function isAddableMenu(selectedMenu, addableMenus = TC_MENUS) {
  return Boolean(selectedMenu && addableMenus.includes(selectedMenu));
}

export function createUid() {
  return `tc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getEditableFormData(testCase) {
  if (!testCase) {
    return null;
  }

  return {
    subMenu: testCase.subMenu,
    checkItem: testCase.checkItem,
    checkMethod: testCase.checkMethod,
    checkResult: testCase.checkResult,
    isWorking: testCase.isWorking ?? "",
    note: testCase.note,
  };
}

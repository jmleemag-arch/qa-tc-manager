import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import TestCaseFilter from "../components/TestCaseFilter";
import TestCaseToolbar from "../components/TestCaseToolbar";
import TestCaseTable from "../components/TestCaseTable";
import TestCaseEditModal from "../components/TestCaseEditModal";
import TestCaseVersionManager from "../components/TestCaseVersionManager";
import SubMenuManagerModal from "../components/SubMenuManagerModal";
import { testCases as initialTestCases } from "../data/testCaseMockData";
import {
  DELETE_SELECT_ALERT,
  EXCEL_DOWNLOAD_EMPTY_ALERT,
  INITIAL_TEST_CASE_VERSIONS,
  IS_WORKING_FILTER_ALL,
  MENU_SELECT_ALERT,
  SIDEBAR_MENUS,
  TC_MENUS,
  TOTAL_MENU,
  VERSION_FILTER_ALL,
} from "../constants/testCaseConstants";
import { downloadTestCasesExcel } from "../utils/excelUtils";
import {
  assignDisplayIds,
  createEmptyTestCase,
  createUid,
  deleteTestCases,
  filterTestCases,
  isAddableMenu,
  reorderTestCases,
  updateTestCase,
} from "../utils/testCaseUtils";

const TEST_CASE_STORAGE_KEY = "qa-manager-test-cases";
const TEST_CASE_VERSION_STORAGE_KEY = "qa-manager-test-case-versions";
const TEST_CASE_CUSTOM_MENU_STORAGE_KEY = "qa-manager-test-case-custom-menus";

function createCustomMenuId() {
  return `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStorageValue(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function TestCaseListPage({ loginUser, onLogout, activeMenu, onMenuChange }) {
  const [testCases, setTestCases] = useState(() =>
    readStorageValue(TEST_CASE_STORAGE_KEY, initialTestCases)
  );
  const [versions, setVersions] = useState(() =>
    readStorageValue(TEST_CASE_VERSION_STORAGE_KEY, INITIAL_TEST_CASE_VERSIONS)
  );
  const [selectedVersionId, setSelectedVersionId] =
    useState(VERSION_FILTER_ALL);
  const [customMenus, setCustomMenus] = useState(() =>
    readStorageValue(TEST_CASE_CUSTOM_MENU_STORAGE_KEY, [])
  );
  const [selectedMenu, setSelectedMenu] = useState(TOTAL_MENU);
  const [searchText, setSearchText] = useState("");
  const [workingFilter, setWorkingFilter] = useState(IS_WORKING_FILTER_ALL);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true);
  const [selectedUids, setSelectedUids] = useState(new Set());
  const [dragUid, setDragUid] = useState(null);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [isVersionManagerOpen, setIsVersionManagerOpen] = useState(false);
  const [isSubMenuManagerOpen, setIsSubMenuManagerOpen] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    window.localStorage.setItem(
      TEST_CASE_STORAGE_KEY,
      JSON.stringify(testCases)
    );
  }, [testCases]);

  useEffect(() => {
    window.localStorage.setItem(
      TEST_CASE_VERSION_STORAGE_KEY,
      JSON.stringify(versions)
    );
  }, [versions]);

  useEffect(() => {
    window.localStorage.setItem(
      TEST_CASE_CUSTOM_MENU_STORAGE_KEY,
      JSON.stringify(customMenus)
    );
  }, [customMenus]);

  const customMenuLabels = useMemo(
    () => customMenus.map((menu) => menu.label),
    [customMenus]
  );

  const managedMenus = useMemo(
    () => [...SIDEBAR_MENUS, ...customMenuLabels],
    [customMenuLabels]
  );

  const addableMenus = useMemo(
    () => [...TC_MENUS, ...customMenuLabels],
    [customMenuLabels]
  );

  const baseFilteredTestCases = useMemo(
    () =>
      filterTestCases(testCases, selectedMenu, searchText, workingFilter),
    [testCases, selectedMenu, searchText, workingFilter]
  );

  const filteredTestCases = useMemo(() => {
    if (selectedVersionId === VERSION_FILTER_ALL) {
      return baseFilteredTestCases;
    }

    return baseFilteredTestCases.filter((testCase) =>
      testCase.versions?.includes(selectedVersionId)
    );
  }, [baseFilteredTestCases, selectedVersionId]);

  const displayTestCases = useMemo(
    () => assignDisplayIds(filteredTestCases),
    [filteredTestCases]
  );

  const managerTestCases = useMemo(
    () => assignDisplayIds(testCases),
    [testCases]
  );

  const selectedVersion = versions.find(
    (version) => version.id === selectedVersionId
  );
  const selectedVersionLabel =
    selectedVersionId === VERSION_FILTER_ALL
      ? "전체 버전"
      : selectedVersion?.name ?? "선택한 버전";

  const visibleUids = filteredTestCases.map((testCase) => testCase.uid);
  const isAllSelected =
    visibleUids.length > 0 &&
    visibleUids.every((uid) => selectedUids.has(uid));
  const isIndeterminate =
    visibleUids.some((uid) => selectedUids.has(uid)) && !isAllSelected;

  const handleToggleSelect = (uid) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);

      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }

      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedUids((prev) => {
      const next = new Set(prev);

      if (isAllSelected) {
        visibleUids.forEach((uid) => next.delete(uid));
      } else {
        visibleUids.forEach((uid) => next.add(uid));
      }

      return next;
    });
  };

  const handleAddClick = () => {
    if (!isAddableMenu(selectedMenu, addableMenus)) {
      alert(MENU_SELECT_ALERT);
      return;
    }

    const uid = createUid();
    const newTestCase = {
      ...createEmptyTestCase(selectedMenu, uid),
      versions:
        selectedVersionId === VERSION_FILTER_ALL ? [] : [selectedVersionId],
    };
    const nextTestCases = [...testCases, newTestCase];
    const createdCase = assignDisplayIds(
      filterTestCases(nextTestCases, selectedMenu, searchText, workingFilter)
    ).find((testCase) => testCase.uid === uid);

    setTestCases(nextTestCases);
    setEditingTestCase(createdCase);
  };

  const handleSaveEdit = (formData) => {
    if (!editingTestCase) {
      return;
    }

    setTestCases((prev) =>
      updateTestCase(prev, editingTestCase.uid, formData)
    );
    setEditingTestCase(null);
  };

  const handleDeleteByUids = (uids) => {
    setTestCases((prev) => deleteTestCases(prev, uids));
    setSelectedUids((prev) => {
      const next = new Set(prev);
      uids.forEach((uid) => next.delete(uid));
      return next;
    });

    if (editingTestCase && uids.includes(editingTestCase.uid)) {
      setEditingTestCase(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUids.size === 0) {
      alert(DELETE_SELECT_ALERT);
      return;
    }

    const confirmed = window.confirm(
      `선택한 ${selectedUids.size}건의 TC를 삭제하시겠습니까?`
    );

    if (confirmed) {
      handleDeleteByUids([...selectedUids]);
    }
  };

  const handleDeleteFromModal = (uid) => {
    handleDeleteByUids([uid]);
  };

  const handleExcelDownload = () => {
    if (testCases.length === 0) {
      alert(EXCEL_DOWNLOAD_EMPTY_ALERT);
      return;
    }

    downloadTestCasesExcel(testCases);
  };

  const handleAddVersion = ({ name, description }) => {
    const id = name;
    const exists = versions.some(
      (version) =>
        version.id.toLowerCase() === id.toLowerCase() ||
        version.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 버전입니다.");
      return;
    }

    setVersions((prev) => [...prev, { id, name, description }]);
    setSelectedVersionId(id);
  };

  const handleUpdateVersion = (versionId, formData) => {
    const exists = versions.some(
      (version) =>
        version.id !== versionId &&
        version.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 버전명입니다.");
      return;
    }

    setVersions((prev) =>
      prev.map((version) =>
        version.id === versionId ? { ...version, ...formData } : version
      )
    );
  };

  const handleDeleteVersion = (versionId) => {
    setVersions((prev) => prev.filter((version) => version.id !== versionId));
    setTestCases((prev) =>
      prev.map((testCase) => ({
        ...testCase,
        versions: (testCase.versions ?? []).filter((id) => id !== versionId),
      }))
    );

    if (selectedVersionId === versionId) {
      setSelectedVersionId(VERSION_FILTER_ALL);
    }
  };

  const handleToggleTestCaseVersion = (uid, versionId) => {
    setTestCases((prev) =>
      prev.map((testCase) => {
        if (testCase.uid !== uid) {
          return testCase;
        }

        const versionSet = new Set(testCase.versions ?? []);

        if (versionSet.has(versionId)) {
          versionSet.delete(versionId);
        } else {
          versionSet.add(versionId);
        }

        return {
          ...testCase,
          versions: [...versionSet],
        };
      })
    );
  };

  const handleAddCustomMenu = (label) => {
    const exists = managedMenus.some(
      (menu) => menu.toLowerCase() === label.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 서브메뉴입니다.");
      return;
    }

    setCustomMenus((prev) => [...prev, { id: createCustomMenuId(), label }]);
  };

  const handleRenameCustomMenu = (menuId, nextLabel) => {
    const currentMenu = customMenus.find((menu) => menu.id === menuId);

    if (!currentMenu) {
      return;
    }

    const exists = managedMenus.some(
      (menu) =>
        menu.toLowerCase() === nextLabel.toLowerCase() &&
        menu.toLowerCase() !== currentMenu.label.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 서브메뉴입니다.");
      return;
    }

    setCustomMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId ? { ...menu, label: nextLabel } : menu
      )
    );
    setTestCases((prev) =>
      prev.map((testCase) =>
        testCase.menu === currentMenu.label
          ? { ...testCase, menu: nextLabel }
          : testCase
      )
    );

    if (selectedMenu === currentMenu.label) {
      setSelectedMenu(nextLabel);
    }
  };

  const handleDeleteCustomMenu = (menuId) => {
    const targetMenu = customMenus.find((menu) => menu.id === menuId);

    if (!targetMenu) {
      return;
    }

    const linkedCount = testCases.filter(
      (testCase) => testCase.menu === targetMenu.label
    ).length;
    const message =
      linkedCount > 0
        ? `${targetMenu.label} 서브메뉴를 삭제하시겠습니까? 연결된 TC ${linkedCount}건은 Total에서 계속 조회됩니다.`
        : `${targetMenu.label} 서브메뉴를 삭제하시겠습니까?`;

    if (!window.confirm(message)) {
      return;
    }

    setCustomMenus((prev) => prev.filter((menu) => menu.id !== menuId));

    if (selectedMenu === targetMenu.label) {
      setSelectedMenu(TOTAL_MENU);
    }
  };

  const handleMoveCustomMenu = (menuId, direction) => {
    setCustomMenus((prev) => {
      const currentIndex = prev.findIndex((menu) => menu.id === menuId);
      const nextIndex = currentIndex + direction;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= prev.length
      ) {
        return prev;
      }

      const nextMenus = [...prev];
      const [movedMenu] = nextMenus.splice(currentIndex, 1);
      nextMenus.splice(nextIndex, 0, movedMenu);

      return nextMenus;
    });
  };

  const handleDragStart = (e, uid) => {
    isDraggingRef.current = true;
    setDragUid(uid);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", uid);
  };

  const handleDragOver = (e, uid) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (dragUid && dragUid !== uid) {
      e.currentTarget.classList.add("tc-row-drop-target");
    }
  };

  const handleDrop = (e, dropUid) => {
    e.preventDefault();
    e.currentTarget.classList.remove("tc-row-drop-target");

    const dragId = dragUid || e.dataTransfer.getData("text/plain");

    if (!dragId || dragId === dropUid) {
      return;
    }

    setTestCases((prev) => reorderTestCases(prev, dragId, dropUid));
    setDragUid(null);
  };

  const handleDragEnd = () => {
    setDragUid(null);
    document.querySelectorAll(".tc-row-drop-target").forEach((row) => {
      row.classList.remove("tc-row-drop-target");
    });
    window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
  };

  const handleRowClick = (testCase) => {
    if (isDraggingRef.current || dragUid) {
      return;
    }

    setEditingTestCase(testCase);
  };

  return (
    <MainLayout
      loginUser={loginUser}
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
      pageTitle="테스트 케이스"
    >
      <div className="tc-content-card">
        <div className="tc-page-layout">
          <TestCaseFilter
            menus={managedMenus}
            selectedMenu={selectedMenu}
            onSelectMenu={setSelectedMenu}
            isOpen={isSubMenuOpen}
            onToggle={() => setIsSubMenuOpen((prev) => !prev)}
          />

          <div
            className={`tc-page-main ${
              isSubMenuOpen ? "" : "tc-page-main-expanded"
            }`}
          >
            <TestCaseToolbar
              searchText={searchText}
              onSearchChange={setSearchText}
              onSearchSubmit={() => {}}
              resultCount={filteredTestCases.length}
              onAddClick={handleAddClick}
              onDeleteClick={handleDeleteSelected}
              selectedCount={selectedUids.size}
              onExcelDownloadClick={handleExcelDownload}
              onVersionManageClick={() => setIsVersionManagerOpen(true)}
              onSubMenuManageClick={() => setIsSubMenuManagerOpen(true)}
              selectedVersionLabel={selectedVersionLabel}
              isSubMenuOpen={isSubMenuOpen}
              onToggleSubMenu={() => setIsSubMenuOpen(true)}
            />

            <TestCaseTable
              testCases={displayTestCases}
              selectedUids={selectedUids}
              dragUid={dragUid}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              workingFilter={workingFilter}
              onWorkingFilterChange={setWorkingFilter}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onRowClick={handleRowClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
      </div>

      <TestCaseEditModal
        isOpen={Boolean(editingTestCase)}
        testCase={editingTestCase}
        onClose={() => setEditingTestCase(null)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteFromModal}
      />

      <TestCaseVersionManager
        isOpen={isVersionManagerOpen}
        versions={versions}
        selectedVersionId={selectedVersionId}
        testCases={managerTestCases}
        onClose={() => setIsVersionManagerOpen(false)}
        onSelectVersion={setSelectedVersionId}
        onAddVersion={handleAddVersion}
        onUpdateVersion={handleUpdateVersion}
        onDeleteVersion={handleDeleteVersion}
        onToggleTestCaseVersion={handleToggleTestCaseVersion}
      />

      <SubMenuManagerModal
        isOpen={isSubMenuManagerOpen}
        defaultMenus={SIDEBAR_MENUS}
        customMenus={customMenus}
        onClose={() => setIsSubMenuManagerOpen(false)}
        onAddMenu={handleAddCustomMenu}
        onRenameMenu={handleRenameCustomMenu}
        onDeleteMenu={handleDeleteCustomMenu}
        onMoveMenu={handleMoveCustomMenu}
      />
    </MainLayout>
  );
}

export default TestCaseListPage;

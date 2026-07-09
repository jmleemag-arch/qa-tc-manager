import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import TestCaseFilter from "../components/TestCaseFilter";
import TestCaseToolbar from "../components/TestCaseToolbar";
import TestCaseTable from "../components/TestCaseTable";
import TestCaseEditModal from "../components/TestCaseEditModal";
import TestCaseVersionManager from "../components/TestCaseVersionManager";
import { testCases as initialTestCases } from "../data/testCaseMockData";
import {
  DELETE_SELECT_ALERT,
  EXCEL_DOWNLOAD_EMPTY_ALERT,
  FIXED_VERSION_MENUS,
  INITIAL_TEST_CASE_VERSIONS,
  IS_WORKING_FILTER_ALL,
  MENU_SELECT_ALERT,
  SIDEBAR_MENUS,
  TC_MENUS,
  TOTAL_MENU,
} from "../constants/testCaseConstants";
import { downloadTestCasesExcel } from "../utils/excelUtils";
import {
  assignDisplayIds,
  createEmptyTestCase,
  createUid,
  deleteTestCases,
  ensureVersionMenus,
  filterTestCases,
  isAddableMenu,
  isFixedVersionMenu,
  reorderTestCases,
  updateTestCase,
} from "../utils/testCaseUtils";

const TEST_CASE_STORAGE_KEY = "qa-manager-test-cases";
const TEST_CASE_VERSION_STORAGE_KEY = "qa-manager-test-case-versions";
const TEST_CASE_CUSTOM_MENU_POOL_KEY = "qa-manager-test-case-custom-menu-pool";

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

function normalizeVersions(storedVersions) {
  return storedVersions.map((version) => ({
    ...version,
    menus: ensureVersionMenus(version.menus ?? [...FIXED_VERSION_MENUS]),
  }));
}

function normalizeTestCases(storedTestCases) {
  return storedTestCases.map((testCase) => ({
    ...testCase,
    versionId:
      testCase.versionId ??
      (Array.isArray(testCase.versions) && testCase.versions.length > 0
        ? testCase.versions[0]
        : null),
  }));
}

function TestCaseListPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  routeParams = {},
  onRouteChange,
}) {
  const [testCases, setTestCases] = useState(() =>
    normalizeTestCases(
      readStorageValue(TEST_CASE_STORAGE_KEY, initialTestCases)
    )
  );
  const [versions, setVersions] = useState(() =>
    normalizeVersions(
      readStorageValue(TEST_CASE_VERSION_STORAGE_KEY, INITIAL_TEST_CASE_VERSIONS)
    )
  );
  const [customMenuPool, setCustomMenuPool] = useState(() =>
    readStorageValue(TEST_CASE_CUSTOM_MENU_POOL_KEY, [])
  );
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true);
  const [selectedUids, setSelectedUids] = useState(new Set());
  const [dragUid, setDragUid] = useState(null);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [isVersionManagerOpen, setIsVersionManagerOpen] = useState(false);
  const isDraggingRef = useRef(false);
  const activeVersionId = routeParams.version ?? null;
  const requestedMenu = routeParams.menu ?? TOTAL_MENU;
  const searchText = routeParams.q ?? "";
  const workingFilter = routeParams.working ?? IS_WORKING_FILTER_ALL;

  const activeVersion = versions.find((version) => version.id === activeVersionId);

  const sidebarMenus = useMemo(() => {
    if (!activeVersion) {
      return SIDEBAR_MENUS;
    }

    return activeVersion.menus ?? [...FIXED_VERSION_MENUS];
  }, [activeVersion]);

  const selectedMenu = sidebarMenus.includes(requestedMenu)
    ? requestedMenu
    : TOTAL_MENU;

  const addableMenus = useMemo(
    () => [
      ...FIXED_VERSION_MENUS.filter((menu) => menu !== TOTAL_MENU),
      ...TC_MENUS,
      ...customMenuPool.map((menu) => menu.label),
    ],
    [customMenuPool]
  );

  const pageHeading = activeVersion?.name ?? "테스트 케이스";

  const versionContext = useMemo(() => {
    if (!activeVersionId || !activeVersion) {
      return null;
    }

    return {
      versionId: activeVersionId,
      menus: activeVersion.menus ?? [...FIXED_VERSION_MENUS],
    };
  }, [activeVersionId, activeVersion]);

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
      TEST_CASE_CUSTOM_MENU_POOL_KEY,
      JSON.stringify(customMenuPool)
    );
  }, [customMenuPool]);

  const filteredTestCases = useMemo(
    () =>
      filterTestCases(
        testCases,
        selectedMenu,
        searchText,
        workingFilter,
        versionContext
      ),
    [testCases, selectedMenu, searchText, workingFilter, versionContext]
  );

  const displayTestCases = useMemo(
    () => assignDisplayIds(filteredTestCases),
    [filteredTestCases]
  );

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
    const newTestCase = createEmptyTestCase(
      selectedMenu,
      uid,
      activeVersionId
    );
    const nextTestCases = [...testCases, newTestCase];
    const createdCase = assignDisplayIds(
      filterTestCases(
        nextTestCases,
        selectedMenu,
        "",
        IS_WORKING_FILTER_ALL,
        versionContext
      )
    ).find((testCase) => testCase.uid === uid);

    setTestCases(nextTestCases);
    setEditingTestCase(createdCase);
    onRouteChange?.({ q: null, working: null }, { replace: true });
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
    const exportCases = filterTestCases(
      testCases,
      TOTAL_MENU,
      "",
      IS_WORKING_FILTER_ALL,
      versionContext
    );

    if (exportCases.length === 0) {
      alert(EXCEL_DOWNLOAD_EMPTY_ALERT);
      return;
    }

    downloadTestCasesExcel(exportCases);
  };

  const handleSelectMenu = (menu) => {
    setSelectedUids(new Set());
    onRouteChange?.({ menu });
  };

  const handleSearchChange = (value) => {
    onRouteChange?.({ q: value }, { replace: true });
  };

  const handleWorkingFilterChange = (value) => {
    onRouteChange?.(
      {
        working: value === IS_WORKING_FILTER_ALL ? null : value,
      },
      { replace: true }
    );
  };

  const handleApplyVersion = (versionId) => {
    setSelectedUids(new Set());
    onRouteChange?.({
      version: versionId,
      menu: TOTAL_MENU,
      q: null,
      working: null,
    });
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

    setVersions((prev) => [
      ...prev,
      {
        id,
        name,
        description,
        menus: [...FIXED_VERSION_MENUS],
      },
    ]);
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
      prev.filter((testCase) => testCase.versionId !== versionId)
    );

    if (activeVersionId === versionId) {
      onRouteChange?.({ version: null, menu: TOTAL_MENU }, { replace: true });
    }
  };

  const handleInsertMenu = (versionId, menuName) => {
    setVersions((prev) =>
      prev.map((version) => {
        if (version.id !== versionId) {
          return version;
        }

        const nextMenus = ensureVersionMenus([
          ...(version.menus ?? []),
          menuName,
        ]);

        return { ...version, menus: nextMenus };
      })
    );
  };

  const handleRemoveMenu = (versionId, menuName) => {
    if (isFixedVersionMenu(menuName)) {
      return;
    }

    setVersions((prev) =>
      prev.map((version) => {
        if (version.id !== versionId) {
          return version;
        }

        return {
          ...version,
          menus: (version.menus ?? []).filter((menu) => menu !== menuName),
        };
      })
    );

    if (activeVersionId === versionId && selectedMenu === menuName) {
      onRouteChange?.({ menu: TOTAL_MENU }, { replace: true });
    }
  };

  const handleMoveMenu = (versionId, menuName, direction) => {
    setVersions((prev) =>
      prev.map((version) => {
        if (version.id !== versionId) {
          return version;
        }

        const menus = [...(version.menus ?? [])];
        const optionalMenus = menus.filter((menu) => !isFixedVersionMenu(menu));
        const currentIndex = optionalMenus.indexOf(menuName);
        const nextIndex = currentIndex + direction;

        if (
          currentIndex < 0 ||
          nextIndex < 0 ||
          nextIndex >= optionalMenus.length
        ) {
          return version;
        }

        const reorderedOptionalMenus = [...optionalMenus];
        const [movedMenu] = reorderedOptionalMenus.splice(currentIndex, 1);
        reorderedOptionalMenus.splice(nextIndex, 0, movedMenu);

        return {
          ...version,
          menus: [...FIXED_VERSION_MENUS, ...reorderedOptionalMenus],
        };
      })
    );
  };

  const handleAddCustomMenu = (versionId, label) => {
    const existsInPool = [
      ...SIDEBAR_MENUS,
      ...customMenuPool.map((menu) => menu.label),
    ].some((menu) => menu.toLowerCase() === label.toLowerCase());

    if (existsInPool) {
      alert("이미 등록된 서브메뉴입니다.");
      return;
    }

    setCustomMenuPool((prev) => [
      ...prev,
      { id: createCustomMenuId(), label },
    ]);
    handleInsertMenu(versionId, label);
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
      notifications={notifications}
      onNotificationClick={onNotificationClick}
      onMarkAllNotificationsRead={onMarkAllNotificationsRead}
      pageTitle="테스트 케이스"
    >
      <div className="tc-content-card">
        <div className="tc-page-layout">
          <TestCaseFilter
            menus={sidebarMenus}
            selectedMenu={selectedMenu}
            onSelectMenu={handleSelectMenu}
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
              onSearchChange={handleSearchChange}
              onSearchSubmit={() => {}}
              resultCount={filteredTestCases.length}
              onAddClick={handleAddClick}
              onDeleteClick={handleDeleteSelected}
              selectedCount={selectedUids.size}
              onExcelDownloadClick={handleExcelDownload}
              onVersionManageClick={() => setIsVersionManagerOpen(true)}
              pageHeading={pageHeading}
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
              onWorkingFilterChange={handleWorkingFilterChange}
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
        activeVersionId={activeVersionId}
        customMenuPool={customMenuPool}
        onClose={() => setIsVersionManagerOpen(false)}
        onApplyVersion={handleApplyVersion}
        onAddVersion={handleAddVersion}
        onUpdateVersion={handleUpdateVersion}
        onDeleteVersion={handleDeleteVersion}
        onInsertMenu={handleInsertMenu}
        onRemoveMenu={handleRemoveMenu}
        onMoveMenu={handleMoveMenu}
        onAddCustomMenu={handleAddCustomMenu}
      />
    </MainLayout>
  );
}

export default TestCaseListPage;

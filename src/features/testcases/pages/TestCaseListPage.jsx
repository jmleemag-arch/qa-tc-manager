import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useCustomMenuPool } from "../../../hooks/useCustomMenuPool";
import { useTestCases } from "../../../hooks/useTestCases";
import { useVersions } from "../../../hooks/useVersions";
import TestCaseFilter from "../components/TestCaseFilter";
import TestCaseToolbar from "../components/TestCaseToolbar";
import TestCaseTable from "../components/TestCaseTable";
import TestCaseEditModal from "../components/TestCaseEditModal";
import TestCaseVersionManager from "../components/TestCaseVersionManager";
import {
  DELETE_SELECT_ALERT,
  EXCEL_DOWNLOAD_EMPTY_ALERT,
  FIXED_VERSION_MENUS,
  IS_WORKING_FILTER_ALL,
  MENU_SELECT_ALERT,
  SIDEBAR_MENUS,
  TC_MENUS,
  TOTAL_MENU,
} from "../constants/testCaseConstants";
import { downloadTestCasesExcel } from "../utils/excelUtils";
import {
  assignDisplayIds,
  ensureVersionMenus,
  filterTestCases,
  isAddableMenu,
  isFixedVersionMenu,
  reorderTestCases,
} from "../utils/testCaseUtils";

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
  const {
    testCaseVersions: versions,
    loading: versionsLoading,
    createVersion,
    updateVersion: updateVersionApi,
    deleteVersion: deleteVersionApi,
    updateSubmenus,
  } = useVersions();
  const {
    testCases,
    loading: testCasesLoading,
    error: testCasesError,
    createTestCase: createTestCaseApi,
    updateTestCase: updateTestCaseApi,
    deleteTestCases: deleteTestCasesApi,
    reorderTestCases: reorderTestCasesApi,
    refresh: refreshTestCases,
  } = useTestCases();
  const { customMenuPool, setCustomMenuPool } = useCustomMenuPool();
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

  const handleAddClick = async () => {
    if (!isAddableMenu(selectedMenu, addableMenus)) {
      alert(MENU_SELECT_ALERT);
      return;
    }

    try {
      const created = await createTestCaseApi({
        menu: selectedMenu,
        versionId: activeVersionId,
        subMenu: "",
        checkItem: "",
        checkMethod: "",
        checkResult: "",
        isWorking: null,
        note: "",
      });

      setEditingTestCase({
        ...created,
        displayId: created.id,
      });
      onRouteChange?.({ q: null, working: null }, { replace: true });
    } catch {
      alert("테스트 케이스를 추가하지 못했습니다.");
    }
  };

  const handleSaveEdit = async (formData) => {
    if (!editingTestCase) {
      return;
    }

    try {
      await updateTestCaseApi(editingTestCase.dbId, formData);
      setEditingTestCase(null);
    } catch {
      alert("테스트 케이스를 저장하지 못했습니다.");
    }
  };

  const handleDeleteByUids = async (uids) => {
    const dbIds = testCases
      .filter((testCase) => uids.includes(testCase.uid))
      .map((testCase) => testCase.dbId);

    try {
      await deleteTestCasesApi(dbIds);
      setSelectedUids((prev) => {
        const next = new Set(prev);
        uids.forEach((uid) => next.delete(uid));
        return next;
      });

      if (editingTestCase && uids.includes(editingTestCase.uid)) {
        setEditingTestCase(null);
      }
    } catch {
      alert("테스트 케이스를 삭제하지 못했습니다.");
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

  const handleAddVersion = async ({ name, description }) => {
    const exists = versions.some(
      (version) => version.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 버전입니다.");
      return;
    }

    try {
      await createVersion({
        versionName: name,
        description,
      });
    } catch {
      alert("버전을 저장하지 못했습니다.");
    }
  };

  const handleUpdateVersion = async (versionId, formData) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    const exists = versions.some(
      (version) =>
        version.id !== versionId &&
        version.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 버전명입니다.");
      return;
    }

    try {
      await updateVersionApi(currentVersion.dbId, {
        versionName: formData.name,
        description: formData.description,
      });

      if (formData.name !== versionId && activeVersionId === versionId) {
        onRouteChange?.(
          { version: formData.name, menu: selectedMenu },
          { replace: true }
        );
      }

      await refreshTestCases();
    } catch {
      alert("버전을 수정하지 못했습니다.");
    }
  };

  const handleDeleteVersion = async (versionId) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    try {
      await deleteVersionApi(currentVersion.dbId);
      await refreshTestCases();

      if (activeVersionId === versionId) {
        onRouteChange?.({ version: null, menu: TOTAL_MENU }, { replace: true });
      }
    } catch {
      alert("버전을 삭제하지 못했습니다.");
    }
  };

  const persistMenus = async (versionId, menus) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    try {
      await updateSubmenus(currentVersion.dbId, menus);
    } catch {
      alert("메뉴 설정을 저장하지 못했습니다.");
    }
  };

  const handleInsertMenu = (versionId, menuName) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    const nextMenus = ensureVersionMenus([
      ...(currentVersion.menus ?? []),
      menuName,
    ]);

    persistMenus(versionId, nextMenus);
  };

  const handleRemoveMenu = (versionId, menuName) => {
    if (isFixedVersionMenu(menuName)) {
      return;
    }

    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    const nextMenus = (currentVersion.menus ?? []).filter(
      (menu) => menu !== menuName
    );

    persistMenus(versionId, nextMenus);

    if (activeVersionId === versionId && selectedMenu === menuName) {
      onRouteChange?.({ menu: TOTAL_MENU }, { replace: true });
    }
  };

  const handleMoveMenu = (versionId, menuName, direction) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    const menus = [...(currentVersion.menus ?? [])];
    const optionalMenus = menus.filter((menu) => !isFixedVersionMenu(menu));
    const currentIndex = optionalMenus.indexOf(menuName);
    const nextIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= optionalMenus.length
    ) {
      return;
    }

    const reorderedOptionalMenus = [...optionalMenus];
    const [movedMenu] = reorderedOptionalMenus.splice(currentIndex, 1);
    reorderedOptionalMenus.splice(nextIndex, 0, movedMenu);

    persistMenus(versionId, [
      ...FIXED_VERSION_MENUS,
      ...reorderedOptionalMenus,
    ]);
  };

  const handleAddCustomMenu = async (versionId, label) => {
    const existsInPool = [
      ...SIDEBAR_MENUS,
      ...customMenuPool.map((menu) => menu.label),
    ].some((menu) => menu.toLowerCase() === label.toLowerCase());

    if (existsInPool) {
      alert("이미 등록된 서브메뉴입니다.");
      return;
    }

    await setCustomMenuPool([
      ...customMenuPool,
      { id: `menu-${Date.now()}`, label },
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

  const handleDrop = async (e, dropUid) => {
    e.preventDefault();
    e.currentTarget.classList.remove("tc-row-drop-target");

    const dragId = dragUid || e.dataTransfer.getData("text/plain");

    if (!dragId || dragId === dropUid) {
      return;
    }

    const nextCases = reorderTestCases(testCases, dragId, dropUid);
    const orderedIds = nextCases
      .filter(
        (testCase) => !activeVersionId || testCase.versionId === activeVersionId
      )
      .map((testCase) => Number(testCase.dbId));

    setDragUid(null);

    try {
      await reorderTestCasesApi(orderedIds, activeVersionId);
    } catch {
      await refreshTestCases();
      alert("순서를 저장하지 못했습니다.");
    }
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
      {versionsLoading || testCasesLoading ? (
        <p className="df-page-description">테스트 케이스를 불러오는 중입니다...</p>
      ) : testCasesError ? (
        <p className="df-page-description">
          테스트 케이스를 불러오지 못했습니다. 터미널에서 `npm run dev`를 재시작해
          주세요.
        </p>
      ) : (
        <>
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
        </>
      )}
    </MainLayout>
  );
}

export default TestCaseListPage;

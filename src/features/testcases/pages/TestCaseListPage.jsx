import { useMemo, useRef, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import TestCaseFilter from "../components/TestCaseFilter";
import TestCaseToolbar from "../components/TestCaseToolbar";
import TestCaseTable from "../components/TestCaseTable";
import TestCaseEditModal from "../components/TestCaseEditModal";
import { testCases as initialTestCases } from "../data/testCaseMockData";
import {
  DELETE_SELECT_ALERT,
  EXCEL_DOWNLOAD_EMPTY_ALERT,
  IS_WORKING_FILTER_ALL,
  MENU_SELECT_ALERT,
  TOTAL_MENU,
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

function TestCaseListPage({ loginUser, onLogout, activeMenu, onMenuChange }) {
  const [testCases, setTestCases] = useState(initialTestCases);
  const [selectedMenu, setSelectedMenu] = useState(TOTAL_MENU);
  const [searchText, setSearchText] = useState("");
  const [workingFilter, setWorkingFilter] = useState(IS_WORKING_FILTER_ALL);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(true);
  const [selectedUids, setSelectedUids] = useState(new Set());
  const [dragUid, setDragUid] = useState(null);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const isDraggingRef = useRef(false);

  const filteredTestCases = useMemo(
    () =>
      filterTestCases(testCases, selectedMenu, searchText, workingFilter),
    [testCases, selectedMenu, searchText, workingFilter]
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
    if (!isAddableMenu(selectedMenu)) {
      alert(MENU_SELECT_ALERT);
      return;
    }

    const uid = createUid();
    const newTestCase = createEmptyTestCase(selectedMenu, uid);
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
    </MainLayout>
  );
}

export default TestCaseListPage;

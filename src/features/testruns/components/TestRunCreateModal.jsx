import { useEffect, useMemo, useState } from "react";
import {
  TARGET_MENU_OPTIONS,
  TARGET_MENU_PLACEHOLDER,
} from "../constants/testRunConstants";
import VersionYearVersionPicker from "../../defects/components/VersionYearVersionPicker";
import {
  getDefaultVersionForYear,
  getDefaultYearLabel,
} from "../../defects/utils/issueVersionUtils";
import {
  createTestRun,
  getTestCasesByMenu,
  validateTestRunCreateForm,
} from "../utils/testRunUtils";

function TestRunCreateModal({
  isOpen,
  allTestCases,
  existingRuns,
  issueVersions,
  onClose,
  onCreate,
}) {
  const [runName, setRunName] = useState("");
  const [selectedYear, setSelectedYear] = useState(() =>
    getDefaultYearLabel(issueVersions)
  );
  const [targetVersion, setTargetVersion] = useState(() =>
    getDefaultVersionForYear(issueVersions, getDefaultYearLabel(issueVersions))
  );
  const [targetMenu, setTargetMenu] = useState("");
  const [selectedUids, setSelectedUids] = useState(new Set());

  const menuTestCases = useMemo(
    () => getTestCasesByMenu(allTestCases, targetMenu),
    [allTestCases, targetMenu]
  );

  const visibleUids = menuTestCases.map((testCase) => testCase.uid);
  const isAllSelected =
    visibleUids.length > 0 &&
    visibleUids.every((uid) => selectedUids.has(uid));
  const isIndeterminate =
    visibleUids.some((uid) => selectedUids.has(uid)) && !isAllSelected;

  useEffect(() => {
    if (isOpen) {
      const defaultYear = getDefaultYearLabel(issueVersions);
      setRunName("");
      setSelectedYear(defaultYear);
      setTargetVersion(getDefaultVersionForYear(issueVersions, defaultYear));
      setTargetMenu("");
      setSelectedUids(new Set());
    }
  }, [isOpen, issueVersions]);

  useEffect(() => {
    setSelectedUids(new Set());
  }, [targetMenu]);

  useEffect(() => {
    if (
      targetVersion &&
      issueVersions.some((version) => version.version === targetVersion)
    ) {
      return;
    }

    const nextVersion = getDefaultVersionForYear(issueVersions, selectedYear);

    if (nextVersion) {
      setTargetVersion(nextVersion);
    }
  }, [issueVersions, selectedYear, targetVersion]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setTargetVersion(getDefaultVersionForYear(issueVersions, year));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateTestRunCreateForm({
      runName,
      targetMenu,
      targetVersion,
      selectedCount: selectedUids.size,
    });

    if (validationError) {
      alert(validationError);
      return;
    }

    const selectedTestCases = menuTestCases.filter((testCase) =>
      selectedUids.has(testCase.uid)
    );

    const newTestRun = createTestRun({
      runName,
      targetMenu,
      targetVersion,
      selectedTestCases,
      existingRuns,
    });

    onCreate(newTestRun);
  };

  return (
    <div className="tr-create-modal-overlay" onClick={handleBackdropClick}>
      <div
        className="tr-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tr-create-modal-title"
      >
        <div className="tr-create-modal-header">
          <div>
            <h2 id="tr-create-modal-title">테스트 런 생성</h2>
            <p>년도와 버전을 선택한 뒤 테스트 케이스를 묶어 실행합니다.</p>
          </div>
          <button
            type="button"
            className="tr-create-modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <form className="tr-create-modal-form" onSubmit={handleSubmit}>
          <VersionYearVersionPicker
            versions={issueVersions}
            selectedYear={selectedYear}
            selectedVersion={targetVersion}
            onYearChange={handleYearChange}
            onVersionChange={setTargetVersion}
            className="tr-create-version-picker"
          />

          <div className="tr-create-modal-fields">
            <label className="tr-create-field">
              <span>
                런 이름 <em className="tr-create-required">*</em>
              </span>
              <input
                type="text"
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                placeholder={`예: ${targetVersion || "26.1.0"} 대시보드 점검`}
              />
            </label>

            <label className="tr-create-field">
              <span>
                대상 메뉴 <em className="tr-create-required">*</em>
              </span>
              <select
                value={targetMenu}
                onChange={(e) => setTargetMenu(e.target.value)}
              >
                <option value="">{TARGET_MENU_PLACEHOLDER}</option>
                {TARGET_MENU_OPTIONS.map((menu) => (
                  <option key={menu} value={menu}>
                    {menu}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="tr-create-tc-section">
            <div className="tr-create-tc-header">
              <h3>테스트 케이스 선택</h3>
              <span className="tr-create-selected-count">
                선택된 TC: {selectedUids.size}개
              </span>
            </div>

            <div className="tr-create-tc-scroll">
              {!targetMenu ? (
                <p className="tr-create-tc-empty">
                  대상 메뉴를 선택하면 테스트 케이스 목록이 표시됩니다.
                </p>
              ) : menuTestCases.length === 0 ? (
                <p className="tr-create-tc-empty">
                  선택한 메뉴에 등록된 테스트 케이스가 없습니다.
                </p>
              ) : (
                <table className="tr-create-tc-table">
                  <thead>
                    <tr>
                      <th className="tr-create-select-header">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = isIndeterminate;
                            }
                          }}
                          onChange={handleToggleSelectAll}
                          aria-label="테스트 케이스 전체 선택"
                        />
                      </th>
                      <th>ID</th>
                      <th>서브메뉴</th>
                      <th>점검항목</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuTestCases.map((testCase) => (
                      <tr key={testCase.uid}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUids.has(testCase.uid)}
                            onChange={() => handleToggleSelect(testCase.uid)}
                            aria-label={`${testCase.id} 선택`}
                          />
                        </td>
                        <td className="tr-create-tc-id">{testCase.id}</td>
                        <td>{testCase.subMenu || "-"}</td>
                        <td className="tr-create-tc-item">
                          {testCase.checkItem || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="tr-create-modal-actions">
            <button
              type="button"
              className="tr-create-cancel-btn"
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className="tr-create-submit-btn">
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestRunCreateModal;

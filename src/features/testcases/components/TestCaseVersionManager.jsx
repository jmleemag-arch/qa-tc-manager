import { useMemo, useState } from "react";
import { VERSION_FILTER_ALL } from "../constants/testCaseConstants";

function TestCaseVersionManager({
  isOpen,
  versions,
  selectedVersionId,
  testCases,
  onClose,
  onSelectVersion,
  onAddVersion,
  onUpdateVersion,
  onDeleteVersion,
  onToggleTestCaseVersion,
}) {
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionDescription, setNewVersionDescription] = useState("");
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId),
    [versions, selectedVersionId]
  );

  if (!isOpen) {
    return null;
  }

  const getLinkedCount = (versionId) =>
    testCases.filter((testCase) => testCase.versions?.includes(versionId))
      .length;

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const name = newVersionName.trim();
    if (!name) {
      return;
    }

    onAddVersion({
      name,
      description: newVersionDescription.trim(),
    });
    setNewVersionName("");
    setNewVersionDescription("");
  };

  const handleStartEdit = (version) => {
    setEditingVersionId(version.id);
    setEditingName(version.name);
    setEditingDescription(version.description ?? "");
  };

  const handleSaveEdit = () => {
    const name = editingName.trim();
    if (!editingVersionId || !name) {
      return;
    }

    onUpdateVersion(editingVersionId, {
      name,
      description: editingDescription.trim(),
    });
    setEditingVersionId(null);
    setEditingName("");
    setEditingDescription("");
  };

  const handleDelete = (version) => {
    const confirmed = window.confirm(
      `${version.name} 버전을 삭제하시겠습니까? 연결된 테스트 케이스의 버전 정보도 해제됩니다.`
    );

    if (confirmed) {
      onDeleteVersion(version.id);
    }
  };

  return (
    <div className="tc-modal-overlay">
      <div className="tc-modal tc-manager-modal" role="dialog" aria-modal="true">
        <div className="tc-modal-header">
          <div>
            <h2>버전 관리</h2>
            <p>버전별로 테스트 케이스를 묶고, 선택한 버전만 목록에 표시합니다.</p>
          </div>
          <button
            type="button"
            className="tc-modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="tc-manager-body">
          <section className="tc-manager-side" aria-label="버전 목록">
            <button
              type="button"
              className={
                selectedVersionId === VERSION_FILTER_ALL
                  ? "tc-manager-list-btn active"
                  : "tc-manager-list-btn"
              }
              onClick={() => onSelectVersion(VERSION_FILTER_ALL)}
            >
              <span>전체 버전</span>
              <strong>{testCases.length}건</strong>
            </button>

            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                className={
                  selectedVersionId === version.id
                    ? "tc-manager-list-btn active"
                    : "tc-manager-list-btn"
                }
                onClick={() => onSelectVersion(version.id)}
              >
                <span>{version.name}</span>
                <strong>{getLinkedCount(version.id)}건</strong>
              </button>
            ))}
          </section>

          <section className="tc-manager-main">
            <form className="tc-manager-add-form" onSubmit={handleAddSubmit}>
              <label>
                <span>새 버전명</span>
                <input
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="예: v1.3"
                />
              </label>
              <label>
                <span>설명</span>
                <input
                  value={newVersionDescription}
                  onChange={(e) => setNewVersionDescription(e.target.value)}
                  placeholder="선택 입력"
                />
              </label>
              <button type="submit" className="tc-modal-save-btn">
                추가
              </button>
            </form>

            {selectedVersion ? (
              <>
                <div className="tc-manager-section-title">
                  <h3>{selectedVersion.name}</h3>
                  <div className="tc-manager-row-actions">
                    <button
                      type="button"
                      className="tc-manager-text-btn"
                      onClick={() => handleStartEdit(selectedVersion)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="tc-manager-danger-btn"
                      onClick={() => handleDelete(selectedVersion)}
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {editingVersionId === selectedVersion.id && (
                  <div className="tc-manager-edit-box">
                    <label>
                      <span>버전명</span>
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>설명</span>
                      <input
                        value={editingDescription}
                        onChange={(e) =>
                          setEditingDescription(e.target.value)
                        }
                      />
                    </label>
                    <div className="tc-manager-row-actions">
                      <button
                        type="button"
                        className="tc-modal-cancel-btn"
                        onClick={() => setEditingVersionId(null)}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className="tc-modal-save-btn"
                        onClick={handleSaveEdit}
                      >
                        저장
                      </button>
                    </div>
                  </div>
                )}

                <div className="tc-version-link-list">
                  {testCases.map((testCase) => (
                    <label key={testCase.uid} className="tc-version-link-item">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          testCase.versions?.includes(selectedVersion.id)
                        )}
                        onChange={() =>
                          onToggleTestCaseVersion(
                            testCase.uid,
                            selectedVersion.id
                          )
                        }
                      />
                      <span>{testCase.displayId || testCase.id}</span>
                      <strong>{testCase.checkItem}</strong>
                      <em>{testCase.menu}</em>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="tc-manager-empty">
                왼쪽에서 관리할 버전을 선택해주세요.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default TestCaseVersionManager;

import { useMemo, useState } from "react";
import {
  FIXED_VERSION_MENUS,
  INSERTABLE_MENU_POOL,
} from "../constants/testCaseConstants";
import { isFixedVersionMenu } from "../utils/testCaseUtils";

function TestCaseVersionManager({
  inline = false,
  isOpen,
  versions,
  activeVersionId,
  customMenuPool,
  onClose,
  onApplyVersion,
  onAddVersion,
  onUpdateVersion,
  onDeleteVersion,
  onInsertMenu,
  onRemoveMenu,
  onMoveMenu,
  onAddCustomMenu,
}) {
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionDescription, setNewVersionDescription] = useState("");
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState(
    activeVersionId ?? versions[0]?.id ?? null
  );
  const [newCustomMenuName, setNewCustomMenuName] = useState("");

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId),
    [versions, selectedVersionId]
  );

  const insertableMenus = useMemo(() => {
    if (!selectedVersion) {
      return [];
    }

    const currentMenus = new Set(selectedVersion.menus ?? []);
    const poolMenus = [
      ...INSERTABLE_MENU_POOL,
      ...customMenuPool.map((menu) => menu.label),
    ];

    return [...new Set(poolMenus)].filter((menu) => !currentMenus.has(menu));
  }, [customMenuPool, selectedVersion]);

  if (!isOpen) {
    return null;
  }

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
      `${version.name} 버전을 삭제하시겠습니까? 이 버전의 테스트 케이스도 함께 삭제됩니다.`
    );

    if (confirmed) {
      onDeleteVersion(version.id);
      if (selectedVersionId === version.id) {
        setSelectedVersionId(versions[0]?.id ?? null);
      }
    }
  };

  const handleAddCustomMenuSubmit = (e) => {
    e.preventDefault();

    const label = newCustomMenuName.trim();
    if (!label || !selectedVersionId) {
      return;
    }

    onAddCustomMenu(selectedVersionId, label);
    setNewCustomMenuName("");
  };

  const handleApply = () => {
    onApplyVersion(selectedVersionId);
    if (!inline) {
      onClose();
    }
  };

  const handleApplyDefault = () => {
    onApplyVersion(null);
    if (!inline) {
      onClose();
    }
  };

  const managerPanel = (
    <div
      className={
        inline
          ? "tc-modal tc-manager-modal tc-manager-inline"
          : "tc-modal tc-manager-modal"
      }
      role="dialog"
      aria-modal={!inline}
    >
        <div className="tc-modal-header">
          <div>
            <h2>버전 관리</h2>
            <p>
              버전을 선택하면 화면 제목이 버전명으로 바뀌고, 버전별로 서브메뉴
              구성을 관리할 수 있습니다.
            </p>
          </div>
          {!inline ? (
          <button
            type="button"
            className="tc-modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
          ) : null}
        </div>

        <div className="tc-manager-body">
          <section className="tc-manager-side" aria-label="버전 목록">
            <button
              type="button"
              className={
                selectedVersionId === null
                  ? "tc-manager-list-btn active"
                  : "tc-manager-list-btn"
              }
              onClick={() => setSelectedVersionId(null)}
            >
              <span>테스트 케이스</span>
              <strong>기본</strong>
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
                onClick={() => setSelectedVersionId(version.id)}
              >
                <span>{version.name}</span>
                <strong>{(version.menus ?? []).length}개 메뉴</strong>
              </button>
            ))}
          </section>

          <section className="tc-manager-main">
            {!selectedVersion && (
              <form className="tc-manager-add-form" onSubmit={handleAddSubmit}>
                <label>
                  <span>새 버전명</span>
                  <input
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="예: 26.3.0"
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
            )}

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

                <div className="tc-submenu-manage-list">
                  <h3>버전 서브메뉴</h3>
                  {(selectedVersion.menus ?? []).map((menu, index) => {
                    const isFixed = isFixedVersionMenu(menu);
                    const optionalMenus = (selectedVersion.menus ?? []).filter(
                      (item) => !isFixedVersionMenu(item)
                    );
                    const optionalIndex = optionalMenus.indexOf(menu);

                    return (
                      <div
                        key={menu}
                        className={
                          isFixed
                            ? "tc-submenu-manage-row locked"
                            : "tc-submenu-manage-row"
                        }
                      >
                        <span>{menu}</span>
                        {isFixed ? (
                          <strong>고정</strong>
                        ) : (
                          <div className="tc-manager-row-actions">
                            <button
                              type="button"
                              className="tc-manager-icon-btn"
                              onClick={() =>
                                onMoveMenu(selectedVersion.id, menu, -1)
                              }
                              disabled={optionalIndex <= 0}
                              aria-label="위로 이동"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="tc-manager-icon-btn"
                              onClick={() =>
                                onMoveMenu(selectedVersion.id, menu, 1)
                              }
                              disabled={
                                optionalIndex < 0 ||
                                optionalIndex >= optionalMenus.length - 1
                              }
                              aria-label="아래로 이동"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="tc-manager-danger-btn"
                              onClick={() =>
                                onRemoveMenu(selectedVersion.id, menu)
                              }
                            >
                              제거
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="tc-version-menu-insert">
                  <h3>메뉴 삽입</h3>
                  {insertableMenus.length > 0 ? (
                    <div className="tc-version-menu-insert-list">
                      {insertableMenus.map((menu) => (
                        <button
                          key={menu}
                          type="button"
                          className="tc-version-menu-insert-btn"
                          onClick={() =>
                            onInsertMenu(selectedVersion.id, menu)
                          }
                        >
                          + {menu}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="tc-manager-empty">
                      삽입 가능한 메뉴가 없습니다.
                    </p>
                  )}

                  <form
                    className="tc-manager-add-form tc-version-custom-menu-form"
                    onSubmit={handleAddCustomMenuSubmit}
                  >
                    <label>
                      <span>사용자 메뉴 추가</span>
                      <input
                        value={newCustomMenuName}
                        onChange={(e) => setNewCustomMenuName(e.target.value)}
                        placeholder="새 서브메뉴명"
                      />
                    </label>
                    <button type="submit" className="tc-modal-save-btn">
                      추가 후 삽입
                    </button>
                  </form>
                </div>

                <div className="tc-version-apply-actions">
                  <button
                    type="button"
                    className="tc-modal-save-btn"
                    onClick={handleApply}
                  >
                    {selectedVersion.name} 버전으로 이동
                  </button>
                </div>
              </>
            ) : (
              <div className="tc-version-default-panel">
                <div className="tc-manager-empty">
                  기본 테스트 케이스 화면입니다. 전체 서브메뉴와 기본 TC
                  목록을 사용합니다.
                </div>
                <div className="tc-version-apply-actions">
                  <button
                    type="button"
                    className="tc-modal-save-btn"
                    onClick={handleApplyDefault}
                  >
                    테스트 케이스 화면으로 이동
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
  );

  if (inline) {
    return managerPanel;
  }

  return <div className="tc-modal-overlay">{managerPanel}</div>;
}

export default TestCaseVersionManager;

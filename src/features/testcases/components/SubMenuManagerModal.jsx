import { useState } from "react";

function SubMenuManagerModal({
  isOpen,
  defaultMenus,
  customMenus,
  onClose,
  onAddMenu,
  onRenameMenu,
  onDeleteMenu,
  onMoveMenu,
}) {
  const [newMenuName, setNewMenuName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const name = newMenuName.trim();
    if (!name) {
      return;
    }

    onAddMenu(name);
    setNewMenuName("");
  };

  const handleStartEdit = (menu) => {
    setEditingId(menu.id);
    setEditingName(menu.label);
  };

  const handleSaveEdit = () => {
    const name = editingName.trim();
    if (!editingId || !name) {
      return;
    }

    onRenameMenu(editingId, name);
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="tc-modal-overlay">
      <div className="tc-modal tc-submenu-manager" role="dialog" aria-modal="true">
        <div className="tc-modal-header">
          <div>
            <h2>서브메뉴 관리</h2>
            <p>기본 서브메뉴는 유지하고, 추가한 서브메뉴만 수정하거나 삭제합니다.</p>
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

        <div className="tc-manager-body tc-submenu-manager-body">
          <section className="tc-manager-main">
            <form className="tc-manager-add-form" onSubmit={handleAddSubmit}>
              <label>
                <span>새 서브메뉴</span>
                <input
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="서브메뉴명을 입력하세요"
                />
              </label>
              <button type="submit" className="tc-modal-save-btn">
                추가
              </button>
            </form>

            <div className="tc-submenu-manage-list">
              <h3>기본 서브메뉴</h3>
              {defaultMenus.map((menu) => (
                <div key={menu} className="tc-submenu-manage-row locked">
                  <span>{menu}</span>
                  <strong>기본</strong>
                </div>
              ))}
            </div>

            <div className="tc-submenu-manage-list">
              <h3>추가 서브메뉴</h3>
              {customMenus.length === 0 ? (
                <div className="tc-manager-empty">추가된 서브메뉴가 없습니다.</div>
              ) : (
                customMenus.map((menu, index) => (
                  <div key={menu.id} className="tc-submenu-manage-row">
                    {editingId === menu.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        aria-label="서브메뉴명"
                      />
                    ) : (
                      <span>{menu.label}</span>
                    )}

                    <div className="tc-manager-row-actions">
                      <button
                        type="button"
                        className="tc-manager-icon-btn"
                        onClick={() => onMoveMenu(menu.id, -1)}
                        disabled={index === 0}
                        aria-label="위로 이동"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="tc-manager-icon-btn"
                        onClick={() => onMoveMenu(menu.id, 1)}
                        disabled={index === customMenus.length - 1}
                        aria-label="아래로 이동"
                      >
                        ↓
                      </button>

                      {editingId === menu.id ? (
                        <>
                          <button
                            type="button"
                            className="tc-manager-text-btn"
                            onClick={() => setEditingId(null)}
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            className="tc-manager-text-btn"
                            onClick={handleSaveEdit}
                          >
                            저장
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="tc-manager-text-btn"
                            onClick={() => handleStartEdit(menu)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="tc-manager-danger-btn"
                            onClick={() => onDeleteMenu(menu.id)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SubMenuManagerModal;

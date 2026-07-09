import { useEffect, useState } from "react";
import {
  EDITABLE_TEST_CASE_FIELDS,
  IS_WORKING_OPTIONS,
} from "../constants/testCaseConstants";
import { getEditableFormData } from "../utils/testCaseUtils";

function TestCaseEditModal({ isOpen, testCase, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (isOpen && testCase) {
      setFormData(getEditableFormData(testCase));
    }
  }, [isOpen, testCase]);

  if (!isOpen || !testCase || !formData) {
    return null;
  }

  const displayId = testCase.displayId ?? testCase.id;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`${displayId} 항목을 삭제하시겠습니까?`);

    if (confirmed) {
      onDelete(testCase.uid);
    }
  };

  return (
    <div className="tc-modal-overlay" onClick={handleBackdropClick}>
      <div
        className="tc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tc-edit-modal-title"
      >
        <div className="tc-modal-header">
          <div>
            <h2 id="tc-edit-modal-title">테스트 케이스 수정</h2>
            <p>{displayId} 항목을 수정합니다.</p>
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

        <form className="tc-modal-form" onSubmit={handleSubmit}>
          <div className="tc-modal-auto-fields">
            <div className="tc-modal-readonly-field">
              <span>ID</span>
              <strong>{displayId}</strong>
            </div>
            <div className="tc-modal-readonly-field">
              <span>메뉴</span>
              <strong>{testCase.menu}</strong>
            </div>
          </div>

          <div className="tc-modal-form-grid">
            {EDITABLE_TEST_CASE_FIELDS.map((field) => (
              <label
                key={field.name}
                className={
                  field.fullWidth
                    ? "tc-modal-field tc-modal-field-full"
                    : "tc-modal-field"
                }
              >
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </label>
            ))}

            <label className="tc-modal-field">
              <span>작동 여부</span>
              <select
                value={formData.isWorking}
                onChange={(e) => handleChange("isWorking", e.target.value)}
              >
                {IS_WORKING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="tc-modal-actions">
            <button
              type="button"
              className="tc-modal-delete-btn"
              onClick={handleDelete}
            >
              삭제
            </button>
            <div className="tc-modal-actions-right">
              <button
                type="button"
                className="tc-modal-cancel-btn"
                onClick={onClose}
              >
                취소
              </button>
              <button type="submit" className="tc-modal-save-btn">
                저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestCaseEditModal;

import { useEffect, useState } from "react";
import {
  INITIAL_TEST_CASE_FORM,
  IS_WORKING_OPTIONS,
  TEST_CASE_FORM_FIELDS,
} from "../constants/testCaseConstants";

function TestCaseFormModal({
  isOpen,
  onClose,
  onSave,
  nextId,
  selectedMenu,
}) {
  const [formData, setFormData] = useState(INITIAL_TEST_CASE_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_TEST_CASE_FORM);
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.checkItem.trim()) {
      setErrorMessage("점검항목을 입력해주세요.");
      return;
    }

    onSave(formData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="tc-modal-overlay" onClick={handleBackdropClick}>
      <div
        className="tc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tc-modal-title"
      >
        <div className="tc-modal-header">
          <div>
            <h2 id="tc-modal-title">테스트 케이스 추가</h2>
            <p>
              {selectedMenu} 메뉴에 새 테스트 케이스를 추가합니다.
            </p>
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
              <strong>{nextId}</strong>
            </div>
            <div className="tc-modal-readonly-field">
              <span>메뉴</span>
              <strong>{selectedMenu}</strong>
            </div>
          </div>

          <div className="tc-modal-form-grid">
            {TEST_CASE_FORM_FIELDS.map((field) => (
              <label
                key={field.name}
                className={
                  field.fullWidth
                    ? "tc-modal-field tc-modal-field-full"
                    : "tc-modal-field"
                }
              >
                <span>
                  {field.label}
                  {field.name === "checkItem" && (
                    <em className="tc-modal-required">*</em>
                  )}
                </span>
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
              <span>
                작동 여부<em className="tc-modal-required">*</em>
              </span>
              <select
                value={formData.isWorking ?? ""}
                onChange={(e) =>
                  handleChange("isWorking", e.target.value || null)
                }
              >
                <option value="">미지정</option>
                {IS_WORKING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {errorMessage && <p className="tc-modal-error">{errorMessage}</p>}

          <div className="tc-modal-actions">
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
        </form>
      </div>
    </div>
  );
}

export default TestCaseFormModal;

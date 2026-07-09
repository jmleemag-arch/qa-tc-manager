import { useEffect, useState } from "react";
import {
  EDITABLE_TEST_CASE_FIELDS,
  IS_WORKING_OPTIONS,
  TC_ASSIGNEE_OPTIONS,
  TC_STATUS_OPTIONS,
} from "../constants/testCaseConstants";
import { getEditableFormData } from "../utils/testCaseUtils";

function TestCaseEditModal({
  isOpen,
  testCase,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onRequestRetest,
}) {
  const [formData, setFormData] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (isOpen && testCase) {
      setFormData(getEditableFormData(testCase));
      setCommentText("");
    }
  }, [isOpen, testCase]);

  if (!isOpen || !testCase || !formData) {
    return null;
  }

  const displayId = testCase.displayId ?? testCase.id;
  const activityLogs = testCase.activityLogs ?? [];

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddComment = () => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      return;
    }

    onAddComment(testCase, trimmedComment);
    setCommentText("");
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

            <label className="tc-modal-field">
              <span>담당자</span>
              <select
                value={formData.assigneeId}
                onChange={(e) => handleChange("assigneeId", e.target.value)}
              >
                {TC_ASSIGNEE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="tc-modal-field">
              <span>TC 상태</span>
              <select
                value={formData.tcStatus}
                onChange={(e) => handleChange("tcStatus", e.target.value)}
              >
                {TC_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="tc-notice-workflow">
            <div className="tc-notice-workflow-header">
              <div>
                <h3>코멘트 / 기록</h3>
                <p>@이주미, @QA Manager 처럼 입력하면 멘션 알림이 생성됩니다.</p>
              </div>
              <button
                type="button"
                className="tc-modal-cancel-btn"
                onClick={() => onRequestRetest(testCase)}
              >
                재검증 요청
              </button>
            </div>

            <div className="tc-comment-input-row">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="@이주미 확인 부탁드립니다."
                rows={3}
              />
              <button
                type="button"
                className="tc-modal-save-btn"
                onClick={handleAddComment}
              >
                기록 추가
              </button>
            </div>

            {activityLogs.length > 0 ? (
              <ul className="tc-activity-log-list">
                {activityLogs.slice(0, 5).map((log) => (
                  <li key={log.id}>
                    <strong>{log.authorName}</strong>
                    <span>{log.text}</span>
                    <time>{new Date(log.createdAt).toLocaleString("ko-KR")}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="tc-activity-empty">등록된 기록이 없습니다.</p>
            )}
          </section>

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

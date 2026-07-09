import { useEffect, useState } from "react";
import {
  ISSUE_MENU_OPTIONS,
  ISSUE_PRIORITY_OPTIONS,
} from "../constants/defectConstants";
import issueApi from "../../../services/issueApi";

const EMPTY_FORM = {
  title: "",
  description: "",
  project: "",
  assignee: "",
  priority: "Normal",
  menu: "",
  registeredAt: new Date().toISOString().slice(0, 10),
};

function NewIssueCreateModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    issueApi
      .getConfig()
      .then((response) => {
        const config = response?.data ?? {};
        setMockMode(Boolean(config.mockMode));
        setForm({
          ...EMPTY_FORM,
          project: config.defaultProject ?? "",
          registeredAt: new Date().toISOString().slice(0, 10),
        });
        setErrorMessage("");
      })
      .catch(() => {
        setForm({
          ...EMPTY_FORM,
          registeredAt: new Date().toISOString().slice(0, 10),
        });
      });
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setErrorMessage("제목을 입력해주세요.");
      return;
    }

    if (!form.project.trim()) {
      setErrorMessage("프로젝트를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        project: form.project.trim(),
        assignee: form.assignee.trim(),
        priority: form.priority,
        menu: form.menu,
        registeredAt: form.registeredAt,
      });
      onClose();
    } catch {
      setErrorMessage("이슈 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="df-issue-modal-overlay" onClick={onClose}>
      <section
        className="df-issue-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="df-issue-modal-header">
          <div>
            <h3>신규 이슈 등록</h3>
            <p>
              QA Manager에 저장한 뒤 Redmine에 자동 등록합니다.
              {mockMode ? " (현재 Mock 모드)" : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form className="df-issue-modal-form" onSubmit={handleSubmit}>
          <label>
            <span>제목 *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Client 경고 설정 중 오류 발생"
            />
          </label>

          <label>
            <span>설명</span>
            <textarea
              value={form.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="이슈 상세 설명"
              rows={4}
            />
          </label>

          <div className="df-issue-modal-grid">
            <label>
              <span>프로젝트 *</span>
              <input
                type="text"
                value={form.project}
                onChange={(e) => handleFieldChange("project", e.target.value)}
              />
            </label>

            <label>
              <span>담당자</span>
              <input
                type="text"
                value={form.assignee}
                onChange={(e) => handleFieldChange("assignee", e.target.value)}
                placeholder="홍길동"
              />
            </label>

            <label>
              <span>우선순위</span>
              <select
                value={form.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
              >
                {ISSUE_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>메뉴/분류</span>
              <select
                value={form.menu}
                onChange={(e) => handleFieldChange("menu", e.target.value)}
              >
                <option value="">선택</option>
                {ISSUE_MENU_OPTIONS.map((menu) => (
                  <option key={menu} value={menu}>
                    {menu}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>등록일</span>
              <input
                type="date"
                value={form.registeredAt}
                onChange={(e) =>
                  handleFieldChange("registeredAt", e.target.value)
                }
              />
            </label>
          </div>

          {errorMessage ? <p className="df-issue-modal-error">{errorMessage}</p> : null}

          <div className="df-issue-modal-actions">
            <button type="button" className="df-issue-cancel-btn" onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className="df-issue-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default NewIssueCreateModal;

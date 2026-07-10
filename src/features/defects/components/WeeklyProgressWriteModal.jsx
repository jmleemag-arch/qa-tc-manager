import { useEffect, useState } from "react";
import { ISSUE_ROUND_STATUS } from "../constants/defectConstants";
import { calculateCompletionRate } from "../utils/weeklyProgressUtils";

const EMPTY_FORM = {
  total: "",
  inProgress: "",
  newCount: "",
};

function toNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function WeeklyProgressWriteModal({
  isOpen,
  round,
  readOnly = false,
  loginUser,
  onClose,
  onSave,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!round) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      total:
        round.total !== null && round.total !== undefined
          ? String(round.total)
          : "",
      inProgress:
        round.inProgress !== null && round.inProgress !== undefined
          ? String(round.inProgress)
          : "",
      newCount:
        round.newCount !== null && round.newCount !== undefined
          ? String(round.newCount)
          : "",
    });
    setErrorMessage("");
  }, [round]);

  if (!isOpen || !round) {
    return null;
  }

  const total = toNumber(form.total);
  const inProgress = toNumber(form.inProgress);
  const newCount = toNumber(form.newCount);
  const completionRate = calculateCompletionRate(total, newCount);

  const handleFieldChange = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrorMessage("");
  };

  const validateForm = (requireComplete = false) => {
    if ([form.total, form.inProgress, form.newCount].some((value) => value === "")) {
      return requireComplete
        ? "작성완료 처리하려면 이슈 수를 모두 입력해주세요."
        : "저장하려면 이슈 수를 모두 입력해주세요.";
    }

    if ([total, inProgress, newCount].some((value) => value < 0)) {
      return "이슈 수는 0 이상으로 입력해주세요.";
    }

    if (inProgress > total || newCount > total) {
      return "진행중/신규·진행 이슈 수는 전체 이슈 수보다 클 수 없습니다.";
    }

    return "";
  };

  const handleSave = async (markComplete = false) => {
    if (readOnly) {
      onClose?.();
      return;
    }

    const validationMessage = validateForm(markComplete);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    await onSave(
      {
        ...round,
        total,
        inProgress,
        newCount,
      },
      { markComplete }
    );
  };

  return (
    <div className="wp-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="wp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-progress-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wp-modal-header">
          <div>
            <h3 id="weekly-progress-modal-title">{round.roundLabel}</h3>
            <p>
              {round.period} · {round.versionName}
            </p>
          </div>
          <button type="button" className="wp-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="wp-modal-body">
          <div className="wp-modal-meta">
            <span className={`wp-status-badge ${
              round.displayStatus === "작성 완료"
                ? "completed"
                : round.displayStatus === "작성 중"
                  ? "in-progress"
                  : "not-started"
            }`}>
              {round.displayStatus}
            </span>
            <span>
              작성자: {round.author || loginUser || "-"} · 작성일:{" "}
              {round.writtenDate || "-"}
            </span>
          </div>

          <div className="wp-modal-form">
            <label>
              <span>전체 이슈 수</span>
              <input
                type="number"
                min="0"
                value={form.total}
                disabled={readOnly || isSubmitting}
                onChange={(event) => handleFieldChange("total", event.target.value)}
              />
            </label>
            <label>
              <span>진행중 이슈 수</span>
              <input
                type="number"
                min="0"
                value={form.inProgress}
                disabled={readOnly || isSubmitting}
                onChange={(event) =>
                  handleFieldChange("inProgress", event.target.value)
                }
              />
            </label>
            <label>
              <span>신규/진행 이슈 수</span>
              <input
                type="number"
                min="0"
                value={form.newCount}
                disabled={readOnly || isSubmitting}
                onChange={(event) =>
                  handleFieldChange("newCount", event.target.value)
                }
              />
            </label>
            <div className="wp-rate-preview">
              <span>완료율</span>
              <strong>{completionRate}%</strong>
            </div>
          </div>

          {errorMessage ? <p className="wp-modal-error">{errorMessage}</p> : null}
        </div>

        <div className="wp-modal-actions">
          <button type="button" className="wp-btn-secondary" onClick={onClose}>
            닫기
          </button>
          {!readOnly ? (
            <>
              <button
                type="button"
                className="wp-btn-outline"
                disabled={isSubmitting}
                onClick={() => handleSave(false)}
              >
                임시 저장
              </button>
              <button
                type="button"
                className="wp-btn-primary"
                disabled={isSubmitting}
                onClick={() => handleSave(true)}
              >
                작성완료
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default WeeklyProgressWriteModal;

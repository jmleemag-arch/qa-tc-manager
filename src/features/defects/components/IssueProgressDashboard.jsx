import { useEffect, useState } from "react";
import { DELETE_ISSUE_VERSION_CONFIRM } from "../constants/defectConstants";
import VersionYearVersionPicker from "./VersionYearVersionPicker";
import {
  getDefaultVersionForYear,
  getDefaultYearLabel,
  getVersionYearLabel,
} from "../utils/issueVersionUtils";

const EMPTY_WEEK_FORM = {
  dateValue: "",
  total: "",
  inProgress: "",
  newCount: "",
};

const EMPTY_VERSION_FORM = {
  version: "",
  startDate: "",
  endDate: "",
  description: "",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getWeekday(dateValue) {
  if (!dateValue) {
    return "";
  }

  return WEEKDAYS[new Date(`${dateValue}T00:00:00`).getDay()];
}

function formatDisplayDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  return `${dateValue.replaceAll("-", ".")}(${getWeekday(dateValue)})`;
}

function formatChartDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const [, month, day] = dateValue.split("-");

  return `${dateValue.slice(2, 4)}.${month}.${day}(${getWeekday(dateValue)})`;
}

function calculateCompletionRate(total, newCount) {
  if (!total || total <= 0) {
    return "-";
  }

  return `${(((total - newCount) / total) * 100).toFixed(2)}%`;
}

function getRateValue(total, newCount) {
  if (!total || total <= 0) {
    return 0;
  }

  return Number((((total - newCount) / total) * 100).toFixed(2));
}

function getSortedRows(rows = []) {
  return [...rows].sort((a, b) => a.dateValue.localeCompare(b.dateValue));
}

function getVersionSummary(version) {
  const rows = getSortedRows(version.rows);
  const latestRow = rows[rows.length - 1];
  const firstDate = rows[0]?.dateValue ?? version.startDate;
  const lastDate = rows[rows.length - 1]?.dateValue ?? version.endDate;
  const total = latestRow?.total ?? 0;
  const inProgress = latestRow?.inProgress ?? 0;
  const newCount = latestRow?.newCount ?? 0;
  const completionRate = latestRow
    ? calculateCompletionRate(latestRow.total, latestRow.newCount)
    : "-";
  const completionRateValue = latestRow
    ? getRateValue(latestRow.total, latestRow.newCount)
    : 0;

  return {
    rows,
    latestRow,
    period:
      firstDate && lastDate
        ? `${firstDate.replaceAll("-", ".")} ~ ${lastDate.replaceAll("-", ".")}`
        : "예정",
    total,
    inProgress,
    newCount,
    completionRate,
    completionRateValue,
    completedCount: Math.max(total - newCount, 0),
    lastUpdated: latestRow?.dateValue ?? "-",
  };
}

function IssueLineChart({ chart }) {
  const width = 420;
  const height = 180;
  const padding = { top: 18, right: 16, bottom: 34, left: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...chart.flatMap((item) => [item.total, item.inProgress, item.newCount]));

  if (chart.length === 0) {
    return (
      <svg className="tr-issue-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="이슈 진행 추이">
        <text x={width / 2} y={height / 2} textAnchor="middle">
          표시할 주차 데이터가 없습니다.
        </text>
      </svg>
    );
  }

  const getPoint = (item, index, key) => {
    const x = padding.left + (plotWidth / Math.max(chart.length - 1, 1)) * index;
    const y = padding.top + plotHeight - (item[key] / maxValue) * plotHeight;

    return `${x},${y}`;
  };

  const buildPolyline = (key) =>
    chart.map((item, index) => getPoint(item, index, key)).join(" ");

  const areaPoints = `${padding.left},${padding.top + plotHeight} ${buildPolyline("newCount")} ${padding.left + plotWidth},${padding.top + plotHeight}`;

  return (
    <svg className="tr-issue-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="이슈 진행 추이">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding.top + plotHeight * ratio;
        const label = Math.round(maxValue * (1 - ratio));

        return (
          <g key={ratio}>
            <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} />
            <text x={padding.left - 10} y={y + 4} textAnchor="end">
              {label}
            </text>
          </g>
        );
      })}

      <polygon className="tr-issue-chart-area" points={areaPoints} />
      <polyline className="tr-issue-chart-line tr-total-line" points={buildPolyline("total")} />
      <polyline className="tr-issue-chart-line tr-progress-line" points={buildPolyline("inProgress")} />
      <polyline className="tr-issue-chart-line tr-new-line" points={buildPolyline("newCount")} />

      {chart.map((item, index) => (
        <text
          key={item.label}
          className="tr-issue-chart-label"
          x={padding.left + (plotWidth / Math.max(chart.length - 1, 1)) * index}
          y={height - 10}
          textAnchor="middle"
        >
          {item.label}
        </text>
      ))}
    </svg>
  );
}

function VersionSummaryCards({ version }) {
  const summary = getVersionSummary(version);

  return (
    <div className="tr-version-detail-summary">
      <article>
        <span className="tr-version-summary-icon tr-version-summary-blue">▣</span>
        <div>
          <p>전체 이슈</p>
          <strong>{summary.total}건</strong>
        </div>
      </article>
      <article>
        <span className="tr-version-summary-icon tr-version-summary-sky">◉</span>
        <div>
          <p>진행 중</p>
          <strong>{summary.inProgress}건</strong>
        </div>
      </article>
      <article>
        <span className="tr-version-summary-icon tr-version-summary-purple">♺</span>
        <div>
          <p>신규/진행</p>
          <strong>{summary.newCount}건</strong>
        </div>
      </article>
      <article>
        <span className="tr-version-summary-icon tr-version-summary-green">↻</span>
        <div>
          <p>완료율</p>
          <strong>{summary.completionRate}</strong>
          <em>({summary.completedCount}건 완료)</em>
        </div>
      </article>
    </div>
  );
}

function IssueWeekInput({ item, allRows, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY_WEEK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const total = toNumber(form.total);
  const inProgress = toNumber(form.inProgress);
  const newCount = toNumber(form.newCount);
  const completionRate = calculateCompletionRate(total, newCount);
  const isEditing = Boolean(editingId);

  const handleFieldChange = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrorMessage("");
  };

  const handleReset = () => {
    setForm(EMPTY_WEEK_FORM);
    setEditingId(null);
    setErrorMessage("");
  };

  const validateForm = () => {
    const hasDuplicateDate = allRows.some(
      (row) => row.dateValue === form.dateValue && row.id !== editingId
    );

    if (!form.dateValue) {
      return "기준일을 선택해주세요.";
    }

    if ([form.total, form.inProgress, form.newCount].some((value) => value === "")) {
      return "이슈 수를 모두 입력해주세요.";
    }

    if ([total, inProgress, newCount].some((value) => value < 0)) {
      return "이슈 수는 0 이상으로 입력해주세요.";
    }

    if (inProgress > total || newCount > total) {
      return "진행중/신규·진행 이슈 수는 전체 이슈 수보다 클 수 없습니다.";
    }

    if (hasDuplicateDate) {
      return "이미 등록된 기준일입니다. 기존 주차를 수정해주세요.";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    onSave(item.version, {
      id: editingId ?? `${item.version}-${form.dateValue}`,
      dateValue: form.dateValue,
      total,
      inProgress,
      newCount,
    });
    handleReset();
  };

  const handleEditClick = (row) => {
    setForm({
      dateValue: row.dateValue,
      total: String(row.total),
      inProgress: String(row.inProgress),
      newCount: String(row.newCount),
    });
    setEditingId(row.id);
    setErrorMessage("");
  };

  const handleDeleteClick = (row) => {
    const confirmed = window.confirm(`${formatDisplayDate(row.dateValue)} 데이터를 삭제하시겠습니까?`);

    if (confirmed) {
      onDelete(item.version, row.id);
      if (editingId === row.id) {
        handleReset();
      }
    }
  };

  return (
    <div className="tr-week-editor">
      <form className="tr-week-form" onSubmit={handleSubmit}>
        <label>
          <span>기준일</span>
          <input
            type="date"
            value={form.dateValue}
            onChange={(e) => handleFieldChange("dateValue", e.target.value)}
          />
        </label>
        <label>
          <span>전체 이슈 수</span>
          <input
            type="number"
            min="0"
            value={form.total}
            onChange={(e) => handleFieldChange("total", e.target.value)}
          />
        </label>
        <label>
          <span>진행중 이슈 수</span>
          <input
            type="number"
            min="0"
            value={form.inProgress}
            onChange={(e) => handleFieldChange("inProgress", e.target.value)}
          />
        </label>
        <label>
          <span>신규/진행 이슈 수</span>
          <input
            type="number"
            min="0"
            value={form.newCount}
            onChange={(e) => handleFieldChange("newCount", e.target.value)}
          />
        </label>
        <div className="tr-week-rate-preview">
          <span>완료율</span>
          <strong>{completionRate}</strong>
        </div>
        <div className="tr-week-form-actions">
          <button type="submit" className="tr-week-save-btn">
            {isEditing ? "수정 저장" : "저장"}
          </button>
          {isEditing ? (
            <button type="button" className="tr-week-cancel-btn" onClick={handleReset}>
              취소
            </button>
          ) : null}
        </div>
      </form>
      {errorMessage ? <p className="tr-week-error">{errorMessage}</p> : null}

      <div className="tr-week-manage-table-scroll">
        <table className="tr-week-manage-table">
          <thead>
            <tr>
              <th>기준일</th>
              <th>전체</th>
              <th>진행중</th>
              <th>신규/진행</th>
              <th>완료율</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {allRows.length > 0 ? (
              allRows.map((row) => (
                <tr key={row.id} className={editingId === row.id ? "is-editing" : ""}>
                  <td>{formatDisplayDate(row.dateValue)}</td>
                  <td>{row.total}</td>
                  <td>{row.inProgress}</td>
                  <td>{row.newCount}</td>
                  <td>{calculateCompletionRate(row.total, row.newCount)}</td>
                  <td>
                    <button type="button" onClick={() => handleEditClick(row)}>
                      수정
                    </button>
                    <button type="button" className="tr-week-delete-btn" onClick={() => handleDeleteClick(row)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="tr-empty-message">
                  등록된 주차 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IssueProgressVersion({
  item,
  allRows,
  onSave,
  onDelete,
}) {
  const chartRows = item.rows.map((row) => ({
    label: formatChartDate(row.dateValue),
    total: row.total,
    inProgress: row.inProgress,
    newCount: row.newCount,
  }));

  return (
    <article className="tr-version-detail-panel">
      <div className="tr-version-detail-header">
        <h3>{item.version} 이슈 진행 상황</h3>
      </div>

      <VersionSummaryCards version={{ ...item, rows: allRows }} />

      <div className="tr-issue-version">
        <div className="tr-issue-table-box">
          <h4>주차별 진행 현황</h4>
          <table className="tr-issue-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>전체</th>
                <th>진행 중</th>
                <th>신규,진행</th>
                <th>완료율</th>
              </tr>
            </thead>
            <tbody>
              {item.rows.length > 0 ? (
                item.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDisplayDate(row.dateValue)}</td>
                    <td>{row.total}</td>
                    <td>{row.inProgress}</td>
                    <td>{row.newCount}</td>
                    <td>{calculateCompletionRate(row.total, row.newCount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="tr-empty-message">
                    선택한 기간에 표시할 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button type="button" className="tr-link-btn">더보기⌄</button>
        </div>

        <div className="tr-issue-chart-box">
          <div className="tr-issue-chart-title">
            <h4>진행 추이</h4>
            <div className="tr-issue-legend">
              <span><i className="tr-dot-total" />전체</span>
              <span><i className="tr-dot-progress" />진행 중</span>
              <span><i className="tr-dot-new" />신규,진행</span>
            </div>
          </div>
          <IssueLineChart chart={chartRows} />
        </div>
      </div>

      <IssueWeekInput item={item} allRows={allRows} onSave={onSave} onDelete={onDelete} />
    </article>
  );
}

function AddVersionModal({ isOpen, versions, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_VERSION_FORM);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleClose = () => {
    setForm(EMPTY_VERSION_FORM);
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedVersion = form.version.trim();

    if (!trimmedVersion) {
      setErrorMessage("버전명을 입력해주세요.");
      return;
    }

    if (versions.some((version) => version.version === trimmedVersion)) {
      setErrorMessage("이미 등록된 버전입니다.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setErrorMessage("기간을 선택해주세요.");
      return;
    }

    if (form.startDate > form.endDate) {
      setErrorMessage("종료일은 시작일 이후여야 합니다.");
      return;
    }

    onCreate({
      version: trimmedVersion,
      registeredAt: form.startDate.replaceAll("-", "."),
      status: form.startDate > new Date().toISOString().slice(0, 10) ? "예정" : "진행 중",
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      rows: [],
    });
    handleClose();
  };

  return (
    <div className="tr-version-modal-overlay">
      <section className="tr-version-modal">
        <div className="tr-version-modal-header">
          <h3>새 버전 추가</h3>
          <button type="button" onClick={handleClose} aria-label="닫기">×</button>
        </div>
        <form className="tr-version-modal-form" onSubmit={handleSubmit}>
          <label>
            <span>버전명 <em>*</em></span>
            <input
              type="text"
              value={form.version}
              onChange={(e) => handleFieldChange("version", e.target.value)}
              placeholder="26.3.0"
            />
          </label>
          <div className="tr-version-modal-date-row">
            <label>
              <span>시작일</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleFieldChange("startDate", e.target.value)}
              />
            </label>
            <span>~</span>
            <label>
              <span>종료일</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => handleFieldChange("endDate", e.target.value)}
              />
            </label>
          </div>
          <label>
            <span>설명</span>
            <textarea
              value={form.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="설명을 입력하세요."
            />
          </label>
          {errorMessage ? <p className="tr-week-error">{errorMessage}</p> : null}
          <div className="tr-version-modal-actions">
            <button type="button" className="tr-week-cancel-btn" onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="tr-week-save-btn">
              저장
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MenuIssueDistribution({ items }) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="tr-issue-card">
      <div className="tr-section-header">
        <h3>메뉴별 이슈 분포 (전체)</h3>
        <button type="button" className="tr-small-view-btn">전체 보기</button>
      </div>
      <ul className="tr-menu-bars">
        {items.map((item) => (
          <li key={item.menu}>
            <span>{item.menu}</span>
            <div className="tr-menu-bar-track">
              <div style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
            <strong>{item.count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentIssues({ issues }) {
  return (
    <section className="tr-issue-card">
      <div className="tr-section-header">
        <h3>최근 등록된 이슈</h3>
        <button type="button" className="tr-small-view-btn">전체 보기</button>
      </div>
      <ul className="tr-recent-issue-list">
        {issues.map((issue) => (
          <li key={issue.id}>
            <div>
              <strong>{issue.id}</strong>
              <span>{issue.title}</span>
            </div>
            <em className={`tr-result-pill tr-result-${issue.result.toLowerCase()}`}>{issue.result}</em>
            <time>{issue.date}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}

function IssueSeverityChart({ distribution }) {
  const gradient = distribution.segments
    .reduce(
      (acc, segment) => {
        const nextPercent = acc.currentPercent + segment.percent;

        return {
          currentPercent: nextPercent,
          parts: [
            ...acc.parts,
            `${segment.color} ${acc.currentPercent}% ${nextPercent}%`,
          ],
        };
      },
      { currentPercent: 0, parts: [] }
    )
    .parts
    .join(", ");

  return (
    <section className="tr-issue-card">
      <div className="tr-section-header">
        <h3>이슈 심각도 분포</h3>
        <button type="button" className="tr-small-view-btn">전체 보기</button>
      </div>
      <div className="tr-severity-layout">
        <div className="tr-donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="tr-donut-hole">
            <strong>{distribution.total}</strong>
            <span>전체 결함</span>
          </div>
        </div>
        <ul className="tr-chart-legend">
          {distribution.segments.map((segment) => (
            <li key={segment.key} className="tr-legend-item">
              <span className="tr-legend-dot" style={{ backgroundColor: segment.color }} />
              <span className="tr-legend-label">{segment.label}</span>
              <strong className="tr-legend-count">
                {segment.count}건 ({segment.percent}%)
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function IssueProgressDashboard({
  versions,
  allVersions,
  menuDistribution,
  recentIssues,
  severityDistribution,
  onSaveIssueWeek,
  onDeleteIssueWeek,
  onCreateIssueVersion,
  onDeleteIssueVersion,
  focusedVersionName,
  onFocusedVersionHandled,
}) {
  const [selectedYear, setSelectedYear] = useState(() =>
    getDefaultYearLabel(allVersions)
  );
  const [selectedVersionName, setSelectedVersionName] = useState(
    () => getDefaultVersionForYear(allVersions, getDefaultYearLabel(allVersions))
  );
  const [isAddVersionOpen, setIsAddVersionOpen] = useState(false);
  const selectedVersion =
    versions.find((version) => version.version === selectedVersionName) ??
    versions[0];
  const selectedAllVersion =
    allVersions.find((version) => version.version === selectedVersion?.version) ??
    selectedVersion;

  useEffect(() => {
    if (!focusedVersionName) {
      return;
    }

    setSelectedYear(getVersionYearLabel(focusedVersionName));
    setSelectedVersionName(focusedVersionName);
    onFocusedVersionHandled?.();
  }, [focusedVersionName, onFocusedVersionHandled]);

  useEffect(() => {
    if (
      selectedVersionName &&
      allVersions.some((version) => version.version === selectedVersionName)
    ) {
      return;
    }

    const nextVersion = getDefaultVersionForYear(allVersions, selectedYear);

    if (nextVersion) {
      setSelectedVersionName(nextVersion);
      return;
    }

    const defaultYear = getDefaultYearLabel(allVersions);

    if (defaultYear) {
      setSelectedYear(defaultYear);
      setSelectedVersionName(getDefaultVersionForYear(allVersions, defaultYear));
      return;
    }

    setSelectedVersionName("");
  }, [allVersions, selectedVersionName, selectedYear]);

  const handleDeleteVersionClick = () => {
    if (!selectedVersionName) {
      return;
    }

    const confirmed = window.confirm(
      `${selectedVersionName} ${DELETE_ISSUE_VERSION_CONFIRM}`
    );

    if (confirmed) {
      onDeleteIssueVersion?.(selectedVersionName);
    }
  };

  return (
    <div className="tr-issue-dashboard">
      <div className="tr-issue-main-grid">
        <section className="tr-issue-card tr-progress-overview-card">
          <div className="tr-section-header tr-version-section-header">
            <div>
              <h3>이슈 진행 상황</h3>
              <p>년도를 선택한 뒤 버전을 조회해 진행 현황을 확인합니다.</p>
            </div>
            <button
              type="button"
              className="tr-version-add-btn"
              onClick={() => setIsAddVersionOpen(true)}
            >
              + 새 버전 추가
            </button>
          </div>
          <div className="tr-version-list-header">
            <h4>버전 조회</h4>
            {selectedVersionName ? (
              <button
                type="button"
                className="tr-version-danger-btn"
                onClick={handleDeleteVersionClick}
              >
                버전 삭제
              </button>
            ) : null}
          </div>
          <VersionYearVersionPicker
            versions={allVersions}
            selectedYear={selectedYear}
            selectedVersion={selectedVersionName}
            onYearChange={setSelectedYear}
            onVersionChange={setSelectedVersionName}
          />

          {selectedVersion ? (
            <IssueProgressVersion
              item={selectedVersion}
              allRows={selectedAllVersion.rows ?? []}
              onSave={onSaveIssueWeek}
              onDelete={onDeleteIssueWeek}
            />
          ) : null}
        </section>
      </div>

      <div className="tr-issue-bottom-grid">
        <MenuIssueDistribution items={menuDistribution} />
        <RecentIssues issues={recentIssues} />
        <IssueSeverityChart distribution={severityDistribution} />
      </div>
      <AddVersionModal
        isOpen={isAddVersionOpen}
        versions={allVersions}
        onClose={() => setIsAddVersionOpen(false)}
        onCreate={onCreateIssueVersion}
      />
    </div>
  );
}

export default IssueProgressDashboard;

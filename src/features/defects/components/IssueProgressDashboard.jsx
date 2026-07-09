import { useEffect, useMemo, useState } from "react";
import {
  DELETE_ISSUE_VERSION_CONFIRM,
  ISSUE_ROUND_STATUS_TONE,
} from "../constants/defectConstants";
import VersionYearVersionPicker from "./VersionYearVersionPicker";
import {
  filterRoundsByYear,
  getChartRounds,
  getLatestWrittenRound,
  groupRoundsByYearMonth,
} from "../utils/issueRoundUtils";
import {
  getDefaultVersionForYear,
  getDefaultYearLabel,
  getVersionYearLabel,
} from "../utils/issueVersionUtils";

const EMPTY_ROUND_FORM = {
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

function toNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
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

function getVersionSummary(version, rounds = []) {
  const latestRow = getLatestWrittenRound(rounds);
  const sortedRounds = [...rounds].sort((left, right) =>
    left.thursdayDate.localeCompare(right.thursdayDate)
  );
  const firstRound = sortedRounds[0];
  const lastRound = sortedRounds[sortedRounds.length - 1];
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
    latestRow,
    period:
      firstRound && lastRound
        ? `${firstRound.roundLabel} ~ ${lastRound.roundLabel}`
        : "예정",
    total,
    inProgress,
    newCount,
    completionRate,
    completionRateValue,
    completedCount: Math.max(total - newCount, 0),
    lastUpdated: latestRow?.roundLabel ?? "-",
  };
}

function RoundStatusBadge({ status }) {
  const tone = ISSUE_ROUND_STATUS_TONE[status] ?? "waiting";

  return (
    <span className={`tr-round-status-badge tr-round-status-${tone}`}>
      {status}
    </span>
  );
}

function IssueLineChart({ chart }) {
  const width = 420;
  const height = 180;
  const padding = { top: 18, right: 16, bottom: 34, left: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(
    1,
    ...chart.flatMap((item) => [item.total, item.inProgress, item.newCount])
  );

  if (chart.length === 0) {
    return (
      <svg
        className="tr-issue-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="이슈 진행 추이"
      >
        <text x={width / 2} y={height / 2} textAnchor="middle">
          작성 완료된 회차가 없습니다.
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
    <svg
      className="tr-issue-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="이슈 진행 추이"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding.top + plotHeight * ratio;
        const label = Math.round(maxValue * (1 - ratio));

        return (
          <g key={ratio}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + plotWidth}
              y2={y}
            />
            <text x={padding.left - 10} y={y + 4} textAnchor="end">
              {label}
            </text>
          </g>
        );
      })}

      <polygon className="tr-issue-chart-area" points={areaPoints} />
      <polyline
        className="tr-issue-chart-line tr-total-line"
        points={buildPolyline("total")}
      />
      <polyline
        className="tr-issue-chart-line tr-progress-line"
        points={buildPolyline("inProgress")}
      />
      <polyline
        className="tr-issue-chart-line tr-new-line"
        points={buildPolyline("newCount")}
      />

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

function VersionSummaryCards({ version, rounds }) {
  const summary = getVersionSummary(version, rounds);

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

function IssueRoundSidebar({ rounds, selectedRoundId, onSelect }) {
  const grouped = groupRoundsByYearMonth(rounds);
  const years = Object.keys(grouped).sort((left, right) => Number(right) - Number(left));

  if (years.length === 0) {
    return (
      <aside className="tr-round-sidebar">
        <p className="tr-empty-message">생성된 주차 회차가 없습니다.</p>
      </aside>
    );
  }

  return (
    <aside className="tr-round-sidebar">
      {years.map((year) => (
        <section key={year} className="tr-round-year-group">
          <h4>{year}년</h4>
          {Object.keys(grouped[year])
            .sort((left, right) => Number(right) - Number(left))
            .map((month) => (
              <ul key={`${year}-${month}`} className="tr-round-month-list">
                {grouped[year][month].map((round) => (
                  <li key={round.id}>
                    <button
                      type="button"
                      className={
                        selectedRoundId === round.id ? "tr-round-item active" : "tr-round-item"
                      }
                      onClick={() => onSelect(round)}
                    >
                      <span>{round.roundLabel}</span>
                      <RoundStatusBadge status={round.status} />
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </section>
      ))}
    </aside>
  );
}

function IssueRoundEditor({ round, onSave }) {
  const [form, setForm] = useState(EMPTY_ROUND_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!round) {
      setForm(EMPTY_ROUND_FORM);
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

  if (!round) {
    return (
      <div className="tr-round-editor tr-round-editor-empty">
        <p className="tr-empty-message">작성할 주차 회차를 선택해주세요.</p>
      </div>
    );
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

  const handleSave = (markComplete = false) => {
    const validationMessage = validateForm(markComplete);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    onSave(
      {
        ...round,
        total,
        inProgress,
        newCount,
      },
      { markComplete }
    );
    setErrorMessage("");
  };

  return (
    <div className="tr-round-editor">
      <div className="tr-round-editor-header">
        <div>
          <h4>{round.roundLabel}</h4>
          <p>목요일 기준 회차 · {round.thursdayDate.replaceAll("-", ".")}</p>
        </div>
        <RoundStatusBadge status={round.status} />
      </div>

      <div className="tr-round-form">
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
      </div>

      {errorMessage ? <p className="tr-week-error">{errorMessage}</p> : null}

      <div className="tr-round-form-actions">
        <button
          type="button"
          className="tr-week-save-btn"
          onClick={() => handleSave(false)}
        >
          임시 저장
        </button>
        <button
          type="button"
          className="tr-round-complete-btn"
          onClick={() => handleSave(true)}
        >
          작성완료
        </button>
      </div>
    </div>
  );
}

function IssueProgressVersion({ item, rounds, onSave }) {
  const [selectedRound, setSelectedRound] = useState(null);
  const chartRows = getChartRounds(rounds).map((round) => ({
    label: round.roundLabel,
    total: round.total ?? 0,
    inProgress: round.inProgress ?? 0,
    newCount: round.newCount ?? 0,
  }));

  useEffect(() => {
    if (rounds.length === 0) {
      setSelectedRound(null);
      return;
    }

    if (!selectedRound || !rounds.some((round) => round.id === selectedRound.id)) {
      setSelectedRound(rounds[0]);
    }
  }, [rounds, selectedRound]);

  return (
    <article className="tr-version-detail-panel">
      <div className="tr-version-detail-header">
        <h3>{item.version} 결함 현황</h3>
        <p>시스템이 생성한 목요일 기준 주차 회차에 내용을 입력합니다.</p>
      </div>

      <VersionSummaryCards version={item} rounds={rounds} />

      <div className="tr-round-layout">
        <IssueRoundSidebar
          rounds={rounds}
          selectedRoundId={selectedRound?.id}
          onSelect={setSelectedRound}
        />
        <IssueRoundEditor round={selectedRound} onSave={onSave} />
      </div>

      <div className="tr-issue-version">
        <div className="tr-issue-table-box">
          <h4>주차별 진행 현황</h4>
          <table className="tr-issue-table">
            <thead>
              <tr>
                <th>회차</th>
                <th>목요일</th>
                <th>전체</th>
                <th>진행 중</th>
                <th>신규/진행</th>
                <th>완료율</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {rounds.length > 0 ? (
                rounds.map((round) => (
                  <tr
                    key={round.id}
                    className={selectedRound?.id === round.id ? "is-selected" : ""}
                    onClick={() => setSelectedRound(round)}
                  >
                    <td>{round.roundLabel}</td>
                    <td>{round.thursdayDate.replaceAll("-", ".")}</td>
                    <td>{round.total ?? "-"}</td>
                    <td>{round.inProgress ?? "-"}</td>
                    <td>{round.newCount ?? "-"}</td>
                    <td>
                      {round.total !== null && round.newCount !== null
                        ? calculateCompletionRate(round.total, round.newCount)
                        : "-"}
                    </td>
                    <td>
                      <RoundStatusBadge status={round.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="tr-empty-message">
                    선택한 연도에 표시할 주차 회차가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="tr-issue-chart-box">
          <div className="tr-issue-chart-title">
            <h4>진행 추이</h4>
            <div className="tr-issue-legend">
              <span>
                <i className="tr-dot-total" />
                전체
              </span>
              <span>
                <i className="tr-dot-progress" />
                진행 중
              </span>
              <span>
                <i className="tr-dot-new" />
                신규/진행
              </span>
            </div>
          </div>
          <IssueLineChart chart={chartRows} />
        </div>
      </div>
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

  const handleSubmit = async (e) => {
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

    try {
      await onCreate({
        version: trimmedVersion,
        registeredAt: form.startDate.replaceAll("-", "."),
        status:
          form.startDate > new Date().toISOString().slice(0, 10)
            ? "예정"
            : "진행 중",
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description.trim(),
        rows: [],
      });
      handleClose();
    } catch {
      setErrorMessage("버전을 저장하지 못했습니다. API 서버 상태를 확인해주세요.");
    }
  };

  return (
    <div className="tr-version-modal-overlay">
      <section className="tr-version-modal">
        <div className="tr-version-modal-header">
          <h3>새 버전 추가</h3>
          <button type="button" onClick={handleClose} aria-label="닫기">
            ×
          </button>
        </div>
        <form className="tr-version-modal-form" onSubmit={handleSubmit}>
          <label>
            <span>
              버전명 <em>*</em>
            </span>
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
        <button type="button" className="tr-small-view-btn">
          전체 보기
        </button>
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
        <button type="button" className="tr-small-view-btn">
          전체 보기
        </button>
      </div>
      <ul className="tr-recent-issue-list">
        {issues.map((issue) => (
          <li key={issue.id}>
            <div>
              <strong>{issue.id}</strong>
              <span>{issue.title}</span>
            </div>
            <em className={`tr-result-pill tr-result-${issue.result.toLowerCase()}`}>
              {issue.result}
            </em>
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
    .parts.join(", ");

  return (
    <section className="tr-issue-card">
      <div className="tr-section-header">
        <h3>이슈 심각도 분포</h3>
        <button type="button" className="tr-small-view-btn">
          전체 보기
        </button>
      </div>
      <div className="tr-severity-layout">
        <div
          className="tr-donut"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="tr-donut-hole">
            <strong>{distribution.total}</strong>
            <span>전체 결함</span>
          </div>
        </div>
        <ul className="tr-chart-legend">
          {distribution.segments.map((segment) => (
            <li key={segment.key} className="tr-legend-item">
              <span
                className="tr-legend-dot"
                style={{ backgroundColor: segment.color }}
              />
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
  menuDistribution,
  recentIssues,
  severityDistribution,
  onSaveIssueRound,
  onCreateIssueVersion,
  onDeleteIssueVersion,
  focusedVersionName,
  onFocusedVersionHandled,
}) {
  const [selectedYear, setSelectedYear] = useState(() =>
    getDefaultYearLabel(versions)
  );
  const [selectedVersionName, setSelectedVersionName] = useState(() =>
    getDefaultVersionForYear(versions, getDefaultYearLabel(versions))
  );
  const [isAddVersionOpen, setIsAddVersionOpen] = useState(false);
  const selectedVersion =
    versions.find((version) => version.version === selectedVersionName) ??
    versions[0];
  const yearRounds = useMemo(
    () => filterRoundsByYear(selectedVersion?.rows ?? [], selectedYear),
    [selectedVersion, selectedYear]
  );

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
      versions.some((version) => version.version === selectedVersionName)
    ) {
      return;
    }

    const nextVersion = getDefaultVersionForYear(versions, selectedYear);

    if (nextVersion) {
      setSelectedVersionName(nextVersion);
      return;
    }

    const defaultYear = getDefaultYearLabel(versions);

    if (defaultYear) {
      setSelectedYear(defaultYear);
      setSelectedVersionName(getDefaultVersionForYear(versions, defaultYear));
      return;
    }

    setSelectedVersionName("");
  }, [versions, selectedVersionName, selectedYear]);

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
              <h3>결함 현황</h3>
              <p>
                매주 목요일 기준 주차 회차가 자동 생성됩니다. 회차를 선택해
                내용을 입력하세요.
              </p>
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
            versions={versions}
            selectedYear={selectedYear}
            selectedVersion={selectedVersionName}
            onYearChange={setSelectedYear}
            onVersionChange={setSelectedVersionName}
          />

          {selectedVersion ? (
            <IssueProgressVersion
              item={selectedVersion}
              rounds={yearRounds}
              onSave={onSaveIssueRound}
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
        versions={versions}
        onClose={() => setIsAddVersionOpen(false)}
        onCreate={onCreateIssueVersion}
      />
    </div>
  );
}

export default IssueProgressDashboard;

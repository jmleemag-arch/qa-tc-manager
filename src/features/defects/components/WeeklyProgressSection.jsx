import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import issueProgressApi from "../../../services/issueProgressApi";
import { useVersions } from "../../../hooks/useVersions";
import {
  ISSUE_ROUND_STATUS,
  WEEKLY_PAGE_SIZE_OPTIONS,
  WEEKLY_STATUS_FILTER_ALL,
  WEEKLY_STATUS_FILTER_OPTIONS,
} from "../constants/defectConstants";
import {
  getFractionTone,
  getProgressTone,
  toDbStatusFilter,
} from "../utils/weeklyProgressUtils";
import WeeklyProgressWriteModal from "./WeeklyProgressWriteModal";

const DEFAULT_PAGE_SIZE = 10;

function WeeklyStatusBadge({ status }) {
  const tone =
    status === "작성 완료"
      ? "completed"
      : status === "작성 중"
        ? "in-progress"
        : "not-started";

  return <span className={`wp-status-badge ${tone}`}>{status}</span>;
}

function WeeklyProgressSection({
  loginUser,
  routeParams = {},
  onRouteChange,
}) {
  const { issueVersions } = useVersions();
  const [rounds, setRounds] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [yearFilter, setYearFilter] = useState(
    String(new Date().getFullYear())
  );
  const [statusFilter, setStatusFilter] = useState(WEEKLY_STATUS_FILTER_ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  });
  const [expandedRoundId, setExpandedRoundId] = useState(null);
  const [activeRound, setActiveRound] = useState(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  const effectiveVersionId = useMemo(() => {
    if (routeParams.versionId) {
      return routeParams.versionId;
    }

    const activeVersion = issueVersions.find((version) =>
      String(version.status ?? "").includes("진행")
    );

    return activeVersion?.id ?? issueVersions[0]?.id ?? "";
  }, [issueVersions, routeParams.versionId]);

  const fetchRounds = useCallback(async () => {
    setLoading(true);

    try {
      const response = await issueProgressApi.listRounds({
        versionId: effectiveVersionId,
        year: yearFilter,
        status: toDbStatusFilter(statusFilter),
        startDate,
        endDate,
        search: searchText,
        page,
        pageSize,
      });
      const data = response.data ?? {};

      setRounds(data.items ?? []);
      setYears(data.years ?? []);
      setPagination({
        total: data.total ?? 0,
        page: data.page ?? page,
        pageSize: data.pageSize ?? pageSize,
        totalPages: data.totalPages ?? 1,
      });
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setRounds([]);
    } finally {
      setLoading(false);
    }
  }, [
    endDate,
    page,
    pageSize,
    routeParams.versionId,
    effectiveVersionId,
    searchText,
    startDate,
    statusFilter,
    yearFilter,
  ]);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  useEffect(() => {
    setPage(1);
  }, [yearFilter, statusFilter, startDate, endDate, searchText, pageSize]);

  useEffect(() => {
    if (!routeParams.roundId || rounds.length === 0) {
      return;
    }

    const matchedRound = rounds.find(
      (round) => String(round.dbId) === String(routeParams.roundId)
    );

    if (matchedRound) {
      setActiveRound(matchedRound);
      setModalReadOnly(matchedRound.status === ISSUE_ROUND_STATUS.COMPLETED);
      onRouteChange?.({ roundId: null }, { replace: true });
    }
  }, [onRouteChange, routeParams.roundId, rounds]);

  const yearOptions = useMemo(() => {
    const merged = new Set([
      new Date().getFullYear(),
      ...years.map((year) => Number(year)),
    ]);

    return [...merged].sort((left, right) => right - left);
  }, [years]);

  const pageNumbers = useMemo(() => {
    const numbers = [];

    for (let index = 1; index <= pagination.totalPages; index += 1) {
      numbers.push(index);
    }

    return numbers;
  }, [pagination.totalPages]);

  const handleResetFilters = () => {
    setYearFilter(String(new Date().getFullYear()));
    setStatusFilter(WEEKLY_STATUS_FILTER_ALL);
    setStartDate("");
    setEndDate("");
    setSearchText("");
    setPage(1);
  };

  const openRoundModal = (round, readOnly) => {
    setActiveRound(round);
    setModalReadOnly(readOnly);
  };

  const handleSaveRound = async (roundData, options = {}) => {
    setIsSaving(true);

    try {
      await issueProgressApi.update(roundData.dbId, {
        total: roundData.total,
        inProgress: roundData.inProgress,
        newCount: roundData.newCount,
        status: options.markComplete ? ISSUE_ROUND_STATUS.COMPLETED : roundData.status,
        createdBy: loginUser,
      });
      setActiveRound(null);
      await fetchRounds();
    } catch (saveError) {
      console.error(saveError);
      window.alert("주차별 진행 현황을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="wp-page">
      <div className="wp-page-header">
        <div>
          <p className="df-breadcrumb">홈 &gt; 결함 관리 &gt; 주차별 진행 현황</p>
          <h2>주차별 진행 현황</h2>
          <p className="df-page-description">
            목요일 기준 주차 회차별 결함 진행 현황을 작성하고 조회합니다.
          </p>
        </div>
      </div>

      <div className="wp-filter-bar">
        <label>
          <span>연도</span>
          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>상태</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {WEEKLY_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="wp-period-field">
          <span>기간</span>
          <div className="wp-period-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <span>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </label>

        <label className="wp-search-field">
          <span>주차명 검색</span>
          <div className="wp-search-input">
            <input
              type="search"
              value={searchText}
              placeholder="주차명 검색"
              onChange={(event) => setSearchText(event.target.value)}
            />
            <span aria-hidden="true">⌕</span>
          </div>
        </label>

        <button type="button" className="wp-reset-btn" onClick={handleResetFilters}>
          ↺ 초기화
        </button>
      </div>

      <div className="wp-table-card">
        {loading ? (
          <p className="df-page-description">주차별 진행 현황을 불러오는 중입니다...</p>
        ) : error ? (
          <p className="df-page-description">
            주차별 진행 현황을 불러오지 못했습니다.
          </p>
        ) : (
          <>
            <div className="wp-table-scroll">
              <table className="wp-table">
                <thead>
                  <tr>
                    <th aria-label="펼치기" />
                    <th>주차명</th>
                    <th>기간</th>
                    <th>상태</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>신규/진행</th>
                    <th>완료율</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="wp-empty-cell">
                        조건에 맞는 주차별 진행 현황이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    rounds.map((round) => {
                      const fractionTone = getFractionTone(round.status);
                      const progressTone = getProgressTone(
                        round.completionPercent,
                        round.status
                      );
                      const isExpanded = expandedRoundId === round.dbId;
                      const isCompleted =
                        round.status === ISSUE_ROUND_STATUS.COMPLETED;

                      return (
                        <Fragment key={round.dbId}>
                          <tr>
                            <td>
                              <button
                                type="button"
                                className={`wp-expand-btn ${isExpanded ? "expanded" : ""}`}
                                aria-label="상세 펼치기"
                                onClick={() =>
                                  setExpandedRoundId((prev) =>
                                    prev === round.dbId ? null : round.dbId
                                  )
                                }
                              >
                                ›
                              </button>
                            </td>
                            <td>{round.roundLabel}</td>
                            <td>{round.period}</td>
                            <td>
                              <WeeklyStatusBadge status={round.displayStatus} />
                            </td>
                            <td>{round.author || "-"}</td>
                            <td>{round.writtenDate || "-"}</td>
                            <td>
                              {round.progressLabel === "-" ? (
                                "-"
                              ) : (
                                <span className={`wp-fraction ${fractionTone}`}>
                                  {round.progressLabel}
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="wp-progress-cell">
                                <div className="wp-progress-track">
                                  <span
                                    className={`wp-progress-fill ${progressTone}`}
                                    style={{
                                      width: `${round.completionPercent}%`,
                                    }}
                                  />
                                </div>
                                <em>{round.completionPercent}%</em>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={
                                  isCompleted ? "wp-action-view" : "wp-action-write"
                                }
                                onClick={() => openRoundModal(round, isCompleted)}
                              >
                                {isCompleted ? "보기" : "작성하기"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded ? (
                            <tr className="wp-detail-row">
                              <td colSpan="9">
                                <div className="wp-detail-panel">
                                  <span>버전: {round.versionName}</span>
                                  <span>목요일 기준일: {round.thursdayDate}</span>
                                  <span>
                                    전체 {round.total ?? "-"} · 진행중{" "}
                                    {round.inProgress ?? "-"} · 신규/진행{" "}
                                    {round.newCount ?? "-"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="df-pagination-bar">
              <div className="df-pagination">
                <button
                  type="button"
                  className="df-page-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  aria-label="이전 페이지"
                >
                  ‹
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={
                      pageNumber === pagination.page
                        ? "df-page-btn active"
                        : "df-page-btn"
                    }
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  className="df-page-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                  aria-label="다음 페이지"
                >
                  ›
                </button>
              </div>

              <label className="df-page-size-select">
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  {WEEKLY_PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / 페이지
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
      </div>

      <WeeklyProgressWriteModal
        isOpen={Boolean(activeRound)}
        round={activeRound}
        readOnly={modalReadOnly}
        loginUser={loginUser}
        isSubmitting={isSaving}
        onClose={() => setActiveRound(null)}
        onSave={handleSaveRound}
      />
    </section>
  );
}

export default WeeklyProgressSection;

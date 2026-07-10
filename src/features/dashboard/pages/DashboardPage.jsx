import MainLayout from "../../../components/layout/MainLayout";
import { MENU_IDS } from "../../../constants/appConstants";
import { useDashboard } from "../../../hooks/useDashboard";
import { navigateToMenu } from "../../../utils/appNavigation";
import { useEffect } from "react";

const DEFECT_STATUS_QUERY = {
  new: "NEW",
  inProgress: "IN_PROGRESS",
  resolved: "RESOLVED",
  retest: "RETEST",
  closed: "CLOSED",
};

function StatusBadge({ children, tone = "gray" }) {
  return <span className={`db-work-badge db-work-badge-${tone}`}>{children}</span>;
}

function SectionState({ loading, error, empty, emptyText, onRetry }) {
  if (loading) {
    return <p className="db-empty-state">데이터를 불러오는 중입니다.</p>;
  }

  if (error) {
    return (
      <div className="db-empty-state">
        <p>데이터를 불러오지 못했습니다.</p>
        <button type="button" onClick={onRetry}>
          다시 시도
        </button>
      </div>
    );
  }

  if (empty) {
    return <p className="db-empty-state">{emptyText}</p>;
  }

  return null;
}

function DashboardPage({
  loginUser,
  authUserId,
  onLogout,
  activeMenu,
  onMenuChange,
  navigateToMenu: navigateMenu,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  routeParams = {},
  onRouteChange,
}) {
  const dashboard = useDashboard({
    versionId: routeParams.versionId,
    userId: authUserId,
  });
  const selectedVersionId =
    dashboard.currentVersion?.id ?? routeParams.versionId ?? "";
  const isBusy = dashboard.loading;
  const hasError = Boolean(dashboard.error);

  useEffect(() => {
    if (!routeParams.versionId && dashboard.currentVersion?.id) {
      onRouteChange?.(
        { versionId: String(dashboard.currentVersion.id) },
        { replace: true }
      );
    }
  }, [routeParams.versionId, dashboard.currentVersion?.id, onRouteChange]);

  const go = (menuId, params = {}, options = {}) => {
    navigateToMenu(navigateMenu ?? onMenuChange, menuId, params, options);
  };

  const handleVersionChange = (event) => {
    onRouteChange?.({ versionId: event.target.value }, { replace: true });
  };

  const handleTaskClick = (task) => {
    if (task.targetType === "issue") {
      go(MENU_IDS.DEFECTS_NEW_ISSUES, {
        versionId: selectedVersionId,
        issueId: task.targetId,
      });
      return;
    }

    if (task.targetType === "testCase") {
      go(MENU_IDS.TEST_CASES, {
        versionId: selectedVersionId,
        caseId: task.targetId,
      });
      return;
    }

    go(MENU_IDS.MY_TASKS, { taskId: task.taskId ?? task.targetId });
  };

  const downloadWeeklyExcel = () => {
    const reportId = dashboard.weeklyReports[0]?.id;

    if (!reportId) {
      return;
    }

    window.location.href = `/api/v1/dashboard/weekly-reports/${reportId}/export?versionId=${selectedVersionId}`;
  };

  const shortcuts = [
    {
      title: "테스트 런 생성",
      description: "새로운 테스트 실행",
      tone: "purple",
      onClick: () =>
        go(MENU_IDS.TEST_RUNS, {
          create: "1",
          versionId: selectedVersionId,
        }),
    },
    {
      title: "신규 이슈 등록",
      description: "Redmine 이슈 등록",
      tone: "green",
      onClick: () =>
        go(MENU_IDS.DEFECTS_NEW_ISSUES, {
          create: "1",
          versionId: selectedVersionId,
        }),
    },
    {
      title: "주차별 현황",
      description: "진행 현황 작성",
      tone: "yellow",
      onClick: () =>
        go(MENU_IDS.DEFECTS_PROGRESS, { versionId: selectedVersionId }),
    },
    {
      title: "테스트 케이스",
      description: "테스트 케이스 관리",
      tone: "blue",
      onClick: () =>
        go(MENU_IDS.TEST_CASES, { versionId: selectedVersionId }),
    },
    {
      title: "알림 확인",
      description: "내 알림 확인",
      tone: "indigo",
      onClick: () => go(MENU_IDS.NOTIFICATIONS),
    },
  ];

  return (
    <MainLayout
      loginUser={loginUser}
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
      pageTitle={pageTitle}
      notifications={notifications}
      onNotificationClick={onNotificationClick}
      onMarkAllNotificationsRead={onMarkAllNotificationsRead}
    >
      <section className="db-workspace">
        <div className="db-dashboard-topbar">
          <div>
            <h2>오늘의 QA 업무</h2>
            <p>현재 버전 기준으로 할 일과 진행 상황을 확인합니다.</p>
          </div>
          <label className="db-version-select">
            <span>현재 버전</span>
            <select value={selectedVersionId} onChange={handleVersionChange}>
              {dashboard.versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.versionName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="db-shortcut-grid" aria-label="바로가기">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.title}
              type="button"
              className="db-shortcut-card"
              onClick={shortcut.onClick}
              disabled={!selectedVersionId && shortcut.title !== "알림 확인"}
            >
              <span className={`db-shortcut-icon ${shortcut.tone}`}>
                {shortcut.title.slice(0, 1)}
              </span>
              <strong>{shortcut.title}</strong>
              <small>{shortcut.description}</small>
            </button>
          ))}
        </section>

        <div className="db-main-grid">
          <section className="db-card db-task-card">
            <div className="db-card-header">
              <h3>내 할 일</h3>
              <button
                type="button"
                className="db-view-all-btn"
                onClick={() => go(MENU_IDS.MY_TASKS)}
              >
                전체 보기
              </button>
            </div>
            <SectionState
              loading={isBusy}
              error={hasError}
              empty={dashboard.myTasks.length === 0}
              emptyText="현재 처리할 업무가 없습니다."
              onRetry={dashboard.refresh}
            />
            {!isBusy && !hasError ? (
              <ul className="db-task-list">
                {dashboard.myTasks.map((task) => (
                  <li key={task.id}>
                    <button type="button" onClick={() => handleTaskClick(task)}>
                      <StatusBadge tone={task.kind === "멘션" ? "purple" : "yellow"}>
                        {task.kind}
                      </StatusBadge>
                      <span>{task.title}</span>
                      <time>{task.when}</time>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="db-card">
            <div className="db-card-header">
              <h3>진행 중인 테스트 런</h3>
              <button
                type="button"
                className="db-view-all-btn"
                onClick={() =>
                  go(MENU_IDS.TEST_RUNS, { versionId: selectedVersionId })
                }
              >
                전체 보기
              </button>
            </div>
            <SectionState
              loading={isBusy}
              error={hasError}
              empty={dashboard.testRuns.length === 0}
              emptyText="진행 중인 테스트 런이 없습니다."
              onRetry={dashboard.refresh}
            />
            {!isBusy && !hasError && dashboard.testRuns.length > 0 ? (
              <div className="db-table-scroll">
                <table className="db-work-table">
                  <thead>
                    <tr>
                      <th>테스트 런</th>
                      <th>버전</th>
                      <th>진행률</th>
                      <th>상태</th>
                      <th>마지막 실행</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.testRuns.map((run) => (
                      <tr
                        key={run.id}
                        onClick={() =>
                          go(MENU_IDS.TEST_RUNS, { runId: run.id })
                        }
                      >
                        <td>
                          <strong>{run.runId}</strong>
                          <span>{run.name}</span>
                        </td>
                        <td>{run.versionName}</td>
                        <td>
                          <div className="db-progress-line">
                            <span style={{ width: `${run.progress}%` }} />
                          </div>
                          <em>{run.progress}%</em>
                        </td>
                        <td>
                          <StatusBadge
                            tone={run.status === "완료" ? "green" : "blue"}
                          >
                            {run.status}
                          </StatusBadge>
                        </td>
                        <td>{run.lastExecutedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>

        <div className="db-main-grid">
          <section className="db-card">
            <div className="db-card-header">
              <h3>결함 현황</h3>
              <button
                type="button"
                className="db-view-all-btn"
                onClick={() =>
                  go(MENU_IDS.DEFECTS_SEARCH, { versionId: selectedVersionId })
                }
              >
                전체 보기
              </button>
            </div>
            <SectionState
              loading={isBusy}
              error={hasError}
              empty={dashboard.defectSummary.length === 0}
              emptyText="결함 데이터가 없습니다."
              onRetry={dashboard.refresh}
            />
            {!isBusy && !hasError ? (
              <div className="db-defect-summary">
                {dashboard.defectSummary.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      go(MENU_IDS.DEFECTS_SEARCH, {
                        versionId: selectedVersionId,
                        status: DEFECT_STATUS_QUERY[item.key],
                      })
                    }
                  >
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="db-card-header db-sub-header">
              <h3>최근 등록 이슈</h3>
              <button
                type="button"
                className="db-view-all-btn"
                onClick={() =>
                  go(MENU_IDS.DEFECTS_NEW_ISSUES, {
                    versionId: selectedVersionId,
                  })
                }
              >
                전체 보기
              </button>
            </div>
            <SectionState
              loading={isBusy}
              error={hasError}
              empty={dashboard.recentDefects.length === 0}
              emptyText="최근 등록 이슈가 없습니다."
              onRetry={dashboard.refresh}
            />
            {!isBusy && !hasError ? (
              <ul className="db-issue-list">
                {dashboard.recentDefects.map((issue) => (
                  <li key={issue.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (issue.redmineUrl) {
                          window.open(
                            issue.redmineUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );
                          return;
                        }

                        go(MENU_IDS.DEFECTS_NEW_ISSUES, {
                          versionId: selectedVersionId,
                          issueId: issue.id,
                        });
                      }}
                    >
                      <strong>{issue.issueId}</strong>
                      <StatusBadge tone="red">{issue.status}</StatusBadge>
                      <span>{issue.title}</span>
                      <time>{issue.registeredAt}</time>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="db-card">
            <div className="db-card-header">
              <h3>주차별 진행 현황</h3>
              <button
                type="button"
                className="db-view-all-btn"
                onClick={() =>
                  go(MENU_IDS.DEFECTS_PROGRESS, {
                    versionId: selectedVersionId,
                  })
                }
              >
                전체 보기
              </button>
            </div>
            <SectionState
              loading={isBusy}
              error={hasError}
              empty={dashboard.weeklyReports.length === 0}
              emptyText="주차별 진행 현황이 없습니다."
              onRetry={dashboard.refresh}
            />
            {!isBusy && !hasError && dashboard.weeklyReports.length > 0 ? (
              <>
                <div className="db-table-scroll">
                  <table className="db-work-table compact">
                    <thead>
                      <tr>
                        <th>주차</th>
                        <th>기간</th>
                        <th>상태</th>
                        <th>작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.weeklyReports.map((report) => (
                        <tr
                          key={report.id}
                          onClick={() =>
                            go(MENU_IDS.DEFECTS_PROGRESS, {
                              versionId: selectedVersionId,
                              roundId: report.id,
                            })
                          }
                        >
                          <td>{report.label}</td>
                          <td>{report.period}</td>
                          <td>
                            <StatusBadge
                              tone={
                                report.status === "작성 완료" ? "green" : "yellow"
                              }
                            >
                              {report.status}
                            </StatusBadge>
                          </td>
                          <td>{report.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="db-excel-btn"
                  onClick={downloadWeeklyExcel}
                >
                  주차별 Excel 다운로드
                </button>
              </>
            ) : null}
          </section>
        </div>

        <section className="db-card">
          <div className="db-card-header">
            <h3>공지사항</h3>
            <button
              type="button"
              className="db-view-all-btn"
              onClick={() => go(MENU_IDS.NOTICES)}
            >
              전체 보기
            </button>
          </div>
          <SectionState
            loading={isBusy}
            error={hasError}
            empty={dashboard.notices.length === 0}
            emptyText="등록된 공지사항이 없습니다."
            onRetry={dashboard.refresh}
          />
          {!isBusy && !hasError ? (
            <ul className="db-notice-list">
              {dashboard.notices.map((notice) => (
                <li key={notice.id}>
                  <button
                    type="button"
                    onClick={() =>
                      go(MENU_IDS.NOTICES, { noticeId: notice.id })
                    }
                  >
                    <StatusBadge tone="blue">{notice.category}</StatusBadge>
                    <span>{notice.title}</span>
                    <time>{notice.createdAt}</time>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </MainLayout>
  );
}

export default DashboardPage;

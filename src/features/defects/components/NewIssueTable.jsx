import { ISSUE_REDMINE_STATUS } from "../constants/defectConstants";

function NewIssueTable({ issues, pageOffset = 0, onRetryRedmine }) {
  return (
    <div className="df-issue-table-scroll">
      <table className="df-issue-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>이슈 번호</th>
            <th>제목</th>
            <th>메뉴</th>
            <th>담당자</th>
            <th>우선순위</th>
            <th>등록일</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {issues.length > 0 ? (
            issues.map((issue, index) => (
              <tr key={issue.id}>
                <td>{pageOffset + index + 1}</td>
                <td className="df-issue-id">
                  {issue.redmineUrl ? (
                    <a href={issue.redmineUrl} target="_blank" rel="noreferrer">
                      {issue.issueId}
                    </a>
                  ) : (
                    issue.issueId
                  )}
                </td>
                <td className="df-issue-title">
                  <strong>{issue.issueId}</strong> {issue.title}
                </td>
                <td>{issue.menu || "-"}</td>
                <td>{issue.assignee || "-"}</td>
                <td>{issue.priority || "-"}</td>
                <td className="df-issue-date">{issue.registeredAt}</td>
                <td>
                  <span
                    className={`df-redmine-status df-redmine-status-${
                      issue.redmineStatus === ISSUE_REDMINE_STATUS.FAILED
                        ? "failed"
                        : "synced"
                    }`}
                  >
                    {issue.redmineStatus}
                  </span>
                </td>
                <td>
                  {issue.redmineStatus === ISSUE_REDMINE_STATUS.FAILED ? (
                    <button
                      type="button"
                      className="df-retry-btn"
                      onClick={() => onRetryRedmine?.(issue.id)}
                    >
                      재시도
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="df-empty-message">
                선택한 주차에 신규 등록된 이슈가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NewIssueTable;

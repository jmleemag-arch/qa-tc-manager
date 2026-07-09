function NewIssueTable({ issues, pageOffset = 0 }) {
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
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>
          {issues.length > 0 ? (
            issues.map((issue, index) => (
              <tr key={issue.issueId}>
                <td>{pageOffset + index + 1}</td>
                <td className="df-issue-id">{issue.issueId}</td>
                <td className="df-issue-title">{issue.title}</td>
                <td>{issue.menu}</td>
                <td>{issue.assignee}</td>
                <td className="df-issue-date">{issue.registeredAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="df-empty-message">
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

import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "../constants/settingsConstants";
import SettingsCard from "./SettingsCard";

function UsersSettingsPanel({ settings, onChange }) {
  const users = settings.managedUsers ?? [];

  const updateUser = (userId, field, value) => {
    onChange({
      ...settings,
      managedUsers: users.map((user) =>
        user.id === userId ? { ...user, [field]: value } : user
      ),
    });
  };

  const getStatusLabel = (status) =>
    USER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  return (
    <div className="st-panel-stack">
      <SettingsCard title="등록 사용자">
        <div className="st-table-scroll">
          <table className="st-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>아이디</th>
                <th>역할</th>
                <th>상태</th>
                <th>최근 로그인</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="st-table-strong">{user.name}</td>
                  <td>{user.id}</td>
                  <td>
                    <select
                      className="st-inline-select"
                      value={user.role}
                      onChange={(e) => updateUser(user.id, "role", e.target.value)}
                    >
                      {USER_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="st-inline-select"
                      value={user.status}
                      onChange={(e) => updateUser(user.id, "status", e.target.value)}
                    >
                      {USER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="st-table-muted">{user.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <div className="st-summary-grid">
        {USER_ROLE_OPTIONS.map((role) => {
          const count = users.filter((user) => user.role === role.value).length;

          return (
            <article key={role.value} className="st-summary-card">
              <span>{role.label}</span>
              <strong>{count}명</strong>
            </article>
          );
        })}
      </div>

      <p className="st-panel-note">
        현재는 데모 계정 기준입니다. 추후 LDAP 등 외부 계정과 동기화할 수
        있습니다. 비활성 사용자는 {getStatusLabel("inactive")} 상태로 표시됩니다.
      </p>
    </div>
  );
}

export default UsersSettingsPanel;

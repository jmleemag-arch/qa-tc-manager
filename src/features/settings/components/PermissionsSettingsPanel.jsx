import { PERMISSION_MODULES, USER_ROLE_OPTIONS } from "../constants/settingsConstants";
import SettingsCard from "./SettingsCard";

function PermissionsSettingsPanel({ settings, onChange }) {
  const rolePermissions = settings.rolePermissions ?? {};

  const togglePermission = (role, moduleKey) => {
    onChange({
      ...settings,
      rolePermissions: {
        ...rolePermissions,
        [role]: {
          ...rolePermissions[role],
          [moduleKey]: !rolePermissions[role]?.[moduleKey],
        },
      },
    });
  };

  return (
    <div className="st-panel-stack">
      <SettingsCard title="역할별 메뉴 접근 권한">
        <div className="st-table-scroll">
          <table className="st-table st-permission-table">
            <thead>
              <tr>
                <th>역할</th>
                {PERMISSION_MODULES.map((module) => (
                  <th key={module.key}>{module.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USER_ROLE_OPTIONS.map((role) => (
                <tr key={role.value}>
                  <td className="st-table-strong">{role.label}</td>
                  {PERMISSION_MODULES.map((module) => (
                    <td key={module.key}>
                      <input
                        type="checkbox"
                        checked={Boolean(rolePermissions[role.value]?.[module.key])}
                        onChange={() => togglePermission(role.value, module.key)}
                        aria-label={`${role.label} ${module.label} 접근`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <div className="st-info-list">
        <article>
          <strong>관리자</strong>
          <p>설정 변경, 사용자 관리, 백업/복원을 포함한 전체 기능에 접근합니다.</p>
        </article>
        <article>
          <strong>QA 리드</strong>
          <p>테스트 케이스/런/결함 관리와 보고서 조회가 가능합니다.</p>
        </article>
        <article>
          <strong>QA 테스터</strong>
          <p>할당된 테스트 실행과 결함 등록 중심으로 사용합니다.</p>
        </article>
        <article>
          <strong>조회 전용</strong>
          <p>데이터 조회만 가능하며 생성/수정/삭제는 제한됩니다.</p>
        </article>
      </div>
    </div>
  );
}

export default PermissionsSettingsPanel;

import {
  VERSION_STATUS_OPTIONS,
} from "../constants/settingsConstants";
import SettingsCard from "./SettingsCard";
import { SettingsField } from "./settingsShared";
import SettingsToggle from "./SettingsToggle";

function VersionsSettingsPanel({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="st-card-grid">
      <SettingsCard title="버전 그룹핑">
        <SettingsToggle
          id="version-auto-group"
          label="연도별 자동 그룹핑"
          description="버전 앞 2자리(예: 26)를 기준으로 연도 그룹에 자동 배치합니다."
          checked={settings.versionAutoGroup}
          onChange={(value) => update("versionAutoGroup", value)}
        />
        <SettingsField
          label="연도 기준값"
          description="26.x.x → 2026년으로 계산할 때 사용하는 기준 연도입니다."
        >
          <input
            type="number"
            min="2000"
            max="2100"
            value={settings.versionYearBase}
            onChange={(e) => update("versionYearBase", Number(e.target.value))}
            disabled={!settings.versionAutoGroup}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="신규 버전 기본값">
        <SettingsField label="기본 상태">
          <select
            value={settings.defaultVersionStatus}
            onChange={(e) => update("defaultVersionStatus", e.target.value)}
          >
            {VERSION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField
          label="버전 명명 규칙"
          description="새 버전 추가 시 안내 문구로 표시됩니다."
        >
          <input
            type="text"
            value={settings.versionNamingHint}
            onChange={(e) => update("versionNamingHint", e.target.value)}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="적용 범위">
        <ul className="st-bullet-list">
          <li>결함 관리 &gt; 이슈 진행 상황 버전 선택</li>
          <li>테스트 런 생성 시 대상 버전 선택</li>
          <li>테스트 케이스 버전 관리 (시트/탭 모델)</li>
        </ul>
      </SettingsCard>
    </div>
  );
}

export default VersionsSettingsPanel;

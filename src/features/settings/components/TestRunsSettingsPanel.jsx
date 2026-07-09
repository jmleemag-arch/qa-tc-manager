import {
  PAGE_SIZE_OPTIONS,
  TEST_RUN_TAB_OPTIONS,
} from "../constants/settingsConstants";
import SettingsCard from "./SettingsCard";
import { SettingsField } from "./settingsShared";
import SettingsToggle from "./SettingsToggle";

function TestRunsSettingsPanel({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="st-card-grid">
      <SettingsCard title="화면 기본값">
        <SettingsField label="기본 진입 탭">
          <select
            value={settings.testRunDefaultTab}
            onChange={(e) => update("testRunDefaultTab", e.target.value)}
          >
            {TEST_RUN_TAB_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField label="목록 페이지당 표시">
          <select
            value={settings.testRunDefaultPageSize}
            onChange={(e) =>
              update("testRunDefaultPageSize", Number(e.target.value))
            }
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="실행 규칙">
        <SettingsToggle
          id="testrun-require-version"
          label="버전 선택 필수"
          description="테스트 런 생성 시 대상 버전을 반드시 선택해야 합니다."
          checked={settings.testRunRequireVersion}
          onChange={(value) => update("testRunRequireVersion", value)}
        />
        <SettingsToggle
          id="testrun-auto-complete"
          label="자동 완료 처리"
          description="모든 TC 결과 입력 시 테스트 런 상태를 완료로 변경합니다."
          checked={settings.testRunAutoStatusComplete}
          onChange={(value) => update("testRunAutoStatusComplete", value)}
        />
      </SettingsCard>

      <SettingsCard title="결과 코드">
        <ul className="st-bullet-list">
          <li><strong>O</strong> — 통과</li>
          <li><strong>X</strong> — 실패</li>
          <li><strong>BLOCK</strong> — 차단됨</li>
          <li><strong>NT</strong> — 미실행</li>
        </ul>
      </SettingsCard>
    </div>
  );
}

export default TestRunsSettingsPanel;

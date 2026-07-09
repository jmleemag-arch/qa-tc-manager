import {
  DATE_FORMAT_OPTIONS,
  FILE_SIZE_OPTIONS,
  MENU_SORT_OPTIONS,
  PAGE_SIZE_OPTIONS,
  RECENT_ITEMS_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
} from "../constants/settingsConstants";
import SettingsCard from "./SettingsCard";
import { SettingsField } from "./settingsShared";
import SettingsToggle from "./SettingsToggle";

function BasicSettingsPanel({ settings, onChange }) {
  const update = (field, value) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="st-card-grid">
      <SettingsCard title="세션 설정">
        <SettingsField
          label="세션 만료 시간"
          description="사용자 활동이 없는 경우 설정한 시간 이후 세션이 만료됩니다."
        >
          <select
            value={settings.sessionTimeoutMinutes}
            onChange={(e) =>
              update("sessionTimeoutMinutes", Number(e.target.value))
            }
          >
            {SESSION_TIMEOUT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsToggle
          id="session-warning-enabled"
          label="세션 만료 경고 사용"
          description="세션 만료 1분 전에 경고 메시지를 표시합니다."
          checked={settings.sessionWarningEnabled}
          onChange={(value) => update("sessionWarningEnabled", value)}
        />
      </SettingsCard>

      <SettingsCard title="기본 메뉴 설정">
        <SettingsToggle
          id="fix-default-menus"
          label="기본 메뉴 고정"
          description="Total, 대시보드는 모든 버전에 기본으로 포함됩니다."
          checked={settings.fixDefaultMenus}
          onChange={(value) => update("fixDefaultMenus", value)}
        />

        <SettingsField label="메뉴 정렬 방식">
          <select
            value={settings.menuSortOrder}
            onChange={(e) => update("menuSortOrder", e.target.value)}
          >
            {MENU_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="파일 및 업로드 설정">
        <SettingsField label="허용 파일 확장자">
          <input
            type="text"
            value={settings.allowedFileExtensions}
            onChange={(e) => update("allowedFileExtensions", e.target.value)}
          />
        </SettingsField>

        <SettingsField label="최대 파일 크기">
          <select
            value={settings.maxFileSizeMb}
            onChange={(e) => update("maxFileSizeMb", Number(e.target.value))}
          >
            {FILE_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="기타 설정">
        <SettingsToggle
          id="auto-save-enabled"
          label="자동 저장 사용"
          description="TC 작성/수정 중 자동 저장을 사용합니다."
          checked={settings.autoSaveEnabled}
          onChange={(value) => update("autoSaveEnabled", value)}
        />

        <SettingsField label="날짜 표시 형식">
          <select
            value={settings.dateFormat}
            onChange={(e) => update("dateFormat", e.target.value)}
          >
            {DATE_FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField label="페이지당 표시 개수">
          <select
            value={settings.pageSize}
            onChange={(e) => update("pageSize", Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField label="최근 항목 표시 개수">
          <select
            value={settings.recentItemsCount}
            onChange={(e) => update("recentItemsCount", Number(e.target.value))}
          >
            {RECENT_ITEMS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsField>
      </SettingsCard>
    </div>
  );
}

export default BasicSettingsPanel;

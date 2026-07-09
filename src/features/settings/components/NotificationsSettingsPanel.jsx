import SettingsCard from "./SettingsCard";
import { SettingsCheckbox, SettingsField } from "./settingsShared";
import SettingsToggle from "./SettingsToggle";

function NotificationsSettingsPanel({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="st-card-grid">
      <SettingsCard title="알림 유형">
        <SettingsCheckbox
          id="notify-mention"
          label="멘션 알림"
          description="다른 사용자가 나를 멘션했을 때"
          checked={settings.notifyMention}
          onChange={(value) => update("notifyMention", value)}
        />
        <SettingsCheckbox
          id="notify-assignee"
          label="담당 TC 알림"
          description="담당자로 지정된 TC에 변경이 있을 때"
          checked={settings.notifyAssignee}
          onChange={(value) => update("notifyAssignee", value)}
        />
        <SettingsCheckbox
          id="notify-version-release"
          label="버전 릴리즈 / 재검증 알림"
          description="버전 릴리즈 또는 재검증 요청이 있을 때"
          checked={settings.notifyVersionRelease}
          onChange={(value) => update("notifyVersionRelease", value)}
        />
        <SettingsCheckbox
          id="notify-issue-registered"
          label="신규 이슈 등록 알림"
          description="신규 이슈가 등록되었을 때"
          checked={settings.notifyIssueRegistered}
          onChange={(value) => update("notifyIssueRegistered", value)}
        />
        <SettingsCheckbox
          id="notify-testrun-complete"
          label="테스트 런 완료 알림"
          description="담당 테스트 런이 완료되었을 때"
          checked={settings.notifyTestRunComplete}
          onChange={(value) => update("notifyTestRunComplete", value)}
        />
      </SettingsCard>

      <SettingsCard title="수신 채널">
        <SettingsToggle
          id="notify-browser-enabled"
          label="브라우저 알림"
          description="앱 내 알림 벨과 브라우저 알림을 사용합니다."
          checked={settings.notifyBrowserEnabled}
          onChange={(value) => update("notifyBrowserEnabled", value)}
        />
        <SettingsToggle
          id="notify-email-enabled"
          label="이메일 알림"
          description="중요 알림을 이메일로도 수신합니다."
          checked={settings.notifyEmailEnabled}
          onChange={(value) => update("notifyEmailEnabled", value)}
        />
      </SettingsCard>

      <SettingsCard title="방해 금지 시간">
        <SettingsToggle
          id="notify-quiet-hours"
          label="방해 금지 시간 사용"
          description="지정한 시간대에는 알림을 표시하지 않습니다."
          checked={settings.notifyQuietHoursEnabled}
          onChange={(value) => update("notifyQuietHoursEnabled", value)}
        />
        <SettingsField label="시작 시간">
          <input
            type="time"
            value={settings.quietHoursStart}
            onChange={(e) => update("quietHoursStart", e.target.value)}
            disabled={!settings.notifyQuietHoursEnabled}
          />
        </SettingsField>
        <SettingsField label="종료 시간">
          <input
            type="time"
            value={settings.quietHoursEnd}
            onChange={(e) => update("quietHoursEnd", e.target.value)}
            disabled={!settings.notifyQuietHoursEnabled}
          />
        </SettingsField>
      </SettingsCard>
    </div>
  );
}

export default NotificationsSettingsPanel;

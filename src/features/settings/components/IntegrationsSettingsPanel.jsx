import SettingsCard from "./SettingsCard";
import { SettingsField } from "./settingsShared";
import SettingsToggle from "./SettingsToggle";

function IntegrationsSettingsPanel({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="st-card-grid">
      <SettingsCard title="Webhook">
        <SettingsToggle
          id="webhook-enabled"
          label="Webhook 사용"
          description="이벤트 발생 시 지정 URL로 JSON payload를 전송합니다."
          checked={settings.webhookEnabled}
          onChange={(value) => update("webhookEnabled", value)}
        />
        <SettingsField label="Webhook URL">
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => update("webhookUrl", e.target.value)}
            placeholder="https://hooks.example.com/qa-events"
            disabled={!settings.webhookEnabled}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Slack">
        <SettingsToggle
          id="slack-enabled"
          label="Slack 알림"
          description="테스트 런 완료, 신규 이슈 등록 시 Slack으로 알립니다."
          checked={settings.slackEnabled}
          onChange={(value) => update("slackEnabled", value)}
        />
        <SettingsField label="Incoming Webhook URL">
          <input
            type="url"
            value={settings.slackWebhookUrl}
            onChange={(e) => update("slackWebhookUrl", e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            disabled={!settings.slackEnabled}
          />
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Microsoft Teams">
        <SettingsToggle
          id="teams-enabled"
          label="Teams 알림"
          description="Teams 채널 커넥터로 주요 QA 이벤트를 전달합니다."
          checked={settings.teamsEnabled}
          onChange={(value) => update("teamsEnabled", value)}
        />
      </SettingsCard>

      <SettingsCard title="연동 이벤트">
        <ul className="st-bullet-list">
          <li>테스트 런 생성 / 완료 / 실패</li>
          <li>신규 이슈 등록</li>
          <li>버전 추가 및 삭제</li>
          <li>세션 만료 경고 (관리자 전용)</li>
        </ul>
      </SettingsCard>
    </div>
  );
}

export default IntegrationsSettingsPanel;

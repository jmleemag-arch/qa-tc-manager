import { useMemo } from "react";
import {
  APP_BUILD_LABEL,
  APP_VERSION,
  BACKUP_STORAGE_KEYS,
} from "../constants/settingsConstants";
import { estimateStorageUsageKb } from "../utils/backupUtils";
import SettingsCard from "./SettingsCard";

function SystemInfoPanel({ loginUser, settings }) {
  const storageUsageKb = useMemo(() => estimateStorageUsageKb(), []);
  const browserInfo = useMemo(
    () => navigator.userAgent.split(") ").pop()?.split(" ").slice(0, 2).join(" ") ?? "Unknown",
    []
  );
  const appVersion = settings?.appVersion ?? APP_VERSION;
  const appBuildLabel = settings?.appBuildLabel ?? APP_BUILD_LABEL;

  const infoRows = [
    { label: "애플리케이션", value: "QA Manager" },
    { label: "버전", value: `v${appVersion}` },
    { label: "빌드", value: appBuildLabel },
    { label: "환경", value: import.meta.env.MODE === "production" ? "Production" : "Development" },
    { label: "로그인 계정", value: loginUser },
    { label: "브라우저", value: browserInfo },
    { label: "로컬 저장소 사용량", value: `약 ${storageUsageKb} KB` },
    { label: "백업 대상 키", value: `${BACKUP_STORAGE_KEYS.length}개` },
  ];

  return (
    <div className="st-panel-stack">
      <SettingsCard title="시스템 정보">
        <dl className="st-info-dl">
          {infoRows.map((row) => (
            <div key={row.label} className="st-info-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </SettingsCard>

      <div className="st-info-list">
        <article>
          <strong>데이터 저장 방식</strong>
          <p>설정과 버전, 이슈 데이터는 SQLite DB API를 통해 관리됩니다.</p>
        </article>
        <article>
          <strong>권장 사항</strong>
          <p>중요 변경 전에는 설정 &gt; 백업 및 복원에서 데이터를보내 두세요.</p>
        </article>
      </div>
    </div>
  );
}

export default SystemInfoPanel;

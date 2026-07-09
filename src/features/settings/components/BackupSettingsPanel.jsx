import { useRef, useState } from "react";
import {
  BACKUP_EXPORT_SUCCESS_MESSAGE,
  BACKUP_IMPORT_FAIL_MESSAGE,
  BACKUP_IMPORT_SUCCESS_MESSAGE,
  BACKUP_STORAGE_KEYS,
} from "../constants/settingsConstants";
import {
  exportAppBackup,
  formatBackupTimestamp,
  importAppBackup,
} from "../utils/backupUtils";
import { readAppSettings, writeAppSettings } from "../utils/settingsStorage";
import SettingsCard from "./SettingsCard";

function BackupSettingsPanel({ settings, onChange }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const handleExport = () => {
    const exportedAt = exportAppBackup();
    const nextSettings = {
      ...readAppSettings(),
      lastBackupAt: exportedAt,
    };

    writeAppSettings(nextSettings);
    onChange(nextSettings);
    showMessage(BACKUP_EXPORT_SUCCESS_MESSAGE);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await importAppBackup(file);
      showMessage(BACKUP_IMPORT_SUCCESS_MESSAGE);
      window.setTimeout(() => window.location.reload(), 1200);
    } catch {
      showMessage(BACKUP_IMPORT_FAIL_MESSAGE);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="st-panel-stack">
      <div className="st-card-grid">
        <SettingsCard title="데이터 백업">
          <p className="st-card-copy">
            테스트 케이스, 버전, 결함 진행 데이터, 앱 설정을 JSON 파일로보냅니다.
          </p>
          <ul className="st-bullet-list">
            {BACKUP_STORAGE_KEYS.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
          <button type="button" className="st-save-btn" onClick={handleExport}>
            백업 다운로드
          </button>
        </SettingsCard>

        <SettingsCard title="데이터 복원">
          <p className="st-card-copy">
            이전에보낸 백업 파일을 선택하면 로컬 데이터를 덮어씁니다.
          </p>
          <button
            type="button"
            className="st-outline-btn"
            onClick={handleImportClick}
          >
            백업 파일 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="st-hidden-input"
            onChange={handleImport}
          />
        </SettingsCard>
      </div>

      <div className="st-info-banner">
        <strong>마지막 백업</strong>
        <span>{formatBackupTimestamp(settings.lastBackupAt)}</span>
      </div>

      {message ? <p className="st-save-message st-panel-message">{message}</p> : null}

      <p className="st-panel-note">
        복원 후에는 페이지가 자동으로 새로고침됩니다. 인증 세션은 보안상 백업에서
        제외됩니다.
      </p>
    </div>
  );
}

export default BackupSettingsPanel;

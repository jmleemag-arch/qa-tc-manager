import { useRef, useState } from "react";
import {
  BACKUP_EXPORT_SUCCESS_MESSAGE,
  BACKUP_IMPORT_FAIL_MESSAGE,
  BACKUP_IMPORT_SUCCESS_MESSAGE,
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
  const [isExporting, setIsExporting] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportedAt = await exportAppBackup();
      const nextSettings = {
        ...readAppSettings(),
        lastBackupAt: exportedAt,
      };

      await writeAppSettings(nextSettings);
      onChange(nextSettings);
      showMessage(BACKUP_EXPORT_SUCCESS_MESSAGE);
    } catch {
      showMessage("백업 다운로드에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
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
            DB에 저장된 앱 설정(세션, 알림, 권한, 연동 등)을 JSON 파일로
           보냅니다.
          </p>
          <button
            type="button"
            className="st-save-btn"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "백업 중..." : "백업 다운로드"}
          </button>
        </SettingsCard>

        <SettingsCard title="데이터 복원">
          <p className="st-card-copy">
            이전에보낸 백업 파일을 선택하면 DB 설정을 덮어씁니다.
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
        복원 후에는 페이지가 자동으로 새로고침됩니다. 테스트 케이스·버전·이슈 등
        업무 데이터는 DB에 별도 저장되며, 이 백업은 앱 설정만 포함합니다.
      </p>
    </div>
  );
}

export default BackupSettingsPanel;

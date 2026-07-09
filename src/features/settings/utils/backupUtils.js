import settingsApi from "../../../services/settingsApi.js";

export async function exportAppBackup() {
  const response = await settingsApi.getAll();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 2,
    source: "database",
    data: response.data ?? {},
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);

  anchor.href = url;
  anchor.download = `qa-manager-backup-${timestamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);

  return payload.exportedAt;
}

export async function importAppBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const payload = JSON.parse(String(reader.result));

        if (!payload?.data || typeof payload.data !== "object") {
          reject(new Error("invalid-backup"));
          return;
        }

        await settingsApi.updateAll(payload.data);
        resolve(payload.exportedAt ?? new Date().toISOString());
      } catch {
        reject(new Error("invalid-backup"));
      }
    };

    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsText(file);
  });
}

export function formatBackupTimestamp(isoValue) {
  if (!isoValue) {
    return "백업 이력 없음";
  }

  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return isoValue;
  }

  return date.toLocaleString("ko-KR");
}

export function estimateStorageUsageKb() {
  return 0;
}

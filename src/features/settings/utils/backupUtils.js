import { BACKUP_STORAGE_KEYS } from "../constants/settingsConstants";

export function exportAppBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {},
  };

  BACKUP_STORAGE_KEYS.forEach((key) => {
    const value = window.localStorage.getItem(key);

    if (value !== null) {
      payload.data[key] = value;
    }
  });

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

export function importAppBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));

        if (!payload?.data || typeof payload.data !== "object") {
          reject(new Error("invalid-backup"));
          return;
        }

        Object.entries(payload.data).forEach(([key, value]) => {
          if (BACKUP_STORAGE_KEYS.includes(key) && typeof value === "string") {
            window.localStorage.setItem(key, value);
          }
        });

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
  let totalBytes = 0;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key) {
      continue;
    }

    const value = window.localStorage.getItem(key) ?? "";
    totalBytes += key.length + value.length;
  }

  return Math.max(1, Math.round(totalBytes / 1024));
}

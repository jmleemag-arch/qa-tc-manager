export const ISSUE_VERSION_STORAGE_KEY = "qa-manager-issue-progress-versions";

export function readIssueVersions(fallbackVersions) {
  try {
    const rawValue = window.localStorage.getItem(ISSUE_VERSION_STORAGE_KEY);

    return rawValue ? JSON.parse(rawValue) : fallbackVersions;
  } catch {
    return fallbackVersions;
  }
}

export function writeIssueVersions(versions) {
  window.localStorage.setItem(ISSUE_VERSION_STORAGE_KEY, JSON.stringify(versions));
}

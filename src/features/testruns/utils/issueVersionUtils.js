const VERSION_YEAR_BASE = 2000;

export function getVersionYearPrefix(versionName) {
  const match = String(versionName ?? "")
    .trim()
    .match(/^(\d{2})\./);

  return match ? match[1] : null;
}

export function getVersionYearLabel(versionName) {
  const prefix = getVersionYearPrefix(versionName);

  if (!prefix) {
    return "기타";
  }

  return String(VERSION_YEAR_BASE + Number(prefix));
}

export function groupIssueVersionsByYear(versions = []) {
  const groups = new Map();

  versions.forEach((version) => {
    const yearLabel = getVersionYearLabel(version.version);
    const yearPrefix = getVersionYearPrefix(version.version) ?? "";

    if (!groups.has(yearLabel)) {
      groups.set(yearLabel, {
        yearLabel,
        yearPrefix,
        versions: [],
      });
    }

    groups.get(yearLabel).versions.push(version);
  });

  return [...groups.values()]
    .sort((a, b) => a.yearLabel.localeCompare(b.yearLabel))
    .map((group) => ({
      ...group,
      versions: [...group.versions].sort((a, b) =>
        a.version.localeCompare(b.version)
      ),
    }));
}

export function getVersionsForYear(versions = [], yearLabel) {
  const group = groupIssueVersionsByYear(versions).find(
    (item) => item.yearLabel === yearLabel
  );

  return group?.versions ?? [];
}

export function getDefaultYearLabel(versions = []) {
  const groups = groupIssueVersionsByYear(versions);

  return groups[0]?.yearLabel ?? "";
}

export function getDefaultVersionForYear(versions = [], yearLabel) {
  return getVersionsForYear(versions, yearLabel)[0]?.version ?? "";
}

export function parseVersionYear(versionName, yearBase = 2000) {
  const match = String(versionName ?? "").trim().match(/^(\d{2})\./);

  if (!match) {
    return new Date().getFullYear();
  }

  return yearBase + Number(match[1]);
}

function formatDateOnly(date) {
  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function normalizeVersionStatus(status) {
  const value = String(status ?? "").trim();

  if (value === "진행 중" || value === "in-progress") {
    return "진행중";
  }

  if (value === "완료" || value === "completed") {
    return "완료";
  }

  if (value === "예정" || value === "planned") {
    return "예정";
  }

  return value || "예정";
}

export function toVersionResponse(version) {
  return {
    id: version.id,
    versionName: version.versionName,
    year: version.year,
    status: version.status,
    startDate: formatDateOnly(version.startDate),
    endDate: formatDateOnly(version.endDate),
    description: version.description ?? "",
    createdAt: version.createdAt.toISOString(),
    updatedAt: version.updatedAt.toISOString(),
  };
}

export function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

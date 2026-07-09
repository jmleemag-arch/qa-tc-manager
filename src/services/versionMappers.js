import { FIXED_VERSION_MENUS } from "../features/testcases/constants/testCaseConstants.js";

export function mapVersionToIssueProgress(version) {
  return {
    dbId: version.id,
    version: version.versionName,
    registeredAt: version.startDate ?? "",
    status: version.status,
    startDate: version.startDate,
    endDate: version.endDate,
    description: version.description ?? "",
    rows: [],
  };
}

export function mapVersionToTestCase(version) {
  const menus =
    version.submenus?.length > 0
      ? version.submenus.map((submenu) => submenu.name)
      : [...FIXED_VERSION_MENUS];

  return {
    id: version.versionName,
    dbId: version.id,
    name: version.versionName,
    description: version.description ?? "",
    menus,
  };
}

export function mapIssueProgressToCreatePayload(version) {
  return {
    versionName: version.version,
    status: version.status,
    startDate: version.startDate,
    endDate: version.endDate,
    description: version.description ?? "",
  };
}

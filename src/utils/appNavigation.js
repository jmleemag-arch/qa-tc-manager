import { getMenuSlug, MENU_IDS } from "../constants/appConstants.js";

export function buildAppRoute(menuId, params = {}) {
  const searchParams = new URLSearchParams();
  const routeParams = { ...params };
  let slug = getMenuSlug(menuId);
  let routePrefix = "#/";

  if (menuId === MENU_IDS.TEST_CASES && routeParams.versionId) {
    slug = `versions/${routeParams.versionId}/test-cases`;
    routePrefix = "/";
    delete routeParams.versionId;
  }

  Object.entries(routeParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return `${routePrefix}${slug}${queryString ? `?${queryString}` : ""}`;
}

export function navigateToMenu(navigateTo, menuId, params = {}, options = {}) {
  navigateTo?.(menuId, params, options);
}

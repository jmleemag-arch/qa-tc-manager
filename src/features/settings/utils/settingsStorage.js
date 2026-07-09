import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_SAVED_EVENT,
} from "../constants/settingsConstants.js";
import settingsApi from "../../../services/settingsApi.js";
import {
  mapClientSettingsToServer,
  mapServerSettingsToClient,
} from "../../../services/settingsMappers.js";

let cachedSettings = null;
let cachedSessionSettings = null;
let loadPromise = null;

export function getCachedSessionSettings() {
  return (
    cachedSessionSettings ?? {
      sessionTimeoutMinutes: DEFAULT_APP_SETTINGS.sessionTimeoutMinutes,
      sessionWarningEnabled: DEFAULT_APP_SETTINGS.sessionWarningEnabled,
    }
  );
}

export function readAppSettings() {
  if (cachedSettings) {
    return { ...cachedSettings };
  }

  return { ...DEFAULT_APP_SETTINGS };
}

export async function loadAppSettings() {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await settingsApi.getAll();
      cachedSettings = mapServerSettingsToClient(response.data ?? {});
      cachedSessionSettings = response.data?.session ?? null;
      return cachedSettings;
    } catch {
      cachedSettings = { ...DEFAULT_APP_SETTINGS };
      cachedSessionSettings = {
        sessionTimeoutMinutes: DEFAULT_APP_SETTINGS.sessionTimeoutMinutes,
        sessionWarningEnabled: DEFAULT_APP_SETTINGS.sessionWarningEnabled,
      };
      return cachedSettings;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export async function loadSessionSettings() {
  try {
    const response = await settingsApi.getSession();
    cachedSessionSettings = response.data ?? null;
    return cachedSessionSettings;
  } catch {
    return getCachedSessionSettings();
  }
}

export async function writeAppSettings(settings) {
  const sections = mapClientSettingsToServer(settings);
  const response = await settingsApi.updateAll(sections);
  cachedSettings = mapServerSettingsToClient(response.data ?? sections);
  cachedSessionSettings = response.data?.session ?? sections.session;
  window.dispatchEvent(new CustomEvent(SETTINGS_SAVED_EVENT));
  return cachedSettings;
}

export function getSessionIdleTimeoutMs(settings = getCachedSessionSettings()) {
  return settings.sessionTimeoutMinutes * 60 * 1000;
}

export function getSessionWarningBeforeMs() {
  return 60 * 1000;
}

export function isSessionWarningEnabled(
  settings = getCachedSessionSettings()
) {
  return settings.sessionWarningEnabled;
}

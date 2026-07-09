import { useCallback, useEffect, useMemo, useState } from "react";
import versionApi from "../services/versionApi.js";
import {
  mapIssueProgressToCreatePayload,
  mapVersionToIssueProgress,
  mapVersionToTestCase,
} from "../services/versionMappers.js";

export function useVersions() {
  const [apiVersions, setApiVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await versionApi.list();
      setApiVersions(response.data ?? []);
      setError(null);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const issueVersions = useMemo(
    () => apiVersions.map(mapVersionToIssueProgress),
    [apiVersions]
  );

  const testCaseVersions = useMemo(
    () => apiVersions.map(mapVersionToTestCase),
    [apiVersions]
  );

  const findVersionByName = useCallback(
    (versionName) =>
      apiVersions.find((version) => version.versionName === versionName) ?? null,
    [apiVersions]
  );

  const createVersion = useCallback(
    async (payload) => {
      const response = await versionApi.create(
        payload.versionName
          ? payload
          : mapIssueProgressToCreatePayload(payload)
      );
      await refresh();
      return response.data;
    },
    [refresh]
  );

  const updateVersion = useCallback(
    async (dbId, payload) => {
      const response = await versionApi.update(dbId, payload);
      await refresh();
      return response.data;
    },
    [refresh]
  );

  const deleteVersion = useCallback(
    async (dbId) => {
      await versionApi.remove(dbId);
      await refresh();
    },
    [refresh]
  );

  const deleteVersionByName = useCallback(
    async (versionName) => {
      const version = findVersionByName(versionName);

      if (!version) {
        return;
      }

      await deleteVersion(version.id);
    },
    [deleteVersion, findVersionByName]
  );

  const updateSubmenus = useCallback(
    async (dbId, menus) => {
      const response = await versionApi.updateSubmenus(dbId, menus);
      await refresh();
      return response.data;
    },
    [refresh]
  );

  return {
    apiVersions,
    issueVersions,
    testCaseVersions,
    loading,
    error,
    refresh,
    findVersionByName,
    createVersion,
    updateVersion,
    deleteVersion,
    deleteVersionByName,
    updateSubmenus,
  };
}

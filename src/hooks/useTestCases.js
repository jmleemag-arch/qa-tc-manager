import { useCallback, useEffect, useState } from "react";
import testCaseApi from "../services/testCaseApi.js";

export function useTestCases(versionName = null) {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await testCaseApi.list(
        versionName ? { versionName } : {}
      );
      setTestCases(response.data ?? []);
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setTestCases([]);
    } finally {
      setLoading(false);
    }
  }, [versionName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTestCase = useCallback(
    async (payload) => {
      const response = await testCaseApi.create(payload);
      await refresh();
      return response.data;
    },
    [refresh]
  );

  const updateTestCase = useCallback(
    async (id, payload) => {
      const response = await testCaseApi.update(id, payload);
      await refresh();
      return response.data;
    },
    [refresh]
  );

  const deleteTestCases = useCallback(
    async (ids) => {
      const numericIds = ids.map((id) => Number(id)).filter((id) => Number.isFinite(id));

      if (numericIds.length === 1) {
        await testCaseApi.remove(numericIds[0]);
      } else if (numericIds.length > 1) {
        await testCaseApi.bulkDelete(numericIds);
      }

      await refresh();
    },
    [refresh]
  );

  const reorderTestCases = useCallback(
    async (orderedIds, reorderVersionName = versionName) => {
      const response = await testCaseApi.reorder({
        versionName: reorderVersionName,
        orderedIds,
      });
      setTestCases(response.data ?? []);
      return response.data;
    },
    [versionName]
  );

  return {
    testCases,
    loading,
    error,
    refresh,
    createTestCase,
    updateTestCase,
    deleteTestCases,
    reorderTestCases,
    setTestCases,
  };
}

export function useAllTestCases() {
  return useTestCases(null);
}

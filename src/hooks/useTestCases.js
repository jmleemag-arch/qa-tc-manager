import { useCallback, useEffect, useState } from "react";
import testCaseApi from "../services/testCaseApi.js";

export function useTestCases(versionId = null) {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (versionId === undefined) {
      setTestCases([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const response = await testCaseApi.list(
        versionId ? { versionId } : {}
      );
      setTestCases(response.data ?? []);
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setTestCases([]);
    } finally {
      setLoading(false);
    }
  }, [versionId]);

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
      const response = await testCaseApi.update(id, {
        ...payload,
        versionId,
      });
      await refresh();
      return response.data;
    },
    [refresh, versionId]
  );

  const deleteTestCases = useCallback(
    async (ids) => {
      const numericIds = ids.map((id) => Number(id)).filter((id) => Number.isFinite(id));

      if (numericIds.length === 1) {
        await testCaseApi.remove(numericIds[0], { versionId });
      } else if (numericIds.length > 1) {
        await testCaseApi.bulkDelete(numericIds, { versionId });
      }

      await refresh();
    },
    [refresh, versionId]
  );

  const reorderTestCases = useCallback(
    async (orderedIds, reorderVersionId = versionId) => {
      const response = await testCaseApi.reorder({
        versionId: reorderVersionId,
        orderedIds,
      });
      setTestCases(response.data ?? []);
      return response.data;
    },
    [versionId]
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

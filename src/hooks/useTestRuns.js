import { useCallback, useEffect, useState } from "react";
import testRunApi from "../services/testRunApi.js";

export function useTestRuns() {
  const [testRuns, setTestRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await testRunApi.list();
      setTestRuns(response.data ?? []);
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setTestRuns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTestRun = useCallback(
    async (payload) => {
      const response = await testRunApi.create(payload);
      await refresh();
      return response.data;
    },
    [refresh]
  );

  const deleteTestRun = useCallback(
    async (runId) => {
      await testRunApi.remove(runId);
      await refresh();
    },
    [refresh]
  );

  const updateTestRunItemResult = useCallback(
    async (runId, testCaseId, result) => {
      const response = await testRunApi.updateItemResult(
        runId,
        testCaseId,
        result
      );
      const updatedRun = response.data;

      setTestRuns((prev) =>
        prev.map((run) =>
          run.dbId === updatedRun.dbId ? updatedRun : run
        )
      );

      return updatedRun;
    },
    []
  );

  return {
    testRuns,
    loading,
    error,
    refresh,
    createTestRun,
    deleteTestRun,
    updateTestRunItemResult,
    setTestRuns,
  };
}

export default useTestRuns;

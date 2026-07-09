import { useCallback, useEffect, useState } from "react";
import dashboardApi from "../services/dashboardApi.js";

const EMPTY_STATS = {
  summaryCards: {
    totalTestCases: 0,
    totalTestCasesSub: "",
    passCount: 0,
    passCountSub: "",
    failCount: 0,
    failCountSub: "",
    emptyCount: 0,
    emptyCountSub: "",
    totalTestRuns: 0,
    totalTestRunsSub: "",
    totalDefects: 0,
    totalDefectsSub: "",
  },
  testRunStatus: {
    total: 0,
    segments: [],
  },
  recentTestRuns: [],
};

export function useDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await dashboardApi.getStats();
      setStats(response.data ?? EMPTY_STATS);
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    summaryCards: stats.summaryCards,
    testRunStatus: stats.testRunStatus,
    recentTestRuns: stats.recentTestRuns,
    loading,
    error,
    refresh,
  };
}

export default useDashboard;

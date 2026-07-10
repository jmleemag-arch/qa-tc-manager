import { useCallback, useEffect, useState } from "react";
import dashboardApi from "../services/dashboardApi.js";

const EMPTY_DASHBOARD = {
  currentVersion: null,
  versions: [],
  myTasks: [],
  testRuns: [],
  defectSummary: [],
  recentDefects: [],
  weeklyReports: [],
  notices: [],
};

export function useDashboard({ versionId, userId } = {}) {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await dashboardApi.getOverview({ versionId, userId });
      setDashboard(response.data ?? EMPTY_DASHBOARD);
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setDashboard(EMPTY_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [versionId, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...dashboard,
    loading,
    error,
    refresh,
  };
}

export default useDashboard;

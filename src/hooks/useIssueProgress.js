import { useCallback, useEffect, useState } from "react";
import issueApi from "../services/issueApi.js";
import issueProgressApi from "../services/issueProgressApi.js";
import { sortIssueRounds } from "../features/defects/utils/issueRoundUtils.js";

const EMPTY_OVERVIEW_STATS = {
  menuDistribution: [],
  recentIssues: [],
  severityDistribution: {
    total: 0,
    segments: [],
  },
};

export function useIssueProgress() {
  const [rowsByVersion, setRowsByVersion] = useState({});
  const [overviewStats, setOverviewStats] = useState(EMPTY_OVERVIEW_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const [progressResponse, statsResponse] = await Promise.all([
        issueProgressApi.listByVersion(),
        issueApi.getOverviewStats(),
      ]);

      setRowsByVersion(progressResponse.data ?? {});
      setOverviewStats(statsResponse.data ?? EMPTY_OVERVIEW_STATS);
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setRowsByVersion({});
      setOverviewStats(EMPTY_OVERVIEW_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveIssueRound = useCallback(
    async (roundData, options = {}) => {
      const response = await issueProgressApi.update(roundData.dbId, {
        total: roundData.total,
        inProgress: roundData.inProgress,
        newCount: roundData.newCount,
        status: options.markComplete ? "작성완료" : roundData.status,
      });
      const savedRound = response.data;

      setRowsByVersion((prev) => {
        const versionName = savedRound.versionName;
        const currentRows = prev[versionName] ?? [];

        return {
          ...prev,
          [versionName]: sortIssueRounds(
            currentRows.map((row) =>
              row.dbId === savedRound.dbId ? savedRound : row
            )
          ),
        };
      });

      await refresh();
      return savedRound;
    },
    [refresh]
  );

  return {
    rowsByVersion,
    overviewStats,
    loading,
    error,
    refresh,
    saveIssueRound,
  };
}

export default useIssueProgress;

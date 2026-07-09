import { useCallback, useEffect, useMemo, useState } from "react";
import { ASSIGNEE_FILTER_ALL } from "../features/defects/constants/defectConstants.js";
import issueApi from "../services/issueApi.js";

export function useNewIssues({
  selectedRound,
  searchText = "",
  assigneeFilter = ASSIGNEE_FILTER_ALL,
  page = 1,
  pageSize = 20,
} = {}) {
  const [rounds, setRounds] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedYear = selectedRound?.year ?? new Date().getFullYear();

  const refreshMeta = useCallback(async () => {
    const [roundsResponse, assigneesResponse] = await Promise.all([
      issueApi.getRounds({ year: selectedYear }),
      issueApi.getAssignees(),
    ]);

    setRounds(roundsResponse.data ?? []);
    setAssigneeOptions(assigneesResponse.data ?? []);
    return roundsResponse.data ?? [];
  }, [selectedYear]);

  const refreshIssues = useCallback(async () => {
    if (!selectedRound) {
      return;
    }

    setLoading(true);

    try {
      const response = await issueApi.list({
        roundYear: selectedRound.year,
        roundMonth: selectedRound.month,
        roundWeek: selectedRound.weekOfMonth,
        search: searchText,
        assignee: assigneeFilter,
        page,
        pageSize,
      });

      const data = response.data ?? {};
      setIssues(data.items ?? []);
      setPagination({
        total: data.total ?? 0,
        page: data.page ?? page,
        pageSize: data.pageSize ?? pageSize,
        totalPages: data.totalPages ?? 1,
      });
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [assigneeFilter, page, pageSize, searchText, selectedRound]);

  const fetchAllIssuesForRound = useCallback(async () => {
    if (!selectedRound) {
      return [];
    }

    const response = await issueApi.list({
      roundYear: selectedRound.year,
      roundMonth: selectedRound.month,
      roundWeek: selectedRound.weekOfMonth,
      search: searchText,
      assignee: assigneeFilter,
      page: 1,
      pageSize: 10000,
    });

    return response.data?.items ?? [];
  }, [assigneeFilter, searchText, selectedRound]);

  useEffect(() => {
    refreshMeta().catch((nextError) => {
      setError(nextError);
    });
  }, [refreshMeta]);

  useEffect(() => {
    refreshIssues();
  }, [refreshIssues]);

  const defaultRound = useMemo(() => {
    if (rounds.length > 0) {
      return rounds[0];
    }

    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      weekOfMonth: 1,
      roundLabel: "",
      thursdayDate: today.toISOString().slice(0, 10),
      roundKey: `${today.getFullYear()}-${today.getMonth() + 1}-1`,
    };
  }, [rounds]);

  const createIssue = useCallback(
    async (payload) => {
      const response = await issueApi.create(payload);
      await refreshMeta();
      await refreshIssues();
      return response.data;
    },
    [refreshIssues, refreshMeta]
  );

  const retryRedmine = useCallback(
    async (issueId) => {
      const response = await issueApi.retryRedmine(issueId);
      await refreshIssues();
      return response.data;
    },
    [refreshIssues]
  );

  return {
    issues,
    rounds,
    assigneeOptions,
    pagination,
    loading,
    error,
    defaultRound,
    refreshMeta,
    refreshIssues,
    fetchAllIssuesForRound,
    createIssue,
    retryRedmine,
  };
}

export default useNewIssues;

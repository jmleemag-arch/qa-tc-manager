import { useCallback, useEffect, useMemo, useState } from "react";
import { ASSIGNEE_FILTER_ALL } from "../features/defects/constants/defectConstants.js";
import {
  getDefaultWeekAnchor,
  getWeekRange,
} from "../features/defects/utils/newIssueUtils.js";
import issueApi from "../services/issueApi.js";

export function useNewIssues({
  weekAnchorDate,
  searchText = "",
  assigneeFilter = ASSIGNEE_FILTER_ALL,
  page = 1,
  pageSize = 20,
} = {}) {
  const [weeksWithData, setWeeksWithData] = useState([]);
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

  const weekRange = useMemo(
    () => (weekAnchorDate ? getWeekRange(weekAnchorDate) : null),
    [weekAnchorDate]
  );

  const refreshMeta = useCallback(async () => {
    const [weeksResponse, assigneesResponse] = await Promise.all([
      issueApi.getWeeks(),
      issueApi.getAssignees(),
    ]);

    const weeks = (weeksResponse.data ?? []).map((week) => week.weekStart);
    setWeeksWithData(weeks);
    setAssigneeOptions(assigneesResponse.data ?? []);
    return weeks;
  }, []);

  const refreshIssues = useCallback(async () => {
    if (!weekRange) {
      return;
    }

    setLoading(true);

    try {
      const response = await issueApi.list({
        weekStart: weekRange.startDate,
        weekEnd: weekRange.endDate,
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
  }, [assigneeFilter, page, pageSize, searchText, weekRange]);

  useEffect(() => {
    refreshMeta().catch((nextError) => {
      setError(nextError);
    });
  }, [refreshMeta]);

  useEffect(() => {
    refreshIssues();
  }, [refreshIssues]);

  const defaultWeekAnchor = useMemo(() => {
    if (weeksWithData.length > 0) {
      return weeksWithData[weeksWithData.length - 1];
    }

    return getDefaultWeekAnchor([]);
  }, [weeksWithData]);

  return {
    issues,
    weeksWithData,
    assigneeOptions,
    pagination,
    loading,
    error,
    defaultWeekAnchor,
    refreshMeta,
    refreshIssues,
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateValue(dateValue) {
  return new Date(`${dateValue}T00:00:00`);
}

export function getWeekStartDate(dateValue) {
  const date = parseDateValue(dateValue);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diff);

  return toDateValue(date);
}

export function addDays(dateValue, days) {
  const date = parseDateValue(dateValue);

  date.setDate(date.getDate() + days);

  return toDateValue(date);
}

export function getWeekRange(dateValue) {
  const startDate = getWeekStartDate(dateValue);
  const endDate = addDays(startDate, 6);

  return { startDate, endDate };
}

export function getWeekOfMonthLabel(dateValue) {
  const date = parseDateValue(dateValue);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const weekIndex = Math.ceil(date.getDate() / 7);

  return `${year}년 ${month}월 ${weekIndex}주차`;
}

export function formatWeekRangeLabel(startDate, endDate) {
  const format = (value) => value.replaceAll("-", ".");

  return `(${format(startDate)} ~ ${format(endDate)})`;
}

export function isDateInRange(dateValue, startDate, endDate) {
  return dateValue >= startDate && dateValue <= endDate;
}

export function getWeekAnchorDate(dateValue) {
  return getWeekStartDate(dateValue);
}

export function getWeeksWithData(issues = []) {
  const weekStarts = new Set();

  issues.forEach((issue) => {
    weekStarts.add(getWeekStartDate(issue.registeredAt));
  });

  return [...weekStarts].sort((a, b) => a.localeCompare(b));
}

export function getDefaultWeekAnchor(issues = []) {
  const weeksWithData = getWeeksWithData(issues);

  if (weeksWithData.length === 0) {
    return getWeekStartDate(new Date().toISOString().slice(0, 10));
  }

  return weeksWithData[weeksWithData.length - 1];
}

export function getAdjacentWeekAnchor(currentAnchor, weeksWithData, direction) {
  if (weeksWithData.length === 0) {
    return null;
  }

  const currentIndex = weeksWithData.indexOf(currentAnchor);
  const resolvedIndex =
    currentIndex === -1
      ? weeksWithData.findIndex((week) => week >= currentAnchor)
      : currentIndex;

  const baseIndex = resolvedIndex === -1 ? weeksWithData.length - 1 : resolvedIndex;
  const nextIndex = baseIndex + direction;

  if (nextIndex < 0 || nextIndex >= weeksWithData.length) {
    return null;
  }

  return weeksWithData[nextIndex];
}

export function resolveWeekAnchorFromDate(dateValue, issues = []) {
  const weeksWithData = getWeeksWithData(issues);

  if (weeksWithData.length === 0) {
    return getWeekStartDate(dateValue);
  }

  const targetWeek = getWeekStartDate(dateValue);

  if (weeksWithData.includes(targetWeek)) {
    return targetWeek;
  }

  const targetTime = parseDateValue(targetWeek).getTime();

  return weeksWithData.reduce((closest, week) => {
    const closestDiff = Math.abs(parseDateValue(closest).getTime() - targetTime);
    const weekDiff = Math.abs(parseDateValue(week).getTime() - targetTime);

    return weekDiff < closestDiff ? week : closest;
  });
}

export function filterNewIssues(issues, { startDate, endDate, searchText, assigneeFilter }) {
  const normalizedSearch = searchText.trim().toLowerCase();

  return issues.filter((issue) => {
    const matchesWeek = isDateInRange(issue.registeredAt, startDate, endDate);
    const matchesSearch =
      !normalizedSearch ||
      issue.issueId.toLowerCase().includes(normalizedSearch) ||
      issue.title.toLowerCase().includes(normalizedSearch);
    const matchesAssignee =
      assigneeFilter === "담당자 전체" || issue.assignee === assigneeFilter;

    return matchesWeek && matchesSearch && matchesAssignee;
  });
}

export function getAssigneeOptions(issues) {
  return [...new Set(issues.map((issue) => issue.assignee))].sort((a, b) =>
    a.localeCompare(b, "ko")
  );
}

export function paginateItems(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalPages,
    items: items.slice(startIndex, startIndex + pageSize),
  };
}

export function getWeekStartDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function getWeekEndDate(weekStartDate) {
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + 6);
  return end;
}

export function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekRangeFromDate(dateValue) {
  const weekStart = getWeekStartDate(dateValue);
  const weekEnd = getWeekEndDate(weekStart);

  return {
    weekStart,
    weekEnd,
    startDate: formatDateOnly(weekStart),
    endDate: formatDateOnly(weekEnd),
  };
}

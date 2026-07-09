import { ISSUE_ROUND_STATUS } from "../constants/defectConstants.js";

export function sortIssueRounds(rounds = []) {
  return [...rounds].sort((left, right) => {
    if (right.year !== left.year) {
      return right.year - left.year;
    }

    if (right.month !== left.month) {
      return right.month - left.month;
    }

    if (right.weekOfMonth !== left.weekOfMonth) {
      return right.weekOfMonth - left.weekOfMonth;
    }

    return (right.dbId ?? 0) - (left.dbId ?? 0);
  });
}

export function filterRoundsByYear(rounds = [], year) {
  if (!year) {
    return sortIssueRounds(rounds);
  }

  const numericYear = Number(year);

  return sortIssueRounds(
    rounds.filter((round) => Number(round.year) === numericYear)
  );
}

export function groupRoundsByYearMonth(rounds = []) {
  const grouped = {};

  sortIssueRounds(rounds).forEach((round) => {
    if (!grouped[round.year]) {
      grouped[round.year] = {};
    }

    if (!grouped[round.year][round.month]) {
      grouped[round.year][round.month] = [];
    }

    grouped[round.year][round.month].push(round);
  });

  return grouped;
}

export function getLatestWrittenRound(rounds = []) {
  return sortIssueRounds(rounds).find(
    (round) =>
      round.status !== ISSUE_ROUND_STATUS.NOT_STARTED ||
      round.total !== null ||
      round.inProgress !== null ||
      round.newCount !== null
  );
}

export function getChartRounds(rounds = []) {
  return sortIssueRounds(rounds)
    .filter(
      (round) =>
        round.total !== null &&
        round.inProgress !== null &&
        round.newCount !== null
    )
    .reverse();
}

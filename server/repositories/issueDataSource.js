import * as prismaIssueRepository from "./prismaIssueRepository.js";

const ISSUE_DATA_SOURCE = process.env.ISSUE_DATA_SOURCE ?? "db";

function getRepository() {
  if (ISSUE_DATA_SOURCE === "redmine") {
    throw new Error("REDMINE_ISSUE_SOURCE_NOT_IMPLEMENTED");
  }

  return prismaIssueRepository;
}

export function getIssueRepository() {
  return getRepository();
}

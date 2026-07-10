import { Router } from "express";
import {
  createIssue,
  getIssueAssignees,
  getIssueById,
  getIssueRounds,
  getIssueWeeks,
  listIssues,
  retryRedmineIssue,
  syncIssuesFromRedmine,
  updateIssue,
} from "../services/issueService.js";
import {
  getDefaultRedmineProject,
  isRedmineMockMode,
} from "../integrations/redmineClient.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listIssues({
      weekStart: req.query.weekStart,
      weekEnd: req.query.weekEnd,
      roundYear: req.query.roundYear,
      roundMonth: req.query.roundMonth,
      roundWeek: req.query.roundWeek,
      search: req.query.search,
      assignee: req.query.assignee,
      versionId: req.query.versionId,
      status: req.query.status,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/config", async (_req, res) => {
  res.json({
    data: {
      defaultProject: getDefaultRedmineProject(),
      mockMode: isRedmineMockMode(),
      priorityOptions: ["Low", "Normal", "High", "Urgent"],
    },
  });
});

router.get("/rounds", async (req, res, next) => {
  try {
    const data = await getIssueRounds({
      year: req.query.year,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/overview-stats", async (_req, res, next) => {
  try {
    const { getIssueOverviewStats } = await import(
      "../services/issueProgressService.js"
    );
    const data = await getIssueOverviewStats();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/weeks", async (_req, res, next) => {
  try {
    const data = await getIssueWeeks();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/assignees", async (_req, res, next) => {
  try {
    const data = await getIssueAssignees();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post("/sync", async (_req, res, next) => {
  try {
    const data = await syncIssuesFromRedmine();
    res.json({ data });
  } catch (error) {
    if (error.message === "REDMINE_SYNC_NOT_IMPLEMENTED") {
      res.status(501).json({ error: error.message });
      return;
    }

    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const issue = await getIssueById(req.params.id);

    if (!issue) {
      res.status(404).json({ error: "ISSUE_NOT_FOUND" });
      return;
    }

    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const issue = await createIssue(req.body);
    res.status(201).json({ data: issue });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/retry-redmine", async (req, res, next) => {
  try {
    const issue = await retryRedmineIssue(req.params.id);

    if (!issue) {
      res.status(404).json({ error: "ISSUE_NOT_FOUND" });
      return;
    }

    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const issue = await updateIssue(req.params.id, req.body);

    if (!issue) {
      res.status(404).json({ error: "ISSUE_NOT_FOUND" });
      return;
    }

    res.json({ data: issue });
  } catch (error) {
    next(error);
  }
});

export default router;

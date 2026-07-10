import { Router } from "express";
import {
  listIssueProgressByVersion,
  listIssueProgressRounds,
  updateIssueProgressRound,
} from "../services/issueProgressService.js";

const router = Router();

router.get("/rounds", async (req, res, next) => {
  try {
    const data = await listIssueProgressRounds({
      versionId: req.query.versionId,
      year: req.query.year,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const data = await listIssueProgressByVersion();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const round = await updateIssueProgressRound(req.params.id, req.body);

    if (!round) {
      res.status(404).json({ error: "ROUND_NOT_FOUND" });
      return;
    }

    res.json({ data: round });
  } catch (error) {
    if (
      [
        "INVALID_COUNTS",
        "INVALID_COUNT_RANGE",
        "COMPLETE_REQUIRES_ALL_COUNTS",
      ].includes(error.message)
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

export default router;

import { Router } from "express";
import {
  listIssueProgressByVersion,
  updateIssueProgressRound,
} from "../services/issueProgressService.js";

const router = Router();

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

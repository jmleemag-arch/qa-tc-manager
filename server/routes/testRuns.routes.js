import { Router } from "express";
import {
  createTestRun,
  deleteTestRun,
  getTestRunById,
  listTestRuns,
  updateTestRunItemResult,
} from "../services/testRunService.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const data = await listTestRuns();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const testRun = await getTestRunById(req.params.id);

    if (!testRun) {
      res.status(404).json({ error: "TEST_RUN_NOT_FOUND" });
      return;
    }

    res.json({ data: testRun });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const testRun = await createTestRun(req.body);
    res.status(201).json({ data: testRun });
  } catch (error) {
    if (
      [
        "RUN_NAME_REQUIRED",
        "VERSION_REQUIRED",
        "TARGET_MENU_REQUIRED",
        "TEST_CASE_REQUIRED",
        "TEST_CASE_NOT_FOUND",
      ].includes(error.message)
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

router.patch("/:id/items/:testCaseId", async (req, res, next) => {
  try {
    const testRun = await updateTestRunItemResult(
      req.params.id,
      req.params.testCaseId,
      req.body?.result
    );

    if (!testRun) {
      res.status(404).json({ error: "TEST_RUN_ITEM_NOT_FOUND" });
      return;
    }

    res.json({ data: testRun });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await deleteTestRun(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "TEST_RUN_NOT_FOUND" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

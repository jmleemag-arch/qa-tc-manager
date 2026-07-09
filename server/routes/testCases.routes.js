import { Router } from "express";
import {
  bulkDeleteTestCases,
  createTestCase,
  deleteTestCase,
  getTestCaseById,
  listTestCases,
  reorderTestCases,
  updateTestCase,
} from "../services/testCaseService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listTestCases({
      versionName: req.query.versionName ?? req.query.version,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.put("/reorder", async (req, res, next) => {
  try {
    const data = await reorderTestCases({
      versionName: req.body?.versionName ?? req.body?.versionId,
      orderedIds: req.body?.orderedIds ?? [],
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post("/bulk-delete", async (req, res, next) => {
  try {
    const count = await bulkDeleteTestCases(req.body?.ids ?? []);
    res.json({ data: { count } });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const testCase = await getTestCaseById(req.params.id);

    if (!testCase) {
      res.status(404).json({ error: "TEST_CASE_NOT_FOUND" });
      return;
    }

    res.json({ data: testCase });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const testCase = await createTestCase(req.body);
    res.status(201).json({ data: testCase });
  } catch (error) {
    if (error.message === "MENU_REQUIRED") {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.code === "P2002") {
      res.status(409).json({ error: "TEST_CASE_ALREADY_EXISTS" });
      return;
    }

    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const testCase = await updateTestCase(req.params.id, req.body);

    if (!testCase) {
      res.status(404).json({ error: "TEST_CASE_NOT_FOUND" });
      return;
    }

    res.json({ data: testCase });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await deleteTestCase(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "TEST_CASE_NOT_FOUND" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

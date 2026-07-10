import { Router } from "express";
import {
  createVersion,
  deleteVersion,
  getVersionById,
  listVersions,
  updateVersion,
  updateVersionSubmenus,
} from "../services/versionService.js";
import { listTestCases } from "../services/testCaseService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const versions = await listVersions({
      year: req.query.year,
    });

    res.json({ data: versions });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/test-cases", async (req, res, next) => {
  try {
    const data = await listTestCases({
      versionId: req.params.id,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const version = await getVersionById(req.params.id);

    if (!version) {
      res.status(404).json({ error: "VERSION_NOT_FOUND" });
      return;
    }

    res.json({ data: version });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const version = await createVersion(req.body);
    res.status(201).json({ data: version });
  } catch (error) {
    if (error.message === "VERSION_NAME_REQUIRED") {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.code === "P2002") {
      res.status(409).json({ error: "VERSION_ALREADY_EXISTS" });
      return;
    }

    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const version = await updateVersion(req.params.id, req.body);

    if (!version) {
      res.status(404).json({ error: "VERSION_NOT_FOUND" });
      return;
    }

    res.json({ data: version });
  } catch (error) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "VERSION_ALREADY_EXISTS" });
      return;
    }

    next(error);
  }
});

router.put("/:id/submenus", async (req, res, next) => {
  try {
    const version = await updateVersionSubmenus(
      req.params.id,
      req.body?.menus ?? []
    );

    if (!version) {
      res.status(404).json({ error: "VERSION_NOT_FOUND" });
      return;
    }

    res.json({ data: version });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await deleteVersion(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "VERSION_NOT_FOUND" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error.message === "VERSION_HAS_TEST_RUNS") {
      res.status(409).json({ error: error.message });
      return;
    }

    next(error);
  }
});

export default router;

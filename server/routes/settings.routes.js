import { Router } from "express";
import {
  getAllSettings,
  getSessionSettings,
  getSettingSection,
  updateSettings,
  upsertSettingSection,
} from "../services/settingsService.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const settings = await getAllSettings();
    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
});

router.get("/session", async (_req, res, next) => {
  try {
    const session = await getSessionSettings();
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
});

router.get("/:key", async (req, res, next) => {
  try {
    const value = await getSettingSection(req.params.key);

    if (value === null || value === undefined) {
      res.status(404).json({ error: "SETTING_NOT_FOUND" });
      return;
    }

    res.json({ data: value });
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const settings = await updateSettings(req.body ?? {});
    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
});

router.patch("/:key", async (req, res, next) => {
  try {
    const value = await upsertSettingSection(req.params.key, req.body ?? {});
    res.json({ data: value });
  } catch (error) {
    next(error);
  }
});

export default router;

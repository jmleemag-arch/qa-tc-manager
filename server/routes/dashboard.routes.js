import { Router } from "express";
import {
  buildWeeklyReportWorkbook,
  getDashboardOverview,
} from "../services/dashboardService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await getDashboardOverview({
      versionId: req.query.versionId,
      userId: req.query.userId,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const data = await getDashboardOverview({
      versionId: req.query.versionId,
      userId: req.query.userId,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/weekly-reports/:id/export", async (req, res, next) => {
  try {
    const workbook = await buildWeeklyReportWorkbook({
      roundId: req.params.id,
      versionId: req.query.versionId,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="weekly-report-${req.params.id}.xlsx"`
    );
    res.send(workbook);
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from "express";
import { getDashboardStats } from "../services/dashboardService.js";

const router = Router();

router.get("/stats", async (_req, res, next) => {
  try {
    const data = await getDashboardStats();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;

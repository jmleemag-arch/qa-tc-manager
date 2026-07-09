import { Router } from "express";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listNotifications({
      userId: req.query.userId,
      limit: req.query.limit,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await markNotificationRead(
      req.params.id,
      req.query.userId
    );

    if (!notification) {
      res.status(404).json({ error: "NOTIFICATION_NOT_FOUND" });
      return;
    }

    res.json({ data: notification });
  } catch (error) {
    next(error);
  }
});

router.post("/mark-all-read", async (req, res, next) => {
  try {
    const data = await markAllNotificationsRead(req.body?.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;

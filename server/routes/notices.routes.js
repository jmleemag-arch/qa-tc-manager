import { Router } from "express";
import {
  createNotice,
  getNoticeById,
  listNotices,
} from "../services/noticeService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listNotices({
      limit: req.query.limit,
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const notice = await getNoticeById(req.params.id);

    if (!notice) {
      res.status(404).json({ error: "NOTICE_NOT_FOUND" });
      return;
    }

    res.json({ data: notice });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const notice = await createNotice(req.body);
    res.status(201).json({ data: notice });
  } catch (error) {
    if (error.message === "NOTICE_TITLE_REQUIRED") {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

export default router;

import { Router } from "express";
import { listUserTasks, updateUserTask } from "../services/userTaskService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listUserTasks({
      userId: req.query.userId,
      tab: req.query.tab,
      type: req.query.type,
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

router.patch("/:id", async (req, res, next) => {
  try {
    const task = await updateUserTask(req.params.id, req.query.userId, req.body);

    if (!task) {
      res.status(404).json({ error: "TASK_NOT_FOUND" });
      return;
    }

    res.json({ data: task });
  } catch (error) {
    next(error);
  }
});

export default router;

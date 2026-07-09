import { Router } from "express";
import { getUserByUserId, login } from "../services/authService.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const user = await login(req.body?.userId, req.body?.password);

    if (!user) {
      res.status(401).json({ error: "INVALID_CREDENTIALS" });
      return;
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:userId", async (req, res, next) => {
  try {
    const user = await getUserByUserId(req.params.userId);

    if (!user) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

export default router;

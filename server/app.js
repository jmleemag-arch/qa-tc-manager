import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import issuesRoutes from "./routes/issues.routes.js";
import issueProgressRoutes from "./routes/issueProgress.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import myTasksRoutes from "./routes/myTasks.routes.js";
import noticesRoutes from "./routes/notices.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import testCasesRoutes from "./routes/testCases.routes.js";
import testRunsRoutes from "./routes/testRuns.routes.js";
import versionsRoutes from "./routes/versions.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/versions", versionsRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/issues", issuesRoutes);
app.use("/api/v1/issue-progress", issueProgressRoutes);
app.use("/api/v1/test-cases", testCasesRoutes);
app.use("/api/v1/test-runs", testRunsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/my-tasks", myTasksRoutes);
app.use("/api/v1/notices", noticesRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: error.message,
  });
});

export default app;

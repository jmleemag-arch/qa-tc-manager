import cors from "cors";
import express from "express";
import issuesRoutes from "./routes/issues.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import versionsRoutes from "./routes/versions.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/versions", versionsRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/issues", issuesRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: error.message,
  });
});

export default app;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/testcases.css";
import "./styles/testRuns.css";
import "./styles/dashboard.css";
import "./styles/defects.css";
import "./styles/weekly-progress.css";
import "./styles/my-tasks.css";
import "./styles/settings.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

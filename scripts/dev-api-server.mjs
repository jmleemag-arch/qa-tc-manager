import { execSync, spawn } from "node:child_process";
import { watch } from "node:fs";

const PORT = String(process.env.PORT ?? "3001");
const SERVER_ENTRY = "server/index.js";

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
      });

      const pids = new Set(
        output
          .split(/\r?\n/)
          .filter((line) => line.includes("LISTENING"))
          .map((line) => line.trim().split(/\s+/).at(-1))
          .filter((pid) => pid && pid !== "0")
      );

      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      }

      return;
    }

    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
  } catch {
    // Port is already free.
  }
}

function startServer() {
  killPort(PORT);

  const child = spawn(process.execPath, [SERVER_ENTRY], {
    stdio: "inherit",
    env: process.env,
  });

  return child;
}

let serverProcess = startServer();
let restartTimer = null;

function scheduleRestart() {
  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill("SIGTERM");
    }

    serverProcess = startServer();
  }, 200);
}

watch("server", { recursive: true }, (_eventType, fileName) => {
  if (!fileName || !fileName.endsWith(".js")) {
    return;
  }

  scheduleRestart();
});

serverProcess.on("exit", (code, signal) => {
  if (signal === "SIGTERM") {
    return;
  }

  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill("SIGTERM");
  }

  process.exit(0);
});

process.on("SIGTERM", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill("SIGTERM");
  }

  process.exit(0);
});

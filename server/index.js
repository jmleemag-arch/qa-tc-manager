import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);

const server = app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the existing API server and run npm run dev again.`
    );
  } else {
    console.error(error);
  }

  process.exit(1);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

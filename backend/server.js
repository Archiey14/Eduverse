import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

// Connect to MongoDB
connectDB();

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  console.log(
    `[Eduverse LMS Backend] Server running in ${ENV.NODE_ENV} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle graceful shutdown for nodemon restarts and Ctrl+C
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  if (server.closeAllConnections) server.closeAllConnections();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", () => {
  server.close(() => {
    process.kill(process.pid, "SIGUSR2");
  });
});

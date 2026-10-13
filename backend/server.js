
import { createServer } from "node:http";

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";
import { initializeSocket } from "./src/config/socket.js";

// =====================================================
// CREATE HTTP SERVER
// =====================================================

// Express and Socket.IO share the same HTTP server.
const httpServer = createServer(app);

// =====================================================
// INITIALIZE SOCKET.IO
// =====================================================

initializeSocket(httpServer);

// =====================================================
// CONNECT TO MONGODB
// =====================================================

connectDB();

// =====================================================
// START SERVER
// =====================================================

const PORT = ENV.PORT;

httpServer.listen(PORT, () => {
  console.log(
    `[Eduverse LMS Backend] Server running in ${ENV.NODE_ENV} mode on port ${PORT}`
  );
});

// =====================================================
// HANDLE UNHANDLED PROMISE REJECTIONS
// =====================================================

process.on("unhandledRejection", (err) => {
  console.error("[Unhandled Rejection]", err);

  httpServer.close(() => {
    process.exit(1);
  });
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`[${signal}] Shutting down gracefully...`);

  if (httpServer.closeAllConnections) {
    httpServer.closeAllConnections();
  }

  httpServer.close((error) => {
    if (error) {
      console.error("Error closing HTTP server:", error);
      process.exitCode = 1;
    }

    process.exit();
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Preserve support for development tools (like nodemon) that restart the server.
process.once("SIGUSR2", () => {
  if (httpServer.closeAllConnections) {
    httpServer.closeAllConnections();
  }

  httpServer.close(() => {
    process.kill(process.pid, "SIGUSR2");
  });
});

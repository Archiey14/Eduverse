import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { ENV } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { AppError } from "./utils/AppError.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import learnRoutes from "./routes/learnRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps), any localhost
      // port during development, and the configured CLIENT_URL.
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || origin === ENV.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to /api
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
    environment: ENV.NODE_ENV,
  });
});

// Mount modular routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/learn", learnRoutes);
app.use("/api/student", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/wishlist", wishlistRoutes);

// 404 Handler for undefined routes
app.all("*", (req, res, next) => {
  next(
    new AppError(404, `Cannot find route ${req.method} ${req.originalUrl} on this server.`)
  );
});

// Central Error Handler
app.use(errorHandler);

export default app;

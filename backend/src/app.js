import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

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
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// =====================================================
// SECURITY
// =====================================================

app.use(
  helmet({
    // Allow frontend (localhost:5173) to display
    // profile pictures served by backend (localhost:5001)
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      // (Postman, curl, mobile apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost and 127.0.0.1 during development
      const isLocalhost =
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      // Allow configured frontend URL
      if (isLocalhost || origin === ENV.CLIENT_URL) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
  })
);

// =====================================================
// LOGGING
// =====================================================

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// STATIC FILES
// =====================================================

// Profile pictures are stored inside:
// C:\LMS\backend\uploads

const uploadsPath = path.resolve("uploads");

app.use("/uploads", express.static(uploadsPath));

// =====================================================
// API RATE LIMITER
// =====================================================

app.use("/api", apiLimiter);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
    environment: ENV.NODE_ENV,
  });
});

// =====================================================
// API ROUTES
// =====================================================

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

app.use("/api/chat", aiRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.all("*", (req, res, next) => {
  next(
    new AppError(
      404,
      `Cannot find route ${req.method} ${req.originalUrl} on this server.`
    )
  );
});

// =====================================================
// CENTRAL ERROR HANDLER
// =====================================================

app.use(errorHandler);

export default app;
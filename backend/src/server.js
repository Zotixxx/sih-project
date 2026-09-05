import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import lmoRoutes from "./routes/lmo.routes.js";
import inspectionRoutes from "./routes/inspection.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";
import publicRoutes from "./routes/public.routes.js";
import businessRoutes from "./routes/business.routes.js";
import instrumentRoutes from "./routes/instrument.routes.js";
import documentRoutes from "./routes/document.routes.js";
import { rateLimit } from "./middleware/rateLimit.middleware.js";

const app = express();
const PORT = process.env.PORT || 5001;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

// Middleware
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "12mb" }));
app.use(morgan("dev"));
app.use("/api/public", rateLimit({ windowMs: 60_000, max: 60, keyPrefix: "public" }));
app.use("/api", rateLimit({ windowMs: 60_000, max: 300, keyPrefix: "api" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "MetriX Authority REST Engine",
    timestamp: new Date().toISOString(),
    systemRoles: ["BUSINESS", "LMO", "ASSISTANT_CONTROLLER", "SYSTEM_ADMIN"],
  });
});

// Mounted Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/instruments", instrumentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/lmos", lmoRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/documents", documentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `The requested endpoint ${req.method} ${req.url} does not exist.`,
    },
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected internal server error occurred.",
    },
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`MetriX Legal Metrology Engine listening on port ${PORT}`);
  console.log(`Data Source: Supabase PostgreSQL`);
  console.log(`Architecture: Supabase Auth + Express Authorization + RLS`);
  console.log(`REST Base URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

export default app;

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { db } from "./data/db.js";

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
import { authMiddleware } from "./middleware/auth.middleware.js";
import { requireRole } from "./middleware/role.middleware.js";
import { ROLES } from "./constants/roles.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "MetriX Authority REST Engine",
    timestamp: new Date().toISOString(),
    supportedDistricts: ["AJM", "JPR"],
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

// Database Reset Endpoint (for test suites)
app.post("/api/reset", authMiddleware, requireRole(ROLES.SYSTEM_ADMIN), (req, res) => {
  db.reset();
  res.json({
    success: true,
    message: "MetriX multi-district database reset to initial seed state.",
  });
});

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
  console.log(`🏛️ MetriX Legal Metrology Engine listening on port ${PORT}`);
  console.log(`📍 Districts Active: Ajmer (AJM), Jaipur (JPR)`);
  console.log(`🛡️ Architecture: Multi-District Role-Based Regulatory Model`);
  console.log(`🚀 REST Base URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

export default app;

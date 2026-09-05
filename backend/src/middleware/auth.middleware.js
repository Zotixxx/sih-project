import { userRepository } from "../repositories/userRepository.js";
import { ROLES } from "../constants/roles.js";
import crypto from "node:crypto";

const TOKEN_SECRET = process.env.METRIX_AUTH_SECRET || "metrix-local-development-secret";

export const createAuthToken = (userId) => {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
};

const getUserIdFromToken = (token) => {
  const [userId, expiresAt, signature] = token.split(".");
  if (!userId || !expiresAt || !signature || Number(expiresAt) < Date.now()) return null;

  const payload = `${userId}.${expiresAt}`;
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  return userId;
};

export const authMiddleware = async (req, res, next) => {
  try {
    let userId = null;
    if (req.headers["authorization"]) {
      const authHeader = req.headers["authorization"];
      if (authHeader.startsWith("Bearer ")) {
        userId = getUserIdFromToken(authHeader.substring(7).trim());
      }
    }

    // Header identity remains available for local automated tests only.
    if (!userId && process.env.NODE_ENV !== "production") {
      userId = req.headers["x-user-id"];
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      });
    }

    const user = await userRepository.getById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: `User identity '${userId}' not found in registry.`,
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Internal error during identity verification.",
      },
    });
  }
};

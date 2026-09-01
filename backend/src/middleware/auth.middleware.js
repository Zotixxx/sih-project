import { userRepository } from "../repositories/userRepository.js";
import { ROLES } from "../constants/roles.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Look for user identifier in headers
    let userId = req.headers["x-user-id"];
    
    if (!userId && req.headers["authorization"]) {
      const authHeader = req.headers["authorization"];
      if (authHeader.startsWith("Bearer ")) {
        userId = authHeader.substring(7).trim();
      }
    }

    // Default to Assistant Controller Ajmer if no user header passed
    if (!userId) {
      userId = "AC-AJM-001";
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

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Forbidden: role '${req.user.role}' is not authorized to perform this operation. Allowed roles: ${allowedRoles.join(", ")}.`,
        },
      });
    }

    next();
  };
};

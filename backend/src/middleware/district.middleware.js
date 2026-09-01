export const requireDistrictAccess = (resourceDistrictExtractor) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      });
    }

    // SYSTEM_ADMIN has statewide jurisdiction
    if (req.user.role === "SYSTEM_ADMIN" || req.user.district_id === "ALL") {
      return next();
    }

    const resourceDistrictId = typeof resourceDistrictExtractor === "function"
      ? resourceDistrictExtractor(req)
      : req.params.district_id || req.query.district_id || req.body?.district_id;

    if (!resourceDistrictId) {
      return next();
    }

    if (req.user.district_id !== resourceDistrictId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Forbidden: User district '${req.user.district_id}' is not authorized to access resources belonging to district '${resourceDistrictId}'.`,
        },
      });
    }

    next();
  };
};

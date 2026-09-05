const buckets = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 120, keyPrefix = "global" } = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${req.ip}:${req.user?.id || "anonymous"}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait before retrying.",
        },
      });
    }

    return next();
  };
};

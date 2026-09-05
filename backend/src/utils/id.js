const SAFE_ID_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,63}$/i;

export const assertDomainId = (value, label = "ID") => {
  if (!value || typeof value !== "string" || !SAFE_ID_PATTERN.test(value.trim())) {
    const err = new Error(`${label} must be a valid domain identifier.`);
    err.statusCode = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  return value.trim().toUpperCase();
};

export const generateDomainId = (prefix, districtId) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${districtId}-${year}-${suffix}`;
};

export const sanitizeStorageName = (name) =>
  String(name || "document")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);

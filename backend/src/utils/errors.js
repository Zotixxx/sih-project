export class HttpError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, "VALIDATION_ERROR", message, details);
export const unauthorized = (message = "Authentication required.") =>
  new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Forbidden.") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "Resource not found.") => new HttpError(404, "NOT_FOUND", message);
export const conflict = (message = "Conflict.") => new HttpError(409, "CONFLICT", message);
export const unprocessable = (message, details) =>
  new HttpError(422, "BUSINESS_RULE_FAILED", message, details);

export const fromSupabaseError = (error, fallbackMessage = "Database operation failed.") => {
  if (!error) return null;
  if (error.code === "PGRST116") return notFound(fallbackMessage);
  if (error.code === "P0002") return notFound(error.message || fallbackMessage);
  if (error.code === "P0001") return conflict(error.message || "Invalid workflow state.");
  if (error.code === "23505") return conflict("A record with the same unique identifier already exists.");
  if (error.code === "23503") return badRequest("Referenced record does not exist.");
  return new HttpError(500, "DATABASE_ERROR", fallbackMessage);
};

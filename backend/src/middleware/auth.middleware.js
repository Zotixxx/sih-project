import { supabaseAuthMiddleware } from "./supabaseAuth.middleware.js";

export const authMiddleware = async (req, res, next) => {
  return supabaseAuthMiddleware(req, res, next);
};

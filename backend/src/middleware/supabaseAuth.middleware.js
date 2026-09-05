import { supabaseAdmin } from "../config/supabase.js";
import { userRepository } from "../repositories/userRepository.js";

const verifySupabaseBearer = async (req, res) => {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Supabase bearer token required." },
    });
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  req.accessToken = token;

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired Supabase session." },
    });
    return null;
  }

  req.authUser = authData.user;
  return authData.user;
};

export const supabaseIdentityMiddleware = async (req, res, next) => {
  const authUser = await verifySupabaseBearer(req, res);
  if (!authUser) return;
  next();
};

export const supabaseAuthMiddleware = async (req, res, next) => {
  const authUser = await verifySupabaseBearer(req, res);
  if (!authUser) return;

  const user = await userRepository.getById(authUser.id);
  if (!user) {
    return res.status(403).json({
      success: false,
      error: { code: "PROFILE_REQUIRED", message: "Authenticated user has no MetriX profile." },
    });
  }

  req.user = {
    ...user,
    email: authUser.email || user.email,
  };
  next();
};

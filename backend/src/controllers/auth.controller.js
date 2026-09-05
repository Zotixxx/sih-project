import { userRepository } from "../repositories/userRepository.js";

export const authController = {
  login: async (req, res) => {
    return res.status(410).json({
      success: false,
      error: {
        code: "SUPABASE_AUTH_REQUIRED",
        message: "Use Supabase Auth email/password sign-in and send the Supabase access token to the API.",
      },
    });
  },

  getProfile: async (req, res) => {
    return res.json({
      success: true,
      data: req.user,
    });
  },

  registerBusinessProfile: async (req, res, next) => {
    try {
      const user = await userRepository.createBusinessRegistration(req.authUser, req.body);
      return res.status(201).json({
        success: true,
        data: user,
        message: "Business profile registered successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  getUsers: async (req, res) => {
    const allUsers = await userRepository.getAll();
    const safeUsers = allUsers.map((u) => ({
      id: u.id,
      domainId: u.domainId,
      name: u.name,
      role: u.role,
      district_id: u.district_id,
      designation: u.designation,
    }));

    return res.json({ success: true, data: safeUsers });
  },
};

import { userRepository } from "../repositories/userRepository.js";

export const authController = {
  login: async (req, res) => {
    const { userId } = req.body;
    const user = await userRepository.getById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `User '${userId}' not found.` },
      });
    }

    return res.json({
      success: true,
      data: {
        token: `mock-token-${user.id}`,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          district_id: user.district_id,
          designation: user.designation,
          email: user.email,
        },
      },
    });
  },

  getProfile: async (req, res) => {
    return res.json({
      success: true,
      data: req.user,
    });
  },

  getDemoUsers: async (req, res) => {
    const allUsers = await userRepository.getAll();
    const safeUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      district_id: u.district_id,
      designation: u.designation,
    }));

    return res.json({
      success: true,
      data: safeUsers,
    });
  },
};

import { districtRepository } from "../repositories/districtRepository.js";

export const districtController = {
  getPublicDistricts: async (req, res, next) => {
    try {
      const districts = await districtRepository.getAll();
      return res.json({
        success: true,
        data: districts,
      });
    } catch (error) {
      next(error);
    }
  },
};

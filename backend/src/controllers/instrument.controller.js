import { instrumentService } from "../services/instrumentService.js";

export const instrumentController = {
  getInstruments: async (req, res, next) => {
    try {
      const instruments = await instrumentService.getInstruments(req.user);
      res.json({ success: true, data: instruments });
    } catch (err) {
      next(err);
    }
  },

  getInstrumentById: async (req, res, next) => {
    try {
      const instrument = await instrumentService.getInstrumentById(req.params.id, req.user);
      res.json({ success: true, data: instrument });
    } catch (err) {
      next(err);
    }
  },

  createInstrument: async (req, res, next) => {
    try {
      const created = await instrumentService.createInstrument(req.user, req.body);
      res.status(201).json({
        success: true,
        message: "Instrument registered successfully with purchase bill.",
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  updateInstrument: async (req, res, next) => {
    try {
      const updated = await instrumentService.updateInstrument(
        req.params.id,
        req.user,
        req.body
      );
      res.json({
        success: true,
        message: "Instrument updated successfully.",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};

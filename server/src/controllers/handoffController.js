const mongoose = require('mongoose');
const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { reqInt, reqDate } = require('../utils/validate');
const { todayTashkent } = require('../utils/date');
const ApiError = require('../utils/ApiError');

// Nonyov shofyorga non beradi
exports.create = asyncHandler(async (req, res) => {
  const driverId = req.body.driverId;
  if (!driverId || !mongoose.isValidObjectId(driverId)) {
    throw ApiError.badRequest('Shofyorni tanlang.');
  }
  const quantity = reqInt(req.body.quantity, 'Non soni', { min: 1 });
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');
  const handoff = await reportService.giveToDriver(req.user, { driverId, quantity, date });
  res.status(201).json(handoff);
});

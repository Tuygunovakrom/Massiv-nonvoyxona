const mongoose = require('mongoose');
const driverService = require('../services/driverService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqInt, optInt, reqDate } = require('../utils/validate');
const { todayTashkent } = require('../utils/date');

// Shofyorning bir kunlik malumotlari
exports.getDay = asyncHandler(async (req, res) => {
  const date = reqDate(req.query.date || todayTashkent(), 'Sana');
  res.json(await driverService.getDriverDay(req.user, date));
});

// "Qabul qildim" - olgan sonini kiritadi
exports.confirm = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Yozuv topilmadi.');
  const quantity = reqInt(req.body.quantity, 'Qabul qilingan son', { min: 0 });
  res.json(await driverService.confirmHandoff(req.user, id, quantity));
});

// Do'konga tarqatish
exports.createDelivery = asyncHandler(async (req, res) => {
  const { bakeryId, shopId } = req.body;
  if (!bakeryId || !mongoose.isValidObjectId(bakeryId)) {
    throw ApiError.badRequest('Nonyovxonani tanlang.');
  }
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    throw ApiError.badRequest("Do'konni tanlang.");
  }
  const quantity = reqInt(req.body.quantity, 'Non soni', { min: 1 });
  const cash = optInt(req.body.cash, 'Naqd pul');
  const click = optInt(req.body.click, 'Click pul');
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');
  const delivery = await driverService.createDelivery(req.user, {
    bakeryId,
    shopId,
    quantity,
    cash,
    click,
    date,
  });
  res.status(201).json(delivery);
});

// Kunni tugatish
exports.closeDay = asyncHandler(async (req, res) => {
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');
  res.json(await driverService.closeDay(req.user, date));
});

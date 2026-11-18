const Expense = require('../models/Expense');
const driverService = require('../services/driverService');
const asyncHandler = require('../utils/asyncHandler');
const { reqInt, reqStr, reqDate } = require('../utils/validate');
const { todayTashkent } = require('../utils/date');

// Oz rasxodlari (nonyov va shofyor)
exports.mine = asyncHandler(async (req, res) => {
  const date = reqDate(req.query.date || todayTashkent(), 'Sana');
  const expenses = await Expense.find({ user: req.user._id, date }).sort({ createdAt: -1 });
  res.json(expenses);
});

// Rasxod qoshish
exports.create = asyncHandler(async (req, res) => {
  const amount = reqInt(req.body.amount, 'Summa', { min: 1 });
  const reason = reqStr(req.body.reason, 'Nimaga ketgani', 200);
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');

  // Shofyor kuni tugatilgan bolsa rasxod qoshilmaydi
  if (req.user.role === 'shofyor') {
    await driverService.assertOpen(req.user._id, date);
  }

  const expense = await Expense.create({
    bakery: req.user.role === 'nonvoy' ? req.user.bakery : null,
    user: req.user._id,
    role: req.user.role,
    date,
    amount,
    reason,
  });
  res.status(201).json(expense);
});

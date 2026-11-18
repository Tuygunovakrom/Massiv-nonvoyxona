const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr, reqInt, reqDate, optStr } = require('../utils/validate');
const { todayTashkent } = require('../utils/date');

const PHONE_RE = /^[0-9+\-() ]{7,20}$/;

// Zakazlar royxati (faqat oz nonvoyxonasi)
exports.list = asyncHandler(async (req, res) => {
  const date = reqDate(req.query.date || todayTashkent(), 'Sana');
  const orders = await Order.find({ bakery: req.user.bakery, date }).sort({ createdAt: -1 });
  res.json(orders);
});

// Yangi zakaz
exports.create = asyncHandler(async (req, res) => {
  const customerName = reqStr(req.body.customerName, 'Mijoz ismi', 100);
  const phone = reqStr(req.body.phone, 'Telefon', 20);
  if (!PHONE_RE.test(phone)) {
    throw ApiError.badRequest('Telefon raqamini togri kiriting.');
  }
  const quantity = reqInt(req.body.quantity, 'Non soni', { min: 1 });
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');
  const note = optStr(req.body.note, 'Izoh', 300);

  const order = await Order.create({
    bakery: req.user.bakery,
    createdBy: req.user._id,
    customerName,
    phone,
    quantity,
    date,
    note,
  });
  res.status(201).json(order);
});

// Zakazni tugatish
exports.done = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, bakery: req.user.bakery });
  if (!order) throw ApiError.notFound('Zakaz topilmadi.');
  order.isDone = true;
  await order.save();
  res.json(order);
});

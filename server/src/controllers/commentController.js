const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const DailyReport = require('../models/DailyReport');
const Handoff = require('../models/Handoff');
const Delivery = require('../models/Delivery');
const Expense = require('../models/Expense');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr } = require('../utils/validate');

const TARGETS = {
  DailyReport,
  Handoff,
  Delivery,
  Expense,
  Order,
};

// Izoh yozilayotgan yozuv muallifga tegishlimi?
async function checkScope(user, targetModel, refId) {
  const Model = TARGETS[targetModel];
  if (!Model || !mongoose.isValidObjectId(refId)) {
    throw ApiError.badRequest('Izoh manzili notogri.');
  }
  const doc = await Model.findById(refId);
  if (!doc) throw ApiError.notFound('Yozuv topilmadi.');

  let ok = false;
  if (user.role === 'nonvoy') {
    ok = doc.bakery
      ? String(doc.bakery) === String(user.bakery)
      : String(doc.user) === String(user._id);
  } else if (user.role === 'shofyor') {
    ok = doc.driver
      ? String(doc.driver) === String(user._id)
      : String(doc.user) === String(user._id);
  }
  if (!ok) throw ApiError.forbidden('Bu yozuv sizga tegishli emas.');
  return doc;
}

// Adminga izoh yuborish
exports.create = asyncHandler(async (req, res) => {
  const text = reqStr(req.body.text, 'Izoh matni', 500);
  const targetModel = req.body.targetModel;
  const refId = req.body.refId;
  const doc = await checkScope(req.user, targetModel, refId);

  const comment = await Comment.create({
    bakery: doc.bakery || null,
    author: req.user._id,
    targetModel,
    refId,
    text,
  });
  res.status(201).json(comment);
});

// Oz izohlari
exports.mine = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(comments);
});

// Admin: barcha izohlar (ochiq / hal qilingan)
exports.adminList = asyncHandler(async (req, res) => {
  const filter = {};
  if (['open', 'resolved'].includes(req.query.status)) filter.status = req.query.status;
  const comments = await Comment.find(filter)
    .populate('author', 'name role')
    .populate('bakery', 'name')
    .populate('refId')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(comments);
});

// Admin izohni "Hal qilindi" deb belgilaydi
exports.resolve = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Izoh topilmadi.');
  comment.status = 'resolved';
  await comment.save();
  res.json(comment);
});

const mongoose = require('mongoose');
const User = require('../models/User');
const Bakery = require('../models/Bakery');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr, optStr } = require('../utils/validate');

const ROLES = ['admin', 'nonvoy', 'shofyor'];

// Foydalanuvchilar royxati (faqat admin)
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).populate('bakery', 'name').sort({ role: 1, name: 1 });
  res.json(users);
});

// Yangi foydalanuvchi yaratish (login/parol faqat admin beradi)
exports.create = asyncHandler(async (req, res) => {
  const name = reqStr(req.body.name, 'Ism', 100);
  const username = reqStr(req.body.username, 'Login', 30).toLowerCase();
  const password = reqStr(req.body.password, 'Parol', 100);
  const role = req.body.role;

  if (!ROLES.includes(role)) throw ApiError.badRequest('Rol notogri tanlangan.');
  if (password.length < 4) throw ApiError.badRequest('Parol kamida 4 belgidan iborat bolsin.');
  if (!/^[a-z0-9_.]{3,30}$/.test(username)) {
    throw ApiError.badRequest('Login: 3-30 belgi, faqat lotin harflari, raqam, _ va .');
  }

  let bakery = null;
  if (role === 'nonvoy') {
    if (!req.body.bakery || !mongoose.isValidObjectId(req.body.bakery)) {
      throw ApiError.badRequest('Nonyovni nonvoyxonaga biriktiring.');
    }
    const b = await Bakery.findById(req.body.bakery);
    if (!b) throw ApiError.badRequest('Nonyovxona topilmadi.');
    bakery = b._id;
  }

  const user = await User.create({ name, username, password, role, bakery });
  const created = await User.findById(user._id).populate('bakery', 'name');
  res.status(201).json(created);
});

// Foydalanuvchini tahrirlash (parol almashtirish, ochirib qoyish va h.k.)
exports.update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi.');

  const selfId = String(user._id) === String(req.user._id);

  if (req.body.name !== undefined) user.name = reqStr(req.body.name, 'Ism', 100);
  if (req.body.username !== undefined) {
    const username = reqStr(req.body.username, 'Login', 30).toLowerCase();
    if (!/^[a-z0-9_.]{3,30}$/.test(username)) {
      throw ApiError.badRequest('Login: 3-30 belgi, faqat lotin harflari, raqam, _ va .');
    }
    user.username = username;
  }
  if (req.body.password) {
    if (String(req.body.password).length < 4) {
      throw ApiError.badRequest('Parol kamida 4 belgidan iborat bolsin.');
    }
    user.password = String(req.body.password); // save() da hash boladi
  }
  if (req.body.bakery !== undefined && user.role === 'nonvoy') {
    if (!req.body.bakery) {
      user.bakery = null;
    } else if (mongoose.isValidObjectId(req.body.bakery)) {
      const b = await Bakery.findById(req.body.bakery);
      if (!b) throw ApiError.badRequest('Nonyovxona topilmadi.');
      user.bakery = b._id;
    }
  }
  if (req.body.isActive !== undefined) {
    if (selfId && !req.body.isActive) {
      throw ApiError.badRequest("O'zingizni ochira olmaysiz.");
    }
    user.isActive = Boolean(req.body.isActive);
  }

  await user.save();
  const result = await User.findById(user._id).populate('bakery', 'name');
  res.json(result);
});

// Akkauntni ochirib qoyish (ozgartirish mumkin bolishi uchun soft o'chirish)
exports.deactivate = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest("O'zingizni ochira olmaysiz.");
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).populate('bakery', 'name');
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi.');
  res.json({ message: 'Akkaunt ochirildi.', user });
});

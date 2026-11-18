const Shop = require('../models/Shop');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr, reqInt } = require('../utils/validate');

// Do'konlar royxati (shofyor va admin uchun)
exports.list = asyncHandler(async (req, res) => {
  const shops = await Shop.find().sort({ name: 1 });
  res.json(shops);
});

// Yangi do'kon + 1 dona non narxi (faqat admin)
exports.create = asyncHandler(async (req, res) => {
  const name = reqStr(req.body.name, "Do'kon nomi", 100);
  const price = reqInt(req.body.price, 'Non narxi', { min: 1 });
  const shop = await Shop.create({ name, price });
  res.status(201).json(shop);
});

// Do'kon nomi yoki narxini ozgartirish (faqat admin)
exports.update = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw ApiError.notFound("Do'kon topilmadi.");
  if (req.body.name !== undefined) shop.name = reqStr(req.body.name, "Do'kon nomi", 100);
  if (req.body.price !== undefined) shop.price = reqInt(req.body.price, 'Non narxi', { min: 1 });
  await shop.save();
  res.json(shop);
});

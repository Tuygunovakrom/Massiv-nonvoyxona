const Bakery = require('../models/Bakery');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr } = require('../utils/validate');

// Nonyovxonalar royxati (hamma rol uchun ochiq - nomlari kerak)
exports.list = asyncHandler(async (req, res) => {
  const bakeries = await Bakery.find().sort({ name: 1 });
  res.json(bakeries);
});

// Yangi nonvoyxona (faqat admin)
exports.create = asyncHandler(async (req, res) => {
  const name = reqStr(req.body.name, 'Nonyovxona nomi', 100);
  const bakery = await Bakery.create({ name });
  res.status(201).json(bakery);
});

// Nonyovxona nomini ozgartirish (faqat admin)
exports.update = asyncHandler(async (req, res) => {
  const bakery = await Bakery.findById(req.params.id);
  if (!bakery) {
    res.status(404);
    throw new Error('Nonyovxona topilmadi.');
  }
  if (req.body.name !== undefined) bakery.name = reqStr(req.body.name, 'Nonyovxona nomi', 100);
  await bakery.save();
  res.json(bakery);
});

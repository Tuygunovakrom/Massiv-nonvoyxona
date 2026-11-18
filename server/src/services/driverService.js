const mongoose = require('mongoose');
const Handoff = require('../models/Handoff');
const Delivery = require('../models/Delivery');
const Expense = require('../models/Expense');
const DriverDay = require('../models/DriverDay');
const Bakery = require('../models/Bakery');
const Shop = require('../models/Shop');
const ApiError = require('../utils/ApiError');

// Shofyor qabul qilgan non jami (bir nonvoyxona, bir kun)
async function confirmedTotal(driverId, bakeryId, date) {
  const res = await Handoff.aggregate([
    {
      $match: {
        driver: new mongoose.Types.ObjectId(driverId),
        bakery: new mongoose.Types.ObjectId(bakeryId),
        date,
        confirmedQuantity: { $ne: null },
      },
    },
    { $group: { _id: null, total: { $sum: '$confirmedQuantity' } } },
  ]);
  return res.length ? res[0].total : 0;
}

// Tarqatilgan non jami
async function distributedTotal(driverId, bakeryId, date) {
  const res = await Delivery.aggregate([
    {
      $match: {
        driver: new mongoose.Types.ObjectId(driverId),
        bakery: new mongoose.Types.ObjectId(bakeryId),
        date,
      },
    },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  return res.length ? res[0].total : 0;
}

// Shofyor qoldigi = qabul qilingan - tarqatilgan
async function getLeftover(driverId, bakeryId, date) {
  const [confirmed, distributed] = await Promise.all([
    confirmedTotal(driverId, bakeryId, date),
    distributedTotal(driverId, bakeryId, date),
  ]);
  return { confirmed, distributed, leftover: confirmed - distributed };
}

// Shofyor kuni tugatilganini tekshirish
async function getDay(driverId, date) {
  return DriverDay.findOne({ driver: driverId, date });
}

async function assertOpen(driverId, date) {
  const day = await getDay(driverId, date);
  if (day?.isClosed) {
    throw ApiError.badRequest('Bu kun tugatilgan. Boshqa ozgartirish kiritib bolmaydi.');
  }
}

// "Qabul qildim" - shofyor olgan sonini kiritadi
async function confirmHandoff(driver, handoffId, quantity) {
  const handoff = await Handoff.findOne({ _id: handoffId, driver: driver._id });
  if (!handoff) throw ApiError.notFound('Topshirish yozuvi topilmadi.');
  await assertOpen(driver._id, handoff.date);
  const { distributed } = await getLeftover(driver._id, handoff.bakery, handoff.date);
  if (quantity < distributed) {
    throw ApiError.badRequest(
      `Bu nonvoyxona boyicha allaqachon ${distributed} dona tarqatilgan. Qabul sonini bundan kam qilib bolmaydi.`
    );
  }
  handoff.confirmedQuantity = quantity;
  await handoff.save();
  return handoff;
}

// Do'konga tarqatish (qoldiqdan kop bolmasin)
async function createDelivery(driver, { bakeryId, shopId, quantity, cash, click, date }) {
  const [shop, bakery] = await Promise.all([
    Shop.findById(shopId),
    Bakery.findById(bakeryId),
  ]);
  if (!shop) throw ApiError.badRequest("Do'kon topilmadi.");
  if (!bakery) throw ApiError.badRequest('Nonyovxona topilmadi.');
  await assertOpen(driver._id, date);
  const { leftover } = await getLeftover(driver._id, bakeryId, date);
  if (quantity > leftover) {
    throw ApiError.badRequest(
      `"${bakery.name}" boyicha qoldiqda faqat ${leftover} dona bor.`
    );
  }
  return Delivery.create({
    driver: driver._id,
    bakery: bakeryId,
    shop: shopId,
    quantity,
    cash,
    click,
    date,
  });
}

// Kunni tugatish (keyin ozgartirib bolmaydi)
async function closeDay(driver, date) {
  const day = await DriverDay.findOneAndUpdate(
    { driver: driver._id, date },
    { isClosed: true },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return day;
}

// Shofyorning bir kunlik malumotlari (faqat ozi koradi)
async function getDriverDay(driver, date) {
  const [bakeries, shops, handoffs, deliveries, expenses, day] = await Promise.all([
    Bakery.find().sort({ name: 1 }),
    Shop.find().sort({ name: 1 }),
    Handoff.find({ driver: driver._id, date })
      .populate('bakery', 'name')
      .populate('baker', 'name')
      .sort({ createdAt: 1 }),
    Delivery.find({ driver: driver._id, date })
      .populate('shop', 'name price')
      .populate('bakery', 'name')
      .sort({ createdAt: -1 }),
    Expense.find({ user: driver._id, date }).sort({ createdAt: -1 }),
    getDay(driver._id, date),
  ]);
  const leftovers = [];
  for (const b of bakeries) {
    const l = await getLeftover(driver._id, b._id, date);
    leftovers.push({ bakery: b._id, name: b.name, ...l });
  }
  return { handoffs, deliveries, expenses, leftovers, shops, day };
}

module.exports = { getLeftover, getDay, assertOpen, closeDay, confirmHandoff, createDelivery, getDriverDay };

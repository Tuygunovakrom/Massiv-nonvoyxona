const mongoose = require('mongoose');
const DailyReport = require('../models/DailyReport');
const Handoff = require('../models/Handoff');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Nonyovxona shu kunda shofyorlarga bergan non jami
async function givenTotal(bakeryId, date) {
  const res = await Handoff.aggregate([
    {
      $match: {
        bakery: new mongoose.Types.ObjectId(bakeryId),
        date,
      },
    },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  return res.length ? res[0].total : 0;
}

// Qoldiq = yopilgan - sotilgan - yeyilgan - shofyorga berilgan
function calcLeftover(report, given) {
  return (
    (report?.closedBread || 0) -
    (report?.soldBread || 0) -
    (report?.eatenBread || 0) -
    given
  );
}

// Qoldiq hech qachon manfiy bolmasin (server tekshiruvi)
async function assertLeftover(report, date) {
  const given = await givenTotal(report.bakery, date);
  if (calcLeftover(report, given) < 0) {
    throw ApiError.badRequest(
      `Qoldiq manfiy bolmaydi. Shofyorlarga berilgan: ${given} dona. Hisobot raqamlarini tekshiring.`
    );
  }
}

// Nonyovning bir kunlik malumotlari
async function getBakerDay(baker, date) {
  const [report, handoffs, orders, expenses, drivers] = await Promise.all([
    DailyReport.findOne({ baker: baker._id, date }),
    Handoff.find({ bakery: baker.bakery, date })
      .populate('driver', 'name')
      .sort({ createdAt: 1 }),
    Order.find({ bakery: baker.bakery, date }).sort({ createdAt: -1 }),
    Expense.find({ user: baker._id, date }).sort({ createdAt: -1 }),
    User.find({ role: 'shofyor', isActive: true }, 'name username'),
  ]);
  const given = await givenTotal(baker.bakery, date);
  return {
    report,
    givenTotal: given,
    leftover: calcLeftover(report, given),
    handoffs,
    orders,
    expenses,
    drivers,
  };
}

// Hisobotni saqlash (yangi yoki mavjud yozuv)
async function upsertReport(baker, date, data) {
  const report = await DailyReport.findOne({ baker: baker._id, date });
  if (report && report.isClosed) {
    throw ApiError.badRequest("Bu kun tugatilgan. Ozgartirish uchun adminga murojaat qiling.");
  }
  const merged = {
    ...(report ? report.toObject() : {}),
    ...data,
    bakery: baker.bakery,
    baker: baker._id,
    date,
  };
  await assertLeftover(merged, date);
  if (report) {
    Object.assign(report, data);
    await report.save();
    return report;
  }
  return DailyReport.create({ ...data, bakery: baker.bakery, baker: baker._id, date });
}

// Kunni tugatish - undan keyin nonvoy ozgartira olmaydi
async function closeDay(baker, date) {
  const report = await DailyReport.findOne({ baker: baker._id, date });
  if (!report) throw ApiError.badRequest('Avval hisobotni saqlang.');
  if (report.isClosed) throw ApiError.badRequest('Bu kun allaqachon tugatilgan.');
  await assertLeftover(report, date);
  report.isClosed = true;
  await report.save();
  return report;
}

// Shofyorga non berish (qoldiqdan kop bolmasin)
async function giveToDriver(baker, { driverId, quantity, date }) {
  const driver = await User.findOne({ _id: driverId, role: 'shofyor', isActive: true });
  if (!driver) throw ApiError.badRequest('Shofyor topilmadi yoki faol emas.');
  const report = await DailyReport.findOne({ baker: baker._id, date });
  if (!report) throw ApiError.badRequest('Avval kunlik hisobotni saqlang.');
  if (report.isClosed) throw ApiError.badRequest('Kun tugatilgan, non bera olmaysiz.');
  const given = await givenTotal(baker.bakery, date);
  const leftover = calcLeftover(report, given);
  if (quantity > leftover) {
    throw ApiError.badRequest(`Qoldiqda faqat ${leftover} dona bor. ${quantity} dona bera olmaysiz.`);
  }
  return Handoff.create({
    bakery: baker.bakery,
    baker: baker._id,
    driver: driverId,
    date,
    quantity,
  });
}

module.exports = { givenTotal, calcLeftover, assertLeftover, getBakerDay, upsertReport, closeDay, giveToDriver };

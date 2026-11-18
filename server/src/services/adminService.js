const DailyReport = require('../models/DailyReport');
const DriverDay = require('../models/DriverDay');
const Handoff = require('../models/Handoff');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Comment = require('../models/Comment');
const AuditLog = require('../models/AuditLog');
const ApiError = require('../utils/ApiError');
const { givenTotal, calcLeftover, assertLeftover } = require('./reportService');

// Admin tuzatishi mumkin bolgan maydonlar
const EDITABLE = {
  DailyReport: ['closedBread', 'usedFlour', 'soldBread', 'eatenBread', 'cash', 'click'],
  Handoff: ['quantity', 'confirmedQuantity'],
  Delivery: ['quantity', 'cash', 'click'],
  Order: ['customerName', 'phone', 'quantity', 'date', 'note', 'isDone'],
  Expense: ['amount', 'reason'],
};

const MODELS = { DailyReport, Handoff, Delivery, Order, Expense };

// Sana boyicha umumiy nazorat (admin)
async function getDaySummary(date) {
  const [reports, handoffs, deliveries, expenses, orders, openComments, driverDays] =
    await Promise.all([
      DailyReport.find({ date }).populate('baker', 'name').populate('bakery', 'name'),
      Handoff.find({ date })
        .populate('driver', 'name')
        .populate('bakery', 'name')
        .populate('baker', 'name')
        .sort({ createdAt: 1 }),
      Delivery.find({ date })
        .populate('driver', 'name')
        .populate('bakery', 'name')
        .populate('shop', 'name')
        .sort({ createdAt: 1 }),
      Expense.find({ date }).populate('user', 'name role').populate('bakery', 'name'),
      Order.find({ date }).populate('bakery', 'name').sort({ createdAt: -1 }),
      Comment.countDocuments({ status: 'open' }),
      DriverDay.find({ date }).populate('driver', 'name'),
    ]);

  // Nonyovxona hisobotlari: berilgan va qoldiq qoshiladi
  const reportRows = [];
  for (const r of reports) {
    const given = await givenTotal(r.bakery._id, date);
    reportRows.push({
      ...r.toObject(),
      givenTotal: given,
      leftover: calcLeftover(r, given),
    });
  }

  // Shofyorlar: berdi/oldi mosligi, tarqatishlar va yigilgan pul
  const driverMap = new Map();
  const ensureDriver = (d) => {
    if (!d) return null;
    const id = String(d._id);
    if (!driverMap.has(id)) {
      driverMap.set(id, {
        driver: { _id: d._id, name: d.name },
        handoffs: [],
        rows: [],
        deliveries: [],
        collected: { cash: 0, click: 0 },
      });
    }
    return driverMap.get(id);
  };

  for (const h of handoffs) {
    const entry = ensureDriver(h.driver);
    if (!entry) continue;
    entry.handoffs.push({
      _id: h._id,
      bakery: h.bakery,
      bakerName: h.baker?.name,
      quantity: h.quantity,
      confirmedQuantity: h.confirmedQuantity,
    });
    let row = entry.rows.find((x) => String(x.bakery._id) === String(h.bakery._id));
    if (!row) {
      row = { bakery: h.bakery, given: 0, confirmed: 0, pending: false };
      entry.rows.push(row);
    }
    row.given += h.quantity;
    if (h.confirmedQuantity == null) row.pending = true;
    else row.confirmed += h.confirmedQuantity;
  }

  for (const d of deliveries) {
    const entry = ensureDriver(d.driver);
    if (!entry) continue;
    entry.deliveries.push({
      _id: d._id,
      shop: d.shop,
      bakery: d.bakery,
      quantity: d.quantity,
      cash: d.cash,
      click: d.click,
    });
    entry.collected.cash += d.cash;
    entry.collected.click += d.click;
  }

  // Shofyor kuni yakuni (tugatilgan kuni korish uchun)
  for (const dd of driverDays) {
    const entry = ensureDriver(dd.driver);
    if (entry) entry.day = { _id: dd._id, isClosed: dd.isClosed };
  }

  // Jami pul tushumi
  const totals = {
    bakeryCash: reports.reduce((s, r) => s + r.cash, 0),
    bakeryClick: reports.reduce((s, r) => s + r.click, 0),
    driverCash: deliveries.reduce((s, d) => s + d.cash, 0),
    driverClick: deliveries.reduce((s, d) => s + d.click, 0),
  };
  totals.bakeryTotal = totals.bakeryCash + totals.bakeryClick;
  totals.driverTotal = totals.driverCash + totals.driverClick;
  totals.grandTotal = totals.bakeryTotal + totals.driverTotal;

  return {
    date,
    reports: reportRows,
    drivers: [...driverMap.values()],
    expenses,
    orders,
    totals,
    openComments,
  };
}

// Admin yozuvni tuzatadi - har bir o'zgarish AuditLog'ga yoziladi
async function adminEdit(modelName, id, updates, admin) {
  const Model = MODELS[modelName];
  if (!Model) throw ApiError.badRequest('Notogri yozuv turi.');
  const doc = await Model.findById(id);
  if (!doc) throw ApiError.notFound('Yozuv topilmadi.');

  const allowed = EDITABLE[modelName];
  const changes = [];
  for (const field of allowed) {
    if (!(field in updates)) continue;
    const oldVal = doc[field];
    const newVal = updates[field];
    if (String(oldVal ?? '') === String(newVal ?? '')) continue;
    changes.push({ field, oldValue: oldVal, newValue: newVal });
    doc[field] = newVal;
  }
  if (!changes.length) throw ApiError.badRequest('Ozgartirish uchun hech narsa yuborilmadi.');

  // Qoldiq cheklovi tahrirdan ham otmasin
  if (modelName === 'DailyReport') {
    await assertLeftover(doc, doc.date);
  } else if (modelName === 'Handoff') {
    const report = await DailyReport.findOne({ baker: doc.baker, date: doc.date });
    if (report) await assertLeftover(report, doc.date);
  }

  await doc.save();
  await AuditLog.create({
    admin: admin._id,
    action: 'update',
    model: modelName,
    targetId: doc._id,
    changes,
  });
  return doc;
}

// Tugatilgan kunni qayta ochish
async function reopenReport(id, admin) {
  const report = await DailyReport.findById(id);
  if (!report) throw ApiError.notFound('Hisobot topilmadi.');
  report.isClosed = false;
  await report.save();
  await AuditLog.create({
    admin: admin._id,
    action: 'reopen',
    model: 'DailyReport',
    targetId: report._id,
    changes: [{ field: 'isClosed', oldValue: true, newValue: false }],
  });
  return report;
}

// Tugatilgan shofyor kunini qayta ochish
async function reopenDriverDay(id, admin) {
  const day = await DriverDay.findById(id);
  if (!day) throw ApiError.notFound('Shofyor kuni topilmadi.');
  day.isClosed = false;
  await day.save();
  await AuditLog.create({
    admin: admin._id,
    action: 'reopen',
    model: 'DriverDay',
    targetId: day._id,
    changes: [{ field: 'isClosed', oldValue: true, newValue: false }],
  });
  return day;
}

// Audit tarixi (oxirgi 200 yozuv)
async function getAudit() {
  return AuditLog.find()
    .populate('admin', 'name')
    .sort({ createdAt: -1 })
    .limit(200);
}

module.exports = { getDaySummary, adminEdit, reopenReport, reopenDriverDay, getAudit };

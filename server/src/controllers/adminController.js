const adminService = require('../services/adminService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr, reqInt, optInt, reqDate, optStr } = require('../utils/validate');
const { todayTashkent } = require('../utils/date');

const PHONE_RE = /^[0-9+\-() ]{7,20}$/;

const REPORT_NUMS = [
  ['closedBread', 'Yopilgan non'],
  ['usedFlour', 'Un (qop)'],
  ['soldBread', 'Sotilgan non'],
  ['eatenBread', 'Yeyilgan non'],
  ['cash', 'Naqd kassa'],
  ['click', 'Click kassa'],
];

function pickNumbers(body, fields) {
  const out = {};
  for (const [key, label] of fields) {
    if (body[key] !== undefined) out[key] = optInt(body[key], label);
  }
  return out;
}

// Sana boyicha umumiy nazorat
exports.day = asyncHandler(async (req, res) => {
  const date = reqDate(req.query.date || todayTashkent(), 'Sana');
  res.json(await adminService.getDaySummary(date));
});

// Hisobotni tuzatish (audit yoziladi)
exports.updateReport = asyncHandler(async (req, res) => {
  const updates = pickNumbers(req.body, REPORT_NUMS);
  res.json(await adminService.adminEdit('DailyReport', req.params.id, updates, req.user));
});

// Tugatilgan kunni qayta ochish
exports.reopen = asyncHandler(async (req, res) => {
  res.json(await adminService.reopenReport(req.params.id, req.user));
});

// Shofyor kunini qayta ochish
exports.reopenDriverDay = asyncHandler(async (req, res) => {
  res.json(await adminService.reopenDriverDay(req.params.id, req.user));
});

// Shofyorga berish yozuvini tuzatish
exports.updateHandoff = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.quantity !== undefined) {
    updates.quantity = reqInt(req.body.quantity, 'Nonvoy bergan son', { min: 1 });
  }
  if (req.body.confirmedQuantity !== undefined) {
    updates.confirmedQuantity =
      req.body.confirmedQuantity === null
        ? null
        : reqInt(req.body.confirmedQuantity, 'Shofyor olgan son', { min: 0 });
  }
  res.json(await adminService.adminEdit('Handoff', req.params.id, updates, req.user));
});

// Tarqatish yozuvini tuzatish
exports.updateDelivery = asyncHandler(async (req, res) => {
  const updates = pickNumbers(req.body, [
    ['quantity', 'Non soni'],
    ['cash', 'Naqd pul'],
    ['click', 'Click pul'],
  ]);
  if (updates.quantity !== undefined && updates.quantity < 1) {
    throw ApiError.badRequest('Non soni kamida 1 bolishi kerak.');
  }
  res.json(await adminService.adminEdit('Delivery', req.params.id, updates, req.user));
});

// Rasxodni tuzatish
exports.updateExpense = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.amount !== undefined) updates.amount = reqInt(req.body.amount, 'Summa', { min: 1 });
  if (req.body.reason !== undefined) updates.reason = reqStr(req.body.reason, 'Nimaga ketgani', 200);
  res.json(await adminService.adminEdit('Expense', req.params.id, updates, req.user));
});

// Zakazni tuzatish
exports.updateOrder = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.customerName !== undefined) {
    updates.customerName = reqStr(req.body.customerName, 'Mijoz ismi', 100);
  }
  if (req.body.phone !== undefined) {
    const phone = reqStr(req.body.phone, 'Telefon', 20);
    if (!PHONE_RE.test(phone)) throw ApiError.badRequest('Telefon raqamini togri kiriting.');
    updates.phone = phone;
  }
  if (req.body.quantity !== undefined) {
    updates.quantity = reqInt(req.body.quantity, 'Non soni', { min: 1 });
  }
  if (req.body.date !== undefined) updates.date = reqDate(req.body.date, 'Sana');
  if (req.body.note !== undefined) updates.note = optStr(req.body.note, 'Izoh', 300);
  if (req.body.isDone !== undefined) updates.isDone = Boolean(req.body.isDone);
  res.json(await adminService.adminEdit('Order', req.params.id, updates, req.user));
});

// Audit tarixi
exports.audit = asyncHandler(async (req, res) => {
  res.json(await adminService.getAudit());
});

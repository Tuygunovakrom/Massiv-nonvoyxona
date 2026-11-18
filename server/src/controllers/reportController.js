const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { optInt, reqDate } = require('../utils/validate');
const { todayTashkent } = require('../utils/date');

// Nonyovning bir kunlik sahifa malumotlari
exports.getDay = asyncHandler(async (req, res) => {
  const date = reqDate(req.query.date || todayTashkent(), 'Sana');
  res.json(await reportService.getBakerDay(req.user, date));
});

// Kunlik hisobotni saqlash
exports.saveReport = asyncHandler(async (req, res) => {
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');
  const data = {
    closedBread: optInt(req.body.closedBread, 'Yopilgan non'),
    usedFlour: optInt(req.body.usedFlour, 'Ishlatilgan un'),
    soldBread: optInt(req.body.soldBread, 'Sotilgan non'),
    eatenBread: optInt(req.body.eatenBread, 'Yeyilgan non'),
    cash: optInt(req.body.cash, 'Naqd kassa'),
    click: optInt(req.body.click, 'Click kassa'),
  };
  res.json(await reportService.upsertReport(req.user, date, data));
});

// Kunni tugatish
exports.closeDay = asyncHandler(async (req, res) => {
  const date = reqDate(req.body.date || todayTashkent(), 'Sana');
  res.json(await reportService.closeDay(req.user, date));
});

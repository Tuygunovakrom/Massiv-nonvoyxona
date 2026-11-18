const mongoose = require('mongoose');

// Nonyov kunlik hisoboti (har nonvoy + sana uchun bitta)
const dailyReportSchema = new mongoose.Schema(
  {
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    baker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" Toshkent vaqti
    closedBread: { type: Number, default: 0, min: 0 }, // yopilgan non (dona)
    usedFlour: { type: Number, default: 0, min: 0 }, // ishlatilgan un (qop)
    soldBread: { type: Number, default: 0, min: 0 }, // sotilgan non
    eatenBread: { type: Number, default: 0, min: 0 }, // yeyilgan non
    cash: { type: Number, default: 0, min: 0 }, // kassa: naqd
    click: { type: Number, default: 0, min: 0 }, // kassa: Click
    isClosed: { type: Boolean, default: false }, // kun tugatilganmi
  },
  { timestamps: true }
);

dailyReportSchema.index({ baker: 1, date: 1 }, { unique: true });
dailyReportSchema.index({ bakery: 1, date: 1 });

module.exports = mongoose.model('DailyReport', dailyReportSchema);

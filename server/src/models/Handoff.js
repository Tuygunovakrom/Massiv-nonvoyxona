const mongoose = require('mongoose');

// Nonyov shofyorga non berishi ("berdim" / "oldim" mosligi shu yerda tekshiriladi)
const handoffSchema = new mongoose.Schema(
  {
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    baker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    quantity: {
      type: Number,
      required: [true, 'Non sonini kiriting.'],
      min: [1, 'Non soni kamida 1 bolishi kerak.'],
    },
    confirmedQuantity: { type: Number, default: null, min: 0 }, // shofyor qabul qilgan soni
  },
  { timestamps: true }
);

handoffSchema.index({ bakery: 1, date: 1 });
handoffSchema.index({ driver: 1, date: 1 });

module.exports = mongoose.model('Handoff', handoffSchema);

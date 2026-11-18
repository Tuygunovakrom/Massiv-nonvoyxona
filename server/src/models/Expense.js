const mongoose = require('mongoose');

// Rasxod (nonyov va shofyor yozadi: summa va nimaga ketgani)
const expenseSchema = new mongoose.Schema(
  {
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', default: null }, // shofyor uchun null
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['nonvoy', 'shofyor'], required: true },
    date: { type: String, required: true },
    amount: {
      type: Number,
      required: [true, 'Summani kiriting.'],
      min: [1, 'Summa 0 dan katta bolishi kerak.'],
    },
    reason: {
      type: String,
      required: [true, 'Nimaga ketganini yozing.'],
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);

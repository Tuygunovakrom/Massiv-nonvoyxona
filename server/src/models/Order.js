const mongoose = require('mongoose');

// Zakaz (nonyov qabul qiladi, "Tugatish" tugmasi bilan yopiladi)
const orderSchema = new mongoose.Schema(
  {
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: {
      type: String,
      required: [true, 'Mijoz ismini kiriting.'],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Telefon raqamini kiriting.'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Non sonini kiriting.'],
      min: [1, 'Non soni kamida 1 bolishi kerak.'],
    },
    date: { type: String, required: true },
    note: { type: String, default: '', trim: true, maxlength: 300 },
    isDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ bakery: 1, date: 1 });

module.exports = mongoose.model('Order', orderSchema);

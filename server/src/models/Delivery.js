const mongoose = require('mongoose');

// Shofyor nonni do'konga tarqatishi (pul kassaga nonvoyxona bo'yicha yoziladi)
const deliverySchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    date: { type: String, required: true },
    quantity: {
      type: Number,
      required: [true, 'Non sonini kiriting.'],
      min: [1, 'Non soni kamida 1 bolishi kerak.'],
    },
    cash: { type: Number, default: 0, min: 0 },
    click: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

deliverySchema.index({ driver: 1, date: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);

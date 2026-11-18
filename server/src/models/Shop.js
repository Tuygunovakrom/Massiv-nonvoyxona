const mongoose = require('mongoose');

// Do'kon - shofyor nonni shu yerga tarqatadi
const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Do'kon nomi majburiy."],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "1 dona non narxini kiriting."],
      min: [1, 'Narx 0 dan katta bolishi kerak.'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);

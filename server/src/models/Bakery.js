const mongoose = require('mongoose');

// Nonyovxona (jami 3 ta, kassalari alohida)
const bakerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nonyovxona nomi majburiy.'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bakery', bakerySchema);

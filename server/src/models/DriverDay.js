const mongoose = require('mongoose');

// Shofyorning kun yakuni (kun tugatilgani belgilanadi)
const driverDaySchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

driverDaySchema.index({ driver: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DriverDay', driverDaySchema);

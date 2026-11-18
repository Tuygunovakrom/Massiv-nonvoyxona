const mongoose = require('mongoose');

// Nonyov/shofyor yozuv bo'yicha adminga izoh yuboradi
const commentSchema = new mongoose.Schema(
  {
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetModel: {
      type: String,
      enum: ['DailyReport', 'Handoff', 'Delivery', 'Expense', 'Order'],
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Izoh matnini yozing.'],
      trim: true,
      maxlength: [500, 'Izoh 500 belgidan oshmasligi kerak.'],
    },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

commentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);

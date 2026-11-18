const mongoose = require('mongoose');

// Admin kiritgan har bir tuzatish tarixi: kim, qachon, eski va yangi qiymat
const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['update', 'reopen'], default: 'update' },
    model: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    changes: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

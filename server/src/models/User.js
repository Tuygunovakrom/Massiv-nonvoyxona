const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Foydalanuvchi: admin, nonvoy, shofyor. Login/parolni faqat admin yaratadi.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ism majburiy.'],
      trim: true,
      maxlength: 100,
    },
    username: {
      type: String,
      required: [true, 'Login majburiy.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Parol majburiy.'],
      minlength: [4, 'Parol kamida 4 belgidan iborat bolishi kerak.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'nonvoy', 'shofyor'],
      required: true,
    },
    bakery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bakery',
      default: null, // faqat nonvoy uchun
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Parolni hash qilish
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);

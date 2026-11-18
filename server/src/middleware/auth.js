const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Token orqali foydalanuvchini aniqlash
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw ApiError.unauthorized();
  const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Akkaunt topilmadi yoki ochirilgan.');
  }
  req.user = user;
  next();
});

// Faqat belgilangan rollarga ruxsat
const restrict = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Bu sahifa uchun ruxsat yoq.'));
  }
  next();
};

// Nonyov nonvoyxonaga biriktirilganini tekshirish
const requireBakery = (req, res, next) => {
  if (req.user.role === 'nonvoy' && !req.user.bakery) {
    return next(ApiError.forbidden('Siz nonvoyxonaga biriktirilmagansiz. Adminga murojaat qiling.'));
  }
  next();
};

module.exports = { protect, restrict, requireBakery };

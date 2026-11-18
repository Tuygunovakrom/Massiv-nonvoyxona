const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reqStr } = require('../utils/validate');

// Tizimga kirish (royxatdan otish sahifasi yoq)
exports.login = asyncHandler(async (req, res) => {
  const username = reqStr(req.body.username, 'Login', 50).toLowerCase();
  const password = reqStr(req.body.password, 'Parol', 100);

  const user = await User.findOne({ username }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Login yoki parol xato.');
  }
  if (!user.isActive) {
    throw ApiError.forbidden("Akkauntingiz ochirilgan. Adminga murojaat qiling.");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      bakery: user.bakery,
    },
  });
});

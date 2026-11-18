// Yagona error middleware - xabarlar o'zbek tilida
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Serverda kutilmagan xatolik yuz berdi.';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  } else if (err.code === 11000) {
    status = 400;
    const keys = Object.keys(err.keyValue || {});
    message = keys.includes('username')
      ? 'Bu login allaqachon band. Boshqa login tanlang.'
      : 'Bunday yozuv allaqachon mavjud.';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Yozuv identifikatori notogri.';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Sessiya notogri. Iltimos, qaytadan kiring.';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Sessiya muddati tugadi. Iltimos, qaytadan kiring.';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

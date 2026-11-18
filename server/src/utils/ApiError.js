// Barcha xatolar shu klass orqali tushunarli o'zbekcha matn bilan qaytadi
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Ruxsat yoq. Iltimos, tizimga kiring.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Sizga bu amal uchun ruxsat berilmagan.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Malumot topilmadi.') {
    return new ApiError(404, message);
  }
}

module.exports = ApiError;

const ApiError = require('./ApiError');

// Majburiy matn maydoni
function reqStr(value, name, max = 200) {
  if (typeof value !== 'string' || !value.trim()) {
    throw ApiError.badRequest(`"${name}" maydonini to'ldiring.`);
  }
  const v = value.trim();
  if (v.length > max) {
    throw ApiError.badRequest(`"${name}" maydoni ${max} belgidan oshmasligi kerak.`);
  }
  return v;
}

// Ixtiyoriy matn (bo'sh bo'lsa "")
function optStr(value, name, max = 300) {
  if (value === undefined || value === null) return '';
  const v = String(value).trim();
  if (!v) return '';
  if (v.length > max) {
    throw ApiError.badRequest(`"${name}" maydoni ${max} belgidan oshmasligi kerak.`);
  }
  return v;
}

// Majburiy butun son, manfiy bo'lmasin
function reqInt(value, name, { min = 0, max = 1000000000 } = {}) {
  const n = Number(value);
  if (value === '' || value === null || value === undefined || !Number.isFinite(n)) {
    throw ApiError.badRequest(`"${name}" maydoniga son kiriting.`);
  }
  if (!Number.isInteger(n)) {
    throw ApiError.badRequest(`"${name}" butun son bo'lishi kerak.`);
  }
  if (n < min) {
    throw ApiError.badRequest(`"${name}" ${min} dan kichik bo'lmasligi kerak.`);
  }
  if (n > max) {
    throw ApiError.badRequest(`"${name}" juda katta son.`);
  }
  return n;
}

// Ixtiyoriy son (bo'sh bo'lsa 0)
function optInt(value, name, opts = {}) {
  if (value === '' || value === null || value === undefined) return 0;
  return reqInt(value, name, opts);
}

// Sana "YYYY-MM-DD" formatida
function reqDate(value, name = 'Sana') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw ApiError.badRequest(`${name} "YYYY-MM-DD" formatida bo'lishi kerak.`);
  }
  return value;
}

module.exports = { reqStr, optStr, reqInt, optInt, reqDate };

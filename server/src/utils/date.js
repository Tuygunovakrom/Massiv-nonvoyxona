// Sana Toshkent vaqti (UTC+5) bo'yicha "YYYY-MM-DD"
function todayTashkent() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date());
}

function isValidDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

module.exports = { todayTashkent, isValidDate };

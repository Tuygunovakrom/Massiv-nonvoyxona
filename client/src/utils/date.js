// Bugungi sana Toshkent vaqti (UTC+5) boyicha "YYYY-MM-DD"
export function todayUz() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date());
}

export function money(n) {
  return Number(n || 0).toLocaleString('ru-RU');
}

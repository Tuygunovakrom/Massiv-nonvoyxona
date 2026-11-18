require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Vercel serverless kirish nuqtasi
// Mongo ulanishi so'rov kelganda ochiladi va issiq chaqiruvlarda qayta ishlatiladi
let conn = null;
async function ensureDB() {
  if (!conn) {
    conn = connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nonvoyxona');
  }
  await conn;
}

module.exports = async (req, res) => {
  await ensureDB();
  return app(req, res);
};

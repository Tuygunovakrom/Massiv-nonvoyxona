const mongoose = require('mongoose');

// Serverless muhitda (Vercel) ulanishni keshlab qolish -
// har so'rovda yangi Mongo ulanishi ochilmasligi uchun
let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

async function connectDB(uri) {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }
  cached.conn = await cached.promise;
  console.log('MongoDB ulandi:', mongoose.connection.host);
  return cached.conn;
}

module.exports = connectDB;

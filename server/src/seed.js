require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Bakery = require('./models/Bakery');
const Shop = require('./models/Shop');
const DailyReport = require('./models/DailyReport');
const DriverDay = require('./models/DriverDay');
const Handoff = require('./models/Handoff');
const Delivery = require('./models/Delivery');
const Order = require('./models/Order');
const Expense = require('./models/Expense');
const Comment = require('./models/Comment');
const AuditLog = require('./models/AuditLog');

const BAKERIES = ['1-sonli nonvoyxona', '2-sonli nonvoyxona', '3-sonli nonvoyxona'];

// Birinchi ishga tushirish: admin, 3 nonvoyxona, namuna nonvoy/shofyor va dokonlar
async function seed() {
  await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nonvoyxona');

  await Promise.all([
    User.deleteMany({}),
    Bakery.deleteMany({}),
    Shop.deleteMany({}),
    DailyReport.deleteMany({}),
    DriverDay.deleteMany({}),
    Handoff.deleteMany({}),
    Delivery.deleteMany({}),
    Order.deleteMany({}),
    Expense.deleteMany({}),
    Comment.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const bakeries = await Bakery.insertMany(BAKERIES.map((name) => ({ name })));

  await User.create({
    name: 'Bosh administrator',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
  });

  for (let i = 0; i < bakeries.length; i++) {
    await User.create({
      name: `Nonyov ${i + 1}`,
      username: `nonvoy${i + 1}`,
      password: 'nonvoy123',
      role: 'nonvoy',
      bakery: bakeries[i]._id,
    });
    await User.create({
      name: `Shofyor ${i + 1}`,
      username: `shofyor${i + 1}`,
      password: 'shofyor123',
      role: 'shofyor',
    });
  }

  await Shop.insertMany([
    { name: 'Chorsu dokoni', price: 4000 },
    { name: 'Markaz dokoni', price: 4000 },
    { name: 'Yangi bozor dokoni', price: 4000 },
  ]);

  console.log('Seed tugadi. Kirish malumotlari:');
  console.log('  Admin:       admin / admin123');
  console.log('  Nonyovlar:   nonvoy1, nonvoy2, nonvoy3 / nonvoy123');
  console.log('  Shofyorlar:  shofyor1, shofyor2, shofyor3 / shofyor123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed xatosi:', err);
  process.exit(1);
});

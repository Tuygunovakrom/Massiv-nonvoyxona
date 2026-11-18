require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

if (process.env.DEMO_MODE === 'true') {
  app.listen(PORT, () => {
    console.log(`Demo server ${PORT}-portda ishlayapti (MongoDBsiz)`);
  });
} else {
  const connectDB = require('./config/db');
  const User = require('./models/User');
  const Bakery = require('./models/Bakery');
  const Shop = require('./models/Shop');
  const MONGO_URI = process.env.MONGO_URI;

  async function ensureDefaultData() {
    const hasUsers = await User.exists();
    if (hasUsers) return;

    const bakeries = await Bakery.insertMany([
      { name: '1-sonli nonvoyxona' },
      { name: '2-sonli nonvoyxona' },
      { name: '3-sonli nonvoyxona' },
    ]);

    await User.create({ name: 'Bosh administrator', username: 'admin', password: 'admin123', role: 'admin' });
    for (let i = 0; i < bakeries.length; i += 1) {
      await User.create({ name: `Nonyov ${i + 1}`, username: `nonvoy${i + 1}`, password: 'nonvoy123', role: 'nonvoy', bakery: bakeries[i]._id });
      await User.create({ name: `Shofyor ${i + 1}`, username: `shofyor${i + 1}`, password: 'shofyor123', role: 'shofyor' });
    }
    await Shop.insertMany([
      { name: 'Chorsu dokoni', price: 4000 },
      { name: 'Markaz dokoni', price: 4000 },
      { name: 'Yangi bozor dokoni', price: 4000 },
    ]);
    console.log('Default foydalanuvchilar yaratildi: admin / admin123');
  }

  if (!MONGO_URI) {
    console.error('MONGO_URI topilmadi va DEMO_MODE false holatda.');
    process.exit(1);
  }

  connectDB(MONGO_URI)
    .then(async () => {
      await ensureDefaultData();
      app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlayapti`));
    })
    .catch((err) => {
      console.error('MongoDB ga ulanib bolmadi:', err.message);
      process.exit(1);
    });
}

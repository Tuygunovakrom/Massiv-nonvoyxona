const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'database' }));

if (process.env.DEMO_MODE === 'true') {
  app.use('/api', require('./routes/demoRoutes'));
} else {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/bakeries', require('./routes/bakeryRoutes'));
  app.use('/api/shops', require('./routes/shopRoutes'));
  app.use('/api/reports', require('./routes/reportRoutes'));
  app.use('/api/handoffs', require('./routes/handoffRoutes'));
  app.use('/api/driver', require('./routes/driverRoutes'));
  app.use('/api/deliveries', require('./routes/deliveryRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/expenses', require('./routes/expenseRoutes'));
  app.use('/api/comments', require('./routes/commentRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
}

// Topilmagan manzillar
app.use((req, res) => res.status(404).json({ message: 'Manzil topilmadi.' }));

// Yagona error middleware
app.use(errorMiddleware);

module.exports = app;

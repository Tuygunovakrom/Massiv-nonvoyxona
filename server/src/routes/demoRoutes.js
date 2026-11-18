const router = require('express').Router();
const jwt = require('jsonwebtoken');

const users = [
  { _id: 'admin-demo', name: 'Bosh administrator', username: 'admin', role: 'admin', isActive: true },
  { _id: 'bakery-1', name: 'Nonyov 1', username: 'nonvoy1', role: 'nonvoy', isActive: true, bakery: 'b1' },
  { _id: 'bakery-2', name: 'Nonyov 2', username: 'nonvoy2', role: 'nonvoy', isActive: true, bakery: 'b2' },
  { _id: 'bakery-3', name: 'Nonyov 3', username: 'nonvoy3', role: 'nonvoy', isActive: true, bakery: 'b3' },
  { _id: 'driver-1', name: 'Shofyor 1', username: 'shofyor1', role: 'shofyor', isActive: true },
  { _id: 'driver-2', name: 'Shofyor 2', username: 'shofyor2', role: 'shofyor', isActive: true },
  { _id: 'driver-3', name: 'Shofyor 3', username: 'shofyor3', role: 'shofyor', isActive: true },
];

const bakeries = [
  { _id: 'b1', name: '1-sonli nonvoyxona' },
  { _id: 'b2', name: '2-sonli nonvoyxona' },
  { _id: 'b3', name: '3-sonli nonvoyxona' },
];

const shops = [
  { _id: 's1', name: 'Chorsu dokoni', price: 4000 },
  { _id: 's2', name: 'Markaz dokoni', price: 4000 },
  { _id: 's3', name: 'Yangi bozor dokoni', price: 4000 },
];

let report = { _id: 'report-1', closedBread: 500, usedFlour: 5, soldBread: 300, eatenBread: 20, cash: 1200000, click: 300000, isClosed: false };
let day = { _id: 'day-1', isClosed: false };
let handoffs = [{ _id: 'handoff-1', quantity: 100, confirmedQuantity: 100, driver: users[4] }];
let deliveries = [{ _id: 'delivery-1', quantity: 80, cash: 320000, click: 0, shop: shops[0] }];
let orders = [{ _id: 'order-1', customerName: 'Ali', phone: '901234567', quantity: 50, date: new Date().toISOString().slice(0, 10), note: 'Ertaga', isDone: false }];
let expenses = [];
let comments = [];
let audit = [];

const demoUser = (username) => users.find((u) => u.username === username);

router.post('/auth/login', (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = demoUser(username);
  const expected = username === 'admin' ? 'admin123' : username.startsWith('nonvoy') || username.startsWith('shofyor') ? (username.startsWith('nonvoy') ? 'nonvoy123' : 'shofyor123') : '';
  if (!user || password !== expected) return res.status(401).json({ message: 'Login yoki parol xato.' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role, bakery: user.bakery } });
});

router.get('/reports/mine', (req, res) => {
  res.json({ report, givenTotal: handoffs.reduce((n, h) => n + Number(h.quantity || 0), 0), handoffs, orders, expenses, drivers: users.filter((u) => u.role === 'shofyor') });
});
router.put('/reports/mine', (req, res) => { report = { ...report, ...req.body }; res.json(report); });
router.post('/reports/mine/close', (req, res) => { report.isClosed = true; res.json(report); });

router.post('/handoffs', (req, res) => {
  const driver = users.find((u) => u._id === req.body.driverId);
  const item = { _id: `handoff-${Date.now()}`, quantity: Number(req.body.quantity || 0), confirmedQuantity: null, driver: driver || users[4] };
  handoffs.push(item);
  res.status(201).json(item);
});

router.get('/driver/day', (req, res) => res.json({ day, handoffs, deliveries, leftovers: [{ bakery: bakeries[0], received: 100, delivered: 80, leftover: 20 }], expenses }));
router.post('/driver/day/close', (req, res) => { day.isClosed = true; res.json(day); });
router.put('/handoffs/:id/confirm', (req, res) => {
  const item = handoffs.find((h) => h._id === req.params.id);
  if (item) item.confirmedQuantity = Number(req.body.quantity || 0);
  res.json(item || {});
});
router.post('/deliveries', (req, res) => {
  const shop = shops.find((s) => s._id === req.body.shopId);
  const item = { _id: `delivery-${Date.now()}`, quantity: Number(req.body.quantity || 0), cash: Number(req.body.cash || 0), click: Number(req.body.click || 0), shop: shop || shops[0] };
  deliveries.push(item); res.status(201).json(item);
});

router.get('/orders', (req, res) => res.json(orders));
router.post('/orders', (req, res) => { const item = { _id: `order-${Date.now()}`, isDone: false, ...req.body }; orders.push(item); res.status(201).json(item); });
router.put('/orders/:id/done', (req, res) => { const item = orders.find((o) => o._id === req.params.id); if (item) item.isDone = true; res.json(item || {}); });

router.get('/expenses/mine', (req, res) => res.json(expenses));
router.post('/expenses/mine', (req, res) => { const item = { _id: `expense-${Date.now()}`, ...req.body }; expenses.push(item); res.status(201).json(item); });
router.post('/expenses', (req, res) => { const item = { _id: `expense-${Date.now()}`, ...req.body }; expenses.push(item); res.status(201).json(item); });

router.post('/comments', (req, res) => { const item = { _id: `comment-${Date.now()}`, status: 'open', ...req.body }; comments.push(item); res.status(201).json(item); });
router.get('/comments', (req, res) => res.json(comments));
router.put('/comments/:id/resolve', (req, res) => { const item = comments.find((c) => c._id === req.params.id); if (item) item.status = 'resolved'; res.json(item || {}); });

router.get('/users', (req, res) => res.json(users.map((u) => ({ ...u, bakery: u.bakery ? bakeries.find((b) => b._id === u.bakery) : undefined }))));
router.post('/users', (req, res) => { const bakery = bakeries.find((b) => b._id === req.body.bakery); const item = { _id: `user-${Date.now()}`, isActive: true, ...req.body, bakery: bakery?._id }; users.push(item); res.status(201).json(item); });
router.put('/users/:id', (req, res) => { const item = users.find((u) => u._id === req.params.id); if (item) Object.assign(item, req.body); res.json(item || {}); });

router.get('/bakeries', (req, res) => res.json(bakeries));
router.post('/bakeries', (req, res) => { const item = { _id: `b${Date.now()}`, name: req.body.name }; bakeries.push(item); res.status(201).json(item); });
router.get('/shops', (req, res) => res.json(shops));
router.post('/shops', (req, res) => { const item = { _id: `s${Date.now()}`, ...req.body }; shops.push(item); res.status(201).json(item); });
router.put('/shops/:id', (req, res) => { const item = shops.find((s) => s._id === req.params.id); if (item) Object.assign(item, req.body); res.json(item || {}); });

router.get('/admin/day', (req, res) => {
  const totals = { bakeryCash: report.cash, bakeryClick: report.click, driverCash: 320000, driverClick: 0, bakeryTotal: report.cash + report.click, driverTotal: 320000, grandTotal: report.cash + report.click + 320000 };
  const reports = [{ ...report, _id: 'report-1', bakery: bakeries[0], baker: users[1], givenTotal: handoffs.reduce((n, h) => n + Number(h.quantity || 0), 0), leftover: report.closedBread - report.soldBread - report.eatenBread - handoffs.reduce((n, h) => n + Number(h.quantity || 0), 0) }];
  const drivers = [{ driver: users[4], day, handoffs, deliveries, leftovers: [{ bakery: bakeries[0], received: 100, delivered: 80, leftover: 20 }] }];
  res.json({ totals, reports, drivers, handoffs, deliveries, expenses, orders, openComments: comments.filter((c) => c.status === 'open').length });
});
router.put('/admin/reports/:id', (req, res) => { report = { ...report, ...req.body }; res.json(report); });
router.put('/admin/handoffs/:id', (req, res) => { const item = handoffs.find((h) => h._id === req.params.id); if (item) Object.assign(item, req.body); res.json(item || {}); });
router.put('/admin/deliveries/:id', (req, res) => { const item = deliveries.find((h) => h._id === req.params.id); if (item) Object.assign(item, req.body); res.json(item || {}); });
router.put('/admin/expenses/:id', (req, res) => { const item = expenses.find((h) => h._id === req.params.id); if (item) Object.assign(item, req.body); res.json(item || {}); });
router.put('/admin/orders/:id', (req, res) => { const item = orders.find((h) => h._id === req.params.id); if (item) Object.assign(item, req.body); res.json(item || {}); });
router.post('/admin/reports/:id/reopen', (req, res) => { report.isClosed = false; res.json(report); });
router.post('/admin/driverdays/:id/reopen', (req, res) => { day.isClosed = false; res.json(day); });
router.get('/admin/audit', (req, res) => res.json(audit));

module.exports = router;

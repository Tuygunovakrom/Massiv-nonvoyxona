const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/adminController');

router.use(protect, restrict('admin'));
router.get('/day', c.day);
router.put('/reports/:id', c.updateReport);
router.post('/reports/:id/reopen', c.reopen);
router.post('/driverdays/:id/reopen', c.reopenDriverDay);
router.put('/handoffs/:id', c.updateHandoff);
router.put('/deliveries/:id', c.updateDelivery);
router.put('/expenses/:id', c.updateExpense);
router.put('/orders/:id', c.updateOrder);
router.get('/audit', c.audit);

module.exports = router;

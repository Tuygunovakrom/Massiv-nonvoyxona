const router = require('express').Router();
const { protect, restrict, requireBakery } = require('../middleware/auth');
const c = require('../controllers/reportController');

router.use(protect, restrict('nonvoy'), requireBakery);
router.get('/mine', c.getDay);
router.put('/mine', c.saveReport);
router.post('/mine/close', c.closeDay);

module.exports = router;

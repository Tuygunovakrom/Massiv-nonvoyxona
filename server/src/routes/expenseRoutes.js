const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/expenseController');

router.use(protect, restrict('nonvoy', 'shofyor'));
router.get('/mine', c.mine);
router.post('/', c.create);

module.exports = router;

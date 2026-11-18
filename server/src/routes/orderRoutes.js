const router = require('express').Router();
const { protect, restrict, requireBakery } = require('../middleware/auth');
const c = require('../controllers/orderController');

router.use(protect, restrict('nonvoy'), requireBakery);
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id/done', c.done);

module.exports = router;

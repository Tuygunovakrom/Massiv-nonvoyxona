const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/commentController');

router.use(protect);
router.post('/', restrict('nonvoy', 'shofyor'), c.create);
router.get('/mine', restrict('nonvoy', 'shofyor'), c.mine);
router.get('/', restrict('admin'), c.adminList);
router.put('/:id/resolve', restrict('admin'), c.resolve);

module.exports = router;

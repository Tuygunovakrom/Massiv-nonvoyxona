const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/shopController');

router.use(protect);
router.get('/', c.list);
router.post('/', restrict('admin'), c.create);
router.put('/:id', restrict('admin'), c.update);

module.exports = router;

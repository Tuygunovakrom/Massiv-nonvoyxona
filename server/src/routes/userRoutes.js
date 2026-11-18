const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/userController');

router.use(protect, restrict('admin'));
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.deactivate);

module.exports = router;

const router = require('express').Router();
const { protect, restrict, requireBakery } = require('../middleware/auth');
const handoffController = require('../controllers/handoffController');
const driverController = require('../controllers/driverController');

router.use(protect);
router.post('/', restrict('nonvoy'), requireBakery, handoffController.create);
router.put('/:id/confirm', restrict('shofyor'), driverController.confirm);

module.exports = router;

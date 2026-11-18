const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/driverController');

router.use(protect, restrict('shofyor'));
router.post('/', c.createDelivery);

module.exports = router;

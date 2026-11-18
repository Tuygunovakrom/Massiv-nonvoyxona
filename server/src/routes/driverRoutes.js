const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const c = require('../controllers/driverController');

router.use(protect, restrict('shofyor'));
router.get('/day', c.getDay);
router.post('/day/close', c.closeDay);

module.exports = router;

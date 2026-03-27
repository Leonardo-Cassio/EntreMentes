const router = require('express').Router();
const controller = require('../controllers/humorController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);

module.exports = router;
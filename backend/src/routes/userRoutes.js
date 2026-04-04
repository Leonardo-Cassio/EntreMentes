const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, controller.getMe);
router.put('/me', auth, controller.updateMe);
router.delete('/me', auth, controller.deleteMe);

module.exports = router;

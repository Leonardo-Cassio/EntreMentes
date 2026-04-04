const router = require('express').Router();
const controller = require('../controllers/moodController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.get('/:id', auth, controller.getById);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/spots', aiController.getTouristAttraction);
router.post('/schedule', aiController.getSchedule);

module.exports = router;

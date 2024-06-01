const express = require('express');
const router = express.Router();
const tempBoardController = require('../controllers/tempBoardController');

router.post('/', tempBoardController.saveTempPost);
router.get('/', tempBoardController.getAllTempPosts);
router.get('/:id', tempBoardController.getTempPost);
router.put('/:id', tempBoardController.updateTempPost);
router.delete('/:id', tempBoardController.deleteTempPost);

module.exports = router;

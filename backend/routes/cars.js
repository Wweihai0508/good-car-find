const express = require('express');
const router = express.Router();
const CarController = require('../controllers/carController');
const upload = require('../config/multerConfig');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', CarController.getCars);
router.get('/:id', CarController.getCarById);
router.post('/', CarController.addCar);
router.put('/:id', CarController.updateCar);
router.delete('/:id', CarController.deleteCar);
router.post('/upload', upload.array('images', 10), CarController.uploadImage);
router.post('/ai/recognize', CarController.aiRecognizeImage);

module.exports = router;

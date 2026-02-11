const express = require('express');
const router = express.Router();
const PopularController = require('../controllers/popularController');

router.get('/', PopularController.getPopularCars);
router.post('/', PopularController.addPopularCar);
router.put('/:id', PopularController.updatePopularCar);
router.delete('/:id', PopularController.deletePopularCar);

module.exports = router;

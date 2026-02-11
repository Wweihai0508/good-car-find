const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/recommendationController');

router.get('/', RecommendationController.getRecommendations);
router.post('/', RecommendationController.addRecommendation);
router.put('/:id', RecommendationController.updateRecommendation);
router.delete('/:id', RecommendationController.deleteRecommendation);
router.get('/popular', RecommendationController.getPopularCars);

module.exports = router;

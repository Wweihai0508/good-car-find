const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statisticsController');

router.get('/overview', StatisticsController.getOverview);
router.get('/sales-trend', StatisticsController.getSalesTrend);
router.get('/brand-distribution', StatisticsController.getBrandDistribution);
router.get('/price-distribution', StatisticsController.getPriceRangeDistribution);

module.exports = router;

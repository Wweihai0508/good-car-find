const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/salesController');

router.get('/', SalesController.getSales);
router.post('/', SalesController.addSale);
router.put('/:id', SalesController.updateSale);
router.delete('/:id', SalesController.deleteSale);

module.exports = router;

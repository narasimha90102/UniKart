const express = require('express');
const { getMyOrders, createOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my-orders', getMyOrders);
router.post('/', createOrder);

module.exports = router;

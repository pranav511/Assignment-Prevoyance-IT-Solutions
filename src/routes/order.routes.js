const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { placeOrderSchema } = require('../validators/order.validator');

router.post('/', auth('user'), validate(placeOrderSchema), orderCtrl.placeOrder);
router.get('/', auth('user'), orderCtrl.getUserOrders);

module.exports = router;

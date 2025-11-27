const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { addProductSchema, updateStockSchema } = require('../validators/product.validator');

router.use(auth('admin')); 

router.post('/product', validate(addProductSchema), adminCtrl.addProduct);
router.put('/product/stock', validate(updateStockSchema), adminCtrl.updateStock);
router.get('/orders', adminCtrl.viewAllOrders);

module.exports = router;

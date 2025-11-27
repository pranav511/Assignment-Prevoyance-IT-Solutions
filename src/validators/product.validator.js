const Joi = require('joi');

const addProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().precision(2).min(0).required(),
  stock: Joi.number().integer().min(0).required()
});

const updateStockSchema = Joi.object({
  productId: Joi.number().integer().required(),
  stock: Joi.number().integer().min(0).required()
});

module.exports = { addProductSchema, updateStockSchema };

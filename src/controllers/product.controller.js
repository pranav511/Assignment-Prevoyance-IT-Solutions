const pool = require('../config/db');

exports.listProducts = async (req, res, next) => {
  try {
    const [products] = await pool.query('SELECT id, name, description, price, stock FROM products');
    res.json({ products });
  } catch (err) { next(err); }
};

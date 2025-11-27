const pool = require('../config/db');

exports.addProduct = async (req, res, next) => {
  const { name, description, price, stock } = req.validatedBody;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [name, description || '', price, stock]
    );
    res.status(201).json({ message: 'Product added', productId: result.insertId });
  } catch (err) { next(err); }
};

exports.updateStock = async (req, res, next) => {
  const { productId, stock } = req.validatedBody;
  try {
    const [result] = await pool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, productId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Stock updated' });
  } catch (err) { next(err); }
};

exports.viewAllOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    for (const order of orders) {
      const [items] = await pool.query(`
        SELECT oi.product_id, p.name, oi.quantity, oi.price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json({ orders });
  } catch (err) { next(err); }
};

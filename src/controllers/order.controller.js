const pool = require('../config/db');

exports.placeOrder = async (req, res, next) => {
  const { items } = req.validatedBody;
  const userId = req.user.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    for (const it of items) {
      const [rows] = await connection.query('SELECT id, price, stock FROM products WHERE id = ? FOR UPDATE', [it.productId]);
      if (!rows.length) throw { status: 400, message: `Product ${it.productId} not found` };
      const product = rows[0];
      if (product.stock < it.quantity) throw { status: 400, message: `Insufficient stock for product ${it.productId}` };
      totalAmount += parseFloat(product.price) * it.quantity;
    }

    const [orderResult] = await connection.query('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [userId, totalAmount]);
    const orderId = orderResult.insertId;

    for (const it of items) {
      const [prodRows] = await connection.query('SELECT price FROM products WHERE id = ?', [it.productId]);
      const price = prodRows[0].price;
      await connection.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, it.productId, it.quantity, price]);
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [it.quantity, it.productId]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Order placed', orderId });
  } catch (err) {
    await connection.rollback();
    next(err.status ? { status: err.status, message: err.message } : err);
  } finally {
    connection.release();
  }
};

exports.getUserOrders = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const [orders] = await pool.query('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    for (const order of orders) {
      const [items] = await pool.query('SELECT oi.product_id, p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ orders });
  } catch (err) { next(err); }
};

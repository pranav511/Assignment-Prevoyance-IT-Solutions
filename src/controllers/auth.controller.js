const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpires = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res, next) => {
  const { name, email, password } = req.validatedBody;
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, saltRounds);
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    return res.status(201).json({ message: 'User registered', userId: result.insertId });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.validatedBody;
  try {
    const [rows] = await pool.query('SELECT id, password, role, name FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email, role: user.role, name: user.name }, jwtSecret, { expiresIn: jwtExpires });
    res.json({ token });
  } catch (err) { next(err); }
};

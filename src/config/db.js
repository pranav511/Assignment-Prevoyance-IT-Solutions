const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log("Database Connected Successfully 🚀");
  } catch (error) {
    console.error("Database Connection Failed ❗", error);
  }
})();

module.exports = pool;

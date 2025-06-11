// db.js
require('dotenv').config();   // .env 로드
const mysql = require('mysql2/promise');

// MySQL 연결 풀 설정
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 연결 테스트 (앱 실행 시 한 번)
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 AS result');
    console.log('[DB] 연결 확인:', rows[0].result === 1 ? '성공' : '실패');
  } catch (err) {
    console.error('[DB] 연결 에러:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
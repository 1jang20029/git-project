const express = require('express');
const router  = express.Router();
const pool    = require('../db'); // DB 연결 모듈

// 공지사항 불러오기 API
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, content, category_id, DATE_FORMAT(start_at, '%Y.%m.%d') AS display_date
       FROM notifications
       ORDER BY start_at DESC`
    );
    // start_at 기준으로 최신화 할거임
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
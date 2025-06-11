const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../../../db');  // db.js에서 가져오기
const router = express.Router();

router.post('/signup', async (req, res) => {
  const {
    student_number, email, password, name,
    phone, department_id, position
  } = req.body;

  console.log('[DEBUG] 받은 데이터:', req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[DEBUG] 해시 비밀번호:', hashedPassword);

    const [rows] = await pool.execute(`
      INSERT INTO users 
        (student_number, email, password, name, phone, department_id, position) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_number, email, hashedPassword, name, phone, department_id, position]
    );

    console.log('[DEBUG] insert 결과:', rows);
    res.status(201).json({ message: '회원가입 완료' });
  } catch (err) {
    console.error('[회원가입 오류]', err);
    res.status(500).json({ error: '회원가입 실패: 중복된 이메일 또는 학번일 수 있습니다.' });
  }
});

module.exports = router;
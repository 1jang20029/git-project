// server/pages/user/login.js

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../../db');

const router = express.Router();

// ------------------------------------------------------------------
// 1) 로그인 페이지 제공 (HTML 파일)
// ------------------------------------------------------------------
router.get('/login', (req, res) => {
  // front 폴더의 login.html 파일을 전송합니다.
  res.sendFile(path.join(__dirname, '../../../front/pages/user/login.html'));
});

// ------------------------------------------------------------------
// 2) 로그인 처리 API
//    POST /user/login
//    { email, password }
// ------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1) 해당 이메일의 유저 정보 조회
    const [rows] = await pool.execute(
      `SELECT id, email, password, name, position
         FROM users
        WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      // 이메일이 DB에 없으면 401로 응답
      return res.status(401).json({ error: '존재하지 않는 이메일입니다.' });
    }

    const user = rows[0];

    // 2) bcrypt로 비밀번호 비교
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // 3) 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      position: user.position
    };

    // 4) 성공 응답
    res.json({ message: '로그인 성공', user: req.session.user });
  } catch (err) {
    console.error('[로그인 오류]', err);
    res.status(500).json({ error: '서버 오류로 로그인 실패' });
  }
});

module.exports = router;

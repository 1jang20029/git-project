const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../../db'); // DB 연결 모듈

// 로그인 API
router.post('/login', async (req, res, next) => {
  try {
    const { studentId, password } = req.body;
    
    // 입력값 검증
    if (!studentId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '학번과 비밀번호를 모두 입력해주세요.' 
      });
    }

    // 학번 형식 검증 (8자리 또는 7자리)
    if (!/^\d{7,10}$/.test(studentId)) {
      return res.status(400).json({ 
        success: false, 
        error: '올바른 학번/교번/직번을 입력해주세요.' 
      });
    }

    // 사용자 조회
    const [users] = await pool.query(
      `SELECT id, student_id, name, password_hash, role, department, grade, phone, email, 
              is_active, created_at
       FROM users 
       WHERE student_id = ?`,
      [studentId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: '존재하지 않는 학번입니다.' 
      });
    }

    const user = users[0];

    // 계정 활성화 상태 확인
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.' 
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: '비밀번호가 올바르지 않습니다.' 
      });
    }

    // 로그인 성공 - 세션 생성
    req.session.user = {
      id: user.id,
      studentId: user.student_id,
      name: user.name,
      role: user.role,
      department: user.department,
      grade: user.grade,
      phone: user.phone,
      email: user.email
    };

    // 최근 로그인 시간 업데이트
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 로그인 로그 기록
    await pool.query(
      `INSERT INTO login_logs (user_id, login_ip, user_agent, login_at) 
       VALUES (?, ?, ?, NOW())`,
      [user.id, req.ip, req.get('User-Agent')]
    );

    res.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: user.id,
        studentId: user.student_id,
        name: user.name,
        role: user.role,
        department: user.department,
        grade: user.grade,
        phone: user.phone,
        email: user.email
      }
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    next(err);
  }
});

// 로그아웃 API
router.post('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          error: '로그아웃 처리 중 오류가 발생했습니다.' 
        });
      }
      res.json({ 
        success: true, 
        message: '로그아웃 되었습니다.' 
      });
    });
  } else {
    res.json({ 
      success: true, 
      message: '이미 로그아웃 상태입니다.' 
    });
  }
});

// 현재 로그인 상태 확인 API
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      user: req.session.user,
      isLoggedIn: true
    });
  } else {
    res.json({
      success: false,
      isLoggedIn: false,
      message: '로그인이 필요합니다.'
    });
  }
});

// 비밀번호 변경 API
router.put('/change-password', async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false, 
        error: '로그인이 필요합니다.' 
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' 
      });
    }

    // 새 비밀번호 유효성 검사
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        error: '새 비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.' 
      });
    }

    // 현재 사용자 정보 조회
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: '사용자를 찾을 수 없습니다.' 
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: '현재 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 새 비밀번호 암호화
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await pool.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, req.session.user.id]
    );

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (err) {
    console.error('[PASSWORD CHANGE ERROR]', err);
    next(err);
  }
});

module.exports = router;
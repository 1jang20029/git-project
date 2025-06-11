// server/app.js

const express = require('express');
const session = require('express-session');
const path = require('path');
const userLoginRouter = require('./pages/user/login');

const app = express();

// 바디 파싱 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(session({
  secret: 'your-secret-key',       // 실제 운영 시엔 env로 관리해주세요
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,                 // HTTPS 적용 시 true로 변경
    maxAge: 1000 * 60 * 60 * 2     // 2시간
  }
}));

// front 디렉터리의 정적 파일 제공
app.use('/', express.static(path.join(__dirname, '../front')));

// 로그인 관련 라우터 연결
//  GET  /user/login  → 로그인 페이지 (login.html)
//  POST /user/login  → 로그인 처리 API
app.use('/user', userLoginRouter);

// 404 처리
app.use((req, res, next) => {
  res.status(404).send('페이지를 찾을 수 없습니다.');
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('서버 오류가 발생했습니다.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

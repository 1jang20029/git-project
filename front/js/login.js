document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] DOMContentLoaded'); // ✅ 여기 찍히는지 확인

  const form = document.getElementById('loginForm');
  if (!form) {
    console.error('[ERROR] loginForm을 찾을 수 없습니다.');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('[DEBUG] 로그인 요청 시작');

    const data = {
      email: form.email.value,
      password: form.password.value
    };

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('[DEBUG] 응답:', res);

      const result = await res.json();
      if (res.ok) {
        alert('로그인 성공!');
        location.href = '../../index.html'; // ✅ 여기에 맞게 수정
      } else {
        alert('로그인 실패: ' + result.error);
      }
    } catch (err) {
      console.error('[ERROR] 요청 실패:', err);
      alert('서버 오류: ' + err.message);
    }
  });
});

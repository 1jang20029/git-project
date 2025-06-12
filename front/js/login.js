document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('passwordToggle');
  const eyeVisible = toggleBtn?.querySelector('.eye-visible');
  const eyeHidden = toggleBtn?.querySelector('.eye-hidden');

  // 로그인 폼 제출
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value.trim();

    if (!studentId || !password) {
      alert('아이디(학번)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 백엔드 붙을 준비만 해두기
    /*
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '../../index.html';
      } else {
        alert(data.error || '로그인 실패');
      }
    } catch (err) {
      console.error('로그인 요청 실패:', err);
      alert('서버 오류가 발생했습니다.');
    }
    */

    // ⚠️ 실제 로그인은 아직 없으므로 테스트용 안내
    alert('프론트 구조 완료됨. 나중에 백엔드 API 연동 시 주석 해제만 하면 됩니다.');
  });

  // 비밀번호 토글
  toggleBtn?.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type');
    if (type === 'password') {
      passwordInput.setAttribute('type', 'text');
      eyeVisible.style.display = 'none';
      eyeHidden.style.display = 'inline';
    } else {
      passwordInput.setAttribute('type', 'password');
      eyeVisible.style.display = 'inline';
      eyeHidden.style.display = 'none';
    }
  });
});

// 뒤로가기 버튼 처리
function goBack() {
  window.location.href = '../../index.html';
}

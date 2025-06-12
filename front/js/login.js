// 뒤로가기 함수 (header back-button 연결 시)
function goBack() {
  history.back();
}

// 비밀번호 표시/숨김 토글
document.addEventListener('DOMContentLoaded', () => {
  const pwdInput = document.getElementById('password');
  const toggle  = document.getElementById('togglePassword');
  const eyeVis  = toggle.querySelector('.eye-visible');
  const eyeHid  = toggle.querySelector('.eye-hidden');

  toggle.addEventListener('click', () => {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      eyeVis.style.display = 'none';
      eyeHid.style.display = 'block';
    } else {
      pwdInput.type = 'password';
      eyeVis.style.display = 'block';
      eyeHid.style.display = 'none';
    }
  });

  // 폼 제출 예시 (원하시면 실제 API 호출로 교체)
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    // login() 함수 구현 또는 API 호출
    alert('로그인 처리 로직을 여기에 추가하세요.');
  });
});

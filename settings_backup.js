// settings.js
// =============================================================================
// “설정” 뷰 내 토글 및 셀렉트 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 각 요소 가져오기
  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  const fontSizeSelect = document.getElementById('fontSizeSelect');

  // --- 초기값 로드 ---
  // 1) 다크/라이트 모드
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true';
  if (isLightMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  themeToggle.checked = isLightMode;

  // 2) 알림 받기
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = savedNotify === 'true';
  notificationToggle.checked = isNotifyEnabled;

  // 3) 글꼴 크기
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  fontSizeSelect.value = savedFontSize;
  document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
  document.documentElement.classList.add(`font-${savedFontSize}`);

  // --- 이벤트 핸들러 등록 ---
  // 다크/라이트 모드 변경
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('lightMode', 'true');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('lightMode', 'false');
    }
  });

  // 알림 받기 변경
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);
    if (enabled) {
      alert('알림이 활성화되었습니다');
    } else {
      alert('알림이 비활성화되었습니다');
    }
  });

  // 글꼴 크기 변경
  fontSizeSelect.addEventListener('change', () => {
    const size = fontSizeSelect.value; // 'small' / 'medium' / 'large'
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    document.documentElement.classList.add(`font-${size}`);
    localStorage.setItem('fontSize', size);
  });
});

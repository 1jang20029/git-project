// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// “설정” 뷰 내 토글 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');

  // ----- 다크/라이트 모드 초기 상태 로드 -----
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true';

  if (isLightMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }

  themeToggle.checked = isLightMode;

  // 토글 상태 변경 시 로컬스토리지에 저장하고 즉시 적용
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('lightMode', 'true');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('lightMode', 'false');
    }
  });

  // ----- 알림 받기 설정 초기 상태 로드 -----
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = savedNotify === 'true';

  notificationToggle.checked = isNotifyEnabled;

  // 알림 토글 변경 시 로컬스토리지에 저장
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);

    if (enabled) {
      alert('알림이 활성화되었습니다');
    } else {
      alert('알림이 비활성화되었습니다');
    }
  });
});

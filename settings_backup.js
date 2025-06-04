// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// “설정” 뷰 내 토글 및 드롭다운 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const languageSelect = document.getElementById('languageSelect');

  // 1) 다크/라이트 모드 초기 상태 로드
  const savedTheme = localStorage.getItem('smc_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.body.classList.remove('light-mode');
    themeToggle.checked = false;
  } else {
    document.body.classList.add('light-mode');
    themeToggle.checked = true;
  }

  // 토글 상태 변경 시 저장 및 즉시 적용
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('smc_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('smc_theme', 'dark');
    }
  });

  // 2) 푸시 알림 허용/차단 초기 상태 로드
  const savedNotify = localStorage.getItem('smc_notification') || 'disabled';
  notificationToggle.checked = (savedNotify === 'enabled');

  // 알림 토글 변경 시 저장
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('smc_notification', enabled ? 'enabled' : 'disabled');
    // 실제 푸시 구독을 하려면 이곳에서 Push API 연동
    if (enabled) {
      alert('푸시 알림이 활성화되었습니다.');
    } else {
      alert('푸시 알림이 비활성화되었습니다.');
    }
  });

  // 3) 글꼴 크기 초기값 로드
  const savedFontSize = localStorage.getItem('smc_font_size') || 'medium';
  fontSizeSelect.value = savedFontSize;
  applyFontSize(savedFontSize);

  // 드롭다운 변경 시 적용 및 저장
  fontSizeSelect.addEventListener('change', () => {
    const size = fontSizeSelect.value; // small / medium / large
    applyFontSize(size);
    localStorage.setItem('smc_font_size', size);
  });

  // 4) 언어 선택 초기값 로드
  const savedLang = localStorage.getItem('smc_language') || 'ko';
  languageSelect.value = savedLang;
  applyLanguage(savedLang);

  // 드롭다운 변경 시 적용 및 저장
  languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value; // ko / en
    applyLanguage(lang);
    localStorage.setItem('smc_language', lang);
  });
});

// 글꼴 크기 적용 함수
function applyFontSize(size) {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');
  if (size === 'small') {
    document.body.classList.add('font-small');
  } else if (size === 'medium') {
    document.body.classList.add('font-medium');
  } else if (size === 'large') {
    document.body.classList.add('font-large');
  }
}

// 언어 적용 함수 (간단한 예시로 주요 텍스트만 변경)
function applyLanguage(lang) {
  if (lang === 'en') {
    document.getElementById('title-settings').textContent = 'Settings';
  } else {
    document.getElementById('title-settings').textContent = '설정';
  }
}

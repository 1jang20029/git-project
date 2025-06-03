// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// 설정 페이지 내의 각종 토글/입력 값 저장 및 즉시 반영
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ──────────────────────────────────────────────────────────────────────────────
  // 1) 다크/라이트 모드 토글
  // ──────────────────────────────────────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  // 로컬스토리지에서 저장된 값 불러오기
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true';

  if (isLightMode) {
    document.body.classList.add('light-mode');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('light-mode');
    themeToggle.checked = false;
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('lightMode', 'true');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('lightMode', 'false');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 2) 알림 받기 토글
  // ──────────────────────────────────────────────────────────────────────────────
  const notificationToggle = document.getElementById('notificationToggle');
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = savedNotify === 'true';

  notificationToggle.checked = isNotifyEnabled;
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);
    if (enabled) {
      alert('알림이 활성화되었습니다');
    } else {
      alert('알림이 비활성화되었습니다');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 3) 언어 선택
  // ──────────────────────────────────────────────────────────────────────────────
  const languageSelect = document.getElementById('languageSelect');
  const savedLang = localStorage.getItem('siteLanguage') || 'ko';
  languageSelect.value = savedLang;

  languageSelect.addEventListener('change', () => {
    const selectedLang = languageSelect.value;
    localStorage.setItem('siteLanguage', selectedLang);
    // 필요에 따라 즉시 UI를 리로드하거나, 언어가 바뀌었다는 알림을 띄울 수도 있습니다.
    if (selectedLang === 'ko') {
      alert('언어가 한국어로 설정되었습니다');
    } else {
      alert('Language set to English');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 4) 폰트 크기 조절 (range: 12px ~ 24px)
  // ──────────────────────────────────────────────────────────────────────────────
  const fontSizeRange = document.getElementById('fontSizeRange');
  // 로컬스토리지의 폰트 크기 값(픽셀) 불러오기, 없으면 16px 기본
  const savedFontSize = parseInt(localStorage.getItem('fontSize'), 10) || 16;
  fontSizeRange.value = savedFontSize;
  // body 전체 폰트 크기 설정
  document.documentElement.style.setProperty('--user-font-size', `${savedFontSize}px`);

  fontSizeRange.addEventListener('input', () => {
    const newSize = fontSizeRange.value;
    document.documentElement.style.setProperty('--user-font-size', `${newSize}px`);
  });

  fontSizeRange.addEventListener('change', () => {
    const newSize = fontSizeRange.value;
    localStorage.setItem('fontSize', newSize);
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 5) 알림 시간대 설정 (시작/종료)
  // ──────────────────────────────────────────────────────────────────────────────
  const notifyStartTime = document.getElementById('notifyStartTime');
  const notifyEndTime = document.getElementById('notifyEndTime');
  // 로컬스토리지에서 불러온 값, 없으면 빈 문자열
  const savedStart = localStorage.getItem('notifyStart') || '';
  const savedEnd = localStorage.getItem('notifyEnd') || '';
  notifyStartTime.value = savedStart;
  notifyEndTime.value = savedEnd;

  notifyStartTime.addEventListener('change', () => {
    localStorage.setItem('notifyStart', notifyStartTime.value);
  });
  notifyEndTime.addEventListener('change', () => {
    localStorage.setItem('notifyEnd', notifyEndTime.value);
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 6) 기타: 인덱스 페이지에서 사용하는 로직(검색, 드롭다운 등)도 그대로 동작
  //    - 따라서 아래 함수들은 index.js에 정의되어 있어야 합니다.
  //      toggleSidebar(), toggleNotifications(), showProfile(), handleLogout() 등
  // ──────────────────────────────────────────────────────────────────────────────
});

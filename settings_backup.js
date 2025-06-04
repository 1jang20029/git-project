// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// 설정 화면 전용 스크립트: 토글 및 선택 박스 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ──────────────────────────────────────────────────
  // 1) HTML 요소 가져오기
  // ──────────────────────────────────────────────────
  const themeToggle        = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  const fontSizeSelect     = document.getElementById('fontSizeSelect');
  const languageSelect     = document.getElementById('languageSelect');

  // ──────────────────────────────────────────────────
  // 2) 다크/라이트 모드 초기 상태 설정
  // ──────────────────────────────────────────────────
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode    = (savedLightMode === 'true');

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


  // ──────────────────────────────────────────────────
  // 3) 푸시 알림 받기 초기 상태 설정
  // ──────────────────────────────────────────────────
  const savedNotify       = localStorage.getItem('enableNotification');
  const isNotifyEnabled   = (savedNotify === 'true');

  notificationToggle.checked = isNotifyEnabled;

  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);
    if (enabled) {
      alert('푸시 알림이 활성화되었습니다.');
    } else {
      alert('푸시 알림이 비활성화되었습니다.');
    }
  });


  // ──────────────────────────────────────────────────
  // 4) 글꼴 크기 초기 상태 설정
  // ──────────────────────────────────────────────────
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  fontSizeSelect.value = savedFontSize;
  applyFontSize(savedFontSize);

  fontSizeSelect.addEventListener('change', () => {
    const selectedSize = fontSizeSelect.value;
    localStorage.setItem('fontSize', selectedSize);
    applyFontSize(selectedSize);
  });


  // ──────────────────────────────────────────────────
  // 5) 언어 선택 초기 상태 설정
  // ──────────────────────────────────────────────────
  const savedLanguage = localStorage.getItem('language') || 'ko';
  languageSelect.value = savedLanguage;
  applyLanguage(savedLanguage);

  languageSelect.addEventListener('change', () => {
    const selectedLang = languageSelect.value;
    localStorage.setItem('language', selectedLang);
    applyLanguage(selectedLang);
  });
});


/**
 * 글꼴 크기를 즉시 전체 문서에 적용합니다.
 * html 태그에 클래스를 붙였다가 제거하는 방식으로 관리합니다.
 * 'small' → 14px, 'medium' → 16px, 'large' → 18px
 */
function applyFontSize(size) {
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('font-small', 'font-medium', 'font-large');

  if (size === 'small') {
    htmlEl.classList.add('font-small');
  } else if (size === 'medium') {
    htmlEl.classList.add('font-medium');
  } else if (size === 'large') {
    htmlEl.classList.add('font-large');
  }
}

/**
 * 언어 선택을 즉시 반영합니다.
 * 실제 다국어 번역은 별도 로직을 추가해야 하지만,
 * 여기서는 일단 <html> 태그의 lang 속성만 변경해 둡니다.
 */
function applyLanguage(langCode) {
  document.documentElement.lang = langCode;
  // 실제 다국어 텍스트 교체가 필요하다면 이 지점에서 처리하세요.
}

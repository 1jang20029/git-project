// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// 설정 화면 전용 스크립트: 토글 및 선택 박스 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 각각의 DOM 요소를 가져옵니다.
  const themeToggle        = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  const fontSizeSelect     = document.getElementById('fontSizeSelect');
  const languageSelect     = document.getElementById('languageSelect');

  // ── 1) 다크/라이트 모드 초기 상태 로드 ──
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = (savedLightMode === 'true');
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

  // ── 2) 푸시 알림 받기 설정 초기 상태 ──
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = (savedNotify === 'true');
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

  // ── 3) 글꼴 크기 선택 초기 상태 로드 ──
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  fontSizeSelect.value = savedFontSize;
  applyFontSize(savedFontSize);

  fontSizeSelect.addEventListener('change', () => {
    const selectedSize = fontSizeSelect.value;
    localStorage.setItem('fontSize', selectedSize);
    applyFontSize(selectedSize);
  });

  // ── 4) 언어 선택 초기 상태 로드 ──
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
 * 'small' → 14px, 'medium' → 16px, 'large' → 18px 로 설정합니다.
 * @param {string} size 
 */
function applyFontSize(size) {
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('font-small', 'font-medium', 'font-large');

  if (size === 'small') {
    htmlEl.classList.add('font-small');   // 14px
  } else if (size === 'medium') {
    htmlEl.classList.add('font-medium');  // 16px
  } else if (size === 'large') {
    htmlEl.classList.add('font-large');   // 18px
  }
}

/**
 * 언어 선택을 즉시 반영합니다.
 * 여기서는 <html> 태그의 lang 속성만 변경하며,
 * 실제 다국어 번역 로직은 별도 라이브러리에 위임할 수 있습니다.
 * @param {string} langCode - 'ko' | 'en' | 'jp'
 */
function applyLanguage(langCode) {
  document.documentElement.lang = langCode;
  // 실제 번역 엔진이 연결되어 있다면, 이 지점에서 번역 로직을 호출하세요.
}

// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// “설정” 뷰 내 토글/선택 박스 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 다크/라이트 모드 토글 요소
  const themeToggle = document.getElementById('themeToggle');
  // 푸시 알림 받기 토글 요소
  const notificationToggle = document.getElementById('notificationToggle');
  // 글꼴 크기 선택 요소
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  // 언어 선택 요소
  const languageSelect = document.getElementById('languageSelect');

  // ── 1) 다크/라이트 모드 초기 상태 로드 ──
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = (savedLightMode === 'true');

  if (isLightMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  themeToggle.checked = isLightMode;

  // 사용자가 토글을 변경했을 때, localStorage에 저장하고 즉시 적용
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('lightMode', 'true');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('lightMode', 'false');
    }
  });

  // ── 2) 푸시 알림 받기 설정 초기 상태 로드 ──
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = (savedNotify === 'true');
  notificationToggle.checked = isNotifyEnabled;

  // 푸시 알림 토글 변경 시, 로컬 스토리지에 저장하고 간단한 안내 메시지 표시
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
  const savedFontSize = localStorage.getItem('fontSize');
  // 기본값을 'medium'으로 지정
  const initialFontSize = savedFontSize || 'medium';
  fontSizeSelect.value = initialFontSize;
  applyFontSize(initialFontSize);

  // 사용자가 글꼴 크기를 변경했을 때, localStorage에 저장하고 즉시 적용
  fontSizeSelect.addEventListener('change', () => {
    const selectedSize = fontSizeSelect.value;
    localStorage.setItem('fontSize', selectedSize);
    applyFontSize(selectedSize);
  });

  // ── 4) 언어 선택 초기 상태 로드 ──
  const savedLanguage = localStorage.getItem('language');
  const initialLanguage = savedLanguage || 'ko'; // 기본: 한국어
  languageSelect.value = initialLanguage;
  applyLanguage(initialLanguage);

  // 사용자가 언어를 변경했을 때, localStorage에 저장하고 즉시 적용
  languageSelect.addEventListener('change', () => {
    const selectedLang = languageSelect.value;
    localStorage.setItem('language', selectedLang);
    applyLanguage(selectedLang);
  });
});


// =============================================================================
// 아래 함수들은 설정값을 즉시 화면에 반영하는 역할을 담당합니다.
//=============================================================================

/**
 * 글꼴 크기를 즉시 전체 문서에 적용합니다.
 * @param {string} size - 'small' | 'medium' | 'large'
 */
function applyFontSize(size) {
  const htmlEl = document.documentElement;

  // 기존에 설정된 크기 관련 클래스를 모두 제거하고, 새로운 크기 클래스만 추가
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
 * 실제 다국어 처리는 별도의 i18n 라이브러리나 JSON 리소스가 필요하겠지만,
 * 여기서는 선택된 언어 코드를 <html> 태그의 lang 속성에 반영하는 예시만 보여줍니다.
 * @param {string} langCode - 'ko' | 'en' | 'jp'
 */
function applyLanguage(langCode) {
  document.documentElement.lang = langCode;
  // (실제 다국어 번역 엔진이 있다면 여기에서 번역 로직을 호출합니다.)
}

// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// “설정” 뷰 내의 토글, 셀렉트 박스 동작을 처리하는 스크립트
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1) DOM 요소 참조
  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const languageSelect = document.getElementById('languageSelect');

  // --------------------------------------------------
  // 2) 다크/라이트 모드 초기 상태 로드
  // --------------------------------------------------
  // localStorage에 'lightMode' 키로 저장된 값(문자열 'true'/'false') 확인
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true';

  if (isLightMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  // 토글 체크박스 상태 반영
  themeToggle.checked = isLightMode;

  // 토글 상태가 바뀔 때마다 바로 적용하고 localStorage에 저장
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('lightMode', 'true');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('lightMode', 'false');
    }
  });

  // --------------------------------------------------
  // 3) 푸시 알림 토글 초기 상태 로드
  // --------------------------------------------------
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = savedNotify === 'true';
  notificationToggle.checked = isNotifyEnabled;

  // 토글 상태가 바뀔 때마다 localStorage에 저장하고 알림 표시
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);

    if (enabled) {
      showTemporaryMessage('알림이 활성화되었습니다');
    } else {
      showTemporaryMessage('알림이 비활성화되었습니다');
    }
  });

  // --------------------------------------------------
  // 4) 글꼴 크기 선택 초기 상태 로드
  // --------------------------------------------------
  // 저장된 fontSize를 가져오되, 없으면 'medium'을 기본값으로 지정
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  fontSizeSelect.value = savedFontSize;

  applyFontSize(savedFontSize);

  // 선택이 바뀔 때마다 <body>에 클래스 추가/제거, localStorage에 저장
  fontSizeSelect.addEventListener('change', () => {
    const size = fontSizeSelect.value;
    applyFontSize(size);
    localStorage.setItem('fontSize', size);
  });

  // --------------------------------------------------
  // 5) 언어 선택 초기 상태 로드
  // --------------------------------------------------
  const savedLanguage = localStorage.getItem('language') || 'ko';
  languageSelect.value = savedLanguage;

  applyLanguage(savedLanguage);

  // 선택이 바뀔 때마다 언어 적용 함수 호출, localStorage에 저장
  languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    applyLanguage(lang);
    localStorage.setItem('language', lang);
  });

  // --------------------------------------------------
  // 6) 화면 로딩 시, 저장된 설정들 반영
  // --------------------------------------------------
  // - 다크/라이트 모드는 이미 2)에서 처리됨
  // - 푸시 알림: 앱 전반적으로는 알림을 보내는 로직이 따로 있어야 함 (여기서는 메시지 표시만)
  // - 글꼴 크기는 applyFontSize 함수를 통해 반영됨
  // - 언어 선택은 applyLanguage 함수를 통해 반영됨
});

/* =============================================================================
   헬퍼 함수 모음
   ============================================================================= */

/**
 * applyFontSize(size)
 * - 파라미터 size: 'small' | 'medium' | 'large'
 * - body 태그에 CSS 클래스 추가/제거를 통해 전역 글꼴 크기를 조절
 */
function applyFontSize(size) {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');

  switch (size) {
    case 'small':
      document.body.classList.add('font-small');
      break;
    case 'large':
      document.body.classList.add('font-large');
      break;
    default:
      // medium이거나 그 외 예상치 못한 값인 경우, 기본 'font-medium'
      document.body.classList.add('font-medium');
      break;
  }
}

/**
 * applyLanguage(lang)
 * - 파라미터 lang: 'ko' | 'en'
 * - 언어 선택 값에 따라 페이지 내 텍스트를 동적으로 변경
 * - 실제 번역 문자열은 간단 예시로 로컬 객체에 두고, 필요 시 다국어 라이브러리 등을 사용
 */
function applyLanguage(lang) {
  // 간단 예시: 번역할 문자열을 자바스크립트 객체로 정의
  const translations = {
    ko: {
      headerTitle: '설정',
      breadcrumbHome: '홈',
      breadcrumbCurrent: '설정',
      labelDarkMode: '다크/라이트 모드',
      labelNotify: '푸시 알림 받기',
      labelFontSize: '글꼴 크기',
      labelLanguage: '언어 선택',

      optionSmall: '작게',
      optionMedium: '보통',
      optionLarge: '크게',

      optionKorean: '한국어',
      optionEnglish: 'English',
    },
    en: {
      headerTitle: 'Settings',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Settings',
      labelDarkMode: 'Dark/Light Mode',
      labelNotify: 'Receive Notifications',
      labelFontSize: 'Font Size',
      labelLanguage: 'Select Language',

      optionSmall: 'Small',
      optionMedium: 'Medium',
      optionLarge: 'Large',

      optionKorean: '한국어',
      optionEnglish: 'English',
    },
  };

  // 현재 언어에 해당하는 번역 객체
  const t = translations[lang] || translations['ko'];

  // 1) 헤더 텍스트 변경
  document.querySelector('#settingsHeader h1').textContent = t.headerTitle;
  const breadcrumbSpans = document.querySelectorAll('#settingsBreadcrumb span');
  if (breadcrumbSpans.length >= 3) {
    breadcrumbSpans[0].textContent = t.breadcrumbHome;
    breadcrumbSpans[2].textContent = t.breadcrumbCurrent;
  }

  // 2) 각 라벨 요소의 텍스트 변경
  const labelDarkMode = document.querySelector('label[for="themeToggle"]');
  if (labelDarkMode) labelDarkMode.textContent = t.labelDarkMode;
  const labelNotify = document.querySelector('label[for="notificationToggle"]');
  if (labelNotify) labelNotify.textContent = t.labelNotify;
  const labelFontSize = document.querySelector('label[for="fontSizeSelect"]');
  if (labelFontSize) labelFontSize.textContent = t.labelFontSize;
  const labelLanguage = document.querySelector('label[for="languageSelect"]');
  if (labelLanguage) labelLanguage.textContent = t.labelLanguage;

  // 3) 글꼴 크기 옵션 내부 텍스트 변경
  const optionsFontSize = document.querySelectorAll('#fontSizeSelect option');
  if (optionsFontSize.length === 3) {
    optionsFontSize[0].textContent = t.optionSmall;   // value="small"
    optionsFontSize[1].textContent = t.optionMedium;  // value="medium"
    optionsFontSize[2].textContent = t.optionLarge;   // value="large"
  }

  // 4) 언어 선택 옵션 내부 텍스트 변경
  const optionsLanguage = document.querySelectorAll('#languageSelect option');
  if (optionsLanguage.length === 2) {
    optionsLanguage[0].textContent = t.optionKorean; // value="ko"
    optionsLanguage[1].textContent = t.optionEnglish; // value="en"
  }
}

/**
 * showTemporaryMessage(msg)
 * - 사용자가 토글을 바꿀 때 잠깐 화면에 떠 있는 알림 메시지 창을 띄움
 * - 3초 후 살짝 사라지도록 애니메이션 효과 적용
 */
function showTemporaryMessage(msg) {
  // 1) 메시지 박스 요소 생성
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: rgba(59, 130, 246, 0.9);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: 600;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(59, 130, 246, 0.3);
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = msg;

  // 2) 문서에 추가
  document.body.appendChild(notification);

  // 3) 3초 후 애니메이션으로 제거
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// =============================================================================
// settings_backup.js
// ──────────────────────────────────────────────────────────────────────────────
// “설정” 화면 전용: 체크박스 토글 / 드롭다운 동작 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1) 다크/라이트 모드 토글 (ID: themeToggle)
  const themeToggle = document.getElementById('themeToggle');

  // 로컬스토리지에 저장된 'lightMode' 값을 읽어와서, 초기 상태를 세팅
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true'; // 문자열 "true" ⟹ true
  if (isLightMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  themeToggle.checked = isLightMode;

  // 체크박스 상태가 바뀔 때마다, <body> 클래스 토글 & 로컬스토리지 저장
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('lightMode', 'true');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('lightMode', 'false');
    }
  });


  // 2) 푸시 알림 받기 토글 (ID: notificationToggle)
  const notificationToggle = document.getElementById('notificationToggle');

  // 로컬스토리지에 저장된 'enableNotification' 값을 읽어와서 체크박스 초기 상태 세팅
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = savedNotify === 'true'; // 문자열 "true" ⟹ true
  notificationToggle.checked = isNotifyEnabled;

  // 체크박스 상태 변경 시, 로컬스토리지에 값 저장 & 간단한 알림 표시
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);

    if (enabled) {
      alert('푸시 알림이 활성화되었습니다.');
      // TODO: 실제 푸시 알림 허용 API 로직 추가 가능
    } else {
      alert('푸시 알림이 비활성화되었습니다.');
      // TODO: 실제 푸시 알림 차단 로직 추가 가능
    }
  });


  // 3) 글꼴 크기 선택 드롭다운 (ID: fontSizeSelect)
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const savedFontSize = localStorage.getItem('fontSizeOption') || 'normal';
  fontSizeSelect.value = savedFontSize;

  // 드롭다운 선택이 바뀔 때마다 로컬스토리지 저장 & 실제 적용
  fontSizeSelect.addEventListener('change', () => {
    const value = fontSizeSelect.value; // "small", "normal", "large"
    localStorage.setItem('fontSizeOption', value);

    // 지금 예시에서는 <html> 요소의 font-size를 변경합니다.
    if (value === 'small') {
      document.documentElement.style.fontSize = '14px';
    } else if (value === 'normal') {
      document.documentElement.style.fontSize = '16px';
    } else if (value === 'large') {
      document.documentElement.style.fontSize = '20px';
    }
  });

  // 페이지 로드 시, 저장된 글꼴 크기를 실제로 적용
  if (savedFontSize === 'small') {
    document.documentElement.style.fontSize = '14px';
  } else if (savedFontSize === 'normal') {
    document.documentElement.style.fontSize = '16px';
  } else if (savedFontSize === 'large') {
    document.documentElement.style.fontSize = '20px';
  }


  // 4) 언어 선택 드롭다운 (ID: languageSelect)
  const languageSelect = document.getElementById('languageSelect');
  const savedLang = localStorage.getItem('selectedLanguage') || 'ko';
  languageSelect.value = savedLang;

  // 드롭다운 변경 시 로컬스토리지 저장 & (예시) alert 띄우기
  languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value; // e.g. "ko", "en", "jp"
    localStorage.setItem('selectedLanguage', lang);

    // 실제로 번역 로직이 연결되어 있다면, 페이지를 reload 하거나 
    // 텍스트를 즉시 교체하는 로직을 삽입해 주세요.
    alert(`선택된 언어: ${lang}`);
    // location.reload(); // 필요 시 주석 해제
  });
});

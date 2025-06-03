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
    if (selectedLang === 'ko') {
      alert('언어가 한국어로 설정되었습니다');
    } else {
      alert('Language set to English');
    }
    // 실제 프로젝트에서는 여기에서 언어별 리소스를 다시 로드하거나 페이지를 새로고침할 수 있습니다.
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 4) 폰트 크기 조절 (12px ~ 24px)
  // ──────────────────────────────────────────────────────────────────────────────
  const fontSizeRange = document.getElementById('fontSizeRange');
  // 저장된 폰트 크기(px) 불러오기, 없으면 16px 기본
  const savedFontSize = parseInt(localStorage.getItem('fontSize'), 10) || 16;
  fontSizeRange.value = savedFontSize;
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
  // 5) 알림 시간대 설정 (시작/종료 시간)
  // ──────────────────────────────────────────────────────────────────────────────
  const notifyStartTime = document.getElementById('notifyStartTime');
  const notifyEndTime = document.getElementById('notifyEndTime');
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
  // 6) 기본 탭 선택 (페이지 로드 시 이동)
  // ──────────────────────────────────────────────────────────────────────────────
  const defaultTabSelect = document.getElementById('defaultTabSelect');
  const savedDefaultTab = localStorage.getItem('defaultTab') || 'home';
  defaultTabSelect.value = savedDefaultTab;

  defaultTabSelect.addEventListener('change', () => {
    const selectedTab = defaultTabSelect.value;
    localStorage.setItem('defaultTab', selectedTab);
    alert(`기본 탭이 '${defaultTabSelect.options[defaultTabSelect.selectedIndex].text}'(으)로 변경되었습니다.`);
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 7) 자동 새로고침 주기 설정 (초 단위, 기본 60초)
  // ──────────────────────────────────────────────────────────────────────────────
  const autoRefreshInterval = document.getElementById('autoRefreshInterval');
  const savedInterval = parseInt(localStorage.getItem('autoRefresh'), 10) || 60;
  autoRefreshInterval.value = savedInterval;

  autoRefreshInterval.addEventListener('change', () => {
    let val = parseInt(autoRefreshInterval.value, 10);
    if (isNaN(val) || val < 10) val = 10;
    if (val > 600) val = 600;
    autoRefreshInterval.value = val;
    localStorage.setItem('autoRefresh', val);
    alert(`자동 새로고침 주기가 ${val}초로 설정되었습니다.`);
    // index.js의 setInterval을 재설정하도록 이벤트를 발생
    window.dispatchEvent(new Event('autoRefreshChanged'));
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 8) 지도 기본 줌 레벨 설정 (14 ~ 19)
  // ──────────────────────────────────────────────────────────────────────────────
  const mapZoomRange = document.getElementById('mapZoomRange');
  const savedZoom = parseInt(localStorage.getItem('mapDefaultZoom'), 10) || 16;
  mapZoomRange.value = savedZoom;

  mapZoomRange.addEventListener('input', () => {
    const newZoom = parseInt(mapZoomRange.value, 10);
    // 즉시 화면에 반영하기 위해 naverMap 존재 시 적용
    if (typeof naver !== 'undefined' && naverMap) {
      naverMap.setZoom(newZoom);
    }
  });

  mapZoomRange.addEventListener('change', () => {
    const newZoom = parseInt(mapZoomRange.value, 10);
    localStorage.setItem('mapDefaultZoom', newZoom);
    alert(`지도 기본 줌 레벨이 ${newZoom}로 설정되었습니다.`);
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 9) 알림 음향(on/off)
  // ──────────────────────────────────────────────────────────────────────────────
  const notificationSoundToggle = document.getElementById('notificationSoundToggle');
  const savedSound = localStorage.getItem('enableSound') === 'true';
  notificationSoundToggle.checked = savedSound;

  notificationSoundToggle.addEventListener('change', () => {
    const enabled = notificationSoundToggle.checked;
    localStorage.setItem('enableSound', enabled);
    if (enabled) {
      alert('알림 음향이 활성화되었습니다');
    } else {
      alert('알림 음향이 비활성화되었습니다');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // 10) 초기 화면 로드시 “기본 탭” 이동
  // ──────────────────────────────────────────────────────────────────────────────
  // settings.html을 로드해도, 사용자가 직접 해시를 건 것이라면 해시 우선,
  // 아니라면 localStorage->defaultTab으로 이동.
  const urlHash = window.location.hash.slice(1);
  if (urlHash && document.getElementById(urlHash + 'Content')) {
    showContentInternal(urlHash);
  } else {
    showContentInternal(savedDefaultTab);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 내부에서만 쓰이는 “해시 탭 전환” 함수 (설정 페이지 로드 시 처리)
// ──────────────────────────────────────────────────────────────────────────────
function showContentInternal(type) {
  // settings.html에서는 오직 settingsContent만 표시하면 되므로,
  // SPA 전환 로직은 index.js의 showContent를 재사용하지 않음.
  // 해시에 맞춰 settings.html 로딩 시 아무런 추가 페이지 전환 없이 내부 처리.
  window.location.hash = type;
}

// =============================================================================
// 이 아래부터는 “알림이 올 때 소리 재생” 등 부가 로직 정의
// =============================================================================

// 새로운 알림이 도착했을 때 호출될 수 있는 함수 예시
// 예를 들어 index.js에서 fetch된 notifications에 새로운 항목이 있으면
// playNotificationSound()를 호출하도록 연결
function playNotificationSound() {
  const enabled = localStorage.getItem('enableSound') === 'true';
  if (!enabled) return;
  const audio = new Audio('notification.mp3'); // 프로젝트에 알림 음원 파일을 넣어두세요.
  audio.play();
}

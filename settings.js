// =============================================================================
// settings.js
//
// 분리된 설정 화면 전용 자바스크립트
// =============================================================================

// 설정 가능한 알림 카테고리 목록
const notificationCategories = [
  { id: 'notice', label: '공지사항' },
  { id: 'community', label: '커뮤니티' },
  { id: 'shuttle', label: '셔틀버스' },
  { id: 'timetable', label: '시간표' }
];

// 단축키 설정할 기능 목록
const shortcutActions = [
  { id: 'home', label: '대시보드로 이동', handler: () => showContent('home') },
  { id: 'buildings', label: '건물 페이지로 이동', handler: () => showContent('buildings') },
  { id: 'community', label: '커뮤니티 페이지로 이동', handler: () => showContent('community') },
  { id: 'notices', label: '공지사항 페이지로 이동', handler: () => showContent('notices') }
];

// 전역 단축키 매핑 객체
let shortcutMap = {}; // 예: { 'KeyH': () => showContent('home'), ... }

// =============================================================================
// initSettingsPage: settings.html 삽입 후 호출되어 설정 화면 동작을 초기화
// =============================================================================
function initSettingsPage() {
  // 1. 다크/라이트 모드 토글 & 알림 전체 모드 토글
  initThemeToggle();
  initGlobalNotificationToggle();

  // 2. 카테고리별 알림 토글 생성 & 초기화
  initCategoryNotificationToggles();

  // 3. DND 모드 시간 설정
  initDoNotDisturbSettings();

  // 4. 자동 로그아웃 설정
  initAutoLogoutSettings();

  // 5. 단축키 설정 생성 & 초기화
  initShortcutSettings();

  // 6. 전역 키보드 리스너 등록
  registerGlobalKeyboardListener();
}

// =============================================================================
// 1. 다크/라이트 모드 토글 초기화
// =============================================================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  const savedLightMode = localStorage.getItem('lightMode') === 'true';
  themeToggle.checked = savedLightMode;
  applyTheme(savedLightMode);

  themeToggle.addEventListener('change', () => {
    const isLight = themeToggle.checked;
    applyTheme(isLight);
    localStorage.setItem('lightMode', isLight);
    showMessage(isLight ? '라이트 모드로 변경되었습니다' : '다크 모드로 변경되었습니다', 'success');
  });
}

function applyTheme(isLight) {
  if (isLight) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
}

// =============================================================================
// 2. 알림 전체 모드 토글 초기화
// =============================================================================
function initGlobalNotificationToggle() {
  const globalToggle = document.getElementById('globalNotificationToggle');
  if (!globalToggle) return;

  // 저장된 값 없으면 기본 true
  const saved = localStorage.getItem('enableAllNotifications');
  const enabled = saved === null ? true : saved === 'true';
  globalToggle.checked = enabled;

  // 초기 상태에 따라 개별 카테고리 토글도 모두 체크/해제
  toggleAllCategoryCheckboxes(enabled);

  globalToggle.addEventListener('change', () => {
    const isEnabled = globalToggle.checked;
    localStorage.setItem('enableAllNotifications', isEnabled);
    toggleAllCategoryCheckboxes(isEnabled);
    showMessage(isEnabled ? '모든 알림이 활성화되었습니다' : '모든 알림이 비활성화되었습니다', 'info');
  });
}

function toggleAllCategoryCheckboxes(enabled) {
  notificationCategories.forEach(({ id }) => {
    const checkbox = document.getElementById(`${id}NotificationToggle`);
    if (checkbox) {
      checkbox.checked = enabled;
      localStorage.setItem(`${id}Notifications`, enabled);
    }
  });
}

// =============================================================================
// 3. 카테고리별 알림 토글 생성 및 초기화
// =============================================================================
function initCategoryNotificationToggles() {
  const container = document.getElementById('categoryNotificationsContainer');
  if (!container) return;

  notificationCategories.forEach(({ id, label }) => {
    // 토글 HTML 생성
    const div = document.createElement('div');
    div.className = 'setting-item';
    div.innerHTML = `
      <label for="${id}NotificationToggle">${label} 알림 받기</label>
      <input type="checkbox" id="${id}NotificationToggle" />
    `;
    container.appendChild(div);

    // 초기 상태 로드
    const saved = localStorage.getItem(`${id}Notifications`);
    const enabled = saved === null ? true : saved === 'true';
    const checkbox = document.getElementById(`${id}NotificationToggle`);
    checkbox.checked = enabled;

    // 변경 시 로컬스토리지에 저장
    checkbox.addEventListener('change', () => {
      localStorage.setItem(`${id}Notifications`, checkbox.checked);
      showMessage(`${label} 알림이 ${checkbox.checked ? '활성화' : '비활성화'}되었습니다`, 'info');

      // 전체 토글 상태 업데이트
      updateGlobalNotificationToggle();
    });
  });

  // 전체 토글 상태 초기화
  updateGlobalNotificationToggle();
}

function updateGlobalNotificationToggle() {
  const globalToggle = document.getElementById('globalNotificationToggle');
  if (!globalToggle) return;

  const allEnabled = notificationCategories.every(({ id }) => {
    return localStorage.getItem(`${id}Notifications`) === 'true';
  });
  globalToggle.checked = allEnabled;
  localStorage.setItem('enableAllNotifications', allEnabled);
}

// =============================================================================
// 4. Do Not Disturb(DND) 모드 초기화
// =============================================================================
function initDoNotDisturbSettings() {
  const dndStart = document.getElementById('dndStartTime');
  const dndEnd = document.getElementById('dndEndTime');
  if (!dndStart || !dndEnd) return;

  // 로컬스토리지에서 값 로드 (HH:MM 형식)
  const savedStart = localStorage.getItem('dndStart') || '21:00';
  const savedEnd = localStorage.getItem('dndEnd') || '07:00';
  dndStart.value = savedStart;
  dndEnd.value = savedEnd;

  dndStart.addEventListener('change', () => {
    localStorage.setItem('dndStart', dndStart.value);
    showMessage(`DND 시작 시간이 ${dndStart.value}로 설정되었습니다`, 'success');
  });
  dndEnd.addEventListener('change', () => {
    localStorage.setItem('dndEnd', dndEnd.value);
    showMessage(`DND 종료 시간이 ${dndEnd.value}로 설정되었습니다`, 'success');
  });
}

// =============================================================================
// 5. 자동 로그아웃 설정 초기화
// =============================================================================
let autoLogoutTimer = null;

function initAutoLogoutSettings() {
  const logoutInput = document.getElementById('autoLogoutTimeout');
  if (!logoutInput) return;

  // 저장된 값 로드 (분 단위)
  const saved = localStorage.getItem('autoLogoutMinutes') || '15';
  logoutInput.value = saved;

  logoutInput.addEventListener('change', () => {
    const minutes = parseInt(logoutInput.value, 10) || 0;
    localStorage.setItem('autoLogoutMinutes', minutes);
    showMessage(`자동 로그아웃 시간이 ${minutes}분으로 설정되었습니다`, 'success');
    resetAutoLogoutTimer();
  });

  // 페이지 로드 시 타이머 설정
  resetAutoLogoutTimer();

  // 사용자 활동 이벤트로 타이머 리셋
  ['mousemove', 'keydown', 'click', 'touchstart'].forEach((evt) => {
    document.addEventListener(evt, resetAutoLogoutTimer);
  });
}

function resetAutoLogoutTimer() {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
  }
  const minutes = parseInt(localStorage.getItem('autoLogoutMinutes'), 10) || 0;
  if (minutes > 0) {
    autoLogoutTimer = setTimeout(() => {
      handleAutoLogout();
    }, minutes * 60 * 1000);
  }
}

function handleAutoLogout() {
  // 실제 로그아웃 로직 호출
  showMessage('자동 로그아웃되었습니다', 'info');
  localStorage.removeItem('currentLoggedInUser');
  checkUserStatus();
  showContent('home');
}

// =============================================================================
// 6. 단축키 설정 생성 및 초기화
// =============================================================================
function initShortcutSettings() {
  const container = document.getElementById('shortcutSettingsContainer');
  if (!container) return;

  shortcutActions.forEach(({ id, label }) => {
    // HTML 생성
    const div = document.createElement('div');
    div.className = 'setting-item';
    div.innerHTML = `
      <label for="${id}ShortcutKey">${label} 단축키</label>
      <input type="text" id="${id}ShortcutKey" placeholder="예: Ctrl+H" readonly />
    `;
    container.appendChild(div);

    const input = document.getElementById(`${id}ShortcutKey`);
    // 로컬스토리지에서 키 로드
    const savedKey = localStorage.getItem(`${id}Shortcut`) || '';
    input.value = savedKey;

    // 클릭 시 키 입력 받기
    input.addEventListener('focus', () => {
      input.value = '';
      input.placeholder = '키를 누른 뒤 Enter';
      // 키다운 리스너 일시 등록
      const keyHandler = (e) => {
        e.preventDefault();
        const combo = formatKeyCombo(e);
        input.value = combo;
        localStorage.setItem(`${id}Shortcut`, combo);
        showMessage(`${label} 단축키가 ${combo}로 설정되었습니다`, 'success');
        // 매핑 업데이트
        setupShortcutMapping(id, combo);
        // 포커스 해제 및 핸들러 제거
        input.blur();
      };
      input.addEventListener('keydown', keyHandler, { once: true });
    });
  });

  // 초기 매핑 구성
  shortcutActions.forEach(({ id }) => {
    const saved = localStorage.getItem(`${id}Shortcut`) || '';
    if (saved) setupShortcutMapping(id, saved);
  });
}

// 키보드 이벤트에서 ‘Ctrl+Shift+X’ 등으로 포맷팅
function formatKeyCombo(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  const key = e.key.toUpperCase();
  if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) {
    parts.push(key.length === 1 ? key : key);
  }
  return parts.join('+');
}

// 특정 액션 ID와 키 조합을 매핑
function setupShortcutMapping(actionId, combo) {
  // 기존 매핑에서 제거
  Object.keys(shortcutMap).forEach((k) => {
    if (shortcutMap[k].actionId === actionId) {
      delete shortcutMap[k];
    }
  });
  if (!combo) return;

  // 콤보를 고유 키로 변환 (예: "Ctrl+H" -> "Control+KeyH")
  const keyParts = combo.split('+').map((p) => p.trim());
  const normalized = keyParts
    .map((p) => {
      if (p === 'Ctrl') return 'Control';
      if (p === 'Shift') return 'Shift';
      if (p === 'Alt') return 'Alt';
      return p.length === 1 ? `Key${p}` : p;
    })
    .join('+');
  // 저장
  const action = shortcutActions.find((a) => a.id === actionId);
  if (action) {
    shortcutMap[normalized] = { handler: action.handler, actionId };
  }
}

// =============================================================================
// 7. 전역 키보드 리스너 등록 (단축키 동작)
// =============================================================================
function registerGlobalKeyboardListener() {
  document.addEventListener('keydown', (e) => {
    const parts = [];
    if (e.ctrlKey) parts.push('Control');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    const keyName = e.key.toUpperCase();
    if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(keyName)) {
      parts.push(keyName.length === 1 ? `Key${keyName}` : keyName);
    }
    const combo = parts.join('+');
    if (shortcutMap[combo]) {
      e.preventDefault();
      shortcutMap[combo].handler();
    }
  });
}

// =============================================================================
// 공통 슬라이드 알림 메시지 함수
// =============================================================================
function showMessage(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor =
    type === 'success'
      ? 'rgba(16, 185, 129, 0.9)'
      : type === 'error'
      ? 'rgba(239, 68, 68, 0.9)'
      : 'rgba(59, 130, 246, 0.9)';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: 600;
    backdrop-filter: blur(20px);
    border: 1px solid ${bgColor.replace('0.9', '0.3')};
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;

  notification.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <span>${icon}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// 전역에 initSettingsPage 함수 등록
window.initSettingsPage = initSettingsPage;

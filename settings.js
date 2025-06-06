// =============================================================================
// settings.js (설정 화면 전용 스크립트)
// =============================================================================

let notificationCategories = {
  notice: true,
  community: true,
  review: true,
  shuttle: true
};

document.addEventListener('DOMContentLoaded', () => {
  // 1) 요소들 선택
  const themeToggle = document.getElementById('themeToggle');
  const globalNotificationToggle = document.getElementById('globalNotificationToggle');
  const notifyNotice = document.getElementById('notifyCategory-notice');
  const notifyCommunity = document.getElementById('notifyCategory-community');
  const notifyReview = document.getElementById('notifyCategory-review');
  const notifyShuttle = document.getElementById('notifyCategory-shuttle');
  const autoLogoutToggle = document.getElementById('autoLogoutToggle');
  const autoLogoutTime = document.getElementById('autoLogoutTime');
  const shortcutList = document.getElementById('shortcutList');
  const addShortcutBtn = document.getElementById('addShortcutBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');

  // 2) 기존 설정 로드
  loadSettings();

  // 3) 테마 토글
  themeToggle.addEventListener('change', () => {
    const isLight = themeToggle.checked;
    localStorage.setItem('lightMode', isLight ? 'true' : 'false');
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  });

  // 4) 전역 알림 토글
  globalNotificationToggle.addEventListener('change', () => {
    localStorage.setItem('globalNotification', globalNotificationToggle.checked ? 'true' : 'false');
  });

  // 5) 카테고리별 알림 토글
  notifyNotice.addEventListener('change', () => {
    notificationCategories.notice = notifyNotice.checked;
    saveNotificationCategories();
  });
  notifyCommunity.addEventListener('change', () => {
    notificationCategories.community = notifyCommunity.checked;
    saveNotificationCategories();
  });
  notifyReview.addEventListener('change', () => {
    notificationCategories.review = notifyReview.checked;
    saveNotificationCategories();
  });
  notifyShuttle.addEventListener('change', () => {
    notificationCategories.shuttle = notifyShuttle.checked;
    saveNotificationCategories();
  });

  // 6) 자동 로그아웃 토글 및 시간
  autoLogoutToggle.addEventListener('change', () => {
    saveAutoLogoutSettings();
  });
  autoLogoutTime.addEventListener('change', () => {
    saveAutoLogoutSettings();
  });

  // 7) 단축키 로드 및 이벤트
  loadShortcuts();
  addShortcutBtn.addEventListener('click', () => {
    addShortcutItem('', '');
  });

  // 8) 저장/취소 버튼 이벤트
  saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    showMessage('설정이 저장되었습니다.', 'success');
  });

  cancelSettingsBtn.addEventListener('click', () => {
    showContent('home');
  });
});

// =======================================================
// loadSettings: 로컬스토리지에서 설정값 읽어오기
// =======================================================
function loadSettings() {
  const savedMode = localStorage.getItem('lightMode');
  const themeToggle = document.getElementById('themeToggle');
  if (savedMode === 'true') {
    themeToggle.checked = true;
    document.body.classList.add('light-mode');
  } else {
    themeToggle.checked = false;
    document.body.classList.remove('light-mode');
  }

  const globalNoti = localStorage.getItem('globalNotification');
  document.getElementById('globalNotificationToggle').checked = (globalNoti === 'true');

  const savedCat = JSON.parse(localStorage.getItem('notificationCategories'));
  if (savedCat) {
    notificationCategories = savedCat;
  }
  document.getElementById('notifyCategory-notice').checked = notificationCategories.notice;
  document.getElementById('notifyCategory-community').checked = notificationCategories.community;
  document.getElementById('notifyCategory-review').checked = notificationCategories.review;
  document.getElementById('notifyCategory-shuttle').checked = notificationCategories.shuttle;

  const autoLogoutCfg = JSON.parse(localStorage.getItem('autoLogout'));
  if (autoLogoutCfg) {
    document.getElementById('autoLogoutToggle').checked = autoLogoutCfg.enabled;
    document.getElementById('autoLogoutTime').value = autoLogoutCfg.timeoutMinutes || 1;
  }
}

// =======================================================
// saveNotificationCategories: 카테고리별 알림 설정 저장
// =======================================================
function saveNotificationCategories() {
  localStorage.setItem('notificationCategories', JSON.stringify(notificationCategories));
}

// =======================================================
// saveAutoLogoutSettings: 자동 로그아웃 설정 저장
// =======================================================
function saveAutoLogoutSettings() {
  const enabled = document.getElementById('autoLogoutToggle').checked;
  const timeoutMinutes = parseInt(document.getElementById('autoLogoutTime').value) || 1;
  const cfg = { enabled, timeoutMinutes };
  localStorage.setItem('autoLogout', JSON.stringify(cfg));
}

// =======================================================
// loadShortcuts: 로컬스토리지에서 단축키 불러와 목록 생성
// =======================================================
function loadShortcuts() {
  const list = JSON.parse(localStorage.getItem('keyboardShortcuts')) || [];
  const shortcutList = document.getElementById('shortcutList');
  shortcutList.innerHTML = '';
  list.forEach((entry) => {
    addShortcutItem(entry.name, entry.key);
  });
}

// =======================================================
// addShortcutItem: 단축키 입력 항목 추가
// =======================================================
function addShortcutItem(name = '', key = '') {
  const container = document.getElementById('shortcutList');
  const div = document.createElement('div');
  div.className = 'shortcut-item';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '기능 이름';
  nameInput.value = name;
  nameInput.className = 'label-input';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = '키';
  keyInput.value = key;
  keyInput.maxLength = 1;
  keyInput.className = 'key-input';
  keyInput.addEventListener('keyup', (e) => {
    keyInput.value = e.key.toUpperCase();
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-shortcut-btn';
  removeBtn.innerText = '✖';
  removeBtn.addEventListener('click', () => {
    container.removeChild(div);
  });

  div.appendChild(nameInput);
  div.appendChild(keyInput);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// =======================================================
// saveSettings: 모든 설정값을 로컬스토리지에 저장
// =======================================================
function saveSettings() {
  // (1) 라이트 모드는 index.js의 themeToggle 이벤트에서 이미 저장됨
  // (2) 전역 알림은 저장된 상태 그대로

  // (3) 카테고리별 알림은 saveNotificationCategories()로 저장됨

  // (4) 자동 로그아웃 설정은 saveAutoLogoutSettings()로 저장됨

  // (5) 단축키 저장
  const items = document.querySelectorAll('.shortcut-item');
  const shortcuts = [];
  items.forEach((item) => {
    const name = item.querySelector('.label-input').value.trim();
    const key = item.querySelector('.key-input').value.trim().toUpperCase();
    if (name && key) {
      shortcuts.push({ name, key });
    }
  });
  localStorage.setItem('keyboardShortcuts', JSON.stringify(shortcuts));
}

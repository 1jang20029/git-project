// settings.js

// =============================================================================
// 분리된 설정 화면 전용 자바스크립트
// =============================================================================

// 로컬스토리지 키 정의
const LS_KEY_MODE        = 'lightMode';
const LS_KEY_NOTIFY      = 'enableNotification';
const LS_KEY_CATNOTIFY   = 'notificationCategories';
const LS_KEY_DND         = 'doNotDisturb';
const LS_KEY_AUTOLOGOUT  = 'autoLogout';
const LS_KEY_SHORTCUTS   = 'keyboardShortcuts';

// 기본 단축키 목록 (처음엔 이 세 개가 생성됨)
const DEFAULT_SHORTCUTS = [
  { id: 'shortcut-toggle-sidebar',    name: '사이드바 토글',     key: 'F2' },
  { id: 'shortcut-open-notifications',name: '알림 열기',         key: 'F3' },
  { id: 'shortcut-go-to-settings',    name: '설정 화면',         key: 'F4' }
];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  initSettingsPage();
});

// =============================================================================
// initSettingsPage: 설정 화면 초기화
// =============================================================================
function initSettingsPage() {
  // 1) 다크/라이트 모드
  initThemeToggle();

  // 2) 알림 받기 ON/OFF
  initNotificationToggle();

  // 3) 카테고리별 알림 설정
  initCategoryNotifications();

  // 4) Do Not Disturb (DND)
  initDNDSettings();

  // 5) 자동 로그아웃
  initAutoLogoutSettings();

  // 6) 단축키 리스트 초기화 및 이벤트 바인딩
  initShortcutSettings();
}

// =============================================================================
// 1) 다크/라이트 모드 초기화
// =============================================================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const savedLightMode = localStorage.getItem(LS_KEY_MODE);
  const isLightMode = savedLightMode === 'true';

  if (!themeToggle) return;

  // 초기 상태 반영
  if (isLightMode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  themeToggle.checked = isLightMode;

  // 상태 변경 시 이벤트
  themeToggle.addEventListener('change', () => {
    const isLight = themeToggle.checked;
    if (isLight) {
      document.body.classList.add('light-mode');
      localStorage.setItem(LS_KEY_MODE, 'true');
      showMessage('라이트 모드로 변경되었습니다', 'success');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem(LS_KEY_MODE, 'false');
      showMessage('다크 모드로 변경되었습니다', 'success');
    }
  });
}

// =============================================================================
// 2) 알림 받기 ON/OFF 초기화
// =============================================================================
function initNotificationToggle() {
  const notificationToggle = document.getElementById('notificationToggle');
  const savedNotify = localStorage.getItem(LS_KEY_NOTIFY);
  const isNotifyEnabled = savedNotify === 'true';

  if (!notificationToggle) return;

  notificationToggle.checked = isNotifyEnabled;
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem(LS_KEY_NOTIFY, enabled);
    if (enabled) {
      showMessage('알림이 활성화되었습니다', 'success');
    } else {
      showMessage('알림이 비활성화되었습니다', 'info');
    }
  });
}

// =============================================================================
// 3) 카테고리별 알림 설정 초기화
// =============================================================================
function initCategoryNotifications() {
  const defaultCatSettings = {
    '공지사항': true,
    '커뮤니티':  true,
    '셔틀버스':  true,
    '강의평가':  true
  };
  const savedCatSettings = JSON.parse(localStorage.getItem(LS_KEY_CATNOTIFY)) || defaultCatSettings;

  Object.keys(defaultCatSettings).forEach((cat) => {
    const checkbox = document.getElementById(`notifCategory-${cat}`);
    if (!checkbox) return;
    checkbox.checked = savedCatSettings[cat] === true;
    checkbox.addEventListener('change', () => {
      const updated = JSON.parse(localStorage.getItem(LS_KEY_CATNOTIFY)) || defaultCatSettings;
      updated[cat] = checkbox.checked;
      localStorage.setItem(LS_KEY_CATNOTIFY, JSON.stringify(updated));
      showMessage(`${cat} 알림이 ${checkbox.checked ? '활성화' : '비활성화'}되었습니다`, 'success', cat);
    });
  });
}

// =============================================================================
// 4) Do Not Disturb (DND) 설정 초기화
// =============================================================================
function initDNDSettings() {
  const dndToggle = document.getElementById('dndToggle');
  const dndStart  = document.getElementById('dndStart');
  const dndEnd    = document.getElementById('dndEnd');

  const savedDND = JSON.parse(localStorage.getItem(LS_KEY_DND)) || {
    enabled: false,
    startHour: 21, startMinute: 0,
    endHour: 7,   endMinute: 0
  };

  if (dndToggle) {
    dndToggle.checked = savedDND.enabled;
    dndToggle.addEventListener('change', () => {
      const val = dndToggle.checked;
      const current = JSON.parse(localStorage.getItem(LS_KEY_DND)) || savedDND;
      current.enabled = val;
      localStorage.setItem(LS_KEY_DND, JSON.stringify(current));
      showMessage(`DND 모드가 ${val ? '활성화' : '비활성화'}되었습니다`, 'success');
    });
  }

  if (dndStart) {
    const hh = String(savedDND.startHour).padStart(2, '0');
    const mm = String(savedDND.startMinute).padStart(2, '0');
    dndStart.value = `${hh}:${mm}`;
    dndStart.addEventListener('change', () => {
      const [h, m] = dndStart.value.split(':').map(Number);
      const current = JSON.parse(localStorage.getItem(LS_KEY_DND)) || savedDND;
      current.startHour = h;
      current.startMinute = m;
      localStorage.setItem(LS_KEY_DND, JSON.stringify(current));
      showMessage(`DND 시작 시간이 ${hh}:${mm}에서 ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}로 변경되었습니다`, 'success');
    });
  }

  if (dndEnd) {
    const hh = String(savedDND.endHour).padStart(2, '0');
    const mm = String(savedDND.endMinute).padStart(2, '0');
    dndEnd.value = `${hh}:${mm}`;
    dndEnd.addEventListener('change', () => {
      const [h, m] = dndEnd.value.split(':').map(Number);
      const current = JSON.parse(localStorage.getItem(LS_KEY_DND)) || savedDND;
      current.endHour = h;
      current.endMinute = m;
      localStorage.setItem(LS_KEY_DND, JSON.stringify(current));
      showMessage(`DND 종료 시간이 ${hh}:${mm}에서 ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}로 변경되었습니다`, 'success');
    });
  }
}

// =============================================================================
// 5) 자동 로그아웃 설정 초기화
// =============================================================================
function initAutoLogoutSettings() {
  const autoLogoutToggle  = document.getElementById('autoLogoutToggle');
  const autoLogoutTimeout = document.getElementById('autoLogoutTimeout');

  const savedAutoLogout = JSON.parse(localStorage.getItem(LS_KEY_AUTOLOGOUT)) || {
    enabled: false,
    timeoutMinutes: 15
  };

  if (autoLogoutToggle) {
    autoLogoutToggle.checked = savedAutoLogout.enabled;
    autoLogoutToggle.addEventListener('change', () => {
      const val = autoLogoutToggle.checked;
      const current = JSON.parse(localStorage.getItem(LS_KEY_AUTOLOGOUT)) || savedAutoLogout;
      current.enabled = val;
      localStorage.setItem(LS_KEY_AUTOLOGOUT, JSON.stringify(current));
      showMessage(`자동 로그아웃이 ${val ? '활성화' : '비활성화'}되었습니다`, 'success');
    });
  }

  if (autoLogoutTimeout) {
    autoLogoutTimeout.value = savedAutoLogout.timeoutMinutes;
    autoLogoutTimeout.addEventListener('change', () => {
      let val = parseInt(autoLogoutTimeout.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 120) val = 120;
      autoLogoutTimeout.value = val;
      const current = JSON.parse(localStorage.getItem(LS_KEY_AUTOLOGOUT)) || savedAutoLogout;
      current.timeoutMinutes = val;
      localStorage.setItem(LS_KEY_AUTOLOGOUT, JSON.stringify(current));
      showMessage(`자동 로그아웃 대기 시간이 ${val}분으로 설정되었습니다`, 'success');
    });
  }
}

// =============================================================================
// 6) 단축키 설정 초기화
// =============================================================================
function initShortcutSettings() {
  const container = document.getElementById('shortcut-list-container');
  const addBtn    = document.getElementById('addShortcutBtn');

  // 로컬스토리지에서 불러오거나 기본값으로 설정
  let shortcuts = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS));
  if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
    shortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    localStorage.setItem(LS_KEY_SHORTCUTS, JSON.stringify(shortcuts));
  }

  // 컨테이너 비우고 렌더링
  container.innerHTML = '';
  shortcuts.forEach(entry => {
    renderShortcutItem(container, entry, shortcuts);
  });

  // “단축키 추가” 버튼 클릭 시
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const newId   = `shortcut-${Date.now()}`;
      const newEntry = { id: newId, name: '', key: '' };
      shortcuts.push(newEntry);
      localStorage.setItem(LS_KEY_SHORTCUTS, JSON.stringify(shortcuts));
      renderShortcutItem(container, newEntry, shortcuts);
    });
  }
}

// =============================================================================
// renderShortcutItem: 단축키 항목 하나를 DOM에 렌더링
// =============================================================================
function renderShortcutItem(container, entry, shortcutsArray) {
  // entry: { id, name, key }
  // shortcutsArray: 전체 배열(참조)
  const itemDiv = document.createElement('div');
  itemDiv.className = 'shortcut-item';
  itemDiv.id = entry.id;

  // 1) 라벨(설명)용 input
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'label-input';
  labelInput.placeholder = '단축키 설명';
  labelInput.value = entry.name || '';
  labelInput.addEventListener('change', () => {
    entry.name = labelInput.value.trim();
    saveShortcuts(shortcutsArray);
  });
  itemDiv.appendChild(labelInput);

  // 2) 키 입력용 readonly input
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.className = 'key-input';
  keyInput.readOnly = true;
  keyInput.placeholder = entry.key || '키를 눌러주세요';
  keyInput.value = entry.key || '';
  keyInput.setAttribute('data-default-placeholder', '키를 눌러주세요');
  keyInput.addEventListener('focus', () => {
    keyInput.value = '';
    keyInput.placeholder = '키를 눌러주세요';
  });
  keyInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    const pressedKey = e.key.toUpperCase();
    if (pressedKey.length === 1 || pressedKey.startsWith('F')) {
      // 이미 다른 항목에 이 키가 할당되어 있는지 확인
      const otherIndex = shortcutsArray.findIndex(
        sc => sc.key === pressedKey && sc.id !== entry.id
      );
      if (otherIndex !== -1) {
        // 스왑: other 항목의 키 ↔ 이 항목의 키
        const otherEntry = shortcutsArray[otherIndex];
        const oldKey     = entry.key;
        entry.key = pressedKey;
        otherEntry.key = oldKey || '';
        showMessage(
          `${entry.name || '새 단축키'}: ${pressedKey} (기존 ${otherEntry.name || '단축키'}와 스왑됨)`,
          'success'
        );
        // 업데이트된 값 반영
        saveShortcuts(shortcutsArray);
        updateShortcutField(keyInput, entry);
        const otherField = document.querySelector(`#${otherEntry.id} .key-input`);
        if (otherField) updateShortcutField(otherField, otherEntry);
      } else {
        // 중복 없으면 바로 할당
        entry.key = pressedKey;
        showMessage(`${entry.name || '새 단축키'}: ${pressedKey}으로 설정됨`, 'success');
        saveShortcuts(shortcutsArray);
        updateShortcutField(keyInput, entry);
      }
      keyInput.blur();
    }
  });
  keyInput.addEventListener('blur', () => {
    updateShortcutField(keyInput, entry);
  });
  itemDiv.appendChild(keyInput);

  // 3) 삭제 버튼
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-shortcut-btn';
  removeBtn.innerHTML = '✖';
  removeBtn.title = '단축키 항목 삭제';
  removeBtn.addEventListener('click', () => {
    const idx = shortcutsArray.findIndex(sc => sc.id === entry.id);
    if (idx !== -1) {
      shortcutsArray.splice(idx, 1);
      saveShortcuts(shortcutsArray);
      container.removeChild(itemDiv);
      showMessage(`단축키 "${entry.name || entry.id}" 항목이 삭제되었습니다`, 'info');
    }
  });
  itemDiv.appendChild(removeBtn);

  // 마지막으로 컨테이너에 추가
  container.appendChild(itemDiv);
}

// =============================================================================
// updateShortcutField: 입력란에 현재 entry.key 값을 표시하고 플레이스홀더 복원
// =============================================================================
function updateShortcutField(field, entry) {
  field.value = entry.key || '';
  field.placeholder = entry.key || '키를 눌러주세요';
}

// =============================================================================
// saveShortcuts: shortcutsArray를 로컬스토리지에 저장
// =============================================================================
function saveShortcuts(shortcutsArray) {
  localStorage.setItem(LS_KEY_SHORTCUTS, JSON.stringify(shortcutsArray));
}

// =============================================================================
// showMessage: 화면 우측 상단 슬라이드 알림 메시지
// =============================================================================
function showMessage(message, type = 'info', category = '') {
  // 1) 카테고리 구분이 필요한 알림이라면, 해당 카테고리가 꺼져 있으면 표시하지 않음
  if (category && !isCategoryEnabled(category)) {
    return;
  }
  // 2) DND 모드일 때는 알림 차단
  if (!shouldShowNotification()) {
    return;
  }

  const notification = document.createElement('div');
  const bgColor =
    type === 'success'
      ? 'rgba(16, 185, 129, 0.9)'
      : type === 'error'
      ? 'rgba(239, 68, 68, 0.9)'
      : 'rgba(59, 130, 246, 0.9)';
  const icon =
    type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

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

// =============================================================================
// shouldShowNotification: DND 모드 검사
// =============================================================================
function shouldShowNotification() {
  const dnd = JSON.parse(localStorage.getItem(LS_KEY_DND)) || { enabled: false };
  if (!dnd.enabled) return true;

  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const totalMinutes = hh * 60 + mm;

  const startHM = dnd.startHour * 60 + dnd.startMinute;
  const endHM   = dnd.endHour * 60 + dnd.endMinute;

  if (startHM < endHM) {
    return !(totalMinutes >= startHM && totalMinutes < endHM);
  } else {
    // 예: 21:00 ~ 07:00 처럼 날짜 넘어갈 때
    return !((totalMinutes >= startHM && totalMinutes < 1440) || (totalMinutes < endHM));
  }
}

// =============================================================================
// isCategoryEnabled: 카테고리별 알림 수신 여부 확인
// =============================================================================
function isCategoryEnabled(category) {
  const catSettings = JSON.parse(localStorage.getItem(LS_KEY_CATNOTIFY)) || {};
  return catSettings[category] === true;
}

// 전역에 initSettingsPage 노출
window.initSettingsPage = initSettingsPage;

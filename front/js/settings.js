// /js/settings.js
console.log('▶ settings.js loaded');

const LS_KEY_MODE        = 'lightMode';
const LS_KEY_NOTIFY      = 'enableNotification';
const LS_KEY_CATNOTIFY   = 'notificationCategories';
const LS_KEY_AUTOLOGOUT  = 'autoLogout';
const LS_KEY_SHORTCUTS   = 'keyboardShortcuts';

const DEFAULT_SHORTCUTS = [
  { id: 'shortcut-toggle-sidebar',     name: '사이드바 토글', key: 'F2' },
  { id: 'shortcut-open-notifications', name: '알림 열기',     key: 'F3' },
  { id: 'shortcut-go-to-settings',     name: '설정 화면',     key: 'F4' }
];

let workingSettings = {};

//───────────────────────────────────────────────────────────────────────────────
// localStorage 저장 헬퍼
function persistMode()        { localStorage.setItem(LS_KEY_MODE,        workingSettings.mode); }
function persistNotify()      { localStorage.setItem(LS_KEY_NOTIFY,      workingSettings.notify); }
function persistCategories()  { localStorage.setItem(LS_KEY_CATNOTIFY,   JSON.stringify(workingSettings.categories)); }
function persistAutoLogout()  { localStorage.setItem(LS_KEY_AUTOLOGOUT,  JSON.stringify(workingSettings.autoLogout)); }
function persistShortcuts()   { localStorage.setItem(LS_KEY_SHORTCUTS,   JSON.stringify(workingSettings.shortcuts)); }
//───────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  initSettingsPage();
});

// 로컬스토리지에서 읽어서 workingSettings 초기화
function loadSavedSettings() {
  workingSettings.mode = localStorage.getItem(LS_KEY_MODE) === 'true';
  workingSettings.notify = localStorage.getItem(LS_KEY_NOTIFY) === 'true';

  const catRaw = JSON.parse(localStorage.getItem(LS_KEY_CATNOTIFY));
  workingSettings.categories = (catRaw && typeof catRaw === 'object')
    ? catRaw
    : { '공지사항': true, '커뮤니티': true, '셔틀버스': true };

  const alRaw = JSON.parse(localStorage.getItem(LS_KEY_AUTOLOGOUT));
  workingSettings.autoLogout = (alRaw && typeof alRaw === 'object')
    ? alRaw
    : { enabled: false, timeoutMinutes: 15 };

  let sc = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS));
  if (!Array.isArray(sc) || sc.length === 0) {
    sc = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    localStorage.setItem(LS_KEY_SHORTCUTS, JSON.stringify(sc));
  }
  workingSettings.shortcuts = sc;
}

// UI 초기화
function initSettingsPage() {
  initThemeToggle();
  initNotificationToggle();
  initCategoryNotifications();
  initAutoLogoutSettings();
  initShortcutSettings();
  initSaveCancelButtons();
}

// 1) 다크/라이트 모드
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  document.body.classList.toggle('light-mode', workingSettings.mode);
  themeToggle.checked = workingSettings.mode;
  themeToggle.addEventListener('change', () => {
    workingSettings.mode = themeToggle.checked;
    document.body.classList.toggle('light-mode', workingSettings.mode);
    persistMode();
    showMessage(`테마가 ${workingSettings.mode ? '라이트' : '다크'} 모드로 변경되었습니다`, 'success');
  });
}

// 2) 알림 ON/OFF
function initNotificationToggle() {
  const cb = document.getElementById('notificationToggle');
  cb.checked = workingSettings.notify;
  cb.addEventListener('change', () => {
    workingSettings.notify = cb.checked;
    persistNotify();
    showMessage(`알림 받기가 ${cb.checked ? '활성화' : '비활성화'}되었습니다`, 'success');
  });
}

// 3) 카테고리별 알림
function initCategoryNotifications() {
  ['공지사항','커뮤니티','셔틀버스'].forEach(catName => {
    const cb = document.getElementById(`notifCategory-${catName}`);
    cb.checked = !!workingSettings.categories[catName];
    cb.addEventListener('change', () => {
      workingSettings.categories[catName] = cb.checked;
      persistCategories();
      showMessage(`${catName} 알림이 ${cb.checked ? '활성화' : '비활성화'}되었습니다`, 'success');
    });
  });
}

// 4) 자동 로그아웃
function initAutoLogoutSettings() {
  const toggle = document.getElementById('autoLogoutToggle');
  const input  = document.getElementById('autoLogoutTimeout');

  toggle.checked = workingSettings.autoLogout.enabled;
  toggle.addEventListener('change', () => {
    workingSettings.autoLogout.enabled = toggle.checked;
    persistAutoLogout();
    showMessage(`자동 로그아웃이 ${toggle.checked ? '활성화' : '비활성화'}되었습니다`, 'success');
  });

  input.value = workingSettings.autoLogout.timeoutMinutes;
  input.addEventListener('change', () => {
    let v = parseInt(input.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 120) v = 120;
    input.value = v;
    workingSettings.autoLogout.timeoutMinutes = v;
    persistAutoLogout();
    showMessage(`자동 로그아웃 대기시간이 ${v}분으로 설정되었습니다`, 'success');
  });
}

// 5) 단축키 설정
function initShortcutSettings() {
  const container = document.getElementById('shortcut-list-container');
  const addBtn    = document.getElementById('addShortcutBtn');
  container.innerHTML = '';

  workingSettings.shortcuts.forEach(entry => {
    renderShortcutItem(container, entry, workingSettings.shortcuts);
  });

  addBtn.addEventListener('click', () => {
    if (workingSettings.shortcuts.length >= 5) {
      showMessage('단축키는 최대 5개까지만 추가할 수 있습니다', 'error');
      return;
    }
    const newEntry = { id: `shortcut-${Date.now()}`, name: '', key: '' };
    workingSettings.shortcuts.push(newEntry);
    renderShortcutItem(container, newEntry, workingSettings.shortcuts);
    persistShortcuts();
    showMessage('새 단축키 항목이 추가되었습니다', 'success');
  });
}

function renderShortcutItem(container, entry, shortcutsArray) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'shortcut-item';
  itemDiv.id = entry.id;

  // 설명 입력
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'label-input';
  labelInput.placeholder = '단축키 설명';
  labelInput.value = entry.name;
  labelInput.addEventListener('change', () => {
    entry.name = labelInput.value.trim();
    persistShortcuts();
    showMessage(`"${entry.name || '단축키'}" 설명이 업데이트되었습니다`, 'info');
  });
  itemDiv.appendChild(labelInput);

  // 키 입력
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.className = 'key-input';
  keyInput.readOnly = true;
  keyInput.setAttribute('tabindex', '0');
  keyInput.placeholder = entry.key || '키를 눌러주세요';
  keyInput.value = entry.key;

  // 클릭 시 포커스 강제
  keyInput.addEventListener('click', () => keyInput.focus());

  keyInput.addEventListener('keydown', e => {
    e.preventDefault();
    const k = e.key.toUpperCase();
    if ((k.length === 1 && /^[A-Z0-9]$/.test(k)) || k.startsWith('F')) {
      const otherIdx = shortcutsArray.findIndex(sc => sc.key === k && sc.id !== entry.id);
      if (otherIdx !== -1) {
        const other = shortcutsArray[otherIdx];
        const oldKey = entry.key;
        entry.key    = k;
        other.key    = oldKey || '';
        showMessage(`"${entry.name || '단축키'}"가 ${k}로, "${other.name || '단축키'}"와 키를 스왑했습니다`, 'success');
        updateShortcutField(keyInput, entry);
        const of = document.querySelector(`#${other.id} .key-input`);
        if (of) updateShortcutField(of, other);
      } else {
        entry.key = k;
        showMessage(`"${entry.name || '단축키'}"가 ${k}로 설정되었습니다`, 'success');
        updateShortcutField(keyInput, entry);
      }
      persistShortcuts();
      keyInput.blur();
    }
  });

  keyInput.addEventListener('blur', () => updateShortcutField(keyInput, entry));
  itemDiv.appendChild(keyInput);

  // 삭제 버튼
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-shortcut-btn';
  removeBtn.innerHTML = '✖';
  removeBtn.title = '단축키 삭제';
  removeBtn.addEventListener('click', () => {
    const idx = shortcutsArray.findIndex(sc => sc.id === entry.id);
    if (idx !== -1) {
      shortcutsArray.splice(idx, 1);
      container.removeChild(itemDiv);
      persistShortcuts();
      showMessage(`"${entry.name || '단축키'}" 항목이 삭제되었습니다`, 'info');
    }
  });
  itemDiv.appendChild(removeBtn);

  container.appendChild(itemDiv);
}

function updateShortcutField(field, entry) {
  field.value       = entry.key;
  field.placeholder = entry.key || '키를 눌러주세요';
}

// 6) 저장/취소 버튼
function initSaveCancelButtons() {
  const saveBtn   = document.getElementById('saveSettingsBtn');
  const cancelBtn = document.getElementById('cancelSettingsBtn');

  saveBtn.addEventListener('click', () => {
    // 이미 각 변경마다 persist 했으므로, 여기서는 안내 메시지만 띄웁니다.
    showMessage('모든 설정이 저장되었습니다', 'success');
  });

  cancelBtn.addEventListener('click', () => {
    // 로컬스토리지에 실제 남아있는 설정을 다시 불러와 UI만 초기화
    loadSavedSettings();
    initSettingsPage();
    showMessage('저장된 설정으로 되돌아갔습니다', 'info');
  });
}

// 알림 메시지
function showMessage(message, type = 'info') {
  const n = document.createElement('div');
  const bgColor =
    type === 'success' ? 'rgba(16,185,129,0.9)' :
    type === 'error'   ? 'rgba(239,68,68,0.9)' :
                         'rgba(59,130,246,0.9)';
  const icon =
    type === 'success' ? '✅' :
    type === 'error'   ? '❌' :
                         'ℹ️';

  n.style.cssText = `
    position: fixed; top: 100px; right: 20px;
    background: ${bgColor}; color: white;
    padding: 1rem 1.5rem; border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 10000; font-weight: 600;
    backdrop-filter: blur(20px);
    border: 1px solid ${bgColor.replace('0.9','0.3')};
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;
  n.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <span>${icon}</span><span>${message}</span>
    </div>
  `;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => n.remove(), 300);
  }, 3000);
}

window.initSettingsPage = initSettingsPage;

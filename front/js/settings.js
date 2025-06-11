// /js/settings.js
console.log('▶ settings.js loaded');

const LS_KEY_MODE        = 'lightMode';
const LS_KEY_NOTIFY      = 'enableNotification';
const LS_KEY_CATNOTIFY   = 'notificationCategories';
const LS_KEY_AUTOLOGOUT  = 'autoLogout';
const LS_KEY_SHORTCUTS   = 'keyboardShortcuts';

const DEFAULT_SHORTCUTS = [
  { id: 'shortcut-toggle-sidebar',     name: '사이드바 토글',     key: 'F2' },
  { id: 'shortcut-open-notifications', name: '알림 열기',         key: 'F3' },
  { id: 'shortcut-go-to-settings',     name: '설정 화면',         key: 'F4' }
];

let workingSettings = {};
let savedSettings   = {};

document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  initSettingsPage();
});

function loadSavedSettings() {
  const isLightMode      = localStorage.getItem(LS_KEY_MODE) === 'true';
  const isNotifyEnabled  = localStorage.getItem(LS_KEY_NOTIFY) === 'true';
  const savedCatSettings = JSON.parse(localStorage.getItem(LS_KEY_CATNOTIFY)) || {
    '공지사항': true, '커뮤니티': true, '셔틀버스': true
  };
  const savedAutoLogout = JSON.parse(localStorage.getItem(LS_KEY_AUTOLOGOUT)) || {
    enabled: false, timeoutMinutes: 15
  };
  let savedShortcuts = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS));
  if (!Array.isArray(savedShortcuts) || savedShortcuts.length === 0) {
    savedShortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    localStorage.setItem(LS_KEY_SHORTCUTS, JSON.stringify(savedShortcuts));
  }

  savedSettings = {
    mode      : isLightMode,
    notify    : isNotifyEnabled,
    categories: savedCatSettings,
    autoLogout: savedAutoLogout,
    shortcuts : savedShortcuts
  };
  workingSettings = JSON.parse(JSON.stringify(savedSettings));
}

function initSettingsPage() {
  initThemeToggle();
  initNotificationToggle();
  initCategoryNotifications();
  initAutoLogoutSettings();
  initShortcutSettings();
  initSaveCancelButtons();
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  document.body.classList.toggle('light-mode', workingSettings.mode);
  themeToggle.checked = workingSettings.mode;
  themeToggle.addEventListener('change', () => {
    workingSettings.mode = themeToggle.checked;
    document.body.classList.toggle('light-mode', workingSettings.mode);
  });
}

function initNotificationToggle() {
  const cb = document.getElementById('notificationToggle');
  if (!cb) return;
  cb.checked = workingSettings.notify;
  cb.addEventListener('change', () => {
    workingSettings.notify = cb.checked;
  });
}

function initCategoryNotifications() {
  ['공지사항','커뮤니티','셔틀버스'].forEach(cat => {
    const cb = document.getElementById(`notifCategory-${cat}`);
    if (!cb) return;
    cb.checked = workingSettings.categories[cat];
    cb.addEventListener('change', () => {
      workingSettings.categories[cat] = cb.checked;
    });
  });
}

function initAutoLogoutSettings() {
  const toggle = document.getElementById('autoLogoutToggle');
  const input  = document.getElementById('autoLogoutTimeout');
  if (toggle) {
    toggle.checked = workingSettings.autoLogout.enabled;
    toggle.addEventListener('change', () => {
      workingSettings.autoLogout.enabled = toggle.checked;
    });
  }
  if (input) {
    input.value = workingSettings.autoLogout.timeoutMinutes;
    input.addEventListener('change', () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (v > 120) v = 120;
      input.value = v;
      workingSettings.autoLogout.timeoutMinutes = v;
    });
  }
}

function initShortcutSettings() {
  const container = document.getElementById('shortcut-list-container');
  const addBtn    = document.getElementById('addShortcutBtn');
  container.innerHTML = '';
  workingSettings.shortcuts.forEach(entry => {
    renderShortcutItem(container, entry, workingSettings.shortcuts);
  });
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (workingSettings.shortcuts.length >= 5) {
        showMessage('단축키는 최대 5개까지만 추가할 수 있습니다','error');
        return;
      }
      const newEntry = { id:`shortcut-${Date.now()}`, name:'', key:'' };
      workingSettings.shortcuts.push(newEntry);
      renderShortcutItem(container, newEntry, workingSettings.shortcuts);
    });
  }
}

function renderShortcutItem(container, entry, shortcuts) {
  const div = document.createElement('div');
  div.className = 'shortcut-item';
  div.id = entry.id;

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'label-input';
  labelInput.placeholder = '단축키 설명';
  labelInput.value = entry.name;
  labelInput.addEventListener('change', () => {
    entry.name = labelInput.value.trim();
  });
  div.appendChild(labelInput);

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.className = 'key-input';
  keyInput.readOnly = true;
  keyInput.placeholder = entry.key || '키를 눌러주세요';
  keyInput.value = entry.key;
  keyInput.addEventListener('focus', () => {
    keyInput.value = '';
    keyInput.placeholder = '키를 눌러주세요';
  });
  keyInput.addEventListener('keydown', e => {
    e.preventDefault();
    const k = e.key.toUpperCase();
    if ((k.length === 1 && /^[A-Z0-9]$/.test(k)) || k.startsWith('F')) {
      const otherIdx = shortcuts.findIndex(sc => sc.key === k && sc.id !== entry.id);
      if (otherIdx !== -1) {
        const other = shortcuts[otherIdx];
        const oldKey = entry.key;
        entry.key    = k;
        other.key    = oldKey || '';
        showMessage(`"${entry.name||'단축키'}"의 키를 ${k}으로 스왑했습니다`,'success');
        updateShortcutField(keyInput, entry);
        const of = document.querySelector(`#${other.id} .key-input`);
        if (of) updateShortcutField(of, other);
      } else {
        entry.key = k;
        showMessage(`"${entry.name||'단축키'}"의 키를 ${k}으로 설정했습니다`,'success');
        updateShortcutField(keyInput, entry);
      }
      keyInput.blur();
    }
  });
  keyInput.addEventListener('blur', () => updateShortcutField(keyInput, entry));
  div.appendChild(keyInput);

  const rm = document.createElement('button');
  rm.className = 'remove-shortcut-btn';
  rm.innerHTML = '✖';
  rm.title = '단축키 삭제';
  rm.addEventListener('click', () => {
    const idx = shortcuts.findIndex(sc => sc.id === entry.id);
    if (idx !== -1) {
      shortcuts.splice(idx, 1);
      container.removeChild(div);
      showMessage(`"${entry.name||'단축키'}" 항목을 삭제했습니다`,'info');
    }
  });
  div.appendChild(rm);

  container.appendChild(div);
}

function updateShortcutField(field, entry) {
  field.value = entry.key;
  field.placeholder = entry.key || '키를 눌러주세요';
}

function initSaveCancelButtons() {
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    localStorage.setItem(LS_KEY_MODE,        workingSettings.mode);
    localStorage.setItem(LS_KEY_NOTIFY,      workingSettings.notify);
    localStorage.setItem(LS_KEY_CATNOTIFY,   JSON.stringify(workingSettings.categories));
    localStorage.setItem(LS_KEY_AUTOLOGOUT,  JSON.stringify(workingSettings.autoLogout));
    localStorage.setItem(LS_KEY_SHORTCUTS,   JSON.stringify(workingSettings.shortcuts));
    savedSettings = JSON.parse(JSON.stringify(workingSettings));
    showMessage('설정이 저장되었습니다','success');
  });

  document.getElementById('cancelSettingsBtn')?.addEventListener('click', () => {
    workingSettings = JSON.parse(JSON.stringify(savedSettings));
    initSettingsPage();
    showMessage('저장 전 상태로 되돌아갔습니다','info');
  });
}

function showMessage(msg, type='info') {
  const n = document.createElement('div');
  const bg = type === 'success' ? 'rgba(16,185,129,0.9)'
           : type === 'error'   ? 'rgba(239,68,68,0.9)'
           :                       'rgba(59,130,246,0.9)';
  const icon = type === 'success' ? '✅'
             : type === 'error'   ? '❌'
             :                       'ℹ️';
  n.style.cssText = `
    position:fixed; top:100px; right:20px;
    background:${bg}; color:white;
    padding:1rem 1.5rem; border-radius:12px;
    box-shadow:0 10px 25px rgba(0,0,0,0.3);
    z-index:10000; font-weight:600;
    backdrop-filter:blur(20px);
    border:1px solid ${bg.replace('0.9','0.3')};
    animation:slideInRight 0.3s ease-out;
    max-width:400px;
  `;
  n.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;">
                   <span>${icon}</span><span>${msg}</span>
                 </div>`;
  document.body.appendChild(n);
  setTimeout(()=>{
    n.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(()=>n.remove(),300);
  },3000);
}

window.initSettingsPage = initSettingsPage;

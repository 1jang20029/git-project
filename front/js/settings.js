// /js/settings.js
(() => {
  console.log('▶ settings.js loaded');

  // 로컬스토리지 키
  const LS_KEY_MODE        = 'lightMode';
  const LS_KEY_NOTIFY      = 'enableNotification';
  const LS_KEY_CATNOTIFY   = 'notificationCategories';
  const LS_KEY_AUTOLOGOUT  = 'autoLogout';
  const LS_KEY_SHORTCUTS   = 'keyboardShortcuts';

  // 기본 단축키
  const DEFAULT_SHORTCUTS = [
    { id: 'shortcut-toggle-sidebar',     name: '사이드바 토글', key: 'F2' },
    { id: 'shortcut-open-notifications', name: '알림 열기',     key: 'F3' },
    { id: 'shortcut-go-to-settings',     name: '설정 화면',     key: 'F4' }
  ];

  // 현재 UI에 바인딩된 설정 상태
  let workingSettings = {
    mode: false,
    notify: true,
    categories: {},
    autoLogout: { enabled: false, timeoutMinutes: 15 },
    shortcuts: []
  };

  // 포커스된 단축키 항목(id)
  let activeShortcutId = null;

  // ──────────────────────────────────────────────────────────────────────────
  // 초기화
  document.addEventListener('DOMContentLoaded', () => {
    loadSavedSettings();
    initSettingsPage();
    bindGlobalKeydown();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1) 로컬스토리지에서 읽어오기
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

  // ──────────────────────────────────────────────────────────────────────────
  // 2) 페이지 내 모든 UI 초기화
  function initSettingsPage() {
    initThemeToggle();
    initNotificationToggle();
    initCategoryNotifications();
    initAutoLogoutSettings();
    renderShortcutList();
    initSaveCancelButtons();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3) 다크/라이트 모드
  function initThemeToggle() {
    const t = document.getElementById('themeToggle');
    if (!t) return;
    document.body.classList.toggle('light-mode', workingSettings.mode);
    t.checked = workingSettings.mode;
    t.addEventListener('change', () => {
      workingSettings.mode = t.checked;
      document.body.classList.toggle('light-mode', workingSettings.mode);
      persist(LS_KEY_MODE, workingSettings.mode);
      showMessage(`테마: ${workingSettings.mode ? '라이트' : '다크'} 모드`, 'success');
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4) 알림 ON/OFF
  function initNotificationToggle() {
    const c = document.getElementById('notificationToggle');
    if (!c) return;
    c.checked = workingSettings.notify;
    c.addEventListener('change', () => {
      workingSettings.notify = c.checked;
      persist(LS_KEY_NOTIFY, workingSettings.notify);
      showMessage(`알림 받기: ${c.checked ? 'ON' : 'OFF'}`, 'success');
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5) 카테고리별 알림
  function initCategoryNotifications() {
    ['공지사항','커뮤니티','셔틀버스'].forEach(cat => {
      const cb = document.getElementById(`notifCategory-${cat}`);
      if (!cb) return;
      cb.checked = !!workingSettings.categories[cat];
      cb.addEventListener('change', () => {
        workingSettings.categories[cat] = cb.checked;
        persist(LS_KEY_CATNOTIFY, workingSettings.categories);
        showMessage(`${cat} 알림: ${cb.checked ? 'ON' : 'OFF'}`, 'success');
      });
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6) 자동 로그아웃
  function initAutoLogoutSettings() {
    const toggle = document.getElementById('autoLogoutToggle');
    const input  = document.getElementById('autoLogoutTimeout');
    if (toggle) {
      toggle.checked = workingSettings.autoLogout.enabled;
      toggle.addEventListener('change', () => {
        workingSettings.autoLogout.enabled = toggle.checked;
        persist(LS_KEY_AUTOLOGOUT, workingSettings.autoLogout);
        showMessage(`자동로그아웃: ${toggle.checked ? '활성화' : '비활성화'}`, 'success');
      });
    }
    if (input) {
      input.value = workingSettings.autoLogout.timeoutMinutes;
      input.addEventListener('change', () => {
        let v = parseInt(input.value,10);
        if (isNaN(v)||v<1) v=1;
        if (v>120) v=120;
        input.value = v;
        workingSettings.autoLogout.timeoutMinutes = v;
        persist(LS_KEY_AUTOLOGOUT, workingSettings.autoLogout);
        showMessage(`로그아웃 대기시간: ${v}분`, 'success');
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7) 단축키 리스트 렌더링
  function renderShortcutList() {
    const container = document.getElementById('shortcut-list-container');
    container.innerHTML = '';
    workingSettings.shortcuts.forEach(entry => {
      const item = createShortcutItem(entry);
      container.appendChild(item);
    });
    // “+ 단축키 추가” 버튼 바인딩
    document.getElementById('addShortcutBtn').onclick = () => {
      if (workingSettings.shortcuts.length >= 5) {
        showMessage('최대 5개까지 추가 가능합니다', 'error');
        return;
      }
      const newEntry = { id:`shortcut-${Date.now()}`, name:'', key:'' };
      workingSettings.shortcuts.push(newEntry);
      persist(LS_KEY_SHORTCUTS, workingSettings.shortcuts);
      container.appendChild(createShortcutItem(newEntry));
      showMessage('새 단축키 추가', 'success');
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7-1) 단축키 항목 DOM 생성
  function createShortcutItem(entry) {
    // wrapper
    const div = document.createElement('div');
    div.className = 'shortcut-item';
    div.id = entry.id;

    // 설명 input
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'label-input';
    labelInput.placeholder = '단축키 설명';
    labelInput.value = entry.name;
    labelInput.onchange = () => {
      entry.name = labelInput.value.trim();
      persist(LS_KEY_SHORTCUTS, workingSettings.shortcuts);
      showMessage(`설명 수정됨`, 'info');
    };
    div.appendChild(labelInput);

    // 키 input
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'key-input';
    keyInput.readOnly = true;
    keyInput.tabIndex = 0;           // 포커스 가능
    keyInput.placeholder = entry.key || '키를 눌러주세요';
    keyInput.value       = entry.key;
    // focus 시 어떤 entry에 할당할지 저장
    keyInput.onfocus = () => {
      activeShortcutId = entry.id;
      keyInput.classList.add('waiting-key');
    };
    // blur 시 해제
    keyInput.onblur = () => {
      activeShortcutId = null;
      keyInput.classList.remove('waiting-key');
    };
    // click 도 focus
    keyInput.onclick = () => keyInput.focus();

    div.appendChild(keyInput);

    // 삭제 버튼
    const rm = document.createElement('button');
    rm.className = 'remove-shortcut-btn';
    rm.innerHTML = '✖';
    rm.title = '삭제';
    rm.onclick = () => {
      const idx = workingSettings.shortcuts.findIndex(s => s.id === entry.id);
      if (idx !== -1) {
        workingSettings.shortcuts.splice(idx, 1);
        persist(LS_KEY_SHORTCUTS, workingSettings.shortcuts);
        div.remove();
        showMessage('단축키 삭제됨', 'info');
      }
    };
    div.appendChild(rm);

    return div;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8) 글로벌 키다운 핸들러 (단축키 할당)
  function bindGlobalKeydown() {
    window.addEventListener('keydown', e => {
      if (!activeShortcutId) return;
      e.preventDefault();
      const k = e.key.toUpperCase();
      // 유효 키: 알파벳/숫자 한 글자 혹은 F1~F12
      if (!((k.length === 1 && /^[A-Z0-9]$/.test(k)) || /^F[1-9][0-2]?$/.test(k))) return;

      const entry = workingSettings.shortcuts.find(s => s.id === activeShortcutId);
      if (!entry) return;

      // 중복 체크 후 스왑 or 단순 대입
      const other = workingSettings.shortcuts.find(s => s.key === k && s.id !== entry.id);
      if (other) {
        const old = entry.key;
        entry.key    = k;
        other.key    = old || '';
        showMessage('키가 스왑되었습니다', 'success');
        updateUIKey(entry.id, entry.key);
        updateUIKey(other.id, other.key);
      } else {
        entry.key = k;
        showMessage('키가 설정되었습니다', 'success');
        updateUIKey(entry.id, entry.key);
      }
      persist(LS_KEY_SHORTCUTS, workingSettings.shortcuts);
      // blur 처리
      const inputEl = document.querySelector(`#${entry.id} .key-input`);
      inputEl && inputEl.blur();
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UI 업데이트 헬퍼
  function updateUIKey(itemId, newKey) {
    const el = document.querySelector(`#${itemId} .key-input`);
    if (el) {
      el.value       = newKey;
      el.placeholder = newKey || '키를 눌러주세요';
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9) 저장/취소 버튼
  function initSaveCancelButtons() {
    document.getElementById('saveSettingsBtn').onclick = () => {
      // 이미 각각의 동작마다 persist 했으니, 안내만
      showMessage('모든 설정이 저장되었습니다', 'success');
    };
    document.getElementById('cancelSettingsBtn').onclick = () => {
      // 로컬스토리지 내용으로 다시 로드
      loadSavedSettings();
      initSettingsPage();
      showMessage('저장된 설정으로 되돌렸습니다', 'info');
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // localStorage 저장 공통
  function persist(key, value) {
    if (typeof value === 'object') value = JSON.stringify(value);
    localStorage.setItem(key, value);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 알림 메시지 출력
  function showMessage(msg, type = 'info') {
    const n = document.createElement('div');
    const bg =
      type === 'success' ? 'rgba(16,185,129,0.9)' :
      type === 'error'   ? 'rgba(239,68,68,0.9)' :
                           'rgba(59,130,246,0.9)';
    const icon =
      type === 'success' ? '✅' :
      type === 'error'   ? '❌' :
                           'ℹ️';
    n.style.cssText = `
      position: fixed; top: 100px; right: 20px;
      background: ${bg}; color: white;
      padding: 1rem 1.5rem; border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 10000; font-weight: 600;
      backdrop-filter: blur(20px);
      border: 1px solid ${bg.replace('0.9','0.3')};
      animation: slideInRight 0.3s ease-out;
      max-width: 400px;
    `;
    n.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;">
                     <span>${icon}</span><span>${msg}</span>
                   </div>`;
    document.body.appendChild(n);
    setTimeout(() => {
      n.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => n.remove(), 300);
    }, 3000);
  }

})();

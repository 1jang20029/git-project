// settings.js

// =============================================================================
// 분리된 설정 화면 전용 자바스크립트
// =============================================================================

// 이 함수는 index.js가 settings.html을 삽입한 직후 호출해서
// “토글 클릭 리스너 연결 + 초기 상태 반영”을 수행합니다.
function initSettingsPage() {
  // 1) 다크/라이트 모드
  const themeToggle = document.getElementById('themeToggle');
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true';

  if (themeToggle) {
    // 초기 상태 반영
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    themeToggle.checked = isLightMode;

    // 체크박스 상태 변경 이벤트 바인딩
    themeToggle.addEventListener('change', () => {
      const isLight = themeToggle.checked;
      if (isLight) {
        document.body.classList.add('light-mode');
        localStorage.setItem('lightMode', 'true');
        showMessage('라이트 모드로 변경되었습니다', 'success');
      } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('lightMode', 'false');
        showMessage('다크 모드로 변경되었습니다', 'success');
      }
    });
  }

  // 2) 알림 받기 ON/OFF
  const notificationToggle = document.getElementById('notificationToggle');
  const savedNotify = localStorage.getItem('enableNotification');
  const isNotifyEnabled = savedNotify === 'true';

  if (notificationToggle) {
    notificationToggle.checked = isNotifyEnabled;
    notificationToggle.addEventListener('change', () => {
      const enabled = notificationToggle.checked;
      localStorage.setItem('enableNotification', enabled);
      if (enabled) {
        showMessage('알림이 활성화되었습니다', 'success');
      } else {
        showMessage('알림이 비활성화되었습니다', 'info');
      }
    });
  }

  // 3) 카테고리별 알림 설정 (key: notificationCategories)
  //    저장형식: { "공지사항": true, "커뮤니티": true, "셔틀버스": true, "강의평가": true }
  const defaultCatSettings = {
    '공지사항': true,
    '커뮤니티': true,
    '셔틀버스': true,
    '강의평가': true
  };
  const savedCatSettings = JSON.parse(localStorage.getItem('notificationCategories')) || defaultCatSettings;
  Object.keys(defaultCatSettings).forEach((cat) => {
    const checkbox = document.getElementById(`notifCategory-${cat}`);
    if (checkbox) {
      checkbox.checked = savedCatSettings[cat] === true;
      checkbox.addEventListener('change', () => {
        const updated = JSON.parse(localStorage.getItem('notificationCategories')) || defaultCatSettings;
        updated[cat] = checkbox.checked;
        localStorage.setItem('notificationCategories', JSON.stringify(updated));
        showMessage(`${cat} 알림이 ${checkbox.checked ? '활성화' : '비활성화'}되었습니다`, 'success', cat);
      });
    }
  });

  // 4) Do Not Disturb (DND) 설정
  //    저장형식: { enabled: true/false, startHour: int, startMinute: int, endHour: int, endMinute: int }
  const dndToggle = document.getElementById('dndToggle');
  const dndStart = document.getElementById('dndStart');
  const dndEnd = document.getElementById('dndEnd');
  const savedDND = JSON.parse(localStorage.getItem('doNotDisturb')) || { enabled: false, startHour: 21, startMinute: 0, endHour: 7, endMinute: 0 };

  if (dndToggle && dndStart && dndEnd) {
    dndToggle.checked = savedDND.enabled;
    // 시각 초기값
    dndStart.value = `${String(savedDND.startHour).padStart(2, '0')}:${String(savedDND.startMinute).padStart(2, '0')}`;
    dndEnd.value = `${String(savedDND.endHour).padStart(2, '0')}:${String(savedDND.endMinute).padStart(2, '0')}`;

    // 토글 이벤트
    dndToggle.addEventListener('change', () => {
      const val = dndToggle.checked;
      const current = JSON.parse(localStorage.getItem('doNotDisturb')) || savedDND;
      current.enabled = val;
      localStorage.setItem('doNotDisturb', JSON.stringify(current));
      showMessage(`DND 모드가 ${val ? '활성화' : '비활성화'}되었습니다`, 'success');
    });

    // 시작 시간 변경 이벤트
    dndStart.addEventListener('change', () => {
      const [h, m] = dndStart.value.split(':').map(Number);
      const current = JSON.parse(localStorage.getItem('doNotDisturb')) || savedDND;
      current.startHour = h;
      current.startMinute = m;
      localStorage.setItem('doNotDisturb', JSON.stringify(current));
      showMessage(`DND 시작 시간이 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}로 변경되었습니다`, 'success');
    });

    // 종료 시간 변경 이벤트
    dndEnd.addEventListener('change', () => {
      const [h, m] = dndEnd.value.split(':').map(Number);
      const current = JSON.parse(localStorage.getItem('doNotDisturb')) || savedDND;
      current.endHour = h;
      current.endMinute = m;
      localStorage.setItem('doNotDisturb', JSON.stringify(current));
      showMessage(`DND 종료 시간이 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}로 변경되었습니다`, 'success');
    });
  }

  // 5) 자동 로그아웃 설정
  //    저장형식: { enabled: true/false, timeoutMinutes: int }
  const autoLogoutToggle = document.getElementById('autoLogoutToggle');
  const autoLogoutTimeout = document.getElementById('autoLogoutTimeout');
  const savedAutoLogout = JSON.parse(localStorage.getItem('autoLogout')) || { enabled: false, timeoutMinutes: 15 };

  if (autoLogoutToggle && autoLogoutTimeout) {
    autoLogoutToggle.checked = savedAutoLogout.enabled;
    autoLogoutTimeout.value = savedAutoLogout.timeoutMinutes;

    autoLogoutToggle.addEventListener('change', () => {
      const val = autoLogoutToggle.checked;
      const current = JSON.parse(localStorage.getItem('autoLogout')) || savedAutoLogout;
      current.enabled = val;
      localStorage.setItem('autoLogout', JSON.stringify(current));
      showMessage(`자동 로그아웃이 ${val ? '활성화' : '비활성화'}되었습니다`, 'success');
    });

    autoLogoutTimeout.addEventListener('change', () => {
      let val = parseInt(autoLogoutTimeout.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 120) val = 120;
      autoLogoutTimeout.value = val;
      const current = JSON.parse(localStorage.getItem('autoLogout')) || savedAutoLogout;
      current.timeoutMinutes = val;
      localStorage.setItem('autoLogout', JSON.stringify(current));
      showMessage(`자동 로그아웃 대기 시간이 ${val}분으로 설정되었습니다`, 'success');
    });
  }

  // 6) 키보드 단축키 설정
  //    저장형식: { toggleSidebar: 'F2', openNotifications: 'F3', goToSettings: 'F4' }
  const shortcutToggleSidebar = document.getElementById('shortcutToggleSidebar');
  const shortcutOpenNotifications = document.getElementById('shortcutOpenNotifications');
  const shortcutGoToSettings = document.getElementById('shortcutGoToSettings');

  const defaultShortcuts = {
    toggleSidebar: 'F2',
    openNotifications: 'F3',
    goToSettings: 'F4'
  };

  const savedShortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;

  if (shortcutToggleSidebar && shortcutOpenNotifications && shortcutGoToSettings) {
    // 초기 값 반영
    shortcutToggleSidebar.value = savedShortcuts.toggleSidebar;
    shortcutOpenNotifications.value = savedShortcuts.openNotifications;
    shortcutGoToSettings.value = savedShortcuts.goToSettings;

    // 포커스 시 “키를 눌러주세요” 플레이스홀더 표시
    shortcutToggleSidebar.addEventListener('focus', () => {
      shortcutToggleSidebar.value = '';
      shortcutToggleSidebar.placeholder = '키를 눌러주세요';
    });
    shortcutOpenNotifications.addEventListener('focus', () => {
      shortcutOpenNotifications.value = '';
      shortcutOpenNotifications.placeholder = '키를 눌러주세요';
    });
    shortcutGoToSettings.addEventListener('focus', () => {
      shortcutGoToSettings.value = '';
      shortcutGoToSettings.placeholder = '키를 눌러주세요';
    });

    // 중복 검사를 위한 헬퍼 함수
    function isDuplicateKey(key) {
      const ks = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
      // 현재 저장된 키들 중 하나와 겹치는지 확인
      return (
        ks.toggleSidebar === key ||
        ks.openNotifications === key ||
        ks.goToSettings === key
      );
    }

    // 단축키 설정 시, 다른 단축키와 중복되지 않도록 검사하고 저장
    shortcutToggleSidebar.addEventListener('keydown', (e) => {
      e.preventDefault();
      const val = e.key.toUpperCase();
      if (val.length === 1 || val.startsWith('F')) {
        if (isDuplicateKey(val) && savedShortcuts.toggleSidebar !== val) {
          // 이미 할당된 키이면 알림 후 변경하지 않음
          showMessage(`이미 다른 기능에 사용 중인 키입니다: ${val}`, 'error');
          // placeholder를 원래대로 돌려놓고 blur
          shortcutToggleSidebar.placeholder = shortcutToggleSidebar.getAttribute('data-default-placeholder');
          shortcutToggleSidebar.value = '';
          shortcutToggleSidebar.blur();
        } else {
          // 중복이 아니면 저장
          const current = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
          current.toggleSidebar = val;
          localStorage.setItem('keyboardShortcuts', JSON.stringify(current));
          shortcutToggleSidebar.value = val;
          shortcutToggleSidebar.placeholder = shortcutToggleSidebar.getAttribute('data-default-placeholder');
          showMessage(`“사이드바 토글” 단축키가 ${val}로 변경되었습니다`, 'success');
          shortcutToggleSidebar.blur();
        }
      }
    });

    shortcutOpenNotifications.addEventListener('keydown', (e) => {
      e.preventDefault();
      const val = e.key.toUpperCase();
      if (val.length === 1 || val.startsWith('F')) {
        if (isDuplicateKey(val) && savedShortcuts.openNotifications !== val) {
          showMessage(`이미 다른 기능에 사용 중인 키입니다: ${val}`, 'error');
          shortcutOpenNotifications.placeholder = shortcutOpenNotifications.getAttribute('data-default-placeholder');
          shortcutOpenNotifications.value = '';
          shortcutOpenNotifications.blur();
        } else {
          const current = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
          current.openNotifications = val;
          localStorage.setItem('keyboardShortcuts', JSON.stringify(current));
          shortcutOpenNotifications.value = val;
          shortcutOpenNotifications.placeholder = shortcutOpenNotifications.getAttribute('data-default-placeholder');
          showMessage(`“알림 열기” 단축키가 ${val}로 변경되었습니다`, 'success');
          shortcutOpenNotifications.blur();
        }
      }
    });

    shortcutGoToSettings.addEventListener('keydown', (e) => {
      e.preventDefault();
      const val = e.key.toUpperCase();
      if (val.length === 1 || val.startsWith('F')) {
        if (isDuplicateKey(val) && savedShortcuts.goToSettings !== val) {
          showMessage(`이미 다른 기능에 사용 중인 키입니다: ${val}`, 'error');
          shortcutGoToSettings.placeholder = shortcutGoToSettings.getAttribute('data-default-placeholder');
          shortcutGoToSettings.value = '';
          shortcutGoToSettings.blur();
        } else {
          const current = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
          current.goToSettings = val;
          localStorage.setItem('keyboardShortcuts', JSON.stringify(current));
          shortcutGoToSettings.value = val;
          shortcutGoToSettings.placeholder = shortcutGoToSettings.getAttribute('data-default-placeholder');
          showMessage(`“설정 화면” 단축키가 ${val}로 변경되었습니다`, 'success');
          shortcutGoToSettings.blur();
        }
      }
    });

    // 블러(blur) 시 저장된 키가 항상 보이도록 설정
    shortcutToggleSidebar.addEventListener('blur', () => {
      const curr = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
      shortcutToggleSidebar.value = curr.toggleSidebar;
      shortcutToggleSidebar.placeholder = shortcutToggleSidebar.getAttribute('data-default-placeholder');
    });
    shortcutOpenNotifications.addEventListener('blur', () => {
      const curr = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
      shortcutOpenNotifications.value = curr.openNotifications;
      shortcutOpenNotifications.placeholder = shortcutOpenNotifications.getAttribute('data-default-placeholder');
    });
    shortcutGoToSettings.addEventListener('blur', () => {
      const curr = JSON.parse(localStorage.getItem('keyboardShortcuts')) || defaultShortcuts;
      shortcutGoToSettings.value = curr.goToSettings;
      shortcutGoToSettings.placeholder = shortcutGoToSettings.getAttribute('data-default-placeholder');
    });
  }
}

// 공통으로 쓰는 슬라이드 알림 메시지 함수 (index.js의 showMessage와 동일 로직)
function showMessage(message, type = 'info', category = '') {
  // 1) 카테고리 구분이 필요한 알림이라면, 해당 카테고리가 꺼져 있으면 표시하지 않음
  if (category && !isCategoryEnabled(category)) {
    return;
  }
  // 2) Do Not Disturb 시간대라면 표시하지 않음
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

// ------------------------------
// shouldShowNotification: Do Not Disturb 모드 검사 (설정 페이지와 동일 로직)
// ------------------------------
function shouldShowNotification() {
  const dnd = JSON.parse(localStorage.getItem('doNotDisturb')) || { enabled: false };
  if (!dnd.enabled) return true;

  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const totalMinutes = hh * 60 + mm;

  const startHM = dnd.startHour * 60 + dnd.startMinute;
  const endHM = dnd.endHour * 60 + dnd.endMinute;

  if (startHM < endHM) {
    return !(totalMinutes >= startHM && totalMinutes < endHM);
  } else {
    return !((totalMinutes >= startHM && totalMinutes < 1440) || (totalMinutes < endHM));
  }
}

// ------------------------------
// isCategoryEnabled: 설정 페이지에서 지정한 카테고리별 알림 수신 여부
// ------------------------------
function isCategoryEnabled(category) {
  const catSettings = JSON.parse(localStorage.getItem('notificationCategories')) || {};
  return catSettings[category] === true;
}

// 전역에 initSettingsPage 함수 등록
window.initSettingsPage = initSettingsPage;

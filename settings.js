// =============================================================================
// settings.js
// 분리된 설정 화면 전용 자바스크립트 (전체 코드)
// =============================================================================

// 로컬스토리지 키 정의
const LS_KEY_MODE        = 'lightMode';
const LS_KEY_NOTIFY      = 'enableNotification';
const LS_KEY_CATNOTIFY   = 'notificationCategories';
const LS_KEY_AUTOLOGOUT  = 'autoLogout';
const LS_KEY_SHORTCUTS   = 'keyboardShortcuts';

// 기본 단축키 목록 (처음엔 이 세 개가 저장됨)
const DEFAULT_SHORTCUTS = [
  { id: 'shortcut-toggle-sidebar',     name: '사이드바 토글',     key: 'F2' },
  { id: 'shortcut-open-notifications', name: '알림 열기',         key: 'F3' },
  { id: 'shortcut-go-to-settings',     name: '설정 화면',         key: 'F4' }
];

// 작업용(working) 설정 객체. Save 전까지 이 객체에만 변경을 기록하고,
// Save 클릭 시 로컬스토리지에 커밋한다.
let workingSettings = {};

// 로컬스토리지에 저장된 원본 설정을 담는 객체 (cancel 시 이 상태로 되돌림)
let savedSettings = {};

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  initSettingsPage();
});

// =============================================================================
// loadSavedSettings: 로컬스토리지에서 불러와 savedSettings, workingSettings 초기화
// =============================================================================
function loadSavedSettings() {
  // 1) 다크/라이트 모드
  const savedLightMode = localStorage.getItem(LS_KEY_MODE);
  const isLightMode    = savedLightMode === 'true';

  // 2) 알림 ON/OFF
  const savedNotify    = localStorage.getItem(LS_KEY_NOTIFY);
  const isNotifyEnabled = savedNotify === 'true';

  // 3) 카테고리별 알림 설정 (강의평가 항목은 삭제되었으므로 3가지 카테고리만 다룸)
  const savedCatSettings = JSON.parse(localStorage.getItem(LS_KEY_CATNOTIFY)) || {
    '공지사항': true,
    '커뮤니티': true,
    '셔틀버스': true
  };

  // 4) 자동 로그아웃 설정
  const savedAutoLogout = JSON.parse(localStorage.getItem(LS_KEY_AUTOLOGOUT)) || {
    enabled: false,
    timeoutMinutes: 15
  };

  // 5) 단축키 설정
  let savedShortcuts = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS));
  if (!Array.isArray(savedShortcuts) || savedShortcuts.length === 0) {
    savedShortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    localStorage.setItem(LS_KEY_SHORTCUTS, JSON.stringify(savedShortcuts));
  }

  // savedSettings에 모두 묶어서 저장
  savedSettings = {
    mode: isLightMode,
    notify: isNotifyEnabled,
    categories: savedCatSettings,
    autoLogout: savedAutoLogout,
    shortcuts: savedShortcuts
  };

  // workingSettings을 savedSettings의 깊은 복제로 초기화
  workingSettings = JSON.parse(JSON.stringify(savedSettings));
}

// =============================================================================
// initSettingsPage: 설정 화면 초기화 (UI에 workingSettings 적용)
// =============================================================================
function initSettingsPage() {
  // 1) 다크/라이트 모드
  initThemeToggle();

  // 2) 알림 받기 ON/OFF
  initNotificationToggle();

  // 3) 카테고리별 알림 설정
  initCategoryNotifications();

  // 4) 자동 로그아웃 설정
  initAutoLogoutSettings();

  // 5) 단축키 설정 초기화 및 이벤트 바인딩
  initShortcutSettings();

  // 6) 저장 / 취소 버튼 이벤트 바인딩
  initSaveCancelButtons();

  // 7) 기존 키보드 단축키 반영 (화면 로딩 시)
  applyKeyboardShortcuts();

  // 8) 사용자 정의 단축키 적용 (설정된 단축키를 눌렀을 때 동작)
  applyUserShortcuts();
}

// =============================================================================
// 1) 다크/라이트 모드 토글 초기화 (workingSettings↔UI 동기화)
// =============================================================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // UI에 workingSettings.mode 반영
  if (workingSettings.mode) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  themeToggle.checked = workingSettings.mode;

  // 토글 클릭 시 workingSettings 업데이트 (로컬 저장은 Save 버튼 때 처리)
  themeToggle.addEventListener('change', () => {
    workingSettings.mode = themeToggle.checked;
    // 즉시 화면 반영
    if (workingSettings.mode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  });
}

// =============================================================================
// 2) 알림 받기 ON/OFF 초기화
// =============================================================================
function initNotificationToggle() {
  const notificationToggle = document.getElementById('notificationToggle');
  if (!notificationToggle) return;

  notificationToggle.checked = workingSettings.notify;

  notificationToggle.addEventListener('change', () => {
    workingSettings.notify = notificationToggle.checked;
  });
}

// =============================================================================
// 3) 카테고리별 알림 설정 초기화 (강의평가 항목 제거됨)
// =============================================================================
function initCategoryNotifications() {
  const cats = ['공지사항', '커뮤니티', '셔틀버스'];
  cats.forEach((cat) => {
    const checkbox = document.getElementById(`notifCategory-${cat}`);
    if (!checkbox) return;
    checkbox.checked = !!workingSettings.categories[cat];
    checkbox.addEventListener('change', () => {
      workingSettings.categories[cat] = checkbox.checked;
    });
  });
}

// =============================================================================
// 4) 자동 로그아웃 설정 초기화
// =============================================================================
function initAutoLogoutSettings() {
  const autoLogoutToggle  = document.getElementById('autoLogoutToggle');
  const autoLogoutTimeout = document.getElementById('autoLogoutTimeout');

  if (autoLogoutToggle) {
    autoLogoutToggle.checked = workingSettings.autoLogout.enabled;
    autoLogoutToggle.addEventListener('change', () => {
      workingSettings.autoLogout.enabled = autoLogoutToggle.checked;
    });
  }

  if (autoLogoutTimeout) {
    autoLogoutTimeout.value = workingSettings.autoLogout.timeoutMinutes;
    autoLogoutTimeout.addEventListener('change', () => {
      let val = parseInt(autoLogoutTimeout.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 120) val = 120;
      autoLogoutTimeout.value = val;
      workingSettings.autoLogout.timeoutMinutes = val;
    });
  }
}

// =============================================================================
// 5) 단축키 설정 초기화
// =============================================================================
function initShortcutSettings() {
  const container = document.getElementById('shortcut-list-container');
  const addBtn    = document.getElementById('addShortcutBtn');

  // UI에 workingSettings.shortcuts 배열을 렌더링
  container.innerHTML = '';
  workingSettings.shortcuts.forEach(entry => {
    renderShortcutItem(container, entry, workingSettings.shortcuts);
  });

  // “단축키 추가” 버튼: 최대 5개로 제한
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (workingSettings.shortcuts.length >= 5) {
        showMessage('단축키는 최대 5개까지만 추가할 수 있습니다', 'error');
        return;
      }
      const newId    = `shortcut-${Date.now()}`;
      const newEntry = { id: newId, name: '', key: '' };
      workingSettings.shortcuts.push(newEntry);
      renderShortcutItem(container, newEntry, workingSettings.shortcuts);
    });
  }
}

// =============================================================================
// renderShortcutItem: 단축키 항목 하나를 DOM에 렌더링 (workingSettings↔UI 동기화)
// =============================================================================
function renderShortcutItem(container, entry, shortcutsArray) {
  // entry: { id, name, key }
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

  // 포커스 시 플레이스홀더 변경
  keyInput.addEventListener('focus', () => {
    keyInput.value = '';
    keyInput.placeholder = '키를 눌러주세요';
  });

  // keydown 이벤트: 스왑 로직 포함
  keyInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    const pressedKey = e.key.toUpperCase();
    // 알파벳 한 글자거나 F키(F1~F12)인지 확인
    if ((pressedKey.length === 1 && /^[A-Z0-9]$/.test(pressedKey)) || pressedKey.startsWith('F')) {
      // 같은 키를 쓰는 다른 항목이 있는지 확인
      const otherIndex = shortcutsArray.findIndex(
        sc => sc.key === pressedKey && sc.id !== entry.id
      );
      if (otherIndex !== -1) {
        // 스왑: otherEntry.key ↔ entry.key
        const otherEntry = shortcutsArray[otherIndex];
        const oldKey     = entry.key;
        entry.key        = pressedKey;
        otherEntry.key   = oldKey || '';
        showMessage(
          `"${entry.name || '새 단축키'}"의 키를 ${pressedKey}으로 설정하면서, ` +
          `"${otherEntry.name || '단축키'}" 과(와) 키를 스왑했습니다`,
          'success'
        );
        updateShortcutField(keyInput, entry);
        // 기존 항목 UI 업데이트
        const otherField = document.querySelector(`#${otherEntry.id} .key-input`);
        if (otherField) updateShortcutField(otherField, otherEntry);
      } else {
        // 중복 없으면 그대로 할당
        entry.key = pressedKey;
        showMessage(`"${entry.name || '새 단축키'}"의 키를 ${pressedKey}으로 설정했습니다`, 'success');
        updateShortcutField(keyInput, entry);
      }
      keyInput.blur();
    }
  });

  // blur 시 저장된 값 복원 (placeholder 포함)
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
      // DOM에서 제거
      container.removeChild(itemDiv);
      showMessage(`"${entry.name || '단축키'}" 항목을 삭제했습니다`, 'info');
    }
  });
  itemDiv.appendChild(removeBtn);

  // 컨테이너에 추가
  container.appendChild(itemDiv);
}

// =============================================================================
// updateShortcutField: 입력란에 entry.key 값 표시 및 placeholder 복원
// =============================================================================
function updateShortcutField(field, entry) {
  field.value = entry.key || '';
  field.placeholder = entry.key || '키를 눌러주세요';
}

// =============================================================================
// 6) 저장 / 취소 버튼 초기화
// =============================================================================
function initSaveCancelButtons() {
  const saveBtn   = document.getElementById('saveSettingsBtn');
  const cancelBtn = document.getElementById('cancelSettingsBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // workingSettings를 로컬스토리지에 모두 저장
      localStorage.setItem(LS_KEY_MODE,        workingSettings.mode);
      localStorage.setItem(LS_KEY_NOTIFY,      workingSettings.notify);
      localStorage.setItem(LS_KEY_CATNOTIFY,   JSON.stringify(workingSettings.categories));
      localStorage.setItem(LS_KEY_AUTOLOGOUT,  JSON.stringify(workingSettings.autoLogout));
      localStorage.setItem(LS_KEY_SHORTCUTS,   JSON.stringify(workingSettings.shortcuts));

      // savedSettings를 workingSettings 깊은 복사로 업데이트
      savedSettings = JSON.parse(JSON.stringify(workingSettings));
      showMessage('설정이 저장되었습니다', 'success');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // workingSettings를 savedSettings 깊은 복사로 되돌림
      workingSettings = JSON.parse(JSON.stringify(savedSettings));
      // 전체 UI를 새로 렌더링
      initSettingsPage();
      showMessage('저장하기 전 상태로 되돌아갔습니다', 'info');
    });
  }
}

// =============================================================================
// 7) applyKeyboardShortcuts: 기존 키보드 단축키 로드
// =============================================================================
function applyKeyboardShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS)) || {
    toggleSidebar: 'F2',
    openNotifications: 'F3',
    goToSettings: 'F4'
  };
  document.addEventListener('keydown', (e) => {
    // 입력 요소(focused)에서는 작동하지 않도록 무시
    const targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    resetAutoLogoutTimer(); // 키 입력이 있을 때마다 타이머 초기화
    const key = e.key.toUpperCase();

    // 알림 열기
    if (key === (shortcuts.openNotifications || '').toUpperCase()) {
      e.preventDefault();
      toggleNotifications();
      return;
    }
    // 설정으로 이동
    if (key === (shortcuts.goToSettings || '').toUpperCase()) {
      e.preventDefault();
      showContent('settings');
      return;
    }
  });
}

// =============================================================================
// 8) applyUserShortcuts: 사용자 정의 단축키 로컬스토리지 기반 실행
// =============================================================================
function applyUserShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 입력 요소(focused)에서는 작동하지 않도록 무시
    const targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    resetAutoLogoutTimer(); // 키 입력이 있을 때마다 타이머 초기화
    const pressedKey = e.key.toUpperCase();
    const userShortcuts = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS)) || [];

    // 눌린 키가 userShortcuts 중 하나의 key와 일치하는지 탐색
    const matched = userShortcuts.find(entry => entry.key === pressedKey);
    if (!matched) return;
    if (!matched.name) return;

    e.preventDefault();
    const label = matched.name.toLowerCase();

    // 레이블 내부 키워드 매핑
    if (label.includes('대시보드')) {
      showContent('home');
      return;
    }
    if (label.includes('건물')) {
      showContent('buildings');
      return;
    }
    if (label.includes('커뮤니티')) {
      showContent('community');
      return;
    }
    if (label.includes('강의평가')) {
      showContent('lecture-review');
      return;
    }
    if (label.includes('공지사항')) {
      showContent('notices');
      return;
    }
    if (label.includes('내 시간표') || label.includes('시간표')) {
      showContent('timetable');
      return;
    }
    if (label.includes('셔틀버스') || label.includes('셔틀')) {
      showContent('shuttle');
      return;
    }
    if (label.includes('학사일정') || label.includes('학사')) {
      showContent('calendar');
      return;
    }
    if (label.includes('프로필') || label.includes('내 계정')) {
      showContent('profile');
      return;
    }
    if (label.includes('설정')) {
      showContent('settings');
      return;
    }
    if (label.includes('알림')) {
      toggleNotifications();
      return;
    }
    if (label.includes('로그아웃')) {
      handleLogout();
      return;
    }
    if (label.includes('테마') || label.includes('다크') || label.includes('라이트')) {
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.checked = !themeToggle.checked;
        themeToggle.dispatchEvent(new Event('change'));
      }
      return;
    }
    if (label.includes('내 위치') || label.includes('위치')) {
      trackUserLocation();
      return;
    }
    if (label.includes('확대')) {
      zoomIn();
      return;
    }
    if (label.includes('축소')) {
      zoomOut();
      return;
    }
    if (label.includes('초기화') || label.includes('리셋')) {
      resetMapView();
      return;
    }
    console.log(`등록된 단축키 "${matched.name}"(${matched.key}) 가 호출되었으나, 매핑된 기능이 없습니다.`);
  });
}

// =============================================================================
// window 이벤트: 로컬스토리지 변경 시 사용자 상태 갱신
// =============================================================================
window.addEventListener('storage', (event) => {
  if (
    event.key === 'currentLoggedInUser' ||
    (event.key && event.key.includes('_profileImage'))
  ) {
    checkUserStatus();
    updateTimetable();
  }

  // 테마가 변경되었을 때 즉시 반영
  if (event.key === 'lightMode') {
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode === 'true') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }

  // 단축키가 변경되었을 때 리스너는 이미 동작 중이므로, 실제 배열만 업데이트하면 됨
});

// =============================================================================
// window 이벤트: 페이지 복원(persisted) 시 상태 갱신
// =============================================================================
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    checkUserStatus();
    updateTimetable();
  }
  // 테마와 단축키도 다시 적용
  const savedMode = localStorage.getItem('lightMode');
  if (savedMode === 'true') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
});

// =============================================================================
// navigateToTimetable: 내 시간표 페이지로 이동
// =============================================================================
function navigateToTimetable() {
  showContent('timetable');
}

// =============================================================================
// navigateToShuttle: 셔틀버스 페이지로 이동
// =============================================================================
function navigateToShuttle() {
  showContent('shuttle');
}

// =============================================================================
// navigateToCalendar: 학사일정 페이지로 이동
// =============================================================================
function navigateToCalendar() {
  showContent('calendar');
}

// =============================================================================
// zoomIn: 지도 확대
// =============================================================================
function zoomIn() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() + 1);
  }
}

// =============================================================================
// zoomOut: 지도 축소
// =============================================================================
function zoomOut() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() - 1);
  }
}

// =============================================================================
// resetMapView: 지도 초기 위치로 리셋
// =============================================================================
function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}

// =============================================================================
// trackUserLocation: 사용자의 현재 위치 추적
// =============================================================================
function trackUserLocation() {
  if (!navigator.geolocation) {
    showMessage('위치 서비스를 지원하지 않습니다', 'error', '');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (!naverMap) {
        showMessage('지도가 초기화되지 않았습니다', 'error', '');
        return;
      }

      const userPos = new naver.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );

      if (userMarker) {
        userMarker.setMap(null);
      }

      userMarker = new naver.maps.Marker({
        position: userPos,
        map: naverMap,
        icon: {
          content: '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
          anchor: new naver.maps.Point(10, 10)
        }
      });

      naverMap.setCenter(userPos);
      naverMap.setZoom(17);
      showMessage('현재 위치를 찾았습니다', 'success', '');
    },
    (error) => {
      let message = '위치를 찾을 수 없습니다';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          message = '위치 권한이 거부되었습니다';
          break;
        case error.POSITION_UNAVAILABLE:
          message = '위치 정보를 사용할 수 없습니다';
          break;
        case error.TIMEOUT:
          message = '위치 요청 시간이 초과되었습니다';
          break;
      }
      showMessage(message, 'error', '');
    }
  );
}

// =============================================================================
// showBuildingOnMap: 특정 건물 지도에서 보기
// =============================================================================
function showBuildingOnMap(buildingId) {
  showContent('buildings');
  setTimeout(() => {
    if (naverMap.refresh) naverMap.refresh();
  }, 100);
}

// =============================================================================
// getBuildingDirections: 길찾기 기능 (준비 중)
// =============================================================================
function getBuildingDirections(buildingId) {
  showMessage('길찾기 기능은 준비 중입니다', 'info', '');
}

// =============================================================================
// viewNoticeDetail: 공지사항 상세 보기 (준비 중)
// =============================================================================
function viewNoticeDetail(noticeId) {
  showMessage('공지사항 상세보기는 준비 중입니다', 'info', '');
}
  
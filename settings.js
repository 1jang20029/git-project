// =============================================================================
// settings.js
// ──────────────────────────────────────────────────────────────────────────────
// "설정" 뷰 내 모든 설정 기능 관리
// =============================================================================

// 설정 기본값 정의
const DEFAULT_SETTINGS = {
  theme: 'dark',
  compactMode: false,
  fontSize: 'medium',
  notifications: true,
  scheduleNotifications: true,
  shuttleNotifications: true,
  notificationTime: 10,
  autoLogin: false,
  saveSearchHistory: true,
  showOnlineStatus: true,
  mapStyle: 'default',
  defaultMapZoom: 16,
  showLocation: false,
  language: 'ko',
  timeFormat: '24h',
  autoRefresh: true,
  refreshInterval: 60,
  debugMode: false,
  performanceMode: false
};

// 현재 설정 상태
let currentSettings = { ...DEFAULT_SETTINGS };

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  initializeSettings();
  setupEventListeners();
  updateCacheSize();
  updateVersionInfo();
});

// 설정 초기화
function initializeSettings() {
  loadSettingsFromStorage();
  applyAllSettings();
  updateUI();
}

// 로컬 스토리지에서 설정 불러오기
function loadSettingsFromStorage() {
  try {
    const savedSettings = localStorage.getItem('campusSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('설정 로드 중 오류:', error);
    showToast('설정을 불러오는 중 오류가 발생했습니다.', 'error');
  }
}

// 설정을 로컬 스토리지에 저장
function saveSettingsToStorage() {
  try {
    localStorage.setItem('campusSettings', JSON.stringify(currentSettings));
    showToast('설정이 저장되었습니다.', 'success');
  } catch (error) {
    console.error('설정 저장 중 오류:', error);
    showToast('설정 저장 중 오류가 발생했습니다.', 'error');
  }
}

// 모든 설정 적용
function applyAllSettings() {
  applyTheme();
  applyCompactMode();
  applyFontSize();
  applyPerformanceMode();
  applyDebugMode();
  applyLanguage();
  applyMapSettings();
}

// UI 업데이트
function updateUI() {
  // 토글 스위치들 업데이트
  updateToggle('themeToggle', currentSettings.theme === 'light');
  updateToggle('compactMode', currentSettings.compactMode);
  updateToggle('notificationToggle', currentSettings.notifications);
  updateToggle('scheduleNotificationToggle', currentSettings.scheduleNotifications);
  updateToggle('shuttleNotificationToggle', currentSettings.shuttleNotifications);
  updateToggle('autoLogin', currentSettings.autoLogin);
  updateToggle('saveSearchHistory', currentSettings.saveSearchHistory);
  updateToggle('showOnlineStatus', currentSettings.showOnlineStatus);
  updateToggle('showLocationToggle', currentSettings.showLocation);
  updateToggle('autoRefresh', currentSettings.autoRefresh);
  updateToggle('debugMode', currentSettings.debugMode);
  updateToggle('performanceMode', currentSettings.performanceMode);

  // 선택 박스들 업데이트
  updateSelect('fontSizeSelect', currentSettings.fontSize);
  updateSelect('notificationTime', currentSettings.notificationTime);
  updateSelect('mapStyleSelect', currentSettings.mapStyle);
  updateSelect('defaultMapZoom', currentSettings.defaultMapZoom);
  updateSelect('languageSelect', currentSettings.language);
  updateSelect('timeFormatSelect', currentSettings.timeFormat);
  updateSelect('refreshInterval', currentSettings.refreshInterval);
}

// 토글 스위치 업데이트
function updateToggle(id, checked) {
  const element = document.getElementById(id);
  if (element) {
    element.checked = checked;
  }
}

// 선택 박스 업데이트
function updateSelect(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 토글 스위치 이벤트
  setupToggleListener('themeToggle', 'theme', (checked) => checked ? 'light' : 'dark', applyTheme);
  setupToggleListener('compactMode', 'compactMode', null, applyCompactMode);
  setupToggleListener('notificationToggle', 'notifications', null, applyNotificationSettings);
  setupToggleListener('scheduleNotificationToggle', 'scheduleNotifications');
  setupToggleListener('shuttleNotificationToggle', 'shuttleNotifications');
  setupToggleListener('autoLogin', 'autoLogin', null, applyAutoLogin);
  setupToggleListener('saveSearchHistory', 'saveSearchHistory');
  setupToggleListener('showOnlineStatus', 'showOnlineStatus');
  setupToggleListener('showLocationToggle', 'showLocation', null, applyLocationSettings);
  setupToggleListener('autoRefresh', 'autoRefresh', null, applyAutoRefresh);
  setupToggleListener('debugMode', 'debugMode', null, applyDebugMode);
  setupToggleListener('performanceMode', 'performanceMode', null, applyPerformanceMode);

  // 선택 박스 이벤트
  setupSelectListener('fontSizeSelect', 'fontSize', applyFontSize);
  setupSelectListener('notificationTime', 'notificationTime');
  setupSelectListener('mapStyleSelect', 'mapStyle', applyMapSettings);
  setupSelectListener('defaultMapZoom', 'defaultMapZoom', applyMapSettings);
  setupSelectListener('languageSelect', 'language', applyLanguage);
  setupSelectListener('timeFormatSelect', 'timeFormat');
  setupSelectListener('refreshInterval', 'refreshInterval', applyAutoRefresh);
}

// 토글 리스너 설정
function setupToggleListener(id, settingKey, valueTransform = null, callback = null) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('change', (e) => {
      const value = valueTransform ? valueTransform(e.target.checked) : e.target.checked;
      currentSettings[settingKey] = value;
      saveSettingsToStorage();
      if (callback) callback();
      animateSettingChange(element);
    });
  }
}

// 선택 박스 리스너 설정
function setupSelectListener(id, settingKey, callback = null) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('change', (e) => {
      currentSettings[settingKey] = e.target.value;
      saveSettingsToStorage();
      if (callback) callback();
      animateSettingChange(element);
    });
  }
}

// 설정 변경 애니메이션
function animateSettingChange(element) {
  element.classList.add('setting-saved');
  setTimeout(() => {
    element.classList.remove('setting-saved');
  }, 300);
}

// ==================== 설정 적용 함수들 ====================

// 테마 적용
function applyTheme() {
  const body = document.body;
  if (currentSettings.theme === 'light') {
    body.classList.add('light-mode');
  } else {
    body.classList.remove('light-mode');
  }
  
  // 기존 localStorage도 업데이트 (호환성)
  localStorage.setItem('lightMode', currentSettings.theme === 'light');
}

// 컴팩트 모드 적용
function applyCompactMode() {
  const body = document.body;
  if (currentSettings.compactMode) {
    body.classList.add('compact-mode');
  } else {
    body.classList.remove('compact-mode');
  }
}

// 글꼴 크기 적용
function applyFontSize() {
  const body = document.body;
  body.classList.remove('font-small', 'font-large');
  
  if (currentSettings.fontSize === 'small') {
    body.classList.add('font-small');
  } else if (currentSettings.fontSize === 'large') {
    body.classList.add('font-large');
  }
}

// 성능 모드 적용
function applyPerformanceMode() {
  const body = document.body;
  if (currentSettings.performanceMode) {
    body.classList.add('performance-mode');
  } else {
    body.classList.remove('performance-mode');
  }
}

// 디버그 모드 적용
function applyDebugMode() {
  const body = document.body;
  if (currentSettings.debugMode) {
    body.classList.add('debug-mode');
    console.log('디버그 모드가 활성화되었습니다.');
    console.log('현재 설정:', currentSettings);
  } else {
    body.classList.remove('debug-mode');
  }
}

// 알림 설정 적용
function applyNotificationSettings() {
  if (currentSettings.notifications) {
    // 브라우저 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showToast('알림이 활성화되었습니다.', 'success');
        } else {
          showToast('알림 권한이 거부되었습니다.', 'warning');
        }
      });
    } else if (Notification.permission === 'granted') {
      showToast('알림이 활성화되었습니다.', 'success');
    }
  } else {
    showToast('알림이 비활성화되었습니다.', 'success');
  }
}

// 자동 로그인 설정 적용
function applyAutoLogin() {
  if (currentSettings.autoLogin) {
    showToast('자동 로그인이 활성화되었습니다.', 'success');
  } else {
    showToast('자동 로그인이 비활성화되었습니다.', 'success');
  }
}

// 위치 설정 적용
function applyLocationSettings() {
  if (currentSettings.showLocation) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          showToast('위치 정보가 활성화되었습니다.', 'success');
        },
        (error) => {
          showToast('위치 정보 접근이 거부되었습니다.', 'warning');
          currentSettings.showLocation = false;
          updateToggle('showLocationToggle', false);
        }
      );
    } else {
      showToast('이 브라우저는 위치 정보를 지원하지 않습니다.', 'error');
      currentSettings.showLocation = false;
      updateToggle('showLocationToggle', false);
    }
  }
}

// 지도 설정 적용
function applyMapSettings() {
  showToast(`지도 설정이 변경되었습니다: ${currentSettings.mapStyle}`, 'success');
  // 실제 지도 API 연동 시 여기서 스타일 변경
}

// 언어 설정 적용
function applyLanguage() {
  const language = currentSettings.language;
  document.documentElement.lang = language;
  
  // 언어에 따른 텍스트 변경 (간단한 예시)
  if (language === 'en') {
    showToast('Language changed to English', 'success');
  } else if (language === 'ko') {
    showToast('언어가 한국어로 변경되었습니다', 'success');
  } else {
    showToast('语言已更改', 'success');
  }
}

// 자동 새로고침 설정 적용
function applyAutoRefresh() {
  if (window.refreshInterval) {
    clearInterval(window.refreshInterval);
  }
  
  if (currentSettings.autoRefresh) {
    const intervalMs = currentSettings.refreshInterval * 1000;
    window.refreshInterval = setInterval(() => {
      // 실제 데이터 새로고침 로직
      console.log('자동 새로고침 실행');
    }, intervalMs);
    
    showToast(`자동 새로고침이 ${currentSettings.refreshInterval}초 간격으로 설정되었습니다.`, 'success');
  } else {
    showToast('자동 새로고침이 비활성화되었습니다.', 'success');
  }
}

// ==================== 유틸리티 함수들 ====================

// 캐시 크기 업데이트
function updateCacheSize() {
  let totalSize = 0;
  
  try {
    // 로컬 스토리지 크기 계산
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    // 바이트를 KB/MB로 변환
    let sizeText;
    if (totalSize < 1024) {
      sizeText = `${totalSize} bytes`;
    } else if (totalSize < 1024 * 1024) {
      sizeText = `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      sizeText = `${(totalSize / 1024 / 1024).toFixed(1)} MB`;
    }
    
    const cacheElement = document.getElementById('cacheSize');
    if (cacheElement) {
      cacheElement.textContent = sizeText;
    }
  } catch (error) {
    console.error('캐시 크기 계산 오류:', error);
  }
}

// 버전 정보 업데이트
function updateVersionInfo() {
  const versionElement = document.getElementById('versionInfo');
  if (versionElement) {
    const version = 'v1.2.3';
    const buildDate = new Date().toLocaleDateString('ko-KR');
    versionElement.textContent = `${version} (${buildDate})`;
  }
}

// 캐시 삭제
function clearCache() {
  if (confirm('모든 캐시 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    try {
      // 설정을 제외한 다른 캐시 데이터만 삭제
      const settingsBackup = localStorage.getItem('campusSettings');
      const keysToKeep = ['campusSettings', 'currentLoggedInUser'];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      
      // 브라우저 캐시도 가능하면 삭제
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      updateCacheSize();
      showToast('캐시가 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('캐시 삭제 오류:', error);
      showToast('캐시 삭제 중 오류가 발생했습니다.', 'error');
    }
  }
}

// 모든 설정 초기화
function resetAllSettings() {
  if (confirm('모든 설정을 초기값으로 되돌리시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    try {
      currentSettings = { ...DEFAULT_SETTINGS };
      localStorage.removeItem('campusSettings');
      applyAllSettings();
      updateUI();
      showToast('모든 설정이 초기화되었습니다.', 'success');
    } catch (error) {
      console.error('설정 초기화 오류:', error);
      showToast('설정 초기화 중 오류가 발생했습니다.', 'error');
    }
  }
}

// 설정 내보내기
function exportSettings() {
  try {
    const settingsData = {
      settings: currentSettings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(settingsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `campus_settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('설정이 성공적으로 내보내졌습니다.', 'success');
  } catch (error) {
    console.error('설정 내보내기 오류:', error);
    showToast('설정 내보내기 중 오류가 발생했습니다.', 'error');
  }
}

// 설정 가져오기
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        
        // 데이터 유효성 검사
        if (!data.settings || typeof data.settings !== 'object') {
          throw new Error('잘못된 설정 파일 형식입니다.');
        }
        
        // 설정 적용
        currentSettings = { ...DEFAULT_SETTINGS, ...data.settings };
        saveSettingsToStorage();
        applyAllSettings();
        updateUI();
        
        showToast('설정이 성공적으로 가져와졌습니다.', 'success');
      } catch (error) {
        console.error('설정 가져오기 오류:', error);
        showToast('설정 파일을 읽는 중 오류가 발생했습니다.', 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// 토스트 메시지 표시
function showToast(message, type = 'success') {
  // 기존 토스트 제거
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 애니메이션을 위한 지연
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// 알림 전송 (테스트용)
function sendTestNotification() {
  if (currentSettings.notifications && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('연성대학교 스마트 캠퍼스', {
      body: '테스트 알림입니다.',
      icon: '/favicon.ico',
      tag: 'test-notification'
    });
  } else {
    showToast('알림이 비활성화되어 있거나 권한이 없습니다.', 'warning');
  }
}

// 수업 알림 설정
function scheduleClassNotifications() {
  if (!currentSettings.scheduleNotifications) return;
  
  // 실제 구현에서는 시간표 데이터를 가져와서 알림을 예약
  const now = new Date();
  const notificationTime = currentSettings.notificationTime * 60 * 1000; // 밀리초로 변환
  
  // 예시: 다음 수업까지의 시간 계산 후 알림 예약
  console.log(`수업 알림이 ${currentSettings.notificationTime}분 전으로 설정되었습니다.`);
}

// 셔틀버스 알림 설정
function scheduleShuttleNotifications() {
  if (!currentSettings.shuttleNotifications) return;
  
  // 실제 구현에서는 셔틀버스 API를 통해 도착 시간을 확인하고 알림 예약
  console.log('셔틀버스 알림이 활성화되었습니다.');
}

// 키보드 단축키 설정
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl + Shift + S: 설정 페이지 열기
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      window.location.href = 'settings.html';
    }
    
    // Ctrl + Shift + T: 테마 전환
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.click();
      }
    }
    
    // Ctrl + Shift + R: 설정 초기화
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      resetAllSettings();
    }
  });
}

// 접근성 설정
function setupAccessibility() {
  // 고대비 모드 감지
  if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast');
  }
  
  // 애니메이션 감소 모드 감지
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    currentSettings.performanceMode = true;
    applyPerformanceMode();
  }
  
  // 다크 모드 선호도 감지
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    if (!localStorage.getItem('campusSettings')) {
      currentSettings.theme = 'dark';
      applyTheme();
    }
  }
}

// 설정 동기화 (다른 탭과)
function setupSettingsSync() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'campusSettings') {
      loadSettingsFromStorage();
      applyAllSettings();
      updateUI();
      showToast('다른 탭에서 설정이 변경되어 동기화되었습니다.', 'success');
    }
  });
}

// 성능 모니터링
function monitorPerformance() {
  if (currentSettings.debugMode) {
    // 메모리 사용량 모니터링
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        console.log('메모리 사용량:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
        });
      }, 10000);
    }
    
    // 페이지 로드 성능 측정
    window.addEventListener('load', () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      console.log('페이지 로드 시간:', navigationTiming.loadEventEnd - navigationTiming.fetchStart + 'ms');
    });
  }
}

// 오류 처리 및 로깅
function setupErrorHandling() {
  window.addEventListener('error', (e) => {
    if (currentSettings.debugMode) {
      console.error('JavaScript 오류:', e.error);
      showToast('JavaScript 오류가 발생했습니다. 콘솔을 확인하세요.', 'error');
    }
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    if (currentSettings.debugMode) {
      console.error('처리되지 않은 Promise 거부:', e.reason);
      showToast('비동기 작업 오류가 발생했습니다.', 'error');
    }
  });
}

// 초기화 완료 후 추가 설정
document.addEventListener('DOMContentLoaded', () => {
  setupKeyboardShortcuts();
  setupAccessibility();
  setupSettingsSync();
  monitorPerformance();
  setupErrorHandling();
  
  // 주기적으로 캐시 크기 업데이트
  setInterval(updateCacheSize, 5000);
  
  // 설정 변경 감지를 위한 MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // 클래스 변경 감지 시 필요한 작업 수행
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
});

// 설정 검증
function validateSettings(settings) {
  const errors = [];
  
  if (!['dark', 'light'].includes(settings.theme)) {
    errors.push('유효하지 않은 테마 설정');
  }
  
  if (typeof settings.compactMode !== 'boolean') {
    errors.push('유효하지 않은 컴팩트 모드 설정');
  }
  
  if (!['small', 'medium', 'large'].includes(settings.fontSize)) {
    errors.push('유효하지 않은 글꼴 크기 설정');
  }
  
  if (settings.notificationTime < 1 || settings.notificationTime > 60) {
    errors.push('알림 시간은 1-60분 사이여야 합니다');
  }
  
  return errors;
}

// 설정 백업 (자동)
function autoBackupSettings() {
  const backupKey = `campusSettings_backup_${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify(currentSettings));
  
  // 오래된 백업 삭제 (최대 5개 유지)
  const allKeys = Object.keys(localStorage);
  const backupKeys = allKeys.filter(key => key.startsWith('campusSettings_backup_'));
  
  if (backupKeys.length > 5) {
    backupKeys.sort();
    for (let i = 0; i < backupKeys.length - 5; i++) {
      localStorage.removeItem(backupKeys[i]);
    }
  }
}

// 설정 복원
function restoreFromBackup() {
  const allKeys = Object.keys(localStorage);
  const backupKeys = allKeys.filter(key => key.startsWith('campusSettings_backup_'));
  
  if (backupKeys.length === 0) {
    showToast('사용 가능한 백업이 없습니다.', 'warning');
    return;
  }
  
  // 가장 최근 백업 사용
  backupKeys.sort().reverse();
  const latestBackup = localStorage.getItem(backupKeys[0]);
  
  if (latestBackup) {
    try {
      const backupSettings = JSON.parse(latestBackup);
      currentSettings = { ...DEFAULT_SETTINGS, ...backupSettings };
      saveSettingsToStorage();
      applyAllSettings();
      updateUI();
      showToast('백업에서 설정을 복원했습니다.', 'success');
    } catch (error) {
      showToast('백업 복원 중 오류가 발생했습니다.', 'error');
    }
  }
}

// 주기적으로 설정 백업 (1시간마다)
setInterval(autoBackupSettings, 3600000);

// 전역 설정 객체 노출 (다른 스크립트에서 사용 가능)
window.CampusSettings = {
  get: (key) => currentSettings[key],
  set: (key, value) => {
    currentSettings[key] = value;
    saveSettingsToStorage();
    applyAllSettings();
  },
  getAll: () => ({ ...currentSettings }),
  reset: resetAllSettings,
  export: exportSettings,
  import: importSettings
};
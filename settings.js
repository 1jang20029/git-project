// settings.js
// =============================================================================
// 분리된 설정 화면 전용 자바스크립트
// =============================================================================

// 이 함수는 index.js가 settings.html을 삽입한 직후 호출해서
// “토글 클릭 리스너 연결 + 초기 상태 반영”을 수행합니다.
function initSettingsPage() {
  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');

  // 첫 방문 시 로컬스토리지에 저장된 값 읽어서 토글 체크 상태 결정
  const savedLightMode = localStorage.getItem('lightMode');
  const isLightMode = savedLightMode === 'true';

  if (themeToggle) {
    // 초기 상태
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

  if (notificationToggle) {
    // 초기 상태
    const savedNotify = localStorage.getItem('enableNotification');
    const isNotifyEnabled = savedNotify === 'true';
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
}

// 공통으로 쓰는 슬라이드 알림 메시지 함수
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

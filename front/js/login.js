/* =============================================================================
   login.js - 로그인 페이지 JavaScript
   ============================================================================= */

document.addEventListener('DOMContentLoaded', function() {
  console.log('[DEBUG] 로그인 페이지 로드 완료');
  
  // 요소들 초기화
  initializeElements();
  
  // 이벤트 리스너 설정
  setupEventListeners();
  
  // 저장된 아이디 불러오기
  loadSavedId();
  
  // 알림 표시 (개발 환경에서만)
  showStorageNotice();
});

/* =========================
   요소 초기화
   ========================= */
function initializeElements() {
  const form = document.getElementById('loginForm');
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  
  if (!form || !studentIdInput || !passwordInput) {
    console.error('[ERROR] 필수 요소를 찾을 수 없습니다.');
    return false;
  }
  
  return true;
}

/* =========================
   이벤트 리스너 설정
   ========================= */
function setupEventListeners() {
  // 폼 제출 이벤트
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }
  
  // 비밀번호 토글 이벤트
  const passwordToggle = document.getElementById('passwordToggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', togglePassword);
  }
  
  // 아이디 저장 체크박스 이벤트
  const saveIdCheckbox = document.getElementById('saveId');
  if (saveIdCheckbox) {
    saveIdCheckbox.addEventListener('change', handleSaveIdChange);
  }
  
  // Enter 키 이벤트
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.id === 'studentId' || activeElement.id === 'password')) {
        e.preventDefault();
        handleLogin(e);
      }
    }
  });
}

/* =========================
   로그인 처리
   ========================= */
async function handleLogin(e) {
  e.preventDefault();
  console.log('[DEBUG] 로그인 요청 시작');
  
  const studentId = document.getElementById('studentId').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginButton = document.querySelector('.login-button');
  
  // 입력값 검증
  if (!validateInputs(studentId, password)) {
    return;
  }
  
  // 로딩 상태 설정
  setLoadingState(loginButton, true);
  
  try {
    // 실제 API 호출 (현재는 시뮬레이션)
    const success = await performLogin(studentId, password);
    
    if (success) {
      // 아이디 저장 처리
      handleIdSaving(studentId);
      
      // 로그인 성공 처리
      handleLoginSuccess();
    } else {
      showError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    
  } catch (error) {
    console.error('[ERROR] 로그인 요청 실패:', error);
    showError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    setLoadingState(loginButton, false);
  }
}

/* =========================
   입력값 검증
   ========================= */
function validateInputs(studentId, password) {
  if (!studentId) {
    showError('학번을 입력해주세요.');
    document.getElementById('studentId').focus();
    return false;
  }
  
  if (!password) {
    showError('비밀번호를 입력해주세요.');
    document.getElementById('password').focus();
    return false;
  }
  
  // 학번 형식 검증 (예: 8자리 숫자)
  if (!/^\d{8}$/.test(studentId)) {
    showError('학번은 8자리 숫자로 입력해주세요.');
    document.getElementById('studentId').focus();
    return false;
  }
  
  // 비밀번호 길이 검증
  if (password.length < 4) {
    showError('비밀번호는 4자 이상 입력해주세요.');
    document.getElementById('password').focus();
    return false;
  }
  
  return true;
}

/* =========================
   로그인 API 호출 (시뮬레이션)
   ========================= */
async function performLogin(studentId, password) {
  // 실제 환경에서는 이 부분을 실제 API 호출로 대체
  return new Promise((resolve) => {
    setTimeout(() => {
      // 테스트용 계정 (실제로는 서버에서 검증)
      const testAccounts = {
        '20240001': 'test1234',
        '20240002': 'password',
        '12345678': 'test'
      };
      
      const isValid = testAccounts[studentId] === password;
      resolve(isValid);
    }, 1000); // 1초 대기 (네트워크 지연 시뮬레이션)
  });
  
  /* 실제 API 호출 코드 예시:
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      studentId: studentId,
      password: password
    })
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const result = await response.json();
  return result.success;
  */
}

/* =========================
   로그인 성공 처리
   ========================= */
function handleLoginSuccess() {
  showSuccess('로그인 성공!');
  
  // 사용자 정보 저장 (실제로는 토큰 등을 저장)
  const studentId = document.getElementById('studentId').value;
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('studentId', studentId);
  
  // 페이지 이동 (딜레이 후)
  setTimeout(() => {
    // 이전 페이지로 돌아가거나 메인 페이지로 이동
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      window.location.href = '../../index.html';
    }
  }, 1500);
}

/* =========================
   아이디 저장 관련
   ========================= */
function handleIdSaving(studentId) {
  const saveIdCheckbox = document.getElementById('saveId');
  if (saveIdCheckbox && saveIdCheckbox.checked) {
    localStorage.setItem('savedStudentId', studentId);
  } else {
    localStorage.removeItem('savedStudentId');
  }
}

function loadSavedId() {
  const savedId = localStorage.getItem('savedStudentId');
  if (savedId) {
    document.getElementById('studentId').value = savedId;
    document.getElementById('saveId').checked = true;
  }
}

function handleSaveIdChange() {
  const saveIdCheckbox = document.getElementById('saveId');
  if (!saveIdCheckbox.checked) {
    localStorage.removeItem('savedStudentId');
  }
}

/* =========================
   비밀번호 토글
   ========================= */
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeVisible = document.querySelector('.eye-visible');
  const eyeHidden = document.querySelector('.eye-hidden');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeVisible.style.display = 'none';
    eyeHidden.style.display = 'block';
  } else {
    passwordInput.type = 'password';
    eyeVisible.style.display = 'block';
    eyeHidden.style.display = 'none';
  }
}

/* =========================
   로딩 상태 관리
   ========================= */
function setLoadingState(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<span style="opacity: 0.7;">로그인 중...</span>';
    button.style.cursor = 'not-allowed';
  } else {
    button.disabled = false;
    button.innerHTML = '로그인';
    button.style.cursor = 'pointer';
  }
}

/* =========================
   알림 메시지
   ========================= */
function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
  // 기존 알림 제거
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 새 알림 생성
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // 스타일 적용
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '10000',
    minWidth: '300px',
    maxWidth: '500px',
    padding: '0',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    animation: 'slideInRight 0.3s ease',
    fontFamily: 'inherit'
  });
  
  // 타입별 색상 설정
  const colors = {
    error: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626', icon: '#ef4444' },
    success: { bg: '#dcfce7', border: '#86efac', text: '#16a34a', icon: '#22c55e' },
    info: { bg: '#dbeafe', border: '#93c5fd', text: '#2563eb', icon: '#3b82f6' }
  };
  
  const color = colors[type] || colors.info;
  notification.style.background = color.bg;
  notification.style.border = `2px solid ${color.border}`;
  notification.style.color = color.text;
  
  // 내용 스타일
  const content = notification.querySelector('.notification-content');
  Object.assign(content.style, {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: '12px'
  });
  
  const icon = notification.querySelector('.notification-icon');
  Object.assign(icon.style, {
    fontSize: '20px',
    color: color.icon,
    flexShrink: '0'
  });
  
  const messageEl = notification.querySelector('.notification-message');
  Object.assign(messageEl.style, {
    flex: '1',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4'
  });
  
  const closeBtn = notification.querySelector('.notification-close');
  Object.assign(closeBtn.style, {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: color.text,
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
  });
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.backgroundColor = 'transparent';
  });
  
  // 애니메이션 스타일 추가
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // DOM에 추가
  document.body.appendChild(notification);
  
  // 자동 제거 (에러는 5초, 성공은 3초)
  const autoRemoveTime = type === 'error' ? 5000 : 3000;
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, autoRemoveTime);
}

function getNotificationIcon(type) {
  const icons = {
    error: '❌',
    success: '✅',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

/* =========================
   저장소 알림 표시
   ========================= */
function showStorageNotice() {
  // 개발 환경 감지 (localhost, 127.0.0.1, file://)
  const isDevelopment = 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';
  
  const storageNotice = document.getElementById('storage-notice');
  if (storageNotice) {
    if (isDevelopment) {
      storageNotice.style.display = 'block';
    } else {
      storageNotice.style.display = 'none';
    }
  }
}

/* =========================
   유틸리티 함수들
   ========================= */

// 뒤로가기 함수
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '../../index.html';
  }
}

/* =========================
   소셜 로그인 함수들
   ========================= */

// 네이버 로그인
function naverLogin() {
  const modal = document.getElementById('naverLoginModal');
  if (modal) {
    modal.style.display = 'block';
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal('naverLoginModal');
      }
    });
    
    // ESC 키로 닫기
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal('naverLoginModal');
      }
    });
  }
}

// 구글 로그인
function googleLogin() {
  showNotification('구글 로그인 기능은 준비 중입니다.', 'info');
  
  // 실제 구현 시:
  /*
  window.location.href = 'https://accounts.google.com/oauth/authorize?' +
    'client_id=YOUR_GOOGLE_CLIENT_ID&' +
    'redirect_uri=' + encodeURIComponent(window.location.origin + '/google-callback.html') + '&' +
    'response_type=code&' +
    'scope=email profile';
  */
}

// 모달 닫기
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// 네이버 로그인 처리
async function processNaverLogin() {
  const naverId = document.getElementById('naverId').value.trim();
  const naverPw = document.getElementById('naverPw').value.trim();
  
  if (!naverId || !naverPw) {
    showError('네이버 아이디와 비밀번호를 모두 입력해주세요.');
    return;
  }
  
  // 실제로는 네이버 OAuth를 통해 처리
  showNotification('네이버 로그인 연동 기능은 준비 중입니다.', 'info');
  closeModal('naverLoginModal');
}

/* =========================
   페이지 초기화 완료 후 실행
   ========================= */

// 폼 자동완성 개선
window.addEventListener('load', function() {
  // 브라우저 자동완성 지원
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');
  
  if (studentIdInput) {
    studentIdInput.setAttribute('autocomplete', 'username');
  }
  
  if (passwordInput) {
    passwordInput.setAttribute('autocomplete', 'current-password');
  }
  
  // 첫 번째 입력 필드에 포커스
  if (studentIdInput && !studentIdInput.value) {
    studentIdInput.focus();
  } else if (passwordInput && studentIdInput.value && !passwordInput.value) {
    passwordInput.focus();
  }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
  // 진행 중인 요청이 있다면 정리
  const loginButton = document.querySelector('.login-button');
  if (loginButton && loginButton.disabled) {
    setLoadingState(loginButton, false);
  }
});

/* =========================
   디버그 정보 (개발용)
   ========================= */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('%c[로그인 페이지] 디버그 모드', 'color: #10b981; font-weight: bold;');
  console.log('테스트 계정:');
  console.log('- 학번: 20240001, 비밀번호: test1234');
  console.log('- 학번: 20240002, 비밀번호: password');
  console.log('- 학번: 12345678, 비밀번호: test');
}
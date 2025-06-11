// index.js - 프론트엔드 전용 (정리된 버전)

/**
 * ===========================================
 * 전역 상태 관리
 * ===========================================
 */
const AppState = {
  // UI 상태
  currentContent: 'home',
  isOnline: navigator.onLine,
  
  // 맵 관련
  naverMap: null,
  mapMarkers: [],
  infoWindows: [],
  userMarker: null,
  
  // 페이지 로드 상태
  loadedPages: new Set(),
  
  // 타이머
  autoLogoutTimer: null
};

/**
 * ===========================================
 * 페이지 초기화
 * ===========================================
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  setupNetworkListeners();
  setupAutoLogout();
  setupKeyboardShortcuts();
  
  // URL 해시에 따른 초기 페이지 표시
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash + 'Content')) {
    showContent(hash);
  } else {
    showContent('home');
  }
});

/**
 * ===========================================
 * 앱 초기화
 * ===========================================
 */
async function initializeApp() {
  try {
    await Promise.all([
      loadUserInfo(),
      loadDashboardData(),
      initNaverMap()
    ]);
    
    // 1분마다 실시간 데이터 업데이트
    setInterval(updateRealTimeData, 60000);
    
  } catch (error) {
    console.error('앱 초기화 오류:', error);
    showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
  }
}

/**
 * ===========================================
 * 이벤트 리스너 설정
 * ===========================================
 */
function setupEventListeners() {
  // 전역 ESC 키 처리
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
    resetAutoLogoutTimer();
  });

  // 검색 입력 처리
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGlobalSearch();
      }
    });
    searchInput.addEventListener('input', resetAutoLogoutTimer);
  }

  // 학생서비스 드롭다운 처리
  setupStudentServiceDropdown();
  
  // 전역 클릭 이벤트
  document.addEventListener('click', handleGlobalClick);
  
  // 스토리지 변경 감지
  window.addEventListener('storage', handleStorageChange);
  
  // 페이지 복원 감지
  window.addEventListener('pageshow', handlePageShow);
}

/**
 * 학생서비스 드롭다운 개선된 처리
 */
function setupStudentServiceDropdown() {
  const studentServices = document.getElementById('nav-student-services');
  if (!studentServices) return;
  
  let hoverTimeout;
  
  studentServices.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    showStudentServiceDropdown();
  });
  
  studentServices.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeStudentServiceDropdown, 150);
  });
  
  const dropdown = studentServices.querySelector('.dropdown-menu');
  if (dropdown) {
    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
    });
    
    dropdown.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(closeStudentServiceDropdown, 150);
    });
  }
  
  // 드롭다운 항목 클릭 처리
  setTimeout(() => {
    const dropdownItems = document.querySelectorAll('#nav-student-services .dropdown-item');
    dropdownItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const actions = [
          () => navigateToExternal('timetable.html'),
          () => navigateToExternal('academic-calendar.html'),
          () => navigateToExternal('shuttle.html')
        ];
        
        if (actions[index]) {
          actions[index]();
        }
      });
    });
  }, 100);
}

/**
 * 전역 클릭 이벤트 처리
 */
function handleGlobalClick(event) {
  const isNotificationBtn = event.target.closest('#notification-btn');
  const isUserProfile = event.target.closest('#user-profile');
  const isStudentService = event.target.closest('#nav-student-services');

  if (!isNotificationBtn) closeNotificationDropdown();
  if (!isUserProfile) closeUserDropdown();
  if (!isStudentService) closeStudentServiceDropdown();

  resetAutoLogoutTimer();
}

/**
 * 스토리지 변경 처리
 */
function handleStorageChange(event) {
  if (event.key === 'currentLoggedInUser' || 
      (event.key && event.key.includes('_profileImage'))) {
    loadUserInfo();
  }
  
  if (event.key === 'lightMode') {
    applyTheme();
  }
}

/**
 * 페이지 복원 처리
 */
function handlePageShow(event) {
  if (event.persisted) {
    loadUserInfo();
    updateRealTimeData();
  }
  applyTheme();
}

/**
 * ===========================================
 * 네트워크 상태 관리
 * ===========================================
 */
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    AppState.isOnline = true;
    showMessage('인터넷 연결이 복구되었습니다', 'success');
    loadDashboardData(); // 온라인 복구 시 데이터 재로드
  });

  window.addEventListener('offline', () => {
    AppState.isOnline = false;
    showMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다', 'error');
  });
}

/**
 * ===========================================
 * SPA 네비게이션
 * ===========================================
 */
function showContent(type) {
  // 모든 콘텐츠 패널 숨기기
  const contentPanels = [
    'homeContent', 'buildingsContent', 'communityContent', 
    'lecture-reviewContent', 'noticesContent', 'settingsContent'
  ];
  
  contentPanels.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });

  // 동적 페이지 로드
  loadPageIfNeeded(type);

  // 타겟 페이지 표시
  const targetId = getContentId(type);
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.style.display = 'block';
    targetElement.classList.add('fade-in');
  }

  // 네비게이션 활성 상태 업데이트
  updateNavigation(type);
  
  // 상태 업데이트
  AppState.currentContent = type;
  window.location.hash = type;

  // 지도 새로고침 (필요한 경우)
  if (type === 'buildings' && AppState.naverMap) {
    setTimeout(() => {
      if (AppState.naverMap.refresh) {
        AppState.naverMap.refresh();
      }
    }, 100);
  }
}

/**
 * 페이지별 콘텐츠 ID 매핑
 */
function getContentId(type) {
  const contentMap = {
    home: 'homeContent',
    buildings: 'buildingsContent',
    community: 'communityContent',
    'lecture-review': 'lecture-reviewContent',
    notices: 'noticesContent',
    settings: 'settingsContent'
  };
  
  return contentMap[type] || 'homeContent';
}

/**
 * 동적 페이지 로드
 */
async function loadPageIfNeeded(type) {
  if (AppState.loadedPages.has(type)) return;
  
  const pageConfig = {
    settings: { file: 'settings.html', init: 'initSettingsPage' },
    community: { file: 'pages/list/community.html', init: 'initCommunityPage' },
    'lecture-review': { file: 'pages/list/lecture-review.html', init: 'initLectureReviewPage' },
    notices: { file: 'pages/list/notices.html', init: 'initNoticesPage' },
    buildings: { file: 'pages/list/buildings.html', init: 'initBuildingsPage' }
  };
  
  const config = pageConfig[type];
  if (!config) return;
  
  const container = document.getElementById(getContentId(type));
  if (!container) return;
  
  try {
    const response = await fetch(config.file);
    if (!response.ok) {
      throw new Error(`${config.file} 로드 실패`);
    }
    
    const html = await response.text();
    container.innerHTML = html;
    AppState.loadedPages.add(type);
    
    // 페이지별 초기화 함수 호출
    if (window[config.init]) {
      window[config.init]();
    }
    
  } catch (error) {
    console.error(`페이지 로드 오류 (${type}):`, error);
    container.innerHTML = createErrorFallback(`${type} 화면을 불러올 수 없습니다`);
  }
}

/**
 * 네비게이션 활성 상태 업데이트
 */
function updateNavigation(type) {
  document.querySelectorAll('#main-menu .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const navItem = document.getElementById('nav-' + type);
  if (navItem) {
    navItem.classList.add('active');
  }
}

/**
 * ===========================================
 * 외부 페이지 네비게이션
 * ===========================================
 */
function navigateToExternal(page) {
  console.log(`${page} 페이지로 이동`);
  closeAllDropdowns();
  window.location.href = page;
}

/**
 * ===========================================
 * 데이터 로드 및 렌더링
 * ===========================================
 */
async function loadUserInfo() {
  try {
    const response = await fetch('/api/user/profile');
    if (response.ok) {
      const userData = await response.json();
      updateUserUI(userData);
    } else {
      setGuestMode();
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    setGuestMode();
  }
}

async function loadDashboardData() {
  if (!AppState.isOnline) return;
  
  try {
    const [statsRes, notificationsRes, timetableRes] = await Promise.all([
      fetch('/api/dashboard/stats'),
      fetch('/api/notifications'),
      fetch('/api/user/today-schedule')
    ]);
    
    if (statsRes.ok) {
      const stats = await statsRes.json();
      renderStats(stats);
    }
    
    if (notificationsRes.ok) {
      const notifications = await notificationsRes.json();
      renderNotifications(notifications);
    }
    
    if (timetableRes.ok) {
      const schedule = await timetableRes.json();
      renderTodaySchedule(schedule);
    }
    
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error);
    showMessage('일부 데이터를 불러오는 중 오류가 발생했습니다', 'error');
  }
}

/**
 * 실시간 데이터 업데이트
 */
async function updateRealTimeData() {
  try {
    const response = await fetch('/api/user/today-schedule');
    if (response.ok) {
      const schedule = await response.json();
      renderTodaySchedule(schedule);
    }
  } catch (error) {
    console.error('실시간 데이터 업데이트 실패:', error);
  }
}

/**
 * ===========================================
 * UI 렌더링 함수들
 * ===========================================
 */
function updateUserUI(userData) {
  const elements = {
    userName: document.getElementById('user-name'),
    userRole: document.getElementById('user-role'),
    dropdownName: document.getElementById('dropdown-user-name'),
    dropdownRole: document.getElementById('dropdown-user-role'),
    avatar: document.getElementById('user-avatar')
  };
  
  if (elements.userName) elements.userName.textContent = userData.name || '사용자';
  if (elements.userRole) elements.userRole.textContent = userData.department || '학생';
  if (elements.dropdownName) elements.dropdownName.textContent = userData.name || '사용자';
  if (elements.dropdownRole) elements.dropdownRole.textContent = userData.department || '학생';
  
  updateProfileImage(userData, elements.avatar);
}

function setGuestMode() {
  const elements = {
    userName: document.getElementById('user-name'),
    userRole: document.getElementById('user-role'),
    dropdownName: document.getElementById('dropdown-user-name'),
    dropdownRole: document.getElementById('dropdown-user-role'),
    avatar: document.getElementById('user-avatar')
  };
  
  if (elements.userName) elements.userName.textContent = '게스트';
  if (elements.userRole) elements.userRole.textContent = '방문자';
  if (elements.dropdownName) elements.dropdownName.textContent = '게스트';
  if (elements.dropdownRole) elements.dropdownRole.textContent = '방문자';
  if (elements.avatar) elements.avatar.textContent = '👤';
}

function updateProfileImage(userData, avatarElement) {
  if (!avatarElement) return;
  
  if (userData.profileImageType === 'emoji') {
    avatarElement.textContent = userData.profileImage || '👤';
  } else if (userData.profileImage) {
    avatarElement.innerHTML = `<img src="${userData.profileImage}" 
      style="width:100%;height:100%;object-fit:cover;border-radius:8px;" 
      alt="프로필">`;
  } else {
    avatarElement.textContent = '👤';
  }
}

function renderStats(stats) {
  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;

  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${stats.totalBuildings}</div>
      <div class="stat-label">캠퍼스 건물</div>
      <div class="stat-change positive">
        <span>↗</span>
        <span>${stats.buildingGrowth}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.totalStudents}</div>
      <div class="stat-label">재학생 수</div>
      <div class="stat-change positive">
        <span>↗</span>
        <span>${stats.studentGrowth}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.activeServices}</div>
      <div class="stat-label">운영 서비스</div>
      <div class="stat-change positive">
        <span>↗</span>
        <span>${stats.serviceGrowth}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.todayEvents}</div>
      <div class="stat-label">오늘 일정</div>
      <div class="stat-change">
        <span>📅</span>
        <span>진행중</span>
      </div>
    </div>
  `;
}

function renderNotifications(notifications) {
  const listElement = document.getElementById('notification-list');
  const badgeElement = document.getElementById('notification-badge');
  
  if (!listElement || !badgeElement) return;

  listElement.innerHTML = '';
  let unreadCount = 0;

  notifications.forEach(notification => {
    const item = document.createElement('div');
    item.className = `notification-item ${notification.read ? '' : 'unread'}`;
    item.onclick = () => markNotificationAsRead(notification.id, item);
    
    item.innerHTML = `
      <div class="notification-meta">
        <span class="notification-category">${notification.category}</span>
        <span class="notification-time">${notification.time_ago}</span>
      </div>
      <div class="notification-content">${notification.title}</div>
      <div class="notification-summary">${notification.summary}</div>
    `;
    
    listElement.appendChild(item);
    
    if (!notification.read) {
      unreadCount++;
    }
  });

  badgeElement.textContent = unreadCount;
  
  const dotElement = document.getElementById('notification-dot');
  if (dotElement) {
    dotElement.style.display = unreadCount > 0 ? 'block' : 'none';
  }
}

function renderTodaySchedule(schedule) {
  const container = document.getElementById('timetableContent');
  if (!container) return;

  if (!schedule || schedule.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>📅 오늘은 휴일</h3>
        <p>오늘에는 수업이 없습니다</p>
        <button class="btn btn-primary" onclick="navigateToExternal('timetable.html')" 
                style="margin-top: 1rem;">
          📅 시간표 관리
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  schedule.forEach(item => {
    const div = document.createElement('div');
    div.className = `class-item class-status-${item.status}`;
    
    const statusIcon = {
      current: '🟢',
      upcoming: '🟡', 
      finished: '🔴'
    }[item.status] || '🟡';
    
    div.innerHTML = `
      <div class="class-time">
        <div class="class-time-main">${item.time_display}</div>
        <div class="class-time-remaining ${item.status}">${item.time_remaining}</div>
      </div>
      <div class="class-info">
        <div class="class-name">${item.course_name}</div>
        <div class="class-location">${item.professor} | ${item.room}</div>
      </div>
      <div class="class-status status-${item.status}">
        <span>${statusIcon}</span>
        <span>${item.status_text}</span>
      </div>
    `;
    
    container.appendChild(div);
  });
}

/**
 * ===========================================
 * 네이버 지도 초기화
 * ===========================================
 */
function initNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    showErrorFallback('naverMap', '지도를 불러올 수 없습니다');
    return;
  }

  const mapContainer = document.getElementById('naverMap');
  if (!mapContainer) return;

  try {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    const mapOptions = {
      center: yeonsung,
      zoom: 16,
      minZoom: 14,
      maxZoom: 19,
      zoomControl: false,
      logoControl: false,
      mapDataControl: false,
      scaleControl: false,
    };
    
    AppState.naverMap = new naver.maps.Map(mapContainer, mapOptions);
    
  } catch (error) {
    console.error('지도 초기화 오류:', error);
    showErrorFallback('naverMap', '지도를 불러올 수 없습니다');
  }
}

/**
 * ===========================================
 * 드롭다운 관리
 * ===========================================
 */
function showStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
    dropdown.style.pointerEvents = 'auto';
  }
}

function closeStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
    dropdown.style.pointerEvents = 'none';
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown && dropdown.classList.contains('show')) {
    closeNotificationDropdown();
  } else {
    showNotificationDropdown();
  }
}

function showNotificationDropdown() {
  closeUserDropdown();
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) dropdown.classList.add('show');
}

function closeNotificationDropdown() {
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown && dropdown.classList.contains('show')) {
    closeUserDropdown();
  } else {
    showUserDropdown();
  }
}

function showUserDropdown() {
  closeNotificationDropdown();
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.add('show');
}

function closeUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
  closeStudentServiceDropdown();
}

/**
 * ===========================================
 * 사용자 액션 처리
 * ===========================================
 */
async function handleGlobalSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const results = await response.json();
      showSearchResults(results);
    } else {
      showMessage('검색 중 오류가 발생했습니다', 'error');
    }
  } catch (error) {
    console.error('검색 오류:', error);
    showMessage('검색 기능을 사용할 수 없습니다', 'error');
  }
  
  document.getElementById('search-input').value = '';
}

async function markNotificationAsRead(notificationId, element) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    
    if (response.ok) {
      element.classList.remove('unread');
      updateNotificationBadge(-1);
    }
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
}

function updateNotificationBadge(change) {
  const badge = document.getElementById('notification-badge');
  const dot = document.getElementById('notification-dot');
  
  if (badge) {
    const currentCount = parseInt(badge.textContent) || 0;
    const newCount = Math.max(0, currentCount + change);
    badge.textContent = newCount;
    
    if (dot) {
      dot.style.display = newCount > 0 ? 'block' : 'none';
    }
  }
}

function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        window.location.href = '/login.html';
      })
      .catch(error => {
        console.error('로그아웃 실패:', error);
        window.location.href = '/login.html';
      });
  }
}

/**
 * ===========================================
 * 자동 로그아웃 관리
 * ===========================================
 */
function setupAutoLogout() {
  document.addEventListener('mousemove', resetAutoLogoutTimer);
  document.addEventListener('keypress', resetAutoLogoutTimer);
  document.addEventListener('click', resetAutoLogoutTimer);
  resetAutoLogoutTimer();
}

function resetAutoLogoutTimer() {
  if (AppState.autoLogoutTimer) {
    clearTimeout(AppState.autoLogoutTimer);
  }
  
  // 30분 후 자동 로그아웃 (설정에서 변경 가능)
  AppState.autoLogoutTimer = setTimeout(() => {
    showMessage('자동 로그아웃되었습니다', 'info');
    handleLogout();
  }, 30 * 60 * 1000);
}

/**
 * ===========================================
 * 키보드 단축키
 * ===========================================
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 입력 필드에서는 단축키 비활성화
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
      return;
    }
    
    resetAutoLogoutTimer();
    
    switch(e.key.toUpperCase()) {
      case 'F3':
        e.preventDefault();
        toggleNotifications();
        break;
      case 'F4':
        e.preventDefault();
        showContent('settings');
        break;
      default:
        break;
    }
  });
}

/**
 * ===========================================
 * 유틸리티 함수들
 * ===========================================
 */
function showMessage(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor = {
    success: 'rgba(16, 185, 129, 0.9)',
    error: 'rgba(239, 68, 68, 0.9)',
    info: 'rgba(59, 130, 246, 0.9)'
  }[type];
  
  const icon = {
    success: '✅',
    error: '❌', 
    info: 'ℹ️'
  }[type];
  
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

function createErrorFallback(message) {
  return `
    <div class="error-fallback">
      <h3>⚠️ 오류 발생</h3>
      <p>${message}</p>
    </div>
  `;
}

function showErrorFallback(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = createErrorFallback(message);
  }
}

function applyTheme() {
  const savedMode = localStorage.getItem('lightMode');
  if (savedMode === 'true') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
}
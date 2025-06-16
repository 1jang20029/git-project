// index.js

// ─────────── 전역 변수 선언 ───────────
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;

// 페이지 로드 상태 변수
let settingsLoaded = false;
let communityLoaded = false;
let lectureLoaded = false;
let noticesLoaded = false;
let buildingsLoaded = false;
let academicCalendarLoaded = false;

// 자동 로그아웃 타이머
let autoLogoutTimer = null;

// 학과 코드 ↔ 이름 매핑 객체
const departmentMap = {};

// ─────────── 외부 페이지 URL 설정 ───────────
const EXTERNAL_PAGES = {
  timetable: 'pages/list/timetable.html',      // 내 시간표 페이지
  calendar: 'pages/list/academic-calendar.html', // 학사일정 페이지  
  shuttle: 'pages/list/shuttle.html'           // 셔틀버스 페이지
};

// ─────────── 외부 페이지 이동 함수들 ───────────
function openTimetablePage() {
  console.log('내 시간표 페이지로 이동');
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.timetable;
}

function openCalendarPage() {
  console.log('학사일정 페이지로 이동');
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.calendar;
}

function openShuttlePage() {
  console.log('셔틀버스 페이지로 이동');
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.shuttle;
}

// ─────────── 개선된 드롭다운 처리 함수들 ───────────
function closeStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
    dropdown.style.pointerEvents = 'none';
  }
}

function showStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
    dropdown.style.pointerEvents = 'auto';
  }
}

// ─────────── DOM 콘텐츠 로드 완료 시 ───────────
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash + 'Content')) {
    showContent(hash);
  } else {
    showContent('home');
  }

  initializeApp();
  setupNetworkListeners();
  setupAutoLogout();
  applyKeyboardShortcuts();
  applyUserShortcuts();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
    resetAutoLogoutTimer();
  });

  const studentServices = document.getElementById('nav-student-services');
  if (studentServices) {
    let hoverTimeout;
    studentServices.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      showStudentServiceDropdown();
    });
    studentServices.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        closeStudentServiceDropdown();
      }, 150);
    });
    const dropdown = studentServices.querySelector('.dropdown-menu');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        showStudentServiceDropdown();
      });
      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          closeStudentServiceDropdown();
        }, 150);
      });
    }
  }

  setTimeout(() => {
    const dropdownItems = document.querySelectorAll('#nav-student-services .dropdown-item');
    dropdownItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log(`드롭다운 항목 ${index} 클릭됨`);
        switch(index) {
          case 0: openTimetablePage(); break;
          case 1: openCalendarPage(); break;
          case 2: openShuttlePage(); break;
        }
      });
    });
  }, 100);

  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    const ssBtn = event.target.closest('#nav-student-services');

    if (!ntBtn) closeNotificationDropdown();
    if (!upBtn) closeUserDropdown();
    if (!ssBtn) closeStudentServiceDropdown();

    resetAutoLogoutTimer();
  });
});

// ─────────── 네트워크 상태 감지 ───────────
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    isOnline = true;
    showMessage('인터넷 연결이 복구되었습니다', 'success');
    initializeApp();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    showMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다', 'error');
  });
}

// ─────────── 콘텐츠 표시: 단일 페이지 앱 전환 ───────────
function showContent(type) {
  const panes = [
    'homeContent',
    'buildingsContent',
    'communityContent',
    'lecture-reviewContent',
    'noticesContent',
    'timetableContentPane',
    'shuttleContentPane',
    'calendarContentPane',
    'academic-calendarContentPane',
    'profileContentPane',
    'settingsContent'
  ];

  panes.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 설정, 커뮤니티, 강의평가, 공지사항, 건물, 학사일정은 fetch로 동적 로드
  if (type === 'settings' && !settingsLoaded) {
    const container = document.getElementById('settingsContent');
    fetch('pages/user/settings.html')
      .then(res => {
        if (!res.ok) throw new Error('settings.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        settingsLoaded = true;
        if (window.initSettingsPage) window.initSettingsPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>설정 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  if (type === 'community' && !communityLoaded) {
    const container = document.getElementById('communityContent');
    fetch('pages/user/community.html')
      .then(res => {
        if (!res.ok) throw new Error('community.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        communityLoaded = true;
        if (window.initCommunityPage) window.initCommunityPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>커뮤니티 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  if (type === 'lecture-review' && !lectureLoaded) {
    const container = document.getElementById('lecture-reviewContent');
    fetch('pages/list/lecture-review.html')
      .then(res => {
        if (!res.ok) throw new Error('lecture-review.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        lectureLoaded = true;
        if (window.initLectureReviewPage) window.initLectureReviewPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>강의평가 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  if (type === 'notices' && !noticesLoaded) {
    const container = document.getElementById('noticesContent');
    fetch('pages/list/notices.html')
      .then(res => {
        if (!res.ok) throw new Error('notices.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        noticesLoaded = true;
        if (window.initNoticesPage) window.initNoticesPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>공지사항 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  if (type === 'buildings' && !buildingsLoaded) {
    const container = document.getElementById('buildingsContent');
    fetch('pages/list/buildings.html')
      .then(res => {
        if (!res.ok) throw new Error('buildings.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        buildingsLoaded = true;
        if (window.initBuildingsPage) window.initBuildingsPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>건물 페이지를 불러올 수 없습니다</p>
        </div>`;
      });
  }

  if (type === 'academic-calendar' && !academicCalendarLoaded) {
    const container = document.getElementById('academic-calendarContentPane');
    if (container) {
      fetch('pages/list/academic-calendar.html')
        .then(res => {
          if (!res.ok) throw new Error('academic-calendar.html 을 불러오는 중 오류 발생');
          return res.text();
        })
        .then(html => {
          container.innerHTML = html;
          academicCalendarLoaded = true;
          if (window.initAcademicCalendarPage) window.initAcademicCalendarPage();
        })
        .catch(err => {
          console.error(err);
          container.innerHTML = `<div class="error-fallback">
            <h3>⚠️ 오류 발생</h3>
            <p>학사일정 화면을 불러올 수 없습니다</p>
          </div>`;
        });
    }
  }

  const targetMap = {
    home: 'homeContent',
    buildings: 'buildingsContent',
    community: 'communityContent',
    'lecture-review': 'lecture-reviewContent',
    notices: 'noticesContent',
    timetable: 'timetableContentPane',
    shuttle: 'shuttleContentPane',
    'academic-calendar': 'academic-calendarContentPane',
    calendar: 'calendarContentPane',
    profile: 'profileContentPane',
    settings: 'settingsContent'
  };

  const targetId = targetMap[type] || 'homeContent';
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.style.display = 'block';
    targetEl.classList.add('fade-in');
  }

  document.querySelectorAll('#main-menu .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const navItem = document.getElementById('nav-' + type);
  if (navItem) navItem.classList.add('active');

  currentContent = type;
  window.location.hash = type;
}

// ─────────── 앱 초기화 ───────────
async function initializeApp() {
  try {
    await loadDepartments();
    await Promise.all([
      loadStats(),
      loadNotifications()
    ]);
    checkUserStatus();

  } catch (error) {
    console.error('앱 초기화 오류:', error);
    showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');  
  }
}

// ─────────── 학과 데이터 로드 ───────────
async function loadDepartments() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/departments');
    if (!res.ok) throw new Error('API 응답 오류');
    const list = await res.json();
    list.forEach(item => {
      departmentMap[item.code] = item.name;
    });
  } catch (err) {
    console.error('학과 데이터 로드 실패:', err);
  }
}

// ─────────── 알림 데이터 로드 ───────────
async function loadNotifications() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 응답 오류');
    const notifications = await res.json();
    renderNotifications(notifications);
  } catch (err) {
    console.error('알림 데이터 로드 실패:', err);
    renderNotifications([]);
  }
}

// ─────────── 알림 목록 렌더링 ───────────
function renderNotifications(notifications) {
  const listEl = document.getElementById('notification-list');
  const countEl = document.getElementById('notification-badge');
  if (!listEl || !countEl) return;

  listEl.innerHTML = '';
  unreadNotifications = 0;

  notifications.forEach(n => {
    if (!isCategoryEnabled(n.category)) return;
    if (!shouldShowNotification()) return;

    const item = document.createElement('div');
    item.className = 'notification-item' + (n.unread ? ' unread' : '');
    item.onclick = () => markAsRead(item, n.id, n.category);
    item.innerHTML = `
      <div class="notification-meta">
        <span class="notification-category">${n.category}</span>
        <span class="notification-time">${n.time}</span>
      </div>
      <div class="notification-content">${n.title}</div>
      <div class="notification-summary">${n.summary}</div>
    `;
    listEl.appendChild(item);
    if (n.unread) unreadNotifications++;
  });

  countEl.textContent = unreadNotifications;
  const dotEl = document.getElementById('notification-dot');
  if (dotEl) {
    dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
  }
}

// ─────────── 개별 알림 읽음 처리 ───────────
function markAsRead(el, id, category) {
  if (el.classList.contains('unread')) {
    el.classList.remove('unread');
    unreadNotifications--;
    if (isOnline) {
      fetch(`/api/notifications/${id}/read`, { method: 'POST' })
        .catch(err => console.error('알림 읽음 처리 실패:', err));
    }
    updateNotificationCount();
  }
}

// ─────────── 모든 알림 읽음 처리 ───────────
function markAllAsRead() {
  document.querySelectorAll('.notification-item.unread').forEach(item => {
    item.classList.remove('unread');
  });

  if (isOnline) {
    fetch('/api/notifications/mark-all-read', { method: 'POST' })
      .catch(err => console.error('전체 알림 읽음 처리 실패:', err));
  }

  unreadNotifications = 0;
  updateNotificationCount();
  showMessage('모든 알림을 읽음 처리했습니다.', 'success');
}

// ─────────── 알림 뱃지 갱신 ───────────
function updateNotificationCount() {
  const countEl = document.getElementById('notification-badge');
  const dotEl = document.getElementById('notification-dot');
  if (countEl) countEl.textContent = unreadNotifications;
  if (dotEl) dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

// ─────────── 통계 데이터 로드 ───────────
async function loadStats() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('API 응답 오류');
    const stats = await res.json();
    renderStats(stats);
  } catch (err) {
    console.error('통계 데이터 로드 실패:', err);
    renderStats({
      totalBuildings: 0,
      totalStudents: 0,
      activeServices: 0,
      todayEvents: 0,
      newBuildingsText: '',
      studentGrowthText: '',
      newServicesText: ''
    });
  }
}

// ─────────── 통계 데이터 렌더링 ───────────
function renderStats(stats) {
  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;

  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${stats.totalBuildings}</div>
      <div class="stat-label">캠퍼스 건물</div>
      <div class="stat-change positive">
        <span>↗</span>
        <span>${stats.newBuildingsText}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.totalStudents}</div>
      <div class="stat-label">재학생 수</div>
      <div class="stat-change positive">
        <span>↗</span>
        <span>${stats.studentGrowthText}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.activeServices}</div>
      <div class="stat-label">운영 서비스</div>
      <div class="stat-change positive">
        <span>↗</span>
        <span>${stats.newServicesText}</span>
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

// ─────────── 오류 화면 대체 표시 ───────────
function showErrorFallback(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="error-fallback">
        <h3>⚠️ 오류 발생</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

// ─────────── 알림 토글, 알림 드롭다운 열기/닫기 ───────────
function toggleNotifications() {
  const dd = document.getElementById('notification-dropdown');
  if (dd && dd.classList.contains('show')) {
    closeNotificationDropdown();
  } else {
    showNotificationDropdown();
  }
}

function showNotificationDropdown() {
  closeUserDropdown();
  const dd = document.getElementById('notification-dropdown');
  if (dd) dd.classList.add('show');
}

function closeNotificationDropdown() {
  const dd = document.getElementById('notification-dropdown');
  if (dd) dd.classList.remove('show');
}

// ─────────── 사용자 메뉴 토글, 사용자 드롭다운 열기/닫기 ───────────
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    window.location.href = 'pages/user/login.html';
    return;
  }
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

// ─────────── 모든 드롭다운 닫기 ───────────
function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
  closeStudentServiceDropdown();
}

// ─────────── 프로필 페이지 표시 ───────────
async function showProfile() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요한 서비스입니다.', 'error');
    return;
  }
  const container = document.getElementById('profileContentPane');
  if (container) {
    container.innerHTML = `
      <div style="text-align:center; padding:2rem;">
        <div class="loading-spinner"></div>
        <span style="margin-left:0.5rem;">계정 정보를 불러오는 중...</span>
      </div>
    `;
  }
  showContent('profile');
  try {
    const res = await fetch('pages/user/account-edit.html');
    if (!res.ok) throw new Error('Account 편집 화면 로드 실패');
    const html = await res.text();
    if (container) container.innerHTML = html;
  } catch (err) {
    console.error(err);
    if (container) {
      container.innerHTML = `
        <div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>계정 편집 화면을 불러올 수 없습니다</p>
        </div>
      `;
    }
    return;
  }
  checkUserStatus();
}

// ─────────── 로그아웃 처리 ───────────
function handleLogout() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentLoggedInUser');
      closeUserDropdown();
      window.location.href = 'pages/user/login.html';
    }
  } else {
    showMessage('로그인 상태가 아닙니다.', 'error');
  }
}

// ─────────── 사용자 상태 확인 ───────────
function checkUserStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl  = document.getElementById('user-name');
  const userRoleEl  = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  const avatarEl   = document.getElementById('user-avatar');
  if (currentUser && isOnline) {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then(res => {
        if (!res.ok) throw new Error('API 응답 오류');
        return res.json();
      })
      .then(user => {
        if (userNameEl) userNameEl.textContent     = user.name || '사용자';
        if (userRoleEl) userRoleEl.textContent     = departmentMap[user.department] || '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = user.name || '사용자';
        if (dropdownRoleEl) dropdownRoleEl.textContent = departmentMap[user.department] || '학생';
      })
      .catch(() => {
      });
  } else {
  }
}

// ─────────── 알림 표시 여부 확인 ───────────
function shouldShowNotification() {
  const dnd = JSON.parse(localStorage.getItem('doNotDisturb')) || { enabled: false };
  if (!dnd.enabled) return true;
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const startHM = dnd.startHour * 60 + dnd.startMinute;
  const endHM   = dnd.endHour * 60 + dnd.endMinute;
  if (startHM < endHM) {
    return !(totalMinutes >= startHM && totalMinutes < endHM);
  } else {
    return !((totalMinutes >= startHM && totalMinutes < 1440) || (totalMinutes < endHM));
  }
}

// ─────────── 카테고리 활성화 여부 확인 ───────────
function isCategoryEnabled(category) {
  const catSettings = JSON.parse(localStorage.getItem('notificationCategories')) || {};
  return catSettings[category] === true;
}

// ─────────── 자동 로그아웃 설정 및 타이머 리셋 ───────────
function setupAutoLogout() {
  document.addEventListener('mousemove', resetAutoLogoutTimer);
  document.addEventListener('keypress', resetAutoLogoutTimer);  
  document.addEventListener('click', resetAutoLogoutTimer);
  resetAutoLogoutTimer();
}

function resetAutoLogoutTimer() {
  if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
  const cfg = JSON.parse(localStorage.getItem('autoLogout')) || { enabled: false, timeoutMinutes: 0 };
  if (!cfg.enabled) return;
  const timeoutMs = cfg.timeoutMinutes * 60 * 1000;
  autoLogoutTimer = setTimeout(() => {
    localStorage.removeItem('currentLoggedInUser');
    showMessage('자동 로그아웃되었습니다', 'info');
    checkUserStatus();
    showContent('home');
  }, timeoutMs);
}

// ─────────── 키보드 단축키 적용 ───────────
function applyKeyboardShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || {
    toggleSidebar: 'F2',
    openNotifications: 'F3',
    goToSettings: 'F4'
  };
  document.addEventListener('keydown', e => {
    const targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const key = e.key.toUpperCase();
    if (key === (shortcuts.openNotifications || '').toUpperCase()) {
      e.preventDefault();
      toggleNotifications();
      return;
    }
    if (key === (shortcuts.goToSettings || '').toUpperCase()) {
      e.preventDefault();
      showContent('settings');
      return;
    }
  });
}

// ─────────── 사용자 정의 단축키 적용 ───────────
function applyUserShortcuts() {
  document.addEventListener('keydown', e => {
    const targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const pressedKey = e.key.toUpperCase();
    const userShortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || [];
    const matched = userShortcuts.find(entry => entry.key === pressedKey);
    if (!matched || !matched.name) return;
    e.preventDefault();
    const label = matched.name.toLowerCase();
    if (label.includes('공지사항')) { showContent('notices'); return; }
    if (label.includes('내 시간표') || label.includes('시간표')) { openTimetablePage(); return; }
    if (label.includes('셔틀버스') || label.includes('셔틀')) { openShuttlePage(); return; }
    if (label.includes('학사일정') || label.includes('학사')) { openCalendarPage(); return; }
    if (label.includes('프로필') || label.includes('내 계정')) { showContent('profile'); return; }
    if (label.includes('설정')) { showContent('settings'); return; }
    if (label.includes('알림')) { toggleNotifications(); return; }
    if (label.includes('로그아웃')) { handleLogout(); return; }
  });
}

// ─────────── 로컬 스토리지 이벤트 처리 ───────────
window.addEventListener('storage', event => {
  if (
    event.key === 'currentLoggedInUser' ||
    (event.key && event.key.includes('_profileImage'))
  ) {
    checkUserStatus();
  }
  if (event.key === 'lightMode') {
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode === 'true') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }
});

// ─────────── 페이지 표시 이벤트 처리 ───────────
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    checkUserStatus();
  }
  const savedMode = localStorage.getItem('lightMode');
  if (savedMode === 'true') document.body.classList.add('light-mode');
  else document.body.classList.remove('light-mode');
});

// ─────────── 시간표/셔틀/캘린더 페이지 이동 (하위 호환성) ───────────
function navigateToTimetable() { openTimetablePage(); }
function navigateToShuttle() { openShuttlePage(); }
function navigateToCalendar() { openCalendarPage(); }

// ─────────── 토스트 메시지 표시 함수 ───────────
function showMessage(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
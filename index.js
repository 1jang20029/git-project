// index.js

// ─────────── 전역 변수 선언 ───────────
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;

// 페이지 로드 상태 변수
let settingsLoaded = false;
let communityLoaded = false;
let lectureLoaded = false;
let noticesLoaded = false;
let buildingsLoaded = false;

// 자동 로그아웃 타이머
let autoLogoutTimer = null;

// 학과 코드 ↔ 이름 매핑 객체
const departmentMap = {};

// ─────────── DOMContentLoaded ───────────
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

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGlobalSearch();
      }
    });
    searchInput.addEventListener('keydown', resetAutoLogoutTimer);
  }

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

// ─────────── showContent: SPA 전환 ───────────
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
    'profileContentPane',
    'settingsContent'
  ];

  panes.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (type === 'settings' && !settingsLoaded) {
    const container = document.getElementById('settingsContent');
    fetch('settings.html')
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
    fetch('community.html')
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
    fetch('lecture-review.html')
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
    fetch('notices.html')
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
    fetch('buildings.html')
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

  const targetMap = {
    home: 'homeContent',
    buildings: 'buildingsContent',
    community: 'communityContent',
    'lecture-review': 'lecture-reviewContent',
    notices: 'noticesContent',
    timetable: 'timetableContentPane',
    shuttle: 'shuttleContentPane',
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

  if (type === 'buildings' && naverMap) {
    setTimeout(() => {
      if (naverMap.refresh) naverMap.refresh();
    }, 100);
  }
}

// ─────────── navigateToTimetable, navigateToShuttle, navigateToCalendar ───────────
function navigateToTimetable() { showContent('timetable'); }
function navigateToCalendar()  { showContent('calendar'); }
function navigateToShuttle()   { showContent('shuttle'); }

// ─────────── initializeApp: 앱 초기화 ───────────
async function initializeApp() {
  try {
    await loadDepartments();
    initNaverMap();
    await Promise.all([
      loadStats(),
      loadNotifications(),
      loadBuildingsMain(),
      loadNotices(),
      loadShuttleInfo(),
      loadLectureReviews()
    ]);
    checkUserStatus();
    updateTimetable();

    setInterval(() => {
      if (isOnline) {
        loadShuttleInfo();
        updateTimetable();
      }
    }, 60000);

  } catch (error) {
    console.error('앱 초기화 오류:', error);
    showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
  }
}

// ─────────── loadDepartments: 학과 데이터 로드 ───────────
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

// ─────────── loadNotifications: 알림 데이터 로드 ───────────
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

// ─────────── renderNotifications: 알림 목록 렌더링 ───────────
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

// ─────────── markAsRead: 개별 알림 읽음 처리 ───────────
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

// ─────────── markAllAsRead: 모든 알림 읽음 처리 ───────────
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

// ─────────── updateNotificationCount: 알림 뱃지 갱신 ───────────
function updateNotificationCount() {
  const countEl = document.getElementById('notification-badge');
  const dotEl = document.getElementById('notification-dot');
  if (countEl) countEl.textContent = unreadNotifications;
  if (dotEl) dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

// ─────────── loadStats: 통계 데이터 로드 ───────────
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

// ─────────── renderStats: 통계 데이터 렌더링 ───────────
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

// ─────────── loadBuildingsMain: 메인 페이지용 건물 데이터 로드 (대시보드 부분) ───────────
async function loadBuildingsMain() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildingsMain(buildings);
    addMapMarkers(buildings);
  } catch (err) {
    console.error('건물 데이터 로드 실패:', err);
    renderBuildingsMain([]);
    addMapMarkers([]);
  }
}

// ─────────── renderBuildingsMain: 메인 페이지용 건물 카드 렌더링 ───────────
function renderBuildingsMain(buildings) {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;

  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.onclick = () => showContent('buildings');
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" onclick="showBuildingOnMap('${b.id}')">📍 지도에서 보기</button>
        <button class="btn btn-outline" onclick="getBuildingDirections('${b.id}')">🧭 길찾기</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─────────── loadNotices: 메인 페이지용 공지사항 데이터 로드 ───────────
async function loadNotices() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 응답 오류');
    const notices = await res.json();
    renderNoticesMain(notices);
  } catch (err) {
    console.error('공지사항 데이터 로드 실패:', err);
    renderNoticesMain([]);
  }
}

// ─────────── renderNoticesMain: 메인 페이지용 최근 공지사항 렌더링 ───────────
function renderNoticesMain(notices) {
  const recentEl = document.getElementById('recentNotices');
  if (!recentEl) return;
  recentEl.innerHTML = '';
  notices.forEach((n, idx) => {
    if (idx < 2) {
      const item = document.createElement('div');
      item.className = 'notice-item';
      item.onclick = () => viewNoticeDetail(n.id);
      item.innerHTML = `
        <div class="notice-header">
          <span class="notice-category">${n.category_name || '일반'}</span>
          <span class="notice-date">${n.published_at}</span>
        </div>
        <div class="notice-title">${n.title}</div>
        <div class="notice-summary">${n.content.slice(0, 100)}…</div>
      `;
      recentEl.appendChild(item);
    }
  });
}

// ─────────── loadShuttleInfo: 셔틀버스 데이터 로드 ───────────
// ─────────── loadShuttleInfo: 셔틀버스 데이터 로드 ───────────
async function loadShuttleInfo() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/shuttle/routes');
    if (!res.ok) throw new Error('API 응답 오류');
    const routes = await res.json();
    renderShuttleRoutes(routes);
    if (routes.length > 0) selectShuttleRoute(routes[0].id, routes[0]);
  } catch (err) {
    console.error('셔틀버스 데이터 로드 실패:', err);
    renderShuttleRoutes([]);
    selectShuttleRoute(null, null);
  }
}

// ─────────── renderShuttleRoutes: 셔틀 루트 탭 렌더링 ───────────
function renderShuttleRoutes(routes) {
  const tabs = document.getElementById('shuttleRoutes');
  if (!tabs) return;

  tabs.innerHTML = '';
  routes.forEach((r, idx) => {
    const tab = document.createElement('div');
    tab.className = 'route-tab' + (idx === 0 ? ' active' : '');
    tab.onclick = () => selectShuttleRoute(r.id, r);
    tab.innerHTML = `
      <div class="route-name">${r.name}</div>
      <div class="route-desc">${r.desc}</div>
    `;
    tabs.appendChild(tab);
  });
}

// ─────────── selectShuttleRoute: 셔틀 노선 선택 및 상태 렌더링 ───────────
async function selectShuttleRoute(routeId, route) {
  try {
    document.querySelectorAll('.route-tab').forEach(tab => tab.classList.remove('active'));
    const tabs = Array.from(document.querySelectorAll('.route-tab'));
    const selectedTab = tabs.find(t => route && t.textContent.includes(route.name));
    if (selectedTab) selectedTab.classList.add('active');
    if (!route) throw new Error('유효한 노선 없음');
    renderShuttleStatus(route);
  } catch (err) {
    console.error('셔틀 노선 선택 오류:', err);
    renderShuttleStatus({ time: '--', desc: '--', status: 'stopped' });
  }
}

// ─────────── renderShuttleStatus: 셔틀 상태 렌더링 ───────────
function renderShuttleStatus(route) {
  const timeEl   = document.getElementById('shuttle-time');
  const descEl   = document.getElementById('shuttle-desc');
  const statusEl = document.getElementById('shuttleStatus');
  if (timeEl) timeEl.textContent = route.time || '--';
  if (descEl) descEl.textContent = route.desc || '--';
  if (statusEl) {
    const status = route.status === 'running' ? 'running' : 'stopped';
    statusEl.className = `status-badge status-${status}`;
    statusEl.innerHTML =
      status === 'running'
        ? '<span>🟢</span><span>운행중</span>'
        : '<span>🔴</span><span>운행종료</span>';
  }
}

// ─────────── loadLectureReviews: 메인 페이지용 강의평가 데이터 로드 ───────────
async function loadLectureReviews() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent'),
    ]);

    if (!popRes.ok || !recRes.ok) throw new Error('API 응답 오류');

    const popular = await popRes.json();
    const recent  = await recRes.json();
    renderLectureReviewsMain(popular, recent);
  } catch (err) {
    console.error('강의평가 데이터 로드 실패:', err);
    renderLectureReviewsMain([], []);
  }
}

// ─────────── renderLectureReviewsMain: 메인 페이지용 강의평가 렌더링 ───────────
function renderLectureReviewsMain(popular, recent) {
  const popEl = document.getElementById('popularReviews');
  const recEl = document.getElementById('recentReviews');
  if (!popEl || !recEl) return;

  popEl.innerHTML = '';
  recEl.innerHTML = '';

  popular.forEach(r => {
    if (!isCategoryEnabled('강의평가')) return;
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${r.category || ''}</span>
        <span class="notice-date" style="color:#f59e0b;">
          ${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
        </span>
      </div>
      <div class="notice-title">${r.title}</div>
      <div class="notice-summary">"${r.comment}"</div>
      <div style="margin-top:0.5rem; color:#3b82f6; font-size:0.9rem; font-weight:600;">
        평점: ${r.rating}/5.0 | ${departmentMap[r.department] || r.department}
      </div>
    `;
    popEl.appendChild(item);
  });

  recent.forEach(r => {
    if (!isCategoryEnabled('강의평가')) return;
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${r.category}</span>
        <span class="notice-date">${r.timeAgo}</span>
      </div>
      <div class="notice-title">${r.title}</div>
      <div class="notice-summary">"${r.comment}"</div>
      <div style="margin-top:0.5rem; color:#3b82f6; font-size:0.9rem; font-weight:600;">
        평점: ${r.rating}/5.0 | ${departmentMap[r.department] || r.department}
      </div>
    `;
    recEl.appendChild(item);
  });
}

// ─────────── initNaverMap: 네이버 지도 초기화 ───────────
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
    naverMap = new naver.maps.Map(mapContainer, mapOptions);
  } catch (error) {
    console.error('지도 초기화 오류:', error);
    showErrorFallback('naverMap', '지도를 불러올 수 없습니다');
  }
}

// ─────────── addMapMarkers: 건물 마커 추가 ───────────
function addMapMarkers(buildings) {
  if (!naverMap) return;
  try {
    mapMarkers.forEach(m => m.setMap(null));
    infoWindows.forEach(iw => iw.close());
    mapMarkers = [];
    infoWindows = [];

    buildings.forEach(b => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(b.position.lat, b.position.lng),
        map: naverMap,
        title: b.name,
      });

      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; background: #1e293b; color: white; border-radius: 8px; border: 1px solid #3b82f6;">
            <strong style="color: #3b82f6;">${b.name}</strong><br>
            <span style="color: #94a3b8;">${b.description}</span>
          </div>
        `,
        backgroundColor: 'transparent',
        borderWidth: 0,
        anchorSize: new naver.maps.Size(0, 0),
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(naverMap, marker);
      });

      mapMarkers.push(marker);
      infoWindows.push(infoWindow);
    });
  } catch (error) {
    console.error('지도 마커 추가 오류:', error);
  }
}

// ─────────── showErrorFallback: 에러 발생 시 화면 대체 ───────────
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

// ─────────── updateTimetable: 사용자 시간표 갱신 ───────────
function updateTimetable() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const contentEl = document.getElementById('timetableContent');
  if (!contentEl) return;  
  if (!currentUser) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <h3>🔒 로그인 필요</h3>
        <p>개인 시간표를 확인하려면 로그인하세요</p>
      </div>
    `;
    return;
  }
  if (!isOnline) {
    contentEl.innerHTML = `
      <div class="error-fallback">
        <h3>📶 오프라인 상태</h3>
        <p>시간표 정보를 불러올 수 없습니다</p>
      </div>
    `;
    return;
  }
  contentEl.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <span style="margin-left: 0.5rem;">시간표를 불러오는 중...</span>
    </div>
  `;
  fetch(`/api/timetable?user=${encodeURIComponent(currentUser)}`)
    .then(res => {
      if (!res.ok) throw new Error('API 응답 오류');
      return res.json();
    })
    .then(courses => {
      renderTimetable(courses);
    })
    .catch(err => {
      console.error('시간표 로드 오류:', err);
      contentEl.innerHTML = `
        <div class="empty-state">
          <h3>📅 시간표 없음</h3>
          <p>등록된 시간표가 없거나 불러올 수 없습니다</p>
        </div>
      `;
    });
}

// ─────────── renderTimetable: 오늘 시간표 렌더링 ───────────
function renderTimetable(courses) {
  const contentEl = document.getElementById('timetableContent');
  if (!contentEl) return;
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const todayCourses = [];
  courses.forEach(course => {
    course.times.forEach(time => {
      if (time.day === currentDay || (currentDay === 0 && time.day === 6)) {
        const startHour = 8 + time.start;
        const startMinute = 30;
        const startTime = startHour * 60 + startMinute;
        const endHour = 8 + time.end + 1;
        const endMinute = 20;
        const endTime = endHour * 60 + endMinute;
        let status = 'upcoming';
        let timeInfo = '';
        if (currentTime >= startTime && currentTime < endTime) {
          status = 'current';
          const remaining = endTime - currentTime;
          timeInfo = formatTimeRemaining(remaining, '종료까지');
        } else if (currentTime >= endTime) {
          status = 'finished';
          timeInfo = '수업 종료';
        } else {
          const toStart = startTime - currentTime;
          if (toStart > 0) {
            status = 'upcoming';
            timeInfo = formatTimeRemaining(toStart, '시작까지');
          } else {
            status = 'upcoming';
            timeInfo = '곧 시작';
          }
        }
        todayCourses.push({
          name: course.name,
          room: course.room,
          professor: course.professor,
          status,
          timeInfo,
          displayTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          startTime,
        });
      }
    });
  });
  todayCourses.sort((a, b) => a.startTime - b.startTime);
  if (todayCourses.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <h3>📅 오늘은 휴일</h3>
        <p>오늘은 수업이 없습니다</p>
      </div>
    `;
    return;
  }
  contentEl.innerHTML = '';
  todayCourses.forEach(ci => {
    const statusText = {
      current: '진행중',
      upcoming: '예정',
      finished: '종료',
    }[ci.status];
    const div = document.createElement('div');
    div.className = 'class-item';
    div.innerHTML = `
      <div class="class-time">
        <div class="class-time-main">${ci.displayTime}</div>
        <div class="class-time-remaining">${ci.timeInfo}</div>
      </div>
      <div class="class-info">
        <div class="class-name">${ci.name}</div>
        <div class="class-location">${ci.room || '강의실 미정'} | ${ci.professor || '교수명 미정'}</div>
      </div>
      <div class="class-status status-${ci.status}">${statusText}</div>
    `;
    contentEl.appendChild(div);
  });
}

// ─────────── formatTimeRemaining: 남은 시간 텍스트 생성 ───────────
function formatTimeRemaining(minutes, suffix) {
  if (minutes < 60) {
    return `${minutes}분 ${suffix}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remain = minutes % 60;
    if (remain === 0) {
      return `${hours}시간 ${suffix}`;
    } else {
      return `${hours}시간 ${remain}분 ${suffix}`;
    }
  }
}

// ─────────── toggleNotifications: 알림 드롭다운 토글 ───────────
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

// ─────────── toggleUserMenu: 사용자 메뉴 토글 ───────────
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    window.location.href = 'login.html';
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

// ─────────── closeAllDropdowns: 모든 드롭다운 닫기 ───────────
function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
  closeStudentServiceDropdown();
}

function closeStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) dropdown.removeAttribute('style');
}

// ─────────── showProfile: 프로필 화면 로드 ───────────
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
    const res = await fetch('account-edit.html');
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
  updateTimetable();
}

// ─────────── handleLogout: 로그아웃 처리 ───────────
function handleLogout() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentLoggedInUser');
      closeUserDropdown();
      window.location.href = 'login.html';
    }
  } else {
    showMessage('로그인 상태가 아닙니다.', 'error');
  }
}

// ─────────── handleGlobalSearch: 전역 검색 처리 ───────────
// ─────────── handleGlobalSearch: 전역 검색 처리 ───────────
async function handleGlobalSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  const keyword = input.value.trim();
  if (!keyword) {
    showMessage('검색어를 입력하세요', 'warning');
    return;
  }
  if (!isOnline) {
    showMessage('오프라인 상태에서는 검색할 수 없습니다', 'error');
    return;
  }

  try {
    input.disabled = true;
    const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
    input.disabled = false;
    if (!res.ok) throw new Error('API 응답 오류');
    const results = await res.json();
    renderSearchResults(results, keyword);
  } catch (err) {
    input.disabled = false;
    showMessage('검색 중 오류가 발생했습니다', 'error');
    renderSearchResults([], keyword);
  }
}

// ─────────── renderSearchResults: 검색 결과 렌더링 ───────────
function renderSearchResults(results, keyword) {
  const resultPane = document.getElementById('searchResultPane');
  if (!resultPane) return;
  resultPane.innerHTML = `
    <div class="search-header">
      <strong>"${keyword}"</strong> 검색 결과 (${results.length}건)
      <button class="close-btn" onclick="closeSearchResult()">✕</button>
    </div>
  `;
  if (results.length === 0) {
    resultPane.innerHTML += `<div class="empty-state">검색 결과가 없습니다.</div>`;
    resultPane.style.display = 'block';
    return;
  }
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `
      <div class="search-title">${item.title}</div>
      <div class="search-summary">${item.summary || ''}</div>
      <div class="search-meta">${item.category || ''}</div>
    `;
    div.onclick = () => {
      closeSearchResult();
      if (item.type === 'building') showContent('buildings');
      if (item.type === 'lecture') showContent('lecture-review');
      if (item.type === 'community') showContent('community');
      if (item.type === 'notice') showContent('notices');
    };
    resultPane.appendChild(div);
  });
  resultPane.style.display = 'block';
}

// ─────────── closeSearchResult: 검색 결과 닫기 ───────────
function closeSearchResult() {
  const resultPane = document.getElementById('searchResultPane');
  if (resultPane) resultPane.style.display = 'none';
}

// ─────────── showMessage: 메시지 토스트 알림 ───────────
function showMessage(msg, type = 'info', duration = 1800) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

// ─────────── checkUserStatus: 사용자 로그인 상태 표시 ───────────
function checkUserStatus() {
  const userLabel = document.getElementById('nav-username');
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!userLabel) return;
  if (currentUser) {
    userLabel.textContent = currentUser;
    userLabel.classList.remove('guest');
  } else {
    userLabel.textContent = '로그인';
    userLabel.classList.add('guest');
  }
}

// ─────────── applyKeyboardShortcuts: 단축키 바인딩 ───────────
function applyKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.altKey && !e.shiftKey && !e.ctrlKey) {
      switch (e.key) {
        case '1':
          showContent('home'); break;
        case '2':
          showContent('buildings'); break;
        case '3':
          showContent('community'); break;
        case '4':
          showContent('lecture-review'); break;
        case '5':
          showContent('notices'); break;
        default: break;
      }
    }
  });
}

// ─────────── applyUserShortcuts: 사용자 상호작용 단축키 ───────────
function applyUserShortcuts() {
  document.getElementById('nav-username')?.addEventListener('click', showProfile);
}

// ─────────── resetAutoLogoutTimer: 자동 로그아웃 타이머 초기화 ───────────
function resetAutoLogoutTimer() {
  if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
  autoLogoutTimer = setTimeout(() => {
    localStorage.removeItem('currentLoggedInUser');
    showMessage('장시간 활동이 없어 자동 로그아웃되었습니다', 'warning', 2600);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
  }, 1000 * 60 * 60); // 1시간
}

// ─────────── setupAutoLogout: 자동 로그아웃 감시 ───────────
function setupAutoLogout() {
  resetAutoLogoutTimer();
  document.addEventListener('mousemove', resetAutoLogoutTimer);
  document.addEventListener('keydown', resetAutoLogoutTimer);
  document.addEventListener('scroll', resetAutoLogoutTimer);
  document.addEventListener('click', resetAutoLogoutTimer);
}

// ─────────── isCategoryEnabled: 카테고리 표시 여부 확인 (설정 연동 가능) ───────────
function isCategoryEnabled(category) {
  // 추후 사용자 설정 연동 (ex: category 표시/숨김 설정)
  return true;
}

// ─────────── shouldShowNotification: 알림 표시 조건 (추후 연동) ───────────
function shouldShowNotification() {
  // 필터 기능 연동용, 지금은 무조건 표시
  return true;
}

// ─────────── getBuildingDirections: 길찾기 버튼 동작 ───────────
function getBuildingDirections(buildingId) {
  showMessage('네이버 지도 길찾기 기능은 준비중입니다.', 'info');
}

// ─────────── showBuildingOnMap: 지도에서 건물 위치로 이동 ───────────
function showBuildingOnMap(buildingId) {
  showContent('buildings');
  // 건물 상세 위치로 이동하는 기능은 buildings.js에서 처리하도록 위임 가능
}

// ─────────── viewNoticeDetail: 공지사항 상세 보기(준비중) ───────────
function viewNoticeDetail(noticeId) {
  showMessage('공지사항 상세보기는 준비 중입니다', 'info');
}


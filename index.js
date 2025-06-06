// =============================================================================
// index.js (메인 페이지 스크립트)
// =============================================================================

// ─────────── 맨 위: 로컬스토리지 테마(라이트/다크) 즉시 적용 ───────────
(function() {
  const savedMode = localStorage.getItem('lightMode');
  if (savedMode === 'true') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
})();

// ─────────── 전역 변수 선언 (기존 코드 유지) ───────────
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;

// 학과 코드 ↔ 이름 매핑 객체
const departmentMap = {};

// 설정 화면 로드 여부
let settingsLoaded = false;

// 자동 로그아웃 타이머 ID
let autoLogoutTimer = null;

// ─────────── 최초 로드 시 실행할 로직 ───────────
document.addEventListener('DOMContentLoaded', () => {
  // URL hash에 따라 초기 화면 결정
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash + 'Content')) {
    showContent(hash);
  } else {
    showContent('home');
  }

  initializeApp();
  setupNetworkListeners();
  setupAutoLogout();             // 자동 로그아웃 로직 초기화
  applyKeyboardShortcuts();      // 기존 키보드 단축키 로드

  // “새로 추가된 단축키”도 동작하도록 전역 리스너 추가
  applyUserShortcuts();

  // ESC 키 누르면 드롭다운 닫기
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
    resetAutoLogoutTimer(); // 키 입력이 있을 때마다 자동 로그아웃 타이머 초기화
  });

  // 검색창 Enter 키 처리
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGlobalSearch();
      }
    });
    searchInput.addEventListener('keydown', resetAutoLogoutTimer);
  }

  // 화면 바깥 클릭 시 드롭다운 닫기
  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    const ssBtn = event.target.closest('#nav-student-services');
    // 알림 드롭다운 영역 밖 클릭 시 닫기
    if (!ntBtn) closeNotificationDropdown();
    // 사용자 드롭다운 영역 밖 클릭 시 닫기
    if (!upBtn) closeUserDropdown();
    // 학생 서비스 드롭다운 영역 밖 클릭 시 닫기
    if (!ssBtn) closeStudentServiceDropdown();

    resetAutoLogoutTimer();
  });
});

// ─────────── 네트워크 상태 변화 감지 ───────────
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

// ─────────── showContent: SPA처럼 화면 전환 처리 ───────────
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

  // 모든 화면 숨김
  panes.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 보여줄 화면 결정
  let targetId = 'homeContent';
  switch (type) {
    case 'home':           targetId = 'homeContent'; break;
    case 'buildings':      targetId = 'buildingsContent'; break;
    case 'community':      targetId = 'communityContent'; break;
    case 'lecture-review': targetId = 'lecture-reviewContent'; break;
    case 'notices':        targetId = 'noticesContent'; break;
    case 'timetable':      targetId = 'timetableContentPane'; break;
    case 'shuttle':        targetId = 'shuttleContentPane'; break;
    case 'calendar':       targetId = 'calendarContentPane'; break;
    case 'profile':        targetId = 'profileContentPane'; break;
    case 'settings':       targetId = 'settingsContent'; break;
    default:               targetId = 'homeContent';
  }

  // “설정” 화면일 때, 아직 settings.html 을 삽입하지 않았다면 fetch 후 삽입
  if (type === 'settings' && !settingsLoaded) {
    const container = document.getElementById('settingsContent');
    if (container) {
      fetch('settings.html')
        .then((res) => {
          if (!res.ok) throw new Error('settings.html 을 불러오는 중 오류 발생');
          return res.text();
        })
        .then((html) => {
          container.innerHTML = html;
          settingsLoaded = true;
          // HTML 삽입 후 즉시 initSettingsPage 호출
          if (window.initSettingsPage) {
            window.initSettingsPage();
          }
        })
        .catch((err) => {
          console.error(err);
          container.innerHTML = `
            <div class="error-fallback">
              <h3>⚠️ 오류 발생</h3>
              <p>설정 화면을 불러올 수 없습니다</p>
            </div>
          `;
        });
    }
  }

  // 화면 보이기
  const target = document.getElementById(targetId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('fade-in');
  }

  // 상단 메뉴 활성화 표시
  document.querySelectorAll('#main-menu .nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  // 상단 메뉴 해당 항목 active
  const navItem = document.getElementById('nav-' + type);
  if (navItem) navItem.classList.add('active');

  currentContent = type;
  window.location.hash = type;

  // 건물 화면이면 네이버 지도 리프레시
  if (type === 'buildings' && naverMap) {
    setTimeout(() => {
      if (naverMap.refresh) naverMap.refresh();
    }, 100);
  }
}

// ─────────── initializeApp: 앱 초기화 ───────────
async function initializeApp() {
  try {
    await loadDepartments();
    initNaverMap();
    await Promise.all([
      loadStats(),
      loadNotifications(),
      loadBuildings(),
      loadNotices(),
      loadShuttleInfo(),
      loadCommunityPosts(),
      loadLectureReviews()
    ]);
    checkUserStatus();
    updateTimetable();

    // 1분마다 셔틀/시간표 갱신
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
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
    const res = await fetch('/api/departments');
    if (!res.ok) throw new Error('API 응답 오류');
    const list = await res.json();
    list.forEach((item) => {
      departmentMap[item.code] = item.name;
    });
  } catch (err) {
    console.error('학과 데이터 로드 실패:', err);
  }
}

// ─────────── loadNotifications: 알림 데이터 로드 ───────────
async function loadNotifications() {
  try {
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
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

  notifications.forEach((n) => {
    // 1) 카테고리별 수신 여부 확인
    if (!isCategoryEnabled(n.category)) {
      return; // 설정에서 해당 카테고리 알림을 껐으면 무시
    }
    // 2) Do Not Disturb 시간대에는 푸시/인앱 알림 표시하지 않기
    if (!shouldShowNotification()) {
      return;
    }

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
  document.querySelectorAll('.notification-item.unread').forEach((item) => {
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
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
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

// ─────────── loadBuildings: 건물 데이터 로드 ───────────
async function loadBuildings() {
  try {
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildings(buildings);
    addMapMarkers(buildings);
  } catch (err) {
    console.error('건물 데이터 로드 실패:', err);
    renderBuildings([]);
    addMapMarkers([]);
  }
}

// ─────────── renderBuildings: 건물 카드 렌더링 ───────────
function renderBuildings(buildings) {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;

  grid.innerHTML = '';
  buildings.forEach((b) => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" onclick="showBuildingOnMap('${b.id}')">
          📍 지도에서 보기
        </button>
        <button class="btn btn-outline" onclick="getBuildingDirections('${b.id}')">
          🧭 길찾기
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─────────── loadNotices: 공지사항 데이터 로드 ───────────
async function loadNotices() {
  try {
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
    const res = await fetch('/api/notices');
    if (!res.ok) throw new Error('API 응답 오류');
    const notices = await res.json();
    renderNotices(notices);
  } catch (err) {
    console.error('공지사항 데이터 로드 실패:', err);
    renderNotices([]);
  }
}

// ─────────── renderNotices: 공지사항 렌더링 ───────────
function renderNotices(notices) {
  const recentEl = document.getElementById('recentNotices');
  const fullEl   = document.getElementById('fullNoticeList');

  if (!recentEl || !fullEl) return;

  recentEl.innerHTML = '';
  fullEl.innerHTML   = '';

  notices.forEach((n, idx) => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.onclick = () => viewNoticeDetail(n.id);
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${n.category}</span>
        <span class="notice-date">${n.date}</span>
      </div>
      <div class="notice-title">${n.title}</div>
      <div class="notice-summary">${n.summary}</div>
    `;
    fullEl.appendChild(item.cloneNode(true));
    if (idx < 2) {
      recentEl.appendChild(item);
    }
  });
}

// ─────────── loadShuttleInfo: 셔틀버스 데이터 로드 ───────────
async function loadShuttleInfo() {
  try {
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
    const res = await fetch('/api/shuttle/routes');
    if (!res.ok) throw new Error('API 응답 오류');
    const routes = await res.json();
    renderShuttleRoutes(routes);
    if (routes.length > 0) {
      selectShuttleRoute(routes[0].id, routes[0]);
    }
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

// ─────────── selectShuttleRoute: 셔틀 루트 선택 및 상태 렌더링 ───────────
async function selectShuttleRoute(routeId, route) {
  try {
    document.querySelectorAll('.route-tab').forEach((tab) => {
      tab.classList.remove('active');
    });

    const tabs = Array.from(document.querySelectorAll('.route-tab'));
    const selectedTab = tabs.find((t) =>
      route && t.textContent.includes(route.name)
    );
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

// ─────────── loadCommunityPosts: 커뮤니티 게시글 로드 ───────────
async function loadCommunityPosts() {
  try {
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
    const [liveRes, hotRes] = await Promise.all([
      fetch('/api/community/live'),
      fetch('/api/community/hot'),
    ]);

    if (!liveRes.ok || !hotRes.ok) throw new Error('API 응답 오류');

    const livePosts = await liveRes.json();
    const hotPosts  = await hotRes.json();
    renderCommunityPosts(livePosts, hotPosts);
  } catch (err) {
    console.error('커뮤니티 데이터 로드 실패:', err);
    renderCommunityPosts([], []);
  }
}

// ─────────── renderCommunityPosts: 커뮤니티 게시글 렌더링 ───────────
function renderCommunityPosts(livePosts, hotPosts) {
  const liveEl = document.getElementById('livePosts');
  const hotEl  = document.getElementById('hotPosts');

  if (!liveEl || !hotEl) return;

  liveEl.innerHTML = '';
  hotEl.innerHTML  = '';

  livePosts.forEach((p) => {
    // 카테고리가 “커뮤니티”인 경우에도 표시 여부는 설정에서 결정
    if (!isCategoryEnabled('커뮤니티')) return;

    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${p.category}</span>
        <span class="notice-date">${p.time}</span>
      </div>
      <div class="notice-title">${p.title}</div>
      <div class="notice-summary">${p.summary}</div>
      <div style="margin-top:0.5rem; color:#94a3b8; font-size:0.8rem;">
        👍 ${p.likes || 0} 💬 ${p.comments || 0}
      </div>
    `;
    liveEl.appendChild(item);
  });

  hotPosts.forEach((p) => {
    if (!isCategoryEnabled('커뮤니티')) return;

    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${p.category}</span>
        <span class="notice-date">HOT</span>
      </div>
      <div class="notice-title">${p.title}</div>
      <div class="notice-summary">${p.summary}</div>
      <div style="margin-top:0.5rem; color:#94a3b8; font-size:0.8rem;">
        👍 ${p.likes || 0} 💬 ${p.comments || 0}
      </div>
    `;
    hotEl.appendChild(item);
  });
}

// ─────────── loadLectureReviews: 강의평가 데이터 로드 ───────────
async function loadLectureReviews() {
  try {
    if (!isOnline) {
      throw new Error('오프라인 모드');
    }
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent'),
    ]);

    if (!popRes.ok || !recRes.ok) throw new Error('API 응답 오류');

    const popular = await popRes.json();
    const recent  = await recRes.json();
    renderLectureReviews(popular, recent);
  } catch (err) {
    console.error('강의평가 데이터 로드 실패:', err);
    renderLectureReviews([], []);
  }
}

// ─────────── renderLectureReviews: 강의평가 렌더링 ───────────
function renderLectureReviews(popular, recent) {
  const popEl = document.getElementById('popularReviews');
  const recEl = document.getElementById('recentReviews');

  if (!popEl || !recEl) return;

  popular.forEach((r) => {
    if (!isCategoryEnabled('강의평가')) return;

    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${r.category}</span>
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

  recent.forEach((r) => {
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
    const yeonsung = new naver.maps.LatLng(
      37.39661657434427,
      126.90772437800818
    );
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
    mapMarkers.forEach((m) => m.setMap(null));
    infoWindows.forEach((iw) => iw.close());
    mapMarkers = [];
    infoWindows = [];

    buildings.forEach((b) => {
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
        infoWindows.forEach((iw) => iw.close());
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
    .then((res) => {
      if (!res.ok) throw new Error('API 응답 오류');
      return res.json();
    })
    .then((courses) => {
      renderTimetable(courses);
    })
    .catch((err) => {
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

  courses.forEach((course) => {
    course.times.forEach((time) => {
      // time.day가 0(일요일인 경우)일 때 특수 처리
      if (
        time.day === currentDay ||
        (currentDay === 0 && time.day === 6)
      ) {
        // start, end는 “몇 교시”인지 나타낸다
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
  todayCourses.forEach((ci) => {
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
    // 로그인하지 않은 상태에서는 로그인 페이지로 이동
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

// ─────────── closeStudentServiceDropdown: 학생 서비스 드롭다운 닫기 ───────────
function closeStudentServiceDropdown() {
  // → dropdown.style.display = 'none' 대신 inline 스타일을 제거하여
  //    CSS의 :hover 규칙에 의해 재표시될 수 있도록 수정합니다.
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.removeAttribute('style');
  }
}

// ─────────── showProfile: 프로필 화면으로 이동 ───────────
function showProfile() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    showContent('profile');
  } else {
    showMessage('로그인이 필요한 서비스입니다.', 'error');
  }
  closeUserDropdown();
}

// ─────────── handleLogout: 로그아웃 처리 ───────────
function handleLogout() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentLoggedInUser');
      // 드롭다운을 닫고 즉시 로그인 페이지로 이동
      closeUserDropdown();
      window.location.href = 'login.html';
    }
  } else {
    showMessage('로그인 상태가 아닙니다.', 'error');
  }
}

// ─────────── handleGlobalSearch: 전역 검색 처리 ───────────
async function handleGlobalSearch() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  if (!query) return;

  if (!isOnline) {
    showMessage('오프라인 상태에서는 검색을 사용할 수 없습니다', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/buildings/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      showContent('buildings');
      document.getElementById('search-input').value = '';
      return;
    }
  } catch {}

  try {
    const res = await fetch(`/api/notices/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      showContent('notices');
      document.getElementById('search-input').value = '';
      return;
    }
  } catch {}

  showMessage('검색 결과를 찾을 수 없습니다.', 'info');
}

// ─────────── checkUserStatus: 로그인 여부, 사용자 정보 업데이트 ───────────
function checkUserStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl  = document.getElementById('user-name');
  const userRoleEl  = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  const avatarEl   = document.getElementById('user-avatar');

  if (currentUser && isOnline) {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then((res) => {
        if (!res.ok) throw new Error('API 응답 오류');
        return res.json();
      })
      .then((user) => {
        if (userNameEl) userNameEl.textContent     = user.name || '사용자';
        if (userRoleEl) userRoleEl.textContent     = departmentMap[user.department] || '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = user.name || '사용자';
        if (dropdownRoleEl) dropdownRoleEl.textContent = departmentMap[user.department] || '학생';
        updateProfileImage(user);
      })
      .catch(() => {
        setGuestMode();
      });
  } else {
    setGuestMode();
  }
}

// ─────────── setGuestMode: 게스트 모드로 UI 초기화 ───────────
function setGuestMode() {
  const userNameEl    = document.getElementById('user-name');
  const userRoleEl    = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  const avatarEl      = document.getElementById('user-avatar');

  if (userNameEl) userNameEl.textContent     = '게스트';
  if (userRoleEl) userRoleEl.textContent     = '방문자';
  if (dropdownNameEl) dropdownNameEl.textContent = '게스트';
  if (dropdownRoleEl) dropdownRoleEl.textContent = '방문자';
  if (avatarEl) avatarEl.textContent         = '👤';
}

// ─────────── updateProfileImage: 사용자 프로필 이미지 적용 ───────────
function updateProfileImage(user) {
  const avatarEl = document.getElementById('user-avatar');
  if (!avatarEl) return;

  if (user.profileImageType === 'emoji') {
    avatarEl.textContent = user.profileImage || '👤';
  } else if (user.profileImage) {
    avatarEl.innerHTML = `<img src="${user.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="프로필">`;
  } else {
    avatarEl.textContent = '👤';
  }
}

// ─────────── showMessage: 화면 우측 상단 슬라이드 알림 메시지 ───────────
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

// ─────────── shouldShowNotification: DND 모드 검사 ───────────
function shouldShowNotification() {
  const dnd = JSON.parse(localStorage.getItem('doNotDisturb')) || { enabled: false };
  if (!dnd.enabled) return true;

  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const totalMinutes = hh * 60 + mm;

  const startHM = dnd.startHour * 60 + dnd.startMinute;
  const endHM   = dnd.endHour * 60 + dnd.endMinute;

  if (startHM < endHM) {
    return !(totalMinutes >= startHM && totalMinutes < endHM);
  } else {
    // 21:00 ~ 07:00 처럼 넘어가는 경우
    return !((totalMinutes >= startHM && totalMinutes < 1440) || (totalMinutes < endHM));
  }
}

// ─────────── isCategoryEnabled: 설정에서 카테고리별 알림 여부 확인 ───────────
function isCategoryEnabled(category) {
  const catSettings = JSON.parse(localStorage.getItem('notificationCategories')) || {};
  return catSettings[category] === true;
}

// ─────────── setupAutoLogout: 비활성 시 자동 로그아웃 로직 초기화 ───────────
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
    // 실제 로그아웃 처리 (예: localStorage에서 사용자 정보 제거 후 홈으로)
    localStorage.removeItem('currentLoggedInUser');
    showMessage('자동 로그아웃되었습니다', 'info');
    checkUserStatus();
    showContent('home');
  }, timeoutMs);
}

// ─────────── applyKeyboardShortcuts: 기존 키보드 단축키 로드 ───────────
function applyKeyboardShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || {
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

// ─────────── applyUserShortcuts: 사용자 정의 단축키 로컬스토리지 기반 실행 ───────────
function applyUserShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 입력 요소(focused)에서는 작동하지 않도록 무시
    const targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    resetAutoLogoutTimer(); // 키 입력이 있을 때마다 타이머 초기화
    const pressedKey = e.key.toUpperCase();
    const userShortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || [];

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

// ─────────── window 이벤트: 로컬스토리지 변경 시 사용자 상태 갱신 ───────────
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

// ─────────── window 이벤트: 페이지 복원(persisted) 시 상태 갱신 ───────────
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

// ─────────── navigateToTimetable: 내 시간표 페이지로 이동 ───────────
function navigateToTimetable() {
  showContent('timetable');
}

// ─────────── navigateToShuttle: 셔틀버스 페이지로 이동 ───────────
function navigateToShuttle() {
  showContent('shuttle');
}

// ─────────── navigateToCalendar: 학사일정 페이지로 이동 ───────────
function navigateToCalendar() {
  showContent('calendar');
}

// ─────────── zoomIn: 지도 확대 ───────────
function zoomIn() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() + 1);
  }
}

// ─────────── zoomOut: 지도 축소 ───────────
function zoomOut() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() - 1);
  }
}

// ─────────── resetMapView: 지도 초기 위치로 리셋 ───────────
function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}

// ─────────── trackUserLocation: 사용자의 현재 위치 추적 ───────────
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

// ─────────── showBuildingOnMap: 특정 건물 지도에서 보기 ───────────
function showBuildingOnMap(buildingId) {
  showContent('buildings');
  setTimeout(() => {
    if (naverMap.refresh) naverMap.refresh();
  }, 100);
}

// ─────────── getBuildingDirections: 길찾기 기능 (준비 중) ───────────
function getBuildingDirections(buildingId) {
  showMessage('길찾기 기능은 준비 중입니다', 'info', '');
}

// ─────────── viewNoticeDetail: 공지사항 상세 보기 (준비 중) ───────────
function viewNoticeDetail(noticeId) {
  showMessage('공지사항 상세보기는 준비 중입니다', 'info', '');
}

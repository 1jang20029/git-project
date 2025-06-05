// index.js (메인 페이지 스크립트)

// ─────────── 맨 위: 로컬스토리지 테마(라이트/다크) 즉시 적용 ───────────
(function() {
  const savedMode = localStorage.getItem('lightMode');
  if (savedMode === 'true') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
})();

// ─────────── 전역 변수 선언 ───────────
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
async function showContent(type) {
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

  // 프로필 화면일 때, profile-edit.html 을 동적으로 로드
  if (type === 'profile') {
    const container = document.getElementById('profileContentPane');
    // 컨테이너 내부를 비운 뒤
    container.innerHTML = '';
    // profile-edit.html fetch
    fetch('profile-edit.html')
      .then(res => {
        if (!res.ok) throw new Error('profile-edit.html 불러오기 실패');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        // CSS 및 JS 동적 로드
        if (!document.getElementById('profile-edit-css')) {
          const link = document.createElement('link');
          link.id = 'profile-edit-css';
          link.rel = 'stylesheet';
          link.href = 'profile-edit.css';
          document.head.appendChild(link);
        }
        if (!document.getElementById('profile-edit-js')) {
          const script = document.createElement('script');
          script.id = 'profile-edit-js';
          script.src = 'profile-edit.js';
          script.defer = true;
          document.body.appendChild(script);
        }
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `
          <div class="error-fallback">
            <h3>⚠️ 오류 발생</h3>
            <p>프로필 화면을 불러올 수 없습니다</p>
          </div>
        `;
      });
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
    // 인기 강의평가 / 최근 강의평가 동시에 요청
    const [popularRes, recentRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent')
    ]);

    if (!popularRes.ok || !recentRes.ok) {
      throw new Error('API 응답 오류');
    }

    const popularReviews = await popularRes.json();
    const recentReviews  = await recentRes.json();
    renderLectureReviews(popularReviews, recentReviews);
  } catch (err) {
    console.error('강의평가 데이터 로드 실패:', err);
    // 빈 배열로 렌더링
    renderLectureReviews([], []);
  }
}

// ─────────── renderLectureReviews: 강의평가 렌더링 ───────────
function renderLectureReviews(popularReviews, recentReviews) {
  const popularEl = document.getElementById('popularReviews');
  const recentEl  = document.getElementById('recentReviews');

  if (!popularEl || !recentEl) return;

  popularEl.innerHTML = '';
  recentEl.innerHTML  = '';

  // 인기 강의평가 항목 생성
  popularReviews.forEach((r) => {
    // 카테고리가 “강의평가”인 경우에도 설정에서 수신 여부 확인
    if (!isCategoryEnabled('강의평가')) return;

    const item = document.createElement('div');
    item.className = 'notice-item';
    item.onclick = () => viewReviewDetail(r.id);
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">강의평가</span>
        <span class="notice-date">${r.rating} / 5.0</span>
      </div>
      <div class="notice-title">${r.courseName} - ${r.professor}</div>
      <div class="notice-summary">${r.summary}</div>
      <div style="margin-top:0.5rem; color:#94a3b8; font-size:0.8rem;">
        👍 ${r.likes || 0} 💬 ${r.comments || 0}
      </div>
    `;
    popularEl.appendChild(item);
  });

  // 최근 강의평가 항목 생성
  recentReviews.forEach((r) => {
    if (!isCategoryEnabled('강의평가')) return;

    const item = document.createElement('div');
    item.className = 'notice-item';
    item.onclick = () => viewReviewDetail(r.id);
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">강의평가</span>
        <span class="notice-date">${r.date}</span>
      </div>
      <div class="notice-title">${r.courseName} - ${r.professor}</div>
      <div class="notice-summary">${r.summary}</div>
      <div style="margin-top:0.5rem; color:#94a3b8; font-size:0.8rem;">
        👍 ${r.likes || 0} 💬 ${r.comments || 0}
      </div>
    `;
    recentEl.appendChild(item);
  });
}

// ─────────── viewNoticeDetail: 공지사항 상세 보기 ───────────
function viewNoticeDetail(noticeId) {
  // 상세 페이지로 이동하거나 모달을 띄울 수 있습니다.
  // 예시: window.location.href = `/notices/${noticeId}`;
  alert(`공지사항 ${noticeId} 세부 정보를 불러옵니다.`);
}

// ─────────── viewReviewDetail: 강의평가 상세 보기 ───────────
function viewReviewDetail(reviewId) {
  // 상세 페이지로 이동하거나 모달을 띄울 수 있습니다.
  // 예시: window.location.href = `/reviews/${reviewId}`;
  alert(`강의평가 ${reviewId} 세부 정보를 불러옵니다.`);
}

// ─────────── showBuildingOnMap: 지도에서 건물 보기 ───────────
function showBuildingOnMap(buildingId) {
  // markers 배열에서 해당 건물 마커 찾기
  const marker = mapMarkers.find(m => m.buildingId === buildingId);
  if (marker && naverMap) {
    naverMap.setCenter(marker.getPosition());
    naverMap.setZoom(18);
    // 인포윈도우 열기
    const infoWindow = infoWindows.find(w => w.buildingId === buildingId);
    if (infoWindow) {
      infoWindow.open(naverMap, marker);
    }
  }
}

// ─────────── getBuildingDirections: 건물 길찾기 ───────────
function getBuildingDirections(buildingId) {
  // 현재 위치가 없으면 경고
  if (!userLocation) {
    showMessage('현재 위치를 먼저 확인해주세요.', 'error');
    return;
  }
  // markers 배열에서 목적지 마커 찾기
  const destMarker = mapMarkers.find(m => m.buildingId === buildingId);
  if (!destMarker) {
    showMessage('목적지 정보를 찾을 수 없습니다.', 'error');
    return;
  }

  // 길찾기 요청
  const directionsService = new naver.maps.DirectionsService();
  const directionsLayer   = new naver.maps.DirectionsRenderer({
    map: naverMap,
    preserveViewport: false,
    panel: null
  });

  directionsService.route({
    origin: userLocation,
    destination: destMarker.getPosition(),
    travelMode: naver.maps.TravelMode.WALKING
  }, (status, response) => {
    if (status === naver.maps.DirectionsStatus.OK) {
      directionsLayer.setDirections(response);
    } else {
      showMessage('길찾기를 실패했습니다.', 'error');
      console.error('Directions 오류:', status);
    }
  });
}

// ─────────── initNaverMap: 네이버 지도 초기화 ───────────
function initNaverMap() {
  const mapContainer = document.getElementById('naverMap');
  if (!mapContainer) return;

  // 기본 위치를 캠퍼스 중심 좌표로 설정
  const campusCenter = new naver.maps.LatLng(37.263573, 127.028601);

  naverMap = new naver.maps.Map(mapContainer, {
    center: campusCenter,
    zoom: 15,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT
    },
    mapTypeControl: true
  });
}

// ─────────── addMapMarkers: 건물 위치 마커 추가 ───────────
function addMapMarkers(buildings) {
  if (!naverMap) return;

  // 이전 마커 및 인포윈도우 삭제
  mapMarkers.forEach(m => m.setMap(null));
  infoWindows.forEach(w => w.close());
  mapMarkers = [];
  infoWindows = [];

  buildings.forEach((b) => {
    if (!b.latitude || !b.longitude) return;
    const position = new naver.maps.LatLng(b.latitude, b.longitude);
    const marker = new naver.maps.Marker({
      position: position,
      map: naverMap,
      title: b.name
    });
    marker.buildingId = b.id;

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding:0.5rem; max-width:200px;">
          <h4 style="margin:0 0 0.5rem 0;">${b.name}</h4>
          <p style="margin:0 0 0.5rem 0;">${b.description}</p>
          <button style="
            background:#3b82f6;
            color:#fff;
            border:none;
            padding:0.4rem 0.8rem;
            border-radius:4px;
            cursor:pointer;
            font-size:0.85rem;
          " onclick="getBuildingDirections('${b.id}')">
            길찾기
          </button>
        </div>
      `
    });
    infoWindow.buildingId = b.id;

    marker.addListener('click', () => {
      infoWindows.forEach(w => w.close());
      infoWindow.open(naverMap, marker);
    });

    mapMarkers.push(marker);
    infoWindows.push(infoWindow);
  });
}

// ─────────── zoomIn: 지도 확대 ───────────
function zoomIn() {
  if (!naverMap) return;
  const currZoom = naverMap.getZoom();
  naverMap.setZoom(currZoom + 1, true);
}

// ─────────── zoomOut: 지도 축소 ───────────
function zoomOut() {
  if (!naverMap) return;
  const currZoom = naverMap.getZoom();
  naverMap.setZoom(currZoom - 1, true);
}

// ─────────── resetMapView: 지도 초기 뷰로 재설정 ───────────
function resetMapView() {
  if (!naverMap) return;
  const campusCenter = new naver.maps.LatLng(37.263573, 127.028601);
  naverMap.setCenter(campusCenter);
  naverMap.setZoom(15);
}

// ─────────── trackUserLocation: 사용자 위치 추적 ───────────
function trackUserLocation() {
  if (!naverMap || !navigator.geolocation) {
    showMessage('위치 정보를 불러올 수 없습니다.', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latlng = new naver.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      userLocation = latlng;

      if (userMarker) {
        userMarker.setPosition(latlng);
      } else {
        userMarker = new naver.maps.Marker({
          position: latlng,
          map: naverMap,
          icon: {
            content: '<div style="background:#10b981; width:12px; height:12px; border-radius:50%; border:2px solid white;"></div>',
            size: new naver.maps.Size(16, 16),
            anchor: new naver.maps.Point(8, 8)
          }
        });
      }

      naverMap.setCenter(latlng);
      naverMap.setZoom(17);
    },
    (err) => {
      console.error('위치 정보 가져오기 실패:', err);
      showMessage('위치 정보를 사용할 수 없습니다.', 'error');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// ─────────── checkUserStatus: 로그인/비회원 상태 확인 ───────────
function checkUserStatus() {
  // 예시: 세션 또는 토큰 기반으로 사용자 상태 확인
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl  = document.getElementById('user-name');
  const userRoleEl  = document.getElementById('user-role');
  const avatarEl    = document.getElementById('user-avatar');

  if (currentUser) {
    // 로그인된 상태라면 로컬스토리지에 저장된 정보 사용
    const name = localStorage.getItem(`user_${currentUser}_name`) || '사용자';
    const role = localStorage.getItem(`user_${currentUser}_role`) || '학생';
    userNameEl.textContent = name;
    userRoleEl.textContent = role;
    // 프로필 이미지가 있으면 업데이트
    const profileImageType = localStorage.getItem(`user_${currentUser}_profileImageType`);
    const profileImage     = localStorage.getItem(`user_${currentUser}_profileImage`);
    if (profileImageType === 'emoji') {
      avatarEl.textContent = profileImage || '👤';
    } else if (profileImageType === 'image') {
      avatarEl.innerHTML = `<img src="${profileImage}" style="width:100%; height:100%; border-radius:50%;">`;
    } else {
      avatarEl.textContent = '👤';
    }
  } else {
    // 비로그인 상태
    userNameEl.textContent = '게스트';
    userRoleEl.textContent = '방문자';
    avatarEl.textContent   = '👤';
  }
}

// ─────────── updateTimetable: 오늘 시간표 갱신 ───────────
function updateTimetable() {
  const timetableEl = document.getElementById('timetableContent');
  if (!timetableEl) return;

  // 사용자 학번 또는 토큰 기반으로 API 요청할 수 있음
  fetch('/api/timetable/today')
    .then(res => {
      if (!res.ok) throw new Error('시간표 API 오류');
      return res.json();
    })
    .then((classes) => {
      timetableEl.innerHTML = '';
      if (!Array.isArray(classes) || classes.length === 0) {
        timetableEl.innerHTML = '<p style="color:#94a3b8; text-align:center;">오늘 일정이 없습니다.</p>';
        return;
      }
      classes.forEach((c) => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.innerHTML = `
          <div class="class-time">
            <div class="class-time-main">${c.startTime} - ${c.endTime}</div>
            <div class="class-time-remaining">${c.remainingText}</div>
          </div>
          <div class="class-info">
            <div class="class-name">${c.courseName}</div>
            <div class="class-location">${c.building} ${c.room}</div>
          </div>
          <div class="class-status ${
            c.status === 'current' ? 'status-current' :
            c.status === 'upcoming' ? 'status-upcoming' : 'status-finished'
          }">
            ${c.status === 'current' ? '현재 수업' :
              c.status === 'upcoming' ? '곧 시작' : '종료된 수업'}
          </div>
        `;
        timetableEl.appendChild(item);
      });
    })
    .catch((err) => {
      console.error('시간표 로드 실패:', err);
      timetableEl.innerHTML = '<p style="color:#ef4444; text-align:center;">시간표를 불러올 수 없습니다.</p>';
    });
}

// ─────────── applyKeyboardShortcuts: 기본 단축키 바인딩 ───────────
function applyKeyboardShortcuts() {
  const savedShortcuts = JSON.parse(localStorage.getItem(LS_KEY_SHORTCUTS)) || [];
  savedShortcuts.forEach((sc) => {
    if (!sc.key) return;
    window.addEventListener('keydown', (e) => {
      if (e.key.toUpperCase() === sc.key) {
        handleShortcutAction(sc.id);
      }
    });
  });
}

// ─────────── applyUserShortcuts: 사용자 정의 단축키 바인딩 ───────────
function applyUserShortcuts() {
  if (!workingSettings || !workingSettings.shortcuts) return;
  workingSettings.shortcuts.forEach((sc) => {
    if (!sc.key) return;
    window.addEventListener('keydown', (e) => {
      if (e.key.toUpperCase() === sc.key) {
        handleShortcutAction(sc.id);
      }
    });
  });
}

// ─────────── handleShortcutAction: 단축키에 따른 동작 처리 ───────────
function handleShortcutAction(actionId) {
  switch (actionId) {
    case 'shortcut-toggle-sidebar':
      // 사이드바 토글 (현재는 상단 메뉴 구조이므로 필요 없다면 비워두기)
      break;
    case 'shortcut-open-notifications':
      toggleNotifications();
      break;
    case 'shortcut-go-to-settings':
      showContent('settings');
      break;
    default:
      // 사용자 정의 ID: 화면 전환 등 직접 연결
      // 예: actionId 값이 'profile-edit' 이면 프로필 화면 열기
      if (actionId === 'shortcut-edit-profile') {
        showContent('profile');
      }
      break;
  }
}

// ─────────── isCategoryEnabled: 카테고리별 알림 수신 여부 확인 ───────────
function isCategoryEnabled(category) {
  const catSettings = workingSettings && workingSettings.categories;
  return catSettings ? catSettings[category] === true : true;
}

// ─────────── shouldShowNotification: Do Not Disturb 시간 확인 ───────────
function shouldShowNotification() {
  // 자동 로그아웃 타임아웃과는 별개로
  // Do Not Disturb (DND) 설정이 있으면 체크
  // 이 예시에서는 항상 true 반환
  return true;
}

// ─────────── setupAutoLogout: 자동 로그아웃 로직 초기화 ───────────
function setupAutoLogout() {
  const autoSettings = workingSettings && workingSettings.autoLogout;
  if (autoSettings && autoSettings.enabled) {
    resetAutoLogoutTimer();
  }
}

// ─────────── resetAutoLogoutTimer: 자동 로그아웃 타이머 리셋 ───────────
function resetAutoLogoutTimer() {
  const autoSettings = workingSettings && workingSettings.autoLogout;
  if (!autoSettings || !autoSettings.enabled) return;
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
  }
  autoLogoutTimer = setTimeout(() => {
    // 로그아웃 처리 (세션/토큰 삭제 후 로그인 페이지로 이동)
    handleLogout(true);
  }, autoSettings.timeoutMinutes * 60 * 1000);
}

// ─────────── showMessage: 화면 우측 상단 슬라이드 알림 메시지 ───────────
function showMessage(message, type = 'info') {
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

// ─────────── toggleNotifications: 알림 드롭다운 토글 ───────────
function toggleNotifications() {
  const dropdown = document.getElementById('notification-dropdown');
  if (!dropdown) return;
  dropdown.classList.toggle('show');
  // 열 때 새로운 알림 표시
  if (dropdown.classList.contains('show')) {
    unreadNotifications = 0;
    updateNotificationCount();
  }
}

// ─────────── closeNotificationDropdown: 알림 드롭다운 닫기 ───────────
function closeNotificationDropdown() {
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

// ─────────── toggleUserMenu: 사용자 드롭다운 토글 ───────────
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (!dropdown) return;
  dropdown.classList.toggle('show');
}

// ─────────── closeUserDropdown: 사용자 드롭다운 닫기 ───────────
function closeUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

// ─────────── closeStudentServiceDropdown: 학생서비스 드롭다운 닫기 ───────────
function closeStudentServiceDropdown() {
  const ssMenu = document.querySelector('#nav-student-services .dropdown-menu');
  if (ssMenu) ssMenu.style.display = 'none';
}

// ─────────── handleGlobalSearch: 검색창 엔터 처리 ───────────
function handleGlobalSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    showMessage('검색어를 입력해주세요.', 'error');
    return;
  }
  // 예시: 건물 검색 시 해당 건물 페이지로 이동
  // window.location.href = `/search?query=${encodeURIComponent(query)}`;
  alert(`"${query}" 에 대해 검색을 실행합니다.`);
}

// ─────────── navigateToTimetable: 내 시간표 화면으로 이동 ───────────
function navigateToTimetable() {
  showContent('timetable');
}

// ─────────── navigateToCalendar: 학사일정 화면으로 이동 ───────────
function navigateToCalendar() {
  showContent('calendar');
}

// ─────────── navigateToShuttle: 셔틀버스 화면으로 이동 ───────────
function navigateToShuttle() {
  showContent('shuttle');
}

// ─────────── handleLogout: 로그아웃 처리 ───────────
function handleLogout(auto = false) {
  // 로컬스토리지에 저장된 로그인 정보 제거
  localStorage.removeItem('currentLoggedInUser');
  // 다른 세션/토큰이 있다면 제거
  if (!auto) {
    alert('로그아웃되었습니다.');
  }
  window.location.href = '/login';
}


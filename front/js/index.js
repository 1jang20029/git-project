// index.js

// ─────────── HTML 인라인 스크립트 합치기 ───────────

// 모바일 햄버거 메뉴 토글
function setupMobileMenuToggle() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const mainMenu  = document.getElementById('main-menu');
  if (toggleBtn && mainMenu) {
    toggleBtn.addEventListener('click', () => {
      mainMenu.classList.toggle('mobile-open');
    });
  }
}

// 다크/라이트 모드 토글
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  const lightMode = localStorage.getItem('lightMode') === 'true';
  document.body.classList.toggle('light-mode', lightMode);
  themeToggle.checked = lightMode;

  themeToggle.addEventListener('change', (e) => {
    const isLight = e.target.checked;
    document.body.classList.toggle('light-mode', isLight);
    localStorage.setItem('lightMode', isLight);
  });
}

// ─────────── 전역 변수 선언 ───────────
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;

let settingsLoaded = false;
let communityLoaded = false;
let lectureLoaded = false;
let noticesLoaded = false;
let buildingsLoaded = false;
let academicCalendarLoaded = false;

let autoLogoutTimer = null;
const departmentMap = {};

const EXTERNAL_PAGES = {
  timetable: 'pages/list/timetable.html',
  calendar:  'pages/list/academic-calendar.html',
  shuttle:   'pages/list/shuttle.html'
};

// ─────────── 외부 페이지 이동 ───────────
function openTimetablePage() {
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.timetable;
}
function openCalendarPage() {
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.calendar;
}
function openShuttlePage() {
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.shuttle;
}

// ─────────── 학생서비스 드롭다운 ───────────
function closeStudentServiceDropdown() {
  const d = document.querySelector('#nav-student-services .dropdown-menu');
  if (d) {
    d.style.opacity = '0';
    d.style.visibility = 'hidden';
    d.style.transform = 'translateY(-10px)';
    d.style.pointerEvents = 'none';
  }
}
function showStudentServiceDropdown() {
  const d = document.querySelector('#nav-student-services .dropdown-menu');
  if (d) {
    d.style.opacity = '1';
    d.style.visibility = 'visible';
    d.style.transform = 'translateY(0)';
    d.style.pointerEvents = 'auto';
  }
}

// ─────────── DOMContentLoaded ───────────
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenuToggle();
  setupThemeToggle();

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

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAllDropdowns();
    resetAutoLogoutTimer();
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') handleGlobalSearch();
    });
    searchInput.addEventListener('keydown', resetAutoLogoutTimer);
  }

  const studentServices = document.getElementById('nav-student-services');
  if (studentServices) {
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
        showStudentServiceDropdown();
      });
      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(closeStudentServiceDropdown, 150);
      });
    }
  }

  setTimeout(() => {
    document
      .querySelectorAll('#nav-student-services .dropdown-item')
      .forEach((item, idx) => {
        item.addEventListener('click', e => {
          e.stopPropagation();
          e.preventDefault();
          if (idx === 0) openTimetablePage();
          if (idx === 1) openCalendarPage();
          if (idx === 2) openShuttlePage();
        });
      });
  }, 100);

  document.addEventListener('click', event => {
    if (!event.target.closest('#notification-btn')) closeNotificationDropdown();
    if (!event.target.closest('#user-profile'))   closeUserDropdown();
    if (!event.target.closest('#nav-student-services')) closeStudentServiceDropdown();
    resetAutoLogoutTimer();
  });
});

// ─────────── 네트워크 감지 ───────────
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    isOnline = true;
    showMessage('인터넷 연결이 복구되었습니다', 'success');
    initializeApp();
  });
  window.addEventListener('offline', () => {
    isOnline = false;
    showMessage('오프라인 상태입니다. 일부 기능 제한될 수 있습니다', 'error');
  });
}

// ─────────── SPA 전환 ───────────
function showContent(type) {
  const panes = [
    'homeContent','buildingsContent','communityContent',
    'lecture-reviewContent','noticesContent','timetableContentPane',
    'shuttleContentPane','calendarContentPane','academic-calendarContentPane',
    'profileContentPane','settingsContent'
  ];
  panes.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 최초 로드 로직
  if (type === 'settings' && !settingsLoaded) {
    fetch('pages/user/settings.html')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => {
        document.getElementById('settingsContent').innerHTML = html;
        settingsLoaded = true;
        window.initSettingsPage?.();
      })
      .catch(() => {
        document.getElementById('settingsContent').innerHTML =
          `<div class="error-fallback"><h3>⚠️ 오류</h3><p>설정 화면을 불러올 수 없습니다</p></div>`;
      });
  }
  if (type === 'community' && !communityLoaded) {
    fetch('pages/user/community.html')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => {
        document.getElementById('communityContent').innerHTML = html;
        communityLoaded = true;
        window.initCommunityPage?.();
      })
      .catch(() => {
        document.getElementById('communityContent').innerHTML =
          `<div class="error-fallback"><h3>⚠️ 오류</h3><p>커뮤니티 화면을 불러올 수 없습니다</p></div>`;
      });
  }
  if (type === 'lecture-review' && !lectureLoaded) {
    fetch('pages/list/lecture-review.html')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => {
        document.getElementById('lecture-reviewContent').innerHTML = html;
        lectureLoaded = true;
        window.initLectureReviewPage?.();
      })
      .catch(() => {
        document.getElementById('lecture-reviewContent').innerHTML =
          `<div class="error-fallback"><h3>⚠️ 오류</h3><p>강의평가 화면을 불러올 수 없습니다</p></div>`;
      });
  }
  if (type === 'notices' && !noticesLoaded) {
    fetch('pages/list/notices.html')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => {
        document.getElementById('noticesContent').innerHTML = html;
        noticesLoaded = true;
        window.initNoticesPage?.();
      })
      .catch(() => {
        document.getElementById('noticesContent').innerHTML =
          `<div class="error-fallback"><h3>⚠️ 오류</h3><p>공지사항 화면을 불러올 수 없습니다</p></div>`;
      });
  }
  if (type === 'buildings' && !buildingsLoaded) {
    fetch('pages/list/buildings.html')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => {
        document.getElementById('buildingsContent').innerHTML = html;
        buildingsLoaded = true;
        window.initBuildingsPage?.();
      })
      .catch(() => {
        document.getElementById('buildingsContent').innerHTML =
          `<div class="error-fallback"><h3>⚠️ 오류</h3><p>건물 페이지를 불러올 수 없습니다</p></div>`;
      });
  }
  if (type === 'academic-calendar' && !academicCalendarLoaded) {
    const pane = document.getElementById('academic-calendarContentPane');
    if (pane) {
      fetch('pages/list/academic-calendar.html')
        .then(r => r.ok ? r.text() : Promise.reject())
        .then(html => {
          pane.innerHTML = html;
          academicCalendarLoaded = true;
          window.initAcademicCalendarPage?.();
        })
        .catch(() => {
          pane.innerHTML =
            `<div class="error-fallback"><h3>⚠️ 오류</h3><p>학사일정 화면을 불러올 수 없습니다</p></div>`;
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

  document.querySelectorAll('#main-menu .nav-item').forEach(i => i.classList.remove('active'));
  document.getElementById('nav-' + type)?.classList.add('active');

  currentContent = type;
  window.location.hash = type;

  // **지도는 절대 건들지 마세요!**
  if ((type === 'buildings' || type === 'academic-calendar') && naverMap) {
    setTimeout(() => naverMap.refresh?.(), 100);
  }
}

// ─────────── initializeApp ───────────
async function initializeApp() {
  try {
    await loadDepartments();
    initNaverMap();  // ← 절대 건들지 마세요
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
  } catch (err) {
    console.error('앱 초기화 오류:', err);
    showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
  }
}

// ─────────── loadDepartments ───────────
async function loadDepartments() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/departments');
    if (!res.ok) throw new Error('API 오류');
    const list = await res.json();
    list.forEach(item => departmentMap[item.code] = item.name);
  } catch (err) {
    console.error('학과 로드 실패:', err);
  }
}

// ─────────── loadStats & renderStats ───────────
async function loadStats() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('API 오류');
    const stats = await res.json();
    renderStats(stats);
  } catch {
    renderStats({
      totalBuildings: 0, totalStudents: 0,
      activeServices: 0, todayEvents: 0,
      newBuildingsText: '', studentGrowthText: '',
      newServicesText: ''
    });
  }
}
function renderStats(stats) {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${stats.totalBuildings}</div>
      <div class="stat-label">캠퍼스 건물</div>
      <div class="stat-change positive">↗ ${stats.newBuildingsText}</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.totalStudents}</div>
      <div class="stat-label">재학생 수</div>
      <div class="stat-change positive">↗ ${stats.studentGrowthText}</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.activeServices}</div>
      <div class="stat-label">운영 서비스</div>
      <div class="stat-change positive">↗ ${stats.newServicesText}</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.todayEvents}</div>
      <div class="stat-label">오늘 일정</div>
      <div class="stat-change">📅 진행중</div>
    </div>
  `;
}

// ─────────── loadNotifications & renderNotifications ───────────
async function loadNotifications() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 오류');
    const noti = await res.json();
    renderNotifications(noti);
  } catch {
    renderNotifications([]);
  }
}
function renderNotifications(notifications) {
  const listEl  = document.getElementById('notification-list');
  const badgeEl = document.getElementById('notification-badge');
  if (!listEl || !badgeEl) return;
  listEl.innerHTML = '';
  unreadNotifications = 0;
  notifications.forEach(n => {
    if (!isCategoryEnabled(n.category) || !shouldShowNotification()) return;
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
  badgeEl.textContent = unreadNotifications;
  document.getElementById('notification-dot').style.display =
    unreadNotifications > 0 ? 'block' : 'none';
}
function markAsRead(el, id, cat) {
  if (el.classList.contains('unread')) {
    el.classList.remove('unread');
    unreadNotifications--;
    if (isOnline) fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    updateNotificationCount();
  }
}
function markAllAsRead() {
  document.querySelectorAll('.notification-item.unread')
    .forEach(i => i.classList.remove('unread'));
  if (isOnline) fetch('/api/notifications/mark-all-read', { method: 'POST' });
  unreadNotifications = 0;
  updateNotificationCount();
  showMessage('모든 알림을 읽음 처리했습니다.', 'success');
}
function updateNotificationCount() {
  document.getElementById('notification-badge').textContent = unreadNotifications;
  document.getElementById('notification-dot').style.display =
    unreadNotifications > 0 ? 'block' : 'none';
}

// ─────────── loadBuildingsMain & renderBuildingsMain ───────────
async function loadBuildingsMain() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 오류');
    const b = await res.json();
    renderBuildingsMain(b);
    addMapMarkers(b);
  } catch {
    renderBuildingsMain([]);
    addMapMarkers([]);
  }
}
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

// ─────────── loadNotices & renderNoticesMain ───────────
async function loadNotices() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 오류');
    const notices = await res.json();
    renderNoticesMain(notices);
  } catch {
    renderNoticesMain([]);
  }
}
function renderNoticesMain(notices) {
  const recentEl = document.getElementById('recentNotices');
  if (!recentEl) return;
  recentEl.innerHTML = '';
  notices.forEach((n, idx) => {
    if (idx < 2) {
      const div = document.createElement('div');
      div.className = 'notice-item';
      div.onclick = () => viewNoticeDetail(n.id);
      div.innerHTML = `
        <div class="notice-header">
          <span class="notice-category">${n.category_name || '일반'}</span>
          <span class="notice-date">${n.published_at}</span>
        </div>
        <div class="notice-title">${n.title}</div>
        <div class="notice-summary">${n.content.slice(0,100)}…</div>
      `;
      recentEl.appendChild(div);
    }
  });
}

// ─────────── loadShuttleInfo & renderShuttleRoutes, selectShuttleRoute, renderShuttleStatus ───────────
async function loadShuttleInfo() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/shuttle/routes');
    if (!res.ok) throw new Error('API 오류');
    const routes = await res.json();
    renderShuttleRoutes(routes);
    if (routes.length) selectShuttleRoute(routes[0].id, routes[0]);
  } catch {
    renderShuttleRoutes([]);
    selectShuttleRoute(null,null);
  }
}
function renderShuttleRoutes(routes) {
  const tabs = document.getElementById('shuttleRoutes');
  if (!tabs) return;
  tabs.innerHTML = '';
  routes.forEach((r, idx) => {
    const tab = document.createElement('div');
    tab.className = 'route-tab' + (idx===0?' active':'');
    tab.onclick = () => selectShuttleRoute(r.id, r);
    tab.innerHTML = `<div class="route-name">${r.name}</div>
                     <div class="route-desc">${r.desc}</div>`;
    tabs.appendChild(tab);
  });
}
async function selectShuttleRoute(routeId, route) {
  try {
    document.querySelectorAll('.route-tab').forEach(t => t.classList.remove('active'));
    const tabs = Array.from(document.querySelectorAll('.route-tab'));
    const sel  = tabs.find(t => route && t.textContent.includes(route.name));
    sel && sel.classList.add('active');
    if (!route) throw new Error();
    renderShuttleStatus(route);
  } catch {
    renderShuttleStatus({time:'--', desc:'--', status:'stopped'});
  }
}
function renderShuttleStatus(route) {
  const t = document.getElementById('shuttle-time');
  const d = document.getElementById('shuttle-desc');
  const s = document.getElementById('shuttleStatus');
  if (t) t.textContent = route.time || '--';
  if (d) d.textContent = route.desc || '--';
  if (s) {
    const status = route.status==='running'?'running':'stopped';
    s.className = `status-badge status-${status}`;
    s.innerHTML = status==='running'
      ? '🟢 운행중'
      : '🔴 운행종료';
  }
}

// ─────────── loadLectureReviews & renderLectureReviewsMain ───────────
async function loadLectureReviews() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent')
    ]);
    if (!popRes.ok||!recRes.ok) throw new Error();
    const popular = await popRes.json();
    const recent  = await recRes.json();
    renderLectureReviewsMain(popular, recent);
  } catch {
    renderLectureReviewsMain([],[]);
  }
}
function renderLectureReviewsMain(popular, recent) {
  const popEl = document.getElementById('popularReviews');
  const recEl = document.getElementById('recentReviews');
  if (!popEl||!recEl) return;
  popEl.innerHTML = ''; recEl.innerHTML = '';
  popular.forEach(r => {
    if (!isCategoryEnabled('강의평가')) return;
    const div = document.createElement('div');
    div.className = 'notice-item';
    div.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${r.category||''}</span>
        <span class="notice-date" style="color:#f59e0b;">
          ${'★'.repeat(r.rating)+'☆'.repeat(5-r.rating)}
        </span>
      </div>
      <div class="notice-title">${r.title}</div>
      <div class="notice-summary">"${r.comment}"</div>
      <div style="margin-top:0.5rem;color:#3b82f6;font-size:0.9rem;font-weight:600;">
        평점: ${r.rating}/5.0 | ${departmentMap[r.department]||r.department}
      </div>
    `;
    popEl.appendChild(div);
  });
  recent.forEach(r => {
    if (!isCategoryEnabled('강의평가')) return;
    const div = document.createElement('div');
    div.className = 'notice-item';
    div.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${r.category}</span>
        <span class="notice-date">${r.timeAgo}</span>
      </div>
      <div class="notice-title">${r.title}</div>
      <div class="notice-summary">"${r.comment}"</div>
      <div style="margin-top:0.5rem;color:#3b82f6;font-size:0.9rem;font-weight:600;">
        평점: ${r.rating}/5.0 | ${departmentMap[r.department]||r.department}
      </div>
    `;
    recEl.appendChild(div);
  });
}

// ─────────── initNaverMap (절대 건들지 마세요) ───────────
function initNaverMap() {
  if (typeof naver==='undefined'||!naver.maps) {
    console.error('네이버 지도 API 없음');
    showErrorFallback('naverMap','지도를 불러올 수 없습니다');
    return;
  }
  const mc = document.getElementById('naverMap');
  if (!mc) return;
  try {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    const opts = {
      center: yeonsung, zoom:16, minZoom:14, maxZoom:19,
      zoomControl:false, logoControl:false,
      mapDataControl:false, scaleControl:false
    };
    naverMap = new naver.maps.Map(mc, opts);
  } catch (err) {
    console.error('지도 초기화 오류',err);
    showErrorFallback('naverMap','지도를 불러올 수 없습니다');
  }
}
function addMapMarkers(buildings) {
  if (!naverMap) return;
  try {
    mapMarkers.forEach(m=>m.setMap(null));
    infoWindows.forEach(i=>i.close());
    mapMarkers=[]; infoWindows=[];
    buildings.forEach(b=>{
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(b.position.lat,b.position.lng),
        map: naverMap, title:b.name
      });
      const infoWindow = new naver.maps.InfoWindow({
        content:`<div style="padding:10px;background:#1e293b;color:white;border-radius:8px;border:1px solid #3b82f6;">
                    <strong style="color:#3b82f6;">${b.name}</strong><br>
                    <span style="color:#94a3b8;">${b.description}</span>
                 </div>`,
        backgroundColor:'transparent', borderWidth:0,
        anchorSize:new naver.maps.Size(0,0)
      });
      naver.maps.Event.addListener(marker,'click',()=>{
        infoWindows.forEach(iw=>iw.close());
        infoWindow.open(naverMap,marker);
      });
      mapMarkers.push(marker);
      infoWindows.push(infoWindow);
    });
  } catch (e) {
    console.error('마커 추가 오류',e);
  }
}
function showErrorFallback(id,message) {
  document.getElementById(id).innerHTML =
    `<div class="error-fallback"><h3>⚠️ 오류</h3><p>${message}</p></div>`;
}

// ─────────── 지도 조작 ───────────
function zoomIn()    { naverMap&&naverMap.setZoom(naverMap.getZoom()+1); }
function zoomOut()   { naverMap&&naverMap.setZoom(naverMap.getZoom()-1); }
function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427,126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}
function trackUserLocation() {
  if (!navigator.geolocation) {
    showMessage('위치 서비스를 지원하지 않습니다','error','');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      if (!naverMap) {
        showMessage('지도가 초기화되지 않았습니다','error','');
        return;
      }
      const userPos = new naver.maps.LatLng(
        pos.coords.latitude, pos.coords.longitude
      );
      if (userMarker) userMarker.setMap(null);
      userMarker = new naver.maps.Marker({
        position:userPos, map:naverMap,
        icon:{
          content:'<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
          anchor:new naver.maps.Point(10,10)
        }
      });
      naverMap.setCenter(userPos);
      naverMap.setZoom(17);
      showMessage('현재 위치를 찾았습니다','success','');
    },
    err=>{
      let msg='위치를 찾을 수 없습니다';
      switch(err.code){
        case err.PERMISSION_DENIED: msg='위치 권한이 거부되었습니다';break;
        case err.POSITION_UNAVAILABLE: msg='위치 정보를 사용할 수 없습니다';break;
        case err.TIMEOUT: msg='위치 요청 시간이 초과되었습니다';break;
      }
      showMessage(msg,'error','');
    }
  );
}

// ─────────── showBuildingOnMap, getBuildingDirections, viewNoticeDetail ───────────
function showBuildingOnMap(id) {
  showContent('buildings');
  setTimeout(()=>naverMap.refresh?.(),100);
}
function getBuildingDirections(id) {
  showMessage('길찾기 기능은 준비 중입니다','info','');
}
function viewNoticeDetail(id) {
  showMessage('공지사항 상세보기는 준비 중입니다','info','');
}

// ─────────── 시간표 렌더링 ───────────
function updateTimetable() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const el = document.getElementById('timetableContent');
  if (!el) return;
  if (!currentUser) {
    el.innerHTML = `
      <div class="empty-state">
        <h3>🔒 로그인 필요</h3>
        <p>개인 시간표를 확인하려면 로그인하세요</p>
      </div>
    `;
    return;
  }
  const courses = loadCoursesFromLocalStorage(currentUser);
  if (!courses || courses.length===0) {
    el.innerHTML = `
      <div class="empty-state">
        <h3>📅 시간표 없음</h3>
        <p>등록된 시간표가 없습니다.</p>
        <button class="btn btn-primary" onclick="openTimetablePage()">📅 시간표 관리</button>
      </div>
    `;
    return;
  }
  renderTimetable(courses);
}
function loadCoursesFromLocalStorage(user) {
  try {
    const now = new Date();
    let term = 1, year = now.getFullYear();
    const m = now.getMonth()+1;
    if (m>=3&&m<=6) term=1;
    else if (m>=9&&m<=12) term=2;
    else if (m<=2) { term=2; year--; }
    const ttData = localStorage.getItem(`currentTimetable_user_${user}`);
    let ttId = 1;
    if (ttData) {
      try { ttId = JSON.parse(ttData).id||1; } catch{}
    }
    const key = `courses_${year}_${term}_${ttId}_user_${user}`;
    const saved = localStorage.getItem(key);
    return saved?JSON.parse(saved):[];
  } catch(e){
    console.error('시간표 로드 오류',e);
    return [];
  }
}
function renderTimetable(courses) {
  const el = document.getElementById('timetableContent');
  if (!el) return;
  const now = new Date();
  const cd = now.getDay(), ct = now.getHours()*60+now.getMinutes();
  const today = [];
  courses.forEach(c=>{
    c.times?.forEach(ts=>{
      if (ts.day===cd && cd!==0) {
        const sh = 8+ts.start, sm=30, eh=8+ts.end+1, em=20;
        const st=sh*60+sm, et=eh*60+em;
        let status='upcoming', info='', text='';
        if (ct>=st&&ct<et) {
          status='current';
          const rem = et-ct; info=formatTimeRemaining(rem,'종료까지');
          text='수강 중';
        } else if (ct>=et) {
          status='finished'; info='수업 종료'; text='수강 종료';
        } else {
          const toStart = st-ct;
          status='upcoming';
          if (toStart>0) {
            info=formatTimeRemaining(toStart,'시작까지'); text='수강 예정';
          } else {
            info='곧 시작'; text='수강 예정';
          }
        }
        today.push({
          name:c.name,
          room:c.room||'강의실 미정',
          professor:c.professor||'교수명 미정',
          status, statusText:text, timeInfo:info,
          displayTime:`${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')} ~ ${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`,
          startTime:st, endTime:et
        });
      }
    });
  });
  today.sort((a,b)=>a.startTime-b.startTime);
  if (today.length===0) {
    const names=['일','월','화','수','목','금','토'];
    el.innerHTML = `
      <div class="empty-state">
        <h3>📅 오늘은 휴일</h3>
        <p>${names[cd]}요일에는 수업이 없습니다</p>
        <button class="btn btn-primary" onclick="openTimetablePage()">📅 시간표 관리</button>
      </div>
    `;
    return;
  }
  el.innerHTML = '';
  today.forEach(c=>{
    const div=document.createElement('div');
    div.className=`class-item class-status-${c.status}`;
    const icon = {current:'🟢',upcoming:'🟡',finished:'🔴'}[c.status];
    div.innerHTML = `
      <div class="class-time">
        <div class="class-time-main">${c.displayTime}</div>
        <div class="class-time-remaining ${c.status}">${c.timeInfo}</div>
      </div>
      <div class="class-info">
        <div class="class-name">${c.name}</div>
        <div class="class-location">${c.professor} | ${c.room}</div>
      </div>
      <div class="class-status status-${c.status}">
        <span>${icon}</span><span>${c.statusText}</span>
      </div>
    `;
    el.appendChild(div);
  });
}
function formatTimeRemaining(mins, suffix) {
  if (mins<60) return `${mins}분 ${suffix}`;
  const h = Math.floor(mins/60), r = mins%60;
  return r===0? `${h}시간 ${suffix}`:`${h}시간 ${r}분 ${suffix}`;
}

// ─────────── 알림 메시지 ───────────
function showMessage(msg, type='info', cat='') {
  if (cat && !isCategoryEnabled(cat)) return;
  if (!shouldShowNotification()) return;
  const bg = type==='success'?'rgba(16,185,129,0.9)':
             type==='error'  ?'rgba(239,68,68,0.9)':
                               'rgba(59,130,246,0.9)';
  const icon = type==='success'?'✅':type==='error'?'❌':'ℹ️';
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed; top:100px; right:20px;
    background:${bg}; color:white; padding:1rem 1.5rem;
    border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.3);
    z-index:10000; font-weight:600; backdrop-filter:blur(20px);
    border:1px solid ${bg.replace('0.9','0.3')};
    animation:slideInRight 0.3s ease-out; max-width:400px;
  `;
  notif.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;">
    <span>${icon}</span><span>${msg}</span>
  </div>`;
  document.body.appendChild(notif);
  setTimeout(()=>{
    notif.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(()=>notif.remove(),300);
  },3000);
}
function shouldShowNotification() {
  const dnd = JSON.parse(localStorage.getItem('doNotDisturb'))||{enabled:false};
  if (!dnd.enabled) return true;
  const now = new Date();
  const tm = now.getHours()*60+now.getMinutes();
  const s = dnd.startHour*60+dnd.startMinute;
  const e = dnd.endHour*60+dnd.endMinute;
  if (s<e) return !(tm>=s&&tm<e);
  return !((tm>=s&&tm<1440)||(tm<e));
}
function isCategoryEnabled(cat) {
  const cfg = JSON.parse(localStorage.getItem('notificationCategories'))||{};
  return cfg[cat]===true;
}

// ─────────── 자동 로그아웃 ───────────
function setupAutoLogout() {
  ['mousemove','keypress','click'].forEach(evt=>
    document.addEventListener(evt, resetAutoLogoutTimer)
  );
  resetAutoLogoutTimer();
}
function resetAutoLogoutTimer() {
  if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
  const cfg = JSON.parse(localStorage.getItem('autoLogout'))||{enabled:false,timeoutMinutes:0};
  if (!cfg.enabled) return;
  const ms = cfg.timeoutMinutes*60*1000;
  autoLogoutTimer = setTimeout(()=>{
    localStorage.removeItem('currentLoggedInUser');
    showMessage('자동 로그아웃되었습니다','info');
    checkUserStatus();
    showContent('home');
  }, ms);
}

// ─────────── 키보드 단축키 ───────────
function applyKeyboardShortcuts() {
  const sc = JSON.parse(localStorage.getItem('keyboardShortcuts'))||{
    toggleSidebar:'F2', openNotifications:'F3', goToSettings:'F4'
  };
  document.addEventListener('keydown', e => {
    const tg = e.target.tagName;
    if (['INPUT','TEXTAREA'].includes(tg)||e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const key = e.key.toUpperCase();
    if (key === (sc.openNotifications||'').toUpperCase()) {
      e.preventDefault(); toggleNotifications(); return;
    }
    if (key === (sc.goToSettings||'').toUpperCase()) {
      e.preventDefault(); showContent('settings'); return;
    }
  });
}
function applyUserShortcuts() {
  document.addEventListener('keydown', e => {
    const tg = e.target.tagName;
    if (['INPUT','TEXTAREA'].includes(tg)||e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const key = e.key.toUpperCase();
    const userSc = JSON.parse(localStorage.getItem('keyboardShortcuts'))||[];
    const matched = userSc.find(u => u.key === key);
    if (!matched||!matched.name) return;
    e.preventDefault();
    const lbl = matched.name.toLowerCase();
    if (lbl.includes('대시보드')) { showContent('home'); return; }
    if (lbl.includes('건물'))     { showContent('buildings'); return; }
    if (lbl.includes('커뮤니티')) { showContent('community'); return; }
    if (lbl.includes('강의평가')) { showContent('lecture-review'); return; }
    if (lbl.includes('공지사항')) { showContent('notices'); return; }
    if (lbl.includes('시간표'))     { openTimetablePage(); return; }
    if (lbl.includes('셔틀'))       { openShuttlePage(); return; }
    if (lbl.includes('학사일정'))   { openCalendarPage(); return; }
    if (lbl.includes('프로필'))     { showContent('profile'); return; }
    if (lbl.includes('설정'))       { showContent('settings'); return; }
    if (lbl.includes('알림'))       { toggleNotifications(); return; }
    if (lbl.includes('로그아웃'))   { handleLogout(); return; }
    if (lbl.includes('확대'))       { zoomIn(); return; }
    if (lbl.includes('축소'))       { zoomOut(); return; }
    if (lbl.includes('초기화'))     { resetMapView(); return; }
  });
}

// ─────────── 드롭다운 토글 ───────────
function toggleNotifications() {
  const dd = document.getElementById('notification-dropdown');
  dd?.classList.contains('show') ? closeNotificationDropdown() : showNotificationDropdown();
}
function showNotificationDropdown() {
  closeUserDropdown();
  document.getElementById('notification-dropdown')?.classList.add('show');
}
function closeNotificationDropdown() {
  document.getElementById('notification-dropdown')?.classList.remove('show');
}
function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  const curr = localStorage.getItem('currentLoggedInUser');
  if (!curr) { window.location.href='pages/user/login.html'; return; }
  dd?.classList.contains('show') ? closeUserDropdown() : showUserDropdown();
}
function showUserDropdown() {
  closeNotificationDropdown();
  document.getElementById('user-dropdown')?.classList.add('show');
}
function closeUserDropdown() {
  document.getElementById('user-dropdown')?.classList.remove('show');
}
function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
  closeStudentServiceDropdown();
}

// ─────────── 프로필 / 로그아웃 ───────────
async function showProfile() {
  const curr = localStorage.getItem('currentLoggedInUser');
  if (!curr) { showMessage('로그인이 필요한 서비스입니다.','error'); return; }
  const pane = document.getElementById('profileContentPane');
  if (pane) pane.innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <div class="loading-spinner"></div>
      <span style="margin-left:0.5rem;">계정 정보를 불러오는 중...</span>
    </div>`;
  showContent('profile');
  try {
    const res = await fetch('pages/user/account-edit.html');
    if (!res.ok) throw new Error();
    pane.innerHTML = await res.text();
  } catch {
    pane.innerHTML = `
      <div class="error-fallback">
        <h3>⚠️ 오류 발생</h3>
        <p>계정 편집 화면을 불러올 수 없습니다</p>
      </div>`;
  }
  checkUserStatus();
  updateTimetable();
}
function handleLogout() {
  const curr = localStorage.getItem('currentLoggedInUser');
  if (curr) {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentLoggedInUser');
      closeUserDropdown();
      window.location.href='pages/user/login.html';
    }
  } else {
    showMessage('로그인 상태가 아닙니다.','error');
  }
}

// ─────────── 전역 검색 ───────────
async function handleGlobalSearch() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  if (!q) return;
  if (!isOnline) { showMessage('오프라인 상태에서는 검색을 사용할 수 없습니다','error'); return; }
  try {
    let res = await fetch(`/api/buildings/search?q=${encodeURIComponent(q)}`);
    if (res.ok) { showContent('buildings'); document.getElementById('search-input').value=''; return; }
  } catch{}
  try {
    let res = await fetch(`/api/notices/search?q=${encodeURIComponent(q)}`);
    if (res.ok) { showContent('notices'); document.getElementById('search-input').value=''; return; }
  } catch{}
  showMessage('검색 결과를 찾을 수 없습니다.','info');
}

// ─────────── 로그인 상태 확인 ───────────
function checkUserStatus() {
  const curr = localStorage.getItem('currentLoggedInUser');
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  const dnEl   = document.getElementById('dropdown-user-name');
  const drEl   = document.getElementById('dropdown-user-role');
  const avEl   = document.getElementById('user-avatar');
  if (curr && isOnline) {
    fetch(`/api/users/${encodeURIComponent(curr)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => {
        nameEl.textContent     = u.name || '사용자';
        roleEl.textContent     = departmentMap[u.department] || '학생';
        dnEl.textContent       = u.name || '사용자';
        drEl.textContent       = departmentMap[u.department] || '학생';
        updateProfileImage(u);
      })
      .catch(() => setGuestMode());
  } else {
    setGuestMode();
  }
}
function setGuestMode() {
  ['user-name','user-role','dropdown-user-name','dropdown-user-role']
    .forEach(id=>document.getElementById(id).textContent='게스트');
  document.getElementById('user-avatar').textContent='👤';
}
function updateProfileImage(user) {
  const av = document.getElementById('user-avatar');
  if (!av) return;
  if (user.profileImageType==='emoji') {
    av.textContent = user.profileImage || '👤';
  } else if (user.profileImage) {
    av.innerHTML = `<img src="${user.profileImage}"
      style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="프로필">`;
  } else {
    av.textContent = '👤';
  }
}

// ─────────── storage / pageshow 이벤트 ───────────
window.addEventListener('storage', e => {
  if (e.key==='currentLoggedInUser'||(e.key&&e.key.includes('_profileImage'))) {
    checkUserStatus(); updateTimetable();
  }
  if (e.key==='lightMode') {
    const lm = localStorage.getItem('lightMode')==='true';
    document.body.classList.toggle('light-mode', lm);
  }
});
window.addEventListener('pageshow', e => {
  if (e.persisted) {
    checkUserStatus(); updateTimetable();
  }
  const lm = localStorage.getItem('lightMode')==='true';
  document.body.classList.toggle('light-mode', lm);
});

// ─────────── 하위 호환 내비게이션 ───────────
function navigateToTimetable() { openTimetablePage(); }
function navigateToShuttle()   { openShuttlePage(); }
function navigateToCalendar()  { openCalendarPage(); }

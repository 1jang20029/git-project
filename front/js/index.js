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
let academicCalendarLoaded = false;

// 자동 로그아웃 타이머
let autoLogoutTimer = null;

// 학과 코드 ↔ 이름 매핑 객체
const departmentMap = {};

// ─────────── 외부 페이지 URL 설정 ───────────
const EXTERNAL_PAGES = {
  buildings: 'buildings.html',         // 건물 & 시설 페이지
  timetable: 'timetable.html',         // 내 시간표 페이지
  calendar: 'academic-calendar.html',  // 학사일정 페이지  
  shuttle: 'shuttle.html'              // 셔틀버스 페이지
};

// ─────────── 외부 페이지 이동 함수들 ───────────
function openBuildingsPage() {
  closeAllDropdowns();
  window.location.href = EXTERNAL_PAGES.buildings;
}
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

  setupStudentServiceDropdown();
});

// ─────────── 학생서비스 드롭다운 개선 ───────────
function setupStudentServiceDropdown() {
  const ss = document.getElementById('nav-student-services');
  if (!ss) return;
  let hoverTimeout;

  const show = () => {
    const dd = ss.querySelector('.dropdown-menu');
    dd.style.opacity = '1';
    dd.style.visibility = 'visible';
    dd.style.transform = 'translateY(0)';
    dd.style.pointerEvents = 'auto';
  };
  const hide = () => {
    const dd = ss.querySelector('.dropdown-menu');
    dd.style.opacity = '0';
    dd.style.visibility = 'hidden';
    dd.style.transform = 'translateY(-10px)';
    dd.style.pointerEvents = 'none';
  };

  ss.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    show();
  });
  ss.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(hide, 150);
  });
  const dd = ss.querySelector('.dropdown-menu');
  dd.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    show();
  });
  dd.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(hide, 150);
  });

  setTimeout(() => {
    ss.querySelectorAll('.dropdown-item').forEach((item, idx) => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        switch (idx) {
          case 0: openTimetablePage(); break;
          case 1: openCalendarPage(); break;
          case 2: openShuttlePage(); break;
        }
      });
    });
  }, 100);

  document.addEventListener('click', event => {
    if (!event.target.closest('#nav-student-services .dropdown-menu')
      && !event.target.closest('#nav-student-services')
    ) {
      hide();
    }
  });
}

// ─────────── showContent: SPA 전환 ───────────
function showContent(type) {
  const panes = [
    'homeContent', 'buildingsContent', 'communityContent',
    'lecture-reviewContent', 'noticesContent',
    'timetableContentPane', 'shuttleContentPane', 'calendarContentPane',
    'academic-calendarContentPane', 'profileContentPane', 'settingsContent'
  ];
  panes.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 필요한 페이지만 한 번만 로드
  const loaders = {
    'buildings':    ['buildingsContent',    'pages/list/buildings.html',    'initBuildingsPage'],
    'community':    ['communityContent',    'pages/list/community.html',    'initCommunityPage'],
    'lecture-review':['lecture-reviewContent','pages/list/lecture-review.html','initLectureReviewPage'],
    'notices':      ['noticesContent',      'pages/list/notices.html',      'initNoticesPage'],
    'settings':     ['settingsContent',     'pages/user/settings.html',      'initSettingsPage']
  };

  if (loaders[type] && !window[type + 'Loaded']) {
    const [paneId, url, initFn] = loaders[type];
    const container = document.getElementById(paneId);
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`${url} 로드 실패`);
        return r.text();
      })
      .then(html => {
        container.innerHTML = html;
        window[type + 'Loaded'] = true;
        if (window[initFn]) window[initFn]();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `
          <div class="error-fallback">
            <h3>⚠️ 오류 발생</h3>
            <p>${type} 화면을 불러올 수 없습니다</p>
          </div>`;
      });
  }

  // 화면 표시
  const targetMap = {
    home: 'homeContent',
    buildings: 'buildingsContent',
    community: 'communityContent',
    'lecture-review': 'lecture-reviewContent',
    notices: 'noticesContent',
    timetable: 'timetableContentPane',
    shuttle: 'shuttleContentPane',
    calendar: 'calendarContentPane',
    'academic-calendar': 'academic-calendarContentPane',
    profile: 'profileContentPane',
    settings: 'settingsContent'
  };
  const targetId = targetMap[type] || 'homeContent';
  document.getElementById(targetId).style.display = 'block';

  // active nav-item
  document.querySelectorAll('#main-menu .nav-item')
    .forEach(i => i.classList.remove('active'));
  const navItem = document.getElementById('nav-' + type);
  if (navItem) navItem.classList.add('active');

  currentContent = type;
  window.location.hash = type;
}

// ─────────── initializeApp: 앱 초기화 ───────────
async function initializeApp() {
  try {
    initNaverMap();
    loadStats();
    loadNotifications();
    loadBuildingsMain();
    loadNoticesMain();
    loadShuttleInfo();
    loadLectureReviewsMain();
    checkUserStatus();
    updateTimetable();

    setInterval(() => {
      loadShuttleInfo();
      updateTimetable();
    }, 60000);
  } catch (e) {
    console.error('앱 초기화 오류:', e);
  }
}

// ─────────── 네이버 지도 초기화 ───────────
function initNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    showErrorFallback('naverMap', '지도를 불러올 수 없습니다');
    return;
  }
  const mapContainer = document.getElementById('naverMap');
  const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
  naverMap = new naver.maps.Map(mapContainer, {
    center: yeonsung, zoom: 16, minZoom: 14, maxZoom: 19,
    zoomControl: false, logoControl: false, scaleControl: false
  });
}

// ─────────── loadStats: 통계 ───────────
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = res.ok ? await res.json() : {};
    renderStats(stats);
  } catch (e) {
    console.error('통계 로드 실패:', e);
  }
}
function renderStats(s) {
  const g = document.getElementById('statsGrid');
  g.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${s.totalBuildings||0}</div>
      <div class="stat-label">캠퍼스 건물</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.totalStudents||0}</div>
      <div class="stat-label">재학생 수</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.activeServices||0}</div>
      <div class="stat-label">운영 서비스</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.todayEvents||0}</div>
      <div class="stat-label">오늘 일정</div>
    </div>
  `;
}

// ─────────── loadNotifications & renderNotifications ───────────
async function loadNotifications() {
  try {
    const res = await fetch('/api/notifications');
    const list = res.ok ? await res.json() : [];
    renderNotifications(list);
  } catch (e) {
    console.error('알림 로드 실패:', e);
  }
}
function renderNotifications(list) {
  const ul = document.getElementById('notification-list');
  const badge = document.getElementById('notification-badge');
  ul.innerHTML = '';
  let cnt = 0;
  list.forEach(n => {
    if (!isCategoryEnabled(n.category) || !shouldShowNotification()) return;
    const div = document.createElement('div');
    div.className = 'notification-item' + (n.unread ? ' unread' : '');
    div.onclick = () => markAsRead(div, n.id, n.category);
    div.innerHTML = `
      <div class="notification-meta">
        <span class="notification-category">${n.category}</span>
        <span class="notification-time">${n.time}</span>
      </div>
      <div class="notification-content">${n.title}</div>
      <div class="notification-summary">${n.summary}</div>
    `;
    ul.appendChild(div);
    if (n.unread) cnt++;
  });
  badge.textContent = cnt;
  document.getElementById('notification-dot').style.display = cnt > 0 ? 'block' : 'none';
}
function markAsRead(el, id, category) {
  if (!el.classList.contains('unread')) return;
  el.classList.remove('unread');
  if (isOnline) {
    fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
  }
  const badge = document.getElementById('notification-badge');
  badge.textContent = parseInt(badge.textContent||0,10) - 1;
}
function markAllAsRead() {
  document.querySelectorAll('.notification-item.unread').forEach(item => item.classList.remove('unread'));
  if (isOnline) {
    fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {});
  }
  unreadNotifications = 0;
  updateNotificationCount();
  showMessage('모든 알림을 읽음 처리했습니다.', 'success');
}
function updateNotificationCount() {
  const badge = document.getElementById('notification-badge');
  const dotEl = document.getElementById('notification-dot');
  const cnt = document.querySelectorAll('.notification-item.unread').length;
  badge.textContent = cnt;
  dotEl.style.display = cnt > 0 ? 'block' : 'none';
}

// ─────────── loadBuildingsMain & renderBuildingsMain ───────────
async function loadBuildingsMain() {
  try {
    const res = await fetch('/api/buildings');
    const arr = res.ok ? await res.json() : [];
    renderBuildingsMain(arr);
  } catch (e) {
    console.error('건물 로드 실패:', e);
  }
}
function renderBuildingsMain(buildings) {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;
  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.onclick = () => openBuildingsPage();
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" onclick="event.stopPropagation(); openBuildingsPage();">📍 지도에서 보기</button>
        <button class="btn btn-outline" onclick="event.stopPropagation(); openBuildingsPage();">🧭 길찾기</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─────────── loadNoticesMain & renderNoticesMain ───────────
async function loadNoticesMain() {
  try {
    const res = await fetch('/api/notifications');
    const arr = res.ok ? await res.json() : [];
    renderNoticesMain(arr);
  } catch (e) {
    console.error('공지사항 로드 실패:', e);
  }
}
function renderNoticesMain(notices) {
  const c = document.getElementById('recentNotices');
  if (!c) return;
  c.innerHTML = '';
  notices.slice(0,2).forEach(n => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.onclick = () => showMessage('공지사항 상세보기는 준비 중입니다', 'info');
    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${n.category_name||'일반'}</span>
        <span class="notice-date">${n.published_at}</span>
      </div>
      <div class="notice-title">${n.title}</div>
      <div class="notice-summary">${n.content.slice(0,100)}…</div>
    `;
    c.appendChild(item);
  });
}

// ─────────── loadShuttleInfo & renderShuttle ───────────
async function loadShuttleInfo() {
  try {
    const res = await fetch('/api/shuttle/routes');
    const routes = res.ok ? await res.json() : [];
    renderShuttleRoutes(routes);
    if (routes[0]) selectShuttleRoute(routes[0].id, routes[0]);
  } catch (e) {
    console.error('셔틀 로드 실패:', e);
  }
}
function renderShuttleRoutes(routes) {
  const tabs = document.getElementById('shuttleRoutes');
  if (!tabs) return;
  tabs.innerHTML = '';
  routes.forEach((r,i) => {
    const t = document.createElement('div');
    t.className = 'route-tab'+(i===0?' active':'');
    t.onclick = () => selectShuttleRoute(r.id,r);
    t.innerHTML = `<div class="route-name">${r.name}</div><div class="route-desc">${r.desc}</div>`;
    tabs.appendChild(t);
  });
}
function selectShuttleRoute(id,route) {
  document.querySelectorAll('.route-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.route-tab').forEach(t=>{
    if (t.textContent.includes(route.name)) t.classList.add('active');
  });
  renderShuttleStatus(route);
}
function renderShuttleStatus(r) {
  document.getElementById('shuttle-time').textContent = r.time||'--';
  document.getElementById('shuttle-desc').textContent = r.desc||'--';
  const st = document.getElementById('shuttleStatus');
  st.className = 'status-badge status-'+(r.status==='running'?'running':'stopped');
  st.innerHTML = r.status==='running'
    ? '<span>🟢</span><span>운행중</span>'
    : '<span>🔴</span><span>운행종료</span>';
}

// ─────────── loadLectureReviewsMain & renderLectureReviewsMain ───────────
async function loadLectureReviewsMain() {
  try {
    const [pRes,rRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent')
    ]);
    const pop = pRes.ok ? await pRes.json() : [];
    const rec = rRes.ok ? await rRes.json() : [];
    renderLectureReviewsMain(pop,rec);
  } catch (e) {
    console.error('강의평가 로드 실패:', e);
  }
}
function renderLectureReviewsMain(pop, rec) {
  const pEl = document.getElementById('popularReviews');
  const rEl = document.getElementById('recentReviews');
  if (pEl) pEl.innerHTML = '';
  if (rEl) rEl.innerHTML = '';
  pop.forEach(r => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
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
    pEl.appendChild(item);
  });
  rec.forEach(r => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
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
    rEl.appendChild(item);
  });
}

// ─────────── updateTimetable ───────────
function updateTimetable() {
  const user = localStorage.getItem('currentLoggedInUser');
  const el = document.getElementById('timetableContent');
  if (!user) {
    el.innerHTML = `
      <div class="empty-state">
        <h3>🔒 로그인 필요</h3>
        <p>개인 시간표를 확인하려면 로그인하세요</p>
      </div>`;
    return;
  }
  const coursesKey = `courses_${new Date().getFullYear()}_${(new Date().getMonth()>=8?2:(new Date().getMonth()>=2?1:2))}_user_${user}`;
  const courses = JSON.parse(localStorage.getItem(coursesKey)||'[]');
  if (!courses.length) {
    el.innerHTML = `
      <div class="empty-state">
        <h3>📅 시간표 없음</h3>
        <p>등록된 시간표가 없습니다. 시간표 페이지에서 과목을 추가해보세요</p>
        <button class="btn btn-primary" onclick="openTimetablePage()">📅 시간표 관리</button>
      </div>`;
    return;
  }

  // 오늘 수업만 필터링
  const now = new Date();
  const day = now.getDay(); // 1=월 ... 6=토
  const minutesNow = now.getHours()*60 + now.getMinutes();
  const today = [];
  courses.forEach(course => {
    if (!course.times) return;
    course.times.forEach(ts => {
      if (ts.day === day) {
        const start = (8+ts.start)*60 + 30;
        const end = (8+ts.end+1)*60 + 20;
        let status = 'upcoming', info='', text='';
        if (minutesNow < start) {
          status = 'upcoming'; info = formatTimeRemaining(start-minutesNow,'시작까지'); text='수강 예정';
        } else if (minutesNow < end) {
          status = 'current'; info = formatTimeRemaining(end-minutesNow,'종료까지'); text='수강 중';
        } else {
          status = 'finished'; info='수업 종료'; text='수강 종료';
        }
        today.push({
          name: course.name,
          prof: course.professor||'교수 미정',
          room: course.room||'강의실 미정',
          status, info, text,
          display: `${String(8+ts.start).padStart(2,'0')}:30 ~ ${String(8+ts.end+1).padStart(2,'0')}:20`
        });
      }
    });
  });

  today.sort((a,b) => {
    const aMin = parseInt(a.display.split(':')[0],10)*60+parseInt(a.display.split(':')[1],10);
    const bMin = parseInt(b.display.split(':')[0],10)*60+parseInt(b.display.split(':')[1],10);
    return aMin - bMin;
  });

  if (!today.length) {
    const names = ['일','월','화','수','목','금','토'];
    el.innerHTML = `
      <div class="empty-state">
        <h3>📅 오늘은 휴일</h3>
        <p>${names[day]}요일에는 수업이 없습니다</p>
        <button class="btn btn-primary" onclick="openTimetablePage()">📅 시간표 관리</button>
      </div>`;
    return;
  }

  el.innerHTML = '';
  today.forEach(c => {
    const d = document.createElement('div');
    d.className = `class-item class-status-${c.status}`;
    const icon = c.status==='current'?'🟢':c.status==='upcoming'?'🟡':'🔴';
    d.innerHTML = `
      <div class="class-time">
        <div class="class-time-main">${c.display}</div>
        <div class="class-time-remaining">${c.info}</div>
      </div>
      <div class="class-info">
        <div class="class-name">${c.name}</div>
        <div class="class-location">${c.prof} | ${c.room}</div>
      </div>
      <div class="class-status">
        <span>${icon}</span><span>${c.text}</span>
      </div>
    `;
    el.appendChild(d);
  });
}

// ─────────── formatTimeRemaining ───────────
function formatTimeRemaining(mins, suffix) {
  if (mins < 60) return `${mins}분 ${suffix}`;
  const h = Math.floor(mins/60), m=mins%60;
  return m===0? `${h}시간 ${suffix}` : `${h}시간 ${m}분 ${suffix}`;
}

// ─────────── toggleNotifications ───────────
function toggleNotifications() {
  const dd = document.getElementById('notification-dropdown');
  if (dd.classList.contains('show')) closeNotificationDropdown();
  else showNotificationDropdown();
}
function showNotificationDropdown() {
  closeUserDropdown();
  document.getElementById('notification-dropdown').classList.add('show');
}
function closeNotificationDropdown() {
  document.getElementById('notification-dropdown').classList.remove('show');
}

// ─────────── toggleUserMenu ───────────
function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  const usr = localStorage.getItem('currentLoggedInUser');
  if (!usr) { window.location.href='pages/user/login.html'; return; }
  if (dd.classList.contains('show')) closeUserDropdown();
  else showUserDropdown();
}
function showUserDropdown() {
  closeNotificationDropdown();
  document.getElementById('user-dropdown').classList.add('show');
}
function closeUserDropdown() {
  document.getElementById('user-dropdown').classList.remove('show');
}
function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
}

// ─────────── showProfile ───────────
async function showProfile() {
  const usr = localStorage.getItem('currentLoggedInUser');
  if (!usr) { showMessage('로그인이 필요한 서비스입니다.','error'); return; }
  const cont = document.getElementById('profileContentPane');
  cont.innerHTML = `<div style="text-align:center;padding:2rem;"><div class="loading-spinner"></div><span style="margin-left:0.5rem;">계정 정보를 불러오는 중...</span></div>`;
  showContent('profile');
  try {
    const res = await fetch('pages/user/account-edit.html');
    if (!res.ok) throw new Error();
    cont.innerHTML = await res.text();
  } catch {
    cont.innerHTML = `<div class="error-fallback"><h3>⚠️ 오류 발생</h3><p>계정 편집 화면을 불러올 수 없습니다</p></div>`;
  }
  checkUserStatus();
  updateTimetable();
}

// ─────────── handleLogout ───────────
function handleLogout() {
  const usr = localStorage.getItem('currentLoggedInUser');
  if (usr && confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem('currentLoggedInUser');
    closeUserDropdown();
    window.location.href = 'pages/user/login.html';
  }
}

// ─────────── handleGlobalSearch ───────────
async function handleGlobalSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  showMessage('검색 기능은 준비 중입니다.', 'info');
}

// ─────────── checkUserStatus ───────────
function checkUserStatus() {
  const usr = localStorage.getItem('currentLoggedInUser');
  const nmEl = document.getElementById('user-name');
  const rlEl = document.getElementById('user-role');
  const dmEl = document.getElementById('dropdown-user-name');
  const drEl = document.getElementById('dropdown-user-role');
  const avEl = document.getElementById('user-avatar');
  if (usr) {
    const data = JSON.parse(localStorage.getItem(`user_${usr}`)||'{}');
    nmEl.textContent = data.name||'사용자';
    rlEl.textContent = departmentMap[data.department]||data.department||'학생';
    dmEl.textContent = nmEl.textContent;
    drEl.textContent = rlEl.textContent;
    updateProfileImage(data);
  } else {
    nmEl.textContent='게스트'; rlEl.textContent='방문자';
    dmEl.textContent='게스트'; drEl.textContent='방문자';
    avEl.textContent='👤';
  }
}

// ─────────── updateProfileImage ───────────
function updateProfileImage(user) {
  const av = document.getElementById('user-avatar');
  if (user.profileImageType==='emoji') {
    av.textContent = user.profileImage||'👤';
  } else if (user.profileImage) {
    av.innerHTML = `<img src="${user.profileImage}" alt="프로필" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
  } else {
    av.textContent='👤';
  }
}

// ─────────── showMessage ───────────
function showMessage(message, type='info', category='') {
  if (category && !isCategoryEnabled(category)) return;
  if (!shouldShowNotification()) return;
  const notification = document.createElement('div');
  const bg = type==='success'?'rgba(16,185,129,0.9)':type==='error'?'rgba(239,68,68,0.9)':'rgba(59,130,246,0.9)';
  const icon = type==='success'?'✅':type==='error'?'❌':'ℹ️';
  notification.style.cssText = `
    position:fixed;top:100px;right:20px;
    background:${bg};color:#fff;padding:1rem 1.5rem;
    border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);
    z-index:10000;font-weight:600;backdrop-filter:blur(20px);
    border:1px solid ${bg.replace('0.9','0.3')};
    animation:slideInRight 0.3s ease-out;max-width:400px;
  `;
  notification.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;"><span>${icon}</span><span>${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation='slideOutRight 0.3s ease-in';
    setTimeout(()=>notification.remove(),300);
  },3000);
}

// ─────────── shouldShowNotification ───────────
function shouldShowNotification() {
  const dnd = JSON.parse(localStorage.getItem('doNotDisturb')||'{"enabled":false}');
  if (!dnd.enabled) return true;
  const now = new Date();
  const total = now.getHours()*60 + now.getMinutes();
  const start = dnd.startHour*60 + dnd.startMinute;
  const end = dnd.endHour*60 + dnd.endMinute;
  if (start < end) return !(total>=start && total<end);
  return !((total>=start && total<1440) || (total<end));
}

// ─────────── isCategoryEnabled ───────────
function isCategoryEnabled(cat) {
  const cats = JSON.parse(localStorage.getItem('notificationCategories')||'{}');
  return cats[cat] === true;
}

// ─────────── setupNetworkListeners ───────────
function setupNetworkListeners() {
  window.addEventListener('online', () => { isOnline=true; showMessage('인터넷 연결이 복구되었습니다','success'); initializeApp(); });
  window.addEventListener('offline', () => { isOnline=false; showMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한됩니다','error'); });
}

// ─────────── setupAutoLogout ───────────
function setupAutoLogout() {
  ['mousemove','keypress','click'].forEach(evt => document.addEventListener(evt, resetAutoLogoutTimer));
  resetAutoLogoutTimer();
}
function resetAutoLogoutTimer() {
  if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
  const cfg = JSON.parse(localStorage.getItem('autoLogout')||'{"enabled":false,"timeoutMinutes":0}');
  if (!cfg.enabled) return;
  const ms = cfg.timeoutMinutes * 60000;
  autoLogoutTimer = setTimeout(() => {
    localStorage.removeItem('currentLoggedInUser');
    showMessage('자동 로그아웃되었습니다','info');
    checkUserStatus();
    showContent('home');
  }, ms);
}

// ─────────── applyKeyboardShortcuts ───────────
function applyKeyboardShortcuts() {
  const sc = JSON.parse(localStorage.getItem('keyboardShortcuts')||'{}');
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const key = e.key.toUpperCase();
    if (key === (sc.openNotifications||'').toUpperCase()) { e.preventDefault(); toggleNotifications(); }
    if (key === (sc.goToSettings||'').toUpperCase()) { e.preventDefault(); showContent('settings'); }
  });
}

// ─────────── applyUserShortcuts ───────────
function applyUserShortcuts() {
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const key = e.key.toUpperCase();
    const us = JSON.parse(localStorage.getItem('keyboardShortcuts')||'[]');
    const m = us.find(u => u.key === key);
    if (!m||!m.name) return;
    e.preventDefault();
    const lbl = m.name.toLowerCase();
    if (lbl.includes('대시보드')) showContent('home');
    else if (lbl.includes('건물')) openBuildingsPage();
    else if (lbl.includes('커뮤니티')) showContent('community');
    else if (lbl.includes('강의평가')) showContent('lecture-review');
    else if (lbl.includes('공지사항')) showContent('notices');
    else if (lbl.includes('시간표')) openTimetablePage();
    else if (lbl.includes('셔틀')) openShuttlePage();
    else if (lbl.includes('학사일정')) openCalendarPage();
    else if (lbl.includes('프로필')) showProfile();
    else if (lbl.includes('설정')) showContent('settings');
    else if (lbl.includes('알림')) toggleNotifications();
    else if (lbl.includes('로그아웃')) handleLogout();
  });
}

// ─────────── storage 이벤트 ───────────
window.addEventListener('storage', event => {
  if (event.key === 'currentLoggedInUser' || event.key.includes('_profileImage')) {
    checkUserStatus();
    updateTimetable();
  }
});

// ─────────── pageshow 이벤트 ───────────
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    checkUserStatus();
    updateTimetable();
  }
  const lm = localStorage.getItem('lightMode');
  document.body.classList.toggle('light-mode', lm === 'true');
});

// ─────────── 기존 내부 네비게이션 함수들 ───────────
function navigateToTimetable() { openTimetablePage(); }
function navigateToShuttle()   { openShuttlePage(); }
function navigateToCalendar()  { openCalendarPage(); }

// ─────────── map controls ───────────
function zoomIn()    { if (naverMap) naverMap.setZoom(naverMap.getZoom()+1); }
function zoomOut()   { if (naverMap) naverMap.setZoom(naverMap.getZoom()-1); }
function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427,126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}
function trackUserLocation() {
  if (!navigator.geolocation) { showMessage('위치 서비스를 지원하지 않습니다','error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = new naver.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
    if (userMarker) userMarker.setMap(null);
    userMarker = new naver.maps.Marker({ position:latlng, map:naverMap, icon: { content:'<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>', anchor:new naver.maps.Point(10,10) } });
    naverMap.setCenter(latlng); naverMap.setZoom(17);
    showMessage('현재 위치를 찾았습니다','success');
  }, err => {
    let msg='위치를 찾을 수 없습니다';
    if (err.code === err.PERMISSION_DENIED) msg='위치 권한이 거부되었습니다';
    else if (err.code === err.POSITION_UNAVAILABLE) msg='위치 정보를 사용할 수 없습니다';
    else if (err.code === err.TIMEOUT) msg='위치 요청 시간이 초과되었습니다';
    showMessage(msg,'error');
  });
}

// ─────────── viewNoticeDetail ───────────
function viewNoticeDetail(id) {
  showMessage('공지사항 상세보기는 준비 중입니다','info');
}

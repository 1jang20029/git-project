// File: js/index/index.js

console.log('▶ index.js 로드 완료');

// ─────────── 모듈 임포트 ───────────
import { openTimetable, openCalendar, openShuttle } from './modules/nav.js';
import { initMap, addMarkers }                     from './modules/map.js';
import { getJSON, loadStats }                      from './modules/api.js';
import { fmtTime }                                 from './modules/utils.js';

// ─────────── 외부 페이지 URL ───────────
const EXTERNAL_PAGES = {
  timetable: 'pages/list/timetable.html',
  calendar:  'pages/list/academic-calendar.html',
  shuttle:   'pages/list/shuttle.html'
};

// ─────────── 페이지 로드 상태 플래그 ───────────
let buildingsLoaded         = false;
let communityLoaded         = false;
let lectureReviewLoaded     = false;
let noticesLoaded           = false;
let settingsLoaded          = false;
let profileLoaded           = false;
let academicCalendarLoaded  = false;

// ─────────── 콘텐츠 전환 함수 ───────────
async function showContent(key) {
  // 1) 모든 섹션 숨기기 + active 클래스 토글
  const keys = [
    'home', 'buildings', 'community',
    'lecture-review', 'notices',
    'profile', 'settings', 'academic-calendar'
  ];
  keys.forEach(id => {
    const pane = document.getElementById(id + 'Content') 
              || document.getElementById(id + 'ContentPane');
    if (pane) pane.style.display = (id === key) ? 'block' : 'none';
    const navItem = document.getElementById('nav-' + id);
    if (navItem) navItem.classList.toggle('active', id === key);
  });

  // 2) key별 초기화(한 번만)
  try {
    switch (key) {
      case 'buildings':
        if (!buildingsLoaded) {
          buildingsLoaded = true;
          const container = document.getElementById('buildingsContent');
          const html = await fetch('pages/list/buildings.html').then(r => {
            if (!r.ok) throw new Error('buildings.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initBuildingsPage) window.initBuildingsPage();
        }
        break;

      case 'community':
        if (!communityLoaded) {
          communityLoaded = true;
          const container = document.getElementById('communityContent');
          const html = await fetch('pages/user/community.html').then(r => {
            if (!r.ok) throw new Error('community.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initCommunityPage) window.initCommunityPage();
        }
        break;

      case 'lecture-review':
        if (!lectureReviewLoaded) {
          lectureReviewLoaded = true;
          const container = document.getElementById('lecture-reviewContent');
          const html = await fetch('pages/list/lecture-review.html').then(r => {
            if (!r.ok) throw new Error('lecture-review.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initLectureReviewPage) window.initLectureReviewPage();
        }
        break;

      case 'notices':
        if (!noticesLoaded) {
          noticesLoaded = true;
          const container = document.getElementById('noticesContent');
          const html = await fetch('pages/list/notices.html').then(r => {
            if (!r.ok) throw new Error('notices.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initNoticesPage) window.initNoticesPage();
        }
        break;

      case 'settings':
        if (!settingsLoaded) {
          settingsLoaded = true;
          const container = document.getElementById('settingsContent');
          const html = await fetch('pages/user/settings.html').then(r => {
            if (!r.ok) throw new Error('settings.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initSettingsPage) window.initSettingsPage();
        }
        break;

      case 'profile':
        if (!profileLoaded) {
          profileLoaded = true;
          const container = document.getElementById('profileContentPane');
          const html = await fetch('pages/user/account-edit.html').then(r => {
            if (!r.ok) throw new Error('account-edit.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initAccountEditPage) window.initAccountEditPage();
        }
        break;

      case 'academic-calendar':
        if (!academicCalendarLoaded) {
          academicCalendarLoaded = true;
          const container = document.getElementById('academic-calendarContentPane');
          const html = await fetch('pages/list/academic-calendar.html').then(r => {
            if (!r.ok) throw new Error('academic-calendar.html load failed');
            return r.text();
          });
          container.innerHTML = html;
          if (window.initAcademicCalendarPage) window.initAcademicCalendarPage();
        }
        break;

      // 'home' 은 별도 초기화 불필요
    }
  } catch (err) {
    console.error(`${key} 페이지 초기화 실패:`, err);
  }
}

// ─────────── 학생서비스 드롭다운 토글 ───────────
function toggleStudentServices(event) {
  event.stopPropagation();
  const dd = document.querySelector('#nav-student-services .dropdown-menu');
  if (!dd) return;
  dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

// ─────────── 알림 드롭다운 토글 ───────────
function toggleNotifications() {
  const dd = document.getElementById('notification-dropdown');
  if (!dd) return;
  dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

// ─────────── 유저 메뉴 토글 ───────────
function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (!dd) return;
  dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

// ─────────── 모든 알림 읽음 처리 ───────────
function markAllAsRead() {
  console.log('▶ 모든 알림 읽음 처리');
  document.getElementById('notification-list').textContent = '새로운 알림이 없습니다';
  document.getElementById('notification-badge').textContent = '0';
}

// ─────────── 프로필 화면 표시 ───────────
function showProfile() {
  showContent('profile');
}

// ─────────── 로그아웃 처리 ───────────
function handleLogout() {
  console.log('▶ 로그아웃 처리');
  // 실제로는 localStorage.removeItem('currentLoggedInUser') 등
}

// ─────────── 모바일 메뉴 토글 ───────────
function toggleMobileMenu() {
  const menu = document.getElementById('main-menu');
  if (menu) menu.classList.toggle('mobile-open');
}

// ─────────── DOMContentLoaded: 초기화 ───────────
document.addEventListener('DOMContentLoaded', async () => {
  // 대시보드용 네이버 지도 초기화 (건물 페이지에도 재사용 가능)
  initMap('buildingsMap', { lat: 37.39661657434427, lng: 126.90772437800818 }, {
    zoom:    16,
    minZoom: 14,
    maxZoom: 19
  });

  // 대시보드 통계 로드
  loadStats(renderStats);

  // 대시보드 건물 마커 추가
  try {
    const buildings = await getJSON('/api/buildings');
    addMarkers(buildings);
  } catch (err) {
    console.error('건물 데이터 로드 실패:', err);
  }
});

// ─────────── 통계 렌더 함수 ───────────
function renderStats(s) {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${s.totalBuildings}</div>
      <div class="stat-label">캠퍼스 건물</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.totalStudents}</div>
      <div class="stat-label">재학생 수</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.activeServices}</div>
      <div class="stat-label">운영 서비스</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.todayEvents}</div>
      <div class="stat-label">오늘 일정</div>
    </div>
  `;
}

// ─────────── 전역 바인딩 (HTML의 onclick 호출용) ───────────
window.showContent           = showContent;
window.toggleStudentServices = toggleStudentServices;
window.openTimetablePage     = () => openTimetable(EXTERNAL_PAGES.timetable);
window.openCalendarPage      = () => openCalendar(EXTERNAL_PAGES.calendar);
window.openShuttlePage       = () => openShuttle(EXTERNAL_PAGES.shuttle);
window.toggleNotifications   = toggleNotifications;
window.markAllAsRead         = markAllAsRead;
window.toggleUserMenu        = toggleUserMenu;
window.showProfile           = showProfile;
window.handleLogout          = handleLogout;
window.toggleMobileMenu      = toggleMobileMenu;

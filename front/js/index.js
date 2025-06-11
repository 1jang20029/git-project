// index.js - 백엔드 제거 버전

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
  timetable: 'timetable.html',      // 내 시간표 페이지
  calendar: 'academic-calendar.html', // 학사일정 페이지  
  shuttle: 'shuttle.html'           // 셔틀버스 페이지
};

// ─────────── 외부 페이지 이동 함수들 (현재 창에서 이동) ───────────
function openTimetablePage() {
  console.log('내 시간표 페이지로 이동');
  closeAllDropdowns();
  
  // 현재 창에서 이동
  window.location.href = EXTERNAL_PAGES.timetable;
}

function openCalendarPage() {
  console.log('학사일정 페이지로 이동');
  closeAllDropdowns();
  
  // 현재 창에서 이동
  window.location.href = EXTERNAL_PAGES.calendar;
}

function openShuttlePage() {
  console.log('셔틀버스 페이지로 이동');
  closeAllDropdowns();
  
  // 현재 창에서 이동
  window.location.href = EXTERNAL_PAGES.shuttle;
}

// ─────────── 개선된 드롭다운 처리 함수들 ───────────

// 학생서비스 드롭다운 닫기 함수 개선
function closeStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
    dropdown.style.pointerEvents = 'none';
  }
}

// 드롭다운 표시 함수 추가
function showStudentServiceDropdown() {
  const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
  if (dropdown) {
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
    dropdown.style.pointerEvents = 'auto';
  }
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

  // 학생서비스 드롭다운 개선된 이벤트 처리
  const studentServices = document.getElementById('nav-student-services');
  if (studentServices) {
    let hoverTimeout;
    
    // 마우스 엔터 시 드롭다운 표시
    studentServices.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      showStudentServiceDropdown();
    });
    
    // 마우스 리브 시 약간의 지연 후 드롭다운 숨김
    studentServices.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        closeStudentServiceDropdown();
      }, 150); // 150ms 지연
    });
    
    // 드롭다운 메뉴 자체에도 이벤트 추가
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

  // 학생서비스 드롭다운 항목들에 직접 이벤트 리스너 추가
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

  // 전역 클릭 이벤트에서 학생서비스 드롭다운 처리 개선
  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    const ssBtn = event.target.closest('#nav-student-services');

    if (!ntBtn) closeNotificationDropdown();
    if (!upBtn) closeUserDropdown();
    if (!ssBtn) {
      // 학생서비스 영역 밖을 클릭하면 드롭다운 즉시 숨김
      closeStudentServiceDropdown();
    }

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
    'academic-calendarContentPane',
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
    fetch('pages/list/community.html')
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

  // academic-calendar 페이지 처리 (내부용 - 사용하지 않음)
  if (type === 'academic-calendar' && !academicCalendarLoaded) {
    const container = document.getElementById('academic-calendarContentPane');
    if (container) {
      fetch('academic-calendar.html')
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

  if ((type === 'buildings' || type === 'academic-calendar') && naverMap) {
    setTimeout(() => {
      if (naverMap.refresh) naverMap.refresh();
    }, 100);
  }
}

// ─────────── initializeApp: 앱 초기화 ───────────
async function initializeApp() {
  try {
    initNaverMap();
    checkUserStatus();
    updateTimetable();

    // 1분마다 시간표 업데이트
    setInterval(() => {
      updateTimetable();
    }, 60000);

  } catch (error) {
    console.error('앱 초기화 오류:', error);
    showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
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
    updateNotificationCount();
  }
}

// ─────────── markAllAsRead: 모든 알림 읽음 처리 ───────────
function markAllAsRead() {
  document.querySelectorAll('.notification-item.unread').forEach(item => {
    item.classList.remove('unread');
  });

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

  // 로컬 스토리지에서 시간표 데이터 로드
  const courses = loadCoursesFromLocalStorage(currentUser);
  if (!courses || courses.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <h3>📅 시간표 없음</h3>
        <p>등록된 시간표가 없습니다. 시간표 페이지에서 과목을 추가해보세요</p>
        <button class="btn btn-primary" onclick="openTimetablePage()" style="margin-top: 1rem;">
          📅 시간표 관리
        </button>
      </div>
    `;
    return;
  }

  renderTimetable(courses);
}

// ─────────── loadCoursesFromLocalStorage: 로컬 스토리지에서 과목 데이터 로드 ───────────
function loadCoursesFromLocalStorage(currentUser) {
  try {
    // 현재 학기 계산
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let semester = { year: currentYear, term: 1 };
    if (currentMonth >= 3 && currentMonth <= 6) {
      semester = { year: currentYear, term: 1 };
    } else if (currentMonth >= 9 && currentMonth <= 12) {
      semester = { year: currentYear, term: 2 };
    } else if (currentMonth >= 1 && currentMonth <= 2) {
      semester = { year: currentYear - 1, term: 2 };
    }

    // 현재 시간표 ID 가져오기
    const currentTimetableData = localStorage.getItem(`currentTimetable_user_${currentUser}`);
    let currentTimetableId = 1; // 기본값
    if (currentTimetableData) {
      try {
        const timetable = JSON.parse(currentTimetableData);
        currentTimetableId = timetable.id || 1;
      } catch (e) {
        console.error('시간표 ID 파싱 오류:', e);
      }
    }

    // 과목 데이터 로드
    const semesterKey = `courses_${semester.year}_${semester.term}_${currentTimetableId}_user_${currentUser}`;
    const savedCourses = localStorage.getItem(semesterKey);
    
    if (savedCourses) {
      return JSON.parse(savedCourses);
    }
    
    return [];
  } catch (error) {
    console.error('로컬 스토리지에서 과목 로드 오류:', error);
    return [];
  }
}

// ─────────── renderTimetable: 오늘 시간표 렌더링 ───────────
function renderTimetable(courses) {
  const contentEl = document.getElementById('timetableContent');
  if (!contentEl) return;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const todayCourses = [];

  // 오늘 요일의 과목들을 찾아서 처리
  courses.forEach(course => {
    if (!course.times || !Array.isArray(course.times)) return;
    
    course.times.forEach(timeSlot => {
      // timeSlot.day는 1(월)~6(토), currentDay는 0(일)~6(토)
      // 월요일(1) = currentDay(1), 화요일(2) = currentDay(2), ..., 토요일(6) = currentDay(6)
      // 일요일은 제외 (대학교 수업 없음)
      
      if (timeSlot.day === currentDay && currentDay !== 0) {
        // 수업 시간 계산 (1교시 = 9:30~10:20, 2교시 = 10:30~11:20, ...)
        const startHour = 8 + timeSlot.start;
        const startMinute = 30;
        const endHour = 8 + timeSlot.end + 1;
        const endMinute = 20;
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        let status = 'upcoming';
        let timeInfo = '';
        let statusText = '';
        
        if (currentTime >= startTime && currentTime < endTime) {
          status = 'current';
          const remaining = endTime - currentTime;
          timeInfo = formatTimeRemaining(remaining, '종료까지');
          statusText = '수강 중';
        } else if (currentTime >= endTime) {
          status = 'finished';
          timeInfo = '수업 종료';
          statusText = '수강 종료';
        } else {
          const toStart = startTime - currentTime;
          if (toStart > 0) {
            status = 'upcoming';
            timeInfo = formatTimeRemaining(toStart, '시작까지');
            statusText = '수강 예정';
          } else {
            status = 'upcoming';
            timeInfo = '곧 시작';
            statusText = '수강 예정';
          }
        }
        
        todayCourses.push({
          name: course.name,
          room: course.room || '강의실 미정',
          professor: course.professor || '교수명 미정',
          status,
          statusText,
          timeInfo,
          displayTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} ~ ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          startTime,
          endTime,
          color: course.color || 'color-1'
        });
      }
    });
  });

  // 시간순으로 정렬
  todayCourses.sort((a, b) => a.startTime - b.startTime);

  if (todayCourses.length === 0) {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const todayName = dayNames[currentDay];
    
    contentEl.innerHTML = `
      <div class="empty-state">
        <h3>📅 오늘은 휴일</h3>
        <p>${todayName}요일에는 수업이 없습니다</p>
        <button class="btn btn-primary" onclick="openTimetablePage()" style="margin-top: 1rem;">
          📅 시간표 관리
        </button>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = '';
  todayCourses.forEach(courseInfo => {
    const div = document.createElement('div');
    div.className = `class-item class-status-${courseInfo.status}`;
    
    // 상태별 아이콘
    const statusIcon = {
      current: '🟢',
      upcoming: '🟡', 
      finished: '🔴'
    }[courseInfo.status];
    
    div.innerHTML = `
      <div class="class-time">
        <div class="class-time-main">${courseInfo.displayTime}</div>
        <div class="class-time-remaining ${courseInfo.status}">${courseInfo.timeInfo}</div>
      </div>
      <div class="class-info">
        <div class="class-name">${courseInfo.name}</div>
        <div class="class-location">${courseInfo.professor} | ${courseInfo.room}</div>
      </div>
      <div class="class-status status-${courseInfo.status}">
        <span>${statusIcon}</span>
        <span>${courseInfo.statusText}</span>
      </div>
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
    window.location.href = './pages/user/login.html';
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
async function handleGlobalSearch() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  if (!query) return;
  
  showMessage('검색 기능은 준비 중입니다.', 'info');
  document.getElementById('search-input').value = '';
}

// ─────────── checkUserStatus: 로그인 여부, 사용자 정보 업데이트 ───────────
function checkUserStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl  = document.getElementById('user-name');
  const userRoleEl  = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  
  if (currentUser) {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const userData = localStorage.getItem(`user_${currentUser}`);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (userNameEl) userNameEl.textContent = user.name || '사용자';
        if (userRoleEl) userRoleEl.textContent = departmentMap[user.department] || user.department || '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = user.name || '사용자';
        if (dropdownRoleEl) dropdownRoleEl.textContent = departmentMap[user.department] || user.department || '학생';
        updateProfileImage(user);
      } catch (e) {
        console.error('사용자 데이터 파싱 오류:', e);
        setGuestMode();
      }
    } else {
      setGuestMode();
    }
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

// ─────────── updateProfileImage: 프로필 이미지 적용 ───────────
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

// ─────────── showMessage: 우측 상단 알림 ───────────
function showMessage(message, type = 'info', category = '') {
  if (category && !isCategoryEnabled(category)) return;
  if (!shouldShowNotification()) return;
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
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 300);
  }, 3000);
}

// ─────────── shouldShowNotification: DND 모드 검사 ───────────
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

// ─────────── isCategoryEnabled: 카테고리별 알림 설정 확인 ───────────
function isCategoryEnabled(category) {
  const catSettings = JSON.parse(localStorage.getItem('notificationCategories')) || {};
  return catSettings[category] === true;
}

// ─────────── setupAutoLogout: 자동 로그아웃 로직 초기화 ───────────
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

// ─────────── applyKeyboardShortcuts: 기존 단축키 적용 ───────────
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

// ─────────── applyUserShortcuts: 사용자 정의 단축키 적용 ───────────
function applyUserShortcuts() {
  document.addEventListener('keydown', e => {
    const targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) return;
    resetAutoLogoutTimer();
    const pressedKey = e.key.toUpperCase();
    const userShortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || [];
    const matched = userShortcuts.find(entry => entry.key === pressedKey);
    if (!matched) return;
    if (!matched.name) return;
    e.preventDefault();
    const label = matched.name.toLowerCase();
    if (label.includes('대시보드')) { showContent('home'); return; }
    if (label.includes('건물')) { showContent('buildings'); return; }
    if (label.includes('커뮤니티')) { showContent('community'); return; }
    if (label.includes('강의평가')) { showContent('lecture-review'); return; }
    if (label.includes('공지사항')) { showContent('notices'); return; }
    if (label.includes('내 시간표') || label.includes('시간표')) { openTimetablePage(); return; }
    if (label.includes('셔틀버스') || label.includes('셔틀')) { openShuttlePage(); return; }
    if (label.includes('학사일정') || label.includes('학사')) { openCalendarPage(); return; }
    if (label.includes('프로필') || label.includes('내 계정')) { showContent('profile'); return; }
    if (label.includes('설정')) { showContent('settings'); return; }
    if (label.includes('알림')) { toggleNotifications(); return; }
    if (label.includes('로그아웃')) { handleLogout(); return; }
    if (label.includes('테마') || label.includes('다크') || label.includes('라이트')) {
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.checked = !themeToggle.checked;
        themeToggle.dispatchEvent(new Event('change'));
      }
      return;
    }
    if (label.includes('내 위치') || label.includes('위치')) { trackUserLocation(); return; }
    if (label.includes('확대')) { zoomIn(); return; }
    if (label.includes('축소')) { zoomOut(); return; }
    if (label.includes('초기화') || label.includes('리셋')) { resetMapView(); return; }
    console.log(`등록된 단축키 "${matched.name}"(${matched.key}) 가 호출되었으나, 매핑된 기능이 없습니다.`);
  });
}

// ─────────── storage 이벤트: 로그인/프로필/테마 갱신 ───────────
window.addEventListener('storage', event => {
  if (
    event.key === 'currentLoggedInUser' ||
    (event.key && event.key.includes('_profileImage'))
  ) {
    checkUserStatus();
    updateTimetable();
  }
  if (event.key === 'lightMode') {
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode === 'true') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }
});

// ─────────── pageshow 이벤트: 페이지 복원 시 갱신 ───────────
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    checkUserStatus();
    updateTimetable();
  }
  const savedMode = localStorage.getItem('lightMode');
  if (savedMode === 'true') document.body.classList.add('light-mode');
  else document.body.classList.remove('light-mode');
});

// ─────────── 기존 내부 네비게이션 함수들 (하위 호환성을 위해 유지) ───────────
function navigateToTimetable() { 
  console.log('내부 시간표 네비게이션 - 외부 페이지로 리디렉션');
  openTimetablePage();
}

function navigateToShuttle() { 
  console.log('내부 셔틀버스 네비게이션 - 외부 페이지로 리디렉션');
  openShuttlePage();
}

function navigateToCalendar() { 
  console.log('내부 학사일정 네비게이션 - 외부 페이지로 리디렉션');
  openCalendarPage();
}

// ─────────── zoomIn, zoomOut, resetMapView ───────────
function zoomIn()    { if (naverMap) naverMap.setZoom(naverMap.getZoom() + 1); }
function zoomOut()   { if (naverMap) naverMap.setZoom(naverMap.getZoom() - 1); }
function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}

// ─────────── trackUserLocation: 사용자 위치 표시 ───────────
function trackUserLocation() {
  if (!navigator.geolocation) {
    showMessage('위치 서비스를 지원하지 않습니다', 'error', '');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => {
      if (!naverMap) {
        showMessage('지도가 초기화되지 않았습니다', 'error', '');
        return;
      }
      const userPos = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
      if (userMarker) userMarker.setMap(null);
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
    error => {
      let message = '위치를 찾을 수 없습니다';
      switch (error.code) {
        case error.PERMISSION_DENIED:    message = '위치 권한이 거부되었습니다'; break;
        case error.POSITION_UNAVAILABLE: message = '위치 정보를 사용할 수 없습니다'; break;
        case error.TIMEOUT:              message = '위치 요청 시간이 초과되었습니다'; break;
      }
      showMessage(message, 'error', '');
    }
  );
}

// ─────────── showBuildingOnMap: 메인 페이지 건물 보기 ───────────
function showBuildingOnMap(buildingId) {
  showContent('buildings');
  setTimeout(() => {
    if (naverMap.refresh) naverMap.refresh();
  }, 100);
}

// ─────────── getBuildingDirections: 길찾기 준비 중 ───────────
function getBuildingDirections(buildingId) {
  showMessage('길찾기 기능은 준비 중입니다', 'info', '');
}

// ─────────── viewNoticeDetail: 공지사항 상세보기 준비 중 ───────────
function viewNoticeDetail(noticeId) {
  showMessage('공지사항 상세보기는 준비 중입니다', 'info', '');
}
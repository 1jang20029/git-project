let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;

const departmentMap = {};

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash + 'Content')) {
    showContent(hash);
  } else {
    showContent('home');
  }

  initializeApp();
  initializeSettings();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGlobalSearch();
      }
    });
  }

  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    if (!ntBtn) closeNotificationDropdown();
    if (!upBtn) closeUserDropdown();
  });
});

function initializeSettings() {
  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');

  if (themeToggle) {
    themeToggle.addEventListener('change', handleThemeToggle);
  }

  if (notificationToggle) {
    notificationToggle.addEventListener('change', handleNotificationToggle);
  }

  loadUserSettings();
}

function loadUserSettings() {
  const savedTheme = localStorage.getItem('lightMode');
  const savedNotification = localStorage.getItem('enableNotification');

  const themeToggle = document.getElementById('themeToggle');
  const notificationToggle = document.getElementById('notificationToggle');

  if (themeToggle) {
    themeToggle.checked = savedTheme === 'true';
    if (savedTheme === 'true') {
      document.body.classList.add('light-mode');
    }
  }

  if (notificationToggle) {
    notificationToggle.checked = savedNotification === 'true';
  }
}

function handleThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle.checked) {
    document.body.classList.add('light-mode');
    localStorage.setItem('lightMode', 'true');
    showMessage('라이트 모드로 변경되었습니다', 'success');
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem('lightMode', 'false');
    showMessage('다크 모드로 변경되었습니다', 'success');
  }
}

function handleNotificationToggle() {
  const notificationToggle = document.getElementById('notificationToggle');
  const enabled = notificationToggle.checked;
  localStorage.setItem('enableNotification', enabled);
  
  if (enabled) {
    showMessage('알림이 활성화되었습니다', 'success');
  } else {
    showMessage('알림이 비활성화되었습니다', 'info');
  }
}

async function loadDepartments() {
  try {
    const res = await fetch('/api/departments');
    const list = await res.json();
    list.forEach((item) => {
      departmentMap[item.code] = item.name;
    });
  } catch (err) {
    console.error('학과 데이터 로드 오류:', err);
  }
}

async function loadNotifications() {
  try {
    const res = await fetch('/api/notifications');
    const notifications = await res.json();
    const listEl = document.getElementById('notification-list');
    const countEl = document.getElementById('notification-badge');
    listEl.innerHTML = '';
    unreadNotifications = 0;
    notifications.forEach((n) => {
      const item = document.createElement('div');
      item.className = 'notification-item' + (n.unread ? ' unread' : '');
      item.onclick = () => markAsRead(item, n.id);
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
    document.getElementById('notification-dot').style.display =
      unreadNotifications > 0 ? 'block' : 'none';
  } catch (err) {
    console.error('알림 로드 오류:', err);
  }
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    const statsGrid = document.getElementById('statsGrid');
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
  } catch (err) {
    console.error('통계 로드 오류:', err);
  }
}

async function loadBuildings() {
  try {
    const res = await fetch('/api/buildings');
    const buildings = await res.json();
    const grid = document.getElementById('buildingGrid');
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
    addMapMarkers(buildings);
  } catch (err) {
    console.error('건물 로드 오류:', err);
  }
}

async function loadNotices() {
  try {
    const res = await fetch('/api/notices');
    const notices = await res.json();
    const recentEl = document.getElementById('recentNotices');
    const fullEl = document.getElementById('fullNoticeList');
    recentEl.innerHTML = '';
    fullEl.innerHTML = '';
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
  } catch (err) {
    console.error('공지사항 로드 오류:', err);
  }
}

async function loadShuttleInfo() {
  try {
    const res = await fetch('/api/shuttle/routes');
    const routes = await res.json();
    const tabs = document.getElementById('shuttleRoutes');
    tabs.innerHTML = '';
    routes.forEach((r, idx) => {
      const tab = document.createElement('div');
      tab.className = 'route-tab' + (idx === 0 ? ' active' : '');
      tab.onclick = () => selectShuttleRoute(r.id);
      tab.innerHTML = `
        <div class="route-name">${r.name}</div>
        <div class="route-desc">${r.desc}</div>
      `;
      tabs.appendChild(tab);
    });
    if (routes.length > 0) {
      selectShuttleRoute(routes[0].id);
    }
  } catch (err) {
    console.error('셔틀버스 로드 오류:', err);
  }
}

async function selectShuttleRoute(routeId) {
  try {
    document.querySelectorAll('.route-tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    const tabs = Array.from(document.querySelectorAll('.route-tab'));
    const selectedTab = tabs.find((t) =>
      t.textContent.includes(routeId.toString())
    );
    if (selectedTab) selectedTab.classList.add('active');

    const res = await fetch(`/api/shuttle/routes/${routeId}`);
    const route = await res.json();
    document.getElementById('shuttle-time').textContent = route.time;
    document.getElementById('shuttle-desc').textContent = route.desc;
    const statusEl = document.getElementById('shuttleStatus');
    statusEl.className = `status-badge status-${route.status}`;
    statusEl.innerHTML =
      route.status === 'running'
        ? '<span>🟢</span><span>운행중</span>'
        : '<span>🔴</span><span>운행종료</span>';
  } catch (err) {
    console.error('셔틀 노선 선택 오류:', err);
  }
}

async function loadActivityStats() {
  try {
    const res = await fetch('/api/activity-stats');
    const stats = await res.json();
    const container = document.getElementById('activityStats');
    if (!container) return;
    container.innerHTML = '';
    const labels = {
      contestCount: '진행중 공모전',
      clubCount:    '신입 모집 동아리',
      externalCount:'대외활동 기회',
    };
    ['contestCount','clubCount','externalCount'].forEach((key) => {
      const stat = document.createElement('div');
      stat.className = 'activity-stat';
      stat.innerHTML = `
        <div class="activity-number">${stats[key]}</div>
        <div class="activity-label">${labels[key]}</div>
      `;
      container.appendChild(stat);
    });
  } catch (err) {
    console.error('활동 통계 로드 오류:', err);
  }
}

async function loadRestaurantInfo() {
  try {
    const res = await fetch('/api/restaurants');
    const restaurants = await res.json();
    const grid = document.getElementById('restaurantGrid');
    if (!grid) return;
    restaurants.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const popular = restaurants.slice(0, 2);
    const emojiMap = {
      한식: '🍲', 중식: '🥢', 일식: '🍣',
      양식: '🍝', 분식: '🍜', 카페: '☕',
      술집: '🍺',
    };
    grid.innerHTML = '';
    popular.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'restaurant-card';
      card.onclick = () =>
        window.open(`student-deals.html?id=${encodeURIComponent(r.id)}`, '_blank');
      const icon = emojiMap[r.category] || '🍽️';
      card.innerHTML = `
        <div class="restaurant-image">${icon}</div>
        <div class="restaurant-info">
          <div class="restaurant-name">${r.name}</div>
          <div class="restaurant-category">${r.category}</div>
          <div class="restaurant-discount">${r.discount || '할인 없음'}</div>
          <div class="restaurant-likes">👍 ${r.likes || 0}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('맛집 정보 로드 오류:', err);
  }
}

async function loadCommunityPosts() {
  try {
    const [liveRes, hotRes] = await Promise.all([
      fetch('/api/community/live'),
      fetch('/api/community/hot'),
    ]);
    const livePosts = await liveRes.json();
    const hotPosts  = await hotRes.json();
    const liveEl = document.getElementById('livePosts');
    const hotEl  = document.getElementById('hotPosts');
    liveEl.innerHTML = '';
    hotEl.innerHTML = '';
    livePosts.forEach((p) => {
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
          👍 ${p.likes} 💬 ${p.comments}
        </div>
      `;
      liveEl.appendChild(item);
    });
    hotPosts.forEach((p) => {
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
          👍 ${p.likes} 💬 ${p.comments}
        </div>
      `;
      hotEl.appendChild(item);
    });
  } catch (err) {
    console.error('커뮤니티 게시글 로드 오류:', err);
  }
}

async function loadLectureReviews() {
  try {
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent'),
    ]);
    const popular = await popRes.json();
    const recent  = await recRes.json();
    const popEl = document.getElementById('popularReviews');
    const recEl = document.getElementById('recentReviews');
    popEl.innerHTML = '';
    recEl.innerHTML = '';
    popular.forEach((r) => {
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
  } catch (err) {
    console.error('강의평가 로드 오류:', err);
  }
}

function initNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    return;
  }
  const mapContainer = document.getElementById('naverMap');
  if (!mapContainer) return;
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
}

function addMapMarkers(buildings) {
  if (!naverMap) return;
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
}

function updateTimetable() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const contentEl = document.getElementById('timetableContent');
  if (!currentUser) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #94a3b8;">
        <p>로그인하여 개인 시간표를 확인하세요</p>
      </div>
    `;
    return;
  }
  fetch(`/api/timetable?user=${encodeURIComponent(currentUser)}`)
    .then((res) => res.json())
    .then((courses) => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const todayCourses = [];
      courses.forEach((course) => {
        course.times.forEach((time) => {
          if (
            time.day === currentDay ||
            (currentDay === 0 && time.day === 6)
          ) {
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
              displayTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(
                2,
                '0'
              )}`,
              startTime,
            });
          }
        });
      });
      todayCourses.sort((a, b) => a.startTime - b.startTime);
      if (todayCourses.length === 0) {
        contentEl.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #94a3b8;">
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
            <div class="class-location">${ci.room || '강의실 미정'} | ${
          ci.professor || '교수명 미정'
        }</div>
          </div>
          <div class="class-status status-${ci.status}">${statusText}</div>
        `;
        contentEl.appendChild(div);
      });
    })
    .catch((err) => {
      console.error('시간표 로드 오류:', err);
    });
}

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

function markAsRead(el, id) {
  if (el.classList.contains('unread')) {
    el.classList.remove('unread');
    unreadNotifications--;
    fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    updateNotificationCount();
  }
}

function markAllAsRead() {
  document.querySelectorAll('.notification-item.unread').forEach((item) => {
    item.classList.remove('unread');
  });
  fetch('/api/notifications/mark-all-read', { method: 'POST' });
  unreadNotifications = 0;
  updateNotificationCount();
  showMessage('모든 알림을 읽음 처리했습니다.', 'success');
}

function updateNotificationCount() {
  const countEl = document.getElementById('notification-badge');
  const dotEl = document.getElementById('notification-dot');
  countEl.textContent = unreadNotifications;
  dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    if (confirm('로그인하시겠습니까?')) {
      window.open('login.html', '_blank');
    }
    return;
  }
  if (dropdown.classList.contains('show')) closeUserDropdown();
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

function showProfile() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    showContent('profile');
  } else {
    alert('로그인이 필요한 서비스입니다.');
  }
  closeUserDropdown();
}

function handleLogout() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('currentLoggedInUser');
      checkUserStatus();
      showMessage('로그아웃 되었습니다', 'success');
      showContent('home');
    }
  } else {
    alert('로그인 상태가 아닙니다.');
  }
  closeUserDropdown();
}

function showContent(type) {
  const panes = [
    'homeContent', 'buildingsContent', 'communityContent',
    'lecture-reviewContent', 'noticesContent', 'timetableContentPane',
    'shuttleContentPane', 'calendarContentPane', 'profileContentPane',
    'settingsContent'
  ];
  panes.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });

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
  
  const target = document.getElementById(targetId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('fade-in');
  }

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
  });
  const navItem = document.getElementById('nav-' + type);
  if (navItem) navItem.classList.add('active');

  currentContent = type;
  window.location.hash = type;
  
  if (type === 'buildings' && naverMap) {
    setTimeout(() => naverMap.refresh(), 100);
  }
}

async function handleGlobalSearch() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  if (!query) return;
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
  alert('검색 결과를 찾을 수 없습니다.');
}

function checkUserStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  
  if (currentUser) {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then((res) => res.json())
      .then((user) => {
        userNameEl.textContent = user.name || '사용자';
        userRoleEl.textContent = departmentMap[user.department] || '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = user.name || '사용자';
        if (dropdownRoleEl)
          dropdownRoleEl.textContent = departmentMap[user.department] || '학생';
        updateProfileImage(user);
      })
      .catch(() => {
        userNameEl.textContent = '사용자';
        userRoleEl.textContent = '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = '사용자';
        if (dropdownRoleEl) dropdownRoleEl.textContent = '학생';
      });
  } else {
    userNameEl.textContent = '게스트';
    userRoleEl.textContent = '방문자';
    if (dropdownNameEl) dropdownNameEl.textContent = '게스트';
    if (dropdownRoleEl) dropdownRoleEl.textContent = '방문자';
    document.getElementById('user-avatar').textContent = '👤';
  }
}

function updateProfileImage(user) {
  const avatarEl = document.getElementById('user-avatar');
  if (user.profileImageType === 'emoji') {
    avatarEl.textContent = user.profileImage || '👤';
  } else {
    avatarEl.innerHTML = `<img src="${user.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="프로필">`;
  }
}

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

async function initializeApp() {
  await loadDepartments();
  initNaverMap();
  await loadStats();
  await loadNotifications();
  await loadBuildings();
  await loadNotices();
  await loadShuttleInfo();
  await loadActivityStats();
  await loadRestaurantInfo();
  await loadCommunityPosts();
  await loadLectureReviews();
  checkUserStatus();
  updateTimetable();
  setInterval(() => {
    loadShuttleInfo();
    updateTimetable();
    loadActivityStats();
    loadRestaurantInfo();
  }, 60000);
}

window.addEventListener('storage', (event) => {
  if (
    event.key === 'currentLoggedInUser' ||
    (event.key && event.key.includes('_profileImage'))
  ) {
    checkUserStatus();
    updateTimetable();
  }
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    checkUserStatus();
    loadActivityStats();
    loadRestaurantInfo();
    updateTimetable();
  }
});

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function toggleTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.checked = !themeToggle.checked;
    handleThemeToggle();
  } else {
    document.body.classList.toggle('light-mode');
  }
}

function navigateToTimetable() {
  window.location.href = 'timetable.html';
}

function navigateToShuttle() {
  window.location.href = 'shuttle.html';
}

function navigateToCalendar() {
  window.location.href = 'academic-calendar.html';
}

function zoomIn() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() + 1);
  }
}

function zoomOut() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() - 1);
  }
}

function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}

function trackUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
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
      showMessage('현재 위치를 찾았습니다', 'success');
    }, (error) => {
      showMessage('위치를 찾을 수 없습니다', 'error');
    });
  } else {
    showMessage('위치 서비스를 지원하지 않습니다', 'error');
  }
}

function showBuildingOnMap(buildingId) {
  showContent('buildings');
  setTimeout(() => {
    if (naverMap) {
      naverMap.refresh();
    }
  }, 100);
}

function getBuildingDirections(buildingId) {
  showMessage('길찾기 기능은 준비 중입니다', 'info');
}

function viewNoticeDetail(noticeId) {
  showMessage('공지사항 상세보기는 준비 중입니다', 'info');
}
// =========================
// 전역 변수 정의
// =========================
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;

// =========================
// 테마(다크/라이트) 토글 및 설정 모달 로직
// =========================
const THEME_KEY = 'theme-preference';

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light-theme');
    const checkbox = document.getElementById('themeToggleCheckbox');
    if (checkbox) checkbox.checked = true;
  } else {
    document.documentElement.classList.remove('light-theme');
    const checkbox = document.getElementById('themeToggleCheckbox');
    if (checkbox) checkbox.checked = false;
  }
}

function toggleTheme() {
  // 로컬스토리지에 저장된 값이 'light'이면 라이트, 아니면 다크 모드가 기본
  const current = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function openSettingsModal() {
  document.getElementById('settingsModalOverlay').classList.add('show');
}

function closeSettingsModal() {
  document.getElementById('settingsModalOverlay').classList.remove('show');
}

function saveSettings() {
  // 예시로 다크/라이트 모드 저장만 수행
  const isLight = document.getElementById('themeToggleCheckbox').checked;
  const nextTheme = isLight ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);

  // TODO: 나머지 설정(알림, 자동 로그인 등) 로직을 이곳에서 처리하면 됩니다.
  closeSettingsModal();
}

// =========================
// DOMContentLoaded 이벤트
// - 초기 테마 적용
// - 설정 모달과 체크박스 이벤트 바인딩
// =========================
document.addEventListener('DOMContentLoaded', () => {
  // 로컬 스토리지에 테마 설정이 있으면 적용, 없으면 다크 모드 기본
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');

  // 톱니바퀴 아이콘 클릭 시 모달 오픈
  const openSetBtn = document.getElementById('openSettingsBtn');
  if (openSetBtn) {
    openSetBtn.addEventListener('click', () => {
      openSettingsModal();
      closeUserDropdown();
    });
  }

  // 설정 모달 내부 체크박스 클릭 시 바로 테마 전환
  const themeCheckbox = document.getElementById('themeToggleCheckbox');
  if (themeCheckbox) {
    themeCheckbox.addEventListener('change', () => {
      toggleTheme();
    });
  }
});

// =========================
// 데이터 로드 함수들
// =========================

// 알림 데이터 로드
async function loadNotifications() {
  try {
    const res = await fetch('/api/notifications');
    const notifications = await res.json();
    const listEl = document.getElementById('notificationList');
    const countEl = document.getElementById('notificationCount');
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
    document.getElementById('notificationDot').style.display =
      unreadNotifications > 0 ? 'block' : 'none';
  } catch (err) {
    console.error('알림 로드 오류:', err);
  }
}

// 통계 데이터 로드
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

// 건물 데이터 로드
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

// 공지사항 데이터 로드 (전체 & 최근)
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

// 셔틀버스 데이터 로드
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

// 선택한 셔틀버스 정보 표시
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
    document.getElementById('shuttleTime').textContent = route.time;
    document.getElementById('shuttleDesc').textContent = route.desc;
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

// 활동 통계 데이터 로드
async function loadActivityStats() {
  try {
    const res = await fetch('/api/activity-stats');
    const stats = await res.json();
    const container = document.getElementById('activityStats');
    container.innerHTML = '';

    const labels = {
      contestCount: '진행중 공모전',
      clubCount: '신입 모집 동아리',
      externalCount: '대외활동 기회',
    };

    ['contestCount', 'clubCount', 'externalCount'].forEach((key) => {
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

// 맛집 정보 로드 (메뉴에서 제거되었으나 카드 영역을 비워두거나 삭제할 수 있음)
async function loadRestaurantInfo() {
  try {
    const res = await fetch('/api/restaurants');
    const restaurants = await res.json();
    restaurants.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const popular = restaurants.slice(0, 2);
    const grid = document.getElementById('restaurantGrid');
    grid.innerHTML = '';
    const emojiMap = {
      한식: '🍲',
      중식: '🥢',
      일식: '🍣',
      양식: '🍝',
      분식: '🍜',
      카페: '☕',
      술집: '🍺',
    };
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

// 실시간 커뮤니티 로드
async function loadCommunityPosts() {
  try {
    const [liveRes, hotRes] = await Promise.all([
      fetch('/api/community/live'),
      fetch('/api/community/hot'),
    ]);
    const livePosts = await liveRes.json();
    const hotPosts = await hotRes.json();
    const liveEl = document.getElementById('livePosts');
    const hotEl = document.getElementById('hotPosts');
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
        <div style="margin-top:0.5rem; color: var(--dim-text); font-size:0.8rem;">
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
        <div style="margin-top:0.5rem; color: var(--dim-text); font-size:0.8rem;">
          👍 ${p.likes} 💬 ${p.comments}
        </div>
      `;
      hotEl.appendChild(item);
    });
  } catch (err) {
    console.error('커뮤니티 게시글 로드 오류:', err);
  }
}

// 강의평가 로드
async function loadLectureReviews() {
  try {
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent'),
    ]);
    const popular = await popRes.json();
    const recent = await recRes.json();
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
          평점: ${r.rating}/5.0 | ${r.department}
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
          평점: ${r.rating}/5.0 | ${r.department}
        </div>
      `;
      recEl.appendChild(item);
    });
  } catch (err) {
    console.error('강의평가 로드 오류:', err);
  }
}

// =========================
// 지도 초기화 및 마커
// =========================
function initNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    return;
  }
  const mapContainer = document.getElementById('naverMap');
  if (!mapContainer) return;

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
}

function addMapMarkers(buildings) {
  if (!naverMap) return;
  // 기존 마커 제거
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

// =========================
// 시간표 업데이트
// =========================
function updateTimetable() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const contentEl = document.getElementById('timetableContent');
  if (!currentUser) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--dim-text);">
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
              displayTime: `${
                String(startHour).padStart(2, '0')
              }:${String(startMinute).padStart(2, '0')}`,
              startTime,
            });
          }
        });
      });

      todayCourses.sort((a, b) => a.startTime - b.startTime);
      if (todayCourses.length === 0) {
        contentEl.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--dim-text);">
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

// =========================
// 알림 관련 함수
// =========================
function toggleNotifications() {
  const dd = document.getElementById('notificationDropdown');
  if (dd.classList.contains('show')) closeNotificationDropdown();
  else showNotificationDropdown();
}
function showNotificationDropdown() {
  closeUserDropdown();
  document.getElementById('notificationDropdown').classList.add('show');
}
function closeNotificationDropdown() {
  document.getElementById('notificationDropdown').classList.remove('show');
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
  const countEl = document.getElementById('notificationCount');
  const dotEl = document.getElementById('notificationDot');
  countEl.textContent = unreadNotifications;
  dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

// =========================
// 사용자 메뉴 관련 함수
// =========================
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
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
  document.getElementById('userDropdown').classList.add('show');
}
function closeUserDropdown() {
  document.getElementById('userDropdown').classList.remove('show');
}
function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
}
function showProfile() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    window.open('profile-edit.html', '_blank');
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
      updateTimetable();
    }
  } else {
    alert('로그인 상태가 아닙니다.');
  }
  closeUserDropdown();
}

// =========================
// 지도 컨트롤
// =========================
function zoomIn() {
  if (naverMap) naverMap.setZoom(naverMap.getZoom() + 1);
}
function zoomOut() {
  if (naverMap) naverMap.setZoom(naverMap.getZoom() - 1);
}
function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
    infoWindows.forEach((iw) => iw.close());
  }
}
function trackUserLocation() {
  if (!navigator.geolocation) {
    alert('이 브라우저에서는 위치 추적 기능을 지원하지 않습니다.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userPos = new naver.maps.LatLng(
        pos.coords.latitude,
        pos.coords.longitude
      );
      if (userMarker) userMarker.setMap(null);
      userMarker = new naver.maps.Marker({
        position: userPos,
        map: naverMap,
        icon: {
          content:
            '<div style="background: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          anchor: new naver.maps.Point(10, 10),
        },
      });
      naverMap.setCenter(userPos);
      naverMap.setZoom(18);
      userLocation = pos.coords;
    },
    (err) => {
      console.error('위치 추적 오류:', err);
      alert('위치 정보를 가져올 수 없습니다.');
    }
  );
}

// =========================
// 건물 관련 함수
// =========================
function showBuildingOnMap(buildingId) {
  fetch(`/api/buildings/${buildingId}`)
    .then((res) => res.json())
    .then((b) => {
      showContent('buildings');
      setTimeout(() => {
        const position = new naver.maps.LatLng(b.position.lat, b.position.lng);
        naverMap.setCenter(position);
        naverMap.setZoom(18);
        const idx = mapMarkers.findIndex((m) => m.getTitle() === b.name);
        if (idx !== -1) {
          infoWindows.forEach((iw) => iw.close());
          infoWindows[idx].open(naverMap, mapMarkers[idx]);
        }
      }, 500);
    })
    .catch((err) => console.error('단일 건물 로드 오류:', err));
}
function getBuildingDirections(buildingId) {
  if (!userLocation) {
    alert('먼저 현재 위치를 확인해주세요.');
    trackUserLocation();
    return;
  }
  fetch(`/api/buildings/${buildingId}`)
    .then((res) => res.json())
    .then((b) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.position.lat,
        b.position.lng
      );
      alert(`${b.name}까지 직선거리 약 ${Math.round(distance)}m입니다.`);
    })
    .catch((err) => console.error('길찾기 오류:', err));
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =========================
// 검색 기능
// =========================
async function handleGlobalSearch() {
  const query = document
    .getElementById('globalSearch')
    .value.trim()
    .toLowerCase();
  if (!query) return;

  // 건물 검색
  try {
    const res = await fetch(
      `/api/buildings/search?q=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      const foundBuilding = await res.json();
      showBuildingOnMap(foundBuilding.id);
      document.getElementById('globalSearch').value = '';
      return;
    }
  } catch {}

  // 공지사항 검색
  try {
    const res = await fetch(
      `/api/notices/search?q=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      showContent('notices');
      document.getElementById('globalSearch').value = '';
      return;
    }
  } catch {}

  alert('검색 결과를 찾을 수 없습니다.');
}

// =========================
// 콘텐츠 전환
// =========================
function showContent(type) {
  const contents = [
    'homeContent',
    'buildingsContent',
    'noticesContent',
    'communityContent',
    'lecture-reviewContent',
  ];
  contents.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById(type + 'Content');
  if (target) {
    target.style.display = 'block';
    target.classList.add('fade-in');
  }
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
  });
  event.target.closest('.nav-item').classList.add('active');
  currentContent = type;
  if (type === 'buildings' && naverMap) {
    setTimeout(() => naverMap.refresh(), 100);
  }
}

// =========================
// 빠른 링크 (activities, deals는 제거됨)
// =========================
function openQuickLink(type) {
  const links = {
    timetable: 'timetable.html',
    shuttle: 'shuttle_bus_tracker.html',
    // activities: 'activities.html', ← 제거됨
    // deals: 'student-deals.html', ← 제거됨
    'academic-calendar': 'academic-calendar.html',
  };
  if (links[type]) {
    window.open(links[type], '_blank');
  } else {
    alert(`${type} 서비스는 준비 중입니다.`);
  }
}

// =========================
// 유저 상태 확인
// =========================
function checkUserStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const dropdownNameEl = document.getElementById('dropdownUserName');
  const dropdownRoleEl = document.getElementById('dropdownUserRole');

  if (currentUser) {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then((res) => res.json())
      .then((user) => {
        userNameEl.textContent = user.name || '사용자';
        userRoleEl.textContent = user.department
          ? getDepartmentName(user.department)
          : '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = user.name || '사용자';
        if (dropdownRoleEl)
          dropdownRoleEl.textContent = user.department
            ? getDepartmentName(user.department)
            : '학생';
        updateProfileImage(user);
      })
      .catch(() => {
        userNameEl.textContent = '사용자';
        userRoleEl.textContent = '학생';
        if (dropdownNameEl) dropdownNameEl.textContent = '사용자';
        if (dropdownRoleEl) dropdownRoleEl.textContent = '학생';
        document.getElementById('userAvatar').textContent = '👤';
      });
  } else {
    userNameEl.textContent = '게스트';
    userRoleEl.textContent = '방문자';
    if (dropdownNameEl) dropdownNameEl.textContent = '게스트';
    if (dropdownRoleEl) dropdownRoleEl.textContent = '방문자';
    document.getElementById('userAvatar').textContent = '👤';
  }
}

function getDepartmentName(dept) {
  const map = {
    computerScience: '컴퓨터정보학과',
    business: '경영학과',
    nursing: '간호학과',
    engineering: '공학계열',
    arts: '예술계열',
  };
  return map[dept] || dept;
}

function updateProfileImage(user) {
  const avatarEl = document.getElementById('userAvatar');
  if (user.profileImageType === 'emoji') {
    avatarEl.textContent = user.profileImage || '👤';
  } else {
    avatarEl.innerHTML = `<img src="${user.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="프로필">`;
  }
}

// =========================
// 메시지 표시
// =========================
function showMessage(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor =
    type === 'success'
      ? 'rgba(16, 185, 129, 0.9)'
      : type === 'error'
      ? 'rgba(239, 68, 68, 0.9)'
      : 'rgba(59, 130, 246, 0.9)';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
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

// =========================
// 사이드바 토글 및 초기화
// =========================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// =========================
// 전역 초기화
// - 페이지가 로드되면 호출
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGlobalSearch();
      }
    });
  }

  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('.notification-btn');
    const upBtn = event.target.closest('.user-profile');
    if (!ntBtn) closeNotificationDropdown();
    if (!upBtn) closeUserDropdown();
  });
});

async function initializeApp() {
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

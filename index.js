let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;

const departmentMap = {};

// Fallback 데이터
const fallbackData = {
  departments: [
    { id: 1, code: 'CS', name: '컴퓨터공학과' },
    { id: 2, code: 'EE', name: '전자공학과' },
    { id: 3, code: 'ME', name: '기계공학과' }
  ],
  stats: {
    totalBuildings: 15,
    totalStudents: 8500,
    activeServices: 12,
    todayEvents: 3,
    newBuildingsText: '신축 1동',
    studentGrowthText: '전년 대비 5% 증가',
    newServicesText: '신규 2개',
  },
  buildings: [
    {
      id: 'building1',
      name: '공학관',
      description: '컴퓨터공학과, 전자공학과 강의실',
      position: { lat: 37.39661657434427, lng: 126.90772437800818 }
    },
    {
      id: 'building2', 
      name: '학생회관',
      description: '학생 편의시설 및 동아리방',
      position: { lat: 37.39561657434427, lng: 126.90672437800818 }
    }
  ],
  notices: [
    {
      id: 1,
      category: '학사',
      date: '2024-06-04',
      title: '2024년 2학기 수강신청 안내',
      summary: '수강신청 일정 및 유의사항을 안내드립니다.'
    },
    {
      id: 2,
      category: '행사',
      date: '2024-06-03',
      title: '스마트 캠퍼스 시스템 오픈',
      summary: '새로운 캠퍼스 정보 시스템이 정식 오픈되었습니다.'
    }
  ],
  notifications: [
    {
      id: 1,
      category: '시스템',
      time: '방금 전',
      title: '시스템 점검 완료',
      summary: '정기 시스템 점검이 완료되었습니다.',
      unread: true
    }
  ],
  shuttleRoutes: [
    {
      id: 1,
      name: 'A노선',
      desc: '기숙사 ↔ 본관',
      time: '5분 후 도착',
      status: 'running'
    }
  ],
  communityPosts: {
    live: [
      {
        category: '자유',
        time: '5분 전',
        title: '오늘 점심 메뉴 추천해주세요',
        summary: '학식 말고 다른 곳에서 먹고 싶어요',
        likes: 3,
        comments: 7
      }
    ],
    hot: [
      {
        category: '정보',
        title: '중간고사 일정 정리',
        summary: '각 과목별 중간고사 일정을 정리했습니다',
        likes: 25,
        comments: 12
      }
    ]
  },
  lectureReviews: {
    popular: [
      {
        category: '전공',
        rating: 5,
        title: '데이터구조 - 김교수님',
        comment: '설명이 정말 이해하기 쉬워요',
        department: 'CS'
      }
    ],
    recent: [
      {
        category: '교양',
        rating: 4,
        title: '영어회화 - 이교수님', 
        comment: '실용적인 영어를 배울 수 있어요',
        department: 'EE',
        timeAgo: '1시간 전'
      }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash + 'Content')) {
    showContent(hash);
  } else {
    showContent('home');
  }

  initializeApp();
  initializeSettings();
  setupNetworkListeners();

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
    applyTheme(savedTheme === 'true');
  }

  if (notificationToggle) {
    notificationToggle.checked = savedNotification === 'true';
  }
}

function applyTheme(isLight) {
  if (isLight) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
}

function handleThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const isLight = themeToggle.checked;
  
  applyTheme(isLight);
  localStorage.setItem('lightMode', isLight);
  
  showMessage(
    isLight ? '라이트 모드로 변경되었습니다' : '다크 모드로 변경되었습니다', 
    'success'
  );
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
    console.warn('학과 데이터 로드 실패, fallback 데이터 사용:', err);
    fallbackData.departments.forEach((item) => {
      departmentMap[item.code] = item.name;
    });
  }
}

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
    console.warn('알림 데이터 로드 실패, fallback 데이터 사용:', err);
    renderNotifications(fallbackData.notifications);
  }
}

function renderNotifications(notifications) {
  const listEl = document.getElementById('notification-list');
  const countEl = document.getElementById('notification-badge');
  
  if (!listEl || !countEl) return;
  
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
  const dotEl = document.getElementById('notification-dot');
  if (dotEl) {
    dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
  }
}

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
    console.warn('통계 데이터 로드 실패, fallback 데이터 사용:', err);
    renderStats(fallbackData.stats);
  }
}

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
    console.warn('건물 데이터 로드 실패, fallback 데이터 사용:', err);
    renderBuildings(fallbackData.buildings);
    addMapMarkers(fallbackData.buildings);
  }
}

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
    console.warn('공지사항 데이터 로드 실패, fallback 데이터 사용:', err);
    renderNotices(fallbackData.notices);
  }
}

function renderNotices(notices) {
  const recentEl = document.getElementById('recentNotices');
  const fullEl = document.getElementById('fullNoticeList');
  
  if (!recentEl || !fullEl) return;
  
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
}

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
      selectShuttleRoute(routes[0].id);
    }
  } catch (err) {
    console.warn('셔틀버스 데이터 로드 실패, fallback 데이터 사용:', err);
    renderShuttleRoutes(fallbackData.shuttleRoutes);
    if (fallbackData.shuttleRoutes.length > 0) {
      selectShuttleRoute(fallbackData.shuttleRoutes[0].id, fallbackData.shuttleRoutes[0]);
    }
  }
}

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

async function selectShuttleRoute(routeId, fallbackRoute = null) {
  try {
    document.querySelectorAll('.route-tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    
    const tabs = Array.from(document.querySelectorAll('.route-tab'));
    const selectedTab = tabs.find((t) =>
      t.textContent.includes(routeId.toString())
    );
    if (selectedTab) selectedTab.classList.add('active');

    let route;
    if (isOnline && !fallbackRoute) {
      const res = await fetch(`/api/shuttle/routes/${routeId}`);
      if (!res.ok) throw new Error('API 응답 오류');
      route = await res.json();
    } else {
      route = fallbackRoute || fallbackData.shuttleRoutes.find(r => r.id === routeId);
    }

    if (route) {
      renderShuttleStatus(route);
    }
  } catch (err) {
    console.warn('셔틀 노선 선택 오류:', err);
    const fallbackRoute = fallbackData.shuttleRoutes.find(r => r.id === routeId);
    if (fallbackRoute) {
      renderShuttleStatus(fallbackRoute);
    }
  }
}

function renderShuttleStatus(route) {
  const timeEl = document.getElementById('shuttle-time');
  const descEl = document.getElementById('shuttle-desc');
  const statusEl = document.getElementById('shuttleStatus');
  
  if (timeEl) timeEl.textContent = route.time;
  if (descEl) descEl.textContent = route.desc;
  if (statusEl) {
    statusEl.className = `status-badge status-${route.status}`;
    statusEl.innerHTML =
      route.status === 'running'
        ? '<span>🟢</span><span>운행중</span>'
        : '<span>🔴</span><span>운행종료</span>';
  }
}

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
    const hotPosts = await hotRes.json();
    renderCommunityPosts(livePosts, hotPosts);
  } catch (err) {
    console.warn('커뮤니티 데이터 로드 실패, fallback 데이터 사용:', err);
    renderCommunityPosts(
      fallbackData.communityPosts.live,
      fallbackData.communityPosts.hot
    );
  }
}

function renderCommunityPosts(livePosts, hotPosts) {
  const liveEl = document.getElementById('livePosts');
  const hotEl = document.getElementById('hotPosts');
  
  if (!liveEl || !hotEl) return;
  
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
}

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
    const recent = await recRes.json();
    renderLectureReviews(popular, recent);
} catch (err) {
    console.warn('강의평가 데이터 로드 실패, fallback 데이터 사용:', err);
    renderLectureReviews(
      fallbackData.lectureReviews.popular,
      fallbackData.lectureReviews.recent
    );
  }
}

function renderLectureReviews(popular, recent) {
  const popEl = document.getElementById('popularReviews');
  const recEl = document.getElementById('recentReviews');
  
  if (!popEl || !recEl) return;
  
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
}

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
      console.warn('시간표 로드 오류:', err);
      contentEl.innerHTML = `
        <div class="empty-state">
          <h3>📅 시간표 없음</h3>
          <p>등록된 시간표가 없거나 불러올 수 없습니다</p>
        </div>
      `;
    });
}

function renderTimetable(courses) {
  const contentEl = document.getElementById('timetableContent');
  if (!contentEl) return;
  
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

function markAsRead(el, id) {
  if (el.classList.contains('unread')) {
    el.classList.remove('unread');
    unreadNotifications--;
    
    if (isOnline) {
      fetch(`/api/notifications/${id}/read`, { method: 'POST' })
        .catch(err => console.warn('알림 읽음 처리 실패:', err));
    }
    
    updateNotificationCount();
  }
}

function markAllAsRead() {
  document.querySelectorAll('.notification-item.unread').forEach((item) => {
    item.classList.remove('unread');
  });
  
  if (isOnline) {
    fetch('/api/notifications/mark-all-read', { method: 'POST' })
      .catch(err => console.warn('전체 알림 읽음 처리 실패:', err));
  }
  
  unreadNotifications = 0;
  updateNotificationCount();
  showMessage('모든 알림을 읽음 처리했습니다.', 'success');
}

function updateNotificationCount() {
  const countEl = document.getElementById('notification-badge');
  const dotEl = document.getElementById('notification-dot');
  
  if (countEl) countEl.textContent = unreadNotifications;
  if (dotEl) dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
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

function closeAllDropdowns() {
  closeNotificationDropdown();
  closeUserDropdown();
}

function showProfile() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (currentUser) {
    showContent('profile');
  } else {
    showMessage('로그인이 필요한 서비스입니다.', 'error');
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
    showMessage('로그인 상태가 아닙니다.', 'error');
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
    setTimeout(() => {
      if (naverMap) naverMap.refresh();
    }, 100);
  }
}

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

function checkUserStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  
  if (currentUser && isOnline) {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then((res) => {
        if (!res.ok) throw new Error('API 응답 오류');
        return res.json();
      })
      .then((user) => {
        if (userNameEl) userNameEl.textContent = user.name || '사용자';
        if (userRoleEl) userRoleEl.textContent = departmentMap[user.department] || '학생';
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

function setGuestMode() {
  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');
  const avatarEl = document.getElementById('user-avatar');
  
  if (userNameEl) userNameEl.textContent = '게스트';
  if (userRoleEl) userRoleEl.textContent = '방문자';
  if (dropdownNameEl) dropdownNameEl.textContent = '게스트';
  if (dropdownRoleEl) dropdownRoleEl.textContent = '방문자';
  if (avatarEl) avatarEl.textContent = '👤';
}

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
    
    // 정기적 업데이트
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
    updateTimetable();
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
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
  if (!navigator.geolocation) {
    showMessage('위치 서비스를 지원하지 않습니다', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (!naverMap) {
        showMessage('지도가 초기화되지 않았습니다', 'error');
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
      showMessage('현재 위치를 찾았습니다', 'success');
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
      showMessage(message, 'error');
    }
  );
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
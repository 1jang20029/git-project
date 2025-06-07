// index.js - 백엔드(Node.js + MySQL) 연동 버전
// 메인 페이지 및 전역 기능 관리

/**
 * API 설정
 */
const API_BASE_URL = '/api';
const API_ENDPOINTS = {
    // 인증 관련
    auth: {
        logout: `${API_BASE_URL}/auth/logout`,
        refresh: `${API_BASE_URL}/auth/refresh`,
        me: `${API_BASE_URL}/auth/me`
    },
    // 대시보드 관련
    dashboard: {
        stats: `${API_BASE_URL}/dashboard/stats`,
        notifications: `${API_BASE_URL}/notifications`,
        buildings: `${API_BASE_URL}/buildings`,
        notices: `${API_BASE_URL}/notices`,
        shuttleInfo: `${API_BASE_URL}/shuttle/routes`,
        lectureReviews: `${API_BASE_URL}/reviews`,
        timetable: `${API_BASE_URL}/user/timetable`
    },
    // 사용자 관련
    user: {
        profile: `${API_BASE_URL}/user/profile`,
        departments: `${API_BASE_URL}/departments`
    },
    // 검색 관련
    search: {
        buildings: `${API_BASE_URL}/buildings/search`,
        notices: `${API_BASE_URL}/notices/search`
    }
};

/**
 * 전역 변수 선언
 */
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

// 페이지 로드 상태 관리
let settingsLoaded = false;
let communityLoaded = false;
let lectureLoaded = false;
let noticesLoaded = false;

// 자동 로그아웃 타이머 ID
let autoLogoutTimer = null;

/**
 * 토큰 관리 유틸리티 (login.js와 동일)
 */
const TokenManager = {
    setToken(token) {
        try {
            localStorage.setItem('authToken', token);
            const payload = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem('tokenExpiry', payload.exp * 1000);
        } catch (error) {
            console.error('토큰 저장 실패:', error);
        }
    },

    getToken() {
        return localStorage.getItem('authToken');
    },

    removeToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
    },

    isTokenExpired() {
        const expiry = localStorage.getItem('tokenExpiry');
        if (!expiry) return true;
        return Date.now() > parseInt(expiry);
    },

    setRefreshToken(refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    },

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }
};

/**
 * API 클라이언트 유틸리티
 */
const ApiClient = {
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const token = TokenManager.getToken();
        if (token && !TokenManager.isTokenExpired()) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (response.status === 401 && TokenManager.getRefreshToken()) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    defaultOptions.headers['Authorization'] = `Bearer ${TokenManager.getToken()}`;
                    return await fetch(url, { ...defaultOptions, ...options });
                }
            }

            return response;
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    },

    async get(url, options = {}) {
        return this.request(url, { method: 'GET', ...options });
    },

    async post(url, data, options = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },

    async put(url, data, options = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    },

    async delete(url, options = {}) {
        return this.request(url, { method: 'DELETE', ...options });
    },

    async refreshToken() {
        try {
            const refreshToken = TokenManager.getRefreshToken();
            if (!refreshToken) return false;

            const response = await fetch(API_ENDPOINTS.auth.refresh, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                TokenManager.setToken(data.token);
                if (data.refreshToken) {
                    TokenManager.setRefreshToken(data.refreshToken);
                }
                return true;
            }
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
        }
        
        TokenManager.removeToken();
        return false;
    }
};

/**
 * 테마 관리 (라이트/다크 모드)
 */
(function initializeTheme() {
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode === 'true') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
})();

/**
 * 네트워크 상태 변화 감지
 */
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

/**
 * 메시지 표시 유틸리티
 */
function showMessage(message, type = 'info', category = '') {
    if (category && !isCategoryEnabled(category)) return;
    if (!shouldShowNotification()) return;

    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                   type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                   'rgba(59, 130, 246, 0.9)';
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

/**
 * 콘텐츠 전환 (SPA 라우팅)
 */
function showContent(type) {
    const panes = [
        'homeContent',
        'buildingsContent',
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

    // 동적 로드 컨테이너들 숨김
    const communityContainer = document.getElementById('communityContent');
    if (communityContainer) communityContainer.style.display = 'none';

    // 보여줄 화면 결정
    let targetId = 'homeContent';
    switch (type) {
        case 'home': targetId = 'homeContent'; break;
        case 'buildings': targetId = 'buildingsContent'; break;
        case 'community': targetId = 'communityContent'; break;
        case 'lecture-review': targetId = 'lecture-reviewContent'; break;
        case 'notices': targetId = 'noticesContent'; break;
        case 'timetable': targetId = 'timetableContentPane'; break;
        case 'shuttle': targetId = 'shuttleContentPane'; break;
        case 'calendar': targetId = 'calendarContentPane'; break;
        case 'profile': targetId = 'profileContentPane'; break;
        case 'settings': targetId = 'settingsContent'; break;
        default: targetId = 'homeContent';
    }

    // 동적 로드가 필요한 페이지들 처리
    if (type === 'settings' && !settingsLoaded) {
        loadSettingsPage();
    } else if (type === 'community' && !communityLoaded) {
        loadCommunityPage();
    } else if (type === 'lecture-review' && !lectureLoaded) {
        loadLectureReviewPage();
    } else if (type === 'notices' && !noticesLoaded) {
        loadNoticesPage();
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

/**
 * 동적 페이지 로더들
 */
async function loadSettingsPage() {
    const container = document.getElementById('settingsContent');
    if (!container) return;

    try {
        const response = await fetch('settings.html');
        if (!response.ok) throw new Error('설정 페이지 로드 실패');
        const html = await response.text();
        container.innerHTML = html;
        settingsLoaded = true;
        if (window.initSettingsPage) window.initSettingsPage();
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="error-fallback">
                <h3>⚠️ 오류 발생</h3>
                <p>설정 화면을 불러올 수 없습니다</p>
            </div>
        `;
    }
}

async function loadCommunityPage() {
    const container = document.getElementById('communityContent');
    if (!container) return;

    try {
        const response = await fetch('community.html');
        if (!response.ok) throw new Error('커뮤니티 페이지 로드 실패');
        const html = await response.text();
        container.innerHTML = html;
        communityLoaded = true;
        if (window.initCommunityPage) window.initCommunityPage();
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="error-fallback">
                <h3>⚠️ 오류 발생</h3>
                <p>커뮤니티 화면을 불러올 수 없습니다</p>
            </div>
        `;
    }
}

async function loadLectureReviewPage() {
    const container = document.getElementById('lecture-reviewContent');
    if (!container) return;

    try {
        const response = await fetch('lecture-review.html');
        if (!response.ok) throw new Error('강의평가 페이지 로드 실패');
        const html = await response.text();
        container.innerHTML = html;
        lectureLoaded = true;
        if (window.initLectureReviewPage) window.initLectureReviewPage();
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="error-fallback">
                <h3>⚠️ 오류 발생</h3>
                <p>강의평가 화면을 불러올 수 없습니다</p>
            </div>
        `;
    }
}

async function loadNoticesPage() {
    const container = document.getElementById('noticesContent');
    if (!container) return;

    try {
        const response = await fetch('notices.html');
        if (!response.ok) throw new Error('공지사항 페이지 로드 실패');
        const html = await response.text();
        container.innerHTML = html;
        noticesLoaded = true;
        if (window.initNoticesPage) window.initNoticesPage();
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="error-fallback">
                <h3>⚠️ 오류 발생</h3>
                <p>공지사항 화면을 불러올 수 없습니다</p>
            </div>
        `;
    }
}

/**
 * 앱 초기화
 */
async function initializeApp() {
    try {
        await checkAuthStatus();
        await loadDepartments();
        initNaverMap();
        
        await Promise.all([
            loadStats(),
            loadNotifications(),
            loadBuildings(),
            loadNotices(),
            loadShuttleInfo(),
            loadLectureReviews()
        ]);
        
        updateTimetable();

        // 1분마다 데이터 갱신
        setInterval(() => {
            if (isOnline && TokenManager.getToken()) {
                loadShuttleInfo();
                updateTimetable();
                loadNotifications();
            }
        }, 60000);

    } catch (error) {
        console.error('앱 초기화 오류:', error);
        showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
    }
}

/**
 * 사용자 인증 상태 확인
 */
async function checkAuthStatus() {
    const token = TokenManager.getToken();
    
    if (!token) {
        setGuestMode();
        return false;
    }
    
    if (TokenManager.isTokenExpired()) {
        const refreshed = await ApiClient.refreshToken();
        if (!refreshed) {
            setGuestMode();
            return false;
        }
    }
    
    try {
        const response = await ApiClient.get(API_ENDPOINTS.auth.me);
        if (response && response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                updateUserInfo(data.user);
                return true;
            }
        }
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
    }
    
    setGuestMode();
    return false;
}

/**
 * 사용자 정보 업데이트
 */
function updateUserInfo(user) {
    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');
    const dropdownNameEl = document.getElementById('dropdown-user-name');
    const dropdownRoleEl = document.getElementById('dropdown-user-role');
    const avatarEl = document.getElementById('user-avatar');

    if (userNameEl) userNameEl.textContent = user.name || '사용자';
    if (userRoleEl) userRoleEl.textContent = departmentMap[user.department] || '학생';
    if (dropdownNameEl) dropdownNameEl.textContent = user.name || '사용자';
    if (dropdownRoleEl) dropdownRoleEl.textContent = departmentMap[user.department] || '학생';
    
    updateProfileImage(user);
    
    // 현재 사용자 정보 저장
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * 게스트 모드 설정
 */
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

/**
 * 프로필 이미지 업데이트
 */
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

/**
 * 학과 데이터 로드
 */
async function loadDepartments() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const response = await ApiClient.get(API_ENDPOINTS.user.departments);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.departments) {
            data.departments.forEach((item) => {
                departmentMap[item.code] = item.name;
            });
        }
    } catch (err) {
        console.error('학과 데이터 로드 실패:', err);
    }
}

/**
 * 통계 데이터 로드
 */
async function loadStats() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const response = await ApiClient.get(API_ENDPOINTS.dashboard.stats);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.stats) {
            renderStats(data.stats);
        } else {
            throw new Error('통계 데이터가 없습니다');
        }
    } catch (err) {
        console.error('통계 데이터 로드 실패:', err);
        renderStats({
            totalBuildings: 0,
            totalStudents: 0,
            activeServices: 0,
            todayEvents: 0,
            newBuildingsText: '데이터 없음',
            studentGrowthText: '데이터 없음',
            newServicesText: '데이터 없음'
        });
    }
}

/**
 * 통계 데이터 렌더링
 */
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

/**
 * 알림 데이터 로드
 */
async function loadNotifications() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const response = await ApiClient.get(API_ENDPOINTS.dashboard.notifications);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.notifications) {
            renderNotifications(data.notifications);
        } else {
            renderNotifications([]);
        }
    } catch (err) {
        console.error('알림 데이터 로드 실패:', err);
        renderNotifications([]);
    }
}

/**
 * 알림 목록 렌더링
 */
function renderNotifications(notifications) {
    const listEl = document.getElementById('notification-list');
    const countEl = document.getElementById('notification-badge');
    if (!listEl || !countEl) return;

    listEl.innerHTML = '';
    unreadNotifications = 0;

    notifications.forEach((n) => {
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

/**
 * 알림 읽음 처리
 */
async function markAsRead(el, id, category) {
    if (el.classList.contains('unread')) {
        el.classList.remove('unread');
        unreadNotifications--;
        
        if (isOnline && TokenManager.getToken()) {
            try {
                await ApiClient.post(`${API_ENDPOINTS.dashboard.notifications}/${id}/read`);
            } catch (err) {
                console.error('알림 읽음 처리 실패:', err);
            }
        }
        updateNotificationCount();
    }
}

/**
 * 모든 알림 읽음 처리
 */
async function markAllAsRead() {
    document.querySelectorAll('.notification-item.unread').forEach((item) => {
        item.classList.remove('unread');
    });

    if (isOnline && TokenManager.getToken()) {
        try {
            await ApiClient.post(`${API_ENDPOINTS.dashboard.notifications}/mark-all-read`);
        } catch (err) {
            console.error('전체 알림 읽음 처리 실패:', err);
        }
    }

    unreadNotifications = 0;
    updateNotificationCount();
    showMessage('모든 알림을 읽음 처리했습니다.', 'success');
}

/**
 * 알림 카운트 업데이트
 */
function updateNotificationCount() {
    const countEl = document.getElementById('notification-badge');
    const dotEl = document.getElementById('notification-dot');
    if (countEl) countEl.textContent = unreadNotifications;
    if (dotEl) dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

/**
 * 건물 데이터 로드
 */
async function loadBuildings() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const response = await ApiClient.get(API_ENDPOINTS.dashboard.buildings);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.buildings) {
            renderBuildings(data.buildings);
            addMapMarkers(data.buildings);
        } else {
            renderBuildings([]);
            addMapMarkers([]);
        }
    } catch (err) {
        console.error('건물 데이터 로드 실패:', err);
        renderBuildings([]);
        addMapMarkers([]);
    }
}

/**
 * 건물 카드 렌더링
 */
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
                <button class="btn btn-primary" onclick="showBuildingOnMap('${b.id}')">📍 지도에서 보기</button>
                <button class="btn btn-outline" onclick="getBuildingDirections('${b.id}')">🧭 길찾기</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * 공지사항 데이터 로드 (메인 페이지용)
 */
async function loadNotices() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const response = await ApiClient.get(`${API_ENDPOINTS.dashboard.notices}?limit=2`);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.notices) {
            renderNoticesMain(data.notices);
        } else {
            renderNoticesMain([]);
        }
    } catch (err) {
        console.error('공지사항 데이터 로드 실패:', err);
        renderNoticesMain([]);
    }
}

/**
 * 메인 페이지 공지사항 렌더링
 */
function renderNoticesMain(notices) {
    const recentEl = document.getElementById('recentNotices');
    if (!recentEl) return;
    
    recentEl.innerHTML = '';
    notices.forEach((n) => {
        const item = document.createElement('div');
        item.className = 'notice-item';
        item.onclick = () => viewNoticeDetail(n.id);
        item.innerHTML = `
            <div class="notice-header">
                <span class="notice-category">${n.category_name || '일반'}</span>
                <span class="notice-date">${formatDate(n.published_at)}</span>
            </div>
            <div class="notice-title">${n.title}</div>
            <div class="notice-summary">${n.content ? n.content.slice(0, 100) + '…' : ''}</div>
        `;
        recentEl.appendChild(item);
    });
}

/**
 * 셔틀버스 정보 로드
 */
async function loadShuttleInfo() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const response = await ApiClient.get(API_ENDPOINTS.dashboard.shuttleInfo);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.routes) {
            renderShuttleRoutes(data.routes);
            if (data.routes.length > 0) {
                selectShuttleRoute(data.routes[0].id, data.routes[0]);
            }
        } else {
            renderShuttleRoutes([]);
            selectShuttleRoute(null, null);
        }
    } catch (err) {
        console.error('셔틀버스 데이터 로드 실패:', err);
        renderShuttleRoutes([]);
        selectShuttleRoute(null, null);
    }
}

/**
 * 셔틀 루트 탭 렌더링
 */
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
            <div class="route-desc">${r.description}</div>
        `;
        tabs.appendChild(tab);
    });
}

/**
 * 셔틀 루트 선택 및 상태 렌더링
 */
async function selectShuttleRoute(routeId, route) {
    try {
        document.querySelectorAll('.route-tab').forEach((tab) => tab.classList.remove('active'));
        const tabs = Array.from(document.querySelectorAll('.route-tab'));
        const selectedTab = tabs.find((t) => route && t.textContent.includes(route.name));
        if (selectedTab) selectedTab.classList.add('active');
        
        if (!route) throw new Error('유효한 노선 없음');
        
        renderShuttleStatus(route);
    } catch (err) {
        console.error('셔틀 노선 선택 오류:', err);
        renderShuttleStatus({ time: '--', description: '--', status: 'stopped' });
    }
}

/**
 * 셔틀 상태 렌더링
 */
function renderShuttleStatus(route) {
    const timeEl = document.getElementById('shuttle-time');
    const descEl = document.getElementById('shuttle-desc');
    const statusEl = document.getElementById('shuttleStatus');
    
    if (timeEl) timeEl.textContent = route.nextArrival || route.time || '--';
    if (descEl) descEl.textContent = route.description || route.desc || '--';
    
    if (statusEl) {
        const status = route.status === 'running' || route.isActive ? 'running' : 'stopped';
        statusEl.className = `status-badge status-${status}`;
        statusEl.innerHTML = status === 'running'
            ? '<span>🟢</span><span>운행중</span>'
            : '<span>🔴</span><span>운행종료</span>';
    }
}

/**
 * 강의평가 데이터 로드 (메인 페이지용)
 */
async function loadLectureReviews() {
    try {
        if (!isOnline) throw new Error('오프라인 모드');
        
        const [popRes, recRes] = await Promise.all([
            ApiClient.get(`${API_ENDPOINTS.dashboard.lectureReviews}/popular?limit=2`),
            ApiClient.get(`${API_ENDPOINTS.dashboard.lectureReviews}/recent?limit=2`)
        ]);

        if (!popRes.ok || !recRes.ok) throw new Error('API 응답 오류');

        const popData = await popRes.json();
        const recData = await recRes.json();
        
        const popular = popData.success ? popData.reviews : [];
        const recent = recData.success ? recData.reviews : [];
        
        renderLectureReviewsMain(popular, recent);
    } catch (err) {
        console.error('강의평가 데이터 로드 실패:', err);
        renderLectureReviewsMain([], []);
    }
}

/**
 * 메인 페이지 강의평가 렌더링
 */
function renderLectureReviewsMain(popular, recent) {
    const popEl = document.getElementById('popularReviews');
    const recEl = document.getElementById('recentReviews');
    if (!popEl || !recEl) return;

    popEl.innerHTML = '';
    recEl.innerHTML = '';

    popular.forEach((r) => {
        if (!isCategoryEnabled('강의평가')) return;
        const item = document.createElement('div');
        item.className = 'notice-item';
        item.innerHTML = `
            <div class="notice-header">
                <span class="notice-category">${r.subject || r.category || ''}</span>
                <span class="notice-date" style="color:#f59e0b;">
                    ${'★'.repeat(Math.floor(r.rating)) + '☆'.repeat(5 - Math.floor(r.rating))}
                </span>
            </div>
            <div class="notice-title">${r.title || r.subject}</div>
            <div class="notice-summary">"${r.comment || r.content}"</div>
            <div style="margin-top:0.5rem; color:#3b82f6; font-size:0.9rem; font-weight:600;">
                평점: ${r.rating}/5.0 | ${departmentMap[r.department] || r.department || r.professor}
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
                <span class="notice-category">${r.subject || r.category}</span>
                <span class="notice-date">${formatDate(r.created_at) || r.timeAgo}</span>
            </div>
            <div class="notice-title">${r.title || r.subject}</div>
            <div class="notice-summary">"${r.comment || r.content}"</div>
            <div style="margin-top:0.5rem; color:#3b82f6; font-size:0.9rem; font-weight:600;">
                평점: ${r.rating}/5.0 | ${departmentMap[r.department] || r.department || r.professor}
            </div>
        `;
        recEl.appendChild(item);
    });
}

/**
 * 시간표 정보 업데이트
 */
async function updateTimetable() {
    const contentEl = document.getElementById('timetableContent');
    if (!contentEl) return;

    const token = TokenManager.getToken();
    if (!token) {
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

    try {
        const response = await ApiClient.get(API_ENDPOINTS.dashboard.timetable);
        if (!response.ok) throw new Error('API 응답 오류');
        
        const data = await response.json();
        if (data.success && data.courses) {
            renderTimetable(data.courses);
        } else {
            throw new Error('시간표 데이터가 없습니다');
        }
    } catch (err) {
        console.error('시간표 로드 오류:', err);
        contentEl.innerHTML = `
            <div class="empty-state">
                <h3>📅 시간표 없음</h3>
                <p>등록된 시간표가 없거나 불러올 수 없습니다</p>
            </div>
        `;
    }
}

/**
 * 시간표 렌더링
 */
function renderTimetable(courses) {
    const contentEl = document.getElementById('timetableContent');
    if (!contentEl) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayCourses = [];

    courses.forEach((course) => {
        if (course.times && Array.isArray(course.times)) {
            course.times.forEach((time) => {
                if (time.day === currentDay || (currentDay === 0 && time.day === 6)) {
                    const startHour = 8 + (time.start || 0);
                    const startMinute = 30;
                    const startTime = startHour * 60 + startMinute;
                    const endHour = 8 + (time.end || time.start || 0) + 1;
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
                        name: course.name || course.subject,
                        room: course.room || course.location,
                        professor: course.professor || course.instructor,
                        status,
                        timeInfo,
                        displayTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
                        startTime,
                    });
                }
            });
        }
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

/**
 * 남은 시간 포맷팅
 */
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

/**
 * 날짜 포맷팅 유틸리티
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '오늘';
        } else if (diffDays === 2) {
            return '어제';
        } else if (diffDays <= 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (error) {
        return dateString;
    }
}

/**
 * 네이버 지도 초기화
 */
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

/**
 * 지도에 건물 마커 추가
 */
function addMapMarkers(buildings) {
    if (!naverMap) return;
    
    try {
        // 기존 마커 제거
        mapMarkers.forEach((m) => m.setMap(null));
        infoWindows.forEach((iw) => iw.close());
        mapMarkers = [];
        infoWindows = [];

        buildings.forEach((b) => {
            if (!b.position || !b.position.lat || !b.position.lng) return;
            
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

/**
 * 에러 폴백 화면 표시
 */
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

/**
 * 알림 드롭다운 관리
 */
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

/**
 * 사용자 메뉴 관리
 */
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    const token = TokenManager.getToken();

    if (!token) {
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

/**
 * 모든 드롭다운 닫기
 */
function closeAllDropdowns() {
    closeNotificationDropdown();
    closeUserDropdown();
    closeStudentServiceDropdown();
}

function closeStudentServiceDropdown() {
    const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
    if (dropdown) dropdown.removeAttribute('style');
}

/**
 * 프로필 페이지 표시
 */
async function showProfile() {
    const token = TokenManager.getToken();
    if (!token) {
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

        // account-edit.js 스크립트 동적 로드
        const script = document.createElement('script');
        script.src = 'account-edit.js';
        script.defer = true;
        
        script.onload = function() {
            console.log('account-edit.js 로드 완료');
        };
        
        script.onerror = function() {
            console.error('account-edit.js 로드 실패');
            showMessage('계정 편집 스크립트를 불러올 수 없습니다.', 'error');
        };
        
        document.head.appendChild(script);
        
    } catch (err) {
        console.error(err);
        if (container) {
            container.innerHTML = `
                <div class="error-fallback">
                    <h3>⚠️ 오류 발생</h3>
                    <p>계정 편집 화면을 불러올 수 없습니다</p>
                    <button onclick="showContent('home')" class="btn btn-primary" style="margin-top: 1rem;">
                        홈으로 돌아가기
                    </button>
                </div>
            `;
        }
    }
}

/**
 * 로그아웃 처리
 */
async function handleLogout() {
    const token = TokenManager.getToken();
    if (token) {
        if (confirm('로그아웃 하시겠습니까?')) {
            try {
                // 서버에 로그아웃 요청
                await ApiClient.post(API_ENDPOINTS.auth.logout, { token });
            } catch (error) {
                console.error('로그아웃 API 요청 실패:', error);
            } finally {
                // 로컬 데이터 삭제
                TokenManager.removeToken();
                closeUserDropdown();
                showMessage('로그아웃되었습니다.', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        }
    } else {
        showMessage('로그인 상태가 아닙니다.', 'error');
    }
}

/**
 * 전역 검색 처리
 */
async function handleGlobalSearch() {
    const query = document.getElementById('search-input')?.value?.trim().toLowerCase();
    if (!query) return;

    if (!isOnline) {
        showMessage('오프라인 상태에서는 검색을 사용할 수 없습니다', 'error');
        return;
    }

    if (!TokenManager.getToken()) {
        showMessage('검색을 사용하려면 로그인이 필요합니다', 'error');
        return;
    }

    try {
        // 건물 검색 시도
        const buildingRes = await ApiClient.get(`${API_ENDPOINTS.search.buildings}?q=${encodeURIComponent(query)}`);
        if (buildingRes && buildingRes.ok) {
            showContent('buildings');
            document.getElementById('search-input').value = '';
            return;
        }

        // 공지사항 검색 시도
        const noticeRes = await ApiClient.get(`${API_ENDPOINTS.search.notices}?q=${encodeURIComponent(query)}`);
        if (noticeRes && noticeRes.ok) {
            showContent('notices');
            document.getElementById('search-input').value = '';
            return;
        }

        showMessage('검색 결과를 찾을 수 없습니다.', 'info');
    } catch (error) {
        console.error('검색 오류:', error);
        showMessage('검색 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 지도 컨트롤 함수들
 */
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
            showMessage('현재 위치를 찾았습니다', 'success');
        },
        (error) => {
            let message = '위치를 찾을 수 없습니다';
            switch (error.code) {
                case error.PERMISSION_DENIED: message = '위치 권한이 거부되었습니다'; break;
                case error.POSITION_UNAVAILABLE: message = '위치 정보를 사용할 수 없습니다'; break;
                case error.TIMEOUT: message = '위치 요청 시간이 초과되었습니다'; break;
            }
            showMessage(message, 'error');
        }
    );
}

/**
 * 네비게이션 함수들
 */
function navigateToTimetable() {
    showContent('timetable');
}

function navigateToShuttle() {
    showContent('shuttle');
}

function navigateToCalendar() {
    showContent('calendar');
}

function showBuildingOnMap(buildingId) {
    showContent('buildings');
    setTimeout(() => {
        if (naverMap && naverMap.refresh) naverMap.refresh();
    }, 100);
}

function getBuildingDirections(buildingId) {
    showMessage('길찾기 기능은 준비 중입니다', 'info');
}

function viewNoticeDetail(noticeId) {
    showMessage('공지사항 상세보기는 준비 중입니다', 'info');
}

/**
 * 알림 설정 관련 함수들
 */
function shouldShowNotification() {
    const dnd = JSON.parse(localStorage.getItem('doNotDisturb')) || { enabled: false };
    if (!dnd.enabled) return true;

    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const startHM = dnd.startHour * 60 + dnd.startMinute;
    const endHM = dnd.endHour * 60 + dnd.endMinute;

    if (startHM < endHM) {
        return !(totalMinutes >= startHM && totalMinutes < endHM);
    } else {
        return !((totalMinutes >= startHM && totalMinutes < 1440) || (totalMinutes < endHM));
    }
}

function isCategoryEnabled(category) {
    const catSettings = JSON.parse(localStorage.getItem('notificationCategories')) || {};
    return catSettings[category] === true;
}

/**
 * 자동 로그아웃 설정
 */
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
        TokenManager.removeToken();
        showMessage('자동 로그아웃되었습니다', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }, timeoutMs);
}

/**
 * 키보드 단축키 설정
 */
function applyKeyboardShortcuts() {
    const shortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || {
        toggleSidebar: 'F2',
        openNotifications: 'F3',
        goToSettings: 'F4'
    };
    
    document.addEventListener('keydown', (e) => {
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

function applyUserShortcuts() {
    document.addEventListener('keydown', (e) => {
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
        if (label.includes('내 시간표') || label.includes('시간표')) { showContent('timetable'); return; }
        if (label.includes('셔틀버스') || label.includes('셔틀')) { showContent('shuttle'); return; }
        if (label.includes('학사일정') || label.includes('학사')) { showContent('calendar'); return; }
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

/**
 * 스토리지 변경 이벤트 처리
 */
window.addEventListener('storage', (event) => {
    if (event.key === 'authToken') {
        if (!event.newValue) {
            // 토큰이 삭제되면 게스트 모드로 전환
            setGuestMode();
        } else {
            // 토큰이 추가/변경되면 사용자 정보 갱신
            checkAuthStatus();
        }
    }
    
    if (event.key === 'lightMode') {
        const savedMode = localStorage.getItem('lightMode');
        if (savedMode === 'true') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }
    
    if (event.key === 'currentUser') {
        // 사용자 정보가 변경되면 UI 업데이트
        if (event.newValue) {
            try {
                const user = JSON.parse(event.newValue);
                updateUserInfo(user);
            } catch (error) {
                console.error('사용자 정보 파싱 오류:', error);
            }
        }
    }
});

/**
 * 페이지 복원 이벤트 처리
 */
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // 페이지가 캐시에서 복원된 경우
        checkAuthStatus();
        updateTimetable();
        
        // 테마 설정 복원
        const savedMode = localStorage.getItem('lightMode');
        if (savedMode === 'true') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }
});

/**
 * 페이지 가시성 변경 이벤트 처리
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && TokenManager.getToken()) {
        // 페이지가 다시 보이게 되면 데이터 갱신
        loadNotifications();
        if (currentContent === 'home') {
            updateTimetable();
        }
    }
});

/**
 * 초기 로드 시 실행
 */
document.addEventListener('DOMContentLoaded', () => {
    // URL hash에 따라 초기 화면 결정
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash + 'Content')) {
        showContent(hash);
    } else {
        showContent('home');
    }

    // 앱 초기화
    initializeApp();
    
    // 이벤트 리스너 설정
    setupNetworkListeners();
    setupAutoLogout();
    applyKeyboardShortcuts();
    applyUserShortcuts();

    // ESC 키로 드롭다운 닫기
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllDropdowns();
        }
        resetAutoLogoutTimer();
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
        
        if (!ntBtn) closeNotificationDropdown();
        if (!upBtn) closeUserDropdown();
        if (!ssBtn) closeStudentServiceDropdown();

        resetAutoLogoutTimer();
    });

    // 온라인/오프라인 상태 초기 확인
    if (!navigator.onLine) {
        isOnline = false;
        showMessage('오프라인 상태입니다. 일부 기능이 제한됩니다.', 'info');
    }
});

/**
 * 에러 핸들링 - 전역 에러 캐치
 */
window.addEventListener('error', (event) => {
    console.error('전역 에러:', event.error);
    
    // 네트워크 관련 에러인 경우
    if (event.error?.message?.includes('fetch') || event.error?.name === 'TypeError') {
        if (!isOnline) {
            showMessage('오프라인 상태에서는 일부 기능을 사용할 수 없습니다', 'info');
        } else {
            showMessage('서버와의 연결에 문제가 있습니다', 'error');
        }
    }
});

/**
 * Promise rejection 핸들링
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise rejection:', event.reason);
    
    // API 관련 에러인 경우
    if (event.reason?.message?.includes('fetch') || event.reason?.name === 'TypeError') {
        event.preventDefault(); // 콘솔 에러 방지
        
        if (!isOnline) {
            showMessage('오프라인 상태입니다', 'info');
        } else {
            showMessage('서버 연결에 문제가 있습니다', 'error');
        }
    }
});

// 전역 함수 내보내기 (HTML에서 직접 호출 가능)
window.showContent = showContent;
window.showProfile = showProfile;
window.handleLogout = handleLogout;
window.toggleNotifications = toggleNotifications;
window.toggleUserMenu = toggleUserMenu;
window.markAllAsRead = markAllAsRead;
window.handleGlobalSearch = handleGlobalSearch;
window.navigateToTimetable = navigateToTimetable;
window.navigateToShuttle = navigateToShuttle;
window.navigateToCalendar = navigateToCalendar;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetMapView = resetMapView;
window.trackUserLocation = trackUserLocation;
window.showBuildingOnMap = showBuildingOnMap;
window.getBuildingDirections = getBuildingDirections;
window.viewNoticeDetail = viewNoticeDetail;
window.closeAllDropdowns = closeAllDropdowns;

// 디버깅을 위한 전역 객체 노출
if (typeof window !== 'undefined') {
    window.SmartCampusDebug = {
        TokenManager,
        ApiClient,
        currentContent,
        isOnline,
        unreadNotifications,
        departmentMap
    };
}
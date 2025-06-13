// index.js - 중복 제거 및 정리된 완전한 버전

// ═══════════════════════════════════════════════════════════════
// 전역 변수 및 상수
// ═══════════════════════════════════════════════════════════════

// 앱 상태 변수
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;
let autoLogoutTimer = null;

// 페이지 로드 상태
const pageLoadState = {
  settings: false,
  community: false,
  lecture: false,
  notices: false,
  buildings: false,
  academicCalendar: false
};

// 학과 코드 매핑
const departmentMap = {};

// 외부 페이지 URL
const EXTERNAL_PAGES = {
  timetable: 'pages/list/timetable.html',
  calendar: 'pages/list/academic-calendar.html',
  shuttle: 'pages/list/shuttle.html'
};

// ═══════════════════════════════════════════════════════════════
// 유틸리티 함수들
// ═══════════════════════════════════════════════════════════════

const Utils = {
  // DOM 요소 안전하게 가져오기
  getElement: (id) => document.getElementById(id),
  
  // 시간 포맷팅
  formatTimeRemaining: (minutes, suffix) => {
    if (minutes < 60) {
      return `${minutes}분 ${suffix}`;
    }
    const hours = Math.floor(minutes / 60);
    const remain = minutes % 60;
    return remain === 0 ? `${hours}시간 ${suffix}` : `${hours}시간 ${remain}분 ${suffix}`;
  },

  // 현재 학기 계산
  getCurrentSemester: () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (currentMonth >= 3 && currentMonth <= 6) {
      return { year: currentYear, term: 1 };
    } else if (currentMonth >= 9 && currentMonth <= 12) {
      return { year: currentYear, term: 2 };
    } else {
      return { year: currentYear - 1, term: 2 };
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// 페이지 네비게이션 관리
// ═══════════════════════════════════════════════════════════════

const Navigation = {
  // 외부 페이지로 이동
  toExternalPage: (pageName) => {
    console.log(`${pageName} 페이지로 이동`);
    DropdownManager.closeAll();
    
    const url = EXTERNAL_PAGES[pageName];
    if (url) {
      window.location.href = url;
    } else {
      console.error(`알 수 없는 페이지: ${pageName}`);
    }
  },

  // 개별 페이지 이동 함수들
  toTimetable: () => Navigation.toExternalPage('timetable'),
  toCalendar: () => Navigation.toExternalPage('calendar'),
  toShuttle: () => Navigation.toExternalPage('shuttle')
};

// ═══════════════════════════════════════════════════════════════
// 드롭다운 관리
// ═══════════════════════════════════════════════════════════════

const DropdownManager = {
  elements: {
    notification: () => Utils.getElement('notification-dropdown'),
    user: () => Utils.getElement('user-dropdown'),
    studentService: () => document.querySelector('#nav-student-services .dropdown-menu')
  },

  show: {
    notification: () => {
      DropdownManager.hide.user();
      const el = DropdownManager.elements.notification();
      if (el) el.classList.add('show');
    },

    user: () => {
      DropdownManager.hide.notification();
      const el = DropdownManager.elements.user();
      if (el) el.classList.add('show');
    },

    studentService: () => {
      const el = DropdownManager.elements.studentService();
      if (el) {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'translateY(0)';
        el.style.pointerEvents = 'auto';
      }
    }
  },

  hide: {
    notification: () => {
      const el = DropdownManager.elements.notification();
      if (el) el.classList.remove('show');
    },

    user: () => {
      const el = DropdownManager.elements.user();
      if (el) el.classList.remove('show');
    },

    studentService: () => {
      const el = DropdownManager.elements.studentService();
      if (el) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.transform = 'translateY(-10px)';
        el.style.pointerEvents = 'none';
      }
    }
  },

  toggle: {
    notification: () => {
      const el = DropdownManager.elements.notification();
      if (el && el.classList.contains('show')) {
        DropdownManager.hide.notification();
      } else {
        DropdownManager.show.notification();
      }
    },

    user: () => {
      const currentUser = localStorage.getItem('currentLoggedInUser');
      if (!currentUser) {
        window.location.href = 'pages/user/login.html';
        return;
      }
      
      const el = DropdownManager.elements.user();
      if (el && el.classList.contains('show')) {
        DropdownManager.hide.user();
      } else {
        DropdownManager.show.user();
      }
    }
  },

  closeAll: () => {
    DropdownManager.hide.notification();
    DropdownManager.hide.user();
    DropdownManager.hide.studentService();
  }
};

// ═══════════════════════════════════════════════════════════════
// 모바일 메뉴 관리
// ═══════════════════════════════════════════════════════════════

const MobileMenu = {
  toggle: () => {
    const mainMenu = Utils.getElement('main-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mainMenu.classList.contains('mobile-open')) {
      mainMenu.classList.remove('mobile-open');
      mobileToggle.textContent = '☰';
    } else {
      mainMenu.classList.add('mobile-open');
      mobileToggle.textContent = '✕';
    }
  },

  close: () => {
    const mainMenu = Utils.getElement('main-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mainMenu.classList.contains('mobile-open')) {
      mainMenu.classList.remove('mobile-open');
      mobileToggle.textContent = '☰';
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// 컨텐츠 관리
// ═══════════════════════════════════════════════════════════════

const ContentManager = {
  contentPanes: [
    'homeContent', 'buildingsContent', 'communityContent', 
    'lecture-reviewContent', 'noticesContent', 'timetableContentPane',
    'shuttleContentPane', 'calendarContentPane', 'academic-calendarContentPane',
    'profileContentPane', 'settingsContent'
  ],

  targetMap: {
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
  },

  hideAll: () => {
    ContentManager.contentPanes.forEach(id => {
      const el = Utils.getElement(id);
      if (el) el.style.display = 'none';
    });
  },

  show: (type) => {
    // 모든 컨텐츠 숨기기
    ContentManager.hideAll();
    
    // 드롭다운 및 모바일 메뉴 닫기
    DropdownManager.closeAll();
    MobileMenu.close();
    
    // 네비게이션 아이템 활성화 상태 변경
    document.querySelectorAll('#main-menu .nav-item').forEach(item => {
      item.classList.remove('active', 'dropdown-open');
    });
    
    const navItem = Utils.getElement('nav-' + type);
    if (navItem) navItem.classList.add('active');

    // 동적 컨텐츠 로드
    ContentManager.loadDynamicContent(type);
    
    // 타겟 컨텐츠 표시
    const targetId = ContentManager.targetMap[type] || 'homeContent';
    const targetEl = Utils.getElement(targetId);
    if (targetEl) {
      targetEl.style.display = 'block';
      targetEl.classList.add('fade-in');
    }

    // 상태 업데이트
    currentContent = type;
    window.location.hash = type;

    // 지도 새로고침 (필요한 경우)
    if ((type === 'buildings' || type === 'academic-calendar') && naverMap) {
      setTimeout(() => {
        if (naverMap.refresh) naverMap.refresh();
      }, 100);
    }
  },

  loadDynamicContent: async (type) => {
    const loadConfigs = {
      settings: { container: 'settingsContent', file: 'pages/user/settings.html', state: 'settings' },
      community: { container: 'communityContent', file: 'pages/user/community.html', state: 'community' },
      'lecture-review': { container: 'lecture-reviewContent', file: 'pages/list/lecture-review.html', state: 'lecture' },
      notices: { container: 'noticesContent', file: 'pages/list/notices.html', state: 'notices' },
      buildings: { container: 'buildingsContent', file: 'pages/list/buildings.html', state: 'buildings' }
    };

    const config = loadConfigs[type];
    if (!config || pageLoadState[config.state]) return;

    const container = Utils.getElement(config.container);
    if (!container) return;

    try {
      const res = await fetch(config.file);
      if (!res.ok) throw new Error(`${config.file} 로드 실패`);
      
      const html = await res.text();
      container.innerHTML = html;
      pageLoadState[config.state] = true;
      
      // 초기화 함수 호출 (있는 경우)
      const initFunctionName = `init${config.state.charAt(0).toUpperCase() + config.state.slice(1)}Page`;
      if (window[initFunctionName]) window[initFunctionName]();
      
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>${type} 화면을 불러올 수 없습니다</p>
        </div>
      `;
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// 사용자 관리
// ═══════════════════════════════════════════════════════════════

const UserManager = {
  checkStatus: () => {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const elements = {
      userName: Utils.getElement('user-name'),
      userRole: Utils.getElement('user-role'),
      dropdownName: Utils.getElement('dropdown-user-name'),
      dropdownRole: Utils.getElement('dropdown-user-role'),
      avatar: Utils.getElement('user-avatar')
    };

    if (currentUser && isOnline) {
      fetch(`/api/users/${encodeURIComponent(currentUser)}`)
        .then(res => {
          if (!res.ok) throw new Error('API 응답 오류');
          return res.json();
        })
        .then(user => {
          if (elements.userName) elements.userName.textContent = user.name || '사용자';
          if (elements.userRole) elements.userRole.textContent = departmentMap[user.department] || '학생';
          if (elements.dropdownName) elements.dropdownName.textContent = user.name || '사용자';
          if (elements.dropdownRole) elements.dropdownRole.textContent = departmentMap[user.department] || '학생';
          UserManager.updateProfileImage(user);
        })
        .catch(() => UserManager.setGuestMode());
    } else {
      UserManager.setGuestMode();
    }
  },

  setGuestMode: () => {
    const updates = [
      { id: 'user-name', text: '게스트' },
      { id: 'user-role', text: '방문자' },
      { id: 'dropdown-user-name', text: '게스트' },
      { id: 'dropdown-user-role', text: '방문자' },
      { id: 'user-avatar', text: '👤' }
    ];

    updates.forEach(({ id, text }) => {
      const el = Utils.getElement(id);
      if (el) el.textContent = text;
    });
  },

  updateProfileImage: (user) => {
    const avatarEl = Utils.getElement('user-avatar');
    if (!avatarEl) return;

    if (user.profileImageType === 'emoji') {
      avatarEl.textContent = user.profileImage || '👤';
    } else if (user.profileImage) {
      avatarEl.innerHTML = `<img src="${user.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="프로필">`;
    } else {
      avatarEl.textContent = '👤';
    }
  },

  logout: () => {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (currentUser) {
      if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('currentLoggedInUser');
        DropdownManager.hide.user();
        window.location.href = 'pages/user/login.html';
      }
    } else {
      MessageManager.show('로그인 상태가 아닙니다.', 'error');
    }
  },

  showProfile: async () => {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
      MessageManager.show('로그인이 필요한 서비스입니다.', 'error');
      return;
    }
    
    const container = Utils.getElement('profileContentPane');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem;">
          <div class="loading-spinner"></div>
          <span style="margin-left:0.5rem;">계정 정보를 불러오는 중...</span>
        </div>
      `;
    }
    
    ContentManager.show('profile');
    
    try {
      const res = await fetch('pages/user/account-edit.html');
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
    
    UserManager.checkStatus();
    TimetableManager.update();
  }
};

// ═══════════════════════════════════════════════════════════════
// 메시지 관리
// ═══════════════════════════════════════════════════════════════

const MessageManager = {
  show: (message, type = 'info', category = '') => {
    if (category && !NotificationManager.isCategoryEnabled(category)) return;
    if (!NotificationManager.shouldShowNotification()) return;

    const bgColors = {
      success: 'rgba(16, 185, 129, 0.9)',
      error: 'rgba(239, 68, 68, 0.9)',
      info: 'rgba(59, 130, 246, 0.9)'
    };

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    const notification = document.createElement('div');
    const bgColor = bgColors[type] || bgColors.info;
    const icon = icons[type] || icons.info;

    notification.style.cssText = `
      position: fixed; top: 100px; right: 20px;
      background: ${bgColor}; color: white;
      padding: 1rem 1.5rem; border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      z-index: 10000; font-weight: 600;
      backdrop-filter: blur(20px);
      border: 1px solid ${bgColor.replace('0.9', '0.3')};
      animation: slideInRight 0.3s ease-out;
      max-width: 400px;
    `;

    notification.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <span>${icon}</span><span>${message}</span>
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
};

// ═══════════════════════════════════════════════════════════════
// 알림 관리
// ═══════════════════════════════════════════════════════════════

const NotificationManager = {
  shouldShowNotification: () => {
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
  },

  isCategoryEnabled: (category) => {
    const catSettings = JSON.parse(localStorage.getItem('notificationCategories')) || {};
    return catSettings[category] === true;
  },

  markAllAsRead: () => {
    document.querySelectorAll('.notification-item.unread').forEach(item => {
      item.classList.remove('unread');
    });

    if (isOnline) {
      fetch('/api/notifications/mark-all-read', { method: 'POST' })
        .catch(err => console.error('전체 알림 읽음 처리 실패:', err));
    }

    unreadNotifications = 0;
    NotificationManager.updateCount();
    MessageManager.show('모든 알림을 읽음 처리했습니다.', 'success');
  },

  updateCount: () => {
    const countEl = Utils.getElement('notification-badge');
    const dotEl = Utils.getElement('notification-dot');
    if (countEl) countEl.textContent = unreadNotifications;
    if (dotEl) dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
  },

  markAsRead: (el, id, category) => {
    if (el.classList.contains('unread')) {
      el.classList.remove('unread');
      unreadNotifications--;
      if (isOnline) {
        fetch(`/api/notifications/${id}/read`, { method: 'POST' })
          .catch(err => console.error('알림 읽음 처리 실패:', err));
      }
      NotificationManager.updateCount();
    }
  },

  render: (notifications) => {
    const listEl = Utils.getElement('notification-list');
    const countEl = Utils.getElement('notification-badge');
    if (!listEl || !countEl) return;

    listEl.innerHTML = '';
    unreadNotifications = 0;

    notifications.forEach(n => {
      if (!NotificationManager.isCategoryEnabled(n.category)) return;
      if (!NotificationManager.shouldShowNotification()) return;

      const item = document.createElement('div');
      item.className = 'notification-item' + (n.unread ? ' unread' : '');
      item.onclick = () => NotificationManager.markAsRead(item, n.id, n.category);
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
    const dotEl = Utils.getElement('notification-dot');
    if (dotEl) {
      dotEl.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// 시간표 관리
// ═══════════════════════════════════════════════════════════════

const TimetableManager = {
  update: () => {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const contentEl = Utils.getElement('timetableContent');
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

    const courses = TimetableManager.loadCoursesFromLocalStorage(currentUser);
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

    TimetableManager.render(courses);
  },

  loadCoursesFromLocalStorage: (currentUser) => {
    try {
      const semester = Utils.getCurrentSemester();

      // 현재 시간표 ID 가져오기
      const currentTimetableData = localStorage.getItem(`currentTimetable_user_${currentUser}`);
      let currentTimetableId = 1;
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
      
      return savedCourses ? JSON.parse(savedCourses) : [];
    } catch (error) {
      console.error('로컬 스토리지에서 과목 로드 오류:', error);
      return [];
    }
  },

  render: (courses) => {
    const contentEl = Utils.getElement('timetableContent');
    if (!contentEl) return;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayCourses = [];

    courses.forEach(course => {
      if (!course.times || !Array.isArray(course.times)) return;
      
      course.times.forEach(timeSlot => {
        if (timeSlot.day === currentDay && currentDay !== 0) {
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
            timeInfo = Utils.formatTimeRemaining(remaining, '종료까지');
            statusText = '수강 중';
          } else if (currentTime >= endTime) {
            status = 'finished';
            timeInfo = '수업 종료';
            statusText = '수강 종료';
          } else {
            const toStart = startTime - currentTime;
            if (toStart > 0) {
              status = 'upcoming';
              timeInfo = Utils.formatTimeRemaining(toStart, '시작까지');
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
      
      const statusIcons = {
        current: '🟢',
        upcoming: '🟡', 
        finished: '🔴'
      };
      
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
          <span>${statusIcons[courseInfo.status]}</span>
          <span>${courseInfo.statusText}</span>
        </div>
      `;
      
      contentEl.appendChild(div);
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// 전역 함수들 (HTML에서 호출되는 함수들)
// ═══════════════════════════════════════════════════════════════

// 드롭다운 토글 함수들
function toggleNotifications() { DropdownManager.toggle.notification(); }
function toggleUserMenu() { DropdownManager.toggle.user(); }
function toggleMobileMenu() { MobileMenu.toggle(); }

// 페이지 이동 함수들
function openTimetablePage() { Navigation.toTimetable(); }
function openCalendarPage() { Navigation.toCalendar(); }
function openShuttlePage() { Navigation.toShuttle(); }

// 컨텐츠 표시
function showContent(contentType) { ContentManager.show(contentType); }

// 사용자 관련
function handleLogout() { UserManager.logout(); }
function showProfile() { UserManager.showProfile(); }
function markAllAsRead() { NotificationManager.markAllAsRead(); }

// 시간표 관련
function updateTimetable() { TimetableManager.update(); }

// 학생서비스 드롭다운 (모바일용)
function toggleStudentServices(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (window.innerWidth <= 768) {
    const studentServicesItem = Utils.getElement('nav-student-services');
    studentServicesItem.classList.toggle('dropdown-open');
  }
}

// ═══════════════════════════════════════════════════════════════
// 데이터 로드 및 렌더링 함수들
// ═══════════════════════════════════════════════════════════════

async function loadDepartments() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/departments');
    if (!res.ok) throw new Error('API 응답 오류');
    const list = await res.json();
    list.forEach(item => {
      departmentMap[item.code] = item.name;
    });
  } catch (err) {
    console.error('학과 데이터 로드 실패:', err);
  }
}

async function loadNotifications() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 응답 오류');
    const notifications = await res.json();
    NotificationManager.render(notifications);
  } catch (err) {
    console.error('알림 데이터 로드 실패:', err);
    NotificationManager.render([]);
  }
}

async function loadStats() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
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

function renderStats(stats) {
  const statsGrid = Utils.getElement('statsGrid');
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

async function loadBuildingsMain() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildingsMain(buildings);
    MapManager.addMarkers(buildings);
  } catch (err) {
    console.error('건물 데이터 로드 실패:', err);
    renderBuildingsMain([]);
    MapManager.addMarkers([]);
  }
}

function renderBuildingsMain(buildings) {
  const grid = Utils.getElement('buildingGrid');
  if (!grid) return;

  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.onclick = () => ContentManager.show('buildings');
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

async function loadNotices() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 응답 오류');
    const notices = await res.json();
    renderNoticesMain(notices);
  } catch (err) {
    console.error('공지사항 데이터 로드 실패:', err);
    renderNoticesMain([]);
  }
}

function renderNoticesMain(notices) {
  const recentEl = Utils.getElement('recentNotices');
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

async function loadShuttleInfo() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const res = await fetch('/api/shuttle/routes');
    if (!res.ok) throw new Error('API 응답 오류');
    const routes = await res.json();
    renderShuttleRoutes(routes);
    if (routes.length > 0) selectShuttleRoute(routes[0].id, routes[0]);
  } catch (err) {
    console.error('셔틀버스 데이터 로드 실패:', err);
    renderShuttleRoutes([]);
    selectShuttleRoute(null, null);
  }
}

function renderShuttleRoutes(routes) {
  const tabs = Utils.getElement('shuttleRoutes');
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

function renderShuttleStatus(route) {
  const timeEl = Utils.getElement('shuttle-time');
  const descEl = Utils.getElement('shuttle-desc');
  const statusEl = Utils.getElement('shuttleStatus');
  
  if (timeEl) timeEl.textContent = route.time || '--';
  if (descEl) descEl.textContent = route.desc || '--';
  if (statusEl) {
    const status = route.status === 'running' ? 'running' : 'stopped';
    statusEl.className = `status-badge status-${status}`;
    statusEl.innerHTML = status === 'running'
      ? '<span>🟢</span><span>운행중</span>'
      : '<span>🔴</span><span>운행종료</span>';
  }
}

async function loadLectureReviews() {
  try {
    if (!isOnline) throw new Error('오프라인 모드');
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent'),
    ]);

    if (!popRes.ok || !recRes.ok) throw new Error('API 응답 오류');

    const popular = await popRes.json();
    const recent = await recRes.json();
    renderLectureReviewsMain(popular, recent);
  } catch (err) {
    console.error('강의평가 데이터 로드 실패:', err);
    renderLectureReviewsMain([], []);
  }
}

function renderLectureReviewsMain(popular, recent) {
  const popEl = Utils.getElement('popularReviews');
  const recEl = Utils.getElement('recentReviews');
  if (!popEl || !recEl) return;

  popEl.innerHTML = '';
  recEl.innerHTML = '';

  popular.forEach(r => {
    if (!NotificationManager.isCategoryEnabled('강의평가')) return;
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
    if (!NotificationManager.isCategoryEnabled('강의평가')) return;
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

// ═══════════════════════════════════════════════════════════════
// 지도 관리
// ═══════════════════════════════════════════════════════════════

const MapManager = {
  init: () => {
    if (typeof naver === 'undefined' || !naver.maps) {
      console.error('네이버 지도 API가 로드되지 않았습니다.');
      MapManager.showError('naverMap', '지도를 불러올 수 없습니다');
      return;
    }

    const mapContainer = Utils.getElement('naverMap');
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
      MapManager.showError('naverMap', '지도를 불러올 수 없습니다');
    }
  },

  addMarkers: (buildings) => {
    if (!naverMap) return;
    
    try {
      // 기존 마커 제거
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
  },

  showError: (containerId, message) => {
    const container = Utils.getElement(containerId);
    if (container) {
      container.innerHTML = `
        <div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>${message}</p>
        </div>
      `;
    }
  },

  zoomIn: () => {
    if (naverMap) naverMap.setZoom(naverMap.getZoom() + 1);
  },

  zoomOut: () => {
    if (naverMap) naverMap.setZoom(naverMap.getZoom() - 1);
  },

  resetView: () => {
    if (naverMap) {
      const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
      naverMap.setCenter(yeonsung);
      naverMap.setZoom(16);
    }
  },

  trackUserLocation: () => {
    if (!navigator.geolocation) {
      MessageManager.show('위치 서비스를 지원하지 않습니다', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        if (!naverMap) {
          MessageManager.show('지도가 초기화되지 않았습니다', 'error');
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
        MessageManager.show('현재 위치를 찾았습니다', 'success');
      },
      error => {
        const messages = {
          [error.PERMISSION_DENIED]: '위치 권한이 거부되었습니다',
          [error.POSITION_UNAVAILABLE]: '위치 정보를 사용할 수 없습니다',
          [error.TIMEOUT]: '위치 요청 시간이 초과되었습니다'
        };
        MessageManager.show(messages[error.code] || '위치를 찾을 수 없습니다', 'error');
      }
    );
  }
};

// 지도 관련 전역 함수들
function initNaverMap() { MapManager.init(); }
function zoomIn() { MapManager.zoomIn(); }
function zoomOut() { MapManager.zoomOut(); }
function resetMapView() { MapManager.resetView(); }
function trackUserLocation() { MapManager.trackUserLocation(); }

// ═══════════════════════════════════════════════════════════════
// 자동 로그아웃 관리
// ═══════════════════════════════════════════════════════════════

const AutoLogoutManager = {
  setup: () => {
    const events = ['mousemove', 'keypress', 'click'];
    events.forEach(event => {
      document.addEventListener(event, AutoLogoutManager.resetTimer);
    });
    AutoLogoutManager.resetTimer();
  },

  resetTimer: () => {
    if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
    
    const cfg = JSON.parse(localStorage.getItem('autoLogout')) || { 
      enabled: false, 
      timeoutMinutes: 0 
    };
    
    if (!cfg.enabled) return;
    
    const timeoutMs = cfg.timeoutMinutes * 60 * 1000;
    autoLogoutTimer = setTimeout(() => {
      localStorage.removeItem('currentLoggedInUser');
      MessageManager.show('자동 로그아웃되었습니다', 'info');
      UserManager.checkStatus();
      ContentManager.show('home');
    }, timeoutMs);
  }
};

// ═══════════════════════════════════════════════════════════════
// 키보드 단축키 관리
// ═══════════════════════════════════════════════════════════════

const KeyboardManager = {
  applyShortcuts: () => {
    const shortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || {
      toggleSidebar: 'F2',
      openNotifications: 'F3',
      goToSettings: 'F4'
    };

    document.addEventListener('keydown', e => {
      const targetTag = e.target.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) return;
      
      AutoLogoutManager.resetTimer();
      
      const key = e.key.toUpperCase();
      
      if (key === (shortcuts.openNotifications || '').toUpperCase()) {
        e.preventDefault();
        DropdownManager.toggle.notification();
        return;
      }
      
      if (key === (shortcuts.goToSettings || '').toUpperCase()) {
        e.preventDefault();
        ContentManager.show('settings');
        return;
      }
    });
  },

  applyUserShortcuts: () => {
    document.addEventListener('keydown', e => {
      const targetTag = e.target.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) return;
      
      AutoLogoutManager.resetTimer();
      
      const pressedKey = e.key.toUpperCase();
      const userShortcuts = JSON.parse(localStorage.getItem('keyboardShortcuts')) || [];
      const matched = userShortcuts.find(entry => entry.key === pressedKey);
      
      if (!matched || !matched.name) return;
      
      e.preventDefault();
      
      const label = matched.name.toLowerCase();
      const shortcuts = {
        '대시보드': () => ContentManager.show('home'),
        '건물': () => ContentManager.show('buildings'),
        '커뮤니티': () => ContentManager.show('community'),
        '강의평가': () => ContentManager.show('lecture-review'),
        '공지사항': () => ContentManager.show('notices'),
        '시간표': () => Navigation.toTimetable(),
        '셔틀버스': () => Navigation.toShuttle(),
        '학사일정': () => Navigation.toCalendar(),
        '프로필': () => ContentManager.show('profile'),
        '설정': () => ContentManager.show('settings'),
        '알림': () => DropdownManager.toggle.notification(),
        '로그아웃': () => UserManager.logout(),
        '테마': () => {
          const themeToggle = Utils.getElement('themeToggle');
          if (themeToggle) {
            themeToggle.checked = !themeToggle.checked;
            themeToggle.dispatchEvent(new Event('change'));
          }
        },
        '위치': () => MapManager.trackUserLocation(),
        '확대': () => MapManager.zoomIn(),
        '축소': () => MapManager.zoomOut(),
        '초기화': () => MapManager.resetView(),
        '리셋': () => MapManager.resetView()
      };

      const matchedShortcut = Object.keys(shortcuts).find(key => label.includes(key));
      if (matchedShortcut) {
        shortcuts[matchedShortcut]();
      } else {
        console.log(`등록된 단축키 "${matched.name}"(${matched.key}) 가 호출되었으나, 매핑된 기능이 없습니다.`);
      }
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// 검색 관리
// ═══════════════════════════════════════════════════════════════

const SearchManager = {
  handleGlobalSearch: async () => {
    const query = Utils.getElement('search-input').value.trim().toLowerCase();
    if (!query) return;
    
    if (!isOnline) {
      MessageManager.show('오프라인 상태에서는 검색을 사용할 수 없습니다', 'error');
      return;
    }

    try {
      const buildingRes = await fetch(`/api/buildings/search?q=${encodeURIComponent(query)}`);
      if (buildingRes.ok) {
        ContentManager.show('buildings');
        Utils.getElement('search-input').value = '';
        return;
      }
    } catch (err) {
      console.error('건물 검색 오류:', err);
    }

    try {
      const noticeRes = await fetch(`/api/notices/search?q=${encodeURIComponent(query)}`);
      if (noticeRes.ok) {
        ContentManager.show('notices');
        Utils.getElement('search-input').value = '';
        return;
      }
    } catch (err) {
      console.error('공지사항 검색 오류:', err);
    }

    MessageManager.show('검색 결과를 찾을 수 없습니다.', 'info');
  }
};

// 검색 관련 전역 함수
function handleGlobalSearch() { SearchManager.handleGlobalSearch(); }

// ═══════════════════════════════════════════════════════════════
// 기타 유틸리티 함수들
// ═══════════════════════════════════════════════════════════════

function showBuildingOnMap(buildingId) {
  ContentManager.show('buildings');
  setTimeout(() => {
    if (naverMap && naverMap.refresh) naverMap.refresh();
  }, 100);
}

function getBuildingDirections(buildingId) {
  MessageManager.show('길찾기 기능은 준비 중입니다', 'info');
}

function viewNoticeDetail(noticeId) {
  MessageManager.show('공지사항 상세보기는 준비 중입니다', 'info');
}

// 하위 호환성을 위한 레거시 함수들
function navigateToTimetable() { Navigation.toTimetable(); }
function navigateToShuttle() { Navigation.toShuttle(); }
function navigateToCalendar() { Navigation.toCalendar(); }
function closeAllDropdowns() { DropdownManager.closeAll(); }
function showNotificationDropdown() { DropdownManager.show.notification(); }
function closeNotificationDropdown() { DropdownManager.hide.notification(); }
function showUserDropdown() { DropdownManager.show.user(); }
function closeUserDropdown() { DropdownManager.hide.user(); }
function showStudentServiceDropdown() { DropdownManager.show.studentService(); }
function closeStudentServiceDropdown() { DropdownManager.hide.studentService(); }
function showErrorFallback(containerId, message) { MapManager.showError(containerId, message); }
function resetAutoLogoutTimer() { AutoLogoutManager.resetTimer(); }
function setupAutoLogout() { AutoLogoutManager.setup(); }
function applyKeyboardShortcuts() { KeyboardManager.applyShortcuts(); }
function applyUserShortcuts() { KeyboardManager.applyUserShortcuts(); }

// ═══════════════════════════════════════════════════════════════
// 앱 초기화 및 이벤트 리스너
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // 초기 컨텐츠 설정
  const hash = window.location.hash.slice(1);
  if (hash && Utils.getElement(hash + 'Content')) {
    ContentManager.show(hash);
  } else {
    ContentManager.show('home');
  }

  // 앱 초기화
  initializeApp();
  setupEventListeners();
  
  // 홈 메뉴 활성화
  const homeMenu = Utils.getElement('nav-home');
  if (homeMenu) homeMenu.classList.add('active');
});

function setupEventListeners() {
  // 네트워크 상태 감지
  window.addEventListener('online', () => {
    isOnline = true;
    MessageManager.show('인터넷 연결이 복구되었습니다', 'success');
    initializeApp();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    MessageManager.show('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다', 'error');
  });

  // 키보드 이벤트
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      DropdownManager.closeAll();
    }
    AutoLogoutManager.resetTimer();
  });

  // 검색 이벤트
  const searchInput = Utils.getElement('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        SearchManager.handleGlobalSearch();
      }
    });
    searchInput.addEventListener('keydown', AutoLogoutManager.resetTimer);
  }

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    const ssBtn = event.target.closest('#nav-student-services');

    if (!ntBtn) DropdownManager.hide.notification();
    if (!upBtn) DropdownManager.hide.user();
    if (!ssBtn) DropdownManager.hide.studentService();

    AutoLogoutManager.resetTimer();
  });

  // 윈도우 리사이즈 시 모바일 메뉴 닫기
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      MobileMenu.close();
      Utils.getElement('nav-student-services').classList.remove('dropdown-open');
    }
  });

  // 학생서비스 드롭다운 호버 이벤트
  setupStudentServiceHover();

  // 스토리지 이벤트
  setupStorageListeners();

  // 페이지 표시 이벤트
  setupPageShowListener();
}

function setupStudentServiceHover() {
  const studentServices = Utils.getElement('nav-student-services');
  if (!studentServices) return;

  let hoverTimeout;

  studentServices.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    DropdownManager.show.studentService();
  });

  studentServices.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(() => {
      DropdownManager.hide.studentService();
    }, 150);
  });

  const dropdown = studentServices.querySelector('.dropdown-menu');
  if (dropdown) {
    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      DropdownManager.show.studentService();
    });

    dropdown.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        DropdownManager.hide.studentService();
      }, 150);
    });
  }

  // 드롭다운 항목 클릭 이벤트
  setTimeout(() => {
    const dropdownItems = document.querySelectorAll('#nav-student-services .dropdown-item');
    dropdownItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const actions = [Navigation.toTimetable, Navigation.toCalendar, Navigation.toShuttle];
        if (actions[index]) actions[index]();
      });
    });
  }, 100);
}

function setupStorageListeners() {
  window.addEventListener('storage', event => {
    if (event.key === 'currentLoggedInUser' || 
        (event.key && event.key.includes('_profileImage'))) {
      UserManager.checkStatus();
      TimetableManager.update();
    }
    
    if (event.key === 'lightMode') {
      const savedMode = localStorage.getItem('lightMode');
      if (savedMode === 'true') {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
    }
  });
}

function setupPageShowListener() {
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      UserManager.checkStatus();
      TimetableManager.update();
    }
    
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode === 'true') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 앱 초기화 함수
// ═══════════════════════════════════════════════════════════════

async function initializeApp() {
  try {
    await loadDepartments();
    MapManager.init();
    
    await Promise.all([
      loadStats(),
      loadNotifications(),
      loadBuildingsMain(),
      loadNotices(),
      loadShuttleInfo(),
      loadLectureReviews()
    ]);
    
    UserManager.checkStatus();
    TimetableManager.update();
    AutoLogoutManager.setup();
    KeyboardManager.applyShortcuts();
    KeyboardManager.applyUserShortcuts();

    // 정기적 업데이트 설정
    setInterval(() => {
      if (isOnline) {
        loadShuttleInfo();
        TimetableManager.update();
      }
    }, 60000);

  } catch (error) {
    console.error('앱 초기화 오류:', error);
    MessageManager.show('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
  }
}
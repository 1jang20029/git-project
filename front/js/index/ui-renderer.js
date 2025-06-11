// ui-renderer.js - UI 렌더링 모듈
/**
 * ===========================================
 * UI 렌더링 모듈
 * ===========================================
 */
const UIRenderer = (() => {

  /**
   * 사용자 UI 업데이트
   */
  const updateUserUI = (userData) => {
    const elements = {
      userName: document.getElementById('user-name'),
      userRole: document.getElementById('user-role'),
      dropdownName: document.getElementById('dropdown-user-name'),
      dropdownRole: document.getElementById('dropdown-user-role'),
      avatar: document.getElementById('user-avatar')
    };
    
    if (elements.userName) elements.userName.textContent = userData.name || '사용자';
    if (elements.userRole) elements.userRole.textContent = userData.department || '학생';
    if (elements.dropdownName) elements.dropdownName.textContent = userData.name || '사용자';
    if (elements.dropdownRole) elements.dropdownRole.textContent = userData.department || '학생';
    
    updateProfileImage(userData, elements.avatar);
  };

  /**
   * 게스트 모드 설정
   */
  const setGuestMode = () => {
    const elements = {
      userName: document.getElementById('user-name'),
      userRole: document.getElementById('user-role'),
      dropdownName: document.getElementById('dropdown-user-name'),
      dropdownRole: document.getElementById('dropdown-user-role'),
      avatar: document.getElementById('user-avatar')
    };
    
    if (elements.userName) elements.userName.textContent = '게스트';
    if (elements.userRole) elements.userRole.textContent = '방문자';
    if (elements.dropdownName) elements.dropdownName.textContent = '게스트';
    if (elements.dropdownRole) elements.dropdownRole.textContent = '방문자';
    if (elements.avatar) elements.avatar.textContent = '👤';
  };

  /**
   * 프로필 이미지 업데이트
   */
  const updateProfileImage = (userData, avatarElement) => {
    if (!avatarElement) return;
    
    if (userData.profileImageType === 'emoji') {
      avatarElement.textContent = userData.profileImage || '👤';
    } else if (userData.profileImage) {
      avatarElement.innerHTML = `<img src="${userData.profileImage}" 
        style="width:100%;height:100%;object-fit:cover;border-radius:8px;" 
        alt="프로필">`;
    } else {
      avatarElement.textContent = '👤';
    }
  };

  /**
   * 통계 데이터 렌더링
   */
  const renderStats = (stats) => {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${stats.totalBuildings}</div>
        <div class="stat-label">캠퍼스 건물</div>
        <div class="stat-change positive">
          <span>↗</span>
          <span>${stats.buildingGrowth}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalStudents}</div>
        <div class="stat-label">재학생 수</div>
        <div class="stat-change positive">
          <span>↗</span>
          <span>${stats.studentGrowth}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.activeServices}</div>
        <div class="stat-label">운영 서비스</div>
        <div class="stat-change positive">
          <span>↗</span>
          <span>${stats.serviceGrowth}</span>
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
  };

  /**
   * 알림 렌더링
   */
  const renderNotifications = (notifications) => {
    const listElement = document.getElementById('notification-list');
    const badgeElement = document.getElementById('notification-badge');
    
    if (!listElement || !badgeElement) return;

    listElement.innerHTML = '';
    let unreadCount = 0;

    notifications.forEach(notification => {
      const item = document.createElement('div');
      item.className = `notification-item ${notification.read ? '' : 'unread'}`;
      item.onclick = () => handleNotificationClick(notification.id, item);
      
      item.innerHTML = `
        <div class="notification-meta">
          <span class="notification-category">${notification.category}</span>
          <span class="notification-time">${notification.time_ago}</span>
        </div>
        <div class="notification-content">${notification.title}</div>
        <div class="notification-summary">${notification.summary}</div>
      `;
      
      listElement.appendChild(item);
      
      if (!notification.read) {
        unreadCount++;
      }
    });

    updateNotificationBadge(unreadCount);
  };

  /**
   * 알림 클릭 처리
   */
  const handleNotificationClick = async (notificationId, element) => {
    const success = await DataManager.markNotificationAsRead(notificationId);
    if (success) {
      element.classList.remove('unread');
      updateNotificationBadge(-1, true);
    }
  };

  /**
   * 알림 배지 업데이트
   */
  const updateNotificationBadge = (count, isDecrement = false) => {
    const badge = document.getElementById('notification-badge');
    const dot = document.getElementById('notification-dot');
    
    if (!badge) return;
    
    let newCount;
    if (isDecrement) {
      const currentCount = parseInt(badge.textContent) || 0;
      newCount = Math.max(0, currentCount + count);
    } else {
      newCount = count;
    }
    
    badge.textContent = newCount;
    
    if (dot) {
      dot.style.display = newCount > 0 ? 'block' : 'none';
    }
  };

  /**
   * 오늘 일정 렌더링
   */
  const renderTodaySchedule = (schedule) => {
    const container = document.getElementById('timetableContent');
    if (!container) return;

    if (!schedule || schedule.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>📅 오늘은 휴일</h3>
          <p>오늘에는 수업이 없습니다</p>
          <button class="btn btn-primary" onclick="NavigationManager.navigateToExternal('timetable.html')" 
                  style="margin-top: 1rem;">
            📅 시간표 관리
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    schedule.forEach(item => {
      const div = document.createElement('div');
      div.className = `class-item class-status-${item.status}`;
      
      const statusIcon = {
        current: '🟢',
        upcoming: '🟡', 
        finished: '🔴'
      }[item.status] || '🟡';
      
      div.innerHTML = `
        <div class="class-time">
          <div class="class-time-main">${item.time_display}</div>
          <div class="class-time-remaining ${item.status}">${item.time_remaining}</div>
        </div>
        <div class="class-info">
          <div class="class-name">${item.course_name}</div>
          <div class="class-location">${item.professor} | ${item.room}</div>
        </div>
        <div class="class-status status-${item.status}">
          <span>${statusIcon}</span>
          <span>${item.status_text}</span>
        </div>
      `;
      
      container.appendChild(div);
    });
  };

  /**
   * 검색 결과 표시
   */
  const showSearchResults = (results) => {
    // 검색 결과 모달이나 드롭다운 표시 로직
    console.log('검색 결과:', results);
    // TODO: 검색 결과 UI 구현
  };

  /**
   * 네비게이션 활성 상태 업데이트
   */
  const updateNavigation = (type) => {
    document.querySelectorAll('#main-menu .nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const navItem = document.getElementById('nav-' + type);
    if (navItem) {
      navItem.classList.add('active');
    }
  };

  return {
    updateUserUI,
    setGuestMode,
    updateProfileImage,
    renderStats,
    renderNotifications,
    updateNotificationBadge,
    renderTodaySchedule,
    showSearchResults,
    updateNavigation
  };
})();

// 전역으로 노출
window.UIRenderer = UIRenderer;
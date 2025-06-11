// data-manager.js - 데이터 로드 및 관리
/**
 * ===========================================
 * 데이터 관리 모듈
 * ===========================================
 */
const DataManager = (() => {

  /**
   * 사용자 정보 로드
   */
  const loadUserInfo = async () => {
    try {
      const response = await NetworkManager.fetchWithNetworkCheck('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        UIRenderer.updateUserUI(userData);
      } else {
        UIRenderer.setGuestMode();
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      UIRenderer.setGuestMode();
    }
  };

  /**
   * 대시보드 데이터 로드
   */
  const loadDashboardData = async () => {
    if (!NetworkManager.isOnline()) return;
    
    try {
      const promises = [
        NetworkManager.fetchWithNetworkCheck('/api/dashboard/stats'),
        NetworkManager.fetchWithNetworkCheck('/api/notifications'),
        NetworkManager.fetchWithNetworkCheck('/api/user/today-schedule')
      ];
      
      const [statsRes, notificationsRes, timetableRes] = await Promise.all(promises);
      
      if (statsRes.ok) {
        const stats = await statsRes.json();
        UIRenderer.renderStats(stats);
      }
      
      if (notificationsRes.ok) {
        const notifications = await notificationsRes.json();
        UIRenderer.renderNotifications(notifications);
      }
      
      if (timetableRes.ok) {
        const schedule = await timetableRes.json();
        UIRenderer.renderTodaySchedule(schedule);
      }
      
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      Utils.showMessage('일부 데이터를 불러오는 중 오류가 발생했습니다', 'error');
    }
  };

  /**
   * 실시간 데이터 업데이트
   */
  const updateRealTimeData = async () => {
    try {
      const response = await NetworkManager.fetchWithNetworkCheck('/api/user/today-schedule');
      if (response.ok) {
        const schedule = await response.json();
        UIRenderer.renderTodaySchedule(schedule);
      }
    } catch (error) {
      console.error('실시간 데이터 업데이트 실패:', error);
    }
  };

  /**
   * 검색 실행
   */
  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    try {
      const response = await NetworkManager.fetchWithNetworkCheck(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const results = await response.json();
        return results;
      } else {
        throw new Error('검색 실패');
      }
    } catch (error) {
      console.error('검색 오류:', error);
      Utils.showMessage('검색 기능을 사용할 수 없습니다', 'error');
      return null;
    }
  };

  /**
   * 알림 읽음 처리
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await NetworkManager.fetchWithNetworkCheck(
        `/api/notifications/${notificationId}/read`,
        { method: 'PATCH' }
      );
      
      return response.ok;
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      return false;
    }
  };

  /**
   * 로그아웃 처리
   */
  const logout = async () => {
    try {
      await NetworkManager.fetchWithNetworkCheck('/api/auth/logout', { 
        method: 'POST' 
      });
      window.location.href = '/login.html';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      window.location.href = '/login.html';
    }
  };

  /**
   * 페이지 동적 로드
   */
  const loadPageContent = async (type) => {
    if (AppState.get('loadedPages').has(type)) return true;
    
    const pageConfig = {
      settings: { file: 'pages/user/settings.html', init: 'initSettingsPage' },
      community: { file: 'pages/list/community.html', init: 'initCommunityPage' },
      'lecture-review': { file: 'pages/list/lecture-review.html', init: 'initLectureReviewPage' },
      notices: { file: 'pages/list/notices.html', init: 'initNoticesPage' },
      buildings: { file: 'pages/list/buildings.html', init: 'initBuildingsPage' }
    };
    
    const config = pageConfig[type];
    if (!config) return false;
    
    const container = document.getElementById(Utils.getContentId(type));
    if (!container) return false;
    
    try {
      const response = await fetch(config.file);
      if (!response.ok) {
        throw new Error(`${config.file} 로드 실패`);
      }
      
      const html = await response.text();
      container.innerHTML = html;
      
      // 로드된 페이지 집합에 추가
      const loadedPages = AppState.get('loadedPages');
      loadedPages.add(type);
      AppState.set('loadedPages', loadedPages);
      
      // 페이지별 초기화 함수 호출
      if (window[config.init]) {
        window[config.init]();
      }
      
      return true;
      
    } catch (error) {
      console.error(`페이지 로드 오류 (${type}):`, error);
      container.innerHTML = Utils.createErrorFallback(`${type} 화면을 불러올 수 없습니다`);
      return false;
    }
  };

  return {
    loadUserInfo,
    loadDashboardData,
    updateRealTimeData,
    performSearch,
    markNotificationAsRead,
    logout,
    loadPageContent
  };
})();

// 전역으로 노출
window.DataManager = DataManager;
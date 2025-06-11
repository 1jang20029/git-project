// event-manager.js - 이벤트 관리
/**
 * ===========================================
 * 이벤트 관리 모듈
 * ===========================================
 */
const EventManager = (() => {

  /**
   * 모든 이벤트 리스너 설정
   */
  const setupAllEventListeners = () => {
    setupGlobalEventListeners();
    setupSearchEventListeners();
    setupStorageEventListeners();
    setupPageEventListeners();
    DropdownManager.setupStudentServiceDropdown();
  };

  /**
   * 전역 이벤트 리스너 설정
   */
  const setupGlobalEventListeners = () => {
    // 전역 ESC 키 처리
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        DropdownManager.closeAllDropdowns();
      }
      SessionManager.resetAutoLogoutTimer();
    });

    // 전역 클릭 이벤트
    document.addEventListener('click', handleGlobalClick);
    
    // 마우스 움직임, 키 입력 등으로 자동 로그아웃 타이머 리셋
    document.addEventListener('mousemove', Utils.throttle(SessionManager.resetAutoLogoutTimer, 1000));
    document.addEventListener('keypress', SessionManager.resetAutoLogoutTimer);
    document.addEventListener('click', SessionManager.resetAutoLogoutTimer);
  };

  /**
   * 검색 관련 이벤트 리스너
   */
  const setupSearchEventListeners = () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleGlobalSearch();
        }
      });
      searchInput.addEventListener('input', SessionManager.resetAutoLogoutTimer);
    }
  };

  /**
   * 스토리지 변경 이벤트 리스너
   */
  const setupStorageEventListeners = () => {
    window.addEventListener('storage', handleStorageChange);
  };

  /**
   * 페이지 이벤트 리스너
   */
  const setupPageEventListeners = () => {
    window.addEventListener('pageshow', handlePageShow);
  };

  /**
   * 전역 클릭 이벤트 처리
   */
  const handleGlobalClick = (event) => {
    const isNotificationBtn = event.target.closest('#notification-btn');
    const isUserProfile = event.target.closest('#user-profile');
    const isStudentService = event.target.closest('#nav-student-services');

    if (!isNotificationBtn) DropdownManager.closeNotificationDropdown();
    if (!isUserProfile) DropdownManager.closeUserDropdown();
    if (!isStudentService) DropdownManager.closeStudentServiceDropdown();

    SessionManager.resetAutoLogoutTimer();
  };

  /**
   * 전역 검색 처리
   */
  const handleGlobalSearch = async () => {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query) return;
    
    const results = await DataManager.performSearch(query);
    if (results) {
      UIRenderer.showSearchResults(results);
    }
    
    searchInput.value = '';
  };

  /**
   * 스토리지 변경 처리
   */
  const handleStorageChange = (event) => {
    if (event.key === 'currentLoggedInUser' || 
        (event.key && event.key.includes('_profileImage'))) {
      DataManager.loadUserInfo();
    }
    
    if (event.key === 'lightMode') {
      Utils.applyTheme();
    }
  };

  /**
   * 페이지 복원 처리
   */
  const handlePageShow = (event) => {
    if (event.persisted) {
      DataManager.loadUserInfo();
      DataManager.updateRealTimeData();
    }
    Utils.applyTheme();
  };

  /**
   * 키보드 단축키 설정
   */
  const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // 입력 필드에서는 단축키 비활성화
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }
      
      SessionManager.resetAutoLogoutTimer();
      
      switch(e.key.toUpperCase()) {
        case 'F3':
          e.preventDefault();
          DropdownManager.toggleNotifications();
          break;
        case 'F4':
          e.preventDefault();
          NavigationManager.showContent('settings');
          break;
        case '1':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            NavigationManager.showContent('home');
          }
          break;
        case '2':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            NavigationManager.showContent('buildings');
          }
          break;
        case '3':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            NavigationManager.showContent('community');
          }
          break;
        default:
          break;
      }
    });
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      DataManager.logout();
    }
  };

  return {
    setupAllEventListeners,
    setupKeyboardShortcuts,
    handleLogout,
    handleGlobalSearch
  };
})();

// 전역으로 노출
window.EventManager = EventManager;
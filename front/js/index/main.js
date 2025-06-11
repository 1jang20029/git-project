// main.js - 메인 애플리케이션 진입점
/**
 * ===========================================
 * 메인 애플리케이션
 * ===========================================
 */
const App = (() => {

  /**
   * 애플리케이션 초기화
   */
  const initializeApp = async () => {
    try {
      console.log('🚀 Campus Portal 애플리케이션 시작');
      
      // 필수 모듈 로드 확인
      if (!checkRequiredModules()) {
        throw new Error('필수 모듈이 로드되지 않았습니다');
      }

      // 네트워크 관리자 초기화
      NetworkManager.init();
      
      // 병렬로 초기화 작업 수행
      await Promise.all([
        DataManager.loadUserInfo(),
        DataManager.loadDashboardData(),
        MapManager.initNaverMap()
      ]);
      
      // 네비게이션 초기화
      NavigationManager.initializeNavigation();
      
      // 이벤트 리스너 설정
      EventManager.setupAllEventListeners();
      EventManager.setupKeyboardShortcuts();
      
      // 세션 관리 시작
      SessionManager.setupAutoLogout();
      SessionManager.startSessionMonitoring();
      
      // 테마 적용
      Utils.applyTheme();
      
      // 실시간 데이터 업데이트 타이머 시작
      startRealTimeUpdates();
      
      console.log('✅ 애플리케이션 초기화 완료');
      
    } catch (error) {
      console.error('❌ 앱 초기화 오류:', error);
      Utils.showMessage('일부 기능을 불러오는 중 오류가 발생했습니다', 'error');
    }
  };

  /**
   * 필수 모듈 로드 확인
   */
  const checkRequiredModules = () => {
    const requiredModules = [
      'AppState', 'Utils', 'NetworkManager', 'DataManager', 
      'UIRenderer', 'NavigationManager', 'DropdownManager', 
      'EventManager', 'SessionManager', 'MapManager'
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
      console.error('누락된 모듈:', missingModules);
      return false;
    }
    
    return true;
  };

  /**
   * 실시간 업데이트 시작
   */
  const startRealTimeUpdates = () => {
    // 1분마다 실시간 데이터 업데이트
    setInterval(() => {
      if (NetworkManager.isOnline()) {
        DataManager.updateRealTimeData();
      }
    }, 60000);
    
    // 5분마다 알림 새로고침
    setInterval(() => {
      if (NetworkManager.isOnline()) {
        DataManager.loadDashboardData();
      }
    }, 5 * 60000);
  };

  /**
   * 애플리케이션 종료
   */
  const shutdownApp = () => {
    console.log('🛑 애플리케이션 종료');
    SessionManager.endSession();
    MapManager.clearAllMarkers();
    DropdownManager.closeAllDropdowns();
  };

  /**
   * 전역 함수들을 window에 노출 (기존 코드 호환성을 위해)
   */
  const exposeGlobalFunctions = () => {
    // 네비게이션 함수들
    window.showContent = NavigationManager.showContent;
    window.navigateToExternal = NavigationManager.navigateToExternal;
    
    // 드롭다운 함수들
    window.toggleNotifications = DropdownManager.toggleNotifications;
    window.toggleUserMenu = DropdownManager.toggleUserMenu;
    window.closeAllDropdowns = DropdownManager.closeAllDropdowns;
    
    // 기타 함수들
    window.handleLogout = EventManager.handleLogout;
    window.showMessage = Utils.showMessage;
    window.applyTheme = Utils.applyTheme;
    
    // 지도 함수들
    window.initNaverMap = MapManager.initNaverMap;
    
    // 데이터 함수들
    window.markNotificationAsRead = async (notificationId, element) => {
      const success = await DataManager.markNotificationAsRead(notificationId);
      if (success && element) {
        element.classList.remove('unread');
        UIRenderer.updateNotificationBadge(-1, true);
      }
    };
  };

  /**
   * 개발자 도구 함수들
   */
  const setupDevTools = () => {
    if (process.env.NODE_ENV === 'development') {
      window.CampusPortal = {
        AppState,
        Utils,
        NetworkManager,
        DataManager,
        UIRenderer,
        NavigationManager,
        DropdownManager,
        EventManager,
        SessionManager,
        MapManager,
        // 유틸리티 함수들
        getAppInfo: () => ({
          currentContent: AppState.get('currentContent'),
          isOnline: AppState.get('isOnline'),
          loadedPages: Array.from(AppState.get('loadedPages')),
          hasMap: !!AppState.get('naverMap'),
          markerCount: AppState.get('mapMarkers').length
        }),
        // 디버깅 함수들
        simulateOffline: () => {
          AppState.set('isOnline', false);
          Utils.showMessage('오프라인 모드 시뮬레이션', 'info');
        },
        simulateOnline: () => {
          AppState.set('isOnline', true);
          Utils.showMessage('온라인 모드 시뮬레이션', 'success');
        }
      };
      
      console.log('🔧 개발자 도구가 window.CampusPortal에서 사용 가능합니다');
    }
  };

  return {
    initializeApp,
    shutdownApp,
    exposeGlobalFunctions,
    setupDevTools
  };
})();

/**
 * ===========================================
 * 애플리케이션 시작점
 * ===========================================
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 DOM 로드 완료, 애플리케이션 시작');
  
  try {
    // 전역 함수 노출
    App.exposeGlobalFunctions();
    
    // 개발자 도구 설정
    App.setupDevTools();
    
    // 애플리케이션 초기화
    await App.initializeApp();
    
  } catch (error) {
    console.error('💥 치명적 오류:', error);
    Utils.showMessage('애플리케이션을 시작할 수 없습니다', 'error');
  }
});

/**
 * 페이지 언로드 시 정리
 */
window.addEventListener('beforeunload', () => {
  App.shutdownApp();
});

// 전역으로 노출
window.App = App;
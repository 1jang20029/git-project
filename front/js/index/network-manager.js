// network-manager.js - 네트워크 상태 관리
/**
 * ===========================================
 * 네트워크 관리 모듈
 * ===========================================
 */
const NetworkManager = (() => {
  
  /**
   * 네트워크 이벤트 리스너 설정
   */
  const init = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 초기 상태 설정
    AppState.set('isOnline', navigator.onLine);
  };

  /**
   * 온라인 상태 복구 처리
   */
  const handleOnline = () => {
    AppState.set('isOnline', true);
    Utils.showMessage('인터넷 연결이 복구되었습니다', 'success');
    
    // 온라인 복구 시 데이터 재로드
    if (window.DataManager) {
      DataManager.loadDashboardData();
    }
  };

  /**
   * 오프라인 상태 처리
   */
  const handleOffline = () => {
    AppState.set('isOnline', false);
    Utils.showMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다', 'error');
  };

  /**
   * 온라인 상태 확인
   */
  const isOnline = () => AppState.get('isOnline');

  /**
   * API 요청 래퍼 (네트워크 상태 확인 포함)
   */
  const fetchWithNetworkCheck = async (url, options = {}) => {
    if (!isOnline()) {
      throw new Error('네트워크 연결이 없습니다');
    }
    
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (!navigator.onLine) {
        AppState.set('isOnline', false);
        Utils.showMessage('네트워크 연결이 끊어졌습니다', 'error');
      }
      throw error;
    }
  };

  /**
   * 연결 상태 테스트
   */
  const testConnection = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return {
    init,
    isOnline,
    fetchWithNetworkCheck,
    testConnection
  };
})();

// 전역으로 노출
window.NetworkManager = NetworkManager;
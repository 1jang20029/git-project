// session-manager.js - 세션 관리
/**
 * ===========================================
 * 세션 관리 모듈
 * ===========================================
 */
const SessionManager = (() => {
  
  const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30분

  /**
   * 자동 로그아웃 설정
   */
  const setupAutoLogout = () => {
    resetAutoLogoutTimer();
  };

  /**
   * 자동 로그아웃 타이머 리셋
   */
  const resetAutoLogoutTimer = () => {
    const currentTimer = AppState.get('autoLogoutTimer');
    if (currentTimer) {
      clearTimeout(currentTimer);
    }
    
    const newTimer = setTimeout(() => {
      Utils.showMessage('자동 로그아웃되었습니다', 'info');
      EventManager.handleLogout();
    }, AUTO_LOGOUT_TIME);
    
    AppState.set('autoLogoutTimer', newTimer);
  };

  /**
   * 세션 유효성 검사
   */
  const validateSession = async () => {
    try {
      const response = await NetworkManager.fetchWithNetworkCheck('/api/auth/validate');
      return response.ok;
    } catch (error) {
      console.error('세션 검증 실패:', error);
      return false;
    }
  };

  /**
   * 세션 갱신
   */
  const refreshSession = async () => {
    try {
      const response = await NetworkManager.fetchWithNetworkCheck('/api/auth/refresh', {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('세션 갱신 실패:', error);
      return false;
    }
  };

  /**
   * 세션 종료
   */
  const endSession = () => {
    const timer = AppState.get('autoLogoutTimer');
    if (timer) {
      clearTimeout(timer);
      AppState.set('autoLogoutTimer', null);
    }
    
    // 로컬 스토리지 정리
    localStorage.removeItem('currentLoggedInUser');
    localStorage.removeItem('userPreferences');
  };

  /**
   * 세션 모니터링 시작
   */
  const startSessionMonitoring = () => {
    // 5분마다 세션 유효성 검사
    setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid) {
        Utils.showMessage('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      }
    }, 5 * 60 * 1000);
  };

  return {
    setupAutoLogout,
    resetAutoLogoutTimer,
    validateSession,
    refreshSession,
    endSession,
    startSessionMonitoring
  };
})();

// 전역으로 노출
window.SessionManager = SessionManager;
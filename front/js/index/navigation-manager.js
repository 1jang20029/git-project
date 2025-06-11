// navigation-manager.js - 네비게이션 관리
/**
 * ===========================================
 * 네비게이션 관리 모듈
 * ===========================================
 */
const NavigationManager = (() => {

  /**
   * SPA 콘텐츠 표시
   */
  const showContent = async (type) => {
    // 모든 콘텐츠 패널 숨기기
    const contentPanels = [
      'homeContent', 'buildingsContent', 'communityContent', 
      'lecture-reviewContent', 'noticesContent', 'settingsContent'
    ];
    
    contentPanels.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });

    // 동적 페이지 로드
    await DataManager.loadPageContent(type);

    // 타겟 페이지 표시
    const targetId = Utils.getContentId(type);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.style.display = 'block';
      targetElement.classList.add('fade-in');
    }

    // 네비게이션 활성 상태 업데이트
    UIRenderer.updateNavigation(type);
    
    // 상태 업데이트
    AppState.set('currentContent', type);
    window.location.hash = type;

    // 지도 새로고침 (필요한 경우)
    if (type === 'buildings') {
      refreshMapIfNeeded();
    }
  };

  /**
   * 지도 새로고침 (필요시)
   */
  const refreshMapIfNeeded = () => {
    const naverMap = AppState.get('naverMap');
    if (naverMap && naverMap.refresh) {
      setTimeout(() => {
        naverMap.refresh();
      }, 100);
    }
  };

  /**
   * 외부 페이지로 이동
   */
  const navigateToExternal = (page) => {
    console.log(`${page} 페이지로 이동`);
    DropdownManager.closeAllDropdowns();
    window.location.href = page;
  };

  /**
   * 초기 페이지 설정
   */
  const initializeNavigation = () => {
    // URL 해시에 따른 초기 페이지 표시
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash + 'Content')) {
      showContent(hash);
    } else {
      showContent('home');
    }

    // 브라우저 뒤로가기/앞으로가기 처리
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.slice(1);
      if (newHash) {
        showContent(newHash);
      }
    });
  };

  return {
    showContent,
    navigateToExternal,
    initializeNavigation
  };
})();

// 전역으로 노출
window.NavigationManager = NavigationManager;
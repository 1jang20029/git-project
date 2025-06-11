// utils.js - 유틸리티 함수들
/**
 * ===========================================
 * 유틸리티 함수 모듈
 * ===========================================
 */
const Utils = (() => {
  
  /**
   * 메시지 표시
   */
  const showMessage = (message, type = 'info') => {
    const notification = document.createElement('div');
    const bgColor = {
      success: 'rgba(16, 185, 129, 0.9)',
      error: 'rgba(239, 68, 68, 0.9)',
      info: 'rgba(59, 130, 246, 0.9)'
    }[type];
    
    const icon = {
      success: '✅',
      error: '❌', 
      info: 'ℹ️'
    }[type];
    
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
  };

  /**
   * 에러 폴백 HTML 생성
   */
  const createErrorFallback = (message) => {
    return `
      <div class="error-fallback">
        <h3>⚠️ 오류 발생</h3>
        <p>${message}</p>
      </div>
    `;
  };

  /**
   * 에러 폴백 표시
   */
  const showErrorFallback = (containerId, message) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = createErrorFallback(message);
    }
  };

  /**
   * 테마 적용
   */
  const applyTheme = () => {
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode === 'true') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  /**
   * 페이지별 콘텐츠 ID 매핑
   */
  const getContentId = (type) => {
    const contentMap = {
      home: 'homeContent',
      buildings: 'buildingsContent',
      community: 'communityContent',
      'lecture-review': 'lecture-reviewContent',
      notices: 'noticesContent',
      settings: 'settingsContent'
    };
    
    return contentMap[type] || 'homeContent';
  };

  /**
   * 디바운싱 함수
   */
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  /**
   * 스로틀링 함수
   */
  const throttle = (func, delay) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  };

  return {
    showMessage,
    createErrorFallback,
    showErrorFallback,
    applyTheme,
    getContentId,
    debounce,
    throttle
  };
})();

// 전역으로 노출
window.Utils = Utils;
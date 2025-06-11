// utils.js - 유틸리티 함수들 (수정됨)
/**
 * ===========================================
 * 유틸리티 함수 모듈 (Fixed Version)
 * ===========================================
 */

// 즉시 실행하여 Utils 객체 생성
(function() {
  'use strict';
  
  console.log('🔧 Utils 모듈 로드 시작');

  const Utils = {
    /**
     * 메시지 표시
     */
    showMessage: function(message, type = 'info') {
      console.log(`💬 메시지 표시: ${message} (${type})`);
      
      const notification = document.createElement('div');
      const bgColor = {
        success: 'rgba(16, 185, 129, 0.9)',
        error: 'rgba(239, 68, 68, 0.9)',
        info: 'rgba(59, 130, 246, 0.9)'
      }[type] || 'rgba(59, 130, 246, 0.9)';
      
      const icon = {
        success: '✅',
        error: '❌', 
        info: 'ℹ️'
      }[type] || 'ℹ️';
      
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
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      notification.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span>${icon}</span>
          <span>${message}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // 3초 후 제거
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          notification.style.transition = 'all 0.3s ease';
          
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 3000);
    },

    /**
     * 에러 폴백 HTML 생성
     */
    createErrorFallback: function(message) {
      return `
        <div style="padding: 2rem; text-align: center; color: #ef4444;">
          <h3>⚠️ 오류 발생</h3>
          <p>${message}</p>
        </div>
      `;
    },

    /**
     * 에러 폴백 표시
     */
    showErrorFallback: function(containerId, message) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = this.createErrorFallback(message);
      }
    },

    /**
     * 테마 적용
     */
    applyTheme: function() {
      try {
        const savedMode = localStorage.getItem('lightMode');
        if (savedMode === 'true') {
          document.body.classList.add('light-mode');
        } else {
          document.body.classList.remove('light-mode');
        }
      } catch (error) {
        console.error('테마 적용 오류:', error);
      }
    },

    /**
     * 페이지별 콘텐츠 ID 매핑
     */
    getContentId: function(type) {
      const contentMap = {
        home: 'homeContent',
        buildings: 'buildingsContent',
        community: 'communityContent',
        'lecture-review': 'lecture-reviewContent',
        notices: 'noticesContent',
        settings: 'settingsContent'
      };
      
      return contentMap[type] || 'homeContent';
    },

    /**
     * 디바운싱 함수
     */
    debounce: function(func, delay) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },

    /**
     * 스로틀링 함수
     */
    throttle: function(func, delay) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, delay);
        }
      };
    },

    /**
     * 안전한 요소 선택
     */
    safeGetElement: function(id) {
      try {
        return document.getElementById(id);
      } catch (error) {
        console.error(`요소 선택 오류 (${id}):`, error);
        return null;
      }
    },

    /**
     * 안전한 로컬스토리지 접근
     */
    safeLocalStorage: {
      getItem: function(key) {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('로컬스토리지 읽기 오류:', error);
          return null;
        }
      },
      
      setItem: function(key, value) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (error) {
          console.error('로컬스토리지 쓰기 오류:', error);
          return false;
        }
      }
    }
  };

  // 전역으로 노출
  window.Utils = Utils;
  
  console.log('✅ Utils 모듈 로드 완료');
  
  // 로드 즉시 테스트 메시지 표시
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      Utils.showMessage('Utils 모듈이 정상적으로 로드되었습니다!', 'success');
    });
  } else {
    Utils.showMessage('Utils 모듈이 정상적으로 로드되었습니다!', 'success');
  }

})();
// =============================================================================
// 기존 index.js 파일에 추가할 완전한 반응형 웹 개선 코드
// =============================================================================

// ─────────── 반응형 관련 전역 변수 추가 ───────────
let isMobileMenuOpen = false;
let lastScrollTop = 0;
let scrollTimeout = null;
let resizeTimeout = null;
let touchStartY = 0;
let touchStartX = 0;

// ─────────── 모바일 메뉴 제어 함수들 ───────────

/**
 * 모바일 메뉴 토글 함수
 */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  if (!mobileMenu || !overlay || !mobileMenuBtn) {
    console.warn('모바일 메뉴 요소를 찾을 수 없습니다.');
    return;
  }
  
  if (mobileMenu.classList.contains('show')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

/**
 * 모바일 메뉴 열기 함수
 */
function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  if (mobileMenu && overlay && mobileMenuBtn) {
    // 다른 드롭다운 먼저 닫기
    closeAllDropdowns();
    
    mobileMenu.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    isMobileMenuOpen = true;
    
    // ARIA 속성 업데이트
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.setAttribute('aria-label', '메뉴 닫기');
    
    // 접근성: 포커스 관리
    const firstFocusable = mobileMenu.querySelector('.nav-item');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // 모바일 메뉴 애니메이션
    requestAnimationFrame(() => {
      mobileMenu.style.transform = 'translateY(0)';
    });
  }
}

/**
 * 모바일 메뉴 닫기 함수
 */
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  if (mobileMenu && overlay && mobileMenuBtn) {
    mobileMenu.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = ''; // 스크롤 복원
    isMobileMenuOpen = false;
    
    // ARIA 속성 업데이트
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', '메뉴 열기');
    
    // 포커스를 햄버거 메뉴 버튼으로 되돌림
    setTimeout(() => {
      if (mobileMenuBtn) {
        mobileMenuBtn.focus();
      }
    }, 100);
  }
}

// ─────────── 반응형 레이아웃 조정 함수들 ───────────

/**
 * 화면 크기별 레이아웃 조정
 */
function adjustLayoutForScreenSize() {
  const screenWidth = window.innerWidth;
  const nav = document.getElementById('top-nav');
  const searchInput = document.getElementById('search-input');
  const mainMenu = document.getElementById('main-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const quickMenu = document.getElementById('quick-menu');
  
  // CSS 클래스 제거
  if (nav) {
    nav.classList.remove('mobile', 'tablet', 'ultra-mobile');
  }
  
  if (screenWidth <= 480) {
    // 초소형 모바일 (480px 이하)
    if (searchInput) {
      searchInput.placeholder = '검색...';
      searchInput.style.fontSize = '12px';
    }
    if (nav) nav.classList.add('ultra-mobile');
    if (mainMenu) mainMenu.style.display = 'none';
    if (quickMenu) quickMenu.style.display = 'none';
    if (mobileMenuBtn) mobileMenuBtn.style.display = 'flex';
    
    // 브랜드 텍스트 숨김
    const brandText = document.querySelector('#nav-brand span');
    if (brandText) brandText.style.display = 'none';
    
  } else if (screenWidth <= 768) {
    // 모바일 (768px 이하)
    if (searchInput) {
      searchInput.placeholder = '검색...';
      searchInput.style.fontSize = '14px';
    }
    if (nav) nav.classList.add('mobile');
    if (mainMenu) mainMenu.style.display = 'none';
    if (quickMenu) quickMenu.style.display = 'none';
    if (mobileMenuBtn) mobileMenuBtn.style.display = 'flex';
    
    // 브랜드 텍스트 표시
    const brandText = document.querySelector('#nav-brand span');
    if (brandText) brandText.style.display = 'inline';
    
  } else if (screenWidth <= 1024) {
    // 태블릿 (1024px 이하)
    if (searchInput) {
      searchInput.placeholder = '검색...';
      searchInput.style.fontSize = '14px';
    }
    if (nav) nav.classList.add('tablet');
    if (mainMenu) mainMenu.style.display = 'flex';
    if (quickMenu) quickMenu.style.display = 'flex';
    if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
    closeMobileMenu(); // 태블릿 이상에서는 모바일 메뉴 닫기
    
    // 태블릿에서는 메뉴 텍스트 숨기기
    const menuTexts = document.querySelectorAll('#main-menu .nav-item span:not(.nav-icon)');
    menuTexts.forEach(text => text.style.display = 'none');
    
  } else {
    // 데스크톱 (1024px 초과)
    if (searchInput) {
      searchInput.placeholder = '건물, 교수님, 강의실 검색...';
      searchInput.style.fontSize = '14px';
    }
    if (mainMenu) mainMenu.style.display = 'flex';
    if (quickMenu) quickMenu.style.display = 'flex';
    if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
    closeMobileMenu(); // 데스크톱에서는 모바일 메뉴 닫기
    
    // 데스크톱에서는 모든 텍스트 표시
    const menuTexts = document.querySelectorAll('#main-menu .nav-item span:not(.nav-icon)');
    menuTexts.forEach(text => text.style.display = 'inline');
    
    const brandText = document.querySelector('#nav-brand span');
    if (brandText) brandText.style.display = 'inline';
  }
  
  // 네비게이션 높이 조정
  if (screenWidth <= 768) {
    document.documentElement.style.setProperty('--nav-height', 'var(--nav-height-mobile)');
  } else {
    document.documentElement.style.setProperty('--nav-height', '80px');
  }
}

/**
 * 터치 디바이스 지원 추가
 */
function addTouchSupport() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    document.body.classList.add('touch-device');
    
    // 터치 이벤트를 모든 상호작용 요소에 추가
    const interactiveElements = document.querySelectorAll(
      '.nav-item, .service-card, .building-card, .btn, .notification-item, .stat-card'
    );
    
    interactiveElements.forEach(element => {
      // 터치 시작
      element.addEventListener('touchstart', function(e) {
        this.classList.add('touch-active');
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      
      // 터치 이동 (스크롤 감지)
      element.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = Math.abs(touchY - touchStartY);
        const deltaX = Math.abs(touchX - touchStartX);
        
        // 스크롤로 판단되면 터치 효과 제거
        if (deltaY > 10 || deltaX > 10) {
          this.classList.remove('touch-active');
        }
      }, { passive: true });
      
      // 터치 종료
      element.addEventListener('touchend', function() {
        // 약간의 지연으로 터치 효과 제거 (시각적 피드백)
        setTimeout(() => {
          this.classList.remove('touch-active');
        }, 150);
      }, { passive: true });
      
      // 터치 취소
      element.addEventListener('touchcancel', function() {
        this.classList.remove('touch-active');
      }, { passive: true });
    });
  }
}

/**
 * 스크롤 효과 추가 (모바일에서 네비게이션 자동 숨김)
 */
function addScrollEffects() {
  let ticking = false;
  
  function updateNavOnScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.getElementById('top-nav');
    
    if (!nav) return;
    
    // 모바일에서만 스크롤 시 네비게이션 숨김
    if (window.innerWidth <= 768 && !isMobileMenuOpen) {
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // 스크롤 다운 - 네비게이션 숨김
        nav.style.transform = 'translateY(-100%)';
        nav.style.transition = 'transform 0.3s ease';
      } else {
        // 스크롤 업 - 네비게이션 표시
        nav.style.transform = 'translateY(0)';
        nav.style.transition = 'transform 0.3s ease';
      }
    } else {
      // 데스크톱에서는 항상 표시
      nav.style.transform = 'translateY(0)';
    }
    
    // 스크롤 위치에 따른 배경 투명도 조정
    if (scrollTop > 50) {
      nav.style.background = 'rgba(15, 23, 42, 0.98)';
      nav.style.backdropFilter = 'blur(25px)';
    } else {
      nav.style.background = 'rgba(15, 23, 42, 0.95)';
      nav.style.backdropFilter = 'blur(20px)';
    }
    
    lastScrollTop = scrollTop;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateNavOnScroll);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 검색창 모바일 최적화
 */
function enhanceSearchForMobile() {
  const searchInput = document.getElementById('search-input');
  const searchBar = document.getElementById('search-bar');
  
  if (!searchInput || !searchBar) return;
  
  let originalWidth = '';
  let isExpanded = false;
  
  // 모바일에서 검색창 포커스 시 확장
  searchInput.addEventListener('focus', function() {
    if (window.innerWidth <= 768) {
      originalWidth = this.style.width || '';
      this.style.width = 'clamp(200px, 50vw, 300px)';
      this.style.transition = 'width 0.3s ease';
      searchBar.style.zIndex = '1001'; // 다른 요소 위에 표시
      isExpanded = true;
    }
  });
  
  // 포커스 해제 시 원래 크기로
  searchInput.addEventListener('blur', function() {
    if (window.innerWidth <= 768 && isExpanded) {
      setTimeout(() => {
        this.style.width = originalWidth;
        searchBar.style.zIndex = '';
        isExpanded = false;
      }, 150); // 약간의 지연으로 클릭 이벤트 처리 시간 확보
    }
  });
  
  // 검색 실행 최적화
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    
    if (query.length > 0) {
      searchTimeout = setTimeout(() => {
        // 실시간 검색 제안 (추후 구현 가능)
        console.log('실시간 검색:', query);
      }, 300);
    }
  });
}

/**
 * 키보드 네비게이션 지원
 */
function addKeyboardNavigation() {
  // 키보드 네비게이션 상태 관리
  let isKeyboardNavigation = false;
  
  document.addEventListener('keydown', function(e) {
    // 입력 필드에서는 키보드 네비게이션 비활성화
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.isContentEditable
    );
    
    // Tab 키 네비게이션 감지
    if (e.key === 'Tab') {
      isKeyboardNavigation = true;
      document.body.classList.add('keyboard-navigation');
    }
    
    // ESC 키로 모든 메뉴 닫기
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeAllDropdowns();
      return;
    }
    
    if (isInputField) return;
    
    // 모바일 메뉴에서 화살표 키 네비게이션
    if (isMobileMenuOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const mobileMenu = document.getElementById('mobile-menu');
      const navItems = Array.from(mobileMenu.querySelectorAll('.nav-item'));
      const currentIndex = navItems.indexOf(activeElement);
      
      if (currentIndex !== -1) {
        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % navItems.length;
        } else {
          nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
        }
        navItems[nextIndex].focus();
      } else if (navItems.length > 0) {
        navItems[0].focus();
      }
    }
    
    // 메인 메뉴에서 좌우 화살표 키 네비게이션
    if (!isMobileMenuOpen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const mainMenu = document.getElementById('main-menu');
      if (mainMenu && mainMenu.style.display !== 'none') {
        const navItems = Array.from(mainMenu.querySelectorAll('.nav-item'));
        const currentIndex = navItems.indexOf(activeElement);
        
        if (currentIndex !== -1) {
          e.preventDefault();
          let nextIndex;
          if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % navItems.length;
          } else {
            nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
          }
          navItems[nextIndex].focus();
        }
      }
    }
    
    // 숫자 키로 빠른 네비게이션 (1-6)
    if (e.key >= '1' && e.key <= '6' && !isInputField) {
      const shortcuts = ['home', 'buildings', 'community', 'lecture-review', 'notices', 'settings'];
      const target = shortcuts[parseInt(e.key) - 1];
      if (target) {
        e.preventDefault();
        if (target === 'settings') {
          showContent('settings');
        } else {
          showContent(target);
        }
        closeMobileMenu();
      }
    }
  });
  
  // 마우스 사용 시 키보드 네비게이션 표시 제거
  document.addEventListener('mousedown', function() {
    isKeyboardNavigation = false;
    document.body.classList.remove('keyboard-navigation');
  });
  
  // 포커스 트랩 (모바일 메뉴용)
  document.addEventListener('focusin', function(e) {
    if (isMobileMenuOpen) {
      const mobileMenu = document.getElementById('mobile-menu');
      const focusableElements = mobileMenu.querySelectorAll('.nav-item');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (!mobileMenu.contains(e.target)) {
        firstElement.focus();
      }
    }
  });
}

/**
 * 드롭다운 메뉴 터치 최적화
 */
function optimizeDropdownsForTouch() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    // 학생서비스 드롭다운 터치 처리
    const studentServicesItem = document.getElementById('nav-student-services');
    if (studentServicesItem) {
      let touchHandled = false;
      
      studentServicesItem.addEventListener('touchstart', function(e) {
        touchHandled = true;
        e.preventDefault();
        
        const dropdown = this.querySelector('.dropdown-menu');
        const isVisible = dropdown && dropdown.style.display === 'block';
        
        // 다른 드롭다운 닫기
        closeAllDropdowns();
        
        if (!isVisible && dropdown) {
          dropdown.style.display = 'block';
          dropdown.style.opacity = '1';
          dropdown.style.visibility = 'visible';
          dropdown.style.transform = 'translateY(0)';
          dropdown.style.pointerEvents = 'auto';
        }
      }, { passive: false });
      
      // 터치 후 마우스 이벤트 차단
      studentServicesItem.addEventListener('click', function(e) {
        if (touchHandled) {
          e.preventDefault();
          touchHandled = false;
        }
      });
    }
    
    // 사용자 메뉴 터치 처리
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
      userProfile.addEventListener('touchend', function(e) {
        e.preventDefault();
        toggleUserMenu();
      }, { passive: false });
    }
    
    // 알림 버튼 터치 처리
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        toggleNotifications();
      }, { passive: false });
    }
  }
}

/**
 * 이미지 lazy loading 최적화
 */
function optimizeImageLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // data-src 속성을 가진 이미지들에 lazy loading 적용
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.classList.add('lazy');
      imageObserver.observe(img);
    });
  }
}

/**
 * 성능 최적화를 위한 디바운스 함수
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * 스로틀 함수 (스크롤 이벤트용)
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ─────────── 접근성 관련 함수들 ───────────

/**
 * 메뉴 키보드 이벤트 처리
 */
function handleMenuKeydown(event, target) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showContent(target);
  }
}

/**
 * 드롭다운 키보드 이벤트 처리
 */
function handleDropdownKeydown(event, target) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    switch(target) {
      case 'timetable': openTimetablePage(); break;
      case 'calendar': openCalendarPage(); break;
      case 'shuttle': openShuttlePage(); break;
    }
  }
}

/**
 * 모바일 메뉴 키보드 이벤트 처리
 */
function handleMobileMenuKeydown(event, target) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    switch(target) {
      case 'timetable': openTimetablePage(); break;
      case 'calendar': openCalendarPage(); break;
      case 'shuttle': openShuttlePage(); break;
      default: showContent(target); break;
    }
    closeMobileMenu();
  }
}

/**
 * 버튼 키보드 이벤트 처리
 */
function handleButtonKeydown(event, callback) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

/**
 * 서비스 카드 키보드 이벤트 처리
 */
function handleServiceCardKeydown(event, target) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    switch(target) {
      case 'timetable': openTimetablePage(); break;
      case 'shuttle': openShuttlePage(); break;
      default: showContent(target); break;
    }
  }
}

// ─────────── 향상된 사용자 경험 함수들 ───────────

/**
 * 스마트 알림 시스템
 */
function enhanceNotifications() {
  // 알림 권한 요청 (브라우저 알림)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('알림 권한이 허용되었습니다.');
      }
    });
  }
  
  // 웹 앱 매니페스트 지원
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker 등록 실패:', err);
    });
  }
}

/**
 * 오프라인 지원
 */
function addOfflineSupport() {
  window.addEventListener('online', function() {
    showMessage('인터넷 연결이 복구되었습니다', 'success');
    // 오프라인 중 발생한 작업들을 동기화
    syncOfflineData();
  });
  
  window.addEventListener('offline', function() {
    showMessage('오프라인 모드입니다. 일부 기능이 제한됩니다', 'warning');
  });
}

/**
 * 오프라인 데이터 동기화
 */
function syncOfflineData() {
  // 오프라인 중 저장된 데이터가 있다면 서버와 동기화
  const offlineData = localStorage.getItem('offlineData');
  if (offlineData) {
    try {
      const data = JSON.parse(offlineData);
      // 서버로 데이터 전송 로직
      console.log('오프라인 데이터 동기화 중...', data);
      localStorage.removeItem('offlineData');
    } catch (error) {
      console.error('오프라인 데이터 동기화 실패:', error);
    }
  }
}

/**
 * 사용자 활동 추적 (개인정보 보호)
 */
function trackUserActivity() {
  let activityTimeout;
  let isUserActive = true;
  
  function resetActivityTimer() {
    clearTimeout(activityTimeout);
    if (!isUserActive) {
      isUserActive = true;
      console.log('사용자가 다시 활성화되었습니다.');
    }
    
    activityTimeout = setTimeout(() => {
      isUserActive = false;
      console.log('사용자가 비활성 상태입니다.');
    }, 300000); // 5분
  }
  
  // 사용자 활동 이벤트들
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, { passive: true });
  });
  
  resetActivityTimer();
}

// ─────────── 메인 초기화 함수 ───────────

/**
 * 반응형 기능 초기화
 */
function initializeResponsiveFeatures() {
  console.log('반응형 기능 초기화 시작...');
  
  try {
    // 기본 반응형 기능들
    addTouchSupport();
    adjustLayoutForScreenSize();
    addScrollEffects();
    enhanceSearchForMobile();
    addKeyboardNavigation();
    optimizeDropdownsForTouch();
    optimizeImageLoading();
    
    // 향상된 기능들
    enhanceNotifications();
    addOfflineSupport();
    trackUserActivity();
    
    console.log('반응형 기능 초기화 완료');
  } catch (error) {
    console.error('반응형 기능 초기화 중 오류:', error);
  }
}

/**
 * 이벤트 리스너 등록
 */
function setupResponsiveEventListeners() {
  // 리사이즈 이벤트 (디바운스 적용)
  const debouncedResize = debounce(() => {
    adjustLayoutForScreenSize();
    
    // 지도가 있다면 리사이즈
    if (window.naverMap && window.naverMap.refresh) {
      setTimeout(() => {
        window.naverMap.refresh();
      }, 100);
    }
  }, 250);
  
  window.addEventListener('resize', debouncedResize);
  
  // 화면 방향 변경 이벤트
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      adjustLayoutForScreenSize();
      closeMobileMenu();
      
      // 지도 새로고침
      if (window.naverMap && window.naverMap.refresh) {
        window.naverMap.refresh();
      }
    }, 100);
  });
  
  // ESC 키로 모든 메뉴 닫기
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeAllDropdowns();
    }
  });
  
  // 바깥 클릭으로 모바일 메뉴 닫기 (오버레이)
  const overlay = document.getElementById('mobile-menu-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('touchend', function(e) {
      e.preventDefault();
      closeMobileMenu();
    }, { passive: false });
  }
  
  // 페이지 가시성 변경 감지 (탭 전환 등)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // 페이지가 숨겨졌을 때
      console.log('페이지가 백그라운드로 이동했습니다.');
    } else {
      // 페이지가 다시 보여질 때
      console.log('페이지가 포그라운드로 이동했습니다.');
      adjustLayoutForScreenSize();
    }
  });
  
  // 터치 제스처 지원 (스와이프 등)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
  }, { passive: true });
  
  function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    
    // 가로 스와이프가 세로 스와이프보다 큰 경우
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // 오른쪽 스와이프 - 모바일 메뉴 열기 (왼쪽 가장자리에서만)
        if (touchStartX < 50 && window.innerWidth <= 768) {
          openMobileMenu();
        }
      } else {
        // 왼쪽 스와이프 - 모바일 메뉴 닫기
        if (isMobileMenuOpen) {
          closeMobileMenu();
        }
      }
    }
  }
}

/**
 * 성능 최적화 함수
 */
function optimizePerformance() {
  // 이미지 최적화
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // 이미지가 로드되기 전까지 placeholder 표시
    if (!img.complete) {
      img.style.backgroundColor = '#f3f4f6';
      img.style.minHeight = '100px';
    }
    
    img.addEventListener('load', function() {
      this.style.backgroundColor = '';
      this.style.minHeight = '';
      this.classList.add('loaded');
    });
    
    img.addEventListener('error', function() {
      this.src = '/img/placeholder.png'; // 기본 이미지
      this.alt = '이미지를 불러올 수 없습니다';
    });
  });
  
  // 스크롤 성능 최적화
  let ticking = false;
  
  function optimizedScrollHandler() {
    if (!ticking) {
      requestAnimationFrame(() => {
        // 스크롤 관련 처리
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
}

/**
 * 접근성 개선 함수
 */
function enhanceAccessibility() {
  // 고대비 모드 감지
  if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast');
  }
  
  // 애니메이션 감소 모드 감지
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }
  
  // 색상 테마 감지
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.classList.add('prefers-light');
  }
  
  // 포커스 관리 개선
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  document.addEventListener('keydown', function(e) {
    // Tab 트래핑 (모달이나 드롭다운에서)
    if (e.key === 'Tab') {
      const focusable = Array.from(document.querySelectorAll(focusableElements));
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
  
  // ARIA 라이브 영역 설정
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = 'live-region';
  document.body.appendChild(liveRegion);
}

/**
 * 라이브 영역에 메시지 표시 (스크린 리더용)
 */
function announceToScreenReader(message) {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}

/**
 * PWA 지원 추가
 */
function addPWASupport() {
  // 웹 앱 매니페스트 체크
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    document.head.appendChild(manifest);
  }
  
  // iOS 웹앱 메타태그
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const iosCapable = document.createElement('meta');
    iosCapable.name = 'apple-mobile-web-app-capable';
    iosCapable.content = 'yes';
    document.head.appendChild(iosCapable);
  }
  
  // Service Worker 등록
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // 앱 설치 프롬프트
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 설치 버튼 표시 (선택사항)
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('사용자가 앱 설치를 승인했습니다');
          }
          deferredPrompt = null;
        });
      });
    }
  });
}

/**
 * 에러 처리 및 로깅 개선
 */
function setupErrorHandling() {
  // 전역 에러 핸들러
  window.addEventListener('error', function(e) {
    console.error('전역 에러:', e.error);
    
    // 사용자에게 친화적인 에러 메시지 표시
    if (window.showMessage) {
      showMessage('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    }
    
    // 에러 로깅 (개발 환경에서만)
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.group('에러 상세 정보');
      console.error('파일:', e.filename);
      console.error('라인:', e.lineno);
      console.error('컬럼:', e.colno);
      console.error('스택:', e.error?.stack);
      console.groupEnd();
    }
  });
  
  // Promise rejection 핸들러
  window.addEventListener('unhandledrejection', function(e) {
    console.error('처리되지 않은 Promise 거부:', e.reason);
    e.preventDefault();
    
    if (window.showMessage) {
      showMessage('네트워크 오류가 발생했습니다. 연결을 확인해주세요.', 'error');
    }
  });
}

/**
 * 기존 closeAllDropdowns 함수 확장
 */
function enhanceCloseAllDropdowns() {
  const originalCloseAllDropdowns = window.closeAllDropdowns;
  
  window.closeAllDropdowns = function() {
    // 기존 드롭다운 닫기
    if (typeof originalCloseAllDropdowns === 'function') {
      originalCloseAllDropdowns();
    }
    
    // 모바일 메뉴도 닫기
    closeMobileMenu();
    
    // 확장된 검색창 복원
    const searchInput = document.getElementById('search-input');
    const searchBar = document.getElementById('search-bar');
    if (searchInput && searchBar) {
      searchInput.style.width = '';
      searchBar.style.zIndex = '';
    }
  };
}

/**
 * 브라우저 호환성 체크
 */
function checkBrowserCompatibility() {
  const unsupportedFeatures = [];
  
  // 필수 기능들 체크
  if (!('Promise' in window)) unsupportedFeatures.push('Promise');
  if (!('fetch' in window)) unsupportedFeatures.push('Fetch API');
  if (!('addEventListener' in window)) unsupportedFeatures.push('Event Listeners');
  if (!('classList' in document.createElement('div'))) unsupportedFeatures.push('ClassList');
  
  if (unsupportedFeatures.length > 0) {
    console.warn('지원되지 않는 기능들:', unsupportedFeatures);
    
    // 폴리필 로드 또는 대체 기능 제공
    if (window.showMessage) {
      showMessage('일부 기능이 제한될 수 있습니다. 최신 브라우저 사용을 권장합니다.', 'warning');
    }
  }
}

// ─────────── 메인 실행 함수 ───────────

/**
 * DOMContentLoaded 이벤트에서 호출할 메인 함수
 */
function initializeAllResponsiveFeatures() {
  console.log('🚀 반응형 웹 기능 초기화 시작...');
  
  try {
    // 브라우저 호환성 체크
    checkBrowserCompatibility();
    
    // 핵심 반응형 기능
    initializeResponsiveFeatures();
    
    // 이벤트 리스너 설정
    setupResponsiveEventListeners();
    
    // 성능 최적화
    optimizePerformance();
    
    // 접근성 개선
    enhanceAccessibility();
    
    // PWA 지원
    addPWASupport();
    
    // 에러 처리
    setupErrorHandling();
    
    // 기존 함수 확장
    enhanceCloseAllDropdowns();
    
    // 초기 레이아웃 설정
    adjustLayoutForScreenSize();
    
    console.log('✅ 반응형 웹 기능 초기화 완료');
    
    // 초기화 완료 알림 (개발 환경에서만)
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.log('📱 모바일 최적화: 활성화');
      console.log('⌨️ 키보드 네비게이션: 활성화');
      console.log('👆 터치 지원: 활성화');
      console.log('🎨 다크모드 지원: 활성화');
      console.log('♿ 접근성 개선: 활성화');
    }
    
  } catch (error) {
    console.error('❌ 반응형 기능 초기화 중 오류:', error);
    
    // 기본적인 모바일 메뉴라도 동작하도록 폴백
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
  }
}

// ─────────── 유틸리티 함수들 ───────────

/**
 * 디바이스 감지 유틸리티
 */
const DeviceDetector = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: () => /Android/.test(navigator.userAgent),
  isStandalone: () => window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
};

/**
 * 반응형 유틸리티 함수들
 */
const ResponsiveUtils = {
  // 현재 브레이크포인트 반환
  getCurrentBreakpoint: () => {
    const width = window.innerWidth;
    if (width <= 480) return 'xs';
    if (width <= 768) return 'sm';
    if (width <= 1024) return 'md';
    if (width <= 1200) return 'lg';
    return 'xl';
  },
  
  // 뷰포트 크기 정보
  getViewportInfo: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: window.screen?.orientation?.type || 'unknown'
  }),
  
  // 스크롤 위치 정보
  getScrollInfo: () => ({
    top: window.pageYOffset || document.documentElement.scrollTop,
    left: window.pageXOffset || document.documentElement.scrollLeft,
    maxY: document.documentElement.scrollHeight - window.innerHeight,
    maxX: document.documentElement.scrollWidth - window.innerWidth
  })
};

// ─────────── 전역 스코프에 함수 노출 ───────────

// 기존 index.js에서 사용할 수 있도록 전역 함수로 노출
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openMobileMenu = openMobileMenu;
window.adjustLayoutForScreenSize = adjustLayoutForScreenSize;
window.handleMenuKeydown = handleMenuKeydown;
window.handleDropdownKeydown = handleDropdownKeydown;
window.handleMobileMenuKeydown = handleMobileMenuKeydown;
window.handleButtonKeydown = handleButtonKeydown;
window.handleServiceCardKeydown = handleServiceCardKeydown;
window.announceToScreenReader = announceToScreenReader;
window.DeviceDetector = DeviceDetector;
window.ResponsiveUtils = ResponsiveUtils;

// ─────────── 즉시 실행 (문서 로드 상태에 따라) ───────────

// 문서가 이미 로드된 경우 즉시 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllResponsiveFeatures);
} else {
  // DOM이 이미 로드되었다면 즉시 실행
  initializeAllResponsiveFeatures();
}

// ─────────── DOMContentLoaded 이벤트 리스너 - 완전한 코드 ───────────
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash + 'Content')) {
    showContent(hash);
  } else {
    showContent('home');
  }

  initializeApp();
  setupNetworkListeners();
  setupAutoLogout();
  applyKeyboardShortcuts();
  applyUserShortcuts();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
    resetAutoLogoutTimer();
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGlobalSearch();
      }
    });
    searchInput.addEventListener('keydown', resetAutoLogoutTimer);
  }

  // 학생서비스 드롭다운 개선된 이벤트 처리
  const studentServices = document.getElementById('nav-student-services');
  if (studentServices) {
    let hoverTimeout;
    
    // 마우스 엔터 시 드롭다운 표시
    studentServices.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      showStudentServiceDropdown();
    });
    
    // 마우스 리브 시 약간의 지연 후 드롭다운 숨김
    studentServices.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        closeStudentServiceDropdown();
      }, 150); // 150ms 지연
    });
    
    // 드롭다운 메뉴 자체에도 이벤트 추가
    const dropdown = studentServices.querySelector('.dropdown-menu');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        showStudentServiceDropdown();
      });
      
      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          closeStudentServiceDropdown();
        }, 150);
      });
    }
  }

  // 학생서비스 드롭다운 항목들에 직접 이벤트 리스너 추가
  setTimeout(() => {
    const dropdownItems = document.querySelectorAll('#nav-student-services .dropdown-item');
    dropdownItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log(`드롭다운 항목 ${index} 클릭됨`);
        
        switch(index) {
          case 0: openTimetablePage(); break;
          case 1: openCalendarPage(); break;
          case 2: openShuttlePage(); break;
        }
      });
    });
  }, 100);

  // 전역 클릭 이벤트에서 학생서비스 드롭다운 처리 개선
  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    const ssBtn = event.target.closest('#nav-student-services');

    if (!ntBtn) closeNotificationDropdown();
    if (!upBtn) closeUserDropdown();
    if (!ssBtn) {
      // 학생서비스 영역 밖을 클릭하면 드롭다운 즉시 숨김
      closeStudentServiceDropdown();
    }

    resetAutoLogoutTimer();
  });

  // ★★★ 반응형 기능 초기화 - 이 한 줄을 추가하세요! ★★★
  initializeAllResponsiveFeatures();
});
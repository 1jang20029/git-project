// dropdown-manager.js - 드롭다운 관리
/**
 * ===========================================
 * 드롭다운 관리 모듈
 * ===========================================
 */
const DropdownManager = (() => {

  /**
   * 학생서비스 드롭다운 표시
   */
  const showStudentServiceDropdown = () => {
    const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
    if (dropdown) {
      dropdown.style.opacity = '1';
      dropdown.style.visibility = 'visible';
      dropdown.style.transform = 'translateY(0)';
      dropdown.style.pointerEvents = 'auto';
    }
  };

  /**
   * 학생서비스 드롭다운 숨기기
   */
  const closeStudentServiceDropdown = () => {
    const dropdown = document.querySelector('#nav-student-services .dropdown-menu');
    if (dropdown) {
      dropdown.style.opacity = '0';
      dropdown.style.visibility = 'hidden';
      dropdown.style.transform = 'translateY(-10px)';
      dropdown.style.pointerEvents = 'none';
    }
  };

  /**
   * 알림 드롭다운 토글
   */
  const toggleNotifications = () => {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      closeNotificationDropdown();
    } else {
      showNotificationDropdown();
    }
  };

  /**
   * 알림 드롭다운 표시
   */
  const showNotificationDropdown = () => {
    closeUserDropdown();
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) dropdown.classList.add('show');
  };

  /**
   * 알림 드롭다운 숨기기
   */
  const closeNotificationDropdown = () => {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) dropdown.classList.remove('show');
  };

  /**
   * 사용자 메뉴 토글
   */
  const toggleUserMenu = () => {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      closeUserDropdown();
    } else {
      showUserDropdown();
    }
  };

  /**
   * 사용자 드롭다운 표시
   */
  const showUserDropdown = () => {
    closeNotificationDropdown();
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.add('show');
  };

  /**
   * 사용자 드롭다운 숨기기
   */
  const closeUserDropdown = () => {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.remove('show');
  };

  /**
   * 모든 드롭다운 닫기
   */
  const closeAllDropdowns = () => {
    closeNotificationDropdown();
    closeUserDropdown();
    closeStudentServiceDropdown();
  };

  /**
   * 학생서비스 드롭다운 이벤트 설정
   */
  const setupStudentServiceDropdown = () => {
    const studentServices = document.getElementById('nav-student-services');
    if (!studentServices) return;
    
    let hoverTimeout;
    
    studentServices.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      showStudentServiceDropdown();
    });
    
    studentServices.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(closeStudentServiceDropdown, 150);
    });
    
    const dropdown = studentServices.querySelector('.dropdown-menu');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
      });
      
      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(closeStudentServiceDropdown, 150);
      });
    }
    
    // 드롭다운 항목 클릭 처리
    setTimeout(() => {
      const dropdownItems = document.querySelectorAll('#nav-student-services .dropdown-item');
      dropdownItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          const actions = [
            () => NavigationManager.navigateToExternal('timetable.html'),
            () => NavigationManager.navigateToExternal('academic-calendar.html'),
            () => NavigationManager.navigateToExternal('shuttle.html')
          ];
          
          if (actions[index]) {
            actions[index]();
          }
        });
      });
    }, 100);
  };

  return {
    showStudentServiceDropdown,
    closeStudentServiceDropdown,
    toggleNotifications,
    showNotificationDropdown,
    closeNotificationDropdown,
    toggleUserMenu,
    showUserDropdown,
    closeUserDropdown,
    closeAllDropdowns,
    setupStudentServiceDropdown
  };
})();

// 전역으로 노출
window.DropdownManager = DropdownManager;
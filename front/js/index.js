    // 모바일 메뉴 토글
    function toggleMobileMenu() {
      const mainMenu = document.getElementById('main-menu');
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      
      if (mainMenu.classList.contains('mobile-open')) {
        mainMenu.classList.remove('mobile-open');
        mobileToggle.textContent = '☰';
      } else {
        mainMenu.classList.add('mobile-open');
        mobileToggle.textContent = '✕';
      }
    }

    // 학생서비스 드롭다운 토글
    function toggleStudentServices(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      const studentServicesItem = document.getElementById('nav-student-services');
      
      // 모바일에서만 클릭으로 토글
      if (window.innerWidth <= 768) {
        studentServicesItem.classList.toggle('dropdown-open');
      }
    }

    // 알림 토글
    function toggleNotifications() {
      const dropdown = document.getElementById('notification-dropdown');
      const userDropdown = document.getElementById('user-dropdown');
      
      userDropdown.classList.remove('show');
      
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      } else {
        dropdown.classList.add('show');
      }
    }

    // 사용자 메뉴 토글
    function toggleUserMenu() {
      const dropdown = document.getElementById('user-dropdown');
      const notificationDropdown = document.getElementById('notification-dropdown');
      
      notificationDropdown.classList.remove('show');
      
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      } else {
        dropdown.classList.add('show');
      }
    }

    // 알림 읽음 처리
    function markAllAsRead() {
      console.log('모든 알림을 읽음 처리합니다.');
    }

    // 프로필 표시
    function showProfile() {
      console.log('프로필 페이지로 이동합니다.');
      document.getElementById('user-dropdown').classList.remove('show');
    }

    // 컨텐츠 표시
    function showContent(contentType) {
      console.log(`${contentType} 콘텐츠를 표시합니다.`);
      
      // 모든 드롭다운 닫기
      document.getElementById('user-dropdown').classList.remove('show');
      document.getElementById('notification-dropdown').classList.remove('show');
      
      // 모바일 메뉴 닫기
      const mainMenu = document.getElementById('main-menu');
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      if (mainMenu.classList.contains('mobile-open')) {
        mainMenu.classList.remove('mobile-open');
        mobileToggle.textContent = '☰';
      }
      
      // 모든 네비게이션 아이템에서 active 클래스 제거
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('dropdown-open');
      });
      
      // 클릭된 메뉴 아이템에 active 클래스 추가
      const clickedItem = document.getElementById(`nav-${contentType}`);
      if (clickedItem) {
        clickedItem.classList.add('active');
      }
    }

    // 로그아웃 처리
    function handleLogout() {
      console.log('로그아웃 처리합니다.');
      document.getElementById('user-dropdown').classList.remove('show');
    }

    // 외부 페이지로 이동하는 함수들
    function openTimetablePage() {
      console.log('시간표 페이지로 이동합니다.');
      window.location.href = 'pages/list/timetable.html';
    }

    function openCalendarPage() {
      console.log('학사일정 페이지로 이동합니다.');
      window.location.href = 'pages/list/academic-calendar.html';
    }

    function openShuttlePage() {
      console.log('셔틀버스 페이지로 이동합니다.');
      window.location.href = 'pages/list/shuttle.html';
    }

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(event) {
      const notificationBtn = document.getElementById('notification-btn');
      const userProfile = document.getElementById('user-profile');
      const notificationDropdown = document.getElementById('notification-dropdown');
      const userDropdown = document.getElementById('user-dropdown');
      const studentServices = document.getElementById('nav-student-services');
      
      if (!notificationBtn.contains(event.target)) {
        notificationDropdown.classList.remove('show');
      }
      
      if (!userProfile.contains(event.target)) {
        userDropdown.classList.remove('show');
      }
      
      // 모바일에서 학생서비스 드롭다운 외부 클릭 시 닫기
      if (window.innerWidth <= 768 && !studentServices.contains(event.target)) {
        studentServices.classList.remove('dropdown-open');
      }
    });

    // 윈도우 리사이즈 시 메뉴 자동 닫기
    window.addEventListener('resize', function() {
      const mainMenu = document.getElementById('main-menu');
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      
      if (window.innerWidth > 768) {
        mainMenu.classList.remove('mobile-open');
        mobileToggle.textContent = '☰';
        
        // 학생서비스 드롭다운도 닫기
        document.getElementById('nav-student-services').classList.remove('dropdown-open');
      }
    });

    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
      const homeMenu = document.getElementById('nav-home');
      if (homeMenu) {
        homeMenu.classList.add('active');
      }
    });
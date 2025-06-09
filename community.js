// index.js

// ─────────── 전역 변수 선언 ───────────
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocation = null;
let currentContent = 'home';
let unreadNotifications = 0;
let isOnline = navigator.onLine;

// 페이지 로드 상태 변수
let settingsLoaded = false;
let communityLoaded = false;
let lectureLoaded = false;
let noticesLoaded = false;
let buildingsLoaded = false;

// 자동 로그아웃 타이머
let autoLogoutTimer = null;

// 학과 코드 ↔ 이름 매핑 객체
const departmentMap = {};

// ─────────── DOMContentLoaded ───────────
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

  document.addEventListener('click', (event) => {
    const ntBtn = event.target.closest('#notification-btn');
    const upBtn = event.target.closest('#user-profile');
    const ssBtn = event.target.closest('#nav-student-services');

    if (!ntBtn) closeNotificationDropdown();
    if (!upBtn) closeUserDropdown();
    if (!ssBtn) closeStudentServiceDropdown();

    resetAutoLogoutTimer();
  });
});

// ─────────── 네트워크 상태 감지 ───────────
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    isOnline = true;
    showMessage('인터넷 연결이 복구되었습니다', 'success');
    initializeApp();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    showMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다', 'error');
  });
}

// ─────────── showContent: SPA 전환 ───────────
function showContent(type) {
  const panes = [
    'homeContent',
    'buildingsContent',
    'communityContent',
    'lecture-reviewContent',
    'noticesContent',
    'timetableContentPane',
    'shuttleContentPane',
    'calendarContentPane',
    'profileContentPane',
    'settingsContent'
  ];

  panes.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 동적 로딩: settings
  if (type === 'settings' && !settingsLoaded) {
    const container = document.getElementById('settingsContent');
    fetch('settings.html')
      .then(res => {
        if (!res.ok) throw new Error('settings.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        settingsLoaded = true;
        if (window.initSettingsPage) window.initSettingsPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>설정 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  // 동적 로딩: community
  if (type === 'community' && !communityLoaded) {
    const container = document.getElementById('communityContent');
    fetch('community.html')
      .then(res => {
        if (!res.ok) throw new Error('community.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        communityLoaded = true;
        if (window.initCommunityPage) window.initCommunityPage();
        initCommunityLogic(); // ← 커뮤니티 동작 로직 초기화
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>커뮤니티 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  // 동적 로딩: lecture-review
  if (type === 'lecture-review' && !lectureLoaded) {
    const container = document.getElementById('lecture-reviewContent');
    fetch('lecture-review.html')
      .then(res => {
        if (!res.ok) throw new Error('lecture-review.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        lectureLoaded = true;
        if (window.initLectureReviewPage) window.initLectureReviewPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>강의평가 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  // 동적 로딩: notices
  if (type === 'notices' && !noticesLoaded) {
    const container = document.getElementById('noticesContent');
    fetch('notices.html')
      .then(res => {
        if (!res.ok) throw new Error('notices.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        noticesLoaded = true;
        if (window.initNoticesPage) window.initNoticesPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>공지사항 화면을 불러올 수 없습니다</p>
        </div>`;
      });
  }

  // 동적 로딩: buildings
  if (type === 'buildings' && !buildingsLoaded) {
    const container = document.getElementById('buildingsContent');
    fetch('buildings.html')
      .then(res => {
        if (!res.ok) throw new Error('buildings.html 을 불러오는 중 오류 발생');
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        buildingsLoaded = true;
        if (window.initBuildingsPage) window.initBuildingsPage();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = `<div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>건물 페이지를 불러올 수 없습니다</p>
        </div>`;
      });
  }

  const targetMap = {
    home: 'homeContent',
    buildings: 'buildingsContent',
    community: 'communityContent',
    'lecture-review': 'lecture-reviewContent',
    notices: 'noticesContent',
    timetable: 'timetableContentPane',
    shuttle: 'shuttleContentPane',
    calendar: 'calendarContentPane',
    profile: 'profileContentPane',
    settings: 'settingsContent'
  };

  const targetId = targetMap[type] || 'homeContent';
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.style.display = 'block';
    targetEl.classList.add('fade-in');
  }

  document.querySelectorAll('#main-menu .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const navItem = document.getElementById('nav-' + type);
  if (navItem) navItem.classList.add('active');

  currentContent = type;
  window.location.hash = type;

  if (type === 'buildings' && naverMap) {
    setTimeout(() => {
      if (naverMap.refresh) naverMap.refresh();
    }, 100);
  }
}

// ─────────── 커뮤니티 페이지 로직 ───────────
function initCommunityLogic() {
  // 커뮤니티 게시글 데이터(임시, 실제 서버 연결시 fetch로 대체)
  let postId = 4;
  let posts = [
    { id: 1, title: "학식 메뉴 공유해요", content: "오늘 학식 맛있음ㅋㅋ", likes: 12, time: "1시간 전" },
    { id: 2, title: "자취방 정보", content: "근처 원룸 시세 얼마에요?", likes: 9, time: "2시간 전" },
    { id: 3, title: "동아리 모집", content: "운동 동아리 들어오세요~", likes: 7, time: "3시간 전" }
  ];

  function renderPosts() {
    // 인기 게시글 (좋아요 순 상위 3개)
    const hotPostsEl = document.getElementById('hotPosts');
    if (hotPostsEl) {
      let hot = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);
      hotPostsEl.innerHTML = hot.map(p => `
        <div class="notice-item" style="margin-bottom:1rem;">
          <div class="notice-title">${p.title}</div>
          <div class="notice-summary">${p.content}</div>
          <div style="font-size:0.9rem;color:#f59e0b;font-weight:600;">👍 ${p.likes} &nbsp; · &nbsp; ${p.time}</div>
        </div>
      `).join('');
    }
    // 새 게시글 (최신순 상위 5개)
    const livePostsEl = document.getElementById('livePosts');
    if (livePostsEl) {
      let live = [...posts].sort((a, b) => b.id - a.id).slice(0, 5);
      livePostsEl.innerHTML = live.map(p => `
        <div class="notice-item" style="margin-bottom:1rem;">
          <div class="notice-title">${p.title}</div>
          <div class="notice-summary">${p.content}</div>
          <div style="font-size:0.9rem;color:#3b82f6;font-weight:600;">🕒 ${p.time} &nbsp; · &nbsp; 👍 ${p.likes}</div>
        </div>
      `).join('');
    }
  }

  renderPosts();

  // 새 게시글 작성 폼 이벤트
  const form = document.getElementById('writePostForm');
  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      const title = document.getElementById('postTitle').value.trim();
      const content = document.getElementById('postContent').value.trim();
      if (!title || !content) return;
      posts.unshift({
        id: ++postId,
        title,
        content,
        likes: 0,
        time: "방금 전"
      });
      renderPosts();
      form.reset();
      showMessage('게시글이 등록되었습니다', 'success');
    };
  }
}

// ─────── (이하 기존 대시보드, 건물, 알림, 시간표, 기타 함수들은 기존과 동일) ───────

// ※ 이하의 모든 함수는 기존 index.js 코드와 동일하게, 위에서 보여드린 index.js 구조와 맥락이 같습니다.
// (SPA 처리, 대시보드, 알림, 건물, 시간표, 네이버 지도, 로그아웃, 테마 등 기존 코드가 그대로 있습니다.)
// (이전 답변에서 전체 코드로 이미 보여드렸으니 여기서 생략합니다. 필요한 경우 모든 함수 추가로 다시 붙여드릴 수 있습니다.)


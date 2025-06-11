// compatibility.js - 기존 코드 호환성을 위한 함수들
/**
 * ===========================================
 * 기존 코드와의 호환성을 위한 전역 함수들
 * ===========================================
 */

/**
 * 지도 컨트롤 함수들
 */
function zoomIn() {
  const map = AppState.get('naverMap');
  if (map) {
    map.setZoom(map.getZoom() + 1);
  }
}

function zoomOut() {
  const map = AppState.get('naverMap');
  if (map) {
    map.setZoom(map.getZoom() - 1);
  }
}

function resetMapView() {
  const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
  MapManager.moveMapCenter(yeonsung, 16);
}

async function trackUserLocation() {
  try {
    const userPosition = await MapManager.getCurrentLocation();
    MapManager.addUserLocationMarker(userPosition);
    MapManager.moveMapCenter(userPosition, 18);
    Utils.showMessage('현재 위치를 찾았습니다', 'success');
  } catch (error) {
    console.error('위치 추적 오류:', error);
    Utils.showMessage('위치를 찾을 수 없습니다', 'error');
  }
}

/**
 * 프로필 관련 함수들
 */
function showProfile() {
  DropdownManager.closeAllDropdowns();
  NavigationManager.showContent('profile');
}

/**
 * 알림 관련 함수들
 */
function markAllAsRead() {
  const notificationItems = document.querySelectorAll('.notification-item.unread');
  notificationItems.forEach(async (item) => {
    const notificationId = item.dataset.notificationId;
    if (notificationId) {
      const success = await DataManager.markNotificationAsRead(notificationId);
      if (success) {
        item.classList.remove('unread');
      }
    }
  });
  
  UIRenderer.updateNotificationBadge(0);
  Utils.showMessage('모든 알림을 읽음 처리했습니다', 'success');
}

/**
 * 학생 서비스 페이지 함수들 (기존 HTML 호환성)
 */
function openTimetablePage() {
  NavigationManager.navigateToExternal('timetable.html');
}

function openCalendarPage() {
  NavigationManager.navigateToExternal('academic-calendar.html');
}

function openShuttlePage() {
  NavigationManager.navigateToExternal('shuttle.html');
}

/**
 * 셔틀버스 관련 함수들
 */
async function loadShuttleInfo() {
  try {
    const response = await NetworkManager.fetchWithNetworkCheck('/api/shuttle/status');
    if (response.ok) {
      const shuttleData = await response.json();
      renderShuttleStatus(shuttleData);
    }
  } catch (error) {
    console.error('셔틀버스 정보 로드 실패:', error);
    document.getElementById('shuttleStatus').textContent = '정보를 불러올 수 없습니다';
  }
}

function renderShuttleStatus(data) {
  const timeElement = document.getElementById('shuttle-time');
  const descElement = document.getElementById('shuttle-desc');
  const statusElement = document.getElementById('shuttleStatus');
  
  if (timeElement) timeElement.textContent = data.nextArrival || '--';
  if (descElement) descElement.textContent = data.route || '--';
  if (statusElement) statusElement.textContent = data.status || '--';
}

/**
 * 공지사항 관련 함수들
 */
async function loadRecentNotices() {
  try {
    const response = await NetworkManager.fetchWithNetworkCheck('/api/notices/recent');
    if (response.ok) {
      const notices = await response.json();
      renderRecentNotices(notices);
    }
  } catch (error) {
    console.error('최근 공지사항 로드 실패:', error);
  }
}

function renderRecentNotices(notices) {
  const container = document.getElementById('recentNotices');
  if (!container) return;
  
  if (!notices || notices.length === 0) {
    container.innerHTML = '<p>최근 공지사항이 없습니다.</p>';
    return;
  }
  
  container.innerHTML = notices.slice(0, 5).map(notice => `
    <div class="notice-item" onclick="showNoticeDetail('${notice.id}')">
      <div class="notice-title">${notice.title}</div>
      <div class="notice-date">${notice.date}</div>
    </div>
  `).join('');
}

function showNoticeDetail(noticeId) {
  NavigationManager.showContent('notices');
  // 공지사항 상세 페이지로 이동하는 로직
  setTimeout(() => {
    if (window.openNoticeDetail) {
      window.openNoticeDetail(noticeId);
    }
  }, 100);
}

/**
 * 검색 결과 처리 (기존 코드 호환성)
 */
function showSearchResults(results) {
  UIRenderer.showSearchResults(results);
}

/**
 * 에러 처리 함수들
 */
function showErrorMessage(message) {
  Utils.showMessage(message, 'error');
}

function showSuccessMessage(message) {
  Utils.showMessage(message, 'success');
}

function showInfoMessage(message) {
  Utils.showMessage(message, 'info');
}

/**
 * 초기화 함수들 (기존 개별 JS 파일들과의 호환성)
 */
function initSettingsPage() {
  // settings.js에서 호출할 수 있는 초기화 함수
  console.log('설정 페이지 초기화');
}

function initCommunityPage() {
  // community.js에서 호출할 수 있는 초기화 함수
  console.log('커뮤니티 페이지 초기화');
}

function initLectureReviewPage() {
  // lecture-review.js에서 호출할 수 있는 초기화 함수
  console.log('강의평가 페이지 초기화');
}

function initNoticesPage() {
  // notices.js에서 호출할 수 있는 초기화 함수
  console.log('공지사항 페이지 초기화');
  loadRecentNotices();
}

function initBuildingsPage() {
  // buildings.js에서 호출할 수 있는 초기화 함수
  console.log('건물정보 페이지 초기화');
  MapManager.loadBuildingMarkers();
}

/**
 * 레거시 데이터 로드 함수들
 */
async function refreshDashboard() {
  await DataManager.loadDashboardData();
  await loadShuttleInfo();
  await loadRecentNotices();
}

/**
 * 개발자 도구 함수들
 */
function getAppStatus() {
  return {
    currentContent: AppState.get('currentContent'),
    isOnline: AppState.get('isOnline'),
    loadedPages: Array.from(AppState.get('loadedPages')),
    hasMap: !!AppState.get('naverMap'),
    markerCount: AppState.get('mapMarkers').length
  };
}

// 모든 호환성 함수들을 window에 노출
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetMapView = resetMapView;
window.trackUserLocation = trackUserLocation;
window.showProfile = showProfile;
window.markAllAsRead = markAllAsRead;
window.openTimetablePage = openTimetablePage;
window.openCalendarPage = openCalendarPage;
window.openShuttlePage = openShuttlePage;
window.showSearchResults = showSearchResults;
window.showErrorMessage = showErrorMessage;
window.showSuccessMessage = showSuccessMessage;
window.showInfoMessage = showInfoMessage;
window.refreshDashboard = refreshDashboard;
window.getAppStatus = getAppStatus;
// 뒤로가기 함수
function goBack() {
    if (confirm('이전 페이지로 돌아가시겠습니까?')) {
        window.history.back();
    }
}

// 검색 토글
function toggleSearch() {
    const searchSection = document.getElementById('searchSection');
    const searchInput = document.getElementById('activitySearch');
    
    searchSection.classList.toggle('active');
    
    if (searchSection.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchActivities();
    }
    
    updateClearButton();
}

// 활동 검색
function searchActivities() {
    const searchTerm = document.getElementById('activitySearch').value.toLowerCase();
    const activities = document.querySelectorAll('.activity-item');
    
    updateClearButton();
    
    activities.forEach(activity => {
        const title = activity.querySelector('.activity-title').textContent.toLowerCase();
        const description = activity.querySelector('.activity-description').textContent.toLowerCase();
        const tags = Array.from(activity.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) ||
                       tags.some(tag => tag.includes(searchTerm));
        
        if (matches || searchTerm === '') {
            activity.classList.remove('hidden');
        } else {
            activity.classList.add('hidden');
        }
    });
    
    updateStats();
}

// 검색어 삭제
function clearActivitySearch() {
    document.getElementById('activitySearch').value = '';
    searchActivities();
    updateClearButton();
}

// 검색 삭제 버튼 업데이트
function updateClearButton() {
    const clearButton = document.querySelector('.search-clear');
    const searchInput = document.getElementById('activitySearch');
    
    if (searchInput.value.trim() !== '') {
        clearButton.style.display = 'block';
    } else {
        clearButton.style.display = 'none';
    }
}

// 카테고리 필터
function filterByCategory(category) {
    // 탭 버튼 상태 업데이트
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // 활동 아이템 필터링
    const activities = document.querySelectorAll('.activity-item');
    
    activities.forEach(activity => {
        if (category === 'all') {
            activity.classList.remove('hidden');
        } else {
            const activityCategory = activity.getAttribute('data-category');
            if (activityCategory === category) {
                activity.classList.remove('hidden');
            } else {
                activity.classList.add('hidden');
            }
        }
    });
    
    updateStats();
}

// 통계 업데이트
function updateStats() {
    const visibleActivities = document.querySelectorAll('.activity-item:not(.hidden)');
    const contestCount = Array.from(visibleActivities).filter(item => item.classList.contains('contest')).length;
    const clubCount = Array.from(visibleActivities).filter(item => item.classList.contains('club')).length;
    const externalCount = Array.from(visibleActivities).filter(item => item.classList.contains('external')).length;
    const volunteerCount = Array.from(visibleActivities).filter(item => item.classList.contains('volunteer')).length;
    
    const stats = document.querySelectorAll('.stat-number');
    stats[0].textContent = contestCount;
    stats[1].textContent = clubCount;
    stats[2].textContent = externalCount;
    stats[3].textContent = volunteerCount;
}

// 활동 상세 보기
function viewActivityDetail(activityId) {
    // 실제 구현에서는 해당 활동의 상세 페이지로 이동
    alert(`${activityId} 상세 페이지로 이동합니다.`);
    // window.location.href = `activity-detail.html?id=${activityId}`;
}

// 활동 신청/지원
function applyActivity(activityId) {
    // 로그인 상태 확인 (실제 구현에서)
    const isLoggedIn = localStorage.getItem('currentLoggedInUser');
    
    if (!isLoggedIn) {
        alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    // 신청 확인
    if (confirm('이 활동에 신청하시겠습니까?')) {
        alert('신청이 완료되었습니다. 관련 부서에서 연락드릴 예정입니다.');
        
        // 실제 구현에서는 서버에 신청 데이터 전송
        // submitApplication(activityId);
    }
}

// 더 많은 활동 로드
function loadMoreActivities() {
    // 실제 구현에서는 서버에서 추가 데이터를 가져와서 동적으로 추가
    alert('추가 활동을 불러오는 중입니다. 현재는 데모 버전입니다.');
    
    // 예시: 더미 데이터 추가
    // const newActivities = await fetchMoreActivities();
    // appendActivities(newActivities);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 검색 입력 이벤트 리스너
    const searchInput = document.getElementById('activitySearch');
    searchInput.addEventListener('input', searchActivities);
    
    // 초기 통계 업데이트
    updateStats();
    
    console.log('교내/대외활동 페이지가 로드되었습니다.');
});

// 키보드 이벤트 처리
document.addEventListener('keydown', function(event) {
    // ESC 키로 검색 닫기
    if (event.key === 'Escape') {
        const searchSection = document.getElementById('searchSection');
        if (searchSection.classList.contains('active')) {
            toggleSearch();
        }
    }
});

// 유틸리티 함수들
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateDaysLeft(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        return `D-${diffDays}`;
    } else if (diffDays === 0) {
        return '오늘마감';
    } else {
        return '마감됨';
    }
}

// 즐겨찾기 기능 (선택사항)
function toggleFavorite(activityId) {
    const favorites = JSON.parse(localStorage.getItem('favoriteActivities') || '[]');
    const index = favorites.indexOf(activityId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        alert('즐겨찾기에서 제거되었습니다.');
    } else {
        favorites.push(activityId);
        alert('즐겨찾기에 추가되었습니다.');
    }
    
    localStorage.setItem('favoriteActivities', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favoriteActivities') || '[]');
    // 즐겨찾기 버튼 상태 업데이트 로직
}

// 에러 처리
window.addEventListener('error', function(event) {
    console.error('JavaScript 오류:', event.error);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    // 필요한 정리 작업 수행
    console.log('교내/대외활동 페이지를 떠납니다.');
});
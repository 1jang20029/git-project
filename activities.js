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

// 페이지네이션 관련 변수
let currentPage = 1;
let itemsPerPage = 5;
let totalItems = 0;
let totalPages = 0;
let allActivities = [];

// 페이지 이동
function goToPage(page) {
    // 이전 페이지 버튼
    if (page === 'prev') {
        if (currentPage > 1) {
            currentPage--;
        } else {
            return; // 첫 페이지면 아무것도 하지 않음
        }
    } 
    // 다음 페이지 버튼
    else if (page === 'next') {
        if (currentPage < totalPages) {
            currentPage++;
        } else {
            return; // 마지막 페이지면 아무것도 하지 않음
        }
    } 
    // 특정 페이지 번호
    else {
        currentPage = parseInt(page);
    }
    
    // 페이지네이션 버튼 업데이트
    updatePaginationButtons();
    
    // 활동 표시 업데이트
    displayActivitiesByPage();
}

// 페이지네이션 버튼 상태 업데이트
function updatePaginationButtons() {
    // 모든 페이지 버튼의 active 상태 제거
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('disabled');
    });
    
    // 현재 페이지 버튼 active 상태로 변경
    const currentPageBtn = document.querySelector(`.page-btn[data-page="${currentPage}"]`);
    if (currentPageBtn) {
        currentPageBtn.classList.add('active');
    }
    
    // 이전/다음 버튼 상태 업데이트
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (currentPage === 1) {
        prevBtn.classList.add('disabled');
    }
    
    if (currentPage === totalPages || totalPages === 0) {
        nextBtn.classList.add('disabled');
    }
}

// 페이지에 맞는 활동 표시
function displayActivitiesByPage() {
    // 모든 활동 아이템 가져오기
    allActivities = Array.from(document.querySelectorAll('.activity-item'));
    
    // 페이지당 표시할 아이템 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // 모든 활동 숨기고 현재 페이지에 해당하는 활동만 표시
    allActivities.forEach((activity, index) => {
        if (index >= startIndex && index < endIndex) {
            activity.style.display = 'block';
        } else {
            activity.style.display = 'none';
        }
    });
}

// 페이지네이션 상태 업데이트
function updatePagination() {
    // 등록된 활동이 있는지 확인
    allActivities = Array.from(document.querySelectorAll('.activity-item'));
    totalItems = allActivities.length;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // 페이지네이션 컨테이너
    const paginationContainer = document.getElementById('paginationContainer');
    
    // 활동이 있을 때만 페이지네이션 표시
    if (totalItems > 0) {
        // 필요한 페이지 버튼 생성
        const pagination = document.querySelector('.pagination');
        const pageButtons = pagination.querySelectorAll('.page-btn:not(.prev-btn):not(.next-btn)');
        
        // 페이지 버튼 업데이트
        for (let i = 0; i < pageButtons.length; i++) {
            if (i < totalPages) {
                pageButtons[i].style.display = 'block';
                pageButtons[i].textContent = i + 1;
                pageButtons[i].setAttribute('data-page', i + 1);
            } else {
                pageButtons[i].style.display = 'none';
            }
        }
        
        // 페이지네이션 컨테이너 표시
        paginationContainer.style.display = 'block';
        
        // 페이지네이션 버튼 상태 업데이트
        updatePaginationButtons();
        
        // 활동 표시 업데이트
        displayActivitiesByPage();
    } else {
        // 활동이 없으면 페이지네이션 숨김
        paginationContainer.style.display = 'none';
    }
}

// 활동 등록 모달 열기
function openRegistrationForm() {
    // 로그인 확인 (실제 구현에서)
    const isLoggedIn = localStorage.getItem('currentLoggedInUser');
    
    if (!isLoggedIn) {
        alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
        // window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('registrationModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 활동 등록 모달 닫기
function closeRegistrationForm() {
    document.getElementById('registrationModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    document.getElementById('activityRegistrationForm').reset(); // 폼 초기화
}

// 새 활동 추가
function addNewActivity(formData, showAlert = true) {
    // 현재 날짜 설정
    const currentDate = new Date();
    const deadlineDate = formData.deadline ? new Date(formData.deadline) : null;
    
    // D-day 계산
    let deadlineText = "상시모집";
    if (deadlineDate) {
        const diffTime = deadlineDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            deadlineText = `D-${diffDays}`;
        } else if (diffDays === 0) {
            deadlineText = '오늘마감';
        } else {
            deadlineText = '마감됨';
        }
    }
    
    // 활동 ID 생성 (실제 구현에서는 서버에서 생성)
    const activityId = `user-activity-${Date.now()}`;
    
    // HTML 생성
    const activityHTML = `
        <div class="activity-item ${formData.type}" data-category="${formData.type}">
            <div class="activity-header">
                <div class="activity-type">${getActivityTypeName(formData.type)}</div>
                <div class="activity-deadline">${deadlineText}</div>
            </div>
            <div class="activity-content">
                <h3 class="activity-title">${formData.title}</h3>
                <p class="activity-description">${formData.description}</p>
                <div class="activity-details">
                    ${formData.details.map(detail => `<span class="detail-item">${detail}</span>`).join('')}
                </div>
                <div class="activity-tags">
                    ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="activity-actions">
                <button class="btn-detail" onclick="viewActivityDetail('${activityId}')">자세히 보기</button>
                <button class="btn-apply" onclick="applyActivity('${activityId}')">신청하기</button>
            </div>
        </div>
    `;
    
    // 컨테이너에 새 활동 추가
    const activitiesContainer = document.querySelector('.activities-container');
    activitiesContainer.insertAdjacentHTML('afterbegin', activityHTML);
    
    // 활동이 없을 때 표시되는 메시지 숨기기
    const noActivitiesMessage = document.querySelector('.no-activities-message');
    if (noActivitiesMessage) {
        noActivitiesMessage.style.display = 'none';
    }
    
    // 통계 업데이트
    updateStats();
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 활동 등록 성공 메시지 (showAlert이 true일 때만)
    if (showAlert) {
        alert('활동이 성공적으로 등록되었습니다. 관리자 승인 후 게시됩니다.');
    }
}

// 활동 유형 한글명 반환
function getActivityTypeName(type) {
    switch(type) {
        case 'contest':
            return '공모전';
        case 'club':
            return '동아리';
        case 'external':
            return '대외활동';
        case 'volunteer':
            return '봉사활동';
        default:
            return '기타';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 검색 입력 이벤트 리스너
    const searchInput = document.getElementById('activitySearch');
    searchInput.addEventListener('input', searchActivities);
    
    // 활동 등록 폼 제출 이벤트 리스너
    const registrationForm = document.getElementById('activityRegistrationForm');
    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // 폼 데이터 수집
        const formData = {
            type: document.getElementById('activityType').value,
            title: document.getElementById('activityTitle').value,
            description: document.getElementById('activityDescription').value,
            deadline: document.getElementById('activityDeadline').value,
            details: [
                document.querySelector('[name="detailItem1"]').value,
                document.querySelector('[name="detailItem2"]').value,
                document.querySelector('[name="detailItem3"]').value
            ].filter(item => item), // 빈 항목 제거
            tags: document.getElementById('activityTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // 새 활동 추가
        addNewActivity(formData);
        
        // 폼 닫기 및 초기화
        closeRegistrationForm();
    });
    
    // 초기 통계 업데이트
    updateStats();
    
    // 초기 페이지네이션 업데이트
    updatePagination();
    
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
        
        // ESC 키로 모달 닫기
        const modal = document.getElementById('registrationModal');
        if (modal.style.display === 'block') {
            closeRegistrationForm();
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
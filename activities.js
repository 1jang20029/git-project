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
    // 활동 템플릿 배열 생성
    const activityTemplates = [
        {
            type: 'contest',
            title: '대학생 UX/UI 디자인 공모전',
            description: '창의적인 사용자 경험 디자인으로 미래를 디자인하세요',
            deadline: '2025-07-15',
            details: [
                '💰 대상 500만원',
                '🏆 수상작 실제 서비스 적용',
                '📅 2025년 7월 15일까지'
            ],
            tags: ['UX', 'UI', '디자인']
        },
        {
            type: 'external',
            title: 'LG전자 대학생 인턴십 프로그램',
            description: '글로벌 기업에서의 실무 경험을 쌓을 수 있는 기회',
            deadline: '2025-06-30',
            details: [
                '💼 3개월 유급 인턴십',
                '🌐 글로벌 프로젝트 참여',
                '🎓 졸업예정자 우대'
            ],
            tags: ['인턴십', '글로벌', '취업']
        },
        {
            type: 'club',
            title: '프로그래밍 동아리 코드마스터',
            description: '함께 성장하는 개발자 커뮤니티, 초보자도 환영합니다',
            deadline: '',
            details: [
                '💻 주 1회 스터디',
                '🏆 해커톤 및 대회 참가',
                '👥 멘토링 시스템'
            ],
            tags: ['프로그래밍', '개발', '스터디']
        },
        {
            type: 'volunteer',
            title: '어르신 디지털 교육 봉사단',
            description: '디지털 시대에 소외된 어르신들에게 스마트폰 사용법을 가르쳐드립니다',
            deadline: '',
            details: [
                '👵 주 1회 2시간',
                '📱 스마트폰 기초 교육',
                '🏫 지역 복지관 연계'
            ],
            tags: ['디지털교육', '어르신', '봉사']
        }
    ];
    
    // 활동이 없을 때 표시되는 메시지 숨기기
    const noActivitiesMessage = document.querySelector('.no-activities-message');
    if (noActivitiesMessage) {
        noActivitiesMessage.style.display = 'none';
    }
    
    // 각 템플릿을 활동으로 추가
    activityTemplates.forEach(template => {
        // 활동 데이터 준비
        const formData = {
            type: template.type,
            title: template.title,
            description: template.description,
            deadline: template.deadline,
            details: template.details,
            tags: template.tags
        };
        
        // 새 활동 추가
        addNewActivity(formData, false); // false: 알림 표시 안 함
    });
    
    // 더보기 버튼 감추기
    document.querySelector('.load-more-btn').style.display = 'none';
    
    // 통계 업데이트
    updateStats();
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
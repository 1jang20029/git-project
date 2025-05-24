// 권한 시스템
const USER_ROLES = {
    STUDENT: 'student',
    PROFESSOR: 'professor',
    STAFF: 'staff',
    ADMIN: 'admin'
};

// 전역 변수
let allNotices = [];
let filteredNotices = [];
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 10;
let currentSort = 'latest';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('공지사항 페이지 초기화 시작');
    
    // 권한별 UI 업데이트
    updateUIByRole();
    
    // 공지사항 데이터 로드
    loadNotices();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    console.log('공지사항 페이지 초기화 완료');
});

// 사용자 권한 확인 함수
function getCurrentUserRole() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) return USER_ROLES.STUDENT;
    
    // 사용자 정보에서 권한 가져오기
    const userRole = localStorage.getItem(`user_${currentUser}_role`);
    if (userRole) return userRole;
    
    // 학번 패턴으로 권한 추정
    if (currentUser.startsWith('P')) return USER_ROLES.PROFESSOR;
    if (currentUser.startsWith('S')) return USER_ROLES.STAFF;
    if (currentUser.startsWith('naver_') || currentUser.startsWith('kakao_') || currentUser.startsWith('google_')) {
        // 소셜 로그인 사용자는 별도 권한 설정 확인
        const socialRole = localStorage.getItem(`user_${currentUser}_role`);
        return socialRole || USER_ROLES.STUDENT;
    }
    
    return USER_ROLES.STUDENT;
}

// 사용자 권한 설정 함수 (관리자용)
function setUserRole(userId, role, department = null) {
    localStorage.setItem(`user_${userId}_role`, role);
    if (department) {
        localStorage.setItem(`user_${userId}_department`, department);
    }
    console.log(`사용자 권한 설정: ${userId} -> ${role}`);
}

// 권한별 UI 표시
function updateUIByRole() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const userRole = getCurrentUserRole();
    const adminControls = document.getElementById('adminControls');
    const userRoleElement = document.getElementById('userRole');
    const userDepartmentElement = document.getElementById('userDepartment');
    const permissionNotice = document.getElementById('permissionNotice');

    console.log('현재 사용자 권한:', userRole);

    // 로그인하지 않은 경우
    if (!currentUser) {
        adminControls.classList.remove('visible');
        permissionNotice.classList.add('visible');
        permissionNotice.textContent = '로그인 후 이용 가능한 기능입니다.';
        return;
    }

    // 권한별 UI 표시
    if (userRole === USER_ROLES.PROFESSOR || userRole === USER_ROLES.STAFF || userRole === USER_ROLES.ADMIN) {
        adminControls.classList.add('visible');
        permissionNotice.classList.remove('visible');
        
        // 사용자 정보 표시
        const userName = localStorage.getItem(`user_${currentUser}_name`) || '사용자';
        const userDepartment = localStorage.getItem(`user_${currentUser}_department`) || '';
        
        // 권한 표시
        userRoleElement.className = `user-role ${userRole}`;
        switch(userRole) {
            case USER_ROLES.PROFESSOR:
                userRoleElement.textContent = '👨‍🏫 교수';
                break;
            case USER_ROLES.STAFF:
                userRoleElement.textContent = '👩‍💼 교직원';
                break;
            case USER_ROLES.ADMIN:
                userRoleElement.textContent = '⚙️ 관리자';
                break;
        }
        
        // 소속 정보 표시
        if (userDepartment) {
            const departmentNames = {
                'computerScience': '컴퓨터정보학과',
                'business': '경영학과',
                'nursing': '간호학과',
                'engineering': '공학계열',
                'arts': '예술계열',
                'education': '교무처',
                'student_affairs': '학생처',
                'career_center': '취업지원센터',
                'student_council': '학생회'
            };
            userDepartmentElement.textContent = departmentNames[userDepartment] || userDepartment;
        } else {
            userDepartmentElement.textContent = userName;
        }
    } else {
        adminControls.classList.remove('visible');
        // 학생인 경우 권한 안내는 숨김 (혼란 방지)
        permissionNotice.classList.remove('visible');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색 입력 이벤트
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// 페이지 이동 함수들
function goToWritePage() {
    const userRole = getCurrentUserRole();
    if (userRole === USER_ROLES.STUDENT) {
        alert('교수 및 교직원만 공지사항을 작성할 수 있습니다.');
        return;
    }
    
    // 작성 페이지로 이동 (2단계에서 구현 예정)
    alert('공지사항 작성 페이지로 이동합니다.\n\n(2단계에서 구현 예정)');
    // window.location.href = 'admin-notices.html?action=write';
}

function goToManagePage() {
    const userRole = getCurrentUserRole();
    if (userRole === USER_ROLES.STUDENT) {
        alert('교수 및 교직원만 공지사항을 관리할 수 있습니다.');
        return;
    }
    
    // 관리 페이지로 이동 (2단계에서 구현 예정)
    alert('공지사항 관리 페이지로 이동합니다.\n\n(2단계에서 구현 예정)');
    // window.location.href = 'admin-notices.html?action=manage';
}

function goBack() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// 공지사항 데이터 로드
function loadNotices() {
    console.log('공지사항 데이터 로드 시작');
    
    // 로컬 스토리지에서 저장된 공지사항 가져오기
    const storedNotices = localStorage.getItem('notices');
    if (storedNotices) {
        try {
            allNotices = JSON.parse(storedNotices);
            console.log('저장된 공지사항 로드:', allNotices.length, '건');
        } catch (e) {
            console.error('공지사항 데이터 파싱 오류:', e);
            allNotices = generateSampleNotices();
        }
    } else {
        // 샘플 데이터 생성
        allNotices = generateSampleNotices();
        // 로컬 스토리지에 저장
        localStorage.setItem('notices', JSON.stringify(allNotices));
        console.log('샘플 공지사항 생성 및 저장:', allNotices.length, '건');
    }
    
    filteredNotices = [...allNotices];
    displayNotices();
    updateNoticeCount();
}

// 샘플 공지사항 데이터 생성
function generateSampleNotices() {
    const sampleNotices = [
        {
            id: 'notice_001',
            title: '2025학년도 1학기 중간고사 일정 안내',
            summary: '4월 22일(월)부터 4월 26일(금)까지 중간고사가 진행됩니다. 자세한 시간표는 학과 사무실에서 확인하세요.',
            content: '2025학년도 1학기 중간고사 일정을 안내드립니다.\n\n중간고사 기간: 2025년 4월 22일(월) ~ 4월 26일(금)\n\n각 과목별 시험 시간은 학과 사무실에서 확인하시기 바랍니다.\n추가 문의사항은 교무처로 연락주세요.',
            category: 'academic',
            date: '2025-04-08',
            author: '교무처',
            authorId: 'staff_edu',
            authorRole: 'staff',
            authorDepartment: 'education',
            views: 1250,
            important: true,
            createdAt: new Date('2025-04-08T09:00:00').toISOString(),
            updatedAt: new Date('2025-04-08T09:00:00').toISOString()
        },
        {
            id: 'notice_002',
            title: '국가장학금 2차 신청 마감 안내',
            summary: '국가장학금 2차 신청이 이번 주 금요일(4/11)에 마감됩니다. 아직 신청하지 않은 학생들은 서둘러 신청해주세요.',
            content: '국가장학금 2차 신청 마감을 안내드립니다.\n\n신청 마감일: 2025년 4월 11일(금) 18:00\n신청 방법: 한국장학재단 홈페이지\n\n자세한 내용은 학생처로 문의하시기 바랍니다.',
            category: 'scholarship',
            date: '2025-04-07',
            author: '학생처',
            authorId: 'staff_student',
            authorRole: 'staff',
            authorDepartment: 'student_affairs',
            views: 890,
            important: false,
            createdAt: new Date('2025-04-07T14:30:00').toISOString(),
            updatedAt: new Date('2025-04-07T14:30:00').toISOString()
        },
        {
            id: 'notice_003',
            title: '삼성전자 대규모 채용설명회 개최 안내',
            summary: '4월 15일(화) 오후 2시 대강당에서 삼성전자 채용설명회가 진행됩니다. 참석을 원하는 학생은 사전 신청 바랍니다.',
            content: '삼성전자 채용설명회 개최를 안내드립니다.\n\n일시: 2025년 4월 15일(화) 14:00\n장소: 대강당\n대상: 졸업예정자 및 졸업생\n\n사전 신청은 취업지원센터 홈페이지에서 가능합니다.',
            category: 'job',
            date: '2025-04-06',
            author: '취업지원센터',
            authorId: 'staff_career',
            authorRole: 'staff',
            authorDepartment: 'career_center',
            views: 2100,
            important: true,
            createdAt: new Date('2025-04-06T11:15:00').toISOString(),
            updatedAt: new Date('2025-04-06T11:15:00').toISOString()
        },
        {
            id: 'notice_004',
            title: '컴퓨터정보학과 코딩 대회 참가 안내',
            summary: '우리 학과에서 주최하는 코딩 대회에 많은 참여 바랍니다. 상금 총 100만원!',
            content: '컴퓨터정보학과 코딩 대회를 개최합니다.\n\n대회일: 2025년 4월 20일(일)\n장소: 공학1관 컴퓨터실습실\n상금: 1등 50만원, 2등 30만원, 3등 20만원\n\n신청은 학과 사무실에서 받습니다.',
            category: 'department',
            date: '2025-04-05',
            author: '김교수',
            authorId: 'prof_kim',
            authorRole: 'professor',
            authorDepartment: 'computerScience',
            views: 540,
            important: false,
            createdAt: new Date('2025-04-05T16:45:00').toISOString(),
            updatedAt: new Date('2025-04-05T16:45:00').toISOString()
        },
        {
            id: 'notice_005',
            title: '대학 축제 준비위원 모집',
            summary: '5월에 열릴 대학 축제의 준비위원을 모집합니다. 다양한 경험을 쌓을 수 있는 기회!',
            content: '대학 축제 준비위원을 모집합니다.\n\n축제 기간: 2025년 5월 15일~17일\n모집 인원: 20명\n지원 혜택: 봉사활동 시간 인정, 축제 기념품 제공\n\n지원은 학생회실에서 받습니다.',
            category: 'event',
            date: '2025-04-04',
            author: '학생회',
            authorId: 'staff_council',
            authorRole: 'staff',
            authorDepartment: 'student_council',
            views: 320,
            important: false,
            createdAt: new Date('2025-04-04T12:00:00').toISOString(),
            updatedAt: new Date('2025-04-04T12:00:00').toISOString()
        },
        {
            id: 'notice_006',
            title: '도서관 시설 개선 공사로 인한 임시 휴관 안내',
            summary: '4월 12일부터 4월 14일까지 도서관 시설 개선 공사로 인해 임시 휴관합니다.',
            content: '도서관 시설 개선 공사 안내\n\n휴관 기간: 2025년 4월 12일(토) ~ 4월 14일(월)\n공사 내용: 냉난방 시설 교체 및 내부 리모델링\n\n휴관 기간 중에는 전자도서관을 이용해주세요.',
            category: 'academic',
            date: '2025-04-03',
            author: '도서관',
            authorId: 'staff_library',
            authorRole: 'staff',
            authorDepartment: 'library',
            views: 180,
            important: false,
            createdAt: new Date('2025-04-03T10:30:00').toISOString(),
            updatedAt: new Date('2025-04-03T10:30:00').toISOString()
        }
    ];
    
    return sampleNotices;
}

// 카테고리별 필터링
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // 활성 탭 변경
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // 필터링 수행
    applyFilters();
}

// 검색 수행
function performSearch() {
    currentPage = 1;
    applyFilters();
}

// 필터 적용
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // 카테고리 필터 적용
    if (currentCategory === 'all') {
        filteredNotices = [...allNotices];
    } else {
        filteredNotices = allNotices.filter(notice => notice.category === currentCategory);
    }
    
    // 검색 필터 적용
    if (searchTerm) {
        filteredNotices = filteredNotices.filter(notice => 
            notice.title.toLowerCase().includes(searchTerm) ||
            notice.summary.toLowerCase().includes(searchTerm) ||
            notice.content.toLowerCase().includes(searchTerm) ||
            notice.author.toLowerCase().includes(searchTerm)
        );
    }
    
    // 정렬 적용
    sortNotices();
}

// 정렬
function sortNotices() {
    const sortSelect = document.getElementById('sortSelect');
    currentSort = sortSelect.value;
    
    switch(currentSort) {
        case 'latest':
            filteredNotices.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredNotices.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'views':
            filteredNotices.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
    }
    
    displayNotices();
    updateNoticeCount();
}

// 공지사항 표시
function displayNotices() {
    const noticesList = document.getElementById('noticesList');
    
    if (filteredNotices.length === 0) {
        showNoResults();
        return;
    }
    
    // 페이지네이션 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageNotices = filteredNotices.slice(startIndex, endIndex);
    
    // HTML 생성
    const noticesHTML = pageNotices.map(notice => createNoticeHTML(notice)).join('');
    noticesList.innerHTML = noticesHTML;
    
    // 페이지네이션 업데이트
    updatePagination();
}

// 공지사항 HTML 생성
function createNoticeHTML(notice) {
    const categoryNames = {
        'academic': '학사',
        'scholarship': '장학',
        'job': '취업',
        'event': '행사',
        'department': '학과'
    };
    
    const categoryName = categoryNames[notice.category] || notice.category;
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const canEdit = currentUser && (currentUser === notice.authorId || getCurrentUserRole() === USER_ROLES.ADMIN);
    
    // 작성자 권한 표시
    let authorRoleText = '';
    if (notice.authorRole === 'professor') {
        authorRoleText = '<span class="author-role professor">교수</span>';
    } else if (notice.authorRole === 'staff') {
        authorRoleText = '<span class="author-role staff">교직원</span>';
    }
    
    return `
        <div class="notice-item" onclick="viewNoticeDetail('${notice.id}')">
            ${canEdit ? `
                <div class="edit-controls">
                    <button class="edit-btn edit" onclick="editNotice('${notice.id}', event)">수정</button>
                    <button class="edit-btn delete" onclick="deleteNotice('${notice.id}', event)">삭제</button>
                </div>
            ` : ''}
            
            <div class="notice-header">
                <span class="notice-badge ${notice.category}">
                    ${getCategoryIcon(notice.category)} ${categoryName}
                </span>
                <span class="notice-date">${formatDate(notice.date)}</span>
            </div>
            <div class="notice-title">
                ${notice.title}
                ${notice.important ? '<span class="important-badge">중요</span>' : ''}
            </div>
            <div class="notice-summary">${notice.summary}</div>
            <div class="notice-meta">
                <div class="notice-author">
                    <span>👤</span>
                    <span>${notice.author || '관리자'}</span>
                    ${authorRoleText}
                </div>
                <div class="notice-stats">
                    <div class="stat-item">
                        <span>👁</span>
                        <span>${(notice.views || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 카테고리 아이콘 반환
function getCategoryIcon(category) {
    const icons = {
        'academic': '📚',
        'scholarship': '💰',
        'job': '💼',
        'event': '🎉',
        'department': '🏢'
    };
    return icons[category] || '📄';
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 공지사항 개수 업데이트
function updateNoticeCount() {
    const countElement = document.getElementById('noticesCount');
    countElement.textContent = `전체 ${filteredNotices.length.toLocaleString()}건`;
}

// 결과 없음 표시
function showNoResults() {
    const noticesList = document.getElementById('noticesList');
    noticesList.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어를 입력하거나 카테고리를 변경해보세요.</p>
        </div>
    `;
    
    // 페이지네이션 숨기기
    document.getElementById('pagination').innerHTML = '';
}

// 페이지네이션 업데이트
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 이전 버튼
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            ←
        </button>
    `;
    
    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // 다음 버튼
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            →
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredNotices.length / itemsPerPage)) {
        return;
    }
    
    currentPage = page;
    displayNotices();
    
    // 페이지 상단으로 스크롤
    document.querySelector('.notices-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// 공지사항 상세보기
function viewNoticeDetail(noticeId) {
    // 조회수 증가
    increaseViewCount(noticeId);
    
    // 상세 페이지로 이동 (구현 예정)
    alert(`공지사항 상세보기: ${noticeId}\n\n(상세 페이지는 3단계에서 구현 예정)`);
    // window.location.href = `notice-detail.html?id=${noticeId}`;
}

// 공지사항 수정
function editNotice(noticeId, event) {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    
    const userRole = getCurrentUserRole();
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const notice = allNotices.find(n => n.id === noticeId);
    
    if (!notice) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    // 권한 확인
    if (userRole === USER_ROLES.STUDENT) {
        alert('수정 권한이 없습니다.');
        return;
    }
    
    // 작성자 본인이거나 관리자인지 확인
    if (currentUser !== notice.authorId && userRole !== USER_ROLES.ADMIN) {
        alert('본인이 작성한 공지사항만 수정할 수 있습니다.');
        return;
    }
    
    // 수정 페이지로 이동 (2단계에서 구현 예정)
    alert(`공지사항 수정: ${notice.title}\n\n(수정 기능은 2단계에서 구현 예정)`);
    // window.location.href = `admin-notices.html?action=edit&id=${noticeId}`;
}

// 공지사항 삭제
function deleteNotice(noticeId, event) {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    
    const userRole = getCurrentUserRole();
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const notice = allNotices.find(n => n.id === noticeId);
    
    if (!notice) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    // 권한 확인
    if (userRole === USER_ROLES.STUDENT) {
        alert('삭제 권한이 없습니다.');
        return;
    }
    
    // 작성자 본인이거나 관리자인지 확인
    if (currentUser !== notice.authorId && userRole !== USER_ROLES.ADMIN) {
        alert('본인이 작성한 공지사항만 삭제할 수 있습니다.');
        return;
    }
    
    // 삭제 확인
    if (confirm(`정말로 이 공지사항을 삭제하시겠습니까?\n\n제목: ${notice.title}`)) {
        // 데이터에서 삭제
        allNotices = allNotices.filter(n => n.id !== noticeId);
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('notices', JSON.stringify(allNotices));
        
        // 화면 새로고침
        applyFilters();
        
        alert('공지사항이 삭제되었습니다.');
        console.log('공지사항 삭제:', noticeId);
    }
}

// 조회수 증가
function increaseViewCount(noticeId) {
    const noticeIndex = allNotices.findIndex(notice => notice.id === noticeId);
    if (noticeIndex !== -1) {
        allNotices[noticeIndex].views = (allNotices[noticeIndex].views || 0) + 1;
        // 로컬 스토리지 업데이트
        localStorage.setItem('notices', JSON.stringify(allNotices));
        console.log('조회수 증가:', noticeId, allNotices[noticeIndex].views);
    }
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 관리자용 테스트 함수들 (개발용)
function testSetUserRole() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('먼저 로그인해주세요.');
        return;
    }
    
    const role = prompt('설정할 권한을 입력하세요:\n- student (학생)\n- professor (교수)\n- staff (교직원)\n- admin (관리자)', 'student');
    
    if (role && ['student', 'professor', 'staff', 'admin'].includes(role)) {
        const department = prompt('소속 학과/부서를 입력하세요 (선택사항):\n- computerScience (컴퓨터정보학과)\n- business (경영학과)\n- education (교무처)\n- student_affairs (학생처)', '');
        
        setUserRole(currentUser, role, department);
        alert(`권한이 ${role}로 설정되었습니다.`);
        
        // UI 업데이트
        updateUIByRole();
    } else {
        alert('올바른 권한을 입력해주세요.');
    }
}

// 샘플 공지사항 추가 함수 (개발용)
function addSampleNotice() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const userRole = getCurrentUserRole();
    
    if (!currentUser || userRole === USER_ROLES.STUDENT) {
        alert('교수 또는 교직원 권한이 필요합니다.');
        return;
    }
    
    const userName = localStorage.getItem(`user_${currentUser}_name`) || '사용자';
    const userDepartment = localStorage.getItem(`user_${currentUser}_department`) || 'general';
    
    const newNotice = {
        id: `notice_${Date.now()}`,
        title: `테스트 공지사항 - ${new Date().toLocaleString()}`,
        summary: `${userName}님이 작성한 테스트 공지사항입니다. 현재 시간: ${new Date().toLocaleString()}`,
        content: `이것은 테스트용 공지사항입니다.\n\n작성자: ${userName}\n작성 시간: ${new Date().toLocaleString()}\n권한: ${userRole}`,
        category: 'academic',
        date: new Date().toISOString().split('T')[0],
        author: userName,
        authorId: currentUser,
        authorRole: userRole,
        authorDepartment: userDepartment,
        views: 0,
        important: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // 배열 맨 앞에 추가 (최신순으로 표시)
    allNotices.unshift(newNotice);
    
    // 로컬 스토리지 업데이트
    localStorage.setItem('notices', JSON.stringify(allNotices));
    
    // 화면 새로고침
    applyFilters();
    
    alert('테스트 공지사항이 추가되었습니다.');
    console.log('새 공지사항 추가:', newNotice);
}

// 공지사항 데이터 초기화 함수 (개발용)
function resetNoticesData() {
    if (confirm('모든 공지사항 데이터를 초기화하시겠습니까?\n(샘플 데이터로 복원됩니다)')) {
        localStorage.removeItem('notices');
        loadNotices();
        alert('공지사항 데이터가 초기화되었습니다.');
    }
}

// 공지사항 데이터 내보내기 (개발용)
function exportNoticesData() {
    const data = JSON.stringify(allNotices, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `notices_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('공지사항 데이터 내보내기 완료');
}

// 공지사항 통계 조회 (개발용)
function getNoticesStats() {
    const stats = {
        total: allNotices.length,
        byCategory: {},
        byAuthorRole: {},
        totalViews: 0,
        importantCount: 0
    };
    
    allNotices.forEach(notice => {
        // 카테고리별 통계
        stats.byCategory[notice.category] = (stats.byCategory[notice.category] || 0) + 1;
        
        // 작성자 권한별 통계
        stats.byAuthorRole[notice.authorRole] = (stats.byAuthorRole[notice.authorRole] || 0) + 1;
        
        // 총 조회수
        stats.totalViews += notice.views || 0;
        
        // 중요 공지 개수
        if (notice.important) {
            stats.importantCount++;
        }
    });
    
    console.log('공지사항 통계:', stats);
    return stats;
}

// 검색 기능 개선
function performAdvancedSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        applyFilters();
        return;
    }
    
    // 고급 검색 로직
    filteredNotices = allNotices.filter(notice => {
        // 제목에서 검색 (가중치 높음)
        const titleMatch = notice.title.toLowerCase().includes(searchTerm);
        
        // 내용에서 검색
        const contentMatch = notice.content.toLowerCase().includes(searchTerm);
        
        // 요약에서 검색
        const summaryMatch = notice.summary.toLowerCase().includes(searchTerm);
        
        // 작성자에서 검색
        const authorMatch = notice.author.toLowerCase().includes(searchTerm);
        
        // 카테고리에서 검색
        const categoryNames = {
            'academic': '학사',
            'scholarship': '장학',
            'job': '취업',
            'event': '행사',
            'department': '학과'
        };
        const categoryMatch = categoryNames[notice.category]?.includes(searchTerm);
        
        return titleMatch || contentMatch || summaryMatch || authorMatch || categoryMatch;
    });
    
    // 검색어가 제목에 포함된 것을 우선 정렬
    filteredNotices.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTerm);
        const bTitle = b.title.toLowerCase().includes(searchTerm);
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        
        // 날짜순 정렬
        return new Date(b.date) - new Date(a.date);
    });
    
    currentPage = 1;
    displayNotices();
    updateNoticeCount();
    
    console.log(`검색 결과: "${searchTerm}" - ${filteredNotices.length}건`);
}

// 공지사항 즐겨찾기 기능
function toggleNoticeBookmark(noticeId) {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }
    
    const bookmarksKey = `user_${currentUser}_bookmarks`;
    const bookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]');
    
    const index = bookmarks.indexOf(noticeId);
    if (index > -1) {
        // 즐겨찾기 해제
        bookmarks.splice(index, 1);
        console.log('즐겨찾기 해제:', noticeId);
    } else {
        // 즐겨찾기 추가
        bookmarks.push(noticeId);
        console.log('즐겨찾기 추가:', noticeId);
    }
    
    localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
    return bookmarks.includes(noticeId);
}

// 즐겨찾기한 공지사항 조회
function getBookmarkedNotices() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) return [];
    
    const bookmarksKey = `user_${currentUser}_bookmarks`;
    const bookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]');
    
    return allNotices.filter(notice => bookmarks.includes(notice.id));
}

// 키보드 단축키 처리
document.addEventListener('keydown', function(event) {
    // Ctrl+F 또는 Cmd+F로 검색창 포커스
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // ESC로 검색 초기화
    if (event.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value) {
            searchInput.value = '';
            applyFilters();
        }
    }
    
    // 숫자 키로 카테고리 빠른 선택
    if (event.key >= '1' && event.key <= '6' && !event.ctrlKey && !event.metaKey) {
        const categoryButtons = document.querySelectorAll('.category-tab');
        const index = parseInt(event.key) - 1;
        if (categoryButtons[index]) {
            categoryButtons[index].click();
        }
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    // 현재 상태 저장 (필요시)
    console.log('공지사항 페이지 종료');
});

// 개발자 도구용 전역 함수 등록
if (typeof window !== 'undefined') {
    window.noticesAdmin = {
        setUserRole: testSetUserRole,
        addSample: addSampleNotice,
        resetData: resetNoticesData,
        exportData: exportNoticesData,
        getStats: getNoticesStats,
        getCurrentRole: getCurrentUserRole,
        getAllNotices: () => allNotices,
        getFilteredNotices: () => filteredNotices
    };
    
    console.log('🔧 공지사항 관리자 도구가 window.noticesAdmin에 등록되었습니다.');
    console.log('사용 가능한 함수들:', Object.keys(window.noticesAdmin));
    console.log('예시: window.noticesAdmin.setUserRole() - 사용자 권한 설정');
}

// 초기화 완료 로그
console.log('✅ 공지사항 시스템 초기화 완료');
console.log('- 현재 사용자 권한:', getCurrentUserRole());
console.log('- 총 공지사항 수:', allNotices.length);

// 권한별 기능 테스트용 함수
function testPermissions() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const userRole = getCurrentUserRole();
    
    console.log('=== 권한 테스트 ===');
    console.log('현재 사용자:', currentUser);
    console.log('현재 권한:', userRole);
    console.log('작성 권한:', userRole !== USER_ROLES.STUDENT);
    console.log('관리자 권한:', userRole === USER_ROLES.ADMIN);
    
    if (userRole === USER_ROLES.STUDENT) {
        console.log('학생 권한: 읽기 전용');
    } else {
        console.log('교수/교직원 권한: 작성 및 자신의 글 수정/삭제 가능');
    }
}

// 실시간 업데이트 확인 (다른 탭에서 변경사항 반영)
window.addEventListener('storage', function(event) {
    if (event.key === 'notices') {
        console.log('다른 탭에서 공지사항 데이터가 변경되었습니다.');
        loadNotices();
    }
    
    if (event.key && event.key.includes('_role')) {
        console.log('사용자 권한이 변경되었습니다.');
        updateUIByRole();
    }
});

// 사용자 피드백 기능
function submitFeedback(noticeId, feedback) {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }
    
    const feedbackKey = `feedback_${noticeId}`;
    const existingFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
    
    const newFeedback = {
        userId: currentUser,
        userName: localStorage.getItem(`user_${currentUser}_name`) || '사용자',
        feedback: feedback,
        timestamp: new Date().toISOString()
    };
    
    existingFeedback.push(newFeedback);
    localStorage.setItem(feedbackKey, JSON.stringify(existingFeedback));
    
    console.log('피드백 제출:', noticeId, feedback);
    return true;
}
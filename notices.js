// 전역 변수
let allNotices = [];
let filteredNotices = [];
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 10;
let currentSort = 'latest';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadNotices();
    setupEventListeners();
});

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

// 뒤로가기 함수
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// 공지사항 데이터 로드
function loadNotices() {
    // 실제 구현에서는 서버에서 데이터를 가져오거나 
    // 로컬 스토리지에서 동적으로 생성된 데이터를 사용
    
    // 임시로 빈 배열로 시작 (실제로는 동적 데이터 로드)
    allNotices = getNoticesFromStorage();
    filteredNotices = [...allNotices];
    
    // 초기 표시
    displayNotices();
    updateNoticeCount();
}

// 로컬 스토리지에서 공지사항 데이터 가져오기 (동적 생성)
function getNoticesFromStorage() {
    // 실제 구현에서는 관리자가 추가한 공지사항을 로컬 스토리지나 서버에서 가져옴
    const stored = localStorage.getItem('notices');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // 기본 공지사항이 없으면 빈 배열 반환
    return [];
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
            notice.content.toLowerCase().includes(searchTerm)
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
    
    return `
        <div class="notice-item" onclick="viewNoticeDetail('${notice.id}')">
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
    
    // 상세 페이지로 이동
    window.location.href = `notice-detail.html?id=${noticeId}`;
}

// 조회수 증가
function increaseViewCount(noticeId) {
    const noticeIndex = allNotices.findIndex(notice => notice.id === noticeId);
    if (noticeIndex !== -1) {
        allNotices[noticeIndex].views = (allNotices[noticeIndex].views || 0) + 1;
        // 로컬 스토리지 업데이트
        localStorage.setItem('notices', JSON.stringify(allNotices));
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
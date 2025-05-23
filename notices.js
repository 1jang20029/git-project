// 공지사항 관리 시스템
class NoticeManager {
    constructor() {
        this.notices = [];
        this.filteredNotices = [];
        this.currentCategory = 'all';
        this.currentSort = 'latest';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.isEditMode = false;
        this.currentNoticeId = null;
        
        this.init();
    }
    
    init() {
        this.loadNotices();
        this.checkAdminPermissions();
        this.displayNotices();
        this.displayUrgentNotices();
        this.setupEventListeners();
    }
    
    // 로컬 스토리지에서 공지사항 로드
    loadNotices() {
        const storedNotices = localStorage.getItem('notices');
        if (storedNotices) {
            this.notices = JSON.parse(storedNotices);
        } else {
            // 기본 샘플 데이터 생성
            this.createSampleNotices();
        }
        this.filteredNotices = [...this.notices];
    }
    
    // 샘플 공지사항 데이터 생성
    createSampleNotices() {
        const sampleNotices = [
            {
                id: this.generateId(),
                title: '2025학년도 1학기 중간고사 일정 안내',
                content: `2025학년도 1학기 중간고사가 다음과 같이 진행됩니다.

■ 중간고사 기간: 2025년 4월 22일(월) ~ 4월 26일(금)
■ 시험 시간: 각 과목별 정규 수업 시간
■ 시험 장소: 각 과목별 정규 강의실

▶ 주의사항
- 학생증을 반드시 지참하시기 바랍니다.
- 시험 시작 10분 후 입실이 불가능합니다.
- 휴대폰 등 전자기기는 전원을 꺼서 가방에 보관해주세요.

기타 문의사항은 학과 사무실로 연락 바랍니다.`,
                category: 'academic',
                author: '학사지원팀',
                date: new Date('2025-04-08').toISOString(),
                views: 245,
                isImportant: true,
                isUrgent: false,
                isPinned: true,
                attachments: [],
                summary: '4월 22일(월)부터 4월 26일(금)까지 중간고사가 진행됩니다. 자세한 시간표는 학과 사무실에서 확인하세요.'
            },
            {
                id: this.generateId(),
                title: '국가장학금 2차 신청 마감 안내',
                content: `국가장학금 2차 신청이 이번 주 금요일에 마감됩니다.

■ 신청 마감: 2025년 4월 11일(금) 18:00까지
■ 신청 사이트: 한국장학재단 홈페이지 (www.kosaf.go.kr)

▶ 필요 서류
- 가족관계증명서
- 소득금액증명원
- 재학증명서

아직 신청하지 않은 학생들은 서둘러 신청해주시기 바랍니다.`,
                category: 'scholarship',
                author: '학생지원팀',
                date: new Date('2025-04-07').toISOString(),
                views: 189,
                isImportant: true,
                isUrgent: true,
                isPinned: false,
                attachments: [],
                summary: '국가장학금 2차 신청이 이번 주 금요일(4/11)에 마감됩니다. 아직 신청하지 않은 학생들은 서둘러 신청해주세요.'
            },
            {
                id: this.generateId(),
                title: '삼성전자 대규모 채용설명회 개최 안내',
                content: `삼성전자에서 연성대학교 학생들을 대상으로 대규모 채용설명회를 개최합니다.

■ 일시: 2025년 4월 15일(화) 오후 2시
■ 장소: 대강당
■ 대상: 졸업예정자 및 취업희망자

▶ 프로그램
- 회사 소개 및 채용 정보
- 선배와의 만남 시간
- 1:1 상담 기회

참석을 원하는 학생은 취업지원팀으로 사전 신청 바랍니다.`,
                category: 'job',
                author: '취업지원팀',
                date: new Date('2025-04-06').toISOString(),
                views: 156,
                isImportant: false,
                isUrgent: false,
                isPinned: false,
                attachments: [],
                summary: '4월 15일(화) 오후 2시 대강당에서 삼성전자 채용설명회가 진행됩니다. 참석을 원하는 학생은 사전 신청 바랍니다.'
            },
            {
                id: this.generateId(),
                title: '도서관 시설 이용 변경 안내',
                content: `도서관 시설 보수 공사로 인한 이용 변경 사항을 안내드립니다.

■ 공사 기간: 2025년 4월 10일(목) ~ 4월 20일(일)
■ 변경 사항:
- 3층 열람실 임시 폐쇄
- 2층 자료실 일부 이용 제한

▶ 대체 시설
- 1층 카페 공간 24시간 개방
- 각 학과 세미나실 개방

이용에 불편을 드려 죄송합니다.`,
                category: 'library',
                author: '도서관팀',
                date: new Date('2025-04-05').toISOString(),
                views: 89,
                isImportant: false,
                isUrgent: false,
                isPinned: false,
                attachments: [],
                summary: '도서관 시설 보수 공사로 인해 4월 10일부터 20일까지 일부 시설 이용이 제한됩니다.'
            },
            {
                id: this.generateId(),
                title: '2025 연성대 축제 기획단 모집',
                content: `2025년도 연성대학교 축제 기획단을 모집합니다.

■ 모집 기간: 2025년 4월 1일 ~ 4월 15일
■ 모집 인원: 각 분야별 5~10명
■ 활동 기간: 2025년 5월 ~ 10월

▶ 모집 분야
- 기획팀: 전체 축제 기획 및 진행
- 홍보팀: SNS 및 포스터 제작
- 공연팀: 공연 기획 및 섭외
- 운영팀: 당일 축제 운영

관심 있는 학생은 학생회로 연락 바랍니다.`,
                category: 'event',
                author: '학생회',
                date: new Date('2025-04-01').toISOString(),
                views: 278,
                isImportant: false,
                isUrgent: false,
                isPinned: false,
                attachments: [],
                summary: '2025년도 연성대학교 축제 기획단을 모집합니다. 다양한 분야별로 5~10명씩 모집하며, 관심 있는 학생은 학생회로 연락 바랍니다.'
            },
            {
                id: this.generateId(),
                title: '기숙사 입사 신청 안내',
                content: `2025학년도 2학기 기숙사 입사 신청을 받습니다.

■ 신청 기간: 2025년 4월 15일 ~ 5월 15일
■ 신청 방법: 기숙사 홈페이지 온라인 신청
■ 입사 기간: 2025년 8월 20일 ~ 12월 20일

▶ 선발 기준
- 거리 우선 선발
- 성적 우수자 우대
- 저소득층 우선 고려

자세한 내용은 기숙사 홈페이지를 참조하시기 바랍니다.`,
                category: 'dormitory',
                author: '기숙사팀',
                date: new Date('2025-03-30').toISOString(),
                views: 198,
                isImportant: false,
                isUrgent: false,
                isPinned: false,
                attachments: [],
                summary: '2025학년도 2학기 기숙사 입사 신청을 4월 15일부터 5월 15일까지 받습니다. 기숙사 홈페이지에서 온라인 신청 가능합니다.'
            },
            {
                id: this.generateId(),
                title: '컴퓨터소프트웨어과 특강 안내',
                content: `컴퓨터소프트웨어과에서 특별 강연을 개최합니다.

■ 주제: "AI 시대의 개발자 역량"
■ 강사: 네이버 AI Lab 김OO 연구원
■ 일시: 2025년 4월 12일(토) 오후 2시
■ 장소: 공학1관 201호

▶ 참석 대상
- 컴퓨터소프트웨어과 재학생
- AI/개발 분야 관심 학생

질의응답 시간도 마련되어 있으니 많은 참석 바랍니다.`,
                category: 'department',
                author: '컴퓨터소프트웨어과',
                date: new Date('2025-03-28').toISOString(),
                views: 134,
                isImportant: false,
                isUrgent: false,
                isPinned: false,
                attachments: [],
                summary: '컴퓨터소프트웨어과에서 "AI 시대의 개발자 역량" 주제로 특별 강연을 4월 12일(토) 오후 2시에 개최합니다.'
            },
            {
                id: this.generateId(),
                title: '휴강 안내 - 시설 점검으로 인한 단수',
                content: `시설 점검으로 인한 단수로 인해 내일 전체 휴강을 안내드립니다.

■ 휴강 일시: 2025년 4월 9일(수) 전일
■ 사유: 캠퍼스 전체 급수 시설 점검
■ 복구 예정: 4월 10일(목) 오전 8시

▶ 주의사항
- 모든 강의 및 실습 휴강
- 도서관 및 학생식당 이용 불가
- 긴급상황 시 행정실로 연락

학생들의 양해 부탁드립니다.`,
                category: 'academic',
                author: '시설관리팀',
                date: new Date('2025-04-08').toISOString(),
                views: 456,
                isImportant: true,
                isUrgent: true,
                isPinned: true,
                attachments: [],
                summary: '내일(4/9) 대학 전체 휴강 안내 - 시설 점검으로 인한 단수'
            }
        ];
        
        this.notices = sampleNotices;
        this.saveNotices();
    }
    
    // ID 생성 함수
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 로컬 스토리지에 공지사항 저장
    saveNotices() {
        localStorage.setItem('notices', JSON.stringify(this.notices));
    }
    
    // 관리자 권한 확인
    checkAdminPermissions() {
        const currentUser = localStorage.getItem('currentLoggedInUser');
        const adminControls = document.getElementById('adminControls');
        
        // 관리자 계정 확인 (임시로 특정 사용자 ID 또는 이메일로 체크)
        const adminUsers = ['admin', 'administrator', '20250001'];
        
        if (currentUser && adminUsers.includes(currentUser)) {
            adminControls.style.display = 'block';
        }
    }
    
    // 긴급 공지사항 표시
    displayUrgentNotices() {
        const urgentContainer = document.getElementById('urgentNotices');
        const urgentNotices = this.notices.filter(notice => notice.isUrgent);
        
        if (urgentNotices.length === 0) {
            urgentContainer.style.display = 'none';
            return;
        }
        
        urgentContainer.style.display = 'block';
        urgentContainer.innerHTML = urgentNotices.map(notice => `
            <div class="urgent-notice-item" onclick="openNoticeDetail('${notice.id}')">
                <span class="urgent-icon">📢</span>
                <span class="urgent-text">${notice.title}</span>
            </div>
        `).join('');
    }
    
    // 공지사항 목록 표시
    displayNotices() {
        const noticesContainer = document.getElementById('noticesList');
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('noResults');
        
        // 로딩 표시
        loading.style.display = 'block';
        noticesContainer.innerHTML = '';
        noResults.style.display = 'none';
        
        setTimeout(() => {
            loading.style.display = 'none';
            
            if (this.filteredNotices.length === 0) {
                noResults.style.display = 'block';
                return;
            }
            
            // 페이지네이션 적용
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const pageNotices = this.filteredNotices.slice(startIndex, endIndex);
            
            noticesContainer.innerHTML = pageNotices.map(notice => this.createNoticeHTML(notice)).join('');
            this.updatePagination();
        }, 500);
    }
    
    // 공지사항 HTML 생성
    createNoticeHTML(notice) {
        const date = new Date(notice.date);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        
        // 새 글 여부 (3일 이내)
        const isNew = (Date.now() - date.getTime()) < (3 * 24 * 60 * 60 * 1000);
        
        // 배지 생성
        let badges = '';
        if (notice.isUrgent) badges += '<span class="badge urgent">긴급</span>';
        if (notice.isImportant) badges += '<span class="badge important">중요</span>';
        if (notice.isPinned) badges += '<span class="badge pinned">고정</span>';
        if (isNew) badges += '<span class="badge new">새글</span>';
        
        // 카테고리 이름 변환
        const categoryNames = {
            'academic': '학사',
            'scholarship': '장학',
            'job': '취업',
            'event': '행사',
            'department': '학과',
            'dormitory': '기숙사',
            'library': '도서관',
            'general': '일반'
        };
        
        return `
            <div class="notice-item ${notice.isPinned ? 'pinned' : ''} ${notice.isImportant ? 'important' : ''}" 
                 onclick="openNoticeDetail('${notice.id}')">
                <div class="notice-header">
                    <div class="notice-meta">
                        <span class="notice-category ${notice.category}">${categoryNames[notice.category] || notice.category}</span>
                    </div>
                    <span class="notice-date">${formattedDate}</span>
                </div>
                
                ${badges ? `<div class="notice-badges">${badges}</div>` : ''}
                
                <div class="notice-title ${isNew ? 'unread' : ''}">${notice.title}</div>
                
                ${notice.summary ? `<div class="notice-summary">${notice.summary}</div>` : ''}
                
                <div class="notice-info">
                    <span class="notice-author">${notice.author}</span>
                    <div class="notice-stats">
                        <div class="stat-item">
                            <span>👁️</span>
                            <span>${notice.views || 0}</span>
                        </div>
                        ${notice.attachments && notice.attachments.length > 0 ? 
                            `<div class="stat-item">
                                <span>📎</span>
                                <span>${notice.attachments.length}</span>
                            </div>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    // 페이지네이션 업데이트
    updatePagination() {
        const paginationContainer = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredNotices.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 이전 버튼
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="noticeManager.changePage(${this.currentPage - 1})">이전</button>
        `;
        
        // 페이지 번호들
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="noticeManager.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="noticeManager.changePage(${i})">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="noticeManager.changePage(${totalPages})">${totalPages}</button>`;
        }
        
        // 다음 버튼
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="noticeManager.changePage(${this.currentPage + 1})">다음</button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }
    
    // 페이지 변경
    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredNotices.length / this.itemsPerPage)) {
            return;
        }
        this.currentPage = page;
        this.displayNotices();
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 카테고리 필터링
    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1; // 첫 페이지로 리셋
        this.applyFilters();
        
        // 카테고리 탭 활성화 상태 변경
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    // 정렬
    sortNotices() {
        const sortSelect = document.getElementById('sortSelect');
        this.currentSort = sortSelect.value;
        this.applyFilters();
    }
    
    // 검색
    searchNotices() {
        const searchInput = document.getElementById('searchInput');
        this.searchQuery = searchInput.value.toLowerCase().trim();
        this.currentPage = 1; // 첫 페이지로 리셋
        this.applyFilters();
    }
    
    // 필터 및 정렬 적용
    applyFilters() {
        let filtered = [...this.notices];
        
        // 카테고리 필터링
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(notice => notice.category === this.currentCategory);
        }
        
        // 검색 필터링
        if (this.searchQuery) {
            filtered = filtered.filter(notice => 
                notice.title.toLowerCase().includes(this.searchQuery) ||
                notice.content.toLowerCase().includes(this.searchQuery) ||
                notice.author.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // 정렬
        switch (this.currentSort) {
            case 'latest':
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'views':
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'important':
                filtered.sort((a, b) => {
                    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
                    if (a.isImportant !== b.isImportant) return b.isImportant - a.isImportant;
                    if (a.isUrgent !== b.isUrgent) return b.isUrgent - a.isUrgent;
                    return new Date(b.date) - new Date(a.date);
                });
                break;
        }
        
        this.filteredNotices = filtered;
        this.displayNotices();
    }
    
    // 공지사항 작성/수정 모달 열기
    showNoticeForm(noticeId = null) {
        const modal = document.getElementById('noticeModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('noticeForm');
        
        this.isEditMode = !!noticeId;
        this.currentNoticeId = noticeId;
        
        if (this.isEditMode) {
            modalTitle.textContent = '공지사항 수정';
            const notice = this.notices.find(n => n.id === noticeId);
            if (notice) {
                this.fillForm(notice);
            }
        } else {
            modalTitle.textContent = '공지사항 작성';
            form.reset();
            document.getElementById('noticeId').value = '';
        }
        
        modal.style.display = 'flex';
    }
    
    // 폼에 데이터 채우기 (수정 모드)
    fillForm(notice) {
        document.getElementById('noticeId').value = notice.id;
        document.getElementById('noticeTitle').value = notice.title;
        document.getElementById('noticeCategory').value = notice.category;
        document.getElementById('noticeAuthor').value = notice.author;
        document.getElementById('noticeContent').value = notice.content;
        document.getElementById('isImportant').checked = notice.isImportant;
        document.getElementById('isUrgent').checked = notice.isUrgent;
        document.getElementById('isPinned').checked = notice.isPinned;
    }
    
    // 공지사항 저장
    saveNotice() {
        const form = document.getElementById('noticeForm');
        const formData = new FormData(form);
        
        const noticeData = {
            id: this.isEditMode ? this.currentNoticeId : this.generateId(),
            title: document.getElementById('noticeTitle').value.trim(),
            content: document.getElementById('noticeContent').value.trim(),
            category: document.getElementById('noticeCategory').value,
            author: document.getElementById('noticeAuthor').value.trim(),
            isImportant: document.getElementById('isImportant').checked,
            isUrgent: document.getElementById('isUrgent').checked,
            isPinned: document.getElementById('isPinned').checked,
            date: this.isEditMode ? 
                this.notices.find(n => n.id === this.currentNoticeId).date : 
                new Date().toISOString(),
            views: this.isEditMode ? 
                this.notices.find(n => n.id === this.currentNoticeId).views : 
                0,
            attachments: [] // 파일 업로드 기능은 실제 서버 구현 시 추가
        };
        
        // 유효성 검사
        if (!noticeData.title || !noticeData.content || !noticeData.category || !noticeData.author) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }
        
        // 요약 자동 생성 (첫 100자)
        noticeData.summary = noticeData.content.substring(0, 100).replace(/\n/g, ' ') + 
            (noticeData.content.length > 100 ? '...' : '');
        
        if (this.isEditMode) {
            // 수정
            const index = this.notices.findIndex(n => n.id === this.currentNoticeId);
            this.notices[index] = noticeData;
        } else {
            // 새로 추가
            this.notices.unshift(noticeData);
        }
        
        this.saveNotices();
        this.closeNoticeModal();
        this.applyFilters();
        this.displayUrgentNotices();
        
        alert(this.isEditMode ? '공지사항이 수정되었습니다.' : '공지사항이 작성되었습니다.');
    }
    
    // 모달 닫기
    closeNoticeModal() {
        const modal = document.getElementById('noticeModal');
        modal.style.display = 'none';
        this.isEditMode = false;
        this.currentNoticeId = null;
    }
    
    // 공지사항 삭제
    deleteNotice(noticeId) {
        if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            this.notices = this.notices.filter(notice => notice.id !== noticeId);
            this.saveNotices();
            this.applyFilters();
            this.displayUrgentNotices();
            alert('공지사항이 삭제되었습니다.');
        }
    }
    
    // 조회수 증가
    incrementViews(noticeId) {
        const notice = this.notices.find(n => n.id === noticeId);
        if (notice) {
            notice.views = (notice.views || 0) + 1;
            this.saveNotices();
        }
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('noticeModal');
            if (event.target === modal) {
                this.closeNoticeModal();
            }
        });
        
        // 엔터키로 검색
        document.getElementById('searchInput').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.searchNotices();
            }
        });
    }
}

// 글로벌 함수들
let noticeManager;

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    noticeManager = new NoticeManager();
});

// 뒤로가기
function goBack() {
    window.location.href = 'index.html';
}

// 검색 토글
function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    
    if (searchContainer.style.display === 'none' || !searchContainer.style.display) {
        searchContainer.style.display = 'flex';
        searchInput.focus();
    } else {
        searchContainer.style.display = 'none';
        searchInput.value = '';
        noticeManager.searchQuery = '';
        noticeManager.applyFilters();
    }
}

// 검색 초기화
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    noticeManager.searchQuery = '';
    noticeManager.applyFilters();
}

// 검색 키 입력 처리
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        noticeManager.searchNotices();
    }
}

// 카테고리 필터링
function filterNotices(category) {
    noticeManager.filterByCategory(category);
}

// 공지사항 상세보기 (새 페이지나 모달로 구현 가능)
function openNoticeDetail(noticeId) {
    // 조회수 증가
    noticeManager.incrementViews(noticeId);
    
    // 실제 구현에서는 상세 페이지로 이동하거나 모달을 열 수 있습니다
    const notice = noticeManager.notices.find(n => n.id === noticeId);
    if (notice) {
        // 여기서는 alert로 간단히 표시 (실제로는 상세 페이지나 모달 구현)
        const content = notice.content.length > 200 ? 
            notice.content.substring(0, 200) + '...' : 
            notice.content;
            
        alert(`제목: ${notice.title}\n\n내용:\n${content}\n\n작성자: ${notice.author}\n조회수: ${notice.views || 0}`);
        
        // 실제 구현 시에는 아래와 같이 상세 페이지로 이동
        // window.location.href = `notice-detail.html?id=${noticeId}`;
    }
}

// 공지사항 작성 모달 열기
function showNoticeForm() {
    noticeManager.showNoticeForm();
}

// 공지사항 수정 모달 열기
function editNotice(noticeId) {
    noticeManager.showNoticeForm(noticeId);
}

// 공지사항 삭제
function deleteNotice(noticeId) {
    noticeManager.deleteNotice(noticeId);
}

// 모달 닫기
function closeNoticeModal() {
    noticeManager.closeNoticeModal();
}

// 공지사항 저장
function saveNotice() {
    noticeManager.saveNotice();
}

// 파일 업로드 처리 (실제 서버 구현 시 사용)
function handleFileUpload(files) {
    // 파일 유효성 검사
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/haansoft-hwp',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    
    for (let file of files) {
        if (file.size > maxFileSize) {
            alert(`${file.name} 파일 크기가 10MB를 초과합니다.`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert(`${file.name} 파일 형식이 지원되지 않습니다.`);
            return false;
        }
    }
    
    return true;
}

// 공지사항 데이터 내보내기 (관리자용)
function exportNotices() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const adminUsers = ['admin', 'administrator', '20250001'];
    
    if (!currentUser || !adminUsers.includes(currentUser)) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    
    const data = JSON.stringify(noticeManager.notices, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notices_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 공지사항 데이터 가져오기 (관리자용)
function importNotices(event) {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const adminUsers = ['admin', 'administrator', '20250001'];
    
    if (!currentUser || !adminUsers.includes(currentUser)) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedNotices = JSON.parse(e.target.result);
            if (Array.isArray(importedNotices)) {
                if (confirm('기존 공지사항을 모두 대체하시겠습니까?')) {
                    noticeManager.notices = importedNotices;
                    noticeManager.saveNotices();
                    noticeManager.applyFilters();
                    noticeManager.displayUrgentNotices();
                    alert('공지사항을 성공적으로 가져왔습니다.');
                }
            } else {
                alert('올바른 공지사항 데이터 형식이 아닙니다.');
            }
        } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    reader.readAsText(file);
}

// 공지사항 통계 정보 표시 (관리자용)
function showNoticeStatistics() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const adminUsers = ['admin', 'administrator', '20250001'];
    
    if (!currentUser || !adminUsers.includes(currentUser)) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    
    const notices = noticeManager.notices;
    const stats = {
        total: notices.length,
        urgent: notices.filter(n => n.isUrgent).length,
        important: notices.filter(n => n.isImportant).length,
        pinned: notices.filter(n => n.isPinned).length,
        categories: {}
    };
    
    // 카테고리별 통계
    notices.forEach(notice => {
        stats.categories[notice.category] = (stats.categories[notice.category] || 0) + 1;
    });
    
    // 총 조회수
    const totalViews = notices.reduce((sum, notice) => sum + (notice.views || 0), 0);
    
    const statsText = `
공지사항 통계

총 공지사항: ${stats.total}개
긴급 공지: ${stats.urgent}개
중요 공지: ${stats.important}개
고정 공지: ${stats.pinned}개
총 조회수: ${totalViews}회

카테고리별 분포:
${Object.entries(stats.categories).map(([cat, count]) => `- ${cat}: ${count}개`).join('\n')}
    `;
    
    alert(statsText);
}

// 키보드 단축키 지원
document.addEventListener('keydown', function(event) {
    // Ctrl+F로 검색 활성화
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        toggleSearch();
    }
    
    // ESC로 모달 닫기
    if (event.key === 'Escape') {
        const modal = document.getElementById('noticeModal');
        if (modal.style.display === 'flex') {
            closeNoticeModal();
        }
    }
});

// 페이지 언로드 시 자동 저장
window.addEventListener('beforeunload', function() {
    if (noticeManager) {
        noticeManager.saveNotices();
    }
});
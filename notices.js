// 공지사항 데이터 (실제로는 API에서 가져올 데이터)
const noticesData = [
    {
        id: 1,
        category: '학사',
        title: '2025학년도 1학기 중간고사 일정 안내',
        summary: '4월 22일(월)부터 4월 26일(금)까지 중간고사가 진행됩니다. 자세한 시간표는 학과 사무실에서 확인하세요.',
        content: '2025학년도 1학기 중간고사가 4월 22일(월)부터 4월 26일(금)까지 진행됩니다. 각 과목별 시험 시간표는 학과 사무실에서 확인하실 수 있으며, 학교 홈페이지에도 게시될 예정입니다. 시험 준비에 만전을 기하시기 바랍니다.',
        date: '2025.04.08',
        author: '교무처',
        views: 1245,
        important: true,
        isNew: true
    },
    {
        id: 2,
        category: '장학',
        title: '국가장학금 2차 신청 마감 안내',
        summary: '국가장학금 2차 신청이 이번 주 금요일(4/11)에 마감됩니다. 아직 신청하지 않은 학생들은 서둘러 신청해주세요.',
        content: '2025년 1학기 국가장학금 2차 신청이 4월 11일(금) 18시에 마감됩니다. 아직 신청하지 않은 재학생들은 한국장학재단 홈페이지에서 서둘러 신청하시기 바랍니다. 신청 관련 문의사항은 학생지원처로 연락해주세요.',
        date: '2025.04.07',
        author: '학생지원처',
        views: 982,
        important: true,
        isNew: false
    },
    {
        id: 3,
        category: '취업',
        title: '삼성전자 대규모 채용설명회 개최 안내',
        summary: '4월 15일(화) 오후 2시 대강당에서 삼성전자 채용설명회가 진행됩니다. 참석을 원하는 학생은 사전 신청 바랍니다.',
        content: '4월 15일(화) 오후 2시부터 본교 대강당에서 삼성전자 채용설명회가 개최됩니다. 신입사원 채용 관련 정보와 직무 소개, 입사 전형 안내 등이 진행될 예정입니다. 참석을 원하는 학생들은 취업지원센터 홈페이지에서 사전 신청해주세요.',
        date: '2025.04.06',
        author: '취업지원센터',
        views: 1687,
        important: false,
        isNew: true
    },
    {
        id: 4,
        category: '행사',
        title: '2025 춘계 대학축제 개최 안내',
        summary: '5월 15일부터 5월 17일까지 3일간 춘계 대학축제가 개최됩니다. 다양한 공연과 부스 운영이 예정되어 있습니다.',
        content: '2025년 춘계 대학축제 "Youth Festival"이 5월 15일(목)부터 5월 17일(토)까지 3일간 개최됩니다. 각종 공연, 동아리 부스, 먹거리 장터 등 다양한 프로그램이 준비되어 있습니다. 많은 참여와 관심 부탁드립니다.',
        date: '2025.04.05',
        author: '학생회',
        views: 2156,
        important: false,
        isNew: false
    },
    {
        id: 5,
        category: '학과',
        title: '컴퓨터공학과 졸업프로젝트 발표회',
        summary: '4월 20일(목) 오후 1시부터 컴퓨터공학과 4학년 졸업프로젝트 발표회가 진행될 예정입니다.',
        content: '컴퓨터공학과 4학년 학생들의 졸업프로젝트 발표회가 4월 20일(목) 오후 1시부터 진행됩니다. 장소는 공학관 대강의실이며, 재학생들의 많은 관심과 참여를 부탁드립니다.',
        date: '2025.04.04',
        author: '컴퓨터공학과',
        views: 634,
        important: false,
        isNew: false
    },
    {
        id: 6,
        category: '학사',
        title: '2025학년도 1학기 수강신청 변경 안내',
        summary: '3월 4일부터 3월 8일까지 수강신청 변경 기간입니다. 수강신청 변경을 원하는 학생들은 해당 기간에 신청하세요.',
        content: '2025학년도 1학기 수강신청 변경 기간이 3월 4일(월)부터 3월 8일(금)까지입니다. 변경을 원하는 학생들은 학사정보시스템을 통해 신청하시기 바랍니다.',
        date: '2025.03.01',
        author: '교무처',
        views: 1534,
        important: false,
        isNew: false
    },
    {
        id: 7,
        category: '장학',
        title: '성적우수장학금 신청 안내',
        summary: '2024학년도 성적우수장학금 신청을 받습니다. 직전 학기 성적 3.5 이상인 학생들은 신청 가능합니다.',
        content: '2024학년도 성적우수장학금 신청을 받습니다. 신청 자격은 직전 학기 평점평균 3.5 이상이며, 신청 기간은 4월 1일부터 4월 30일까지입니다.',
        date: '2025.03.28',
        author: '학생지원처',
        views: 2341,
        important: true,
        isNew: false
    },
    {
        id: 8,
        category: '취업',
        title: '2025 상반기 취업박람회 개최',
        summary: '4월 25일 체육관에서 대규모 취업박람회가 개최됩니다. 50여 개 기업이 참가할 예정입니다.',
        content: '2025년 상반기 취업박람회가 4월 25일(목) 오전 10시부터 오후 5시까지 본교 체육관에서 개최됩니다. 50여 개 기업이 참가하여 채용상담과 면접을 진행할 예정입니다.',
        date: '2025.03.25',
        author: '취업지원센터',
        views: 1876,
        important: false,
        isNew: false
    },
    {
        id: 9,
        category: '행사',
        title: '신입생 OT 프로그램 안내',
        summary: '3월 2일 신입생 오리엔테이션이 진행됩니다. 모든 신입생은 필수 참석해주세요.',
        content: '2025학년도 신입생 오리엔테이션이 3월 2일(토) 오전 9시부터 진행됩니다. 대학생활 안내, 학과 소개, 선배와의 만남 등 다양한 프로그램이 준비되어 있습니다.',
        date: '2025.02.28',
        author: '학생처',
        views: 3124,
        important: true,
        isNew: false
    },
    {
        id: 10,
        category: '학과',
        title: '경영학과 산업체 견학 안내',
        summary: '4월 30일 경영학과 3학년 학생들을 대상으로 한 산업체 견학이 진행됩니다.',
        content: '경영학과 3학년 학생들을 대상으로 4월 30일(화) 산업체 견학이 진행됩니다. 견학 장소는 롯데그룹 본사이며, 참가 신청은 학과 사무실에서 받습니다.',
        date: '2025.03.20',
        author: '경영학과',
        views: 445,
        important: false,
        isNew: false
    },
    {
        id: 11,
        category: '학사',
        title: '2025학년도 1학기 기말고사 일정 안내',
        summary: '6월 16일부터 6월 20일까지 기말고사가 진행됩니다. 시험 준비에 만전을 기하시기 바랍니다.',
        content: '2025학년도 1학기 기말고사가 6월 16일(월)부터 6월 20일(금)까지 진행됩니다. 상세 시간표는 5월 말에 공지될 예정입니다.',
        date: '2025.03.15',
        author: '교무처',
        views: 2987,
        important: false,
        isNew: false
    },
    {
        id: 12,
        category: '장학',
        title: '교내 근로장학생 모집 안내',
        summary: '2025학년도 1학기 교내 근로장학생을 모집합니다. 신청은 학생지원처에서 받습니다.',
        content: '교내 도서관, 행정실, 실험실 등에서 근무할 근로장학생을 모집합니다. 시급 9,860원이며, 주당 최대 20시간까지 근무 가능합니다.',
        date: '2025.03.10',
        author: '학생지원처',
        views: 1754,
        important: false,
        isNew: false
    },
    {
        id: 13,
        category: '취업',
        title: 'LG전자 채용설명회 및 현장면접',
        summary: '3월 30일 LG전자 채용설명회와 현장면접이 진행됩니다. 사전 신청 필수입니다.',
        content: '3월 30일(토) 오후 1시부터 LG전자 채용설명회가 진행되며, 이어서 현장면접이 실시됩니다. 전자공학, 컴퓨터공학 전공자 우대입니다.',
        date: '2025.03.05',
        author: '취업지원센터',
        views: 2145,
        important: false,
        isNew: false
    },
    {
        id: 14,
        category: '행사',
        title: '제49회 양지체육대회 개최',
        summary: '5월 8일부터 5월 9일까지 양지체육대회가 개최됩니다. 많은 참여 바랍니다.',
        content: '연성대학교 전통의 양지체육대회가 5월 8일(목)부터 5월 9일(금)까지 2일간 개최됩니다. 축구, 농구, 배구 등 다양한 종목에 참가할 수 있습니다.',
        date: '2025.02.25',
        author: '학생회',
        views: 1876,
        important: false,
        isNew: false
    },
    {
        id: 15,
        category: '학과',
        title: '호텔관광과 현장실습 설명회',
        summary: '3월 25일 호텔관광과 3학년 대상 현장실습 설명회가 진행됩니다.',
        content: '호텔관광과 3학년 학생들을 대상으로 여름방학 현장실습에 대한 설명회가 진행됩니다. 실습 업체 소개 및 신청 방법을 안내합니다.',
        date: '2025.02.20',
        author: '호텔관광과',
        views: 567,
        important: false,
        isNew: false
    },
    {
        id: 16,
        category: '학사',
        title: '2025학년도 졸업논문 제출 안내',
        summary: '4학년 졸업예정자는 5월 31일까지 졸업논문을 제출해야 합니다.',
        content: '2025학년도 졸업예정자들은 5월 31일(토) 17시까지 졸업논문을 학과 사무실에 제출해야 합니다. 늦은 제출 시 졸업이 지연될 수 있습니다.',
        date: '2025.02.15',
        author: '교무처',
        views: 1234,
        important: true,
        isNew: false
    },
    {
        id: 17,
        category: '장학',
        title: '저소득층 생활비 지원 장학금 안내',
        summary: '경제적 어려움을 겪는 학생들을 위한 생활비 지원 장학금을 신청받습니다.',
        content: '기초생활수급자, 차상위계층, 한부모가정 학생들을 대상으로 생활비 지원 장학금을 지급합니다. 월 30만원씩 지원되며, 신청 기간은 3월 1일부터 3월 31일까지입니다.',
        date: '2025.02.10',
        author: '학생지원처',
        views: 2567,
        important: false,
        isNew: false
    },
    {
        id: 18,
        category: '취업',
        title: '공무원 시험 대비 특강 개최',
        summary: '공무원 시험을 준비하는 학생들을 위한 특강이 매주 토요일에 진행됩니다.',
        content: '9급 공무원 시험 대비 국어, 영어, 한국사 특강이 매주 토요일 오전 9시부터 진행됩니다. 수강료는 무료이며, 선착순 50명까지 신청 가능합니다.',
        date: '2025.02.05',
        author: '취업지원센터',
        views: 1789,
        important: false,
        isNew: false
    },
    {
        id: 19,
        category: '행사',
        title: '연성대학교 개교 48주년 기념행사',
        summary: '3월 15일 개교기념일을 맞아 다양한 기념행사가 진행됩니다.',
        content: '연성대학교 개교 48주년을 맞아 3월 15일(금) 기념식 및 각종 문화행사가 진행됩니다. 오전 10시 기념식을 시작으로 오후에는 학생 동아리 공연이 있습니다.',
        date: '2025.01.30',
        author: '기획처',
        views: 2345,
        important: false,
        isNew: false
    },
    {
        id: 20,
        category: '학과',
        title: '간호학과 임상실습 오리엔테이션',
        summary: '간호학과 3학년 학생들의 임상실습 오리엔테이션이 3월 20일에 진행됩니다.',
        content: '간호학과 3학년 학생들을 대상으로 임상실습 전 오리엔테이션이 진행됩니다. 실습 병원별 배정 결과 발표 및 주의사항을 안내합니다.',
        date: '2025.01.25',
        author: '간호학과',
        views: 892,
        important: false,
        isNew: false
    }
];

// 전역 변수
let currentPage = 1;
let itemsPerPage = 5;
let currentCategory = '전체';
let currentSearchTerm = '';
let filteredNotices = [...noticesData];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('공지사항 페이지 초기화 시작');
    
    // 초기 공지사항 표시
    updateFilteredNotices();
    displayNotices();
    
    // 검색창 포커스 이벤트
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchNotices, 300));
    }
    
    // URL 파라미터 확인
    getURLParameters();
    
    console.log('공지사항 페이지 초기화 완료');
});

// 뒤로가기 함수
function goBack() {
    // 이전 페이지가 있으면 뒤로가기, 없으면 메인 페이지로
    if (document.referrer && document.referrer !== window.location.href) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// 카테고리 필터링 함수
function filterNotices(category) {
    console.log('카테고리 필터링:', category);
    
    // 모든 카테고리 태그에서 active 클래스 제거
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // 선택된 카테고리 태그에 active 클래스 추가
    const selectedTag = document.querySelector(`[data-category="${category}"]`);
    if (selectedTag) {
        selectedTag.classList.add('active');
    }
    
    // 현재 카테고리 업데이트
    currentCategory = category;
    currentPage = 1;
    
    // 필터링된 공지사항 업데이트
    updateFilteredNotices();
    
    // 공지사항 표시
    displayNotices();
}

// 검색 함수
function searchNotices() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    console.log('공지사항 검색:', searchTerm);
    
    currentSearchTerm = searchTerm;
    currentPage = 1;
    
    // 필터링된 공지사항 업데이트
    updateFilteredNotices();
    
    // 공지사항 표시
    displayNotices();
}

// 검색창 엔터키 처리
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchNotices();
    }
}

// 필터링된 공지사항 업데이트
function updateFilteredNotices() {
    filteredNotices = noticesData.filter(notice => {
        // 카테고리 필터링
        const categoryMatch = currentCategory === '전체' || notice.category === currentCategory;
        
        // 검색어 필터링
        const searchMatch = !currentSearchTerm || 
            notice.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            notice.summary.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(currentSearchTerm.toLowerCase());
        
        return categoryMatch && searchMatch;
    });
    
    console.log('필터링된 공지사항 수:', filteredNotices.length);
}

// 공지사항 표시 함수
function displayNotices() {
    const importantNoticesList = document.getElementById('important-notices-list');
    const generalNoticesList = document.getElementById('general-notices-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // 로딩 표시
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (noResults) noResults.style.display = 'none';
    
    // 잠시 로딩 효과를 위한 딜레이
    setTimeout(() => {
        // 중요 공지사항과 일반 공지사항 분리
        const importantNotices = filteredNotices.filter(notice => notice.important);
        const generalNotices = filteredNotices.filter(notice => !notice.important);
        
        // 중요 공지사항 표시
        if (importantNoticesList) {
            if (importantNotices.length > 0) {
                importantNoticesList.innerHTML = '';
                importantNotices.forEach(notice => {
                    const noticeElement = createNoticeElement(notice);
                    importantNoticesList.appendChild(noticeElement);
                });
                document.querySelector('.important-notices-section').style.display = 'block';
            } else {
                document.querySelector('.important-notices-section').style.display = 'none';
            }
        }
        
        // 일반 공지사항 표시 (페이지네이션 적용)
        if (generalNoticesList) {
            const startIndex = 0;
            const endIndex = currentPage * itemsPerPage;
            const displayNotices = generalNotices.slice(startIndex, endIndex);
            
            if (currentPage === 1) {
                generalNoticesList.innerHTML = '';
            }
            
            displayNotices.forEach((notice, index) => {
                if (index >= (currentPage - 1) * itemsPerPage) {
                    const noticeElement = createNoticeElement(notice);
                    generalNoticesList.appendChild(noticeElement);
                }
            });
        }
        
        // 더 보기 버튼 상태 업데이트
        if (loadMoreBtn) {
            const hasMore = generalNotices.length > currentPage * itemsPerPage;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
            loadMoreBtn.disabled = !hasMore;
        }
        
        // 검색 결과가 없을 때
        if (filteredNotices.length === 0) {
            if (noResults) noResults.style.display = 'flex';
            document.querySelector('.important-notices-section').style.display = 'none';
            document.querySelector('.general-notices-section').style.display = 'none';
        } else {
            document.querySelector('.general-notices-section').style.display = 'block';
        }
        
        // 로딩 숨기기
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
    }, 500); // 0.5초 로딩 효과
}

// 공지사항 요소 생성 함수
function createNoticeElement(notice) {
    const noticeDiv = document.createElement('div');
    noticeDiv.className = `notice-item ${notice.important ? 'important' : ''} ${notice.isNew ? 'new' : ''}`;
    noticeDiv.onclick = () => goToNoticeDetail(notice.id);
    
    // 검색어 하이라이트 처리
    const highlightedTitle = highlightSearchTerm(notice.title, currentSearchTerm);
    const highlightedSummary = highlightSearchTerm(notice.summary, currentSearchTerm);
    
    noticeDiv.innerHTML = `
        <div class="notice-header">
            <span class="notice-category ${notice.category}">${notice.category}</span>
            <span class="notice-date">${notice.date}</span>
        </div>
        <div class="notice-title">${highlightedTitle}</div>
        <div class="notice-summary">${highlightedSummary}</div>
        <div class="notice-meta">
            <span class="notice-author">${notice.author}</span>
            <div class="notice-stats">
                <span class="notice-stat">
                    <span>👁️</span>
                    <span>${notice.views.toLocaleString()}</span>
                </span>
            </div>
        </div>
    `;
    
    return noticeDiv;
}

// 검색어 하이라이트 함수
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// 더 많은 공지사항 로드
function loadMoreNotices() {
    currentPage++;
    displayNotices();
}

// 공지사항 상세 페이지로 이동
function goToNoticeDetail(noticeId) {
    console.log(`공지사항 ID ${noticeId} 상세 페이지로 이동`);
    
    // 조회수 증가 (실제로는 서버에서 처리)
    const notice = noticesData.find(n => n.id === noticeId);
    if (notice) {
        notice.views++;
    }
    
    // 상세 페이지로 이동 (실제 구현 시에는 notice-detail.html로 이동)
    // window.location.href = `notice-detail.html?id=${noticeId}`;
    
    // 임시로 알림창으로 대체
    alert(`공지사항 "${notice.title}" 상세 페이지로 이동합니다.\n\n${notice.content}`);
}

// 디바운스 함수 (검색 최적화)
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

// 스크롤 이벤트로 무한 스크롤 구현 (선택사항)
function initInfiniteScroll() {
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // 페이지 하단에 도달했을 때
        if (scrollTop + windowHeight >= documentHeight - 100) {
            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn && loadMoreBtn.style.display !== 'none' && !loadMoreBtn.disabled) {
                loadMoreNotices();
            }
        }
    }, 200));
}

// 스로틀 함수
function throttle(func, wait) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

// URL 파라미터에서 카테고리나 검색어 가져오기
function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const noticeId = urlParams.get('id');
    
    console.log('URL 파라미터:', { category, search, noticeId });
    
    // 특정 공지사항 ID가 있으면 해당 공지사항으로 바로 이동
    if (noticeId) {
        // 잠시 후 해당 공지사항 상세로 이동
        setTimeout(() => {
            goToNoticeDetail(parseInt(noticeId));
        }, 100);
        return;
    }
    
    // 카테고리 파라미터가 있으면 해당 카테고리로 필터링
    if (category && category !== '전체') {
        const validCategories = ['학사', '장학', '취업', '행사', '학과'];
        if (validCategories.includes(category)) {
            filterNotices(category);
        }
    }
    
    // 검색어 파라미터가 있으면 검색 실행
    if (search) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = decodeURIComponent(search);
            searchNotices();
        }
    }
}



// 공지사항 상세 모달 표시
function showNoticeDetailModal(notice) {
    // 기존 모달이 있으면 제거
    const existingModal = document.querySelector('.notice-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'notice-detail-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeNoticeDetailModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${notice.title}</h2>
                <button class="close-btn" onclick="closeNoticeDetailModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="notice-info">
                    <span class="notice-category ${notice.category}">${notice.category}</span>
                    <span class="notice-date">${notice.date}</span>
                    <span class="notice-author">작성자: ${notice.author}</span>
                    <span class="notice-views">조회수: ${notice.views.toLocaleString()}</span>
                </div>
                <div class="notice-content">
                    ${notice.content}
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="shareNotice(${notice.id})" class="share-btn">공유</button>
                <button onclick="toggleFavorite(${notice.id})" class="favorite-btn">
                    ${isFavoriteNotice(notice.id) ? '★' : '☆'} 즐겨찾기
                </button>
                <button onclick="closeNoticeDetailModal()" class="close-btn-footer">닫기</button>
            </div>
        </div>
    `;
    
    // 모달 스타일 추가
    if (!document.querySelector('#notice-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notice-modal-styles';
        styles.textContent = `
            .notice-detail-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                max-width: 600px;
                max-height: 80vh;
                width: 90%;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
                background-color: #c62917;
                color: white;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 18px;
                line-height: 1.4;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 20px;
                max-height: 50vh;
                overflow-y: auto;
            }
            
            .notice-info {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .notice-info span {
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 12px;
                background-color: #f5f5f5;
                color: #666;
            }
            
            .notice-info .notice-category {
                background-color: #c62917;
                color: white;
            }
            
            .notice-content {
                line-height: 1.6;
                font-size: 15px;
                color: #333;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 15px 20px;
                border-top: 1px solid #eee;
                background-color: #f9f9f9;
            }
            
            .modal-footer button {
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 14px;
            }
            
            .share-btn {
                background-color: #4285f4 !important;
                color: white !important;
                border-color: #4285f4 !important;
            }
            
            .favorite-btn {
                background-color: #ff9800 !important;
                color: white !important;
                border-color: #ff9800 !important;
            }
            
            .close-btn-footer {
                background-color: #666 !important;
                color: white !important;
                border-color: #666 !important;
            }
            
            @media (max-width: 480px) {
                .modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
                
                .modal-header {
                    padding: 15px;
                }
                
                .modal-header h2 {
                    font-size: 16px;
                }
                
                .modal-body {
                    padding: 15px;
                    max-height: 60vh;
                }
                
                .modal-footer {
                    padding: 10px 15px;
                    flex-direction: column;
                }
                
                .modal-footer button {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // 모달을 DOM에 추가
    document.body.appendChild(modal);
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
}


// 공지사항 상세 페이지로 이동 시 ID 매핑
function goToNoticeDetail(noticeId) {
    console.log(`공지사항 ID ${noticeId} 상세 페이지로 이동`);
    
    // ID가 문자열인 경우 숫자로 변환하여 실제 공지사항 찾기
    let actualNotice = null;
    
    if (typeof noticeId === 'string') {
        // 메인 페이지에서 온 경우 (notice1, notice2, notice3)
        const idMap = {
            'notice1': 1,  // 중간고사 일정 안내
            'notice2': 2,  // 국가장학금 신청 마감
            'notice3': 3   // 삼성전자 채용설명회
        };
        
        const mappedId = idMap[noticeId];
        if (mappedId) {
            actualNotice = noticesData.find(n => n.id === mappedId);
        }
    } else {
        // 숫자 ID인 경우
        actualNotice = noticesData.find(n => n.id === noticeId);
    }
    
    if (actualNotice) {
        // 조회수 증가
        actualNotice.views++;
        
        // 읽음 상태로 표시
        markAsRead(actualNotice.id);
        
        // 상세 페이지로 이동하는 대신 모달이나 알림으로 내용 표시
        showNoticeDetailModal(actualNotice);
    } else {
        alert('해당 공지사항을 찾을 수 없습니다.');
    }
}


// 공지사항 상세 모달 닫기
function closeNoticeDetailModal() {
    const modal = document.querySelector('.notice-detail-modal');
    if (modal) {
        modal.remove();
    }
    
    // 스크롤 복원
    document.body.style.overflow = 'auto';
}


// 공지사항 데이터 새로고침 (실제로는 API 호출)
function refreshNotices() {
    console.log('공지사항 데이터 새로고침');
    
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    
    // 실제로는 API 호출하여 최신 데이터 가져오기
    setTimeout(() => {
        // 현재는 기존 데이터 사용
        currentPage = 1;
        updateFilteredNotices();
        displayNotices();
    }, 1000);
}

function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const noticeId = urlParams.get('id');
    
    console.log('URL 파라미터:', { category, search, noticeId });
    
    // 특정 공지사항 ID가 있으면 해당 공지사항으로 바로 이동
    if (noticeId) {
        // 잠시 후 해당 공지사항 상세로 이동
        setTimeout(() => {
            goToNoticeDetail(parseInt(noticeId));
        }, 100);
        return;
    }
    
    // 카테고리 파라미터가 있으면 해당 카테고리로 필터링
    if (category && category !== '전체') {
        const validCategories = ['학사', '장학', '취업', '행사', '학과'];
        if (validCategories.includes(category)) {
            filterNotices(category);
        }
    }
    
    // 검색어 파라미터가 있으면 검색 실행
    if (search) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = decodeURIComponent(search);
            searchNotices();
        }
    }
}
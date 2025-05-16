// 탭 전환 함수
function switchScholarshipTab(tabName) {
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.scholarship-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택한 탭 콘텐츠 표시
    document.getElementById(`${tabName}-scholarship`).classList.add('active');
    
    // 탭 메뉴 활성화 상태 변경
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 현재 클릭된 탭 활성화
    event.target.classList.add('active');
    
    // 페이지 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 뒤로 가기 함수
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 첫 번째 탭 활성화
    const firstTab = document.querySelector('.tab-item');
    const firstContent = document.querySelector('.scholarship-content');
    
    if (firstTab && firstContent) {
        firstTab.classList.add('active');
        firstContent.classList.add('active');
    }
    
    // 탭 클릭 이벤트 등록
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            const tabTypes = ['internal', 'external', 'schedule'];
            if (tabTypes[index]) {
                switchScholarshipTab(tabTypes[index]);
            }
        });
    });
    
    // 키보드 접근성 향상
    document.addEventListener('keydown', function(event) {
        // 탭 키로 탭 전환
        if (event.key === 'Tab' && event.altKey) {
            event.preventDefault();
            const activeTabs = document.querySelectorAll('.tab-item');
            const currentIndex = Array.from(activeTabs).findIndex(tab => tab.classList.contains('active'));
            const nextIndex = (currentIndex + 1) % activeTabs.length;
            activeTabs[nextIndex].click();
        }
    });
    
    // 스크롤 상태 저장/복원
    if (localStorage.getItem('scholarshipScrollPosition')) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(localStorage.getItem('scholarshipScrollPosition')));
            localStorage.removeItem('scholarshipScrollPosition');
        }, 100);
    }
});

// 페이지 떠나기 전 스크롤 위치 저장
window.addEventListener('beforeunload', function() {
    localStorage.setItem('scholarshipScrollPosition', window.scrollY);
});

// 장학금 카드 애니메이션 (인터섹션 옵저버 사용)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scholarshipObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 장학금 카드에 애니메이션 적용
function initializeAnimations() {
    const cards = document.querySelectorAll('.scholarship-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        scholarshipObserver.observe(card);
    });
}

// DOM 로드 후 애니메이션 초기화
setTimeout(initializeAnimations, 100);

// 테이블 스크롤 가이드 표시
function showScrollGuide() {
    const tableContainer = document.querySelector('.schedule-table-container');
    if (tableContainer && tableContainer.scrollWidth > tableContainer.clientWidth) {
        const guide = document.createElement('div');
        guide.className = 'scroll-guide';
        guide.innerHTML = '← 좌우로 스크롤하여 더 많은 정보를 확인하세요 →';
        guide.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(198, 41, 23, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            pointer-events: none;
            z-index: 10;
            animation: fadeOut 3s ease-in-out;
        `;
        
        tableContainer.style.position = 'relative';
        tableContainer.appendChild(guide);
        
        // 3초 후 가이드 제거
        setTimeout(() => {
            if (guide.parentNode) {
                guide.parentNode.removeChild(guide);
            }
        }, 3000);
    }
}

// 테이블이 있는 탭이 활성화될 때 스크롤 가이드 표시
const scheduleTab = document.querySelector('.tab-item:nth-child(3)');
if (scheduleTab) {
    scheduleTab.addEventListener('click', function() {
        setTimeout(showScrollGuide, 300);
    });
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    .scroll-guide {
        animation: fadeOut 3s ease-in-out;
    }
`;
document.head.appendChild(style);

// 검색 기능 (선택사항)
function addSearchFunctionality() {
    const searchBox = document.createElement('div');
    searchBox.innerHTML = `
        <div style="padding: 16px; background-color: #f8f9fa; border-bottom: 1px solid #eee;">
            <input type="text" id="scholarshipSearch" placeholder="장학금명으로 검색..." 
                   style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
        </div>
    `;
    
    const firstSection = document.querySelector('.section');
    if (firstSection) {
        firstSection.parentNode.insertBefore(searchBox, firstSection);
    }
    
    // 검색 기능 구현
    const searchInput = document.getElementById('scholarshipSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.scholarship-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// 프린트 기능
function enablePrintFeature() {
    const printButton = document.createElement('button');
    printButton.innerHTML = '📄 인쇄';
    printButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #c62917;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    
    printButton.addEventListener('click', function() {
        window.print();
    });
    
    document.body.appendChild(printButton);
}

// 선택적 기능 활성화 (필요시 주석 해제)
// addSearchFunctionality();
// enablePrintFeature();

// 에러 처리
window.addEventListener('error', function(event) {
    console.error('장학금 페이지 에러:', event.error);
});

// 성능 최적화: 이미지 지연 로딩 (필요시)
function enableLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

console.log('장학금 정보 페이지가 로드되었습니다.');
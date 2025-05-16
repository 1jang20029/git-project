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
    
    // 현재 클릭된 탭 활성화 - event.target 대신 직접 찾기
    const tabIndex = {
        'recommendation': 0,
        'internal': 1,
        'external': 2,
        'schedule': 3
    };
    
    const tabs = document.querySelectorAll('.tab-item');
    if (tabs[tabIndex[tabName]]) {
        tabs[tabIndex[tabName]].classList.add('active');
    }
    
    // 페이지 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// 장학금 데이터베이스
const scholarshipDatabase = {
    // 신입생 장학금
    'new_student': {
        name: '신입생 장학금',
        type: 'internal',
        conditions: {
            studentType: ['new'],
            entranceGrade: ['top1', 'top5', 'top10', 'top20']
        },
        amounts: {
            'top1': '수업료 160만원',
            'top5': '수업료 70만원', 
            'top10': '수업료 50만원',
            'top20': '수업료 30만원'
        },
        description: '수시전형에서 최우수 학과 자로 전형별/학과별 입학성적 우수자 선발'
    },
    
    // 성적장학금
    'academic': {
        name: '성적장학금',
        type: 'internal',
        conditions: {
            studentType: ['current'],
            minGpa: 3.0,
            minCredits: 12
        },
        amounts: {
            'top': '수업료 100%',
            'first': '수업료 60%',
            'second': '수업료 35%',
            'third': '수업료 25%'
        },
        description: '직전학기 성적 우수자 대상 (평점 3.0 이상, 12학점 이상 이수)'
    },
    
    // 보훈장학금
    'veteran': {
        name: '보훈장학금',
        type: 'internal',
        conditions: {
            veteran: true
        },
        amounts: {
            'default': '수업료 100%'
        },
        description: '국가보훈대상자 본인 또는 자녀'
    },
    
    // 장애학생장학금
    'disabled': {
        name: '위탁학비장학금',
        type: 'internal',
        conditions: {
            disabled: true,
            minGpa: 2.0
        },
        amounts: {
            'default': '수업료 20%'
        },
        description: '장애학생 본인 또는 자녀'
    },
    
    // 북한이탈주민장학금
    'north_korea': {
        name: '전문기술인시간관련장학금',
        type: 'internal',
        conditions: {
            northKorea: true,
            minGpa: 2.0
        },
        amounts: {
            'default': '수업료 30%'
        },
        description: '북한이탈주민 본인 또는 자녀'
    },
    
    // 연성인장학금
    'yeonsung_family': {
        name: '연성인장학금',
        type: 'internal',
        conditions: {
            familyInSchool: true,
            minGpa: 2.0
        },
        amounts: {
            'default': '60만원'
        },
        description: '가족 중 2인 이상 재학 중이거나 연성대 출신 재학생'
    },
    
    // 교직원장학금
    'employee_family': {
        name: '교직원장학금',
        type: 'internal',
        conditions: {
            employeeFamily: true
        },
        amounts: {
            'default': '수업료 100% 이내'
        },
        description: '교직원 직계가족'
    },
    
    // 시니어장학금
    'senior': {
        name: '시니어관련장학금',
        type: 'internal',
        conditions: {
            minAge: 45,
            minGpa: 2.0
        },
        amounts: {
            'default': '수업료 30%'
        },
        description: '만 45세 이상 재학생'
    },
    
    // 편입생장학금
    'transfer': {
        name: '편입생관련장학금',
        type: 'internal',
        conditions: {
            studentType: ['transfer']
        },
        amounts: {
            'default': '수업료 20%'
        },
        description: '전문학사 편입생'
    },
    
    // 한부모가정장학금
    'single_parent': {
        name: '북지장학금(한부모)',
        type: 'internal',
        conditions: {
            singleParent: true,
            minGpa: 2.0
        },
        amounts: {
            'default': '90만원'
        },
        description: '한부모 가정 자녀'
    },
    
    // 다문화가정장학금
    'multicultural': {
        name: '북지장학금(다문화)',
        type: 'internal',
        conditions: {
            multicultural: true,
            minGpa: 2.0
        },
        amounts: {
            'default': '90만원'
        },
        description: '다문화 가정 자녀'
    },
    
    // 학생회장학금
    'student_council': {
        name: '학번사/교육실습장학금',
        type: 'internal',
        conditions: {
            studentCouncil: true,
            minGpa: 2.0
        },
        amounts: {
            'president': '140만원',
            'vice': '120만원',
            'member': '50만원'
        },
        description: '학생회 활동 우수자'
    },
    
    // 동아리장학금
    'club': {
        name: '공론장학금',
        type: 'internal',
        conditions: {
            clubActivity: true,
            minGpa: 2.0
        },
        amounts: {
            'default': '동아리대표 50만원'
        },
        description: '동아리 대표 활동자'
    },
    
    // 봉사활동장학금
    'volunteer': {
        name: '사회봉사장학금',
        type: 'external',
        conditions: {
            volunteer: true
        },
        amounts: {
            'default': '해당별한 내 자동지급'
        },
        description: '봉사시간 종합시류 제출자'
    },
    
    // 정진대회장학금
    'competition': {
        name: '정진대회장학금',
        type: 'external',
        conditions: {
            competition: true
        },
        amounts: {
            'internal': '50만원',
            'external': '100만원'
        },
        description: '교내외 경진대회 수상자'
    },
    
    // 자격증장학금
    'certification': {
        name: '스터디장학금',
        type: 'external',
        conditions: {
            certification: true
        },
        amounts: {
            'default': '해당별한 내 자동지급'
        },
        description: '전공 관련 자격증 취득자'
    },
    
    // 기초생활수급자장학금
    'low_income': {
        name: '무지개장학금(1유형)',
        type: 'internal',
        conditions: {
            lowIncome: true
        },
        amounts: {
            'default': '해당별한 내'
        },
        description: '기초생활수급자 및 차상위계층'
    }
};

// 장학금 추천 함수
function recommendScholarships() {
    // 입력된 정보 수집
    const userInfo = {
        studentType: document.getElementById('studentType').value,
        grade: document.getElementById('grade').value,
        age: parseInt(document.getElementById('age').value) || 0,
        gpa: parseFloat(document.getElementById('gpa').value) || 0,
        credits: parseInt(document.getElementById('credits').value) || 0,
        entranceGrade: document.getElementById('entranceGrade').value,
        familyInSchool: document.getElementById('familyInSchool').checked,
        employeeFamily: document.getElementById('employeeFamily').checked,
        singleParent: document.getElementById('singleParent').checked,
        multicultural: document.getElementById('multicultural').checked,
        veteran: document.getElementById('veteran').checked,
        disabled: document.getElementById('disabled').checked,
        northKorea: document.getElementById('northKorea').checked,
        lowIncome: document.getElementById('lowIncome').checked,
        studentCouncil: document.getElementById('studentCouncil').checked,
        clubActivity: document.getElementById('clubActivity').checked,
        volunteer: document.getElementById('volunteer').checked,
        competition: document.getElementById('competition').checked,
        certification: document.getElementById('certification').checked
    };
    
    // 추천 장학금 계산
    const recommendations = [];
    
    for (const [key, scholarship] of Object.entries(scholarshipDatabase)) {
        const match = checkScholarshipMatch(userInfo, scholarship);
        if (match.eligible) {
            recommendations.push({
                ...scholarship,
                id: key,
                matchScore: match.score,
                reasons: match.reasons,
                recommendedAmount: getRecommendedAmount(userInfo, scholarship)
            });
        }
    }
    
    // 점수 순으로 정렬
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    // 결과 표시
    displayRecommendationResults(recommendations);
}

// 장학금 조건 확인 함수
function checkScholarshipMatch(userInfo, scholarship) {
    let score = 0;
    let reasons = [];
    let eligible = true;
    
    const conditions = scholarship.conditions;
    
    // 학생 구분 확인
    if (conditions.studentType && !conditions.studentType.includes(userInfo.studentType)) {
        eligible = false;
    } else if (conditions.studentType) {
        score += 20;
        const typeNames = {
            'new': '신입생',
            'current': '재학생',
            'transfer': '편입생'
        };
        reasons.push(`${typeNames[userInfo.studentType]} 해당`);
    }
    
    // 성적 조건 확인
    if (conditions.minGpa && userInfo.gpa > 0) {
        if (userInfo.gpa < conditions.minGpa) {
            eligible = false;
        } else {
            score += 15;
            reasons.push(`평점 ${userInfo.gpa} (기준: ${conditions.minGpa} 이상)`);
        }
    }
    
    // 이수학점 확인
    if (conditions.minCredits && userInfo.credits > 0) {
        if (userInfo.credits < conditions.minCredits) {
            eligible = false;
        } else {
            score += 10;
            reasons.push(`이수학점 ${userInfo.credits}학점 (기준: ${conditions.minCredits}학점 이상)`);
        }
    }
    
    // 나이 조건 확인
    if (conditions.minAge && userInfo.age > 0) {
        if (userInfo.age < conditions.minAge) {
            eligible = false;
        } else {
            score += 15;
            reasons.push(`만 ${userInfo.age}세 (기준: 만 ${conditions.minAge}세 이상)`);
        }
    }
    
    // 입학 성적 확인
    if (conditions.entranceGrade && userInfo.entranceGrade) {
        if (conditions.entranceGrade.includes(userInfo.entranceGrade)) {
            score += 25;
            const gradeNames = {
                'top1': '상위 1%',
                'top5': '상위 5%',
                'top10': '상위 10%',
                'top20': '상위 20%'
            };
            reasons.push(`입학성적 ${gradeNames[userInfo.entranceGrade]}`);
        }
    }
    
    // 가족 상황 확인
    const familyConditions = [
        { condition: 'familyInSchool', reason: '가족 재학/출신' },
        { condition: 'employeeFamily', reason: '교직원 자녀' },
        { condition: 'singleParent', reason: '한부모 가정' },
        { condition: 'multicultural', reason: '다문화 가정' }
    ];
    
    familyConditions.forEach(item => {
        if (conditions[item.condition] && userInfo[item.condition]) {
            score += 20;
            reasons.push(item.reason);
        } else if (conditions[item.condition] && !userInfo[item.condition]) {
            eligible = false;
        }
    });
    
    // 특별 상황 확인
    const specialConditions = [
        { condition: 'veteran', reason: '보훈대상자' },
        { condition: 'disabled', reason: '장애학생' },
        { condition: 'northKorea', reason: '북한이탈주민' },
        { condition: 'lowIncome', reason: '기초생활수급자/차상위' }
    ];
    
    specialConditions.forEach(item => {
        if (conditions[item.condition] && userInfo[item.condition]) {
            score += 25;
            reasons.push(item.reason);
        } else if (conditions[item.condition] && !userInfo[item.condition]) {
            eligible = false;
        }
    });
    
    // 활동 사항 확인
    const activityConditions = [
        { condition: 'studentCouncil', reason: '학생회 활동' },
        { condition: 'clubActivity', reason: '동아리 활동' },
        { condition: 'volunteer', reason: '봉사활동' },
        { condition: 'competition', reason: '경진대회 수상' },
        { condition: 'certification', reason: '자격증 보유' }
    ];
    
    activityConditions.forEach(item => {
        if (conditions[item.condition] && userInfo[item.condition]) {
            score += 15;
            reasons.push(item.reason);
        }
    });
    
    return {
        eligible,
        score,
        reasons
    };
}

// 추천 금액 결정 함수
function getRecommendedAmount(userInfo, scholarship) {
    const amounts = scholarship.amounts;
    
    // 신입생 장학금의 경우 입학 성적에 따라
    if (scholarship.name === '신입생 장학금' && userInfo.entranceGrade) {
        return amounts[userInfo.entranceGrade] || amounts.default;
    }
    
    // 성적장학금의 경우 GPA에 따라
    if (scholarship.name === '성적장학금' && userInfo.gpa > 0) {
        if (userInfo.gpa >= 4.0) return amounts.top;
        if (userInfo.gpa >= 3.7) return amounts.first;
        if (userInfo.gpa >= 3.3) return amounts.second;
        if (userInfo.gpa >= 3.0) return amounts.third;
    }
    
    // 학생회 장학금의 경우
    if (scholarship.name === '학번사/교육실습장학금') {
        // 실제로는 직책에 따라 다르지만, 여기서는 평균적인 금액 반환
        return amounts.member;
    }
    
    // 정진대회 장학금의 경우
    if (scholarship.name === '정진대회장학금') {
        // 교내/교외 구분이 필요하지만 여기서는 교내로 가정
        return amounts.internal;
    }
    
    return amounts.default || amounts[Object.keys(amounts)[0]];
}

// 추천 결과 표시 함수
function displayRecommendationResults(recommendations) {
    const resultsContainer = document.getElementById('recommendationResults');
    const scholarshipsContainer = document.getElementById('recommendedScholarships');
    
    if (recommendations.length === 0) {
        scholarshipsContainer.innerHTML = `
            <div class="no-recommendations">
                <div class="icon">💔</div>
                <h4>추천 가능한 장학금이 없습니다</h4>
                <p>입력하신 조건에 맞는 장학금을 찾을 수 없습니다.<br>
                조건을 조정해서 다시 검색하시거나, 학생지원팀에 문의해주세요.</p>
            </div>
        `;
    } else {
        scholarshipsContainer.innerHTML = recommendations.map((scholarship, index) => {
            const isHighlyRecommended = scholarship.matchScore >= 40;
            return `
                <div class="recommended-scholarship-card ${isHighlyRecommended ? 'highly-recommended' : ''}">
                    <div class="recommended-scholarship-header">
                        <div class="recommended-scholarship-name">${scholarship.name}</div>
                        <div class="recommendation-score">${scholarship.matchScore}점</div>
                    </div>
                    
                    <div class="recommendation-reasons">
                        <h5>매칭 사유:</h5>
                        <ul>
                            ${scholarship.reasons.map(reason => `<li>${reason}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="recommended-amount">
                        지급액: ${scholarship.recommendedAmount}
                    </div>
                    
                    <p style="margin-top: 10px; font-size: 13px; color: #666;">
                        ${scholarship.description}
                    </p>
                </div>
            `;
        }).join('');
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
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
    // 첫 번째 탭(장학금 추천) 활성화
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
            const tabTypes = ['recommendation', 'internal', 'external', 'schedule'];
            if (tabTypes[index]) {
                switchScholarshipTab(tabTypes[index]);
            }
        });
    });
    
    // 입력 필드 유효성 검사
    setupFormValidation();
    
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

// 폼 유효성 검사 설정
function setupFormValidation() {
    // GPA 입력 유효성 검사
    const gpaInput = document.getElementById('gpa');
    if (gpaInput) {
        gpaInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value < 0 || value > 4.5) {
                this.setCustomValidity('평점은 0.0~4.5 사이의 값이어야 합니다.');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // 나이 입력 유효성 검사
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 18 || value > 70) {
                this.setCustomValidity('나이는 18~70 사이의 값이어야 합니다.');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // 이수학점 입력 유효성 검사
    const creditsInput = document.getElementById('credits');
    if (creditsInput) {
        creditsInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 0 || value > 25) {
                this.setCustomValidity('이수학점은 0~25 사이의 값이어야 합니다.');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

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
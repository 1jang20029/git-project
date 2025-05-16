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

// 학생 구분에 따른 성적 입력 필드 표시/숨김
function toggleGradeFields() {
    const studentType = document.getElementById('studentType').value;
    const entranceGradeGroup = document.getElementById('entranceGradeGroup');
    const currentGradeGroup = document.getElementById('currentGradeGroup');
    
    // 모든 필드 초기화
    entranceGradeGroup.style.display = 'none';
    currentGradeGroup.style.display = 'none';
    
    // 입력값 초기화
    document.getElementById('entranceGrade').value = '';
    document.getElementById('gpa').value = '';
    document.getElementById('credits').value = '';
    
    // 학생 구분에 따라 해당 필드 표시
    if (studentType === 'new') {
        entranceGradeGroup.style.display = 'block';
    } else if (studentType === 'current' || studentType === 'transfer') {
        currentGradeGroup.style.display = 'block';
    }
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
            'top1': '수업료 100만원',
            'top5': '수업료 70만원', 
            'top10': '수업료 50만원',
            'top20': '수업료 30만원'
        },
        description: '수시전형에서 입학성적 우수자 선발'
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
            specialStatus: ['veteran']
        },
        amounts: {
            'default': '수업료 100%'
        },
        description: '국가보훈대상자 본인 또는 자녀'
    },
    
    // 장애학생장학금
    'disabled': {
        name: '북지장학금(장애인)',
        type: 'internal',
        conditions: {
            specialStatus: ['disabled'],
            minGpa: 2.0
        },
        amounts: {
            'default': '100만원'
        },
        description: '장애인 본인 또는 자녀'
    },
    
    // 북한이탈주민장학금
    'north_korea': {
        name: '북지장학금(새터민)',
        type: 'internal',
        conditions: {
            specialStatus: ['northKorea'],
            minGpa: 2.0
        },
        amounts: {
            'default': '90만원'
        },
        description: '북한이탈주민 본인 또는 자녀'
    },
    
    // 연성인장학금
    'yeonsung_family': {
        name: '연성인장학금',
        type: 'internal',
        conditions: {
            familyInSchool: ['current', 'graduate', 'both'],
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
            employeeFamily: ['yes']
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
            familyType: ['single'],
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
            familyType: ['multicultural'],
            minGpa: 2.0
        },
        amounts: {
            'default': '90만원'
        },
        description: '다문화 가정 자녀'
    },
    
    // 학생회장학금
    'student_council': {
        name: '학생회/교육실습장학금',
        type: 'internal',
        conditions: {
            schoolActivities: ['studentCouncil'],
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
            schoolActivities: ['clubLeader'],
            minGpa: 2.0
        },
        amounts: {
            'default': '50만원'
        },
        description: '동아리 대표 활동자'
    },
    
    // 봉사활동장학금
    'volunteer': {
        name: '사회봉사장학금',
        type: 'external',
        conditions: {
            achievements: ['volunteer']
        },
        amounts: {
            'default': '해당 별한 내 자동지급'
        },
        description: '봉사시간 종합시류 제출자'
    },
    
    // 정진대회장학금
    'competition_internal': {
        name: '정진대회장학금(교내)',
        type: 'external',
        conditions: {
            achievements: ['competition']
        },
        amounts: {
            'default': '50만원'
        },
        description: '교내 경진대회 수상자'
    },
    
    'competition_external': {
        name: '정진대회장학금(교외)',
        type: 'external',
        conditions: {
            achievements: ['competition']
        },
        amounts: {
            'default': '100만원'
        },
        description: '교외 경진대회 수상자'
    },
    
    // 자격증장학금
    'certification': {
        name: '스터디장학금',
        type: 'external',
        conditions: {
            achievements: ['certification']
        },
        amounts: {
            'default': '해당 별한 내'
        },
        description: '전공 관련 자격증 취득자'
    },
    
    // 기초생활수급자장학금
    'low_income': {
        name: '무지개장학금(1유형)',
        type: 'internal',
        conditions: {
            specialStatus: ['lowIncome']
        },
        amounts: {
            'default': '해당 별한 내'
        },
        description: '기초생활수급자 및 차상위계층'
    }
};

// 입력값 수집 함수
function collectUserInfo() {
    // 기본 정보
    const studentType = document.getElementById('studentType').value;
    const grade = document.getElementById('grade').value;
    const age = parseInt(document.getElementById('age').value) || 0;
    
    // 성적 정보
    const gpa = parseFloat(document.getElementById('gpa').value) || 0;
    const credits = parseInt(document.getElementById('credits').value) || 0;
    const entranceGrade = document.getElementById('entranceGrade').value;
    
    // 가족 상황
    const familyInSchool = document.getElementById('familyInSchool').value;
    const employeeFamily = document.getElementById('employeeFamily').value;
    const familyType = document.getElementById('familyType').value;
    
    // 특별 상황 - 다중 선택
    const specialStatusSelect = document.getElementById('specialStatus');
    const specialStatus = Array.from(specialStatusSelect.selectedOptions).map(option => option.value);
    
    // 활동 사항 - 다중 선택
    const schoolActivitiesSelect = document.getElementById('schoolActivities');
    const schoolActivities = Array.from(schoolActivitiesSelect.selectedOptions).map(option => option.value);
    
    const achievementsSelect = document.getElementById('achievements');
    const achievements = Array.from(achievementsSelect.selectedOptions).map(option => option.value);
    
    return {
        studentType,
        grade,
        age,
        gpa,
        credits,
        entranceGrade,
        familyInSchool,
        employeeFamily,
        familyType,
        specialStatus,
        schoolActivities,
        achievements
    };
}

// 장학금 추천 함수
function recommendScholarships() {
    const userInfo = collectUserInfo();
    
    // 입력 유효성 검사
    if (!userInfo.studentType) {
        alert('학생 구분을 선택해주세요.');
        return;
    }
    
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
    } else if (conditions.studentType && conditions.studentType.includes(userInfo.studentType)) {
        score += 20;
        const typeNames = {
            'new': '신입생',
            'current': '재학생',
            'transfer': '편입생'
        };
        reasons.push(`${typeNames[userInfo.studentType]} 해당`);
    }
    
    // 성적 조건 확인 (재학생/편입생)
    if (conditions.minGpa && userInfo.gpa > 0) {
        if (userInfo.gpa < conditions.minGpa) {
            eligible = false;
        } else {
            score += 15;
            reasons.push(`평점 ${userInfo.gpa} (기준: ${conditions.minGpa} 이상)`);
        }
    }
    
    // 이수학점 확인 (재학생/편입생)
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
    
    // 입학 성적 확인 (신입생)
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
    if (conditions.familyInSchool && userInfo.familyInSchool !== 'none') {
        if (conditions.familyInSchool.includes(userInfo.familyInSchool)) {
            score += 20;
            const familyNames = {
                'current': '가족 중 재학생 있음',
                'graduate': '가족 중 연성대 출신 있음',
                'both': '재학생과 출신 모두 있음'
            };
            reasons.push(familyNames[userInfo.familyInSchool]);
        }
    }
    
    if (conditions.employeeFamily && userInfo.employeeFamily !== 'none') {
        if (conditions.employeeFamily.includes(userInfo.employeeFamily)) {
            score += 25;
            reasons.push('교직원 직계가족');
        }
    }
    
    if (conditions.familyType && userInfo.familyType !== 'normal') {
        if (userInfo.familyType === 'single' && scholarship.name.includes('한부모')) {
            score += 20;
            reasons.push('한부모 가정');
        } else if (userInfo.familyType === 'multicultural' && scholarship.name.includes('다문화')) {
            score += 20;
            reasons.push('다문화 가정');
        }
    }
    
    // 특별 상황 확인
    if (conditions.specialStatus && userInfo.specialStatus.length > 0) {
        const hasMatch = userInfo.specialStatus.some(status => 
            status !== 'none' && conditions.specialStatus.includes(status)
        );
        if (hasMatch) {
            score += 25;
            const statusNames = {
                'veteran': '보훈대상자',
                'disabled': '장애인',
                'northKorea': '북한이탈주민',
                'lowIncome': '기초생활수급자/차상위'
            };
            userInfo.specialStatus.forEach(status => {
                if (status !== 'none' && conditions.specialStatus.includes(status)) {
                    reasons.push(statusNames[status]);
                }
            });
        }
    }
    
    // 활동 사항 확인
    if (conditions.schoolActivities && userInfo.schoolActivities.length > 0) {
        const hasMatch = userInfo.schoolActivities.some(activity => 
            activity !== 'none' && conditions.schoolActivities.includes(activity)
        );
        if (hasMatch) {
            score += 15;
            const activityNames = {
                'studentCouncil': '학생회 활동',
                'clubActivity': '동아리 활동',
                'clubLeader': '동아리 대표'
            };
            userInfo.schoolActivities.forEach(activity => {
                if (activity !== 'none' && conditions.schoolActivities.includes(activity)) {
                    reasons.push(activityNames[activity]);
                }
            });
        }
    }
    
    if (conditions.achievements && userInfo.achievements.length > 0) {
        const hasMatch = userInfo.achievements.some(achievement => 
            achievement !== 'none' && conditions.achievements.includes(achievement)
        );
        if (hasMatch) {
            score += 15;
            const achievementNames = {
                'volunteer': '봉사활동 경험',
                'competition': '경진대회 수상',
                'certification': '전공 관련 자격증',
                'language': '어학 자격증'
            };
            userInfo.achievements.forEach(achievement => {
                if (achievement !== 'none' && conditions.achievements.includes(achievement)) {
                    reasons.push(achievementNames[achievement]);
                }
            });
        }
    }
    
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
    if (scholarship.name === '학생회/교육실습장학금') {
        // 실제로는 직책에 따라 다르지만, 여기서는 평균적인 금액 반환
        return amounts.member || amounts.default;
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
    
    // 학생 구분 변경 시 성적 입력 필드 토글
    document.getElementById('studentType').addEventListener('change', toggleGradeFields);
    
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
    
    // 초기 성적 입력 필드 숨김
    toggleGradeFields();
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

// 기타 기능들은 동일하게 유지...
// (장학금 카드 애니메이션, 테이블 스크롤 가이드 등)

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
document.addEventListener('DOMContentLoaded', function() {
    const scheduleTab = document.querySelectorAll('.tab-item')[3]; // 4번째 탭 (지급일정)
    if (scheduleTab) {
        scheduleTab.addEventListener('click', function() {
            setTimeout(showScrollGuide, 300);
        });
    }
});

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

// 에러 처리
window.addEventListener('error', function(event) {
    console.error('장학금 페이지 에러:', event.error);
});

console.log('장학금 정보 페이지가 로드되었습니다.');
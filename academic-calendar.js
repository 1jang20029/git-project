// 🔥 완전 미친 학사일정 시스템 🔥

// 학사일정 데이터 - 전체 12개월
const academicEvents = {
    2025: {
        1: [
            { date: 1, title: '신정', type: '공휴일', category: 'holiday', isHoliday: true, isUrgent: true },
            { date: 6, title: '동계 계절학기', type: '1월 6일 ~ 1월 17일', category: 'academic', endDate: 17 },
            { date: 7, title: '2학기 성적확정', type: '성적 관련', category: 'grade' },
            { date: 8, title: '전기 졸업대상 참가신청', type: '1월 8일 ~ 1월 15일', category: 'graduation', endDate: 15, isImportant: true },
            { date: 9, title: '교직원세미나', type: '교직원 대상', category: 'event' },
            { date: 10, title: '국고내역 점검보고 및 원류 워크숍', type: '행정 업무', category: 'admin' },
            { date: 17, title: '동계계절학기 성적입력', type: '1월 17일 ~ 1월 20일', category: 'grade', endDate: 20 },
            { date: 27, title: '입시요람', type: '입시 관련', category: 'admission' }
        ],
        2: [
            { date: 3, title: '전기전담 및 졸업사정회', type: '졸업 관련', category: 'graduation' },
            { date: 6, title: '2025학년도 정시 합격자 발표', type: '입시 결과', category: 'admission', isImportant: true },
            { date: 10, title: '2025학년도 정시 합격자 등록기간', type: '2월 10일 ~ 2월 12일', category: 'registration', endDate: 12 },
            { date: 12, title: '제47회 학위수여식', type: '졸업식', category: 'graduation' },
            { date: 17, title: '1학기 재학생 등록기간', type: '2월 17일 ~ 2월 21일', category: 'registration', endDate: 21 },
            { date: 21, title: '2025학년도 입학식', type: '신입생 대상', category: 'ceremony' }
        ],
        3: [
            { date: 1, title: '삼일절', type: '공휴일', category: 'holiday', isHoliday: true, isUrgent: true },
            { date: 3, title: '대체공휴일', type: '삼일절 대체', category: 'holiday', isHoliday: true },
            { date: 4, title: '2025학년도 1학기 개강', type: '학기 시작', category: 'academic', isImportant: true },
            { date: 4, title: '신입생 수강신청기간', type: '3월 4일 ~ 3월 7일', category: 'registration', endDate: 7 },
            { date: 10, title: '대학생활 적응상담 프로그램', type: '3월 10일 ~ 3월 14일', category: 'event', endDate: 14 },
            { date: 15, title: '개교 48주년 기념일', type: '학교 기념일', category: 'event' },
            { date: 26, title: '수업일수 1/4선', type: '학사 일정', category: 'academic' }
        ],
        4: [
            { date: 21, title: '중간고사 평가 관찰기간', type: '4월 21일 ~ 5월 2일', category: 'exam', endDate: { month: 5, date: 2 }, isImportant: true },
            { date: 22, title: '2025-1학기 중간고사 시작', type: '4월 22일(월) ~ 4월 26일(금)', category: 'exam', endDate: 26, isImportant: true },
            { date: 24, title: '수업일수 2/4선', type: '학사 일정', category: 'academic' }
        ],
        5: [
            { date: 1, title: '근로자의날', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 5, title: '어린이날/부처님오신날', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 6, title: '대체공휴일', type: '어린이날 대체', category: 'holiday', isHoliday: true },
            { date: 8, title: '제49회 창지대학대회', type: '학교 행사', category: 'event', endDate: 9 },
            { date: 26, title: '수업일수 3/4선', type: '학사 일정', category: 'academic' }
        ],
        6: [
            { date: 6, title: '현충일', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 10, title: '공휴일 보강기간', type: '6월 10일 ~ 6월 13일', category: 'academic', endDate: 13 },
            { date: 16, title: '기말고사 기간', type: '6월 16일 ~ 6월 20일', category: 'exam', endDate: 20, isImportant: true },
            { date: 17, title: '성적입력 기간', type: '6월 17일 ~ 6월 25일', category: 'grade', endDate: 25 },
            { date: 20, title: '수업일수 4/4선', type: '학사 일정', category: 'academic' },
            { date: 23, title: '하계방학 시작', type: '여름방학', category: 'holiday' },
            { date: 23, title: '하계 휴학신청', type: '6월 23일 ~ 7월 1일', category: 'registration', endDate: { month: 7, date: 1 } },
            { date: 27, title: '성적입력 및 이의신청기간', type: '6월 27일 ~ 7월 2일', category: 'grade', endDate: { month: 7, date: 2 } }
        ],
        7: [
            { date: 3, title: '교직원세미나', type: '교직원 대상', category: 'event' },
            { date: 4, title: '1학기 성적확정/국고사업 성과보고 및 원류 워크숍', type: '행정 업무', category: 'admin' },
            { date: 7, title: '후기 졸업대상 참가신청', type: '7월 7일 ~ 7월 11일', category: 'graduation', endDate: 11 },
            { date: 10, title: '진로박람회', type: '7월 10일 ~ 7월 11일', category: 'event', endDate: 11 },
            { date: 16, title: '하계 계절학기 성적입력', type: '7월 16일 ~ 7월 17일', category: 'grade', endDate: 17 },
            { date: 18, title: '하계 계절학기 성적입력 및 성적이의신청', type: '7월 18일 ~ 7월 21일', category: 'grade', endDate: 21 },
            { date: 28, title: '하계방학 전체 휴무', type: '7월 28일 ~ 8월 1일', category: 'holiday', endDate: { month: 8, date: 1 } }
        ],
        8: [
            { date: 4, title: '임립휴한·전과·재입학 참가기간', type: '8월 4일 ~ 8월 8일', category: 'registration', endDate: 8 },
            { date: 6, title: '후기 졸업사정회', type: '졸업 관련', category: 'graduation' },
            { date: 11, title: '복학 참가기간', type: '8월 11일 ~ 8월 14일', category: 'registration', endDate: 14 },
            { date: 11, title: '재학생(복학생) 수강신청 기간', type: '8월 11일 ~ 8월 19일', category: 'registration', endDate: 19, isImportant: true },
            { date: 15, title: '광복절', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 18, title: '2학기 재학생 등록기간', type: '8월 18일 ~ 8월 22일', category: 'registration', endDate: 22 },
            { date: 20, title: '2024학년도 후기 학위수여', type: '졸업식', category: 'graduation' }
        ],
        9: [
            { date: 1, title: '2025학년도 2학기 개강', type: '학기 시작', category: 'academic', isImportant: true },
            { date: 8, title: '2026학년도 수시1차 원서접수기간', type: '9월 8일 ~ 9월 30일', category: 'admission', endDate: 30 },
            { date: 25, title: '수업일수 1/4선', type: '학사 일정', category: 'academic' }
        ],
        10: [
            { date: 3, title: '개천절', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 6, title: '수석연휴', type: '10월 6일 ~ 10월 7일', category: 'holiday', endDate: 7 },
            { date: 8, title: '대체공휴일', type: '한글날 대체', category: 'holiday', isHoliday: true },
            { date: 9, title: '한글날', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 10, title: '임시휴업', type: '한글날 연휴', category: 'holiday' },
            { date: 16, title: '제49회 창지대학제', type: '10월 16일 ~ 10월 17일', category: 'event', endDate: 17 },
            { date: 22, title: '2026학년도 수시1차 면접/실기고사', type: '10월 22일 ~ 10월 26일', category: 'admission', endDate: 26 },
            { date: 27, title: '중간고사 평가 관찰기간', type: '10월 27일 ~ 11월 7일', category: 'exam', endDate: { month: 11, date: 7 } },
            { date: 30, title: '수업일수 2/4선', type: '학사 일정', category: 'academic' }
        ],
        11: [
            { date: 4, title: '2026학년도 수시1차 합격자 발표', type: '입시 결과', category: 'admission', isImportant: true },
            { date: 7, title: '2026학년도 수시1차 원서접수기간', type: '11월 7일 ~ 11월 21일', category: 'admission', endDate: 21 },
            { date: 20, title: 'Gem-Festival', type: '11월 20일 ~ 11월 21일', category: 'event', endDate: 21 },
            { date: 26, title: '수업일수 3/4선', type: '학사 일정', category: 'academic' },
            { date: 29, title: '2026학년도 수시2차 면접/실기고사', type: '11월 29일 ~ 12월 3일', category: 'admission', endDate: { month: 12, date: 3 } }
        ],
        12: [
            { date: 8, title: '공휴일 보강기간', type: '12월 8일 ~ 12월 15일', category: 'academic', endDate: 15 },
            { date: 11, title: '2026학년도 수시2차 합격자 발표', type: '입시 결과', category: 'admission' },
            { date: 15, title: '2026학년도 수시 합격자 등록기간', type: '12월 15일 ~ 12월 17일', category: 'registration', endDate: 17 },
            { date: 16, title: '기말고사 기간', type: '12월 16일 ~ 12월 22일', category: 'exam', endDate: 22, isImportant: true },
            { date: 17, title: '성적입력 기간', type: '12월 17일 ~ 12월 26일', category: 'grade', endDate: 26 },
            { date: 22, title: '수업일수 4/4선', type: '학사 일정', category: 'academic' },
            { date: 23, title: '동계방학 시작', type: '겨울방학', category: 'holiday' },
            { date: 23, title: '동계 휴학신청', type: '12월 23일 ~ 2026년 1월 2일', category: 'registration', endDate: { month: 1, date: 2, year: 2026 } },
            { date: 25, title: '성탄절', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 29, title: '2026학년도 정시 원서접수기간', type: '12월 29일 ~ 2026년 1월 14일', category: 'admission', endDate: { month: 1, date: 14, year: 2026 } },
            { date: 30, title: '성적입력 및 이의신청기간', type: '12월 30일 ~ 2026년 1월 5일', category: 'grade', endDate: { month: 1, date: 5, year: 2026 } }
        ]
    }
};

// 월 이름 매핑
const monthNames = {
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
};

// 요일 이름
const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

// 현재 상태
let currentYear = 2025;
let currentSemester = 1;
let currentView = 'list';
let currentFilter = 'all';
let currentCalendarMonth = new Date().getMonth() + 1;
let fabMenuOpen = false;

// 카테고리 아이콘 매핑
const categoryIcons = {
    holiday: 'fas fa-umbrella-beach',
    academic: 'fas fa-book',
    exam: 'fas fa-graduation-cap',
    registration: 'fas fa-edit',
    grade: 'fas fa-star',
    graduation: 'fas fa-user-graduate',
    event: 'fas fa-calendar-star',
    admin: 'fas fa-cog',
    admission: 'fas fa-door-open',
    ceremony: 'fas fa-trophy',
    scholarship: 'fas fa-award'
};

// 🚀 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 학사일정 시스템 초기화 시작!');
    
    showLoading();
    
    setTimeout(() => {
        initializeFilters();
        initializeViewToggle();
        generateAllMonths();
        updateStatistics();
        updateCalendarView();
        hideLoading();
        
        // 오늘 날짜로 스크롤
        scrollToCurrentMonth();
    }, 1000);
});

// 🎯 로딩 관리
function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

// 🔄 뒤로가기
function goBack() {
    const previousPage = localStorage.getItem('previousPage');
    if (previousPage) {
        localStorage.removeItem('previousPage');
        window.location.href = previousPage;
    } else {
        window.location.href = 'index.html';
    }
}

// 📅 오늘로 이동
function goToToday() {
    const today = new Date();
    if (currentView === 'list') {
        scrollToCurrentMonth(today.getMonth() + 1);
    } else {
        currentCalendarMonth = today.getMonth() + 1;
        updateCalendarView();
    }
    
    // 부드러운 애니메이션 효과
    document.querySelector('.today-button').style.transform = 'scale(0.95)';
    setTimeout(() => {
        document.querySelector('.today-button').style.transform = 'scale(1)';
    }, 150);
}

// 🎛️ 기간 변경
function changePeriod(direction) {
    if (direction > 0) {
        if (currentSemester === 1) {
            currentSemester = 2;
        } else {
            currentSemester = 1;
            currentYear++;
        }
    } else {
        if (currentSemester === 2) {
            currentSemester = 1;
        } else {
            currentSemester = 2;
            currentYear--;
        }
    }
    
    updatePeriodDisplay();
    generateAllMonths();
    updateCalendarView();
}

// 📊 기간 표시 업데이트
function updatePeriodDisplay() {
    document.querySelector('.year-display').textContent = `${currentYear}학년도`;
    document.querySelector('.semester-display').textContent = `${currentSemester}학기`;
}

// 🎨 필터 초기화
function initializeFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // 활성 상태 변경
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // 필터 적용
            currentFilter = this.dataset.filter;
            applyFilter();
            
            // 버튼 애니메이션
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// 🔀 뷰 토글 초기화
function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 활성 상태 변경
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 뷰 변경
            currentView = this.dataset.view;
            toggleView();
        });
    });
}

// 👁️ 뷰 전환
function toggleView() {
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');
    
    if (currentView === 'list') {
        listView.classList.remove('hidden');
        calendarView.classList.add('hidden');
    } else {
        listView.classList.add('hidden');
        calendarView.classList.remove('hidden');
        updateCalendarView();
    }
}

// 🎯 필터 적용
function applyFilter() {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const badge = card.querySelector('.event-badge');
        if (!badge) return;
        
        const category = Array.from(badge.classList).find(cls => cls !== 'event-badge');
        
        if (currentFilter === 'all' || category === currentFilter) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
    
    // 월별 이벤트 수 업데이트
    setTimeout(updateEventCounts, 300);
}

// 📈 이벤트 수 업데이트
function updateEventCounts() {
    const monthSections = document.querySelectorAll('.month-section');
    
    monthSections.forEach(section => {
        const visibleEvents = section.querySelectorAll('.event-card[style*="flex"], .event-card:not([style])');
        const hiddenEvents = section.querySelectorAll('.event-card[style*="none"]');
        const totalVisible = visibleEvents.length - hiddenEvents.length;
        
        const countElement = section.querySelector('.count-number');
        if (countElement) {
            countElement.textContent = totalVisible;
        }
    });
}

// 📊 통계 업데이트
function updateStatistics() {
    let holidayCount = 0;
    let examCount = 0;
    let eventCount = 0;
    
    Object.values(academicEvents[currentYear]).forEach(monthEvents => {
        monthEvents.forEach(event => {
            switch(event.category) {
                case 'holiday':
                    holidayCount++;
                    break;
                case 'exam':
                    examCount++;
                    break;
                case 'event':
                case 'ceremony':
                    eventCount++;
                    break;
            }
        });
    });
    
    document.getElementById('holiday-count').textContent = holidayCount;
    document.getElementById('exam-count').textContent = examCount;
    document.getElementById('event-count').textContent = eventCount;
}

// 🗓️ 모든 월 생성
function generateAllMonths() {
    const container = document.querySelector('.months-container');
    container.innerHTML = '';
    
    for (let month = 1; month <= 12; month++) {
        const monthSection = createMonthSection(month);
        container.appendChild(monthSection);
    }
}

// 📅 월 섹션 생성
function createMonthSection(month) {
    const events = academicEvents[currentYear][month] || [];
    const monthElement = document.createElement('div');
    monthElement.className = 'month-section';
    monthElement.dataset.month = month;
    
    monthElement.innerHTML = `
        <div class="month-header">
            <div class="month-title-container">
                <h2 class="month-title">${monthNames.ko[month - 1]}</h2>
                <div class="month-subtitle">${monthNames.en[month - 1]}</div>
            </div>
            <div class="event-count-badge">
                <span class="count-number">${events.length}</span>
                <span class="count-label">개 일정</span>
            </div>
        </div>
        <div class="events-timeline">
            ${events.map(event => createEventCard(event, month)).join('')}
        </div>
    `;
    
    return monthElement;
}

// 🎴 이벤트 카드 생성
function createEventCard(event, month) {
    const eventDate = new Date(currentYear, month - 1, event.date);
    const weekday = weekdayNames[eventDate.getDay()];
    const cardClasses = ['event-card'];
    
    if (event.isUrgent) cardClasses.push('urgent');
    if (event.isImportant) cardClasses.push('important');
    
    const duration = calculateDuration(event, month);
    const icon = categoryIcons[event.category] || 'fas fa-calendar';
    
    return `
        <div class="${cardClasses.join(' ')}" onclick="showEventDetail(${event.date}, ${month}, '${event.title}')">
            <div class="event-marker"></div>
            <div class="event-date-card">
                <div class="event-day">${event.date}</div>
                <div class="event-weekday">${weekday}</div>
                <div class="event-month">${monthNames.short[month - 1]}</div>
            </div>
            <div class="event-content">
                <div class="event-header">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-badge ${event.category}">
                        <i class="${icon}"></i>
                        ${getCategoryName(event.category)}
                    </div>
                </div>
                <p class="event-description">${event.type}</p>
                <div class="event-time">${duration}</div>
            </div>
        </div>
    `;
}

// ⏱️ 기간 계산
function calculateDuration(event, month) {
    if (event.endDate) {
        if (typeof event.endDate === 'number') {
            const days = event.endDate - event.date + 1;
            return `${days}일간`;
        } else if (typeof event.endDate === 'object') {
            return '기간 행사';
        }
    }
    return '전일';
}

// 🏷️ 카테고리 이름 가져오기
function getCategoryName(category) {
    const categoryNames = {
        holiday: '휴일',
        academic: '학사',
        exam: '시험',
        registration: '등록',
        grade: '성적',
        graduation: '졸업',
        event: '행사',
        admin: '행정',
        admission: '입시',
        ceremony: '입학',
        scholarship: '장학'
    };
    
    return categoryNames[category] || '기타';
}

// 📍 현재 월로 스크롤
function scrollToCurrentMonth(targetMonth = null) {
    const month = targetMonth || new Date().getMonth() + 1;
    const monthSection = document.querySelector(`[data-month="${month}"]`);
    
    if (monthSection) {
        monthSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        // 강조 효과
        monthSection.style.transform = 'scale(1.02)';
        setTimeout(() => {
            monthSection.style.transform = 'scale(1)';
        }, 500);
    }
}

// 🗓️ 달력 뷰 업데이트
function updateCalendarView() {
    updateCalendarHeader();
    generateCalendarDates();
}

// 📋 달력 헤더 업데이트
function updateCalendarHeader() {
    const monthElement = document.querySelector('.calendar-month');
    const subtitleElement = document.querySelector('.calendar-subtitle');
    
    monthElement.textContent = `${currentYear}년 ${monthNames.ko[currentCalendarMonth - 1]}`;
    subtitleElement.textContent = monthNames.en[currentCalendarMonth - 1];
}

// 📅 달력 날짜 생성
function generateCalendarDates() {
    const datesContainer = document.getElementById('calendar-dates');
    datesContainer.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentCalendarMonth - 1, 1);
    const lastDay = new Date(currentYear, currentCalendarMonth, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentCalendarMonth;
    const todayDate = isCurrentMonth ? today.getDate() : null;
    
    // 6주 * 7일 = 42칸
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dateElement = document.createElement('div');
        dateElement.className = 'calendar-date';
        
        const isOtherMonth = currentDate.getMonth() + 1 !== currentCalendarMonth;
        const isToday = isCurrentMonth && currentDate.getDate() === todayDate;
        
        if (isOtherMonth) {
            dateElement.classList.add('other-month');
        }
        if (isToday) {
            dateElement.classList.add('today');
        }
        
        // 해당 날짜의 이벤트 가져오기
        const dayEvents = getEventsForDate(currentDate);
        if (dayEvents.length > 0) {
            dateElement.classList.add('has-events');
        }
        
        dateElement.innerHTML = `
            <div class="date-number">${currentDate.getDate()}</div>
            <div class="date-events">
                ${dayEvents.slice(0, 3).map(event => 
                    `<div class="date-event ${event.category}">${event.title}</div>`
                ).join('')}
            </div>
        `;
        
        // 클릭 이벤트
        dateElement.addEventListener('click', () => {
            showEventModal(currentDate, dayEvents);
        });
        
        datesContainer.appendChild(dateElement);
    }
}

// 📅 특정 날짜의 이벤트 가져오기
function getEventsForDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (!academicEvents[year] || !academicEvents[year][month]) {
        return [];
    }
    
    return academicEvents[year][month].filter(event => {
        // 단일 날짜 이벤트
        if (event.date === day) {
            return true;
        }
        
        // 기간 이벤트 (같은 월 내)
        if (typeof event.endDate === 'number' && event.date <= day && day <= event.endDate) {
            return true;
        }
        
        // 기간 이벤트 (다른 월까지)
        if (typeof event.endDate === 'object') {
            const startDate = new Date(year, month - 1, event.date);
            const endDate = new Date(event.endDate.year || year, event.endDate.month - 1, event.endDate.date);
            const currentDate = new Date(year, month - 1, day);
            
            return currentDate >= startDate && currentDate <= endDate;
        }
        
        return false;
    });
}

// 📅 달력 월 변경
function changeMonth(direction) {
    currentCalendarMonth += direction;
    
    if (currentCalendarMonth < 1) {
        currentCalendarMonth = 12;
        currentYear--;
    } else if (currentCalendarMonth > 12) {
        currentCalendarMonth = 1;
        currentYear++;
    }
    
    updateCalendarView();
    
    // 버튼 애니메이션
    const buttons = document.querySelectorAll('.calendar-nav-btn');
    const targetButton = direction > 0 ? buttons[1] : buttons[0];
    targetButton.style.transform = 'scale(0.9)';
    setTimeout(() => {
        targetButton.style.transform = 'scale(1)';
    }, 150);
}

// 🎭 이벤트 모달 표시
function showEventModal(date, events) {
    if (events.length === 0) return;
    
    const modal = document.getElementById('event-modal');
    const modalDay = document.getElementById('modal-day');
    const modalDate = document.getElementById('modal-date');
    const modalEvents = document.getElementById('modal-events');
    
    // 날짜 포맷팅
    modalDay.textContent = date.getDate();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
    };
    modalDate.textContent = date.toLocaleDateString('ko-KR', options);
    
    // 이벤트 목록 생성
    modalEvents.innerHTML = events.map(event => `
        <div class="modal-event-card">
            <div class="modal-event-icon">
                <i class="${categoryIcons[event.category] || 'fas fa-calendar'}"></i>
            </div>
            <div class="modal-event-content">
                <h4 class="modal-event-title">${event.title}</h4>
                <p class="modal-event-description">${event.type}</p>
                <div class="modal-event-badge ${event.category}">
                    ${getCategoryName(event.category)}
                </div>
            </div>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
    
    // 모달 애니메이션
    const modalContainer = modal.querySelector('.modal-container');
    modalContainer.style.transform = 'scale(0.8) translateY(20px)';
    modalContainer.style.opacity = '0';
    
    setTimeout(() => {
        modalContainer.style.transform = 'scale(1) translateY(0)';
        modalContainer.style.opacity = '1';
    }, 50);
}

// ❌ 이벤트 모달 닫기
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    const modalContainer = modal.querySelector('.modal-container');
    
    modalContainer.style.transform = 'scale(0.8) translateY(20px)';
    modalContainer.style.opacity = '0';
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// 📋 이벤트 상세 보기
function showEventDetail(date, month, title) {
    const event = academicEvents[currentYear][month].find(e => e.date === date && e.title === title);
    if (!event) return;
    
    const eventDate = new Date(currentYear, month - 1, date);
    const formattedDate = eventDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    alert(`📅 ${formattedDate}\n\n📌 ${event.title}\n📝 ${event.type}\n🏷️ ${getCategoryName(event.category)}`);
}

// 🎈 FAB 메뉴 토글
function toggleFabMenu() {
    const fabMenu = document.querySelector('.fab-menu');
    const fabMain = document.querySelector('.fab-main');
    
    fabMenuOpen = !fabMenuOpen;
    
    if (fabMenuOpen) {
        fabMenu.classList.add('active');
        fabMain.style.transform = 'rotate(45deg)';
    } else {
        fabMenu.classList.remove('active');
        fabMain.style.transform = 'rotate(0deg)';
    }
}

// 📤 달력 내보내기
function exportCalendar() {
    alert('📤 학사일정을 내보내는 기능입니다.\n(개발 예정)');
    toggleFabMenu();
}

// 📤 달력 공유하기
function shareCalendar() {
    if (navigator.share) {
        navigator.share({
            title: '연성대학교 학사일정',
            text: '2025학년도 연성대학교 학사일정을 확인해보세요!',
            url: window.location.href
        });
    } else {
        alert('📤 학사일정을 공유하는 기능입니다.\n(이 브라우저에서는 지원되지 않습니다)');
    }
    toggleFabMenu();
}

// 📅 내 달력에 추가
function addToMyCalendar() {
    alert('📅 내 달력에 추가하는 기능입니다.\n(개발 예정)');
    toggleFabMenu();
}

// 🔍 현재 월로 스크롤 (오늘 날짜 기준)
function scrollToCurrentMonth(targetMonth = null) {
    const month = targetMonth || new Date().getMonth() + 1;
    const monthSection = document.querySelector(`[data-month="${month}"]`);
    
    if (monthSection) {
        monthSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        // 강조 효과
        monthSection.style.transform = 'scale(1.02)';
        monthSection.style.boxShadow = '0 20px 60px rgba(102,126,234,0.3)';
        setTimeout(() => {
            monthSection.style.transform = 'scale(1)';
            monthSection.style.boxShadow = 'none';
        }, 1000);
    }
}

// 📱 모바일 터치 이벤트
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (currentView === 'calendar') {
            if (diff > 0) {
                changeMonth(1); // 다음 달
            } else {
                changeMonth(-1); // 이전 달
            }
        }
    }
}

// 🌙 다크 모드 토글 (추가 기능)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// 🔄 페이지 가시성 변경 시 업데이트
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentView === 'calendar') {
        updateCalendarView();
    }
});

// 📏 윈도우 리사이즈 시 처리
window.addEventListener('resize', function() {
    if (currentView === 'calendar') {
        setTimeout(updateCalendarView, 100);
    }
});

// 🎯 메인 페이지에서 사용할 함수들
window.getUpcomingAcademicEvents = function(limit = 3) {
    const today = new Date();
    const upcomingEvents = [];
    
    // 현재 날짜부터 3개월 후까지 검색
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1;
        
        if (academicEvents[year] && academicEvents[year][month]) {
            academicEvents[year][month].forEach(event => {
                const eventDate = new Date(year, month - 1, event.date);
                
                // 오늘 이후의 이벤트만 포함
                if (eventDate >= today) {
                    upcomingEvents.push({
                        ...event,
                        month: month,
                        fullDate: eventDate,
                        daysUntil: Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
                    });
                }
            });
        }
    }
    
    // 날짜순 정렬 후 limit만큼 반환
    return upcomingEvents
        .sort((a, b) => a.fullDate - b.fullDate)
        .slice(0, limit);
};

// 🎨 CSS 추가 스타일 (모달 이벤트 카드)
const additionalStyles = `
.modal-event-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9ff, #ffffff);
    border-radius: 15px;
    margin-bottom: 15px;
    border: 1px solid #e0e6ff;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-event-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102,126,234,0.2);
}

.modal-event-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-size: 20px;
}

.modal-event-content {
    flex: 1;
}

.modal-event-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.modal-event-description {
    color: #666;
    font-size: 14px;
    margin-bottom: 10px;
}

.modal-event-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
`;

// 스타일 추가
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);

console.log('🚀 학사일정 시스템 로드 완료!');
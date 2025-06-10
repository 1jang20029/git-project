// 전역 변수
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';

// 뒤로 가기 함수
function goBackToMain() {
    if (document.referrer && document.referrer !== '') {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// 2025학년도 연성대학교 학사일정 데이터
const academicSchedule = {
    '1': [ // 1학기
        {
            id: 1,
            title: '성적열람 및 이의신청기간',
            date: '2024-12-30',
            endDate: '2025-01-03',
            type: 'academic',
            description: '전기 성적열람 및 이의신청 기간',
            important: false
        },
        {
            id: 2,
            title: '신정',
            date: '2025-01-01',
            type: 'holiday',
            description: '신정 공휴일 (휴강)',
            important: false
        },
        {
            id: 26,
            title: '2025학년도 1학기 개강',
            date: '2025-03-04',
            type: 'academic',
            description: '1학기 수업 시작',
            important: true
        },
        {
            id: 31,
            title: '중간고사 평가 권장기간',
            date: '2025-04-21',
            endDate: '2025-05-02',
            type: 'exam',
            description: '1학기 중간고사 기간',
            important: true
        },
        {
            id: 36,
            title: '제49회 양지체육대회(자율보강)',
            date: '2025-05-08',
            endDate: '2025-05-09',
            type: 'event',
            description: '체육대회',
            important: true
        },
        {
            id: 38,
            title: '현충일',
            date: '2025-06-06',
            type: 'holiday',
            description: '현충일 공휴일',
            important: false
        },
        {
            id: 39,
            title: '공휴일 보강기간',
            date: '2025-06-10',
            endDate: '2025-06-13',
            type: 'academic',
            description: '공휴일 보강수업',
            important: false
        },
        {
            id: 40,
            title: '기말고사 권장기간',
            date: '2025-06-16',
            endDate: '2025-06-20',
            type: 'exam',
            description: '1학기 기말고사',
            important: true
        },
        {
            id: 41,
            title: '성적입력 기간',
            date: '2025-06-17',
            endDate: '2025-06-25',
            type: 'academic',
            description: '기말고사 성적 입력',
            important: false
        },
        {
            id: 43,
            title: '하계방학 시작',
            date: '2025-06-23',
            type: 'holiday',
            description: '여름방학 시작',
            important: true
        }
    ],
    'summer': [ // 여름학기
        {
            id: 103,
            title: '하계 계절학기',
            date: '2025-07-03',
            endDate: '2025-07-16',
            type: 'academic',
            description: '여름 계절학기',
            important: true
        },
        {
            id: 107,
            title: '진로박람회',
            date: '2025-07-10',
            endDate: '2025-07-11',
            type: 'event',
            description: '취업 진로박람회',
            important: true
        },
        {
            id: 114,
            title: '재학생(복학생) 수강신청 기간',
            date: '2025-08-11',
            endDate: '2025-08-19',
            type: 'registration',
            description: '2학기 수강신청',
            important: true
        },
        {
            id: 115,
            title: '광복절',
            date: '2025-08-15',
            type: 'holiday',
            description: '광복절 공휴일',
            important: false
        },
        {
            id: 117,
            title: '2024학년도 후기 학위수여',
            date: '2025-08-20',
            type: 'event',
            description: '후기 졸업식',
            important: true
        }
    ],
    '2': [ // 2학기
        {
            id: 201,
            title: '2025학년도 2학기 개강',
            date: '2025-09-01',
            type: 'academic',
            description: '2학기 수업 시작',
            important: true
        },
        {
            id: 205,
            title: '추석연휴',
            date: '2025-10-05',
            endDate: '2025-10-07',
            type: 'holiday',
            description: '추석 연휴 (휴강)',
            important: true
        },
        {
            id: 209,
            title: '제49회 양지대축제',
            date: '2025-10-16',
            endDate: '2025-10-17',
            type: 'event',
            description: '대학축제',
            important: true
        },
        {
            id: 211,
            title: '중간고사 평가 관찰기간',
            date: '2025-10-27',
            endDate: '2025-11-07',
            type: 'exam',
            description: '2학기 중간고사 기간',
            important: true
        },
        {
            id: 215,
            title: 'Gem-Festival',
            date: '2025-11-20',
            endDate: '2025-11-21',
            type: 'event',
            description: '보석축제',
            important: true
        },
        {
            id: 221,
            title: '기말고사 기간',
            date: '2025-12-16',
            endDate: '2025-12-22',
            type: 'exam',
            description: '2학기 기말고사',
            important: true
        },
        {
            id: 224,
            title: '동계방학 시작',
            date: '2025-12-23',
            type: 'holiday',
            description: '겨울방학 시작',
            important: true
        }
    ],
    'winter': [ // 겨울학기
        {
            id: 307,
            title: '동계 계절학기',
            date: '2026-01-06',
            endDate: '2026-01-19',
            type: 'academic',
            description: '겨울 계절학기',
            important: true
        },
        {
            id: 322,
            title: '제48회 학위수여식',
            date: '2026-02-11',
            type: 'event',
            description: '졸업식',
            important: true
        },
        {
            id: 324,
            title: '2026학년도 입학식',
            date: '2026-02-24',
            type: 'event',
            description: '2026학년도 입학식',
            important: true
        }
    ]
};

// 이벤트 타입 라벨
const eventTypeLabels = {
    academic: '학사일정',
    exam: '시험',
    holiday: '공휴일/방학',
    event: '행사',
    registration: '수강신청'
};

// 이벤트 색상 매핑
const eventColors = {
    academic: { 
        color: '#3b82f6', 
        bg: 'rgba(59, 130, 246, 0.2)', 
        border: 'rgba(59, 130, 246, 0.3)' 
    },
    exam: { 
        color: '#ef4444', 
        bg: 'rgba(239, 68, 68, 0.2)', 
        border: 'rgba(239, 68, 68, 0.3)' 
    },
    holiday: { 
        color: '#10b981', 
        bg: 'rgba(16, 185, 129, 0.2)', 
        border: 'rgba(16, 185, 129, 0.3)' 
    },
    event: { 
        color: '#8b5cf6', 
        bg: 'rgba(139, 92, 246, 0.2)', 
        border: 'rgba(139, 92, 246, 0.3)' 
    },
    registration: { 
        color: '#f59e0b', 
        bg: 'rgba(245, 158, 11, 0.2)', 
        border: 'rgba(245, 158, 11, 0.3)' 
    }
};

// 월 이름 배열
const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 특정 날짜로 이동 요청이 있는지 확인
    const navigateToDate = localStorage.getItem('navigateToCalendarDate');
    if (navigateToDate) {
        try {
            const targetDate = new Date(navigateToDate);
            if (!isNaN(targetDate.getTime())) {
                currentDate = targetDate;
            }
        } catch (error) {
            console.error('날짜 파싱 오류:', error);
        }
        localStorage.removeItem('navigateToCalendarDate');
    }
    
    // 학기 선택 이벤트 리스너
    document.getElementById('semesterSelect').addEventListener('change', changeSemester);
    
    // 필터 버튼 이벤트 리스너
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterEvents(btn.dataset.type));
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('eventDetailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailModal();
        }
    });
    
    // 초기 렌더링
    updateDisplay();
});

// 학기 변경
function changeSemester() {
    currentSemester = document.getElementById('semesterSelect').value;
    updateDisplay();
}

// 전체 화면 업데이트
function updateDisplay() {
    renderImportantCards();
    renderCalendar();
    renderEventsList();
}

// 중요 일정 카드 렌더링
function renderImportantCards() {
    const container = document.getElementById('importantCards');
    const events = academicSchedule[currentSemester] || [];
    const today = new Date();
    
    // 중요한 일정만 필터링
    const importantEvents = events.filter(event => event.important);
    
    // 미래와 과거 일정 분류
    const futureEvents = importantEvents.filter(event => new Date(event.date) >= today);
    const pastEvents = importantEvents.filter(event => new Date(event.date) < today);
    
    // 정렬
    futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 미래 일정 우선으로 합치기 (최대 6개)
    const displayEvents = [...futureEvents, ...pastEvents].slice(0, 6);
    
    container.innerHTML = '';
    
    displayEvents.forEach(event => {
        const isPast = new Date(event.date) < today;
        const colors = eventColors[event.type];
        
        const card = document.createElement('div');
        card.className = `important-card ${isPast ? 'past-event' : ''}`;
        card.style.setProperty('--card-color', colors.color);
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        card.innerHTML = `
            <div class="card-date">${dateText}</div>
            <div class="card-title-text">${event.title} ${isPast ? '(완료)' : ''}</div>
            <div class="card-description">${event.description}</div>
        `;
        
        card.addEventListener('click', () => showEventDetail(event));
        container.appendChild(card);
    });
}

// 캘린더 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 월 제목 업데이트
    document.getElementById('currentMonthTitle').textContent = 
        `${year}년 ${monthNames[month]}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    // 이전 달의 빈 날짜들
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty-cell';
        calendarBody.appendChild(emptyCell);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, new Date(year, month, day));
        calendarBody.appendChild(dayElement);
    }
    
    // 다음 달의 빈 날짜들로 6주 채우기
    const totalCells = calendarBody.children.length;
    const remainingCells = 42 - totalCells; // 6주 * 7일
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, new Date(year, month + 1, day), true);
        calendarBody.appendChild(dayElement);
    }
}

// 날짜 요소 생성
function createDayElement(dayNumber, date, isOtherMonth = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday(date)) {
        dayElement.classList.add('today');
    }
    
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
        dayElement.classList.add('sunday');
    } else if (dayOfWeek === 6) {
        dayElement.classList.add('saturday');
    }
    
    // 공휴일 체크
    const dateString = formatDate(date);
    const dayEvents = getEventsForDate(dateString);
    const hasHoliday = dayEvents.some(event => 
        event.type === 'holiday' && 
        ['신정', '설날', '삼일절', '현충일', '광복절', '추석', '개천절', '한글날', '성탄절'].some(holiday => 
            event.title.includes(holiday)
        )
    );
    
    // HTML 생성
    dayElement.innerHTML = `
        <div class="day-number ${hasHoliday ? 'holiday-date' : ''}">${dayNumber}</div>
        <div class="day-events" id="events-${dateString}"></div>
    `;
    
    // 이벤트 점 렌더링
    if (!isOtherMonth) {
        renderDayEvents(date, dayEvents);
    }
    
    return dayElement;
}

// 특정 날짜의 이벤트 점 렌더링
function renderDayEvents(date, events) {
    const dateString = formatDate(date);
    const eventsContainer = document.getElementById(`events-${dateString}`);
    
    if (!eventsContainer || !events.length) return;
    
    // 이벤트 타입별로 그룹핑하여 점 표시 (최대 5개)
    const eventTypes = [...new Set(events.map(e => e.type))];
    const maxDots = Math.min(eventTypes.length, 5);
    
    for (let i = 0; i < maxDots; i++) {
        const dot = document.createElement('div');
        dot.className = `event-dot ${eventTypes[i]}`;
        dot.title = events.filter(e => e.type === eventTypes[i]).map(e => e.title).join(', ');
        eventsContainer.appendChild(dot);
    }
}

// 일정 목록 렌더링
function renderEventsList() {
    const eventsList = document.getElementById('eventsList');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 월별 제목 업데이트
    document.getElementById('monthlyEventsTitle').textContent = 
        `${year}년 ${monthNames[month]} 학사일정`;
    
    // 모든 학기의 일정에서 현재 월에 해당하는 것만 필터링
    let allEvents = [];
    Object.keys(academicSchedule).forEach(semester => {
        allEvents = allEvents.concat(academicSchedule[semester]);
    });
    
    let monthEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
        const currentMonthStart = new Date(year, month, 1);
        const currentMonthEnd = new Date(year, month + 1, 0);
        
        return (eventDate <= currentMonthEnd && eventEndDate >= currentMonthStart);
    });
    
    // 중복 제거
    const uniqueEvents = [];
    const seen = new Set();
    
    monthEvents.forEach(event => {
        const key = `${event.title}-${event.date}-${event.endDate || ''}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueEvents.push(event);
        }
    });
    
    // 필터 적용
    let filteredEvents = uniqueEvents;
    if (currentFilter !== 'all') {
        filteredEvents = uniqueEvents.filter(event => event.type === currentFilter);
    }
    
    // 날짜순 정렬
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsList.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem;">해당 조건의 일정이 없습니다.</div>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        const colors = eventColors[event.type];
        eventItem.style.setProperty('--event-color', colors.color);
        eventItem.style.setProperty('--badge-bg', colors.bg);
        eventItem.style.setProperty('--badge-color', colors.color);
        eventItem.style.setProperty('--badge-border', colors.border);
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventItem.innerHTML = `
            <div class="event-header">
                <div class="event-title">${event.title}</div>
                <div class="event-date">${dateText}</div>
            </div>
            <div class="event-description">${event.description}</div>
            <div class="event-type-badge">
                ${eventTypeLabels[event.type]}
                ${event.important ? ' ★' : ''}
            </div>
        `;
        
        eventItem.addEventListener('click', () => showEventDetail(event));
        eventsList.appendChild(eventItem);
    });
}

// 일정 필터링
function filterEvents(type) {
    currentFilter = type;
    
    // 필터 버튼 상태 업데이트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    renderEventsList();
}

// 모달 관리
function showEventDetail(event) {
    document.getElementById('detailTitle').textContent = event.title;
    
    const dateText = event.endDate ? 
        `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
        formatDateKorean(event.date);
    
    document.getElementById('detailDate').textContent = dateText;
    
    if (event.endDate) {
        document.getElementById('detailPeriod').style.display = 'flex';
        const startDate = new Date(event.date);
        const endDate = new Date(event.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('detailPeriodText').textContent = `${diffDays}일간`;
    } else {
        document.getElementById('detailPeriod').style.display = 'none';
    }
    
    const typeElement = document.getElementById('detailType');
    const colors = eventColors[event.type];
    typeElement.textContent = eventTypeLabels[event.type];
    typeElement.style.setProperty('--badge-bg', colors.bg);
    typeElement.style.setProperty('--badge-color', colors.color);
    typeElement.style.setProperty('--badge-border', colors.border);
    
    document.getElementById('detailDescription').textContent = event.description;
    
    if (event.location) {
        document.getElementById('detailLocation').style.display = 'flex';
        document.getElementById('detailLocationText').textContent = event.location;
    } else {
        document.getElementById('detailLocation').style.display = 'none';
    }
    
    document.getElementById('eventDetailModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('eventDetailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 월 네비게이션
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateDisplay();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateDisplay();
}

function goToToday() {
    currentDate = new Date();
    updateDisplay();
}

// 유틸리티 함수들
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateKorean(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function getEventsForDate(dateString) {
    let allEvents = [];
    
    Object.keys(academicSchedule).forEach(semester => {
        allEvents = allEvents.concat(academicSchedule[semester]);
    });
    
    return allEvents.filter(event => {
        if (event.endDate) {
            return dateString >= event.date && dateString <= event.endDate;
        } else {
            return event.date === dateString;
        }
    });
}

// 키보드 이벤트 처리
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('eventDetailModal').style.display === 'block') {
            closeDetailModal();
        }
    }
    
    if (e.target === document.body) {
        if (e.key === 'ArrowLeft') {
            prevMonth();
        } else if (e.key === 'ArrowRight') {
            nextMonth();
        }
    }
});
// ==================================================================================
// 연성대학교 학사일정 시스템 JavaScript
// ==================================================================================

// 전역 변수
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';
let currentView = 'calendar';

// 뒤로 가기 함수 - 연성대학교 메인 시스템으로 돌아가기
function goBackToMain() {
    // 메인 시스템으로 돌아가기
    window.location.href = 'index.html';
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
            id: 3,
            title: '2025학년도 1학기 개강',
            date: '2025-03-04',
            type: 'academic',
            description: '1학기 수업 시작',
            important: true
        },
        {
            id: 4,
            title: '중간고사 평가 권장기간',
            date: '2025-04-21',
            endDate: '2025-05-02',
            type: 'exam',
            description: '1학기 중간고사 기간',
            important: true
        },
        {
            id: 5,
            title: '기말고사 권장기간',
            date: '2025-06-16',
            endDate: '2025-06-20',
            type: 'exam',
            description: '1학기 기말고사',
            important: true
        },
        {
            id: 6,
            title: '하계방학 시작',
            date: '2025-06-23',
            type: 'holiday',
            description: '여름방학 시작',
            important: true
        }
    ],
    'summer': [ // 여름학기
        {
            id: 101,
            title: '하계 계절학기',
            date: '2025-07-03',
            endDate: '2025-07-16',
            type: 'academic',
            description: '여름 계절학기',
            important: true
        },
        {
            id: 102,
            title: '진로박람회',
            date: '2025-07-10',
            endDate: '2025-07-11',
            type: 'event',
            description: '취업 진로박람회',
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
            id: 202,
            title: '추석연휴',
            date: '2025-10-05',
            endDate: '2025-10-07',
            type: 'holiday',
            description: '추석 연휴 (휴강)',
            important: true
        },
        {
            id: 203,
            title: '중간고사 평가 권장기간',
            date: '2025-10-27',
            endDate: '2025-11-07',
            type: 'exam',
            description: '2학기 중간고사 기간',
            important: true
        },
        {
            id: 204,
            title: '기말고사 기간',
            date: '2025-12-16',
            endDate: '2025-12-22',
            type: 'exam',
            description: '2학기 기말고사',
            important: true
        },
        {
            id: 205,
            title: '동계방학 시작',
            date: '2025-12-23',
            type: 'holiday',
            description: '겨울방학 시작',
            important: true
        }
    ],
    'winter': [ // 겨울학기
        {
            id: 301,
            title: '동계 계절학기',
            date: '2026-01-06',
            endDate: '2026-01-19',
            type: 'academic',
            description: '겨울 계절학기',
            important: true
        },
        {
            id: 302,
            title: '신정',
            date: '2026-01-01',
            type: 'holiday',
            description: '신정 공휴일',
            important: false
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

// 월 이름 배열
const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

// ==================================================================================
// 초기화 및 이벤트 핸들러
// ==================================================================================

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 메인 페이지에서 특정 날짜로 이동 요청이 있는지 확인
    const navigateToDate = localStorage.getItem('navigateToCalendarDate');
    if (navigateToDate) {
        try {
            const targetDate = new Date(navigateToDate);
            if (!isNaN(targetDate.getTime())) {
                currentDate = targetDate;
                console.log('특정 날짜로 캘린더 이동:', navigateToDate);
            }
        } catch (error) {
            console.error('날짜 파싱 오류:', error);
        }
        localStorage.removeItem('navigateToCalendarDate');
    }
    
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('eventDetailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailModal();
        }
    });

    // 검색 입력 시 엔터키 처리
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

// ==================================================================================
// 뷰 관리 함수들
// ==================================================================================

// 뷰 변경 (캘린더 <-> 리스트)
function changeView(view) {
    currentView = view;
    
    // 뷰 버튼 활성화 상태 변경
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // 뷰 표시/숨김
    if (view === 'calendar') {
        document.getElementById('calendarView').style.display = 'block';
        document.getElementById('listView').style.display = 'none';
    } else {
        document.getElementById('calendarView').style.display = 'none';
        document.getElementById('listView').style.display = 'block';
    }
}

// 학기 변경
function changeSemester() {
    currentSemester = document.getElementById('semesterSelect').value;
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
}

// ==================================================================================
// 캘린더 렌더링 함수들
// ==================================================================================

// 캘린더 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 현재 월 표시
    document.getElementById('currentMonth').textContent = 
        `${year}년 ${monthNames[month]}`;
    
    // 달력 생성
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    // 현재 달의 1일이 일요일이 아닌 경우, 빈 셀 추가
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
}

// 날짜 요소 생성
function createDayElement(dayNumber, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isToday(date)) {
        dayElement.classList.add('today');
    }
    
    // 주말 표시
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
        dayElement.classList.add('sunday');
    } else if (dayOfWeek === 6) {
        dayElement.classList.add('saturday');
    }
    
    dayElement.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        <div class="day-events" id="events-${formatDate(date)}"></div>
    `;
    
    // 해당 날짜의 이벤트 표시
    renderDayEvents(date);
    
    return dayElement;
}

// 특정 날짜의 이벤트 렌더링
function renderDayEvents(date) {
    const dateString = formatDate(date);
    const dayEvents = getEventsForDate(dateString);
    const eventsContainer = document.getElementById(`events-${dateString}`);
    
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '';
    
    dayEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${event.type}`;
        eventElement.textContent = event.title;
        eventElement.title = `${event.title}: ${event.description}`;
        
        // 이벤트 클릭 시 상세보기
        eventElement.addEventListener('click', function(e) {
            e.stopPropagation();
            showEventDetail(event);
        });
        
        eventsContainer.appendChild(eventElement);
    });
}

// ==================================================================================
// 이벤트 관리 함수들
// ==================================================================================

// 주요 일정 요약 카드 렌더링
function renderSummaryCards() {
    const summaryCards = document.getElementById('summaryCards');
    const events = academicSchedule[currentSemester] || [];
    const today = new Date();
    
    // 중요한 일정을 미래/과거로 분류
    const importantEvents = events.filter(event => event.important);
    const futureEvents = importantEvents.filter(event => new Date(event.date) >= today);
    const pastEvents = importantEvents.filter(event => new Date(event.date) < today);
    
    // 미래 일정을 날짜순 정렬, 과거 일정을 역순 정렬
    futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 미래 일정을 우선으로 배치
    const allEvents = [...futureEvents, ...pastEvents];
    
    summaryCards.innerHTML = '';
    
    if (allEvents.length === 0) {
        summaryCards.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">중요한 일정이 없습니다.</p>';
        return;
    }
    
    allEvents.slice(0, 5).forEach((event, index) => {
        const card = document.createElement('div');
        card.className = 'summary-card';
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        // 과거 일정 표시
        const isPast = new Date(event.date) < today;
        
        card.innerHTML = `
            <h4>${event.title} ${isPast ? '(완료)' : ''}</h4>
            <div class="date">${dateText}</div>
            <div class="description">${event.description}</div>
        `;
        
        card.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        summaryCards.appendChild(card);
    });
}

// 일정 목록 렌더링
function renderEventsList() {
    const eventsList = document.getElementById('eventsList');
    const monthlyTitle = document.getElementById('monthlyTitle');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthlyTitle.textContent = `${year}년 ${monthNames[month]} 학사일정`;
    
    // 모든 학기의 일정을 가져와서 현재 월에 해당하는 것만 필터링
    let allEvents = [];
    
    // 모든 학기의 일정을 합치기
    Object.keys(academicSchedule).forEach(semester => {
        allEvents = allEvents.concat(academicSchedule[semester]);
    });
    
    // 현재 월의 이벤트 필터링
    let monthEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
        const currentMonthStart = new Date(year, month, 1);
        const currentMonthEnd = new Date(year, month + 1, 0);
        
        return (eventDate <= currentMonthEnd && eventEndDate >= currentMonthStart);
    });
    
    // 필터 적용
    let filteredEvents = monthEvents;
    if (currentFilter !== 'all') {
        filteredEvents = monthEvents.filter(event => event.type === currentFilter);
    }
    
    // 날짜순 정렬
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsList.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 3rem;">해당 조건의 일정이 없습니다.</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventCard.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-date">${dateText}</div>
            </div>
            <div class="event-card-description">${event.description}</div>
            <span class="event-type ${event.type}">
                ${eventTypeLabels[event.type]}
                ${event.important ? ' ★' : ''}
            </span>
        `;
        
        eventCard.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        eventsList.appendChild(eventCard);
    });
}

// 일정 필터링
function filterEvents(type) {
    currentFilter = type;
    
    // 필터 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    renderEventsList();
}

// ==================================================================================
// 네비게이션 함수들
// ==================================================================================

// 월 네비게이션 함수들
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    renderEventsList();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    renderEventsList();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
    renderEventsList();
}

// ==================================================================================
// 검색 및 유틸리티 함수들
// ==================================================================================

// 검색 수행
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        renderEventsList();
        return;
    }
    
    // 모든 학기의 일정을 검색 대상으로 포함
    let allEvents = [];
    Object.keys(academicSchedule).forEach(semester => {
        allEvents = allEvents.concat(academicSchedule[semester]);
    });
    
    const filteredEvents = allEvents.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
    
    // 검색 결과를 리스트에 표시
    const eventsList = document.getElementById('eventsList');
    const monthlyTitle = document.getElementById('monthlyTitle');
    
    monthlyTitle.textContent = `"${query}" 검색 결과`;
    eventsList.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 3rem;">검색 결과가 없습니다.</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventCard.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-date">${dateText}</div>
            </div>
            <div class="event-card-description">${event.description}</div>
            <span class="event-type ${event.type}">
                ${eventTypeLabels[event.type]}
                ${event.important ? ' ★' : ''}
            </span>
        `;
        
        eventCard.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        eventsList.appendChild(eventCard);
    });
}

// 다가오는 일정 알림 (일주일 내)
function showUpcomingSchedule() {
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // 모든 학기의 일정을 확인
    let allEvents = [];
    Object.keys(academicSchedule).forEach(semester => {
        allEvents = allEvents.concat(academicSchedule[semester]);
    });
    
    const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= oneWeekLater;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingEvents.length > 0) {
        let message = '다가오는 일주일 일정:\n\n';
        upcomingEvents.forEach(event => {
            const daysUntil = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
            message += `• ${event.title}\n  날짜: ${formatDateKorean(event.date)}\n  ${daysUntil}일 후\n\n`;
        });
        alert(message);
    } else {
        alert('다가오는 일주일 내 예정된 학사일정이 없습니다.');
    }
}

// 학사일정 출력 기능
function printSchedule() {
    const printWindow = window.open('', '_blank');
    const semesterText = {
        '1': '1학기',
        'summer': '여름학기',
        '2': '2학기',
        'winter': '겨울학기'
    }[currentSemester];
    
    const events = academicSchedule[currentSemester] || [];
    
    let eventsList = '';
    events.forEach(event => {
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventsList += `
            <tr>
                <td>${dateText}</td>
                <td>${event.title}</td>
                <td>${eventTypeLabels[event.type]}</td>
                <td>${event.description}</td>
            </tr>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>2025학년도 ${semesterText} 학사일정</title>
            <style>
                body { 
                    font-family: 'Malgun Gothic', sans-serif; 
                    margin: 20px; 
                    font-size: 12px;
                }
                h1 { 
                    color: #3b82f6; 
                    border-bottom: 3px solid #8b5cf6; 
                    padding-bottom: 10px; 
                    text-align: center;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left;
                }
                th { 
                    background: #f8f9ff; 
                    font-weight: bold;
                }
                tr:nth-child(even) { 
                    background: #f9f9f9; 
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 10px;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <h1>연성대학교 2025학년도 ${semesterText} 학사일정</h1>
            <table>
                <thead>
                    <tr>
                        <th>날짜</th>
                        <th>일정명</th>
                        <th>구분</th>
                        <th>상세내용</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventsList}
                </tbody>
            </table>
            <div class="footer">
                <p>연성대학교 교무팀 | 문의: 031-441-0765</p>
                <p>출력일: ${new Date().toLocaleDateString('ko-KR')}</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// ==================================================================================
// 모달 관리 함수들
// ==================================================================================

// 모달 관리 함수들
function showEventDetail(event) {
    document.getElementById('detailTitle').textContent = event.title;
    
    const dateText = event.endDate ? 
        `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
        formatDateKorean(event.date);
    
    document.getElementById('detailDate').textContent = dateText;
    
    // 기간 정보가 있으면 표시
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
    
    document.getElementById('detailType').textContent = eventTypeLabels[event.type];
    document.getElementById('detailType').className = `event-type ${event.type}`;
    document.getElementById('detailDescription').textContent = event.description;
    
    // 장소 정보가 있으면 표시
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

// ==================================================================================
// 유틸리티 함수들
// ==================================================================================

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateKorean(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// 해당 날짜의 이벤트 가져오기
function getEventsForDate(dateString) {
    // 모든 학기의 일정을 확인
    let allEvents = [];
    
    // 모든 학기의 일정을 합치기
    Object.keys(academicSchedule).forEach(semester => {
        allEvents = allEvents.concat(academicSchedule[semester]);
    });
    
    const filteredEvents = allEvents.filter(event => {
        if (event.endDate) {
            // 기간이 있는 이벤트 - 해당 날짜가 시작일과 종료일 사이에 있는지 확인
            return dateString >= event.date && dateString <= event.endDate;
        } else {
            // 단일 날짜 이벤트
            return event.date === dateString;
        }
    });
    
    return filteredEvents;
}

// ==================================================================================
// 이벤트 리스너 및 키보드 단축키
// ==================================================================================

// 키보드 이벤트 처리
document.addEventListener('keydown', function(e) {
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
        if (document.getElementById('eventDetailModal').style.display === 'block') {
            closeDetailModal();
        }
    }
    
    // 화살표 키로 월 이동 (캘린더 뷰에서만)
    if (currentView === 'calendar' && e.target === document.body) {
        if (e.key === 'ArrowLeft') {
            prevMonth();
        } else if (e.key === 'ArrowRight') {
            nextMonth();
        }
    }
});

// 페이지 로드 애니메이션
window.addEventListener('load', function() {
    document.body.classList.add('fade-in');
    
    // 캘린더 애니메이션
    setTimeout(() => {
        const calendarDays = document.querySelectorAll('.calendar-day');
        calendarDays.forEach((day, index) => {
            day.style.opacity = '0';
            day.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                day.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                day.style.opacity = '1';
                day.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }, 200);
});

// ==================================================================================
// 초기화 완료
// ==================================================================================

console.log('연성대학교 학사일정 시스템이 성공적으로 로드되었습니다.');
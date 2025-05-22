// script.js

// 학사일정 데이터
const academicEvents = [
    // 2024-2025 겨울학기 및 신정
    { date: '2024-12-30', endDate: '2025-01-03', title: '성적열람 및 이의신청기간', type: 'academic' },
    { date: '2025-01-01', title: '신정', type: 'holiday' },
    { date: '2025-01-02', title: '업무개시일', type: 'academic' },
    { date: '2025-01-03', title: '시무식', type: 'academic' },
    
    // 2025년 1학기
    { date: '2025-01-06', endDate: '2025-01-17', title: '동계 계절학기', type: 'academic' },
    { date: '2025-01-07', title: '2학기 성적확정', type: 'academic' },
    { date: '2025-01-08', endDate: '2025-01-15', title: '전기 졸업우예 접수기간', type: 'registration' },
    { date: '2025-01-09', title: '교직원세미나', type: 'academic' },
    { date: '2025-01-10', title: '국고사업 성과보고 및 향후 워크숍', type: 'academic' },
    { date: '2025-01-17', endDate: '2025-01-20', title: '동계계절학기 성적입력', type: 'academic' },
    { date: '2025-01-21', endDate: '2025-01-22', title: '동계계절학기 성적열람 및 이의신청', type: 'academic' },
    { date: '2025-01-22', endDate: '2025-01-26', title: '2025학년도 정시 면접/실기고사', type: 'exam' },
    { date: '2025-01-27', title: '입시공휴일', type: 'holiday' },
    { date: '2025-01-28', endDate: '2025-01-30', title: '설날 연휴', type: 'holiday' },
    
    // 2025년 2월
    { date: '2025-02-03', title: '전기진급 및 졸업사정회', type: 'academic' },
    { date: '2025-02-03', endDate: '2025-02-07', title: '일반휴학·전과·재입학 접수기간', type: 'registration' },
    { date: '2025-02-06', title: '2025학년도 정시 합격자 발표', type: 'academic' },
    { date: '2025-02-10', endDate: '2025-02-12', title: '2025학년도 정시 합격자 등록기간', type: 'registration' },
    { date: '2025-02-10', endDate: '2025-02-14', title: '복학 접수기간', type: 'registration' },
    { date: '2025-02-10', endDate: '2025-02-18', title: '재학생(복학생) 수강신청 기간', type: 'registration' },
    { date: '2025-02-12', title: '제47회 학위수여식', type: 'academic' },
    { date: '2025-02-17', endDate: '2025-02-21', title: '1학기 재학생 등록기간', type: 'registration' },
    { date: '2025-02-21', title: '2025학년도 입학식', type: 'academic' },
    
    // 2025년 3월
    { date: '2025-03-01', title: '삼일절', type: 'holiday' },
    { date: '2025-03-03', title: '대체공휴일', type: 'holiday' },
    { date: '2025-03-04', title: '2025학년도 1학기 개강', type: 'academic' },
    { date: '2025-03-04', endDate: '2025-03-07', title: '신입생 수강신청기간', type: 'registration' },
    { date: '2025-03-10', endDate: '2025-03-14', title: '대학생활 적응력 향상 프로그램', type: 'academic' },
    { date: '2025-03-15', title: '개교 48주년 기념일', type: 'academic' },
    { date: '2025-03-28', title: '수업일수 1/4선', type: 'academic' },
    
    // 2025년 4-5월
    { date: '2025-04-21', endDate: '2025-05-02', title: '중간고사 평가 관찰기간', type: 'exam' },
    { date: '2025-04-24', title: '수업일수 2/4선', type: 'academic' },
    { date: '2025-05-01', title: '근로자의날(임시휴업)', type: 'holiday' },
    { date: '2025-05-05', title: '어린이날/부처님오신날', type: 'holiday' },
    { date: '2025-05-06', title: '대체공휴일', type: 'holiday' },
    { date: '2025-05-08', endDate: '2025-05-09', title: '제49회 양지체육대회(자율보강)', type: 'academic' },
    { date: '2025-05-26', title: '수업일수 3/4선', type: 'academic' },
    
    // 2025년 6-7월
    { date: '2025-06-06', title: '현충일', type: 'holiday' },
    { date: '2025-06-10', endDate: '2025-06-13', title: '공휴일 보강기간', type: 'academic' },
    { date: '2025-06-16', endDate: '2025-06-20', title: '기말고사 기간', type: 'exam' },
    { date: '2025-06-17', endDate: '2025-06-25', title: '성적입력 기간', type: 'academic' },
    { date: '2025-06-20', title: '수업일수 4/4선', type: 'academic' },
    { date: '2025-06-23', title: '하계방학 시작', type: 'vacation' },
    { date: '2025-06-23', endDate: '2025-07-01', title: '하계 종합학기', type: 'academic' },
    { date: '2025-06-27', endDate: '2025-07-02', title: '성적열람 및 이의신청기간', type: 'academic' },
    { date: '2025-07-03', endDate: '2025-07-16', title: '하계 계절학기', type: 'academic' },
    { date: '2025-07-03', title: '교직원세미나', type: 'academic' },
    { date: '2025-07-04', title: '1학기 성적확정/국고사업 성과보고 및 향후 워크숍', type: 'academic' },
    { date: '2025-07-07', endDate: '2025-07-11', title: '후기 졸업우예 접수기간', type: 'registration' },
    { date: '2025-07-10', endDate: '2025-07-11', title: '진로박람회', type: 'academic' },
    { date: '2025-07-16', endDate: '2025-07-17', title: '하계 계절학기 성적입력', type: 'academic' },
    { date: '2025-07-18', endDate: '2025-07-21', title: '하계 계절학기 성적열람 및 성적이의신청', type: 'academic' },
    { date: '2025-07-28', endDate: '2025-08-01', title: '하계방학 전체 휴무', type: 'vacation' },
    
    // 2025년 2학기
    { date: '2025-08-04', endDate: '2025-08-08', title: '일반휴학·전과·재입학 접수기간', type: 'registration' },
    { date: '2025-08-06', title: '후기 졸업사정회', type: 'academic' },
    { date: '2025-08-11', endDate: '2025-08-14', title: '복학 접수기간', type: 'registration' },
    { date: '2025-08-11', endDate: '2025-08-19', title: '재학생(복학생) 수강신청 기간', type: 'registration' },
    { date: '2025-08-15', title: '광복절', type: 'holiday' },
    { date: '2025-08-18', endDate: '2025-08-22', title: '2학기 재학생 등록기간', type: 'registration' },
    { date: '2025-08-20', title: '2024학년도 후기 학위수여', type: 'academic' },
    { date: '2025-09-01', title: '2025학년도 2학기 개강', type: 'academic' },
    { date: '2025-09-08', endDate: '2025-09-30', title: '2026학년도 수시1차 원서접수기간', type: 'registration' },
    { date: '2025-09-25', title: '수업일수 1/4선', type: 'academic' },
    
    // 2025년 10-11월
    { date: '2025-10-03', title: '개천절', type: 'holiday' },
    { date: '2025-10-05', endDate: '2025-10-07', title: '추석연휴', type: 'holiday' },
    { date: '2025-10-08', title: '대체공휴일', type: 'holiday' },
    { date: '2025-10-09', title: '한글날', type: 'holiday' },
    { date: '2025-10-10', title: '임시휴업', type: 'holiday' },
    { date: '2025-10-16', endDate: '2025-10-17', title: '제49회 양지대축제', type: 'academic' },
    { date: '2025-10-22', endDate: '2025-10-26', title: '2026학년도 수시1차 면접/실기고사', type: 'exam' },
    { date: '2025-10-27', endDate: '2025-11-07', title: '중간고사 평가 관찰기간', type: 'exam' },
    { date: '2025-10-30', title: '수업일수 2/4선', type: 'academic' },
    { date: '2025-11-04', title: '2026학년도 수시1차 합격자 발표', type: 'academic' },
    { date: '2025-11-07', endDate: '2025-11-21', title: '2026학년도 수시2차 원서접수기간', type: 'registration' },
    { date: '2025-11-20', endDate: '2025-11-21', title: 'Gem-Festival', type: 'academic' },
    { date: '2025-11-26', title: '수업일수 3/4선', type: 'academic' },
    { date: '2025-11-29', endDate: '2025-12-03', title: '2026학년도 수시2차 면접/실기고사', type: 'exam' },
    
    // 2025년 12월 - 2026년 1월
    { date: '2025-12-08', endDate: '2025-12-15', title: '공휴일 보강기간', type: 'academic' },
    { date: '2025-12-11', title: '2026학년도 수시2차 합격자 발표', type: 'academic' },
    { date: '2025-12-15', endDate: '2025-12-17', title: '2026학년도 수시 합격자 등록기간', type: 'registration' },
    { date: '2025-12-16', endDate: '2025-12-22', title: '기말고사 기간', type: 'exam' },
    { date: '2025-12-17', endDate: '2025-12-26', title: '성적입력 기간', type: 'academic' },
    { date: '2025-12-22', title: '수업일수 4/4선', type: 'academic' },
    { date: '2025-12-23', title: '동계방학 시작', type: 'vacation' },
    { date: '2025-12-23', endDate: '2026-01-02', title: '동계 종합학기', type: 'academic' },
    { date: '2025-12-25', title: '성탄절', type: 'holiday' },
    { date: '2025-12-29', endDate: '2026-01-14', title: '2026학년도 정시 원서접수기간', type: 'registration' },
    { date: '2025-12-30', endDate: '2026-01-05', title: '성적열람 및 이의신청기간', type: 'academic' },
    
    // 2026년
    { date: '2026-01-01', title: '신정', type: 'holiday' },
    { date: '2026-01-02', title: '2026년 업무개시일', type: 'academic' },
    { date: '2026-01-06', title: '시무식', type: 'academic' },
    { date: '2026-01-06', endDate: '2026-01-19', title: '동계 계절학기', type: 'academic' },
    { date: '2026-01-07', title: '2학기 성적확정', type: 'academic' },
    { date: '2026-01-08', endDate: '2026-01-15', title: '전기 졸업우예 접수기간', type: 'registration' },
    { date: '2026-01-08', title: '교직원세미나', type: 'academic' },
    { date: '2026-01-09', title: '국고사업 성과보고 및 향후 워크숍', type: 'academic' },
    { date: '2026-01-19', endDate: '2026-01-20', title: '동계계절학기 성적입력', type: 'academic' },
    { date: '2026-01-21', endDate: '2026-01-22', title: '동계계절학기 성적열람 및 이의신청', type: 'academic' },
    { date: '2026-01-21', endDate: '2026-01-26', title: '2026학년도 정시 면접/실기고사', type: 'exam' },
    { date: '2026-01-26', endDate: '2026-01-30', title: '일반휴학·전과·재입학 접수기간', type: 'registration' },
    { date: '2026-01-28', title: '전기진급 및 졸업사정회', type: 'academic' },
    { date: '2026-01-30', title: '2026학년도 정시 합격자 발표', type: 'academic' },
    
    // 2026년 2월
    { date: '2026-02-02', endDate: '2026-02-06', title: '복학 접수기간', type: 'registration' },
    { date: '2026-02-02', endDate: '2026-02-10', title: '재학생(복학생) 수강신청 기간', type: 'registration' },
    { date: '2026-02-03', endDate: '2026-02-05', title: '2026학년도 정시 합격자 등록기간', type: 'registration' },
    { date: '2026-02-09', endDate: '2026-02-13', title: '1학기 재학생 등록기간', type: 'registration' },
    { date: '2026-02-11', title: '제48회 학위수여식', type: 'academic' },
    { date: '2026-02-16', endDate: '2026-02-18', title: '설날 연휴', type: 'holiday' },
    { date: '2026-02-24', title: '2026학년도 입학식', type: 'academic' }
];

// 현재 날짜
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

// DOM 요소들
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const semesterFilter = document.getElementById('semesterFilter');
const searchInput = document.getElementById('searchInput');
const upcomingList = document.getElementById('upcomingList');
const eventDetails = document.getElementById('eventDetails');
const closeDetailsBtn = document.getElementById('closeDetails');

// 요일 배열
const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

// 월 이름 배열
const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

// 이벤트 리스너 등록
prevMonthBtn.addEventListener('click', () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    renderCalendar();
});

todayBtn.addEventListener('click', () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderCalendar();
});

semesterFilter.addEventListener('change', renderCalendar);
searchInput.addEventListener('input', renderCalendar);
closeDetailsBtn.addEventListener('click', () => {
    eventDetails.style.display = 'none';
});

// 날짜 문자열을 Date 객체로 변환
function parseDate(dateString) {
    return new Date(dateString + 'T00:00:00');
}

// 날짜 포맷팅
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 날짜가 범위 내에 있는지 확인
function isDateInRange(checkDate, startDate, endDate) {
    const check = parseDate(checkDate);
    const start = parseDate(startDate);
    const end = endDate ? parseDate(endDate) : start;
    
    return check >= start && check <= end;
}

// 특정 날짜의 이벤트 가져오기
function getEventsForDate(date) {
    const dateString = formatDate(date);
    const searchTerm = searchInput.value.toLowerCase();
    const semesterFilterValue = semesterFilter.value;
    
    return academicEvents.filter(event => {
        // 날짜 필터링
        const isInDateRange = isDateInRange(dateString, event.date, event.endDate);
        
        // 검색 필터링
        const matchesSearch = !searchTerm || event.title.toLowerCase().includes(searchTerm);
        
        // 학기 필터링
        let matchesSemester = true;
        if (semesterFilterValue !== 'all') {
            const eventDate = parseDate(event.date);
            const eventYear = eventDate.getFullYear();
            const eventMonth = eventDate.getMonth();
            
            switch (semesterFilterValue) {
                case '2025-1':
                    matchesSemester = eventYear === 2025 && eventMonth >= 2 && eventMonth <= 6;
                    break;
                case '2025-summer':
                    matchesSemester = eventYear === 2025 && eventMonth >= 6 && eventMonth <= 8;
                    break;
                case '2025-2':
                    matchesSemester = eventYear === 2025 && eventMonth >= 8 && eventMonth <= 11;
                    break;
                case '2026-winter':
                    matchesSemester = (eventYear === 2025 && eventMonth === 11) || 
                                     (eventYear === 2026 && eventMonth <= 1);
                    break;
                case '2026-1':
                    matchesSemester = eventYear === 2026 && eventMonth >= 1 && eventMonth <= 5;
                    break;
            }
        }
        
        return isInDateRange && matchesSearch && matchesSemester;
    });
}

// 캘린더 렌더링
function renderCalendar() {
    // 현재 월 표시 업데이트
    currentMonthElement.textContent = `${currentYear}년 ${monthNames[currentMonth]}`;
    
    // 캘린더 그리드 초기화
    calendarGrid.innerHTML = '';
    
    // 요일 헤더 추가
    dayNames.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.className = 'calendar-header';
        headerCell.textContent = day;
        calendarGrid.appendChild(headerCell);
    });
    
    // 현재 월의 첫째 날과 마지막 날
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 캘린더 날짜 생성 (6주 = 42일)
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        // 다른 월의 날짜 스타일링
        if (date.getMonth() !== currentMonth) {
            dayCell.classList.add('other-month');
        }
        
        // 오늘 날짜 표시
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayCell.classList.add('today');
        }
        
        // 날짜 번호
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayCell.appendChild(dayNumber);
        
        // 해당 날짜의 이벤트 가져오기
        const dayEvents = getEventsForDate(date);
        
        if (dayEvents.length > 0) {
            dayCell.classList.add('has-events');
            
            // 이벤트 표시 (최대 3개)
            dayEvents.slice(0, 3).forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-item ${event.type}`;
                eventElement.textContent = event.title;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                dayCell.appendChild(eventElement);
            });
            
            // 더 많은 이벤트가 있는 경우
            if (dayEvents.length > 3) {
                const moreElement = document.createElement('div');
                moreElement.className = 'event-item';
                moreElement.textContent = `+${dayEvents.length - 3}개 더`;
                moreElement.style.background = '#666';
                dayCell.appendChild(moreElement);
            }
        }
        
        calendarGrid.appendChild(dayCell);
    }
    
    // 다가오는 일정 업데이트
    updateUpcomingEvents();
}

// 다가오는 일정 업데이트
function updateUpcomingEvents() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const upcomingEvents = academicEvents.filter(event => {
        const eventDate = parseDate(event.date);
        return eventDate >= today && eventDate <= nextMonth;
    }).sort((a, b) => parseDate(a.date) - parseDate(b.date));
    
    upcomingList.innerHTML = '';
    
    if (upcomingEvents.length === 0) {
        upcomingList.innerHTML = '<p style="color: #666; text-align: center;">다가오는 일정이 없습니다.</p>';
        return;
    }
    
    upcomingEvents.slice(0, 5).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'upcoming-item';
        eventElement.addEventListener('click', () => showEventDetails(event));
        
        const eventDate = parseDate(event.date);
        const dateString = `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일`;
        
        eventElement.innerHTML = `
            <div class="upcoming-date">${dateString}</div>
            <div class="upcoming-title">${event.title}</div>
        `;
        
        upcomingList.appendChild(eventElement);
    });
}

// 이벤트 상세 정보 표시
function showEventDetails(event) {
    const eventTitle = document.getElementById('eventTitle');
    const eventDate = document.getElementById('eventDate');
    const eventDescription = document.getElementById('eventDescription');
    
    eventTitle.textContent = event.title;
    
    const startDate = parseDate(event.date);
    let dateText = `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일`;
    
    if (event.endDate) {
        const endDate = parseDate(event.endDate);
        dateText += ` ~ ${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
    }
    
    eventDate.textContent = dateText;
    
    // 이벤트 타입에 따른 설명
    const typeDescriptions = {
        'academic': '학사 일정',
        'exam': '시험 기간',
        'vacation': '방학 기간',
        'holiday': '공휴일',
        'registration': '등록/수강신청'
    };
    
    eventDescription.textContent = `분류: ${typeDescriptions[event.type] || '기타'}`;
    
    eventDetails.style.display = 'block';
}

// 페이지 로드 시 캘린더 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        eventDetails.style.display = 'none';
    } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        prevMonthBtn.click();
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        nextMonthBtn.click();
    } else if (e.key === 'Home' && e.ctrlKey) {
        todayBtn.click();
    }
});

// 반응형 디자인을 위한 윈도우 리사이즈 이벤트
window.addEventListener('resize', () => {
    // 필요한 경우 캘린더 다시 렌더링
    renderCalendar();
});
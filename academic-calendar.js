// 학사일정 데이터
const academicEvents = {
    2025: {
        1: [
            { date: 1, title: '신정', type: '공휴일', category: 'holiday', isHoliday: true },
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
            { date: 1, title: '삼일절', type: '공휴일', category: 'holiday', isHoliday: true },
            { date: 3, title: '대체공휴일', type: '삼일절 대체', category: 'holiday', isHoliday: true },
            { date: 4, title: '2025학년도 1학기 개강', type: '학기 시작', category: 'academic', isImportant: true },
            { date: 4, title: '신입생 수강신청기간', type: '3월 4일 ~ 3월 7일', category: 'registration', endDate: 7 }
        ],
        4: [
            { date: 21, title: '중간고사 평가 관찰기간', type: '4월 21일 ~ 5월 2일', category: 'exam', endDate: { month: 5, date: 2 }, isImportant: true },
            { date: 24, title: '수업일수 2/4선', type: '학사 일정', category: 'academic' }
        ]
    }
};

// 현재 상태
let currentYear = 2025;
let currentSemester = 1;
let currentView = 'list';
let currentFilter = 'all';
let currentCalendarMonth = new Date().getMonth() + 1;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeViewToggle();
    updateCalendarView();
    
    // 오늘 날짜로 스크롤
    const today = new Date();
    if (today.getFullYear() === 2025) {
        setTimeout(() => {
            scrollToCurrentMonth(today.getMonth() + 1);
        }, 100);
    }
});

// 뒤로가기
function goBack() {
    // 이전 페이지 URL이 저장되어 있다면 그곳으로, 없으면 메인 페이지로
    const previousPage = localStorage.getItem('previousPage');
    if (previousPage) {
        localStorage.removeItem('previousPage');
        window.location.href = previousPage;
    } else {
        window.location.href = 'index.html';
    }
}

// 오늘로 이동
function goToToday() {
    const today = new Date();
    if (currentView === 'list') {
        scrollToCurrentMonth(today.getMonth() + 1);
    } else {
        currentCalendarMonth = today.getMonth() + 1;
        updateCalendarView();
    }
}

// 기간 변경
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
    updateCalendarView();
}

// 기간 표시 업데이트
function updatePeriodDisplay() {
    document.querySelector('.year').textContent = `${currentYear}학년도`;
    document.querySelector('.semester').textContent = `${currentSemester}학기`;
}

// 필터 초기화
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
        });
    });
}

// 뷰 토글 초기화
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

// 뷰 전환
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

// 필터 적용
function applyFilter() {
    const eventItems = document.querySelectorAll('.event-item');
    
    eventItems.forEach(item => {
        const badge = item.querySelector('.event-badge');
        const category = badge.className.split(' ').pop();
        
        if (currentFilter === 'all' || category === currentFilter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    // 월별 이벤트 수 업데이트
    updateEventCounts();
}

// 이벤트 수 업데이트
function updateEventCounts() {
    const monthSections = document.querySelectorAll('.month-section');
    
    monthSections.forEach(section => {
        const visibleEvents = section.querySelectorAll('.event-item[style="display: flex"], .event-item:not([style])');
        const hiddenEvents = section.querySelectorAll('.event-item[style="display: none"]');
        const totalVisible = visibleEvents.length - hiddenEvents.length;
        
        const countElement = section.querySelector('.event-count');
        if (countElement) {
            countElement.textContent = `${totalVisible}개 일정`;
        }
    });
}

// 현재 월로 스크롤
function scrollToCurrentMonth(month) {
    const monthSections = document.querySelectorAll('.month-section');
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const targetMonthName = monthNames[month - 1];
    
    monthSections.forEach(section => {
        const monthTitle = section.querySelector('.month-title');
        if (monthTitle && monthTitle.textContent === targetMonthName) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// 달력 뷰 업데이트
function updateCalendarView() {
    updateCalendarHeader();
    generateCalendarDates();
}

// 달력 헤더 업데이트
function updateCalendarHeader() {
    const monthElement = document.querySelector('.calendar-month');
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    monthElement.textContent = `${currentYear}년 ${monthNames[currentCalendarMonth - 1]}`;
}

// 달력 날짜 생성
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

// 특정 날짜의 이벤트 가져오기
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
            const endDate = new Date(year, event.endDate.month - 1, event.endDate.date);
            const currentDate = new Date(year, month - 1, day);
            
            return currentDate >= startDate && currentDate <= endDate;
        }
        
        return false;
    });
}

// 달력 월 변경
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
}

// 이벤트 모달 표시
function showEventModal(date, events) {
    if (events.length === 0) return;
    
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-date');
    const modalEvents = document.getElementById('modal-events');
    
    // 날짜 포맷팅
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
    };
    modalTitle.textContent = date.toLocaleDateString('ko-KR', options);
    
    // 이벤트 목록 생성
    modalEvents.innerHTML = events.map(event => `
        <div class="modal-event">
            <div class="modal-event-time">전일</div>
            <div class="modal-event-content">
                <div class="modal-event-title">${event.title}</div>
                <div class="modal-event-type">${event.type}</div>
            </div>
            <div class="event-badge ${event.category}">${getCategoryName(event.category)}</div>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
}

// 이벤트 모달 닫기
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    modal.classList.add('hidden');
}

// 카테고리 이름 가져오기
function getCategoryName(category) {
    const categoryNames = {
        'holiday': '휴일',
        'academic': '학사',
        'exam': '시험',
        'registration': '등록',
        'grade': '성적',
        'graduation': '졸업',
        'event': '행사',
        'admin': '행정',
        'admission': '입시',
        'ceremony': '입학',
        'scholarship': '장학'
    };
    
    return categoryNames[category] || '기타';
}

// 이벤트 클릭 처리
function handleEventClick(eventElement) {
    const eventTitle = eventElement.querySelector('.event-title').textContent;
    const eventType = eventElement.querySelector('.event-type').textContent;
    const eventBadge = eventElement.querySelector('.event-badge').textContent;
    
    // 이벤트 상세 정보 표시 (알림 또는 모달)
    alert(`${eventTitle}\n\n${eventType}\n카테고리: ${eventBadge}`);
}

// 메인 페이지에서 사용할 학사일정 데이터 가져오기 함수
function getUpcomingEvents(limit = 3) {
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
                        fullDate: eventDate,
                        dateString: `${month}월 ${event.date}일`,
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
}

// 필터별 카테고리 매핑
const filterCategoryMap = {
    'exam': ['exam'],
    'registration': ['registration'],
    'scholarship': ['scholarship'],
    'event': ['event', 'ceremony'],
    'holiday': ['holiday']
};

// 스크롤 이벤트 처리 (헤더 고정)
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.header');
    
    if (currentScroll > lastScrollTop && currentScroll > 100) {
        // 스크롤 다운
        header.style.transform = 'translateY(-100%)';
    } else {
        // 스크롤 업
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// 검색 기능 (향후 확장용)
function searchEvents(query) {
    const allEvents = [];
    
    // 모든 이벤트 수집
    Object.keys(academicEvents).forEach(year => {
        Object.keys(academicEvents[year]).forEach(month => {
            academicEvents[year][month].forEach(event => {
                if (event.title.toLowerCase().includes(query.toLowerCase()) ||
                    event.type.toLowerCase().includes(query.toLowerCase())) {
                    allEvents.push({
                        ...event,
                        year: parseInt(year),
                        month: parseInt(month)
                    });
                }
            });
        });
    });
    
    return allEvents;
}

// 즐겨찾기 기능 (로컬 스토리지 활용)
function toggleFavorite(eventId) {
    const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    const index = favorites.indexOf(eventId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(eventId);
    }
    
    localStorage.setItem('favoriteEvents', JSON.stringify(favorites));
    updateFavoriteDisplay();
}

function updateFavoriteDisplay() {
    const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    
    document.querySelectorAll('.event-item').forEach((item, index) => {
        const favoriteBtn = item.querySelector('.favorite-btn');
        if (favoriteBtn) {
            if (favorites.includes(`event_${index}`)) {
                favoriteBtn.classList.add('active');
                favoriteBtn.textContent = '★';
            } else {
                favoriteBtn.classList.remove('active');
                favoriteBtn.textContent = '☆';
            }
        }
    });
}

// 모바일 터치 이벤트 처리
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
                // 왼쪽으로 스와이프 - 다음 달
                changeMonth(1);
            } else {
                // 오른쪽으로 스와이프 - 이전 달
                changeMonth(-1);
            }
        }
    }
}

// 페이지 가시성 변경 시 업데이트
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentView === 'calendar') {
        updateCalendarView();
    }
});

// 윈도우 리사이즈 시 처리
window.addEventListener('resize', function() {
    if (currentView === 'calendar') {
        setTimeout(updateCalendarView, 100);
    }
});

// 전역 함수로 내보내기 (메인 페이지에서 사용)
window.getUpcomingEvents = getUpcomingEvents;
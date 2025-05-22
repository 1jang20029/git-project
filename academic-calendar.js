// 전역 변수
let currentDate = new Date();
let currentEvent = null;
let editingEventId = null;

// 기본 학사 일정 데이터
let events = [
    {
        id: 1,
        title: '신입생 오리엔테이션',
        date: '2025-03-02',
        type: 'orientation',
        description: '2025학년도 신입생 오리엔테이션'
    },
    {
        id: 2,
        title: '개강',
        date: '2025-03-03',
        type: 'semester',
        description: '2025학년도 1학기 개강'
    },
    {
        id: 3,
        title: '중간고사',
        date: '2025-04-15',
        type: 'exam',
        description: '2025학년도 1학기 중간고사'
    },
    {
        id: 4,
        title: '어린이날',
        date: '2025-05-05',
        type: 'holiday',
        description: '어린이날 공휴일'
    },
    {
        id: 5,
        title: '기말고사',
        date: '2025-06-10',
        type: 'exam',
        description: '2025학년도 1학기 기말고사'
    },
    {
        id: 6,
        title: '여름방학',
        date: '2025-06-20',
        type: 'semester',
        description: '2025학년도 1학기 종료 및 여름방학 시작'
    }
];

// 이벤트 타입 라벨
const eventTypeLabels = {
    orientation: '오리엔테이션',
    semester: '학기',
    exam: '시험',
    holiday: '공휴일',
    general: '일반'
};

// 월 이름 배열
const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    renderEventsList();
    
    // 폼 제출 이벤트 리스너
    document.getElementById('eventForm').addEventListener('submit', handleFormSubmit);
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('eventModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    document.getElementById('eventDetailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailModal();
        }
    });
});

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
    
    // 이전 달의 빈 날짜들
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayElement = createDayElement(
            prevMonthDays - i, 
            new Date(year, month - 1, prevMonthDays - i), 
            true
        );
        calendarBody.appendChild(dayElement);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(
            day, 
            new Date(year, month, day), 
            false
        );
        calendarBody.appendChild(dayElement);
    }
    
    // 다음 달의 빈 날짜들
    const totalCells = calendarBody.children.length;
    const remainingCells = 42 - totalCells; // 6주 * 7일
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(
            day, 
            new Date(year, month + 1, day), 
            true
        );
        calendarBody.appendChild(dayElement);
    }
}

// 날짜 요소 생성
function createDayElement(dayNumber, date, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday(date)) {
        dayElement.classList.add('today');
    }
    
    dayElement.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        <div class="day-events" id="events-${formatDate(date)}"></div>
    `;
    
    // 날짜 클릭 이벤트
    dayElement.addEventListener('click', function() {
        openAddModal(formatDate(date));
    });
    
    // 해당 날짜의 이벤트 표시
    if (!isOtherMonth) {
        renderDayEvents(date);
    }
    
    return dayElement;
}

// 특정 날짜의 이벤트 렌더링
function renderDayEvents(date) {
    const dateString = formatDate(date);
    const dayEvents = getEventsForDate(dateString);
    const eventsContainer = document.getElementById(`events-${dateString}`);
    
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-item ${event.type}`;
            eventElement.textContent = event.title;
            eventElement.title = event.description;
            
            // 이벤트 클릭 시 상세보기
            eventElement.addEventListener('click', function(e) {
                e.stopPropagation();
                showEventDetail(event);
            });
            
            eventsContainer.appendChild(eventElement);
        });
    }
}

// 일정 목록 렌더링
function renderEventsList() {
    const eventsList = document.getElementById('eventsList');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 현재 월의 이벤트만 필터링
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    // 날짜순 정렬
    monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsList.innerHTML = '';
    
    if (monthEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">이번 달에 등록된 일정이 없습니다.</p>';
        return;
    }
    
    monthEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;
        eventCard.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-date">${formatDateKorean(event.date)}</div>
            </div>
            <div class="event-card-description">${event.description}</div>
            <span class="event-type ${event.type}">${eventTypeLabels[event.type]}</span>
        `;
        
        eventCard.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        eventsList.appendChild(eventCard);
    });
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
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function getEventsForDate(dateString) {
    return events.filter(event => event.date === dateString);
}

function generateId() {
    return Math.max(...events.map(e => e.id), 0) + 1;
}

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

// 모달 관리 함수들
function openAddModal(selectedDate = '') {
    editingEventId = null;
    document.getElementById('modalTitle').textContent = '일정 추가';
    document.getElementById('eventForm').reset();
    
    if (selectedDate) {
        document.getElementById('eventDate').value = selectedDate;
    }
    
    document.getElementById('eventModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openEditModal(event) {
    editingEventId = event.id;
    document.getElementById('modalTitle').textContent = '일정 편집';
    
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventDescription').value = event.description;
    
    document.getElementById('eventModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    editingEventId = null;
}

function showEventDetail(event) {
    currentEvent = event;
    document.getElementById('detailTitle').textContent = event.title;
    document.getElementById('detailDate').textContent = formatDateKorean(event.date);
    document.getElementById('detailType').textContent = eventTypeLabels[event.type];
    document.getElementById('detailType').className = `event-type ${event.type}`;
    document.getElementById('detailDescription').textContent = event.description;
    
    document.getElementById('eventDetailModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('eventDetailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEvent = null;
}

function editCurrentEvent() {
    if (currentEvent) {
        closeDetailModal();
        openEditModal(currentEvent);
    }
}

function deleteCurrentEvent() {
    if (currentEvent && confirm('정말로 이 일정을 삭제하시겠습니까?')) {
        deleteEvent(currentEvent.id);
        closeDetailModal();
    }
}

// 이벤트 CRUD 함수들
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = {
        title: formData.get('title').trim(),
        date: formData.get('date'),
        type: formData.get('type'),
        description: formData.get('description').trim()
    };
    
    // 유효성 검사
    if (!eventData.title) {
        alert('일정 제목을 입력해주세요.');
        return;
    }
    
    if (!eventData.date) {
        alert('날짜를 선택해주세요.');
        return;
    }
    
    if (editingEventId) {
        updateEvent(editingEventId, eventData);
    } else {
        addEvent(eventData);
    }
    
    closeModal();
}

function addEvent(eventData) {
    const newEvent = {
        id: generateId(),
        ...eventData
    };
    
    events.push(newEvent);
    updateCalendarAndList();
    
    // 성공 메시지
    showNotification('일정이 추가되었습니다.', 'success');
}

function updateEvent(id, eventData) {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
        events[eventIndex] = { id, ...eventData };
        updateCalendarAndList();
        
        // 성공 메시지
        showNotification('일정이 수정되었습니다.', 'success');
    }
}

function deleteEvent(id) {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
        events.splice(eventIndex, 1);
        updateCalendarAndList();
        
        // 성공 메시지
        showNotification('일정이 삭제되었습니다.', 'success');
    }
}

function updateCalendarAndList() {
    renderCalendar();
    renderEventsList();
}

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    // 기존 알림이 있다면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 키보드 이벤트 처리
document.addEventListener('keydown', function(e) {
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
        if (document.getElementById('eventModal').style.display === 'block') {
            closeModal();
        }
        if (document.getElementById('eventDetailModal').style.display === 'block') {
            closeDetailModal();
        }
    }
    
    // 화살표 키로 월 이동
    if (e.target === document.body) {
        if (e.key === 'ArrowLeft') {
            prevMonth();
        } else if (e.key === 'ArrowRight') {
            nextMonth();
        }
    }
});

// 로컬 스토리지에 데이터 저장/로드
function saveToLocalStorage() {
    localStorage.setItem('academicCalendarEvents', JSON.stringify(events));
}

function loadFromLocalStorage() {
    const savedEvents = localStorage.getItem('academicCalendarEvents');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }
}

// 페이지 언로드 시 데이터 저장
window.addEventListener('beforeunload', saveToLocalStorage);

// 페이지 로드 시 저장된 데이터 불러오기
window.addEventListener('load', function() {
    loadFromLocalStorage();
    updateCalendarAndList();
});

// 데이터 내보내기/가져오기
function exportEvents() {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic_calendar_${formatDate(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('일정 데이터가 내보내기되었습니다.', 'success');
}

function importEvents(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedEvents = JSON.parse(e.target.result);
            if (Array.isArray(importedEvents)) {
                if (confirm('기존 일정을 모두 삭제하고 새 데이터로 교체하시겠습니까?')) {
                    events = importedEvents;
                    updateCalendarAndList();
                    saveToLocalStorage();
                    showNotification('일정 데이터가 성공적으로 가져와졌습니다.', 'success');
                }
            } else {
                throw new Error('올바르지 않은 파일 형식입니다.');
            }
        } catch (error) {
            showNotification('파일을 읽는 중 오류가 발생했습니다.', 'error');
        }
    };
    reader.readAsText(file);
}

// 오늘 날짜로 이동
function goToToday() {
    currentDate = new Date();
    renderCalendar();
    renderEventsList();
    showNotification('오늘 날짜로 이동했습니다.', 'info');
}

// 검색 기능
function searchEvents(query) {
    if (!query.trim()) {
        updateCalendarAndList();
        return;
    }
    
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
    
    // 검색 결과를 캘린더에 표시
    const calendarBody = document.getElementById('calendarBody');
    const dayElements = calendarBody.querySelectorAll('.calendar-day');
    
    dayElements.forEach(dayElement => {
        const eventsContainer = dayElement.querySelector('.day-events');
        if (eventsContainer) {
            eventsContainer.innerHTML = '';
        }
    });
    
    filteredEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const dateString = formatDate(eventDate);
        const eventsContainer = document.getElementById(`events-${dateString}`);
        
        if (eventsContainer) {
            const eventElement = document.createElement('div');
            eventElement.className = `event-item ${event.type}`;
            eventElement.textContent = event.title;
            eventElement.title = event.description;
            
            eventElement.addEventListener('click', function(e) {
                e.stopPropagation();
                showEventDetail(event);
            });
            
            eventsContainer.appendChild(eventElement);
        }
    });
    
    showNotification(`${filteredEvents.length}개의 일정을 찾았습니다.`, 'info');
}

// 인쇄 기능
function printCalendar() {
    const printWindow = window.open('', '_blank');
    const year = currentDate.getFullYear();
    const month = monthNames[currentDate.getMonth()];
    
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === currentDate.getMonth();
    });
    
    let eventsList = '';
    monthEvents.forEach(event => {
        eventsList += `
            <li>
                <strong>${event.title}</strong> - ${formatDateKorean(event.date)}
                <br><small>${event.description}</small>
            </li>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${year}년 ${month} 학사일정</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                ul { list-style-type: none; padding: 0; }
                li { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <h1>${year}년 ${month} 학사일정</h1>
            <ul>${eventsList}</ul>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}
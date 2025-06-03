// =============================================================================
// academic-calendar.js
// ──────────────────────────────────────────────────────────────────────────────
// 연성대학교 학사일정 페이지 (Node.js + MySQL 연동)
// =============================================================================

// 전역 변수
let currentDate = new Date();
let currentSemester = 'spring';
let currentFilter = 'all';
let academicSchedule = {};
let eventTypeLabels = {};
let monthNames = [];
let isLoading = false;

// API 기본 설정
const API_BASE_URL = '/api/v1';
const API_ENDPOINTS = {
    config: `${API_BASE_URL}/calendar/config`,
    schedule: `${API_BASE_URL}/calendar/schedule`,
    scheduleByMonth: `${API_BASE_URL}/calendar/schedule/month`,
    scheduleBySemester: `${API_BASE_URL}/calendar/schedule/semester`,
    search: `${API_BASE_URL}/calendar/search`,
    eventDetail: `${API_BASE_URL}/calendar/event`
};

// =============================================================================
// API 통신 함수들
// =============================================================================

// HTTP 요청 헬퍼 함수
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    try {
        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'API 요청 실패');
        }

        return result.data;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 설정 데이터 로드
async function loadConfiguration() {
    try {
        const config = await apiRequest(API_ENDPOINTS.config);
        
        monthNames = config.month_names || [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        
        eventTypeLabels = config.event_type_labels || {
            academic: '학사일정',
            exam: '시험',
            holiday: '공휴일/방학',
            event: '행사',
            registration: '수강신청'
        };
        
        console.log('설정 로드 완료:', config);
        return config;
        
    } catch (error) {
        console.error('설정 로드 오류:', error);
        showErrorMessage('설정을 불러오는데 실패했습니다.');
        setDefaultConfiguration();
        throw error;
    }
}

// 기본 설정값 설정
function setDefaultConfiguration() {
    monthNames = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    eventTypeLabels = {
        academic: '학사일정',
        exam: '시험',
        holiday: '공휴일/방학',
        event: '행사',
        registration: '수강신청'
    };
}

// 전체 학사일정 데이터 로드
async function loadAcademicSchedule() {
    try {
        showLoadingIndicator('학사일정 로딩중...');
        
        const scheduleData = await apiRequest(API_ENDPOINTS.schedule);
        academicSchedule = groupScheduleBySemester(scheduleData);
        
        hideLoadingIndicator();
        console.log('학사일정 로드 완료:', academicSchedule);
        return academicSchedule;
        
    } catch (error) {
        console.error('학사일정 로드 오류:', error);
        hideLoadingIndicator();
        showErrorMessage('학사일정을 불러오는데 실패했습니다.');
        
        academicSchedule = {
            spring: [],
            summer: [],
            fall: [],
            winter: []
        };
        
        throw error;
    }
}

// 특정 학기 데이터 로드
async function loadSemesterData(semester) {
    try {
        showLoadingIndicator(`${getSemesterName(semester)} 데이터 로딩중...`);
        
        const semesterData = await apiRequest(API_ENDPOINTS.scheduleBySemester, {
            method: 'POST',
            body: JSON.stringify({ semester })
        });
        
        const formattedData = semesterData.map(formatEventData);
        
        if (!academicSchedule[semester]) {
            academicSchedule[semester] = [];
        }
        academicSchedule[semester] = formattedData;
        
        hideLoadingIndicator();
        return formattedData;
        
    } catch (error) {
        console.error('학기 데이터 로드 오류:', error);
        hideLoadingIndicator();
        showErrorMessage(`${getSemesterName(semester)} 데이터를 불러오는데 실패했습니다.`);
        throw error;
    }
}

// 월별 데이터 로드
async function loadMonthlyData(year, month) {
    try {
        const monthlyData = await apiRequest(API_ENDPOINTS.scheduleByMonth, {
            method: 'POST',
            body: JSON.stringify({ year, month: month + 1 })
        });
        
        return monthlyData.map(formatEventData);
        
    } catch (error) {
        console.error('월별 데이터 로드 오류:', error);
        showErrorMessage('해당 월의 일정을 불러오는데 실패했습니다.');
        return [];
    }
}

// 검색 기능
async function searchSchedule(query) {
    if (!query || !query.trim()) {
        renderEventsList();
        return;
    }
    
    try {
        showLoadingIndicator('검색중...');
        
        const searchResults = await apiRequest(API_ENDPOINTS.search, {
            method: 'POST',
            body: JSON.stringify({
                query: query.trim(),
                semester: currentSemester,
                limit: 50
            })
        });
        
        const formattedResults = searchResults.map(formatEventData);
        renderSearchResults(formattedResults);
        
        hideLoadingIndicator();
        
    } catch (error) {
        console.error('검색 오류:', error);
        hideLoadingIndicator();
        showErrorMessage('검색 중 오류가 발생했습니다.');
        renderEventsList();
    }
}

// =============================================================================
// 데이터 처리 함수들
// =============================================================================

// MySQL 데이터를 프론트엔드 형식으로 변환
function formatEventData(event) {
    return {
        id: event.id,
        title: event.title || '',
        date: event.start_date || event.date,
        endDate: event.end_date || null,
        type: event.event_type || event.type || 'academic',
        description: event.description || '',
        important: Boolean(event.is_important || event.important),
        location: event.location || null,
        semester: event.semester || 'spring',
        createdAt: event.created_at,
        updatedAt: event.updated_at
    };
}

// MySQL 데이터를 학기별로 그룹화
function groupScheduleBySemester(scheduleData) {
    const grouped = {
        spring: [],
        summer: [],
        fall: [],
        winter: []
    };
    
    if (!Array.isArray(scheduleData)) {
        return grouped;
    }
    
    scheduleData.forEach(event => {
        const formattedEvent = formatEventData(event);
        const semester = event.semester || 'spring';
        
        if (grouped[semester]) {
            grouped[semester].push(formattedEvent);
        }
    });
    
    Object.keys(grouped).forEach(semester => {
        grouped[semester].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return grouped;
}

// 학기 코드를 한글 이름으로 변환
function getSemesterName(semester) {
    const semesterNames = {
        spring: '1학기',
        summer: '여름학기',
        fall: '2학기', 
        winter: '겨울학기'
    };
    return semesterNames[semester] || semester;
}

// =============================================================================
// UI 상태 관리 함수들
// =============================================================================

// 로딩 인디케이터 표시
function showLoadingIndicator(message = '로딩중...') {
    hideLoadingIndicator();
    
    const loadingHTML = `
        <div id="loadingIndicator" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        ">
            <div style="
                width: 40px;
                height: 40px;
                border: 3px solid rgba(59, 130, 246, 0.3);
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span style="color: #f1f5f9; font-weight: 500;">${message}</span>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

// 로딩 인디케이터 숨기기
function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// 에러 메시지 표시
function showErrorMessage(message, duration = 5000) {
    const errorHTML = `
        <div id="errorMessage" style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(239, 68, 68, 0.3);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        ">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>❌</span>
                <span>${message}</span>
            </div>
        </div>
        <style>
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
        </style>
    `;
    
    hideErrorMessage();
    document.body.insertAdjacentHTML('beforeend', errorHTML);
    
    if (duration > 0) {
        setTimeout(() => {
            hideErrorMessage();
        }, duration);
    }
}

// 에러 메시지 숨기기
function hideErrorMessage() {
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// 성공 메시지 표시
function showSuccessMessage(message, duration = 3000) {
    const successHTML = `
        <div id="successMessage" style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.3);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        ">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>✅</span>
                <span>${message}</span>
            </div>
        </div>
    `;
    
    hideSuccessMessage();
    document.body.insertAdjacentHTML('beforeend', successHTML);
    
    setTimeout(() => {
        hideSuccessMessage();
    }, duration);
}

// 성공 메시지 숨기기
function hideSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.remove();
    }
}

// =============================================================================
// UI 렌더링 함수들
// =============================================================================

// 캘린더 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    updateMonthDisplay(year, month);
    
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) return;
    
    const { daysInMonth, startingDayOfWeek } = getMonthInfo(year, month);
    
    calendarBody.innerHTML = '';
    
    // 이전 달의 빈 셀들
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarBody.appendChild(createEmptyDayElement());
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, new Date(year, month, day));
        calendarBody.appendChild(dayElement);
    }
    
    // 다음 달의 빈 셀들
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    for (let i = 0; i < remainingCells; i++) {
        calendarBody.appendChild(createEmptyDayElement());
    }
    
    renderCalendarEvents();
}

// 월 정보 계산
function getMonthInfo(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { firstDay, lastDay, daysInMonth, startingDayOfWeek };
}

// 월 표시 업데이트
function updateMonthDisplay(year, month) {
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement && monthNames[month]) {
        currentMonthElement.textContent = `${year}년 ${monthNames[month]}`;
    }
}

// 빈 날짜 셀 생성
function createEmptyDayElement() {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day empty-cell';
    return dayElement;
}

// 날짜 셀 생성
function createDayElement(dayNumber, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isToday(date)) {
        dayElement.classList.add('today');
    }
    
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) dayElement.classList.add('sunday');
    if (dayOfWeek === 6) dayElement.classList.add('saturday');
    
    const dateString = formatDate(date);
    
    dayElement.innerHTML = `
        <div class="day-number" id="day-${dateString}">${dayNumber}</div>
        <div class="day-events" id="events-${dateString}"></div>
    `;
    
    return dayElement;
}

// 캘린더에 이벤트 렌더링
async function renderCalendarEvents() {
    try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthlyEvents = await loadMonthlyData(year, month);
        
        monthlyEvents.forEach(event => {
            renderDayEvent(event);
        });
        
    } catch (error) {
        console.error('캘린더 이벤트 렌더링 오류:', error);
    }
}

// 특정 날짜에 이벤트 렌더링
function renderDayEvent(event) {
    const eventDates = getEventDateRange(event);
    
    eventDates.forEach(dateString => {
        const eventsContainer = document.getElementById(`events-${dateString}`);
        if (!eventsContainer) return;
        
        const eventElement = createEventElement(event);
        eventsContainer.appendChild(eventElement);
        
        if (event.type === 'holiday') {
            const dayNumberElement = document.getElementById(`day-${dateString}`);
            if (dayNumberElement) {
                dayNumberElement.classList.add('holiday-date');
            }
        }
    });
}

// 이벤트 요소 생성
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event-item ${event.type}`;
    eventElement.textContent = event.title;
    eventElement.title = `${event.title}: ${event.description}`;
    
    eventElement.addEventListener('click', function(e) {
        e.stopPropagation();
        showEventDetail(event);
    });
    
    return eventElement;
}

// 이벤트 날짜 범위 계산
function getEventDateRange(event) {
    const dates = [];
    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            dates.push(formatDate(d));
        }
    }
    
    return dates;
}

// 주요 일정 요약 카드 렌더링
function renderSummaryCards() {
    const summaryCards = document.getElementById('summaryCards');
    if (!summaryCards) return;
    
    const events = academicSchedule[currentSemester] || [];
    const today = new Date();
    
    const importantEvents = events.filter(event => event.important);
    
    const futureEvents = importantEvents
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
    const pastEvents = importantEvents
        .filter(event => new Date(event.date) < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    const displayEvents = [...futureEvents.slice(0, 5), ...pastEvents];
    
    summaryCards.innerHTML = '';
    
    if (displayEvents.length === 0) {
        summaryCards.innerHTML = `
            <div style="text-align: center; color: #94a3b8; padding: 2rem;">
                <p>현재 ${getSemesterName(currentSemester)}에 중요한 일정이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    displayEvents.forEach((event) => {
        const card = createSummaryCard(event);
        summaryCards.appendChild(card);
    });
}

// 요약 카드 생성
function createSummaryCard(event) {
    const card = document.createElement('div');
    card.className = 'summary-card';
    
    const isPast = new Date(event.date) < new Date();
    if (isPast) card.classList.add('past-event');
    
    const dateText = event.endDate ? 
        `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
        formatDateKorean(event.date);
    
    card.innerHTML = `
        <h4>${event.title} ${isPast ? '(완료)' : ''}</h4>
        <div class="date">${dateText}</div>
        <div class="description">${event.description}</div>
    `;
    
    card.addEventListener('click', () => showEventDetail(event));
    
    return card;
}

// 일정 목록 렌더링
function renderEventsList() {
    const eventsList = document.getElementById('eventsList');
    const monthlyTitle = document.getElementById('monthlyTitle');
    
    if (!eventsList) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (monthlyTitle && monthNames[month]) {
        monthlyTitle.textContent = `${year}년 ${monthNames[month]} 학사일정`;
    }
    
    loadMonthlyData(year, month).then(monthEvents => {
        let filteredEvents = monthEvents;
        if (currentFilter !== 'all') {
            filteredEvents = monthEvents.filter(event => event.type === currentFilter);
        }
        
        renderEventsListContent(filteredEvents);
    }).catch(error => {
        console.error('월별 이벤트 로드 오류:', error);
        eventsList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 40px;">일정을 불러오는데 실패했습니다.</p>';
    });
}

// 이벤트 목록 내용 렌더링
function renderEventsListContent(events) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 40px;">해당 조건의 일정이 없습니다.</p>';
        return;
    }
    
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsList.appendChild(eventCard);
    });
}

// 이벤트 카드 생성
function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    
    const dateText = event.endDate ? 
        `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
        formatDateKorean(event.date);
    
    eventCard.innerHTML = `
        <div class="event-card-header">
            <div class="event-card-title">${event.title}</div>
            <div class="event-card-date">${dateText}</div>
        </div>
        <div class="event-card-description">${event.description}</div>
        <span class="event-type">
            ${eventTypeLabels[event.type] || event.type}
            ${event.important ? ' ★' : ''}
        </span>
    `;
    
    eventCard.addEventListener('click', () => showEventDetail(event));
    
    return eventCard;
}

// 검색 결과 렌더링
function renderSearchResults(searchResults) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    eventsList.innerHTML = '';
    
    if (searchResults.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 40px;">검색 결과가 없습니다.</p>';
        return;
    }
    
    const header = document.createElement('div');
    header.style.cssText = 'padding: 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1); margin-bottom: 1rem;';
    header.innerHTML = `<strong style="color: #3b82f6;">검색 결과 ${searchResults.length}개</strong>`;
    eventsList.appendChild(header);
    
    searchResults.forEach(event => {
        const eventCard = createEventCard(event);
        eventsList.appendChild(eventCard);
    });
}

// =============================================================================
// 이벤트 핸들러 함수들
// =============================================================================

// 뒤로 가기
function goBackToMain() {
    if (document.referrer && document.referrer !== '') {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// 학기 변경
async function changeSemester() {
    const selectElement = document.getElementById('semesterSelect');
    if (!selectElement) return;
    
    const newSemester = selectElement.value;
    if (newSemester === currentSemester) return;
    
    currentSemester = newSemester;
    
    if (!academicSchedule[currentSemester] || academicSchedule[currentSemester].length === 0) {
        try {
            await loadSemesterData(currentSemester);
        } catch (error) {
            console.error('학기 변경 오류:', error);
            return;
        }
    }
    
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
    
    showSuccessMessage(`${getSemesterName(currentSemester)}로 변경되었습니다.`);
}

// 일정 필터링
function filterEvents(type) {
    currentFilter = type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-type="${type}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    renderEventsList();
}

// 월 네비게이션
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

// =============================================================================
// 모달 관리 함수들
// =============================================================================

// 이벤트 상세보기 모달
async function showEventDetail(event) {
    if (!event) return;
    
    const modal = document.getElementById('eventDetailModal');
    if (!modal) return;
    
    updateModalContent(event);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 모달 내용 업데이트
function updateModalContent(event) {
    const elements = {
        title: document.getElementById('detailTitle'),
        date: document.getElementById('detailDate'),
        period: document.getElementById('detailPeriod'),
        periodText: document.getElementById('detailPeriodText'),
        type: document.getElementById('detailType'),
        description: document.getElementById('detailDescription'),
        location: document.getElementById('detailLocation'),
        locationText: document.getElementById('detailLocationText')
    };
    
    if (elements.title) {
        elements.title.textContent = event.title || '제목 없음';
    }
    
    const dateText = event.endDate ? 
        `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
        formatDateKorean(event.date);
    
    if (elements.date) {
        elements.date.textContent = dateText;
    }
    
    if (event.endDate && elements.period && elements.periodText) {
        const startDate = new Date(event.date);
        const endDate = new Date(event.endDate);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            elements.periodText.textContent = `${diffDays}일간`;
            elements.period.style.display = 'flex';
        }
    } else if (elements.period) {
        elements.period.style.display = 'none';
    }
    
    if (elements.type) {
        elements.type.textContent = eventTypeLabels[event.type] || event.type || '기타';
    }
    
    if (elements.description) {
        elements.description.textContent = event.description || '설명 없음';
    }
    
    if (event.location && elements.location && elements.locationText) {
        elements.locationText.textContent = event.location;
        elements.location.style.display = 'flex';
    } else if (elements.location) {
        elements.location.style.display = 'none';
    }
}

// 모달 닫기
function closeDetailModal() {
    const modal = document.getElementById('eventDetailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// =============================================================================
// 유틸리티 함수들
// =============================================================================

// 날짜 포맷팅 (YYYY-MM-DD)
function formatDate(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 한국어 날짜 포맷팅
function formatDateKorean(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
}

// 오늘 날짜 체크
function isToday(date) {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// 공휴일 체크
function isNationalHoliday(dateString, events) {
    const nationalHolidays = [
        '신정', '설날', '삼일절', '어린이날', '부처님오신날', 
        '현충일', '광복절', '추석', '개천절', '한글날', '성탄절',
        '대체공휴일'
    ];
    
    return events.some(event => 
        event.type === 'holiday' && 
        nationalHolidays.some(holiday => event.title && event.title.includes(holiday))
    );
}

// =============================================================================
// 검색 기능 설정
// =============================================================================

// 검색 기능 초기화
function setupSearchFeature() {
    const searchInput = document.querySelector('.search-input, #searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    searchSchedule(query);
                } else if (query.length === 0) {
                    renderEventsList();
                }
            }, 500);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    searchSchedule(query);
                }
            }
        });
    }
}

// =============================================================================
// 네트워크 상태 관리
// =============================================================================

// 네트워크 상태 모니터링 설정
function setupNetworkStatusMonitoring() {
    window.addEventListener('online', function() {
        hideErrorMessage();
        showSuccessMessage('인터넷 연결이 복구되었습니다.');
        
        setTimeout(async () => {
            try {
                await loadAcademicSchedule();
                renderCalendar();
                renderEventsList();
                renderSummaryCards();
            } catch (error) {
                console.error('데이터 새로고침 오류:', error);
            }
        }, 1000);
    });
    
    window.addEventListener('offline', function() {
        showErrorMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.', 0);
    });
}

// 네트워크 상태 확인
function checkNetworkStatus() {
    if (!navigator.onLine) {
        showErrorMessage('인터넷 연결을 확인해주세요.', 0);
        return false;
    }
    return true;
}

// =============================================================================
// 키보드 이벤트 처리
// =============================================================================

// 키보드 이벤트 설정
function setupKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        // ESC 키로 모달 닫기
        if (e.key === 'Escape') {
            const modal = document.getElementById('eventDetailModal');
            if (modal && modal.style.display === 'block') {
                closeDetailModal();
            }
        }
        
        // 화살표 키로 월 이동 (body에 포커스가 있을 때만)
        if (e.target === document.body) {
            if (e.key === 'ArrowLeft') {
                prevMonth();
            } else if (e.key === 'ArrowRight') {
                nextMonth();
            }
        }
    });
}

// =============================================================================
// 데이터 새로고침
// =============================================================================

// 페이지 새로고침 함수
async function refreshCalendarData() {
    try {
        showLoadingIndicator('데이터 새로고침 중...');
        
        await loadSemesterData(currentSemester);
        
        renderCalendar();
        renderEventsList();
        renderSummaryCards();
        
        hideLoadingIndicator();
        showSuccessMessage('데이터를 새로고침했습니다.');
        
    } catch (error) {
        console.error('데이터 새로고침 오류:', error);
        hideLoadingIndicator();
        showErrorMessage('데이터 새로고침에 실패했습니다.');
    }
}

// 자동 새로고침 설정
function setupAutoRefresh() {
    // 페이지 가시성 변경 시 자동 새로고침
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            const now = new Date();
            const lastUpdate = localStorage.getItem('lastCalendarUpdate');
            
            if (!lastUpdate || (now - new Date(lastUpdate)) > 5 * 60 * 1000) {
                refreshCalendarData();
                localStorage.setItem('lastCalendarUpdate', now.toISOString());
            }
        }
    });
    
    // 주기적 업데이트 (30분마다)
    setInterval(() => {
        if (!document.hidden && checkNetworkStatus()) {
            refreshCalendarData();
        }
    }, 30 * 60 * 1000);
}

// =============================================================================
// 반응형 처리
// =============================================================================

// 반응형 레이아웃 처리
function handleResponsiveLayout() {
    const calendar = document.querySelector('.calendar');
    const summaryCards = document.querySelector('.summary-cards');
    
    if (window.innerWidth <= 768) {
        if (calendar) {
            calendar.style.height = '500px';
        }
        if (summaryCards) {
            summaryCards.style.flexDirection = 'column';
        }
    } else {
        if (calendar) {
            calendar.style.height = '700px';
        }
        if (summaryCards) {
            summaryCards.style.flexDirection = 'row';
        }
    }
}

// 윈도우 리사이즈 이벤트
function setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveLayout();
        }, 250);
    });
}

// =============================================================================
// 에러 처리
// =============================================================================

// 전역 에러 처리
function setupErrorHandlers() {
    // JavaScript 에러 처리
    window.addEventListener('error', function(event) {
        console.error('JavaScript 에러:', event.error);
        showErrorMessage('예상치 못한 오류가 발생했습니다.');
    });
    
    // Promise rejection 처리
    window.addEventListener('unhandledrejection', function(event) {
        console.error('처리되지 않은 Promise 거부:', event.reason);
        showErrorMessage('데이터 처리 중 오류가 발생했습니다.');
    });
}

// =============================================================================
// 초기화 및 이벤트 리스너
// =============================================================================

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    try {
        showLoadingIndicator('학사일정 초기화 중...');
        
        // 병렬로 설정 및 데이터 로드
        await Promise.all([
            loadConfiguration(),
            loadAcademicSchedule()
        ]);
        
        // 메인 페이지에서 특정 날짜로 이동 요청 확인
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
        
        // UI 렌더링
        renderCalendar();
        renderEventsList();
        renderSummaryCards();
        
        hideLoadingIndicator();
        showSuccessMessage('학사일정을 불러왔습니다.');
        
    } catch (error) {
        console.error('초기화 오류:', error);
        hideLoadingIndicator();
        showErrorMessage('페이지 초기화 중 오류가 발생했습니다.');
    }
    
    // 이벤트 리스너 설정
    setupModalEventListeners();
    setupSearchFeature();
    setupNetworkStatusMonitoring();
    setupKeyboardEvents();
    setupAutoRefresh();
    setupResizeHandler();
    setupErrorHandlers();
    
    // 반응형 레이아웃 초기화
    handleResponsiveLayout();
});

// 모달 이벤트 리스너 설정
function setupModalEventListeners() {
    const modal = document.getElementById('eventDetailModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeDetailModal();
            }
        });
    }
}

// =============================================================================
// 편의 기능들
// =============================================================================

// 오늘의 일정 표시
function showTodaySchedule() {
    const today = formatDate(new Date());
    loadMonthlyData(currentDate.getFullYear(), currentDate.getMonth())
        .then(monthlyEvents => {
            const todayEvents = monthlyEvents.filter(event => {
                const eventStart = new Date(event.date);
                const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
                const todayDate = new Date(today);
                
                return todayDate >= eventStart && todayDate <= eventEnd;
            });
            
            if (todayEvents.length > 0) {
                let message = '오늘의 학사일정:\n\n';
                todayEvents.forEach(event => {
                    message += `• ${event.title}\n  ${event.description}\n\n`;
                });
                alert(message);
            } else {
                alert('오늘은 예정된 학사일정이 없습니다.');
            }
        })
        .catch(error => {
            console.error('오늘 일정 조회 오류:', error);
            showErrorMessage('오늘 일정을 불러오는데 실패했습니다.');
        });
}

// 다가오는 일정 알림
function showUpcomingSchedule() {
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    loadMonthlyData(today.getFullYear(), today.getMonth())
        .then(monthlyEvents => {
            const upcomingEvents = monthlyEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= oneWeekLater;
            }).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (upcomingEvents.length > 0) {
                let message = '다가오는 일주일 일정:\n\n';
                upcomingEvents.forEach(event => {
                    const eventDate = new Date(event.date);
                    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                    message += `• ${event.title}\n  날짜: ${formatDateKorean(event.date)}\n  ${daysUntil}일 후\n\n`;
                });
                alert(message);
            } else {
                alert('다가오는 일주일 내 예정된 학사일정이 없습니다.');
            }
        })
        .catch(error => {
            console.error('다가오는 일정 조회 오류:', error);
            showErrorMessage('다가오는 일정을 불러오는데 실패했습니다.');
        });
}

// 학사일정 데이터 내보내기
async function exportScheduleData(format = 'json') {
    try {
        showLoadingIndicator('데이터 내보내기 중...');
        
        const allScheduleData = await apiRequest(API_ENDPOINTS.schedule);
        
        let exportData;
        let filename;
        let contentType;
        
        if (format === 'json') {
            exportData = JSON.stringify(allScheduleData, null, 2);
            filename = `yeonsung_academic_schedule_${new Date().getFullYear()}.json`;
            contentType = 'application/json';
        } else if (format === 'csv') {
            // CSV 형식으로 변환
            const csvHeader = 'ID,제목,시작일,종료일,타입,설명,중요도,장소,학기\n';
            const csvRows = allScheduleData.map(event => {
                const row = [
                    event.id,
                    `"${event.title || ''}"`,
                    event.start_date || '',
                    event.end_date || '',
                    event.event_type || '',
                    `"${event.description || ''}"`,
                    event.is_important ? '중요' : '일반',
                    `"${event.location || ''}"`,
                    event.semester || ''
                ];
                return row.join(',');
            }).join('\n');
            
            exportData = csvHeader + csvRows;
            filename = `yeonsung_academic_schedule_${new Date().getFullYear()}.csv`;
            contentType = 'text/csv;charset=utf-8;';
        }
        
        // 파일 다운로드
        const blob = new Blob([exportData], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        hideLoadingIndicator();
        showSuccessMessage('데이터가 성공적으로 내보내졌습니다.');
        
    } catch (error) {
        console.error('데이터 내보내기 오류:', error);
        hideLoadingIndicator();
        showErrorMessage('데이터 내보내기에 실패했습니다.');
    }
}

// 학사일정 인쇄
function printSchedule() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const semesterName = getSemesterName(currentSemester);
    
    loadMonthlyData(year, month).then(monthEvents => {
        const printWindow = window.open('', '_blank');
        
        let eventsList = '';
        monthEvents.forEach(event => {
            const dateText = event.endDate ? 
                `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
                formatDateKorean(event.date);
            
            eventsList += `
                <tr>
                    <td>${dateText}</td>
                    <td>${event.title}</td>
                    <td>${eventTypeLabels[event.type] || event.type}</td>
                    <td>${event.description}</td>
                    <td>${event.location || '-'}</td>
                </tr>
            `;
        });
        
        printWindow.document.write(`
            <html>
            <head>
                <title>${year}년 ${monthNames[month]} 학사일정</title>
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
                <h1>연성대학교 ${year}년 ${monthNames[month]} 학사일정</h1>
                <table>
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th>일정명</th>
                            <th>구분</th>
                            <th>상세내용</th>
                            <th>장소</th>
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
    }).catch(error => {
        console.error('인쇄용 데이터 로드 오류:', error);
        showErrorMessage('인쇄용 데이터를 불러오는데 실패했습니다.');
    });
}

// =============================================================================
// 전역 함수 노출 (HTML에서 호출용)
// =============================================================================

// HTML onclick 등에서 사용할 전역 함수들
window.goBackToMain = goBackToMain;
window.changeSemester = changeSemester;
window.filterEvents = filterEvents;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.goToToday = goToToday;
window.closeDetailModal = closeDetailModal;
window.showTodaySchedule = showTodaySchedule;
window.showUpcomingSchedule = showUpcomingSchedule;
window.refreshCalendarData = refreshCalendarData;
window.exportScheduleData = exportScheduleData;
window.printSchedule = printSchedule;
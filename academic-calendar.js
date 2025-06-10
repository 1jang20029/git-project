// academic-calendar.js

// 전역 변수
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';
let currentSchedule = []; // 백엔드에서 받아올 일정 데이터

// 뒤로 가기 함수
function goBackToMain() {
    if (document.referrer && document.referrer !== '') {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

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
    academic: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.3)' },
    exam:     { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)',  border: 'rgba(239, 68, 68, 0.3)' },
    holiday:  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.3)' },
    event:    { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.3)' },
    registration: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.3)' }
};

// 월 이름 배열
const monthNames = [
    '1월','2월','3월','4월','5월','6월',
    '7월','8월','9월','10월','11월','12월'
];

// 백엔드에서 학사일정 데이터를 가져오는 함수
async function fetchSchedule(semester) {
    try {
        const res = await fetch(`/api/academic-schedule?semester=${semester}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();  // [{ id, title, date, endDate?, type, description, important, location? }, ...]
    } catch (error) {
        console.error('학사일정 데이터 로드 오류:', error);
        return [];
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const navigateToDate = localStorage.getItem('navigateToCalendarDate');
    if (navigateToDate) {
        const targetDate = new Date(navigateToDate);
        if (!isNaN(targetDate.getTime())) {
            currentDate = targetDate;
        }
        localStorage.removeItem('navigateToCalendarDate');
    }

    document.getElementById('semesterSelect')
        .addEventListener('change', changeSemester);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterEvents(btn.dataset.type));
    });

    document.getElementById('eventDetailModal')
        .addEventListener('click', e => {
            if (e.target === e.currentTarget) closeDetailModal();
        });

    // 최초 렌더링
    updateDisplay();
});

// 학기 변경 핸들러
function changeSemester() {
    currentSemester = document.getElementById('semesterSelect').value;
    updateDisplay();
}

// 전체 화면 업데이트 (비동기)
async function updateDisplay() {
    currentSchedule = await fetchSchedule(currentSemester);
    renderImportantCards();
    renderCalendar();
    renderEventsList();
}

// 중요 일정 카드 렌더링
function renderImportantCards() {
    const container = document.getElementById('importantCards');
    const today = new Date();

    const importantEvents = currentSchedule.filter(e => e.important);
    const future = importantEvents.filter(e => new Date(e.date) >= today);
    const past   = importantEvents.filter(e => new Date(e.date) < today);

    future.sort((a,b) => new Date(a.date) - new Date(b.date));
    past.sort((a,b) => new Date(b.date) - new Date(a.date));

    const display = [...future, ...past].slice(0, 6);
    container.innerHTML = '';

    display.forEach(event => {
        const isPast = new Date(event.date) < today;
        const colors = eventColors[event.type];
        const card = document.createElement('div');
        card.className = `important-card ${isPast ? 'past-event' : ''}`;
        card.style.setProperty('--card-color', colors.color);

        const dateText = event.endDate
            ? `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}`
            : formatDateKorean(event.date);

        card.innerHTML = `
            <div class="card-date">${dateText}</div>
            <div class="card-title-text">${event.title}${isPast ? ' (완료)' : ''}</div>
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

    document.getElementById('currentMonthTitle')
        .textContent = `${year}년 ${monthNames[month]}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const body = document.getElementById('calendarBody');
    body.innerHTML = '';

    // 빈칸 채우기 (이전달)
    for (let i = 0; i < startWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty-cell';
        body.appendChild(empty);
    }
    // 이번달 날짜
    for (let d = 1; d <= daysInMonth; d++) {
        body.appendChild(createDayElement(d, new Date(year, month, d)));
    }
    // 남은 빈칸 (다음달)
    const totalCells = body.children.length;
    for (let i = totalCells; i < 42; i++) {
        const next = i - (startWeek + daysInMonth) + 1;
        body.appendChild(createDayElement(next, new Date(year, month + 1, next), true));
    }
}

// 날짜 요소 생성
function createDayElement(dayNum, date, isOtherMonth = false) {
    const el = document.createElement('div');
    el.className = 'calendar-day';
    if (isOtherMonth) el.classList.add('other-month');
    if (isToday(date)) el.classList.add('today');
    if (date.getDay() === 0) el.classList.add('sunday');
    if (date.getDay() === 6) el.classList.add('saturday');

    const dateStr = formatDate(date);
    const events = getEventsForDate(dateStr);
    const hasHoliday = events.some(e => e.type === 'holiday');

    el.innerHTML = `
        <div class="day-number ${hasHoliday ? 'holiday-date' : ''}">${dayNum}</div>
        <div class="day-events" id="events-${dateStr}"></div>
    `;
    if (!isOtherMonth) renderDayEvents(dateStr, events);
    return el;
}

// 하루 이벤트 점 렌더링
function renderDayEvents(dateStr, events) {
    const container = document.getElementById(`events-${dateStr}`);
    if (!container || !events.length) return;

    const types = [...new Set(events.map(e => e.type))];
    types.slice(0, 5).forEach(type => {
        const dot = document.createElement('div');
        dot.className = `event-dot ${type}`;
        dot.title = events.filter(e => e.type === type).map(e => e.title).join(', ');
        container.appendChild(dot);
    });
}

// 이벤트 목록 렌더링
function renderEventsList() {
    const list = document.getElementById('eventsList');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    let monthEvents = currentSchedule.filter(e => {
        const d1 = new Date(e.date);
        const d2 = e.endDate ? new Date(e.endDate) : d1;
        return d1 <= monthEnd && d2 >= monthStart;
    });

    // 필터 적용
    if (currentFilter !== 'all') {
        monthEvents = monthEvents.filter(e => e.type === currentFilter);
    }

    monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = '';

    if (!monthEvents.length) {
        list.innerHTML = `<div style="text-align:center;color:#94a3b8;padding:2rem;">
            해당 조건의 일정이 없습니다.
        </div>`;
        return;
    }

    monthEvents.forEach(e => {
        const colors = eventColors[e.type];
        const item = document.createElement('div');
        item.className = 'event-item';
        item.style.setProperty('--event-color', colors.color);
        item.style.setProperty('--badge-bg', colors.bg);
        item.style.setProperty('--badge-color', colors.color);
        item.style.setProperty('--badge-border', colors.border);

        const dateText = e.endDate
            ? `${formatDateKorean(e.date)} ~ ${formatDateKorean(e.endDate)}`
            : formatDateKorean(e.date);

        item.innerHTML = `
            <div class="event-header">
                <div class="event-title">${e.title}</div>
                <div class="event-date">${dateText}</div>
            </div>
            <div class="event-description">${e.description}</div>
            <div class="event-type-badge">
                ${eventTypeLabels[e.type]}${e.important ? ' ★' : ''}
            </div>
        `;
        item.addEventListener('click', () => showEventDetail(e));
        list.appendChild(item);
    });
}

// 필터 버튼 핸들러
function filterEvents(type) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    renderEventsList();
}

// 상세 모달 열기
function showEventDetail(ev) {
    document.getElementById('detailTitle').textContent = ev.title;
    const dateText = ev.endDate
        ? `${formatDateKorean(ev.date)} ~ ${formatDateKorean(ev.endDate)}`
        : formatDateKorean(ev.date);
    document.getElementById('detailDate').textContent = dateText;

    if (ev.endDate) {
        const days = (new Date(ev.endDate) - new Date(ev.date)) / (1000*60*60*24) + 1;
        document.getElementById('detailPeriod').style.display = 'flex';
        document.getElementById('detailPeriodText').textContent = `${days}일간`;
    } else {
        document.getElementById('detailPeriod').style.display = 'none';
    }

    const typeEl = document.getElementById('detailType');
    const colors = eventColors[ev.type];
    typeEl.textContent = eventTypeLabels[ev.type];
    typeEl.style.setProperty('--badge-bg', colors.bg);
    typeEl.style.setProperty('--badge-color', colors.color);
    typeEl.style.setProperty('--badge-border', colors.border);

    document.getElementById('detailDescription').textContent = ev.description;

    if (ev.location) {
        document.getElementById('detailLocation').style.display = 'flex';
        document.getElementById('detailLocationText').textContent = ev.location;
    } else {
        document.getElementById('detailLocation').style.display = 'none';
    }

    document.getElementById('eventDetailModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 상세 모달 닫기
function closeDetailModal() {
    document.getElementById('eventDetailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 월 이동
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

// 유틸리티
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}
function formatDateKorean(ds) {
    const d = new Date(ds);
    const mm = d.getMonth()+1, dd = d.getDate();
    const wd = ['일','월','화','수','목','금','토'][d.getDay()];
    return `${mm}월 ${dd}일(${wd})`;
}
function isToday(d) {
    const t = new Date();
    return d.toDateString() === t.toDateString();
}
function getEventsForDate(dateString) {
    return currentSchedule.filter(e => {
        if (e.endDate) {
            return dateString >= e.date && dateString <= e.endDate;
        }
        return e.date === dateString;
    });
}

// 키보드 내비게이션
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('eventDetailModal').style.display === 'block') {
        closeDetailModal();
    }
    if (e.target === document.body) {
        if (e.key === 'ArrowLeft') prevMonth();
        if (e.key === 'ArrowRight') nextMonth();
    }
});

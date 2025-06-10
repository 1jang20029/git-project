// 학사일정 데이터 샘플 (필요시 데이터 추가/수정)
const scheduleData = [
  // 2025년 6월
  { title: '기말고사', type: '시험', start: '2025-06-17', end: '2025-06-21', desc: '1학기 기말시험 기간' },
  { title: '하계방학', type: '공휴일/방학', start: '2025-06-23', end: '2025-06-23', desc: '하계방학 시작' }
  // 필요한 경우 여기 일정 추가
];

// 필터 버튼용
const filterTypes = [
  { label: '전체', value: '전체' },
  { label: '학사', value: '학사' },
  { label: '시험', value: '시험' },
  { label: '휴일', value: '공휴일/방학' },
  { label: '행사', value: '행사' }
];

// 오늘 날짜
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1; // 1~12
let selectedSemester = '1';
let activeFilter = '전체';

// ============ 유틸 함수 =============
function pad(num) { return num < 10 ? '0' + num : num; }
function formatYMD(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
function isSameDay(date1, date2) { return date1 && date2 && date1.getTime() === date2.getTime(); }
function getMonthSchedules(year, month) {
  return scheduleData.filter(ev => {
    const start = new Date(ev.start);
    return start.getFullYear() === year && (start.getMonth() + 1) === month;
  });
}
function getEventOnDay(year, month, day, typeFilter = null) {
  return scheduleData.find(ev => {
    if (typeFilter && typeFilter !== '전체' && ev.type !== typeFilter) return false;
    const s = new Date(ev.start), e = new Date(ev.end);
    const d = new Date(year, month - 1, day);
    return d >= s && d <= e;
  });
}
function getEventsOnDay(year, month, day, typeFilter = null) {
  return scheduleData.filter(ev => {
    if (typeFilter && typeFilter !== '전체' && ev.type !== typeFilter) return false;
    const s = new Date(ev.start), e = new Date(ev.end);
    const d = new Date(year, month - 1, day);
    return d >= s && d <= e;
  });
}

// ============ 주요 일정 카드 =============
function renderMainCards() {
  const container = document.getElementById('mainScheduleCards');
  container.innerHTML = '';
  // 이달 전체 일정 중 2개만 대표로(혹은 다수 출력, 필요에 따라 조절)
  const thisMonthEvents = getMonthSchedules(currentYear, currentMonth);
  for (const ev of thisMonthEvents) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${ev.title}</div>
      <div class="card-content">
        ${ev.start}${ev.start !== ev.end ? ' ~ ' + ev.end : ''}<br>
        <span class="card-desc">${ev.desc}</span>
      </div>
    `;
    container.appendChild(card);
  }
  if (thisMonthEvents.length === 0) {
    container.innerHTML = '<div class="card"><div class="card-content">이달의 주요 일정이 없습니다.</div></div>';
  }
}

// ============ 달력 렌더링 =============
function renderCalendar(year, month) {
  const tbody = document.getElementById('calendarBody');
  tbody.innerHTML = '';
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startDay = firstDay.getDay(); // 0:일요일
  let row = document.createElement('tr');
  let day = 1;
  // 1주일 반복 (최대 6주)
  for (let i = 0; i < 6; i++) {
    row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      let cell = document.createElement('td');
      if ((i === 0 && j < startDay) || day > lastDate) {
        cell.innerHTML = '';
      } else {
        cell.innerHTML = `<span class="calendar-date">${day}</span>`;
        // 오늘 강조
        const thisDate = new Date(year, month - 1, day);
        if (isSameDay(thisDate, today)) {
          cell.classList.add('today');
        }
        // 일정 표시
        const events = getEventsOnDay(year, month, day, activeFilter);
        if (events.length > 0) {
          events.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'calendar-event event-' + ev.type.replace(/[^가-힣a-z]/gi,'');
            evDiv.textContent = ev.title;
            cell.appendChild(evDiv);
          });
        }
        day++;
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
    if (day > lastDate) break;
  }
  // 상단 월 표시
  document.getElementById('calendarMonthLabel').textContent = `${year}년 ${month}월`;
}

// ============ 스케줄(아래 리스트) 렌더링 =============
function renderScheduleList() {
  const container = document.getElementById('scheduleList');
  const list = scheduleData.filter(ev => {
    const evDate = new Date(ev.start);
    return (
      evDate.getFullYear() === currentYear &&
      (evDate.getMonth() + 1) === currentMonth &&
      (activeFilter === '전체' || ev.type === activeFilter || (activeFilter === '휴일' && ev.type === '공휴일/방학'))
    );
  });
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-msg">이달의 일정이 없습니다.</div>';
    return;
  }
  container.innerHTML = '';
  list.forEach(ev => {
    const box = document.createElement('div');
    box.className = 'schedule-item';
    box.innerHTML = `
      <div class="schedule-main">
        <div class="schedule-title">${ev.title}</div>
        <div class="schedule-date">${ev.start}${ev.start !== ev.end ? ' ~ ' + ev.end : ''}</div>
      </div>
      <div class="schedule-desc">${ev.desc}</div>
    `;
    container.appendChild(box);
  });
  document.getElementById('scheduleTitleLabel').textContent = `${currentYear}년 ${currentMonth}월 학사일정`;
}

// ============ 필터 버튼 렌더링 =============
function renderFilters() {
  const container = document.getElementById('scheduleFilters');
  container.innerHTML = '';
  filterTypes.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    if (activeFilter === filter.value) btn.classList.add('active');
    btn.textContent = filter.label;
    btn.onclick = () => {
      activeFilter = filter.value;
      renderCalendar(currentYear, currentMonth);
      renderScheduleList();
      renderFilters();
    };
    container.appendChild(btn);
  });
}

// ============ 이벤트 핸들러 =============
document.getElementById('prevMonthBtn').onclick = () => {
  if (currentMonth === 1) {
    currentMonth = 12;
    currentYear -= 1;
  } else {
    currentMonth -= 1;
  }
  renderMainCards();
  renderCalendar(currentYear, currentMonth);
  renderScheduleList();
  renderFilters();
};
document.getElementById('nextMonthBtn').onclick = () => {
  if (currentMonth === 12) {
    currentMonth = 1;
    currentYear += 1;
  } else {
    currentMonth += 1;
  }
  renderMainCards();
  renderCalendar(currentYear, currentMonth);
  renderScheduleList();
  renderFilters();
};
document.getElementById('todayBtn').onclick = () => {
  currentYear = today.getFullYear();
  currentMonth = today.getMonth() + 1;
  renderMainCards();
  renderCalendar(currentYear, currentMonth);
  renderScheduleList();
  renderFilters();
};
document.getElementById('semesterSelect').onchange = function() {
  selectedSemester = this.value;
  // 학기별로 달력/데이터를 다르게 보여주고 싶으면 여기에 추가 구현!
  renderMainCards();
  renderCalendar(currentYear, currentMonth);
  renderScheduleList();
  renderFilters();
};

// ============ 최초 렌더링 =============
window.onload = () => {
  renderMainCards();
  renderCalendar(currentYear, currentMonth);
  renderScheduleList();
  renderFilters();
};

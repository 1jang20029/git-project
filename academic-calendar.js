// 전역 변수
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';
let academicSchedule = []; // 백엔드에서 받아올 일정 배열

// 이벤트 타입 라벨
const eventTypeLabels = {
  academic: '학사일정',
  exam: '시험',
  holiday: '공휴일/방학',
  event: '행사',
  registration: '수강신청'
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // URL 쿼리나 localStorage를 이용해 특정 날짜로 이동 기능이 필요하면 여기에 구현
  updateCurrentMonthText();
  loadSchedule(); // 백엔드에서 해당 학기 일정 가져오기

  // 모달 외부 클릭 시 닫기
  document
    .getElementById('eventDetailModal')
    .addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeDetailModal();
    });

  window.addEventListener('resize', handleResponsiveNavigation);
  window.addEventListener('scroll', handleScrollHeader);
  setTimeout(handleResponsiveNavigation, 100);

  // ESC 누르면 모달 닫기, ←/→ 누르면 이전/다음 달
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen()) closeDetailModal();
    if (e.target === document.body) {
      if (e.key === 'ArrowLeft') prevMonth();
      else if (e.key === 'ArrowRight') nextMonth();
    }
  });
});

// 백엔드에서 해당 학기 데이터를 가져오는 함수
async function loadSchedule() {
  try {
    // Node.js/MySQL 백엔드에서 크롤링 데이터를 MySQL에서 조회해 JSON으로 내려준다고 가정
    const res = await fetch(
      `/api/schedules?semester=${encodeURIComponent(currentSemester)}`
    );
    if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
    academicSchedule = await res.json(); // [{ id, title, date, endDate, type, description, important, location? }, …]
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
  } catch (err) {
    console.error(err);
    alert('학사일정 데이터를 불러오는 중 오류가 발생했습니다.');
  }
}

// “YYYY년 MM월” 텍스트 업데이트
function updateCurrentMonthText() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  document.getElementById('currentMonth').textContent = `${year}년 ${month}월`;
  document.getElementById(
    'monthlyTitle'
  ).textContent = `${year}년 ${month}월 학사일정`;
}

// 캘린더 렌더링
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 달력 제목(YYYY년 MM월) 업데이트
  updateCurrentMonthText();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const lastDayOfWeek = lastDay.getDay();

  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = '';

  // 총 6주(행) × 7일(열) 그리드 생성
  // 1) 첫 번째 주: 빈칸(이전월) + 1일부터
  let dayCounter = 1;
  for (let week = 0; week < 6; week++) {
    const weekRow = document.createElement('div');
    weekRow.className = 'calendar-row'; // CSS에서 flex/grid로 7열 레이아웃 처리
    for (let dow = 0; dow < 7; dow++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';

      // inCurrentMonth: 이번 달 날짜를 그려야 할 위치인지 체크
      const cellIndex = week * 7 + dow;
      const shouldShowNumber =
        cellIndex >= startingDayOfWeek && dayCounter <= daysInMonth;

      if (shouldShowNumber) {
        const dateObj = new Date(year, month, dayCounter);
        const dateString = formatDate(dateObj);

        // 날짜 숫자 표시
        const dayNumberDiv = document.createElement('div');
        dayNumberDiv.className = 'day-number';
        dayNumberDiv.textContent = dayCounter;
        // 오늘이라면 강조
        if (isToday(dateObj)) dayNumberDiv.classList.add('today');

        // 공휴일 여부 체크
        if (isNationalHoliday(dateString)) {
          dayNumberDiv.classList.add('holiday-date');
        }

        cell.appendChild(dayNumberDiv);

        // 이 날짜에 해당하는 일정 렌더링
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        eventsContainer.id = `events-${dateString}`;
        cell.appendChild(eventsContainer);

        renderDayEvents(dateObj);
        dayCounter++;
      } else {
        // 이번 달이 아닌 칸(지난달/다음달) → 연하게 표시
        cell.classList.add('other-month');
      }

      // 주말 강조
      if (dow === 0) cell.classList.add('sunday');
      else if (dow === 6) cell.classList.add('saturday');

      weekRow.appendChild(cell);
    }
    calendarBody.appendChild(weekRow);
  }
}

// 특정 날짜의 이벤트 렌더링
function renderDayEvents(date) {
  const dateString = formatDate(date);
  const dayEvents = getEventsForDate(dateString);
  const eventsContainer = document.getElementById(`events-${dateString}`);
  if (!eventsContainer) return;
  eventsContainer.innerHTML = '';

  dayEvents.forEach((evt) => {
    const eventElement = document.createElement('div');
    let eventClass = 'event-item';

    // 멀티데이 처리
    if (evt.endDate && evt.endDate !== evt.date) {
      const start = new Date(evt.date);
      const end = new Date(evt.endDate);
      if (isSameDay(date, start)) eventClass += ' multi-day-start';
      else if (isSameDay(date, end)) eventClass += ' multi-day-end';
      else eventClass += ' multi-day-middle';
    }

    eventElement.className = eventClass;
    eventElement.textContent = evt.title;
    eventElement.title = `${evt.title}: ${evt.description}`;

    const color = getEventColor(evt.type);
    eventElement.style.backgroundColor = color;

    eventElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showEventDetail(evt);
    });

    eventsContainer.appendChild(eventElement);
  });
}

// 당월 이벤트 리스트 렌더링
function renderEventsList() {
  const eventsList = document.getElementById('eventsList');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  // academicSchedule 중 이번 달에 속하는 이벤트 필터
  let filtered = academicSchedule.filter((evt) => {
    const sDate = new Date(evt.date);
    const eDate = evt.endDate ? new Date(evt.endDate) : sDate;
    return sDate <= monthEnd && eDate >= monthStart;
  });

  // 중복 제거 (title+date+endDate)
  filtered = removeDuplicates(filtered);

  // 타입 필터링
  if (currentFilter !== 'all') {
    filtered = filtered.filter((evt) => evt.type === currentFilter);
  }

  // 날짜 순 정렬
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  eventsList.innerHTML = '';
  if (filtered.length === 0) {
    eventsList.innerHTML =
      '<p style="text-align:center;color:#666;padding:40px;">해당 조건의 일정이 없습니다.</p>';
    return;
  }

  filtered.forEach((evt) => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';

    const dateText = evt.endDate
      ? `${formatDateKorean(evt.date)} ~ ${formatDateKorean(evt.endDate)}`
      : formatDateKorean(evt.date);

    const color = getEventColor(evt.type);

    eventCard.innerHTML = `
      <div class="event-card-header">
        <div class="event-card-title">${evt.title}</div>
        <div class="event-card-date">${dateText}</div>
      </div>
      <div class="event-card-description">${evt.description}</div>
      <span class="event-type" style="
        background-color: ${color}20;
        color: ${color};
        border: 1px solid ${color};
      ">
        ${eventTypeLabels[evt.type]} ${evt.important ? '★' : ''}
      </span>
    `;

    eventCard.style.borderLeft = `5px solid ${color}`;

    eventCard.addEventListener('click', () => showEventDetail(evt));
    eventsList.appendChild(eventCard);
  });
}

// 요약 카드 렌더링 (중요 일정만)
function renderSummaryCards() {
  const summaryCards = document.getElementById('summaryCards');
  const today = new Date();
  let importantEvents = academicSchedule.filter((evt) => evt.important);

  const future = importantEvents.filter((evt) => new Date(evt.date) >= today);
  const past = importantEvents.filter((evt) => new Date(evt.date) < today);

  future.sort((a, b) => new Date(a.date) - new Date(b.date));
  past.sort((a, b) => new Date(b.date) - new Date(a.date));
  const all = [...future, ...past];

  summaryCards.innerHTML = '';
  summaryCards.className = 'summary-cards';
  const swipeContainer = document.createElement('div');
  swipeContainer.className = 'swipe-container';

  all.forEach((evt) => {
    const card = document.createElement('div');
    card.className = 'summary-card';

    const dateText = evt.endDate
      ? `${formatDateKorean(evt.date)} ~ ${formatDateKorean(evt.endDate)}`
      : formatDateKorean(evt.date);

    const isPast = new Date(evt.date) < today;
    const color = getEventColor(evt.type);

    card.innerHTML = `
      <h4>${evt.title} ${isPast ? '(완료)' : ''}</h4>
      <div class="date">${dateText}</div>
      <div class="description">${evt.description}</div>
    `;
    if (isPast) card.classList.add('past-event');
    card.style.borderLeft = `5px solid ${color}`;

    card.addEventListener('click', () => showEventDetail(evt));
    swipeContainer.appendChild(card);
  });

  summaryCards.appendChild(swipeContainer);
  addSwipeFeature(swipeContainer);
}

// 스와이프 기능 (요약 카드)
function addSwipeFeature(container) {
  let startX = 0,
    currentX = 0,
    isDragging = false,
    startScrollLeft = 0;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startScrollLeft = container.scrollLeft;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.clientX;
    const diff = startX - currentX;
    container.scrollLeft = startScrollLeft + diff;
  });

  ['mouseup', 'mouseleave'].forEach((evt) => {
    container.addEventListener(evt, () => {
      isDragging = false;
      container.style.cursor = 'grab';
    });
  });

  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startScrollLeft = container.scrollLeft;
  });

  container.addEventListener('touchmove', (e) => {
    if (!startX) return;
    currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    container.scrollLeft = startScrollLeft + diff;
    e.preventDefault();
  });

  container.addEventListener('touchend', () => {
    startX = 0;
    currentX = 0;
  });

  container.addEventListener('wheel', (e) => {
    const maxScroll = container.scrollWidth - container.clientWidth;
    const SPEED = 3;
    const canRight = e.deltaY > 0 && container.scrollLeft < maxScroll;
    const canLeft = e.deltaY < 0 && container.scrollLeft > 0;
    if (canRight || canLeft) {
      container.scrollLeft += e.deltaY * SPEED;
      e.preventDefault();
    }
  });
}

// 이벤트 필터링
function filterEvents(type) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`).classList.add('active');
  renderEventsList();
}

// 이전 달
function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
  renderEventsList();
}

// 다음 달
function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
  renderEventsList();
}

// 오늘로 이동
function goToToday() {
  currentDate = new Date();
  renderCalendar();
  renderEventsList();
}

// 일정 상세보기 모달 열기
function showEventDetail(evt) {
  document.getElementById('detailTitle').textContent = evt.title;

  const dateText = evt.endDate
    ? `${formatDateKorean(evt.date)} ~ ${formatDateKorean(evt.endDate)}`
    : formatDateKorean(evt.date);
  document.getElementById('detailDate').textContent = dateText;

  if (evt.endDate) {
    document.getElementById('detailPeriod').style.display = 'flex';
    const s = new Date(evt.date),
      e = new Date(evt.endDate);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById(
      'detailPeriodText'
    ).textContent = `${diffDays}일간`;
  } else {
    document.getElementById('detailPeriod').style.display = 'none';
  }

  document.getElementById('detailType').textContent =
    eventTypeLabels[evt.type];
  document
    .getElementById('detailType')
    .classList.remove('academic', 'exam', 'holiday', 'event', 'registration');
  document.getElementById('detailType').classList.add(evt.type);

  document.getElementById('detailDescription').textContent = evt.description;

  if (evt.location) {
    document.getElementById('detailLocation').style.display = 'flex';
    document.getElementById('detailLocationText').textContent =
      evt.location;
  } else {
    document.getElementById('detailLocation').style.display = 'none';
  }

  document.getElementById('eventDetailModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// 모달 닫기
function closeDetailModal() {
  document.getElementById('eventDetailModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// 모달이 열려 있는지 확인
function isModalOpen() {
  return (
    document.getElementById('eventDetailModal').style.display === 'flex'
  );
}

// 날짜 문자열 포맷터 (YYYY-MM-DD)
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 한글 날짜 포맷 (M월 D일(요일))
function formatDateKorean(dateString) {
  const d = new Date(dateString);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const ws = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${mm}월 ${dd}일(${ws})`;
}

// 오늘 여부 검사
function isToday(date) {
  const t = new Date();
  return date.toDateString() === t.toDateString();
}

// 날짜 비교 (같은 날인지)
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// 월 경계 넘어온 달력에도 표시된 날짜의 일정 가져오기
function getEventsForDate(dateString) {
  return academicSchedule.filter((evt) => {
    if (evt.endDate) {
      return (
        dateString >= evt.date && dateString <= evt.endDate
      );
    } else {
      return evt.date === dateString;
    }
  });
}

// 중복 제거 (title + date + endDate)
function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter((evt) => {
    const key = `${evt.title}-${evt.date}-${evt.endDate || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 국가 공휴일 판단 (단순히 type=holiday인 경우만)
function isNationalHoliday(dateString) {
  return academicSchedule.some(
    (evt) =>
      evt.type === 'holiday' &&
      (evt.date === dateString ||
        (evt.endDate &&
          dateString >= evt.date &&
          dateString <= evt.endDate))
  );
}

// 이벤트별 색상 매핑 (type 기준)
function getEventColor(type) {
  switch (type) {
    case 'academic':
      return '#b8e985';
    case 'exam':
      return '#e74c3c';
    case 'holiday':
      return '#27ae60';
    case 'event':
      return '#9b59b6';
    case 'registration':
      return '#f39c12';
    default:
      return '#95a5a6';
  }
}

// 반응형 네비게이션 & 헤더 고정
function handleResponsiveNavigation() {
  const currentMonth = document.getElementById('currentMonth');
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.nav-btn, .today-btn').forEach((btn) => {
      btn.style.padding = '10px 15px';
      btn.style.fontSize = '0.9rem';
    });
    currentMonth.style.fontSize = '1.5rem';
  } else {
    document.querySelectorAll('.nav-btn, .today-btn').forEach((btn) => {
      btn.style.padding = '15px 20px';
      btn.style.fontSize = '1.1rem';
    });
    currentMonth.style.fontSize = '2.2rem';
  }
}

window.addEventListener('resize', handleResponsiveNavigation);

function handleScrollHeader() {
  const header = document.querySelector('.header');
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > 100) {
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '100';
    header.style.marginBottom = '20px';
  } else {
    header.style.position = 'relative';
    header.style.marginBottom = '30px';
  }
}

window.addEventListener('scroll', handleScrollHeader);

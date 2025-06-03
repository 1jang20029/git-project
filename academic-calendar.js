// 전역 변수
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';
let academicSchedule = []; // 백엔드에서 받아올 배열

// 이벤트 타입 라벨
const eventTypeLabels = {
  academic: '학사일정',
  exam: '시험',
  holiday: '공휴일/방학',
  event: '행사',
  registration: '수강신청',
};

// 학기 선택 시 호출
function changeSemester() {
  currentSemester = document.getElementById('semesterSelect').value;
  loadSchedule(); // 백엔드에서 해당 학기 일정 가져오기
}

// 백엔드에서 해당 학기 데이터를 가져오는 함수
async function loadSchedule() {
  try {
    const res = await fetch(`/api/schedules?semester=${encodeURIComponent(currentSemester)}`);
    if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
    academicSchedule = await res.json(); // [{id, title, date, endDate, type, description, important, location?}, …]
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
  } catch (err) {
    console.error(err);
    // 에러 시 사용자에게 알림
    alert('학사일정 데이터를 불러오는 중 오류가 발생했습니다.');
  }
}

// 캘린더 렌더링
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 월 타이틀 표시
  document.getElementById('currentMonth').textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const lastDayOfWeek = lastDay.getDay();

  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = '';

  // 이전 달 빈칸
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty-cell';
    calendarBody.appendChild(emptyCell);
  }

  // 이번 달 날짜 생성
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const isOtherMonth = false;
    const dayElement = createDayElement(day, dateObj, isOtherMonth);
    calendarBody.appendChild(dayElement);
  }

  // 다음 달 빈칸
  if (lastDayOfWeek !== 6) {
    const nextDays = 6 - lastDayOfWeek;
    for (let i = 1; i <= nextDays; i++) {
      const dateObj = new Date(year, month + 1, i);
      const dayElement = createDayElement(i, dateObj, true);
      calendarBody.appendChild(dayElement);
    }
  }

  // 각 날짜별 이벤트 렌더링 (조금 딜레이)
  setTimeout(() => {
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      renderDayEvents(dateObj);
    }
  }, 50);
}

// 날짜 셀 생성
function createDayElement(dayNumber, date, isOtherMonth) {
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';
  if (isOtherMonth) dayElement.classList.add('other-month');

  // 오늘 표시
  if (isToday(date)) {
    dayElement.classList.add('today');
  }

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) dayElement.classList.add('sunday');
  else if (dayOfWeek === 6) dayElement.classList.add('saturday');

  const dateString = formatDate(date);
  const hasHoliday = checkNationalHoliday(dateString);

  dayElement.innerHTML = `
    <div class="day-number ${hasHoliday ? 'holiday-date' : ''}">${dayNumber}</div>
    <div class="day-events" id="events-${dateString}"></div>
  `;

  // 당일 이벤트 렌더링 (월 경계 안쪽 날짜만)
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
  if (!eventsContainer) return;
  eventsContainer.innerHTML = '';

  dayEvents.forEach((evt) => {
    const eventElement = document.createElement('div');
    let eventClass = 'event-item';
    // multi-day 처리
    if (evt.endDate && evt.endDate !== evt.date) {
      const start = new Date(evt.date);
      const end = new Date(evt.endDate);
      const cur = new Date(dateString);
      if (isSameDay(cur, start)) eventClass += ' multi-day-start';
      else if (isSameDay(cur, end)) eventClass += ' multi-day-end';
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

// 당월의 일정 리스트 렌더링
function renderEventsList() {
  const eventsList = document.getElementById('eventsList');
  const monthlyTitle = document.getElementById('monthlyTitle');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthlyTitle.textContent = `${year}년 ${month + 1}월 학사일정`;

  // academicSchedule 중에서 현재 월에 속하는 이벤트만 추출
  let allEvents = [...academicSchedule];
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  let filtered = allEvents.filter((evt) => {
    const sDate = new Date(evt.date);
    const eDate = evt.endDate ? new Date(evt.endDate) : sDate;
    return sDate <= monthEnd && eDate >= monthStart;
  });

  // 중복 제거 (title + date + endDate)
  filtered = removeDuplicates(filtered);

  // 필터 타입 적용
  if (currentFilter !== 'all') {
    filtered = filtered.filter((evt) => evt.type === currentFilter);
  }

  // 날짜순 정렬
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

// 요일별 학사 일정 요약 카드 렌더링
function renderSummaryCards() {
  const summaryCards = document.getElementById('summaryCards');
  // 중요 이벤트만 필터 → 오늘 기준 과거/미래 구분
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

// 뒤로 가기
function goBackToMain() {
  if (document.referrer && document.referrer !== '') {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
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

// 월 경계 넘어온 달력에도 표시된 날짜의 이벤트 가져오기
function getEventsForDate(dateString) {
  // 모든 일정 순회
  let matches = academicSchedule.filter((evt) => {
    if (evt.endDate) {
      return dateString >= evt.date && dateString <= evt.endDate;
    } else {
      return evt.date === dateString;
    }
  });
  return removeDuplicates(matches);
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
function checkNationalHoliday(dateString) {
  return academicSchedule.some(
    (evt) =>
      evt.type === 'holiday' &&
      (evt.date === dateString ||
        (evt.endDate && dateString >= evt.date && dateString <= evt.endDate))
  );
}

// 모달에 일정 상세 정보 채우고 띄우기
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
    document.getElementById('detailPeriodText').textContent = `${diffDays}일간`;
  } else {
    document.getElementById('detailPeriod').style.display = 'none';
  }

  document.getElementById('detailType').textContent = eventTypeLabels[evt.type];
  document
    .getElementById('detailType')
    .classList.remove('academic', 'exam', 'holiday', 'event', 'registration');
  document.getElementById('detailType').classList.add(evt.type);

  document.getElementById('detailDescription').textContent = evt.description;

  if (evt.location) {
    document.getElementById('detailLocation').style.display = 'flex';
    document.getElementById('detailLocationText').textContent = evt.location;
  } else {
    document.getElementById('detailLocation').style.display = 'none';
  }

  document.getElementById('eventDetailModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('eventDetailModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// 달력 이전/다음/오늘 버튼
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

// 키보드 이벤트: ESC로 모달 닫기, ←/→로 월 이동
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (
      document.getElementById('eventDetailModal').style.display === 'flex'
    ) {
      closeDetailModal();
    }
  }
  if (e.target === document.body) {
    if (e.key === 'ArrowLeft') prevMonth();
    else if (e.key === 'ArrowRight') nextMonth();
  }
});

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

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
  // 메인 페이지에서 특정 날짜로 이동 요청 확인
  const navigateToDate = localStorage.getItem('navigateToCalendarDate');
  if (navigateToDate) {
    try {
      const target = new Date(navigateToDate);
      if (!isNaN(target.getTime())) {
        currentDate = target;
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('navigateToCalendarDate');
  }
  loadSchedule(); // 최초 학사일정 불러오기

  document
    .getElementById('eventDetailModal')
    .addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeDetailModal();
    });

  window.addEventListener('resize', handleResponsiveNavigation);
  window.addEventListener('scroll', handleScrollHeader);
  setTimeout(handleResponsiveNavigation, 100);
});

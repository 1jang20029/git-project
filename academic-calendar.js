// academic-calendar.js

// 전역 상태
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';
let currentSchedule = [];
let lastFocusedElement = null;
const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let trapTabHandler = null;

// 로딩 오버레이, 스피너 & 에러 배너 생성
const overlay = document.createElement('div');
overlay.id = 'loadingOverlay';
overlay.className = 'loading-overlay';
overlay.hidden = true;
document.body.appendChild(overlay);

const spinner = document.createElement('div');
spinner.id = 'loadingSpinner';
spinner.className = 'loading-spinner';
spinner.textContent = '로딩 중...';
spinner.setAttribute('aria-live','polite');
spinner.hidden = true;
document.body.appendChild(spinner);

const errorBanner = document.createElement('div');
errorBanner.id = 'errorBanner';
errorBanner.className = 'error-banner';
errorBanner.setAttribute('role','alert');
errorBanner.hidden = true;
document.body.appendChild(errorBanner);

// 스피너·오버레이 토글
function showSpinner() {
  overlay.hidden = false;
  spinner.hidden = false;
}
function hideSpinner() {
  spinner.hidden = true;
  overlay.hidden = true;
}

// 에러 배너 토글
function showError(msg) {
  errorBanner.innerHTML =
    `<span>일정 로드 오류: ${msg}</span>` +
    '<button id="retryBtn" class="retry-btn">다시 시도</button>';
  errorBanner.hidden = false;
  document.getElementById('retryBtn')
    .addEventListener('click', () => updateDisplay());
}
function clearError() {
  errorBanner.hidden = true;
  errorBanner.innerHTML = '';
}

// YYYY-MM-DD → Date 파싱
function parseDateString(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// 이벤트 타입 라벨 & 색상
const eventTypeLabels = {
  academic: '학사일정',
  exam: '시험',
  holiday: '공휴일/방학',
  event: '행사',
  registration: '수강신청'
};
const eventColors = {
  academic:    { color:'#3b82f6', bg:'rgba(59,130,246,0.2)', border:'rgba(59,130,246,0.3)' },
  exam:        { color:'#ef4444', bg:'rgba(239,68,68,0.2)',  border:'rgba(239,68,68,0.3)' },
  holiday:     { color:'#10b981', bg:'rgba(16,185,129,0.2)', border:'rgba(16,185,129,0.3)' },
  event:       { color:'#8b5cf6', bg:'rgba(139,92,246,0.2)', border:'rgba(139,92,246,0.3)' },
  registration:{ color:'#f59e0b', bg:'rgba(245,158,11,0.2)', border:'rgba(245,158,11,0.3)' }
};
const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

// 백엔드에서 일정 가져오기
async function fetchSchedule(semester) {
  const res = await fetch(`/api/academic-schedule?semester=${encodeURIComponent(semester)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json(); // [{id,title,date,endDate?,type,description,important,location?},...]
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 특정 날짜로 이동(로컬스토리지)
  const navDate = localStorage.getItem('navigateToCalendarDate');
  if (navDate) {
    const d = parseDateString(navDate);
    if (!isNaN(d)) currentDate = d;
    localStorage.removeItem('navigateToCalendarDate');
  }

  // 학기 선택
  const semSelect = document.getElementById('semesterSelect');
  if (semSelect) semSelect.addEventListener('change', changeSemester);

  // 필터 버튼
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click', () => filterEvents(btn.dataset.type))
  );

  // 모달 접근성 설정
  const modal = document.getElementById('eventDetailModal');
  const closeBtn = document.getElementById('closeModalBtn');
  if (modal) {
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','detailTitle');
    modal.hidden = true;
    modal.addEventListener('click', e => {
      if (e.target === modal) closeDetailModal();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDetailModal);
  }

  updateDisplay();
});

// 학기 변경
function changeSemester() {
  const sel = document.getElementById('semesterSelect');
  if (!sel) return;
  currentSemester = sel.value;
  updateDisplay();
}

// 필터 버튼 초기 활성화
function setActiveFilter() {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.filter-btn[data-type="${currentFilter}"]`);
  if (btn) btn.classList.add('active');
}

// 전체 화면 업데이트
async function updateDisplay() {
  clearError();
  showSpinner();
  try {
    currentSchedule = await fetchSchedule(currentSemester);
  } catch (err) {
    showError(err.message);
    currentSchedule = [];
  } finally {
    hideSpinner();
  }
  renderImportantCards();
  renderCalendar();
  renderEventsList();
  setActiveFilter();
  // 월별 제목 업데이트
  const titleList = document.getElementById('monthlyEventsTitle');
  if (titleList) {
    titleList.textContent = `${currentDate.getFullYear()}년 ${monthNames[currentDate.getMonth()]} 학사일정`;
  }
}

// 중요 일정 카드 렌더링
function renderImportantCards() {
  const container = document.getElementById('importantCards');
  if (!container) return;
  const today = new Date();

  const important = currentSchedule.filter(e => e.important);
  const future = important
    .filter(e => parseDateString(e.date) >= today)
    .sort((a,b) => parseDateString(a.date) - parseDateString(b.date));
  const past   = important
    .filter(e => parseDateString(e.date) < today)
    .sort((a,b) => parseDateString(b.date) - parseDateString(a.date));
  const display = future.concat(past).slice(0,6);

  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  display.forEach(ev => {
    const evDate = parseDateString(ev.date);
    const isPast = evDate < today;
    const colors = eventColors[ev.type] || eventColors.academic;

    const card = document.createElement('div');
    card.className = `important-card ${isPast?'past-event':''}`;
    card.style.setProperty('--card-color', colors.color);
    card.tabIndex = 0;
    card.setAttribute('role','button');
    card.setAttribute('aria-label', `${ev.title} ${formatDateKorean(ev.date)}`);

    const d = document.createElement('div');
    d.className = 'card-date';
    d.textContent = ev.endDate
      ? `${formatDateKorean(ev.date)} ~ ${formatDateKorean(ev.endDate)}`
      : formatDateKorean(ev.date);

    const t = document.createElement('div');
    t.className = 'card-title-text';
    t.textContent = ev.title + (isPast? ' (완료)' : '');

    const desc = document.createElement('div');
    desc.className = 'card-description';
    desc.textContent = ev.description;

    card.append(d, t, desc);
    card.addEventListener('click',    () => showEventDetail(ev));
    card.addEventListener('keydown', e => { if (e.key==='Enter') showEventDetail(ev); });
    frag.appendChild(card);
  });
  container.appendChild(frag);
}

// 캘린더 렌더링
function renderCalendar() {
  const year = currentDate.getFullYear(),
        month = currentDate.getMonth();
  const title = document.getElementById('currentMonthTitle');
  if (title) title.textContent = `${year}년 ${monthNames[month]}`;

  const first = new Date(year,month,1),
        last  = new Date(year,month+1,0),
        startWeek = first.getDay(),
        daysInMonth = last.getDate();

  const body = document.getElementById('calendarBody');
  if (!body) return;
  body.innerHTML = '';

  const frag = document.createDocumentFragment();
  for (let i=0; i<startWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty-cell';
    frag.appendChild(empty);
  }
  for (let d=1; d<=daysInMonth; d++) {
    frag.appendChild(createDayElement(d, new Date(year,month,d)));
  }
  const total = startWeek + daysInMonth;
  for (let i=total; i<42; i++) {
    const nextDay = i - total + 1;
    frag.appendChild(createDayElement(nextDay, new Date(year,month+1,nextDay), true));
  }
  body.appendChild(frag);
}

// 날짜 요소 생성
function createDayElement(num, date, isOther=false) {
  const el = document.createElement('div');
  el.className = 'calendar-day';
  if (isOther) el.classList.add('other-month');
  if (isToday(date)) el.classList.add('today');
  if (date.getDay()===0) el.classList.add('sunday');
  if (date.getDay()===6) el.classList.add('saturday');

  const dateStr = formatDate(date);
  const events  = getEventsForDate(dateStr);
  const holiday = events.some(e=>e.type==='holiday');

  const numDiv = document.createElement('div');
  numDiv.className = `day-number ${holiday?'holiday-date':''}`;
  numDiv.textContent = num;

  const dots = document.createElement('div');
  dots.className = 'day-events';
  dots.id = `events-${dateStr}`;

  el.append(numDiv, dots);
  if (!isOther && events.length>0) renderDayEvents(dateStr, events);
  return el;
}

// 하루 이벤트 점 렌더링
function renderDayEvents(dateStr, events) {
  const cont = document.getElementById(`events-${dateStr}`);
  if (!cont) return;
  const types = [...new Set(events.map(e=>e.type))].slice(0,5);
  types.forEach(tp => {
    const dot = document.createElement('div');
    dot.className = `event-dot ${tp}`;
    dot.title = events.filter(e=>e.type===tp).map(e=>e.title).join(', ');
    cont.appendChild(dot);
  });
}

// 일정 목록 렌더링
function renderEventsList() {
  const list = document.getElementById('eventsList');
  if (!list) return;
  const year  = currentDate.getFullYear(),
        month = currentDate.getMonth(),
        start = new Date(year,month,1),
        end   = new Date(year,month+1,0);

  let evs = currentSchedule.filter(e=>{
    const d1 = parseDateString(e.date),
          d2 = e.endDate ? parseDateString(e.endDate) : d1;
    return d1<=end && d2>=start;
  });
  if (currentFilter!=='all') evs = evs.filter(e=>e.type===currentFilter);
  evs.sort((a,b)=>parseDateString(a.date)-parseDateString(b.date));

  list.innerHTML = '';
  if (evs.length===0) {
    const none = document.createElement('div');
    none.style.cssText = 'text-align:center;color:#94a3b8;padding:2rem;';
    none.textContent = '해당 조건의 일정이 없습니다.';
    list.appendChild(none);
    return;
  }

  const frag = document.createDocumentFragment();
  evs.forEach(e=> {
    const colors = eventColors[e.type]||eventColors.academic;

    const item = document.createElement('div');
    item.className = 'event-item';
    item.style.setProperty('--event-color', colors.color);
    item.style.setProperty('--badge-bg', colors.bg);
    item.style.setProperty('--badge-color', colors.color);
    item.style.setProperty('--badge-border', colors.border);

    const header = document.createElement('div');
    header.className = 'event-header';
    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = e.title;
    const dateDiv = document.createElement('div');
    dateDiv.className = 'event-date';
    dateDiv.textContent = e.endDate
      ? `${formatDateKorean(e.date)} ~ ${formatDateKorean(e.endDate)}`
      : formatDateKorean(e.date);
    header.append(title, dateDiv);

    const desc = document.createElement('div');
    desc.className = 'event-description';
    desc.textContent = e.description;

    const badge = document.createElement('div');
    badge.className = 'event-type-badge';
    badge.textContent = eventTypeLabels[e.type] + (e.important?' ★':'');

    item.append(header, desc, badge);
    item.addEventListener('click', () => showEventDetail(e));
    frag.appendChild(item);
  });
  list.appendChild(frag);
}

// 필터 버튼
function filterEvents(type) {
  currentFilter = type;
  setActiveFilter();
  renderEventsList();
}

// 상세 모달 열기
function showEventDetail(ev) {
  lastFocusedElement = document.activeElement;
  const modal = document.getElementById('eventDetailModal');
  if (!modal) return;

  document.getElementById('detailTitle').textContent = ev.title;
  document.getElementById('detailDate').textContent =
    ev.endDate
      ? `${formatDateKorean(ev.date)} ~ ${formatDateKorean(ev.endDate)}`
      : formatDateKorean(ev.date);

  const per = document.getElementById('detailPeriod');
  const perText = document.getElementById('detailPeriodText');
  if (ev.endDate && per && perText) {
    per.style.display = 'flex';
    const days = Math.ceil((parseDateString(ev.endDate) - parseDateString(ev.date)) / (1000*60*60*24)) + 1;
    perText.textContent = `${days}일간`;
  } else if (per) {
    per.style.display = 'none';
  }

  const tp = document.getElementById('detailType');
  if (tp) {
    const col = eventColors[ev.type] || eventColors.academic;
    tp.textContent = eventTypeLabels[ev.type];
    tp.style.setProperty('--badge-bg', col.bg);
    tp.style.setProperty('--badge-color', col.color);
    tp.style.setProperty('--badge-border', col.border);
  }

  document.getElementById('detailDescription').textContent = ev.description;

  const loc = document.getElementById('detailLocation');
  const locText = document.getElementById('detailLocationText');
  if (ev.location && loc && locText) {
    loc.style.display = 'flex';
    locText.textContent = ev.location;
  } else if (loc) {
    loc.style.display = 'none';
  }

  modal.hidden = false;
  modal.tabIndex = -1;
  modal.focus();
  document.body.style.overflow = 'hidden';

  // 포커스 트랩 설정
  const focusable = Array.from(modal.querySelectorAll(focusableSelectors));
  let idx = 0;
  trapTabHandler = e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      idx = e.shiftKey ? (idx - 1 + focusable.length) % focusable.length : (idx + 1) % focusable.length;
      focusable[idx].focus();
    }
  };
  modal.addEventListener('keydown', trapTabHandler);
}

// 모달 닫기
function closeDetailModal() {
  const modal = document.getElementById('eventDetailModal');
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = 'auto';
  modal.removeEventListener('keydown', trapTabHandler);
  if (lastFocusedElement) lastFocusedElement.focus();
}

// 월 네비게이션
function prevMonth() { currentDate.setMonth(currentDate.getMonth() - 1); updateDisplay(); }
function nextMonth() { currentDate.setMonth(currentDate.getMonth() + 1); updateDisplay(); }
function goToToday()  { currentDate = new Date(); updateDisplay(); }

// 유틸
function formatDate(d) {
  const y = d.getFullYear(),
        m = String(d.getMonth()+1).padStart(2,'0'),
        dt = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dt}`;
}
function formatDateKorean(ds) {
  const d = new Date(ds),
        mm = d.getMonth()+1,
        dd = d.getDate(),
        wd = ['일','월','화','수','목','금','토'][d.getDay()];
  return `${mm}월 ${dd}일(${wd})`;
}
function isToday(d) {
  return d.toDateString() === new Date().toDateString();
}
function getEventsForDate(dateStr) {
  return currentSchedule.filter(e =>
    e.endDate
      ? (dateStr >= e.date && dateStr <= e.endDate)
      : (e.date === dateStr)
  );
}

// 키보드 내비게이션
document.addEventListener('keydown', e => {
  const modal = document.getElementById('eventDetailModal');
  if (e.key === 'Escape' && modal && !modal.hidden) {
    closeDetailModal();
  }
  if (document.activeElement === document.body) {
    if (e.key === 'ArrowLeft') prevMonth();
    if (e.key === 'ArrowRight') nextMonth();
  }
});

// academic-calendar.js

// ────────────── [ 1. 학사일정 데이터(샘플) ] ──────────────
const academicEventsBySemester = {
  "1": [
    { title: "1학기 개강", date: "2025-03-03", description: "2025학년도 1학기 개강", type: "academic" },
    { title: "수강신청 변경", date: "2025-03-04", description: "수강신청 변경 및 정정기간", type: "registration" },
    { title: "중간고사", date: "2025-04-21", endDate: "2025-04-25", description: "1학기 중간시험 기간", type: "exam" },
    { title: "근로자의 날", date: "2025-05-01", description: "법정 공휴일", type: "holiday" },
    { title: "대동제", date: "2025-05-15", description: "연성대학교 축제", type: "event" },
    { title: "기말고사", date: "2025-06-17", endDate: "2025-06-21", description: "1학기 기말시험 기간", type: "exam" },
    { title: "하계방학", date: "2025-06-23", description: "하계방학 시작", type: "holiday" }
  ],
  "summer": [
    { title: "여름 계절학기", date: "2025-06-30", endDate: "2025-07-11", description: "여름 계절학기", type: "academic" }
  ],
  "2": [
    { title: "2학기 개강", date: "2025-08-25", description: "2025학년도 2학기 개강", type: "academic" },
    { title: "수강신청 변경", date: "2025-08-26", description: "수강신청 변경 및 정정기간", type: "registration" },
    { title: "추석 연휴", date: "2025-09-06", endDate: "2025-09-08", description: "추석 연휴", type: "holiday" },
    { title: "중간고사", date: "2025-10-20", endDate: "2025-10-24", description: "2학기 중간시험 기간", type: "exam" },
    { title: "기말고사", date: "2025-12-08", endDate: "2025-12-12", description: "2학기 기말시험 기간", type: "exam" },
    { title: "동계방학", date: "2025-12-15", description: "동계방학 시작", type: "holiday" }
  ],
  "winter": [
    { title: "겨울 계절학기", date: "2025-12-22", endDate: "2026-01-02", description: "겨울 계절학기", type: "academic" }
  ]
};

// ────────────── [ 2. 상태 변수 선언 ] ──────────────
let selectedSemester = "1";
let academicEvents = [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let filterType = "all";

// ────────────── [ 3. 초기화 ] ──────────────
document.addEventListener("DOMContentLoaded", () => {
  loadSemester(selectedSemester);
  document.getElementById("semesterSelect").value = selectedSemester;
});

// ────────────── [ 4. 학기 선택시 이벤트 ] ──────────────
function changeSemester() {
  const sem = document.getElementById("semesterSelect").value;
  selectedSemester = sem;
  loadSemester(sem);
}

// ────────────── [ 5. 학기 로드: 월/이벤트/카드 렌더링 ] ──────────────
function loadSemester(semester) {
  academicEvents = (academicEventsBySemester[semester] || []).map(ev => ({ ...ev })); // 깊은 복사
  currentDate = new Date();
  if (semester === "2") currentMonth = 7; // 2학기: 8월부터
  else if (semester === "winter") currentMonth = 11;
  else currentMonth = currentDate.getMonth();
  currentYear = currentDate.getFullYear();
  filterType = "all";
  renderCurrentMonth();
  renderSummaryCards();
  renderEventsList();
  activateFilterButton("all");
}

// ────────────── [ 6. 월 이동 / 오늘로 이동 ] ──────────────
function prevMonth() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderCurrentMonth();
}
function nextMonth() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderCurrentMonth();
}
function goToToday() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCurrentMonth();
}

// ────────────── [ 7. 월/캘린더 렌더링 ] ──────────────
function renderCurrentMonth() {
  // 상단 월명 업데이트
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];
  document.getElementById('currentMonth').innerText =
    `${currentYear}년 ${monthNames[currentMonth]}`;
  // 월별 타이틀도 변경
  document.getElementById('monthlyTitle').innerText =
    `${currentYear}년 ${monthNames[currentMonth]} 학사일정`;
  renderCalendarBody(currentYear, currentMonth);
}

// ────────────── [ 8. 캘린더 본체(날짜 및 일정 표시) ] ──────────────
function renderCalendarBody(year, month) {
  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = "";
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let firstDayOfWeek = firstDay.getDay(); // 일(0) ~ 토(6)
  let totalDays = lastDay.getDate();

  let cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  for (let i = 0; i < cells.length; i++) {
    const dayNum = cells[i];
    const cell = document.createElement('div');
    cell.className = "calendar-day";
    if (dayNum === null) {
      cell.classList.add("other-month");
      cell.innerHTML = "";
    } else {
      // 오늘 날짜 강조
      if (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === dayNum
      ) {
        cell.classList.add("today");
      }
      // 요일 강조
      if ((i % 7) === 0) cell.classList.add("sunday");
      if ((i % 7) === 6) cell.classList.add("saturday");

      // 날짜 + 일정 표시
      cell.innerHTML = `<div class="day-number">${dayNum}</div><div class="day-events"></div>`;
      const eventsHere = getEventsOnDate(year, month + 1, dayNum);
      let eventsDiv = cell.querySelector('.day-events');
      eventsHere.forEach(ev => {
        const eDiv = document.createElement('div');
        eDiv.className = `event-item ${ev.type}`;
        eDiv.innerText = ev.title;
        eDiv.onclick = e => { e.stopPropagation(); showDetailModal(ev); };
        eventsDiv.appendChild(eDiv);
      });
    }
    calendarBody.appendChild(cell);
  }
}

// ────────────── [ 9. 해당 날짜에 있는 이벤트 추출 ] ──────────────
function getEventsOnDate(year, month, day) {
  // month는 1부터, day도 1부터
  return academicEvents.filter(ev => {
    // 기간성(시작~끝)이면, 그 안에 포함
    if (ev.endDate) {
      const d1 = new Date(ev.date);
      const d2 = new Date(ev.endDate);
      const d = new Date(year, month - 1, day);
      return d >= d1 && d <= d2;
    }
    // 단일일정
    const d = new Date(ev.date);
    return d.getFullYear() === year && (d.getMonth() + 1) === month && d.getDate() === day;
  });
}

// ────────────── [ 10. 주요 일정 카드 렌더링 ] ──────────────
function renderSummaryCards() {
  const summaryCards = document.getElementById('summaryCards');
  summaryCards.innerHTML = "";
  // 가장 가까운 향후 일정 3개
  const now = new Date();
  const soon = academicEvents.filter(ev => {
    let start = new Date(ev.date);
    let end = ev.endDate ? new Date(ev.endDate) : start;
    return end >= now;
  }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
  soon.forEach(ev => {
    let c = document.createElement('div');
    c.className = "summary-card";
    let dateText = ev.endDate ? `${ev.date} ~ ${ev.endDate}` : ev.date;
    c.innerHTML = `
      <h4>${ev.title}</h4>
      <div class="date">${dateText}</div>
      <div class="description">${ev.description}</div>
    `;
    c.onclick = () => showDetailModal(ev);
    summaryCards.appendChild(c);
  });
}

// ────────────── [ 11. 일정 목록(카드) 렌더링 + 필터 ] ──────────────
function renderEventsList(type = "all") {
  const eventsList = document.getElementById('eventsList');
  eventsList.innerHTML = "";
  let showEvents = academicEvents;
  if (type !== "all") {
    showEvents = showEvents.filter(ev => ev.type === type);
  }
  // 현재 월 내 일정만
  const thisMonthEvents = showEvents.filter(ev => {
    const d = new Date(ev.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  if (thisMonthEvents.length === 0) {
    eventsList.innerHTML = `<div style="padding:36px;color:#888;font-size:1.1rem;">일정이 없습니다.</div>`;
    return;
  }
  thisMonthEvents.forEach(ev => {
    let card = document.createElement('div');
    card.className = "event-card";
    let dateText = ev.endDate ? `${ev.date} ~ ${ev.endDate}` : ev.date;
    card.innerHTML = `
      <div class="event-card-header">
        <span class="event-card-title">${ev.title}</span>
        <span class="event-card-date">${dateText}</span>
      </div>
      <div>${ev.description}</div>
    `;
    card.onclick = () => showDetailModal(ev);
    eventsList.appendChild(card);
  });
}

// ────────────── [ 12. 필터 버튼 UI 활성화 ] ──────────────
function filterEvents(type) {
  filterType = type;
  activateFilterButton(type);
  renderEventsList(type);
}
function activateFilterButton(type) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.querySelector(`.filter-btn[data-type="${type}"]`);
  if (btn) btn.classList.add('active');
}

// ────────────── [ 13. 일정 상세 모달 ] ──────────────
function showDetailModal(ev) {
  document.getElementById('detailTitle').innerText = ev.title;
  let dateText = ev.endDate ? `${ev.date} ~ ${ev.endDate}` : ev.date;
  document.getElementById('detailDate').innerText = dateText;
  document.getElementById('detailDescription').innerText = ev.description;
  document.getElementById('detailType').innerText =
    (ev.type === "academic" ? "학사" :
     ev.type === "exam" ? "시험" :
     ev.type === "holiday" ? "휴일" :
     ev.type === "event" ? "행사" :
     ev.type === "registration" ? "수강신청" : "-");
  // 기간 항목
  if (ev.endDate) {
    document.getElementById('detailPeriod').style.display = "";
    document.getElementById('detailPeriodText').innerText = `${ev.date} ~ ${ev.endDate}`;
  } else {
    document.getElementById('detailPeriod').style.display = "none";
  }
  // 장소 (추후 확장)
  if (ev.location) {
    document.getElementById('detailLocation').style.display = "";
    document.getElementById('detailLocationText').innerText = ev.location;
  } else {
    document.getElementById('detailLocation').style.display = "none";
  }
  document.getElementById('eventDetailModal').style.display = "block";
}
function closeDetailModal() {
  document.getElementById('eventDetailModal').style.display = "none";
}

// ────────────── [ 14. 모달 외부 클릭시 닫힘 ] ──────────────
window.onclick = function(event) {
  const modal = document.getElementById('eventDetailModal');
  if (event.target === modal) {
    closeDetailModal();
  }
};

// ────────────── [ 15. 키보드 ESC로 모달 닫기 ] ──────────────
document.addEventListener('keydown', function(event) {
  if (event.key === "Escape") {
    closeDetailModal();
  }
});

/**
 * academic-calendar.js
 * ───────────────────────────────────────────────────────────────────────────
 * 수정된 JS: 오직 빈 달력 그리기만 수행하도록 변경 (이벤트 데이터/리스트 제거)
 * ───────────────────────────────────────────────────────────────────────────
 */

let currentDate = new Date(); // 오늘 기준

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar(); // 처음 로드 시 달력만 그리기

  // 달력 네비게이션 버튼에 이벤트 연결
  document.getElementById('prevMonthBtn').addEventListener('click', goPrevMonth);
  document.getElementById('nextMonthBtn').addEventListener('click', goNextMonth);
  document.getElementById('todayBtn').addEventListener('click', goToToday);
});

/**
 * 달력을 다시 그리는 함수
 * - 날짜 번호만 표시하고, 이벤트나 리스트 등은 전혀 출력하지 않습니다.
 */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 ~ 11

  // 상단에 “YYYY년 M월” 출력
  const monthLabel = document.getElementById('currentMonthLabel');
  monthLabel.textContent = `${year}년 ${month + 1}월`;

  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = ''; // 기존 내용 지우기

  // 해당 월의 1일, 마지막 일, 시작 요일 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startWeekday = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)

  // 1) 이전 달에 해당하는 빈 칸 생성
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-cell', 'other-month');
    calendarBody.appendChild(emptyCell);
  }

  // 2) 이번 달 날짜 칸을 순차적으로 생성
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');

    // 오늘인 경우 강조 스타일 추가 (CSS에서 .today 배경색 등 처리)
    const cellDate = new Date(year, month, day);
    const today = new Date();
    if (
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getDate() === today.getDate()
    ) {
      cell.classList.add('today');
    }

    // 날짜 숫자 표시
    const num = document.createElement('div');
    num.classList.add('day-number');
    num.textContent = day;
    cell.appendChild(num);

    // (이벤트 데이터가 없으므로, 이벤트 영역은 전부 비워둡니다.)
    // 예시: cell.appendChild(document.createElement('div')).classList.add('day-events');
    // → 삭제했으므로 빈 달력입니다.

    calendarBody.appendChild(cell);
  }

  // 3) 다음 달에 해당하는 빈 칸 생성 (총 셀 개수가 7의 배수가 되도록)
  const totalCells = startWeekday + daysInMonth;
  const nextBlanks = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < nextBlanks; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-cell', 'other-month');
    calendarBody.appendChild(emptyCell);
  }

  // 4) 마지막 행에 있는 셀들은 바닥 테두리를 지우기 위해 'calendar-row-end' 클래스 추가
  const allCells = calendarBody.querySelectorAll('.calendar-cell');
  const rows = Math.ceil(allCells.length / 7);
  for (let r = 0; r < rows; r++) {
    if (r === rows - 1) {
      // 마지막 행
      for (let c = 0; c < 7; c++) {
        const idx = r * 7 + c;
        if (allCells[idx]) {
          allCells[idx].classList.add('calendar-row-end');
        }
      }
    }
  }
}

/**
 * 이전 달로 이동 후 다시 그리기
 */
function goPrevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

/**
 * 다음 달로 이동 후 다시 그리기
 */
function goNextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

/**
 * 오늘이 있는 달로 돌아가기
 */
function goToToday() {
  currentDate = new Date();
  renderCalendar();
}

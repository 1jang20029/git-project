/**
 * academic-calendar.js
 * ───────────────────────────────────────────────────────────────────────────
 * 수정 버전: 이벤트/데이터 호출 부분을 모두 제거하고
 *            빈 달력(월·일자만)만 그리도록 순수화했습니다.
 * (원본 HTML/CSS는 건드리지 않고, ID나 함수 이름도 그대로 유지)
 * ───────────────────────────────────────────────────────────────────────────
 */

let currentDate = new Date(); // “현재 보고 있는 달”을 저장

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar(); // 페이지 로드 시 달력만 그리기

  // HTML에서 onclick으로 걸어둔 prevMonth, nextMonth, goToToday 함수가 이 파일 안에서 정의됩니다.
});

/**
 * 달력을 다시 그려주는 함수
 * – “학사일정” 데이터 없이, 날짜 숫자만 표시된 빈 달력(6줄 × 7열)으로 생성합니다.
 * – 원래 있던 이벤트나 일정 출력 코드는 모두 지웠습니다.
 */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0(1월) ~ 11(12월)

  // 상단에 표시할 “YYYY년 M월” 문자열
  const monthLabel = document.getElementById('currentMonth');
  monthLabel.textContent = `${year}년 ${month + 1}월`;

  // 달력 body 컨테이너
  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = ''; // 이전에 그려진 모든 셀을 지우고 다시 그리기

  // 해당 월의 1일, 마지막 일, 시작 요일 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth  = new Date(year, month + 1, 0);
  const daysInMonth     = lastDayOfMonth.getDate();
  const startWeekday    = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)

  // 1) 이전 달에 해당하는 빈칸(’other-month’) 생성
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-cell', 'other-month');
    calendarBody.appendChild(emptyCell);
  }

  // 2) 이번 달 날짜 셀 생성 (1일부터 daysInMonth일까지)
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');

    // “오늘”인 날짜면 강조
    const cellDate = new Date(year, month, day);
    const today    = new Date();
    if (
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth()    === today.getMonth() &&
      cellDate.getDate()     === today.getDate()
    ) {
      cell.classList.add('today');
    }

    // 날짜 숫자 표시
    const num = document.createElement('div');
    num.classList.add('day-number');
    num.textContent = day;
    cell.appendChild(num);

    // (이벤트 데이터를 모두 제거했으므로, 이 아래에 day-events 같은 요소도 없습니다.)

    calendarBody.appendChild(cell);
  }

  // 3) 다음 달에 해당하는 빈칸 생성 (총 셀 개수가 7의 배수가 되도록)
  const totalCells = startWeekday + daysInMonth;
  const nextBlanks = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < nextBlanks; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-cell', 'other-month');
    calendarBody.appendChild(emptyCell);
  }

  // 4) 마지막 행에는 아래쪽 테두리를 없애기 위해 'calendar-row-end' 클래스 추가
  const allCells = calendarBody.querySelectorAll('.calendar-cell');
  const rows     = Math.ceil(allCells.length / 7);
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
 * 이전 달 보기 버튼 클릭 → 현재 달에서 한 달 빼고 다시 그리기
 */
function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

/**
 * 다음 달 보기 버튼 클릭 → 현재 달에서 한 달 더하고 다시 그리기
 */
function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

/**
 * “오늘” 버튼 클릭 → currentDate를 오늘로 설정하고 다시 그리기
 */
function goToToday() {
  currentDate = new Date();
  renderCalendar();
}

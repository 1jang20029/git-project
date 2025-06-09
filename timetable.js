// 시간표 시간(범례): 08:00 ~ 20:00 (13개)
const TIME_LABELS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

// 표 렌더링 (시간만, 수업 없는 기본표)
function renderEmptyTimetable() {
  const tbody = document.querySelector('#timetable-table tbody');
  tbody.innerHTML = '';
  for (let i = 0; i < TIME_LABELS.length; i++) {
    const tr = document.createElement('tr');
    // 왼쪽 시간
    const tdTime = document.createElement('td');
    tdTime.className = 'time-col';
    tdTime.textContent = TIME_LABELS[i];
    tr.appendChild(tdTime);
    // 요일 (월~금)
    for (let j = 0; j < 5; j++) {
      const td = document.createElement('td');
      td.innerHTML = ''; // 비워둠
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

// DOMContentLoaded 시 렌더
document.addEventListener('DOMContentLoaded', renderEmptyTimetable);

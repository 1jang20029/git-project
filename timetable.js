// 시간표 기본 정보
const START_HOUR = 9;
const END_HOUR = 18;
const DAYS = ["월", "화", "수", "목", "금"];

// 수업 리스트 (예: { subject, day, start, end })
let classList = [];

// 시간표 표 생성
function createTimetable() {
  const tbody = document.getElementById('timetable-body');
  tbody.innerHTML = '';
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const tr = document.createElement('tr');
    // 시간 열
    const th = document.createElement('th');
    th.className = 'tt-time-col';
    th.textContent = `${hour}:00`;
    tr.appendChild(th);
    // 요일별 열
    for (let d = 0; d < 5; d++) {
      const td = document.createElement('td');
      td.style.position = "relative";
      td.dataset.day = d + 1;
      td.dataset.hour = hour;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  renderClasses();
}

// 수업 블록 렌더링
function renderClasses() {
  // 기존 블록 제거
  document.querySelectorAll('.tt-class-block').forEach(e => e.remove());
  for (const cls of classList) {
    // (요일-1, 시작시간~종료시간까지) 셀 범위 계산
    for (let h = cls.start; h < cls.end; h++) {
      const cell = document.querySelector(
        `.tt-table td[data-day="${cls.day}"][data-hour="${h}"]`
      );
      if (!cell) continue;
      // 시작시간에만 블록 추가 (rowspan대신 absolute+height)
      if (h === cls.start) {
        const block = document.createElement('div');
        block.className = 'tt-class-block';
        block.style.top = '6px';
        block.style.bottom = '6px';
        block.style.height = `calc(100% * ${cls.end - cls.start} + ${(cls.end - cls.start - 1) * 2}px)`;
        block.style.zIndex = 2;
        block.textContent = cls.subject;
        // 삭제 버튼
        const removeBtn = document.createElement('button');
        removeBtn.className = 'tt-remove-btn';
        removeBtn.textContent = '×';
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm('이 수업을 삭제할까요?')) {
            classList = classList.filter(c => c !== cls);
            createTimetable();
          }
        };
        block.appendChild(removeBtn);
        block.title = `${DAYS[cls.day-1]} ${cls.start}:00~${cls.end}:00`;
        block.style.position = 'absolute';
        block.style.width = 'calc(100% - 12px)';
        block.style.left = '0';
        block.style.top = `calc(((${cls.start} - ${START_HOUR}) * 100%) + 6px)`;
        block.style.height = `calc(100% * (${cls.end - cls.start}))`;
        cell.appendChild(block);
      }
    }
  }
}

// 팝업 열기/닫기
const modal = document.getElementById('classModal');
document.getElementById('addClassBtn').onclick = () => showClassModal();
document.getElementById('addClassCancel').onclick = () => modal.classList.remove('show');
document.getElementById('addClassSubmit').onclick = addClass;

function showClassModal() {
  document.getElementById('subjectInput').value = '';
  document.getElementById('dayInput').value = '1';
  fillTimeOptions();
  modal.classList.add('show');
}

function fillTimeOptions() {
  const st = document.getElementById('startTimeInput');
  const et = document.getElementById('endTimeInput');
  st.innerHTML = '';
  et.innerHTML = '';
  for (let h = START_HOUR; h < END_HOUR; h++) {
    st.innerHTML += `<option value="${h}">${h}:00</option>`;
    et.innerHTML += `<option value="${h+1}">${h+1}:00</option>`;
  }
  st.onchange = function() {
    const v = parseInt(this.value);
    et.innerHTML = '';
    for (let h = v+1; h <= END_HOUR; h++) {
      et.innerHTML += `<option value="${h}">${h}:00</option>`;
    }
  };
}

// 수업 추가 처리
function addClass() {
  const subject = document.getElementById('subjectInput').value.trim();
  const day = parseInt(document.getElementById('dayInput').value);
  const start = parseInt(document.getElementById('startTimeInput').value);
  const end = parseInt(document.getElementById('endTimeInput').value);
  // 입력 유효성 검사
  if (!subject) {
    alert('과목명을 입력하세요.');
    return;
  }
  if (isNaN(day) || isNaN(start) || isNaN(end) || end <= start) {
    alert('시간을 정확히 입력하세요.');
    return;
  }
  // 겹치는 수업 확인
  for (const c of classList) {
    if (c.day === day && Math.max(c.start, start) < Math.min(c.end, end)) {
      alert('해당 시간에 이미 수업이 있습니다.');
      return;
    }
  }
  classList.push({ subject, day, start, end });
  modal.classList.remove('show');
  createTimetable();
}

// 최초 표 생성
window.onload = createTimetable;

// 팝업 외부 클릭시 닫기
modal.onclick = function(e) {
  if (e.target === modal) modal.classList.remove('show');
};

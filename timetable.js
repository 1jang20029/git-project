// ==================================================================================
// PC 웹 브라우저 최적화 시간표 JavaScript
// Node.js + MySQL 백엔드 연동 (프론트엔드 부분만 수정)
// ==================================================================================

// 글로벌 변수 선언
let courses = [];
let settings = {
    showWeekend: true,
    showProfessor: true,
    showRoom: true,
    timeFormat24: true,
    appearance: 'dark'
};
let currentSemester = {
    year: 2023,
    term: 1
};
let currentTimetable = {
    id: null,
    name: ""
};
let timetables = [
    // 초기 로드 시 API로 덮어씌워집니다
];

// 시간 데이터 (교시별 시작 시간)
const timeData = [
    { period: 1, startTime: "9:00" },
    { period: 2, startTime: "10:00" },
    { period: 3, startTime: "11:00" },
    { period: 4, startTime: "12:00" },
    { period: 5, startTime: "13:00" },
    { period: 6, startTime: "14:00" },
    { period: 7, startTime: "15:00" },
    { period: 8, startTime: "16:00" },
    { period: 9, startTime: "17:00" },
    { period: 10, startTime: "18:00" }
];

// 요일 데이터
const dayData = ["", "월", "화", "수", "목", "금", "토"];

// 학점 평가 변환표 (학점 평가 -> 점수)
const gradePoints = {
    "A+": 4.5, "A0": 4.0, "A-": 3.7,
    "B+": 3.3, "B0": 3.0, "B-": 2.7,
    "C+": 2.3, "C0": 2.0, "C-": 1.7,
    "D+": 1.3, "D0": 1.0, "D-": 0.7,
    "F": 0.0, "P": null, "NP": null
};

// ==================================================================================
// - 백엔드 호출 헬퍼 함수
// ==================================================================================
async function apiGet(path) {
    const res = await fetch(path, { credentials: 'include' });
    if (!res.ok) throw new Error(`${path} GET 실패: ${res.status}`);
    return res.json();
}

async function apiPost(path, data) {
    const res = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`${path} POST 실패: ${res.status}`);
    return res.json();
}

async function apiPut(path, data) {
    const res = await fetch(path, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`${path} PUT 실패: ${res.status}`);
    return res.json();
}

async function apiDelete(path) {
    const res = await fetch(path, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`${path} DELETE 실패: ${res.status}`);
}

// ==================================================================================
// 초기화 및 이벤트 핸들러
// ==================================================================================
document.addEventListener('DOMContentLoaded', async function() {
    try {
        setCurrentSemester();
        await loadSettings();
        await loadTimetablesFromStorage();
        updateTimetableSelector();
        await loadCoursesFromStorage();
        document.getElementById('semester-select').value = `${currentSemester.year}-${currentSemester.term}`;
        createTimetable();
        renderCourseList();
        calculateGrades();
        updatePageTitle();
        applySettingsToUI();
        setupEventListeners();
    } catch (err) {
        console.error('초기 로드 중 오류:', err);
        alert('초기 데이터 로드에 실패했습니다.');
    }
});

function setupEventListeners() {
    // ESC 키 이벤트
    document.addEventListener('keydown', handleEscapeKey);

    // 모달 외부 클릭 이벤트
    document.getElementById('course-modal').addEventListener('click', handleModalOutsideClick);
    document.getElementById('settings-modal').addEventListener('click', handleModalOutsideClick);

    // 드롭다운 외부 클릭 이벤트
    document.addEventListener('click', handleDropdownOutsideClick);

    // 창 크기 변경 이벤트
    window.addEventListener('resize', handleWindowResize);

    // 설정 변경 이벤트 (실시간 미리보기)
    const settingsInputs = [
        'show-professor', 'show-room', 'theme-select',
        'time-format-select', 'weekend-select'
    ];
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', handleSettingsPreview);
        }
    });
}

// ==================================================================================
// 현재 날짜를 기준으로 학기 설정
// ==================================================================================
function setCurrentSemester() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (currentMonth >= 3 && currentMonth <= 6) {
        currentSemester.year = currentYear;
        currentSemester.term = 1;
    } else if (currentMonth >= 9 && currentMonth <= 12) {
        currentSemester.year = currentYear;
        currentSemester.term = 2;
    } else if (currentMonth >= 1 && currentMonth <= 2) {
        currentSemester.year = currentYear - 1;
        currentSemester.term = 2;
    } else {
        currentSemester.year = currentYear;
        currentSemester.term = 1;
    }
}

// ==================================================================================
// 백엔드 연동: 시간표 및 과목, 설정 로드/저장/삭제
// ==================================================================================

// 시간표 목록 로드
async function loadTimetablesFromStorage() {
    try {
        timetables = await apiGet('/api/timetables');
        if (!currentTimetable.id && timetables.length) {
            currentTimetable = timetables[0];
        }
    } catch (err) {
        console.error('시간표 목록 로드 오류:', err);
        alert('시간표를 불러오는 데 실패했습니다.');
    }
}

// 과목 데이터 로드
async function loadCoursesFromStorage() {
    try {
        const qs = `?year=${currentSemester.year}&term=${currentSemester.term}&timetableId=${currentTimetable.id}`;
        courses = await apiGet(`/api/courses${qs}`);
    } catch (err) {
        console.error('과목 데이터 로드 오류:', err);
        courses = [];
    }
}

// 설정 로드
async function loadSettings() {
    try {
        const data = await apiGet('/api/settings');
        settings = { ...settings, ...data };
    } catch (err) {
        console.warn('설정 불러오기 실패, 기본값 사용');
    }
}

// 설정 저장
async function saveSettings() {
    try {
        const payload = {
            showWeekend: settings.showWeekend,
            showProfessor: settings.showProfessor,
            showRoom: settings.showRoom,
            timeFormat24: settings.timeFormat24,
            appearance: settings.appearance
        };
        await apiPut('/api/settings', payload);
        alert('설정이 저장되었습니다.');
    } catch (err) {
        console.error('설정 저장 오류:', err);
        alert('설정 저장에 실패했습니다.');
    }
}

// 과목 저장 (추가/수정)
async function saveCourse(event) {
    event.preventDefault();

    // 시간 슬롯 수집 및 충돌 검사
    const slotEls = document.querySelectorAll('.time-slot');
    const slots = Array.from(slotEls).map(slot => ({
        day: parseInt(slot.querySelector('.day-select').value, 10),
        start: parseInt(slot.querySelector('.start-select').value, 10),
        end: parseInt(slot.querySelector('.end-select').value, 10)
    }));

    // 같은 과목 내 시간 겹침 검사
    for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
            if (
                slots[i].day === slots[j].day &&
                slots[i].start <= slots[j].end &&
                slots[j].start <= slots[i].end
            ) {
                showTimeError('⚠️ 같은 과목 내에 시간이 겹칩니다.');
                return;
            }
        }
    }

    // 다른 과목과 시간 겹침 검사
    for (let s of slots) {
        for (let c of courses) {
            const editingId = document.getElementById('course-id').value;
            if (editingId && c.id === parseInt(editingId, 10)) continue;
            for (let t of c.times) {
                if (
                    s.day === t.day &&
                    s.start <= t.end &&
                    t.start <= s.end
                ) {
                    showTimeError('⚠️ 해당 시간대에 이미 다른 과목이 있습니다.');
                    return;
                }
            }
        }
    }
    removeTimeError();

    const courseId = document.getElementById('course-id').value || null;
    const courseData = {
        name: document.getElementById('course-name').value.trim(),
        professor: document.getElementById('course-professor').value.trim(),
        credits: parseInt(document.getElementById('course-credits').value, 10),
        type: document.getElementById('course-type').value,
        room: document.getElementById('course-room').value.trim(),
        color: document.getElementById('course-color').value,
        grade: document.getElementById('course-grade').value || null,
        times: slots,
        semester: { year: currentSemester.year, term: currentSemester.term },
        timetableId: currentTimetable.id
    };

    try {
        if (courseId) {
            await apiPut(`/api/courses/${courseId}`, courseData);
        } else {
            await apiPost('/api/courses', courseData);
        }
        await loadCoursesFromStorage();
        renderCourseList();
        renderCoursesOnTimetable();
        calculateGrades();
        closeModal();
    } catch (err) {
        console.error('과목 저장 오류:', err);
        alert('과목 저장에 실패했습니다.');
    }
}

// 과목 삭제
async function deleteCourse(courseId) {
    if (!confirm('정말 이 과목을 삭제하시겠습니까?')) return;
    try {
        await apiDelete(`/api/courses/${courseId}`);
        await loadCoursesFromStorage();
        renderCourseList();
        renderCoursesOnTimetable();
        calculateGrades();
    } catch (err) {
        console.error('과목 삭제 오류:', err);
        alert('과목 삭제에 실패했습니다.');
    }
}

// 시간표 삭제 (드롭다운)
async function deleteTimetableFromDropdown(timetableId) {
    if (timetables.length <= 1) {
        alert('마지막 시간표는 삭제할 수 없습니다.');
        return;
    }
    if (!confirm('정말 이 시간표를 삭제하시겠습니까?')) return;

    try {
        await apiDelete(`/api/timetables/${timetableId}`);
        timetables = timetables.filter(t => t.id !== timetableId);
        if (currentTimetable.id === timetableId) {
            currentTimetable = timetables[0];
            updatePageTitle();
        }
        updateTimetableSelector();
        await loadCoursesFromStorage();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
    } catch (err) {
        console.error('시간표 삭제 오류:', err);
        alert('시간표 삭제에 실패했습니다.');
    }
}

// 시간표 이름 변경
async function renameTimetable() {
    const newName = prompt("시간표 이름을 입력하세요:", currentTimetable.name);
    if (!newName || !newName.trim()) return;

    try {
        const payload = { name: newName.trim() };
        await apiPut(`/api/timetables/${currentTimetable.id}`, payload);
        currentTimetable.name = newName.trim();
        timetables = timetables.map(t => t.id === currentTimetable.id ? currentTimetable : t);
        updateTimetableSelector();
        updatePageTitle();
    } catch (err) {
        console.error('이름 변경 오류:', err);
        alert('시간표 이름 변경에 실패했습니다.');
    }
}

// 새 시간표 추가
async function addNewTimetable() {
    const newName = prompt("새 시간표 이름을 입력하세요:", "새 시간표");
    if (!newName || !newName.trim()) return;

    try {
        const created = await apiPost('/api/timetables', { name: newName.trim() });
        timetables.push(created);
        currentTimetable = created;
        updateTimetableSelector();
        updatePageTitle();
        await loadCoursesFromStorage();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
    } catch (err) {
        console.error('새 시간표 추가 오류:', err);
        alert('새 시간표 생성에 실패했습니다.');
    }
}

// ==================================================================================
// 이벤트 핸들러 함수들 (ESC, 모달 닫기, 드롭다운 등)
// ==================================================================================
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        if (document.getElementById('course-modal').style.display === 'flex') {
            closeModal();
        } else if (document.getElementById('settings-modal').style.display === 'flex') {
            closeSettings();
        }
        const dropdownMenu = document.getElementById('timetable-menu');
        if (dropdownMenu && dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        }
    }
}

function handleModalOutsideClick(event) {
    if (event.target === event.currentTarget) {
        if (event.currentTarget.id === 'course-modal') {
            closeModal();
        } else if (event.currentTarget.id === 'settings-modal') {
            closeSettings();
        }
    }
}

function handleDropdownOutsideClick(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById('timetable-menu').style.display = 'none';
    }
}

let resizeTimer;
function handleWindowResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCoursesOnTimetable, 250);
}

function handleSettingsPreview() {
    if (document.getElementById('settings-modal').style.display === 'flex') {
        const tempSettings = {
            showProfessor: document.getElementById('show-professor').checked,
            showRoom: document.getElementById('show-room').checked,
            appearance: document.getElementById('theme-select').value,
            timeFormat24: document.getElementById('time-format-select').value === '24',
            showWeekend: document.getElementById('weekend-select').value === 'true'
        };
        applyTempSettings(tempSettings);
    }
}

// ==================================================================================
// 커스텀 드롭다운 및 시간표 관리 UI 함수들
// ==================================================================================
function toggleTimetableDropdown() {
    const menu = document.getElementById('timetable-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    updateTimetableMenu();
}

function updateTimetableMenu() {
    const menu = document.getElementById('timetable-menu');
    menu.innerHTML = '';
    timetables.forEach(timetable => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        if (timetable.id === currentTimetable.id) item.classList.add('selected');
        item.innerHTML = `
            <span>${timetable.name}</span>
            <button class="delete-button" onclick="deleteTimetableFromDropdown(${timetable.id})" title="시간표 삭제">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-button')) {
                selectTimetable(timetable.id);
                toggleTimetableDropdown();
            }
        });
        menu.appendChild(item);
    });
}

async function selectTimetable(timetableId) {
    const timetable = timetables.find(t => t.id === timetableId);
    if (!timetable) return;
    currentTimetable = timetable;
    document.getElementById('selected-timetable').textContent = timetable.name;
    updatePageTitle();
    await loadCoursesFromStorage();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// ==================================================================================
// 학기 변경
// ==================================================================================
async function changeSemester() {
    const semesterSelect = document.getElementById('semester-select');
    const [year, term] = semesterSelect.value.split('-').map(v => parseInt(v, 10));
    currentSemester.year = year;
    currentSemester.term = term;
    await loadCoursesFromStorage();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// ==================================================================================
// 시간표 생성 및 렌더링
// ==================================================================================
function createTimetable() {
    const tbody = document.getElementById('timetable-body');
    tbody.innerHTML = '';
    for (let i = 0; i < timeData.length; i++) {
        const { period, startTime } = timeData[i];
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.className = 'time-col';
        if (settings.timeFormat24) {
            timeCell.innerHTML = `${period}교시<br>${startTime}`;
        } else {
            const hour = parseInt(startTime.split(':')[0], 10);
            const minute = startTime.split(':')[1];
            const ampm = hour >= 12 ? '오후' : '오전';
            const displayHour = hour > 12 ? hour - 12 : hour;
            timeCell.innerHTML = `${period}교시<br>${ampm} ${displayHour}:${minute}`;
        }
        row.appendChild(timeCell);

        const maxDays = settings.showWeekend ? 6 : 5;
        for (let day = 1; day <= maxDays; day++) {
            const cell = document.createElement('td');
            cell.className = 'class-cell';
            cell.dataset.day = day;
            cell.dataset.period = period;
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }

    const headerCells = document.querySelectorAll('.timetable th');
    if (!settings.showWeekend && headerCells.length > 6) {
        headerCells[6].style.display = 'none';
    } else if (settings.showWeekend && headerCells.length > 6) {
        headerCells[6].style.display = '';
    }

    renderCoursesOnTimetable();
}

function renderCoursesOnTimetable() {
    const container = document.querySelector('.timetable-container');
    const baseRect = container.getBoundingClientRect();
    container.querySelectorAll('.class-item').forEach(el => el.remove());
    const sampleCell = container.querySelector('.class-cell[data-day="1"][data-period="1"]');
    if (!sampleCell) return;
    const cellRect = sampleCell.getBoundingClientRect();
    const cellH = cellRect.height, cellW = cellRect.width;

    courses.forEach(course => {
        course.times.forEach(t => {
            const x = cellRect.left - baseRect.left + (t.day - 1) * cellW;
            const y = cellRect.top - baseRect.top + (t.start - 1) * cellH + cellH * 0.5;
            const h = (t.end - t.start + 1) * cellH;

            const block = document.createElement('div');
            block.className = `class-item ${course.color}`;
            Object.assign(block.style, {
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${cellW}px`,
                height: `${h}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                overflow: 'hidden',
                zIndex: 5
            });

            const nameHTML = `<div class="class-name">${course.name}</div>`;
            const infoParts = [];
            if (settings.showProfessor) infoParts.push(course.professor || '교수명 미정');
            if (settings.showRoom) infoParts.push(course.room || '강의실 미정');
            const infoHTML = infoParts.length ? `<div class="class-info">${infoParts.join(' | ')}</div>` : '';

            block.innerHTML = nameHTML + infoHTML;
            container.appendChild(block);
        });
    });
}

// ==================================================================================
// 과목 목록 표시
// ==================================================================================
function renderCourseList() {
    const courseList = document.getElementById('course-list');
    courseList.innerHTML = '';

    if (courses.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = '<h3>📚 등록된 과목이 없습니다</h3><p>과목 추가 버튼을 눌러 새로운 과목을 추가해보세요.</p>';
        courseList.appendChild(emptyMessage);
        return;
    }

    courses.forEach(course => {
        const li = document.createElement('li');
        li.className = 'course-item';

        const timeStrings = course.times.map(time => {
            const day = dayData[time.day];
            const startHour = 8 + time.start;
            const startMinute = 30;
            const endHour = 8 + time.end + 1;
            const endMinute = 20;
            const startLabel = `${time.start}교시(${startHour}:${String(startMinute).padStart(2, '0')})`;
            const endLabel = `${time.end}교시(${endHour}:${String(endMinute).padStart(2, '0')})`;
            return `${day} ${startLabel}~${endLabel}`;
        });

        // 학점 선택 드롭다운 생성
        const gradeSelect = document.createElement('select');
        gradeSelect.className = 'form-select';
        gradeSelect.style.width = '100px';
        gradeSelect.style.marginRight = '0.5rem';
        gradeSelect.dataset.courseId = course.id;
        gradeSelect.innerHTML = `
            <option value="">미정</option>
            <option value="A+">A+</option>
            <option value="A0">A0</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B0">B0</option>
            <option value="B-">B-</option>
            <option value="C+">C+</option>
            <option value="C0">C0</option>
            <option value="C-">C-</option>
            <option value="D+">D+</option>
            <option value="D0">D0</option>
            <option value="D-">D-</option>
            <option value="F">F</option>
            <option value="P">P</option>
            <option value="NP">NP</option>
        `;
        if (course.grade) {
            gradeSelect.value = course.grade;
        }
        gradeSelect.addEventListener('change', function() {
            const courseId = parseInt(this.dataset.courseId, 10);
            const selectedGrade = this.value;
            const idx = courses.findIndex(c => c.id === courseId);
            if (idx !== -1) {
                courses[idx].grade = selectedGrade || null;
                apiPut(`/api/courses/${courseId}`, {
                    ...courses[idx],
                    semester: { year: currentSemester.year, term: currentSemester.term },
                    timetableId: currentTimetable.id
                }).catch(err => {
                    console.error('학점 저장 오류:', err);
                    alert('학점 저장에 실패했습니다.');
                });
                calculateGrades();
            }
        });

        // 과목 정보 & 액션 버튼 HTML
        li.innerHTML = `
            <div class="course-info">
                <div class="course-name">${course.name}</div>
                <div class="course-details">${course.professor || '교수명 미정'} | ${course.credits}학점 | ${course.type}</div>
                <div class="course-details" style="margin-top: 0.25rem;">${timeStrings.join(', ')} | ${course.room || '강의실 미정'}</div>
            </div>
            <div class="course-actions">
                <button class="course-action-btn" onclick="editCourse(${course.id})" title="수정">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                    </svg>
                </button>
                <button class="course-action-btn delete" onclick="deleteCourse(${course.id})" title="삭제">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        `;

        // 드롭다운 앞에 학점 선택 삽입
        const actionsDiv = li.querySelector('.course-actions');
        actionsDiv.insertBefore(gradeSelect, actionsDiv.firstChild);

        courseList.appendChild(li);
    });
}

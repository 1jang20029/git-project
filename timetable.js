// ==================================================================================
// PC 웹 브라우저 최적화 시간표 JavaScript
// index.js의 구조를 유지하면서 PC 환경에 최적화
// ==================================================================================

// 글로벌 변수 선언
let courses = [];
let settings = {
    showWeekend: true,
    showProfessor: true,
    showRoom: true,
    timeFormat24: true,
    appearance: 'dark'      // 다크/라이트 모드만 유지
};
let currentSemester = {
    year: 2023,
    term: 1
};
let currentTimetable = {
    id: 1,
    name: "시간표 1" 
};
let timetables = [
    { id: 1, name: "시간표 1" },
    { id: 2, name: "시간표 2" },
    { id: 3, name: "시간표 3" }
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

// 이전 설정 저장용
let previousSettings = null;

// ==================================================================================
// 초기화 및 이벤트 핸들러
// ==================================================================================

// 페이지 로드 시 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    setCurrentSemester();
    loadSettings();
    loadTimetablesFromStorage();
    updateTimetableSelector();
    loadCoursesFromStorage();
    document.getElementById('semester-select').value = `${currentSemester.year}-${currentSemester.term}`;
    createTimetable();
    renderCourseList();
    calculateGrades();
    updatePageTitle();
    applySettingsToUI();
});

// 현재 날짜를 기준으로 학기 설정
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
// 시간표 관리 함수들
// ==================================================================================

// 커스텀 드롭다운 토글
function toggleTimetableDropdown() {
    const menu = document.getElementById('timetable-menu');
    const button = document.querySelector('.dropdown-button');
    
    if (menu.style.display === 'none' || menu.style.display === '') {
        // 드롭다운 열기
        const buttonRect = button.getBoundingClientRect();
        
        menu.style.display = 'block';
        menu.style.left = buttonRect.left + 'px';
        menu.style.top = (buttonRect.bottom + 4) + 'px';
        menu.style.width = buttonRect.width + 'px';
        
        updateTimetableMenu();
    } else {
        // 드롭다운 닫기
        menu.style.display = 'none';
    }
}

// 시간표 메뉴 업데이트
function updateTimetableMenu() {
    const menu = document.getElementById('timetable-menu');
    menu.innerHTML = '';
    
    timetables.forEach(timetable => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        if (timetable.id === currentTimetable.id) {
            item.classList.add('selected');
        }
        
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

// 시간표 선택
function selectTimetable(timetableId) {
    const timetable = timetables.find(t => t.id === timetableId);
    if (!timetable) return;
    
    currentTimetable = timetable;
    document.getElementById('selected-timetable').textContent = timetable.name;
    
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (currentUser) {
        localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
    }
    
    updatePageTitle();
    loadCoursesFromStorage();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// 드롭다운에서 시간표 삭제
function deleteTimetableFromDropdown(timetableId) {
    if (timetables.length <= 1) {
        alert('마지막 시간표는 삭제할 수 없습니다.');
        return;
    }
    
    if (!confirm('정말 이 시간표를 삭제하시겠습니까?')) {
        return;
    }
    
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    timetables = timetables.filter(t => t.id !== timetableId);
    
    if (currentTimetable.id === timetableId) {
        currentTimetable = timetables[0];
        document.getElementById('selected-timetable').textContent = currentTimetable.name;
        updatePageTitle();
    }
    
    localStorage.setItem(`timetables_user_${currentUser}`, JSON.stringify(timetables));
    localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
    
    const semesterKey = `courses_${currentSemester.year}_${currentSemester.term}_${timetableId}_user_${currentUser}`;
    localStorage.removeItem(semesterKey);
    
    updateTimetableMenu();
    loadCoursesFromStorage();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// 시간표 이름 변경
function renameTimetable() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    const newName = prompt("시간표 이름을 입력하세요:", currentTimetable.name);
    if (newName && newName.trim() !== "") {
        currentTimetable.name = newName.trim();
        
        const index = timetables.findIndex(t => t.id === currentTimetable.id);
        if (index !== -1) {
            timetables[index] = currentTimetable;
        }
        
        localStorage.setItem(`timetables_user_${currentUser}`, JSON.stringify(timetables));
        localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
        
        updateTimetableSelector();
        updatePageTitle();
    }
}

// 새 시간표 추가
function addNewTimetable() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    const newName = prompt("새 시간표 이름을 입력하세요:", "새 시간표");
    if (newName && newName.trim() !== "") {
        const maxId = timetables.reduce((max, t) => Math.max(max, t.id), 0);
        const newId = maxId + 1;
        
        const newTimetable = {
            id: newId,
            name: newName.trim()
        };
        
        timetables.push(newTimetable);
        currentTimetable = newTimetable;
        
        localStorage.setItem(`timetables_user_${currentUser}`, JSON.stringify(timetables));
        localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
        
        updateTimetableSelector();
        updatePageTitle();
        
        courses = [];
        saveCoursesToStorage();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
    }
}

// 페이지 타이틀 업데이트
function updatePageTitle() {
    document.querySelector('.page-title').textContent = currentTimetable.name;
}

// 시간표 선택기 업데이트
function updateTimetableSelector() {
    document.getElementById('selected-timetable').textContent = currentTimetable.name;
}

// 로컬 스토리지에서 시간표 목록 로드
function loadTimetablesFromStorage() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (currentUser) {
        const savedTimetables = localStorage.getItem(`timetables_user_${currentUser}`);
        if (savedTimetables) {
            timetables = JSON.parse(savedTimetables);
        }
        
        const savedCurrentTimetable = localStorage.getItem(`currentTimetable_user_${currentUser}`);
        if (savedCurrentTimetable) {
            currentTimetable = JSON.parse(savedCurrentTimetable);
        }
    }
}

// ==================================================================================
// 학기 및 과목 관리 함수들
// ==================================================================================

// 학기 변경 함수
function changeSemester() {
    const semesterSelect = document.getElementById('semester-select');
    const selectedValue = semesterSelect.value;
    const [year, term] = selectedValue.split('-');
    
    currentSemester.year = parseInt(year);
    currentSemester.term = parseInt(term);
    
    loadCoursesFromStorage();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// 로컬 스토리지에서 과목 데이터 로드
function loadCoursesFromStorage() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (currentUser) {
        const semesterKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}_user_${currentUser}`;
        const savedCourses = localStorage.getItem(semesterKey);
        
        if (savedCourses) {
            courses = JSON.parse(savedCourses);
        } else {
            courses = [];
        }
    } else {
        courses = [];
    }
}

// 로컬 스토리지에 과목 데이터 저장
function saveCoursesToStorage() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (currentUser) {
        const semesterKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}_user_${currentUser}`;
        localStorage.setItem(semesterKey, JSON.stringify(courses));
    }
}

// ==================================================================================
// 시간표 생성 및 렌더링 함수들
// ==================================================================================

// 시간표 생성 함수
function createTimetable() {
    const tbody = document.getElementById('timetable-body');
    tbody.innerHTML = '';
    
    for (let i = 0; i < timeData.length; i++) {
        const period = timeData[i].period;
        const startTime = timeData[i].startTime;
        
        const row = document.createElement('tr');
        
        const timeCell = document.createElement('td');
        timeCell.className = 'time-col';
        
        if (settings.timeFormat24) {
            timeCell.innerHTML = `${period}교시<br>${startTime}`;
        } else {
            const hour = parseInt(startTime.split(':')[0]);
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

// 시간표에 과목 데이터 표시
function renderCoursesOnTimetable() {
    const container = document.querySelector('.timetable-container');
    const baseRect = container.getBoundingClientRect();

    container.querySelectorAll('.class-item').forEach(el => el.remove());

    const sampleCell = container.querySelector('.class-cell[data-day="1"][data-period="1"]');
    if (!sampleCell) return;
    
    const cellRect = sampleCell.getBoundingClientRect();
    const cellH = cellRect.height;
    const cellW = cellRect.width;

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
            if (settings.showProfessor) {
                infoParts.push(course.professor || '교수명 미정');
            }
            if (settings.showRoom) {
                infoParts.push(course.room || '강의실 미정');
            }
            const infoHTML = infoParts.length
                ? `<div class="class-info">${infoParts.join(' | ')}</div>`
                : '';

            block.innerHTML = nameHTML + infoHTML;
            container.appendChild(block);
        });
    });
}

// 과목 목록 표시
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
            
            const startTime = `${time.start}교시(${startHour}:${startMinute.toString().padStart(2, '0')})`;
            const endTime = `${time.end}교시(${endHour}:${endMinute.toString().padStart(2, '0')})`;
            
            return `${day} ${startTime}~${endTime}`;
        });
        
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
            const courseId = parseInt(this.dataset.courseId);
            const gradeValue = this.value;
            
            const courseIndex = courses.findIndex(c => c.id === courseId);
            if (courseIndex !== -1) {
                courses[courseIndex].grade = gradeValue;
                saveCoursesToStorage();
                calculateGrades();
            }
        });

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

        const actionsDiv = li.querySelector('.course-actions');
        actionsDiv.insertBefore(gradeSelect, actionsDiv.firstChild);

        courseList.appendChild(li);
    });
}

// ==================================================================================
// 학점 계산 함수들
// ==================================================================================

// 학점 계산 함수
function calculateGrades() {
    let totalCredits = 0;
    let totalPoints = 0;
    let majorCredits = 0;
    let majorPoints = 0;
    
    courses.forEach(course => {
        if (course.grade && gradePoints[course.grade] !== null) {
            const credits = course.credits;
            const points = gradePoints[course.grade];
            
            totalCredits += credits;
            totalPoints += credits * points;
            
            if (course.type === '전공필수' || course.type === '전공선택') {
                majorCredits += credits;
                majorPoints += credits * points;
            }
        }
    });
    
    const totalGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    const majorGPA = majorCredits > 0 ? (majorPoints / majorCredits).toFixed(2) : "0.00";
    
    document.getElementById('total-credits').textContent = totalCredits;
    document.getElementById('total-gpa').textContent = totalGPA;
    document.getElementById('major-gpa').textContent = majorGPA;
}

// ==================================================================================
// 과목 모달 관련 함수들
// ==================================================================================

// 과목 추가 모달 열기
function openAddCourseModal() {
    document.getElementById('modal-title').textContent = '과목 추가';
    document.getElementById('course-form').reset();
    document.getElementById('course-id').value = '';
    document.getElementById('course-grade').value = '';
    
    selectColor(document.querySelector('.color-option'));
    
    const timeSlots = document.getElementById('time-slots');
    timeSlots.innerHTML = '';
    addTimeSlot();
    
    document.getElementById('course-modal').style.display = 'flex';
}

// 과목 수정 모달 열기
function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    document.getElementById('modal-title').textContent = '과목 수정';
    
    document.getElementById('course-id').value = course.id;
    document.getElementById('course-name').value = course.name;
    document.getElementById('course-professor').value = course.professor || '';
    document.getElementById('course-credits').value = course.credits;
    document.getElementById('course-type').value = course.type;
    document.getElementById('course-room').value = course.room || '';
    document.getElementById('course-color').value = course.color;
    document.getElementById('course-grade').value = course.grade || '';
    
    selectColor(document.querySelector(`.color-option[data-color="${course.color}"]`));
    
    const timeSlots = document.getElementById('time-slots');
    timeSlots.innerHTML = '';
    
    course.times.forEach(time => {
        addTimeSlot(time.day, time.start, time.end);
    });
    
    if (course.times.length === 0) {
        addTimeSlot();
    }
    
    document.getElementById('course-modal').style.display = 'flex';
}

// 과목 삭제
function deleteCourse(courseId) {
    if (!confirm('정말 이 과목을 삭제하시겠습니까?')) return;
    
    courses = courses.filter(course => course.id !== courseId);
    
    saveCoursesToStorage();
    renderCourseList();
    renderCoursesOnTimetable();
    calculateGrades();
}

// 모달 닫기
function closeModal() {
    document.getElementById('course-modal').style.display = 'none';
}

// 과목 색상 선택
function selectColor(element) {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    document.getElementById('course-color').value = element.dataset.color;
}

// 시간 슬롯 추가
function addTimeSlot(day = 1, start = 1, end = 1) {
    const timeSlots = document.getElementById('time-slots');
    
    const slotDiv = document.createElement('div');
    slotDiv.className = 'time-slot';
    
    slotDiv.innerHTML = `
        <div class="form-group">
            <label class="form-label">요일</label>
            <select class="form-select day-select">
                <option value="1">월요일</option>
                <option value="2">화요일</option>
                <option value="3">수요일</option>
                <option value="4">목요일</option>
                <option value="5">금요일</option>
                <option value="6">토요일</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">시작 교시</label>
            <select class="form-select start-select">
                <option value="1">1교시 (9:30)</option>
                <option value="2">2교시 (10:30)</option>
                <option value="3">3교시 (11:30)</option>
                <option value="4">4교시 (12:30)</option>
                <option value="5">5교시 (13:30)</option>
                <option value="6">6교시 (14:30)</option>
                <option value="7">7교시 (15:30)</option>
                <option value="8">8교시 (16:30)</option>
                <option value="9">9교시 (17:30)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">종료 교시</label>
            <select class="form-select end-select">
                <option value="1">1교시 (10:20)</option>
                <option value="2">2교시 (11:20)</option>
                <option value="3">3교시 (12:20)</option>
                <option value="4">4교시 (13:20)</option>
                <option value="5">5교시 (14:20)</option>
                <option value="6">6교시 (15:20)</option>
                <option value="7">7교시 (16:20)</option>
                <option value="8">8교시 (17:20)</option>
                <option value="9">9교시 (18:20)</option>
            </select>
        </div>
        
        <button type="button" class="remove-slot-btn" onclick="removeTimeSlot(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    timeSlots.appendChild(slotDiv);
    
    const daySelect = slotDiv.querySelector('.day-select');
    const startSelect = slotDiv.querySelector('.start-select');
    const endSelect = slotDiv.querySelector('.end-select');
    
    daySelect.value = day;
    startSelect.value = start;
    endSelect.value = end;
    
    startSelect.addEventListener('change', function() {
        const startValue = parseInt(this.value);
        const endValue = parseInt(endSelect.value);
        
        if (endValue < startValue) {
            endSelect.value = startValue;
        }
    });
}

// 시간 슬롯 제거
function removeTimeSlot(button) {
    const timeSlots = document.getElementById('time-slots');
    const slot = button.closest('.time-slot');
    
    if (timeSlots.querySelectorAll('.time-slot').length > 1) {
        timeSlots.removeChild(slot);
    }
}

// 과목 저장
function saveCourse(event) {
    event.preventDefault();

    const slotEls = document.querySelectorAll('.time-slot');
    const slots = Array.from(slotEls).map(slot => ({
        day: parseInt(slot.querySelector('.day-select').value, 10),
        start: parseInt(slot.querySelector('.start-select').value, 10),
        end: parseInt(slot.querySelector('.end-select').value, 10)
    }));

    // 같은 과목 내에서 시간대 겹침 검사
    for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
            if (slots[i].day === slots[j].day) {
                if (slots[i].start <= slots[j].end && slots[j].start <= slots[i].end) {
                    showTimeError('⚠️ 같은 과목 내에 시간이 겹칩니다.');
                    return;
                }
            }
        }
    }

    // 기존 시간표 과목과 겹치는지 검사
    const editingId = document.getElementById('course-id').value
        ? parseInt(document.getElementById('course-id').value, 10)
        : null;

    for (let s of slots) {
        for (let c of courses) {
            if (editingId !== null && c.id === editingId) continue;
            for (let t of c.times) {
                if (s.day === t.day) {
                    if (s.start <= t.end && t.start <= s.end) {
                        showTimeError('⚠️ 해당 시간대에 이미 다른 과목이 있습니다.');
                        return;
                    }
                }
            }
        }
    }

    removeTimeError();

    const courseId = editingId;
    const name = document.getElementById('course-name').value.trim();
    const professor = document.getElementById('course-professor').value.trim();
    const credits = parseInt(document.getElementById('course-credits').value, 10);
    const type = document.getElementById('course-type').value;
    const room = document.getElementById('course-room').value.trim();
    const color = document.getElementById('course-color').value;
    const grade = document.getElementById('course-grade').value;

    const course = {
        id: courseId || Date.now(),
        name,
        professor,
        credits,
        type,
        room,
        color,
        times: slots,
        grade: grade || null
    };

    if (courseId) {
        const idx = courses.findIndex(c => c.id === course.id);
        if (idx !== -1) courses[idx] = course;
    } else {
        courses.push(course);
    }

    saveCoursesToStorage();
    renderCourseList();
    renderCoursesOnTimetable();
    calculateGrades();

    closeModal();
}

// 에러 메시지 표시 함수
function showTimeError(text) {
    removeTimeError();
    const form = document.getElementById('course-form');
    const err = document.createElement('div');
    err.id = 'time-error';
    err.style.color = '#ef4444';
    err.style.marginBottom = '12px';
    err.style.padding = '0.75rem';
    err.style.background = 'rgba(239, 68, 68, 0.1)';
    err.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    err.style.borderRadius = '8px';
    err.textContent = text;
    form.prepend(err);
}

// 기존 에러 메시지 제거 함수
function removeTimeError() {
    const old = document.getElementById('time-error');
    if (old) old.remove();
}

// ==================================================================================
// 설정 관련 함수들
// ==================================================================================

// 설정값을 UI에 적용
function applySettingsToUI() {
    document.getElementById('show-professor').checked = settings.showProfessor;
    document.getElementById('show-room').checked = settings.showRoom;
    document.getElementById('theme-select').value = settings.appearance || 'dark';
    document.getElementById('time-format-select').value = settings.timeFormat24 ? '24' : '12';
    document.getElementById('weekend-select').value = settings.showWeekend.toString();
}

// 설정 로드
function loadSettings() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (currentUser) {
        const savedSettings = localStorage.getItem(`settings_user_${currentUser}`);
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
            applySettings();
        }
    }
}

// 설정 열기
function openSettings() {
    previousSettings = JSON.parse(JSON.stringify(settings));
    document.getElementById('settings-modal').style.display = 'flex';
}

// 설정 닫기 (취소)
function closeSettings() {
    if (previousSettings) {
        settings = JSON.parse(JSON.stringify(previousSettings));
        applySettingsToUI();
        applySettings();
    }
    document.getElementById('settings-modal').style.display = 'none';
}

// 설정 저장
function saveSettings() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (currentUser) {
        settings.showProfessor = document.getElementById('show-professor').checked;
        settings.showRoom = document.getElementById('show-room').checked;
        settings.appearance = document.getElementById('theme-select').value;
        settings.timeFormat24 = document.getElementById('time-format-select').value === '24';
        settings.showWeekend = document.getElementById('weekend-select').value === 'true';
        
        localStorage.setItem(`settings_user_${currentUser}`, JSON.stringify(settings));
        applySettings();
        
        document.getElementById('settings-modal').style.display = 'none';
    }
}

// 설정 적용
function applySettings() {
    applyAppearance(settings.appearance || 'dark');
    createTimetable();
    renderCoursesOnTimetable();
}

// 외관 모드 변경 (다크/라이트)
function changeAppearance() {
    const appearance = document.getElementById('theme-select').value;
    settings.appearance = appearance;
    applyAppearance(appearance);
}

// 외관 모드 적용
function applyAppearance(appearance) {
    const body = document.body;
    
    // 기존 모드 클래스 제거
    body.classList.remove('light-mode', 'dark-mode');
    
    // 새로운 모드 적용
    if (appearance === 'light') {
        body.classList.add('light-mode');
    } else {
        body.classList.add('dark-mode');
    }
}

// 색상 테마 관련 함수들 제거
// changeColorTheme, applyColorTheme 함수 삭제

// 기존 changeTheme 함수는 제거하고 위의 함수들로 대체
// function changeTheme() { ... } // 이 함수 삭제

// 기존 applyTheme 함수는 제거하고 위의 함수들로 대체
// function applyTheme(theme) { ... } // 이 함수 삭제

// 시간 형식 변경
function changeTimeFormat() {
    settings.timeFormat24 = document.getElementById('time-format-select').value === '24';
    createTimetable();
}

// 주말 표시 변경
function changeWeekendDisplay() {
    settings.showWeekend = document.getElementById('weekend-select').value === 'true';
    createTimetable();
    renderCoursesOnTimetable();
}

// 현재 시간표 초기화
function deleteTimetable() {
    if (confirm('현재 시간표의 모든 데이터가 삭제되고 기본 설정으로 초기화됩니다. 계속하시겠습니까?')) {
        courses = [];
        
        settings = {
            showWeekend: true,
            showProfessor: true,
            showRoom: true,
            timeFormat24: true,
            appearance: 'dark'
        };
        
        document.getElementById('show-professor').checked = true;
        document.getElementById('show-room').checked = true;
        document.getElementById('theme-select').value = 'dark';
        document.getElementById('time-format-select').value = '24';
        document.getElementById('weekend-select').value = 'true';
        
        const currentUser = localStorage.getItem('currentLoggedInUser');
        if (currentUser) {
            localStorage.setItem(`settings_user_${currentUser}`, JSON.stringify(settings));
        }
        
        applyAppearance('dark');
        saveCoursesToStorage();
        createTimetable();
        renderCourseList();
        calculateGrades();
        
        alert('시간표가 기본값으로 초기화되었습니다.');
    }
}

// ==================================================================================
// 이미지 내보내기 함수
// ==================================================================================

// 이미지로 내보내기
function exportToImage() {
    const timetable = document.querySelector('.timetable');
    const scale = 2;
    const rect = timetable.getBoundingClientRect();
    const margin = 40;

    const canvas = document.createElement('canvas');
    canvas.width = (rect.width + margin * 2) * scale;
    canvas.height = (rect.height + margin * 2) * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // 배경
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, rect.width + margin * 2, rect.height + margin * 2);

    const showWeekend = settings.showWeekend;
    const dayCount = showWeekend ? 6 : 5;
    const totalCols = dayCount + 1;
    const totalRows = timeData.length + 1;
    const cellWidth = rect.width / totalCols;
    const cellHeight = rect.height / totalRows;

    // 헤더 그리기
    ctx.fillStyle = '#222';
    ctx.fillRect(margin, margin, rect.width, cellHeight);

    ctx.fillStyle = '#f0f0f0';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const headers = ['시간', '월', '화', '수', '목', '금'];
    if (showWeekend) headers.push('토');
    headers.forEach((h, i) => {
        ctx.fillText(h,
            margin + (i + 0.5) * cellWidth,
            margin + cellHeight / 2
        );
    });

    // 시간 레이블 그리기
    ctx.fillStyle = '#f0f0f0';
    timeData.forEach((td, i) => {
        const y = margin + (i + 1) * cellHeight;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${td.period}교시`,
            margin + cellWidth / 2,
            y + cellHeight * 0.3
        );
        ctx.font = '9px Arial';
        ctx.fillText(td.startTime,
            margin + cellWidth / 2,
            y + cellHeight * 0.7
        );
    });

    // 그리드 선
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let r = 0; r <= totalRows; r++) {
        const y = margin + r * cellHeight;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(margin + rect.width, y);
        ctx.stroke();
    }
    for (let c = 0; c <= totalCols; c++) {
        const x = margin + c * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, margin + rect.height);
        ctx.stroke();
    }

    // 과목 블록 그리기
    const colorMap = {
        'color-1': '#e57373', 'color-2': '#81c784', 'color-3': '#64b5f6',
        'color-4': '#ba68c8', 'color-5': '#ffb74d', 'color-6': '#4db6ac',
        'color-7': '#7986cb', 'color-8': '#a1887f'
    };

    courses.forEach(course => {
        course.times.forEach(t => {
            if (t.day > dayCount) return;

            const x = margin + t.day * cellWidth;
            const y = margin + t.start * cellHeight;
            const span = t.end - t.start + 1;
            const w = cellWidth;
            const h = cellHeight * span;

            ctx.fillStyle = colorMap[course.color] || '#666';
            ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

            const textX = x + w / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(course.name, textX, y + h * 0.35);

            const infoParts = [];
            if (settings.showProfessor && course.professor) infoParts.push(course.professor);
            if (settings.showRoom && course.room) infoParts.push(course.room);
            if (infoParts.length) {
                ctx.font = '8px Arial';
                ctx.fillText(infoParts.join(' | '), textX, y + h * 0.65);
            }
        });
    });

    // 제목
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
        `${currentTimetable.name} - ${currentSemester.year}년 ${currentSemester.term}학기`,
        margin + rect.width / 2,
        margin - 10
    );

    // 다운로드
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTimetable.name}_${currentSemester.year}_${currentSemester.term}.png`;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
}

// ==================================================================================
// 기타 유틸리티 함수들
// ==================================================================================

// 이전 페이지로 이동
function goToBack() {
    window.history.back();
}

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    const menu = document.getElementById('timetable-menu');
    
    if (!dropdown.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// 창 크기 변경 시 드롭다운 위치 재조정
window.addEventListener('resize', function() {
    const menu = document.getElementById('timetable-menu');
    if (menu.style.display === 'block') {
        const button = document.querySelector('.dropdown-button');
        const buttonRect = button.getBoundingClientRect();
        
        menu.style.left = buttonRect.left + 'px';
        menu.style.top = (buttonRect.bottom + 4) + 'px';
        menu.style.width = buttonRect.width + 'px';
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (document.getElementById('course-modal').style.display === 'flex') {
            closeModal();
        }
        if (document.getElementById('settings-modal').style.display === 'flex') {
            closeSettings();
        }
    }
});

// 모달 외부 클릭 시 닫기
document.getElementById('course-modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});

document.getElementById('settings-modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeSettings();
    }
});

// 브라우저 창 크기 변경 시 적응형 레이아웃 조정
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        renderCoursesOnTimetable();
    }, 250);
});
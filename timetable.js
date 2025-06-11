// ==================================================================================
// PC 웹 브라우저 최적화 시간표 JavaScript - 백엔드 연동 버전
// MySQL + Node.js 백엔드와 연동하기 위한 프론트엔드 코드
// ==================================================================================

// API 엔드포인트 설정
const API_BASE_URL = 'http://localhost:3000/api'; // 백엔드 서버 주소

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
    id: 1,
    name: "시간표 1" 
};
let timetables = [
    { id: 1, name: "시간표 1" },
    { id: 2, name: "시간표 2" },
    { id: 3, name: "시간표 3" }
];

// 현재 로그인된 사용자 정보
let currentUser = null;

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

// 설정 백업용 변수
let settingsBackup = null;

// ==================================================================================
// API 통신 함수들
// ==================================================================================

// API 요청 헬퍼 함수
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '서버 오류가 발생했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 사용자 인증 관련 API
async function loginUser(credentials) {
    return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
}

async function registerUser(userData) {
    return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function getCurrentUser() {
    return await apiRequest('/auth/me');
}

// 시간표 관련 API
async function getTimetables() {
    return await apiRequest('/timetables');
}

async function createTimetable(timetableData) {
    return await apiRequest('/timetables', {
        method: 'POST',
        body: JSON.stringify(timetableData)
    });
}

async function updateTimetable(timetableId, timetableData) {
    return await apiRequest(`/timetables/${timetableId}`, {
        method: 'PUT',
        body: JSON.stringify(timetableData)
    });
}

async function deleteTimetableAPI(timetableId) {
    return await apiRequest(`/timetables/${timetableId}`, {
        method: 'DELETE'
    });
}

// 과목 관련 API
async function getCourses(timetableId, year, term) {
    return await apiRequest(`/courses?timetableId=${timetableId}&year=${year}&term=${term}`);
}

async function createCourse(courseData) {
    return await apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
    });
}

async function updateCourse(courseId, courseData) {
    return await apiRequest(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
    });
}

async function deleteCourseAPI(courseId) {
    return await apiRequest(`/courses/${courseId}`, {
        method: 'DELETE'
    });
}

// 설정 관련 API
async function getSettings() {
    return await apiRequest('/settings');
}

async function updateSettings(settingsData) {
    return await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
    });
}

// ==================================================================================
// 초기화 및 이벤트 핸들러
// ==================================================================================

// 페이지 로드 시 실행되는 함수
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 사용자 인증 확인
        await checkAuthentication();
        
        // 초기 데이터 로드
        await initializeData();
        
        // UI 초기화
        setCurrentSemester();
        document.getElementById('semester-select').value = `${currentSemester.year}-${currentSemester.term}`;
        createTimetable();
        renderCourseList();
        calculateGrades();
        updatePageTitle();
        applySettingsToUI();
        
        // 이벤트 리스너 등록
        setupEventListeners();
        
    } catch (error) {
        console.error('초기화 오류:', error);
        // 로그인 페이지로 리다이렉트 또는 오류 메시지 표시
        handleAuthenticationError();
    }
});

// 사용자 인증 확인
async function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('인증 토큰이 없습니다.');
    }
    
    try {
        const userData = await getCurrentUser();
        currentUser = userData;
        console.log('현재 사용자:', currentUser);
    } catch (error) {
        localStorage.removeItem('authToken');
        throw error;
    }
}

// 초기 데이터 로드
async function initializeData() {
    try {
        // 설정 로드
        const settingsData = await getSettings();
        if (settingsData) {
            settings = { ...settings, ...settingsData };
            applySettings();
        }
        
        // 시간표 목록 로드
        const timetablesData = await getTimetables();
        if (timetablesData && timetablesData.length > 0) {
            timetables = timetablesData;
            currentTimetable = timetables[0];
        }
        
        updateTimetableSelector();
        
        // 과목 데이터 로드
        await loadCoursesFromAPI();
        
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        // 기본값으로 초기화
    }
}

// 인증 오류 처리
function handleAuthenticationError() {
    alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login.html';
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // ESC 키 이벤트
    document.addEventListener('keydown', handleEscapeKey);
    
    // 모달 외부 클릭 이벤트
    document.getElementById('course-modal').addEventListener('click', handleModalOutsideClick);
    document.getElementById('settings-modal').addEventListener('click', handleModalOutsideClick);
    
    // 드롭다운 외부 클릭 이벤트
    document.addEventListener('click', handleDropdownOutsideClick);
    
    // 브라우저 창 크기 변경 이벤트
    window.addEventListener('resize', handleWindowResize);
    
    // 설정 변경 이벤트 (실시간 미리보기)
    const settingsInputs = [
        'show-professor', 'show-room', 'theme-select', 
        'time-format-select', 'weekend-select'
    ];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'change';
            element.addEventListener(eventType, handleSettingsPreview);
        }
    });
}

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
// 이벤트 핸들러 함수들
// ==================================================================================

// ESC 키 처리
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        // 열린 모달 확인 및 닫기
        if (document.getElementById('course-modal').style.display === 'flex') {
            closeModal();
        } else if (document.getElementById('settings-modal').style.display === 'flex') {
            closeSettings(); // 취소 버튼과 동일한 동작
        }
        
        // 드롭다운 닫기
        const dropdownMenu = document.getElementById('timetable-menu');
        if (dropdownMenu && dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        }
    }
}

// 모달 외부 클릭 처리
function handleModalOutsideClick(event) {
    if (event.target === event.currentTarget) {
        if (event.currentTarget.id === 'course-modal') {
            closeModal();
        } else if (event.currentTarget.id === 'settings-modal') {
            closeSettings(); // 취소 버튼과 동일한 동작
        }
    }
}

// 드롭다운 외부 클릭 처리
function handleDropdownOutsideClick(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById('timetable-menu').style.display = 'none';
    }
}

// 창 크기 변경 처리
let resizeTimer;
function handleWindowResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        renderCoursesOnTimetable();
    }, 250);
}

// 설정 실시간 미리보기
function handleSettingsPreview() {
    if (document.getElementById('settings-modal').style.display === 'flex') {
        // 현재 UI 값들로 임시 설정 객체 생성
        const tempSettings = {
            showProfessor: document.getElementById('show-professor').checked,
            showRoom: document.getElementById('show-room').checked,
            appearance: document.getElementById('theme-select').value,
            timeFormat24: document.getElementById('time-format-select').value === '24',
            showWeekend: document.getElementById('weekend-select').value === 'true'
        };
        
        // 임시로 설정 적용 (원본 설정은 보존)
        applyTempSettings(tempSettings);
    }
}

// ==================================================================================
// 시간표 관리 함수들
// ==================================================================================

// 커스텀 드롭다운 토글
function toggleTimetableDropdown() {
    const menu = document.getElementById('timetable-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    updateTimetableMenu();
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
async function selectTimetable(timetableId) {
    const timetable = timetables.find(t => t.id === timetableId);
    if (!timetable) return;
    
    currentTimetable = timetable;
    document.getElementById('selected-timetable').textContent = timetable.name;
    
    updatePageTitle();
    await loadCoursesFromAPI();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// 드롭다운에서 시간표 삭제
async function deleteTimetableFromDropdown(timetableId) {
    if (timetables.length <= 1) {
        alert('마지막 시간표는 삭제할 수 없습니다.');
        return;
    }
    
    if (!confirm('정말 이 시간표를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        await deleteTimetableAPI(timetableId);
        
        timetables = timetables.filter(t => t.id !== timetableId);
        
        if (currentTimetable.id === timetableId) {
            currentTimetable = timetables[0];
            document.getElementById('selected-timetable').textContent = currentTimetable.name;
            updatePageTitle();
        }
        
        updateTimetableMenu();
        await loadCoursesFromAPI();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
        
    } catch (error) {
        console.error('시간표 삭제 오류:', error);
        alert('시간표 삭제 중 오류가 발생했습니다.');
    }
}

// 시간표 이름 변경
async function renameTimetable() {
    const newName = prompt("시간표 이름을 입력하세요:", currentTimetable.name);
    if (newName && newName.trim() !== "") {
        try {
            const updatedTimetable = await updateTimetable(currentTimetable.id, {
                name: newName.trim()
            });
            
            currentTimetable.name = updatedTimetable.name;
            
            const index = timetables.findIndex(t => t.id === currentTimetable.id);
            if (index !== -1) {
                timetables[index] = currentTimetable;
            }
            
            updateTimetableSelector();
            updatePageTitle();
            
        } catch (error) {
            console.error('시간표 이름 변경 오류:', error);
            alert('시간표 이름 변경 중 오류가 발생했습니다.');
        }
    }
}

// 새 시간표 추가
async function addNewTimetable() {
    const newName = prompt("새 시간표 이름을 입력하세요:", "새 시간표");
    if (newName && newName.trim() !== "") {
        try {
            const newTimetable = await createTimetable({
                name: newName.trim()
            });
            
            timetables.push(newTimetable);
            currentTimetable = newTimetable;
            
            updateTimetableSelector();
            updatePageTitle();
            
            courses = [];
            renderCoursesOnTimetable();
            renderCourseList();
            calculateGrades();
            
        } catch (error) {
            console.error('새 시간표 추가 오류:', error);
            alert('새 시간표 추가 중 오류가 발생했습니다.');
        }
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

// ==================================================================================
// 학기 및 과목 관리 함수들
// ==================================================================================

// 학기 변경 함수
async function changeSemester() {
    const semesterSelect = document.getElementById('semester-select');
    const selectedValue = semesterSelect.value;
    const [year, term] = selectedValue.split('-');
    
    currentSemester.year = parseInt(year);
    currentSemester.term = parseInt(term);
    
    await loadCoursesFromAPI();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// API에서 과목 데이터 로드
async function loadCoursesFromAPI() {
    try {
        const coursesData = await getCourses(
            currentTimetable.id, 
            currentSemester.year, 
            currentSemester.term
        );
        courses = coursesData || [];
    } catch (error) {
        console.error('과목 데이터 로드 오류:', error);
        courses = [];
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
        
        gradeSelect.addEventListener('change', async function() {
            const courseId = parseInt(this.dataset.courseId);
            const gradeValue = this.value;
            
            try {
                await updateCourse(courseId, { grade: gradeValue });
                
                const courseIndex = courses.findIndex(c => c.id === courseId);
                if (courseIndex !== -1) {
                    courses[courseIndex].grade = gradeValue;
                    calculateGrades();
                }
            } catch (error) {
                console.error('성적 업데이트 오류:', error);
                alert('성적 업데이트 중 오류가 발생했습니다.');
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
async function deleteCourse(courseId) {
    if (!confirm('정말 이 과목을 삭제하시겠습니까?')) return;
    
    try {
        await deleteCourseAPI(courseId);
        
        courses = courses.filter(course => course.id !== courseId);
        
        renderCourseList();
        renderCoursesOnTimetable();
        calculateGrades();
        
    } catch (error) {
        console.error('과목 삭제 오류:', error);
        alert('과목 삭제 중 오류가 발생했습니다.');
    }
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
async function saveCourse(event) {
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

    const courseData = {
        name,
        professor,
        credits,
        type,
        room,
        color,
        times: slots,
        grade: grade || null,
        timetableId: currentTimetable.id,
        year: currentSemester.year,
        term: currentSemester.term
    };

    try {
        let savedCourse;
        
        if (courseId) {
            // 수정
            savedCourse = await updateCourse(courseId, courseData);
            const idx = courses.findIndex(c => c.id === courseId);
            if (idx !== -1) courses[idx] = savedCourse;
        } else {
            // 추가
            savedCourse = await createCourse(courseData);
            courses.push(savedCourse);
        }

        renderCourseList();
        renderCoursesOnTimetable();
        calculateGrades();
        closeModal();
        
    } catch (error) {
        console.error('과목 저장 오류:', error);
        alert('과목 저장 중 오류가 발생했습니다.');
    }
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
// 설정 관련 함수들 - 수정된 부분
// ==================================================================================

// 설정값을 UI에 적용
function applySettingsToUI() {
    const showProfessorEl = document.getElementById('show-professor');
    const showRoomEl = document.getElementById('show-room');
    const themeSelectEl = document.getElementById('theme-select');
    const timeFormatSelectEl = document.getElementById('time-format-select');
    const weekendSelectEl = document.getElementById('weekend-select');
    
    if (showProfessorEl) showProfessorEl.checked = settings.showProfessor;
    if (showRoomEl) showRoomEl.checked = settings.showRoom;
    if (themeSelectEl) themeSelectEl.value = settings.appearance || 'dark';
    if (timeFormatSelectEl) timeFormatSelectEl.value = settings.timeFormat24 ? '24' : '12';
    if (weekendSelectEl) weekendSelectEl.value = settings.showWeekend.toString();
}

// 설정 모달 열기 - 수정된 함수
function openSettings() {
    // 현재 설정을 백업
    settingsBackup = JSON.parse(JSON.stringify(settings));
    
    // UI에 현재 설정값 적용
    applySettingsToUI();
    
    // 모달 표시
    document.getElementById('settings-modal').style.display = 'flex';
}

// 설정 모달 닫기 (취소) - 수정된 함수
function closeSettings() {
    // 백업된 설정으로 복원
    if (settingsBackup) {
        settings = JSON.parse(JSON.stringify(settingsBackup));
        applySettings();
        settingsBackup = null;
    }
    
    // 모달 닫기
    document.getElementById('settings-modal').style.display = 'none';
}

// 설정 저장 - 수정된 함수
async function saveSettings() {
    try {
        // UI에서 설정값 읽기
        const showProfessorEl = document.getElementById('show-professor');
        const showRoomEl = document.getElementById('show-room');
        const themeSelectEl = document.getElementById('theme-select');
        const timeFormatSelectEl = document.getElementById('time-format-select');
        const weekendSelectEl = document.getElementById('weekend-select');
        
        // 설정 업데이트
        if (showProfessorEl) settings.showProfessor = showProfessorEl.checked;
        if (showRoomEl) settings.showRoom = showRoomEl.checked;
        if (themeSelectEl) settings.appearance = themeSelectEl.value;
        if (timeFormatSelectEl) settings.timeFormat24 = timeFormatSelectEl.value === '24';
        if (weekendSelectEl) settings.showWeekend = weekendSelectEl.value === 'true';
        
        // 백엔드에 저장
        await updateSettings(settings);
        
        // 설정 적용
        applySettings();
        
        // 백업 클리어
        settingsBackup = null;
        
        // 모달 닫기
        document.getElementById('settings-modal').style.display = 'none';
        
        console.log('설정이 저장되었습니다.');
        
    } catch (error) {
        console.error('설정 저장 중 오류 발생:', error);
        alert('설정 저장 중 오류가 발생했습니다.');
    }
}

// 설정 적용
function applySettings() {
    applyAppearance(settings.appearance || 'dark');
    createTimetable();
    renderCoursesOnTimetable();
}

// 임시 설정 적용 (미리보기용)
function applyTempSettings(tempSettings) {
    // 임시로 외관 적용
    applyAppearance(tempSettings.appearance || 'dark');
    
    // 임시 설정으로 시간표 생성
    const originalSettings = { ...settings };
    
    // 임시로 설정 변경
    Object.assign(settings, tempSettings);
    
    // 시간표 업데이트
    createTimetable();
    renderCoursesOnTimetable();
    
    // 원본 설정 복원
    settings = originalSettings;
}

// 외관 모드 변경 (다크/라이트)
function changeAppearance() {
    const themeSelectEl = document.getElementById('theme-select');
    if (themeSelectEl) {
        const appearance = themeSelectEl.value;
        applyAppearance(appearance);
    }
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

// 시간 형식 변경
function changeTimeFormat() {
    const timeFormatSelectEl = document.getElementById('time-format-select');
    if (timeFormatSelectEl) {
        const timeFormat24 = timeFormatSelectEl.value === '24';
        // 미리보기를 위한 임시 적용
        const originalTimeFormat = settings.timeFormat24;
        settings.timeFormat24 = timeFormat24;
        createTimetable();
        settings.timeFormat24 = originalTimeFormat;
    }
}

// 주말 표시 변경
function changeWeekendDisplay() {
    const weekendSelectEl = document.getElementById('weekend-select');
    if (weekendSelectEl) {
        const showWeekend = weekendSelectEl.value === 'true';
        // 미리보기를 위한 임시 적용
        const originalShowWeekend = settings.showWeekend;
        settings.showWeekend = showWeekend;
        createTimetable();
        renderCoursesOnTimetable();
        settings.showWeekend = originalShowWeekend;
    }
}

// 현재 시간표 초기화
async function deleteTimetable() {
    if (!confirm('현재 시간표의 모든 데이터가 삭제되고 기본 설정으로 초기화됩니다. 계속하시겠습니까?')) {
        return;
    }
    
    try {
        // 과목 데이터 초기화 (백엔드에서 해당 시간표의 모든 과목 삭제)
        for (let course of courses) {
            await deleteCourseAPI(course.id);
        }
        courses = [];
        
        // 설정 초기화
        settings = {
            showWeekend: true,
            showProfessor: true,
            showRoom: true,
            timeFormat24: true,
            appearance: 'dark'
        };
        
        // 백엔드에 설정 저장
        await updateSettings(settings);
        
        // UI 요소 초기화
        const showProfessorEl = document.getElementById('show-professor');
        const showRoomEl = document.getElementById('show-room');
        const themeSelectEl = document.getElementById('theme-select');
        const timeFormatSelectEl = document.getElementById('time-format-select');
        const weekendSelectEl = document.getElementById('weekend-select');
        
        if (showProfessorEl) showProfessorEl.checked = true;
        if (showRoomEl) showRoomEl.checked = true;
        if (themeSelectEl) themeSelectEl.value = 'dark';
        if (timeFormatSelectEl) timeFormatSelectEl.value = '24';
        if (weekendSelectEl) weekendSelectEl.value = 'true';
        
        // 설정 적용
        applyAppearance('dark');
        createTimetable();
        renderCourseList();
        calculateGrades();
        
        alert('시간표가 기본값으로 초기화되었습니다.');
        
    } catch (error) {
        console.error('시간표 초기화 중 오류 발생:', error);
        alert('시간표 초기화 중 오류가 발생했습니다.');
    }
}

// ==================================================================================
// 이미지 내보내기 함수
// ==================================================================================

// 이미지로 내보내기
function exportToImage() {
    const timetable = document.querySelector('.timetable');
    if (!timetable) {
        alert('시간표를 찾을 수 없습니다.');
        return;
    }

    // 임시 캔버스 생성을 위한 컨테이너
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '-9999px';
    exportContainer.style.width = '1200px';
    exportContainer.style.background = document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b';
    exportContainer.style.padding = '40px';
    exportContainer.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    
    // 시간표 제목 생성
    const title = document.createElement('h1');
    title.textContent = `${currentTimetable.name} - ${currentSemester.year}년 ${currentSemester.term}학기`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '30px';
    title.style.fontSize = '28px';
    title.style.fontWeight = '700';
    title.style.color = document.body.classList.contains('light-mode') ? '#1f2937' : '#f1f5f9';
    title.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
    title.style.webkitBackgroundClip = 'text';
    title.style.webkitTextFillColor = 'transparent';
    title.style.backgroundClip = 'text';
    
    // 시간표 테이블 복제
    const tableClone = timetable.cloneNode(true);
    tableClone.style.width = '100%';
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.fontSize = '14px';
    tableClone.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    tableClone.style.borderRadius = '12px';
    tableClone.style.overflow = 'hidden';
    
    // 테이블 스타일 적용
    const cells = tableClone.querySelectorAll('th, td');
    cells.forEach(cell => {
        cell.style.border = document.body.classList.contains('light-mode') 
            ? '1px solid rgba(148, 163, 184, 0.3)' 
            : '1px solid rgba(148, 163, 184, 0.2)';
        cell.style.padding = '12px 8px';
        cell.style.textAlign = 'center';
        cell.style.verticalAlign = 'middle';
        
        if (cell.tagName === 'TH') {
            cell.style.background = document.body.classList.contains('light-mode') 
                ? 'rgba(248, 250, 252, 0.9)' 
                : 'rgba(15, 23, 42, 0.8)';
            cell.style.color = document.body.classList.contains('light-mode') ? '#1f2937' : '#f1f5f9';
            cell.style.fontWeight = '600';
            cell.style.fontSize = '16px';
        }
        
        if (cell.classList.contains('time-col')) {
            cell.style.background = document.body.classList.contains('light-mode') 
                ? 'rgba(241, 245, 249, 0.8)' 
                : 'rgba(15, 23, 42, 0.6)';
            cell.style.color = document.body.classList.contains('light-mode') ? '#64748b' : '#94a3b8';
            cell.style.fontWeight = '600';
            cell.style.fontSize = '12px';
            cell.style.width = '100px';
        }
        
        if (cell.classList.contains('class-cell')) {
            cell.style.height = '60px';
            cell.style.background = document.body.classList.contains('light-mode') 
                ? 'rgba(255, 255, 255, 0.5)' 
                : 'rgba(30, 41, 59, 0.3)';
            cell.style.position = 'relative';
        }
    });
    
    // 과목 블록들을 테이블 셀 안에 직접 삽입
    courses.forEach(course => {
        course.times.forEach(timeSlot => {
            // 주말 숨김 처리
            const maxDays = settings.showWeekend ? 6 : 5;
            if (timeSlot.day > maxDays) return;
            
            // 해당 시간의 셀 찾기
            for (let period = timeSlot.start; period <= timeSlot.end; period++) {
                const targetCell = tableClone.querySelector(
                    `td.class-cell[data-day="${timeSlot.day}"][data-period="${period}"]`
                );
                
                if (targetCell && period === timeSlot.start) {
                    // 과목 블록 생성
                    const courseBlock = document.createElement('div');
                    courseBlock.style.position = 'absolute';
                    courseBlock.style.top = '0';
                    courseBlock.style.left = '0';
                    courseBlock.style.right = '0';
                    courseBlock.style.height = `${(timeSlot.end - timeSlot.start + 1) * 60}px`;
                    courseBlock.style.padding = '8px';
                    courseBlock.style.borderRadius = '6px';
                    courseBlock.style.color = 'white';
                    courseBlock.style.fontSize = '12px';
                    courseBlock.style.fontWeight = '700';
                    courseBlock.style.display = 'flex';
                    courseBlock.style.flexDirection = 'column';
                    courseBlock.style.justifyContent = 'center';
                    courseBlock.style.alignItems = 'center';
                    courseBlock.style.textAlign = 'center';
                    courseBlock.style.overflow = 'hidden';
                    courseBlock.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                    courseBlock.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    
                    // 색상 적용
                    const colorMap = {
                        'color-1': 'linear-gradient(135deg, #e57373, #ef5350)',
                        'color-2': 'linear-gradient(135deg, #81c784, #66bb6a)',
                        'color-3': 'linear-gradient(135deg, #64b5f6, #42a5f5)',
                        'color-4': 'linear-gradient(135deg, #ba68c8, #ab47bc)',
                        'color-5': 'linear-gradient(135deg, #ffb74d, #ffa726)',
                        'color-6': 'linear-gradient(135deg, #4db6ac, #26a69a)',
                        'color-7': 'linear-gradient(135deg, #7986cb, #5c6bc0)',
                        'color-8': 'linear-gradient(135deg, #a1887f, #8d6e63)'
                    };
                    
                    courseBlock.style.background = colorMap[course.color] || colorMap['color-1'];
                    
                    // 과목명
                    const courseName = document.createElement('div');
                    courseName.textContent = course.name;
                    courseName.style.fontWeight = '700';
                    courseName.style.marginBottom = '4px';
                    courseName.style.fontSize = '13px';
                    courseBlock.appendChild(courseName);
                    
                    // 교수명/강의실 정보
                    const infoParts = [];
                    if (settings.showProfessor && course.professor) {
                        infoParts.push(course.professor);
                    }
                    if (settings.showRoom && course.room) {
                        infoParts.push(course.room);
                    }
                    
                    if (infoParts.length > 0) {
                        const courseInfo = document.createElement('div');
                        courseInfo.textContent = infoParts.join(' | ');
                        courseInfo.style.fontSize = '10px';
                        courseInfo.style.opacity = '0.9';
                        courseBlock.appendChild(courseInfo);
                    }
                    
                    targetCell.style.position = 'relative';
                    targetCell.appendChild(courseBlock);
                }
            }
        });
    });
    
    exportContainer.appendChild(title);
    exportContainer.appendChild(tableClone);
    document.body.appendChild(exportContainer);
    
    // html2canvas 사용 (만약 라이브러리가 없다면 간단한 방법 사용)
    if (typeof html2canvas !== 'undefined') {
        html2canvas(exportContainer, {
            backgroundColor: document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b',
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${currentTimetable.name}_${currentSemester.year}_${currentSemester.term}.png`;
            link.href = canvas.toDataURL();
            link.click();
            document.body.removeChild(exportContainer);
        });
    } else {
        // html2canvas가 없을 때의 대체 방법
        exportToImageFallback(exportContainer);
    }
}

// html2canvas가 없을 때의 대체 방법
function exportToImageFallback(container) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2;
    
    canvas.width = 1200 * scale;
    canvas.height = 800 * scale;
    ctx.scale(scale, scale);
    
    // 배경 그리기
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b';
    ctx.fillRect(0, 0, 1200, 800);
    
    // 제목 그리기
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#1f2937' : '#f1f5f9';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
        `${currentTimetable.name} - ${currentSemester.year}년 ${currentSemester.term}학기`,
        600, 60
    );
    
    // 시간표 그리기
    const startX = 100;
    const startY = 100;
    const cellWidth = 140;
    const cellHeight = 60;
    const maxDays = settings.showWeekend ? 6 : 5;
    const totalCols = maxDays + 1;
    const totalRows = timeData.length + 1;
    
    // 헤더 그리기
    ctx.fillStyle = document.body.classList.contains('light-mode') ? 'rgba(248, 250, 252, 0.9)' : 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(startX, startY, cellWidth * totalCols, cellHeight);
    
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#1f2937' : '#f1f5f9';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    const headers = ['시간', '월', '화', '수', '목', '금'];
    if (settings.showWeekend) headers.push('토');
    
    headers.forEach((header, i) => {
        ctx.fillText(header, startX + (i + 0.5) * cellWidth, startY + cellHeight / 2 + 5);
    });
    
    // 시간 레이블과 그리드 그리기
    ctx.strokeStyle = document.body.classList.contains('light-mode') ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    
    timeData.forEach((time, i) => {
        const y = startY + (i + 1) * cellHeight;
        
        // 시간 셀 배경
        ctx.fillStyle = document.body.classList.contains('light-mode') ? 'rgba(241, 245, 249, 0.8)' : 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(startX, y, cellWidth, cellHeight);
        
        // 시간 텍스트
        ctx.fillStyle = document.body.classList.contains('light-mode') ? '#64748b' : '#94a3b8';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`${time.period}교시`, startX + cellWidth / 2, y + cellHeight / 3);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(time.startTime, startX + cellWidth / 2, y + (cellHeight * 2) / 3);
    });
    
    // 그리드 선 그리기
    for (let r = 0; r <= totalRows; r++) {
        const y = startY + r * cellHeight;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + cellWidth * totalCols, y);
        ctx.stroke();
    }
    
    for (let c = 0; c <= totalCols; c++) {
        const x = startX + c * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + cellHeight * totalRows);
        ctx.stroke();
    }
    
    // 과목 블록 그리기
    const colorMap = {
        'color-1': '#e57373', 'color-2': '#81c784', 'color-3': '#64b5f6',
        'color-4': '#ba68c8', 'color-5': '#ffb74d', 'color-6': '#4db6ac',
        'color-7': '#7986cb', 'color-8': '#a1887f'
    };
    
    courses.forEach(course => {
        course.times.forEach(timeSlot => {
            if (timeSlot.day > maxDays) return;
            
            const x = startX + timeSlot.day * cellWidth;
            const y = startY + timeSlot.start * cellHeight;
            const width = cellWidth;
            const height = cellHeight * (timeSlot.end - timeSlot.start + 1);
            
            // 과목 블록 배경
            ctx.fillStyle = colorMap[course.color] || colorMap['color-1'];
            ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
            
            // 과목명
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(course.name, x + width / 2, y + height / 2 - 5);
            
            // 교수명/강의실
            const infoParts = [];
            if (settings.showProfessor && course.professor) infoParts.push(course.professor);
            if (settings.showRoom && course.room) infoParts.push(course.room);
            
            if (infoParts.length > 0) {
                ctx.font = '10px Inter, sans-serif';
                ctx.fillText(infoParts.join(' | '), x + width / 2, y + height / 2 + 10);
            }
        });
    });
    
    // 이미지 다운로드
    canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.download = `${currentTimetable.name}_${currentSemester.year}_${currentSemester.term}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(container);
    });
}

// ==================================================================================
// 로그아웃 및 기타 유틸리티 함수들
// ==================================================================================

// 로그아웃 함수
function logout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        localStorage.removeItem('authToken');
        currentUser = null;
        window.location.href = '/login.html';
    }
}

// 이전 페이지로 이동
function goToBack() {
    window.history.back();
}

// 토큰 갱신 함수 (필요한 경우)
async function refreshToken() {
    try {
        const response = await apiRequest('/auth/refresh', {
            method: 'POST'
        });
        
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('토큰 갱신 오류:', error);
        return false;
    }
}

// API 요청 오류 처리 (토큰 만료 등)
async function handleApiError(error) {
    if (error.status === 401) {
        // 토큰 만료 시 갱신 시도
        const refreshed = await refreshToken();
        if (!refreshed) {
            // 갱신 실패 시 로그인 페이지로 이동
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        }
        return refreshed;
    }
    return false;
}

// 네트워크 연결 상태 확인
function checkNetworkStatus() {
    if (!navigator.onLine) {
        alert('네트워크 연결을 확인해주세요.');
        return false;
    }
    return true;
}

// 페이지 언로드 시 임시 데이터 정리
window.addEventListener('beforeunload', function() {
    // 필요한 경우 임시 데이터 정리
    settingsBackup = null;
});

// 에러 리포팅 함수 (선택사항)
function reportError(error, context = '') {
    console.error(`오류 발생 [${context}]:`, error);
    
    // 개발 환경에서만 상세 오류 표시
    if (process.env.NODE_ENV === 'development') {
        console.trace();
    }
    
    // 프로덕션에서는 오류 리포팅 서비스로 전송
    // 예: Sentry, LogRocket 등
}

// ==================================================================================
// 전역 오류 처리
// ==================================================================================

// 전역 오류 핸들러
window.addEventListener('error', function(event) {
    reportError(event.error, 'Global Error');
});

// Promise 거부 오류 핸들러
window.addEventListener('unhandledrejection', function(event) {
    reportError(event.reason, 'Unhandled Promise Rejection');
    event.preventDefault(); // 콘솔 오류 메시지 방지
});

// ==================================================================================
// 추가 유틸리티 함수들
// ==================================================================================

// 날짜 포맷팅 함수
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 시간 포맷팅 함수
function formatTime(hour, minute) {
    if (settings.timeFormat24) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${ampm} ${displayHour}:${minute.toString().padStart(2, '0')}`;
    }
}

// 데이터 유효성 검사 함수
function validateCourseData(courseData) {
    if (!courseData.name || courseData.name.trim() === '') {
        throw new Error('과목명을 입력해주세요.');
    }
    
    if (!courseData.credits || courseData.credits < 1 || courseData.credits > 6) {
        throw new Error('학점은 1-6 사이의 값을 입력해주세요.');
    }
    
    if (!courseData.times || courseData.times.length === 0) {
        throw new Error('시간을 설정해주세요.');
    }
    
    // 시간 유효성 검사
    for (const time of courseData.times) {
        if (time.day < 1 || time.day > 6) {
            throw new Error('올바른 요일을 선택해주세요.');
        }
        if (time.start < 1 || time.start > 10 || time.end < 1 || time.end > 10) {
            throw new Error('올바른 교시를 선택해주세요.');
        }
        if (time.start > time.end) {
            throw new Error('시작 교시는 종료 교시보다 작거나 같아야 합니다.');
        }
    }
    
    return true;
}

// 로딩 상태 표시 함수
function showLoading(message = '처리 중...') {
    // 로딩 오버레이 생성 또는 표시
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-size: 18px;
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.textContent = message;
    loadingOverlay.style.display = 'flex';
}

// 로딩 상태 숨김 함수
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스로틀 함수
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
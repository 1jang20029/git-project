
// 글로벌 변수 선언
let courses = [];
let settings = {
    showWeekend: true,
    showProfessor: true,
    showRoom: true,
    timeFormat24: true,
    theme: 'dark'
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
    { period: 9, startTime: "17:00" }
];

// 요일 데이터
const dayData = ["", "월", "화", "수", "목", "금", "토"];

// 학점 평가 변환표 (학점 평가 -> 점수)
const gradePoints = {
    "A+": 4.5,
    "A0": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B0": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C0": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D0": 1.0,
    "D-": 0.7,
    "F": 0.0,
    "P": null,  // Pass는 평점 계산에 포함하지 않음
    "NP": null  // No Pass는 평점 계산에 포함하지 않음
};

// 이전 설정 저장용
let previousSettings = null;

// 페이지 로드 시 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 기준으로 학기 설정
    setCurrentSemester();
    
    // 설정 로드
    loadSettings();
    
    // 로컬 스토리지에서 시간표 목록 로드
    loadTimetablesFromStorage();
    
    // 시간표 선택기 초기화
    updateTimetableSelector();
    
    // 로컬 스토리지에서 데이터 로드
    loadCoursesFromStorage();
    
    // 학기 선택기 초기화 (setCurrentSemester 후에 실행)
    document.getElementById('semester-select').value = `${currentSemester.year}-${currentSemester.term}`;
    
    // 시간표 생성
    createTimetable();
    
    // 과목 목록 표시
    renderCourseList();
    
    // 학점 계산 및 표시
    calculateGrades();
    
    // 페이지 타이틀 업데이트
    updatePageTitle();
    
    // 설정값 UI에 적용
    applySettingsToUI();
});


// 현재 날짜를 기준으로 학기 설정
function setCurrentSemester() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0부터 시작하므로 +1
    
    // 월을 기준으로 학기 판단
    if (currentMonth >= 3 && currentMonth <= 6) {
        // 3월-6월: 1학기
        currentSemester.year = currentYear;
        currentSemester.term = 1;
    } else if (currentMonth >= 9 && currentMonth <= 12) {
        // 9월-12월: 2학기
        currentSemester.year = currentYear;
        currentSemester.term = 2;
    } else if (currentMonth >= 1 && currentMonth <= 2) {
        // 1월-2월: 이전 년도 2학기
        currentSemester.year = currentYear - 1;
        currentSemester.term = 2;
    } else {
        // 7월-8월: 현재 년도 1학기 (여름방학)
        currentSemester.year = currentYear;
        currentSemester.term = 1;
    }
    
    console.log(`현재 학기 설정: ${currentSemester.year}년 ${currentSemester.term}학기`);
    
    // 학기 드롭다운에 해당 연도/학기가 없으면 추가
    const semesterSelect = document.getElementById('semester-select');
    const targetValue = `${currentSemester.year}-${currentSemester.term}`;
    
    // 옵션이 있는지 확인
    let optionExists = false;
    for (let option of semesterSelect.options) {
        if (option.value === targetValue) {
            optionExists = true;
            break;
        }
    }
    
    // 옵션이 없으면 추가
    if (!optionExists) {
        // 새로운 연도 그룹을 어디에 삽입할지 찾기
        let insertPosition = -1;
        
        // 기존 옵션들 중에서 삽입할 위치 찾기
        for (let i = 0; i < semesterSelect.options.length; i++) {
            const option = semesterSelect.options[i];
            const [year, term] = option.value.split('-').map(Number);
            
            if (year > currentSemester.year) {
                insertPosition = i;
                break;
            }
        }
        
        // 해당 연도의 모든 학기 추가 (1학기, 2학기, 여름학기, 겨울학기)
        const semesters = [
            { value: 1, text: '1학기' },
            { value: 2, text: '2학기' },
            { value: 3, text: '여름학기' },
            { value: 4, text: '겨울학기' }
        ];
        
        // 새 연도의 옵션들 생성
        const newOptions = [];
        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = `${currentSemester.year}-${semester.value}`;
            option.textContent = `${currentSemester.year}년 ${semester.text}`;
            newOptions.push(option);
        });
        
        // 올바른 위치에 삽입
        if (insertPosition === -1) {
            // 마지막에 추가
            newOptions.forEach(option => semesterSelect.appendChild(option));
        } else {
            // 지정된 위치에 추가
            newOptions.forEach((option, index) => {
                semesterSelect.insertBefore(option, semesterSelect.options[insertPosition + index]);
            });
        }
        
        console.log(`새로운 연도 추가: ${currentSemester.year}년`);
    }
}


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
        
        // 시간표 선택 이벤트
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
    
    // 현재 사용자의 시간표 저장
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (currentUser) {
        localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
    }
    
    // 페이지 타이틀 업데이트
    updatePageTitle();
    
    // 선택된 시간표에 맞는 과목 데이터 로드
    loadCoursesFromStorage();
    
    // 시간표 갱신
    renderCoursesOnTimetable();
    
    // 과목 목록 갱신
    renderCourseList();
    
    // 학점 계산 갱신
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
    
    // 시간표 삭제
    timetables = timetables.filter(t => t.id !== timetableId);
    
    // 삭제한 시간표가 현재 시간표인 경우
    if (currentTimetable.id === timetableId) {
        currentTimetable = timetables[0];
        document.getElementById('selected-timetable').textContent = currentTimetable.name;
        updatePageTitle();
    }
    
    // 로컬 스토리지 업데이트
    localStorage.setItem(`timetables_user_${currentUser}`, JSON.stringify(timetables));
    localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
    
    // 해당 시간표의 과목 데이터 삭제
    const semesterKey = `courses_${currentSemester.year}_${currentSemester.term}_${timetableId}_user_${currentUser}`;
    localStorage.removeItem(semesterKey);
    
    // 메뉴 업데이트
    updateTimetableMenu();
    
    // 현재 시간표의 과목 다시 로드
    loadCoursesFromStorage();
    renderCoursesOnTimetable();
    renderCourseList();
    calculateGrades();
}

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    if (!dropdown.contains(event.target)) {
        document.getElementById('timetable-menu').style.display = 'none';
    }
});

// 설정값을 UI에 적용
function applySettingsToUI() {
    document.getElementById('show-professor').checked = settings.showProfessor;
    document.getElementById('show-room').checked = settings.showRoom;
    document.getElementById('theme-select').value = settings.theme;
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
    // 현재 설정을 백업
    previousSettings = JSON.parse(JSON.stringify(settings));
    
    document.getElementById('settings-modal').style.display = 'flex';
}

// 설정 닫기 (취소)
function closeSettings() {
    // 이전 설정으로 복원
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
        // UI에서 설정값 가져오기
        settings.showProfessor = document.getElementById('show-professor').checked;
        settings.showRoom = document.getElementById('show-room').checked;
        settings.theme = document.getElementById('theme-select').value;
        settings.timeFormat24 = document.getElementById('time-format-select').value === '24';
        settings.showWeekend = document.getElementById('weekend-select').value === 'true';
        
        localStorage.setItem(`settings_user_${currentUser}`, JSON.stringify(settings));
        applySettings();
        
        document.getElementById('settings-modal').style.display = 'none';
    }
}

// 설정 적용
function applySettings() {
    // 테마 적용
    applyTheme(settings.theme);
    
    // 시간표 재렌더링
    createTimetable();
    renderCoursesOnTimetable();
}

// 테마 변경
function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    settings.theme = theme;
    applyTheme(theme);
}

// 테마 적용
function applyTheme(theme) {
    const container = document.querySelector('.container');
    
    // 모든 테마 클래스 제거
    container.classList.remove('theme-light', 'theme-blue', 'theme-green');
    
    // 선택된 테마 적용
    if (theme !== 'dark') {
        container.classList.add(`theme-${theme}`);
    }
}

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

// 이미지로 내보내기 (실제 시간표를 이미지로 변환)
function exportToImage() {
    // 시간표 요소 가져오기
    const timetableContainer = document.querySelector('.timetable-container');
    const timetable = document.querySelector('.timetable');
    
    // 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 고해상도 설정
    const scale = 2;
    const rect = timetable.getBoundingClientRect();
    
    // 여백 추가로 크기 조정
    const margin = 40;
    canvas.width = (rect.width + margin * 2) * scale;
    canvas.height = (rect.height + margin * 2) * scale;
    ctx.scale(scale, scale);
    
    // 배경 설정
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, rect.width + margin * 2, rect.height + margin * 2);
    
    // 폰트 설정
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 시간표 데이터 렌더링
    const cellWidth = rect.width / 7; // 시간+요일 6개
    const cellHeight = rect.height / 10; // 헤더+교시 9개
    
    // 헤더 그리기
    ctx.fillStyle = '#222';
    ctx.fillRect(margin, margin, rect.width, cellHeight);
    
    // 헤더 텍스트
    ctx.fillStyle = '#f0f0f0';
    ctx.font = 'bold 14px Arial';
    const headers = ['시간', '월', '화', '수', '목', '금'];
    if (settings.showWeekend) headers.push('토');
    
    headers.forEach((header, i) => {
        ctx.fillText(header, margin + (i + 0.5) * cellWidth, margin + cellHeight / 2);
    });
    
    // 시간표 셀 그리기
    for (let row = 0; row < 9; row++) {
        const period = row + 1;
        const y = margin + (row + 1) * cellHeight;
        
        // 시간 셀 (첫 번째 열)
        ctx.fillStyle = '#222';
        ctx.fillRect(margin, y, cellWidth, cellHeight);
        
        // 시간 텍스트
        ctx.fillStyle = '#f0f0f0';
        ctx.font = 'bold 10px Arial';
        const timeText = `${period}교시`;
        ctx.fillText(timeText, margin + cellWidth / 2, y + cellHeight / 3);
        
        ctx.font = '9px Arial';
        const startTime = timeData[row].startTime;
        ctx.fillText(startTime, margin + cellWidth / 2, y + cellHeight * 2 / 3);
        
        // 요일별 셀 그리기
        const maxDays = settings.showWeekend ? 6 : 5;
        for (let day = 1; day <= maxDays; day++) {
            const x = margin + day * cellWidth;
            
            // 셀 배경
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(x, y, cellWidth, cellHeight);
            
            // 셀 테두리
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
            
            // 해당 시간에 과목이 있는지 확인
            const courseWithTime = courses.find(c => 
                c.times.some(t => t.day === day && period >= t.start && period <= t.end)
            );
            
            if (courseWithTime) {
                const time = courseWithTime.times.find(t => t.day === day && period >= t.start && period <= t.end);
                
                // 과목 색상 적용
                const colorMap = {
                    'color-1': '#e57373',
                    'color-2': '#81c784',
                    'color-3': '#64b5f6',
                    'color-4': '#ba68c8',
                    'color-5': '#ffb74d',
                    'color-6': '#4db6ac',
                    'color-7': '#7986cb',
                    'color-8': '#a1887f'
                };
                
                ctx.fillStyle = colorMap[courseWithTime.color] || '#666';
                
                // 첫 번째 교시인 경우
                if (period === time.start) {
                    // 30분부터 시작하는 블록
                    ctx.fillRect(x + 2, y + cellHeight * 0.5, cellWidth - 4, cellHeight * 0.5 - 2);
                    
                    // 과목명 텍스트
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px Arial';
                    ctx.fillText(courseWithTime.name, x + cellWidth / 2, y + cellHeight * 0.65);
                    
                    // 교수/강의실 정보
                    let infoText = '';
                    if (settings.showProfessor && courseWithTime.professor) {
                        infoText += courseWithTime.professor;
                    }
                    if (settings.showRoom && courseWithTime.room) {
                        infoText += (infoText ? ' ' : '') + courseWithTime.room;
                    }
                    
                    if (infoText) {
                        ctx.font = '8px Arial';
                        ctx.fillText(infoText, x + cellWidth / 2, y + cellHeight * 0.85);
                    }
                } else if (period === time.end) {
                    // 마지막 교시는 20분까지
                    ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight * 0.35 - 2);
                } else {
                    // 중간 교시는 전체
                    ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
                }
            }
        }
    }
    
    // 시간표 제목 추가
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
        `${currentTimetable.name} - ${currentSemester.year}년 ${currentSemester.term}학기`,
        margin + rect.width / 2,
        margin - 10
    );
    
    // 다운로드
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentTimetable.name}_${currentSemester.year}_${currentSemester.term}.png`;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
}

// 현재 시간표 초기화 (기본값으로 복원)
function deleteTimetable() {
    if (confirm('현재 시간표의 모든 데이터가 삭제되고 기본 설정으로 초기화됩니다. 계속하시겠습니까?')) {
        // 과목 데이터 초기화
        courses = [];
        
        // 설정을 기본값으로 복원
        settings = {
            showWeekend: true,
            showProfessor: true,
            showRoom: true,
            timeFormat24: true,
            theme: 'dark'
        };
        
        // 기본값을 UI에 적용
        document.getElementById('show-professor').checked = true;
        document.getElementById('show-room').checked = true;
        document.getElementById('theme-select').value = 'dark';
        document.getElementById('time-format-select').value = '24';
        document.getElementById('weekend-select').value = 'true';
        
        // 설정 저장
        const currentUser = localStorage.getItem('currentLoggedInUser');
        if (currentUser) {
            localStorage.setItem(`settings_user_${currentUser}`, JSON.stringify(settings));
        }
        
        // 기본 테마 적용
        applyTheme('dark');
        
        // 데이터 저장 및 화면 갱신
        saveCoursesToStorage();
        createTimetable();
        renderCourseList();
        calculateGrades();
        
        alert('시간표가 기본값으로 초기화되었습니다.');
    }
}

// 페이지 타이틀 업데이트
function updatePageTitle() {
    document.querySelector('.page-title').textContent = currentTimetable.name;
}

// 로컬 스토리지에서 시간표 목록 로드
function loadTimetablesFromStorage() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (currentUser) {
        const savedTimetables = localStorage.getItem(`timetables_user_${currentUser}`);
        if (savedTimetables) {
            timetables = JSON.parse(savedTimetables);
        }
        
        // 현재 시간표 로드
        const savedCurrentTimetable = localStorage.getItem(`currentTimetable_user_${currentUser}`);
        if (savedCurrentTimetable) {
            currentTimetable = JSON.parse(savedCurrentTimetable);
        }
    }
}

// 시간표 선택기 업데이트
function updateTimetableSelector() {
    document.getElementById('selected-timetable').textContent = currentTimetable.name;
}

// 시간표 변경 함수 (기존 changeTimetable 함수 대체)
function changeTimetable() {
    // 이 함수는 더 이상 사용되지 않음 (커스텀 드롭다운 사용)
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
        // 시간표 이름 업데이트
        currentTimetable.name = newName.trim();
        
        // 시간표 목록에서 해당 시간표 업데이트
        const index = timetables.findIndex(t => t.id === currentTimetable.id);
        if (index !== -1) {
            timetables[index] = currentTimetable;
        }
        
        // 로컬 스토리지에 저장 (사용자별)
        localStorage.setItem(`timetables_user_${currentUser}`, JSON.stringify(timetables));
        localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
        
        // 시간표 선택기 업데이트
        updateTimetableSelector();
        
        // 페이지 타이틀 업데이트
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
        // 새 시간표 ID 생성 (최대 ID + 1)
        const maxId = timetables.reduce((max, t) => Math.max(max, t.id), 0);
        const newId = maxId + 1;
        
        // 새 시간표 객체 생성
        const newTimetable = {
            id: newId,
            name: newName.trim()
        };
        
        // 시간표 목록에 추가
        timetables.push(newTimetable);
        
        // 현재 시간표로 설정
        currentTimetable = newTimetable;
        
        // 로컬 스토리지에 저장 (사용자별)
        localStorage.setItem(`timetables_user_${currentUser}`, JSON.stringify(timetables));
        localStorage.setItem(`currentTimetable_user_${currentUser}`, JSON.stringify(currentTimetable));
        
        // 시간표 선택기 업데이트
        updateTimetableSelector();
        
        // 페이지 타이틀 업데이트
        updatePageTitle();
        
        // 과목 데이터 초기화 및 화면 갱신
        courses = [];
        saveCoursesToStorage();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
    }
}

// 학기 변경 함수
function changeSemester() {
    const semesterSelect = document.getElementById('semester-select');
    const selectedValue = semesterSelect.value;
    const [year, term] = selectedValue.split('-');
    
    currentSemester.year = parseInt(year);
    currentSemester.term = parseInt(term);
    
    // 선택된 학기에 맞는 과목 데이터 로드
    loadCoursesFromStorage();
    
    // 시간표 갱신
    renderCoursesOnTimetable();
    
    // 과목 목록 갱신
    renderCourseList();
    
    // 학점 계산 갱신
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

// 시간표 생성 함수
function createTimetable() {
    const tbody = document.getElementById('timetable-body');
    tbody.innerHTML = '';
    
    // 교시별 행 생성
    for (let i = 0; i < timeData.length; i++) {
        const period = timeData[i].period;
        const startTime = timeData[i].startTime;
        
        const row = document.createElement('tr');
        
        // 시간 열
        const timeCell = document.createElement('td');
        timeCell.className = 'time-col';
        
        // 24시간 형식 처리
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
        
        // 요일별 열 (월~토)
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
    
    // 헤더 업데이트 (주말 표시 여부)
    const headerCells = document.querySelectorAll('.timetable th');
    if (!settings.showWeekend && headerCells.length > 6) {
        headerCells[6].style.display = 'none';
    } else if (settings.showWeekend && headerCells.length > 6) {
        headerCells[6].style.display = '';
    }
    
    // 과목 데이터를 시간표에 표시
    renderCoursesOnTimetable();
}

// 시간표에 과목 데이터 표시
function renderCoursesOnTimetable() {
    // 기존 과목 셀 초기화
    const classCells = document.querySelectorAll('.class-cell');
    classCells.forEach(cell => {
        cell.innerHTML = '';
        cell.style.position = 'relative';
    });
    
    // 과목별로 시간표에 표시
    courses.forEach(course => {
        course.times.forEach(time => {
            // 요일 열 찾기
            const day = time.day;
            const startPeriod = time.start;
            const endPeriod = time.end;
            
            // 30분부터 시작하는 수업 (반만 채우기)
            for (let period = startPeriod; period <= endPeriod; period++) {
                const cell = document.querySelector(`.class-cell[data-day="${day}"][data-period="${period}"]`);
                if (!cell) continue;
                
                // 수업 블록 생성
                const courseBlock = document.createElement('div');
                cell.appendChild(courseBlock);
                
                // 블록 포지셔닝 및 스타일링
                courseBlock.style.position = 'absolute';
                courseBlock.style.zIndex = '5';
                courseBlock.className = `class-item ${course.color}`;
                
                if (period === startPeriod) {
                    // 첫 번째 교시 (30분부터 시작)
                    courseBlock.style.top = '30px';  // 50% 대신 고정값 사용
                    courseBlock.style.height = 'calc(100% - 30px)';
                    courseBlock.style.left = '-1px';
                    courseBlock.style.right = '-1px';
                    courseBlock.style.bottom = '-1px';
                    
                    // 첫 교시에는 과목명과 정보 표시
                    let classInfo = '';
                    if (settings.showProfessor && course.professor) {
                        classInfo += course.professor;
                    }
                    if (settings.showRoom && course.room) {
                        classInfo += (classInfo ? ' ' : '') + course.room;
                    }
                    
                    courseBlock.innerHTML = `
                        <div class="class-name">${course.name}</div>
                        ${classInfo ? `<div class="class-info">${classInfo}</div>` : ''}
                    `;
                } else if (period === endPeriod) {
                    // 마지막 교시 (20분에 종료)
                    courseBlock.style.top = '-1px';
                    courseBlock.style.height = '35%';
                    courseBlock.style.left = '-1px';
                    courseBlock.style.right = '-1px';
                    courseBlock.style.borderTop = 'none';
                    courseBlock.style.borderRadius = '0';
                } else {
                    // 중간 교시 (전체 채우기)
                    courseBlock.style.top = '-1px';
                    courseBlock.style.height = 'calc(100% + 2px)';
                    courseBlock.style.left = '-1px';
                    courseBlock.style.right = '-1px';
                    courseBlock.style.borderRadius = '0';
                }
            }
        });
    });
}

// 과목 목록 표시
function renderCourseList() {
    const courseList = document.getElementById('course-list');
    courseList.innerHTML = '';
    
    if (courses.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '등록된 과목이 없습니다.';
        courseList.appendChild(emptyMessage);
        return;
    }
    
    courses.forEach(course => {
        const li = document.createElement('li');
        li.className = 'class-list-item';
        
        // 과목 시간 정보 문자열 생성 (수정된 부분)
        const timeStrings = course.times.map(time => {
            const day = dayData[time.day];
            
            // 시작 시간 계산 (30분 시작)
            const startHour = 8 + time.start; // 1교시는 9:30이므로
            const startMinute = 30;
            const startTimeDisplay = `${startHour}:${startMinute.toString().padStart(2, '0')}`;
            
            // 종료 시간 계산 (20분 종료)
            const endHour = 8 + time.end + 1; // 1교시 종료는 10:20이므로
            const endMinute = 20;
            const endTimeDisplay = `${endHour}:${endMinute.toString().padStart(2, '0')}`;
            
            const startTime = `${time.start}교시(${startTimeDisplay})`;
            const endTime = `${time.end}교시(${endTimeDisplay})`;
            
            return `${day} ${startTime}~${endTime}`;
        });
        
        // 학점 평가 선택 드롭다운 생성
        const gradeSelect = document.createElement('select');
        gradeSelect.className = 'class-grade-select';
        gradeSelect.dataset.courseId = course.id;
        gradeSelect.innerHTML = `
            <option value="">학점 미정</option>
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
            <option value="P">P (Pass)</option>
            <option value="NP">NP (No Pass)</option>
        `;
        
        // 저장된 학점이 있으면 선택
        if (course.grade) {
            gradeSelect.value = course.grade;
        }
        
        // 학점 변경 이벤트
        gradeSelect.addEventListener('change', function() {
            const courseId = parseInt(this.dataset.courseId);
            const gradeValue = this.value;
            
            // 해당 과목 찾기
            const courseIndex = courses.findIndex(c => c.id === courseId);
            if (courseIndex !== -1) {
                // 학점 업데이트
                courses[courseIndex].grade = gradeValue;
                
                // 저장 및 학점 계산 갱신
                saveCoursesToStorage();
                calculateGrades();
            }
        });

        // HTML 구성 수정
        li.innerHTML = `
            <div class="class-list-info">
                <div class="class-list-title">${course.name}</div>
                <div class="class-list-details">${course.professor || '교수명 미정'} | ${course.credits}학점 | ${course.type}</div>
                <div class="class-list-time">${timeStrings.join(', ')} | ${course.room || '강의실 미정'}</div>
            </div>
            <div class="class-actions">
                <!-- 학점 드롭다운을 여기에 추가할 것입니다 -->
                <button class="class-action-button" onclick="editCourse(${course.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/></svg>
                </button>
                <button class="class-action-button" onclick="deleteCourse(${course.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </div>
        `;

        // 학점 선택 드롭다운 추가 (액션 버튼 앞에 추가)
        const actionsDiv = li.querySelector('.class-actions');
        actionsDiv.insertBefore(gradeSelect, actionsDiv.firstChild);

        // 드롭다운과 다른 버튼 사이 간격 조정
        gradeSelect.style.marginRight = '10px';

        courseList.appendChild(li);
    });
}
    


// 학점 계산 함수 (새로 추가)
function calculateGrades() {
    let totalCredits = 0;
    let totalPoints = 0;
    let majorCredits = 0;
    let majorPoints = 0;
    
    courses.forEach(course => {
        // 학점이 부여된 과목만 계산에 포함
        if (course.grade && gradePoints[course.grade] !== null) {
            const credits = course.credits;
            const points = gradePoints[course.grade];
            
            // 전체 학점 계산
            totalCredits += credits;
            totalPoints += credits * points;
            
            // 전공 과목인 경우 전공 학점 계산
            if (course.type === '전공필수' || course.type === '전공선택') {
                majorCredits += credits;
                majorPoints += credits * points;
            }
        }
    });
    
    // 평점 계산 (학점이 없는 경우 0으로 표시)
    const totalGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    const majorGPA = majorCredits > 0 ? (majorPoints / majorCredits).toFixed(2) : "0.00";
    
    // 화면에 표시
    document.getElementById('total-credits').textContent = totalCredits;
    document.getElementById('total-gpa').textContent = totalGPA;
    document.getElementById('major-gpa').textContent = majorGPA;
}

// 과목 추가 모달 열기
function openAddCourseModal() {
    // 모달 제목 설정
    document.getElementById('modal-title').textContent = '과목 추가';
    
    // 폼 초기화
    document.getElementById('course-form').reset();
    document.getElementById('course-id').value = '';
    document.getElementById('course-grade').value = '';
    
    // 기본 색상 선택
    selectColor(document.querySelector('.color-option'));
    
    // 시간 슬롯 초기화
    const timeSlots = document.getElementById('time-slots');
    timeSlots.innerHTML = '';
    addTimeSlot();
    
    // 모달 표시
    document.getElementById('course-modal').style.display = 'flex';
}

// 과목 수정 모달 열기
function editCourse(courseId) {
    // 해당 과목 찾기
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    // 모달 제목 설정
    document.getElementById('modal-title').textContent = '과목 수정';
    
    // 과목 정보 설정
    document.getElementById('course-id').value = course.id;
    document.getElementById('course-name').value = course.name;
    document.getElementById('course-professor').value = course.professor || '';
    document.getElementById('course-credits').value = course.credits;
    document.getElementById('course-type').value = course.type;
    document.getElementById('course-room').value = course.room || '';
    document.getElementById('course-color').value = course.color;
    document.getElementById('course-grade').value = course.grade || '';
    
    // 색상 선택
    selectColor(document.querySelector(`.color-option[data-color="${course.color}"]`));
    
    // 시간 슬롯 초기화
    const timeSlots = document.getElementById('time-slots');
    timeSlots.innerHTML = '';
    
    // 시간 정보 설정
    course.times.forEach(time => {
        addTimeSlot(time.day, time.start, time.end);
    });
    
    // 시간 정보가 없는 경우 기본 슬롯 추가
    if (course.times.length === 0) {
        addTimeSlot();
    }
    
    // 모달 표시
    document.getElementById('course-modal').style.display = 'flex';
}

// 과목 삭제
function deleteCourse(courseId) {
    if (!confirm('정말 이 과목을 삭제하시겠습니까?')) return;
    
    // 과목 삭제
    courses = courses.filter(course => course.id !== courseId);
    
    // 데이터 저장 및 화면 갱신
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
    // 기존 선택 제거
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 새로운 색상 선택
    element.classList.add('selected');
    document.getElementById('course-color').value = element.dataset.color;
}

// 시간 슬롯 추가
function addTimeSlot(day = 1, start = 1, end = 1) {
    const timeSlots = document.getElementById('time-slots');
    
    const slotDiv = document.createElement('div');
    slotDiv.className = 'form-row time-slot';
    
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
        
        <div class="form-group" style="flex: 0.2">
            <label class="form-label">&nbsp;</label>
            <button type="button" class="form-input" style="background-color: #ff6b6b; color: white; display: flex; align-items: center; justify-content: center;" onclick="removeTimeSlot(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `;
    
    timeSlots.appendChild(slotDiv);
    
    // 초기값 설정
    const daySelect = slotDiv.querySelector('.day-select');
    const startSelect = slotDiv.querySelector('.start-select');
    const endSelect = slotDiv.querySelector('.end-select');
    
    daySelect.value = day;
    startSelect.value = start;
    endSelect.value = end;
    
    // 시작 교시가 변경될 때 종료 교시 업데이트
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
    
    // 최소 하나의 슬롯은 유지
    if (timeSlots.querySelectorAll('.time-slot').length > 1) {
        timeSlots.removeChild(slot);
    }
}

// 과목 저장

function saveCourse(event) {
    event.preventDefault();

    // 모든 시간 슬롯 요소
    const slotEls = document.querySelectorAll('.time-slot');

    // 1) 시작 교시와 종료 교시는 서로 상이
    for (let slot of slotEls) {
        const start = slot.querySelector('.start-select').value;
        const end   = slot.querySelector('.end-select').value;
        if (start === end) {
            // 기존 오류 메시지 제거
            let err = document.getElementById('time-error');
            if (err) err.remove();
            // 새로운 오류 메시지 생성
            const form = document.getElementById('course-form');
            err = document.createElement('div');
            err.id = 'time-error';
            err.style.color = '#ff6b6b';
            err.style.marginBottom = '12px';
            err.textContent = '⚠️ 시작 교시와 종료 교시는 반드시 달라야 합니다.';
            form.prepend(err);
            return; // 저장 중단
        }
    }

    // 2) 동일한 요일·교시 중복 검사
    const keys = [];
    const dupes = [];
    slotEls.forEach(slot => {
        const day   = slot.querySelector('.day-select').value;
        const start = slot.querySelector('.start-select').value;
        const end   = slot.querySelector('.end-select').value;
        const key   = `${day}-${start}-${end}`;
        if (keys.includes(key)) dupes.push(key);
        keys.push(key);
    });
    if (dupes.length > 0) {
        let err = document.getElementById('time-error');
        if (err) err.remove();
        const form = document.getElementById('course-form');
        err = document.createElement('div');
        err.id = 'time-error';
        err.style.color = '#ff6b6b';
        err.style.marginBottom = '12px';
        err.textContent = '⚠️ 동일한 요일·교시가 중복 입력되었습니다.';
        form.prepend(err);
        return; // 저장 중단
    }

    // 3) 과목 정보 수집
    const courseId  = document.getElementById('course-id').value;
    const name      = document.getElementById('course-name').value.trim();
    const professor = document.getElementById('course-professor').value.trim();
    const credits   = parseInt(document.getElementById('course-credits').value, 10);
    const type      = document.getElementById('course-type').value;
    const room      = document.getElementById('course-room').value.trim();
    const color     = document.getElementById('course-color').value;
    const grade     = document.getElementById('course-grade').value;

    // 4) 시간 정보 수집
    const times = [];
    slotEls.forEach(slot => {
        const day   = parseInt(slot.querySelector('.day-select').value, 10);
        const start = parseInt(slot.querySelector('.start-select').value, 10);
        const end   = parseInt(slot.querySelector('.end-select').value, 10);
        times.push({ day, start, end });
    });

    // 5) 과목 객체 생성
    const course = {
        id:        courseId ? parseInt(courseId, 10) : Date.now(),
        name,
        professor,
        credits,
        type,
        color,
        room,
        times,
        grade:     grade || null
    };

    // 6) 기존 과목 수정 또는 새 과목 추가
    if (courseId) {
        const idx = courses.findIndex(c => c.id === course.id);
        if (idx !== -1) {
            courses[idx] = course;
        }
    } else {
        courses.push(course);
    }

    // 7) 저장 및 화면 갱신
    saveCoursesToStorage();
    renderCourseList();
    renderCoursesOnTimetable();
    calculateGrades();

    // 8) 모달 닫기
    closeModal();
}


// 이전 페이지로 이동
function goToBack() {
    window.history.back();
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // 과목 모달 닫기
        if (document.getElementById('course-modal').style.display === 'flex') {
            closeModal();
        }
        // 설정 모달 닫기
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
        // 필요한 경우 레이아웃 재조정
        if (window.innerWidth <= 768) {
            // 모바일 뷰 조정
            document.querySelector('.container').style.maxWidth = '100%';
        } else {
            // 데스크톱 뷰 복원
            document.querySelector('.container').style.maxWidth = '768px';
        }
    }, 250);
});

// 초기 화면 크기에 따른 레이아웃 설정
if (window.innerWidth <= 768) {
    document.querySelector('.container').style.maxWidth = '100%';
}

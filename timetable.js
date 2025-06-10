// ==================================================================================
// PC 웹 브라우저 최적화 시간표 JavaScript - 백엔드 연동 완전 개선 버전
// MySQL + Node.js 백엔드 연동 대응
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
    year: 2024,
    term: 1
};
let currentTimetable = {
    id: 1,
    name: "시간표 1" 
};
let timetables = [];
let currentUser = null;

// API 설정
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// 시간 데이터 (교시별 시간)
const timeData = [
    { period: 1, startTime: "09:00", endTime: "10:20" },
    { period: 2, startTime: "10:30", endTime: "11:50" },
    { period: 3, startTime: "12:00", endTime: "13:20" },
    { period: 4, startTime: "13:30", endTime: "14:50" },
    { period: 5, startTime: "15:00", endTime: "16:20" },
    { period: 6, startTime: "16:30", endTime: "17:50" },
    { period: 7, startTime: "18:00", endTime: "19:20" },
    { period: 8, startTime: "19:30", endTime: "20:50" },
    { period: 9, startTime: "21:00", endTime: "22:20" },
    { period: 10, startTime: "22:30", endTime: "23:50" }
];

// 요일 데이터
const dayData = ["", "월", "화", "수", "목", "금", "토"];

// 학점 평가 변환표
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
// API 통신 관련 함수들
// ==================================================================================

// API 요청 래퍼 함수
async function apiRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
                throw new Error('인증이 필요합니다.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error('API 요청 실패:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showErrorMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        } else {
            showErrorMessage(error.message || '서버 오류가 발생했습니다.');
        }
        throw error;
    }
}

// 인증 실패 처리
function handleUnauthorized() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
}

// 에러 메시지 표시
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(successDiv);
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// 로딩 표시
function showLoading(message = '로딩 중...') {
    hideLoading(); // 기존 로딩 제거
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    `;
    
    document.body.appendChild(loadingDiv);
}

// 로딩 숨김
function hideLoading() {
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// ==================================================================================
// 인증 및 사용자 관리
// ==================================================================================

// 현재 로그인 사용자 확인
async function getCurrentUser() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        const userData = await apiRequest('/auth/me');
        currentUser = userData.data || userData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return currentUser;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        return null;
    }
}

// 로그인 상태 확인
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!token || !userData) {
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
        return false;
    }
    
    try {
        currentUser = JSON.parse(userData);
        return true;
    } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        handleUnauthorized();
        return false;
    }
}

// ==================================================================================
// 초기화 및 이벤트 핸들러
// ==================================================================================

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 인증 확인
        if (!checkAuthStatus()) return;
        
        showLoading('데이터를 불러오는 중...');
        
        // 현재 사용자 정보 갱신
        await getCurrentUser();
        
        // 초기 설정
        setCurrentSemester();
        
        // 데이터 로드
        await Promise.all([
            loadSettings(),
            loadTimetablesFromAPI(),
        ]);
        
        await loadCoursesFromAPI();
        
        // UI 초기화
        updateTimetableSelector();
        const semesterSelect = document.getElementById('semester-select');
        if (semesterSelect) {
            semesterSelect.value = `${currentSemester.year}-${currentSemester.term}`;
        }
        
        createTimetable();
        renderCourseList();
        calculateGrades();
        updatePageTitle();
        applySettingsToUI();
        
        // 이벤트 리스너 등록
        setupEventListeners();
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('초기화 실패:', error);
        showErrorMessage('데이터 로드에 실패했습니다. 페이지를 새로고침해주세요.');
    }
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // ESC 키 이벤트
    document.addEventListener('keydown', handleEscapeKey);
    
    // 모달 외부 클릭 이벤트
    const courseModal = document.getElementById('course-modal');
    const settingsModal = document.getElementById('settings-modal');
    
    if (courseModal) {
        courseModal.addEventListener('click', handleModalOutsideClick);
    }
    if (settingsModal) {
        settingsModal.addEventListener('click', handleModalOutsideClick);
    }
    
    // 드롭다운 외부 클릭 이벤트
    document.addEventListener('click', handleDropdownOutsideClick);
    
    // 브라우저 창 크기 변경 이벤트
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
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

    // 온라인/오프라인 상태 감지
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // 키보드 단축키
    document.addEventListener('keydown', handleKeyboardShortcuts);
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

// 온라인 상태 변경 처리
function handleOnlineStatusChange() {
    if (navigator.onLine) {
        showSuccessMessage('인터넷 연결이 복구되었습니다.');
        syncDataIfNeeded();
    } else {
        showErrorMessage('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.');
    }
}

// 오프라인 시 데이터 동기화
async function syncDataIfNeeded() {
    try {
        const lastSync = localStorage.getItem('lastSyncTime');
        const now = Date.now();
        
        if (!lastSync || (now - parseInt(lastSync)) > 5 * 60 * 1000) {
            await loadCoursesFromAPI();
            await loadTimetablesFromAPI();
            localStorage.setItem('lastSyncTime', now.toString());
        }
    } catch (error) {
        console.error('데이터 동기화 실패:', error);
    }
}

// 키보드 단축키 처리
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S: 저장
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const courseModal = document.getElementById('course-modal');
        if (courseModal && courseModal.style.display === 'flex') {
            const form = document.getElementById('course-form');
            if (form) {
                saveCourse(event);
            }
        }
    }
    
    // Ctrl/Cmd + N: 새 과목 추가
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openAddCourseModal();
    }
    
    // Ctrl/Cmd + E: 이미지 내보내기
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        exportToImage();
    }
}

// 현재 날짜를 기준으로 학기 설정
function setCurrentSemester() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (currentMonth >= 3 && currentMonth <= 8) {
        currentSemester.year = currentYear;
        currentSemester.term = 1;
    } else if (currentMonth >= 9 && currentMonth <= 12) {
        currentSemester.year = currentYear;
        currentSemester.term = 2;
    } else {
        currentSemester.year = currentYear - 1;
        currentSemester.term = 2;
    }
}

// ==================================================================================
// 이벤트 핸들러 함수들
// ==================================================================================

// ESC 키 처리
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const courseModal = document.getElementById('course-modal');
        const settingsModal = document.getElementById('settings-modal');
        
        if (courseModal && courseModal.style.display === 'flex') {
            closeModal();
        } else if (settingsModal && settingsModal.style.display === 'flex') {
            closeSettings();
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
            closeSettings();
        }
    }
}

// 드롭다운 외부 클릭 처리
function handleDropdownOutsideClick(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        const menu = document.getElementById('timetable-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
}

// 창 크기 변경 처리
function handleWindowResize() {
    renderCoursesOnTimetable();
}

// 설정 실시간 미리보기
function handleSettingsPreview() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal && settingsModal.style.display === 'flex') {
        const tempSettings = {
            showProfessor: document.getElementById('show-professor')?.checked || false,
            showRoom: document.getElementById('show-room')?.checked || false,
            appearance: document.getElementById('theme-select')?.value || 'dark',
            timeFormat24: document.getElementById('time-format-select')?.value === '24',
            showWeekend: document.getElementById('weekend-select')?.value === 'true'
        };
        
        applyTempSettings(tempSettings);
    }
}

// ==================================================================================
// 시간표 관리 함수들 - API 연동
// ==================================================================================

// API에서 시간표 목록 로드
async function loadTimetablesFromAPI() {
    try {
        const response = await apiRequest('/timetables');
        timetables = response.data || response || [];
        
        // 현재 시간표가 없거나 목록에 없으면 첫 번째 시간표 선택
        if (!currentTimetable.id || !timetables.find(t => t.id === currentTimetable.id)) {
            if (timetables.length > 0) {
                currentTimetable = timetables[0];
            } else {
                await createDefaultTimetable();
            }
        }
        
        // 로컬 캐시 업데이트
        localStorage.setItem('timetables_cache', JSON.stringify(timetables));
        localStorage.setItem('currentTimetable_cache', JSON.stringify(currentTimetable));
        
    } catch (error) {
        console.error('시간표 목록 로드 실패:', error);
        // 오프라인 모드: 로컬 캐시 사용
        const cachedTimetables = localStorage.getItem('timetables_cache');
        const cachedCurrentTimetable = localStorage.getItem('currentTimetable_cache');
        
        if (cachedTimetables) {
            timetables = JSON.parse(cachedTimetables);
        }
        if (cachedCurrentTimetable) {
            currentTimetable = JSON.parse(cachedCurrentTimetable);
        }
        
        if (timetables.length === 0) {
            timetables = [{ id: 1, name: "시간표 1" }];
            currentTimetable = timetables[0];
        }
    }
}

// 기본 시간표 생성
async function createDefaultTimetable() {
    try {
        const response = await apiRequest('/timetables', {
            method: 'POST',
            body: JSON.stringify({
                name: '시간표 1'
            })
        });
        
        const newTimetable = response.data || response;
        timetables = [newTimetable];
        currentTimetable = newTimetable;
        
    } catch (error) {
        console.error('기본 시간표 생성 실패:', error);
        currentTimetable = { id: Date.now(), name: "시간표 1" };
        timetables = [currentTimetable];
    }
}

// 커스텀 드롭다운 토글
function toggleTimetableDropdown() {
    const menu = document.getElementById('timetable-menu');
    if (!menu) return;
    
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    updateTimetableMenu();
}

// 시간표 메뉴 업데이트
function updateTimetableMenu() {
    const menu = document.getElementById('timetable-menu');
    if (!menu) return;
    
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
    try {
        const timetable = timetables.find(t => t.id === timetableId);
        if (!timetable) return;
        
        currentTimetable = timetable;
        const selectedEl = document.getElementById('selected-timetable');
        if (selectedEl) {
            selectedEl.textContent = timetable.name;
        }
        
        // 로컬 캐시 업데이트
        localStorage.setItem('currentTimetable_cache', JSON.stringify(currentTimetable));
        
        updatePageTitle();
        await loadCoursesFromAPI();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
        
    } catch (error) {
        console.error('시간표 선택 실패:', error);
        showErrorMessage('시간표를 불러오는데 실패했습니다.');
    }
}

// 시간표 이름 변경
async function renameTimetable() {
    const newName = prompt("시간표 이름을 입력하세요:", currentTimetable.name);
    if (!newName || newName.trim() === "") return;
    
    try {
        showLoading('시간표 이름을 변경하는 중...');
        
        await apiRequest(`/timetables/${currentTimetable.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: newName.trim()
            })
        });
        
        currentTimetable.name = newName.trim();
        
        const index = timetables.findIndex(t => t.id === currentTimetable.id);
        if (index !== -1) {
            timetables[index] = currentTimetable;
        }
        
        // 로컬 캐시 업데이트
        localStorage.setItem('timetables_cache', JSON.stringify(timetables));
        localStorage.setItem('currentTimetable_cache', JSON.stringify(currentTimetable));
        
        updateTimetableSelector();
        updatePageTitle();
        hideLoading();
        showSuccessMessage('시간표 이름이 변경되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('시간표 이름 변경 실패:', error);
        showErrorMessage('시간표 이름 변경에 실패했습니다.');
    }
}

// 새 시간표 추가
async function addNewTimetable() {
    const newName = prompt("새 시간표 이름을 입력하세요:", "새 시간표");
    if (!newName || newName.trim() === "") return;
    
    try {
        showLoading('새 시간표를 생성하는 중...');
        
        const response = await apiRequest('/timetables', {
            method: 'POST',
            body: JSON.stringify({
                name: newName.trim()
            })
        });
        
        const newTimetable = response.data || response;
        timetables.push(newTimetable);
        currentTimetable = newTimetable;
        
        // 로컬 캐시 업데이트
        localStorage.setItem('timetables_cache', JSON.stringify(timetables));
        localStorage.setItem('currentTimetable_cache', JSON.stringify(currentTimetable));
        
        updateTimetableSelector();
        updatePageTitle();
        
        courses = [];
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
        
        hideLoading();
        showSuccessMessage('새 시간표가 생성되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('시간표 생성 실패:', error);
        showErrorMessage('시간표 생성에 실패했습니다.');
    }
}

// 시간표 삭제
async function deleteTimetableFromDropdown(timetableId) {
    if (timetables.length <= 1) {
        alert('마지막 시간표는 삭제할 수 없습니다.');
        return;
    }
    
    if (!confirm('정말 이 시간표를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        showLoading('시간표를 삭제하는 중...');
        
        await apiRequest(`/timetables/${timetableId}`, {
            method: 'DELETE'
        });
        
        timetables = timetables.filter(t => t.id !== timetableId);
        
        if (currentTimetable.id === timetableId) {
            currentTimetable = timetables[0];
            const selectedEl = document.getElementById('selected-timetable');
            if (selectedEl) {
                selectedEl.textContent = currentTimetable.name;
            }
            updatePageTitle();
            await loadCoursesFromAPI();
        }
        
        // 로컬 캐시 업데이트
        localStorage.setItem('timetables_cache', JSON.stringify(timetables));
        localStorage.setItem('currentTimetable_cache', JSON.stringify(currentTimetable));
        
        updateTimetableMenu();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
        
        hideLoading();
        showSuccessMessage('시간표가 삭제되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('시간표 삭제 실패:', error);
        showErrorMessage('시간표 삭제에 실패했습니다.');
    }
}

// 페이지 타이틀 업데이트
function updatePageTitle() {
    const titleElement = document.querySelector('.page-title');
    if (titleElement) {
        titleElement.textContent = currentTimetable.name;
    }
}

// 시간표 선택기 업데이트
function updateTimetableSelector() {
    const selectorElement = document.getElementById('selected-timetable');
    if (selectorElement) {
        selectorElement.textContent = currentTimetable.name;
    }
}

// ==================================================================================
// 학기 및 과목 관리 함수들 - API 연동
// ==================================================================================

// 학기 변경 함수
async function changeSemester() {
    const semesterSelect = document.getElementById('semester-select');
    if (!semesterSelect) return;
    
    const selectedValue = semesterSelect.value;
    const [year, term] = selectedValue.split('-');
    
    currentSemester.year = parseInt(year);
    currentSemester.term = parseInt(term);
    
    try {
        showLoading('학기 데이터를 불러오는 중...');
        await loadCoursesFromAPI();
        renderCoursesOnTimetable();
        renderCourseList();
        calculateGrades();
        hideLoading();
    } catch (error) {
        hideLoading();
        showErrorMessage('학기 데이터를 불러오는데 실패했습니다.');
    }
}

// API에서 과목 데이터 로드
async function loadCoursesFromAPI() {
    try {
        const response = await apiRequest(
            `/courses?year=${currentSemester.year}&term=${currentSemester.term}&timetableId=${currentTimetable.id}`
        );
        
        courses = response.data || response || [];
        
        // 로컬 캐시 업데이트
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(courses));
        
    } catch (error) {
        console.error('과목 데이터 로드 실패:', error);
        
        // 오프라인 모드: 로컬 캐시 사용
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        const cachedCourses = localStorage.getItem(cacheKey);
        
        if (cachedCourses) {
            courses = JSON.parse(cachedCourses);
        } else {
            courses = [];
        }
    }
}

// ==================================================================================
// 시간표 생성 및 렌더링 함수들
// ==================================================================================

// 시간표 생성 함수
function createTimetable() {
    const tbody = document.getElementById('timetable-body');
    if (!tbody) return;
    
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
    if (!container) return;
    
    const baseRect = container.getBoundingClientRect();

    container.querySelectorAll('.class-item').forEach(el => el.remove());

    const sampleCell = container.querySelector('.class-cell[data-day="1"][data-period="1"]');
    if (!sampleCell) return;
    
    const cellRect = sampleCell.getBoundingClientRect();
    const cellH = cellRect.height;
    const cellW = cellRect.width;

    courses.forEach(course => {
        if (!course.times || !Array.isArray(course.times)) return;
        
        course.times.forEach(timeSlot => {
            if (!timeSlot || !timeSlot.day || !timeSlot.start || !timeSlot.end) return;
            
            const maxDays = settings.showWeekend ? 6 : 5;
            if (timeSlot.day > maxDays) return;
            
            const x = cellRect.left - baseRect.left + (timeSlot.day - 1) * cellW;
            const y = cellRect.top - baseRect.top + (timeSlot.start - 1) * cellH + cellH * 0.5;
            const h = (timeSlot.end - timeSlot.start + 1) * cellH;

            const block = document.createElement('div');
            block.className = `class-item ${course.color || 'color-1'}`;
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
                zIndex: 5,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            });

            const nameHTML = `<div class="class-name">${course.name || '과목명 없음'}</div>`;

            const infoParts = [];
            if (settings.showProfessor && course.professor) {
                infoParts.push(course.professor);
            }
            if (settings.showRoom && course.room) {
                infoParts.push(course.room);
            }
            const infoHTML = infoParts.length
                ? `<div class="class-info">${infoParts.join(' | ')}</div>`
                : '';

            block.innerHTML = nameHTML + infoHTML;
            
            // 과목 블록 클릭 이벤트
            block.addEventListener('click', () => editCourse(course.id));
            
            // 호버 효과
            block.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.zIndex = '10';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            });
            
            block.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.zIndex = '5';
                this.style.boxShadow = '';
            });
            
            container.appendChild(block);
        });
    });
}

// 과목 목록 표시
function renderCourseList() {
    const courseList = document.getElementById('course-list');
    if (!courseList) return;
    
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
        
        const timeStrings = course.times ? course.times.map(timeSlot => {
            const day = dayData[timeSlot.day] || '?';
            const startTimeData = timeData.find(t => t.period === timeSlot.start);
            const endTimeData = timeData.find(t => t.period === timeSlot.end);
            
            const startTime = startTimeData ? `${timeSlot.start}교시(${startTimeData.startTime})` : `${timeSlot.start}교시`;
            const endTime = endTimeData ? `${timeSlot.end}교시(${endTimeData.endTime})` : `${timeSlot.end}교시`;
            
            return `${day} ${startTime}~${endTime}`;
        }) : [];
        
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
            await updateCourseGrade(parseInt(this.dataset.courseId), this.value);
        });

        li.innerHTML = `
            <div class="course-info">
                <div class="course-name">${course.name || '과목명 없음'}</div>
                <div class="course-details">${course.professor || '교수명 미정'} | ${course.credits || 0}학점 | ${course.type || '미정'}</div>
                <div class="course-details" style="margin-top: 0.25rem;">${timeStrings.join(', ') || '시간 미정'} | ${course.room || '강의실 미정'}</div>
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

        // 호버 효과
        li.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        });
        
        li.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });

        courseList.appendChild(li);
    });
}

// 과목 성적 업데이트
async function updateCourseGrade(courseId, grade) {
    try {
        const courseIndex = courses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) return;
        
        const originalGrade = courses[courseIndex].grade;
        courses[courseIndex].grade = grade;
        
        // API 업데이트
        await apiRequest(`/courses/${courseId}`, {
            method: 'PATCH',
            body: JSON.stringify({ grade })
        });
        
        // 로컬 캐시 업데이트
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(courses));
        
        calculateGrades();
        
    } catch (error) {
        console.error('성적 업데이트 실패:', error);
        showErrorMessage('성적 업데이트에 실패했습니다.');
        
        // 실패 시 원복
        const courseIndex = courses.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
            const gradeSelect = document.querySelector(`select[data-course-id="${courseId}"]`);
            if (gradeSelect) {
                gradeSelect.value = courses[courseIndex].grade || '';
            }
        }
    }
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
        if (course.grade && gradePoints[course.grade] !== null && gradePoints[course.grade] !== undefined) {
            const credits = course.credits || 0;
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
    
    const totalCreditsEl = document.getElementById('total-credits');
    const totalGpaEl = document.getElementById('total-gpa');
    const majorGpaEl = document.getElementById('major-gpa');
    
    if (totalCreditsEl) totalCreditsEl.textContent = totalCredits;
    if (totalGpaEl) totalGpaEl.textContent = totalGPA;
    if (majorGpaEl) majorGpaEl.textContent = majorGPA;
}

// ==================================================================================
// 과목 모달 관련 함수들 - API 연동
// ==================================================================================

// 과목 추가 모달 열기
function openAddCourseModal() {
    const modalTitle = document.getElementById('modal-title');
    const courseForm = document.getElementById('course-form');
    const courseId = document.getElementById('course-id');
    const courseGrade = document.getElementById('course-grade');
    
    if (modalTitle) modalTitle.textContent = '과목 추가';
    if (courseForm) courseForm.reset();
    if (courseId) courseId.value = '';
    if (courseGrade) courseGrade.value = '';
    
    const firstColorOption = document.querySelector('.color-option');
    if (firstColorOption) selectColor(firstColorOption);
    
    const timeSlots = document.getElementById('time-slots');
    if (timeSlots) {
        timeSlots.innerHTML = '';
        addTimeSlot();
    }
    
    const courseModal = document.getElementById('course-modal');
    if (courseModal) courseModal.style.display = 'flex';
}

// 과목 수정 모달 열기
function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = '과목 수정';
    
    // 폼 필드 채우기
    const fields = {
        'course-id': course.id,
        'course-name': course.name || '',
        'course-professor': course.professor || '',
        'course-credits': course.credits || 1,
        'course-type': course.type || '교양',
        'course-room': course.room || '',
        'course-color': course.color || 'color-1',
        'course-grade': course.grade || ''
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });
    
    // 색상 선택
    const colorOption = document.querySelector(`.color-option[data-color="${course.color || 'color-1'}"]`);
    if (colorOption) selectColor(colorOption);
    
    // 시간 슬롯 설정
    const timeSlots = document.getElementById('time-slots');
    if (timeSlots) {
        timeSlots.innerHTML = '';
        
        if (course.times && course.times.length > 0) {
            course.times.forEach(timeSlot => {
                addTimeSlot(timeSlot.day, timeSlot.start, timeSlot.end);
            });
        } else {
            addTimeSlot();
        }
    }
    
    const courseModal = document.getElementById('course-modal');
    if (courseModal) courseModal.style.display = 'flex';
}

// 과목 삭제
async function deleteCourse(courseId) {
    if (!confirm('정말 이 과목을 삭제하시겠습니까?')) return;
    
    try {
        showLoading('과목을 삭제하는 중...');
        
        await apiRequest(`/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        courses = courses.filter(course => course.id !== courseId);
        
        // 로컬 캐시 업데이트
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(courses));
        
        renderCourseList();
        renderCoursesOnTimetable();
        calculateGrades();
        
        hideLoading();
        showSuccessMessage('과목이 삭제되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('과목 삭제 실패:', error);
        showErrorMessage('과목 삭제에 실패했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    const courseModal = document.getElementById('course-modal');
    if (courseModal) courseModal.style.display = 'none';
}

// 과목 색상 선택
function selectColor(element) {
    if (!element) return;
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    const courseColor = document.getElementById('course-color');
    if (courseColor) {
        courseColor.value = element.dataset.color;
    }
}

// 시간 슬롯 추가
function addTimeSlot(day = 1, start = 1, end = 1) {
    const timeSlots = document.getElementById('time-slots');
    if (!timeSlots) return;
    
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
                ${timeData.map(t => 
                    `<option value="${t.period}">${t.period}교시 (${t.startTime})</option>`
                ).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">종료 교시</label>
            <select class="form-select end-select">
                ${timeData.map(t => 
                    `<option value="${t.period}">${t.period}교시 (${t.endTime})</option>`
                ).join('')}
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
    
    if (daySelect) daySelect.value = day;
    if (startSelect) startSelect.value = start;
    if (endSelect) endSelect.value = end;
    
    if (startSelect && endSelect) {
        startSelect.addEventListener('change', function() {
            const startValue = parseInt(this.value);
            const endValue = parseInt(endSelect.value);
            
            if (endValue < startValue) {
                endSelect.value = startValue;
            }
        });
    }
}

// 시간 슬롯 제거
function removeTimeSlot(button) {
    const timeSlots = document.getElementById('time-slots');
    const slot = button.closest('.time-slot');
    
    if (timeSlots && slot && timeSlots.querySelectorAll('.time-slot').length > 1) {
        timeSlots.removeChild(slot);
    }
}

// 과목 저장
async function saveCourse(event) {
    event.preventDefault();
    
    try {
        // 폼 데이터 수집
        const formData = collectFormData();
        if (!formData) return;
        
        // 시간 충돌 검사
        if (!validateTimeSlots(formData.times, formData.id)) {
            return;
        }
        
        showLoading(formData.id ? '과목을 수정하는 중...' : '과목을 추가하는 중...');
        
        let savedCourse;
        if (formData.id) {
            // 수정
            const response = await apiRequest(`/courses/${formData.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            
            savedCourse = response.data || response;
            const index = courses.findIndex(c => c.id === formData.id);
            if (index !== -1) {
                courses[index] = savedCourse;
            }
        } else {
            // 추가
            const response = await apiRequest('/courses', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    year: currentSemester.year,
                    term: currentSemester.term,
                    timetableId: currentTimetable.id
                })
            });
            
            savedCourse = response.data || response;
            courses.push(savedCourse);
        }
        
        // 로컬 캐시 업데이트
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(courses));
        
        renderCourseList();
        renderCoursesOnTimetable();
        calculateGrades();
        
        closeModal();
        hideLoading();
        showSuccessMessage(formData.id ? '과목이 수정되었습니다.' : '과목이 추가되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('과목 저장 실패:', error);
        showErrorMessage('과목 저장에 실패했습니다.');
    }
}

// 폼 데이터 수집
function collectFormData() {
    const name = document.getElementById('course-name')?.value?.trim();
    if (!name) {
        showErrorMessage('과목명을 입력해주세요.');
        return null;
    }
    
    const professor = document.getElementById('course-professor')?.value?.trim() || '';
    const credits = parseInt(document.getElementById('course-credits')?.value) || 1;
    const type = document.getElementById('course-type')?.value || '교양';
    const room = document.getElementById('course-room')?.value?.trim() || '';
    const color = document.getElementById('course-color')?.value || 'color-1';
    const grade = document.getElementById('course-grade')?.value || null;
    const id = document.getElementById('course-id')?.value;
    
    const timeSlots = Array.from(document.querySelectorAll('.time-slot')).map(slot => ({
        day: parseInt(slot.querySelector('.day-select')?.value) || 1,
        start: parseInt(slot.querySelector('.start-select')?.value) || 1,
        end: parseInt(slot.querySelector('.end-select')?.value) || 1
    }));
    
    return {
        id: id ? parseInt(id) : null,
        name,
        professor,
        credits,
        type,
        room,
        color,
        grade,
        times: timeSlots
    };
}

// 시간 충돌 검사
function validateTimeSlots(timeSlots, editingId) {
    // 같은 과목 내 시간 겹침 검사
    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
            if (timeSlots[i].day === timeSlots[j].day) {
                if (timeSlots[i].start <= timeSlots[j].end && timeSlots[j].start <= timeSlots[i].end) {
                    showTimeError('⚠️ 같은 과목 내에 시간이 겹칩니다.');
                    return false;
                }
            }
        }
    }

    // 기존 과목과 시간 겹침 검사
    for (let slot of timeSlots) {
        for (let course of courses) {
            if (editingId && course.id === editingId) continue;
            
            if (course.times) {
                for (let time of course.times) {
                    if (slot.day === time.day) {
                        if (slot.start <= time.end && time.start <= slot.end) {
                            showTimeError('⚠️ 해당 시간대에 이미 다른 과목이 있습니다.');
                            return false;
                        }
                    }
                }
            }
        }
    }

    removeTimeError();
    return true;
}

// 에러 메시지 표시
function showTimeError(text) {
    removeTimeError();
    const form = document.getElementById('course-form');
    if (!form) return;
    
    const err = document.createElement('div');
    err.id = 'time-error';
    err.style.cssText = `
        color: #ef4444;
        margin-bottom: 12px;
        padding: 0.75rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
    `;
    err.textContent = text;
    form.prepend(err);
}

// 기존 에러 메시지 제거
function removeTimeError() {
    const oldError = document.getElementById('time-error');
    if (oldError) oldError.remove();
}

// ==================================================================================
// 설정 관련 함수들 - API 연동
// ==================================================================================

// 설정 로드
async function loadSettings() {
    try {
        const response = await apiRequest('/settings');
        const serverSettings = response.data || response;
        
        settings = { ...settings, ...serverSettings };
        applySettings();
        
    } catch (error) {
        console.error('설정 로드 실패:', error);
        // 오프라인 모드: 로컬 캐시 사용
        const cachedSettings = localStorage.getItem('settings_cache');
        if (cachedSettings) {
            settings = { ...settings, ...JSON.parse(cachedSettings) };
            applySettings();
        }
    }
}

// 설정값을 UI에 적용
function applySettingsToUI() {
    const elements = {
        'show-professor': settings.showProfessor,
        'show-room': settings.showRoom,
        'theme-select': settings.appearance || 'dark',
        'time-format-select': settings.timeFormat24 ? '24' : '12',
        'weekend-select': settings.showWeekend.toString()
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
}

// 설정 모달 열기
function openSettings() {
    settingsBackup = JSON.parse(JSON.stringify(settings));
    applySettingsToUI();
    
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.style.display = 'flex';
}

// 설정 모달 닫기 (취소)
function closeSettings() {
    if (settingsBackup) {
        settings = JSON.parse(JSON.stringify(settingsBackup));
        applySettings();
        settingsBackup = null;
    }
    
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.style.display = 'none';
}

// 설정 저장
async function saveSettings() {
    try {
        showLoading('설정을 저장하는 중...');
        
        // UI에서 설정값 읽기
        const newSettings = {
            showProfessor: document.getElementById('show-professor')?.checked || false,
            showRoom: document.getElementById('show-room')?.checked || false,
            appearance: document.getElementById('theme-select')?.value || 'dark',
            timeFormat24: document.getElementById('time-format-select')?.value === '24',
            showWeekend: document.getElementById('weekend-select')?.value === 'true'
        };
        
        // API로 설정 저장
        await apiRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify(newSettings)
        });
        
        settings = { ...settings, ...newSettings };
        
        // 로컬 캐시 업데이트
        localStorage.setItem('settings_cache', JSON.stringify(settings));
        
        applySettings();
        settingsBackup = null;
        
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) settingsModal.style.display = 'none';
        
        hideLoading();
        showSuccessMessage('설정이 저장되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('설정 저장 실패:', error);
        showErrorMessage('설정 저장에 실패했습니다.');
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
    const originalSettings = { ...settings };
    
    Object.assign(settings, tempSettings);
    applySettings();
    settings = originalSettings;
}

// 외관 모드 적용
function applyAppearance(appearance) {
    const body = document.body;
    
    body.classList.remove('light-mode', 'dark-mode');
    
    if (appearance === 'light') {
        body.classList.add('light-mode');
    } else {
        body.classList.add('dark-mode');
    }
}

// 현재 시간표 초기화
async function deleteTimetable() {
    if (!confirm('현재 시간표의 모든 데이터가 삭제되고 기본 설정으로 초기화됩니다. 계속하시겠습니까?')) {
        return;
    }
    
    try {
        showLoading('시간표를 초기화하는 중...');
        
        // 서버에서 과목 일괄 삭제
        await apiRequest(`/courses/batch/delete`, {
            method: 'DELETE',
            body: JSON.stringify({
                year: currentSemester.year,
                term: currentSemester.term,
                timetableId: currentTimetable.id
            })
        });
        
        // 설정 초기화
        const defaultSettings = {
            showWeekend: true,
            showProfessor: true,
            showRoom: true,
            timeFormat24: true,
            appearance: 'dark'
        };
        
        await apiRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify(defaultSettings)
        });
        
        settings = defaultSettings;
        courses = [];
        
        // 로컬 캐시 업데이트
        localStorage.setItem('settings_cache', JSON.stringify(settings));
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(courses));
        
        applySettingsToUI();
        applySettings();
        renderCourseList();
        calculateGrades();
        
        hideLoading();
        showSuccessMessage('시간표가 기본값으로 초기화되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('시간표 초기화 실패:', error);
        showErrorMessage('시간표 초기화에 실패했습니다.');
    }
}

// ==================================================================================
// 이미지 내보내기 함수
// ==================================================================================

// 이미지로 내보내기
async function exportToImage() {
    try {
        showLoading('이미지를 생성하는 중...');
        
        const timetable = document.querySelector('.timetable');
        if (!timetable) {
            throw new Error('시간표를 찾을 수 없습니다.');
        }

        // 임시 캔버스 생성을 위한 컨테이너
        const exportContainer = document.createElement('div');
        exportContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: 1200px;
            background: ${document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b'};
            padding: 40px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        // 시간표 제목 생성
        const title = document.createElement('h1');
        title.textContent = `${currentTimetable.name} - ${currentSemester.year}년 ${currentSemester.term}학기`;
        title.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: 700;
            color: ${document.body.classList.contains('light-mode') ? '#1f2937' : '#f1f5f9'};
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        `;
        
        // 시간표 테이블 복제
        const tableClone = timetable.cloneNode(true);
        tableClone.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 12px;
            overflow: hidden;
        `;
        
        // 테이블 스타일 적용
        const cells = tableClone.querySelectorAll('th, td');
        cells.forEach(cell => {
            const isLight = document.body.classList.contains('light-mode');
            
            cell.style.border = isLight 
                ? '1px solid rgba(148, 163, 184, 0.3)' 
                : '1px solid rgba(148, 163, 184, 0.2)';
            cell.style.padding = '12px 8px';
            cell.style.textAlign = 'center';
            cell.style.verticalAlign = 'middle';
            
            if (cell.tagName === 'TH') {
                cell.style.background = isLight 
                    ? 'rgba(248, 250, 252, 0.9)' 
                    : 'rgba(15, 23, 42, 0.8)';
                cell.style.color = isLight ? '#1f2937' : '#f1f5f9';
                cell.style.fontWeight = '600';
                cell.style.fontSize = '16px';
            }
            
            if (cell.classList.contains('time-col')) {
                cell.style.background = isLight 
                    ? 'rgba(241, 245, 249, 0.8)' 
                    : 'rgba(15, 23, 42, 0.6)';
                cell.style.color = isLight ? '#64748b' : '#94a3b8';
                cell.style.fontWeight = '600';
                cell.style.fontSize = '12px';
                cell.style.width = '100px';
            }
            
            if (cell.classList.contains('class-cell')) {
                cell.style.height = '60px';
                cell.style.background = isLight 
                    ? 'rgba(255, 255, 255, 0.5)' 
                    : 'rgba(30, 41, 59, 0.3)';
                cell.style.position = 'relative';
            }
        });
        
        // 과목 블록들을 테이블 셀 안에 직접 삽입
        courses.forEach(course => {
            if (!course.times) return;
            
            course.times.forEach(timeSlot => {
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
                        courseBlock.style.cssText = `
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: ${(timeSlot.end - timeSlot.start + 1) * 60}px;
                            padding: 8px;
                            border-radius: 6px;
                            color: white;
                            font-size: 12px;
                            font-weight: 700;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        `;
                        
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
                        courseName.style.cssText = `
                            font-weight: 700;
                            margin-bottom: 4px;
                            font-size: 13px;
                        `;
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
                            courseInfo.style.cssText = `
                                font-size: 10px;
                                opacity: 0.9;
                            `;
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
        
        // html2canvas 사용 (CDN에서 로드된 경우)
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(exportContainer, {
                backgroundColor: document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            const link = document.createElement('a');
            link.download = `${currentTimetable.name}_${currentSemester.year}_${currentSemester.term}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } else {
            // html2canvas가 없을 때의 대체 방법
            exportToImageFallback(exportContainer);
        }
        
        document.body.removeChild(exportContainer);
        hideLoading();
        showSuccessMessage('이미지가 다운로드되었습니다.');
        
    } catch (error) {
        hideLoading();
        console.error('이미지 내보내기 실패:', error);
        showErrorMessage('이미지 내보내기에 실패했습니다.');
    }
}

// html2canvas 대체 방법
function exportToImageFallback(container) {
    try {
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
        ctx.fillStyle = document.body.classList.contains('light-mode') 
            ? 'rgba(248, 250, 252, 0.9)' 
            : 'rgba(15, 23, 42, 0.8)';
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
        ctx.strokeStyle = document.body.classList.contains('light-mode') 
            ? 'rgba(148, 163, 184, 0.3)' 
            : 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        
        timeData.forEach((time, i) => {
            const y = startY + (i + 1) * cellHeight;
            
            // 시간 셀 배경
            ctx.fillStyle = document.body.classList.contains('light-mode') 
                ? 'rgba(241, 245, 249, 0.8)' 
                : 'rgba(15, 23, 42, 0.6)';
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
            if (!course.times) return;
            
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
        });
        
    } catch (error) {
        console.error('Canvas 이미지 생성 실패:', error);
        showErrorMessage('이미지 생성에 실패했습니다.');
    }
}

// ==================================================================================
// 데이터 내보내기/가져오기 함수들
// ==================================================================================

// JSON으로 데이터 내보내기
async function exportToJSON() {
    try {
        const exportData = {
            timetable: currentTimetable,
            semester: currentSemester,
            courses: courses,
            settings: settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `timetable_${currentTimetable.name}_${currentSemester.year}_${currentSemester.term}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        showSuccessMessage('데이터가 JSON 파일로 내보내졌습니다.');
        
    } catch (error) {
        console.error('JSON 내보내기 실패:', error);
        showErrorMessage('JSON 내보내기에 실패했습니다.');
    }
}

// JSON에서 데이터 가져오기
function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            showLoading('데이터를 가져오는 중...');
            
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.courses || !Array.isArray(importData.courses)) {
                throw new Error('올바르지 않은 데이터 형식입니다.');
            }
            
            if (confirm('현재 시간표 데이터를 가져온 데이터로 교체하시겠습니까?')) {
                // 서버에 일괄 업데이트
                await apiRequest('/courses/batch', {
                    method: 'PUT',
                    body: JSON.stringify({
                        year: currentSemester.year,
                        term: currentSemester.term,
                        timetableId: currentTimetable.id,
                        courses: importData.courses
                    })
                });
                
                courses = importData.courses;
                
                // 로컬 캐시 업데이트
                const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
                localStorage.setItem(cacheKey, JSON.stringify(courses));
                
                renderCourseList();
                renderCoursesOnTimetable();
                calculateGrades();
                
                showSuccessMessage('데이터를 성공적으로 가져왔습니다.');
            }
            
            hideLoading();
            
        } catch (error) {
            hideLoading();
            console.error('JSON 가져오기 실패:', error);
            showErrorMessage('데이터 가져오기에 실패했습니다: ' + error.message);
        }
    };
    
    input.click();
}

// ==================================================================================
// 기타 유틸리티 함수들
// ==================================================================================

// 이전 페이지로 이동
function goToBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/dashboard.html';
    }
}

// 로그아웃
async function logout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('로그아웃 요청 실패:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.clear(); // 모든 캐시 클리어
            window.location.href = '/login.html';
        }
    }
}

// 페이지 언로드 시 데이터 동기화
window.addEventListener('beforeunload', function() {
    // 중요한 데이터 로컬 스토리지에 백업
    if (courses.length > 0) {
        const cacheKey = `courses_${currentSemester.year}_${currentSemester.term}_${currentTimetable.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(courses));
    }
    
    if (timetables.length > 0) {
        localStorage.setItem('timetables_cache', JSON.stringify(timetables));
    }
    
    localStorage.setItem('settings_cache', JSON.stringify(settings));
});

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function(event) {
    // 모달이 열려있으면 닫기
    const courseModal = document.getElementById('course-modal');
    const settingsModal = document.getElementById('settings-modal');
    
    if (courseModal && courseModal.style.display === 'flex') {
        closeModal();
    } else if (settingsModal && settingsModal.style.display === 'flex') {
        closeSettings();
    }
});

// CSS 스타일 추가 (토스트 메시지 애니메이션)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-toast, .success-toast {
        animation: slideIn 0.3s ease-out;
    }
    
    .loading-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        color: #374151;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .class-item {
        transition: all 0.2s ease;
    }
    
    .class-item:hover {
        transform: scale(1.02);
        z-index: 10 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .course-item {
        transition: background-color 0.2s ease;
    }
    
    .course-item:hover {
        background-color: rgba(59, 130, 246, 0.05);
    }
`;
document.head.appendChild(style);

// 전역 에러 핸들러
window.addEventListener('error', function(event) {
    console.error('전역 에러:', event.error);
    showErrorMessage('예상치 못한 오류가 발생했습니다.');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('처리되지 않은 Promise 거부:', event.reason);
    showErrorMessage('네트워크 오류가 발생했습니다.');
});

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker 등록 성공:', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker 등록 실패:', error);
            });
    });
}

// 모듈 내보내기 (필요한 경우)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiRequest,
        getCurrentUser,
        loadCoursesFromAPI,
        updateCourseGrade,
        exportToImage,
        exportToJSON,
        importFromJSON,
        logout
    };
}
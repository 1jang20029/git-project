// timetable.js
// 시간표 페이지 JavaScript (Node.js + MySQL 백엔드 연동)

document.addEventListener('DOMContentLoaded', function() {
    // =============================================================================
    // 전역 변수 및 상태 관리
    // =============================================================================
    let currentUser = null;
    let currentTimetableId = null;
    let currentSemester = '2025-1';
    let timetables = [];
    let courses = [];
    let settings = {
        showRoom: true,
        showProfessor: true,
        theme: 'dark',
        timeFormat: '24',
        showWeekend: true
    };

    // 시간표 시간 슬롯 정의 (9시부터 18시까지)
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    const days = ['월', '화', '수', '목', '금', '토'];

    // =============================================================================
    // 초기화 함수
    // =============================================================================
    async function init() {
        try {
            // 로그인 상태 확인
            currentUser = localStorage.getItem('currentLoggedInUser');
            if (!currentUser) {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }

            // 설정 로드
            loadSettings();
            
            // 시간표 데이터 로드
            await loadTimetables();
            await loadCurrentTimetable();
            
            // UI 초기화
            initializeTimetableGrid();
            updateUI();
            
            console.log('✅ 시간표 페이지 초기화 완료');
        } catch (error) {
            console.error('❌ 초기화 중 오류:', error);
            alert('시간표를 불러오는 중 오류가 발생했습니다.');
        }
    }

    // =============================================================================
    // 백엔드 API 호출 함수들
    // =============================================================================
    
    // 시간표 목록 가져오기
    async function loadTimetables() {
        try {
            const response = await fetch(`/api/timetables?userId=${currentUser}&semester=${currentSemester}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error('시간표 목록을 불러올 수 없습니다.');
            }

            const data = await response.json();
            timetables = data.timetables || [];
            
            // 기본 시간표가 없으면 생성
            if (timetables.length === 0) {
                await createDefaultTimetable();
            } else {
                currentTimetableId = timetables[0].id;
            }
            
            updateTimetableDropdown();
        } catch (error) {
            console.error('시간표 목록 로드 실패:', error);
            throw error;
        }
    }

    // 기본 시간표 생성
    async function createDefaultTimetable() {
        try {
            const response = await fetch('/api/timetables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                },
                body: JSON.stringify({
                    userId: currentUser,
                    semester: currentSemester,
                    name: '시간표 1'
                })
            });

            if (!response.ok) {
                throw new Error('기본 시간표 생성에 실패했습니다.');
            }

            const data = await response.json();
            currentTimetableId = data.timetableId;
            
            // 시간표 목록 다시 로드
            await loadTimetables();
        } catch (error) {
            console.error('기본 시간표 생성 실패:', error);
            throw error;
        }
    }

    // 현재 시간표의 과목들 가져오기
    async function loadCurrentTimetable() {
        if (!currentTimetableId) return;

        try {
            const response = await fetch(`/api/timetables/${currentTimetableId}/courses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error('시간표 데이터를 불러올 수 없습니다.');
            }

            const data = await response.json();
            courses = data.courses || [];
            
            renderTimetable();
            renderCourseList();
            updateGradeSummary();
        } catch (error) {
            console.error('시간표 로드 실패:', error);
            courses = [];
            renderTimetable();
            renderCourseList();
        }
    }

    // 과목 저장
    async function saveCourseToBackend(courseData) {
        try {
            const url = courseData.id ? `/api/courses/${courseData.id}` : '/api/courses';
            const method = courseData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                },
                body: JSON.stringify({
                    ...courseData,
                    timetableId: currentTimetableId,
                    userId: currentUser
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '과목 저장에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('과목 저장 실패:', error);
            throw error;
        }
    }

    // 과목 삭제
    async function deleteCourseFromBackend(courseId) {
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error('과목 삭제에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('과목 삭제 실패:', error);
            throw error;
        }
    }

    // =============================================================================
    // UI 렌더링 함수들
    // =============================================================================
    
    // 시간표 그리드 초기화
    function initializeTimetableGrid() {
        const tbody = document.getElementById('timetable-body');
        tbody.innerHTML = '';

        timeSlots.forEach(time => {
            const row = document.createElement('tr');
            
            // 시간 셀
            const timeCell = document.createElement('td');
            timeCell.className = 'time-cell';
            timeCell.textContent = formatTime(time);
            row.appendChild(timeCell);

            // 요일 셀들
            days.forEach(day => {
                const cell = document.createElement('td');
                cell.className = 'timetable-cell';
                cell.dataset.day = day;
                cell.dataset.time = time;
                cell.addEventListener('click', () => handleCellClick(day, time));
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });
    }

    // 시간표 렌더링
    function renderTimetable() {
        // 모든 셀 초기화
        document.querySelectorAll('.timetable-cell').forEach(cell => {
            cell.innerHTML = '';
            cell.className = 'timetable-cell';
        });

        // 과목들을 시간표에 배치
        courses.forEach(course => {
            course.timeSlots.forEach(slot => {
                const cell = document.querySelector(`[data-day="${slot.day}"][data-time="${slot.startTime}"]`);
                if (cell) {
                    renderCourseInCell(cell, course, slot);
                }
            });
        });
    }

    // 셀에 과목 렌더링
    function renderCourseInCell(cell, course, timeSlot) {
        cell.className = `timetable-cell course-cell ${course.color}`;
        
        const duration = calculateDuration(timeSlot.startTime, timeSlot.endTime);
        if (duration > 1) {
            cell.style.gridRow = `span ${duration}`;
        }

        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-item';
        courseDiv.innerHTML = `
            <div class="course-name">${course.name}</div>
            ${settings.showProfessor && course.professor ? `<div class="course-professor">${course.professor}</div>` : ''}
            ${settings.showRoom && course.room ? `<div class="course-room">${course.room}</div>` : ''}
        `;
        
        courseDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            editCourse(course);
        });

        cell.appendChild(courseDiv);
    }

    // 과목 목록 렌더링
    function renderCourseList() {
        const courseList = document.getElementById('course-list');
        courseList.innerHTML = '';

        if (courses.length === 0) {
            courseList.innerHTML = '<li class="empty-state">등록된 과목이 없습니다.</li>';
            return;
        }

        courses.forEach(course => {
            const li = document.createElement('li');
            li.className = 'course-item';
            li.innerHTML = `
                <div class="course-info">
                    <div class="course-header">
                        <span class="course-name">${course.name}</span>
                        <span class="course-credits">${course.credits}학점</span>
                    </div>
                    <div class="course-details">
                        <span class="course-type">${course.type}</span>
                        ${course.professor ? `<span class="course-professor">${course.professor}</span>` : ''}
                        ${course.grade ? `<span class="course-grade grade-${course.grade}">${course.grade}</span>` : ''}
                    </div>
                    <div class="course-times">
                        ${course.timeSlots.map(slot => 
                            `${slot.day} ${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`
                        ).join(', ')}
                    </div>
                </div>
                <div class="course-actions">
                    <button class="action-btn edit" onclick="editCourse('${course.id}')" title="수정">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteCourse('${course.id}')" title="삭제">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `;
            courseList.appendChild(li);
        });
    }

    // 시간표 드롭다운 업데이트
    function updateTimetableDropdown() {
        const menu = document.getElementById('timetable-menu');
        const selectedSpan = document.getElementById('selected-timetable');
        
        menu.innerHTML = '';
        
        timetables.forEach(timetable => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = timetable.name;
            item.onclick = () => selectTimetable(timetable.id, timetable.name);
            menu.appendChild(item);
        });

        // 현재 선택된 시간표 이름 표시
        const currentTimetable = timetables.find(t => t.id === currentTimetableId);
        if (currentTimetable) {
            selectedSpan.textContent = currentTimetable.name;
            document.querySelector('.page-title').textContent = currentTimetable.name;
        }
    }

    // 성적 요약 업데이트
    function updateGradeSummary() {
        const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
        const majorCourses = courses.filter(course => course.type.includes('전공') && course.grade && course.grade !== 'P' && course.grade !== 'NP');
        const allCourses = courses.filter(course => course.grade && course.grade !== 'P' && course.grade !== 'NP');

        const majorGPA = calculateGPA(majorCourses);
        const totalGPA = calculateGPA(allCourses);

        document.getElementById('total-credits').textContent = totalCredits;
        document.getElementById('major-gpa').textContent = majorGPA.toFixed(2);
        document.getElementById('total-gpa').textContent = totalGPA.toFixed(2);
    }

    // =============================================================================
    // 이벤트 핸들러 함수들
    // =============================================================================
    
    // 셀 클릭 핸들러
    function handleCellClick(day, time) {
        // 빈 셀을 클릭한 경우 새 과목 추가 모달 열기
        openAddCourseModal(day, time);
    }

    // 과목 추가 모달 열기
    function openAddCourseModal(day = null, time = null) {
        document.getElementById('modal-title').textContent = '과목 추가';
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        
        // 색상 선택 초기화
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.color-option[data-color="color-1"]').classList.add('selected');
        document.getElementById('course-color').value = 'color-1';

        // 시간 슬롯 초기화
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';
        
        if (day && time) {
            addTimeSlot(day, time);
        } else {
            addTimeSlot();
        }

        document.getElementById('course-modal').style.display = 'flex';
        document.getElementById('course-name').focus();
    }

    // 과목 수정
    function editCourse(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        document.getElementById('modal-title').textContent = '과목 수정';
        document.getElementById('course-id').value = course.id;
        document.getElementById('course-name').value = course.name;
        document.getElementById('course-professor').value = course.professor || '';
        document.getElementById('course-room').value = course.room || '';
        document.getElementById('course-credits').value = course.credits || 3;
        document.getElementById('course-type').value = course.type || '전공필수';
        document.getElementById('course-grade').value = course.grade || '';
        document.getElementById('course-color').value = course.color || 'color-1';

        // 색상 선택 표시
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-color="${course.color}"]`)?.classList.add('selected');

        // 시간 슬롯 표시
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';
        
        course.timeSlots.forEach(slot => {
            addTimeSlot(slot.day, slot.startTime, slot.endTime);
        });

        document.getElementById('course-modal').style.display = 'flex';
    }

    // 과목 저장
    async function saveCourse(event) {
        event.preventDefault();

        const courseData = {
            id: document.getElementById('course-id').value || null,
            name: document.getElementById('course-name').value,
            professor: document.getElementById('course-professor').value,
            room: document.getElementById('course-room').value,
            credits: parseInt(document.getElementById('course-credits').value),
            type: document.getElementById('course-type').value,
            grade: document.getElementById('course-grade').value,
            color: document.getElementById('course-color').value,
            timeSlots: getTimeSlots()
        };

        if (!courseData.name.trim()) {
            alert('과목명을 입력해주세요.');
            return;
        }

        if (courseData.timeSlots.length === 0) {
            alert('수업 시간을 추가해주세요.');
            return;
        }

        try {
            await saveCourseToBackend(courseData);
            await loadCurrentTimetable();
            closeModal();
            
            const action = courseData.id ? '수정' : '추가';
            alert(`✅ 과목이 ${action}되었습니다.`);
        } catch (error) {
            alert(`❌ 과목 저장에 실패했습니다: ${error.message}`);
        }
    }

    // 과목 삭제
    async function deleteCourse(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        if (!confirm(`'${course.name}' 과목을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteCourseFromBackend(courseId);
            await loadCurrentTimetable();
            alert('✅ 과목이 삭제되었습니다.');
        } catch (error) {
            alert(`❌ 과목 삭제에 실패했습니다: ${error.message}`);
        }
    }

    // =============================================================================
    // 유틸리티 함수들
    // =============================================================================
    
    // 시간 형식 변환
    function formatTime(time) {
        if (settings.timeFormat === '12') {
            const [hour, minute] = time.split(':');
            const hourNum = parseInt(hour);
            const period = hourNum >= 12 ? '오후' : '오전';
            const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
            return `${period} ${displayHour}:${minute}`;
        }
        return time;
    }

    // 시간 지속시간 계산
    function calculateDuration(startTime, endTime) {
        const start = timeSlots.indexOf(startTime);
        const end = timeSlots.indexOf(endTime);
        return end - start;
    }

    // GPA 계산
    function calculateGPA(coursesWithGrades) {
        if (coursesWithGrades.length === 0) return 0;

        const gradePoints = {
            'A+': 4.5, 'A0': 4.0, 'A-': 3.5,
            'B+': 3.0, 'B0': 2.5, 'B-': 2.0,
            'C+': 1.5, 'C0': 1.0, 'C-': 0.5,
            'D+': 0.5, 'D0': 0.0, 'D-': 0.0, 'F': 0.0
        };

        let totalPoints = 0;
        let totalCredits = 0;

        coursesWithGrades.forEach(course => {
            const points = gradePoints[course.grade] || 0;
            totalPoints += points * course.credits;
            totalCredits += course.credits;
        });

        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    }

    // 시간 슬롯 관련 함수들
    function addTimeSlot(day = '월', startTime = '09:00', endTime = '10:30') {
        const container = document.getElementById('time-slots');
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot';
        slotDiv.innerHTML = `
            <select class="day-select">
                ${days.map(d => `<option value="${d}" ${d === day ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            <select class="start-time-select">
                ${timeSlots.map(t => `<option value="${t}" ${t === startTime ? 'selected' : ''}>${formatTime(t)}</option>`).join('')}
            </select>
            <span>~</span>
            <select class="end-time-select">
                ${timeSlots.map(t => `<option value="${t}" ${t === endTime ? 'selected' : ''}>${formatTime(t)}</option>`).join('')}
            </select>
            <button type="button" class="btn-remove" onclick="removeTimeSlot(this)" title="삭제">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </button>
        `;
        container.appendChild(slotDiv);
    }

    function removeTimeSlot(button) {
        const container = document.getElementById('time-slots');
        if (container.children.length > 1) {
            button.parentElement.remove();
        } else {
            alert('최소 하나의 수업 시간은 필요합니다.');
        }
    }

    function getTimeSlots() {
        const slots = [];
        document.querySelectorAll('.time-slot').forEach(slot => {
            const day = slot.querySelector('.day-select').value;
            const startTime = slot.querySelector('.start-time-select').value;
            const endTime = slot.querySelector('.end-time-select').value;
            
            if (timeSlots.indexOf(endTime) <= timeSlots.indexOf(startTime)) {
                throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.');
            }
            
            slots.push({ day, startTime, endTime });
        });
        return slots;
    }

    // 색상 선택
    function selectColor(element) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        element.classList.add('selected');
        document.getElementById('course-color').value = element.dataset.color;
    }

    // =============================================================================
    // 전역 함수들 (HTML onclick에서 호출)
    // =============================================================================
    
    // 뒤로가기
    function goToBack() {
        window.history.back();
    }

    // 학기 변경
    async function changeSemester() {
        const newSemester = document.getElementById('semester-select').value;
        if (newSemester !== currentSemester) {
            currentSemester = newSemester;
            await loadTimetables();
            await loadCurrentTimetable();
        }
    }

    // 시간표 선택
    async function selectTimetable(timetableId, name) {
        currentTimetableId = timetableId;
        document.getElementById('selected-timetable').textContent = name;
        document.querySelector('.page-title').textContent = name;
        document.getElementById('timetable-menu').style.display = 'none';
        await loadCurrentTimetable();
    }

    // 시간표 드롭다운 토글
    function toggleTimetableDropdown() {
        const menu = document.getElementById('timetable-menu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }

    // 새 시간표 추가
    async function addNewTimetable() {
        const name = prompt('새 시간표의 이름을 입력하세요:', `시간표 ${timetables.length + 1}`);
        if (!name) return;

        try {
            const response = await fetch('/api/timetables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                },
                body: JSON.stringify({
                    userId: currentUser,
                    semester: currentSemester,
                    name: name.trim()
                })
            });

            if (!response.ok) {
                throw new Error('시간표 생성에 실패했습니다.');
            }

            const data = await response.json();
            await loadTimetables();
            await selectTimetable(data.timetableId, name);
            alert('✅ 새 시간표가 생성되었습니다.');
        } catch (error) {
            alert(`❌ 시간표 생성에 실패했습니다: ${error.message}`);
        }
    }

    // 시간표 이름 변경
    async function renameTimetable() {
        const currentTimetable = timetables.find(t => t.id === currentTimetableId);
        if (!currentTimetable) return;

        const newName = prompt('시간표의 새 이름을 입력하세요:', currentTimetable.name);
        if (!newName || newName.trim() === currentTimetable.name) return;

        try {
            const response = await fetch(`/api/timetables/${currentTimetableId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                },
                body: JSON.stringify({
                    name: newName.trim()
                })
            });

            if (!response.ok) {
                throw new Error('시간표 이름 변경에 실패했습니다.');
            }

            await loadTimetables();
            alert('✅ 시간표 이름이 변경되었습니다.');
        } catch (error) {
            alert(`❌ 이름 변경에 실패했습니다: ${error.message}`);
        }
    }

    // 모달 관련
    function closeModal() {
        document.getElementById('course-modal').style.display = 'none';
    }

    function openSettings() {
        document.getElementById('settings-modal').style.display = 'flex';
        loadSettingsToModal();
    }

    function closeSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    // 설정 관련
    function loadSettings() {
        const savedSettings = localStorage.getItem(`timetable_settings_${currentUser}`);
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        applySettings();
    }

    function loadSettingsToModal() {
        document.getElementById('show-room').checked = settings.showRoom;
        document.getElementById('show-professor').checked = settings.showProfessor;
        document.getElementById('theme-select').value = settings.theme;
        document.getElementById('time-format-select').value = settings.timeFormat;
        document.getElementById('weekend-select').value = settings.showWeekend.toString();
    }

    function saveSettings() {
        settings.showRoom = document.getElementById('show-room').checked;
        settings.showProfessor = document.getElementById('show-professor').checked;
        settings.theme = document.getElementById('theme-select').value;
        settings.timeFormat = document.getElementById('time-format-select').value;
        settings.showWeekend = document.getElementById('weekend-select').value === 'true';

        localStorage.setItem(`timetable_settings_${currentUser}`, JSON.stringify(settings));
        applySettings();
        renderTimetable();
        closeSettings();
        alert('✅ 설정이 저장되었습니다.');
    }

    function applySettings() {
        document.body.className = settings.theme === 'light' ? 'light-theme' : '';
        
        // 주말 표시/숨김
        const weekendCells = document.querySelectorAll('[data-day="토"]');
        const weekendHeader = document.querySelector('th:last-child');
        
        if (settings.showWeekend) {
            weekendCells.forEach(cell => cell.style.display = '');
            if (weekendHeader) weekendHeader.style.display = '';
        } else {
            weekendCells.forEach(cell => cell.style.display = 'none');
            if (weekendHeader) weekendHeader.style.display = 'none';
        }
    }

    // 시간표 삭제
    async function deleteTimetable() {
        if (timetables.length <= 1) {
            alert('마지막 시간표는 삭제할 수 없습니다.');
            return;
        }

        const currentTimetable = timetables.find(t => t.id === currentTimetableId);
        if (!currentTimetable) return;

        if (!confirm(`'${currentTimetable.name}' 시간표를 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/timetables/${currentTimetableId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error('시간표 삭제에 실패했습니다.');
            }

            await loadTimetables();
            if (timetables.length > 0) {
                await selectTimetable(timetables[0].id, timetables[0].name);
            }
            closeSettings();
            alert('✅ 시간표가 삭제되었습니다.');
        } catch (error) {
            alert(`❌ 시간표 삭제에 실패했습니다: ${error.message}`);
        }
    }

    // 이미지로 내보내기
    async function exportToImage() {
        try {
            // html2canvas 라이브러리가 필요합니다
            if (typeof html2canvas === 'undefined') {
                alert('이미지 내보내기 기능을 사용하려면 html2canvas 라이브러리가 필요합니다.');
                return;
            }

            const timetableContainer = document.querySelector('.timetable-container');
            const canvas = await html2canvas(timetableContainer, {
                backgroundColor: settings.theme === 'light' ? '#ffffff' : '#1a1a1a',
                scale: 2
            });

            // 이미지 다운로드
            const link = document.createElement('a');
            link.download = `${document.querySelector('.page-title').textContent}_${currentSemester}.png`;
            link.href = canvas.toDataURL();
            link.click();

            alert('✅ 시간표가 이미지로 저장되었습니다.');
        } catch (error) {
            console.error('이미지 내보내기 실패:', error);
            alert('❌ 이미지 내보내기에 실패했습니다.');
        }
    }

    // UI 업데이트
    function updateUI() {
        // 학기 선택 드롭다운 초기화
        const semesterSelect = document.getElementById('semester-select');
        semesterSelect.value = currentSemester;
        
        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                document.getElementById('timetable-menu').style.display = 'none';
            }
        });

        // 모달 외부 클릭 시 닫기
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }

    // =============================================================================
    // 전역 함수 등록 (HTML onclick에서 접근 가능하도록)
    // =============================================================================
    window.goToBack = goToBack;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.changeSemester = changeSemester;
    window.selectTimetable = selectTimetable;
    window.toggleTimetableDropdown = toggleTimetableDropdown;
    window.openAddCourseModal = openAddCourseModal;
    window.addNewTimetable = addNewTimetable;
    window.renameTimetable = renameTimetable;
    window.exportToImage = exportToImage;
    window.deleteTimetable = deleteTimetable;
    window.saveCourse = saveCourse;
    window.closeModal = closeModal;
    window.editCourse = editCourse;
    window.deleteCourse = deleteCourse;
    window.selectColor = selectColor;
    window.addTimeSlot = addTimeSlot;
    window.removeTimeSlot = removeTimeSlot;
    window.saveSettings = saveSettings;
    window.changeAppearance = function() {
        settings.theme = document.getElementById('theme-select').value;
        applySettings();
    };
    window.changeTimeFormat = function() {
        settings.timeFormat = document.getElementById('time-format-select').value;
        renderTimetable();
        initializeTimetableGrid();
    };
    window.changeWeekendDisplay = function() {
        settings.showWeekend = document.getElementById('weekend-select').value === 'true';
        applySettings();
    };

    // =============================================================================
    // 추가 기능들
    // =============================================================================
    
    // 시간표 충돌 검사
    function checkTimeConflict(newTimeSlots, excludeCourseId = null) {
        const conflicts = [];
        
        newTimeSlots.forEach(newSlot => {
            courses.forEach(course => {
                if (excludeCourseId && course.id === excludeCourseId) return;
                
                course.timeSlots.forEach(existingSlot => {
                    if (newSlot.day === existingSlot.day) {
                        const newStart = timeSlots.indexOf(newSlot.startTime);
                        const newEnd = timeSlots.indexOf(newSlot.endTime);
                        const existingStart = timeSlots.indexOf(existingSlot.startTime);
                        const existingEnd = timeSlots.indexOf(existingSlot.endTime);
                        
                        // 시간 충돌 검사
                        if ((newStart < existingEnd && newEnd > existingStart)) {
                            conflicts.push({
                                course: course.name,
                                day: newSlot.day,
                                time: `${formatTime(existingSlot.startTime)}-${formatTime(existingSlot.endTime)}`
                            });
                        }
                    }
                });
            });
        });
        
        return conflicts;
    }

    // 시간표 통계 정보
    function getTimetableStats() {
        const stats = {
            totalCourses: courses.length,
            totalCredits: courses.reduce((sum, course) => sum + (course.credits || 0), 0),
            majorCredits: courses.filter(c => c.type.includes('전공')).reduce((sum, course) => sum + (course.credits || 0), 0),
            liberalCredits: courses.filter(c => c.type.includes('교양')).reduce((sum, course) => sum + (course.credits || 0), 0),
            weeklyHours: courses.reduce((sum, course) => {
                return sum + course.timeSlots.reduce((courseSum, slot) => {
                    return courseSum + calculateDuration(slot.startTime, slot.endTime) * 0.5; // 30분 단위
                }, 0);
            }, 0)
        };
        return stats;
    }

    // 데이터 백업/복원
    function exportTimetableData() {
        const data = {
            semester: currentSemester,
            timetables: timetables,
            courses: courses,
            settings: settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `timetable_backup_${currentSemester}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    async function importTimetableData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.courses || !Array.isArray(data.courses)) {
                throw new Error('유효하지 않은 시간표 데이터입니다.');
            }
            
            if (confirm('현재 시간표 데이터를 가져온 데이터로 교체하시겠습니까?')) {
                // 백엔드에 데이터 복원 요청
                const response = await fetch('/api/timetables/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                    },
                    body: JSON.stringify({
                        userId: currentUser,
                        data: data
                    })
                });
                
                if (!response.ok) {
                    throw new Error('데이터 가져오기에 실패했습니다.');
                }
                
                await loadTimetables();
                await loadCurrentTimetable();
                alert('✅ 시간표 데이터를 성공적으로 가져왔습니다.');
            }
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            alert(`❌ 데이터 가져오기에 실패했습니다: ${error.message}`);
        }
    }

    // 자동 저장 기능
    let autoSaveTimer;
    function scheduleAutoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(async () => {
            try {
                await fetch('/api/timetables/autosave', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                    },
                    body: JSON.stringify({
                        userId: currentUser,
                        timetableId: currentTimetableId,
                        lastModified: new Date().toISOString()
                    })
                });
                console.log('📁 자동 저장 완료');
            } catch (error) {
                console.error('자동 저장 실패:', error);
            }
        }, 30000); // 30초 후 자동 저장
    }

    // 오류 처리 및 재시도 로직
    async function retryRequest(requestFn, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                console.warn(`요청 실패 (${i + 1}/${maxRetries}):`, error);
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 지수 백오프
            }
        }
    }

    // 오프라인 상태 감지
    function handleOfflineMode() {
        window.addEventListener('online', () => {
            console.log('🌐 온라인 상태로 전환됨');
            // 오프라인 중 변경된 데이터가 있다면 동기화
            syncOfflineChanges();
        });

        window.addEventListener('offline', () => {
            console.log('📱 오프라인 상태로 전환됨');
            alert('⚠️ 오프라인 모드입니다. 일부 기능이 제한될 수 있습니다.');
        });
    }

    async function syncOfflineChanges() {
        // 오프라인 중 변경된 데이터를 서버와 동기화
        try {
            const offlineChanges = localStorage.getItem(`offline_changes_${currentUser}`);
            if (offlineChanges) {
                const changes = JSON.parse(offlineChanges);
                // 변경사항을 서버에 전송
                await fetch('/api/timetables/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                    },
                    body: JSON.stringify(changes)
                });
                localStorage.removeItem(`offline_changes_${currentUser}`);
                console.log('🔄 오프라인 변경사항 동기화 완료');
            }
        } catch (error) {
            console.error('오프라인 동기화 실패:', error);
        }
    }

    // =============================================================================
    // 초기화 실행
    // =============================================================================
    
    // 오프라인 모드 핸들러 설정
    handleOfflineMode();
    
    // 페이지 초기화
    init().catch(error => {
        console.error('❌ 페이지 초기화 실패:', error);
        alert('페이지를 불러오는 중 문제가 발생했습니다. 새로고침을 시도해주세요.');
    });

    console.log('✅ 시간표 JavaScript 로드 완료');
});
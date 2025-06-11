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
            console.log('🚀 시간표 페이지 초기화 시작...');
            
            // 로그인 상태 확인
            currentUser = localStorage.getItem('currentLoggedInUser');
            if (!currentUser) {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            console.log('✅ 사용자 확인:', currentUser);

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
            console.log('📋 시간표 목록 로드 중...');
            
            const response = await fetch(`/api/timetables?userId=${currentUser}&semester=${currentSemester}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 시간표 목록을 불러올 수 없습니다.`);
            }

            const data = await response.json();
            timetables = data.timetables || [];
            console.log('✅ 시간표 목록 로드 완료:', timetables.length + '개');
            
            // 기본 시간표가 없으면 생성
            if (timetables.length === 0) {
                console.log('⚠️ 시간표가 없음. 기본 시간표 생성 중...');
                await createDefaultTimetable();
            } else {
                currentTimetableId = timetables[0].id;
                console.log('✅ 현재 시간표 ID:', currentTimetableId);
            }
            
            updateTimetableDropdown();
        } catch (error) {
            console.error('❌ 시간표 목록 로드 실패:', error);
            // 오프라인 모드나 서버 오류 시 빈 배열로 초기화
            timetables = [];
            alert('시간표 목록을 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
        }
    }

    // 기본 시간표 생성
    async function createDefaultTimetable() {
        try {
            console.log('📝 기본 시간표 생성 중...');
            
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
                throw new Error(`HTTP ${response.status}: 기본 시간표 생성에 실패했습니다.`);
            }

            const data = await response.json();
            currentTimetableId = data.timetableId;
            console.log('✅ 기본 시간표 생성 완료:', currentTimetableId);
            
            // 시간표 목록 다시 로드
            await loadTimetables();
        } catch (error) {
            console.error('❌ 기본 시간표 생성 실패:', error);
            alert('기본 시간표를 생성할 수 없습니다.');
        }
    }

    // 현재 시간표의 과목들 가져오기
    async function loadCurrentTimetable() {
        if (!currentTimetableId) {
            console.log('⚠️ 현재 시간표 ID가 없음');
            return;
        }

        try {
            console.log('📚 시간표 과목 로드 중...', currentTimetableId);
            
            const response = await fetch(`/api/timetables/${currentTimetableId}/courses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 시간표 데이터를 불러올 수 없습니다.`);
            }

            const data = await response.json();
            courses = data.courses || [];
            console.log('✅ 과목 로드 완료:', courses.length + '개');
            
            renderTimetable();
            renderCourseList();
            updateGradeSummary();
        } catch (error) {
            console.error('❌ 시간표 로드 실패:', error);
            courses = [];
            renderTimetable();
            renderCourseList();
            updateGradeSummary();
        }
    }

    // 과목 저장
    async function saveCourseToBackend(courseData) {
        try {
            console.log('💾 과목 저장 중...', courseData.name);
            
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
                throw new Error(errorData.message || `HTTP ${response.status}: 과목 저장에 실패했습니다.`);
            }

            const result = await response.json();
            console.log('✅ 과목 저장 완료:', result);
            return result;
        } catch (error) {
            console.error('❌ 과목 저장 실패:', error);
            throw error;
        }
    }

    // 과목 삭제
    async function deleteCourseFromBackend(courseId) {
        try {
            console.log('🗑️ 과목 삭제 중...', courseId);
            
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 과목 삭제에 실패했습니다.`);
            }

            const result = await response.json();
            console.log('✅ 과목 삭제 완료:', result);
            return result;
        } catch (error) {
            console.error('❌ 과목 삭제 실패:', error);
            throw error;
        }
    }

    // =============================================================================
    // UI 렌더링 함수들
    // =============================================================================
    
    // 시간표 그리드 초기화
    function initializeTimetableGrid() {
        console.log('🏗️ 시간표 그리드 초기화 중...');
        
        const tbody = document.getElementById('timetable-body');
        if (!tbody) {
            console.error('❌ timetable-body 요소를 찾을 수 없습니다');
            return;
        }
        
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
        
        console.log('✅ 시간표 그리드 초기화 완료');
    }

    // 시간표 렌더링
    function renderTimetable() {
        console.log('🎨 시간표 렌더링 중...', courses.length + '개 과목');
        
        // 모든 셀 초기화
        document.querySelectorAll('.timetable-cell').forEach(cell => {
            cell.innerHTML = '';
            cell.className = 'timetable-cell';
            cell.style.gridRow = '';
        });

        // 과목들을 시간표에 배치
        courses.forEach(course => {
            if (course.timeSlots && course.timeSlots.length > 0) {
                course.timeSlots.forEach(slot => {
                    const cell = document.querySelector(`[data-day="${slot.day}"][data-time="${slot.startTime}"]`);
                    if (cell) {
                        renderCourseInCell(cell, course, slot);
                    }
                });
            }
        });
        
        console.log('✅ 시간표 렌더링 완료');
    }

    // 셀에 과목 렌더링
    function renderCourseInCell(cell, course, timeSlot) {
        cell.className = `timetable-cell course-cell ${course.color || 'color-1'}`;
        
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
            editCourse(course.id);
        });

        cell.appendChild(courseDiv);
    }

    // 과목 목록 렌더링
    function renderCourseList() {
        console.log('📋 과목 목록 렌더링 중...', courses.length + '개 과목');
        
        const courseList = document.getElementById('course-list');
        if (!courseList) {
            console.error('❌ course-list 요소를 찾을 수 없습니다');
            return;
        }
        
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
                        <span class="course-credits">${course.credits || 0}학점</span>
                    </div>
                    <div class="course-details">
                        <span class="course-type">${course.type || '미분류'}</span>
                        ${course.professor ? `<span class="course-professor">${course.professor}</span>` : ''}
                        ${course.grade ? `<span class="course-grade grade-${course.grade}">${course.grade}</span>` : ''}
                    </div>
                    <div class="course-times">
                        ${course.timeSlots && course.timeSlots.length > 0 ? 
                            course.timeSlots.map(slot => 
                                `${slot.day} ${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`
                            ).join(', ') : '시간 미정'
                        }
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
        
        console.log('✅ 과목 목록 렌더링 완료');
    }

    // 시간표 드롭다운 업데이트
    function updateTimetableDropdown() {
        console.log('🔄 시간표 드롭다운 업데이트 중...');
        
        const menu = document.getElementById('timetable-menu');
        const selectedSpan = document.getElementById('selected-timetable');
        
        if (!menu || !selectedSpan) {
            console.error('❌ 드롭다운 요소를 찾을 수 없습니다');
            return;
        }
        
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
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                pageTitle.textContent = currentTimetable.name;
            }
        }
        
        console.log('✅ 시간표 드롭다운 업데이트 완료');
    }

    // 성적 요약 업데이트
    function updateGradeSummary() {
        console.log('📊 성적 요약 업데이트 중...');
        
        const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
        const majorCourses = courses.filter(course => 
            course.type && course.type.includes('전공') && 
            course.grade && course.grade !== 'P' && course.grade !== 'NP'
        );
        const allCourses = courses.filter(course => 
            course.grade && course.grade !== 'P' && course.grade !== 'NP'
        );

        const majorGPA = calculateGPA(majorCourses);
        const totalGPA = calculateGPA(allCourses);

        const totalCreditsEl = document.getElementById('total-credits');
        const majorGpaEl = document.getElementById('major-gpa');
        const totalGpaEl = document.getElementById('total-gpa');
        
        if (totalCreditsEl) totalCreditsEl.textContent = totalCredits;
        if (majorGpaEl) majorGpaEl.textContent = majorGPA.toFixed(2);
        if (totalGpaEl) totalGpaEl.textContent = totalGPA.toFixed(2);
        
        console.log('✅ 성적 요약 업데이트 완료:', { totalCredits, majorGPA, totalGPA });
    }

    // =============================================================================
    // 이벤트 핸들러 함수들
    // =============================================================================
    
    // 셀 클릭 핸들러
    function handleCellClick(day, time) {
        console.log('📍 셀 클릭:', day, time);
        openAddCourseModal(day, time);
    }

    // 과목 추가 모달 열기
    function openAddCourseModal(day = null, time = null) {
        console.log('➕ 과목 추가 모달 열기');
        
        const modal = document.getElementById('course-modal');
        const form = document.getElementById('course-form');
        const modalTitle = document.getElementById('modal-title');
        const courseIdInput = document.getElementById('course-id');
        
        if (!modal || !form || !modalTitle || !courseIdInput) {
            console.error('❌ 모달 요소를 찾을 수 없습니다');
            return;
        }
        
        modalTitle.textContent = '과목 추가';
        form.reset();
        courseIdInput.value = '';
        
        // 색상 선택 초기화
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        const firstColorOption = document.querySelector('.color-option[data-color="color-1"]');
        if (firstColorOption) {
            firstColorOption.classList.add('selected');
        }
        const courseColorInput = document.getElementById('course-color');
        if (courseColorInput) {
            courseColorInput.value = 'color-1';
        }

        // 시간 슬롯 초기화
        const timeSlotsContainer = document.getElementById('time-slots');
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = '';
            
            if (day && time) {
                addTimeSlot(day, time);
            } else {
                addTimeSlot();
            }
        }

        modal.style.display = 'flex';
        const courseNameInput = document.getElementById('course-name');
        if (courseNameInput) {
            courseNameInput.focus();
        }
    }

    // 과목 수정
    function editCourse(courseId) {
        console.log('✏️ 과목 수정:', courseId);
        
        const course = courses.find(c => c.id === courseId);
        if (!course) {
            console.error('❌ 과목을 찾을 수 없습니다:', courseId);
            return;
        }

        const modal = document.getElementById('course-modal');
        const modalTitle = document.getElementById('modal-title');
        
        if (!modal || !modalTitle) {
            console.error('❌ 모달 요소를 찾을 수 없습니다');
            return;
        }
        
        modalTitle.textContent = '과목 수정';
        
        // 폼 필드 채우기
        const fields = {
            'course-id': course.id,
            'course-name': course.name || '',
            'course-professor': course.professor || '',
            'course-room': course.room || '',
            'course-credits': course.credits || 3,
            'course-type': course.type || '전공필수',
            'course-grade': course.grade || '',
            'course-color': course.color || 'color-1'
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });

        // 색상 선택 표시
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        const selectedColorOption = document.querySelector(`[data-color="${course.color || 'color-1'}"]`);
        if (selectedColorOption) {
            selectedColorOption.classList.add('selected');
        }

        // 시간 슬롯 표시
        const timeSlotsContainer = document.getElementById('time-slots');
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = '';
            
            if (course.timeSlots && course.timeSlots.length > 0) {
                course.timeSlots.forEach(slot => {
                    addTimeSlot(slot.day, slot.startTime, slot.endTime);
                });
            } else {
                addTimeSlot();
            }
        }

        modal.style.display = 'flex';
    }

    // 과목 저장
    async function saveCourse(event) {
        event.preventDefault();
        console.log('💾 과목 저장 시작');

        try {
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

            // 유효성 검사
            if (!courseData.name.trim()) {
                alert('과목명을 입력해주세요.');
                return;
            }

            if (courseData.timeSlots.length === 0) {
                alert('수업 시간을 추가해주세요.');
                return;
            }

            await saveCourseToBackend(courseData);
            await loadCurrentTimetable();
            closeModal();
            
            const action = courseData.id ? '수정' : '추가';
            alert(`✅ 과목이 ${action}되었습니다.`);
        } catch (error) {
            console.error('❌ 과목 저장 실패:', error);
            alert(`❌ 과목 저장에 실패했습니다: ${error.message}`);
        }
    }

    // 과목 삭제
    async function deleteCourse(courseId) {
        console.log('🗑️ 과목 삭제 시작:', courseId);
        
        const course = courses.find(c => c.id === courseId);
        if (!course) {
            console.error('❌ 과목을 찾을 수 없습니다:', courseId);
            return;
        }

        if (!confirm(`'${course.name}' 과목을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteCourseFromBackend(courseId);
            await loadCurrentTimetable();
            alert('✅ 과목이 삭제되었습니다.');
        } catch (error) {
            console.error('❌ 과목 삭제 실패:', error);
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
        return Math.max(0, end - start);
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
        console.log('➕ 시간 슬롯 추가:', day, startTime, endTime);
        
        const container = document.getElementById('time-slots');
        if (!container) {
            console.error('❌ time-slots 컨테이너를 찾을 수 없습니다');
            return;
        }
        
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
            </button>`;
        container.appendChild(slotDiv);
    }

    function removeTimeSlot(button) {
        console.log('➖ 시간 슬롯 제거');
        
        const container = document.getElementById('time-slots');
        if (!container) {
            console.error('❌ time-slots 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        if (container.children.length > 1) {
            button.parentElement.remove();
        } else {
            alert('최소 하나의 수업 시간은 필요합니다.');
        }
    }

    function getTimeSlots() {
        console.log('📋 시간 슬롯 수집 중...');
        
        const slots = [];
        const timeSlotElements = document.querySelectorAll('.time-slot');
        
        timeSlotElements.forEach(slot => {
            const day = slot.querySelector('.day-select')?.value;
            const startTime = slot.querySelector('.start-time-select')?.value;
            const endTime = slot.querySelector('.end-time-select')?.value;
            
            if (!day || !startTime || !endTime) {
                console.warn('⚠️ 시간 슬롯 정보가 불완전합니다');
                return;
            }
            
            if (timeSlots.indexOf(endTime) <= timeSlots.indexOf(startTime)) {
                throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.');
            }
            
            slots.push({ day, startTime, endTime });
        });
        
        console.log('✅ 시간 슬롯 수집 완료:', slots);
        return slots;
    }

    // 색상 선택
    function selectColor(element) {
        console.log('🎨 색상 선택:', element.dataset.color);
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        element.classList.add('selected');
        
        const courseColorInput = document.getElementById('course-color');
        if (courseColorInput) {
            courseColorInput.value = element.dataset.color;
        }
    }

    // 설정 관련
    function loadSettings() {
        console.log('⚙️ 설정 로드 중...');
        
        const savedSettings = localStorage.getItem(`timetable_settings_${currentUser}`);
        if (savedSettings) {
            try {
                settings = { ...settings, ...JSON.parse(savedSettings) };
                console.log('✅ 저장된 설정 로드:', settings);
            } catch (error) {
                console.warn('⚠️ 설정 파일 파싱 실패:', error);
            }
        }
        applySettings();
    }

    function loadSettingsToModal() {
        console.log('⚙️ 설정 모달에 현재 설정 로드 중...');
        
        const settingsElements = {
            'show-room': settings.showRoom,
            'show-professor': settings.showProfessor,
            'theme-select': settings.theme,
            'time-format-select': settings.timeFormat,
            'weekend-select': settings.showWeekend.toString()
        };
        
        Object.entries(settingsElements).forEach(([id, value]) => {
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

    function applySettings() {
        console.log('🎨 설정 적용 중...', settings);
        
        // 테마 적용
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
        
        console.log('✅ 설정 적용 완료');
    }

    // UI 업데이트
    function updateUI() {
        console.log('🔄 UI 업데이트 중...');
        
        // 학기 선택 드롭다운 초기화
        const semesterSelect = document.getElementById('semester-select');
        if (semesterSelect) {
            semesterSelect.value = currentSemester;
        }
        
        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                const timetableMenu = document.getElementById('timetable-menu');
                if (timetableMenu) {
                    timetableMenu.style.display = 'none';
                }
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
        
        console.log('✅ UI 업데이트 완료');
    }

    // =============================================================================
    // 전역 함수들 (HTML onclick에서 호출)
    // =============================================================================
    
    // 뒤로가기
    function goToBack() {
        console.log('🔙 뒤로가기');
        window.history.back();
    }

    // 학기 변경
    async function changeSemester() {
        console.log('📅 학기 변경 중...');
        
        const semesterSelect = document.getElementById('semester-select');
        if (!semesterSelect) {
            console.error('❌ semester-select 요소를 찾을 수 없습니다');
            return;
        }
        
        const newSemester = semesterSelect.value;
        if (newSemester !== currentSemester) {
            console.log('🔄 학기 변경:', currentSemester, '→', newSemester);
            currentSemester = newSemester;
            await loadTimetables();
            await loadCurrentTimetable();
        }
    }

    // 시간표 선택
    async function selectTimetable(timetableId, name) {
        console.log('📋 시간표 선택:', timetableId, name);
        
        currentTimetableId = timetableId;
        
        const selectedSpan = document.getElementById('selected-timetable');
        const pageTitle = document.querySelector('.page-title');
        const timetableMenu = document.getElementById('timetable-menu');
        
        if (selectedSpan) selectedSpan.textContent = name;
        if (pageTitle) pageTitle.textContent = name;
        if (timetableMenu) timetableMenu.style.display = 'none';
        
        await loadCurrentTimetable();
    }

    // 시간표 드롭다운 토글
    function toggleTimetableDropdown() {
        console.log('🔽 시간표 드롭다운 토글');
        
        const menu = document.getElementById('timetable-menu');
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }

    // 새 시간표 추가
    async function addNewTimetable() {
        console.log('➕ 새 시간표 추가');
        
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
                throw new Error(`HTTP ${response.status}: 시간표 생성에 실패했습니다.`);
            }

            const data = await response.json();
            await loadTimetables();
            await selectTimetable(data.timetableId, name);
            alert('✅ 새 시간표가 생성되었습니다.');
        } catch (error) {
            console.error('❌ 시간표 생성 실패:', error);
            alert(`❌ 시간표 생성에 실패했습니다: ${error.message}`);
        }
    }

    // 시간표 이름 변경
    async function renameTimetable() {
        console.log('✏️ 시간표 이름 변경');
        
        const currentTimetable = timetables.find(t => t.id === currentTimetableId);
        if (!currentTimetable) {
            console.error('❌ 현재 시간표를 찾을 수 없습니다');
            return;
        }

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
                throw new Error(`HTTP ${response.status}: 시간표 이름 변경에 실패했습니다.`);
            }

            await loadTimetables();
            alert('✅ 시간표 이름이 변경되었습니다.');
        } catch (error) {
            console.error('❌ 이름 변경 실패:', error);
            alert(`❌ 이름 변경에 실패했습니다: ${error.message}`);
        }
    }

    // 이미지로 내보내기
    function exportToImage() {
        console.log('📷 이미지 내보내기');
        alert('이미지 내보내기 기능은 추후 구현 예정입니다.');
    }

    // 모달 관련
    function closeModal() {
        console.log('❌ 모달 닫기');
        
        const modal = document.getElementById('course-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function openSettings() {
        console.log('⚙️ 설정 모달 열기');
        
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'flex';
            loadSettingsToModal();
        }
    }

    function closeSettings() {
        console.log('❌ 설정 모달 닫기');
        
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 설정 저장
    function saveSettings() {
        console.log('💾 설정 저장 중...');
        
        try {
            settings.showRoom = document.getElementById('show-room')?.checked ?? settings.showRoom;
            settings.showProfessor = document.getElementById('show-professor')?.checked ?? settings.showProfessor;
            settings.theme = document.getElementById('theme-select')?.value ?? settings.theme;
            settings.timeFormat = document.getElementById('time-format-select')?.value ?? settings.timeFormat;
            settings.showWeekend = document.getElementById('weekend-select')?.value === 'true';

            localStorage.setItem(`timetable_settings_${currentUser}`, JSON.stringify(settings));
            applySettings();
            renderTimetable();
            closeSettings();
            alert('✅ 설정이 저장되었습니다.');
            
            console.log('✅ 설정 저장 완료:', settings);
        } catch (error) {
            console.error('❌ 설정 저장 실패:', error);
            alert('❌ 설정 저장에 실패했습니다.');
        }
    }

    // 시간표 삭제
    async function deleteTimetable() {
        console.log('🗑️ 시간표 삭제');
        
        if (timetables.length <= 1) {
            alert('마지막 시간표는 삭제할 수 없습니다.');
            return;
        }

        const currentTimetable = timetables.find(t => t.id === currentTimetableId);
        if (!currentTimetable) {
            console.error('❌ 현재 시간표를 찾을 수 없습니다');
            return;
        }

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
                throw new Error(`HTTP ${response.status}: 시간표 삭제에 실패했습니다.`);
            }

            await loadTimetables();
            if (timetables.length > 0) {
                await selectTimetable(timetables[0].id, timetables[0].name);
            }
            closeSettings();
            alert('✅ 시간표가 삭제되었습니다.');
        } catch (error) {
            console.error('❌ 시간표 삭제 실패:', error);
            alert(`❌ 시간표 삭제에 실패했습니다: ${error.message}`);
        }
    }

    // 설정 변경 함수들
    function changeAppearance() {
        console.log('🎨 외관 변경');
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            settings.theme = themeSelect.value;
            applySettings();
        }
    }

    function changeTimeFormat() {
        console.log('🕐 시간 형식 변경');
        
        const timeFormatSelect = document.getElementById('time-format-select');
        if (timeFormatSelect) {
            settings.timeFormat = timeFormatSelect.value;
            renderTimetable();
            initializeTimetableGrid();
        }
    }

    function changeWeekendDisplay() {
        console.log('📅 주말 표시 변경');
        
        const weekendSelect = document.getElementById('weekend-select');
        if (weekendSelect) {
            settings.showWeekend = weekendSelect.value === 'true';
            applySettings();
        }
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
    window.changeAppearance = changeAppearance;
    window.changeTimeFormat = changeTimeFormat;
    window.changeWeekendDisplay = changeWeekendDisplay;

    // =============================================================================
    // 초기화 실행
    // =============================================================================
    
    // 페이지 초기화
    init().catch(error => {
        console.error('❌ 페이지 초기화 실패:', error);
        alert('페이지를 불러오는 중 문제가 발생했습니다. 새로고침을 시도해주세요.');
    });

    console.log('✅ 시간표 JavaScript 로드 완료');
});
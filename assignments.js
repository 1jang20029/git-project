// 페이지 로드 시 실행할 함수
document.addEventListener('DOMContentLoaded', function() {
    // 빈 화면 또는 과제 목록 표시 여부 결정
    checkEmptyState();
});

// 이전 페이지로 돌아가기
function goBack() {
    window.location.href = "index.html";
}

// 빈 화면 확인 및 표시
function checkEmptyState() {
    const assignmentsList = document.getElementById('assignmentsList');
    const emptyState = document.getElementById('emptyState');
    
    if (assignmentsList.children.length === 0) {
        // 과제/시험이 없는 경우 빈 화면 표시
        emptyState.style.display = 'block';
        assignmentsList.style.display = 'none';
    } else {
        // 과제/시험이 있는 경우 목록 표시
        emptyState.style.display = 'none';
        assignmentsList.style.display = 'block';
    }
    
    // 상태 개수 업데이트
    updateStatusCounts();
}

// 필터 옵션 토글
function toggleFilterOptions() {
    const filterOptions = document.getElementById('filterOptions');
    if (filterOptions.style.display === 'block') {
        filterOptions.style.display = 'none';
    } else {
        filterOptions.style.display = 'block';
    }
}

// 필터 초기화
function resetFilter() {
    // 모든 필터 옵션에서 active 클래스 제거
    document.querySelectorAll('.filter-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // 기본 필터 활성화
    document.querySelector('[data-sort="deadline"]').classList.add('active');
    document.querySelector('[data-type="all"]').classList.add('active');
    
    // 모든 항목 표시
    document.querySelectorAll('.assignment-item').forEach(item => {
        item.style.display = 'flex';
    });
    
    // 마감일 순으로 정렬
    sortAssignments('deadline');
}

// 필터 적용
function applyFilter() {
    // 정렬 기준 적용
    const sortOption = document.querySelector('.filter-option[data-sort].active');
    if (sortOption) {
        sortAssignments(sortOption.dataset.sort);
    }
    
    // 유형 필터 적용
    const typeOption = document.querySelector('.filter-option[data-type].active');
    if (typeOption) {
        filterByType(typeOption.dataset.type);
    }
    
    // 필터 옵션 닫기
    document.getElementById('filterOptions').style.display = 'none';
    
    // 상태 개수 업데이트
    updateStatusCounts();
}

// 정렬 필터 선택 시 동작
document.querySelectorAll('.filter-option[data-sort]').forEach(option => {
    option.addEventListener('click', function() {
        // 다른 정렬 옵션에서 active 클래스 제거
        document.querySelectorAll('.filter-option[data-sort]').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // 클릭한 옵션에 active 클래스 추가
        this.classList.add('active');
    });
});

// 유형 필터 선택 시 동작
document.querySelectorAll('.filter-option[data-type]').forEach(option => {
    option.addEventListener('click', function() {
        // 다른 유형 옵션에서 active 클래스 제거
        document.querySelectorAll('.filter-option[data-type]').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // 클릭한 옵션에 active 클래스 추가
        this.classList.add('active');
    });
});

// 마감일/과목 기준 정렬
function sortAssignments(sortBy) {
    const container = document.getElementById('assignmentsList');
    const items = Array.from(container.getElementsByClassName('assignment-item'));
    
    if (items.length === 0) return; // 항목이 없으면 정렬하지 않음
    
    if (sortBy === 'deadline') {
        // 마감일 기준 정렬 (마감이 가까운 순)
        items.sort((a, b) => {
            const aDue = a.querySelector('.assignment-due').textContent;
            const bDue = b.querySelector('.assignment-due').textContent;
            
            // 마감일에서 날짜 추출 (간단히 구현)
            const aDate = extractDate(aDue);
            const bDate = extractDate(bDue);
            
            return aDate - bDate;
        });
    } else if (sortBy === 'subject') {
        // 과목명 기준 정렬
        items.sort((a, b) => {
            const aSubject = a.querySelector('.assignment-subject').textContent;
            const bSubject = b.querySelector('.assignment-subject').textContent;
            
            return aSubject.localeCompare(bSubject, 'ko');
        });
    }
    
    // 정렬된 순서대로 DOM에 다시 추가
    items.forEach(item => {
        container.appendChild(item);
    });
}

// 텍스트에서 날짜를 추출하여 Date 객체로 변환 (간단 구현)
function extractDate(dateText) {
    // "마감: 4월 12일 오후 11:59" 또는 "4월 24일 오후 2:00" 형식에서 추출
    const monthMatch = dateText.match(/(\d+)월/);
    const dayMatch = dateText.match(/(\d+)일/);
    const timeMatch = dateText.match(/(오전|오후) (\d+):(\d+)/);
    
    if (monthMatch && dayMatch && timeMatch) {
        const month = parseInt(monthMatch[1]) - 1; // JavaScript의 월은 0부터 시작
        const day = parseInt(dayMatch[1]);
        let hour = parseInt(timeMatch[2]);
        const minute = parseInt(timeMatch[3]);
        
        // 오후인 경우 시간에 12 추가 (단, 12시는 제외)
        if (timeMatch[1] === '오후' && hour < 12) {
            hour += 12;
        }
        
        // 2025년 기준 (현재 연도로 설정해도 됨)
        return new Date(2025, month, day, hour, minute).getTime();
    }
    
    return Number.MAX_SAFE_INTEGER; // 날짜 추출 실패 시 맨 뒤로
}

// 유형별 필터링
function filterByType(type) {
    const items = document.querySelectorAll('.assignment-item');
    
    items.forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 상태 개수 업데이트
function updateStatusCounts() {
    // 표시된 항목만 계산
    const visibleItems = Array.from(document.querySelectorAll('.assignment-item')).filter(item => 
        item.style.display !== 'none'
    );
    
    // 급한 항목 (마감 3일 이내)
    const urgentCount = visibleItems.filter(item => item.classList.contains('urgent')).length;
    
    // 예정된 항목 (마감 3일 이후)
    const upcomingCount = visibleItems.filter(item => item.classList.contains('normal')).length;
    
    // 완료된 항목
    const completedCount = visibleItems.filter(item => item.classList.contains('completed')).length;
    
    // 카운트 업데이트
    document.querySelector('.status-item.urgent .status-count').textContent = urgentCount;
    document.querySelector('.status-item.upcoming .status-count').textContent = upcomingCount;
    document.querySelector('.status-item.completed .status-count').textContent = completedCount;
}

// 상세 정보 토글
function toggleDetails(button) {
    const item = button.closest('.assignment-item');
    const detailsElement = item.querySelector('.assignment-details');
    
    if (detailsElement.style.display === 'none' || detailsElement.style.display === '') {
        // 모든 상세 정보 닫기
        document.querySelectorAll('.assignment-details').forEach(details => {
            details.style.display = 'none';
        });
        
        // 현재 항목의 상세 정보 열기
        detailsElement.style.display = 'block';
    } else {
        // 현재 항목의 상세 정보 닫기
        detailsElement.style.display = 'none';
    }
}

// 항목 삭제
function deleteItem(button) {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
        const item = button.closest('.assignment-item');
        item.remove();
        
        // 상태 개수 업데이트 및 빈 화면 확인
        checkEmptyState();
    }
}

// 항목 수정
function editItem(button) {
    const item = button.closest('.assignment-item');
    
    // 현재 항목의 데이터 가져오기
    const type = item.dataset.type;
    const subject = item.querySelector('.assignment-subject').textContent;
    const title = item.querySelector('.assignment-title').textContent;
    const dueText = item.querySelector('.assignment-due').textContent;
    const details = item.querySelector('.assignment-details').textContent;
    
    // 마감일/시간 추출
    const monthMatch = dueText.match(/(\d+)월/);
    const dayMatch = dueText.match(/(\d+)일/);
    const timeMatch = dueText.match(/(오전|오후) (\d+):(\d+)/);
    
    let dateString = '';
    let timeString = '';
    
    if (monthMatch && dayMatch) {
        const month = parseInt(monthMatch[1]);
        const day = parseInt(dayMatch[1]);
        dateString = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    if (timeMatch) {
        let hour = parseInt(timeMatch[2]);
        const minute = parseInt(timeMatch[3]);
        
        // 오후인 경우 시간 변환
        if (timeMatch[1] === '오후' && hour < 12) {
            hour += 12;
        } else if (timeMatch[1] === '오전' && hour === 12) {
            hour = 0;
        }
        
        timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // 수정 폼 데이터 설정
    const typeOptions = document.querySelectorAll('#editFormOverlay .type-option');
    typeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.type === type) {
            option.classList.add('active');
        }
    });
    
    document.getElementById('editSubjectInput').value = subject;
    document.getElementById('editTitleInput').value = title;
    document.getElementById('editDateInput').value = dateString;
    document.getElementById('editTimeInput').value = timeString;
    document.getElementById('editDetailsInput').value = details.trim();
    
    // 현재 항목의 인덱스 저장 (나중에 업데이트할 때 사용)
    const items = Array.from(document.querySelectorAll('.assignment-item'));
    const index = items.indexOf(item);
    document.getElementById('editItemIndex').value = index;
    
    // 수정 폼 표시
    document.getElementById('editFormOverlay').style.display = 'flex';
}

// 수정 폼 숨기기
function hideEditForm() {
    document.getElementById('editFormOverlay').style.display = 'none';
}

// 수정한 항목 저장
function updateItem() {
    // 입력값 가져오기
    const typeElement = document.querySelector('#editFormOverlay .type-option.active');
    const type = typeElement ? typeElement.dataset.type : 'assignment';
    const subject = document.getElementById('editSubjectInput').value;
    const title = document.getElementById('editTitleInput').value;
    const date = document.getElementById('editDateInput').value;
    const time = document.getElementById('editTimeInput').value;
    const details = document.getElementById('editDetailsInput').value;
    
    // 유효성 검사
    if (!subject || !title || !date || !time) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    // 날짜 형식 변환
    const dateObj = new Date(date + 'T' + time);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 || 12;
    
    const formattedDate = `${month}월 ${day}일 ${period} ${hour12}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    // 마감까지 남은 일수 계산
    const today = new Date();
    const diffTime = dateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 상태 결정 (3일 이내면 급함, 그 외는 정상)
    const statusClass = diffDays <= 3 ? 'urgent' : 'normal';
    const statusText = diffDays <= 3 ? '급함' : `${diffDays}일 후`;
    
    // 수정할 항목 가져오기
    const index = parseInt(document.getElementById('editItemIndex').value);
    const items = Array.from(document.querySelectorAll('.assignment-item'));
    const item = items[index];
    
    // 항목 업데이트
    item.dataset.type = type;
    item.dataset.subject = subject;
    item.querySelector('.assignment-type').textContent = type === 'assignment' ? '과제' : '시험';
    item.querySelector('.assignment-subject').textContent = subject;
    item.querySelector('.assignment-title').textContent = title;
    item.querySelector('.assignment-due').textContent = type === 'assignment' ? `마감: ${formattedDate}` : formattedDate;
    item.querySelector('.assignment-details').textContent = details;
    
    // 상태 클래스 업데이트
    item.classList.remove('urgent', 'normal');
    item.classList.add(statusClass);
    
    const statusElement = item.querySelector('.assignment-status');
    statusElement.classList.remove('urgent', 'normal');
    statusElement.classList.add(statusClass);
    statusElement.textContent = statusText;
    
    // 수정 폼 숨기기
    hideEditForm();
    
    // 상태 개수 업데이트
    updateStatusCounts();
}

// 유형 선택 (추가 폼)
function selectType(element) {
    document.querySelectorAll('#addFormOverlay .type-option').forEach(option => {
        option.classList.remove('active');
    });
    element.classList.add('active');
}

// 유형 선택 (수정 폼)
function selectEditType(element) {
    document.querySelectorAll('#editFormOverlay .type-option').forEach(option => {
        option.classList.remove('active');
    });
    element.classList.add('active');
}

// 과제 추가 폼 표시
function showAddForm() {
    // 기본 설정: 과제 유형 선택
    document.querySelectorAll('#addFormOverlay .type-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector('#addFormOverlay .type-option[data-type="assignment"]').classList.add('active');
    
    // 폼 초기화
    document.getElementById('subjectInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('detailsInput').value = '';
    
    // 오늘 날짜와 시간 설정
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    document.getElementById('dateInput').value = `${year}-${month}-${day}`;
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('timeInput').value = `${hours}:${minutes}`;
    
    // 폼 표시
    document.getElementById('addFormOverlay').style.display = 'flex';
}

// 과제 추가 폼 숨기기
function hideAddForm() {
    document.getElementById('addFormOverlay').style.display = 'none';
}

// 새 과제/시험 저장
function saveNewItem() {
    // 입력값 가져오기
    const typeElement = document.querySelector('#addFormOverlay .type-option.active');
    const type = typeElement ? typeElement.dataset.type : 'assignment';
    const subject = document.getElementById('subjectInput').value;
    const title = document.getElementById('titleInput').value;
    const date = document.getElementById('dateInput').value;
    const time = document.getElementById('timeInput').value;
    const details = document.getElementById('detailsInput').value;
    
    // 유효성 검사
    if (!subject || !title || !date || !time) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    // 날짜 형식 변환 (간단 구현)
    const dateObj = new Date(date + 'T' + time);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 || 12;
    
    const formattedDate = `${month}월 ${day}일 ${period} ${hour12}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    // 마감까지 남은 일수 계산
    const today = new Date();
    const diffTime = dateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 상태 결정 (3일 이내면 급함, 그 외는 정상)
    const statusClass = diffDays <= 3 ? 'urgent' : 'normal';
    const statusText = diffDays <= 3 ? '급함' : `${diffDays}일 후`;
    
    // 새 항목 HTML 생성
    const newItem = document.createElement('div');
    newItem.className = `assignment-item ${statusClass}`;
    newItem.dataset.type = type;
    newItem.dataset.subject = subject;
    
    newItem.innerHTML = `
        <div class="assignment-left">
            <div class="assignment-type">${type === 'assignment' ? '과제' : '시험'}</div>
        </div>
        <div class="assignment-content">
            <div class="assignment-subject">${subject}</div>
            <div class="assignment-title">${title}</div>
            <div class="assignment-due">${type === 'assignment' ? '마감: ' : ''}${formattedDate}</div>
            <div class="assignment-details" style="display: none;">${details}</div>
        </div>
        <div class="assignment-right">
            <div class="assignment-status ${statusClass}">${statusText}</div>
            <div class="assignment-actions">
                <button class="edit-btn" onclick="editItem(this)">수정</button>
                <button class="delete-btn" onclick="deleteItem(this)">삭제</button>
                <button class="view-details-btn" onclick="toggleDetails(this)">상세</button>
            </div>
        </div>
    `;
    
    // 새 항목을 목록에 추가
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.prepend(newItem);
    
    // 빈 화면 체크
    if (assignmentsList.children.length === 1) {
        // 첫 번째 항목 추가 시 빈 화면 숨기고 목록 표시
        document.getElementById('emptyState').style.display = 'none';
        assignmentsList.style.display = 'block';
    }
    
    // 폼 닫기 및 초기화
    hideAddForm();
    document.getElementById('subjectInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('timeInput').value = '';
    document.getElementById('detailsInput').value = '';
    
    // 상태 개수 업데이트
    updateStatusCounts();
    
    // 알림 표시
    alert('항목이 추가되었습니다.');
}

// 과제/시험 데이터 저장 함수
function saveAssignmentsData(assignments) {
    try {
        localStorage.setItem('assignments', JSON.stringify(assignments));
        // 메인 페이지에 변경 알림 이벤트 발생
        window.dispatchEvent(new Event('assignmentsUpdated'));
    } catch (error) {
        console.error('과제/시험 데이터 저장 오류:', error);
    }
}

// 기존의 과제/시험 항목 로드 함수
function loadAssignmentsData() {
    const data = localStorage.getItem('assignments');
    if (data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('과제/시험 데이터 파싱 오류:', error);
            return [];
        }
    }
    return []; // 데이터가 없으면 빈 배열 반환
}

// 과제/시험 목록에서 항목들 수집 함수
function collectAssignmentItems() {
    const items = document.querySelectorAll('.assignment-item');
    const assignments = [];
    
    items.forEach(item => {
        const typeEl = item.querySelector('.assignment-type');
        const subjectEl = item.querySelector('.assignment-subject');
        const titleEl = item.querySelector('.assignment-title');
        const dueEl = item.querySelector('.assignment-due');
        const detailsEl = item.querySelector('.assignment-details');
        
        if (typeEl && subjectEl && titleEl && dueEl) {
            const typeText = typeEl.textContent;
            const type = typeText === '과제' ? 'assignment' : 'exam';
            
            assignments.push({
                type: type,
                subject: subjectEl.textContent,
                title: titleEl.textContent,
                due: dueEl.textContent,
                details: detailsEl ? detailsEl.textContent.trim() : ''
            });
        }
    });
    
    return assignments;
}

// 페이지의 모든 항목 업데이트 후 데이터 저장
function updateAndSaveAllItems() {
    const assignments = collectAssignmentItems();
    saveAssignmentsData(assignments);
}

// 기존 saveNewItem 함수 수정 (새 항목 저장 후 데이터 업데이트)
const originalSaveNewItem = saveNewItem;
saveNewItem = function() {
    // 원래 함수 호출
    originalSaveNewItem.apply(this, arguments);
    
    // 모든 항목 데이터 저장
    setTimeout(() => {
        updateAndSaveAllItems();
    }, 100);
};

// 기존 deleteItem 함수 수정 (항목 삭제 후 데이터 업데이트)
const originalDeleteItem = deleteItem;
deleteItem = function(button) {
    // 원래 함수 호출
    originalDeleteItem.apply(this, arguments);
    
    // 모든 항목 데이터 저장
    setTimeout(() => {
        updateAndSaveAllItems();
    }, 100);
};

// 기존 updateItem 함수 수정 (항목 수정 후 데이터 업데이트)
const originalUpdateItem = updateItem;
updateItem = function() {
    // 원래 함수 호출
    originalUpdateItem.apply(this, arguments);
    
    // 모든 항목 데이터 저장
    setTimeout(() => {
        updateAndSaveAllItems();
    }, 100);
};

// 초기화 시 페이지에 기존 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 로직이 실행된 후 실행되도록 setTimeout 사용
    setTimeout(() => {
        const assignments = loadAssignmentsData();
        
        // 저장된 데이터가 있으면 빈 화면 대신 데이터 표시
        if (assignments && assignments.length > 0) {
            const emptyState = document.getElementById('emptyState');
            const assignmentsList = document.getElementById('assignmentsList');
            
            if (emptyState && assignmentsList) {
                // 빈 화면 숨기기
                emptyState.style.display = 'none';
                assignmentsList.style.display = 'block';
                
                // 저장된 항목들을 페이지에 추가
                assignments.forEach(assignment => {
                    // 날짜 정보 파싱
                    const dateInfo = parseDueDate(assignment.due);
                    
                    // 남은 일수 계산
                    const now = new Date();
                    const dueDate = dateInfo.date;
                    const diffTime = dueDate - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // 상태 결정 (3일 이내면 급함, 그 외는 정상)
                    const statusClass = diffDays <= 3 ? 'urgent' : 'normal';
                    const statusText = diffDays <= 3 ? '급함' : `${diffDays}일 후`;
                    
                    // 새 항목 HTML 생성
                    const newItem = document.createElement('div');
                    newItem.className = `assignment-item ${statusClass}`;
                    newItem.dataset.type = assignment.type;
                    newItem.dataset.subject = assignment.subject;
                    
                    newItem.innerHTML = `
                        <div class="assignment-left">
                            <div class="assignment-type">${assignment.type === 'assignment' ? '과제' : '시험'}</div>
                        </div>
                        <div class="assignment-content">
                            <div class="assignment-subject">${assignment.subject}</div>
                            <div class="assignment-title">${assignment.title}</div>
                            <div class="assignment-due">${assignment.due}</div>
                            <div class="assignment-details" style="display: none;">${assignment.details || ''}</div>
                        </div>
                        <div class="assignment-right">
                            <div class="assignment-status ${statusClass}">${statusText}</div>
                            <div class="assignment-actions">
                                <button class="edit-btn" onclick="editItem(this)">수정</button>
                                <button class="delete-btn" onclick="deleteItem(this)">삭제</button>
                                <button class="view-details-btn" onclick="toggleDetails(this)">상세</button>
                            </div>
                        </div>
                    `;
                    
                    // 목록에 추가
                    assignmentsList.appendChild(newItem);
                });
                
                // 상태 개수 업데이트
                updateStatusCounts();
            }
        }
    }, 200);
});

// 날짜 문자열 파싱 함수
function parseDueDate(dueString) {
    // "마감: 4월 12일 오후 11:59" 또는 "4월 24일 오후 2:00" 형식에서 추출
    const monthMatch = dueString.match(/(\d+)월/);
    const dayMatch = dueString.match(/(\d+)일/);
    const timeMatch = dueString.match(/(오전|오후) (\d+):(\d+)/);
    
    if (monthMatch && dayMatch && timeMatch) {
        const month = parseInt(monthMatch[1]) - 1; // JavaScript의 월은 0부터 시작
        const day = parseInt(dayMatch[1]);
        let hour = parseInt(timeMatch[2]);
        const minute = parseInt(timeMatch[3]);
        
        // 오후인 경우 시간에 12 추가 (단, 12시는 제외)
        if (timeMatch[1] === '오후' && hour < 12) {
            hour += 12;
        }
        
        // 현재 년도 또는 2025년으로 설정
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear, month, day, hour, minute);
        
        return {
            date: date,
            month: month + 1,
            day: day,
            hour: hour,
            minute: minute,
            period: timeMatch[1]
        };
    }
    
    // 파싱 실패 시 현재 날짜 반환
    const now = new Date();
    return {
        date: now,
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        period: now.getHours() < 12 ? '오전' : '오후'
    };
}

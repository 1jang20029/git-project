// 페이지 로드 시 실행할 함수
document.addEventListener('DOMContentLoaded', function() {
    // 마감일 기준으로 정렬
    sortAssignments('deadline');
    
    // 상태 개수 업데이트
    updateStatusCounts();
});

// 이전 페이지로 돌아가기
function goBack() {
    window.location.href = "index.html";
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

// 완료 표시
function markComplete(button) {
    const item = button.closest('.assignment-item');
    
    // 완료 클래스 토글
    if (item.classList.contains('completed')) {
        item.classList.remove('completed');
        if (item.dataset.originalClass) {
            item.classList.add(item.dataset.originalClass);
        }
        button.textContent = '완료';
    } else {
        // 원래 클래스 저장
        if (item.classList.contains('urgent')) {
            item.dataset.originalClass = 'urgent';
        } else if (item.classList.contains('normal')) {
            item.dataset.originalClass = 'normal';
        }
        
        // 기존 상태 클래스 제거
        item.classList.remove('urgent', 'normal');
        
        // 완료 클래스 추가
        item.classList.add('completed');
        button.textContent = '취소';
    }
    
    // 상태 개수 업데이트
    updateStatusCounts();
}

// 시험 상세 정보 보기
function viewExamDetails(subject, title) {
    alert(`${subject} - ${title} 시험 상세 정보\n\n` +
          `일시: 4월 24일 오후 2:00\n` +
          `장소: 중앙 강의동 303호\n` +
          `범위: 중간고사 - 1~5장\n` +
          `참고사항: 계산기 사용 가능`);
}

// 과제 추가 폼 표시
function showAddForm() {
    document.getElementById('addFormOverlay').style.display = 'flex';
}

// 과제 추가 폼 숨기기
function hideAddForm() {
    document.getElementById('addFormOverlay').style.display = 'none';
}

// 유형 선택
function selectType(element) {
    document.querySelectorAll('.type-option').forEach(option => {
        option.classList.remove('active');
    });
    element.classList.add('active');
}

// 새 과제/시험 저장
function saveNewItem() {
    // 입력값 가져오기
    const typeElement = document.querySelector('.type-option.active');
    const type = typeElement ? typeElement.dataset.type : 'assignment';
    const subject = document.getElementById('subjectInput').value;
    const title = document.getElementById('titleInput').value;
    const date = document.getElementById('dateInput').value;
    const time = document.getElementById('timeInput').value;
    
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
        </div>
        <div class="assignment-right">
            <div class="assignment-status ${statusClass}">${statusText}</div>
            <div class="assignment-actions">
                ${type === 'assignment' ? 
                  '<button class="complete-btn" onclick="markComplete(this)">완료</button>' :
                  `<button class="view-details-btn" onclick="viewExamDetails('${subject}', '${title}')">상세</button>`}
            </div>
        </div>
    `;
    
    // 새 항목을 목록에 추가
    document.getElementById('assignmentsList').prepend(newItem);
    
    // 폼 닫기 및 초기화
    hideAddForm();
    document.getElementById('subjectInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('timeInput').value = '';
    
    // 상태 개수 업데이트
    updateStatusCounts();
    
    // 알림 표시
    alert('항목이 추가되었습니다.');
}
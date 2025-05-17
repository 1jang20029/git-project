// 로컬 스토리지 저장
function saveToLocalStorage() {
    localStorage.setItem('userActivities', JSON.stringify(userActivities));
    localStorage.setItem('userApplications', JSON.stringify(userApplications));
    localStorage.setItem('currentCategory', currentCategory);
}

// 로컬 스토리지에서 불러오기
function loadFromLocalStorage() {
    const savedActivities = localStorage.getItem('userActivities');
    const savedApplications = localStorage.getItem('userApplications');
    const savedCategory = localStorage.getItem('currentCategory');
    
    if (savedActivities) {
        userActivities = JSON.parse(savedActivities);
    }
    
    if (savedApplications) {
        userApplications = JSON.parse(savedApplications);
    }
    
    if (savedCategory) {
        currentCategory = savedCategory;
    }
}

// 초기 활동 로드
function loadInitialActivities() {
    const activitiesContainer = document.querySelector('.activities-container');
    
    if (userActivities.length === 0) {
        // 활동이 없는 경우
        activitiesContainer.innerHTML = `
            <div class="no-activities-message">
                <p>현재 등록된 활동이 없습니다. 상단의 '등록' 버튼을 클릭하여 새 활동을 등록해보세요!</p>
            </div>
        `;
    } else {
        // 활동이 있는 경우, HTML 생성
        const noActivitiesMessage = document.querySelector('.no-activities-message');
        if (noActivitiesMessage) {
            noActivitiesMessage.style.display = 'none';
        }
        
        let activitiesHTML = '';
        
        userActivities.forEach(activity => {
            // 신청 상태 확인
            const isApplied = userApplications.some(a => a.activityId === activity.id);
            const applyBtnText = isApplied ? '신청 취소' : '신청하기';
            
            // 현재 카테고리에 맞는 활동만 표시
            const isVisible = currentCategory === 'all' || currentCategory === activity.type;
            const displayStyle = isVisible ? '' : 'display: none;';
            const hiddenClass = isVisible ? '' : 'hidden-category';
            
            activitiesHTML += `
                <div class="activity-item ${activity.type} ${hiddenClass}" data-category="${activity.type}" data-id="${activity.id}" style="${displayStyle}">
                    <div class="activity-header">
                        <div class="activity-type">${getActivityTypeName(activity.type)}</div>
                        <div class="activity-deadline">${activity.deadlineText}</div>
                    </div>
                    <div class="activity-manage">
                        <button class="manage-btn edit-btn" onclick="openEditForm('${activity.id}')">수정</button>
                        <button class="manage-btn delete-btn" onclick="deleteActivity('${activity.id}')">삭제</button>
                    </div>
                    <div class="activity-content">
                        <h3 class="activity-title">${activity.title}</h3>
                        <p class="activity-description">${activity.description}</p>
                        <div class="activity-details">
                            ${activity.details.map(detail => `<span class="detail-item">${detail}</span>`).join('')}
                        </div>
                        <div class="activity-tags">
                            ${activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="activity-actions">
                        <button class="btn-detail" onclick="viewActivityDetail('${activity.id}')">자세히 보기</button>
                        <button class="btn-apply" onclick="applyActivity('${activity.id}')">${applyBtnText}</button>
                    </div>
                </div>
            `;
        });
        
        activitiesContainer.innerHTML = activitiesHTML;
    }
    
    // 현재 선택된 카테고리에 따라 필터링
    const categoryTab = document.querySelector(`.tab-button[data-category="${currentCategory}"]`);
    if (categoryTab) {
        // 탭 활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        categoryTab.classList.add('active');
        
        // 콘솔에 정보 출력 (디버깅용)
        console.log(`Initial category set to: ${currentCategory}`);
    }
    
    // 필터링된 활동 개수 확인
    const visibleActivities = document.querySelectorAll('.activity-item:not(.hidden-category)');
    if (visibleActivities.length === 0 && userActivities.length > 0) {
        // 필터링 결과가 없는 경우
        updateNoActivitiesMessage(0, currentCategory);
    }
    
    // 통계 및 페이지네이션 업데이트
    updateStats();
    updatePagination();
    
    // 콘솔에 정보 출력 (디버깅용)
    console.log(`Loaded ${userActivities.length} activities, ${visibleActivities.length} visible`);
}

// 달력 모달 열기
function openCalendarModal(inputField) {
    currentCalendarField = inputField;
    
    // 현재 선택된 날짜 가져오기
    const fieldValue = document.getElementById(inputField).value;
    if (fieldValue) {
        selectedDate = new Date(fieldValue);
        currentDate = new Date(fieldValue);
    } else {
        selectedDate = null;
        currentDate = new Date();
    }
    
    // 달력 렌더링
    renderCalendar();
    
    // 모달 열기
    document.getElementById('calendarModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    
    // 스크롤 이벤트 리스너 추가
    const calendarContainer = document.querySelector('.calendar-container');
    calendarContainer.addEventListener('wheel', handleCalendarScroll);
}

// 달력 스크롤 처리
function handleCalendarScroll(event) {
    // 스크롤 방향 확인
    if (event.deltaY > 0) {
        // 아래로 스크롤 - 다음 달
        nextMonth();
    } else {
        // 위로 스크롤 - 이전 달
        prevMonth();
    }
    
    // 기본 스크롤 동작 방지
    event.preventDefault();
}

// 달력 모달 닫기
function closeCalendarModal() {
    document.getElementById('calendarModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    currentCalendarField = null;
    
    // 스크롤 이벤트 리스너 제거
    const calendarContainer = document.querySelector('.calendar-container');
    calendarContainer.removeEventListener('wheel', handleCalendarScroll);
}

// 선택한 날짜 적용
function applySelectedDate() {
    if (currentCalendarField && selectedDate) {
        // yyyy-MM-dd 형식으로 변환
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // 입력 필드에 적용
        document.getElementById(currentCalendarField).value = formattedDate;
    }
    
    closeCalendarModal();
}

// 선택한 날짜 삭제
function clearSelectedDate() {
    selectedDate = null;
    
    if (currentCalendarField) {
        document.getElementById(currentCalendarField).value = '';
    }
    
    closeCalendarModal();
}

// 이전 달로 이동
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// 다음 달로 이동
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// 달력 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 현재 달의 첫째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 월, 연도 표시 업데이트
    document.getElementById('currentMonthYear').textContent = `${year}년 ${month + 1}월`;
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // 첫째 날의 요일(0: 일요일, 6: 토요일)
    const firstDayOfWeek = firstDay.getDay();
    
    // 이전 달의 마지막 날
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // 이전 달의 날짜 채우기
    for (let i = 0; i < firstDayOfWeek; i++) {
        const day = prevMonthLastDay - firstDayOfWeek + i + 1;
        calendarDays.innerHTML += `<div class="calendar-day inactive">${day}</div>`;
    }
    
    // 현재 달의 날짜 채우기
    const today = new Date();
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        
        // 선택된 날짜, 오늘 날짜 클래스 추가
        let classes = 'calendar-day';
        
        if (selectedDate && date.getFullYear() === selectedDate.getFullYear() && 
            date.getMonth() === selectedDate.getMonth() && 
            date.getDate() === selectedDate.getDate()) {
            classes += ' selected';
        }
        
        if (date.getFullYear() === today.getFullYear() && 
            date.getMonth() === today.getMonth() && 
            date.getDate() === today.getDate()) {
            classes += ' today';
        }
        
        calendarDays.innerHTML += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${i})">${i}</div>`;
    }
    
    // 다음 달의 날짜 채우기
    const remainingDays = 42 - (firstDayOfWeek + lastDay.getDate()); // 6주 x 7일 = 42
    
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.innerHTML += `<div class="calendar-day inactive">${i}</div>`;
    }
}

// 날짜 선택
function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
}

// 활동 수정 폼 열기
function openEditForm(activityId) {
    // 활동 찾기
    const activity = userActivities.find(a => a.id === activityId);
    if (!activity) {
        alert('활동을 찾을 수 없습니다.');
        return;
    }
    
    // 폼 입력 값 설정
    document.getElementById('editActivityId').value = activity.id;
    document.getElementById('editActivityType').value = activity.type;
    document.getElementById('editActivityTitle').value = activity.title;
    document.getElementById('editActivityDescription').value = activity.description;
    
    if (activity.deadline) {
        document.getElementById('editActivityDeadline').value = activity.deadline;
    }
    
    // 세부사항 설정
    const detailInputs = document.querySelectorAll('[id^="editDetailItem"]');
    activity.details.forEach((detail, index) => {
        if (index < detailInputs.length) {
            detailInputs[index].value = detail;
        }
    });
    
    // 태그 설정
    document.getElementById('editActivityTags').value = activity.tags.join(',');
    
    // 모달 열기
    document.getElementById('editModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 활동 수정 폼 닫기
function closeEditForm() {
    document.getElementById('editModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    document.getElementById('activityEditForm').reset(); // 폼 초기화
}

// 활동 수정하기
function updateActivity(formData) {
    const activityId = formData.id;
    
    // 활동 객체 찾기
    const activityIndex = userActivities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) {
        alert('활동을 찾을 수 없습니다.');
        return;
    }
    
    // 현재 날짜 설정
    const currentDate = new Date();
    const deadlineDate = formData.deadline ? new Date(formData.deadline) : null;
    
    // D-day 계산
    let deadlineText = "상시모집";
    if (deadlineDate) {
        const diffTime = deadlineDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            deadlineText = `D-${diffDays}`;
        } else if (diffDays === 0) {
            deadlineText = '오늘마감';
        } else {
            deadlineText = '마감됨';
        }
    }
    
    // 이전 타입 저장
    const oldType = userActivities[activityIndex].type;
    
    // 활동 객체 업데이트
    userActivities[activityIndex] = {
        ...userActivities[activityIndex],
        type: formData.type,
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        deadlineText: deadlineText,
        details: formData.details,
        tags: formData.tags,
        updatedAt: new Date().toISOString()
    };
    
    // DOM 요소 찾기
    const activityElement = document.querySelector(`.activity-item[data-id="${activityId}"]`);
    if (!activityElement) {
        alert('DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 카테고리가 변경된 경우 필터링 적용
    if (oldType !== formData.type && currentCategory !== 'all' && currentCategory !== formData.type) {
        // 현재 선택된 카테고리에 맞지 않으면 숨김 처리
        activityElement.classList.add('hidden-category');
        activityElement.style.display = 'none';
    } else {
        activityElement.classList.remove('hidden-category');
        activityElement.style.display = 'block';
    }
    
    // 카테고리가 변경된 경우 클래스 변경
    activityElement.className = `activity-item ${formData.type}`;
    activityElement.setAttribute('data-category', formData.type);
    
    // 내부 요소 업데이트
    activityElement.innerHTML = `
        <div class="activity-header">
            <div class="activity-type">${getActivityTypeName(formData.type)}</div>
            <div class="activity-deadline">${deadlineText}</div>
        </div>
        <div class="activity-manage">
            <button class="manage-btn edit-btn" onclick="openEditForm('${activityId}')">수정</button>
            <button class="manage-btn delete-btn" onclick="deleteActivity('${activityId}')">삭제</button>
        </div>
        <div class="activity-content">
            <h3 class="activity-title">${formData.title}</h3>
            <p class="activity-description">${formData.description}</p>
            <div class="activity-details">
                ${formData.details.map(detail => `<span class="detail-item">${detail}</span>`).join('')}
            </div>
            <div class="activity-tags">
                ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        <div class="activity-actions">
            <button class="btn-detail" onclick="viewActivityDetail('${activityId}')">자세히 보기</button>
            <button class="btn-apply" onclick="applyActivity('${activityId}')">신청하기</button>
        </div>
    `;
    
    // 통계 및 페이지네이션 업데이트
    updateStats();
    updatePagination();
    
    // 로컬 스토리지에 저장
    saveToLocalStorage();
    
    // 성공 메시지
    alert('활동이 수정되었습니다.');
}

// 활동 삭제하기
function deleteActivity(activityId) {
    if (!confirm('이 활동을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    // 활동 객체에서 삭제
    const activityIndex = userActivities.findIndex(a => a.id === activityId);
    if (activityIndex > -1) {
        userActivities.splice(activityIndex, 1);
    }
    
    // DOM에서 삭제
    const activityElement = document.querySelector(`.activity-item[data-id="${activityId}"]`);
    if (activityElement) {
        activityElement.remove();
    }
    
    // 활동이 없을 경우 메시지 표시
    if (userActivities.length === 0) {
        const activitiesContainer = document.querySelector('.activities-container');
        const noActivitiesMessage = document.querySelector('.no-activities-message');
        
        if (noActivitiesMessage) {
            noActivitiesMessage.style.display = 'block';
        } else {
            activitiesContainer.innerHTML = `
                <div class="no-activities-message">
                    <p>현재 등록된 활동이 없습니다. 상단의 '등록' 버튼을 클릭하여 새 활동을 등록해보세요!</p>
                </div>
            `;
        }
    }
    
    // 통계 및 페이지네이션 업데이트
    updateStats();
    updatePagination();
    
    // 로컬 스토리지에 저장
    saveToLocalStorage();
    
    // 해당 활동에 대한 신청 내역도 삭제
    const applicationIndex = userApplications.findIndex(a => a.activityId === activityId);
    if (applicationIndex > -1) {
        userApplications.splice(applicationIndex, 1);
        saveToLocalStorage();
    }
    
    // 성공 메시지
    alert('활동이 삭제되었습니다.');
}

// 뒤로가기 함수
function goBack() {
    window.history.back();
}

// 검색 토글
function toggleSearch() {
    const searchSection = document.getElementById('searchSection');
    const searchInput = document.getElementById('activitySearch');
    
    searchSection.classList.toggle('active');
    
    if (searchSection.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchActivities();
    }
    
    updateClearButton();
}

// 활동 검색
function searchActivities() {
    const searchTerm = document.getElementById('activitySearch').value.toLowerCase();
    const activities = document.querySelectorAll('.activity-item');
    
    updateClearButton();
    
    activities.forEach(activity => {
        const title = activity.querySelector('.activity-title').textContent.toLowerCase();
        const description = activity.querySelector('.activity-description').textContent.toLowerCase();
        const tags = Array.from(activity.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) ||
                       tags.some(tag => tag.includes(searchTerm));
        
        if (matches || searchTerm === '') {
            activity.classList.remove('hidden');
        } else {
            activity.classList.add('hidden');
        }
    });
    
    // 필터링에 따라 현재 페이지의 활동 업데이트
    updateStats();
    currentPage = 1;
    updatePagination();
    displayActivitiesByPage();
}

// 검색어 삭제
function clearActivitySearch() {
    document.getElementById('activitySearch').value = '';
    searchActivities();
    updateClearButton();
}

// 검색 삭제 버튼 업데이트
function updateClearButton() {
    const clearButton = document.querySelector('.search-clear');
    const searchInput = document.getElementById('activitySearch');
    
    if (searchInput.value.trim() !== '') {
        clearButton.style.display = 'block';
    } else {
        clearButton.style.display = 'none';
    }
}

// 카테고리 필터
function filterByCategory(category) {
    console.log(`카테고리 필터 실행: ${category}`);
    
    // 탭 버튼 상태 업데이트
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // 현재 카테고리 저장
    currentCategory = category;
    
    // 모든 활동 아이템 가져오기
    const activities = document.querySelectorAll('.activity-item');
    
    // 활동이 없는 경우 처리
    if (activities.length === 0) {
        console.log("활동이 없음, 필터링 중단");
        // 페이지네이션은 여전히 표시
        updatePagination();
        return;
    }
    
    // 활동 아이템 필터링
    let visibleCount = 0;
    activities.forEach(activity => {
        const activityCategory = activity.getAttribute('data-category');
        
        if (category === 'all') {
            activity.classList.remove('hidden-category');
            activity.style.display = '';
            visibleCount++;
            console.log(`활동 표시: ${activity.querySelector('.activity-title').textContent} (전체 카테고리)`);
        } else {
            if (activityCategory === category) {
                activity.classList.remove('hidden-category');
                activity.style.display = '';
                visibleCount++;
                console.log(`활동 표시: ${activity.querySelector('.activity-title').textContent} (${category} 카테고리)`);
            } else {
                activity.classList.add('hidden-category');
                activity.style.display = 'none';
                console.log(`활동 숨김: ${activity.querySelector('.activity-title').textContent} (${activityCategory} 카테고리)`);
            }
        }
    });
    
    // 통계 업데이트
    updateStats();
    
    // 활동이 없는 경우 메시지 표시
    updateNoActivitiesMessage(visibleCount, category);
    
    // 페이지네이션 업데이트
    currentPage = 1;
    updatePagination();
    displayActivitiesByPage();
    
    // 로컬 스토리지에 현재 카테고리 저장
    localStorage.setItem('currentCategory', category);
    
    console.log(`카테고리 필터링 완료: ${category}, 표시된 활동 수: ${visibleCount}`);
}

// 필터링 후 활동이 없을 때 메시지 업데이트
function updateNoActivitiesMessage(visibleCount, category) {
    let container = document.querySelector('.activities-container');
    let existingMessage = document.querySelector('.no-activities-message');
    
    if (visibleCount === 0) {
        // 해당 카테고리에 활동이 없는 경우
        if (existingMessage) {
            existingMessage.style.display = 'block';
            existingMessage.innerHTML = `<p>현재 ${getActivityTypeName(category)} 카테고리에 등록된 활동이 없습니다.</p>`;
        } else {
            let messageDiv = document.createElement('div');
            messageDiv.className = 'no-activities-message';
            messageDiv.innerHTML = `<p>현재 ${getActivityTypeName(category)} 카테고리에 등록된 활동이 없습니다.</p>`;
            container.appendChild(messageDiv);
        }
    } else if (existingMessage) {
        existingMessage.style.display = 'none';
    }
}

// 통계 업데이트
function updateStats() {
    const visibleActivities = document.querySelectorAll('.activity-item:not(.hidden)');
    const contestCount = Array.from(visibleActivities).filter(item => item.classList.contains('contest')).length;
    const clubCount = Array.from(visibleActivities).filter(item => item.classList.contains('club')).length;
    const externalCount = Array.from(visibleActivities).filter(item => item.classList.contains('external')).length;
    const volunteerCount = Array.from(visibleActivities).filter(item => item.classList.contains('volunteer')).length;
    
    const stats = document.querySelectorAll('.stat-number');
    stats[0].textContent = contestCount;
    stats[1].textContent = clubCount;
    stats[2].textContent = externalCount;
    stats[3].textContent = volunteerCount;
    
    // 메인 페이지용 통계 정보 저장
    localStorage.setItem('activityStats', JSON.stringify({
        contestCount: contestCount,
        clubCount: clubCount,
        externalCount: externalCount,
        volunteerCount: volunteerCount,
        lastUpdated: new Date().toISOString()
    }));
}

// 활동 상세 보기
function viewActivityDetail(activityId) {
    // 활동 찾기
    const activity = userActivities.find(a => a.id === activityId);
    if (!activity) {
        alert('활동을 찾을 수 없습니다.');
        return;
    }
    
    // 현재 보고 있는 활동 ID 저장
    currentViewingActivityId = activityId;
    
    // 이미 신청한 활동인지 확인
    const isApplied = userApplications.some(a => a.activityId === activityId);
    
    // 상세 내용 생성
    const detailHTML = `
        <div class="detail-header">
            <div>
                <span class="detail-type-badge ${activity.type}">${getActivityTypeName(activity.type)}</span>
                <span class="detail-deadline">${activity.deadlineText}</span>
            </div>
        </div>
        <h3 class="detail-title">${activity.title}</h3>
        <div class="detail-info-section">
            <p class="detail-info-content">${activity.description}</p>
        </div>
        <div class="detail-info-section">
            <h4 class="detail-info-title">활동 세부정보</h4>
            <div class="detail-details">
                ${activity.details.map(detail => `<span class="detail-item">${detail}</span>`).join('')}
            </div>
        </div>
        <div class="detail-info-section">
            <h4 class="detail-info-title">태그</h4>
            <div class="detail-tags">
                ${activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    // 모달에 내용 삽입
    document.getElementById('activityDetailContent').innerHTML = detailHTML;
    
    // 신청 버튼 상태 업데이트
    const applyBtn = document.querySelector('.detail-apply-btn');
    if (isApplied) {
        applyBtn.textContent = '신청 취소하기';
        applyBtn.style.backgroundColor = '#f44336';
    } else {
        applyBtn.textContent = '신청하기';
        applyBtn.style.backgroundColor = '#c62917';
    }
    
    // 모달 열기
    document.getElementById('detailModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 상세 보기 모달 닫기
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    currentViewingActivityId = null;
}

// 상세 보기에서 활동 신청
function applyActivityFromDetail() {
    if (currentViewingActivityId) {
        applyActivity(currentViewingActivityId);
        closeDetailModal();
    }
}

// 활동 신청하기
function applyActivity(activityId) {
    // 로그인 확인 (실제 구현에서)
    const isLoggedIn = true; // 데모 목적으로 항상 true로 설정
    
    if (!isLoggedIn) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    // 활동 찾기
    const activity = userActivities.find(a => a.id === activityId);
    if (!activity) {
        alert('활동을 찾을 수 없습니다.');
        return;
    }
    
    // 이미 신청한 활동인지 확인
    const existingApplicationIndex = userApplications.findIndex(a => a.activityId === activityId);
    
    if (existingApplicationIndex > -1) {
        // 이미 신청한 경우, 신청 취소 확인
        if (confirm('이 활동 신청을 취소하시겠습니까?')) {
            // 신청 내역에서 삭제
            userApplications.splice(existingApplicationIndex, 1);
            saveToLocalStorage();
            alert('활동 신청이 취소되었습니다.');
            
            // 버튼 텍스트 변경
            const applyButton = document.querySelector(`.activity-item[data-id="${activityId}"] .btn-apply`);
            if (applyButton) {
                applyButton.textContent = '신청하기';
            }
        }
    } else {
        // 신청 확인
        if (confirm(`${activity.title} 활동에 신청하시겠습니까?`)) {
            // 신청 객체 생성
            const application = {
                id: `application-${Date.now()}`,
                activityId: activityId,
                activityTitle: activity.title,
                activityType: activity.type,
                appliedAt: new Date().toISOString()
            };
            
            // 신청 내역에 추가
            userApplications.push(application);
            saveToLocalStorage();
            
            // 버튼 텍스트 변경
            const applyButton = document.querySelector(`.activity-item[data-id="${activityId}"] .btn-apply`);
            if (applyButton) {
                applyButton.textContent = '신청 취소';
            }
            
            alert('활동에 신청되었습니다.');
        }
    }
}

// 신청 내역 모달 열기
function openApplicationsModal() {
    // 신청 내역 업데이트
    updateApplicationsList();
    
    // 모달 열기
    document.getElementById('applicationsModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 신청 내역 모달 닫기
function closeApplicationsModal() {
    document.getElementById('applicationsModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
}

// 신청 내역 업데이트
function updateApplicationsList() {
    const applicationsList = document.getElementById('applicationsList');
    const noApplicationsMessage = document.getElementById('noApplicationsMessage');
    
    if (userApplications.length === 0) {
        // 신청 내역이 없는 경우
        applicationsList.innerHTML = '';
        noApplicationsMessage.style.display = 'block';
    } else {
        // 신청 내역이 있는 경우
        noApplicationsMessage.style.display = 'none';
        
        // 날짜 형식화 함수
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        // 신청 내역 HTML 생성
        const applicationsHTML = userApplications.map(application => {
            const activity = userActivities.find(a => a.id === application.activityId);
            const typeName = getActivityTypeName(application.activityType);
            
            return `
                <div class="application-item">
                    <div class="application-info">
                        <div class="application-title">${application.activityTitle}</div>
                        <div class="application-meta">
                            ${typeName} | 신청일: ${formatDate(application.appliedAt)}
                        </div>
                    </div>
                    <button class="cancel-application-btn" onclick="cancelApplication('${application.id}')">신청 취소</button>
                </div>
            `;
        }).join('');
        
        applicationsList.innerHTML = applicationsHTML;
    }
}

// 신청 취소하기
function cancelApplication(applicationId) {
    if (!confirm('이 활동 신청을 취소하시겠습니까?')) {
        return;
    }
    
    // 신청 내역 찾기
    const applicationIndex = userApplications.findIndex(a => a.id === applicationId);
    if (applicationIndex === -1) {
        alert('신청 내역을 찾을 수 없습니다.');
        return;
    }
    
    // 활동 ID 가져오기
    const activityId = userApplications[applicationIndex].activityId;
    
    // 신청 내역에서 삭제
    userApplications.splice(applicationIndex, 1);
    saveToLocalStorage();
    
    // 버튼 텍스트 변경
    const applyButton = document.querySelector(`.activity-item[data-id="${activityId}"] .btn-apply`);
    if (applyButton) {
        applyButton.textContent = '신청하기';
    }
    
    // 신청 내역 업데이트
    updateApplicationsList();
    
    // 성공 메시지
    alert('활동 신청이 취소되었습니다.');
}

// 페이지네이션 관련 변수
let currentPage = 1;
let itemsPerPage = 5;
let totalItems = 0;
let totalPages = 0;
let allActivities = [];
let currentCategory = 'all';

// 저장소 관련 변수
let userActivities = []; // 사용자가 등록한 활동 저장
let userApplications = []; // 사용자가 신청한 활동 저장
let currentViewingActivityId = null; // 현재 보고 있는 활동 ID

// 달력 관련 변수
let currentDate = new Date();
let selectedDate = null;
let currentCalendarField = null;

// 페이지 이동
function goToPage(page) {
    // 이전 페이지 버튼
    if (page === 'prev') {
        if (currentPage > 1) {
            currentPage--;
        } else {
            return; // 첫 페이지면 아무것도 하지 않음
        }
    } 
    // 다음 페이지 버튼
    else if (page === 'next') {
        if (currentPage < totalPages) {
            currentPage++;
        } else {
            return; // 마지막 페이지면 아무것도 하지 않음
        }
    } 
    // 특정 페이지 번호
    else {
        currentPage = parseInt(page);
    }
    
    // 페이지네이션 버튼 업데이트
    updatePaginationButtons();
    
    // 활동 표시 업데이트
    displayActivitiesByPage();
}

// 페이지네이션 버튼 상태 업데이트
function updatePaginationButtons() {
    // 모든 페이지 버튼의 active 상태 제거
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('disabled');
    });
    
    // 현재 페이지 버튼 active 상태로 변경
    const currentPageBtn = document.querySelector(`.page-btn[data-page="${currentPage}"]`);
    if (currentPageBtn) {
        currentPageBtn.classList.add('active');
    }
    
    // 이전/다음 버튼 상태 업데이트
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (currentPage === 1) {
        prevBtn.classList.add('disabled');
    }
    
    if (currentPage === totalPages || totalPages === 0) {
        nextBtn.classList.add('disabled');
    }
}

// 페이지에 맞는 활동 표시
function displayActivitiesByPage() {
    // 현재 카테고리에 해당하는 모든 활동 아이템 가져오기 (display: none이 아닌 것들)
    const visibleActivities = Array.from(document.querySelectorAll('.activity-item')).filter(item => {
        const isHidden = item.classList.contains('hidden-category') || item.style.display === 'none';
        return !isHidden;
    });
    
    console.log(`페이지 표시: 전체 ${visibleActivities.length}개 중 페이지 ${currentPage} 표시`);
    
    // 페이지당 표시할 아이템 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // 모든 활동에 대해 페이지네이션 적용
    visibleActivities.forEach((activity, index) => {
        if (index >= startIndex && index < endIndex) {
            activity.style.display = 'block';
            console.log(`활동 표시(페이지네이션): ${activity.querySelector('.activity-title')?.textContent || 'Unknown'}`);
        } else {
            activity.style.display = 'none';
            console.log(`활동 숨김(페이지네이션): ${activity.querySelector('.activity-title')?.textContent || 'Unknown'}`);
        }
    });
}

// 페이지네이션 상태 업데이트
function updatePagination() {
    // 현재 카테고리에 따른 활동 수 계산
    const visibleActivities = document.querySelectorAll('.activity-item:not(.hidden-category)');
    totalItems = visibleActivities.length;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // 페이지네이션 컨테이너
    const paginationContainer = document.getElementById('paginationContainer');
    
    // 활동이 있을 때만 페이지네이션 표시
    if (totalItems > 0) {
        // 필요한 페이지 버튼 생성
        const pagination = document.querySelector('.pagination');
        const pageButtons = pagination.querySelectorAll('.page-btn:not(.prev-btn):not(.next-btn)');
        
        // 페이지 버튼 업데이트
        for (let i = 0; i < pageButtons.length; i++) {
            if (i < totalPages) {
                pageButtons[i].style.display = 'block';
                pageButtons[i].textContent = i + 1;
                pageButtons[i].setAttribute('data-page', i + 1);
            } else {
                pageButtons[i].style.display = 'none';
            }
        }
        
        // 페이지네이션 컨테이너 표시
        paginationContainer.style.display = 'block';
        
        // 페이지네이션 버튼 상태 업데이트
        updatePaginationButtons();
        
        // 활동 표시 업데이트
        displayActivitiesByPage();
    } else {
        // 활동이 없으면 페이지네이션 숨김
        paginationContainer.style.display = 'none';
    }
}

// 활동 등록 모달 열기
function openRegistrationForm() {
    // 로그인 확인 (실제 구현에서)
    const isLoggedIn = localStorage.getItem('currentLoggedInUser');
    
    if (!isLoggedIn) {
        alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
        // window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('registrationModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 활동 등록 모달 닫기
function closeRegistrationForm() {
    document.getElementById('registrationModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    document.getElementById('activityRegistrationForm').reset(); // 폼 초기화
}

// 새 활동 추가
function addNewActivity(formData, showAlert = true) {
    // 현재 날짜 설정
    const currentDate = new Date();
    const deadlineDate = formData.deadline ? new Date(formData.deadline) : null;
    
    // D-day 계산
    let deadlineText = "상시모집";
    if (deadlineDate) {
        const diffTime = deadlineDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            deadlineText = `D-${diffDays}`;
        } else if (diffDays === 0) {
            deadlineText = '오늘마감';
        } else {
            deadlineText = '마감됨';
        }
    }
    
    // 활동 ID 생성 (실제 구현에서는 서버에서 생성)
    const activityId = `user-activity-${Date.now()}`;
    
    // 활동 객체 생성
    const activityObj = {
        id: activityId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        deadlineText: deadlineText,
        details: formData.details,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
        isUserCreated: true
    };
    
    // 사용자 활동에 추가
    userActivities.push(activityObj);
    
    // HTML 생성 - 현재 선택된 카테고리에 맞는 경우에만 표시
    if (currentCategory === 'all' || currentCategory === formData.type) {
        const activityHTML = `
            <div class="activity-item ${formData.type}" data-category="${formData.type}" data-id="${activityId}">
                <div class="activity-header">
                    <div class="activity-type">${getActivityTypeName(formData.type)}</div>
                    <div class="activity-deadline">${deadlineText}</div>
                </div>
                <div class="activity-manage">
                    <button class="manage-btn edit-btn" onclick="openEditForm('${activityId}')">수정</button>
                    <button class="manage-btn delete-btn" onclick="deleteActivity('${activityId}')">삭제</button>
                </div>
                <div class="activity-content">
                    <h3 class="activity-title">${formData.title}</h3>
                    <p class="activity-description">${formData.description}</p>
                    <div class="activity-details">
                        ${formData.details.map(detail => `<span class="detail-item">${detail}</span>`).join('')}
                    </div>
                    <div class="activity-tags">
                        ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="activity-actions">
                    <button class="btn-detail" onclick="viewActivityDetail('${activityId}')">자세히 보기</button>
                    <button class="btn-apply" onclick="applyActivity('${activityId}')">신청하기</button>
                </div>
            </div>
        `;
        
        // 컨테이너에 새 활동 추가
        const activitiesContainer = document.querySelector('.activities-container');
        
        // 활동이 없을 때 표시되는 메시지 확인 및 제거
        const noActivitiesMessage = document.querySelector('.no-activities-message');
        if (noActivitiesMessage) {
            noActivitiesMessage.style.display = 'none';
        }
        
        // 컨테이너에 활동 추가
        activitiesContainer.insertAdjacentHTML('afterbegin', activityHTML);
    }
    
    // 통계 업데이트
    updateStats();
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 로컬 스토리지에 활동 저장
    saveToLocalStorage();
    
    // 활동 등록 성공 메시지 (showAlert이 true일 때만)
    if (showAlert) {
        alert('활동이 성공적으로 등록되었습니다.');
    }
}

// 활동 유형 한글명 반환
function getActivityTypeName(type) {
    switch(type) {
        case 'contest':
            return '공모전';
        case 'club':
            return '동아리';
        case 'external':
            return '대외활동';
        case 'volunteer':
            return '봉사활동';
        default:
            return '기타';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log("페이지 로드 시작");
    
    // 로컬 스토리지에서 데이터 불러오기
    loadFromLocalStorage();
    console.log(`로드된 활동: ${userActivities.length}, 저장된 카테고리: ${currentCategory}`);
    
    // 페이지네이션 초기 설정
    const paginationContainer = document.getElementById('paginationContainer');
    if (paginationContainer) {
        paginationContainer.style.display = 'block';
        console.log("페이지네이션 컨테이너 표시 설정");
    }
    
    // 초기 활동 로드
    loadInitialActivities();
    
    // 카테고리 탭 버튼에 클릭 이벤트 추가
    document.querySelectorAll('.tab-button').forEach(button => {
        const category = button.getAttribute('data-category');
        console.log(`${category} 탭 버튼에 이벤트 리스너 추가`);
        
        // 기존 onclick 속성 제거 후 addEventListener 사용
        button.removeAttribute('onclick');
        button.addEventListener('click', function() {
            console.log(`${category} 탭 클릭됨`);
            filterByCategory(category);
        });
    });
    
    // 검색 입력 이벤트 리스너
    const searchInput = document.getElementById('activitySearch');
    searchInput.addEventListener('input', searchActivities);
    
    // 활동 등록 폼 제출 이벤트 리스너
    const registrationForm = document.getElementById('activityRegistrationForm');
    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // 폼 데이터 수집
        const formData = {
            type: document.getElementById('activityType').value,
            title: document.getElementById('activityTitle').value,
            description: document.getElementById('activityDescription').value,
            deadline: document.getElementById('activityDeadline').value,
            details: [
                document.querySelector('[name="detailItem1"]').value,
                document.querySelector('[name="detailItem2"]').value,
                document.querySelector('[name="detailItem3"]').value
            ].filter(item => item), // 빈 항목 제거
            tags: document.getElementById('activityTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // 새 활동 추가
        addNewActivity(formData);
        
        // 폼 닫기 및 초기화
        closeRegistrationForm();
    });
    
    // 활동 수정 폼 제출 이벤트 리스너
    const editForm = document.getElementById('activityEditForm');
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // 폼 데이터 수집
        const formData = {
            id: document.getElementById('editActivityId').value,
            type: document.getElementById('editActivityType').value,
            title: document.getElementById('editActivityTitle').value,
            description: document.getElementById('editActivityDescription').value,
            deadline: document.getElementById('editActivityDeadline').value,
            details: [
                document.getElementById('editDetailItem1').value,
                document.getElementById('editDetailItem2').value,
                document.getElementById('editDetailItem3').value
            ].filter(item => item), // 빈 항목 제거
            tags: document.getElementById('editActivityTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // 활동 수정
        updateActivity(formData);
        
        // 폼 닫기
        closeEditForm();
    });
    
    // 달력 버튼 이벤트 리스너 추가
    const deadlineInput = document.getElementById('activityDeadline');
    deadlineInput.addEventListener('click', function() {
        openCalendarModal('activityDeadline');
    });
    
    const editDeadlineInput = document.getElementById('editActivityDeadline');
    editDeadlineInput.addEventListener('click', function() {
        openCalendarModal('editActivityDeadline');
    });
    
    // 헤더에 신청 내역 버튼 추가
    const headerActions = document.querySelector('.header-actions');
    const applicationsButton = document.createElement('button');
    applicationsButton.className = 'header-btn applications-button';
    applicationsButton.textContent = '내 신청';
    applicationsButton.onclick = openApplicationsModal;
    headerActions.prepend(applicationsButton);
    
    // 페이지네이션 강제 업데이트
    setTimeout(function() {
        updatePagination();
        console.log("페이지네이션 타이머로 강제 업데이트");
    }, 500);
    
    console.log('교내/대외활동 페이지가 로드되었습니다.');
});

// 키보드 이벤트 처리
document.addEventListener('keydown', function(event) {
    // ESC 키로 검색 닫기
    if (event.key === 'Escape') {
        const searchSection = document.getElementById('searchSection');
        if (searchSection.classList.contains('active')) {
            toggleSearch();
        }
        
        // ESC 키로 모달 닫기
        const modal = document.getElementById('registrationModal');
        if (modal.style.display === 'block') {
            closeRegistrationForm();
        }
    }
});

// 유틸리티 함수들
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateDaysLeft(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        return `D-${diffDays}`;
    } else if (diffDays === 0) {
        return '오늘마감';
    } else {
        return '마감됨';
    }
}

// 즐겨찾기 기능 (선택사항)
function toggleFavorite(activityId) {
    const favorites = JSON.parse(localStorage.getItem('favoriteActivities') || '[]');
    const index = favorites.indexOf(activityId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        alert('즐겨찾기에서 제거되었습니다.');
    } else {
        favorites.push(activityId);
        alert('즐겨찾기에 추가되었습니다.');
    }
    
    localStorage.setItem('favoriteActivities', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favoriteActivities') || '[]');
    // 즐겨찾기 버튼 상태 업데이트 로직
}

// 에러 처리
window.addEventListener('error', function(event) {
    console.error('JavaScript 오류:', event.error);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    // 필요한 정리 작업 수행
    console.log('교내/대외활동 페이지를 떠납니다.');
});
// 권한 시스템 상수
const USER_ROLES = {
    STUDENT: 'student',
    PROFESSOR: 'professor',
    STAFF: 'staff',
    ADMIN: 'admin'
};

// 전역 변수
let currentUser = null;
let userRole = null;
let currentEditingId = null;
let autoSaveInterval = null;
let allNotices = [];
let myNotices = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('관리자 공지사항 페이지 초기화 시작');
    
    // 권한 확인 및 초기화
    initializePage();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // URL 파라미터 확인
    handleURLParameters();
    
    // 현재 시간 표시
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
    
    // 자동 저장 설정 (3분마다)
    setupAutoSave();
    
    console.log('관리자 공지사항 페이지 초기화 완료');
});

// 권한 확인 및 페이지 초기화
function initializePage() {
    currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (!currentUser) {
        showPermissionWarning('로그인이 필요한 서비스입니다.');
        disableInterface();
        return;
    }
    
    userRole = getCurrentUserRole();
    
    if (userRole === USER_ROLES.STUDENT) {
        showPermissionWarning('교수 및 교직원만 접근할 수 있는 페이지입니다.');
        disableInterface();
        return;
    }
    
    // 권한이 있는 경우 UI 업데이트
    updateUserInterface();
    
    // 데이터 로드
    loadNoticesData();
    loadMyNotices();
    
    // 기본값 설정
    setDefaultValues();
}

// 현재 사용자 권한 확인
function getCurrentUserRole() {
    if (!currentUser) return USER_ROLES.STUDENT;
    
    const userRole = localStorage.getItem(`user_${currentUser}_role`);
    if (userRole) return userRole;
    
    // 학번 패턴으로 권한 추정
    if (currentUser.startsWith('P')) return USER_ROLES.PROFESSOR;
    if (currentUser.startsWith('S')) return USER_ROLES.STAFF;
    
    return USER_ROLES.STUDENT;
}

// 사용자 인터페이스 업데이트
function updateUserInterface() {
    const userRoleElement = document.getElementById('userRole');
    const userDepartmentElement = document.getElementById('userDepartment');
    const permissionWarning = document.getElementById('permissionWarning');
    
    // 권한 표시
    userRoleElement.className = `user-role ${userRole}`;
    switch(userRole) {
        case USER_ROLES.PROFESSOR:
            userRoleElement.textContent = '👨‍🏫 교수';
            break;
        case USER_ROLES.STAFF:
            userRoleElement.textContent = '👩‍💼 교직원';
            break;
        case USER_ROLES.ADMIN:
            userRoleElement.textContent = '⚙️ 관리자';
            break;
    }
    
    // 소속 정보 표시
    const userName = localStorage.getItem(`user_${currentUser}_name`) || '사용자';
    const userDepartment = localStorage.getItem(`user_${currentUser}_department`) || '';
    
    if (userDepartment) {
        const departmentNames = {
            'computerScience': '컴퓨터정보학과',
            'business': '경영학과',
            'nursing': '간호학과',
            'engineering': '공학계열',
            'arts': '예술계열',
            'education': '교무처',
            'student_affairs': '학생처',
            'career_center': '취업지원센터',
            'student_council': '학생회'
        };
        userDepartmentElement.textContent = departmentNames[userDepartment] || userDepartment;
    } else {
        userDepartmentElement.textContent = userName;
    }
    
    // 권한별 카테고리 제한
    setupCategoryRestrictions();
}

// 권한 경고 표시
function showPermissionWarning(message) {
    const permissionWarning = document.getElementById('permissionWarning');
    permissionWarning.textContent = message;
    permissionWarning.classList.add('visible');
}

// 인터페이스 비활성화
function disableInterface() {
    const form = document.getElementById('noticeForm');
    const inputs = form.querySelectorAll('input, textarea, select, button');
    
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    document.getElementById('publishBtn').style.display = 'none';
    document.getElementById('draftBtn').style.display = 'none';
}

// 권한별 카테고리 제한
function setupCategoryRestrictions() {
    const categorySelect = document.getElementById('category');
    const userDepartment = localStorage.getItem(`user_${currentUser}_department`);
    
    // 교수는 자신의 학과 관련 카테고리만 선택 가능
    if (userRole === USER_ROLES.PROFESSOR && userDepartment) {
        // 학과별 허용 카테고리
        const allowedCategories = {
            'computerScience': ['academic', 'department'],
            'business': ['academic', 'department'],
            'nursing': ['academic', 'department'],
            'engineering': ['academic', 'department'],
            'arts': ['academic', 'department']
        };
        
        const allowed = allowedCategories[userDepartment] || ['department'];
        
        // 허용되지 않은 옵션 비활성화
        Array.from(categorySelect.options).forEach(option => {
            if (option.value && !allowed.includes(option.value)) {
                option.disabled = true;
                option.style.color = '#ccc';
            }
        });
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 글자 수 카운터
    setupCharacterCounters();
    
    // 대상 설정 토글
    const targetRadios = document.querySelectorAll('input[name="target"]');
    targetRadios.forEach(radio => {
        radio.addEventListener('change', toggleDepartmentGrid);
    });
    
    // 폼 유효성 검사
    const form = document.getElementById('noticeForm');
    form.addEventListener('input', validateForm);
    
    // 카테고리 변경 시 유효성 검사
    document.getElementById('category').addEventListener('change', validateForm);
}

// 글자 수 카운터 설정
function setupCharacterCounters() {
    const titleInput = document.getElementById('title');
    const summaryInput = document.getElementById('summary');
    const contentInput = document.getElementById('content');
    
    titleInput.addEventListener('input', () => {
        updateCharacterCount('title', 'titleCount', 100);
    });
    
    summaryInput.addEventListener('input', () => {
        updateCharacterCount('summary', 'summaryCount', 200);
    });
    
    contentInput.addEventListener('input', () => {
        updateCharacterCount('content', 'contentCount');
    });
}

// 글자 수 업데이트
function updateCharacterCount(inputId, countId, maxLength = null) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    const length = input.value.length;
    
    if (maxLength) {
        counter.textContent = length;
        counter.parentElement.style.color = length > maxLength * 0.9 ? '#e53935' : '#666';
    } else {
        counter.textContent = length.toLocaleString();
    }
}

// 대상 설정 토글
function toggleDepartmentGrid() {
    const departmentTarget = document.getElementById('targetDepartment');
    const departmentGrid = document.getElementById('departmentGrid');
    
    if (departmentTarget.checked) {
        departmentGrid.style.display = 'grid';
    } else {
        departmentGrid.style.display = 'none';
        // 모든 학과 체크박스 해제
        departmentGrid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

// URL 파라미터 처리
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const noticeId = urlParams.get('id');
    
    if (action === 'edit' && noticeId) {
        // 편집 모드
        loadNoticeForEdit(noticeId);
        document.getElementById('headerTitle').textContent = '공지사항 수정';
        document.getElementById('publishBtn').innerHTML = '<span>✏️</span> 수정 완료';
    } else if (action === 'manage') {
        // 관리 모드
        switchTab('manage');
    }
}

// 공지사항 편집용 로드
function loadNoticeForEdit(noticeId) {
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    const notice = notices.find(n => n.id === noticeId);
    
    if (!notice) {
        showToast('편집할 공지사항을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 권한 확인
    if (notice.authorId !== currentUser && userRole !== USER_ROLES.ADMIN) {
        showToast('본인이 작성한 공지사항만 수정할 수 있습니다.', 'error');
        return;
    }
    
    // 폼에 데이터 채우기
    currentEditingId = noticeId;
    
    document.getElementById('category').value = notice.category;
    document.getElementById('publishDate').value = notice.date;
    document.getElementById('title').value = notice.title;
    document.getElementById('summary').value = notice.summary;
    document.getElementById('content').value = notice.content;
    document.getElementById('important').checked = notice.important || false;
    
    // 대상 설정
    if (notice.targetDepartments && notice.targetDepartments.length > 0) {
        document.getElementById('targetDepartment').checked = true;
        toggleDepartmentGrid();
        
        notice.targetDepartments.forEach(dept => {
            const checkbox = document.querySelector(`input[value="${dept}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // 글자 수 카운터 업데이트
    updateCharacterCount('title', 'titleCount', 100);
    updateCharacterCount('summary', 'summaryCount', 200);
    updateCharacterCount('content', 'contentCount');
    
    console.log('편집 모드로 공지사항 로드:', notice);
}

// 기본값 설정
function setDefaultValues() {
    // 오늘 날짜 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('publishDate').value = today;
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('currentTime').textContent = timeString;
}

// 자동 저장 설정
function setupAutoSave() {
    autoSaveInterval = setInterval(() => {
        if (isFormDirty()) {
            saveDraft(true); // 자동 저장임을 표시
        }
    }, 180000); // 3분마다
}

// 폼 변경 여부 확인
function isFormDirty() {
    const title = document.getElementById('title').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const content = document.getElementById('content').value.trim();
    
    return title.length > 0 || summary.length > 0 || content.length > 0;
}

// 폼 유효성 검사
function validateForm() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const content = document.getElementById('content').value.trim();
    
    const isValid = category && title && summary && content;
    
    // 버튼 활성화/비활성화
    document.getElementById('publishBtn').disabled = !isValid;
    
    return isValid;
}

// 탭 전환
function switchTab(tabName) {
    // 탭 버튼 상태 변경
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    if (tabName === 'write') {
        document.getElementById('writeTab').classList.add('active');
        document.getElementById('writeContent').classList.add('active');
        document.getElementById('headerTitle').textContent = currentEditingId ? '공지사항 수정' : '공지사항 작성';
    } else if (tabName === 'manage') {
        document.getElementById('manageTab').classList.add('active');
        document.getElementById('manageContent').classList.add('active');
        document.getElementById('headerTitle').textContent = '내 공지 관리';
        
        // 헤더 버튼 숨기기
        document.getElementById('draftBtn').style.display = 'none';
        document.getElementById('publishBtn').style.display = 'none';
        
        // 내 공지사항 로드
        loadMyNotices();
    }
}

// 공지사항 데이터 로드
function loadNoticesData() {
    const stored = localStorage.getItem('notices');
    if (stored) {
        allNotices = JSON.parse(stored);
    } else {
        allNotices = [];
    }
}

// 내 공지사항 로드
function loadMyNotices() {
    loadNoticesData();
    
    // 내가 작성한 공지사항만 필터링
    if (userRole === USER_ROLES.ADMIN) {
        myNotices = [...allNotices]; // 관리자는 모든 공지사항
    } else {
        myNotices = allNotices.filter(notice => notice.authorId === currentUser);
    }
    
    displayMyNotices();
    updateNoticeCountDisplay();
}

// 내 공지사항 표시
function displayMyNotices() {
    const container = document.getElementById('myNoticesList');
    
    if (myNotices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                <h3>작성한 공지사항이 없습니다</h3>
                <p>새로운 공지사항을 작성해보세요.</p>
                <button class="btn btn-primary" onclick="switchTab('write')" style="margin-top: 16px;">
                    <span>✏️</span> 새 공지 작성
                </button>
            </div>
        `;
        return;
    }
    
    const noticesHTML = myNotices.map(notice => createNoticeCardHTML(notice)).join('');
    container.innerHTML = noticesHTML;
}

// 공지사항 카드 HTML 생성
function createNoticeCardHTML(notice) {
    const categoryNames = {
        'academic': '📚 학사',
        'scholarship': '💰 장학',
        'job': '💼 취업',
        'event': '🎉 행사',
        'department': '🏢 학과'
    };
    
    const categoryName = categoryNames[notice.category] || notice.category;
    const isDraft = notice.status === 'draft';
    
    return `
        <div class="notice-card" onclick="viewNoticeDetail('${notice.id}')">
            <div class="notice-card-header">
                <div>
                    <span class="preview-badge ${notice.category}">${categoryName}</span>
                    ${isDraft ? '<span class="draft-indicator">임시저장</span>' : ''}
                    ${notice.important ? '<span class="preview-important">중요</span>' : ''}
                </div>
                <div class="notice-card-actions" onclick="event.stopPropagation()">
                    <button class="action-btn edit" onclick="editNotice('${notice.id}')">수정</button>
                    <button class="action-btn delete" onclick="deleteNotice('${notice.id}')">삭제</button>
                </div>
            </div>
            
            <div class="notice-card-title">${notice.title}</div>
            <div class="notice-card-meta">
                작성일: ${formatDate(notice.date)} | 조회수: ${(notice.views || 0).toLocaleString()}
            </div>
            
            <div style="font-size: 14px; color: #666; line-height: 1.4;">
                ${notice.summary}
            </div>
        </div>
    `;
}

// 내 공지사항 필터링
function filterMyNotices() {
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = [...myNotices];
    
    // 상태 필터
    if (statusFilter !== 'all') {
        filtered = filtered.filter(notice => {
            if (statusFilter === 'draft') {
                return notice.status === 'draft';
            } else if (statusFilter === 'published') {
                return notice.status !== 'draft';
            }
            return true;
        });
    }
    
    // 카테고리 필터
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(notice => notice.category === categoryFilter);
    }
    
    // 임시로 myNotices 교체하여 표시
    const originalMyNotices = [...myNotices];
    myNotices = filtered;
    displayMyNotices();
    updateNoticeCountDisplay();
    myNotices = originalMyNotices;
}

// 공지사항 개수 표시 업데이트
function updateNoticeCountDisplay() {
    const countDisplay = document.getElementById('noticeCountDisplay');
    countDisplay.textContent = `총 ${myNotices.length}건`;
}

// 임시저장
function saveDraft(isAutoSave = false) {
    if (!validateBasicInfo()) {
        if (!isAutoSave) {
            showToast('제목과 내용을 입력해주세요.', 'error');
        }
        return;
    }
    
    const noticeData = collectFormData();
    noticeData.status = 'draft';
    noticeData.updatedAt = new Date().toISOString();
    
    if (currentEditingId) {
        // 기존 공지사항 수정
        updateExistingNotice(currentEditingId, noticeData);
    } else {
        // 새 공지사항 저장
        saveNewNotice(noticeData);
    }
    
    if (isAutoSave) {
        showToast('자동 저장되었습니다.', 'info');
    } else {
        showToast('임시저장되었습니다.', 'success');
    }
    
    console.log('임시저장 완료:', noticeData);
}

// 기본 정보 유효성 검사
function validateBasicInfo() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    return title.length > 0 && content.length > 0;
}

// 공지사항 게시
function publishNotice() {
    if (!validateForm()) {
        showToast('모든 필수 항목을 입력해주세요.', 'error');
        return;
    }
    
    if (!confirm(currentEditingId ? '공지사항을 수정하시겠습니까?' : '공지사항을 게시하시겠습니까?')) {
        return;
    }
    
    const noticeData = collectFormData();
    noticeData.status = 'published';
    noticeData.updatedAt = new Date().toISOString();
    
    if (currentEditingId) {
        // 기존 공지사항 수정
        updateExistingNotice(currentEditingId, noticeData);
        showToast('공지사항이 수정되었습니다.', 'success');
    } else {
        // 새 공지사항 저장
        saveNewNotice(noticeData);
        showToast('공지사항이 게시되었습니다.', 'success');
    }
    
    // 폼 초기화 (새 작성인 경우)
    if (!currentEditingId) {
        resetForm();
    }
    
    console.log('공지사항 게시 완료:', noticeData);
    
    // 3초 후 공지사항 목록으로 이동
    setTimeout(() => {
        window.location.href = 'notices.html';
    }, 2000);
}

// 폼 데이터 수집
function collectFormData() {
    const category = document.getElementById('category').value;
    const publishDate = document.getElementById('publishDate').value;
    const title = document.getElementById('title').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const content = document.getElementById('content').value.trim();
    const important = document.getElementById('important').checked;
    
    // 대상 부서 수집
    let targetDepartments = [];
    const targetDepartment = document.getElementById('targetDepartment').checked;
    
    if (targetDepartment) {
        const checkboxes = document.querySelectorAll('#departmentGrid input[type="checkbox"]:checked');
        targetDepartments = Array.from(checkboxes).map(cb => cb.value);
    }
    
    // 작성자 정보
    const userName = localStorage.getItem(`user_${currentUser}_name`) || '관리자';
    const userDepartment = localStorage.getItem(`user_${currentUser}_department`) || '';
    
    return {
        id: currentEditingId || `notice_${Date.now()}`,
        title,
        summary,
        content,
        category,
        date: publishDate,
        author: userName,
        authorId: currentUser,
        authorRole: userRole,
        authorDepartment: userDepartment,
        important,
        targetDepartments,
        views: 0,
        createdAt: currentEditingId ? undefined : new Date().toISOString() // 수정 시에는 생성일 유지
    };
}

// 새 공지사항 저장
function saveNewNotice(noticeData) {
    loadNoticesData();
    
    // 새 공지사항을 배열 맨 앞에 추가
    allNotices.unshift(noticeData);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('notices', JSON.stringify(allNotices));
}

// 기존 공지사항 업데이트
function updateExistingNotice(noticeId, noticeData) {
    loadNoticesData();
    
    const index = allNotices.findIndex(notice => notice.id === noticeId);
    if (index !== -1) {
        // 기존 데이터 유지 (생성일, 조회수 등)
        const existingNotice = allNotices[index];
        noticeData.createdAt = existingNotice.createdAt;
        noticeData.views = existingNotice.views;
        
        allNotices[index] = noticeData;
        localStorage.setItem('notices', JSON.stringify(allNotices));
    }
}

// 폼 초기화
function resetForm() {
    document.getElementById('noticeForm').reset();
    
    // 기본값 재설정
    setDefaultValues();
    
    // 글자 수 카운터 초기화
    updateCharacterCount('title', 'titleCount', 100);
    updateCharacterCount('summary', 'summaryCount', 200);
    updateCharacterCount('content', 'contentCount');
    
    // 대상 설정 초기화
    document.getElementById('targetAll').checked = true;
    toggleDepartmentGrid();
    
    currentEditingId = null;
}

// 미리보기
function previewNotice() {
    if (!validateBasicInfo()) {
        showToast('제목과 내용을 입력해주세요.', 'error');
        return;
    }
    
    const noticeData = collectFormData();
    
    // 미리보기 HTML 생성
    const previewHTML = createPreviewHTML(noticeData);
    
    // 모달에 표시
    document.getElementById('previewContent').innerHTML = previewHTML;
    document.getElementById('previewModal').style.display = 'block';
}

// 미리보기 HTML 생성
function createPreviewHTML(notice) {
    const categoryNames = {
        'academic': '📚 학사',
        'scholarship': '💰 장학',
        'job': '💼 취업',
        'event': '🎉 행사',
        'department': '🏢 학과'
    };
    
    const categoryName = categoryNames[notice.category] || notice.category;
    
    return `
        <div class="preview-notice">
            <div class="preview-notice-header">
                <span class="preview-badge ${notice.category}">${categoryName}</span>
                <span class="preview-date">${formatDate(notice.date)}</span>
            </div>
            
            <div class="preview-title">
                ${notice.title}
                ${notice.important ? '<span class="preview-important">중요</span>' : ''}
            </div>
            
            <div class="preview-summary">${notice.summary}</div>
            
            <div class="preview-content-text">${notice.content}</div>
            
            <div class="preview-meta">
                <div>
                    <span>👤</span>
                    <span>${notice.author}</span>
                </div>
                <div>
                    <span>👁</span>
                    <span>0</span>
                </div>
            </div>
            
            ${notice.targetDepartments && notice.targetDepartments.length > 0 ? `
                <div style="margin-top: 12px; padding: 8px; background-color: #f0f8ff; border-radius: 6px; font-size: 12px;">
                    <strong>대상:</strong> ${getDepartmentNames(notice.targetDepartments).join(', ')}
                </div>
            ` : ''}
        </div>
    `;
}

// 부서명 배열 반환
function getDepartmentNames(departments) {
    const names = {
        'computerScience': '컴퓨터정보학과',
        'business': '경영학과',
        'nursing': '간호학과',
        'engineering': '공학계열',
        'arts': '예술계열'
    };
    
    return departments.map(dept => names[dept] || dept);
}

// 미리보기 닫기
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// 공지사항 수정
function editNotice(noticeId) {
    window.location.href = `admin-notices.html?action=edit&id=${noticeId}`;
}

// 공지사항 삭제
function deleteNotice(noticeId) {
    const notice = allNotices.find(n => n.id === noticeId);
    
    if (!notice) {
        showToast('삭제할 공지사항을 찾을 수 없습니다.', 'error');
        return;
    }
    
    if (!confirm(`정말로 이 공지사항을 삭제하시겠습니까?\n\n제목: ${notice.title}`)) {
        return;
    }
    
    // 권한 확인
    if (notice.authorId !== currentUser && userRole !== USER_ROLES.ADMIN) {
        showToast('본인이 작성한 공지사항만 삭제할 수 있습니다.', 'error');
        return;
    }
    
    // 삭제 실행
    loadNoticesData();
    allNotices = allNotices.filter(n => n.id !== noticeId);
    localStorage.setItem('notices', JSON.stringify(allNotices));
    
    // 목록 새로고침
    loadMyNotices();
    
    showToast('공지사항이 삭제되었습니다.', 'success');
    console.log('공지사항 삭제:', noticeId);
}

// 공지사항 상세보기
function viewNoticeDetail(noticeId) {
    // 상세 페이지로 이동하거나 모달로 표시
    window.open(`notices.html#${noticeId}`, '_blank');
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 애니메이션 표시
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 뒤로가기
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
    } else {
        window.location.href = 'notices.html';
    }
}

// 키보드 단축키
document.addEventListener('keydown', function(event) {
    // Ctrl+S로 임시저장
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveDraft();
    }
    
    // Ctrl+Enter로 게시
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        publishNotice();
    }
    
    // ESC로 미리보기 닫기
    if (event.key === 'Escape') {
        const modal = document.getElementById('previewModal');
        if (modal.style.display === 'block') {
            closePreview();
        }
    }
});

// 페이지 언로드 시 경고
window.addEventListener('beforeunload', function(event) {
    if (isFormDirty() && !currentEditingId) {
        event.preventDefault();
        event.returnValue = '작성 중인 내용이 있습니다. 정말 나가시겠습니까?';
        return '작성 중인 내용이 있습니다. 정말 나가시겠습니까?';
    }
});

// 임시저장된 초안 복구
function recoverDraft() {
    const draftKey = `draft_${currentUser}`;
    const saved = localStorage.getItem(draftKey);
    
    if (saved) {
        try {
            const draftData = JSON.parse(saved);
            
            if (confirm('이전에 작성 중이던 임시저장 내용이 있습니다. 복구하시겠습니까?')) {
                // 폼에 데이터 복구
                if (draftData.category) document.getElementById('category').value = draftData.category;
                if (draftData.title) document.getElementById('title').value = draftData.title;
                if (draftData.summary) document.getElementById('summary').value = draftData.summary;
                if (draftData.content) document.getElementById('content').value = draftData.content;
                if (draftData.important) document.getElementById('important').checked = draftData.important;
                
                // 글자 수 카운터 업데이트
                updateCharacterCount('title', 'titleCount', 100);
                updateCharacterCount('summary', 'summaryCount', 200);
                updateCharacterCount('content', 'contentCount');
                
                showToast('임시저장 내용을 복구했습니다.', 'success');
                
                // 복구 후 임시저장 데이터 삭제
                localStorage.removeItem(draftKey);
            }
        } catch (e) {
            console.error('임시저장 복구 오류:', e);
        }
    }
}

// 작성 중 내용 임시 저장 (페이지 벗어날 때)
function saveTemporaryDraft() {
    if (isFormDirty() && !currentEditingId) {
        const draftData = {
            category: document.getElementById('category').value,
            title: document.getElementById('title').value,
            summary: document.getElementById('summary').value,
            content: document.getElementById('content').value,
            important: document.getElementById('important').checked,
            timestamp: new Date().toISOString()
        };
        
        const draftKey = `draft_${currentUser}`;
        localStorage.setItem(draftKey, JSON.stringify(draftData));
    }
}

// 페이지 언로드 시 임시 저장
window.addEventListener('beforeunload', saveTemporaryDraft);

// 임시저장 목록 관리
function getDraftsList() {
    const drafts = allNotices.filter(notice => 
        notice.status === 'draft' && notice.authorId === currentUser
    );
    
    return drafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// 임시저장 목록 표시
function showDraftsList() {
    const drafts = getDraftsList();
    
    if (drafts.length === 0) {
        showToast('임시저장된 공지사항이 없습니다.', 'info');
        return;
    }
    
    let draftsList = '임시저장된 공지사항:\n\n';
    drafts.forEach((draft, index) => {
        draftsList += `${index + 1}. ${draft.title}\n`;
        draftsList += `   저장일: ${formatDate(draft.updatedAt.split('T')[0])}\n\n`;
    });
    
    alert(draftsList);
}

// 통계 정보 조회
function getMyNoticesStats() {
    const stats = {
        total: myNotices.length,
        published: myNotices.filter(n => n.status !== 'draft').length,
        drafts: myNotices.filter(n => n.status === 'draft').length,
        totalViews: myNotices.reduce((sum, n) => sum + (n.views || 0), 0),
        byCategory: {}
    };
    
    // 카테고리별 통계
    myNotices.forEach(notice => {
        stats.byCategory[notice.category] = (stats.byCategory[notice.category] || 0) + 1;
    });
    
    return stats;
}

// 통계 표시
function showStats() {
    const stats = getMyNoticesStats();
    
    const statsMessage = `
=== 내 공지사항 통계 ===

📊 전체: ${stats.total}건
📢 게시됨: ${stats.published}건
💾 임시저장: ${stats.drafts}건
👁 총 조회수: ${stats.totalViews.toLocaleString()}회

📚 카테고리별:
${Object.entries(stats.byCategory).map(([cat, count]) => {
    const categoryNames = {
        'academic': '학사',
        'scholarship': '장학',
        'job': '취업',
        'event': '행사',
        'department': '학과'
    };
    return `- ${categoryNames[cat] || cat}: ${count}건`;
}).join('\n')}
    `;
    
    alert(statsMessage);
}

// 일괄 작업 기능
function bulkDeleteDrafts() {
    const drafts = getDraftsList();
    
    if (drafts.length === 0) {
        showToast('임시저장된 공지사항이 없습니다.', 'info');
        return;
    }
    
    if (confirm(`임시저장된 공지사항 ${drafts.length}건을 모두 삭제하시겠습니까?`)) {
        // 임시저장 공지사항들 삭제
        loadNoticesData();
        allNotices = allNotices.filter(notice => 
            !(notice.status === 'draft' && notice.authorId === currentUser)
        );
        localStorage.setItem('notices', JSON.stringify(allNotices));
        
        // 목록 새로고침
        loadMyNotices();
        
        showToast(`임시저장 공지사항 ${drafts.length}건이 삭제되었습니다.`, 'success');
    }
}

// 공지사항 복제
function duplicateNotice(noticeId) {
    const notice = allNotices.find(n => n.id === noticeId);
    
    if (!notice) {
        showToast('복제할 공지사항을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 새 탭으로 전환하고 데이터 복사
    switchTab('write');
    
    document.getElementById('category').value = notice.category;
    document.getElementById('title').value = `[복사] ${notice.title}`;
    document.getElementById('summary').value = notice.summary;
    document.getElementById('content').value = notice.content;
    document.getElementById('important').checked = false; // 중요 공지는 복제 시 해제
    
    // 오늘 날짜로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('publishDate').value = today;
    
    // 글자 수 카운터 업데이트
    updateCharacterCount('title', 'titleCount', 100);
    updateCharacterCount('summary', 'summaryCount', 200);
    updateCharacterCount('content', 'contentCount');
    
    showToast('공지사항이 복제되었습니다. 내용을 수정한 후 게시하세요.', 'success');
}

// 내보내기 기능
function exportMyNotices() {
    if (myNotices.length === 0) {
        showToast('내보낼 공지사항이 없습니다.', 'info');
        return;
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        author: {
            id: currentUser,
            name: localStorage.getItem(`user_${currentUser}_name`) || '사용자',
            role: userRole
        },
        notices: myNotices
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_notices_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`공지사항 ${myNotices.length}건을 내보냈습니다.`, 'success');
}

// 검색 기능
function searchMyNotices(query) {
    if (!query.trim()) {
        loadMyNotices();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = myNotices.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm) ||
        notice.summary.toLowerCase().includes(searchTerm) ||
        notice.content.toLowerCase().includes(searchTerm)
    );
    
    // 임시로 목록 교체
    const originalMyNotices = [...myNotices];
    myNotices = filtered;
    displayMyNotices();
    updateNoticeCountDisplay();
    myNotices = originalMyNotices;
    
    console.log(`검색 결과: "${query}" - ${filtered.length}건`);
}

// 개발자 도구용 전역 함수
if (typeof window !== 'undefined') {
    window.adminNotices = {
        saveDraft,
        publishNotice,
        resetForm,
        getStats: getMyNoticesStats,
        showStats,
        exportData: exportMyNotices,
        bulkDeleteDrafts,
        getCurrentUser: () => currentUser,
        getCurrentRole: () => userRole,
        getAllNotices: () => allNotices,
        getMyNotices: () => myNotices
    };
    
    console.log('🔧 공지사항 관리자 도구가 window.adminNotices에 등록되었습니다.');
    console.log('사용 가능한 함수들:', Object.keys(window.adminNotices));
}

// 초기화 완료 후 임시저장 복구 확인
setTimeout(() => {
    if (!currentEditingId) {
        recoverDraft();
    }
}, 1000);

// 폼 변경 감지 (자동 저장용)
let formChangeTimeout;
function handleFormChange() {
    clearTimeout(formChangeTimeout);
    formChangeTimeout = setTimeout(() => {
        if (isFormDirty()) {
            // 폼이 변경된 상태 표시 (선택사항)
            document.title = '* ' + document.title.replace(/^\* /, '');
        }
    }, 1000);
}

// 모든 입력 필드에 변경 감지 추가
document.addEventListener('input', handleFormChange);
document.addEventListener('change', handleFormChange);

// 권한별 메뉴 표시
function updateMenuByRole() {
    // 관리자만 볼 수 있는 기능들
    if (userRole === USER_ROLES.ADMIN) {
        // 전체 공지사항 통계 버튼 추가 등
        console.log('관리자 권한으로 추가 메뉴 활성화');
    }
    
    // 교수는 학과 공지사항만 작성 가능하다는 안내
    if (userRole === USER_ROLES.PROFESSOR) {
        const categorySelect = document.getElementById('category');
        const helpText = document.createElement('div');
        helpText.style.fontSize = '12px';
        helpText.style.color = '#666';
        helpText.style.marginTop = '4px';
        helpText.textContent = '교수님은 학사 및 학과 공지사항만 작성할 수 있습니다.';
        categorySelect.parentNode.appendChild(helpText);
    }
}

// 에러 처리
window.addEventListener('error', function(event) {
    console.error('JavaScript 오류:', event.error);
    showToast('오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
});

// 완료 로그
console.log('✅ 관리자 공지사항 시스템 초기화 완료');
console.log('- 현재 사용자:', currentUser);
console.log('- 현재 권한:', userRole);
console.log('- 편집 모드:', !!currentEditingId);
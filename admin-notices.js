// 사용자 역할 및 권한 정의
const USER_ROLES = {
    STUDENT: 'student',
    PROFESSOR: 'professor',
    STAFF: 'staff',
    ADMIN: 'admin'
};

const ROLE_PERMISSIONS = {
    [USER_ROLES.PROFESSOR]: {
        categories: ['학과'],
        canManage: 'own',
        needsApproval: true
    },
    [USER_ROLES.STAFF]: {
        categories: ['학사', '장학', '취업', '행사', '학과'],
        canManage: 'all',
        needsApproval: false
    },
    [USER_ROLES.ADMIN]: {
        categories: ['학사', '장학', '취업', '행사', '학과'],
        canManage: 'all',
        needsApproval: false
    }
};

// 학과 목록
const DEPARTMENTS = [
    '전자공학과', '정보통신과', '전기과', '컴퓨터소프트웨어과',
    '건축과', '실내건축과', '패션디자인비즈니스과',
    '게임콘텐츠과', '웹툰만화콘텐츠과', '시각디자인과',
    '유통물류과', '경영학과', '세무회계과',
    '치위생과', '치기공과', '작업치료과', '응급구조과',
    '항공서비스과', '관광영어과', '호텔관광과'
];

// 전역 변수
let currentUser = null;
let userRole = null;
let userDepartment = null;
let currentEditingNotice = null;

// 페이지 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('공지사항 관리 페이지 초기화 시작');
    
    // 권한 확인
    if (!checkPermissions()) {
        return;
    }
    
    // UI 초기화
    initializeUI();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 기본 탭 로드
    switchTab('write');
    
    console.log('공지사항 관리 페이지 초기화 완료');
});

// 권한 확인
function checkPermissions() {
    currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = 'login.html';
        return false;
    }
    
    userRole = localStorage.getItem(`user_${currentUser}_role`) || 'student';
    userDepartment = localStorage.getItem(`user_${currentUser}_department`);
    
    // 학생은 접근 불가
    if (userRole === USER_ROLES.STUDENT) {
        alert('공지사항 작성 권한이 없습니다.');
        window.location.href = 'notices.html';
        return false;
    }
    
    // 교수의 경우 학과 정보 필요
    if (userRole === USER_ROLES.PROFESSOR && !userDepartment) {
        alert('학과 정보가 필요합니다. 프로필을 확인해주세요.');
        window.location.href = 'profile-edit.html';
        return false;
    }
    
    return true;
}

// UI 초기화
function initializeUI() {
    // 사용자 역할 표시
    const roleText = getRoleDisplayName(userRole);
    document.getElementById('userRole').textContent = roleText;
    
    // 권한 안내 텍스트 설정
    updatePermissionNotice();
    
    // 카테고리 옵션 설정
    setupCategoryOptions();
    
    // 대상 학과 옵션 설정
    setupTargetAudienceOptions();
    
    // 오늘 날짜로 게시일 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('publishDate').value = today;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 폼 제출 이벤트
    document.getElementById('noticeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitNotice();
    });
    
    // 글자 수 카운트
    document.getElementById('title').addEventListener('input', function() {
        updateCharCount('title', 'title-count', 100);
    });
    
    document.getElementById('summary').addEventListener('input', function() {
        updateCharCount('summary', 'summary-count', 200);
    });
    
    // 모달 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
}

// 역할 표시명 반환
function getRoleDisplayName(role) {
    const roleNames = {
        [USER_ROLES.PROFESSOR]: '교수',
        [USER_ROLES.STAFF]: '교직원',
        [USER_ROLES.ADMIN]: '관리자'
    };
    return roleNames[role] || '사용자';
}

// 권한 안내 업데이트
function updatePermissionNotice() {
    const permissionText = document.getElementById('permission-text');
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) return;
    
    let text = '';
    if (userRole === USER_ROLES.PROFESSOR) {
        text = `교수 권한으로 학과 공지사항을 작성할 수 있습니다. (${getDepartmentDisplayName(userDepartment)})`;
    } else if (userRole === USER_ROLES.STAFF) {
        text = '교직원 권한으로 모든 카테고리의 공지사항을 작성할 수 있습니다.';
    } else if (userRole === USER_ROLES.ADMIN) {
        text = '관리자 권한으로 모든 카테고리의 공지사항을 작성하고 관리할 수 있습니다.';
    }
    
    permissionText.textContent = text;
}

// 카테고리 옵션 설정
function setupCategoryOptions() {
    const categorySelect = document.getElementById('category');
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) return;
    
    // 기존 옵션 제거 (첫 번째 옵션 제외)
    while (categorySelect.children.length > 1) {
        categorySelect.removeChild(categorySelect.lastChild);
    }
    
    // 권한에 따른 카테고리 추가
    permissions.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// 대상 학과 옵션 설정
function setupTargetAudienceOptions() {
    const audienceSelect = document.getElementById('targetAudience');
    
    // 기존 옵션 제거 (첫 번째 옵션 제외)
    while (audienceSelect.children.length > 1) {
        audienceSelect.removeChild(audienceSelect.lastChild);
    }
    
    // 교수는 자신의 학과만 선택 가능
    if (userRole === USER_ROLES.PROFESSOR) {
        const option = document.createElement('option');
        option.value = getDepartmentDisplayName(userDepartment);
        option.textContent = getDepartmentDisplayName(userDepartment);
        audienceSelect.appendChild(option);
        audienceSelect.value = getDepartmentDisplayName(userDepartment);
        audienceSelect.disabled = true;
    } else {
        // 교직원/관리자는 모든 학과 선택 가능
        DEPARTMENTS.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            audienceSelect.appendChild(option);
        });
    }
}

// 학과 코드를 표시명으로 변환
function getDepartmentDisplayName(deptCode) {
    const deptMap = {
        'computerScience': '컴퓨터소프트웨어과',
        'business': '경영학과',
        'nursing': '간호학과',
        'engineering': '공학계열',
        'arts': '예술계열'
    };
    return deptMap[deptCode] || deptCode;
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 관리 탭으로 전환 시 목록 로드
    if (tabName === 'manage') {
        loadManageList();
    }
}

// 글자 수 카운트 업데이트
function updateCharCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    const currentLength = input.value.length;
    
    counter.textContent = currentLength;
    
    // 글자 수 초과 시 색상 변경
    if (currentLength > maxLength) {
        counter.style.color = '#dc3545';
        input.style.borderColor = '#dc3545';
    } else {
        counter.style.color = '#888';
        input.style.borderColor = '#ddd';
    }
}

// 임시저장
function saveDraft() {
    const formData = getFormData();
    
    if (!formData.title.trim()) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    // 임시저장 ID 생성
    const draftId = currentEditingNotice || `draft_${Date.now()}`;
    
    // 임시저장 데이터 구성
    const draftData = {
        ...formData,
        id: draftId,
        status: 'draft',
        authorId: currentUser,
        authorRole: userRole,
        authorDepartment: userDepartment,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`notice_${draftId}`, JSON.stringify(draftData));
    
    alert('임시저장되었습니다.');
    
    // 관리 목록 새로고침
    if (document.getElementById('manage-tab').classList.contains('active')) {
        loadManageList();
    }
}

// 미리보기
function previewNotice() {
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    // 미리보기 콘텐츠 생성
    const previewContent = generatePreviewContent(formData);
    document.getElementById('preview-content').innerHTML = previewContent;
    
    // 모달 표시
    document.getElementById('preview-modal').classList.add('show');
}

// 공지사항 게시
function submitNotice() {
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    // 게시 확인
    const confirmMessage = ROLE_PERMISSIONS[userRole].needsApproval 
        ? '공지사항을 작성하시겠습니까? (승인 후 게시됩니다)'
        : '공지사항을 게시하시겠습니까?';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // 공지사항 ID 생성
    const noticeId = currentEditingNotice || `notice_${Date.now()}`;
    
    // 공지사항 데이터 구성
    const noticeData = {
        ...formData,
        id: noticeId,
        status: ROLE_PERMISSIONS[userRole].needsApproval ? 'pending' : 'published',
        authorId: currentUser,
        authorRole: userRole,
        authorDepartment: userDepartment,
        authorName: localStorage.getItem(`user_${currentUser}_name`) || '작성자',
        createdDate: new Date().toISOString(),
        publishedDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : new Date().toISOString(),
        views: 0,
        isNew: true
    };
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`notice_${noticeId}`, JSON.stringify(noticeData));
    
    // 기존 notices.js의 noticesData에도 추가
    addToNoticesData(noticeData);
    
    // 임시저장 데이터가 있으면 삭제
    if (currentEditingNotice && currentEditingNotice.startsWith('draft_')) {
        localStorage.removeItem(`notice_${currentEditingNotice}`);
    }
    
    // 성공 메시지
    const successMessage = ROLE_PERMISSIONS[userRole].needsApproval 
        ? '공지사항이 작성되었습니다. 승인 후 게시됩니다.'
        : '공지사항이 게시되었습니다.';
    
    alert(successMessage);
    
    // 폼 초기화
    resetForm();
    
    // 미리보기 모달 닫기
    closePreview();
    
    // 관리 탭으로 전환
    switchTab('manage');
}

// 폼 데이터 가져오기
function getFormData() {
    return {
        title: document.getElementById('title').value.trim(),
        summary: document.getElementById('summary').value.trim(),
        content: document.getElementById('content').value.trim(),
        category: document.getElementById('category').value,
        importance: document.querySelector('input[name="importance"]:checked').value,
        targetAudience: document.getElementById('targetAudience').value,
        publishDate: document.getElementById('publishDate').value,
        expireDate: document.getElementById('expireDate').value
    };
}

// 폼 유효성 검사
function validateForm(formData) {
    if (!formData.title) {
        alert('제목을 입력해주세요.');
        document.getElementById('title').focus();
        return false;
    }
    
    if (!formData.content) {
        alert('내용을 입력해주세요.');
        document.getElementById('content').focus();
        return false;
    }
    
    if (!formData.category) {
        alert('카테고리를 선택해주세요.');
        document.getElementById('category').focus();
        return false;
    }
    
    if (formData.title.length > 100) {
        alert('제목은 100자 이내로 입력해주세요.');
        document.getElementById('title').focus();
        return false;
    }
    
    if (formData.summary.length > 200) {
        alert('요약은 200자 이내로 입력해주세요.');
        document.getElementById('summary').focus();
        return false;
    }
    
    return true;
}

// 미리보기 콘텐츠 생성
function generatePreviewContent(formData) {
    const importanceText = formData.importance === 'important' ? '중요' : 
                          formData.importance === 'urgent' ? '긴급' : '일반';
    
    return `
        <h4>${formData.title}</h4>
        <div class="preview-meta">
            <span class="preview-category">${formData.category}</span>
            <span>중요도: ${importanceText}</span>
            <span>대상: ${formData.targetAudience}</span>
            <span>작성자: ${localStorage.getItem(`user_${currentUser}_name`) || '작성자'}</span>
        </div>
        ${formData.summary ? `<p><strong>요약:</strong> ${formData.summary}</p>` : ''}
        <div class="preview-body">${formData.content}</div>
    `;
}

// 기존 공지사항 데이터에 추가
function addToNoticesData(noticeData) {
    try {
        // notices.js의 데이터 형식에 맞게 변환
        const noticeForDisplay = {
            id: noticeData.id,
            category: noticeData.category,
            title: noticeData.title,
            summary: noticeData.summary || noticeData.content.substring(0, 100) + '...',
            content: noticeData.content,
            date: new Date(noticeData.publishedDate).toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1),
            author: noticeData.authorName,
            views: 0,
            important: noticeData.importance !== 'normal',
            isNew: true
        };
        
        // 기존 공지사항 목록 가져오기
        let existingNotices = JSON.parse(localStorage.getItem('allNotices') || '[]');
        
        // 새 공지사항 추가 (맨 앞에)
        existingNotices.unshift(noticeForDisplay);
        
        // 다시 저장
        localStorage.setItem('allNotices', JSON.stringify(existingNotices));
        
        console.log('공지사항이 목록에 추가되었습니다:', noticeForDisplay);
    } catch (error) {
        console.error('공지사항 데이터 추가 중 오류:', error);
    }
}

// 관리 목록 로드
function loadManageList() {
    const manageList = document.getElementById('manage-list');
    const emptyState = document.getElementById('empty-state');
    
    // 로딩 표시
    manageList.innerHTML = `
        <div class="loading-indicator">
            <div class="loading-spinner"></div>
            <p>공지사항을 불러오는 중...</p>
        </div>
    `;
    
    setTimeout(() => {
        const myNotices = getMyNotices();
        
        if (myNotices.length === 0) {
            manageList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            manageList.style.display = 'block';
            emptyState.style.display = 'none';
            renderManageList(myNotices);
        }
    }, 500);
}

// 내 공지사항 가져오기
function getMyNotices() {
    const allNotices = [];
    
    // 로컬 스토리지에서 내가 작성한 공지사항 찾기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('notice_')) {
            try {
                const notice = JSON.parse(localStorage.getItem(key));
                if (notice.authorId === currentUser) {
                    allNotices.push(notice);
                }
            } catch (error) {
                console.error('공지사항 데이터 파싱 오류:', error);
            }
        }
    }
    
    // 최신순 정렬
    return allNotices.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
}

// 관리 목록 렌더링
function renderManageList(notices) {
    const statusFilter = document.getElementById('statusFilter').value;
    
    // 필터링
    const filteredNotices = notices.filter(notice => {
        if (statusFilter === 'all') return true;
        return notice.status === statusFilter;
    });
    
    const manageList = document.getElementById('manage-list');
    
    if (filteredNotices.length === 0) {
        manageList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>해당하는 공지사항이 없습니다</h3>
                <p>다른 필터를 선택해보세요.</p>
            </div>
        `;
        return;
    }
    
    const listHTML = filteredNotices.map(notice => `
        <div class="manage-item">
            <div class="manage-item-header">
                <div>
                    <div class="manage-item-title">${notice.title}</div>
                    <div class="manage-item-meta">
                        <span>카테고리: ${notice.category}</span>
                        <span>작성일: ${new Date(notice.createdDate).toLocaleDateString('ko-KR')}</span>
                        <span>조회수: ${notice.views || 0}</span>
                    </div>
                </div>
                <span class="status-badge status-${notice.status}">
                    ${getStatusText(notice.status)}
                </span>
            </div>
            <div class="manage-item-summary">
                ${notice.summary || notice.content.substring(0, 100) + '...'}
            </div>
            <div class="manage-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editNotice('${notice.id}')">수정</button>
                <button class="btn btn-small btn-secondary" onclick="viewNotice('${notice.id}')">미리보기</button>
                <button class="btn btn-small btn-danger" onclick="deleteNotice('${notice.id}')">삭제</button>
            </div>
        </div>
    `).join('');
    
    manageList.innerHTML = listHTML;
}

// 상태 텍스트 반환
function getStatusText(status) {
    const statusMap = {
        'published': '게시중',
        'draft': '임시저장',
        'pending': '승인대기',
        'expired': '만료됨'
    };
    return statusMap[status] || status;
}

// 공지사항 수정
function editNotice(noticeId) {
    const notice = JSON.parse(localStorage.getItem(`notice_${noticeId}`));
    if (!notice) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    // 작성 탭으로 전환
    switchTab('write');
    
    // 폼에 데이터 채우기
    document.getElementById('title').value = notice.title;
    document.getElementById('summary').value = notice.summary || '';
    document.getElementById('content').value = notice.content;
    document.getElementById('category').value = notice.category;
    document.getElementById('targetAudience').value = notice.targetAudience;
    document.getElementById('publishDate').value = notice.publishDate ? notice.publishDate.split('T')[0] : '';
    document.getElementById('expireDate').value = notice.expireDate ? notice.expireDate.split('T')[0] : '';
    
    // 중요도 설정
    document.querySelector(`input[name="importance"][value="${notice.importance}"]`).checked = true;
    
    // 현재 편집 중인 공지사항 ID 저장
    currentEditingNotice = noticeId;
    
    // 글자 수 업데이트
    updateCharCount('title', 'title-count', 100);
    updateCharCount('summary', 'summary-count', 200);
    
    // 스크롤을 맨 위로
    window.scrollTo(0, 0);
}

// 공지사항 보기
function viewNotice(noticeId) {
    const notice = JSON.parse(localStorage.getItem(`notice_${noticeId}`));
    if (!notice) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    // 미리보기 콘텐츠 생성
    const previewContent = generatePreviewContent(notice);
    document.getElementById('preview-content').innerHTML = previewContent;
    
    // 미리보기 모달의 게시하기 버튼 숨기기
    const modal = document.getElementById('preview-modal');
    const publishBtn = modal.querySelector('.modal-footer .btn-primary');
    publishBtn.style.display = 'none';
    
    // 모달 표시
    modal.classList.add('show');
}

// 공지사항 삭제
function deleteNotice(noticeId) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }
    
    // 로컬 스토리지에서 삭제
    localStorage.removeItem(`notice_${noticeId}`);
    
    // 공지사항 목록에서도 제거
    try {
        let allNotices = JSON.parse(localStorage.getItem('allNotices') || '[]');
        allNotices = allNotices.filter(notice => notice.id !== noticeId);
        localStorage.setItem('allNotices', JSON.stringify(allNotices));
    } catch (error) {
        console.error('공지사항 목록 업데이트 오류:', error);
    }
    
    alert('삭제되었습니다.');
    
    // 목록 새로고침
    loadManageList();
}

// 필터링
function filterNotices() {
    if (document.getElementById('manage-tab').classList.contains('active')) {
        loadManageList();
    }
}

// 관리 목록 새로고침
function refreshManageList() {
    loadManageList();
}

// 폼 초기화
function resetForm() {
    document.getElementById('noticeForm').reset();
    document.getElementById('title-count').textContent = '0';
    document.getElementById('summary-count').textContent = '0';
    document.querySelector('input[name="importance"][value="normal"]').checked = true;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('publishDate').value = today;
    
    currentEditingNotice = null;
}

// 미리보기 닫기
function closePreview() {
    const modal = document.getElementById('preview-modal');
    modal.classList.remove('show');
    
    // 게시하기 버튼 다시 표시
    const publishBtn = modal.querySelector('.modal-footer .btn-primary');
    publishBtn.style.display = 'inline-flex';
}

// 편집 모달 닫기
function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('show');
}

// 모든 모달 닫기
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// 뒤로가기
function goBack() {
    if (document.referrer && document.referrer !== window.location.href) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}
// =============================================================================
// account-edit.js
// "내 계정" 페이지 전용 스크립트
// 이 스크립트는 index.js가 account-edit.html을 fetch하여
// <div id="profileContentPane">에 삽입한 뒤 실행됩니다.
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 현재 로그인된 사용자 확인
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다.', 'error');
    showContent('home');
    return;
  }

  // DOM 요소 가져오기
  const nameInput = document.getElementById('accountName');
  const departmentInput = document.getElementById('accountDepartment');
  const saveBtn = document.getElementById('saveAccountBtn');
  const cancelBtn = document.getElementById('cancelAccountBtn');

  // 원본 데이터 저장용 변수
  let originalData = {
    name: '',
    department: ''
  };

  // 사용자 정보 로드
  loadUserData();

  // 저장 버튼 이벤트
  saveBtn.addEventListener('click', handleSaveAccount);

  // 취소 버튼 이벤트
  cancelBtn.addEventListener('click', handleCancelEdit);

  /**
   * 사용자 정보를 API에서 불러오기
   */
  function loadUserData() {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('사용자 정보를 불러올 수 없습니다.');
        }
        return response.json();
      })
      .then(user => {
        // 입력 필드에 데이터 설정
        nameInput.value = user.name || '';
        departmentInput.value = user.departmentName || '';
        
        // 원본 데이터 저장
        originalData = {
          name: user.name || '',
          department: user.departmentName || ''
        };
      })
      .catch(error => {
        console.error('사용자 정보 로드 실패:', error);
        showMessage('사용자 정보를 불러올 수 없습니다.', 'error');
      });
  }

  /**
   * 계정 정보 저장
   */
  function handleSaveAccount() {
    const name = nameInput.value.trim();
    const department = departmentInput.value.trim();

    // 유효성 검사
    if (!name) {
      showMessage('이름을 입력해주세요.', 'error');
      nameInput.focus();
      return;
    }

    if (!department) {
      showMessage('학과를 입력해주세요.', 'error');
      departmentInput.focus();
      return;
    }

    // 변경사항 확인
    if (name === originalData.name && department === originalData.department) {
      showMessage('변경된 내용이 없습니다.', 'info');
      return;
    }

    // 저장 요청
    const updateData = {
      name: name,
      department: department
    };

    fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('계정 정보 저장에 실패했습니다.');
      }
      return response.json();
    })
    .then(() => {
      showMessage('계정 정보가 성공적으로 저장되었습니다.', 'success');
      // 프로필 페이지로 이동
      showContent('profile');
      // 사용자 상태 업데이트
      if (typeof checkUserStatus === 'function') {
        checkUserStatus();
      }
    })
    .catch(error => {
      console.error('계정 업데이트 오류:', error);
      showMessage(error.message || '계정 정보 저장에 실패했습니다.', 'error');
    });
  }

  /**
   * 수정 취소
   */
  function handleCancelEdit() {
    // 변경사항이 있는지 확인
    const hasChanges = 
      nameInput.value.trim() !== originalData.name ||
      departmentInput.value.trim() !== originalData.department;

    if (hasChanges) {
      if (confirm('변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
        showContent('profile');
      }
    } else {
      showContent('profile');
    }
  }
});

// =============================================================================
// 전역 함수들 (index.js에서 정의됨)
// =============================================================================
// - showContent(type): 화면 전환
// - showMessage(message, type): 알림 메시지
// - checkUserStatus(): 로그인 상태 업데이트
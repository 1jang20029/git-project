// =============================================================================
// account-edit.js
// "내 계정" 페이지 전용 스크립트 (비밀번호 변경 기능 제거 버전)
// 이 스크립트는 index.js가 account-edit.html을 fetch하여
// <div id="profileContentPane">에 삽입한 뒤 실행됩니다.
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1) 현재 로그인된 사용자 ID 가져오기
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    // 로그인 상태가 아니면 홈으로 이동
    if (typeof showMessage === 'function') {
      showMessage('로그인이 필요합니다.', 'error');
    }
    if (typeof showContent === 'function') {
      showContent('home');
    }
    return;
  }

  // 2) DOM 요소 선택 (요소가 존재하는지 확인)
  const nameInput       = document.getElementById('accountName');
  const departmentInput = document.getElementById('accountDepartment');
  const emailInput      = document.getElementById('accountEmail');
  const saveBtn         = document.getElementById('saveAccountBtn');
  const cancelBtn       = document.getElementById('cancelAccountBtn');

  // 필수 요소들이 존재하는지 확인
  if (!nameInput || !departmentInput || !emailInput || !saveBtn || !cancelBtn) {
    console.error('필수 DOM 요소를 찾을 수 없습니다.');
    return;
  }

  // 3) API에서 사용자 정보 불러와서 입력란 채우기
  loadUserData();

  // 4) 이벤트 리스너 등록
  setupEventListeners();

  // ===================================================================
  // 사용자 데이터 로드 함수
  // ===================================================================
  function loadUserData() {
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then((res) => {
        if (!res.ok) throw new Error('API 응답 오류');
        return res.json();
      })
      .then((user) => {
        // 입력란에 데이터 채우기
        nameInput.value       = user.name || '';
        departmentInput.value = user.departmentName || '';
        emailInput.value      = user.email || '';
      })
      .catch((err) => {
        console.error('사용자 정보 로드 실패:', err);
        if (typeof showMessage === 'function') {
          showMessage('사용자 정보를 불러올 수 없습니다.', 'error');
        }
      });
  }

  // ===================================================================
  // 이벤트 리스너 설정
  // ===================================================================
  function setupEventListeners() {
    // "저장" 버튼 클릭 이벤트
    saveBtn.addEventListener('click', handleSave);
    
    // "취소" 버튼 클릭 이벤트
    cancelBtn.addEventListener('click', handleCancel);
    
    // Enter 키 처리 (저장)
    [nameInput, departmentInput, emailInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSave();
        }
      });
    });
    
    // ESC 키 처리 (취소)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    });
  }

  // ===================================================================
  // 저장 처리 함수
  // ===================================================================
  function handleSave() {
    const updatedData = {
      name:       nameInput.value.trim(),
      department: departmentInput.value.trim(),
      email:      emailInput.value.trim()
    };

    // 입력 유효성 검사
    if (!updatedData.name) {
      if (typeof showMessage === 'function') {
        showMessage('이름을 입력하세요.', 'error');
      }
      nameInput.focus();
      return;
    }
    if (!updatedData.department) {
      if (typeof showMessage === 'function') {
        showMessage('학과를 입력하세요.', 'error');
      }
      departmentInput.focus();
      return;
    }
    if (!updatedData.email) {
      if (typeof showMessage === 'function') {
        showMessage('이메일을 입력하세요.', 'error');
      }
      emailInput.focus();
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedData.email)) {
      if (typeof showMessage === 'function') {
        showMessage('올바른 이메일 형식을 입력하세요.', 'error');
      }
      emailInput.focus();
      return;
    }

    // 저장 중 상태로 변경
    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';

    // 사용자 기본 정보 업데이트 (이름/학과/이메일)
    fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updatedData)
    })
      .then((res) => {
        if (!res.ok) throw new Error('기본 정보 업데이트 실패');
        return res.json();
      })
      .then(() => {
        if (typeof showMessage === 'function') {
          showMessage('계정 정보가 저장되었습니다.', 'success');
        }
        
        // 저장 완료 후 프로필 화면으로 이동
        if (typeof showContent === 'function') {
          showContent('profile');
        }
        // index.js의 사용자 정보 업데이트 함수 호출
        if (typeof checkUserStatus === 'function') {
          checkUserStatus();
        }
      })
      .catch((err) => {
        console.error('계정 업데이트 오류:', err);
        if (typeof showMessage === 'function') {
          showMessage(err.message || '계정 정보를 저장하는 데 실패했습니다.', 'error');
        }
      })
      .finally(() => {
        // 저장 상태 해제
        saveBtn.disabled = false;
        saveBtn.textContent = '저장';
      });
  }

  // ===================================================================
  // 취소 처리 함수
  // ===================================================================
  function handleCancel() {
    if (typeof showContent === 'function') {
      showContent('profile');
    }
  }
});

// ===================================================================
// 전역 함수 (index.js에서 정의됨):
// - showContent(type): SPA처럼 화면 전환 처리
// - showMessage(message, type): 우측 상단 슬라이드 알림 메시지 표시
// - checkUserStatus(): 로그인 상태 UI 갱신
// ===================================================================
// =============================================================================
// account-edit.js (FOUC 방지 버전)
// "내 계정" 페이지 전용 스크립트 (비밀번호 변경 기능 제거 버전)
// 이 스크립트는 index.js가 account-edit.html을 fetch하여
// <div id="profileContentPane">에 삽입한 뒤 실행됩니다.
// =============================================================================

// FOUC 방지를 위한 즉시 실행 함수
(function() {
  // CSS 로드 확인 및 페이지 표시
  function showPageWhenReady() {
    // CSS 파일이 로드되었는지 확인
    const cssLoaded = Array.from(document.styleSheets).some(sheet => {
      try {
        return sheet.href && sheet.href.includes('account-edit.css');
      } catch (e) {
        return false;
      }
    });
    
    if (cssLoaded || document.styleSheets.length > 0) {
      document.body.classList.add('loaded');
    } else {
      // CSS가 아직 로드되지 않았다면 잠시 후 다시 확인
      setTimeout(showPageWhenReady, 10);
    }
  }
  
  // DOM이 준비되자마자 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showPageWhenReady);
  } else {
    showPageWhenReady();
  }
})();

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
    // 로딩 상태 표시
    setLoadingState(true);

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
        
        // 로딩 상태 해제
        setLoadingState(false);
      })
      .catch((err) => {
        console.error('사용자 정보 로드 실패:', err);
        setLoadingState(false);
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

    // 입력 필드 실시간 유효성 검사
    nameInput.addEventListener('input', validateName);
    departmentInput.addEventListener('input', validateDepartment);
    emailInput.addEventListener('input', validateEmail);
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
    if (!validateAllInputs(updatedData)) {
      return;
    }

    // 저장 중 상태로 변경
    setSavingState(true);

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
        setSavingState(false);
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
        setSavingState(false);
        if (typeof showMessage === 'function') {
          showMessage(err.message || '계정 정보를 저장하는 데 실패했습니다.', 'error');
        }
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

  // ===================================================================
  // 유효성 검사 함수들
  // ===================================================================
  function validateName() {
    const name = nameInput.value.trim();
    if (name.length === 0) {
      setFieldError(nameInput, '이름을 입력하세요.');
      return false;
    } else if (name.length < 2) {
      setFieldError(nameInput, '이름은 2자 이상 입력하세요.');
      return false;
    } else {
      clearFieldError(nameInput);
      return true;
    }
  }

  function validateDepartment() {
    const department = departmentInput.value.trim();
    if (department.length === 0) {
      setFieldError(departmentInput, '학과를 입력하세요.');
      return false;
    } else {
      clearFieldError(departmentInput);
      return true;
    }
  }

  function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length === 0) {
      setFieldError(emailInput, '이메일을 입력하세요.');
      return false;
    } else if (!emailRegex.test(email)) {
      setFieldError(emailInput, '올바른 이메일 형식을 입력하세요.');
      return false;
    } else {
      clearFieldError(emailInput);
      return true;
    }
  }

  function validateAllInputs(data) {
    const nameValid = validateName();
    const departmentValid = validateDepartment();
    const emailValid = validateEmail();
    
    if (!nameValid) {
      nameInput.focus();
      if (typeof showMessage === 'function') {
        showMessage('이름을 올바르게 입력하세요.', 'error');
      }
      return false;
    }
    if (!departmentValid) {
      departmentInput.focus();
      if (typeof showMessage === 'function') {
        showMessage('학과를 입력하세요.', 'error');
      }
      return false;
    }
    if (!emailValid) {
      emailInput.focus();
      if (typeof showMessage === 'function') {
        showMessage('올바른 이메일을 입력하세요.', 'error');
      }
      return false;
    }
    
    return true;
  }

  // ===================================================================
  // UI 상태 관리 함수들
  // ===================================================================
  function setLoadingState(loading) {
    const inputs = [nameInput, departmentInput, emailInput];
    const buttons = [saveBtn, cancelBtn];
    
    if (loading) {
      inputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.7';
      });
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
      });
    } else {
      inputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
      });
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
      });
    }
  }

  function setSavingState(saving) {
    if (saving) {
      saveBtn.disabled = true;
      saveBtn.textContent = '저장 중...';
      saveBtn.style.opacity = '0.7';
      cancelBtn.disabled = true;
    } else {
      saveBtn.disabled = false;
      saveBtn.textContent = '저장';
      saveBtn.style.opacity = '1';
      cancelBtn.disabled = false;
    }
  }

  function setFieldError(field, message) {
    // 기존 에러 메시지 제거
    clearFieldError(field);
    
    // 필드에 에러 스타일 적용
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    
    // 에러 메시지 요소 생성 및 추가
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      margin-left: 1rem;
    `;
    
    const formItem = field.closest('.form-item');
    if (formItem) {
      formItem.appendChild(errorElement);
    }
  }

  function clearFieldError(field) {
    // 필드 스타일 초기화
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    // 에러 메시지 제거
    const formItem = field.closest('.form-item');
    if (formItem) {
      const errorMessage = formItem.querySelector('.field-error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    }
  }
});

// ===================================================================
// 전역 함수 (index.js에서 정의됨):
// - showContent(type): SPA처럼 화면 전환 처리
// - showMessage(message, type): 우측 상단 슬라이드 알림 메시지 표시
// - checkUserStatus(): 로그인 상태 UI 갱신
// ===================================================================
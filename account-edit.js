// account-edit.js
// "내 계정" 페이지 전용 스크립트 (SPA 동적 삽입 대응 + 이메일 유효성 검사)

(function() {
  const POLL_INTERVAL = 100;
  let currentUser = localStorage.getItem('currentLoggedInUser');

  function init() {
    const container = document.getElementById('account-edit-container');
    if (!container) return setTimeout(init, POLL_INTERVAL);

    // 로그인 데이터가 없으면 테스트용 사용자ID 할당
    if (!currentUser) {
      console.warn('currentLoggedInUser not found, using temporary TEST user');
      currentUser = 'TEST';
    }

    const nameInput  = container.querySelector('#accountName');
    const deptInput  = container.querySelector('#accountDepartment');
    const emailInput = container.querySelector('#accountEmail');

    // 사용자 정보 로드
    fetch(`/api/users/${encodeURIComponent(currentUser)}`)
      .then(res => {
        if (!res.ok) throw new Error('API 응답 오류');
        return res.json();
      })
      .then(user => {
        nameInput.value       = user.name || '';
        deptInput.value       = user.departmentName || '';
        emailInput.value      = user.email || '';
      })
      .catch(err => {
        console.error('사용자 정보 로드 실패:', err);
        showMessage('사용자 정보를 불러올 수 없습니다.', 'error');
      });

    // 버튼 클릭 처리 (이벤트 위임)
    document.body.addEventListener('click', e => {
      if (e.target.id === 'saveAccountBtn') {
        doSave(nameInput, deptInput, emailInput);
      } else if (e.target.id === 'cancelAccountBtn') {
        showContent('profile');
      }
    });
  }

  function doSave(nameInput, deptInput, emailInput) {
    const updatedData = {
      name:       nameInput.value.trim(),
      department: deptInput.value.trim(),
      email:      emailInput.value.trim()
    };

    // 빈값 검사
    if (!updatedData.name) {
      showMessage('이름을 입력하세요.', 'error');
      return;
    }
    if (!updatedData.department) {
      showMessage('학과를 입력하세요.', 'error');
      return;
    }
    if (!updatedData.email) {
      showMessage('이메일을 입력하세요.', 'error');
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedData.email)) {
      showMessage('유효한 이메일 형식이 아닙니다.', 'error');
      return;
    }

    // 업데이트 요청
    fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updatedData)
    })
      .then(res => {
        if (!res.ok) throw new Error('계정 정보 업데이트 실패');
        return res.json();
      })
      .then(() => {
        showMessage('계정 정보가 저장되었습니다.', 'success');
        showContent('profile');
        checkUserStatus();
      })
      .catch(err => {
        console.error('계정 업데이트 오류:', err);
        showMessage(err.message || '계정 정보를 저장하는 데 실패했습니다.', 'error');
      });
  }

  init();
})();

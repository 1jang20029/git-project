// account-edit.js
// "내 계정" 페이지 전용 스크립트 (SPA 동적 삽입 대응)

(function() {
  const POLL_INTERVAL = 100;

  function init() {
    const container = document.getElementById('account-edit-container');
    if (!container) {
      // 아직 HTML이 삽입되지 않음
      return setTimeout(init, POLL_INTERVAL);
    }

    // 1) 로그인 사용자 체크
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
      showMessage('로그인이 필요합니다.', 'error');
      showContent('home');
      return;
    }

    // 2) 입력 요소들
    const nameInput       = container.querySelector('#accountName');
    const deptInput       = container.querySelector('#accountDepartment');
    const emailInput      = container.querySelector('#accountEmail');

    // 3) 사용자 정보 불러오기
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

    // 4) 버튼 클릭: 이벤트 위임
    document.body.addEventListener('click', (e) => {
      if (e.target.id === 'saveAccountBtn') {
        doSave(currentUser, nameInput, deptInput, emailInput);
      }
      else if (e.target.id === 'cancelAccountBtn') {
        showContent('profile');
      }
    });
  }

  function doSave(userId, nameInput, deptInput, emailInput) {
    const updatedData = {
      name:       nameInput.value.trim(),
      department: deptInput.value.trim(),
      email:      emailInput.value.trim()
    };

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

    fetch(`/api/users/${encodeURIComponent(userId)}`, {
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

  // 초기화 시작
  init();
})();

// account-edit.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('account-edit.js loaded');

  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다.', 'error');
    showContent('home');
    return;
  }

  const nameInput  = document.getElementById('accountName');
  const deptInput  = document.getElementById('accountDepartment');
  const emailInput = document.getElementById('accountEmail');
  const emailError = document.getElementById('emailError');
  const saveBtn    = document.getElementById('saveAccountBtn');
  const cancelBtn  = document.getElementById('cancelAccountBtn');

  // 사용자 정보 로드
  fetch(`/api/users/${encodeURIComponent(currentUser)}`)
    .then(res => res.ok ? res.json() : Promise.reject('로드 실패'))
    .then(user => {
      nameInput.value  = user.name || '';
      deptInput.value  = user.departmentName || '';
      emailInput.value = user.email || '';
    })
    .catch(() => showMessage('정보를 불러올 수 없습니다.', 'error'));

  // 이메일 입력 시 에러 메시지 제거
  emailInput.addEventListener('input', () => {
    emailError.textContent = '';
  });

  // 유효성 검사 함수
  function validate() {
    if (!nameInput.value.trim()) {
      showMessage('이름을 입력하세요.', 'error');
      nameInput.focus();
      return false;
    }
    if (!deptInput.value.trim()) {
      showMessage('학과를 입력하세요.', 'error');
      deptInput.focus();
      return false;
    }
    const email = emailInput.value.trim();
    if (!email) {
      showMessage('이메일을 입력하세요.', 'error');
      emailInput.focus();
      return false;
    }
    if (!email.includes('@')) {
      emailError.textContent = '유효한 이메일 형식이 아닙니다.';
      emailInput.focus();
      return false;
    }
    return true;
  }

  // 저장 클릭
  saveBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!validate()) return;

    fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:       nameInput.value.trim(),
        department: deptInput.value.trim(),
        email:      emailInput.value.trim()
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        showMessage('저장되었습니다.', 'success');
        showContent('profile');
        if (typeof checkUserStatus === 'function') checkUserStatus();
      })
      .catch(() => showMessage('저장에 실패했습니다.', 'error'));
  });

  // 취소 클릭
  cancelBtn.addEventListener('click', () => {
    showContent('profile');
  });
});

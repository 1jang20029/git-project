// account-edit.js
// "내 계정" 페이지 전용 스크립트

document.addEventListener('DOMContentLoaded', () => {
  // 1) 현재 로그인된 사용자 ID 가져오기
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다.', 'error');
    showContent('home');
    return;
  }

  // 2) DOM 요소 선택
  const nameInput       = document.getElementById('accountName');
  const departmentInput = document.getElementById('accountDepartment');
  const emailInput      = document.getElementById('accountEmail');
  const saveBtn         = document.getElementById('saveAccountBtn');
  const cancelBtn       = document.getElementById('cancelAccountBtn');

  // 3) API에서 사용자 정보 불러와서 입력란에 채우기
  fetch(`/api/users/${encodeURIComponent(currentUser)}`)
    .then((res) => {
      if (!res.ok) throw new Error('API 응답 오류');
      return res.json();
    })
    .then((user) => {
      nameInput.value       = user.name || '';
      departmentInput.value = user.departmentName || '';
      emailInput.value      = user.email || '';
    })
    .catch((err) => {
      console.error('사용자 정보 로드 실패:', err);
      showMessage('사용자 정보를 불러올 수 없습니다.', 'error');
    });

  // 4) "저장" 버튼 클릭 시
  saveBtn.addEventListener('click', () => {
    const updatedData = {
      name:       nameInput.value.trim(),
      department: departmentInput.value.trim(),
      email:      emailInput.value.trim()
    };

    // 입력 유효성 검사
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

    // 업데이트 요청
    fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updatedData)
    })
      .then((res) => {
        if (!res.ok) throw new Error('계정 정보 업데이트 실패');
        return res.json();
      })
      .then(() => {
        showMessage('계정 정보가 저장되었습니다.', 'success');
        showContent('profile');
        checkUserStatus();
      })
      .catch((err) => {
        console.error('계정 업데이트 오류:', err);
        showMessage(err.message || '계정 정보를 저장하는 데 실패했습니다.', 'error');
      });
  });

  // 5) "취소" 버튼 클릭 시
  cancelBtn.addEventListener('click', () => {
    showContent('profile');
  });
});


document.addEventListener('DOMContentLoaded', () => {
  // 1) 현재 로그인된 사용자 ID 가져오기
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    // 로그인 상태가 아니면 홈으로 이동
    showMessage('로그인이 필요합니다.', 'error');
    showContent('home');
    return;
  }

  // 2) DOM 요소 선택
  const nameInput       = document.getElementById('accountName');
  const departmentInput = document.getElementById('accountDepartment');
  const emailInput      = document.getElementById('accountEmail');
  const currentPwdInput = document.getElementById('currentPassword');
  const newPwdInput     = document.getElementById('newPassword');
  const confirmPwdInput = document.getElementById('confirmPassword');
  const saveBtn         = document.getElementById('saveAccountBtn');
  const cancelBtn       = document.getElementById('cancelAccountBtn');

  // 3) API에서 사용자 정보 불러와서 입력란 채우기
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

  // 4) "저장" 버튼 클릭 시: 변경된 데이터 PUT 요청 및 비밀번호 변경 요청
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
    if (!updatedData.email) {
      showMessage('이메일을 입력하세요.', 'error');
      return;
    }

    // 비밀번호 변경 여부 확인
    const currentPwdValue = currentPwdInput.value.trim();
    const newPwdValue     = newPwdInput.value.trim();
    const confirmPwdValue = confirmPwdInput.value.trim();

    let pwdChangeRequested = false;
    if (newPwdValue || confirmPwdValue) {
      // 현재 비밀번호, 새 비밀번호, 비밀번호 확인 모두 입력되어야 함
      if (!currentPwdValue) {
        showMessage('현재 비밀번호를 입력하세요.', 'error');
        return;
      }
      if (!newPwdValue) {
        showMessage('새 비밀번호를 입력하세요.', 'error');
        return;
      }
      if (newPwdValue !== confirmPwdValue) {
        showMessage('새 비밀번호와 확인이 일치하지 않습니다.', 'error');
        return;
      }
      pwdChangeRequested = true;
    }

    // 4-1) 사용자 기본 정보 업데이트 (이름/학과/이메일)
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
        // 4-2) 비밀번호 변경 요청이 있으면 별도 API 호출
        if (pwdChangeRequested) {
          const pwdPayload = {
            currentPassword: currentPwdValue,
            newPassword:     newPwdValue
          };
          return fetch(`/api/users/${encodeURIComponent(currentUser)}/password`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(pwdPayload)
          })
            .then((pwdRes) => {
              if (!pwdRes.ok) throw new Error('비밀번호 변경 실패');
              return pwdRes.json();
            })
            .then(() => {
              showMessage('비밀번호가 변경되었습니다.', 'success');
            });
        }
      })
      .then(() => {
        showMessage('계정 정보가 저장되었습니다.', 'success');
        // 저장 후 "프로필" 화면으로 돌아가기
        showContent('profile');
        // index.js의 사용자 정보 업데이트 함수 호출
        checkUserStatus();
      })
      .catch((err) => {
        console.error('계정 업데이트 오류:', err);
        showMessage(err.message || '계정 정보를 저장하는 데 실패했습니다.', 'error');
      });
  });

  // 5) "취소" 버튼 클릭 시: 이전 화면(프로필)으로 복귀
  cancelBtn.addEventListener('click', () => {
    showContent('profile');
  });
});

// 전역 함수 (index.js에서 정의됨):
// - showContent(type): SPA처럼 화면 전환 처리
// - showMessage(message, type): 우측 상단 슬라이드 알림 메시지 표시
// - checkUserStatus(): 로그인 상태 UI 갱신
// =============================================================================

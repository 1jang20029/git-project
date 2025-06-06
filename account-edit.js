// =============================================================================
// account-edit.js
// "내 계정" 페이지 전용 스크립트
// =============================================================================

// 이 스크립트는 index.js가 account-edit.html을 fetch하여
// <div id="profileContentPane">에 삽입한 다음 자동으로 로드됩니다.

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
  const imageUrlInput   = document.getElementById('accountImageUrl');
  const nameInput       = document.getElementById('accountName');
  const departmentInput = document.getElementById('accountDepartment');
  const emailInput      = document.getElementById('accountEmail');
  const saveBtn         = document.getElementById('saveAccountBtn');
  const cancelBtn       = document.getElementById('cancelAccountBtn');

  // 3) API에서 사용자 정보 불러와서 입력란 채우기
  fetch(`/api/users/${encodeURIComponent(currentUser)}`)
    .then((res) => {
      if (!res.ok) throw new Error('API 응답 오류');
      return res.json();
    })
    .then((user) => {
      imageUrlInput.value   = user.profileImage || '';
      nameInput.value       = user.name || '';
      departmentInput.value = user.departmentName || '';
      emailInput.value      = user.email || '';
    })
    .catch((err) => {
      console.error('사용자 정보 로드 실패:', err);
      showMessage('사용자 정보를 불러올 수 없습니다.', 'error');
    });

  // 4) "저장" 버튼 클릭 시: 변경된 데이터 PUT 요청
  saveBtn.addEventListener('click', () => {
    const updatedData = {
      profileImage: imageUrlInput.value.trim(),
      name:         nameInput.value.trim(),
      department:   departmentInput.value.trim(),
      email:        emailInput.value.trim()
    };

    // 간단한 유효성 검사
    if (!updatedData.name) {
      showMessage('이름을 입력하세요.', 'error');
      return;
    }
    if (!updatedData.email) {
      showMessage('이메일을 입력하세요.', 'error');
      return;
    }

    fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updatedData)
    })
      .then((res) => {
        if (!res.ok) throw new Error('업데이트 실패');
        return res.json();
      })
      .then((data) => {
        showMessage('계정 정보가 저장되었습니다.', 'success');
        // 저장 후 "내 계정" 목록 화면(또는 프로필 화면)으로 돌아가기
        showContent('profile');
        // index.js의 사용자 정보 업데이트 함수 호출
        checkUserStatus();
      })
      .catch((err) => {
        console.error('계정 업데이트 오류:', err);
        showMessage('계정 정보를 저장하는 데 실패했습니다.', 'error');
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

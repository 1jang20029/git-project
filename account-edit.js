// account-edit.js
// "내 계정" 페이지 전용 스크립트

(function() {
  // 1) 현재 로그인된 사용자 ID 가져오기
  const currentUser = localStorage.getItem('currentLoggedInUser');
  
  if (!currentUser) {
    if (typeof showMessage === 'function') {
      showMessage('로그인이 필요합니다.', 'error');
    }
    if (typeof showContent === 'function') {
      showContent('home');
    }
    return; // 함수 종료
  }

  // 2) DOM 요소 선택 (DOMContentLoaded 이벤트 대기)
  document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('accountName');
    const departmentInput = document.getElementById('accountDepartment');
    const emailInput = document.getElementById('accountEmail');
    const saveBtn = document.getElementById('saveAccountBtn');
    const cancelBtn = document.getElementById('cancelAccountBtn');

    // 요소들이 존재하는지 확인
    if (!nameInput || !departmentInput || !emailInput || !saveBtn || !cancelBtn) {
      console.error('필수 DOM 요소를 찾을 수 없습니다.');
      return;
    }

    // 3) 이메일 유효성 검사 함수
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    // 4) 실시간 이메일 유효성 검사
    emailInput.addEventListener('input', function() {
      const email = this.value.trim();
      if (email && !isValidEmail(email)) {
        this.style.borderColor = '#ef4444';
        this.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      } else {
        this.style.borderColor = '';
        this.style.backgroundColor = '';
      }
    });

    // 5) API에서 사용자 정보 불러와서 입력란에 채우기
    function loadUserData() {
      // 로딩 상태 표시
      nameInput.disabled = true;
      departmentInput.disabled = true;
      emailInput.disabled = true;
      saveBtn.disabled = true;

      fetch(`/api/users/${encodeURIComponent(currentUser)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(user => {
          nameInput.value = user.name || '';
          departmentInput.value = user.departmentName || user.department || '';
          emailInput.value = user.email || '';
          
          // 입력 필드 활성화
          nameInput.disabled = false;
          departmentInput.disabled = false;
          emailInput.disabled = false;
          saveBtn.disabled = false;
        })
        .catch(err => {
          console.error('사용자 정보 로드 실패:', err);
          if (typeof showMessage === 'function') {
            showMessage('사용자 정보를 불러올 수 없습니다.', 'error');
          }
          
          // 기본값 설정 및 입력 필드 활성화
          nameInput.value = currentUser || '';
          departmentInput.value = '';
          emailInput.value = '';
          nameInput.disabled = false;
          departmentInput.disabled = false;
          emailInput.disabled = false;
          saveBtn.disabled = false;
        });
    }

    // 6) "저장" 버튼 클릭 이벤트
    saveBtn.addEventListener('click', function() {
      const updatedData = {
        name: nameInput.value.trim(),
        department: departmentInput.value.trim(),
        email: emailInput.value.trim()
      };

      // 입력값 검증
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

      // 이메일 형식 검증
      if (!isValidEmail(updatedData.email)) {
        if (typeof showMessage === 'function') {
          showMessage('올바른 이메일 형식을 입력하세요.', 'error');
        }
        emailInput.focus();
        return;
      }

      // 저장 버튼 비활성화 (중복 클릭 방지)
      saveBtn.disabled = true;
      saveBtn.textContent = '저장 중...';

      fetch(`/api/users/${encodeURIComponent(currentUser)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: 계정 정보 업데이트 실패`);
          }
          return res.json();
        })
        .then(() => {
          if (typeof showMessage === 'function') {
            showMessage('계정 정보가 저장되었습니다.', 'success');
          }
          
          // 사용자 상태 업데이트
          if (typeof checkUserStatus === 'function') {
            checkUserStatus();
          }
          
          // 프로필 화면으로 이동 (선택사항)
          setTimeout(() => {
            if (typeof showContent === 'function') {
              showContent('home');
            }
          }, 1500);
        })
        .catch(err => {
          console.error('계정 업데이트 오류:', err);
          if (typeof showMessage === 'function') {
            showMessage(err.message || '계정 정보를 저장하는 데 실패했습니다.', 'error');
          }
        })
        .finally(() => {
          // 저장 버튼 복원
          saveBtn.disabled = false;
          saveBtn.textContent = '저장';
        });
    });

    // 7) "취소" 버튼 클릭 이벤트
    cancelBtn.addEventListener('click', function() {
      if (confirm('변경사항을 취소하시겠습니까?')) {
        // 원래 데이터로 복원
        loadUserData();
        
        if (typeof showContent === 'function') {
          showContent('home');
        }
      }
    });

    // 8) Enter 키 처리
    [nameInput, departmentInput, emailInput].forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveBtn.click();
        }
      });
    });

    // 9) 초기 데이터 로드
    loadUserData();
  });

  // 10) 페이지가 이미 로드된 경우를 대비
  if (document.readyState === 'loading') {
    // DOMContentLoaded 이벤트를 기다림
  } else {
    // DOM이 이미 로드된 경우 즉시 실행
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }
})();
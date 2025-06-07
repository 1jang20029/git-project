// account-edit.js (디버깅 강화 버전)
// "내 계정" 페이지 전용 스크립트

(function() {
  console.log('🔍 account-edit.js 시작');
  
  // 1) 현재 로그인된 사용자 ID 가져오기
  const currentUser = localStorage.getItem('currentLoggedInUser');
  console.log('👤 현재 사용자:', currentUser);
  
  if (!currentUser) {
    console.error('❌ 로그인된 사용자가 없습니다.');
    if (typeof showMessage === 'function') {
      showMessage('로그인이 필요합니다.', 'error');
    }
    if (typeof showContent === 'function') {
      showContent('home');
    }
    return;
  }

  // 2) DOM 요소 선택 (DOMContentLoaded 이벤트 대기)
  function initializeAccountEdit() {
    console.log('🎯 DOM 요소 초기화 시작');
    
    const nameInput = document.getElementById('accountName');
    const departmentInput = document.getElementById('accountDepartment');
    const emailInput = document.getElementById('accountEmail');
    const saveBtn = document.getElementById('saveAccountBtn');
    const cancelBtn = document.getElementById('cancelAccountBtn');

    console.log('📋 DOM 요소 확인:', {
      nameInput: !!nameInput,
      departmentInput: !!departmentInput,
      emailInput: !!emailInput,
      saveBtn: !!saveBtn,
      cancelBtn: !!cancelBtn
    });

    // 요소들이 존재하는지 확인
    if (!nameInput || !departmentInput || !emailInput || !saveBtn || !cancelBtn) {
      console.error('❌ 필수 DOM 요소를 찾을 수 없습니다.');
      
      // 5초 후 다시 시도
      setTimeout(() => {
        console.log('🔄 DOM 요소 재시도...');
        initializeAccountEdit();
      }, 5000);
      return;
    }

    console.log('✅ 모든 DOM 요소가 준비되었습니다.');

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
      console.log('📡 사용자 데이터 로드 시작...');
      
      // 로딩 상태 표시
      nameInput.disabled = true;
      departmentInput.disabled = true;
      emailInput.disabled = true;
      saveBtn.disabled = true;
      saveBtn.textContent = '로딩 중...';

      // 먼저 fetch가 가능한지 확인
      if (typeof fetch === 'undefined') {
        console.error('❌ fetch API를 사용할 수 없습니다.');
        handleLoadError('fetch API를 사용할 수 없습니다.');
        return;
      }

      const apiUrl = `/api/users/${encodeURIComponent(currentUser)}`;
      console.log('🌐 API 요청 URL:', apiUrl);

      fetch(apiUrl)
        .then(res => {
          console.log('📨 API 응답 상태:', res.status, res.statusText);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(user => {
          console.log('✅ 사용자 데이터 수신:', user);
          
          nameInput.value = user.name || currentUser || '';
          departmentInput.value = user.departmentName || user.department || '';
          emailInput.value = user.email || '';
          
          console.log('📝 입력 필드 업데이트 완료');
          
          // 입력 필드 활성화
          nameInput.disabled = false;
          departmentInput.disabled = false;
          emailInput.disabled = false;
          saveBtn.disabled = false;
          saveBtn.textContent = '저장';
        })
        .catch(err => {
          console.error('❌ 사용자 정보 로드 실패:', err);
          handleLoadError(err.message);
        });
    }

    // 에러 처리 함수
    function handleLoadError(errorMessage) {
      console.log('🛠️ 에러 처리 모드로 전환');
      
      if (typeof showMessage === 'function') {
        showMessage(`사용자 정보를 불러올 수 없습니다: ${errorMessage}`, 'error');
      }
      
      // 기본값 설정 및 입력 필드 활성화
      nameInput.value = currentUser || '';
      departmentInput.value = '';
      emailInput.value = '';
      nameInput.disabled = false;
      departmentInput.disabled = false;
      emailInput.disabled = false;
      saveBtn.disabled = false;
      saveBtn.textContent = '저장';
      
      console.log('📝 기본값으로 설정 완료');
    }

    // 6) "저장" 버튼 클릭 이벤트
    saveBtn.addEventListener('click', function() {
      console.log('💾 저장 버튼 클릭');
      
      const updatedData = {
        name: nameInput.value.trim(),
        department: departmentInput.value.trim(),
        email: emailInput.value.trim()
      };

      console.log('📊 저장할 데이터:', updatedData);

      // 입력값 검증
      if (!updatedData.name) {
        console.log('❌ 이름이 비어있음');
        if (typeof showMessage === 'function') {
          showMessage('이름을 입력하세요.', 'error');
        }
        nameInput.focus();
        return;
      }

      if (!updatedData.department) {
        console.log('❌ 학과가 비어있음');
        if (typeof showMessage === 'function') {
          showMessage('학과를 입력하세요.', 'error');
        }
        departmentInput.focus();
        return;
      }

      if (!updatedData.email) {
        console.log('❌ 이메일이 비어있음');
        if (typeof showMessage === 'function') {
          showMessage('이메일을 입력하세요.', 'error');
        }
        emailInput.focus();
        return;
      }

      // 이메일 형식 검증
      if (!isValidEmail(updatedData.email)) {
        console.log('❌ 이메일 형식이 잘못됨');
        if (typeof showMessage === 'function') {
          showMessage('올바른 이메일 형식을 입력하세요.', 'error');
        }
        emailInput.focus();
        return;
      }

      console.log('✅ 모든 검증 통과');

      // 저장 버튼 비활성화 (중복 클릭 방지)
      saveBtn.disabled = true;
      saveBtn.textContent = '저장 중...';

      const saveApiUrl = `/api/users/${encodeURIComponent(currentUser)}`;
      console.log('💾 저장 API 요청:', saveApiUrl);

      fetch(saveApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
        .then(res => {
          console.log('📨 저장 응답 상태:', res.status, res.statusText);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: 계정 정보 업데이트 실패`);
          }
          return res.json();
        })
        .then(result => {
          console.log('✅ 저장 성공:', result);
          
          if (typeof showMessage === 'function') {
            showMessage('계정 정보가 저장되었습니다.', 'success');
          }
          
          // 사용자 상태 업데이트
          if (typeof checkUserStatus === 'function') {
            checkUserStatus();
          }
          
          // 홈 화면으로 이동
          setTimeout(() => {
            if (typeof showContent === 'function') {
              showContent('home');
            }
          }, 1500);
        })
        .catch(err => {
          console.error('❌ 저장 실패:', err);
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
      console.log('🚫 취소 버튼 클릭');
      
      if (confirm('변경사항을 취소하시겠습니까?')) {
        console.log('✅ 취소 확인됨');
        
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
  }

  // DOM 로드 상태 확인
  if (document.readyState === 'loading') {
    console.log('⏳ DOM 로딩 대기 중...');
    document.addEventListener('DOMContentLoaded', initializeAccountEdit);
  } else {
    console.log('✅ DOM이 이미 로드됨, 즉시 초기화');
    initializeAccountEdit();
  }
})();
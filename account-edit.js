// account-edit.js (목업 데이터 포함 버전)
// 백엔드 API가 없을 때 사용할 수 있는 버전

(function() {
  console.log('🔍 account-edit.js 시작 (목업 데이터 포함)');
  
  // 목업 사용자 데이터
  const mockUsers = {
    'admin': {
      name: '관리자',
      department: 'COMP',
      departmentName: '컴퓨터공학과',
      email: 'admin@yeonsung.ac.kr'
    },
    'student1': {
      name: '김학생',
      department: 'COMP',
      departmentName: '컴퓨터공학과', 
      email: 'student1@yeonsung.ac.kr'
    },
    'professor1': {
      name: '이교수',
      department: 'COMP',
      departmentName: '컴퓨터공학과',
      email: 'professor1@yeonsung.ac.kr'
    }
  };
  
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

  // 2) DOM 요소 선택 및 초기화
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

    if (!nameInput || !departmentInput || !emailInput || !saveBtn || !cancelBtn) {
      console.error('❌ 필수 DOM 요소를 찾을 수 없습니다.');
      setTimeout(() => {
        console.log('🔄 DOM 요소 재시도...');
        initializeAccountEdit();
      }, 2000);
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

    // 5) 사용자 데이터 로드 (API 또는 목업)
    function loadUserData() {
      console.log('📡 사용자 데이터 로드 시작...');
      
      // 로딩 상태 표시
      nameInput.disabled = true;
      departmentInput.disabled = true;
      emailInput.disabled = true;
      saveBtn.disabled = true;
      saveBtn.textContent = '로딩 중...';

      // API 먼저 시도
      const apiUrl = `/api/users/${encodeURIComponent(currentUser)}`;
      console.log('🌐 API 요청 시도:', apiUrl);

      fetch(apiUrl)
        .then(res => {
          console.log('📨 API 응답 상태:', res.status);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(user => {
          console.log('✅ API에서 사용자 데이터 수신:', user);
          fillUserData(user);
        })
        .catch(err => {
          console.log('⚠️ API 실패, 목업 데이터 사용:', err.message);
          
          // 목업 데이터 사용
          const mockUser = mockUsers[currentUser] || {
            name: currentUser,
            department: '',
            departmentName: '',
            email: `${currentUser}@yeonsung.ac.kr`
          };
          
          console.log('🎭 목업 데이터 사용:', mockUser);
          fillUserData(mockUser);
        });
    }

    // 6) 사용자 데이터 입력 필드에 채우기
    function fillUserData(user) {
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
    }

    // 7) "저장" 버튼 클릭 이벤트
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

      if (!isValidEmail(updatedData.email)) {
        console.log('❌ 이메일 형식이 잘못됨');
        if (typeof showMessage === 'function') {
          showMessage('올바른 이메일 형식을 입력하세요.', 'error');
        }
        emailInput.focus();
        return;
      }

      console.log('✅ 모든 검증 통과');

      // 저장 처리
      saveUserData(updatedData);
    });

    // 8) 사용자 데이터 저장
    function saveUserData(updatedData) {
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
          console.log('📨 저장 응답 상태:', res.status);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: 저장 실패`);
          }
          return res.json();
        })
        .then(result => {
          console.log('✅ API 저장 성공:', result);
          handleSaveSuccess();
        })
        .catch(err => {
          console.log('⚠️ API 저장 실패, 로컬에 저장:', err.message);
          
          // 로컬스토리지에 저장 (백업)
          const userKey = `user_${currentUser}`;
          localStorage.setItem(userKey, JSON.stringify(updatedData));
          
          console.log('💾 로컬스토리지에 저장 완료');
          handleSaveSuccess();
        })
        .finally(() => {
          saveBtn.disabled = false;
          saveBtn.textContent = '저장';
        });
    }

    // 9) 저장 성공 처리
    function handleSaveSuccess() {
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
    }

    // 10) "취소" 버튼 클릭 이벤트
    cancelBtn.addEventListener('click', function() {
      console.log('🚫 취소 버튼 클릭');
      
      if (confirm('변경사항을 취소하시겠습니까?')) {
        console.log('✅ 취소 확인됨');
        
        if (typeof showContent === 'function') {
          showContent('home');
        }
      }
    });

    // 11) Enter 키 처리
    [nameInput, departmentInput, emailInput].forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveBtn.click();
        }
      });
    });

    // 12) 초기 데이터 로드
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
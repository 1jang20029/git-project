// localStorage 사용 가능 여부 확인 함수
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage를 사용할 수 없습니다:', e);
        return false;
    }
}

// 안전한 스토리지 객체
const safeStorage = {
    memoryStorage: {},
    
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage를 사용할 수 없어 메모리에 저장합니다:', e);
            this.memoryStorage[key] = value;
            document.getElementById('storage-notice').style.display = 'block';
        }
    },
    
    getItem: function(key) {
        try {
            const value = localStorage.getItem(key);
            return value;
        } catch (e) {
            console.warn('localStorage에 접근할 수 없어 메모리에서 조회합니다:', e);
            return this.memoryStorage[key] || null;
        }
    },
    
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('localStorage에서 삭제할 수 없어 메모리에서 삭제합니다:', e);
            delete this.memoryStorage[key];
        }
    }
};

// 로그아웃 함수 - 로그아웃 버튼에 연결하세요
function logout() {
    // 현재 로그인된 사용자 아이디 가져오기
    const currentUser = safeStorage.getItem('currentLoggedInUser');
    
    // 아이디 저장 옵션 확인
    const isSaveIdEnabled = document.getElementById('saveId').checked;
    
    // 아이디 저장이 활성화되어 있으면 현재 사용자 아이디 저장
    if (isSaveIdEnabled && currentUser) {
        safeStorage.setItem('savedStudentId', currentUser);
        safeStorage.setItem('saveIdEnabled', 'true');
    } else {
        // 아이디 저장이 비활성화되어 있으면 저장된 아이디 삭제
        safeStorage.removeItem('savedStudentId');
        safeStorage.setItem('saveIdEnabled', 'false');
    }
    
    // 로그인 상태 삭제
    safeStorage.removeItem('currentLoggedInUser');
    
    // 로그아웃 메시지 표시
    alert('로그아웃되었습니다.');
    
    // 로그인 페이지로 이동
    window.location.href = "login.html";
}

// 로컬 스토리지에 회원가입 여부 저장
function saveRegistrationStatus(studentId) {
    safeStorage.setItem(`user_${studentId}_registered`, 'true');
    
    // 위젯 설정을 완료했는지 확인
    const setupCompleted = safeStorage.getItem(`user_${studentId}_setup_completed`) === 'true';
    
    // 위젯 설정을 완료하지 않은 경우에만 최초 로그인 상태를 설정
    if (!setupCompleted) {
        safeStorage.setItem(`user_${studentId}_first_login`, 'true');
    }
}

// 회원가입 시 사용자 정보 저장 함수 (register.html 파일에 필요)
function registerUser(studentId, password, name, department, grade, email, phone) {
    // 기존 사용자인지 확인
    const isExistingUser = safeStorage.getItem(`user_${studentId}_registered`) === 'true';
    
    // 회원 정보 저장
    safeStorage.setItem(`user_${studentId}_registered`, 'true');
    safeStorage.setItem(`user_${studentId}_password`, password);
    safeStorage.setItem(`user_${studentId}_name`, name);
    safeStorage.setItem(`user_${studentId}_department`, department);
    safeStorage.setItem(`user_${studentId}_grade`, grade);
    safeStorage.setItem(`user_${studentId}_email`, email);
    safeStorage.setItem(`user_${studentId}_phone`, phone);
    
    // 위젯 설정을 완료했는지 확인
    const setupCompleted = safeStorage.getItem(`user_${studentId}_setup_completed`) === 'true';
    
    // 위젯 설정을 완료하지 않은 경우에만 최초 로그인 상태를 설정
    if (!isExistingUser || !setupCompleted) {
        safeStorage.setItem(`user_${studentId}_first_login`, 'true');
    }
    
    // 회원가입 완료 후 로그인 페이지로 리디렉션
    window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
}

// 뒤로가기 함수
function goBack() {
    window.location.href = "index.html";
}

// 일반 로그인 처리 함수
function login() {
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    
    // 간단한 유효성 검사
    if (!studentId || !password) {
        alert('학번과 비밀번호를 모두 입력해주세요.');
        return;
    }
    
    // 회원가입 여부 확인
    const isRegistered = safeStorage.getItem(`user_${studentId}_registered`) === 'true';
    
    if (!isRegistered) {
        alert('등록되지 않은 학번입니다. 회원가입을 먼저 진행해주세요.');
        return;
    }
    
    // 비밀번호 검증
    const storedPassword = safeStorage.getItem(`user_${studentId}_password`);
    
    if (password !== storedPassword) {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 아이디 저장 옵션 처리
    const saveIdChecked = document.getElementById('saveId').checked;
    
    // 아이디 저장 옵션 상태 저장
    safeStorage.setItem('saveIdEnabled', saveIdChecked ? 'true' : 'false');
    
    if (saveIdChecked) {
        // 아이디 저장
        safeStorage.setItem('savedStudentId', studentId);
    } else {
        // 저장된 아이디 삭제
        safeStorage.removeItem('savedStudentId');
    }
    
    // 현재 로그인된 사용자 저장
    safeStorage.setItem('currentLoggedInUser', studentId);
    
    // 최초 로그인 여부 및 위젯 설정 완료 여부 확인
    const isFirstLogin = safeStorage.getItem(`user_${studentId}_first_login`) === 'true';
    const setupCompleted = safeStorage.getItem(`user_${studentId}_setup_completed`) === 'true';
    
    // 최초 로그인이고 위젯 설정을 완료하지 않은 경우
    if (isFirstLogin && !setupCompleted) {
        // 최초 로그인 플래그를 false로 변경 (다음 로그인에는 위젯 설정 페이지로 이동하지 않음)
        safeStorage.setItem(`user_${studentId}_first_login`, 'false');
        
        // 위젯 설정 페이지로 이동
        alert('로그인이 완료되었습니다. 위젯 및 메뉴 설정 페이지로 이동합니다.');
        window.location.href = "widget-settings.html";
    } else {
        // 위젯 설정을 이미 완료했거나 최초 로그인이 아닌 경우 메인 페이지로 이동
        alert('로그인이 완료되었습니다.');
        window.location.href = "index.html";
    }
}

// URL 파라미터에서 새로 회원가입했는지 확인
function checkNewRegistration() {
    // localStorage 사용 가능 여부 확인
    if (!isLocalStorageAvailable()) {
        document.getElementById('storage-notice').style.display = 'block';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const newRegistration = urlParams.get('newRegistration');
    const studentId = urlParams.get('studentId');

    if (newRegistration === 'true' && studentId) {
        // 새로 회원가입한 경우 회원가입 상태 저장
        saveRegistrationStatus(studentId);
    
        // 학번 자동 입력
        document.getElementById('studentId').value = studentId;
    
        // 포커스를 비밀번호 필드로 이동
        document.getElementById('password').focus();
    }
}

// 네이버 로그인 처리 (개선됨)
function naverLogin() {
    // 기존 네이버 사용자인지 확인
    const existingNaverUsers = Object.keys(safeStorage.memoryStorage || {})
        .concat(Object.keys(localStorage || {}))
        .filter(key => key.includes('user_naver_') && key.includes('_registered'));
    
    // 네이버 로그인 API 사용 - 실제 네이버 로그인 페이지로 이동
    const CLIENT_ID = '4s_r7FMu5Bfr3er3GXci';
    const REDIRECT_URI = 'https://ysu-guide.netlify.app/naver-callback.html';
    const STATE = Math.random().toString(36).substr(2, 11);

    // 상태 토큰 저장 (CSRF 방지)
    safeStorage.setItem('naverOAuthState', STATE);

    // 이미 동의한 사용자가 있고 해당 사용자가 이미 로그인한 적이 있다면
    // prompt 파라미터를 제거하여 동의 화면을 건너뛸 수 있음
    let promptParam = '';
    if (existingNaverUsers.length === 0) {
        // 처음 네이버 로그인 사용자인 경우에만 동의 화면 표시
        promptParam = '&prompt=consent';
    }
    
    // 네이버 OAuth 2.0 인증 URL 생성
    const authUrl = 'https://nid.naver.com/oauth2.0/authorize?' +
        'client_id=' + CLIENT_ID +
        '&response_type=code' +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&state=' + STATE +
        promptParam;
    
    // 네이버 로그인 페이지로 이동
    window.location.href = authUrl;
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 모달 이벤트 설정
function setupModalEvents() {
    const modal = document.getElementById('naverLoginModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 모달 외부 클릭 시 닫기 (단, 입력 중일 때는 예외)
    window.onclick = function(event) {
        if (event.target === modal) {
            // 아이디나 비밀번호 입력 중이 아닌 경우에만 모달 닫기
            const naverId = document.getElementById('naverId');
            const naverPw = document.getElementById('naverPw');
            
            if (document.activeElement !== naverId && document.activeElement !== naverPw) {
                modal.style.display = 'none';
            }
        }
    };

    // 입력 필드에서 포커스가 나가도 모달이 유지되도록 설정
    const inputFields = modal.querySelectorAll('input');
    inputFields.forEach(input => {
        input.addEventListener('blur', function(e) {
            e.stopPropagation();
        });
    });
    
    // 모달 내부 클릭 시 이벤트 버블링 방지
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// 네이버 모달 로그인 처리 (이어서)
function processNaverLogin() {
    const naverId = document.getElementById('naverId').value;
    const naverPw = document.getElementById('naverPw').value;
    const autoLogin = document.getElementById('autoLogin').checked;
    
    // 간단한 유효성 검사
    if (!naverId || !naverPw) {
        alert('네이버 아이디와 비밀번호를 모두 입력해주세요.');
        return;
    }
    
    try {
        // 여기서는 임시로 처리 (실제로는 네이버 OAuth API를 사용)
        // 네이버 로그인 성공 시 임시 학번 생성
        const tempStudentId = 'naver_' + naverId;
        
        // 기존 사용자인지 확인
        const isExistingUser = safeStorage.getItem(`user_${tempStudentId}_registered`) === 'true';
        const setupCompleted = safeStorage.getItem(`user_${tempStudentId}_setup_completed`) === 'true';
        
        // 사용자 정보 저장
        safeStorage.setItem(`user_${tempStudentId}_registered`, 'true');
        
        // 기존 정보가 없는 경우에만 기본 정보 저장
        if (!isExistingUser) {
            safeStorage.setItem(`user_${tempStudentId}_name`, '네이버 사용자');
            safeStorage.setItem(`user_${tempStudentId}_department`, 'computerScience');
            safeStorage.setItem(`user_${tempStudentId}_grade`, '1');
            safeStorage.setItem(`user_${tempStudentId}_email`, `${naverId}@naver.com`);
            safeStorage.setItem(`user_${tempStudentId}_phone`, '010-0000-0000');
            
            // 소셜 로그인 사용자 표시
            safeStorage.setItem(`user_${tempStudentId}_socialType`, 'naver');
        }
        
        // 자동 로그인 설정 저장
        if (autoLogin) {
            safeStorage.setItem(`user_${tempStudentId}_autoLogin`, 'true');
        }
        
        // 현재 로그인된 사용자 저장
        safeStorage.setItem('currentLoggedInUser', tempStudentId);
        
        // 최초 로그인 여부 확인 (기존 사용자이고 위젯 설정을 완료한 경우에는 false)
        if (!isExistingUser || !setupCompleted) {
            safeStorage.setItem(`user_${tempStudentId}_first_login`, 'true');
        } else {
            safeStorage.setItem(`user_${tempStudentId}_first_login`, 'false');
        }
        
        // 모달 닫기
        closeModal('naverLoginModal');
        
        // 위젯 설정 완료 여부에 따라 페이지 이동
        if (!setupCompleted) {
            alert('네이버 계정으로 로그인이 완료되었습니다. 위젯 및 메뉴 설정 페이지로 이동합니다.');
            window.location.href = "widget-settings.html";
        } else {
            alert('네이버 계정으로 로그인이 완료되었습니다.');
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error('네이버 로그인 처리 중 오류:', error);
        alert('네이버 로그인 처리 중 오류가 발생했습니다: ' + error.message);
    }
}

// 구글 로그인 처리 - 동의 화면 최적화
function googleLogin() {
    // 기존 구글 사용자인지 확인
    const existingGoogleUsers = Object.keys(safeStorage.memoryStorage || {})
        .concat(Object.keys(localStorage || {}))
        .filter(key => key.includes('user_google_') && key.includes('_registered'));
    
    // 새로운 클라이언트 ID 사용
    const CLIENT_ID = '682526101032-6fpr7h5u93gkf762m0rkoj5bo5hpgs2u.apps.googleusercontent.com';
    
    // 리디렉션 URI
    const REDIRECT_URI = 'https://ysu-guide.netlify.app/google-callback.html';
    
    // 권한 범위
    const SCOPE = 'email profile';
    
    // 처음 구글 로그인 사용자인지에 따라 prompt 파라미터 결정
    let promptParam = '&prompt=select_account';
    if (existingGoogleUsers.length === 0) {
        // 처음 구글 로그인 사용자인 경우 동의 화면 표시
        promptParam = '&prompt=consent';
    }
    
    // Google OAuth 2.0 인증 URL 생성
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        'client_id=' + encodeURIComponent(CLIENT_ID) +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&response_type=code' +
        '&scope=' + encodeURIComponent(SCOPE) +
        promptParam +
        '&access_type=offline';
    
    // 구글 로그인 페이지로 이동
    window.location.href = authUrl;
}

// 엔터 키로 로그인 처리
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const modal = document.getElementById('naverLoginModal');
        
        // 네이버 로그인 모달이 열려있고 입력 필드에 포커스가 있을 때
        if (modal.style.display === 'block') {
            const naverId = document.getElementById('naverId');
            const naverPw = document.getElementById('naverPw');
            
            if (document.activeElement === naverId || document.activeElement === naverPw) {
                processNaverLogin();
            }
        }
        // 일반 로그인 폼에서 엔터키를 눌렀을 때
        else {
            const studentId = document.getElementById('studentId');
            const password = document.getElementById('password');
            
            if (document.activeElement === studentId || document.activeElement === password) {
                login();
            }
        }
    }
});

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 항상 모든 입력 필드 초기화
    if (document.getElementById('studentId')) {
        document.getElementById('studentId').value = '';
    }
    if (document.getElementById('password')) {
        document.getElementById('password').value = '';
    }
    
    checkNewRegistration();
    
    // 아이디 저장 옵션 확인
    const isSaveIdEnabled = safeStorage.getItem('saveIdEnabled') === 'true';
    const savedId = safeStorage.getItem('savedStudentId');
    const saveIdCheckbox = document.getElementById('saveId');
    
    if (saveIdCheckbox) {
        // 체크박스 상태 설정
        saveIdCheckbox.checked = isSaveIdEnabled;
        
        // 아이디 저장이 활성화되고 저장된 ID가 있는 경우에만 학번 필드에 채우기
        if (isSaveIdEnabled && savedId) {
            document.getElementById('studentId').value = savedId;
        }
    }
});

// 비밀번호 표시/숨김 토글 기능
document.addEventListener('DOMContentLoaded', function() {
    // 비밀번호 필드와 토글 버튼 찾기
    const passwordField = document.querySelector('input[type="password"]');
    const passwordToggle = document.querySelector('.password-toggle, [id$="passwordToggle"]'); // 다양한 선택자로 시도
    
    // 아이콘 요소가 이미 있기 때문에 기존 요소를 사용합니다
    if (passwordField && passwordToggle) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault(); // 폼 제출 방지
            
            // 현재 비밀번호 필드의 타입 확인
            if (passwordField.type === 'password') {
                // 비밀번호를 표시하는 경우
                passwordField.type = 'text';
                
                // 아이콘 변경 (열린 눈 숨기기, 닫힌 눈 표시)
                document.querySelector('.eye-visible').style.display = 'none';
                document.querySelector('.eye-hidden').style.display = 'block';
            } else {
                // 비밀번호를 숨기는 경우
                passwordField.type = 'password';
                
                // 아이콘 변경 (열린 눈 표시, 닫힌 눈 숨기기)
                document.querySelector('.eye-visible').style.display = 'block';
                document.querySelector('.eye-hidden').style.display = 'none';
            }
        });
    }
});
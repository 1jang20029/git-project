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
            return localStorage.getItem(key);
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
    const currentUser = safeStorage.getItem('currentLoggedInUser');
    const isSaveIdEnabled = document.getElementById('saveId').checked;

    if (isSaveIdEnabled && currentUser) {
        safeStorage.setItem('savedStudentId', currentUser);
        safeStorage.setItem('saveIdEnabled', 'true');
    } else {
        safeStorage.removeItem('savedStudentId');
        safeStorage.setItem('saveIdEnabled', 'false');
    }

    safeStorage.removeItem('currentLoggedInUser');
    alert('로그아웃되었습니다.');
    window.location.href = "pages/user/login.html";
}

// 로컬 스토리지에 회원가입 여부 저장
function saveRegistrationStatus(studentId) {
    safeStorage.setItem(`user_${studentId}_registered`, 'true');
}

// 회원가입 시 사용자 정보 저장 함수 (register.html 파일에 필요)
function registerUser(studentId, password, name, department, grade, email, phone) {
    safeStorage.setItem(`user_${studentId}_registered`, 'true');
    safeStorage.setItem(`user_${studentId}_password`, password);
    safeStorage.setItem(`user_${studentId}_name`, name);
    safeStorage.setItem(`user_${studentId}_department`, department);
    safeStorage.setItem(`user_${studentId}_grade`, grade);
    safeStorage.setItem(`user_${studentId}_email`, email);
    safeStorage.setItem(`user_${studentId}_phone`, phone);
    window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
}

// 뒤로가기 함수
function goBack() {
    window.location.href = "/public/index.html";
}

// 일반 로그인 처리 함수
function login() {
    const studentId = document.getElementById('studentId').value;
    const password  = document.getElementById('password').value;

    if (!studentId || !password) {
        alert('학번과 비밀번호를 모두 입력해주세요.');
        return;
    }

    const isRegistered = safeStorage.getItem(`user_${studentId}_registered`) === 'true';
    if (!isRegistered) {
        alert('등록되지 않은 학번입니다. 회원가입을 먼저 진행해주세요.');
        return;
    }

    const storedPassword = safeStorage.getItem(`user_${studentId}_password`);
    if (password !== storedPassword) {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
    }

    const saveIdChecked = document.getElementById('saveId').checked;
    safeStorage.setItem('saveIdEnabled', saveIdChecked ? 'true' : 'false');
    if (saveIdChecked) {
        safeStorage.setItem('savedStudentId', studentId);
    } else {
        safeStorage.removeItem('savedStudentId');
    }

    safeStorage.setItem('currentLoggedInUser', studentId);
    alert('로그인이 완료되었습니다.');
    window.location.href = "/public/index.html";
}

// URL 파라미터에서 새로 회원가입했는지 확인
function checkNewRegistration() {
    if (!isLocalStorageAvailable()) {
        document.getElementById('storage-notice').style.display = 'block';
    }

    const urlParams    = new URLSearchParams(window.location.search);
    const newReg       = urlParams.get('newRegistration');
    const studentId    = urlParams.get('studentId');

    if (newReg === 'true' && studentId) {
        saveRegistrationStatus(studentId);
        document.getElementById('studentId').value = studentId;
        document.getElementById('password').focus();
    }
}

// 네이버 로그인 처리
function naverLogin() {
    const CLIENT_ID    = '4s_r7FMu5Bfr3er3GXci';
    const REDIRECT_URI = 'https://ysu-guide.netlify.app/naver-callback.html';
    const STATE        = Math.random().toString(36).substr(2, 11);

    safeStorage.setItem('naverOAuthState', STATE);

    const authUrl =
        'https://nid.naver.com/oauth2.0/authorize?' +
        'client_id=' + CLIENT_ID +
        '&response_type=code' +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&state=' + STATE;

    window.location.href = authUrl;
}

// 네이버 로그인 모달 설정
function setupModalEvents() {
    const modal   = document.getElementById('naverLoginModal');
    const content = modal.querySelector('.modal-content');

    window.onclick = event => {
        if (event.target === modal) modal.style.display = 'none';
    };
    content.addEventListener('click', e => e.stopPropagation());
}

// 네이버 모달 로그인 처리
function processNaverLogin() {
    const naverId   = document.getElementById('naverId').value;
    const naverPw   = document.getElementById('naverPw').value;
    const autoLogin = document.getElementById('autoLogin').checked;

    if (!naverId || !naverPw) {
        alert('네이버 아이디와 비밀번호를 모두 입력해주세요.');
        return;
    }

    const tempId = 'naver_' + naverId;
    if (safeStorage.getItem(`user_${tempId}_registered`) !== 'true') {
        safeStorage.setItem(`user_${tempId}_registered`, 'true');
        safeStorage.setItem(`user_${tempId}_name`, '네이버 사용자');
        safeStorage.setItem(`user_${tempId}_department`, '');
        safeStorage.setItem(`user_${tempId}_email`, `${naverId}@naver.com`);
        safeStorage.setItem(`user_${tempId}_phone`, '');
    }
    if (autoLogin) {
        safeStorage.setItem(`user_${tempId}_autoLogin`, 'true');
    }

    safeStorage.setItem('currentLoggedInUser', tempId);
    closeModal('naverLoginModal');
    alert('네이버 계정으로 로그인되었습니다.');
    window.location.href = "/public/index.html";
}

// 구글 로그인 처리
function googleLogin() {
    const CLIENT_ID    = '682526101032-6fpr7h5u93gkf762m0rkoj5bo5hpgs2u.apps.googleusercontent.com';
    const REDIRECT_URI = 'https://ysu-guide.netlify.app/google-callback.html';
    const SCOPE        = 'email profile';

    const authUrl =
        'https://accounts.google.com/o/oauth2/v2/auth?' +
        'client_id=' + encodeURIComponent(CLIENT_ID) +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&response_type=code' +
        '&scope=' + encodeURIComponent(SCOPE);

    window.location.href = authUrl;
}

// 비밀번호 표시/숨김 토글
function setupPasswordToggle() {
    const pwField = document.getElementById('password');
    const toggle  = document.getElementById('passwordToggle');
    if (!pwField || !toggle) return;

    toggle.addEventListener('click', e => {
        e.preventDefault();
        pwField.type = pwField.type === 'password' ? 'text' : 'password';
    });
}

// 저장된 ID 복원
function restoreSavedId() {
    const saveEnabled = safeStorage.getItem('saveIdEnabled') === 'true';
    const saved       = safeStorage.getItem('savedStudentId');
    const checkbox    = document.getElementById('saveId');

    if (checkbox) checkbox.checked = saveEnabled;
    if (saveEnabled && saved) {
        document.getElementById('studentId').value = saved;
    }
}

// 모달 닫기
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// 키 이벤트 및 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('studentId')) document.getElementById('studentId').value = '';
    if (document.getElementById('password'))  document.getElementById('password').value  = '';
    checkNewRegistration();
    setupModalEvents();
    setupPasswordToggle();
    restoreSavedId();
});

document.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        const modal = document.getElementById('naverLoginModal');
        if (modal && modal.style.display === 'block') processNaverLogin();
        else login();
    }
});

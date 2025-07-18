
// 디버깅 로그 추가
function log(message) {
    console.log("[네이버 로그인]", message);
}

log("스크립트 로딩 시작");

// 임시 네이버 사용자 ID
const MOCK_NAVER_ID = "naver_12345";

// localStorage 사용 가능 여부 확인 함수
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        log('localStorage 사용 불가: ' + e.message);
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

// 네이버 회원가입 페이지로 리디렉션
function redirectToRegister() {
    log("회원가입 페이지로 이동");
    
    // 세션 스토리지에 임시 데이터 저장
    sessionStorage.setItem('temp_social_id', MOCK_NAVER_ID);
    sessionStorage.setItem('temp_social_type', 'naver');
    sessionStorage.setItem('temp_social_name', '네이버 사용자');
    sessionStorage.setItem('temp_social_email', 'naver_user@example.com');
    
    // 바로 회원가입 페이지로 이동
    window.location.replace("register.html?social=naver");
}

// 이미 가입된 사용자 로그인 처리
function loginExistingUser(userId) {
    log("기존 사용자 로그인: " + userId);
    
    // 현재 로그인된 사용자로 설정
    safeStorage.setItem('currentLoggedInUser', userId);
    
    // 최초 로그인 여부 확인
    const isFirstLogin = safeStorage.getItem(`user_${userId}_first_login`) !== 'false';
    
    // 바로 해당 페이지로 이동
    if (isFirstLogin) {
        safeStorage.setItem(`user_${userId}_first_login`, 'false');
        window.location.replace("widget-settings.html");
    } else {
        // 바로 메인 페이지로 이동
        window.location.replace("index.html");
    }
}

// 네이버 사용자 확인
function checkNaverUser() {
    log("네이버 사용자 확인 중");
    
    let isRegistered = false;
    
    if (isLocalStorageAvailable()) {
        // 로컬 스토리지에서 네이버 사용자 확인
        const userKey = `user_${MOCK_NAVER_ID}_registered`;
        const userRegistered = safeStorage.getItem(userKey);
        
        log("사용자 등록 확인: " + userKey + " = " + userRegistered);
        
        if (userRegistered === 'true') {
            isRegistered = true;
            log("가입된 사용자 발견");
        }
    }
    
    return isRegistered;
}

// 페이지 로드 즉시 실행
(function() {
    log("페이지 로드됨");
    
    try {
        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const error = urlParams.get('error');
        
        // 오류 또는 취소 확인 - 바로 로그인 페이지로 이동
        if (error || !authCode) {
            log("로그인 취소 또는 오류: " + error);
            window.location.replace("login.html");
            return;
        }
        
        // 정상적인 인증 코드가 있는 경우
        log("인증 코드 확인됨: " + authCode.substring(0, 10) + "...");
        
        // 가입된 네이버 사용자인지 확인
        const isRegisteredUser = checkNaverUser();
        
        // 사용자 상태에 따라 처리
        if (isRegisteredUser) {
            // 기존 사용자 로그인 - 바로 메인 페이지로 이동
            loginExistingUser(MOCK_NAVER_ID);
        } else {
            // 새 사용자 회원가입 - 바로 회원가입 페이지로 이동
            redirectToRegister();
        }
        
    } catch (error) {
        log("예외 발생: " + error.message);
        // 오류 시 바로 로그인 페이지로 이동
        window.location.replace("login.html");
    }
})();

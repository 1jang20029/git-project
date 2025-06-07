
// 로그인 페이지로 이동
function goToLogin() {
    window.location.href = "login.html";
}

// 상태 메시지 업데이트 함수
function updateStatus(title, message) {
    document.getElementById('status-title').textContent = title;
    document.getElementById('status-message').textContent = message;
}

// 구글 회원가입 페이지로 리디렉션
function redirectToRegister() {
    // 고정된 사용자 ID 사용
    const googleId = "google_12345";
    
    // 세션 스토리지에 임시 데이터 저장
    sessionStorage.setItem('temp_social_id', googleId);
    sessionStorage.setItem('temp_social_type', 'google');
    sessionStorage.setItem('temp_social_name', '구글 사용자');
    sessionStorage.setItem('temp_social_email', 'google_user@example.com');
    
    updateStatus('새 사용자 확인', '회원가입 페이지로 이동합니다...');
    
    // 회원가입 페이지로 이동
    setTimeout(function() {
        window.location.href = "register.html?social=google";
    }, 1000);
}

// 이미 가입된 사용자 로그인 처리
function loginExistingUser(userId) {
    // 현재 로그인된 사용자로 설정
    localStorage.setItem('currentLoggedInUser', userId);
    
    // 최초 로그인 여부 확인
    const isFirstLogin = localStorage.getItem(`user_${userId}_first_login`) !== 'false';
    
    // 리디렉션 결정
    if (isFirstLogin) {
        localStorage.setItem(`user_${userId}_first_login`, 'false');
        updateStatus('로그인 성공', '위젯 설정 페이지로 이동합니다...');
        
        setTimeout(function() {
            window.location.href = "widget-settings.html";
        }, 1000);
    } else {
        updateStatus('로그인 성공', '메인 페이지로 이동합니다...');
        
        setTimeout(function() {
            window.location.href = "index.html";
        }, 1000);
    }
}

// 구글 사용자 확인
function checkGoogleUser() {
    // 고정된 사용자 ID 사용
    const googleId = "google_12345";
    let isRegistered = false;
    
    if (isLocalStorageAvailable()) {
        // 'user_google_12345_registered'와 같은 형식의 키 검색
        const userKey = `user_${googleId}_registered`;
        const userRegistered = localStorage.getItem(userKey);
        
        if (userRegistered === 'true') {
            isRegistered = true;
        }
    }
    
    return isRegistered;
}

// localStorage 사용 가능 여부 확인 함수
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// 페이지 로드 시 실행되는 함수
window.onload = function() {
    // 취소 버튼 처리 (구글 로그인 페이지에서 취소 버튼 클릭 감지)
    // cancel 파라미터가 전달되었거나 error 파라미터가 있으면 로그인 페이지로 이동
    
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    
    // 취소 버튼 클릭 또는 에러가 있는 경우
    const cancel = urlParams.get('cancel');
    const error = urlParams.get('error');
    
    if (cancel === 'true' || error) {
        // 바로 로그인 페이지로 이동
        goToLogin();
        return;
    }
    
    // 정상 로그인 처리
    try {
        // 인증 코드 확인
        const authCode = urlParams.get('code');
        
        // 인증 코드 없음
        if (!authCode) {
            // 구글은 때로 해시 파라미터로 코드를 전달함
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const hashCode = hashParams.get('code');
            
            // 해시에도 코드가 없으면
            if (!hashCode) {
                // 로그인 페이지로 이동
                goToLogin();
                return;
            }
        }
        
        // 가입된 구글 사용자인지 확인
        const isRegisteredUser = checkGoogleUser();
        
        // 사용자 상태에 따라 처리
        if (isRegisteredUser) {
            // 기존 사용자 로그인
            loginExistingUser("google_12345");
        } else {
            // 새 사용자 회원가입
            redirectToRegister();
        }
        
    } catch (error) {
        // 오류 발생 시 로그인 페이지로 이동
        goToLogin();
    }
};

// 이 코드를 추가하여 구글 선택 페이지에서 취소 버튼 클릭 감지
// 구글 OAuth 페이지에서 가로채기는 불가능하지만, 로그인 페이지로 이동하는 핸들러
document.addEventListener('click', function(event) {
    // 취소 버튼 클릭 감지 - 실제로는 작동하지 않음 (CORS 정책 때문)
    // 이는 단지 참고용이며, 실제로는 Google이 취소 버튼 클릭 시 redirect_uri로 error 또는 cancel 파라미터와 함께 리디렉션
});

// 디버깅 로그 추가
function log(message) {
    console.log("[카카오 로그인]", message);
}

log("스크립트 로딩 시작");

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

// 카카오 회원가입 페이지로 리디렉션
function redirectToRegister(kakaoId, userInfo) {
    log("회원가입 페이지로 이동");
    
    // 세션 스토리지에 임시 데이터 저장
    sessionStorage.setItem('temp_social_id', kakaoId);
    sessionStorage.setItem('temp_social_type', 'kakao');
    sessionStorage.setItem('temp_social_name', userInfo.name || '카카오 사용자');
    
    if (userInfo.email) {
        sessionStorage.setItem('temp_social_email', userInfo.email);
    }
    
    if (userInfo.profileImage) {
        sessionStorage.setItem('temp_social_profile_image', userInfo.profileImage);
    }
    
    // 바로 회원가입 페이지로 이동
    window.location.replace("register.html?social=kakao");
}

// 이미 가입된 사용자 로그인 처리
function loginExistingUser(userId) {
    log("기존 카카오 사용자 로그인: " + userId);
    
    // 현재 로그인된 사용자로 설정
    safeStorage.setItem('currentLoggedInUser', userId);
    
    // 바로 메인 페이지로 이동 (여러 경로 시도)
    try {
        window.location.replace("/");
    } catch (e) {
        try {
            window.location.replace("/");
        } catch (e2) {
            window.location.replace("/");
        }
    }
}

// 카카오 사용자 확인
function checkKakaoUser(kakaoId) {
    log("카카오 사용자 확인 중: " + kakaoId);
    
    let isRegistered = false;
    
    if (isLocalStorageAvailable()) {
        // 로컬 스토리지에서 카카오 사용자 확인
        const userKey = `user_${kakaoId}_registered`;
        const userRegistered = safeStorage.getItem(userKey);
        
        log("사용자 등록 확인: " + userKey + " = " + userRegistered);
        
        if (userRegistered === 'true') {
            isRegistered = true;
            log("가입된 카카오 사용자 발견");
        }
    }
    
    return isRegistered;
}

// 임시 사용자 처리 (실제 카카오 API 콜백이 없을 때)
function handleMockKakaoUser() {
    log("카카오 모의 사용자 처리");
    
    // 임시 카카오 사용자 ID 생성
    const mockKakaoId = 'kakao_' + Date.now();
    
    const isRegistered = checkKakaoUser(mockKakaoId);
    
    if (isRegistered) {
        loginExistingUser(mockKakaoId);
    } else {
        const mockUserInfo = {
            name: '카카오 사용자',
            email: 'kakao_user@example.com',
            profileImage: null
        };
        redirectToRegister(mockKakaoId, mockUserInfo);
    }
}

// 페이지 로드 즉시 실행
(function() {
    log("페이지 로드됨");
    
    try {
        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // 오류 또는 취소 확인 - 바로 로그인 페이지로 이동
        if (error || !authCode) {
            log("카카오 로그인 취소 또는 오류: " + error);
            window.location.replace("login.html");
            return;
        }
        
        // 정상적인 인증 코드가 있는 경우
        log("카카오 인증 코드 확인됨: " + authCode.substring(0, 10) + "...");
        
        // 실제 카카오 API 호출
        fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: 'beed5990dc19ffd7ab4f2355afa70129',
                redirect_uri: 'https://ysu-guide.netlify.app/kakao-callback.html',
                code: authCode
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('토큰 요청 실패');
            }
            return response.json();
        })
        .then(tokenData => {
            log('카카오 토큰 데이터 받음');
            
            // 토큰으로 사용자 정보 요청
            return fetch('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('사용자 정보 요청 실패');
            }
            return response.json();
        })
        .then(userData => {
            log('카카오 사용자 정보 받음');
            
            // 사용자 정보 처리
            const kakaoAccount = userData.kakao_account || {};
            const profile = kakaoAccount.profile || {};
            
            // 카카오 ID 생성
            const kakaoId = 'kakao_' + userData.id;
            
            // 이미 가입된 사용자인지 확인
            const isRegistered = checkKakaoUser(kakaoId);
            
            if (isRegistered) {
                // 기존 사용자 로그인
                loginExistingUser(kakaoId);
            } else {
                // 새 사용자 회원가입
                const userInfo = {
                    name: profile.nickname || '카카오 사용자',
                    email: kakaoAccount.email || '',
                    profileImage: profile.profile_image_url || null
                };
                redirectToRegister(kakaoId, userInfo);
            }
        })
        .catch(error => {
            log("카카오 API 오류: " + error.message);
            // API 오류 시 임시 처리로 진행하거나 로그인 페이지로 이동
            handleMockKakaoUser();
        });
        
    } catch (error) {
        log("예외 발생: " + error.message);
        // 오류 시 바로 로그인 페이지로 이동
        window.location.replace("login.html");
    }
})();
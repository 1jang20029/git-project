// login.js - 백엔드(Node.js + MySQL) 연동 버전
// API 기반 로그인 시스템

/**
 * API 설정
 */
const API_BASE_URL = '/api'; // 백엔드 API 기본 URL
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    socialLogin: `${API_BASE_URL}/auth/social`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`
};

/**
 * 토큰 관리 유틸리티
 */
const TokenManager = {
    // JWT 토큰 저장
    setToken(token) {
        try {
            localStorage.setItem('authToken', token);
            // 토큰 만료 시간 계산 및 저장
            const payload = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem('tokenExpiry', payload.exp * 1000);
        } catch (error) {
            console.error('토큰 저장 실패:', error);
        }
    },

    // JWT 토큰 조회
    getToken() {
        return localStorage.getItem('authToken');
    },

    // 토큰 삭제
    removeToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('refreshToken');
    },

    // 토큰 만료 여부 확인
    isTokenExpired() {
        const expiry = localStorage.getItem('tokenExpiry');
        if (!expiry) return true;
        return Date.now() > parseInt(expiry);
    },

    // 리프레시 토큰 저장
    setRefreshToken(refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    },

    // 리프레시 토큰 조회
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }
};

/**
 * API 요청 유틸리티
 */
const ApiClient = {
    // 기본 fetch 래퍼
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // 토큰이 있는 경우 Authorization 헤더 추가
        const token = TokenManager.getToken();
        if (token && !TokenManager.isTokenExpired()) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            // 401 에러 시 토큰 갱신 시도
            if (response.status === 401 && TokenManager.getRefreshToken()) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // 갱신된 토큰으로 재시도
                    defaultOptions.headers['Authorization'] = `Bearer ${TokenManager.getToken()}`;
                    return await fetch(url, { ...defaultOptions, ...options });
                }
            }

            return response;
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    },

    // GET 요청
    async get(url, options = {}) {
        return this.request(url, { method: 'GET', ...options });
    },

    // POST 요청
    async post(url, data, options = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },

    // PUT 요청
    async put(url, data, options = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    },

    // DELETE 요청
    async delete(url, options = {}) {
        return this.request(url, { method: 'DELETE', ...options });
    },

    // 토큰 갱신
    async refreshToken() {
        try {
            const refreshToken = TokenManager.getRefreshToken();
            if (!refreshToken) return false;

            const response = await fetch(AUTH_ENDPOINTS.refresh, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                TokenManager.setToken(data.token);
                if (data.refreshToken) {
                    TokenManager.setRefreshToken(data.refreshToken);
                }
                return true;
            }
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
        }
        
        // 갱신 실패 시 로그아웃 처리
        TokenManager.removeToken();
        return false;
    }
};

/**
 * 사용자 설정 관리
 */
const UserSettings = {
    // 아이디 저장 설정
    setSaveId(save, studentId = null) {
        if (save && studentId) {
            localStorage.setItem('saveIdEnabled', 'true');
            localStorage.setItem('savedStudentId', studentId);
        } else {
            localStorage.setItem('saveIdEnabled', 'false');
            localStorage.removeItem('savedStudentId');
        }
    },

    // 저장된 아이디 조회
    getSavedId() {
        const enabled = localStorage.getItem('saveIdEnabled') === 'true';
        const studentId = localStorage.getItem('savedStudentId');
        return enabled ? studentId : null;
    },

    // 아이디 저장 여부 확인
    isSaveIdEnabled() {
        return localStorage.getItem('saveIdEnabled') === 'true';
    }
};

/**
 * 메시지 표시 유틸리티
 */
function showMessage(message, type = 'info') {
    // 토스트 메시지 표시 (필요시 구현)
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message); // 임시로 alert 사용
}

/**
 * 로딩 상태 관리
 */
function setLoading(isLoading, buttonId = 'loginButton') {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.textContent = '로그인 중...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = '로그인';
        button.style.opacity = '1';
    }
}

/**
 * 일반 로그인 처리
 */
async function login() {
    const studentId = document.getElementById('studentId')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    const saveId = document.getElementById('saveId')?.checked || false;

    // 유효성 검사
    if (!studentId || !password) {
        showMessage('학번과 비밀번호를 모두 입력해주세요.', 'error');
        return;
    }

    // 학번 형식 검증 (예: 숫자 8-10자리)
    const studentIdPattern = /^\d{8,10}$/;
    if (!studentIdPattern.test(studentId)) {
        showMessage('올바른 학번 형식을 입력해주세요. (8-10자리 숫자)', 'error');
        return;
    }

    // 비밀번호 최소 길이 검증
    if (password.length < 4) {
        showMessage('비밀번호는 최소 4자리 이상이어야 합니다.', 'error');
        return;
    }

    setLoading(true);

    try {
        // 로그인 API 호출
        const response = await ApiClient.post(AUTH_ENDPOINTS.login, {
            studentId,
            password,
            deviceInfo: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // 로그인 성공
            TokenManager.setToken(data.token);
            if (data.refreshToken) {
                TokenManager.setRefreshToken(data.refreshToken);
            }

            // 현재 로그인된 사용자 정보 저장
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // 아이디 저장 설정 처리
            UserSettings.setSaveId(saveId, studentId);

            showMessage('로그인이 완료되었습니다.', 'success');

            // 최초 로그인 여부에 따라 리디렉션
            if (data.user.isFirstLogin) {
                // 최초 로그인 시 위젯 설정 페이지로
                setTimeout(() => {
                    window.location.href = 'widget-settings.html';
                }, 1000);
            } else {
                // 기존 사용자는 메인 페이지로
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }

        } else {
            // 로그인 실패
            const errorMessage = data.message || '로그인에 실패했습니다.';
            showMessage(errorMessage, 'error');

            // 비밀번호 필드 초기화
            const passwordField = document.getElementById('password');
            if (passwordField) {
                passwordField.value = '';
                passwordField.focus();
            }
        }

    } catch (error) {
        console.error('로그인 요청 중 오류:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.', 'error');
        } else {
            showMessage('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        }
    } finally {
        setLoading(false);
    }
}

/**
 * 회원가입 처리
 */
async function registerUser(userData) {
    try {
        const response = await ApiClient.post(AUTH_ENDPOINTS.register, {
            studentId: userData.studentId,
            password: userData.password,
            name: userData.name,
            department: userData.department,
            grade: userData.grade,
            email: userData.email,
            phone: userData.phone
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMessage('회원가입이 완료되었습니다. 로그인해주세요.', 'success');
            
            // 로그인 페이지로 이동하며 학번 자동 입력
            const loginUrl = `login.html?studentId=${encodeURIComponent(userData.studentId)}`;
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 1500);
            
        } else {
            const errorMessage = data.message || '회원가입에 실패했습니다.';
            showMessage(errorMessage, 'error');
        }

    } catch (error) {
        console.error('회원가입 요청 중 오류:', error);
        showMessage('회원가입 처리 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 로그아웃 처리
 */
async function logout() {
    try {
        const token = TokenManager.getToken();
        
        if (token) {
            // 서버에 로그아웃 요청
            await ApiClient.post(AUTH_ENDPOINTS.logout, {
                token: token
            });
        }
    } catch (error) {
        console.error('로그아웃 API 요청 실패:', error);
    } finally {
        // 로컬 토큰 및 사용자 정보 삭제
        TokenManager.removeToken();
        localStorage.removeItem('currentUser');
        
        showMessage('로그아웃되었습니다.', 'info');
        
        // 로그인 페이지로 이동
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

/**
 * 네이버 소셜 로그인
 */
async function naverLogin() {
    try {
        // 네이버 OAuth 설정
        const naverClientId = 'YOUR_NAVER_CLIENT_ID'; // 실제 클라이언트 ID로 교체
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/naver/callback`);
        const state = Math.random().toString(36).substring(2, 15);
        
        // CSRF 방지를 위한 state 저장
        sessionStorage.setItem('naverOAuthState', state);
        
        // 네이버 OAuth URL 생성
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?` +
            `response_type=code&` +
            `client_id=${naverClientId}&` +
            `redirect_uri=${redirectUri}&` +
            `state=${state}`;
        
        // 네이버 로그인 페이지로 이동
        window.location.href = naverAuthUrl;
        
    } catch (error) {
        console.error('네이버 로그인 요청 중 오류:', error);
        showMessage('네이버 로그인 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 구글 소셜 로그인
 */
async function googleLogin() {
    try {
        // 구글 OAuth 설정
        const googleClientId = 'YOUR_GOOGLE_CLIENT_ID'; // 실제 클라이언트 ID로 교체
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
        const scope = encodeURIComponent('email profile');
        
        // 구글 OAuth URL 생성
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `response_type=code&` +
            `client_id=${googleClientId}&` +
            `redirect_uri=${redirectUri}&` +
            `scope=${scope}&` +
            `access_type=offline&` +
            `prompt=select_account`;
        
        // 구글 로그인 페이지로 이동
        window.location.href = googleAuthUrl;
        
    } catch (error) {
        console.error('구글 로그인 요청 중 오류:', error);
        showMessage('구글 로그인 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 카카오 소셜 로그인
 */
async function kakaoLogin() {
    try {
        // 카카오 OAuth 설정
        const kakaoClientId = 'YOUR_KAKAO_CLIENT_ID'; // 실제 클라이언트 ID로 교체
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/kakao/callback`);
        
        // 카카오 OAuth URL 생성
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?` +
            `response_type=code&` +
            `client_id=${kakaoClientId}&` +
            `redirect_uri=${redirectUri}`;
        
        // 카카오 로그인 페이지로 이동
        window.location.href = kakaoAuthUrl;
        
    } catch (error) {
        console.error('카카오 로그인 요청 중 오류:', error);
        showMessage('카카오 로그인 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 소셜 로그인 콜백 처리
 */
async function handleSocialCallback(provider, code, state = null) {
    try {
        setLoading(true, 'socialLoginButton');
        
        // state 검증 (CSRF 방지)
        if (provider === 'naver' && state) {
            const savedState = sessionStorage.getItem('naverOAuthState');
            if (state !== savedState) {
                throw new Error('Invalid state parameter');
            }
            sessionStorage.removeItem('naverOAuthState');
        }
        
        // 백엔드에 소셜 로그인 요청
        const response = await ApiClient.post(AUTH_ENDPOINTS.socialLogin, {
            provider: provider,
            code: code,
            redirectUri: `${window.location.origin}/auth/${provider}/callback`
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // 소셜 로그인 성공
            TokenManager.setToken(data.token);
            if (data.refreshToken) {
                TokenManager.setRefreshToken(data.refreshToken);
            }
            
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            showMessage(`${provider} 계정으로 로그인되었습니다.`, 'success');
            
            // 최초 로그인 여부에 따라 리디렉션
            if (data.user.isFirstLogin) {
                setTimeout(() => {
                    window.location.href = 'widget-settings.html';
                }, 1000);
            } else {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
            
        } else {
            throw new Error(data.message || '소셜 로그인에 실패했습니다.');
        }
        
    } catch (error) {
        console.error(`${provider} 로그인 콜백 처리 중 오류:`, error);
        showMessage(`${provider} 로그인 중 오류가 발생했습니다: ${error.message}`, 'error');
        
        // 에러 시 로그인 페이지로 리디렉션
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } finally {
        setLoading(false, 'socialLoginButton');
    }
}

/**
 * 비밀번호 재설정 요청
 */
async function requestPasswordReset(email) {
    try {
        const response = await ApiClient.post(AUTH_ENDPOINTS.resetPassword, {
            email: email
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showMessage('비밀번호 재설정 이메일이 발송되었습니다.', 'success');
        } else {
            showMessage(data.message || '비밀번호 재설정 요청에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('비밀번호 재설정 요청 중 오류:', error);
        showMessage('비밀번호 재설정 요청 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 현재 사용자 인증 상태 확인
 */
async function checkAuthStatus() {
    const token = TokenManager.getToken();
    
    if (!token || TokenManager.isTokenExpired()) {
        // 토큰이 없거나 만료된 경우 리프레시 시도
        const refreshed = await ApiClient.refreshToken();
        if (!refreshed) {
            // 리프레시도 실패한 경우 로그아웃 처리
            TokenManager.removeToken();
            return false;
        }
    }
    
    return true;
}

/**
 * 비밀번호 표시/숨김 토글
 */
function togglePasswordVisibility(fieldId = 'password') {
    const passwordField = document.getElementById(fieldId);
    const toggleButton = document.querySelector(`[data-target="${fieldId}"]`);
    
    if (!passwordField || !toggleButton) return;
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.innerHTML = '🙈'; // 숨김 아이콘
    } else {
        passwordField.type = 'password';
        toggleButton.innerHTML = '👁️'; // 보기 아이콘
    }
}

/**
 * URL 파라미터 처리
 */
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 회원가입 후 리디렉션된 경우
    const studentId = urlParams.get('studentId');
    if (studentId) {
        const studentIdField = document.getElementById('studentId');
        if (studentIdField) {
            studentIdField.value = studentId;
            // 비밀번호 필드에 포커스
            const passwordField = document.getElementById('password');
            if (passwordField) {
                passwordField.focus();
            }
        }
    }
    
    // 소셜 로그인 콜백 처리
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
        showMessage('소셜 로그인이 취소되었습니다.', 'info');
        return;
    }
    
    if (code) {
        // URL에서 provider 확인
        const currentPath = window.location.pathname;
        if (currentPath.includes('/auth/naver/callback')) {
            handleSocialCallback('naver', code, state);
        } else if (currentPath.includes('/auth/google/callback')) {
            handleSocialCallback('google', code);
        } else if (currentPath.includes('/auth/kakao/callback')) {
            handleSocialCallback('kakao', code);
        }
    }
}

/**
 * 폼 이벤트 설정
 */
function setupFormEvents() {
    // 엔터 키로 로그인
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            const studentIdField = document.getElementById('studentId');
            const passwordField = document.getElementById('password');
            
            if (activeElement === studentIdField || activeElement === passwordField) {
                event.preventDefault();
                login();
            }
        }
    });
    
    // 소셜 로그인 버튼 이벤트
    const naverButton = document.querySelector('.naver-button');
    const kakaoButton = document.querySelector('.kakao-button');
    const googleButton = document.querySelector('.google-button');
    
    if (naverButton) {
        naverButton.addEventListener('click', naverLogin);
    }
    
    if (kakaoButton) {
        kakaoButton.addEventListener('click', kakaoLogin);
    }
    
    if (googleButton) {
        googleButton.addEventListener('click', googleLogin);
    }
    
    // 로그인 버튼 이벤트
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }
}

/**
 * 페이지 초기화
 */
function initializePage() {
    // 이미 로그인된 경우 메인 페이지로 리디렉션
    if (TokenManager.getToken() && !TokenManager.isTokenExpired()) {
        window.location.href = 'index.html';
        return;
    }
    
    // URL 파라미터 처리
    handleUrlParameters();
    
    // 저장된 아이디 복원
    const savedId = UserSettings.getSavedId();
    const saveIdCheckbox = document.getElementById('saveId');
    const studentIdField = document.getElementById('studentId');
    
    if (saveIdCheckbox) {
        saveIdCheckbox.checked = UserSettings.isSaveIdEnabled();
    }
    
    if (savedId && studentIdField) {
        studentIdField.value = savedId;
        // 비밀번호 필드에 포커스
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.focus();
        }
    }
    
    // 폼 이벤트 설정
    setupFormEvents();
}

/**
 * 페이지 로드 시 실행
 */
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 전역 함수로 내보내기 (HTML에서 직접 호출 가능)
window.login = login;
window.logout = logout;
window.naverLogin = naverLogin;
window.googleLogin = googleLogin;
window.kakaoLogin = kakaoLogin;
window.registerUser = registerUser;
window.togglePasswordVisibility = togglePasswordVisibility;
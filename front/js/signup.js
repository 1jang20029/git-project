/* =============================================================================
   signup.js - 연성대학교 회원가입 페이지 JavaScript
   ============================================================================= */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] 회원가입 페이지 로드 완료');
    
    // 초기화
    initializeSignupPage();
});

/* =========================
   이메일 인증 데이터 관리
   ========================= */
let emailVerificationData = {
    code: null,
    email: null,
    expiry: null,
    verified: false,
    timerInterval: null,
    attempts: 0,
    maxAttempts: 5,
    isProcessing: false,
    verificationId: null
};

/* =========================
   페이지 초기화
   ========================= */
function initializeSignupPage() {
    // DOM 요소 초기화
    initializeDOMElements();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 드롭다운 초기화
    setupDepartmentSearch();
    setupGradeDropdown();
    
    // 역할별 UI 초기화
    updateUIByRole('student');
    
    // 소셜 로그인 처리
    handleSocialSignup();
    
    console.log('✅ 회원가입 페이지 초기화 완료');
}

/* =========================
   DOM 요소 초기화
   ========================= */
function initializeDOMElements() {
    // 이메일 인증 관련 요소들 초기 상태 설정
    const elements = {
        codeGroup: document.getElementById('verificationCodeGroup'),
        timerDiv: document.getElementById('verificationTimer'),
        emailErrorDiv: document.getElementById('verification-email-error'),
        codeErrorDiv: document.getElementById('verification-code-error'),
        successDiv: document.getElementById('verification-success'),
        verifyBtn: document.getElementById('verifyCodeBtn')
    };
    
    // 초기 상태 설정
    if (elements.codeGroup) elements.codeGroup.style.display = 'none';
    if (elements.timerDiv) elements.timerDiv.style.display = 'none';
    if (elements.emailErrorDiv) elements.emailErrorDiv.style.display = 'none';
    if (elements.codeErrorDiv) elements.codeErrorDiv.style.display = 'none';
    if (elements.successDiv) elements.successDiv.style.display = 'none';
    if (elements.verifyBtn) elements.verifyBtn.disabled = true;
}

/* =========================
   이벤트 리스너 설정
   ========================= */
function setupEventListeners() {
    // 폼 제출 이벤트
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // 역할 변경 이벤트
    document.querySelectorAll('input[name="userRole"]').forEach(radio => {
        radio.addEventListener('change', (e) => updateUIByRole(e.target.value));
    });
    
    // 이메일 인증 관련 이벤트
    const sendBtn = document.getElementById('sendVerificationBtn');
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    
    if (sendBtn) sendBtn.addEventListener('click', sendVerificationEmail);
    if (codeInput) codeInput.addEventListener('input', validateVerificationCode);
    if (verifyBtn) verifyBtn.addEventListener('click', verifyEmailCode);
    
    // 휴대폰 번호 포맷팅
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            formatPhoneNumber(e.target);
        });
    }
    
    // 실시간 유효성 검사
    const inputs = ['studentId', 'name', 'password', 'confirmPassword', 'phone', 'email'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', () => validateField(id));
            input.addEventListener('input', () => clearError(id));
        }
    });
}

/* =========================
   뒤로가기 함수
   ========================= */
function goBack() {
    // 소셜 로그인 중이었다면 세션 데이터 정리
    const socialType = new URLSearchParams(window.location.search).get('social');
    if (socialType) {
        const confirmMsg = '회원가입을 취소하고 로그인 페이지로 돌아가시겠습니까?\n입력하신 정보는 저장되지 않습니다.';
        if (confirm(confirmMsg)) {
            // 소셜 로그인 임시 데이터 정리
            ['temp_social_id', 'temp_social_type', 'temp_social_name', 'temp_social_email', 'temp_social_profile_image']
                .forEach(key => sessionStorage.removeItem(key));
            window.location.href = 'login.html';
        }
    } else {
        // 일반 회원가입인 경우
        const hasData = checkFormData();
        
        if (hasData) {
            const confirmMsg = '입력하신 정보가 있습니다. 정말 로그인 페이지로 돌아가시겠습니까?\n입력하신 정보는 저장되지 않습니다.';
            if (confirm(confirmMsg)) {
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    }
}

/* =========================
   폼 데이터 확인
   ========================= */
function checkFormData() {
    const fields = ['studentId', 'name', 'email', 'phone'];
    return fields.some(id => {
        const element = document.getElementById(id);
        return element && element.value.trim();
    });
}

/* =========================
   역할별 UI 업데이트
   ========================= */
function updateUIByRole(role) {
    console.log('[DEBUG] 역할 변경:', role);
    
    // 라벨 및 플레이스홀더 설정
    const labels = {
        student: ['학번', '학번을 입력하세요', '예: 2024123456 (10자리)'],
        professor: ['교번', '교번을 입력하세요', '예: 2024001 (7자리)'],
        staff: ['직번', '직번을 입력하세요', '예: 2024001 (7자리)']
    };
    
    const [labelText, placeholder, hint] = labels[role];
    
    // UI 요소 업데이트
    const idLabel = document.getElementById('idLabel');
    const studentIdInput = document.getElementById('studentId');
    const idHint = document.getElementById('idHint');
    const gradeGroup = document.getElementById('gradeGroup');
    const emailVerificationSection = document.getElementById('emailVerificationSection');
    
    if (idLabel) idLabel.textContent = labelText;
    if (studentIdInput) {
        studentIdInput.placeholder = placeholder;
        studentIdInput.value = '';
    }
    if (idHint) idHint.textContent = hint;
    
    // 학년 필드는 학생만 표시
    if (gradeGroup) {
        gradeGroup.style.display = role === 'student' ? 'block' : 'none';
    }
    
    // 이메일 인증은 교수/교직원만 표시
    if (emailVerificationSection) {
        emailVerificationSection.style.display = role !== 'student' ? 'block' : 'none';
    }
    
    // 교직원 부서 옵션 표시/숨김
    document.querySelectorAll('.staff-option, .staff-departments').forEach(el => {
        el.style.display = role === 'staff' ? 'block' : 'none';
    });
    
    // 이메일 인증 데이터 초기화
    resetEmailVerification();
    
    // 학과 입력 초기화
    const departmentInput = document.getElementById('departmentInput');
    if (departmentInput) departmentInput.value = '';
    
    // 에러 메시지 초기화
    clearAllErrors();
}

/* =========================
   이메일 인증 초기화
   ========================= */
function resetEmailVerification() {
    // 타이머 정리
    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }
    
    // 데이터 초기화
    emailVerificationData = {
        code: null,
        email: null,
        expiry: null,
        verified: false,
        timerInterval: null,
        attempts: 0,
        maxAttempts: 5,
        isProcessing: false,
        verificationId: null
    };
    
    // UI 초기화
    const emailInput = document.getElementById('verificationEmail');
    const codeInput = document.getElementById('verificationCode');
    const sendBtn = document.getElementById('sendVerificationBtn');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const codeGroup = document.getElementById('verificationCodeGroup');
    const timerDiv = document.getElementById('verificationTimer');
    const successDiv = document.getElementById('verification-success');
    
    if (emailInput) {
        emailInput.value = '';
        emailInput.disabled = false;
    }
    if (codeInput) {
        codeInput.value = '';
        codeInput.disabled = false;
    }
    if (sendBtn) {
        sendBtn.textContent = '인증코드 발송';
        sendBtn.disabled = false;
    }
    if (verifyBtn) {
        verifyBtn.textContent = '인증확인';
        verifyBtn.disabled = true;
    }
    if (codeGroup) codeGroup.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    // 에러 메시지 숨김
    hideError('verification-email-error');
    hideError('verification-code-error');
}

/* =========================
   이메일 인증 코드 발송
   ========================= */
async function sendVerificationEmail() {
    if (emailVerificationData.isProcessing) return;

    const emailInput = document.getElementById('verificationEmail');
    const sendBtn = document.getElementById('sendVerificationBtn');
    const email = emailInput.value.trim();
    
    hideError('verification-email-error');

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@yeonsung\.ac\.kr$/i;
    if (!emailRegex.test(email)) {
        showError('verification-email-error', '연성대학교 공식 이메일(@yeonsung.ac.kr)을 입력해주세요');
        return;
    }
    
    if (emailVerificationData.attempts >= emailVerificationData.maxAttempts) {
        alert('❌ 최대 발송 횟수를 초과했습니다.\n새로고침 후 다시 시도해주세요.');
        return;
    }

    emailVerificationData.isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '발송 중...';

    try {
        // 실제 환경에서는 서버 API 호출
        // const response = await fetch('/api/send-verification-code', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email })
        // });
        
        // 시뮬레이션을 위한 임시 코드
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 임시 인증 코드 생성 (실제로는 서버에서 생성)
        const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        emailVerificationData.attempts++;
        emailVerificationData.email = email;
        emailVerificationData.code = tempCode;
        emailVerificationData.expiry = new Date(Date.now() + 5 * 60 * 1000); // 5분 후
        emailVerificationData.verificationId = 'temp_' + Date.now();
        emailVerificationData.verified = false;
        
        // UI 업데이트
        const codeGroup = document.getElementById('verificationCodeGroup');
        const successDiv = document.getElementById('verification-success');
        
        if (codeGroup) codeGroup.style.display = 'block';
        if (successDiv) {
            successDiv.textContent = `✅ 인증코드가 ${email}로 발송되었습니다.`;
            successDiv.style.display = 'block';
        }
        
        startVerificationTimer();
        
        // 개발용 로그
        console.log(`[DEBUG] 인증코드: ${tempCode}`);
        
    } catch (error) {
        console.error('이메일 발송 오류:', error);
        showError('verification-email-error', '이메일 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
        emailVerificationData.isProcessing = false;
        sendBtn.disabled = false;
        sendBtn.textContent = '재발송';
    }
}

/* =========================
   인증 타이머 시작
   ========================= */
function startVerificationTimer() {
    const timerDiv = document.getElementById('verificationTimer');
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (timerDiv) timerDiv.style.display = 'block';
    
    clearInterval(emailVerificationData.timerInterval);
    emailVerificationData.timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((emailVerificationData.expiry - now) / 1000));
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timerDisplay) {
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(emailVerificationData.timerInterval);
            if (timerDiv) timerDiv.style.display = 'none';
            showError('verification-code-error', '⏰ 인증 시간이 만료되었습니다. 다시 발송해주세요.');
            const verifyBtn = document.getElementById('verifyCodeBtn');
            if (verifyBtn) verifyBtn.disabled = true;
        }
    }, 1000);
}

/* =========================
   인증 코드 실시간 검증
   ========================= */
function validateVerificationCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const code = codeInput.value.trim();
    
    if (/^\d{6}$/.test(code)) {
        verifyBtn.disabled = false;
        hideError('verification-code-error');
    } else {
        verifyBtn.disabled = true;
        if (code.length > 0) {
            showError('verification-code-error', '6자리 숫자를 입력해주세요');
        } else {
            hideError('verification-code-error');
        }
    }
}

/* =========================
   인증 코드 확인
   ========================= */
async function verifyEmailCode() {
    if (emailVerificationData.isProcessing) return;

    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const code = codeInput.value.trim();
    
    hideError('verification-code-error');

    if (!/^\d{6}$/.test(code)) {
        showError('verification-code-error', '6자리 숫자를 입력해주세요.');
        return;
    }

    emailVerificationData.isProcessing = true;
    verifyBtn.disabled = true;
    verifyBtn.textContent = '확인 중...';

    try {
        // 시뮬레이션을 위한 임시 검증
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (code === emailVerificationData.code) {
            // 인증 성공
            emailVerificationData.verified = true;
            clearInterval(emailVerificationData.timerInterval);

            codeInput.disabled = true;
            verifyBtn.textContent = '인증완료';
            
            const successDiv = document.getElementById('verification-success');
            const timerDiv = document.getElementById('verificationTimer');
            
            if (successDiv) {
                successDiv.textContent = '✅ 이메일 인증이 완료되었습니다';
                successDiv.style.display = 'block';
            }
            if (timerDiv) timerDiv.style.display = 'none';
            
            alert('✅ 이메일 인증이 완료되었습니다!');
        } else {
            throw new Error('인증코드가 일치하지 않습니다.');
        }
    } catch (error) {
        console.error('인증 확인 오류:', error);
        showError('verification-code-error', error.message || '인증 실패');
        verifyBtn.disabled = false;
        verifyBtn.textContent = '인증확인';
        codeInput.focus();
    } finally {
        emailVerificationData.isProcessing = false;
    }
}

/* =========================
   학과 검색 드롭다운
   ========================= */
function setupDepartmentSearch() {
    const departmentInput = document.getElementById('departmentInput');
    const dropdown = document.getElementById('departmentDropdown');
    const options = dropdown.querySelectorAll('.department-option');
    const selectedDepartment = document.getElementById('selectedDepartment');
    
    // 입력 시 검색
    departmentInput.addEventListener('input', () => {
        const searchTerm = departmentInput.value.toLowerCase();
        
        if (searchTerm) {
            dropdown.style.display = 'block';
            
            // 카테고리 숨김
            dropdown.querySelectorAll('.department-category').forEach(cat => {
                cat.style.display = 'none';
            });
            
            // 옵션 필터링
            options.forEach(option => {
                const isMatch = option.textContent.toLowerCase().includes(searchTerm);
                option.style.display = isMatch ? 'block' : 'none';
                
                // 매치되는 옵션이 있으면 해당 카테고리 표시
                if (isMatch) {
                    let prev = option.previousElementSibling;
                    while (prev) {
                        if (prev.classList.contains('department-category')) {
                            prev.style.display = 'block';
                            break;
                        }
                        prev = prev.previousElementSibling;
                    }
                }
            });
        } else {
            dropdown.style.display = 'none';
        }
    });
    
    // 포커스 시 드롭다운 표시
    departmentInput.addEventListener('focus', () => {
        if (!departmentInput.value) {
            dropdown.style.display = 'block';
        }
    });
    
    // 옵션 클릭 시 선택
    options.forEach(option => {
        option.addEventListener('click', () => {
            departmentInput.value = option.textContent;
            selectedDepartment.value = option.dataset.value;
            dropdown.style.display = 'none';
            clearError('department');
        });
    });
    
    // 외부 클릭 시 드롭다운 숨김
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.department-container')) {
            dropdown.style.display = 'none';
        }
    });
}

/* =========================
   학년 드롭다운
   ========================= */
function setupGradeDropdown() {
    const gradeButton = document.getElementById('gradeDropdownBtn');
    const gradeDropdown = document.getElementById('gradeDropdown');
    const selectedGrade = document.getElementById('selectedGrade');
    
    if (!gradeButton || !gradeDropdown) return;
    
    // 버튼 클릭 시 드롭다운 토글
    gradeButton.addEventListener('click', () => {
        gradeDropdown.classList.toggle('show');
    });
    
    // 옵션 클릭 시 선택
    gradeDropdown.querySelectorAll('.grade-option').forEach(option => {
        option.addEventListener('click', () => {
            gradeButton.textContent = option.textContent;
            selectedGrade.value = option.dataset.value;
            gradeDropdown.classList.remove('show');
            clearError('grade');
        });
    });
    
    // 외부 클릭 시 드롭다운 숨김
    window.addEventListener('click', (e) => {
        if (!e.target.matches('.grade-button') && !e.target.matches('.grade-option')) {
            gradeDropdown.classList.remove('show');
        }
    });
}

/* =========================
   휴대폰 번호 포맷팅
   ========================= */
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // 숫자만 추출
    
    let formatted = '';
    if (value.length < 4) {
        formatted = value;
    } else if (value.length < 8) {
        formatted = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    input.value = formatted;
}

/* =========================
   폼 제출 처리
   ========================= */
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('[DEBUG] 폼 제출 시작');
    
    if (validateForm()) {
        register();
    }
}

/* =========================
   폼 유효성 검사
   ========================= */
function validateForm() {
    let isValid = true;
    
    // 역할 확인
    const roleEl = document.querySelector('input[name="userRole"]:checked');
    if (!roleEl) {
        alert('역할을 선택해주세요.');
        return false;
    }
    const role = roleEl.value;
    
    // 필수 필드 검사
    const requiredFields = ['studentId', 'name', 'phone', 'email'];
    
    requiredFields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });
    
    // 비밀번호 검사 (소셜 로그인이 아닌 경우)
    const socialType = new URLSearchParams(window.location.search).get('social');
    if (!socialType) {
        if (!validateField('password') || !validateField('confirmPassword')) {
            isValid = false;
        }
    }
    
    // 학과 검사
    const department = document.getElementById('selectedDepartment').value || 
                      document.getElementById('departmentInput').value.trim();
    if (!department) {
        showError('department-error', '학과/부서를 선택해주세요');
        isValid = false;
    }
    
    // 학년 검사 (학생인 경우)
    if (role === 'student') {
        const grade = document.getElementById('selectedGrade').value;
        if (!grade) {
            showError('grade-error', '학년을 선택해주세요');
            isValid = false;
        }
    }
    
    // 이메일 인증 검사 (교수/교직원인 경우)
    if (role !== 'student' && !emailVerificationData.verified) {
        showError('verification-email-error', '이메일 인증이 필요합니다');
        isValid = false;
    }
    
    // 약관 동의 검사
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const agreePrivacy = document.getElementById('agreePrivacy').checked;
    
    if (!agreeTerms || !agreePrivacy) {
        alert('필수 약관에 동의해주세요.');
        isValid = false;
    }
    
    return isValid;
}

/* =========================
   개별 필드 유효성 검사
   ========================= */
function validateField(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return true;
    
    const value = element.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldId) {
        case 'studentId':
            const role = document.querySelector('input[name="userRole"]:checked')?.value || 'student';
            if (!value) {
                errorMessage = '필수 입력 항목입니다';
                isValid = false;
            } else if (role === 'student' && !/^\d{10}$/.test(value)) {
                errorMessage = '10자리 숫자로 입력해주세요 (예: 2024123456)';
                isValid = false;
            } else if ((role === 'professor' || role === 'staff') && !/^\d{7}$/.test(value)) {
                errorMessage = '7자리 숫자로 입력해주세요 (예: 2024001)';
                isValid = false;
            }
            break;
            
        case 'name':
            if (!value) {
                errorMessage = '이름을 입력해주세요';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = '이름은 2자 이상 입력해주세요';
                isValid = false;
            }
            break;
            
        case 'password':
            if (!value) {
                errorMessage = '비밀번호를 입력해주세요';
                isValid = false;
            } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value)) {
                errorMessage = '영문, 숫자, 특수문자를 포함한 8자 이상 입력해주세요';
                isValid = false;
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password')?.value;
            if (!value) {
                errorMessage = '비밀번호 확인을 입력해주세요';
                isValid = false;
            } else if (value !== password) {
                errorMessage = '비밀번호가 일치하지 않습니다';
                isValid = false;
            }
            break;
            
        case 'phone':
            const cleanPhone = value.replace(/\D/g, '');
            if (!value) {
                errorMessage = '휴대폰 번호를 입력해주세요';
                isValid = false;
            } else if (!cleanPhone.startsWith('010') || cleanPhone.length !== 11) {
                errorMessage = '010으로 시작하는 11자리 번호를 입력해주세요';
                isValid = false;
            }
            break;
            
        case 'email':
            if (!value) {
                errorMessage = '이메일을 입력해주세요';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorMessage = '올바른 이메일 형식을 입력해주세요';
                isValid = false;
            }
            break;
    }
    
    if (isValid) {
        clearError(fieldId);
    } else {
        showError(fieldId + '-error', errorMessage);
    }
    
    return isValid;
}

/* =========================
   회원가입 처리
   ========================= */
function register() {
    console.log('[DEBUG] 회원가입 처리 시작');
    
    // 폼 데이터 수집
    const formData = collectFormData();
    
    if (!formData) {
        console.error('[ERROR] 폼 데이터 수집 실패');
        return;
    }
    
    // 로컬 스토리지에 저장 (실제로는 서버 API 호출)
    try {
        saveUserData(formData);
        
        // 성공 메시지
        let message = '🎉 회원가입이 완료되었습니다!';
        if (formData.role !== 'student' && emailVerificationData.verified) {
            message += `\n✅ 이메일 인증 완료: ${emailVerificationData.email}`;
        }
        
        alert(message);
        
        // 페이지 이동
        const socialType = new URLSearchParams(window.location.search).get('social');
        if (socialType) {
            // 소셜 로그인 임시 데이터 정리
            ['temp_social_id', 'temp_social_type', 'temp_social_name', 'temp_social_email', 'temp_social_profile_image']
                .forEach(key => sessionStorage.removeItem(key));
            
            // 로그인 상태로 설정
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('studentId', formData.studentId);
            
            window.location.href = '../../index.html';
        } else {
            window.location.href = `login.html?newRegistration=true&studentId=${formData.studentId}`;
        }
        
    } catch (error) {
        console.error('[ERROR] 회원가입 처리 실패:', error);
        alert('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

/* =========================
   폼 데이터 수집
   ========================= */
function collectFormData() {
    const role = document.querySelector('input[name="userRole"]:checked')?.value;
    const socialType = new URLSearchParams(window.location.search).get('social');
    
    const formData = {
        studentId: document.getElementById('studentId').value.trim(),
        name: document.getElementById('name').value.trim(),
        department: document.getElementById('selectedDepartment').value || 
                   document.getElementById('departmentInput').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        role: role,
        socialType: socialType,
        registrationDate: new Date().toISOString()
    };
    
    // 학년 (학생만)
    if (role === 'student') {
        formData.grade = document.getElementById('selectedGrade').value;
    }
    
    // 비밀번호 (소셜 로그인이 아닌 경우)
    if (!socialType) {
        formData.password = document.getElementById('password').value;
    }
    
    // 인증된 이메일 (교수/교직원)
    if (role !== 'student' && emailVerificationData.verified) {
        formData.verifiedEmail = emailVerificationData.email;
        formData.emailVerificationStatus = 'verified';
        formData.emailVerificationTimestamp = new Date().toISOString();
    }
    
    return formData;
}

/* =========================
   사용자 데이터 저장
   ========================= */
function saveUserData(formData) {
    const userId = formData.studentId;
    
    // 기본 정보 저장
    localStorage.setItem(`user_${userId}_registered`, 'true');
    localStorage.setItem(`user_${userId}_first_login`, 'true');
    localStorage.setItem(`user_${userId}_studentId`, formData.studentId);
    localStorage.setItem(`user_${userId}_name`, formData.name);
    localStorage.setItem(`user_${userId}_department`, formData.department);
    localStorage.setItem(`user_${userId}_phone`, formData.phone);
    localStorage.setItem(`user_${userId}_email`, formData.email);
    localStorage.setItem(`user_${userId}_role`, formData.role);
    localStorage.setItem(`user_${userId}_role_status`, 'approved');
    localStorage.setItem(`user_${userId}_registration_date`, formData.registrationDate);
    
    // 학년 (학생만)
    if (formData.grade) {
        localStorage.setItem(`user_${userId}_grade`, formData.grade);
    }
    
    // 비밀번호 (소셜 로그인이 아닌 경우)
    if (formData.password) {
        localStorage.setItem(`user_${userId}_password`, formData.password);
    }
    
    // 소셜 로그인 타입
    if (formData.socialType) {
        localStorage.setItem(`user_${userId}_socialType`, formData.socialType);
    }
    
    // 이메일 인증 정보 (교수/교직원)
    if (formData.verifiedEmail) {
        localStorage.setItem(`user_${userId}_verified_email`, formData.verifiedEmail);
        localStorage.setItem(`user_${userId}_email_verification_status`, 'verified');
        localStorage.setItem(`user_${userId}_email_verification_timestamp`, formData.emailVerificationTimestamp);
    }
    
    console.log('[DEBUG] 사용자 데이터 저장 완료:', userId);
}

/* =========================
   소셜 로그인 처리
   ========================= */
function handleSocialSignup() {
    const socialType = new URLSearchParams(window.location.search).get('social');
    
    if (socialType && sessionStorage.getItem('temp_social_id')) {
        // 비밀번호 필드 숨김
        const passwordFields = document.getElementById('passwordFields');
        if (passwordFields) {
            passwordFields.style.display = 'none';
        }
        
        // 소셜 정보 박스 표시
        const socialInfoBox = document.getElementById('socialInfoBox');
        const socialTypeSpan = document.getElementById('socialType');
        const socialIcon = document.getElementById('socialIcon');
        
        if (socialInfoBox && socialTypeSpan && socialIcon) {
            socialInfoBox.style.display = 'block';
            socialTypeSpan.textContent = getSocialTypeName(socialType);
            
            // 아이콘 설정
            socialIcon.textContent = socialType.charAt(0).toUpperCase();
            socialIcon.className = `social-icon ${socialType}-icon`;
        }
        
        console.log('[DEBUG] 소셜 로그인 회원가입 모드:', socialType);
    }
}

/* =========================
   유틸리티 함수들
   ========================= */
function getSocialTypeName(type) {
    const names = {
        kakao: '카카오',
        google: '구글', 
        naver: '네이버'
    };
    return names[type] || '소셜';
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function clearError(fieldId) {
    hideError(fieldId + '-error');
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.style.display = 'none';
    });
}

/* =========================
   전역 함수 등록
   ========================= */
// HTML에서 호출할 수 있도록 전역으로 등록
window.goBack = goBack;
window.sendVerificationEmail = sendVerificationEmail;
window.verifyEmailCode = verifyEmailCode;
window.formatPhoneNumber = formatPhoneNumber;
window.register = register;

/* =========================
   개발자 도구용 헬퍼
   ========================= */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.showVerificationCode = function() {
        if (emailVerificationData.code) {
            console.log('🔑 인증코드:', emailVerificationData.code);
            console.log('📧 이메일:', emailVerificationData.email);
            return { code: emailVerificationData.code, email: emailVerificationData.email };
        }
        console.log('❌ 발급된 인증 코드가 없습니다.');
        return null;
    };
    
    window.quickVerify = function() {
        if (!emailVerificationData.code) {
            console.log('❌ 인증 코드가 없습니다.');
            return false;
        }
        const codeInput = document.getElementById('verificationCode');
        if (codeInput) {
            codeInput.value = emailVerificationData.code;
            validateVerificationCode();
            setTimeout(verifyEmailCode, 100);
            console.log('🚀 자동 인증 실행');
            return true;
        }
        return false;
    };

    function goBack() {
  // 뒤로가기 히스토리가 있을 경우
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // 히스토리가 없을 경우 로그인 전 기본 페이지로 이동 (index.html로 설정 가능)
    window.location.href = '../../index.html';
  }
}
    
    console.log('🔧 개발자 도구 함수 등록 완료');
    console.log('- showVerificationCode(): 현재 인증코드 확인');
    console.log('- quickVerify(): 자동 인증 실행');
}
// =============================================================================
// register.js
// PC 전용 회원가입 페이지 JavaScript (Node.js/MySQL 백엔드 연동)
// =============================================================================

// 이메일 인증 데이터 관리
let emailVerificationData = {
    email: null,
    expiry: null,
    verified: false,
    timerInterval: null,
    attempts: 0,
    maxAttempts: 5,
    isProcessing: false
};

// 백엔드 이메일 인증 요청
async function sendVerificationEmail() {
    const emailInput = document.getElementById('verificationEmail');
    const email = emailInput.value.trim();
    const sendBtn = document.getElementById('sendVerificationBtn');
    const errorDiv = document.getElementById('verification-email-error');

    if (emailVerificationData.isProcessing) return;

    if (!email.endsWith('@yeonsung.ac.kr')) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '연성대학교 공식 이메일(@yeonsung.ac.kr)을 입력해주세요';
        return;
    }
    errorDiv.style.display = 'none';

    if (emailVerificationData.attempts >= emailVerificationData.maxAttempts) {
        alert('❌ 최대 발송 횟수를 초과했습니다.\n\n새로고침 후 다시 시도해주세요.');
        return;
    }

    emailVerificationData.isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '발송 중...';

    try {
        const res = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await res.json();

        if (res.ok && result.success) {
            // 백엔드에서 만료시간 ISO 문자열로 반환한다고 가정
            emailVerificationData = {
                email,
                expiry: new Date(result.expiry),
                verified: false,
                timerInterval: null,
                attempts: emailVerificationData.attempts + 1,
                maxAttempts: 5,
                isProcessing: false
            };

            showVerificationCodeInput();
            startVerificationTimer();

            const successDiv = document.getElementById('verification-success');
            successDiv.style.display = 'block';
            successDiv.textContent = `✅ 인증코드가 ${email}로 발송되었습니다.`;
        } else {
            throw new Error(result.message || '이메일 발송 실패');
        }
    } catch (error) {
        console.error('이메일 발송 오류:', error);
        errorDiv.style.display = 'block';
        errorDiv.textContent = '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.';
    } finally {
        emailVerificationData.isProcessing = false;
        sendBtn.disabled = false;
        sendBtn.textContent = '재발송';
    }
}

// 인증 코드 입력 필드 표시
function showVerificationCodeInput() {
    document.getElementById('verificationCodeGroup').style.display = 'block';
    const codeInput = document.getElementById('verificationCode');
    codeInput.disabled = false;
    codeInput.addEventListener('input', validateVerificationCode);
    document.getElementById('verifyCodeBtn').disabled = false;
}

// 인증 타이머 시작
function startVerificationTimer() {
    const timerDiv = document.getElementById('verificationTimer');
    const timerDisplay = document.getElementById('timerDisplay');
    timerDiv.style.display = 'block';

    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }

    emailVerificationData.timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((emailVerificationData.expiry - now) / 1000));
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(emailVerificationData.timerInterval);
            timerDisplay.textContent = '00:00';
            timerDiv.style.display = 'none';
            emailVerificationData.expiry = null;
            const errorDiv = document.getElementById('verification-code-error');
            errorDiv.style.display = 'block';
            errorDiv.textContent = '⏰ 인증 시간이 만료되었습니다. 새로운 인증코드를 발송해주세요.';
        }
    }, 1000);
}

// 인증 코드 실시간 검증
function validateVerificationCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const errorDiv = document.getElementById('verification-code-error');
    const code = codeInput.value.trim();

    if (/^\d{6}$/.test(code)) {
        verifyBtn.disabled = false;
        errorDiv.style.display = 'none';
    } else {
        verifyBtn.disabled = true;
        if (code.length > 0) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = '6자리 숫자를 입력해주세요';
        } else {
            errorDiv.style.display = 'none';
        }
    }
}

// 이메일 인증 코드 확인 (백엔드 연동)
async function verifyEmailCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const errorDiv = document.getElementById('verification-code-error');
    const successDiv = document.getElementById('verification-success');
    const inputCode = codeInput.value.trim();

    if (emailVerificationData.isProcessing) return;

    if (!/^\d{6}$/.test(inputCode) || !emailVerificationData.expiry || new Date() > emailVerificationData.expiry) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '인증 시간이 만료되었거나 잘못된 코드입니다.';
        return;
    }

    emailVerificationData.isProcessing = true;
    verifyBtn.disabled = true;
    verifyBtn.textContent = '확인 중...';

    try {
        const res = await fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailVerificationData.email, code: inputCode })
        });
        const result = await res.json();

        if (res.ok && result.success) {
            clearInterval(emailVerificationData.timerInterval);
            emailVerificationData.verified = true;
            emailVerificationData.isProcessing = false;

            errorDiv.style.display = 'none';
            successDiv.style.display = 'block';
            successDiv.textContent = '✅ 이메일 인증이 완료되었습니다';
            codeInput.disabled = true;
            verifyBtn.textContent = '인증완료';
            alert('✅ 이메일 인증이 완료되었습니다!\n\n교수/교직원 권한으로 회원가입을 진행하실 수 있습니다.');
            document.getElementById('verificationTimer').style.display = 'none';
        } else {
            throw new Error(result.message || '인증 실패');
        }
    } catch (error) {
        console.error('인증 확인 오류:', error);
        errorDiv.style.display = 'block';
        errorDiv.textContent = result?.message || '인증코드가 일치하지 않습니다. 다시 확인해주세요.';
        verifyBtn.disabled = false;
        verifyBtn.textContent = '인증확인';
    } finally {
        emailVerificationData.isProcessing = false;
    }
}

// 휴대폰 번호 자동 하이픈 추가
function formatPhoneNumber(input) {
    let num = input.value.replace(/[^0-9]/g, '');
    if (num.length > 3 && num.length <= 7) {
        num = num.slice(0, 3) + '-' + num.slice(3);
    } else if (num.length > 7) {
        num = num.slice(0, 3) + '-' + num.slice(3, 7) + '-' + num.slice(7);
    }
    input.value = num;
    validatePhoneNumber(num);
}

// 휴대폰 번호 유효성 검사
function validatePhoneNumber(phoneNumber) {
    const errorDiv = document.getElementById('phone-error');
    const digits = phoneNumber.replace(/[^0-9]/g, '');
    if (phoneNumber && (!digits.startsWith('010') || digits.length !== 11)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 이메일 유효성 검사
function validateEmail(email) {
    const errorDiv = document.getElementById('email-error');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !regex.test(email)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    const errorDiv = document.getElementById('password-error');
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (password && !regex.test(password)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 비밀번호 확인 검사
function validatePasswordConfirm(password, confirm) {
    const errorDiv = document.getElementById('confirmPassword-error');
    if (confirm && password !== confirm) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// ID 패턴 검사
function validateIdPattern(role, id) {
    const patterns = {
        student: /^\d{10}$/,
        professor: /^\d{7}$/,
        staff: /^\d{7}$/
    };
    return patterns[role]?.test(id);
}

// 역할별 UI 변경
function updateUIByRole(role) {
    const idLabel = document.getElementById('idLabel');
    const idInput = document.getElementById('studentId');
    const idHint = document.getElementById('idHint');
    const gradeGroup = document.getElementById('gradeGroup');
    const emailSection = document.getElementById('emailVerificationSection');
    const staffOptions = document.querySelectorAll('.staff-option');
    const staffCategory = document.getElementById('staffCategory');

    idInput.value = '';
    document.querySelectorAll('.error-message').forEach(d => d.style.display = 'none');
    resetEmailVerification();

    switch (role) {
        case 'student':
            idLabel.textContent = '학번';
            idInput.placeholder = '학번을 입력하세요';
            idHint.textContent = '예: 2024123456 (10자리)';
            gradeGroup.style.display = 'block';
            emailSection.style.display = 'none';
            staffOptions.forEach(o => o.style.display = 'none');
            staffCategory?.style.display = 'none';
            break;
        case 'professor':
            idLabel.textContent = '교번';
            idInput.placeholder = '교번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            emailSection.style.display = 'block';
            staffOptions.forEach(o => o.style.display = 'none');
            staffCategory?.style.display = 'none';
            break;
        case 'staff':
            idLabel.textContent = '직번';
            idInput.placeholder = '직번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            emailSection.style.display = 'block';
            staffOptions.forEach(o => o.style.display = 'block');
            staffCategory?.style.display = 'block';
            break;
    }
}

// 이메일 인증 데이터 초기화
function resetEmailVerification() {
    clearInterval(emailVerificationData.timerInterval);
    emailVerificationData = { email: null, expiry: null, verified: false, timerInterval: null, attempts: 0, maxAttempts: 5, isProcessing: false };
    ['verificationEmail','verificationCode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.disabled = false; }
    });
    document.getElementById('verificationCodeGroup').style.display = 'none';
    document.getElementById('sendVerificationBtn').disabled = false;
    document.getElementById('sendVerificationBtn').textContent = '인증코드 발송';
    document.getElementById('verifyCodeBtn').disabled = true;
    document.getElementById('verifyCodeBtn').textContent = '인증확인';
    document.getElementById('verificationTimer').style.display = 'none';
    document.querySelectorAll('#emailVerificationSection .error-message, #verification-success').forEach(d => d.style.display = 'none');
}

// 최종 회원가입 (백엔드 연동)
async function register() {
    const role = document.querySelector('input[name="userRole"]:checked')?.value;
    if (!role) { alert('역할을 선택해주세요.'); return; }

    const studentId = document.getElementById('studentId').value.trim();
    const name = document.getElementById('name').value.trim();
    const department = document.getElementById('selectedDepartment').value || document.getElementById('departmentInput').value.trim();
    const grade = document.getElementById('selectedGrade').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const agreePrivacy = document.getElementById('agreePrivacy').checked;
    const urlParams = new URLSearchParams(window.location.search);
    const socialType = urlParams.get('social');
    const isSocial = Boolean(socialType);
    let password = '';

    // 기본 유효성
    if (!validateIdPattern(role, studentId)) {
        document.getElementById('studentId-error').style.display = 'block';
        return;
    }
    if (!name || !department || !phone || !email) { alert('모든 필수 항목을 입력해주세요.'); return; }
    if (!validatePhoneNumber(phone) || !validateEmail(email)) return;
    if (role === 'student' && !grade) { alert('학년을 선택해주세요.'); return; }
    if ((role === 'professor' || role === 'staff') && !emailVerificationData.verified) {
        document.getElementById('verification-email-error').style.display = 'block';
        return;
    }
    if (!agreeTerms || !agreePrivacy) { alert('필수 약관에 동의해주세요.'); return; }

    if (!isSocial) {
        password = document.getElementById('password').value;
        const confirmPwd = document.getElementById('confirmPassword').value;
        if (!validatePassword(password) || !validatePasswordConfirm(password, confirmPwd)) return;
    }

    // 요청 페이로드 구성
    const payload = {
        role, studentId, name, department, grade, phone, email,
        ...(isSocial ? { socialType, socialId: sessionStorage.getItem('temp_social_id') } : { password })
    };

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (res.ok && result.success) {
            alert('🎉 회원가입이 완료되었습니다!');
            if (isSocial) {
                sessionStorage.clear();
                localStorage.setItem('currentLoggedInUser', result.userId);
                window.location.href = 'widget-settings.html';
            } else {
                window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
            }
        } else {
            throw new Error(result.message || '회원가입 실패');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert(error.message);
    }
}

// 이벤트 바인딩 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    setupGradeDropdown();
    setupDepartmentSearch();

    document.getElementById('sendVerificationBtn').addEventListener('click', sendVerificationEmail);
    document.getElementById('verifyCodeBtn').addEventListener('click', verifyEmailCode);
    document.getElementById('formatPhone').addEventListener('input', e => formatPhoneNumber(e.target));
    document.getElementById('registerBtn').addEventListener('click', register);

    document.querySelectorAll('input[name="userRole"]').forEach(radio => {
        radio.addEventListener('change', () => updateUIByRole(radio.value));
    });

    updateUIByRole('student');
    console.log('✅ 프론트엔드: Node.js/MySQL 백엔드 연동용 register.js 초기화 완료');
});

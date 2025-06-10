// API 기본 설정
const API_BASE_URL = 'http://localhost:3000/api';

// 현재 선택된 사용자 유형
let currentUserType = 'student';

// 검증 상태 저장
const verificationStatus = {
    student: {
        idVerified: false,
        emailVerified: false,
        phoneVerified: false,
        passwordValid: false,
        passwordMatch: false
    },
    professor: {
        idVerified: false,
        emailVerified: false,
        phoneVerified: false,
        passwordValid: false,
        passwordMatch: false
    },
    staff: {
        idVerified: false,
        emailVerified: false,
        phoneVerified: false,
        passwordValid: false,
        passwordMatch: false
    }
};

// 페이지 로드 시 이벤트 설정
document.addEventListener('DOMContentLoaded', function() {
    console.log("회원가입 페이지 로드됨");
    
    // 각 사용자 유형별로 이벤트 리스너 설정
    setupEventListeners('student');
    setupEventListeners('professor');
    setupEventListeners('staff');
});

// API 호출 헬퍼 함수
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 각 사용자 유형별 이벤트 리스너 설정
function setupEventListeners(userType) {
    // ID 입력 필드 이벤트
    const idInput = document.getElementById(`${userType}-id`);
    if (idInput) {
        idInput.addEventListener('input', function() {
            verificationStatus[userType].idVerified = false;
            updateVerifyButtonState(`${userType}-id-verify-btn`, this.value.trim().length > 0);
            updateSignupButtonState(userType);
        });
    }

    // 이메일 입력 필드 이벤트
    const emailInput = document.getElementById(`${userType}-email`);
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            verificationStatus[userType].emailVerified = false;
            updateVerifyButtonState(`${userType}-email-verify-btn`, this.value.trim().length > 0 && isValidEmail(this.value));
            updateSignupButtonState(userType);
        });
    }

    // 휴대폰 입력 필드 이벤트
    const phoneInput = document.getElementById(`${userType}-phone`);
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            verificationStatus[userType].phoneVerified = false;
            const phoneValue = this.value.replace(/-/g, '');
            updateVerifyButtonState(`${userType}-phone-verify-btn`, phoneValue.length === 11);
            updateSignupButtonState(userType);
        });
    }

    // 비밀번호 입력 필드 이벤트
    const passwordInput = document.getElementById(`${userType}-password`);
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(userType);
            updateSignupButtonState(userType);
        });
    }

    // 비밀번호 확인 입력 필드 이벤트
    const passwordConfirmInput = document.getElementById(`${userType}-password-confirm`);
    if (passwordConfirmInput) {
        passwordConfirmInput.addEventListener('input', function() {
            validatePasswordConfirm(userType);
            updateSignupButtonState(userType);
        });
    }

    // 인증번호 입력 필드 이벤트
    const verificationCodeInput = document.getElementById(`${userType}-verification-code`);
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('input', function() {
            if (this.value.trim().length === 6) {
                verifyPhoneCode(userType);
            }
        });
    }
}

// 사용자 유형 전환
function switchUserType(userType) {
    // 모든 탭 비활성화
    document.querySelectorAll('.type-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.signup-form').forEach(form => form.classList.remove('active'));

    // 선택된 탭 활성화
    document.querySelector(`.type-tab:nth-child(${userType === 'student' ? 1 : userType === 'professor' ? 2 : 3})`).classList.add('active');
    document.getElementById(`${userType}-form`).classList.add('active');

    currentUserType = userType;
}

// 휴대폰 번호 하이픈 자동 입력
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 3) {
        // 변화 없음
    } else if (value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    input.value = value;
}

// 이메일 유효성 검사
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 버튼 상태 업데이트
function updateVerifyButtonState(buttonId, isEnabled) {
    const button = document.getElementById(buttonId);
    if (button) {
        if (isEnabled) {
            button.classList.remove('disabled');
            button.disabled = false;
        } else {
            button.classList.add('disabled');
            button.disabled = true;
        }
    }
}

// 비밀번호 유효성 검사
function validatePassword(userType) {
    const passwordInput = document.getElementById(`${userType}-password`);
    const password = passwordInput.value;

    if (password.length === 0) {
        resetValidationStatus(userType);
        verificationStatus[userType].passwordValid = false;
        return;
    }

    // 길이 검사 (8자 이상)
    const lengthValid = password.length >= 8;
    updateValidationStatus(`${userType}-length-validation`, lengthValid);

    // 영문자 검사
    const letterValid = /[A-Za-z]/.test(password);
    updateValidationStatus(`${userType}-letter-validation`, letterValid);

    // 숫자 검사
    const numberValid = /\d/.test(password);
    updateValidationStatus(`${userType}-number-validation`, numberValid);

    // 특수문자 검사
    const specialValid = /[@$!%*#?&]/.test(password);
    updateValidationStatus(`${userType}-special-validation`, specialValid);

    // 전체 비밀번호 유효성
    verificationStatus[userType].passwordValid = lengthValid && letterValid && numberValid && specialValid;

    // 비밀번호 확인 필드도 함께 검사
    const confirmInput = document.getElementById(`${userType}-password-confirm`);
    if (confirmInput && confirmInput.value) {
        validatePasswordConfirm(userType);
    }
}

// 비밀번호 확인 검사
function validatePasswordConfirm(userType) {
    const password = document.getElementById(`${userType}-password`).value;
    const confirmPassword = document.getElementById(`${userType}-password-confirm`).value;

    if (confirmPassword.length === 0) {
        const matchValidation = document.getElementById(`${userType}-match-validation`);
        if (matchValidation) {
            matchValidation.classList.remove('valid', 'invalid');
        }
        verificationStatus[userType].passwordMatch = false;
        return;
    }

    const matchValid = password === confirmPassword && password.length > 0;
    updateValidationStatus(`${userType}-match-validation`, matchValid);
    verificationStatus[userType].passwordMatch = matchValid;
}

// 검증 상태 업데이트
function updateValidationStatus(id, isValid) {
    const element = document.getElementById(id);
    if (!element) return;

    if (isValid) {
        element.classList.add('valid');
        element.classList.remove('invalid');
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
    }
}

// 유효성 검사 표시 초기화
function resetValidationStatus(userType) {
    const validationItems = document.querySelectorAll(`#${userType}-form .requirement-item`);
    validationItems.forEach(item => {
        item.classList.remove('valid', 'invalid');
    });
}

// 회원가입 버튼 상태 업데이트
function updateSignupButtonState(userType) {
    const signupBtn = document.getElementById(`${userType}-signup-btn`);
    const status = verificationStatus[userType];
    
    // 모든 필수 검증이 완료되었는지 확인
    const allFieldsValid = status.idVerified && status.emailVerified && 
                          status.phoneVerified && status.passwordValid && status.passwordMatch;
    
    if (allFieldsValid) {
        signupBtn.classList.remove('disabled');
        signupBtn.disabled = false;
    } else {
        signupBtn.classList.add('disabled');
        signupBtn.disabled = true;
    }
}

// 학번 중복 확인
async function verifyStudentId() {
    const idInput = document.getElementById('student-id');
    const studentId = idInput.value.trim();

    if (!studentId) {
        alert('학번을 입력해주세요.');
        return;
    }

    if (studentId.length !== 8) {
        alert('학번은 8자리여야 합니다.');
        return;
    }

    try {
        const response = await apiCall('/auth/verify-student-id', 'POST', { studentId });
        
        if (response.success) {
            alert('사용 가능한 학번입니다.');
            verificationStatus.student.idVerified = true;
            idInput.parentElement.classList.add('success');
            updateSignupButtonState('student');
        } else {
            alert('이미 등록된 학번입니다.');
            verificationStatus.student.idVerified = false;
            idInput.parentElement.classList.add('error');
        }
    } catch (error) {
        console.error('학번 확인 오류:', error);
        alert('학번 확인 중 오류가 발생했습니다.');
    }
}

// 교수번호 중복 확인
async function verifyProfessorId() {
    const idInput = document.getElementById('professor-id');
    const professorId = idInput.value.trim();

    if (!professorId) {
        alert('교수번호를 입력해주세요.');
        return;
    }

    try {
        const response = await apiCall('/auth/verify-professor-id', 'POST', { professorId });
        
        if (response.success) {
            alert('사용 가능한 교수번호입니다.');
            verificationStatus.professor.idVerified = true;
            idInput.parentElement.classList.add('success');
            updateSignupButtonState('professor');
        } else {
            alert('이미 등록된 교수번호입니다.');
            verificationStatus.professor.idVerified = false;
            idInput.parentElement.classList.add('error');
        }
    } catch (error) {
        console.error('교수번호 확인 오류:', error);
        alert('교수번호 확인 중 오류가 발생했습니다.');
    }
}

// 직원번호 중복 확인
async function verifyStaffId() {
    const idInput = document.getElementById('staff-id');
    const staffId = idInput.value.trim();

    if (!staffId) {
        alert('직원번호를 입력해주세요.');
        return;
    }

    try {
        const response = await apiCall('/auth/verify-staff-id', 'POST', { staffId });
        
        if (response.success) {
            alert('사용 가능한 직원번호입니다.');
            verificationStatus.staff.idVerified = true;
            idInput.parentElement.classList.add('success');
            updateSignupButtonState('staff');
        } else {
            alert('이미 등록된 직원번호입니다.');
            verificationStatus.staff.idVerified = false;
            idInput.parentElement.classList.add('error');
        }
    } catch (error) {
        console.error('직원번호 확인 오류:', error);
        alert('직원번호 확인 중 오류가 발생했습니다.');
    }
}

// 이메일 중복 확인
async function verifyEmail(userType) {
    const emailInput = document.getElementById(`${userType}-email`);
    const email = emailInput.value.trim();

    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }

    try {
        const response = await apiCall('/auth/verify-email', 'POST', { email, userType });
        
        if (response.success) {
            alert('사용 가능한 이메일입니다.');
            verificationStatus[userType].emailVerified = true;
            emailInput.parentElement.classList.add('success');
            updateSignupButtonState(userType);
        } else {
            alert('이미 등록된 이메일입니다.');
            verificationStatus[userType].emailVerified = false;
            emailInput.parentElement.classList.add('error');
        }
    } catch (error) {
        console.error('이메일 확인 오류:', error);
        alert('이메일 확인 중 오류가 발생했습니다.');
    }
}

// 휴대폰 인증번호 전송
async function sendPhoneVerification(userType) {
    const phoneInput = document.getElementById(`${userType}-phone`);
    const phoneWithHyphens = phoneInput.value.trim();
    const phone = phoneWithHyphens.replace(/-/g, '');

    if (!phone || phone.length !== 11) {
        alert('올바른 휴대폰 번호를 입력해주세요.');
        return;
    }

    const verifyBtn = document.getElementById(`${userType}-phone-verify-btn`);
    verifyBtn.classList.add('loading');

    try {
        const response = await apiCall('/auth/send-phone-verification', 'POST', { 
            phone, 
            userType,
            type: 'signup'
        });

        if (response.success) {
            alert('인증번호가 전송되었습니다.');
            
            // 인증번호 입력 필드 표시
            const verificationGroup = document.getElementById(`${userType}-verification-group`);
            verificationGroup.style.display = 'block';
            
            // 타이머 시작
            startTimer(`${userType}-timer`, 180);
        } else {
            alert(response.message || '인증번호 전송에 실패했습니다.');
        }
    } catch (error) {
        console.error('인증번호 전송 오류:', error);
        alert('인증번호 전송 중 오류가 발생했습니다.');
    } finally {
        verifyBtn.classList.remove('loading');
    }
}

// 휴대폰 인증번호 확인
async function verifyPhoneCode(userType) {
    const codeInput = document.getElementById(`${userType}-verification-code`);
    const phoneInput = document.getElementById(`${userType}-phone`);
    const code = codeInput.value.trim();
    const phone = phoneInput.value.replace(/-/g, '');

    if (!code || code.length !== 6) {
        return;
    }

    try {
        const response = await apiCall('/auth/verify-phone-code', 'POST', { 
            phone, 
            code, 
            userType,
            type: 'signup'
        });

        if (response.success) {
            alert('휴대폰 인증이 완료되었습니다.');
            verificationStatus[userType].phoneVerified = true;
            codeInput.parentElement.classList.add('success');
            
            // 타이머 중지
            clearInterval(window[`${userType}TimerInterval`]);
            document.getElementById(`${userType}-timer`).textContent = '인증완료';
            
            updateSignupButtonState(userType);
        } else {
            alert('인증번호가 일치하지 않습니다.');
            codeInput.focus();
        }
    } catch (error) {
        console.error('인증번호 확인 오류:', error);
        alert('인증번호 확인 중 오류가 발생했습니다.');
    }
}

// 타이머 함수
function startTimer(elementId, seconds) {
    const timerElement = document.getElementById(elementId);
    let remainingTime = seconds;
    
    // 이전 타이머가 있으면 중지
    const intervalName = `${elementId.replace('-', '')}Interval`;
    if (window[intervalName]) {
        clearInterval(window[intervalName]);
    }
    
    window[intervalName] = setInterval(function() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (--remainingTime < 0) {
            clearInterval(window[intervalName]);
            timerElement.textContent = "시간만료";
        }
    }, 1000);
}

// 회원가입 제출
async function submitSignup(userType) {
    // 모든 필드 값 수집
    const formData = collectFormData(userType);
    
    // 필수 필드 검증
    if (!validateFormData(formData, userType)) {
        return;
    }

    const signupBtn = document.getElementById(`${userType}-signup-btn`);
    signupBtn.classList.add('loading');

    try {
        const response = await apiCall('/auth/signup', 'POST', {
            ...formData,
            userType
        });

        if (response.success) {
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            window.location.href = 'login.html';
        } else {
            alert(response.message || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    } finally {
        signupBtn.classList.remove('loading');
    }
}

// 폼 데이터 수집
function collectFormData(userType) {
    const data = {};
    
    // 공통 필드
    data.id = document.getElementById(`${userType}-id`).value.trim();
    data.name = document.getElementById(`${userType}-name`).value.trim();
    data.email = document.getElementById(`${userType}-email`).value.trim();
    data.phone = document.getElementById(`${userType}-phone`).value.replace(/-/g, '');
    data.password = document.getElementById(`${userType}-password`).value;
    
    // 사용자 유형별 추가 필드
    if (userType === 'student') {
        data.department = document.getElementById('student-department').value;
        data.grade = document.getElementById('student-grade').value;
    } else if (userType === 'professor') {
        data.department = document.getElementById('professor-department').value;
        data.position = document.getElementById('professor-position').value;
        data.office = document.getElementById('professor-office').value.trim();
    } else if (userType === 'staff') {
        data.department = document.getElementById('staff-department').value;
        data.position = document.getElementById('staff-position').value;
        data.office = document.getElementById('staff-office').value.trim();
    }
    
    return data;
}

// 폼 데이터 검증
function validateFormData(data, userType) {
    // 필수 필드 검사
    const requiredFields = ['id', 'name', 'email', 'phone', 'password'];
    
    if (userType === 'student') {
        requiredFields.push('department', 'grade');
    } else {
        requiredFields.push('department', 'position');
    }
    
    for (const field of requiredFields) {
        if (!data[field]) {
            alert(`${getFieldName(field)}을(를) 입력해주세요.`);
            return false;
        }
    }
    
    // 검증 상태 확인
    const status = verificationStatus[userType];
    if (!status.idVerified) {
        alert('ID 중복확인을 해주세요.');
        return false;
    }
    
    if (!status.emailVerified) {
        alert('이메일 중복확인을 해주세요.');
        return false;
    }
    
    if (!status.phoneVerified) {
        alert('휴대폰 인증을 완료해주세요.');
        return false;
    }
    
    if (!status.passwordValid) {
        alert('비밀번호 조건을 만족해주세요.');
        return false;
    }
    
    if (!status.passwordMatch) {
        alert('비밀번호가 일치하지 않습니다.');
        return false;
    }
    
    return true;
}

// 필드명 반환 함수
function getFieldName(field) {
    const fieldNames = {
        'id': 'ID',
        'name': '이름',
        'email': '이메일',
        'phone': '휴대폰 번호',
        'password': '비밀번호',
        'department': '학과/부서',
        'grade': '학년',
        'position': '직급',
        'office': '사무실/연구실'
    };
    return fieldNames[field] || field;
}

// 뒤로가기
function goBack() {
    window.location.href = "login.html";
}
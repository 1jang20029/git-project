// =============================================================================
// register.js
// PC 전용 회원가입 페이지 JavaScript (AWS SES 이메일 인증 포함)
// =============================================================================

// 이메일 인증 데이터 관리
let emailVerificationData = {
    code: null,
    email: null,
    expiry: null,
    verified: false,
    timerInterval: null,
    attempts: 0,
    maxAttempts: 5
};

// AWS SES 시뮬레이션 함수
async function sendEmailViaSES(to, subject, body) {
    // 실제 구현에서는 백엔드 API를 호출
    // 여기서는 시뮬레이션으로 구현
    console.log('📧 AWS SES 이메일 발송 시뮬레이션');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    // 실제로는 AWS SDK를 사용하여 SES로 이메일 발송
    // const params = {
    //     Destination: { ToAddresses: [to] },
    //     Message: {
    //         Body: { Text: { Data: body } },
    //         Subject: { Data: subject }
    //     },
    //     Source: 'noreply@yeonsung.ac.kr'
    // };
    // await ses.sendEmail(params).promise();
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, messageId: 'ses-' + Date.now() });
        }, 1000);
    });
}

// 인증 이메일 발송
async function sendVerificationEmail() {
    const emailInput = document.getElementById('verificationEmail');
    const email = emailInput.value.trim();
    const sendBtn = document.getElementById('sendVerificationBtn');
    const errorDiv = document.getElementById('verification-email-error');
    
    // 대학 이메일 형식 검증
    if (!email.endsWith('@yeonsung.ac.kr')) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '연성대학교 공식 이메일(@yeonsung.ac.kr)을 입력해주세요';
        return;
    }
    
    errorDiv.style.display = 'none';
    
    // 최대 시도 횟수 확인
    if (emailVerificationData.attempts >= emailVerificationData.maxAttempts) {
        alert('❌ 최대 발송 횟수를 초과했습니다.\n\n새로고침 후 다시 시도해주세요.');
        return;
    }
    
    // 버튼 비활성화
    sendBtn.disabled = true;
    sendBtn.textContent = '발송 중...';
    
    try {
        // 6자리 인증 코드 생성
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 이메일 내용 구성
        const subject = '[연성대학교] 회원가입 이메일 인증코드';
        const body = `
안녕하세요, ${email} 님!

연성대학교 캠퍼스 가이드 회원가입을 위한 이메일 인증코드입니다.

인증코드: ${verificationCode}

이 인증코드는 5분간 유효합니다.
인증코드를 회원가입 페이지에 입력해주세요.

본인이 요청하지 않았다면 이 이메일을 무시해주세요.

감사합니다.
연성대학교 캠퍼스 가이드팀
        `;
        
        // AWS SES로 이메일 발송
        const result = await sendEmailViaSES(email, subject, body);
        
        if (result.success) {
            // 인증 데이터 저장
            emailVerificationData = {
                code: verificationCode,
                email: email,
                expiry: new Date(Date.now() + 5 * 60 * 1000), // 5분 후 만료
                verified: false,
                timerInterval: null,
                attempts: emailVerificationData.attempts + 1,
                maxAttempts: 5
            };
            
            // UI 업데이트
            showVerificationCodeInput();
            startVerificationTimer();
            
            alert(`📧 인증코드가 발송되었습니다!\n\n이메일: ${email}\n\n메일함을 확인해주세요. (스팸함도 확인해주세요)`);
            
            // 개발자 도구용 로그
            console.log('🔑 인증 코드:', verificationCode);
            console.log('📧 발송 이메일:', email);
            console.log('⏰ 만료 시간:', emailVerificationData.expiry.toLocaleString());
        } else {
            throw new Error('이메일 발송에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('이메일 발송 오류:', error);
        alert('❌ 이메일 발송에 실패했습니다.\n\n잠시 후 다시 시도해주세요.');
    } finally {
        // 버튼 복원
        sendBtn.disabled = false;
        sendBtn.textContent = '재발송';
    }
}

// 인증 코드 입력 필드 표시
function showVerificationCodeInput() {
    const codeGroup = document.getElementById('verificationCodeGroup');
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    
    codeGroup.style.display = 'block';
    codeInput.disabled = false;
    verifyBtn.disabled = false;
    
    // 실시간 입력 검증
    codeInput.addEventListener('input', function() {
        validateVerificationCode();
    });
}

// 인증 타이머 시작
function startVerificationTimer() {
    const timerDiv = document.getElementById('verificationTimer');
    const timerDisplay = document.getElementById('timerDisplay');
    
    timerDiv.style.display = 'block';
    
    // 기존 타이머 정리
    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }
    
    emailVerificationData.timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((emailVerificationData.expiry - now) / 1000));
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(emailVerificationData.timerInterval);
            timerDisplay.textContent = '00:00';
            timerDiv.style.display = 'none';
            
            // 만료 처리
            emailVerificationData.code = null;
            emailVerificationData.expiry = null;
            
            alert('⏰ 인증 시간이 만료되었습니다.\n\n새로운 인증코드를 발송해주세요.');
        }
    }, 1000);
}

// 인증 코드 실시간 검증
function validateVerificationCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const errorDiv = document.getElementById('verification-code-error');
    
    const code = codeInput.value.trim();
    
    if (code.length === 6 && /^\d{6}$/.test(code)) {
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

// 이메일 인증 코드 확인
function verifyEmailCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const errorDiv = document.getElementById('verification-code-error');
    const successDiv = document.getElementById('verification-success');
    
    const inputCode = codeInput.value.trim();
    
    // 만료 확인
    if (!emailVerificationData.code || new Date() > emailVerificationData.expiry) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '인증 시간이 만료되었습니다. 새로운 인증코드를 발송해주세요.';
        return;
    }
    
    // 코드 확인
    if (inputCode === emailVerificationData.code) {
        // 인증 성공
        emailVerificationData.verified = true;
        
        // 타이머 정지
        if (emailVerificationData.timerInterval) {
            clearInterval(emailVerificationData.timerInterval);
        }
        
        // UI 업데이트
        errorDiv.style.display = 'none';
        successDiv.style.display = 'block';
        codeInput.disabled = true;
        verifyBtn.disabled = true;
        verifyBtn.textContent = '인증완료';
        
        // 타이머 숨기기
        const timerDiv = document.getElementById('verificationTimer');
        timerDiv.style.display = 'none';
        
        alert('✅ 이메일 인증이 완료되었습니다!\n\n교수/교직원 권한으로 회원가입을 진행하실 수 있습니다.');
        
    } else {
        // 인증 실패
        errorDiv.style.display = 'block';
        errorDiv.textContent = '인증코드가 일치하지 않습니다. 다시 확인해주세요.';
        codeInput.focus();
    }
}

// 휴대폰 번호 자동 하이픈 추가 함수
function formatPhoneNumber(input) {
    let phoneNumber = input.value.replace(/[^0-9]/g, '');
    
    if (phoneNumber.length > 3 && phoneNumber.length <= 7) {
        phoneNumber = phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3);
    } else if (phoneNumber.length > 7) {
        phoneNumber = phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7) + '-' + phoneNumber.substring(7);
    }
    
    input.value = phoneNumber;
    validatePhoneNumber(phoneNumber);
}

// 휴대폰 번호 유효성 검사
function validatePhoneNumber(phoneNumber) {
    const errorDiv = document.getElementById('phone-error');
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (phoneNumber && (!cleanNumber.startsWith('010') || cleanNumber.length !== 11)) {
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
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
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    
    if (password && !passwordRegex.test(password)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 비밀번호 확인 유효성 검사
function validatePasswordConfirm(password, confirmPassword) {
    const errorDiv = document.getElementById('confirmPassword-error');
    
    if (confirmPassword && password !== confirmPassword) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 역할별 ID 패턴 검증 함수
function validateIdPattern(role, id) {
    switch(role) {
        case 'student':
            return /^\d{10}$/.test(id);
        case 'professor':
            return /^\d{7}$/.test(id);
        case 'staff':
            return /^\d{7}$/.test(id);
        default:
            return false;
    }
}

// 역할 변경 시 UI 업데이트
function updateUIByRole(role) {
    const idLabel = document.getElementById('idLabel');
    const idInput = document.getElementById('studentId');
    const idHint = document.getElementById('idHint');
    const gradeGroup = document.getElementById('gradeGroup');
    const emailVerificationSection = document.getElementById('emailVerificationSection');
    const staffOptions = document.querySelectorAll('.staff-option');
    const staffCategory = document.getElementById('staffCategory');
    
    // 기존 에러 메시지 숨기기
    document.getElementById('studentId-error').style.display = 'none';
    
    switch(role) {
        case 'student':
            idLabel.textContent = '학번';
            idInput.placeholder = '학번을 입력하세요';
            idHint.textContent = '예: 2024123456 (10자리)';
            gradeGroup.style.display = 'block';
            emailVerificationSection.style.display = 'none';
            
            staffOptions.forEach(option => option.style.display = 'none');
            staffCategory.style.display = 'none';
            break;
            
        case 'professor':
            idLabel.textContent = '교번';
            idInput.placeholder = '교번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            emailVerificationSection.style.display = 'block';
            
            staffOptions.forEach(option => option.style.display = 'none');
            staffCategory.style.display = 'none';
            break;
            
        case 'staff':
            idLabel.textContent = '직번';
            idInput.placeholder = '직번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            emailVerificationSection.style.display = 'block';
            
            staffOptions.forEach(option => option.style.display = 'block');
            staffCategory.style.display = 'block';
            break;
    }
    
    // 입력값 초기화
    idInput.value = '';
    document.getElementById('departmentInput').value = '';
    document.getElementById('selectedDepartment').value = '';
    
    // 이메일 인증 초기화
    resetEmailVerification();
}

// 이메일 인증 초기화
function resetEmailVerification() {
    // 인증 데이터 초기화
    emailVerificationData = {
        code: null,
        email: null,
        expiry: null,
        verified: false,
        timerInterval: null,
        attempts: 0,
        maxAttempts: 5
    };
    
    // 타이머 정지
    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }
    
    // UI 초기화
    const verificationEmail = document.getElementById('verificationEmail');
    const verificationCode = document.getElementById('verificationCode');
    const codeGroup = document.getElementById('verificationCodeGroup');
    const sendBtn = document.getElementById('sendVerificationBtn');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const timerDiv = document.getElementById('verificationTimer');
    const errorDivs = document.querySelectorAll('#emailVerificationSection .error-message');
    const successDiv = document.getElementById('verification-success');
    
    if (verificationEmail) verificationEmail.value = '';
    if (verificationCode) verificationCode.value = '';
    if (codeGroup) codeGroup.style.display = 'none';
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = '인증코드 발송';
    }
    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.textContent = '인증확인';
    }
    if (timerDiv) timerDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    errorDivs.forEach(div => div.style.display = 'none');
}

// 학과 검색 기능
function setupDepartmentSearch() {
    const departmentInput = document.getElementById('departmentInput');
    const departmentDropdown = document.getElementById('departmentDropdown');
    const selectedDepartment = document.getElementById('selectedDepartment');
    const departmentOptions = document.querySelectorAll('.department-option');
    
    // 입력 시 검색 기능
    departmentInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        let hasVisibleOptions = false;
        
        if (searchTerm.length > 0) {
            departmentDropdown.style.display = 'block';
            
            const categories = departmentDropdown.querySelectorAll('.department-category');
            const options = departmentDropdown.querySelectorAll('.department-option');
            
            // 모든 카테고리 숨기기
            categories.forEach(category => category.style.display = 'none');
            
            // 검색어와 일치하는 옵션 표시
            options.forEach(option => {
                const optionText = option.textContent.toLowerCase();
                if (optionText.includes(searchTerm)) {
                    option.style.display = 'block';
                    hasVisibleOptions = true;
                    
                    // 해당 옵션의 이전 카테고리 표시
                    let prevElement = option.previousElementSibling;
                    while (prevElement) {
                        if (prevElement.classList.contains('department-category')) {
                            prevElement.style.display = 'block';
                            break;
                        }
                        prevElement = prevElement.previousElementSibling;
                    }
                } else {
                    option.style.display = 'none';
                }
            });
            
            if (!hasVisibleOptions) {
                departmentDropdown.style.display = 'none';
            }
        } else {
            departmentDropdown.style.display = 'none';
        }
    });
    
    // 클릭 시 전체 드롭다운 표시
    departmentInput.addEventListener('focus', function() {
        if (this.value.length === 0) {
            departmentDropdown.style.display = 'block';
            
            const categories = departmentDropdown.querySelectorAll('.department-category');
            const options = departmentDropdown.querySelectorAll('.department-option');
            
            categories.forEach(category => {
                if (category.id === 'staffCategory') {
                    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
                    category.style.display = selectedRole === 'staff' ? 'block' : 'none';
                } else {
                    category.style.display = 'block';
                }
            });
            
            options.forEach(option => {
                if (option.classList.contains('staff-option')) {
                    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
                    option.style.display = selectedRole === 'staff' ? 'block' : 'none';
                } else {
                    option.style.display = 'block';
                }
            });
        }
    });
    
    // 옵션 클릭 이벤트
    departmentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            const text = this.textContent;
            
            departmentInput.value = text;
            selectedDepartment.value = value;
            departmentDropdown.style.display = 'none';
        });
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.department-container')) {
            departmentDropdown.style.display = 'none';
        }
    });
}

// 학년 드롭다운 기능
function setupGradeDropdown() {
    const dropdownBtn = document.getElementById('gradeDropdownBtn');
    const dropdown = document.getElementById('gradeDropdown');
    const options = document.querySelectorAll('.grade-option');
    const selectedGradeInput = document.getElementById('selectedGrade');
    
    // 드롭다운 표시/숨김 토글
    dropdownBtn.addEventListener('click', function() {
        dropdown.classList.toggle('show');
    });
    
    // 학년 옵션 선택 시
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            const text = this.textContent;
            
            dropdownBtn.textContent = text;
            selectedGradeInput.value = value;
            dropdown.classList.remove('show');
        });
    });
    
    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.grade-button') && !event.target.matches('.grade-option')) {
            dropdown.classList.remove('show');
        }
    });
}

// 이메일 인증 상태 검증
function validateEmailVerification(selectedRole) {
    if (selectedRole !== 'professor' && selectedRole !== 'staff') {
        return true; // 학생은 이메일 인증 불필요
    }
    
    if (!emailVerificationData.verified) {
        alert('🔒 이메일 인증을 완료해주세요.\n\n교수/교직원 계정은 대학 공식 이메일 인증이 필요합니다.');
        return false;
    }
    
    // 세션 유효성 추가 확인
    if (new Date() > emailVerificationData.expiry) {
        alert('🔒 인증 세션이 만료되었습니다.\n\n새로운 인증을 진행해주세요.');
        return false;
    }
    
    return true;
}

// 소셜 타입명 변환 함수
function getSocialTypeName(type) {
    switch(type) {
        case 'kakao': return '카카오';
        case 'google': return '구글';
        case 'naver': return '네이버';
        default: return '소셜';
    }
}

// 역할별 에러 메시지 반환
function getIdErrorMessage(role) {
    switch(role) {
        case 'student':
            return '10자리 숫자로 입력해주세요 (예: 2024123456)';
        case 'professor':
            return '7자리 숫자로 입력해주세요 (예: 2024001)';
        case 'staff':
            return '7자리 숫자로 입력해주세요 (예: 2024001)';
        default:
            return '올바른 형식으로 입력해주세요';
    }
}

// 뒤로가기 함수
function goBack() {
    window.location.href = "login.html";
}

// 회원가입 함수
function register() {
    // 선택된 역할 가져오기
    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
    
    // 입력값 가져오기
    const studentId = document.getElementById('studentId').value;
    const name = document.getElementById('name').value;
    const department = document.getElementById('selectedDepartment').value || document.getElementById('departmentInput').value;
    const selectedGrade = document.getElementById('selectedGrade').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const agreePrivacy = document.getElementById('agreePrivacy').checked;
    
    // URL 파라미터에서 소셜 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const socialType = urlParams.get('social');
    const isSocialLogin = socialType ? true : false;
    
    // 소셜 로그인이 아닌 경우에만 비밀번호 확인
    let password = '';
    if (!isSocialLogin) {
        password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 비밀번호 유효성 검사
        if (!validatePassword(password)) {
            return;
        }
        
        // 비밀번호 일치 검사
        if (!validatePasswordConfirm(password, confirmPassword)) {
            return;
        }
    }
    
    // ID 패턴 검증
    if (!validateIdPattern(selectedRole, studentId)) {
        document.getElementById('studentId-error').style.display = 'block';
        document.getElementById('studentId-error').textContent = getIdErrorMessage(selectedRole);
        return;
    }
    
    // 필수 필드 검사
    if (!studentId || !name || !department || !phone || !email) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 휴대폰 번호 유효성 검사
    if (!validatePhoneNumber(phone)) {
        return;
    }
    
    // 이메일 유효성 검사
    if (!validateEmail(email)) {
        return;
    }
    
    // 학생인 경우 학년 필수
    if (selectedRole === 'student' && !selectedGrade) {
        alert('학년을 선택해주세요.');
        return;
    }
    
    // 교수/교직원 이메일 인증 검사
    if (!validateEmailVerification(selectedRole)) {
        return;
    }
    
    // 약관 동의 검사
    if (!agreeTerms || !agreePrivacy) {
        alert('필수 약관에 동의해주세요.');
        return;
    }
    
    // 소셜 로그인 정보 가져오기
    let userId = studentId;
    
    if (isSocialLogin) {
        const socialId = sessionStorage.getItem('temp_social_id');
        if (socialId) {
            userId = socialId;
        }
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`user_${userId}_registered`, 'true');
    localStorage.setItem(`user_${userId}_first_login`, 'true');
    localStorage.setItem(`user_${userId}_studentId`, studentId);
    localStorage.setItem(`user_${userId}_name`, name);
    localStorage.setItem(`user_${userId}_department`, department);
    localStorage.setItem(`user_${userId}_phone`, phone);
    localStorage.setItem(`user_${userId}_email`, email);
    localStorage.setItem(`user_${userId}_role`, selectedRole);
    localStorage.setItem(`user_${userId}_role_status`, 'approved');
    
    // 학생인 경우에만 학년 저장
    if (selectedRole === 'student') {
        localStorage.setItem(`user_${userId}_grade`, selectedGrade);
    }
    
    // 소셜 로그인이 아닌 경우에만 비밀번호 저장
    if (!isSocialLogin) {
        localStorage.setItem(`user_${userId}_password`, password);
    } else {
        localStorage.setItem(`user_${userId}_socialType`, socialType);
    }
    
    // 교수/교직원 이메일 인증 정보 저장
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        localStorage.setItem(`user_${userId}_verified_email`, emailVerificationData.email);
        localStorage.setItem(`user_${userId}_email_verification_status`, 'verified');
        localStorage.setItem(`user_${userId}_email_verification_timestamp`, new Date().toISOString());
    }
    
    // 성공 메시지
    let successMessage = '🎉 회원가입이 완료되었습니다!';
    
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        successMessage += `\n\n✅ 이메일 인증이 완료되었습니다.\n📧 인증된 이메일: ${emailVerificationData.email}`;
    }
    
    alert(successMessage);
    
    // 소셜 로그인 세션 데이터 정리
    if (isSocialLogin) {
        sessionStorage.removeItem('temp_social_id');
        sessionStorage.removeItem('temp_social_type');
        sessionStorage.removeItem('temp_social_name');
        sessionStorage.removeItem('temp_social_email');
        sessionStorage.removeItem('temp_social_profile_image');
        
        // 현재 로그인 사용자로 설정
        localStorage.setItem('currentLoggedInUser', userId);
        
        // 첫 로그인이므로 위젯 설정 페이지로 이동
        window.location.href = "widget-settings.html";
    } else {
        // 로그인 페이지로 이동
        window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
    }
}

// 개발자 도구용 헬퍼 함수들
function showVerificationCode() {
    if (emailVerificationData && emailVerificationData.code) {
        console.log('🔑 현재 인증 정보:');
        console.log('- 인증 코드:', emailVerificationData.code);
        console.log('- 인증 이메일:', emailVerificationData.email);
        console.log('- 시도 횟수:', emailVerificationData.attempts);
        console.log('- 최대 시도:', emailVerificationData.maxAttempts);
        
        if (emailVerificationData.expiry) {
            console.log('- 만료 시간:', emailVerificationData.expiry.toLocaleString());
            console.log('- 남은 시간:', Math.max(0, Math.floor((emailVerificationData.expiry - new Date()) / 1000)), '초');
        }
        
        return {
            code: emailVerificationData.code,
            email: emailVerificationData.email
        };
    } else {
        console.log('❌ 생성된 인증 코드가 없습니다.');
        return null;
    }
}

function quickVerify() {
    if (emailVerificationData && emailVerificationData.code) {
        const codeInput = document.getElementById('verificationCode');
        if (codeInput) {
            codeInput.value = emailVerificationData.code;
            validateVerificationCode();
            setTimeout(() => {
                verifyEmailCode();
            }, 100);
            
            console.log('🚀 자동 인증 완료:', {
                code: emailVerificationData.code
            });
            
            return true;
        }
    }
    console.log('❌ 발송된 인증 코드가 없습니다. 먼저 인증 이메일을 발송해주세요.');
    return false;
}

// 전역 함수로 노출 (개발자 도구에서 사용 가능)
window.showVerificationCode = showVerificationCode;
window.quickVerify = quickVerify;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 연성대학교 캠퍼스 가이드 회원가입 페이지 로드됨 (PC 전용)');
    console.log('🔧 개발자 도구 명령어:');
    console.log('  - showVerificationCode() : 현재 인증 코드 확인');
    console.log('  - quickVerify() : 자동 인증 완료');
    
    // 학년 드롭다운 설정
    setupGradeDropdown();
    
    // 학과 검색 기능 설정
    setupDepartmentSearch();
    
    // 역할 선택 라디오 버튼 이벤트
    const roleRadios = document.querySelectorAll('input[name="userRole"]');
    roleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('역할 변경됨:', this.value); // 디버깅용
            updateUIByRole(this.value);
        });
    });
    
    // 초기 상태 설정 (학생이 기본 선택됨)
    updateUIByRole('student');
    
    // URL 파라미터 확인하여 소셜 로그인 여부 판단
    const urlParams = new URLSearchParams(window.location.search);
    const socialType = urlParams.get('social');
    
    if (socialType) {
        // 소셜 로그인으로 온 경우, 세션 스토리지에서 정보 가져오기
        const socialId = sessionStorage.getItem('temp_social_id');
        
        if (socialId) {
            // 비밀번호 필드 숨기기
            const passwordFields = document.getElementById('passwordFields');
            if (passwordFields) {
                passwordFields.style.display = 'none';
            }
            
            // 소셜 정보 표시
            const socialInfoBox = document.getElementById('socialInfoBox');
            const socialTypeSpan = document.getElementById('socialType');
            const socialIconElem = document.getElementById('socialIcon');
            
            if (socialInfoBox) socialInfoBox.style.display = 'block';
            if (socialTypeSpan) socialTypeSpan.textContent = getSocialTypeName(socialType);
            
            // 소셜 아이콘 설정
            if (socialIconElem) {
                socialIconElem.textContent = socialType.charAt(0).toUpperCase();
                socialIconElem.className = `social-icon ${socialType}-icon`;
            }
        }
    }
    
    // ID 입력 실시간 검증
    const idInput = document.getElementById('studentId');
    if (idInput) {
        idInput.addEventListener('input', function() {
            const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
            const errorDiv = document.getElementById('studentId-error');
            
            if (this.value && !validateIdPattern(selectedRole, this.value)) {
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = getIdErrorMessage(selectedRole);
                }
            } else {
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            }
        });
    }
    
    // 비밀번호 실시간 검증
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }
    
    // 비밀번호 확인 실시간 검증
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            validatePasswordConfirm(password, this.value);
        });
    }
    
    // 이메일 실시간 검증
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this.value);
        });
    }
    
    console.log('✅ PC 전용 회원가입 페이지 초기화 완료');
    console.log('📧 AWS SES 이메일 인증 기능이 추가되었습니다.');
});
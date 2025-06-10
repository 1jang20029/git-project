// ============================================================================= 
// register.js
// PC 전용 회원가입 페이지 JavaScript (이메일 인증 포함, 관리자 승인 제거)
// =============================================================================

// 휴대폰 번호 자동 하이픈 추가 함수
function formatPhoneNumber(input) {
    // 숫자 이외의 문자 제거
    let phoneNumber = input.value.replace(/[^0-9]/g, '');
    
    // 하이픈 추가
    if (phoneNumber.length > 3 && phoneNumber.length <= 7) {
        // 010-1234 형식
        phoneNumber = phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3);
    } else if (phoneNumber.length > 7) {
        // 010-1234-5678 형식
        phoneNumber = phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7) + '-' + phoneNumber.substring(7);
    }
    
    // 입력 필드 값 업데이트
    input.value = phoneNumber;
    
    // 실시간 유효성 검사
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
    // 영문, 숫자, 특수문자를 포함한 8자 이상
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
            // 학생: 10자리 숫자만 (예: 2024123456)
            return /^\d{10}$/.test(id);
        case 'professor':
            // 교수: 7자리 숫자만 (예: 2024001)
            return /^\d{7}$/.test(id);
        case 'staff':
            // 교직원: 7자리 숫자만 (예: 2024001)
            return /^\d{7}$/.test(id);
        default:
            return false;
    }
}

// 간단한 이메일 인증 시스템 (실제 발송 없이 시뮬레이션)
let emailVerificationData = {
    code: null,
    email: null,
    expiry: null,
    verified: false,
    timerInterval: null,
    attempts: 0,
    maxAttempts: 5
};

// 역할 변경 시 UI 업데이트
function updateUIByRole(role) {
    const idLabel = document.getElementById('idLabel');
    const idInput = document.getElementById('studentId');
    const idHint = document.getElementById('idHint');
    const gradeGroup = document.getElementById('gradeGroup');
    const approvalNotice = document.getElementById('approvalNotice');
    const verificationSection = document.getElementById('verificationSection');
    const verificationTitle = document.getElementById('verificationTitle');
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
            approvalNotice.style.display = 'none';
            verificationSection.style.display = 'none';
            
            // 교직원 부서 옵션 숨기기
            staffOptions.forEach(option => option.style.display = 'none');
            staffCategory.style.display = 'none';
            break;
            
        case 'professor':
            idLabel.textContent = '교번';
            idInput.placeholder = '교번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            approvalNotice.style.display = 'block';
            verificationSection.style.display = 'block';
            verificationTitle.textContent = '교수 신원 인증';
            
            // 교직원 부서 옵션 숨기기
            staffOptions.forEach(option => option.style.display = 'none');
            staffCategory.style.display = 'none';
            
            // 인증 방법 표시
            updateVerificationMethods();
            break;
            
        case 'staff':
            idLabel.textContent = '직번';
            idInput.placeholder = '직번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            approvalNotice.style.display = 'block';
            verificationSection.style.display = 'block';
            verificationTitle.textContent = '교직원 신원 인증';
            
            // 교직원 부서 옵션 표시
            staffOptions.forEach(option => option.style.display = 'block');
            staffCategory.style.display = 'block';
            
            // 인증 방법 표시
            updateVerificationMethods();
            break;
    }
    
    // 입력값 초기화
    idInput.value = '';
    document.getElementById('departmentInput').value = '';
    document.getElementById('selectedDepartment').value = '';
    
    // 인증 관련 입력값 초기화
    if (verificationSection.style.display === 'block') {
        resetVerificationForm();
    }
}

// 역할 선택 이벤트 설정 함수
function setupRoleSelection() {
    console.log('🎯 역할 선택 이벤트 설정 시작');
    
    // 모든 역할 옵션 레이블에 클릭 이벤트 추가
    const roleOptions = document.querySelectorAll('.role-option');
    
    console.log('📋 찾은 역할 옵션 수:', roleOptions.length);
    
    roleOptions.forEach((option, index) => {
        const radioInput = option.querySelector('input[type="radio"]');
        const roleCard = option.querySelector('.role-card');
        
        console.log(`🔍 역할 옵션 ${index + 1}:`, {
            value: radioInput ? radioInput.value : 'null',
            hasCard: !!roleCard
        });
        
        // 레이블 클릭 시
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ 레이블 클릭됨:', radioInput.value);
            
            // 라디오 버튼 선택
            radioInput.checked = true;
            
            // 모든 카드에서 선택 상태 제거
            document.querySelectorAll('.role-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // 현재 카드에 선택 상태 추가
            roleCard.classList.add('selected');
            
            // UI 업데이트
            updateUIByRole(radioInput.value);
            
            console.log('✅ 역할 선택됨:', radioInput.value);
        });
        
        // 카드 클릭 시
        roleCard.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ 카드 클릭됨:', radioInput.value);
            
            // 라디오 버튼 선택
            radioInput.checked = true;
            
            // 모든 카드에서 선택 상태 제거
            document.querySelectorAll('.role-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // 현재 카드에 선택 상태 추가
            roleCard.classList.add('selected');
            
            // UI 업데이트
            updateUIByRole(radioInput.value);
            
            console.log('✅ 역할 카드 클릭됨:', radioInput.value);
        });
        
        // 라디오 버튼 직접 클릭 시
        radioInput.addEventListener('change', function() {
            console.log('🔘 라디오 버튼 변경됨:', this.value);
            
            // 모든 카드에서 선택 상태 제거
            document.querySelectorAll('.role-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // 현재 카드에 선택 상태 추가
            roleCard.classList.add('selected');
            
            // UI 업데이트
            updateUIByRole(this.value);
            
            console.log('✅ 라디오 버튼 변경 완료:', this.value);
        });
    });
    
    // 초기 선택 상태 설정 (학생이 기본 선택)
    const defaultSelected = document.querySelector('input[name="userRole"]:checked');
    if (defaultSelected) {
        const defaultCard = defaultSelected.closest('.role-option').querySelector('.role-card');
        defaultCard.classList.add('selected');
        updateUIByRole(defaultSelected.value);
        console.log('🎯 기본 선택 설정됨:', defaultSelected.value);
    }
    
    console.log('✅ 역할 선택 이벤트 설정 완료');
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
            
            // 카테고리와 옵션 필터링
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
            
            // 모든 옵션과 카테고리 표시
            const categories = departmentDropdown.querySelectorAll('.department-category');
            const options = departmentDropdown.querySelectorAll('.department-option');
            
            categories.forEach(category => {
                if (category.id === 'staffCategory') {
                    // 교직원 카테고리는 역할에 따라 표시
                    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
                    category.style.display = selectedRole === 'staff' ? 'block' : 'none';
                } else {
                    category.style.display = 'block';
                }
            });
            
            options.forEach(option => {
                if (option.classList.contains('staff-option')) {
                    // 교직원 옵션은 역할에 따라 표시
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
            
            // 버튼 텍스트 업데이트
            dropdownBtn.textContent = text;
            
            // 숨겨진 입력 필드에 값 설정
            selectedGradeInput.value = value;
            
            // 드롭다운 닫기
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

// 인증 방법 업데이트 (이메일 인증 포함)
function updateVerificationMethods() {
    const verificationSection = document.getElementById('verificationSection');
    
    // 인증 방법 선택 이벤트 설정
    setupVerificationMethodHandlers();
}

// 인증 방법별 상세 폼 표시
function showVerificationDetails(method) {
    const detailsDiv = document.getElementById('verificationDetails');
    
    switch(method) {
        case 'emailVerification':
            showEmailVerificationForm();
            break;
        case 'documentUpload':
            showDocumentUploadForm();
            break;
    }
}

// 이메일 인증 폼 표시
function showEmailVerificationForm() {
    const detailsDiv = document.getElementById('verificationDetails');
    detailsDiv.innerHTML = `
        <div class="verification-form">
            <h4>📧 대학 이메일 인증</h4>
            
            <div class="form-group">
                <label>대학 이메일 주소 <span class="required">*</span></label>
                <input type="email" id="universityEmail" placeholder="name@yeonsung.ac.kr" 
                       class="form-input" onchange="validateUniversityEmail()">
                <div class="form-hint">@yeonsung.ac.kr 도메인 이메일만 가능합니다</div>
                <div class="error-message" id="email-verification-error"></div>
            </div>
            
            <div class="email-verification-step" id="emailStep1">
                <button type="button" class="btn btn-primary" onclick="sendVerificationEmail()" 
                        id="sendEmailBtn" disabled>
                    📨 인증 이메일 발송
                </button>
            </div>
            
            <div class="email-verification-step" id="emailStep2" style="display: none;">
                <div class="verification-code-section">
                    <div class="form-group">
                        <label>인증 코드 <span class="required">*</span></label>
                        <input type="text" id="verificationCode" placeholder="6자리 인증 코드 입력" 
                               class="form-input" maxlength="6" oninput="validateVerificationCode()">
                        <div class="form-hint">이메일로 발송된 6자리 코드를 입력하세요</div>
                    </div>
                    
                    <div class="verification-timer" id="verificationTimer">
                        ⏰ 남은 시간: <span id="timerDisplay">05:00</span>
                    </div>
                    
                    <div class="verification-actions">
                        <button type="button" class="btn btn-primary" onclick="verifyEmailCode()" 
                                id="verifyCodeBtn" disabled>
                            ✅ 인증 확인
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="resendVerificationEmail()" 
                                id="resendBtn">
                            🔄 재발송
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="email-verification-step" id="emailStep3" style="display: none;">
                <div class="verification-success">
                    <div class="success-icon">✅</div>
                    <div class="success-message">이메일 인증이 완료되었습니다!</div>
                    <div class="success-details">인증된 이메일: <span id="verifiedEmail"></span></div>
                </div>
            </div>
        </div>
    `;
}

// 대학 이메일 유효성 검사
function validateUniversityEmail() {
    const emailInput = document.getElementById('universityEmail');
    const sendBtn = document.getElementById('sendEmailBtn');
    const errorDiv = document.getElementById('email-verification-error');
    
    if (!emailInput) return false;
    
    const email = emailInput.value.trim();
    
    if (!email) {
        sendBtn.disabled = true;
        errorDiv.style.display = 'none';
        return false;
    }
    
    // 기본 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDiv.textContent = '올바른 이메일 형식을 입력해주세요.';
        errorDiv.style.display = 'block';
        sendBtn.disabled = true;
        return false;
    }
    
    // 연성대학교 도메인 확인
    const domain = email.toLowerCase().split('@')[1];
    const allowedDomains = ['yeonsung.ac.kr', 'prof.yeonsung.ac.kr', 'staff.yeonsung.ac.kr'];
    
    if (!allowedDomains.includes(domain)) {
        errorDiv.textContent = '연성대학교 이메일 주소를 입력해주세요. (@yeonsung.ac.kr)';
        errorDiv.style.display = 'block';
        sendBtn.disabled = true;
        return false;
    }
    
    errorDiv.style.display = 'none';
    sendBtn.disabled = false;
    return true;
}

// 6자리 인증 코드 생성
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 이메일 인증 시뮬레이션 (실제 발송 없이)
function sendVerificationEmail() {
    const emailInput = document.getElementById('universityEmail');
    const sendBtn = document.getElementById('sendEmailBtn');
    const errorDiv = document.getElementById('email-verification-error');
    
    if (!emailInput || !sendBtn) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }

    const email = emailInput.value.trim();

    if (!validateUniversityEmail()) {
        return;
    }

    // 인증 코드 생성
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료
    
    // 버튼 비활성화 및 로딩 표시
    sendBtn.disabled = true;
    sendBtn.textContent = '📨 발송 중...';
    if (errorDiv) errorDiv.style.display = 'none';
    
    // 시뮬레이션: 실제로는 이메일이 발송되지 않음
    setTimeout(() => {
        // 발송 성공 시뮬레이션
        emailVerificationData = {
            code: verificationCode,
            email: email,
            expiry: expiryTime,
            verified: false,
            attempts: 0,
            timerInterval: null,
            maxAttempts: 5
        };
        
        // UI 전환
        document.getElementById('emailStep1').style.display = 'none';
        document.getElementById('emailStep2').style.display = 'block';
        
        // 타이머 시작
        startVerificationTimer();
        
        // 개발자 콘솔에 인증 코드 표시 (실제 환경에서는 제거)
        console.log('📧 인증 코드:', verificationCode);
        console.log('📧 인증 이메일:', email);
        
        alert(`✅ 인증 이메일이 발송되었습니다!

📧 이메일: ${email}
🔐 개발용 인증 코드: ${verificationCode}

실제 환경에서는 이메일로 코드가 발송됩니다.
개발 중이므로 위의 코드를 입력하세요.`);
        
    }, 1000); // 1초 후 시뮬레이션 완료
    
    // 버튼 복원
    setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.textContent = '📨 인증 이메일 발송';
    }, 1500);
}

// 인증 코드 입력 검증
function validateVerificationCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    
    if (!codeInput || !verifyBtn) return;
    
    const code = codeInput.value.trim();
    
    if (code && code.length === 6 && /^\d{6}$/.test(code)) {
        verifyBtn.disabled = false;
    } else {
        verifyBtn.disabled = true;
    }
}

// 인증 코드 확인
function verifyEmailCode() {
    const codeInput = document.getElementById('verificationCode');
    
    if (!codeInput) {
        console.error('인증 코드 입력 필드를 찾을 수 없습니다.');
        return;
    }

    const inputCode = codeInput.value.trim();

    // 시도 횟수 확인
    if (emailVerificationData.attempts >= emailVerificationData.maxAttempts) {
        alert(`❌ 최대 ${emailVerificationData.maxAttempts}회 시도를 초과했습니다.

새로운 인증 코드를 요청해주세요.`);
        return;
    }

    // 입력값 검증
    if (!inputCode || inputCode.length !== 6 || !/^\d{6}$/.test(inputCode)) {
        emailVerificationData.attempts++;
        const attemptsLeft = emailVerificationData.maxAttempts - emailVerificationData.attempts;
        
        alert(`❌ 올바른 인증 코드를 입력해주세요.

6자리 숫자 인증 코드를 입력해주세요.
남은 시도 횟수: ${attemptsLeft}회`);
        
        codeInput.value = '';
        codeInput.focus();
        return;
    }

    // 만료 시간 확인
    if (new Date() > emailVerificationData.expiry) {
        alert('❌ 인증 코드가 만료되었습니다.\n\n재발송을 클릭하여 새로운 코드를 받으세요.');
        return;
    }
    
    // 코드 검증
    if (inputCode === emailVerificationData.code) {
        // 인증 성공
        emailVerificationData.verified = true;
        emailVerificationData.attempts = 0;
        
        // 타이머 정지
        if (emailVerificationData.timerInterval) {
            clearInterval(emailVerificationData.timerInterval);
        }
        
        // UI 전환
        document.getElementById('emailStep2').style.display = 'none';
        document.getElementById('emailStep3').style.display = 'block';
        document.getElementById('verifiedEmail').textContent = emailVerificationData.email;
        
        alert(`✅ 이메일 인증이 완료되었습니다!

인증된 이메일: ${emailVerificationData.email}`);
        
    } else {
        // 인증 실패
        emailVerificationData.attempts++;
        
        const attemptsLeft = emailVerificationData.maxAttempts - emailVerificationData.attempts;
        
        alert(`❌ 인증 코드가 일치하지 않습니다.

다시 확인해주세요.
남은 시도 횟수: ${attemptsLeft}회`);
        
        codeInput.value = '';
        codeInput.focus();
    }
}

// 인증 이메일 재발송
function resendVerificationEmail() {
    const resendBtn = document.getElementById('resendBtn');
    
    // 버튼 비활성화
    resendBtn.disabled = true;
    resendBtn.textContent = '🔄 재발송 중...';
    
    // 기존 타이머 정지
    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }
    
    // 새로운 코드로 재발송
    sendVerificationEmail();
    
    // 버튼 복원 (30초 후)
    setTimeout(() => {
        resendBtn.disabled = false;
        resendBtn.textContent = '🔄 재발송';
    }, 30000);
}

// 인증 타이머 시작
function startVerificationTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;

    let timeLeft = 5 * 60; // 5분
    
    emailVerificationData.timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(emailVerificationData.timerInterval);
            timerDisplay.textContent = '시간 만료';
            alert('⏰ 인증 시간이 만료되었습니다.\n\n재발송을 클릭하여 새로운 코드를 받으세요.');
        }
        
        timeLeft--;
    }, 1000);
}
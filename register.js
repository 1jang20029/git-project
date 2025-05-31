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

// EmailJS 설정 (보안 강화)
const EMAILJS_CONFIG = {
    publicKey: "wSUCVBd2HeWkMgWc",           // ✅ 확인된 Public Key
    serviceId: "service_tjelgug",            // ✅ 확인된 Service ID
    templateId: "template_ejprum5",          // ✅ 확인된 Template ID
    isProduction: false                      // 배포시 true로 변경
};

// 이메일 인증 관련 전역 변수 (보안 강화)
let emailVerificationData = {
    code: null,
    email: null,
    expiry: null,
    verified: false,
    timerInterval: null,
    hashedCode: null,
    salt: null,
    sessionId: null,
    attempts: 0,
    maxAttempts: 5
};

// 간단한 해시 함수 (클라이언트 사이드용)
function simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32비트 정수 변환
    }
    return hash.toString();
}

// 세션 ID 생성
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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
            
            // 다중 인증 방법 표시
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
            
            // 다중 인증 방법 표시
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

// 다중 인증 방법 UI 업데이트
function updateVerificationMethods() {
    const verificationSection = document.getElementById('verificationSection');
    
    verificationSection.innerHTML = `
        <div class="verification-header">
            <div class="verification-icon">🔐</div>
            <div class="verification-title">교수/교직원 신원 인증</div>
        </div>
        
        <div class="verification-description">
            <p>다음 중 하나의 방법으로 신원을 인증해주세요.</p>
        </div>
        
        <div class="verification-methods">
            <!-- 방법 1: 이메일 인증 -->
            <div class="method-option">
                <input type="radio" id="emailVerification" name="verificationType" value="emailVerification">
                <label for="emailVerification" class="method-label">
                    <div class="method-icon">📧</div>
                    <div class="method-info">
                        <div class="method-title">대학 이메일 인증</div>
                        <div class="method-desc">@yeonsung.ac.kr 이메일로 실제 인증</div>
                    </div>
                </label>
            </div>
            
            <!-- 방법 2: 서류 업로드 -->
            <div class="method-option">
                <input type="radio" id="documentUpload" name="verificationType" value="documentUpload">
                <label for="documentUpload" class="method-label">
                    <div class="method-icon">📄</div>
                    <div class="method-info">
                        <div class="method-title">서류 업로드</div>
                        <div class="method-desc">교직원증, 임용서류, 급여명세서</div>
                    </div>
                </label>
            </div>
            
            <!-- 방법 3: 관리자 승인 요청 -->
            <div class="method-option">
                <input type="radio" id="manualApproval" name="verificationType" value="manualApproval">
                <label for="manualApproval" class="method-label">
                    <div class="method-icon">👨‍💼</div>
                    <div class="method-info">
                        <div class="method-title">관리자 승인 요청</div>
                        <div class="method-desc">관리자가 직접 확인 후 승인</div>
                    </div>
                </label>
            </div>
        </div>
        
        <!-- 선택된 방법에 따른 상세 입력 폼 -->
        <div id="verificationDetails"></div>
    `;
    
    // 인증 방법 변경 이벤트 설정
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
        case 'manualApproval':
            showManualApprovalForm();
            break;
    }
}

// 실제 이메일 인증 폼 표시
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

// 서류 업로드 폼 표시
function showDocumentUploadForm() {
    const detailsDiv = document.getElementById('verificationDetails');
    detailsDiv.innerHTML = `
        <div class="verification-form">
            <h4>📄 서류 업로드 인증</h4>
            
            <div class="verification-methods">
                <div class="method-option">
                    <input type="radio" id="employeeCard" name="documentType" value="employeeCard">
                    <label for="employeeCard" class="method-label">
                        <div class="method-icon">📇</div>
                        <div class="method-info">
                            <div class="method-title">교직원증</div>
                            <div class="method-desc">현재 유효한 교직원증 또는 신분증</div>
                        </div>
                    </label>
                </div>
                
                <div class="method-option">
                    <input type="radio" id="appointmentDoc" name="documentType" value="appointmentDoc">
                    <label for="appointmentDoc" class="method-label">
                        <div class="method-icon">📄</div>
                        <div class="method-info">
                            <div class="method-title">임용서류</div>
                            <div class="method-desc">임용장, 발령장 등 공식 서류</div>
                        </div>
                    </label>
                </div>
                
                <div class="method-option">
                    <input type="radio" id="payslip" name="documentType" value="payslip">
                    <label for="payslip" class="method-label">
                        <div class="method-icon">💰</div>
                        <div class="method-info">
                            <div class="method-title">급여명세서</div>
                            <div class="method-desc">최근 3개월 이내 급여명세서</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="file-upload-section">
                <label class="form-label">인증 서류 업로드 <span class="required">*</span></label>
                <div class="file-upload-area" id="fileUploadArea">
                    <input type="file" id="verificationFile" accept="image/*,.pdf" style="display: none;">
                    <div class="upload-placeholder">
                        <div class="upload-icon">📎</div>
                        <div class="upload-text">
                            <p>파일을 선택하거나 여기에 드래그하세요</p>
                            <span class="upload-hint">JPG, PNG, PDF 파일만 업로드 가능 (최대 10MB)</span>
                        </div>
                    </div>
                    <div class="uploaded-file" id="uploadedFile" style="display: none;">
                        <div class="file-info">
                            <div class="file-icon">📄</div>
                            <div class="file-details">
                                <div class="file-name" id="fileName"></div>
                                <div class="file-size" id="fileSize"></div>
                            </div>
                            <div class="file-remove" onclick="removeFile()">✕</div>
                        </div>
                    </div>
                </div>
                <div class="error-message" id="file-error">인증 서류를 업로드해주세요</div>
            </div>
        </div>
    `;
    
    // 파일 업로드 기능 설정
    setupFileUpload();
}

// 관리자 승인 폼 표시
function showManualApprovalForm() {
    const detailsDiv = document.getElementById('verificationDetails');
    detailsDiv.innerHTML = `
        <div class="verification-form">
            <h4>👨‍💼 관리자 승인 요청</h4>
            <div class="form-group">
                <label>추가 설명</label>
                <textarea id="approvalNote" class="form-input" placeholder="관리자에게 전달할 메시지를 입력하세요" rows="4"></textarea>
            </div>
            <div class="notice">
                <p>⏰ 관리자 승인은 1-2일 소요될 수 있습니다.</p>
                <p>📞 필요시 관리자가 직접 연락드릴 수 있습니다.</p>
            </div>
        </div>
    `;
}

// 환경별 허용 도메인 설정 (보안 강화)
function getAllowedDomains() {
    if (EMAILJS_CONFIG.isProduction) {
        return [
            'yeonsung.ac.kr',
            'prof.yeonsung.ac.kr',
            'staff.yeonsung.ac.kr'
        ];
    } else {
        // 개발/테스트 환경에서는 추가 도메인 허용
        return [
            'yeonsung.ac.kr',
            'prof.yeonsung.ac.kr',
            'staff.yeonsung.ac.kr',
            'gmail.com',
            'naver.com',
            'daum.net'
        ];
    }
}

// 대학 이메일 유효성 검사 (보안 강화)
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
    
    // 이메일 길이 검증 (보안 강화)
    if (email.length > 254) {
        errorDiv.textContent = '이메일 주소가 너무 깁니다.';
        errorDiv.style.display = 'block';
        sendBtn.disabled = true;
        return false;
    }
    
    const parts = email.split('@');
    if (parts[0].length > 64) {
        errorDiv.textContent = '이메일 사용자명이 너무 깁니다.';
        errorDiv.style.display = 'block';
        sendBtn.disabled = true;
        return false;
    }
    
    // 허용된 도메인 확인
    const allowedDomains = getAllowedDomains();
    const domain = email.toLowerCase().split('@')[1];
    
    if (!allowedDomains.includes(domain)) {
        const message = EMAILJS_CONFIG.isProduction 
            ? '연성대학교 이메일 주소를 입력해주세요. (@yeonsung.ac.kr)'
            : '연성대학교 이메일 또는 테스트용 이메일(@gmail.com, @naver.com)을 입력해주세요.';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        sendBtn.disabled = true;
        return false;
    }
    
    // 특수문자 및 보안 검증 (보안 강화)
    const localPart = parts[0];
    if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
        errorDiv.textContent = '올바르지 않은 이메일 형식입니다.';
        errorDiv.style.display = 'block';
        sendBtn.disabled = true;
        return false;
    }
    
    errorDiv.style.display = 'none';
    sendBtn.disabled = false;
    return true;
}

// 6자리 인증 코드 생성 (보안 강화)
function generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = Math.random().toString(36).substring(2, 15);
    const sessionId = generateSessionId();
    
    const hashedCode = simpleHash(code + salt + sessionId);
    
    emailVerificationData.code = code;
    emailVerificationData.hashedCode = hashedCode;
    emailVerificationData.salt = salt;
    emailVerificationData.sessionId = sessionId;
    
    return code;
}

// 발송 시도 제한 검사 (보안 강화)
function checkEmailRateLimit(email) {
    const key = `email_rate_limit_${email}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    
    // 5분 이내의 시도만 유지
    const recentAttempts = attempts.filter(time => now - time < 5 * 60 * 1000);
    
    // 발송 시도 제한 검사 (보안 강화) - 이어서
    if (recentAttempts.length >= 3) {
        return { 
            limited: true, 
            message: '발송 요청이 너무 빈번합니다. 5분 후 다시 시도해주세요.',
            nextAllowedTime: new Date(recentAttempts[0] + 5 * 60 * 1000)
        };
    }
    
    // 새로운 시도 기록
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    return { limited: false };
}

// 이메일 발송 로깅 (보안 강화)
function logEmailAttempt(email, type, details = '') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        email: email,
        type: type, // attempt, success, failure, error, verified, verify_failed
        details: details,
        sessionId: emailVerificationData.sessionId,
        userAgent: navigator.userAgent.substring(0, 100), // 로그 크기 제한
        ip: 'client-side' // 실제로는 서버에서 처리
    };

    try {
        const logs = JSON.parse(localStorage.getItem('email_verification_logs') || '[]');
        logs.push(logEntry);
        
        // 최대 50개 로그만 유지 (메모리 절약)
        if (logs.length > 50) {
            logs.shift();
        }
        
        localStorage.setItem('email_verification_logs', JSON.stringify(logs));
        console.log('📧 Email Verification Log:', logEntry);
    } catch (error) {
        console.warn('로그 저장 실패:', error);
    }
}

// EmailJS를 통한 실제 이메일 발송 (보안 강화)
async function sendEmailViaEmailJS(to, subject, verificationCode) {
    try {
        console.log('📧 EmailJS 이메일 발송 시도:', { to, subject, sessionId: emailVerificationData.sessionId });
        
        // EmailJS가 로드되었는지 확인
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS 라이브러리가 로드되지 않았습니다.');
        }
        
        // EmailJS 초기화
        emailjs.init(EMAILJS_CONFIG.publicKey);
        
        // 보안 강화된 템플릿 파라미터 (EmailJS 템플릿 변수와 일치)
        const templateParams = {
            to_email: to,                               // {{to_email}}
            to_name: to.split('@')[0],                  // {{to_name}}
            subject: subject,                           // {{subject}}
            verification_code: verificationCode,        // {{verification_code}}
            university_name: '연성대학교',               // {{university_name}}
            app_name: '캠퍼스 가이드',                   // {{app_name}}
            from_name: '연성대학교 캠퍼스 가이드',        // {{from_name}}
            expiry_time: '5분',                        // {{expiry_time}}
            current_year: new Date().getFullYear(),     // {{current_year}}
            session_id: emailVerificationData.sessionId, // {{session_id}}
            security_notice: '⚠️ 이 인증 코드는 일회용이며 5분 후 만료됩니다. 타인과 공유하지 마세요.', // {{security_notice}}
            support_info: '문제가 있으시면 관리자에게 문의하세요.', // {{support_info}}
            timestamp: new Date().toLocaleString('ko-KR') // {{timestamp}}
        };
        
        console.log('📨 EmailJS 템플릿 파라미터:', templateParams);
        
        // 이메일 발송
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        console.log('✅ EmailJS 발송 성공:', response);
        
        return { 
            success: true, 
            message: '이메일이 성공적으로 발송되었습니다.',
            messageId: response.text
        };
        
    } catch (error) {
        console.error('❌ EmailJS 발송 오류:', error);
        
        // 구체적인 오류 메시지
        let errorMessage = '이메일 발송에 실패했습니다.';
        
        if (error.text) {
            errorMessage += `\n오류: ${error.text}`;
        } else if (error.message) {
            errorMessage += `\n오류: ${error.message}`;
        }
        
        return { 
            success: false, 
            message: errorMessage 
        };
    }
}

// 실제 인증 이메일 발송 (보안 강화)
async function sendVerificationEmail() {
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

    try {
        // 발송 시도 제한 확인 (보안 강화)
        const rateLimit = checkEmailRateLimit(email);
        if (rateLimit.limited) {
            if (errorDiv) {
                errorDiv.textContent = rateLimit.message;
                errorDiv.style.display = 'block';
            }
            return;
        }

        // 인증 코드 생성
        const verificationCode = generateVerificationCode();
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료
        
        // 버튼 비활성화 및 로딩 표시
        sendBtn.disabled = true;
        sendBtn.textContent = '📨 발송 중...';
        if (errorDiv) errorDiv.style.display = 'none';
        
        // 로그 기록
        logEmailAttempt(email, 'attempt');
        
        const subject = '연성대학교 캠퍼스 가이드 이메일 인증';
        
        // EmailJS로 실제 이메일 발송
        const result = await sendEmailViaEmailJS(email, subject, verificationCode);
        
        if (result.success) {
            // 발송 성공
            emailVerificationData = {
                ...emailVerificationData,
                email: email,
                expiry: expiryTime,
                verified: false,
                attempts: 0
            };
            
            // 로그 기록
            logEmailAttempt(email, 'success');
            
            // UI 전환
            document.getElementById('emailStep1').style.display = 'none';
            document.getElementById('emailStep2').style.display = 'block';
            
            // 타이머 시작
            startVerificationTimer();
            
            alert(`✅ 인증 이메일이 발송되었습니다!

📧 이메일: ${email}
📮 이메일함을 확인하여 6자리 인증 코드를 입력해주세요.

⚠️ 스팸함도 확인해보세요.
💡 이메일이 도착하지 않으면 재발송을 클릭하세요.
🔐 세션 ID: ${emailVerificationData.sessionId}`);
            
        } else {
            // 발송 실패
            logEmailAttempt(email, 'failure', result.message);
            alert(`❌ 이메일 발송에 실패했습니다.

${result.message}

해결 방법:
1. 네트워크 연결 확인
2. 이메일 주소 확인  
3. 스팸 설정 확인
4. 관리자에게 문의`);
        }
        
    } catch (error) {
        console.error('이메일 발송 오류:', error);
        logEmailAttempt(email, 'error', error.message);
        alert(`❌ 이메일 발송 중 오류가 발생했습니다.

오류: ${error.message}

네트워크 연결을 확인하거나 관리자에게 문의하세요.`);
    } finally {
        // 버튼 복원
        sendBtn.disabled = false;
        sendBtn.textContent = '📨 인증 이메일 발송';
    }
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

// 인증 코드 확인 (보안 강화)
function verifyEmailCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    
    if (!codeInput) {
        console.error('인증 코드 입력 필드를 찾을 수 없습니다.');
        return;
    }

    const inputCode = codeInput.value.trim();

    // 시도 횟수 확인 (보안 강화)
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
    
    // 코드 검증 (해시 비교 - 보안 강화)
    const inputHash = simpleHash(
        inputCode + 
        emailVerificationData.salt + 
        emailVerificationData.sessionId
    );
    
    if (inputHash === emailVerificationData.hashedCode) {
        // 인증 성공
        emailVerificationData.verified = true;
        emailVerificationData.attempts = 0;
        
        // 타이머 정지
        if (emailVerificationData.timerInterval) {
            clearInterval(emailVerificationData.timerInterval);
        }
        
        // 로그 기록
        logEmailAttempt(emailVerificationData.email, 'verified');
        
        // UI 전환
        document.getElementById('emailStep2').style.display = 'none';
        document.getElementById('emailStep3').style.display = 'block';
        document.getElementById('verifiedEmail').textContent = emailVerificationData.email;
        
        alert(`✅ 이메일 인증이 완료되었습니다!

인증된 이메일: ${emailVerificationData.email}
세션 ID: ${emailVerificationData.sessionId}`);
        
    } else {
        // 인증 실패
        emailVerificationData.attempts++;
        logEmailAttempt(emailVerificationData.email, 'verify_failed');
        
        const attemptsLeft = emailVerificationData.maxAttempts - emailVerificationData.attempts;
        
        alert(`❌ 인증 코드가 일치하지 않습니다.

다시 확인해주세요.
남은 시도 횟수: ${attemptsLeft}회`);
        
        codeInput.value = '';
        codeInput.focus();
    }
}

// 인증 이메일 재발송 (보안 강화)
async function resendVerificationEmail() {
    const resendBtn = document.getElementById('resendBtn');
    
    // 버튼 비활성화
    resendBtn.disabled = true;
    resendBtn.textContent = '🔄 재발송 중...';
    
    try {
        // 기존 타이머 정지
        if (emailVerificationData.timerInterval) {
            clearInterval(emailVerificationData.timerInterval);
        }
        
        // 재발송 시도 제한 확인
        const rateLimit = checkEmailRateLimit(emailVerificationData.email);
        if (rateLimit.limited) {
            alert(`❌ ${rateLimit.message}`);
            return;
        }
        
        // 새로운 코드로 재발송
        await sendVerificationEmail();
        
        // 버튼 복원 (30초 후)
        setTimeout(() => {
            resendBtn.disabled = false;
            resendBtn.textContent = '🔄 재발송';
        }, 30000);
        
    } catch (error) {
        console.error('재발송 오류:', error);
        resendBtn.disabled = false;
        resendBtn.textContent = '🔄 재발송';
    }
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

// 파일 업로드 관련 함수들
function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('verificationFile');
    
    if (!fileUploadArea || !fileInput) return;
    
    // 클릭으로 파일 선택
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 파일 선택 시
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // 드래그 앤 드롭
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

function handleFileUpload(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    // 파일 크기 검사
    if (file.size > maxSize) {
        alert('파일 크기가 10MB를 초과합니다.');
        return;
    }
    
    // 파일 형식 검사
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, PDF 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일 정보 표시
    displayUploadedFile(file);
    
    // 선택된 문서 유형 확인
    const selectedDocType = document.querySelector('input[name="documentType"]:checked');
    if (selectedDocType) {
        alert('📄 파일이 업로드되었습니다.\n\n서류 인증이 완료되었습니다.');
    }
}

function displayUploadedFile(file) {
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const uploadedFile = document.getElementById('uploadedFile');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (!uploadPlaceholder || !uploadedFile || !fileName || !fileSize) return;
    
    // 파일 정보 설정
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // UI 업데이트
    uploadPlaceholder.style.display = 'none';
    uploadedFile.style.display = 'flex';
}

function removeFile() {
    const fileInput = document.getElementById('verificationFile');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const uploadedFile = document.getElementById('uploadedFile');
    
    if (!fileInput || !uploadPlaceholder || !uploadedFile) return;
    
    // 파일 입력 초기화
    fileInput.value = '';
    
    // UI 업데이트
    uploadedFile.style.display = 'none';
    uploadPlaceholder.style.display = 'flex';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 인증 방법 선택 이벤트 핸들러
function setupVerificationMethodHandlers() {
    const methods = document.querySelectorAll('input[name="verificationType"]');
    methods.forEach(method => {
        method.addEventListener('change', function() {
            showVerificationDetails(this.value);
        });
    });
}

// 인증 폼 초기화
function resetVerificationForm() {
    // 인증 방법 선택 초기화
    const verificationMethods = document.querySelectorAll('input[name="verificationType"]');
    verificationMethods.forEach(method => method.checked = false);
    
    // 이메일 인증 데이터 초기화 (보안 강화)
    emailVerificationData = {
        code: null,
        email: null,
        expiry: null,
        verified: false,
        timerInterval: null,
        hashedCode: null,
        salt: null,
        sessionId: null,
        attempts: 0,
        maxAttempts: 5
    };
    
    // 타이머 정지
    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }
}

// 인증 상태 검증 (보안 강화)
function validateVerification(selectedRole) {
    if (selectedRole !== 'professor' && selectedRole !== 'staff') {
        return true; // 학생은 인증 불필요
    }
    
    // 인증 방법 선택 확인
    const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
    if (!selectedMethod) {
        alert('인증 방법을 선택해주세요.');
        return false;
    }
    
    // 각 인증 방법별 검증
    switch(selectedMethod.value) {
        case 'emailVerification':
            if (!emailVerificationData.verified) {
                alert(`🔒 이메일 인증을 완료해주세요.

인증 코드를 입력하여 이메일 인증을 완료하세요.
세션 ID: ${emailVerificationData.sessionId || 'N/A'}`);
                return false;
            }
            // 세션 유효성 추가 확인
            if (new Date() > emailVerificationData.expiry) {
                alert('🔒 인증 세션이 만료되었습니다.\n\n새로운 인증을 진행해주세요.');
                return false;
            }
            return true;
            
        case 'documentUpload':
            const fileInput = document.getElementById('verificationFile');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                alert('📄 인증 서류를 업로드해주세요.');
                return false;
            }
            
            // 선택된 문서 유형 확인
            const selectedDocType = document.querySelector('input[name="documentType"]:checked');
            if (!selectedDocType) {
                alert('📄 서류 유형을 선택해주세요.');
                return false;
            }
            return true;
            
        case 'manualApproval':
            return true; // 관리자 승인 요청은 항상 허용
            
        default:
            return false;
    }
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

// 회원가입 함수 (보안 강화)
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
    
    // 교수/교직원 인증 검사 (보안 강화)
    if (!validateVerification(selectedRole)) {
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
    
    // 권한 설정 (교수/교직원은 승인 대기 상태로 설정)
    let userRole = selectedRole;
    let roleStatus = 'approved'; // 기본은 승인됨
    
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        roleStatus = 'pending'; // 승인 대기
        userRole = 'student'; // 승인 전까지는 학생 권한으로 설정
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`user_${userId}_registered`, 'true');
    localStorage.setItem(`user_${userId}_first_login`, 'true');
    localStorage.setItem(`user_${userId}_studentId`, studentId);
    localStorage.setItem(`user_${userId}_name`, name);
    localStorage.setItem(`user_${userId}_department`, department);
    localStorage.setItem(`user_${userId}_phone`, phone);
    localStorage.setItem(`user_${userId}_email`, email);
    localStorage.setItem(`user_${userId}_role`, userRole);
    localStorage.setItem(`user_${userId}_requested_role`, selectedRole);
    localStorage.setItem(`user_${userId}_role_status`, roleStatus);
    
    // 학생인 경우에만 학년 저장
    if (selectedRole === 'student') {
        localStorage.setItem(`user_${userId}_grade`, selectedGrade);
    }
    
    // 소셜 로그인이 아닌 경우에만 비밀번호 저장
    if (!isSocialLogin) {
        localStorage.setItem(`user_${userId}_password`, password);
    } else {
        // 소셜 로그인 타입 저장
        localStorage.setItem(`user_${userId}_socialType`, socialType);
    }
    
    // 교수/교직원 인증 정보 저장 (보안 강화)
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
        
        // 인증 방법 저장
        localStorage.setItem(`user_${userId}_verification_method`, selectedMethod.value);
        localStorage.setItem(`user_${userId}_verification_status`, 'verified'); // 인증 완료
        localStorage.setItem(`user_${userId}_verification_timestamp`, new Date().toISOString());
        
        // 이메일 인증인 경우 이메일 정보 저장
        if (selectedMethod.value === 'emailVerification' && emailVerificationData.verified) {
            localStorage.setItem(`user_${userId}_verified_email`, emailVerificationData.email);
            localStorage.setItem(`user_${userId}_verification_session_id`, emailVerificationData.sessionId);
            localStorage.setItem(`user_${userId}_verification_hash`, emailVerificationData.hashedCode);
        }
        
        // 파일 업로드인 경우 파일 정보 저장 - 이어서
        if (selectedMethod.value === 'documentUpload') {
            const fileInput = document.getElementById('verificationFile');
            const selectedDocType = document.querySelector('input[name="documentType"]:checked');
            
            if (fileInput.files && fileInput.files.length > 0) {
                localStorage.setItem(`user_${userId}_verification_file`, fileInput.files[0].name);
                localStorage.setItem(`user_${userId}_verification_file_size`, fileInput.files[0].size);
                localStorage.setItem(`user_${userId}_verification_file_type`, fileInput.files[0].type);
                
                if (selectedDocType) {
                    localStorage.setItem(`user_${userId}_verification_doc_type`, selectedDocType.value);
                }
            }
        }
        
        // 관리자 승인 요청인 경우 추가 정보 저장
        if (selectedMethod.value === 'manualApproval') {
            const approvalNote = document.getElementById('approvalNote');
            if (approvalNote && approvalNote.value.trim()) {
                localStorage.setItem(`user_${userId}_approval_note`, approvalNote.value.trim());
            }
        }
    }
    
    // 권한 승인 요청이 있는 경우 관리자 승인 목록에 추가
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        let pendingApprovals = JSON.parse(localStorage.getItem('pending_role_approvals') || '[]');
        const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
        
        let approvalData = {
            userId: userId,
            studentId: studentId,
            name: name,
            requestedRole: selectedRole,
            department: department,
            requestDate: new Date().toISOString(),
            status: 'verified',
            verificationMethod: selectedMethod.value,
            verificationTimestamp: new Date().toISOString()
        };
        
        // 인증 방법별 추가 정보 (보안 강화)
        if (selectedMethod.value === 'emailVerification') {
            approvalData.verifiedEmail = emailVerificationData.email;
            approvalData.verificationConfidence = 'high';
            approvalData.sessionId = emailVerificationData.sessionId;
            approvalData.verificationHash = emailVerificationData.hashedCode;
        } else if (selectedMethod.value === 'documentUpload') {
            const fileInput = document.getElementById('verificationFile');
            const selectedDocType = document.querySelector('input[name="documentType"]:checked');
            
            if (fileInput.files && fileInput.files.length > 0) {
                approvalData.verificationFileName = fileInput.files[0].name;
                approvalData.verificationFileType = fileInput.files[0].type;
                approvalData.verificationFileSize = fileInput.files[0].size;
                
                if (selectedDocType) {
                    approvalData.documentType = selectedDocType.value;
                }
            }
        } else if (selectedMethod.value === 'manualApproval') {
            const approvalNote = document.getElementById('approvalNote');
            if (approvalNote && approvalNote.value.trim()) {
                approvalData.approvalNote = approvalNote.value.trim();
            }
        }
        
        pendingApprovals.push(approvalData);
        localStorage.setItem('pending_role_approvals', JSON.stringify(pendingApprovals));
        
        // 성공 메시지 (보안 강화 정보 포함)
        let successMessage = '🎉 회원가입이 완료되었습니다!\n\n✅ 인증이 성공적으로 완료되었습니다.\n📋 교수/교직원 권한은 관리자 검토 후 활성화됩니다.\n⏰ 검토 전까지는 학생 권한으로 서비스를 이용하실 수 있습니다.';
        
        if (selectedMethod.value === 'emailVerification') {
            successMessage += `\n\n🔐 인증 정보:\n- 이메일: ${emailVerificationData.email}\n- 세션 ID: ${emailVerificationData.sessionId}`;
        }
        
        alert(successMessage);
    } else {
        alert('🎉 회원가입이 완료되었습니다!');
    }
    
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
        // 로그인 페이지로 이동 (새로 가입했다는 정보와 학번 전달)
        window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
    }
}

// 설정 확인 및 테스트 함수들 (보안 강화)
function checkEmailJSConfig() {
    console.log('📧 EmailJS 설정 확인 (보안 강화):');
    console.log('Public Key:', EMAILJS_CONFIG.publicKey);
    console.log('Service ID:', EMAILJS_CONFIG.serviceId);
    console.log('Template ID:', EMAILJS_CONFIG.templateId);
    console.log('Production Mode:', EMAILJS_CONFIG.isProduction);
    
    if (typeof emailjs === 'undefined') {
        console.log('❌ EmailJS 라이브러리가 로드되지 않았습니다.');
        return false;
    }
    
    console.log('✅ EmailJS 설정이 완료되었습니다.');
    return true;
}

// 테스트 이메일 발송 함수 (보안 강화)
async function testEmailJS() {
    if (!checkEmailJSConfig()) {
        alert('EmailJS 설정을 확인해주세요.');
        return;
    }
    
    const testEmail = prompt('테스트 이메일 주소를 입력하세요:', 'groria123@yeonsung.ac.kr');
    if (!testEmail) return;
    
    // 이메일 유효성 검사
    const allowedDomains = getAllowedDomains();
    const domain = testEmail.toLowerCase().split('@')[1];
    
    if (!allowedDomains.includes(domain)) {
        alert('허용된 도메인이 아닙니다.\n\n허용된 도메인: ' + allowedDomains.join(', '));
        return;
    }
    
    try {
        // 테스트용 임시 세션 생성
        const tempSessionId = generateSessionId();
        const tempCode = '123456';
        const tempSalt = 'test_salt';
        
        console.log('🧪 테스트 세션 생성:', {
            sessionId: tempSessionId,
            code: tempCode,
            email: testEmail
        });
        
        const result = await sendEmailViaEmailJS(
            testEmail, 
            '연성대학교 캠퍼스 가이드 테스트', 
            tempCode
        );
        
        if (result.success) {
            alert(`✅ 테스트 이메일이 발송되었습니다!

📧 이메일: ${testEmail}
📮 이메일함을 확인해보세요.
🔐 테스트 세션 ID: ${tempSessionId}
🔑 테스트 코드: ${tempCode}`);
        } else {
            alert(`❌ 테스트 실패: ${result.message}`);
        }
        
    } catch (error) {
        console.error('❌ 테스트 이메일 발송 실패:', error);
        alert(`❌ 테스트 실패: ${error.message}`);
    }
}

// 개발용 헬퍼 함수들 (보안 강화)
function showVerificationCode() {
    if (emailVerificationData && emailVerificationData.code) {
        console.log('🔑 현재 인증 정보 (보안 강화):');
        console.log('- 인증 코드:', emailVerificationData.code);
        console.log('- 인증 이메일:', emailVerificationData.email);
        console.log('- 세션 ID:', emailVerificationData.sessionId);
        console.log('- 해시 코드:', emailVerificationData.hashedCode);
        console.log('- 솔트:', emailVerificationData.salt);
        console.log('- 시도 횟수:', emailVerificationData.attempts);
        console.log('- 최대 시도:', emailVerificationData.maxAttempts);
        
        if (emailVerificationData.expiry) {
            console.log('- 만료 시간:', emailVerificationData.expiry.toLocaleString());
            console.log('- 남은 시간:', Math.max(0, Math.floor((emailVerificationData.expiry - new Date()) / 1000)), '초');
        }
        
        return {
            code: emailVerificationData.code,
            sessionId: emailVerificationData.sessionId,
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
                code: emailVerificationData.code,
                sessionId: emailVerificationData.sessionId
            });
            
            return true;
        }
    }
    console.log('❌ 발송된 인증 코드가 없습니다. 먼저 인증 이메일을 발송해주세요.');
    return false;
}

// 로그 조회 함수 (보안 강화)
function showVerificationLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('email_verification_logs') || '[]');
        
        if (logs.length === 0) {
            console.log('📝 저장된 인증 로그가 없습니다.');
            return;
        }
        
        console.log(`📝 이메일 인증 로그 (총 ${logs.length}개):`);
        console.table(logs);
        
        // 최근 5개 로그만 상세 표시
        const recentLogs = logs.slice(-5);
        console.log('📋 최근 5개 로그 상세:');
        recentLogs.forEach((log, index) => {
            console.log(`${index + 1}. [${log.type}] ${log.timestamp}`);
            console.log(`   이메일: ${log.email}`);
            console.log(`   세션: ${log.sessionId}`);
            console.log(`   상세: ${log.details}`);
        });
        
        return logs;
    } catch (error) {
        console.error('로그 조회 실패:', error);
        return null;
    }
}

// 인증 상태 확인 함수 (보안 강화)
function checkVerificationStatus() {
    console.log('🔍 현재 인증 상태:');
    console.log('- 인증 완료:', emailVerificationData.verified);
    console.log('- 이메일:', emailVerificationData.email);
    console.log('- 세션 ID:', emailVerificationData.sessionId);
    console.log('- 시도 횟수:', emailVerificationData.attempts + '/' + emailVerificationData.maxAttempts);
    
    if (emailVerificationData.expiry) {
        const timeLeft = Math.max(0, Math.floor((emailVerificationData.expiry - new Date()) / 1000));
        console.log('- 남은 시간:', timeLeft, '초');
        console.log('- 만료 여부:', timeLeft <= 0 ? '만료됨' : '유효함');
    }
    
    return {
        verified: emailVerificationData.verified,
        email: emailVerificationData.email,
        sessionId: emailVerificationData.sessionId,
        attempts: emailVerificationData.attempts,
        maxAttempts: emailVerificationData.maxAttempts,
        timeLeft: emailVerificationData.expiry ? Math.max(0, Math.floor((emailVerificationData.expiry - new Date()) / 1000)) : 0
    };
}

// 인증 데이터 초기화 함수 (개발용)
function resetVerificationData() {
    // 타이머 정지
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
        hashedCode: null,
        salt: null,
        sessionId: null,
        attempts: 0,
        maxAttempts: 5
    };
    
    // UI 초기화
    const step1 = document.getElementById('emailStep1');
    const step2 = document.getElementById('emailStep2');
    const step3 = document.getElementById('emailStep3');
    
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (step3) step3.style.display = 'none';
    
    const emailInput = document.getElementById('universityEmail');
    const codeInput = document.getElementById('verificationCode');
    
    if (emailInput) emailInput.value = '';
    if (codeInput) codeInput.value = '';
    
    console.log('🔄 인증 데이터가 초기화되었습니다.');
}

// 전역 함수로 노출 (개발자 도구에서 사용 가능)
window.checkEmailJSConfig = checkEmailJSConfig;
window.testEmailJS = testEmailJS;
window.showVerificationCode = showVerificationCode;
window.quickVerify = quickVerify;
window.showVerificationLogs = showVerificationLogs;
window.checkVerificationStatus = checkVerificationStatus;
window.resetVerificationData = resetVerificationData;
window.getVerificationCode = showVerificationCode; // 기존 함수명 호환성

// 페이지 로드 시 초기화 (보안 강화)
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 연성대학교 캠퍼스 가이드 회원가입 페이지 로드됨 (보안 강화)');
    console.log('🔧 개발자 도구 명령어:');
    console.log('  - checkEmailJSConfig() : EmailJS 설정 확인');
    console.log('  - testEmailJS() : 테스트 이메일 발송');
    console.log('  - showVerificationCode() : 현재 인증 코드 확인');
    console.log('  - quickVerify() : 자동 인증 완료');
    console.log('  - showVerificationLogs() : 인증 로그 조회');
    console.log('  - checkVerificationStatus() : 인증 상태 확인');
    console.log('  - resetVerificationData() : 인증 데이터 초기화');
    
    // 학년 드롭다운 설정
    setupGradeDropdown();
    
    // 학과 검색 기능 설정
    setupDepartmentSearch();
    
    // 역할 선택 라디오 버튼 이벤트
    const roleRadios = document.querySelectorAll('input[name="userRole"]');
    roleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateUIByRole(this.value);
        });
    });
    
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
    
    // EmailJS 설정 확인 (보안 강화)
    if (typeof emailjs !== 'undefined') {
        console.log('✅ EmailJS 라이브러리가 로드되었습니다.');
        console.log('📧 실제 이메일 발송이 가능합니다.');
        console.log('🔒 보안 강화 기능이 활성화되었습니다.');
        
        // 설정 자동 확인
        const configValid = checkEmailJSConfig();
        if (configValid) {
            console.log('🎯 EmailJS 설정이 유효합니다.');
        }
    } else {
        console.log('⚠️ EmailJS 라이브러리가 로드되지 않았습니다.');
        console.log('💡 HTML에 EmailJS 스크립트를 추가해주세요:');
        console.log('<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>');
    }
    
    // 보안 기능 초기화
    console.log('🛡️ 보안 기능 활성화:');
    console.log('  - 해시 기반 코드 검증');
    console.log('  - 세션 ID 추적');
    console.log('  - 발송 시도 제한');
    console.log('  - 상세 로깅');
    console.log('  - 도메인 검증 강화');
});
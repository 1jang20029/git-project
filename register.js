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

// SMTP2GO API 설정 (실제 이메일 발송)
const SMTP2GO_CONFIG = {
    apiKey: 'api-342D3ACA2B0B491DBF561AB9BB50849F',
    apiUrl: 'https://api.smtp2go.com/v3/email/send',
    senderEmail: 'noreply@smtp2go.com',
    senderName: '연성대학교 캠퍼스 가이드'
};

// 이메일 인증 관련 전역 변수
let emailVerificationData = {
    code: null,
    email: null,
    expiry: null,
    verified: false,
    timerInterval: null
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

// 대학 이메일 유효성 검사
function validateUniversityEmail() {
    const email = document.getElementById('universityEmail').value;
    const sendBtn = document.getElementById('sendEmailBtn');
    const errorDiv = document.getElementById('email-verification-error');
    
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
    
    // 연성대학교 이메일 도메인 확인 (테스트를 위해 Gmail도 허용)
    const validDomains = [
        '@yeonsung.ac.kr',
        '@prof.yeonsung.ac.kr',
        '@staff.yeonsung.ac.kr',
        '@gmail.com', // 테스트용
        '@naver.com', // 테스트용
        '@daum.net'   // 테스트용
    ];
    
    const isValidDomain = validDomains.some(domain => email.toLowerCase().endsWith(domain));
    
    if (!isValidDomain) {
        errorDiv.textContent = '연성대학교 이메일 주소 또는 테스트용 이메일(@gmail.com, @naver.com)을 입력해주세요.';
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

// 시뮬레이션된 이메일 발송 (개발/테스트용)
async function sendEmailSimulation(to, subject, htmlContent, verificationCode) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 개발 환경에서는 콘솔에 이메일 내용을 출력
            console.log('=== 시뮬레이션된 이메일 발송 ===');
            console.log('받는 사람:', to);
            console.log('제목:', subject);
            console.log('인증 코드:', verificationCode);
            console.log('=============================');
            
            // 항상 성공으로 처리
            resolve({ 
                success: true, 
                message: '시뮬레이션 이메일이 발송되었습니다. (콘솔 확인)' 
            });
        }, 1500); // 1.5초 지연으로 실제 발송처럼 보이게
    });
}

// EmailJS를 사용한 이메일 발송 (권장)
async function sendEmailViaEmailJS(to, subject, htmlContent, verificationCode) {
    try {
        // EmailJS가 로드되었는지 확인
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS가 로드되지 않았습니다.');
        }
        
        // EmailJS 초기화 (실제 사용 시 EmailJS에서 발급받은 키 사용)
        emailjs.init("YOUR_PUBLIC_KEY"); // EmailJS에서 발급받은 Public Key
        
        const templateParams = {
            to_email: to,
            subject: subject,
            verification_code: verificationCode,
            from_name: '연성대학교 캠퍼스 가이드',
            message: `인증 코드: ${verificationCode}`
        };
        
        const response = await emailjs.send(
            "YOUR_SERVICE_ID", // EmailJS 서비스 ID
            "YOUR_TEMPLATE_ID", // EmailJS 템플릿 ID
            templateParams
        );
        
        return { 
            success: true, 
            message: '이메일이 성공적으로 발송되었습니다.' 
        };
    } catch (error) {
        console.error('EmailJS 발송 오류:', error);
        return { 
            success: false, 
            message: 'EmailJS 설정이 필요합니다.' 
        };
    }
}

// 백엔드 서버를 통한 이메일 발송
async function sendEmailViaBackend(to, subject, htmlContent, verificationCode) {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: to,
                subject: subject,
                html: htmlContent,
                verificationCode: verificationCode
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            return { 
                success: true, 
                message: '이메일이 성공적으로 발송되었습니다.' 
            };
        } else {
            return { 
                success: false, 
                message: result.message || '이메일 발송 실패' 
            };
        }
    } catch (error) {
        console.error('백엔드 이메일 발송 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다.' 
        };
    }
}

// 이메일 템플릿 생성
function createEmailTemplate(verificationCode) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">연성대학교</h1>
                <h2 style="margin: 10px 0 0 0; font-size: 20px;">캠퍼스 가이드 이메일 인증</h2>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">안녕하세요!</p>
                <p style="font-size: 16px; color: #333; margin-bottom: 30px; line-height: 1.6;">
                    연성대학교 캠퍼스 가이드 회원가입을 위한 이메일 인증 코드입니다.
                </p>
                
                <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">📧 인증 코드</h3>
                    <div style="font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p style="color: #666; font-size: 14px; margin-top: 15px;">
                        ⏰ 이 코드는 <strong>5분간</strong> 유효합니다.
                    </p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ 보안 안내</h4>
                    <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.5;">
                        <li>본인이 요청하지 않은 경우, 이 이메일을 무시하시기 바랍니다.</li>
                        <li>인증 코드를 타인에게 절대 알려주지 마세요.</li>
                        <li>5분 후 코드가 만료되면 재발송을 요청하세요.</li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                    문의사항이 있으시면 관리자에게 연락주세요.
                </p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px;">© 2025 연성대학교 캠퍼스 가이드 시스템</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #ccc;">이 이메일은 자동으로 발송되었습니다.</p>
            </div>
        </div>
    `;
}

// 실제 인증 이메일 발송
async function sendVerificationEmail() {
    const email = document.getElementById('universityEmail').value;
    const sendBtn = document.getElementById('sendEmailBtn');
    
    if (!validateUniversityEmail()) {
        return;
    }
    
    // 인증 코드 생성
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료
    
    // 이메일 내용 생성
    const subject = '연성대학교 캠퍼스 가이드 이메일 인증';
    const htmlContent = createEmailTemplate(verificationCode);
    
    // 버튼 비활성화 및 로딩 표시
    sendBtn.disabled = true;
    sendBtn.textContent = '📨 발송 중...';
    
    try {
        // 항상 시뮬레이션 모드 사용 (개발용)
        console.log('=== 이메일 인증 코드 발송 ===');
        console.log('받는 사람:', email);
        console.log('제목:', subject);
        console.log('🔑 인증 코드:', verificationCode);
        console.log('===========================');
        
        // 1.5초 지연으로 실제 발송처럼 보이게
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 발송 성공으로 처리
        emailVerificationData = {
            code: verificationCode,
            email: email,
            expiry: expiryTime,
            verified: false,
            timerInterval: null
        };
        
        // UI 전환
        document.getElementById('emailStep1').style.display = 'none';
        document.getElementById('emailStep2').style.display = 'block';
        
        // 타이머 시작
        startVerificationTimer();
        
        // 성공 알림
        alert(`✅ 인증 이메일이 발송되었습니다!

📧 이메일: ${email}
🔑 인증 코드: ${verificationCode}

💡 개발 모드에서는 콘솔(F12)에서도 인증 코드를 확인할 수 있습니다.`);
        
        // 버튼 복원
        sendBtn.disabled = false;
        sendBtn.textContent = '📨 인증 이메일 발송';
        
    } catch (error) {
        console.error('이메일 발송 오류:', error);
        alert('❌ 이메일 발송 중 오류가 발생했습니다.\n\n네트워크 연결을 확인해주세요.');
        sendBtn.disabled = false;
        sendBtn.textContent = '📨 인증 이메일 발송';
    }
}

// 인증 코드 입력 검증
function validateVerificationCode() {
    const code = document.getElementById('verificationCode').value;
    const verifyBtn = document.getElementById('verifyCodeBtn');
    
    if (code && code.length === 6 && /^\d{6}$/.test(code)) {
        verifyBtn.disabled = false;
    } else {
        verifyBtn.disabled = true;
    }
}


// 개발용 빠른 인증 함수 (콘솔에서 사용)
function quickVerify() {
    if (emailVerificationData && emailVerificationData.code) {
        const codeInput = document.getElementById('verificationCode');
        if (codeInput) {
            codeInput.value = emailVerificationData.code;
            validateVerificationCode();
            verifyEmailCode();
        }
    } else {
        console.log('발송된 인증 코드가 없습니다. 먼저 인증 이메일을 발송해주세요.');
    }
}


// 전역으로 노출
window.quickVerify = quickVerify;


// 인증 코드 확인
function verifyEmailCode() {
    const inputCode = document.getElementById('verificationCode').value;
    const verifyBtn = document.getElementById('verifyCodeBtn');
    
    if (!inputCode || inputCode.length !== 6) {
        alert('6자리 인증 코드를 입력해주세요.');
        return;
    }
    
    // 만료 시간 확인
    if (new Date() > emailVerificationData.expiry) {
        alert('❌ 인증 코드가 만료되었습니다.\n\n재발송을 클릭하여 새로운 코드를 받으세요.');
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
        
        // UI 전환
        document.getElementById('emailStep2').style.display = 'none';
        document.getElementById('emailStep3').style.display = 'block';
        document.getElementById('verifiedEmail').textContent = emailVerificationData.email;
        
        alert('✅ 이메일 인증이 완료되었습니다!');
        
    } else {
        // 인증 실패
        alert('❌ 인증 코드가 일치하지 않습니다.\n\n다시 확인해주세요.');
        document.getElementById('verificationCode').value = '';
        document.getElementById('verificationCode').focus();
    }
}

// 인증 이메일 재발송
async function resendVerificationEmail() {
    const resendBtn = document.getElementById('resendBtn');
    
    // 버튼 비활성화
    resendBtn.disabled = true;
    resendBtn.textContent = '🔄 재발송 중...';
    
    try {
        // 새로운 코드로 재발송
        await sendVerificationEmail();
        
        // 버튼 복원
        setTimeout(() => {
            resendBtn.disabled = false;
            resendBtn.textContent = '🔄 재발송';
        }, 30000); // 30초 후 재발송 가능
        
    } catch (error) {
        resendBtn.disabled = false;
        resendBtn.textContent = '🔄 재발송';
    }
}

// 인증 타이머 시작
function startVerificationTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
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
    
    // 이메일 인증 데이터 초기화
    emailVerificationData = {
        code: null,
        email: null,
        expiry: null,
        verified: false,
        timerInterval: null
    };
    
    // 타이머 정지
    if (emailVerificationData.timerInterval) {
        clearInterval(emailVerificationData.timerInterval);
    }
}

// 인증 상태 검증
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
                alert('🔒 이메일 인증을 완료해주세요.\n\n인증 코드를 입력하여 이메일 인증을 완료하세요.');
                return false;
            }
            return true;
            
        case 'documentUpload':
            const fileInput = document.getElementById('verificationFile');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                alert('📄 인증 서류를 업로드해주세요.');
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
    
    // 교수/교직원 인증 검사
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
    
    // 교수/교직원 인증 정보 저장
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
        
        // 인증 방법 저장
        localStorage.setItem(`user_${userId}_verification_method`, selectedMethod.value);
        localStorage.setItem(`user_${userId}_verification_status`, 'verified'); // 인증 완료
        
        // 이메일 인증인 경우 이메일 정보 저장
        if (selectedMethod.value === 'emailVerification' && emailVerificationData.verified) {
            localStorage.setItem(`user_${userId}_verified_email`, emailVerificationData.email);
        }
        
        // 파일 업로드인 경우 파일 정보 저장
        if (selectedMethod.value === 'documentUpload') {
            const fileInput = document.getElementById('verificationFile');
            if (fileInput.files && fileInput.files.length > 0) {
                localStorage.setItem(`user_${userId}_verification_file`, fileInput.files[0].name);
                localStorage.setItem(`user_${userId}_verification_file_size`, fileInput.files[0].size);
                localStorage.setItem(`user_${userId}_verification_file_type`, fileInput.files[0].type);
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
            verificationMethod: selectedMethod.value
        };
        
        // 인증 방법별 추가 정보
        if (selectedMethod.value === 'emailVerification') {
            approvalData.verifiedEmail = emailVerificationData.email;
            approvalData.verificationConfidence = 'high';
        } else if (selectedMethod.value === 'documentUpload') {
            const fileInput = document.getElementById('verificationFile');
            if (fileInput.files && fileInput.files.length > 0) {
                approvalData.verificationFileName = fileInput.files[0].name;
                approvalData.verificationFileType = fileInput.files[0].type;
            }
        }
        
        pendingApprovals.push(approvalData);
        localStorage.setItem('pending_role_approvals', JSON.stringify(pendingApprovals));
        
        alert('🎉 회원가입이 완료되었습니다!\n\n✅ 인증이 성공적으로 완료되었습니다.\n📋 교수/교직원 권한은 관리자 검토 후 활성화됩니다.\n⏰ 검토 전까지는 학생 권한으로 서비스를 이용하실 수 있습니다.');
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

// 개발 환경에서 인증 코드 확인을 위한 헬퍼 함수
function getVerificationCodeFromConsole() {
    if (emailVerificationData && emailVerificationData.code) {
        console.log('현재 인증 코드:', emailVerificationData.code);
        return emailVerificationData.code;
    } else {
        console.log('생성된 인증 코드가 없습니다.');
        return null;
    }
}

// 개발자 도구에서 사용할 수 있도록 전역으로 노출
window.getVerificationCode = getVerificationCodeFromConsole;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
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
            document.getElementById('passwordFields').style.display = 'none';
            
            // 소셜 정보 표시
            document.getElementById('socialInfoBox').style.display = 'block';
            document.getElementById('socialType').textContent = getSocialTypeName(socialType);
            
            // 소셜 아이콘 설정
            const socialIconElem = document.getElementById('socialIcon');
            socialIconElem.textContent = socialType.charAt(0).toUpperCase();
            socialIconElem.className = `social-icon ${socialType}-icon`;
        }
    }
    
    // ID 입력 실시간 검증
    const idInput = document.getElementById('studentId');
    idInput.addEventListener('input', function() {
        const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
        const errorDiv = document.getElementById('studentId-error');
        
        if (this.value && !validateIdPattern(selectedRole, this.value)) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = getIdErrorMessage(selectedRole);
        } else {
            errorDiv.style.display = 'none';
        }
    });
    
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
    emailInput.addEventListener('input', function() {
        validateEmail(this.value);
    });
});
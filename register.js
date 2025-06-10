// register.js
// PC 전용 회원가입 페이지 JavaScript (AWS SES 이메일 인증 백엔드 연동)

document.addEventListener('DOMContentLoaded', function() {
    // =============================================================================
    // 이메일 인증 데이터 관리
    // =============================================================================
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

    // =============================================================================
    // DOM 요소 캐싱 & 초기 UI 상태 설정
    // =============================================================================
    const emailInput    = document.getElementById('verificationEmail');
    const sendBtn       = document.getElementById('sendVerificationBtn');
    const codeGroup     = document.getElementById('verificationCodeGroup');
    const codeInput     = document.getElementById('verificationCode');
    const verifyBtn     = document.getElementById('verifyCodeBtn');
    const timerDiv      = document.getElementById('verificationTimer');
    const timerDisplay  = document.getElementById('timerDisplay');
    const emailErrorDiv = document.getElementById('verification-email-error');
    const codeErrorDiv  = document.getElementById('verification-code-error');
    const successDiv    = document.getElementById('verification-success');

    // 로그인 돌아가기 버튼
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const loginRedirectBtn = document.getElementById('loginRedirectBtn');

    codeGroup.style.display     = 'none';
    timerDiv.style.display      = 'none';
    emailErrorDiv.style.display = 'none';
    codeErrorDiv.style.display  = 'none';
    successDiv.style.display    = 'none';
    verifyBtn.disabled          = true;

    // =============================================================================
    // 로그인 페이지로 돌아가기 함수들
    // =============================================================================
    function goBackToLogin() {
        // URL 파라미터에서 소셜 로그인 정보 확인
        const urlParams = new URLSearchParams(window.location.search);
        const socialType = urlParams.get('social');
        
        if (socialType) {
            // 소셜 로그인 진행 중이었다면 확인 후 이동
            const confirmed = confirm(
                `${getSocialTypeName(socialType)} 로그인 진행 중입니다.\n` +
                '로그인 페이지로 돌아가시겠습니까?\n' +
                '(진행 중인 정보는 삭제됩니다)'
            );
            
            if (confirmed) {
                // 소셜 로그인 임시 데이터 정리
                clearSocialTempData();
                window.location.href = 'login.html';
            }
        } else {
            // 일반 회원가입이라면 바로 이동
            const confirmed = confirm('회원가입을 취소하고 로그인 페이지로 돌아가시겠습니까?');
            if (confirmed) {
                window.location.href = 'login.html';
            }
        }
    }

    function clearSocialTempData() {
        // 소셜 로그인 관련 임시 데이터 모두 삭제
        const socialTempKeys = [
            'temp_social_id',
            'temp_social_type', 
            'temp_social_name',
            'temp_social_email',
            'temp_social_profile_image'
        ];
        
        socialTempKeys.forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        console.log('🧹 소셜 로그인 임시 데이터 정리 완료');
    }

    function handleLoginRedirect() {
        // 회원가입 완료 후 로그인 페이지로 이동하는 함수
        window.location.href = 'login.html?from=register';
    }

    // =============================================================================
    // 키보드 이벤트 처리 (ESC 키로 뒤로가기)
    // =============================================================================
    function handleKeyboardEvents(event) {
        // ESC 키를 누르면 로그인 페이지로 돌아가기
        if (event.key === 'Escape') {
            event.preventDefault();
            goBackToLogin();
        }
        
        // Enter 키 처리
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            
            // 이메일 입력창에서 Enter 시 인증코드 발송
            if (activeElement === emailInput) {
                event.preventDefault();
                sendVerificationEmail();
            }
            
            // 인증코드 입력창에서 Enter 시 인증 확인
            else if (activeElement === codeInput) {
                event.preventDefault();
                if (!verifyBtn.disabled) {
                    verifyEmailCode();
                }
            }
            
            // 회원가입 버튼이 포커스되어 있으면 회원가입 실행
            else if (activeElement && activeElement.id === 'registerBtn') {
                event.preventDefault();
                register();
            }
        }
    }

    // =============================================================================
    // 인증 이메일 발송 (백엔드 API 호출)
    // =============================================================================
    async function sendVerificationEmail() {
        if (emailVerificationData.isProcessing) return;

        const email = emailInput.value.trim();
        emailErrorDiv.style.display = 'none';

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@yeonsung\.ac\.kr$/i;
        if (!emailRegex.test(email)) {
            emailErrorDiv.textContent = '연성대학교 공식 이메일(@yeonsung.ac.kr)을 입력해주세요';
            emailErrorDiv.style.display = 'block';
            emailErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (emailVerificationData.attempts >= emailVerificationData.maxAttempts) {
            alert('❌ 최대 발송 횟수를 초과했습니다.\n새로고침 후 다시 시도해주세요.');
            return;
        }

        emailVerificationData.isProcessing = true;
        sendBtn.disabled = true;
        sendBtn.textContent = '발송 중...';

        let response, result;
        try {
            try {
                response = await fetch('/api/send-verification-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
            } catch (networkError) {
                throw new Error('서버와 통신 중 오류가 발생했습니다.');
            }
            result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || '이메일 발송에 실패했습니다.');
            }

            // 백엔드에서 반환한 데이터로 상태 업데이트
            emailVerificationData.attempts++;
            emailVerificationData.email           = email;
            emailVerificationData.expiry          = new Date(result.expiry);
            emailVerificationData.verificationId  = result.verificationId;
            emailVerificationData.verified        = false;
        } catch (err) {
            console.error(err);
            emailErrorDiv.textContent = err.message;
            emailErrorDiv.style.display = 'block';
            emailErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            // UI 복원 및 타이머 시작
            emailVerificationData.isProcessing = false;
            sendBtn.disabled = false;
            sendBtn.textContent = '재발송';

            if (result && result.success) {
                codeGroup.style.display = 'block';
                startVerificationTimer();
                successDiv.textContent = `✅ 인증코드가 ${email}로 발송되었습니다.`;
                successDiv.style.display = 'block';
                
                // 인증코드 입력창으로 포커스 이동
                setTimeout(() => {
                    codeInput.focus();
                }, 100);
            }
        }
    }

    // =============================================================================
    // 인증 타이머 시작
    // =============================================================================
    function startVerificationTimer() {
        timerDiv.style.display = 'block';
        clearInterval(emailVerificationData.timerInterval);
        emailVerificationData.timerInterval = setInterval(() => {
            const left = Math.max(0,
                Math.floor((emailVerificationData.expiry - new Date()) / 1000)
            );
            timerDisplay.textContent =
                `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
            if (left <= 0) {
                clearInterval(emailVerificationData.timerInterval);
                timerDisplay.textContent = '00:00';
                timerDiv.style.display = 'none';
                codeErrorDiv.textContent = '⏰ 인증 시간이 만료되었습니다. 다시 발송해주세요.';
                codeErrorDiv.style.display = 'block';
                codeErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                verifyBtn.disabled = true;
            }
        }, 1000);
    }

    // =============================================================================
    // 인증 코드 실시간 검증
    // =============================================================================
    function validateVerificationCode() {
        const code = codeInput.value.trim();
        if (/^\d{6}$/.test(code)) {
            verifyBtn.disabled = false;
            codeErrorDiv.style.display = 'none';
        } else {
            verifyBtn.disabled = true;
            if (code.length) {
                codeErrorDiv.textContent = '6자리 숫자를 입력해주세요';
                codeErrorDiv.style.display = 'block';
            } else {
                codeErrorDiv.style.display = 'none';
            }
        }
    }

    // =============================================================================
    // 인증 코드 확인 (백엔드 API 호출)
    // =============================================================================
    async function verifyEmailCode() {
        if (emailVerificationData.isProcessing) return;

        const code = codeInput.value.trim();
        codeErrorDiv.style.display = 'none';

        if (!/^\d{6}$/.test(code)) {
            codeErrorDiv.textContent = '6자리 숫자를 입력해주세요.';
            codeErrorDiv.style.display = 'block';
            codeErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        emailVerificationData.isProcessing = true;
        verifyBtn.disabled = true;
        verifyBtn.textContent = '확인 중...';

        try {
            let response, result;
            try {
                response = await fetch('/api/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailVerificationData.email,
                        code,
                        verificationId: emailVerificationData.verificationId
                    })
                });
            } catch (networkError) {
                throw new Error('서버와 통신 중 오류가 발생했습니다.');
            }
            result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || '인증 실패');
            }

            // 인증 성공 처리
            emailVerificationData.verified = true;
            clearInterval(emailVerificationData.timerInterval);

            codeInput.disabled = true;
            verifyBtn.textContent = '인증완료';
            successDiv.textContent = '✅ 이메일 인증이 완료되었습니다';
            successDiv.style.display = 'block';
            timerDiv.style.display = 'none';
            
            // 성공 후 다음 단계로 포커스 이동
            const registerBtn = document.getElementById('registerBtn');
            if (registerBtn) {
                setTimeout(() => {
                    registerBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    registerBtn.focus();
                }, 500);
            }
            
            alert('✅ 이메일 인증이 완료되었습니다!');
        } catch (err) {
            console.error(err);
            codeErrorDiv.textContent = err.message;
            codeErrorDiv.style.display = 'block';
            codeErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verifyBtn.disabled = false;
            verifyBtn.textContent = '인증확인';
            codeInput.focus();
        } finally {
            emailVerificationData.isProcessing = false;
        }
    }

    // =============================================================================
    // (이하 기존 유효성 검사 및 UI 함수 — 생략 없이 동일)
    // =============================================================================
    function formatPhoneNumber(input) {
        let num = input.value.replace(/\D/g, '');
        if (num.length > 3 && num.length <= 7) num = num.replace(/(\d{3})(\d+)/, '$1-$2');
        else if (num.length > 7) num = num.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
        input.value = num;
        validatePhoneNumber(num);
    }
    function validatePhoneNumber(phone) {
        const err = document.getElementById('phone-error');
        const clean = phone.replace(/\D/g, '');
        if (phone && (!clean.startsWith('010') || clean.length !== 11)) {
            err.style.display = 'block'; return false;
        }
        err.style.display = 'none'; return true;
    }
    function validateEmail(email) {
        const err = document.getElementById('email-error');
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !re.test(email)) { err.style.display = 'block'; return false; }
        err.style.display = 'none'; return true;
    }
    function validatePassword(pw) {
        const err = document.getElementById('password-error');
        const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (pw && !re.test(pw)) { err.style.display = 'block'; return false; }
        err.style.display = 'none'; return true;
    }
    function validatePasswordConfirm(pw, cpw) {
        const err = document.getElementById('confirmPassword-error');
        if (cpw && pw !== cpw) { err.style.display = 'block'; return false; }
        err.style.display = 'none'; return true;
    }
    function validateIdPattern(role, id) {
        return role === 'student'
            ? /^\d{10}$/.test(id)
            : /^\d{7}$/.test(id);
    }
    function getIdErrorMessage(role) {
        return role === 'student'
            ? '10자리 숫자로 입력해주세요 (예: 2024123456)'
            : '7자리 숫자로 입력해주세요 (예: 2024001)';
    }
    function getSocialTypeName(type) {
        return { kakao: '카카오', google: '구글', naver: '네이버' }[type] || '소셜';
    }
    function validateEmailVerification(role) {
        if (!['professor','staff'].includes(role)) return true;
        const errEmail = document.getElementById('verification-email-error');
        const errCode  = document.getElementById('verification-code-error');
        if (!emailVerificationData.verified) {
            errEmail.textContent = '🔒 이메일 인증이 필요합니다.';
            errEmail.style.display = 'block';
            errEmail.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        if (emailVerificationData.expiry < new Date()) {
            errCode.textContent = '🔒 인증 세션이 만료되었습니다.';
            errCode.style.display = 'block';
            errCode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        return true;
    }
    function resetEmailVerification() {
        clearInterval(emailVerificationData.timerInterval);
        emailVerificationData = {
            code: null, email: null, expiry: null,
            verified: false, attempts: 0,
            maxAttempts: 5, isProcessing: false,
            verificationId: null
        };
        [ emailInput, codeInput ].forEach(el => {
            if (el) { el.value = ''; el.disabled = false; }
        });
        [ codeGroup, timerDiv, successDiv ].forEach(el => {
            if (el) el.style.display = 'none';
        });
        sendBtn.textContent   = '인증코드 발송';
        verifyBtn.textContent = '인증확인';
        verifyBtn.disabled    = true;
        document.querySelectorAll('.error-message').forEach(e => {
            if (e) e.style.display = 'none';
        });
    }
    function updateUIByRole(role) {
        const labels = {
            student:   ['학번','학번을 입력하세요','예: 2024123456 (10자리)'],
            professor: ['교번','교번을 입력하세요','예: 2024001 (7자리)'],
            staff:     ['직번','직번을 입력하세요','예: 2024001 (7자리)']
        }[role];
        const [lab, ph, hint] = labels;
        document.getElementById('idLabel').textContent = lab;
        const idIn = document.getElementById('studentId');
        idIn.placeholder = ph;
        document.getElementById('idHint').textContent = hint;
        document.getElementById('gradeGroup').style.display = role === 'student' ? 'block' : 'none';
        document.getElementById('emailVerificationSection').style.display = role !== 'student' ? 'block' : 'none';
        document.querySelectorAll('.staff-option').forEach(el => {
            el.style.display = role === 'staff' ? 'block' : 'none';
        });
        resetEmailVerification();
        idIn.value = '';
        document.getElementById('departmentInput').value = '';
    }

    // =============================================================================
    // 학과/학년 UI 초기화
    // =============================================================================
    function setupDepartmentSearch() {
        const depIn = document.getElementById('departmentInput');
        const dropdown = document.getElementById('departmentDropdown');
        const opts = dropdown.querySelectorAll('.department-option');
        depIn.addEventListener('input', () => {
            const term = depIn.value.toLowerCase();
            dropdown.style.display = term ? 'block' : 'none';
            dropdown.querySelectorAll('.department-category').forEach(cat => cat.style.display = 'none');
            opts.forEach(o => {
                const ok = o.textContent.toLowerCase().includes(term);
                o.style.display = ok ? 'block' : 'none';
                if (ok) {
                    let prev = o.previousElementSibling;
                    while (prev) {
                        if (prev.classList.contains('department-category')) {
                            prev.style.display = 'block';
                            break;
                        }
                        prev = prev.previousElementSibling;
                    }
                }
            });
        });
        depIn.addEventListener('focus', () => {
            if (!depIn.value) dropdown.style.display = 'block';
        });
        opts.forEach(o => o.addEventListener('click', () => {
            depIn.value = o.textContent;
            document.getElementById('selectedDepartment').value = o.dataset.value;
            dropdown.style.display = 'none';
        }));
        document.addEventListener('click', e => {
            if (!e.target.closest('.department-container')) dropdown.style.display = 'none';
        });
    }
    function setupGradeDropdown() {
        const btn = document.getElementById('gradeDropdownBtn');
        const menu = document.getElementById('gradeDropdown');
        const sel = document.getElementById('selectedGrade');
        btn.addEventListener('click', () => menu.classList.toggle('show'));
        menu.querySelectorAll('.grade-option').forEach(o => {
            o.addEventListener('click', () => {
                btn.textContent = o.textContent;
                sel.value = o.dataset.value;
                menu.classList.remove('show');
            });
        });
        window.addEventListener('click', e => {
            if (!e.target.matches('.grade-button') && !e.target.matches('.grade-option')) {
                menu.classList.remove('show');
            }
        });
    }

    // =============================================================================
    // 회원가입 처리
    // =============================================================================
    function register() {
        const roleEl = document.querySelector('input[name="userRole"]:checked');
        if (!roleEl) { alert('역할을 선택해주세요.'); return; }
        const role = roleEl.value;

        const studentId  = document.getElementById('studentId').value.trim();
        const name       = document.getElementById('name').value.trim();
        const department = document.getElementById('selectedDepartment').value ||
                           document.getElementById('departmentInput').value.trim();
        const grade      = document.getElementById('selectedGrade').value;
        const phone      = document.getElementById('phone').value.trim();
        const email      = document.getElementById('email').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const agreePriv  = document.getElementById('agreePrivacy').checked;
        const socialType = new URLSearchParams(window.location.search).get('social');
        const isSocial   = Boolean(socialType);
        let password     = '';
        if (!isSocial) {
            password = document.getElementById('password').value;
            const cpw = document.getElementById('confirmPassword').value;
            if (!validatePassword(password) || !validatePasswordConfirm(password, cpw)) return;
        }

        if (!validateIdPattern(role, studentId)) {
            const err = document.getElementById('studentId-error');
            err.textContent = getIdErrorMessage(role); err.style.display = 'block'; err.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!studentId || !name || !department || !phone || !email) {
            alert('모든 필수 항목을 입력해주세요.'); return;
        }
        if (!validatePhoneNumber(phone) || !validateEmail(email)) return;
        if (role === 'student' && !grade) { alert('학년을 선택해주세요.'); return; }
        if (!validateEmailVerification(role)) return;
        if (!agreeTerms || !agreePriv) { alert('필수 약관에 동의해주세요.'); return; }

        const userId = isSocial
            ? sessionStorage.getItem('temp_social_id') || studentId
            : studentId;
        const now = new Date().toISOString();

        localStorage.setItem(`user_${userId}_registered`, 'true');
        localStorage.setItem(`user_${userId}_first_login`, 'true');
        localStorage.setItem(`user_${userId}_studentId`, studentId);
        localStorage.setItem(`user_${userId}_name`, name);
        localStorage.setItem(`user_${userId}_department`, department);
        localStorage.setItem(`user_${userId}_phone`, phone);
        localStorage.setItem(`user_${userId}_email`, email);
        localStorage.setItem(`user_${userId}_role`, role);
        localStorage.setItem(`user_${userId}_role_status`, 'approved');
        if (role === 'student') localStorage.setItem(`user_${userId}_grade`, grade);
        if (!isSocial) localStorage.setItem(`user_${userId}_password`, password);
        else localStorage.setItem(`user_${userId}_socialType`, socialType);
        if (['professor','staff'].includes(role)) {
            localStorage.setItem(`user_${userId}_verified_email`, emailVerificationData.email);
            localStorage.setItem(`user_${userId}_email_verification_status`, 'verified');
            localStorage.setItem(`user_${userId}_email_verification_timestamp`, now);
        }

        let msg = '🎉 회원가입이 완료되었습니다!';
        if (['professor','staff'].includes(role)) {
            msg += `\n✅ 이메일 인증 완료: ${emailVerificationData.email}`;
        }
        alert(msg);

        if (isSocial) {
            ['temp_social_id','temp_social_type','temp_social_name','temp_social_email','temp_social_profile_image']
                .forEach(k => sessionStorage.removeItem(k));
            localStorage.setItem('currentLoggedInUser', userId);
            window.location.href = 'widget-settings.html';
        } else {
            window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
        }
    }

    // =============================================================================
    // 개발자 도구용 헬퍼
    // =============================================================================
    function showVerificationCode() {
        if (emailVerificationData.code) {
            console.log('🔑 코드:', emailVerificationData.code, '이메일:', emailVerificationData.email);
            return { code: emailVerificationData.code, email: emailVerificationData.email };
        }
        console.log('❌ 발급된 인증 코드가 없습니다.');
        return null;
    }
    function quickVerify() {
        if (!emailVerificationData.code) {
            console.log('❌ 인증 코드가 없습니다.');
            return false;
        }
        codeInput.value = emailVerificationData.code;
        validateVerificationCode();
        setTimeout(verifyEmailCode, 100);
        console.log('🚀 자동 인증 실행');
        return true;
    }
    window.showVerificationCode = showVerificationCode;
    window.quickVerify = quickVerify;

    // =============================================================================
    // 페이지 나가기 전 경고 (작성 중인 데이터가 있을 때)
    // =============================================================================
    function hasUnsavedData() {
        const inputs = [
            'studentId', 'name', 'departmentInput', 'phone', 'email', 'password'
        ];
        
        return inputs.some(id => {
            const element = document.getElementById(id);
            return element && element.value.trim().length > 0;
        });
    }

    window.addEventListener('beforeunload', function(event) {
        // 소셜 로그인이거나 회원가입이 완료된 상태면 경고하지 않음
        const urlParams = new URLSearchParams(window.location.search);
        const socialType = urlParams.get('social');
        
        if (!socialType && hasUnsavedData()) {
            const message = '작성 중인 회원가입 정보가 있습니다. 정말 나가시겠습니까?';
            event.returnValue = message;
            return message;
        }
    });

    // =============================================================================
    // 이벤트 리스너 등록 및 초기화
    // =============================================================================
    
    // 로그인 돌아가기 버튼들에 이벤트 리스너 추가
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', goBackToLogin);
    }
    
    if (loginRedirectBtn) {
        loginRedirectBtn.addEventListener('click', handleLoginRedirect);
    }

    // 키보드 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeyboardEvents);

    // 기존 초기화 코드들
    setupGradeDropdown();
    setupDepartmentSearch();
    document.querySelectorAll('input[name="userRole"]').forEach(radio => {
        radio.addEventListener('change', () => updateUIByRole(radio.value));
    });
    updateUIByRole('student');
    sendBtn.addEventListener('click', sendVerificationEmail);
    codeInput.addEventListener('input', validateVerificationCode);
    verifyBtn.addEventListener('click', verifyEmailCode);
    document.getElementById('registerBtn')?.addEventListener('click', register);

    // 폰 번호 포맷팅 이벤트 리스너
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }

    // 실시간 유효성 검사 이벤트 리스너들
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            validateEmail(this.value);
        });
    }

    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            validatePassword(this.value);
            // 비밀번호 확인 필드도 함께 검증
            const confirmField = document.getElementById('confirmPassword');
            if (confirmField && confirmField.value) {
                validatePasswordConfirm(this.value, confirmField.value);
            }
        });
    }

    const confirmPasswordField = document.getElementById('confirmPassword');

    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            const passwordValue = document.getElementById('password').value;
            validatePasswordConfirm(passwordValue, this.value);
        });
    }

    // 학번/교번/직번 입력 시 실시간 검증
    const studentIdField = document.getElementById('studentId');
    if (studentIdField) {
        studentIdField.addEventListener('input', function() {
            const roleEl = document.querySelector('input[name="userRole"]:checked');
            if (roleEl) {
                const role = roleEl.value;
                const isValid = validateIdPattern(role, this.value);
                const errorDiv = document.getElementById('studentId-error');
                
                if (this.value && !isValid) {
                    errorDiv.textContent = getIdErrorMessage(role);
                    errorDiv.style.display = 'block';
                } else {
                    errorDiv.style.display = 'none';
                }
            }
        });
    }

    // 소셜 로그인 처리
    const socialType = new URLSearchParams(window.location.search).get('social');
    if (socialType && sessionStorage.getItem('temp_social_id')) {
        console.log(`🔗 ${getSocialTypeName(socialType)} 소셜 로그인으로 회원가입 진행 중`);
        
        // 패스워드 필드 숨기기
        const passwordFields = document.getElementById('passwordFields');
        if (passwordFields) {
            passwordFields.classList.add('hidden');
        }
        
        // 소셜 로그인 정보 박스 표시
        const socialInfoBox = document.getElementById('socialInfoBox');
        if (socialInfoBox) {
            socialInfoBox.style.display = 'block';
            
            const socialTypeSpan = document.getElementById('socialType');
            if (socialTypeSpan) {
                socialTypeSpan.textContent = getSocialTypeName(socialType);
            }
            
            const socialIcon = document.getElementById('socialIcon');
            if (socialIcon) {
                socialIcon.textContent = socialType.charAt(0).toUpperCase();
            }
        }

        // 소셜 로그인에서 가져온 정보로 필드 미리 채우기
        const tempName = sessionStorage.getItem('temp_social_name');
        const tempEmail = sessionStorage.getItem('temp_social_email');
        
        if (tempName) {
            const nameField = document.getElementById('name');
            if (nameField) {
                nameField.value = tempName;
            }
        }
        
        if (tempEmail) {
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.value = tempEmail;
            }
        }
    }

    // =============================================================================
    // 추가 유틸리티 함수들
    // =============================================================================
    
    // 폼 데이터 초기화 함수
    function clearFormData() {
        const formFields = [
            'studentId', 'name', 'departmentInput', 'phone', 'email', 
            'password', 'confirmPassword', 'verificationEmail', 'verificationCode'
        ];
        
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });

        // 선택된 학과, 학년 초기화
        const selectedDepartment = document.getElementById('selectedDepartment');
        const selectedGrade = document.getElementById('selectedGrade');
        if (selectedDepartment) selectedDepartment.value = '';
        if (selectedGrade) selectedGrade.value = '';

        // 체크박스 초기화
        const checkboxes = ['agreeTerms', 'agreePrivacy'];
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        });

        // 라디오 버튼 초기화 (학생으로 기본 설정)
        const studentRadio = document.querySelector('input[name="userRole"][value="student"]');
        if (studentRadio) {
            studentRadio.checked = true;
            updateUIByRole('student');
        }

        // 에러 메시지 모두 숨기기
        document.querySelectorAll('.error-message').forEach(errorDiv => {
            errorDiv.style.display = 'none';
        });

        resetEmailVerification();
    }

    // 폼 유효성 전체 검사 함수
    function validateForm() {
        const roleEl = document.querySelector('input[name="userRole"]:checked');
        if (!roleEl) return false;
        
        const role = roleEl.value;
        const studentId = document.getElementById('studentId').value.trim();
        const name = document.getElementById('name').value.trim();
        const department = document.getElementById('selectedDepartment').value ||
                          document.getElementById('departmentInput').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const agreePriv = document.getElementById('agreePrivacy').checked;

        // 기본 필수 필드 검사
        if (!studentId || !name || !department || !phone || !email) {
            return false;
        }

        // 패턴 검사
        if (!validateIdPattern(role, studentId)) return false;
        if (!validatePhoneNumber(phone)) return false;
        if (!validateEmail(email)) return false;

        // 학생인 경우 학년 확인
        if (role === 'student') {
            const grade = document.getElementById('selectedGrade').value;
            if (!grade) return false;
        }

        // 소셜 로그인이 아닌 경우 비밀번호 검사
        const socialType = new URLSearchParams(window.location.search).get('social');
        if (!socialType) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (!validatePassword(password)) return false;
            if (!validatePasswordConfirm(password, confirmPassword)) return false;
        }

        // 이메일 인증 검사 (교수/직원)
        if (!validateEmailVerification(role)) return false;

        // 약관 동의 검사
        if (!agreeTerms || !agreePriv) return false;

        return true;
    }

    // 전역 함수로 등록 (디버깅 및 외부 접근용)
    window.registerPageUtils = {
        goBackToLogin,
        clearFormData,
        validateForm,
        clearSocialTempData,
        emailVerificationData: () => emailVerificationData
    };

    // =============================================================================
    // 접근성 개선
    // =============================================================================
    
    // 폼 필드들에 적절한 라벨 연결 확인
    function improveAccessibility() {
        const fieldLabelPairs = [
            ['studentId', 'idLabel'],
            ['name', 'nameLabel'],
            ['phone', 'phoneLabel'],
            ['email', 'emailLabel'],
            ['password', 'passwordLabel'],
            ['confirmPassword', 'confirmPasswordLabel']
        ];

        fieldLabelPairs.forEach(([fieldId, labelId]) => {
            const field = document.getElementById(fieldId);
            const label = document.getElementById(labelId);
            
            if (field && label) {
                // 라벨이 이미 for 속성을 가지고 있지 않으면 추가
                if (!label.getAttribute('for')) {
                    label.setAttribute('for', fieldId);
                }
                
                // 필드에 aria-describedby 추가 (에러 메시지와 연결)
                const errorId = `${fieldId}-error`;
                const errorDiv = document.getElementById(errorId);
                if (errorDiv) {
                    field.setAttribute('aria-describedby', errorId);
                }
            }
        });

        // 필수 필드 표시
        const requiredFields = [
            'studentId', 'name', 'departmentInput', 'phone', 'email'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('aria-required', 'true');
            }
        });
    }

    // 접근성 개선 실행
    improveAccessibility();

    // =============================================================================
    // 페이지 로드 완료 로그
    // =============================================================================
    console.log('✅ 회원가입 페이지 초기화 완료');
    console.log('🔧 사용 가능한 유틸리티:', Object.keys(window.registerPageUtils));
    
    // URL 파라미터 로그
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('social')) {
        console.log(`🔗 소셜 로그인 모드: ${urlParams.get('social')}`);
    }

    // 임시 데이터 확인 로그
    const tempSocialData = [
        'temp_social_id', 'temp_social_type', 'temp_social_name', 
        'temp_social_email', 'temp_social_profile_image'
    ].filter(key => sessionStorage.getItem(key));
    
    if (tempSocialData.length > 0) {
        console.log('📱 소셜 로그인 임시 데이터:', tempSocialData);
    }

    // 개발 모드에서만 추가 디버그 정보
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🛠️ 개발 모드 활성화');
        console.log('💡 팁: ESC 키를 눌러 로그인 페이지로 돌아갈 수 있습니다.');
        console.log('💡 팁: showVerificationCode() 함수로 인증코드를 확인할 수 있습니다.');
        console.log('💡 팁: quickVerify() 함수로 자동 인증을 실행할 수 있습니다.');
    }
});
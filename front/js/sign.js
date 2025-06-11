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

    codeGroup.style.display     = 'none';
    timerDiv.style.display      = 'none';
    emailErrorDiv.style.display = 'none';
    codeErrorDiv.style.display  = 'none';
    successDiv.style.display    = 'none';
    verifyBtn.disabled          = true;

    // =============================================================================
    // 로그인 페이지로 돌아가기 함수 (HTML에서 onclick="goBack()" 호출)
    // =============================================================================
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
            const hasData = document.getElementById('studentId').value.trim() || 
                           document.getElementById('name').value.trim() || 
                           document.getElementById('email').value.trim();
            
            if (hasData) {
                const confirmMsg = '입력하신 정보가 있습니다. 정말 로그인 페이지로 돌아가시겠습니까?\n입력하신 정보는 저장되지 않습니다.';
                if (confirm(confirmMsg)) {
                    window.location.href = 'pages/user/login.html';
                }
            } else {
                window.location.href = 'pages/user/login.html';
            }
        }
    }

    // goBack 함수를 전역으로 노출 (HTML onclick에서 접근 가능하도록)
    window.goBack = goBack;

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
    // 초기화 및 이벤트 리스너 등록
    // =============================================================================
    setupGradeDropdown();
    setupDepartmentSearch();
    
    // 역할 변경 시 UI 업데이트
    document.querySelectorAll('input[name="userRole"]').forEach(radio => {
        radio.addEventListener('change', () => updateUIByRole(radio.value));
    });
    updateUIByRole('student');
    
    // 이메일 인증 관련 이벤트
    sendBtn.addEventListener('click', sendVerificationEmail);
    codeInput.addEventListener('input', validateVerificationCode);
    verifyBtn.addEventListener('click', verifyEmailCode);
    
    // 전역 함수들을 window 객체에 등록 (HTML onclick에서 접근 가능하도록)
    window.sendVerificationEmail = sendVerificationEmail;
    window.verifyEmailCode = verifyEmailCode;
    window.formatPhoneNumber = formatPhoneNumber;
    
    // 회원가입 버튼
    document.getElementById('registerBtn')?.addEventListener('click', register);
    
    // register 함수를 전역으로 노출 (HTML onclick에서 접근 가능하도록)
    window.register = register;

    // 소셜 로그인 처리
    const socialType = new URLSearchParams(window.location.search).get('social');
    if (socialType && sessionStorage.getItem('temp_social_id')) {
        document.getElementById('passwordFields')?.classList.add('hidden');
        const box = document.getElementById('socialInfoBox');
        if (box) {
            box.style.display = 'block';
            document.getElementById('socialType').textContent = getSocialTypeName(socialType);
            const ic = document.getElementById('socialIcon');
            ic && (ic.textContent = socialType.charAt(0).toUpperCase());
        }
    }

    console.log('✅ 회원가입 페이지 초기화 완료');
    console.log('🔧 전역 함수 등록 완료: goBack, register, sendVerificationEmail, verifyEmailCode, formatPhoneNumber');
});
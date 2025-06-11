/* =============================================================================
   signup.js - 연성대학교 회원가입 페이지 JavaScript
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] 회원가입 페이지 로드 완료');
    initializeSignupPage();
});

/* 이메일 인증 데이터 관리 */
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

/* 페이지 초기화 */
function initializeSignupPage() {
    initializeDOMElements();
    setupEventListeners();
    setupDepartmentSearch();
    // grade dropdown 제거
    updateUIByRole('student');
    handleSocialSignup();
    console.log('✅ 회원가입 페이지 초기화 완료');
}

/* DOM 요소 초기화 */
function initializeDOMElements() {
    const elements = {
        codeGroup: document.getElementById('verificationCodeGroup'),
        timerDiv: document.getElementById('verificationTimer'),
        emailErrorDiv: document.getElementById('verification-email-error'),
        codeErrorDiv: document.getElementById('verification-code-error'),
        successDiv: document.getElementById('verification-success'),
        verifyBtn: document.getElementById('verifyCodeBtn')
    };
    if (elements.codeGroup) elements.codeGroup.style.display = 'none';
    if (elements.timerDiv) elements.timerDiv.style.display = 'none';
    if (elements.emailErrorDiv) elements.emailErrorDiv.style.display = 'none';
    if (elements.codeErrorDiv) elements.codeErrorDiv.style.display = 'none';
    if (elements.successDiv) elements.successDiv.style.display = 'none';
    if (elements.verifyBtn) elements.verifyBtn.disabled = true;
}

/* 이벤트 리스너 설정 */
function setupEventListeners() {
    const form = document.getElementById('registerForm');
    if (form) form.addEventListener('submit', handleFormSubmit);

    document.querySelectorAll('input[name="userRole"]').forEach(radio => {
        radio.addEventListener('change', (e) => updateUIByRole(e.target.value));
    });

    const sendBtn = document.getElementById('sendVerificationBtn');
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendVerificationEmail);
    if (codeInput) codeInput.addEventListener('input', validateVerificationCode);
    if (verifyBtn) verifyBtn.addEventListener('click', verifyEmailCode);

    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.addEventListener('input', function(e) {
        formatPhoneNumber(e.target);
    });

    ['studentId','name','password','confirmPassword','phone','email'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', () => validateField(id));
            input.addEventListener('input', () => clearError(id));
        }
    });
}

/* 역할별 UI 업데이트 */
function updateUIByRole(role) {
    console.log('[DEBUG] 역할 변경:', role);
    // 라벨 설정
    const labels = {
        student: ['학번','학번을 입력하세요','예: 2024123456 (10자리)'],
        professor: ['교번','교번을 입력하세요','예: 2024001 (7자리)'],
        staff: ['직번','직번을 입력하세요','예: 2024001 (7자리)']
    };
    const [labelText, placeholder, hint] = labels[role];
    const idLabel = document.getElementById('idLabel');
    const studentIdInput = document.getElementById('studentId');
    const idHint = document.getElementById('idHint');
    if (idLabel) idLabel.textContent = labelText;
    if (studentIdInput) {
        studentIdInput.placeholder = placeholder;
        studentIdInput.value = '';
    }
    if (idHint) idHint.textContent = hint;

    // gradeGroup 제거 ⇒ 해당 요소 아예 없으니 스킵

    // 이메일 인증 섹션은 항상 표시 ⇒ 숨김 처리 로직 제거

    resetEmailVerification();
    const departmentInput = document.getElementById('departmentInput');
    if (departmentInput) departmentInput.value = '';
    clearAllErrors();
}

/* 이메일 인증 초기화 */
function resetEmailVerification() {
    if (emailVerificationData.timerInterval) clearInterval(emailVerificationData.timerInterval);
    emailVerificationData = {
        code: null, email: null, expiry: null,
        verified: false, timerInterval:null,
        attempts:0, maxAttempts:5,
        isProcessing:false, verificationId:null
    };
    const emailInput = document.getElementById('verificationEmail');
    const codeInput = document.getElementById('verificationCode');
    const sendBtn = document.getElementById('sendVerificationBtn');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const codeGroup = document.getElementById('verificationCodeGroup');
    const timerDiv = document.getElementById('verificationTimer');
    const successDiv = document.getElementById('verification-success');
    if(emailInput){ emailInput.value=''; emailInput.disabled=false; }
    if(codeInput){ codeInput.value=''; codeInput.disabled=false; }
    if(sendBtn){ sendBtn.textContent='인증코드 발송'; sendBtn.disabled=false; }
    if(verifyBtn){ verifyBtn.textContent='인증확인'; verifyBtn.disabled=true; }
    if(codeGroup) codeGroup.style.display='none';
    if(timerDiv) timerDiv.style.display='none';
    if(successDiv) successDiv.style.display='none';
    hideError('verification-email-error');
    hideError('verification-code-error');
}

/* 인증 코드 발송 */
async function sendVerificationEmail() {
    if (emailVerificationData.isProcessing) return;
    const emailInput = document.getElementById('verificationEmail');
    const sendBtn = document.getElementById('sendVerificationBtn');
    const email = emailInput.value.trim();
    hideError('verification-email-error');
    const emailRegex = /^[^\s@]+@yeonsung\.ac\.kr$/i;
    if (!emailRegex.test(email)) {
        showError('verification-email-error','연성대학교 공식 이메일(@yeonsung.ac.kr)을 입력해주세요');
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
        await new Promise(r=>setTimeout(r,1000));
        const tempCode = Math.floor(100000 + Math.random()*900000).toString();
        emailVerificationData.attempts++;
        emailVerificationData.email = email;
        emailVerificationData.code = tempCode;
        emailVerificationData.expiry = new Date(Date.now()+5*60*1000);
        emailVerificationData.verificationId = 'temp_'+Date.now();
        emailVerificationData.verified = false;
        const codeGroup = document.getElementById('verificationCodeGroup');
        const successDiv = document.getElementById('verification-success');
        if(codeGroup) codeGroup.style.display='block';
        if(successDiv){
            successDiv.textContent=`✅ 인증코드가 ${email}로 발송되었습니다.`;
            successDiv.style.display='block';
        }
        startVerificationTimer();
        console.log(`[DEBUG] 인증코드: ${tempCode}`);
    } catch (e) {
        console.error('이메일 발송 오류:',e);
        showError('verification-email-error','이메일 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
        emailVerificationData.isProcessing = false;
        sendBtn.disabled = false;
        sendBtn.textContent = '재발송';
    }
}

/* 타이머 시작 */
function startVerificationTimer() {
    const timerDiv = document.getElementById('verificationTimer');
    const timerDisplay = document.getElementById('timerDisplay');
    if(timerDiv) timerDiv.style.display='block';
    clearInterval(emailVerificationData.timerInterval);
    emailVerificationData.timerInterval = setInterval(()=>{
        const now = new Date();
        const timeLeft = Math.max(0,Math.floor((emailVerificationData.expiry-now)/1000));
        const m = Math.floor(timeLeft/60), s = timeLeft%60;
        if(timerDisplay) timerDisplay.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if(timeLeft<=0){
            clearInterval(emailVerificationData.timerInterval);
            if(timerDiv) timerDiv.style.display='none';
            showError('verification-code-error','⏰ 인증 시간이 만료되었습니다. 다시 발송해주세요.');
            const vb = document.getElementById('verifyCodeBtn');
            if(vb) vb.disabled=true;
        }
    },1000);
}

/* 코드 입력 실시간 검증 */
function validateVerificationCode() {
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const code = codeInput.value.trim();
    if(/^\d{6}$/.test(code)){
        verifyBtn.disabled=false;
        hideError('verification-code-error');
    } else {
        verifyBtn.disabled=true;
        if(code.length>0) showError('verification-code-error','6자리 숫자를 입력해주세요');
        else hideError('verification-code-error');
    }
}

/* 인증 확인 */
async function verifyEmailCode() {
    if(emailVerificationData.isProcessing) return;
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const code = codeInput.value.trim();
    hideError('verification-code-error');
    if(!/^\d{6}$/.test(code)){
        showError('verification-code-error','6자리 숫자를 입력해주세요.');
        return;
    }
    emailVerificationData.isProcessing = true;
    verifyBtn.disabled = true;
    verifyBtn.textContent = '확인 중...';
    try {
        await new Promise(r=>setTimeout(r,500));
        if(code===emailVerificationData.code){
            emailVerificationData.verified = true;
            clearInterval(emailVerificationData.timerInterval);
            codeInput.disabled=true;
            verifyBtn.textContent='인증완료';
            const successDiv = document.getElementById('verification-success');
            const timerDiv = document.getElementById('verificationTimer');
            if(successDiv){
                successDiv.textContent='✅ 이메일 인증이 완료되었습니다';
                successDiv.style.display='block';
            }
            if(timerDiv) timerDiv.style.display='none';
            alert('✅ 이메일 인증이 완료되었습니다!');
        } else throw new Error('인증코드가 일치하지 않습니다.');
    } catch(e) {
        console.error('인증 확인 오류:',e);
        showError('verification-code-error',e.message||'인증 실패');
        verifyBtn.disabled=false;
        verifyBtn.textContent='인증확인';
        codeInput.focus();
    } finally {
        emailVerificationData.isProcessing = false;
    }
}

/* 학과 드롭다운 */
function setupDepartmentSearch() {
    const departmentInput = document.getElementById('departmentInput');
    const dropdown = document.getElementById('departmentDropdown');
    const options = dropdown.querySelectorAll('.department-option');
    const selectedDepartment = document.getElementById('selectedDepartment');
    departmentInput.addEventListener('input', ()=>{
        const term = departmentInput.value.toLowerCase();
        if(term){
            dropdown.style.display='block';
            dropdown.querySelectorAll('.department-category').forEach(cat=>cat.style.display='none');
            options.forEach(opt=>{
                const match = opt.textContent.toLowerCase().includes(term);
                opt.style.display = match?'block':'none';
                if(match){
                    let prev = opt.previousElementSibling;
                    while(prev){
                        if(prev.classList.contains('department-category')){
                            prev.style.display='block';
                            break;
                        }
                        prev = prev.previousElementSibling;
                    }
                }
            });
        } else dropdown.style.display='none';
    });
    departmentInput.addEventListener('focus', ()=>{
        if(!departmentInput.value) dropdown.style.display='block';
    });
    options.forEach(opt=>{
        opt.addEventListener('click', ()=>{
            departmentInput.value = opt.textContent;
            selectedDepartment.value = opt.dataset.value;
            dropdown.style.display='none';
            clearError('department');
        });
    });
    document.addEventListener('click', e=>{
        if(!e.target.closest('.department-container')) dropdown.style.display='none';
    });
}

/* 휴대폰 포맷 */
function formatPhoneNumber(input) {
    let val = input.value.replace(/\D/g,'');
    let formatted = '';
    if(val.length<4) formatted = val;
    else if(val.length<8) formatted = val.slice(0,3)+'-'+val.slice(3);
    else formatted = val.slice(0,3)+'-'+val.slice(3,7)+'-'+val.slice(7,11);
    input.value = formatted;
}

/* 폼 제출 */
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('[DEBUG] 폼 제출 시작');
    if(validateForm()) register();
}

/* 폼 검증 */
function validateForm() {
    let valid = true;
    const role = document.querySelector('input[name="userRole"]:checked')?.value;
    if(!role){ alert('역할을 선택해주세요.'); return false; }
    ['studentId','name','phone','email'].forEach(fid=>{
        if(!validateField(fid)) valid=false;
    });
    // 비밀번호 검증 (소셜이 아닐 때)
    const socialType = new URLSearchParams(window.location.search).get('social');
    if(!socialType){
        if(!validateField('password')||!validateField('confirmPassword')) valid=false;
    }
    // 학과 검사
    const dept = document.getElementById('selectedDepartment').value||document.getElementById('departmentInput').value.trim();
    if(!dept){ showError('department-error','학과/부서를 선택해주세요'); valid=false; }
    // 이메일 인증 필수
    if(!emailVerificationData.verified){ showError('verification-email-error','이메일 인증이 필요합니다'); valid=false; }
    // 약관 동의
    if(!document.getElementById('agreeTerms').checked||!document.getElementById('agreePrivacy').checked){
        alert('필수 약관에 동의해주세요.'); valid=false;
    }
    return valid;
}

/* 개별 필드 검증 */
function validateField(id) {
    const el = document.getElementById(id);
    if(!el) return true;
    const v = el.value.trim();
    let ok=true, msg='';
    switch(id){
        case 'studentId':
            if(!v){ ok=false; msg='필수 입력 항목입니다'; }
            else if(!/^\d{7,10}$/.test(v)){ ok=false; msg=(v.length===7?'7자리 숫자로 입력해주세요':'10자리 숫자로 입력해주세요'); }
            break;
        case 'name':
            if(!v){ ok=false; msg='이름을 입력해주세요'; }
            else if(v.length<2){ ok=false; msg='이름은 2자 이상 입력해주세요'; }
            break;
        case 'password':
            if(!v){ ok=false; msg='비밀번호를 입력해주세요'; }
            else if(!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(v)){ ok=false; msg='영문, 숫자, 특수문자를 포함한 8자 이상 입력해주세요'; }
            break;
        case 'confirmPassword':
            const pw = document.getElementById('password')?.value;
            if(!v){ ok=false; msg='비밀번호 확인을 입력해주세요'; }
            else if(v!==pw){ ok=false; msg='비밀번호가 일치하지 않습니다'; }
            break;
        case 'phone':
            const cp = v.replace(/\D/g,'');
            if(!v){ ok=false; msg='휴대폰 번호를 입력해주세요'; }
            else if(!cp.startsWith('010')||cp.length!==11){ ok=false; msg='010으로 시작하는 11자리 번호를 입력해주세요'; }
            break;
        case 'email':
            if(!v){ ok=false; msg='이메일을 입력해주세요'; }
            else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ ok=false; msg='올바른 이메일 형식을 입력해주세요'; }
            break;
    }
    if(ok) clearError(id);
    else showError(id+'-error',msg);
    return ok;
}

/* 회원가입 */
function register() {
    console.log('[DEBUG] 회원가입 처리 시작');
    const data = collectFormData();
    if(!data){ console.error('[ERROR] 폼 데이터 수집 실패'); return; }
    try {
        saveUserData(data);
        let msg='🎉 회원가입이 완료되었습니다!';
        if(emailVerificationData.verified) msg+=`\n✅ 이메일 인증 완료: ${emailVerificationData.email}`;
        alert(msg);
        const socialType = new URLSearchParams(window.location.search).get('social');
        if(socialType){
            ['temp_social_id','temp_social_type','temp_social_name','temp_social_email','temp_social_profile_image']
                .forEach(k=>sessionStorage.removeItem(k));
            sessionStorage.setItem('isLoggedIn','true');
            sessionStorage.setItem('studentId',data.studentId);
            window.location.href='../../index.html';
        } else {
            window.location.href=`login.html?newRegistration=true&studentId=${data.studentId}`;
        }
    } catch(e) {
        console.error('[ERROR] 회원가입 처리 실패:',e);
        alert('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

/* Form 데이터 수집 */
function collectFormData() {
    const role = document.querySelector('input[name="userRole"]:checked')?.value;
    const socialType = new URLSearchParams(window.location.search).get('social');
    const fd = {
        studentId: document.getElementById('studentId').value.trim(),
        name: document.getElementById('name').value.trim(),
        department: document.getElementById('selectedDepartment').value||document.getElementById('departmentInput').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email')?.value.trim()||'',
        role, socialType,
        registrationDate: new Date().toISOString()
    };
    if(!socialType) fd.password = document.getElementById('password')?.value;
    if(emailVerificationData.verified){
        fd.verifiedEmail = emailVerificationData.email;
        fd.emailVerificationStatus = 'verified';
        fd.emailVerificationTimestamp = new Date().toISOString();
    }
    return fd;
}

/* 로컬에 저장 (실제론 API 호출) */
function saveUserData(d) {
    const id = d.studentId;
    localStorage.setItem(`user_${id}_registered`,'true');
    localStorage.setItem(`user_${id}_studentId`,d.studentId);
    localStorage.setItem(`user_${id}_name`,d.name);
    localStorage.setItem(`user_${id}_department`,d.department);
    localStorage.setItem(`user_${id}_phone`,d.phone);
    localStorage.setItem(`user_${id}_email`,d.email);
    localStorage.setItem(`user_${id}_role`,d.role);
    localStorage.setItem(`user_${id}_registration_date`,d.registrationDate);
    if(d.password) localStorage.setItem(`user_${id}_password`,d.password);
    if(d.verifiedEmail){
        localStorage.setItem(`user_${id}_verified_email`,d.verifiedEmail);
        localStorage.setItem(`user_${id}_email_verification_status`,d.emailVerificationStatus);
        localStorage.setItem(`user_${id}_email_verification_timestamp`,d.emailVerificationTimestamp);
    }
    console.log('[DEBUG] 사용자 데이터 저장 완료:',id);
}

/* 소셜 회원가입 처리 */
function handleSocialSignup() {
    const socialType = new URLSearchParams(window.location.search).get('social');
    if(socialType && sessionStorage.getItem('temp_social_id')){
        const pwFields = document.getElementById('passwordFields');
        if(pwFields) pwFields.style.display='none';
        const box = document.getElementById('socialInfoBox');
        const stSpan = document.getElementById('socialType');
        const icon = document.getElementById('socialIcon');
        if(box&&stSpan&&icon){
            box.style.display='block';
            stSpan.textContent = {kakao:'카카오',google:'구글',naver:'네이버'}[socialType]||'소셜';
            icon.textContent = socialType.charAt(0).toUpperCase();
            icon.className = `social-icon ${socialType}-icon`;
        }
        console.log('[DEBUG] 소셜 로그인 회원가입 모드:',socialType);
    }
}

/* 에러 표시/숨기기 */
function showError(id,msg){ const el=document.getElementById(id); if(el){el.textContent=msg;el.style.display='block';}}
function hideError(id){ const el=document.getElementById(id); if(el) el.style.display='none';}
function clearError(fid){ hideError(fid+'-error');}
function clearAllErrors(){ document.querySelectorAll('.error-message').forEach(e=>e.style.display='none');}

/* 전역 등록 */
window.goBack = function(){
    const socialType = new URLSearchParams(window.location.search).get('social');
    const confirmMsg = socialType
        ? '회원가입을 취소하고 로그인 페이지로 돌아가시겠습니까?\n입력하신 정보는 저장되지 않습니다.'
        : '입력하신 정보가 있습니다. 정말 로그인 페이지로 돌아가시겠습니까?\n입력하신 정보는 저장되지 않습니다.';
    if(confirm(confirmMsg)) window.location.href='login.html';
};
window.sendVerificationEmail = sendVerificationEmail;
window.verifyEmailCode = verifyEmailCode;
window.formatPhoneNumber = formatPhoneNumber;
window.register = register;

/* 개발자 도구용 헬퍼 */
if(window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1'){
    window.showVerificationCode = ()=> {
        if(emailVerificationData.code){
            console.log('🔑 인증코드:',emailVerificationData.code);
            console.log('📧 이메일:',emailVerificationData.email);
            return {code:emailVerificationData.code,email:emailVerificationData.email};
        }
        console.log('❌ 발급된 인증 코드가 없습니다.');
        return null;
    };
    window.quickVerify = ()=>{
        if(!emailVerificationData.code){ console.log('❌ 인증 코드가 없습니다.'); return false; }
        const ci = document.getElementById('verificationCode');
        ci.value = emailVerificationData.code;
        validateVerificationCode();
        setTimeout(verifyEmailCode,100);
        console.log('🚀 자동 인증 실행');
        return true;
    };
    console.log('🔧 개발자 도구 함수 등록 완료');
}

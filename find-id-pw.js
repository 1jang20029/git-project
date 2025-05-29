// find-id-pw.js

// ──────────────── 알리고 SMS API 설정 ────────────────
const ALIGO_USER_ID  = 'groria123';
const ALIGO_API_KEY  = '43b9dx0kx8k9x217sj4euwtyzcil6o2g';
const ALIGO_SENDER   = '15442525';
const ALIGO_ENDPOINT = 'https://apis.aligo.in/send/';

let currentUser = null;

// ──────────────── 공통 헬퍼 함수 ────────────────
// 휴대폰 번호에서 하이픈 제거
function normalizePhone(number) {
    return number.replace(/\D/g, '');
}

// 알리고 SMS API 실제 호출 함수
async function sendSMS(phoneNumbers, message) {
  const res = await fetch('/.netlify/functions/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumbers, message })
  });

  const data = await res.json();
  if (!data.success) {
    console.error('SMS 전송 오류:', data.error);
    return { success: false, error: data.error };
  }
  return { success: true };
}

// 타이머 함수 (초를 받아 MM:SS 표시)
function startTimer(elementId, seconds) {
    const timerEl = document.getElementById(elementId);
    let remaining = seconds;
    if (window[`${elementId}Interval`]) {
        clearInterval(window[`${elementId}Interval`]);
    }
    window[`${elementId}Interval`] = setInterval(() => {
        const m = String(Math.floor(remaining / 60)).padStart(2, '0');
        const s = String(remaining % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
        if (--remaining < 0) {
            clearInterval(window[`${elementId}Interval`]);
            timerEl.textContent = '인증시간 만료';
            sessionStorage.removeItem(elementId === 'id-timer' ? 'verificationCode' : 'pwVerificationCode');
        }
    }, 1000);
}

// 페이지 로드 시 초기 설정
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupVerificationButtonControl('name-phone-input', 'phone-input', 'id-verify-btn');
    setupVerificationButtonControl('pw-name-input', 'pw-phone-input', 'pw-verify-btn', 'id-input');
    const newPwInput = document.getElementById('new-pw-input');
    if (newPwInput) newPwInput.addEventListener('input', validatePassword);
    const confirmPwInput = document.getElementById('new-pw-confirm-input');
    if (confirmPwInput) confirmPwInput.addEventListener('input', validatePasswordConfirm);
});

// ──────────────── 인증번호 전송 (아이디 찾기) ────────────────
async function sendVerificationCode() {
    const phoneRaw = document.getElementById('phone-input').value.trim();
    const phone    = normalizePhone(phoneRaw);
    const code     = String(Math.floor(100000 + Math.random() * 900000));

    const result = await sendSMS(phone, `아이디 찾기 인증번호는 [${code}] 입니다.`);
    if (!result.success) {
        alert('인증번호 전송 실패: ' + (result.error || '알 수 없는 오류'));
        return;
    }

    sessionStorage.setItem('verificationCode', code);
    startTimer('id-timer', 180);
    alert('인증번호를 전송했습니다.');
}

// ──────────────── 인증번호 전송 (비밀번호 찾기) ────────────────
async function sendPwVerificationCode() {
    const userId   = document.getElementById('id-input').value.trim();
    const name     = document.getElementById('pw-name-input').value.trim();
    const phoneRaw = document.getElementById('pw-phone-input').value.trim();
    const phone    = normalizePhone(phoneRaw);

    const storedName  = localStorage.getItem(`user_${userId}_name`);
    const storedPhone = normalizePhone(localStorage.getItem(`user_${userId}_phone`) || '');
    if (storedName !== name || storedPhone !== phone) {
        alert('입력하신 정보와 일치하는 사용자가 없습니다.');
        return;
    }

    const code   = String(Math.floor(100000 + Math.random() * 900000));
    const result = await sendSMS(phone, `비밀번호 재설정 인증번호는 [${code}] 입니다.`);
    if (!result.success) {
        alert('인증번호 전송 실패: ' + (result.error || '알 수 없는 오류'));
        return;
    }

    sessionStorage.setItem('pwVerificationCode', code);
    startTimer('pw-timer', 180);
    alert('인증번호를 전송했습니다.');
}

// ──────────────── 비밀번호 유효성 검사 ────────────────
function validatePassword() {
    const password = document.getElementById('new-pw-input').value;
    if (password.length === 0) {
        resetValidationStatus();
        return;
    }
    updateValidationStatus('length-validation', password.length >= 8);
    updateValidationStatus('letter-validation', /[A-Za-z]/.test(password));
    updateValidationStatus('number-validation', /\d/.test(password));
    updateValidationStatus('special-validation', /[@$!%*#?&]/.test(password));
    const confirmInput = document.getElementById('new-pw-confirm-input');
    if (confirmInput.value) validatePasswordConfirm();
}

function validatePasswordConfirm() {
    const password        = document.getElementById('new-pw-input').value;
    const confirmPassword = document.getElementById('new-pw-confirm-input').value;
    if (confirmPassword.length === 0) {
        const elem = document.getElementById('match-validation');
        elem.classList.remove('valid', 'invalid');
        const icon = elem.querySelector('.validation-icon');
        icon.classList.remove('valid', 'invalid');
        return;
    }
    updateValidationStatus('match-validation', password === confirmPassword && password.length > 0);
}

function updateValidationStatus(id, isValid) {
    const element = document.getElementById(id);
    const icon    = element.querySelector('.validation-icon');
    if (isValid) {
        element.classList.add('valid');
        element.classList.remove('invalid');
        icon.classList.add('valid');
        icon.classList.remove('invalid');
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
        icon.classList.remove('valid');
        icon.classList.add('invalid');
    }
}

// ──────────────── 인증 버튼 활성화 제어 ────────────────
function setupVerificationButtonControl(nameInputId, phoneInputId, buttonId, extraInputId = null) {
    const nameInput   = document.getElementById(nameInputId);
    const phoneInput  = document.getElementById(phoneInputId);
    const verifyBtn   = document.getElementById(buttonId);
    const extraInput  = extraInputId ? document.getElementById(extraInputId) : null;

    function checkInputs() {
        const nv = nameInput.value.trim();
        const pv = phoneInput.value.trim();
        const ev = extraInput ? extraInput.value.trim() : true;
        if (nv && pv && ev) {
            verifyBtn.disabled = false;
            verifyBtn.classList.remove('disabled');
        } else {
            verifyBtn.disabled = true;
            verifyBtn.classList.add('disabled');
        }
    }

    nameInput.addEventListener('input', checkInputs);
    phoneInput.addEventListener('input', checkInputs);
    if (extraInput) extraInput.addEventListener('input', checkInputs);
    checkInputs();
}

// ──────────────── 번호 포맷팅 ────────────────
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 3) {
        // 그대로
    } else if (value.length <= 7) {
        value = value.slice(0,3) + '-' + value.slice(3);
    } else {
        value = value.slice(0,3) + '-' + value.slice(3,7) + '-' + value.slice(7,11);
    }
    input.value = value;
}

// ──────────────── 로그인 상태 확인 ────────────────
function checkLoginStatus() {
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        findUserInfoByStudentId(loggedInUserId);
    }
}

function findUserInfoByStudentId(studentId) {
    const name  = localStorage.getItem(`user_${studentId}_name`);
    const phone = localStorage.getItem(`user_${studentId}_phone`);
    const email = localStorage.getItem(`user_${studentId}_email`);
    if (name) {
        currentUser = { studentId, name, phone, email };
    }
}

// ──────────────── 내비게이션 및 탭 제어 ────────────────
function goBack() {
    window.location.href = 'login.html';
}

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if (tabId === 'id-tab') {
        document.querySelectorAll('.tabs > .tab')[0].classList.add('active');
        document.getElementById('id-tab').classList.add('active');
    } else {
        document.querySelectorAll('.tabs > .tab')[1].classList.add('active');
        document.getElementById('pw-tab').classList.add('active');
    }
    document.getElementById('id-result').style.display = 'none';
    if (tabId === 'pw-tab') {
        document.getElementById('new-pw-container').style.display      = 'none';
        document.getElementById('verify-first-container').style.display = 'block';
    }
}

function switchIdMethod(methodId) {
    const tabs = document.querySelectorAll('#id-tab .tabs .tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (methodId === 'name-email') {
        tabs[0].classList.add('active');
        document.getElementById('name-email-method').classList.add('active');
        document.getElementById('phone-method').classList.remove('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('name-email-method').classList.remove('active');
        document.getElementById('phone-method').classList.add('active');
    }
    document.getElementById('id-result').style.display = 'none';
}

// ──────────────── 아이디 찾기 로직 ────────────────
function findIdByNameAndEmail() {
    const name  = document.getElementById('name-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    if (!name && !email) {
        alert('이름과 이메일을 모두 입력해주세요.');
        return;
    } else if (!name) {
        alert('이름을 입력해주세요.');
        document.getElementById('name-input').focus();
        return;
    } else if (!email) {
        alert('이메일을 입력해주세요.');
        document.getElementById('email-input').focus();
        return;
    }
    fetchUserIdByNameAndEmail(name, email)
        .then(userId => {
            if (userId) {
                document.getElementById('found-id').textContent = userId;
                document.getElementById('id-result').style.display = 'block';
            } else {
                alert('입력하신 정보와 일치하는 회원 정보가 없습니다.');
            }
        })
        .catch(error => {
            console.error('아이디 찾기 오류:', error);
            alert('아이디 찾기 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}

function fetchUserIdByNameAndEmail(name, email) {
    return new Promise((resolve, reject) => {
        try {
            let foundUserId = null;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('_email')) {
                    const storedEmail = localStorage.getItem(key);
                    const studentId   = key.split('_')[1];
                    if (storedEmail && storedEmail.toLowerCase() === email.toLowerCase()) {
                        const storedName = localStorage.getItem(`user_${studentId}_name`);
                        if (storedName === name) {
                            foundUserId = studentId;
                            break;
                        }
                    }
                }
            }
            resolve(foundUserId);
        } catch (error) {
            reject(error);
        }
    });
}

// ──────────────── 휴대폰으로 아이디 찾기 ────────────────
function findIdByPhone() {
    const name              = document.getElementById('name-phone-input').value.trim();
    const phoneWithHyphens  = document.getElementById('phone-input').value.trim();
    const verificationCode  = document.getElementById('verification-input').value.trim();
    const phone             = phoneWithHyphens.replace(/-/g, '');

    if (!name) {
        alert('이름을 입력해주세요.');
        document.getElementById('name-phone-input').focus();
        return;
    } else if (!phoneWithHyphens) {
        alert('휴대폰 번호를 입력해주세요.');
        document.getElementById('phone-input').focus();
        return;
    } else if (!verificationCode) {
        alert('인증번호를 입력해주세요.');
        document.getElementById('verification-input').focus();
        return;
    }

    const storedCode = sessionStorage.getItem('verificationCode');
    if (verificationCode !== storedCode) {
        alert('인증번호가 일치하지 않습니다.');
        document.getElementById('verification-input').focus();
        return;
    }

    fetchUserIdByPhoneAndName(phone, name)
        .then(userId => {
            if (userId) {
                document.getElementById('found-id').textContent    = userId;
                document.getElementById('id-result').style.display = 'block';
                sessionStorage.removeItem('verificationCode');
            } else {
                alert('입력하신 정보와 일치하는 회원 정보가 없습니다.');
            }
        })
        .catch(error => {
            console.error('아이디 찾기 오류:', error);
            alert('아이디 찾기 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}

function fetchUserIdByPhoneAndName(phone, name) {
    return new Promise((resolve, reject) => {
        try {
            let foundUserId = null;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('_phone')) {
                    const storedPhone = localStorage.getItem(key);
                    const storedNoHyphen = storedPhone.replace(/-/g, '');
                    const studentId = key.split('_')[1];
                    if (storedNoHyphen === phone) {
                        const storedName = localStorage.getItem(`user_${studentId}_name`);
                        if (storedName === name) {
                            foundUserId = studentId;
                            break;
                        }
                    }
                }
            }
            resolve(foundUserId);
        } catch (error) {
            reject(error);
        }
    });
}

// ──────────────── 비밀번호 재설정 전 본인 확인 ────────────────
function verifyUserInfoForPwReset(userId, name, phone) {
    return new Promise((resolve) => {
        const storedName  = localStorage.getItem(`user_${userId}_name`);
        const storedPhone = localStorage.getItem(`user_${userId}_phone`);
        const noHyphen    = storedPhone ? storedPhone.replace(/-/g, '') : '';
        resolve(storedName === name && noHyphen === phone);
    });
}

function verifyUserForPasswordReset() {
    const userId           = document.getElementById('id-input').value.trim();
    const name             = document.getElementById('pw-name-input').value.trim();
    const phoneWithHyphens = document.getElementById('pw-phone-input').value.trim();
    const verificationCode = document.getElementById('pw-verification-input').value.trim();
    const phone            = phoneWithHyphens.replace(/-/g, '');

    if (!userId) {
        alert('아이디를 입력해주세요.');
        document.getElementById('id-input').focus();
        return;
    } else if (!name) {
        alert('이름을 입력해주세요.');
        document.getElementById('pw-name-input').focus();
        return;
    } else if (!phoneWithHyphens) {
        alert('휴대폰 번호를 입력해주세요.');
        document.getElementById('pw-phone-input').focus();
        return;
    } else if (!verificationCode) {
        alert('인증번호를 입력해주세요.');
        document.getElementById('pw-verification-input').focus();
        return;
    }

    const storedCode = sessionStorage.getItem('pwVerificationCode');
    if (verificationCode !== storedCode) {
        alert('인증번호가 일치하지 않습니다.');
        document.getElementById('pw-verification-input').focus();
        return;
    }

    verifyUserInfoForPwReset(userId, name, phone)
        .then(isVerified => {
            if (!isVerified) {
                alert('입력하신 정보와 일치하는 사용자가 없습니다.');
                return;
            }
            document.getElementById('verify-first-container').style.display = 'none';
            document.getElementById('new-pw-container').style.display      = 'block';
            document.getElementById('new-pw-input').value                  = '';
            document.getElementById('new-pw-confirm-input').value          = '';
            resetValidationStatus();
            sessionStorage.setItem('verifiedUserId', userId);
        })
        .catch(error => {
            console.error('사용자 인증 오류:', error);
            alert('사용자 인증 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}

// ──────────────── 유효성 상태 초기화 ────────────────
function resetValidationStatus() {
    document.querySelectorAll('.validation-item').forEach(item => {
        item.classList.remove('valid', 'invalid');
        const icon = item.querySelector('.validation-icon');
        if (icon) icon.classList.remove('valid', 'invalid');
    });
}

// ──────────────── 새 비밀번호 설정 ────────────────
function resetPassword() {
    const newPw        = document.getElementById('new-pw-input').value.trim();
    const confirmPw    = document.getElementById('new-pw-confirm-input').value.trim();
    const verifiedId   = sessionStorage.getItem('verifiedUserId');

    if (!newPw) {
        alert('새 비밀번호를 입력해주세요.');
        document.getElementById('new-pw-input').focus();
        return;
    }
    if (!confirmPw) {
        alert('비밀번호 확인을 입력해주세요.');
        document.getElementById('new-pw-confirm-input').focus();
        return;
    }
    if (newPw !== confirmPw) {
        alert('새 비밀번호와 확인이 일치하지 않습니다.');
        document.getElementById('new-pw-confirm-input').focus();
        return;
    }

    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!pwPattern.test(newPw)) {
        alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8-20자로 입력해주세요.');
        document.getElementById('new-pw-input').focus();
        return;
    }
    if (!verifiedId) {
        alert('사용자 인증 정보가 유효하지 않습니다. 다시 시도해주세요.');
        return;
    }

    try {
        localStorage.setItem(`user_${verifiedId}_password`, newPw);
        sessionStorage.removeItem('verifiedUserId');
        sessionStorage.removeItem('pwVerificationCode');
        alert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 현재 로그인된 사용자 정보 저장 변수
let currentUser = null;

// 페이지 로드 시 현재 로그인된 사용자 정보 확인 및 이벤트 설정
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    console.log("페이지 로드됨: 사용자 정보 확인 중...");
            
    // 아이디 찾기 - 휴대폰으로 찾기 필드 이벤트 리스너 설정
    setupVerificationButtonControl(
        'name-phone-input',
        'phone-input',
        'id-verify-btn'
    );
            
    // 비밀번호 찾기 필드 이벤트 리스너 설정
    setupVerificationButtonControl(
        'pw-name-input',
        'pw-phone-input',
        'pw-verify-btn',
        'id-input'  // 추가 필드
    );
            
    // 비밀번호 입력 필드 이벤트 리스너 설정
    const newPwInput = document.getElementById('new-pw-input');
    if(newPwInput) {
        newPwInput.addEventListener('input', validatePassword);
    }
            
    // 비밀번호 확인 필드 이벤트 리스너 설정
    const confirmPwInput = document.getElementById('new-pw-confirm-input');
    if(confirmPwInput) {
        confirmPwInput.addEventListener('input', validatePasswordConfirm);
    }
});
        
// 비밀번호 유효성 검사 함수
function validatePassword() {
    const password = document.getElementById('new-pw-input').value;
            
    // 비밀번호가 비어있는지 확인
    if(password.length === 0) {
        // 빈 경우 모든 검증 상태를 초기화 (중립적 색상으로)
        resetValidationStatus();
        return;
    }
            
    // 길이 검사 (8자 이상)
    const lengthValid = password.length >= 8;
    updateValidationStatus('length-validation', lengthValid);
            
    // 영문자 검사
    const letterValid = /[A-Za-z]/.test(password);
    updateValidationStatus('letter-validation', letterValid);
            
    // 숫자 검사
    const numberValid = /\d/.test(password);
    updateValidationStatus('number-validation', numberValid);
            
    // 특수문자 검사
    const specialValid = /[@$!%*#?&]/.test(password);
    updateValidationStatus('special-validation', specialValid);
            
    // 비밀번호 확인 필드도 함께 검사 (입력된 경우)
    const confirmInput = document.getElementById('new-pw-confirm-input');
    if(confirmInput && confirmInput.value) {
        validatePasswordConfirm();
    }
}
        
// 비밀번호 확인 입력 검사
function validatePasswordConfirm() {
    const password = document.getElementById('new-pw-input').value;
    const confirmPassword = document.getElementById('new-pw-confirm-input').value;
            
    // 비밀번호 확인이 비어있는지 확인
    if(confirmPassword.length === 0) {
        // 일치 검증 상태를 초기화 (중립적 색상으로) 
        const matchValidation = document.getElementById('match-validation');
        if(matchValidation) {
            matchValidation.classList.remove('valid');
            matchValidation.classList.remove('invalid');
            const icon = matchValidation.querySelector('.validation-icon');
            if(icon) {
                icon.classList.remove('valid');
                icon.classList.remove('invalid');
            }
        }
        return;
    }
            
    // 일치 여부 검사
    const matchValid = password === confirmPassword && password.length > 0;
    updateValidationStatus('match-validation', matchValid);
}
        
// 검증 상태 업데이트 함수
function updateValidationStatus(id, isValid) {
    const element = document.getElementById(id);
    if(!element) return;
    
    const icon = element.querySelector('.validation-icon');
            
    if(isValid) {
        element.classList.add('valid');
        element.classList.remove('invalid');
        if(icon) {
            icon.classList.add('valid');
            icon.classList.remove('invalid');
        }
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
        if(icon) {
            icon.classList.remove('valid');
            icon.classList.add('invalid');
        }
    }
}
        
// 인증번호 버튼 활성화/비활성화 제어 함수
function setupVerificationButtonControl(nameInputId, phoneInputId, buttonId, extraInputId = null) {
    const nameInput = document.getElementById(nameInputId);
    const phoneInput = document.getElementById(phoneInputId);
    const verifyButton = document.getElementById(buttonId);
    const extraInput = extraInputId ? document.getElementById(extraInputId) : null;
    
    if(!nameInput || !phoneInput || !verifyButton) return;
            
    // 입력 필드 변경 감지 함수
    function checkInputs() {
        const nameValue = nameInput.value.trim();
        const phoneValue = phoneInput.value.trim();
        const extraValue = extraInput ? extraInput.value.trim() : true;
                
        // 모든 필수 입력이 있는지 확인
        if (nameValue && phoneValue && extraValue) {
            verifyButton.disabled = false;
            verifyButton.classList.remove('disabled');
        } else {
            verifyButton.disabled = true;
            verifyButton.classList.add('disabled');
        }
    }
            
    // 이벤트 리스너 등록
    nameInput.addEventListener('input', checkInputs);
    phoneInput.addEventListener('input', checkInputs);
    if (extraInput) {
        extraInput.addEventListener('input', checkInputs);
    }
            
    // 초기 상태 설정
    checkInputs();
}
        
// 휴대폰 번호 하이픈 자동 입력 함수
function formatPhoneNumber(input) {
    // 숫자만 남기고 모든 문자 제거
    let value = input.value.replace(/\D/g, '');
            
    // 3-4-4 형식으로 하이픈 추가
    if (value.length <= 3) {
        // 변화 없음
    } else if (value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
            
    // 값 업데이트
    input.value = value;
}
        
// 사용자 로그인 상태 확인
function checkLoginStatus() {
    // 세션 스토리지에서 로그인 정보 확인
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    console.log("로그인된 사용자 ID:", loggedInUserId);
            
    if (loggedInUserId) {
        // 로컬 스토리지에서 사용자 정보 가져오기
        findUserInfoByStudentId(loggedInUserId);
    } else {
        console.log('로그인된 사용자가 없습니다.');
    }
}
        
// 학번으로 사용자 정보 찾기
function findUserInfoByStudentId(studentId) {
    // 이름, 휴대폰 번호, 이메일 등 사용자 정보 조회
    const name = localStorage.getItem(`user_${studentId}_name`);
    const phone = localStorage.getItem(`user_${studentId}_phone`);
    const email = localStorage.getItem(`user_${studentId}_email`);
            
    if (name) {
        currentUser = {
            studentId: studentId,
            name: name,
            phone: phone,
            email: email
        };
                
        console.log('현재 로그인된 사용자:', currentUser);
    }
}
        
// 뒤로가기
function goBack() {
    window.location.href = "login.html";
}
        
// 탭 전환 함수
function switchTab(tabId) {
    // 모든 탭 버튼과 탭 내용 비활성화
    document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
    // 선택한 탭 활성화
    if (tabId === 'id-tab') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('id-tab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('pw-tab').classList.add('active');
    }
            
    // 결과 컨테이너 숨기기
    const idResult = document.getElementById('id-result');
    if(idResult) {
        idResult.style.display = 'none';
    }
            
    // 비밀번호 변경 폼 초기화
    if (tabId === 'pw-tab') {
        const newPwContainer = document.getElementById('new-pw-container');
        const verifyContainer = document.getElementById('verify-first-container');
        if(newPwContainer) newPwContainer.style.display = 'none';
        if(verifyContainer) verifyContainer.style.display = 'block';
    }
}
        
// 아이디 찾기 방법 전환
function switchIdMethod(methodId) {
    // 방법 선택 탭 전환
    const tabs = document.querySelectorAll('.method-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
            
    if (methodId === 'name-email') {
        if(tabs[0]) tabs[0].classList.add('active');
        const nameEmailMethod = document.getElementById('name-email-method');
        const phoneMethod = document.getElementById('phone-method');
        if(nameEmailMethod) nameEmailMethod.classList.add('active');
        if(phoneMethod) phoneMethod.classList.remove('active');
    } else {
        if(tabs[1]) tabs[1].classList.add('active');
        const nameEmailMethod = document.getElementById('name-email-method');
        const phoneMethod = document.getElementById('phone-method');
        if(nameEmailMethod) nameEmailMethod.classList.remove('active');
        if(phoneMethod) phoneMethod.classList.add('active');
    }
            
    // 결과 컨테이너 숨기기
    const idResult = document.getElementById('id-result');
    if(idResult) {
        idResult.style.display = 'none';
    }
}
        
// 이름과 이메일로 아이디 찾기
function findIdByNameAndEmail() {
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    
    if(!nameInput || !emailInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
            
    // 입력 필드 확인
    if (!name && !email) {
        alert('이름과 이메일을 모두 입력해주세요.');
        return;
    } else if (!name) {
        alert('이름을 입력해주세요.');
        nameInput.focus();
        return;
    } else if (!email) {
        alert('이메일을 입력해주세요.');
        emailInput.focus();
        return;
    }
            
    // API 호출 시뮬레이션 (실제로는 서버에 요청)
    fetchUserIdByNameAndEmail(name, email)
        .then(userId => {
            if (userId) {
                // 아이디 찾기 성공
                const foundIdElement = document.getElementById('found-id');
                const idResultElement = document.getElementById('id-result');
                if(foundIdElement) foundIdElement.textContent = userId;
                if(idResultElement) idResultElement.style.display = 'block';
            } else {
                // 아이디 찾기 실패
                alert('입력하신 정보와 일치하는 회원 정보가 없습니다.');
            }
        })
        .catch(error => {
            console.error('아이디 찾기 오류:', error);
            alert('아이디 찾기 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}
        
// 서버에서 이름과 이메일로 아이디 조회 (시뮬레이션)
function fetchUserIdByNameAndEmail(name, email) {
    // 실제로는 서버에 API 요청을 보냅니다.
    // 여기서는 간단한 시뮬레이션으로 로컬 스토리지 사용
    return new Promise((resolve, reject) => {
        try {
            // 모든 로컬 스토리지 항목을 검색하여 이메일이 일치하는 사용자 찾기
            let foundUserId = null;
                    
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('_email')) {
                    const storedEmail = localStorage.getItem(key);
                    const studentId = key.split('_')[1]; // 학번 추출
                            
                    // 이메일이 일치하는지 확인
                    if (storedEmail && storedEmail.toLowerCase() === email.toLowerCase()) {
                        // 이름도 일치하는지 확인
                        const storedName = localStorage.getItem(`user_${studentId}_name`);
                                
                        if (storedName && storedName === name) {
                            // 아이디 가져오기 (학번을 아이디로 사용)
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
        
// 휴대폰으로 아이디 찾기
function findIdByPhone() {
    const namePhoneInput = document.getElementById('name-phone-input');
    const phoneInput = document.getElementById('phone-input');
    const verificationInput = document.getElementById('verification-input');
    
    if(!namePhoneInput || !phoneInput || !verificationInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const name = namePhoneInput.value.trim();
    const phoneWithHyphens = phoneInput.value.trim();
    const verificationCode = verificationInput.value.trim();
            
    // 하이픈 제거
    const phone = phoneWithHyphens.replace(/-/g, '');
            
    // 입력 필드 확인
    if (!name) {
        alert('이름을 입력해주세요.');
        namePhoneInput.focus();
        return;
    } else if (!phoneWithHyphens) {
        alert('휴대폰 번호를 입력해주세요.');
        phoneInput.focus();
        return;
    } else if (!verificationCode) {
        alert('인증번호를 입력해주세요.');
        verificationInput.focus();
        return;
    }
            
    // 인증번호 확인
    const storedCode = sessionStorage.getItem('verificationCode');
    if (verificationCode !== storedCode) {
        alert('인증번호가 일치하지 않습니다.');
        verificationInput.focus();
        return;
    }
            
    // 휴대폰 번호로 아이디 조회
    fetchUserIdByPhoneAndName(phone, name)
        .then(userId => {
            if (userId) {
                // 아이디 찾기 성공
                const foundIdElement = document.getElementById('found-id');
                const idResultElement = document.getElementById('id-result');
                if(foundIdElement) foundIdElement.textContent = userId;
                if(idResultElement) idResultElement.style.display = 'block';
                        
                // 인증번호 세션 초기화
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
        
// 서버에서 휴대폰과 이름으로 아이디 조회 (시뮬레이션)
function fetchUserIdByPhoneAndName(phone, name) {
    // 실제로는 서버에 API 요청을 보냅니다.
    return new Promise((resolve, reject) => {
        try {
            // 모든 사용자 중에서 휴대폰 번호와 이름이 일치하는 사용자 찾기
            let foundUserId = null;
                    
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('_phone')) {
                    const storedPhone = localStorage.getItem(key);
                    const storedPhoneNoHyphen = storedPhone ? storedPhone.replace(/-/g, '') : '';
                    const studentId = key.split('_')[1]; // 학번 추출
                            
                    if (storedPhoneNoHyphen === phone) {
                        // 이름 확인
                        const storedName = localStorage.getItem(`user_${studentId}_name`);
                        if (storedName === name) {
                            // 아이디 가져오기 (학번을 아이디로 사용)
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

// 인증번호 전송 (아이디 찾기)
function sendVerificationCode() {
    const namePhoneInput = document.getElementById('name-phone-input');
    const phoneInput = document.getElementById('phone-input');
    
    if(!namePhoneInput || !phoneInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const name = namePhoneInput.value.trim();
    const phoneWithHyphens = phoneInput.value.trim();
            
    // 하이픈 제거
    const phone = phoneWithHyphens.replace(/-/g, '');
            
    // 입력 필드 확인은 버튼 활성화 조건에서 이미 처리됨
            
    // 인증번호 생성 (6자리 난수)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
            
    // 개발 테스트용 알림
    console.log('테스트 모드 - 인증번호:', code);
    alert(`개발 테스트 모드: 인증번호는 [${code}] 입니다.`);
            
    // 인증번호 저장
    sessionStorage.setItem('verificationCode', code);
            
    // 인증번호 타이머 시작 (3분)
    startTimer('id-timer', 180);
}

// 비밀번호 찾기 인증번호 전송
function sendPwVerificationCode() {
    const idInput = document.getElementById('id-input');
    const pwNameInput = document.getElementById('pw-name-input');
    const pwPhoneInput = document.getElementById('pw-phone-input');
    
    if(!idInput || !pwNameInput || !pwPhoneInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const userId = idInput.value.trim();
    const name = pwNameInput.value.trim();
    const phoneWithHyphens = pwPhoneInput.value.trim();
            
    // 하이픈 제거
    const phone = phoneWithHyphens.replace(/-/g, '');
            
    // 입력 필드 확인은 버튼 활성화 조건에서 이미 처리됨
            
    // 사용자 정보 확인
    verifyUserInfoForPwReset(userId, name, phone)
        .then(isVerified => {
            if (!isVerified) {
                alert('입력하신 정보와 일치하는 사용자가 없습니다.');
                return null;
            }
                    
            // 인증번호 생성 (6자리 난수)
            const code = Math.floor(100000 + Math.random() * 900000).toString();
                    
            // 개발 테스트용 알림
            console.log('테스트 모드 - 비밀번호 재설정 인증번호:', code);
            alert(`개발 테스트 모드: 인증번호는 [${code}] 입니다.`);
                    
            // 인증번호 저장
            sessionStorage.setItem('pwVerificationCode', code);
                    
            // 인증번호 타이머 시작 (3분)
            startTimer('pw-timer', 180);
                    
            return { success: true };
        })
        .catch(error => {
            console.error('인증번호 전송 오류:', error);
            alert('인증번호 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}

// 비밀번호 재설정을 위한 사용자 정보 확인
function verifyUserInfoForPwReset(userId, name, phone) {
    return new Promise((resolve) => {
        // 로컬 스토리지에서 사용자 정보 확인
        const storedName = localStorage.getItem(`user_${userId}_name`);
        const storedPhone = localStorage.getItem(`user_${userId}_phone`);
        const storedPhoneNoHyphen = storedPhone ? storedPhone.replace(/-/g, '') : '';
                
        const isVerified = storedName === name && storedPhoneNoHyphen === phone;
        resolve(isVerified);
    });
}

// 타이머 함수
function startTimer(elementId, seconds) {
    const timerElement = document.getElementById(elementId);
    if(!timerElement) return;
    
    let remainingTime = seconds;
            
    // 이전 타이머가 있으면 중지
    if (window[`${elementId}Interval`]) {
        clearInterval(window[`${elementId}Interval`]);
    }
            
    window[`${elementId}Interval`] = setInterval(function() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
                
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
        if (--remainingTime < 0) {
            clearInterval(window[`${elementId}Interval`]);
            timerElement.textContent = "인증시간 만료";
                    
            if (elementId === 'id-timer') {
                sessionStorage.removeItem('verificationCode');
            } else {
                sessionStorage.removeItem('pwVerificationCode');
            }
        }
    }, 1000);
}

// 비밀번호 재설정을 위한 사용자 본인 인증
function verifyUserForPasswordReset() {
    const idInput = document.getElementById('id-input');
    const pwNameInput = document.getElementById('pw-name-input');
    const pwPhoneInput = document.getElementById('pw-phone-input');
    const pwVerificationInput = document.getElementById('pw-verification-input');
    
    if(!idInput || !pwNameInput || !pwPhoneInput || !pwVerificationInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const userId = idInput.value.trim();
    const name = pwNameInput.value.trim();
    const phoneWithHyphens = pwPhoneInput.value.trim();
    const verificationCode = pwVerificationInput.value.trim();
            
    // 하이픈 제거
    const phone = phoneWithHyphens.replace(/-/g, '');
            
    // 입력 필드 확인
    if (!userId) {
        alert('아이디를 입력해주세요.');
        idInput.focus();
        return;
    } else if (!name) {
        alert('이름을 입력해주세요.');
        pwNameInput.focus();
        return;
    } else if (!phoneWithHyphens) {
        alert('휴대폰 번호를 입력해주세요.');
        pwPhoneInput.focus();
        return;
    } else if (!verificationCode) {
        alert('인증번호를 입력해주세요.');
        pwVerificationInput.focus();
        return;
    }
            
    // 인증번호 확인
    const storedCode = sessionStorage.getItem('pwVerificationCode');
    if (verificationCode !== storedCode) {
        alert('인증번호가 일치하지 않습니다.');
        pwVerificationInput.focus();
        return;
    }
            
    // 사용자 정보 확인
    verifyUserInfoForPwReset(userId, name, phone)
        .then(isVerified => {
            if (!isVerified) {
                alert('입력하신 정보와 일치하는 사용자가 없습니다.');
                return;
            }
                    
            // 본인 인증 성공, 비밀번호 재설정 폼 표시
            const verifyContainer = document.getElementById('verify-first-container');
            const newPwContainer = document.getElementById('new-pw-container');
            if(verifyContainer) verifyContainer.style.display = 'none';
            if(newPwContainer) newPwContainer.style.display = 'block';
                    
            // 새 비밀번호 입력 필드 초기화
            const newPwInput = document.getElementById('new-pw-input');
            const confirmPwInput = document.getElementById('new-pw-confirm-input');
            if(newPwInput) newPwInput.value = '';
            if(confirmPwInput) confirmPwInput.value = '';
                    
            // 유효성 검사 표시 초기화
            resetValidationStatus();
                    
            // 인증된 사용자 ID 세션에 저장
            sessionStorage.setItem('verifiedUserId', userId);
        })
        .catch(error => {
            console.error('사용자 인증 오류:', error);
            alert('사용자 인증 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
}

// 유효성 검사 표시 초기화
function resetValidationStatus() {
    const validationItems = document.querySelectorAll('.validation-item');
    validationItems.forEach(item => {
        item.classList.remove('valid');
        item.classList.remove('invalid');
        const icon = item.querySelector('.validation-icon');
        if (icon) {
            icon.classList.remove('valid');
            icon.classList.remove('invalid');
        }
    });
}

// 새 비밀번호 설정
function resetPassword() {
    const newPwInput = document.getElementById('new-pw-input');
    const confirmPwInput = document.getElementById('new-pw-confirm-input');
    
    if(!newPwInput || !confirmPwInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return;
    }
    
    const newPw = newPwInput.value.trim();
    const confirmNewPw = confirmPwInput.value.trim();
            
    // 입력 필드 확인
    if (!newPw) {
        alert('새 비밀번호를 입력해주세요.');
        newPwInput.focus();
        return;
    } else if (!confirmNewPw) {
        alert('비밀번호 확인을 입력해주세요.');
        confirmPwInput.focus();
        return;
    }
            
    // 새 비밀번호 확인
    if (newPw !== confirmNewPw) {
        alert('새 비밀번호와 확인이 일치하지 않습니다.');
        confirmPwInput.focus();
        return;
    }
            
    // 비밀번호 패턴 확인 (영문, 숫자, 특수문자 포함 8-20자)
    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!pwPattern.test(newPw)) {
        alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8-20자로 입력해주세요.');
        newPwInput.focus();
        return;
    }
            
    // 인증된 사용자 ID 가져오기
    const verifiedUserId = sessionStorage.getItem('verifiedUserId');
    if (!verifiedUserId) {
        alert('사용자 인증 정보가 유효하지 않습니다. 다시 시도해주세요.');
        return;
    }
            
    // 비밀번호 변경 (시뮬레이션)
    try {
        // 로컬 스토리지에서 비밀번호 업데이트
        localStorage.setItem(`user_${verifiedUserId}_password`, newPw);
                
        // 인증 정보 및 코드 세션에서 삭제
        sessionStorage.removeItem('verifiedUserId');
        sessionStorage.removeItem('pwVerificationCode');
                
        alert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
                
        // 로그인 페이지로 이동
        window.location.href = 'login.html';
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 테스트용 SMS 전송 함수 (실제 구현 시 수정 필요)
function sendSMS(phoneNumber, message) {
    return new Promise((resolve) => {
        // 테스트 환경에서는 실제 API 호출 대신 시뮬레이션
        console.log('테스트 모드 - 인증번호:', message);
        alert(`개발 테스트 모드: 인증번호는 [${message}] 입니다.`);
        resolve({ success: true, message: '테스트 모드 SMS 발송' });
    });
}
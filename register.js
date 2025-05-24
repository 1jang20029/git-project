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
}

// 학년 드롭다운 기능
document.addEventListener('DOMContentLoaded', function() {
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
});

// 소셜 타입명 변환 함수
function getSocialTypeName(type) {
    switch(type) {
        case 'kakao': return '카카오';
        case 'google': return '구글';
        case 'naver': return '네이버';
        default: return '소셜';
    }
}

function goBack() {
    window.location.href = "login.html";
}

function register() {
    // 입력값 가져오기
    const studentId = document.getElementById('studentId').value;
    const name = document.getElementById('name').value;
    const department = document.getElementById('department').value;
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
        if (!password) {
            document.getElementById('password-error').style.display = 'block';
            return;
        } else {
            document.getElementById('password-error').style.display = 'none';
        }
        
        // 비밀번호 일치 검사
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword-error').style.display = 'block';
            return;
        } else {
            document.getElementById('confirmPassword-error').style.display = 'none';
        }
    }
    
    // 간단한 유효성 검사
    let isValid = true;
    
    // 필수 필드 검사
    if (!studentId || !name || !department || !selectedGrade || !phone || !email) {
        alert('모든 필수 항목을 입력해주세요.');
        isValid = false;
        return;
    }
    
    // 약관 동의 검사
    if (!agreeTerms || !agreePrivacy) {
        alert('필수 약관에 동의해주세요.');
        isValid = false;
        return;
    }
    
    // 유효성 검사 통과
    if (isValid) {
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
        // 항상 첫 로그인으로 설정 (새 계정이므로)
        localStorage.setItem(`user_${userId}_first_login`, 'true');
        
        localStorage.setItem(`user_${userId}_studentId`, studentId);
        localStorage.setItem(`user_${userId}_name`, name);
        localStorage.setItem(`user_${userId}_department`, department);
        localStorage.setItem(`user_${userId}_grade`, selectedGrade);
        localStorage.setItem(`user_${userId}_phone`, phone);
        localStorage.setItem(`user_${userId}_email`, email);
        
        // 소셜 로그인이 아닌 경우에만 비밀번호 저장
        if (!isSocialLogin) {
            localStorage.setItem(`user_${userId}_password`, password);
        } else {
            // 소셜 로그인 타입 저장
            localStorage.setItem(`user_${userId}_socialType`, socialType);
        }
        
        alert('회원가입이 완료되었습니다!');
        
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
}
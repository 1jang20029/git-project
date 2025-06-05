
// 학과 목록 배열 (계열별 분류)
const departments = [
    // 스마트 ICT계열
    { id: 'electronics', name: '전자공학과', category: '스마트 ICT계열' },
    { id: 'informationCommunication', name: '정보통신과', category: '스마트 ICT계열' },
    { id: 'electrical', name: '전기과', category: '스마트 ICT계열' },
    { id: 'computerSoftware', name: '컴퓨터소프트웨어과', category: '스마트 ICT계열' },
    
    // 라이프디자인계열
    { id: 'architecture', name: '건축과', category: '라이프디자인계열' },
    { id: 'interiorArchitecture', name: '실내건축과', category: '라이프디자인계열' },
    { id: 'fashionDesignBusiness', name: '패션디자인비즈니스과', category: '라이프디자인계열' },
    { id: 'beautyStylistHair', name: '뷰티스타일리스트과 헤어디자인전공', category: '라이프디자인계열' },
    { id: 'beautyStylistMakeup', name: '뷰티스타일리스트과 메이크업전공', category: '라이프디자인계열' },
    { id: 'beautyStylistSkincare', name: '뷰티스타일리스트과 스킨케어전공', category: '라이프디자인계열' },
    
    // 문화콘텐츠계열
    { id: 'gameContent', name: '게임콘텐츠과', category: '문화콘텐츠계열' },
    { id: 'webtoonContent', name: '웹툰만화콘텐츠과', category: '문화콘텐츠계열' },
    { id: 'videoContentProduction', name: '영상콘텐츠과 영상콘텐츠제작전공', category: '문화콘텐츠계열' },
    { id: 'videoContentNewMedia', name: '영상콘텐츠과 뉴미디어콘텐츠전공', category: '문화콘텐츠계열' },
    { id: 'visualDesign', name: '시각디자인과', category: '문화콘텐츠계열' },
    { id: 'kpop', name: 'K-POP과', category: '문화콘텐츠계열' },
    
    // 사회·교육계열
    { id: 'distributionLogistics', name: '유통물류과', category: '사회·교육계열' },
    { id: 'businessAdministration', name: '경영학과', category: '사회·교육계열' },
    { id: 'taxAccounting', name: '세무회계과', category: '사회·교육계열' },
    { id: 'nationalDefense', name: '국방군사학과', category: '사회·교육계열' },
    { id: 'policeSecurity', name: '경찰경호보안과', category: '사회·교육계열' },
    { id: 'socialWelfare', name: '사회복지과', category: '사회·교육계열' },
    { id: 'socialWelfareManagement', name: '사회복지경영과', category: '사회·교육계열' },
    { id: 'earlyChildhoodEducation', name: '유아교육과', category: '사회·교육계열' },
    { id: 'earlyChildhoodSpecial', name: '유아특수재활과', category: '사회·교육계열' },
    { id: 'childPsychology', name: '사회복지과 아동심리보육전공', category: '사회·교육계열' },
    
    // 보건생명계열
    { id: 'dentalHygiene', name: '치위생과', category: '보건생명계열' },
    { id: 'dentalTechnology', name: '치기공과', category: '보건생명계열' },
    { id: 'occupationalTherapy', name: '작업치료(심리)과', category: '보건생명계열' },
    { id: 'emergencyMedical', name: '응급구조과', category: '보건생명계열' },
    { id: 'healthMedicalAdmin', name: '보건의료행정과', category: '보건생명계열' },
    { id: 'sportsRehabilitation', name: '스포츠재활과', category: '보건생명계열' },
    { id: 'foodNutrition', name: '식품영양학과', category: '보건생명계열' },
    { id: 'companionAnimalHealth', name: '반려동물보건과', category: '보건생명계열' },
    { id: 'companionAnimalIndustry', name: '반려동물산업과', category: '보건생명계열' },
    
    // 관광조리계열
    { id: 'aviationService', name: '항공서비스과', category: '관광조리계열' },
    { id: 'tourismEnglish', name: '관광영어과', category: '관광조리계열' },
    { id: 'hotelTourism', name: '호텔관광과', category: '관광조리계열' },
    { id: 'hotelCulinary', name: '호텔외식조리과', category: '관광조리계열' },
    { id: 'cafeBakery', name: '카페·베이커리과', category: '관광조리계열' },
    { id: 'hotelFoodManagement', name: '호텔외식경영전공', category: '관광조리계열' },
    
    // 공통계열
    { id: 'liberalArts', name: '자유전공학과(신설)', category: '공통계열' }
];

let currentHighlightIndex = -1;
let currentFilteredDepartments = [];

// 페이지 로드 시 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 체크
    checkLoginStatus();
    
    // 폼 입력 필드 유효성 검사 이벤트 리스너 등록
    setupFormValidation();
    
    // 학과 자동완성 설정
    setupDepartmentAutocomplete();
});

// 학과 자동완성 설정 함수
function setupDepartmentAutocomplete() {
    const departmentInput = document.getElementById('department');
    const dropdown = document.getElementById('departmentDropdown');
    
    // 입력 이벤트
    departmentInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        filterDepartments(value);
    });
    
    // 포커스 이벤트
    departmentInput.addEventListener('focus', function() {
        const value = this.value.toLowerCase();
        filterDepartments(value);
    });
    
    // 블러 이벤트 (약간의 지연을 두어 클릭 이벤트가 먼저 실행되도록)
    departmentInput.addEventListener('blur', function() {
        setTimeout(() => {
            hideDropdown();
        }, 200);
    });
    
    // 키보드 이벤트
    departmentInput.addEventListener('keydown', function(e) {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        const maxIndex = items.length - 1;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentHighlightIndex = Math.min(currentHighlightIndex + 1, maxIndex);
            updateHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentHighlightIndex = Math.max(currentHighlightIndex - 1, -1);
            updateHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentHighlightIndex >= 0 && items[currentHighlightIndex]) {
                const selectedDept = currentFilteredDepartments[currentHighlightIndex];
                selectDepartment(selectedDept);
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
        }
    });
    
    // 문서 클릭 이벤트 (드롭다운 외부 클릭 시 닫기)
    document.addEventListener('click', function(e) {
        if (!departmentInput.contains(e.target) && !dropdown.contains(e.target)) {
            hideDropdown();
        }
    });
}

// 학과 필터링 함수
function filterDepartments(value) {
    const dropdown = document.getElementById('departmentDropdown');
    
    if (!value) {
        currentFilteredDepartments = [...departments];
    } else {
        currentFilteredDepartments = departments.filter(dept => 
            dept.name.toLowerCase().includes(value)
        );
    }
    
    if (currentFilteredDepartments.length > 0) {
        showDropdown();
        renderDropdownItems();
    } else {
        hideDropdown();
    }
}

// 드롭다운 항목 렌더링
function renderDropdownItems() {
    const dropdown = document.getElementById('departmentDropdown');
    dropdown.innerHTML = '';
    
    // 계열별로 그룹화
    const groupedDepts = {};
    currentFilteredDepartments.forEach(dept => {
        if (!groupedDepts[dept.category]) {
            groupedDepts[dept.category] = [];
        }
        groupedDepts[dept.category].push(dept);
    });
    
    // 계열 순서 정의
    const categoryOrder = [
        '스마트 ICT계열',
        '라이프디자인계열', 
        '문화콘텐츠계열',
        '사회·교육계열',
        '보건생명계열',
        '관광조리계열',
        '공통계열'
    ];
    
    let itemIndex = 0;
    categoryOrder.forEach(category => {
        if (groupedDepts[category] && groupedDepts[category].length > 0) {
            // 계열 헤더 추가
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'autocomplete-category';
            categoryHeader.textContent = category;
            dropdown.appendChild(categoryHeader);
            
            // 해당 계열의 학과들 추가
            groupedDepts[category].forEach(dept => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = dept.name;
                item.setAttribute('data-index', itemIndex);
                item.addEventListener('click', () => selectDepartment(dept));
                dropdown.appendChild(item);
                itemIndex++;
            });
        }
    });
    
    currentHighlightIndex = -1;
}

// 하이라이트 업데이트
function updateHighlight() {
    const items = document.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
        if (index === currentHighlightIndex) {
            item.classList.add('highlighted');
            // 스크롤하여 선택된 항목이 보이도록 조정
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// 학과 선택
function selectDepartment(dept) {
    const departmentInput = document.getElementById('department');
    departmentInput.value = dept.name;
    departmentInput.setAttribute('data-id', dept.id);
    hideDropdown();
}

// 드롭다운 표시
function showDropdown() {
    const dropdown = document.getElementById('departmentDropdown');
    dropdown.style.display = 'block';
}

// 드롭다운 숨기기
function hideDropdown() {
    const dropdown = document.getElementById('departmentDropdown');
    dropdown.style.display = 'none';
    currentHighlightIndex = -1;
}

// 로그인 상태 확인 및 프로필 정보 로드
function checkLoginStatus() {
    // 로컬 스토리지에서 현재 로그인된 사용자 정보 가져오기
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    if (!currentUser) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = 'login.html';
        return;
    }
    
    // 프로필 정보 로드
    loadProfileInfo(currentUser);
}

// 프로필 정보 로드 - 수정된 버전
function loadProfileInfo(userId) {
    // 메인 페이지와 동일한 학번 표시 로직 사용
    // studentId 키에서 실제 학번 가져오기
    let displayStudentId = localStorage.getItem(`user_${userId}_studentId`) || userId;
    
    // 학번 설정
    document.getElementById('studentId').value = displayStudentId;
    
    // 로컬 스토리지에서 사용자 정보 가져오기
    const name = localStorage.getItem(`user_${userId}_name`) || '연성대학교';
    const departmentId = localStorage.getItem(`user_${userId}_department`) || '';
    const grade = localStorage.getItem(`user_${userId}_grade`) || '2';
    const email = localStorage.getItem(`user_${userId}_email`) || 'test@test';
    const phone = localStorage.getItem(`user_${userId}_phone`) || '010-3402-3447';
    
    // 학과 이름 찾기
    const department = departments.find(dept => dept.id === departmentId);
    const departmentName = department ? department.name : '';
    
    // 프로필 이미지 관련 정보 가져오기
    const profileImageType = localStorage.getItem(`user_${userId}_profileImageType`) || 'emoji';
    const profileImage = localStorage.getItem(`user_${userId}_profileImage`) || '👨‍🎓';
    const customProfileImage = localStorage.getItem(`user_${userId}_customProfileImage`);
    
    // 폼에 정보 설정
    document.getElementById('name').value = name;
    document.getElementById('department').value = departmentName;
    document.getElementById('department').setAttribute('data-id', departmentId);
    document.getElementById('grade').value = grade;
    document.getElementById('email').value = email;
    document.getElementById('phone').value = phone;
    
    // 프로필 이미지 설정
    const profileImageElement = document.getElementById('profileImage');
    const headerProfileElement = document.getElementById('headerProfileImage');
    
    if (profileImageType === 'emoji') {
        profileImageElement.innerHTML = profileImage;
        headerProfileElement.innerHTML = profileImage;
    } else if (profileImageType === 'image') {
        profileImageElement.innerHTML = `<img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        headerProfileElement.innerHTML = `<img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else if (profileImage === 'custom' && customProfileImage) {
        // 여기서 custom 텍스트 대신 실제 이미지 표시
        profileImageElement.innerHTML = `<img src="${customProfileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        headerProfileElement.innerHTML = `<img src="${customProfileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        profileImageElement.innerHTML = '👨‍🎓';
        headerProfileElement.innerHTML = '👨‍🎓';
    }
}

// 프로필 이미지 변경 함수 - UI 개선 버전
function changeProfileImage() {
    // 프로필 이미지 옵션 배열
    const profileImages = [
        { type: 'emoji', value: '👨‍🎓' },
        { type: 'emoji', value: '👩‍🎓' },
        { type: 'emoji', value: '👨‍💼' },
        { type: 'emoji', value: '👩‍💼' },
        { type: 'emoji', value: '👨‍🏫' },
        { type: 'emoji', value: '👩‍🏫' },
        { type: 'emoji', value: '👨‍🔬' },
        { type: 'emoji', value: '👩‍🔬' },
        { type: 'emoji', value: '👨‍💻' },
        { type: 'emoji', value: '👩‍💻' }
    ];
    
    // 모달 컨테이너 생성
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.id = 'profileImageModal';
    
    // 모달 내용
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // 모달 헤더
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = '<h3 class="modal-title">프로필 이미지 선택</h3>';
    
    // 사진 업로드 섹션
    const uploadSection = document.createElement('div');
    uploadSection.className = 'modal-section';
    
    // 업로드 버튼
    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'upload-button';
    uploadLabel.htmlFor = 'imageUpload';
    uploadLabel.textContent = '사진 업로드';
    
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.id = 'imageUpload';
    uploadInput.accept = 'image/*';
    uploadInput.style.display = 'none';
    uploadInput.addEventListener('change', handleImageUpload);
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewContainer.id = 'previewContainer';
    
    uploadSection.appendChild(uploadLabel);
    uploadSection.appendChild(uploadInput);
    uploadSection.appendChild(previewContainer);
    
    // 기본 이미지 섹션
    const emojiSection = document.createElement('div');
    emojiSection.className = 'modal-section';
    
    const emojiTitle = document.createElement('h4');
    emojiTitle.className = 'modal-section-title';
    emojiTitle.textContent = '기본 이미지';
    
    const emojiGrid = document.createElement('div');
    emojiGrid.className = 'image-grid';
    
    // 이모티콘 옵션 추가
    profileImages.forEach(image => {
        const option = document.createElement('div');
        option.className = 'image-option';
        option.onclick = () => selectProfileImage(image.value, 'emoji');
        
        const emoji = document.createElement('div');
        emoji.className = 'emoji-image';
        emoji.textContent = image.value;
        
        option.appendChild(emoji);
        emojiGrid.appendChild(option);
    });
    
    emojiSection.appendChild(emojiTitle);
    emojiSection.appendChild(emojiGrid);
    
    // 모달 푸터 (닫기 버튼)
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.textContent = '닫기';
    modalFooter.onclick = closeProfileImageModal;
    
    // 모달 내용 조립
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(uploadSection);
    modalContent.appendChild(emojiSection);
    modalContent.appendChild(modalFooter);
    
    modalContainer.appendChild(modalContent);
    
    // 모달 표시
    document.body.appendChild(modalContainer);
}

// 파일 업로드 처리 함수
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewContainer = document.getElementById('previewContainer');
            previewContainer.innerHTML = '';
            
            // 이미지 미리보기
            const imagePreview = document.createElement('img');
            imagePreview.className = 'preview-image';
            imagePreview.src = e.target.result;
            
            // 적용 버튼
            const applyButton = document.createElement('button');
            applyButton.className = 'apply-button';
            applyButton.textContent = '이 사진으로 설정';
            applyButton.onclick = function() {
                uploadCustomImage(e.target.result);
            };
            
            previewContainer.appendChild(imagePreview);
            previewContainer.appendChild(applyButton);
            previewContainer.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
}

// 사용자 지정 이미지 설정 - 수정된 버전
function uploadCustomImage(imageData) {
    // 이미지 데이터를 사용하여 프로필 이미지 업데이트
    const profileImageElement = document.getElementById('profileImage');
    profileImageElement.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    
    // 헤더 프로필 이미지도 업데이트
    const headerProfileElement = document.getElementById('headerProfileImage');
    headerProfileElement.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    
    // 로컬 스토리지에 저장
    const studentId = document.getElementById('studentId').value;
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    localStorage.setItem(`user_${currentUser}_profileImageType`, 'custom');
    localStorage.setItem(`user_${currentUser}_profileImage`, 'custom');
    localStorage.setItem(`user_${currentUser}_customProfileImage`, imageData);
    
    // 모달 닫기
    closeProfileImageModal();
    
    // 부모 창(메인 앱)에 이벤트를 전송하여 프로필 이미지 업데이트
    updateParentWindowProfileImage(imageData);
}

// 부모 창의 프로필 이미지 업데이트 함수
function updateParentWindowProfileImage(imageData) {
    try {
        // 이벤트를 발생시켜 메인 앱에 알림
        localStorage.setItem('profileImageUpdated', 'true');
        
        // 혹시 부모 창이 있다면 직접 접근
        if (window.opener && !window.opener.closed) {
            window.opener.updateProfileImage(imageData);
        }
    } catch (e) {
        console.log('부모 창 업데이트 시도 중 오류:', e);
    }
}

// 프로필 이미지 선택 함수 - 수정된 버전
function selectProfileImage(image, type) {
    // 선택한 이미지로 프로필 이미지 변경
    const profileImageElement = document.getElementById('profileImage');
    const headerProfileElement = document.getElementById('headerProfileImage');
    
    if (type === 'emoji') {
        profileImageElement.innerHTML = image;
        headerProfileElement.innerHTML = image;
    } else {
        profileImageElement.innerHTML = `<img src="${image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        headerProfileElement.innerHTML = `<img src="${image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    
    // 로컬 스토리지에 저장
    const currentUser = localStorage.getItem('currentLoggedInUser');
    localStorage.setItem(`user_${currentUser}_profileImageType`, type);
    localStorage.setItem(`user_${currentUser}_profileImage`, image);
    
    // 모달 닫기
    closeProfileImageModal();
    
    // 부모 창 업데이트
    if (type === 'emoji') {
        updateParentWindowProfileEmoji(image);
    }
}

// 부모 창의 이모지 프로필 업데이트
function updateParentWindowProfileEmoji(emoji) {
    try {
        localStorage.setItem('profileEmojiUpdated', 'true');
        localStorage.setItem('profileEmojiValue', emoji);
        
        if (window.opener && !window.opener.closed) {
            window.opener.updateProfileEmoji(emoji);
        }
    } catch (e) {
        console.log('부모 창 이모지 업데이트 시도 중 오류:', e);
    }
}

// 프로필 이미지 모달 닫기 함수
function closeProfileImageModal() {
    const modal = document.getElementById('profileImageModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 폼 유효성 검사 설정
function setupFormValidation() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // 전화번호 자동 포맷팅
    phoneInput.addEventListener('input', function() {
        formatPhoneNumber(this);
    });
    
    // 전화번호 백스페이스 처리
    phoneInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace') {
            const value = this.value;
            const cursorPosition = this.selectionStart;
            
            // 커서가 하이폰 바로 뒤에 있으면 하이폰을 지움
            if (cursorPosition > 0 && value[cursorPosition - 1] === '-') {
                e.preventDefault();
                const newValue = value.substring(0, cursorPosition - 1) + value.substring(cursorPosition);
                this.value = newValue;
                this.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
                return;
            }
        }
    });
    
    // 이메일 입력 검사
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(this.value);
        validateField(this, isValid);
    });
    
    // 전화번호 입력 검사
    phoneInput.addEventListener('blur', function() {
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        const isValid = phoneRegex.test(this.value);
        validateField(this, isValid);
    });
    
    // 새 비밀번호 유효성 검사 (실시간)
    newPasswordInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            const isValid = passwordRegex.test(this.value);
            validateField(this, isValid);
            
            // 새 비밀번호가 변경되면 확인 비밀번호도 다시 체크
            if (confirmPasswordInput.value.trim() !== '') {
                const isConfirmValid = confirmPasswordInput.value === this.value;
                validateField(confirmPasswordInput, isConfirmValid);
            }
        } else {
            // 비어있으면 에러 제거
            validateField(this, true);
            // 확인 비밀번호도 에러 제거
            validateField(confirmPasswordInput, true);
        }
    });
    
    // 새 비밀번호 확인 일치 검사
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value.trim() !== '' || newPasswordInput.value.trim() !== '') {
            const isValid = this.value === newPasswordInput.value;
            validateField(this, isValid);
        } else {
            validateField(this, true);
        }
    });
}

// 전화번호 자동 포맷팅 함수
function formatPhoneNumber(input) {
    // 현재 커서 위치와 값 저장
    const cursorPosition = input.selectionStart;
    const oldLength = input.value.length;
    
    // 숫자만 추출
    let value = input.value.replace(/[^\d]/g, '');
    
    // 11자리를 초과하면 잘라내기
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // 포맷팅 적용
    let formattedValue = '';
    if (value.length >= 3) {
        if (value.length >= 7) {
            // 010-1234-1234 형태
            formattedValue = value.substring(0, 3) + '-' + 
                            value.substring(3, 7) + '-' + 
                            value.substring(7);
        } else {
            // 010-1234 형태
            formattedValue = value.substring(0, 3) + '-' + 
                            value.substring(3);
        }
    } else {
        formattedValue = value;
    }
    
    input.value = formattedValue;
    
    // 커서 위치 조정
    const newLength = formattedValue.length;
    let newCursorPosition = cursorPosition;
    
    // 포맷팅으로 길이가 변했을 때 커서 위치 조정
    if (newLength > oldLength) {
        // 하이폰이 추가된 경우
        if (cursorPosition === 3 || cursorPosition === 8) {
            newCursorPosition = cursorPosition + 1;
        }
    }
    
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// 필드 유효성 검사 및 에러 표시
function validateField(field, isValid) {
    const formGroup = field.parentElement;
    
    if (!isValid && field.value.trim() !== '') {
        formGroup.classList.add('has-error');
    } else {
        formGroup.classList.remove('has-error');
    }
}

// 프로필 저장 - 수정된 버전
function saveProfile(event) {
    event.preventDefault();
    
    // 필수 입력 검사
    const name = document.getElementById('name').value.trim();
    const departmentName = document.getElementById('department').value.trim();
    const departmentId = document.getElementById('department').getAttribute('data-id');
    const grade = document.getElementById('grade').value;
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!name || !departmentName || !grade || !email || !phone) {
        alert('모든 필수 항목을 입력해주세요.');
        return false;
    }
    
    // 학과가 올바른지 확인
    if (!departmentId) {
        alert('올바른 학과를 선택해주세요.');
        return false;
    }
    
    // 비밀번호 변경 검사
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword) {
        if (!currentPassword) {
            alert('현재 비밀번호를 입력해주세요.');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return false;
        }
        
        // 비밀번호 정책 검사 (영문, 숫자, 특수문자 조합 8자 이상)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
            return false;
        }
    }
    
    // 로컬 스토리지에 저장
    const currentUser = localStorage.getItem('currentLoggedInUser');
    localStorage.setItem(`user_${currentUser}_name`, name);
    localStorage.setItem(`user_${currentUser}_department`, departmentName);  // 학과 이름으로 저장 (기존 방식)
    localStorage.setItem(`user_${currentUser}_departmentId`, departmentId);  // 학과 ID도 별도 저장
    localStorage.setItem(`user_${currentUser}_departmentName`, departmentName);  // 학과 이름도 저장
    localStorage.setItem(`user_${currentUser}_grade`, grade);
    localStorage.setItem(`user_${currentUser}_email`, email);
    localStorage.setItem(`user_${currentUser}_phone`, phone);
    
    if (newPassword) {
        localStorage.setItem(`user_${currentUser}_password`, newPassword);
    }
    
    // 프로필 이미지 정보 가져오기 (이미 있는 경우 업데이트되었을 것임)
    const profileImageType = localStorage.getItem(`user_${currentUser}_profileImageType`) || 'emoji';
    const profileImage = localStorage.getItem(`user_${currentUser}_profileImage`) || '👨‍🎓';
    const customProfileImage = localStorage.getItem(`user_${currentUser}_customProfileImage`);
    
    // 모든 페이지에 프로필 이미지 업데이트를 알리는 플래그 설정
    localStorage.setItem('profileUpdated', 'true');
    
    alert('개인정보가 성공적으로 수정되었습니다.');
    
    // 이전 페이지로 이동
    goToBack();
    
    return false;
}

// 이전 페이지로 이동
function goToBack() {
    window.history.back();
}

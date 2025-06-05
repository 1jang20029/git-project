// =============================================================================
// profile-edit.js
// 분리된 프로필 수정 화면 전용 자바스크립트
// =============================================================================

// 학과 목록 배열 (계열별 분류)
// → 실제 구현 시 백엔드에서 API 호출 후 받아오는 형태로 변경됨
let departments = [];

// 화면 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
  // 1) 로그인 상태 확인 & 프로필 정보 로드
  checkLoginStatus();

  // 2) 학과 목록을 백엔드에서 가져와서 셋업
  fetchDepartmentsFromServer();

  // 3) 폼 유효성 검사 이벤트 리스너 등록
  setupFormValidation();

  // 4) 학과 자동완성 설정
  setupDepartmentAutocomplete();
});

// =============================================================================
// fetchDepartmentsFromServer: 백엔드에서 학과 목록을 가져와 departments 배열에 저장
// (Node.js + MySQL을 가정하고, /api/departments 엔드포인트로 예시 구현)
// =============================================================================
async function fetchDepartmentsFromServer() {
  try {
    const res = await fetch('/api/departments'); // 예: Node.js 서버가 /api/departments로 JSON 반환
    if (!res.ok) throw new Error('학과 데이터를 불러오는 중 오류 발생');
    const data = await res.json();
    // 서버에서 { id, name, category } 형태의 배열을 반환한다고 가정
    departments = data;
  } catch (err) {
    console.error('학과 목록 로드 실패:', err);
    departments = [];
  }
}

// =============================================================================
// 체크 로그인 상태 및 프로필 정보 로드
// =============================================================================
function checkLoginStatus() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    alert('로그인이 필요한 서비스입니다.');
    window.location.href = 'login.html'; // 로그인 페이지로 리다이렉트
    return;
  }
  // 로그인되어 있으면 프로필 정보 로드
  loadProfileInfo(currentUser);
}

// =============================================================================
// loadProfileInfo: 백엔드 API 호출로 사용자 정보를 받아와 화면에 렌더링
// =============================================================================
async function loadProfileInfo(userId) {
  try {
    // 예시: /api/users/:userId 엔드포인트를 호출하면 JSON으로 사용자 정보 반환
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('사용자 정보를 불러오는 중 오류 발생');
    const user = await res.json();
    // user 예시 데이터 구조:
    // {
    //   id: "20230001",
    //   name: "홍길동",
    //   departmentId: "computerSoftware",
    //   departmentName: "컴퓨터소프트웨어과",
    //   grade: 2,
    //   email: "hong@example.com",
    //   phone: "010-1234-5678",
    //   profileImageType: "emoji" or "image" or "custom",
    //   profileImage: "👨‍🎓" 또는 URL,
    //   customProfileImage: (base64 or URL)
    // }

    // 학번 설정
    document.getElementById('studentId').value = user.id;

    // 이름, 이메일, 전화번호, 학년 설정
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('grade').value = user.grade || '1';

    // 학과 입력란에 표시
    const deptInput = document.getElementById('department');
    deptInput.value = user.departmentName || '';
    deptInput.setAttribute('data-id', user.departmentId || '');

    // 프로필 이미지 설정
    const profileImageElement = document.getElementById('profileImage');
    const headerProfileElement = document.getElementById('headerProfileImage');
    if (user.profileImageType === 'emoji') {
      profileImageElement.innerHTML = user.profileImage || '👤';
      headerProfileElement.innerHTML = user.profileImage || '👤';
    } else {
      // image 또는 custom 모두 URL 또는 base64라고 가정
      profileImageElement.innerHTML = `<img src="${user.profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      headerProfileElement.innerHTML = `<img src="${user.profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
  } catch (err) {
    console.error('프로필 정보 로드 실패:', err);
    alert('프로필 정보를 불러오는 중 오류가 발생했습니다.');
  }
}

// =============================================================================
// setupDepartmentAutocomplete: 학과 자동완성 설정
// =============================================================================
let currentHighlightIndex = -1;
let currentFilteredDepartments = [];

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

// =============================================================================
// filterDepartments: 입력값에 따라 departments 배열 필터링
// =============================================================================
function filterDepartments(value) {
  const dropdown = document.getElementById('departmentDropdown');

  if (!departments || departments.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

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

// =============================================================================
// renderDropdownItems: 드롭다운 항목 렌더링 (계열별 그룹화 포함)
// =============================================================================
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

// =============================================================================
// updateHighlight: 화살표 키로 이동 시 하이라이트 업데이트
// =============================================================================
function updateHighlight() {
  const items = document.querySelectorAll('.autocomplete-item');
  items.forEach((item, index) => {
    if (index === currentHighlightIndex) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

// =============================================================================
// selectDepartment: 항목 클릭 또는 Enter 키로 선택 시 호출
// =============================================================================
function selectDepartment(dept) {
  const departmentInput = document.getElementById('department');
  departmentInput.value = dept.name;
  departmentInput.setAttribute('data-id', dept.id);
  hideDropdown();
}

// =============================================================================
// showDropdown: 드롭다운 표시
// =============================================================================
function showDropdown() {
  const dropdown = document.getElementById('departmentDropdown');
  dropdown.style.display = 'block';
}

// =============================================================================
// hideDropdown: 드롭다운 숨기기
// =============================================================================
function hideDropdown() {
  const dropdown = document.getElementById('departmentDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
    currentHighlightIndex = -1;
  }
}

// =============================================================================
// setupFormValidation: 입력 필드 유효성 검사 및 포맷팅 설정
// =============================================================================
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

// =============================================================================
// formatPhoneNumber: 전화번호 자동 포맷팅
// =============================================================================
function formatPhoneNumber(input) {
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
      formattedValue = value.substring(0, 3) + '-' +
                      value.substring(3, 7) + '-' +
                      value.substring(7);
    } else {
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

  // 하이폰이 추가된 경우
  if (newLength > oldLength) {
    if (cursorPosition === 3 || cursorPosition === 8) {
      newCursorPosition = cursorPosition + 1;
    }
  }

  input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// =============================================================================
// validateField: 입력값 유효성 검사 후 에러 표시
// =============================================================================
function validateField(field, isValid) {
  const formGroup = field.parentElement;

  if (!isValid && field.value.trim() !== '') {
    formGroup.classList.add('has-error');
  } else {
    formGroup.classList.remove('has-error');
  }
}

// =============================================================================
// saveProfile: 프로필 수정 내용을 백엔드로 전송 후 저장
// (Node.js 서버 / MySQL 사용한다고 가정하여 fetch로 예시 REST 호출)
// =============================================================================
async function saveProfile(event) {
  event.preventDefault();

  // 입력값 추출
  const name = document.getElementById('name').value.trim();
  const deptName = document.getElementById('department').value.trim();
  const deptId = document.getElementById('department').getAttribute('data-id');
  const grade = document.getElementById('grade').value;
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 필수 입력 검사
  if (!name || !deptName || !deptId || !grade || !email || !phone) {
    alert('모든 필수 항목을 입력해주세요.');
    return false;
  }

  // 비밀번호 변경 검사
  if (newPassword) {
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return false;
    }
  }

  // 프로필 이미지 정보 가져오기
  const profileImageType = localStorage.getItem(`user_${localStorage.getItem('currentLoggedInUser')}_profileImageType`) || 'emoji';
  const profileImage = localStorage.getItem(`user_${localStorage.getItem('currentLoggedInUser')}_profileImage`) || '👤';
  const customProfileImage = localStorage.getItem(`user_${localStorage.getItem('currentLoggedInUser')}_customProfileImage`) || null;

  // 백엔드로 보낼 페이로드 구성
  const currentUserId = localStorage.getItem('currentLoggedInUser');
  const payload = {
    id: currentUserId,
    name,
    departmentId: deptId,
    grade: parseInt(grade, 10),
    email,
    phone,
    profileImageType,       // 'emoji' | 'image' | 'custom'
    profileImage,           // 이모지 또는 URL
    customProfileImage,     // base64 or URL (커스텀 업로드 시)
  };

  // 비밀번호가 변경된 경우에만 추가
  if (newPassword) {
    payload.currentPassword = currentPassword;
    payload.newPassword = newPassword;
  }

  try {
    // Node.js 백엔드로 PUT 요청 (예: /api/users/:id)
    const res = await fetch(`/api/users/${encodeURIComponent(currentUserId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('프로필 수정 중 오류 발생');

    alert('개인정보가 성공적으로 수정되었습니다.');
    // 수정 후 메인화면(홈)으로 이동
    window.location.hash = 'home';
    showContent('home');
    return false;
  } catch (err) {
    console.error('프로필 저장 실패:', err);
    alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    return false;
  }
}

// =============================================================================
// goToBack: 이전 페이지로 이동 (SPA 이전 화면 유지 없이 뒤로가기만 수행)
// =============================================================================
function goToBack() {
  // SPA에서 이전 화면으로 되돌아가기 위해 해시를 조작하거나,
  // 단순히 history.back()을 호출합니다.
  history.back();
}

// =============================================================================
// changeProfileImage: 프로필 이미지 변경 모달 표시
// =============================================================================
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

// =============================================================================
// handleImageUpload: 파일 업로드 처리 후 미리보기 & 적용 버튼 생성
// =============================================================================
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

// =============================================================================
// uploadCustomImage: 커스텀 이미지 선택 시 실제 적용 & 로컬 저장
// =============================================================================
function uploadCustomImage(imageData) {
  // 프로필 이미지 업데이트
  const profileImageElement = document.getElementById('profileImage');
  profileImageElement.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

  // 헤더 프로필 이미지도 업데이트
  const headerProfileElement = document.getElementById('headerProfileImage');
  headerProfileElement.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

  // 로컬 스토리지에 저장 (다른 탭으로 반영하기 위한 키)
  const currentUser = localStorage.getItem('currentLoggedInUser');
  localStorage.setItem(`user_${currentUser}_profileImageType`, 'custom');
  localStorage.setItem(`user_${currentUser}_profileImage`, 'custom');
  localStorage.setItem(`user_${currentUser}_customProfileImage`, imageData);

  // 모달 닫기
  closeProfileImageModal();

  // 부모 창(메인 페이지)에 프로필 변경 정보 전송
  updateParentWindowProfileImage(imageData);
}

// =============================================================================
// updateParentWindowProfileImage: 부모 SPA 화면에 이모지/이미지 동기화용 이벤트 전달
// =============================================================================
function updateParentWindowProfileImage(imageData) {
  try {
    localStorage.setItem('profileImageUpdated', 'true');
    if (window.opener && !window.opener.closed) {
      window.opener.updateProfileImage({ profileImageType: 'custom', profileImage: imageData });
    }
  } catch (e) {
    console.log('부모 창 업데이트 시도 중 오류:', e);
  }
}

// =============================================================================
// selectProfileImage: 기본 이모지 옵션 클릭 시 실행
// =============================================================================
function selectProfileImage(image, type) {
  // 프로필 이미지 업데이트
  const profileImageElement = document.getElementById('profileImage');
  const headerProfileElement = document.getElementById('headerProfileImage');

  if (type === 'emoji') {
    profileImageElement.innerHTML = image;
    headerProfileElement.innerHTML = image;
  } else {
    profileImageElement.innerHTML = `<img src="${image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    headerProfileElement.innerHTML = `<img src="${image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
  }

  // 로컬 스토리지 저장
  const currentUser = localStorage.getItem('currentLoggedInUser');
  localStorage.setItem(`user_${currentUser}_profileImageType`, type);
  localStorage.setItem(`user_${currentUser}_profileImage`, image);

  // 모달 닫기
  closeProfileImageModal();

  // 부모 창 업데이트
  try {
    localStorage.setItem('profileImageUpdated', 'true');
    localStorage.setItem('profileEmojiValue', image);
    if (window.opener && !window.opener.closed) {
      window.opener.updateProfileImage({ profileImageType: 'emoji', profileImage: image });
    }
  } catch (e) {
    console.log('부모 창 이모지 업데이트 시도 중 오류:', e);
  }
}

// =============================================================================
// closeProfileImageModal: 변경 모달 닫기
// =============================================================================
function closeProfileImageModal() {
  const modal = document.getElementById('profileImageModal');
  if (modal) {
    document.body.removeChild(modal);
  }
}

// =============================================================================
// setupFormValidation: 입력 필드 유효성 검사 및 포맷팅 설정
// =============================================================================
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

// =============================================================================
// formatPhoneNumber: 전화번호 자동 포맷팅
// =============================================================================
function formatPhoneNumber(input) {
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
      formattedValue = value.substring(0, 3) + '-' +
                      value.substring(3, 7) + '-' +
                      value.substring(7);
    } else {
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

  // 하이폰이 추가된 경우
  if (newLength > oldLength) {
    if (cursorPosition === 3 || cursorPosition === 8) {
      newCursorPosition = cursorPosition + 1;
    }
  }

  input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// =============================================================================
// validateField: 입력값 유효성 검사 후 에러 표시
// =============================================================================
function validateField(field, isValid) {
  const formGroup = field.parentElement;

  if (!isValid && field.value.trim() !== '') {
    formGroup.classList.add('has-error');
  } else {
    formGroup.classList.remove('has-error');
  }
}

// =============================================================================
// saveProfile: 프로필 수정 내용을 백엔드로 전송 후 저장
// (Node.js 서버 / MySQL 사용한다고 가정하여 fetch로 예시 REST 호출)
// =============================================================================
async function saveProfile(event) {
  event.preventDefault();

  // 입력값 추출
  const name = document.getElementById('name').value.trim();
  const deptName = document.getElementById('department').value.trim();
  const deptId = document.getElementById('department').getAttribute('data-id');
  const grade = document.getElementById('grade').value;
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 필수 입력 검사
  if (!name || !deptName || !deptId || !grade || !email || !phone) {
    alert('모든 필수 항목을 입력해주세요.');
    return false;
  }

  // 비밀번호 변경 검사
  if (newPassword) {
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return false;
    }
  }

  // 프로필 이미지 정보 가져오기
  const profileImageType = localStorage.getItem(`user_${localStorage.getItem('currentLoggedInUser')}_profileImageType`) || 'emoji';
  const profileImage = localStorage.getItem(`user_${localStorage.getItem('currentLoggedInUser')}_profileImage`) || '👤';
  const customProfileImage = localStorage.getItem(`user_${localStorage.getItem('currentLoggedInUser')}_customProfileImage`) || null;

  // 백엔드로 보낼 페이로드 구성
  const currentUserId = localStorage.getItem('currentLoggedInUser');
  const payload = {
    id: currentUserId,
    name,
    departmentId: deptId,
    grade: parseInt(grade, 10),
    email,
    phone,
    profileImageType,       // 'emoji' | 'image' | 'custom'
    profileImage,           // 이모지 또는 URL
    customProfileImage,     // base64 or URL (커스텀 업로드 시)
  };

  // 비밀번호가 변경된 경우에만 추가
  if (newPassword) {
    payload.currentPassword = currentPassword;
    payload.newPassword = newPassword;
  }

  try {
    // Node.js 백엔드로 PUT 요청 (예: /api/users/:id)
    const res = await fetch(`/api/users/${encodeURIComponent(currentUserId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('프로필 수정 중 오류 발생');

    alert('개인정보가 성공적으로 수정되었습니다.');
    // 수정 후 메인화면(홈)으로 이동
    window.location.hash = 'home';
    showContent('home');
    return false;
  } catch (err) {
    console.error('프로필 저장 실패:', err);
    alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    return false;
  }
}

// =============================================================================
// goToBack: 이전 페이지로 이동 (SPA 이전 화면 유지 없이 뒤로가기만 수행)
// =============================================================================
function goToBack() {
  history.back();
}

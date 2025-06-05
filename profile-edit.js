/**
 * profile-edit.js
 *
 * 설명:
 *   - 페이지 로드 시, REST API를 통해 사용자 프로필 정보와 학과 목록을 가져와서
 *     input 필드, 자동완성 드롭다운, 프로필 이미지 등을 초기화합니다.
 *   - 사용자가 “저장” 버튼을 누르면 수정된 프로필 데이터를 API로 전송합니다.
 *   - 프로필 이미지 업로드, 이모지 선택을 모달 형태로 처리하고, 서버로 업로드합니다.
 *
 * 백엔드 API 가정:
 *   GET    /api/user/profile       -> 현재 로그인한 사용자 프로필(JSON)
 *   GET    /api/departments        -> 학과 목록(배열 [{ id, name, category}, …])
 *   PUT    /api/user/profile       -> 프로필 수정 요청(본문: JSON)
 *   POST   /api/user/profile-image -> 프로필 이미지 업로드(FormData)
 */

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  setupDepartmentAutocomplete();
  setupFormValidation();
  fetchUserProfile();
  fetchDepartments();
});

/* ────────────────────────────────────────────────────────────────────────────── */
/* 1) 로그인 상태 확인                                                      */
/* ────────────────────────────────────────────────────────────────────────────── */
function checkLoginStatus() {
  // 예시: 백엔드 세션 / JWT 검사 후 redirect 처리 필요 (여기서는 간단히 API 호출)
  fetch('/api/user/profile', { credentials: 'include' })
    .then((res) => {
      if (res.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/login.html';
        return Promise.reject('Unauthorized');
      }
      return res.json();
    })
    .then((data) => {
      // 서버에서 프로필 정보를 바로 받아왔으므로, 다음 단계에서 우선 cache 해두거나
      // fetchUserProfile() 함수와 통합하여 처리 가능합니다.
    })
    .catch((err) => {
      console.log(err);
    });
}

/* ────────────────────────────────────────────────────────────────────────────── */
/* 2) 사용자 프로필 정보 가져와서 초기화                                    */
/* ────────────────────────────────────────────────────────────────────────────── */
function fetchUserProfile() {
  fetch('/api/user/profile', { credentials: 'include' })
    .then((res) => {
      if (!res.ok) throw new Error('프로필 정보를 불러오는 중 오류 발생');
      return res.json();
    })
    .then((profile) => {
      // 예시 profile JSON 구조:
      // {
      //   studentId: "202012345",
      //   name: "홍길동",
      //   departmentId: "computerSoftware",
      //   departmentName: "컴퓨터소프트웨어과",
      //   grade: "2",
      //   email: "hong@example.com",
      //   phone: "010-1234-5678",
      //   profileImageType: "emoji" | "image" | "custom",
      //   profileImage: "👨‍🎓" or "https://…/xxx.jpg",
      //   customProfileImage: "data:image/png;base64,…" // (optional)
      // }

      // 기본 정보 필드 채우기
      document.getElementById('studentId').value = profile.studentId || '';
      document.getElementById('name').value = profile.name || '';
      document.getElementById('department').value = profile.departmentName || '';
      document
        .getElementById('department')
        .setAttribute('data-id', profile.departmentId || '');
      document.getElementById('grade').value = profile.grade || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('phone').value = profile.phone || '';

      // 프로필 이미지 설정
      const profileImageEl = document.getElementById('profileImage');
      const headerProfileEl = document.getElementById('headerProfileImage');

      if (profile.profileImageType === 'emoji') {
        profileImageEl.innerHTML = profile.profileImage || '👨‍🎓';
        headerProfileEl.innerHTML = profile.profileImage || '👨‍🎓';
      } else if (profile.profileImageType === 'image') {
        profileImageEl.innerHTML = `<img src="${profile.profileImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
        headerProfileEl.innerHTML = `<img src="${profile.profileImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      } else if (
        profile.profileImageType === 'custom' &&
        profile.customProfileImage
      ) {
        profileImageEl.innerHTML = `<img src="${profile.customProfileImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
        headerProfileEl.innerHTML = `<img src="${profile.customProfileImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      } else {
        profileImageEl.innerHTML = '👨‍🎓';
        headerProfileEl.innerHTML = '👨‍🎓';
      }
    })
    .catch((err) => {
      console.error(err);
      alert('프로필 정보를 불러오는 중 오류가 발생했습니다.');
    });
}

/* ────────────────────────────────────────────────────────────────────────────── */
/* 3) 학과 목록 가져와서 자동완성에 활용                                        */
/* ────────────────────────────────────────────────────────────────────────────── */
let allDepartments = [];
let currentHighlightIndex = -1;
let currentFilteredDepartments = [];

function fetchDepartments() {
  fetch('/api/departments', { credentials: 'include' })
    .then((res) => {
      if (!res.ok) throw new Error('학과 목록을 불러오는 중 오류 발생');
      return res.json();
    })
    .then((departments) => {
      // departments: [{ id, name, category }, …]
      allDepartments = departments;
    })
    .catch((err) => {
      console.error(err);
      allDepartments = [];
    });
}

function setupDepartmentAutocomplete() {
  const departmentInput = document.getElementById('department');
  const dropdown = document.getElementById('departmentDropdown');

  departmentInput.addEventListener('input', () => {
    filterDepartments(departmentInput.value.toLowerCase());
  });

  departmentInput.addEventListener('focus', () => {
    filterDepartments(departmentInput.value.toLowerCase());
  });

  departmentInput.addEventListener('blur', () => {
    setTimeout(() => {
      hideDropdown();
    }, 200);
  });

  departmentInput.addEventListener('keydown', (e) => {
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
      if (
        currentHighlightIndex >= 0 &&
        items[currentHighlightIndex]
      ) {
        const selectedDept =
          currentFilteredDepartments[currentHighlightIndex];
        selectDepartment(selectedDept);
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      !departmentInput.contains(e.target) &&
      !dropdown.contains(e.target)
    ) {
      hideDropdown();
    }
  });
}

function filterDepartments(searchValue) {
  const dropdown = document.getElementById('departmentDropdown');
  if (!searchValue) {
    currentFilteredDepartments = [...allDepartments];
  } else {
    currentFilteredDepartments = allDepartments.filter((dept) =>
      dept.name.toLowerCase().includes(searchValue)
    );
  }

  if (currentFilteredDepartments.length > 0) {
    showDropdown();
    renderDropdownItems();
  } else {
    hideDropdown();
  }
}

function renderDropdownItems() {
  const dropdown = document.getElementById('departmentDropdown');
  dropdown.innerHTML = '';

  // 계열별 그룹화
  const grouped = {};
  currentFilteredDepartments.forEach((dept) => {
    if (!grouped[dept.category]) {
      grouped[dept.category] = [];
    }
    grouped[dept.category].push(dept);
  });

  const categoryOrder = [
    '스마트 ICT계열',
    '라이프디자인계열',
    '문화콘텐츠계열',
    '사회·교육계열',
    '보건생명계열',
    '관광조리계열',
    '공통계열',
  ];

  let itemIndex = 0;
  categoryOrder.forEach((cat) => {
    if (grouped[cat] && grouped[cat].length > 0) {
      // 카테고리 헤더
      const header = document.createElement('div');
      header.className = 'autocomplete-category';
      header.textContent = cat;
      dropdown.appendChild(header);

      grouped[cat].forEach((dept) => {
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

function updateHighlight() {
  const items = document.querySelectorAll('.autocomplete-item');
  items.forEach((item, idx) => {
    if (idx === currentHighlightIndex) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

function selectDepartment(dept) {
  const departmentInput = document.getElementById('department');
  departmentInput.value = dept.name;
  departmentInput.setAttribute('data-id', dept.id);
  hideDropdown();
}

function showDropdown() {
  document.getElementById('departmentDropdown').style.display = 'block';
}

function hideDropdown() {
  const dropdown = document.getElementById('departmentDropdown');
  dropdown.style.display = 'none';
  currentHighlightIndex = -1;
}

/* ────────────────────────────────────────────────────────────────────────────── */
/* 4) 프로필 폼 유효성 검사                                                   */
/* ────────────────────────────────────────────────────────────────────────────── */
function setupFormValidation() {
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const newPwInput = document.getElementById('newPassword');
  const confirmPwInput = document.getElementById('confirmPassword');

  // 전화번호 자동 포맷
  phoneInput.addEventListener('input', () => formatPhoneNumber(phoneInput));

  phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      const value = phoneInput.value;
      const cursorPos = phoneInput.selectionStart;
      if (cursorPos > 0 && value[cursorPos - 1] === '-') {
        e.preventDefault();
        const newValue =
          value.substring(0, cursorPos - 1) +
          value.substring(cursorPos);
        phoneInput.value = newValue;
        phoneInput.setSelectionRange(
          cursorPos - 1,
          cursorPos - 1
        );
        return;
      }
    }
  });

  // 이메일 형식 검사
  emailInput.addEventListener('blur', () => {
    const eReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = eReg.test(emailInput.value);
    validateField(emailInput, isValid);
  });

  // 전화번호 형식 검사
  phoneInput.addEventListener('blur', () => {
    const pReg = /^010-\d{4}-\d{4}$/;
    const isValid = pReg.test(phoneInput.value);
    validateField(phoneInput, isValid);
  });

  // 새 비밀번호 유효성 검사
  newPwInput.addEventListener('input', () => {
    if (newPwInput.value.trim() !== '') {
      const pwReg =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      const isValid = pwReg.test(newPwInput.value);
      validateField(newPwInput, isValid);

      if (confirmPwInput.value.trim() !== '') {
        const isConfirmValid =
          confirmPwInput.value === newPwInput.value;
        validateField(confirmPwInput, isConfirmValid);
      }
    } else {
      validateField(newPwInput, true);
      validateField(confirmPwInput, true);
    }
  });

  // 새 비밀번호 확인 일치 검사
  confirmPwInput.addEventListener('input', () => {
    if (
      confirmPwInput.value.trim() !== '' ||
      newPwInput.value.trim() !== ''
    ) {
      const isValid =
        confirmPwInput.value === newPwInput.value;
      validateField(confirmPwInput, isValid);
    } else {
      validateField(confirmPwInput, true);
    }
  });

  // 폼 제출 시
  document
    .getElementById('profileEditForm')
    .addEventListener('submit', (e) => {
      e.preventDefault();
      submitProfileForm();
    });
}

function formatPhoneNumber(inputEl) {
  const oldCursor = inputEl.selectionStart;
  const oldLength = inputEl.value.length;
  let val = inputEl.value.replace(/[^\d]/g, '');

  if (val.length > 11) val = val.substring(0, 11);

  let formatted = '';
  if (val.length >= 3) {
    if (val.length >= 7) {
      formatted =
        val.substring(0, 3) +
        '-' +
        val.substring(3, 7) +
        '-' +
        val.substring(7);
    } else {
      formatted = val.substring(0, 3) + '-' + val.substring(3);
    }
  } else {
    formatted = val;
  }

  inputEl.value = formatted;
  const newLength = formatted.length;
  let newCursor = oldCursor;
  if (newLength > oldLength) {
    if (oldCursor === 3 || oldCursor === 8) newCursor = oldCursor + 1;
  }
  inputEl.setSelectionRange(newCursor, newCursor);
}

function validateField(fieldEl, isValid) {
  const formGroup = fieldEl.parentElement;
  if (!isValid && fieldEl.value.trim() !== '') {
    formGroup.classList.add('has-error');
  } else {
    formGroup.classList.remove('has-error');
  }
}

/* ────────────────────────────────────────────────────────────────────────────── */
/* 5) 프로필 저장 API 호출                                                     */
/* ────────────────────────────────────────────────────────────────────────────── */
function submitProfileForm() {
  const name = document.getElementById('name').value.trim();
  const departmentName = document
    .getElementById('department')
    .value.trim();
  const departmentId = document
    .getElementById('department')
    .getAttribute('data-id');
  const grade = document.getElementById('grade').value;
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !departmentName || !departmentId || !grade || !email || !phone) {
    alert('모든 필수 항목을 올바르게 입력해주세요.');
    return;
  }

  // 비밀번호 변경 검사
  const currentPw = document.getElementById('currentPassword').value;
  const newPw = document.getElementById('newPassword').value;
  const confirmPw = document.getElementById('confirmPassword').value;

  if (newPw) {
    if (!currentPw) {
      alert('비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.');
      return;
    }
    if (newPw !== confirmPw) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    const pwReg =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!pwReg.test(newPw)) {
      alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return;
    }
  }

  // 전송용 JSON
  const payload = {
    name,
    departmentId,
    grade,
    email,
    phone,
    changePassword: newPw ? { currentPassword: currentPw, newPassword: newPw } : null,
  };

  fetch('/api/user/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.message || '프로필 수정에 실패했습니다.');
        });
      }
      return res.json();
    })
    .then((data) => {
      alert('개인정보가 성공적으로 수정되었습니다.');
      goToBack();
    })
    .catch((err) => {
      alert(err.message);
    });
}

/* ────────────────────────────────────────────────────────────────────────────── */
/* 6) 프로필 이미지 변경 모달                                                 */
/* ────────────────────────────────────────────────────────────────────────────── */
function openProfileImageModal() {
  // 기본 이모지 옵션 예시 (필요에 따라 서버에서 받아와도 됩니다)
  const emojiOptions = [
    '👨‍🎓',
    '👩‍🎓',
    '👨‍💼',
    '👩‍💼',
    '👨‍🏫',
    '👩‍🏫',
    '👨‍🔬',
    '👩‍🔬',
    '👨‍💻',
    '👩‍💻',
  ];

  // 모달 컨테이너
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  modalContainer.id = 'profileImageModal';

  // 모달 콘텐츠
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // 모달 헤더
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.innerHTML = '<h3 class="modal-title">프로필 이미지 선택</h3>';

  // 업로드 섹션
  const uploadSection = document.createElement('div');
  uploadSection.className = 'modal-section';

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

  // 기본 이미지(이모지) 섹션
  const emojiSection = document.createElement('div');
  emojiSection.className = 'modal-section';

  const emojiTitle = document.createElement('h4');
  emojiTitle.className = 'modal-section-title';
  emojiTitle.textContent = '기본 이미지';

  const emojiGrid = document.createElement('div');
  emojiGrid.className = 'image-grid';

  emojiOptions.forEach((emoji) => {
    const option = document.createElement('div');
    option.className = 'image-option';
    option.onclick = () => selectProfileImage(emoji, 'emoji');

    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'emoji-image';
    emojiDiv.textContent = emoji;

    option.appendChild(emojiDiv);
    emojiGrid.appendChild(option);
  });

  emojiSection.appendChild(emojiTitle);
  emojiSection.appendChild(emojiGrid);

  // 모달 푸터
  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';
  modalFooter.textContent = '닫기';
  modalFooter.onclick = closeProfileImageModal;

  // 모달 조합
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(uploadSection);
  modalContent.appendChild(emojiSection);
  modalContent.appendChild(modalFooter);
  modalContainer.appendChild(modalContent);

  document.body.appendChild(modalContainer);
}

function closeProfileImageModal() {
  const modal = document.getElementById('profileImageModal');
  if (modal) {
    document.body.removeChild(modal);
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';

    const imagePreview = document.createElement('img');
    imagePreview.className = 'preview-image';
    imagePreview.src = e.target.result;

    const applyButton = document.createElement('button');
    applyButton.className = 'apply-button';
    applyButton.textContent = '이 사진으로 설정';
    applyButton.onclick = () => uploadCustomImage(e.target.result);

    previewContainer.appendChild(imagePreview);
    previewContainer.appendChild(applyButton);
    previewContainer.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function uploadCustomImage(imageData) {
  // FormData 이용하여 백엔드로 전송
  const formData = new FormData();
  formData.append('imageData', imageData);

  fetch('/api/user/profile-image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.message || '이미지 업로드 실패');
        });
      }
      return res.json();
    })
    .then((data) => {
      // 서버는 { profileImageUrl: "https://…/xxx.jpg" } 형태로 응답한다고 가정
      const newUrl = data.profileImageUrl;
      const profileImageEl = document.getElementById('profileImage');
      const headerProfileEl = document.getElementById(
        'headerProfileImage'
      );
      profileImageEl.innerHTML = `<img src="${newUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      headerProfileEl.innerHTML = `<img src="${newUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      closeProfileImageModal();
      alert('프로필 이미지가 업데이트되었습니다.');
    })
    .catch((err) => {
      alert(err.message);
    });
}

function selectProfileImage(image, type) {
  // type === 'emoji' 이면 서버에 이모지 정보로 요청
  if (type === 'emoji') {
    fetch('/api/user/profile-image', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || '이모지 설정 실패');
          });
        }
        return res.json();
      })
      .then((data) => {
        // 서버는 { profileImageUrl: null, profileImageEmoji: "👨‍🎓" } 형태로 응답한다고 가정
        const profileImageEl = document.getElementById('profileImage');
        const headerProfileEl = document.getElementById(
          'headerProfileImage'
        );
        profileImageEl.innerHTML = image;
        headerProfileEl.innerHTML = image;
        closeProfileImageModal();
        alert('프로필 이모지가 업데이트되었습니다.');
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}

/* ────────────────────────────────────────────────────────────────────────────── */
/* 7) 이전 페이지로 돌아가기                                                   */
/* ────────────────────────────────────────────────────────────────────────────── */
function goToBack() {
  window.history.back();
}

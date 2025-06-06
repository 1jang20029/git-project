// =============================================================================
// profile-edit.js
// 분리된 프로필 수정 화면 전용 자바스크립트
// =============================================================================

// 가정: 현재 로그인한 사용자의 ID가 localStorage.getItem('currentLoggedInUser') 에 저장되어 있다고 가정합니다.
// 실제 구현 시, API를 통해 사용자 정보를 불러오고 업데이트하도록 변경하세요.

// ─────────── 페이지 로드 시 실행할 로직 ───────────
document.addEventListener('DOMContentLoaded', () => {
  loadProfileData();
  bindProfileImageTypeToggle();
  initSaveCancelButtons();
});

// ─────────── loadProfileData: 로컬스토리지 혹은 API에서 기존 프로필 정보를 불러와서 입력란에 채워넣음 ───────────
function loadProfileData() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요한 페이지입니다.', 'error');
    return;
  }

  // 예시: localStorage에 저장된 사용자 정보(JSON)를 불러온다고 가정
  // 실제 구현 시 fetch(`/api/users/${currentUser}`) 등을 사용하세요.
  const savedProfile = JSON.parse(localStorage.getItem(`userProfile_${currentUser}`)) || {
    profileImageType: 'emoji',
    profileEmoji: '👤',
    profileImageUrl: '',
    name: '',
    department: '',
    email: ''
  };

  // 1) 프로필 이미지 타입 적용
  const imageTypeSelect = document.getElementById('profileImageType');
  imageTypeSelect.value = savedProfile.profileImageType;

  // 2) 이모지 vs URL 입력란 토글
  toggleImageFields(savedProfile.profileImageType);

  // 3) 이모지 or URL 값 채우기
  document.getElementById('profileEmoji').value = savedProfile.profileEmoji || '';
  document.getElementById('profileImageUrl').value = savedProfile.profileImageUrl || '';

  // 4) 이름, 학과, 이메일 채우기
  document.getElementById('profileName').value = savedProfile.name || '';
  document.getElementById('profileDepartment').value = savedProfile.department || '';
  document.getElementById('profileEmail').value = savedProfile.email || '';
}

// ─────────── bindProfileImageTypeToggle: 이미지 타입 select 변경 시 입력란을 토글 ───────────
function bindProfileImageTypeToggle() {
  const imageTypeSelect = document.getElementById('profileImageType');
  imageTypeSelect.addEventListener('change', (e) => {
    toggleImageFields(e.target.value);
  });
}

function toggleImageFields(type) {
  const emojiContainer = document.getElementById('emoji-picker-container');
  const urlContainer = document.getElementById('image-url-container');
  if (type === 'emoji') {
    emojiContainer.style.display = 'flex';
    urlContainer.style.display = 'none';
  } else {
    emojiContainer.style.display = 'none';
    urlContainer.style.display = 'flex';
  }
}

// ─────────── initSaveCancelButtons: 저장 / 취소 버튼 이벤트 바인딩 ───────────
function initSaveCancelButtons() {
  const saveBtn = document.getElementById('saveProfileBtn');
  const cancelBtn = document.getElementById('cancelProfileBtn');

  // 저장
  saveBtn.addEventListener('click', () => {
    saveProfileData();
  });

  // 취소: 입력란을 초기화(원래 값으로 복원)
  cancelBtn.addEventListener('click', () => {
    loadProfileData();
    showMessage('수정 전 상태로 되돌아갔습니다.', 'info');
  });
}

// ─────────── saveProfileData: 입력값을 로컬스토리지 혹은 API로 저장 ───────────
function saveProfileData() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요한 페이지입니다.', 'error');
    return;
  }

  // 1) 입력값 수집
  const profileImageType = document.getElementById('profileImageType').value;
  const profileEmoji = document.getElementById('profileEmoji').value.trim();
  const profileImageUrl = document.getElementById('profileImageUrl').value.trim();
  const name = document.getElementById('profileName').value.trim();
  const department = document.getElementById('profileDepartment').value.trim();
  const email = document.getElementById('profileEmail').value.trim();

  // 2) 유효성 검사 (필수: 이름)
  if (name === '') {
    showMessage('이름을 입력하세요.', 'error');
    return;
  }

  // 3) 로컬스토리지에 예시 JSON 형태로 저장 (실제 구현 시 API 호출)
  const newProfile = {
    profileImageType,
    profileEmoji: profileImageType === 'emoji' ? profileEmoji : '',
    profileImageUrl: profileImageType === 'url' ? profileImageUrl : '',
    name,
    department,
    email
  };
  localStorage.setItem(`userProfile_${currentUser}`, JSON.stringify(newProfile));

  // 4) 사용자 메뉴에 즉시 반영 (index.js의 updateProfileImage 함수가 storage 이벤트를 감지)
  // localStorage 키 변경 이벤트를 트리거하기 위해 복사본으로 다시 저장
  localStorage.setItem(`userProfile_${currentUser}`, JSON.stringify(newProfile));

  showMessage('프로필이 저장되었습니다.', 'success');
}

// ─────────── showMessage: 화면 우측 상단 슬라이드 알림 메시지 ───────────
function showMessage(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor =
    type === 'success'
      ? 'rgba(16, 185, 129, 0.9)'
      : type === 'error'
      ? 'rgba(239, 68, 68, 0.9)'
      : 'rgba(59, 130, 246, 0.9)';
  const icon =
    type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: 600;
    backdrop-filter: blur(20px);
    border: 1px solid ${bgColor.replace('0.9', '0.3')};
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;

  notification.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <span>${icon}</span>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ─────────── 전역에 initProfileEditPage 노출 (index.js에서 사용할 경우) ───────────
window.initProfileEditPage = loadProfileData;

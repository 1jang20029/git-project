// lecture-review.js - 프론트엔드 전용

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
  initLectureReviewPage();
});

/**
 * 페이지 초기화 함수
 */
async function initLectureReviewPage() {
  try {
    showLoading();
    
    // 백엔드 API 호출 (이미 가공된 데이터 받음)
    const [popularResponse, recentResponse] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent')
    ]);

    if (!popularResponse.ok || !recentResponse.ok) {
      throw new Error('API 호출 실패');
    }

    const popularReviews = await popularResponse.json();
    const recentReviews = await recentResponse.json();

    hideLoading();
    renderLectureReviews(popularReviews, recentReviews);
    
  } catch (error) {
    hideLoading();
    console.error('강의평가 데이터 로드 실패:', error);
    showError('데이터를 불러오는 중 오류가 발생했습니다.');
  }

  setupEventListeners();
}

/**
 * 강의평가 데이터 렌더링
 */
function renderLectureReviews(popularReviews, recentReviews) {
  const popularContainer = document.getElementById('popularReviews');
  const recentContainer = document.getElementById('recentReviews');
  
  if (!popularContainer || !recentContainer) return;

  renderReviewList(popularContainer, popularReviews, '인기 강의평가');
  renderReviewList(recentContainer, recentReviews, '최근 강의평가');
}

/**
 * 개별 리뷰 리스트 렌더링
 */
function renderReviewList(container, reviews, type) {
  container.innerHTML = '';
  
  if (!reviews || reviews.length === 0) {
    container.innerHTML = `<div class="empty-state">${type}가 없습니다.</div>`;
    return;
  }

  reviews.forEach(review => {
    const reviewElement = createReviewElement(review);
    container.appendChild(reviewElement);
  });
}

/**
 * 개별 리뷰 엘리먼트 생성
 * 백엔드에서 이미 포맷된 데이터를 사용
 */
function createReviewElement(review) {
  const item = document.createElement('div');
  item.className = 'evaluation-item';
  item.onclick = () => viewEvaluationDetail(review.id);
  
  item.innerHTML = `
    <div class="evaluation-header">
      <span class="evaluation-course">${review.course_name}</span>
      <span class="evaluation-rating">${review.rating_display}</span>
    </div>
    <div class="evaluation-review">${review.review_text}</div>
    <div class="evaluation-meta">
      <span>${review.formatted_date}</span>
      <span>${review.user_display_name}</span>
    </div>
  `;
  
  return item;
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  const writeBtn = document.getElementById('write-review-button');
  if (writeBtn) {
    writeBtn.addEventListener('click', handleWriteReview);
  }
}

/**
 * 평가 상세 보기
 */
function viewEvaluationDetail(evaluationId) {
  window.location.href = `/reviews/${evaluationId}`;
}

/**
 * 강의평가 작성 버튼 클릭 핸들러
 * 모달을 띄워서 강의 선택 후 작성 페이지로 이동
 */
async function handleWriteReview() {
  try {
    // 사용자의 수강 강의 목록 가져오기
    const response = await fetch('/api/user/enrolled-courses');
    
    if (!response.ok) {
      throw new Error('수강 강의 목록을 불러올 수 없습니다.');
    }
    
    const courses = await response.json();
    
    if (!courses || courses.length === 0) {
      showError('수강 중인 강의가 없습니다.');
      return;
    }
    
    // 강의 선택 모달 표시
    showCourseSelectionModal(courses);
    
  } catch (error) {
    console.error('강의 목록 로드 실패:', error);
    showError('강의 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

/**
 * 강의 선택 모달 표시
 */
function showCourseSelectionModal(courses) {
  // 기존 모달이 있으면 제거
  const existingModal = document.getElementById('course-selection-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 모달 생성
  const modal = document.createElement('div');
  modal.id = 'course-selection-modal';
  modal.className = 'modal';
  
  const courseList = courses.map(course => `
    <div class="course-item" onclick="selectCourse('${course.id}', '${course.name}')">
      <div class="course-name">${course.name}</div>
      <div class="course-info">
        <span class="professor">${course.professor}</span>
        <span class="semester">${course.semester}</span>
      </div>
    </div>
  `).join('');
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>강의평가를 작성할 강의를 선택하세요</h3>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="course-list">
          ${courseList}
        </div>
      </div>
    </div>
  `;
  
  // 모달을 body에 추가
  document.body.appendChild(modal);
  
  // 모달 외부 클릭 시 닫기
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/**
 * 강의 선택 처리
 */
function selectCourse(courseId, courseName) {
  closeModal();
  
  // 선택된 강의로 평가 작성 페이지 이동
  window.location.href = `/reviews/write?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`;
}

/**
 * 모달 닫기
 */
function closeModal() {
  const modal = document.getElementById('course-selection-modal');
  if (modal) {
    modal.remove();
  }
  
  // ESC 키 이벤트 리스너 제거
  document.removeEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/**
 * 로딩 상태 표시
 */
function showLoading() {
  const containers = ['popularReviews', 'recentReviews'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<div class="loading">데이터를 불러오는 중...</div>';
    }
  });
}

/**
 * 로딩 상태 숨김
 */
function hideLoading() {
  // 로딩 상태는 renderReviewList에서 자동으로 제거됨
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.className = 'error-message show';
    
    // 5초 후 자동 숨김
    setTimeout(() => {
      errorElement.style.display = 'none';
      errorElement.className = 'error-message';
    }, 5000);
  } else {
    // 에러 요소가 없으면 alert 사용
    alert(message);
  }
}

/**
 * 성공 메시지 표시
 */
function showSuccess(message) {
  const successElement = document.getElementById('success-message');
  
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    successElement.className = 'success-message show';
    
    // 3초 후 자동 숨김
    setTimeout(() => {
      successElement.style.display = 'none';
      successElement.className = 'success-message';
    }, 3000);
  }
}
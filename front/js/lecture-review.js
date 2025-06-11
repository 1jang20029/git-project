// lecture-review.js

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
  initLectureReviewPage();
});

/**
 * 페이지 초기화 함수
 * - Node.js + MySQL 백엔드 API 호출
 */
async function initLectureReviewPage() {
  try {
    // 인기 강의평가와 최근 강의평가 동시 호출
    const [popularResponse, recentResponse] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent')
    ]);

    if (!popularResponse.ok || !recentResponse.ok) {
      throw new Error('API 호출 실패');
    }

    const popularReviews = await popularResponse.json();
    const recentReviews = await recentResponse.json();

    renderLectureReviews(popularReviews, recentReviews);
  } catch (error) {
    console.error('강의평가 데이터 로드 실패:', error);
    showError('데이터를 불러오는 중 오류가 발생했습니다.');
    renderLectureReviews([], []);
  }

  // "강의평가 작성하기" 버튼 이벤트 리스너
  const writeBtn = document.getElementById('write-review-button');
  if (writeBtn) {
    writeBtn.addEventListener('click', handleWriteReview);
  }
}

/**
 * 강의평가 데이터 렌더링
 * @param {Array} popularReviews - 인기 강의평가 배열
 * @param {Array} recentReviews - 최근 강의평가 배열
 */
function renderLectureReviews(popularReviews, recentReviews) {
  const popularContainer = document.getElementById('popularReviews');
  const recentContainer = document.getElementById('recentReviews');
  
  if (!popularContainer || !recentContainer) return;

  // 인기 강의평가 렌더링
  renderReviewList(popularContainer, popularReviews, '인기 강의평가');
  
  // 최근 강의평가 렌더링
  renderReviewList(recentContainer, recentReviews, '최근 강의평가');
}

/**
 * 개별 리뷰 리스트 렌더링
 * @param {HTMLElement} container - 컨테이너 엘리먼트
 * @param {Array} reviews - 리뷰 데이터 배열
 * @param {string} type - 리뷰 타입 (에러 메시지용)
 */
function renderReviewList(container, reviews, type) {
  // 로딩 상태 제거
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
 * @param {Object} review - 리뷰 데이터
 * @returns {HTMLElement} 리뷰 엘리먼트
 */
function createReviewElement(review) {
  const item = document.createElement('div');
  item.className = 'evaluation-item';
  item.onclick = () => viewEvaluationDetail(review.id);
  
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const formattedDate = formatDate(review.created_at);
  const reviewText = review.review || '댓글이 없습니다.';
  const userName = review.user_name || '익명';
  const courseName = review.course_name || review.course_id || '강의명 없음';
  
  item.innerHTML = `
    <div class="evaluation-header">
      <span class="evaluation-course">${escapeHtml(courseName)}</span>
      <span class="evaluation-rating">${stars}</span>
    </div>
    <div class="evaluation-review">${escapeHtml(reviewText)}</div>
    <div class="evaluation-meta">
      <span>${formattedDate}</span>
      <span>${escapeHtml(userName)}</span>
    </div>
  `;
  
  return item;
}

/**
 * 평가 상세 보기
 * @param {number} evaluationId - 평가 ID
 */
function viewEvaluationDetail(evaluationId) {
  // 실제 구현에서는 상세 페이지로 이동하거나 모달 표시
  console.log(`평가 ID ${evaluationId} 상세보기`);
  alert(`평가 ${evaluationId} 상세보기 기능은 준비 중입니다.`);
}

/**
 * 강의평가 작성 버튼 클릭 핸들러
 */
function handleWriteReview() {
  // 실제 구현에서는 강의 선택 페이지나 작성 폼으로 이동
  console.log('강의평가 작성 페이지로 이동');
  alert('강의평가 작성 페이지로 이동합니다.');
}

/**
 * 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // 5초 후 자동 숨김
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD HH:MM' 형태로 변환
 * @param {string} isoString - ISO 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(isoString) {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('날짜 포맷 에러:', error);
    return '';
  }
}

/**
 * HTML 이스케이프 처리
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
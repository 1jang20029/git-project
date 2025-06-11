// lecture-review.js - 강의평가 렌더링 담당
import { fetchPopularReviews, fetchRecentReviews } from './api.js';

document.addEventListener('DOMContentLoaded', function () {
  initLectureReviewPage();
});

async function initLectureReviewPage() {
  try {
    const [popularReviews, recentReviews] = await Promise.all([
      fetchPopularReviews(),
      fetchRecentReviews()
    ]);

    renderLectureReviews(popularReviews, recentReviews);
  } catch (error) {
    console.error('강의평가 데이터 로드 실패:', error);
    showError('데이터를 불러오는 중 오류가 발생했습니다.');
    renderLectureReviews([], []);
  }

  const writeBtn = document.getElementById('write-review-button');
  if (writeBtn) {
    writeBtn.addEventListener('click', handleWriteReview);
  }
}

function renderLectureReviews(popularReviews, recentReviews) {
  const popularContainer = document.getElementById('popularReviews');
  const recentContainer = document.getElementById('recentReviews');
  if (!popularContainer || !recentContainer) return;

  renderReviewList(popularContainer, popularReviews, '인기 강의평가');
  renderReviewList(recentContainer, recentReviews, '최근 강의평가');
}

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

function viewEvaluationDetail(evaluationId) {
  console.log(`평가 ID ${evaluationId} 상세보기`);
  alert(`평가 ${evaluationId} 상세보기 기능은 준비 중입니다.`);
}

function handleWriteReview() {
  console.log('강의평가 작성 페이지로 이동');
  alert('강의평가 작성 페이지로 이동합니다.');
}

function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

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

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

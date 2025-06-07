// lecture-review.js

/**
 * 페이지 초기화 함수
 *  - 인기 강의평가: GET /api/reviews/popular
 *  - 최근 강의평가: GET /api/reviews/recent
 *  - 두 결과를 받아서 각각 #popularReviews, #recentReviews에 렌더링
 */
async function initLectureReviewPage() {
  try {
    const [popRes, recRes] = await Promise.all([
      fetch('/api/reviews/popular'),
      fetch('/api/reviews/recent'),
    ]);

    if (!popRes.ok || !recRes.ok) throw new Error('API 응답 오류');

    const popular = await popRes.json();
    const recent  = await recRes.json();

    renderLectureReviews(popular, recent);
  } catch (err) {
    console.error('강의평가 데이터 로드 실패:', err);
    renderLectureReviews([], []);
  }

  // “강의평가 작성하기” 버튼 클릭 시 이동 (예: 강의 선택 페이지로 이동)
  const writeBtn = document.getElementById('write-review-button');
  if (writeBtn) {
    writeBtn.addEventListener('click', () => {
      // 실제 구현 시: 강의 목록 페이지나 작성 폼으로 이동
      alert('강의평가 작성 페이지로 이동합니다.');
    });
  }
}

/**
 * 실제 렌더링 함수
 * @param {Array} popular - 인기 평가 목록 (각 객체: { id, course_name, rating, review, created_at, user_name, ... })
 * @param {Array} recent  - 최근 평가 목록
 */
function renderLectureReviews(popular, recent) {
  const popEl = document.getElementById('popularReviews');
  const recEl = document.getElementById('recentReviews');
  if (!popEl || !recEl) return;

  popEl.innerHTML = '';
  recEl.innerHTML = '';

  popular.forEach((r) => {
    const item = document.createElement('div');
    item.className = 'evaluation-item';
    item.onclick = () => viewEvaluationDetail(r.id);
    item.innerHTML = `
      <div class="evaluation-header">
        <span class="evaluation-course">${r.course_name || r.course_id}</span>
        <span class="evaluation-rating">${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
      </div>
      <div class="evaluation-review">${r.review || '댓글이 없습니다.'}</div>
      <div class="evaluation-meta">
        <span>${formatDate(r.created_at)}</span>
        <span>${r.user_name || '익명'}</span>
      </div>
    `;
    popEl.appendChild(item);
  });

  recent.forEach((r) => {
    const item = document.createElement('div');
    item.className = 'evaluation-item';
    item.onclick = () => viewEvaluationDetail(r.id);
    item.innerHTML = `
      <div class="evaluation-header">
        <span class="evaluation-course">${r.course_name || r.course_id}</span>
        <span class="evaluation-rating">${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
      </div>
      <div class="evaluation-review">${r.review || '댓글이 없습니다.'}</div>
      <div class="evaluation-meta">
        <span>${formatDate(r.created_at)}</span>
        <span>${r.user_name || '익명'}</span>
      </div>
    `;
    recEl.appendChild(item);
  });
}

/**
 * 평가 상세 보기 (예: 모달 또는 새 페이지)
 */
function viewEvaluationDetail(evalId) {
  alert(`평가 ${evalId} 상세보기는 준비 중입니다.`);
}

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD HH:MM' 형태로 변환
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const dt = new Date(isoString);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

// 전역에 노출
window.initLectureReviewPage = initLectureReviewPage;

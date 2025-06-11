function handleWriteReview() {
  const container = document.getElementById('reviewFormContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="review-form">
      <h3>강의평가 작성</h3>
      <label>강의명: <input type="text" id="inputCourseName" required /></label><br />
      <label>평점 (1~5): <input type="number" id="inputRating" min="1" max="5" required /></label><br />
      <label>리뷰 내용: <textarea id="inputReview" rows="4"></textarea></label><br />
      <label>작성자 이름: <input type="text" id="inputUserName" /></label><br />
      <button onclick="submitReview()">제출</button>
    </div>
  `;
}

async function submitReview() {
  const courseName = document.getElementById('inputCourseName').value.trim();
  const rating = parseInt(document.getElementById('inputRating').value);
  const review = document.getElementById('inputReview').value.trim();
  const userName = document.getElementById('inputUserName').value.trim() || '익명';

  if (!courseName || isNaN(rating) || rating < 1 || rating > 5) {
    alert('강의명과 평점(1~5)은 필수입니다.');
    return;
  }

  try {
    const res = await fetch('/api/reviews/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_name: courseName,
        rating: rating,
        review: review,
        user_name: userName
      })
    });

    if (!res.ok) throw new Error('등록 실패');

    alert('강의평가가 성공적으로 등록되었습니다.');
    document.getElementById('reviewFormContainer').innerHTML = '';
    initLectureReviewPage();
  } catch (err) {
    console.error(err);
    alert('등록 중 오류가 발생했습니다.');
  }
}

// community.js

// community.html이 동적으로 로드될 때 호출됨
window.initCommunityPage = function () {
  renderCommunityPosts();
  setupCommunityEvents();
};

// 게시글 목록 렌더링 함수
function renderCommunityPosts() {
  let posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
  const container = document.getElementById('community-posts');
  if (!container) return;
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>게시글이 없습니다</h3>
        <p>첫 번째 게시글을 작성해보세요.</p>
      </div>`;
    return;
  }
  container.innerHTML = '';
  // 최신 글이 위로 오도록 reverse()
  posts.slice().reverse().forEach(post => {
    const div = document.createElement('div');
    div.className = 'community-post';
    div.innerHTML = `
      <div class="post-header">
        <span class="post-title">${escapeHtml(post.title)}</span>
        <span class="post-date">${post.date || ''}</span>
      </div>
      <div class="post-content">${escapeHtml(post.content).replace(/\n/g, "<br>")}</div>
    `;
    container.appendChild(div);
  });
}

// 커뮤니티 이벤트 바인딩 함수
function setupCommunityEvents() {
  const writeBtn = document.getElementById('write-post-btn');
  if (writeBtn) writeBtn.onclick = () => {
    document.getElementById('community-modal').style.display = 'flex';
  };
  const closeBtn = document.getElementById('close-modal');
  if (closeBtn) closeBtn.onclick = closeModal;
  const cancelBtn = document.getElementById('cancel-post-btn');
  if (cancelBtn) cancelBtn.onclick = closeModal;
  const submitBtn = document.getElementById('submit-post-btn');
  if (submitBtn) submitBtn.onclick = () => {
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    if (!title || !content) {
      alert('제목과 내용을 모두 입력하세요.');
      return;
    }
    let posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    posts.push({
      title,
      content,
      date: new Date().toLocaleString('ko-KR')
    });
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    closeModal();
    renderCommunityPosts();
  };
  // 모달 바깥 클릭 시 닫기
  window.onclick = function(event) {
    const modal = document.getElementById('community-modal');
    if (event.target === modal) modal.style.display = 'none';
  };
}

// 모달 닫기 함수
function closeModal() {
  document.getElementById('community-modal').style.display = 'none';
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
}

// XSS 방지용
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(tag) {
    const charsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return charsToReplace[tag] || tag;
  });
}

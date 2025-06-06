// community.js

/**
 * 페이지 초기화 함수
 *  - 실시간 게시글(GET /api/community/live) 로드 및 렌더링
 *  - 인기 게시글(GET /api/community/hot) 로드 및 렌더링
 */
async function initCommunityPage() {
  try {
    const [liveRes, hotRes] = await Promise.all([
      fetch('/api/community/live'),
      fetch('/api/community/hot')
    ]);

    if (!liveRes.ok || !hotRes.ok) throw new Error('API 응답 오류');

    const livePosts = await liveRes.json();
    const hotPosts  = await hotRes.json();

    renderCommunityPosts(livePosts, hotPosts);
  } catch (err) {
    console.error('커뮤니티 데이터 로드 실패:', err);
    renderCommunityPosts([], []);
  }
}

/**
 * 커뮤니티 게시글 렌더링
 *  - 실시간 게시글 → #livePosts
 *  - 인기 게시글 → #hotPosts
 */
function renderCommunityPosts(livePosts, hotPosts) {
  const liveEl = document.getElementById('livePosts');
  const hotEl  = document.getElementById('hotPosts');
  if (!liveEl || !hotEl) return;

  liveEl.innerHTML = '';
  hotEl.innerHTML  = '';

  livePosts.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.onclick = () => viewPostDetail(p.id);
    item.innerHTML = `
      <div class="post-header">
        <span class="post-category">${p.category}</span>
        <span class="post-date">${p.time}</span>
      </div>
      <div class="post-title">${p.title}</div>
      <div class="post-summary">${p.summary}</div>
      <div style="margin-top:0.5rem; color:#94a3b8; font-size:0.8rem;">
        👍 ${p.likes || 0} 💬 ${p.comments || 0}
      </div>
    `;
    liveEl.appendChild(item);
  });

  hotPosts.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.onclick = () => viewPostDetail(p.id);
    item.innerHTML = `
      <div class="post-header">
        <span class="post-category">${p.category}</span>
        <span class="post-date">HOT</span>
      </div>
      <div class="post-title">${p.title}</div>
      <div class="post-summary">${p.summary}</div>
      <div style="margin-top:0.5rem; color:#94a3b8; font-size:0.8rem;">
        👍 ${p.likes || 0} 💬 ${p.comments || 0}
      </div>
    `;
    hotEl.appendChild(item);
  });
}

/**
 * 게시글 상세 보기(준비 중)
 */
function viewPostDetail(postId) {
  alert(`게시글 ${postId} 상세보기는 준비 중입니다.`);
}

// 외부에서 호출할 수 있도록 전역에 노출
window.initCommunityPage = initCommunityPage;

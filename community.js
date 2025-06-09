// 커뮤니티 게시글 목록(서버에서 불러오기)
async function fetchPosts() {
  // 최신 게시글(최신순 5개)
  const res = await fetch('/api/community/posts?limit=5');
  if (res.ok) {
    const data = await res.json();
    renderLivePosts(data);
  } else {
    renderLivePosts([]);
  }
  // 인기 게시글(좋아요순 3개)
  const hotRes = await fetch('/api/community/posts?sort=likes&limit=3');
  if (hotRes.ok) {
    const data = await hotRes.json();
    renderHotPosts(data);
  } else {
    renderHotPosts([]);
  }
}

// 인기 게시글 렌더링
function renderHotPosts(posts) {
  const el = document.getElementById('hotPosts');
  if (!el) return;
  el.innerHTML = posts.length
    ? posts.map(p => `
      <div class="notice-item">
        <div class="notice-title">${escapeHTML(p.title)}</div>
        <div class="notice-summary">${escapeHTML(p.content)}</div>
        <div class="notice-meta">👍 ${p.likes} · 🕒 ${formatTimeAgo(p.created_at)}</div>
      </div>
    `).join('')
    : `<div style="color:#b6bac2;padding:1.3rem;text-align:center;">아직 인기 게시글이 없습니다.</div>`;
}

// 새 게시글 렌더링
function renderLivePosts(posts) {
  const el = document.getElementById('livePosts');
  if (!el) return;
  el.innerHTML = posts.length
    ? posts.map(p => `
      <div class="notice-item">
        <div class="notice-title">${escapeHTML(p.title)}</div>
        <div class="notice-summary">${escapeHTML(p.content)}</div>
        <div class="notice-meta">🕒 ${formatTimeAgo(p.created_at)} · 👍 ${p.likes}</div>
      </div>
    `).join('')
    : `<div style="color:#b6bac2;padding:1.3rem;text-align:center;">첫 게시글을 작성해보세요!</div>`;
}

// 게시글 등록 폼 이벤트
const form = document.getElementById('writePostForm');
if (form) {
  form.onsubmit = async function(e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    if (!title || !content) return;
    // 서버에 POST 요청
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      alert('게시글이 등록되었습니다!');
      form.reset();
      fetchPosts();
    } else {
      alert('게시글 등록에 실패했습니다.');
    }
  };
}

// XSS 방지
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

// 시간 표시 포맷팅 (예시: "2분 전")
function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  return created.toLocaleDateString();
}

// 페이지 로드시 게시글 불러오기
fetchPosts();

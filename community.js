let postId = 4;
let posts = [
  { id: 1, title: "학식 메뉴 공유해요", content: "오늘 학식 맛있음ㅋㅋ", likes: 12, time: "1시간 전" },
  { id: 2, title: "자취방 정보", content: "근처 원룸 시세 얼마에요?", likes: 9, time: "2시간 전" },
  { id: 3, title: "동아리 모집", content: "운동 동아리 들어오세요~", likes: 7, time: "3시간 전" }
];

function renderPosts() {
  // 인기 게시글 (좋아요 순 상위 3개)
  const hotPostsEl = document.getElementById('hotPosts');
  if (hotPostsEl) {
    let hot = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);
    hotPostsEl.innerHTML = hot.length
      ? hot.map(p => `
        <div class="notice-item">
          <div class="notice-title">${p.title}</div>
          <div class="notice-summary">${p.content}</div>
          <div class="notice-meta">👍 ${p.likes} &nbsp; · &nbsp; ${p.time}</div>
        </div>
      `).join('')
      : `<div style="color:#b6bac2;padding:1.3rem;text-align:center;">아직 인기 게시글이 없습니다.</div>`;
  }
  // 새 게시글 (최신순 상위 5개)
  const livePostsEl = document.getElementById('livePosts');
  if (livePostsEl) {
    let live = [...posts].sort((a, b) => b.id - a.id).slice(0, 5);
    livePostsEl.innerHTML = live.length
      ? live.map(p => `
        <div class="notice-item">
          <div class="notice-title">${p.title}</div>
          <div class="notice-summary">${p.content}</div>
          <div class="notice-meta">🕒 ${p.time} &nbsp; · &nbsp; 👍 ${p.likes}</div>
        </div>
      `).join('')
      : `<div style="color:#b6bac2;padding:1.3rem;text-align:center;">첫 게시글을 작성해보세요!</div>`;
  }
}
renderPosts();

// 새 게시글 작성 폼 이벤트
const form = document.getElementById('writePostForm');
if (form) {
  form.onsubmit = function (e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    if (!title || !content) return;
    posts.unshift({
      id: ++postId,
      title,
      content,
      likes: 0,
      time: "방금 전"
    });
    renderPosts();
    form.reset();
    alert('게시글이 등록되었습니다!');
  };
}

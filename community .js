// =============================================================================
// community.js
// 커뮤니티 페이지 전용 JavaScript (프론트엔드만)
// =============================================================================

// 전역 변수
let realtimePosts = [];
let popularPosts = [];
let currentPost = null;
let comments = [];
let isLoading = false;
let realtimeRefreshInterval = null;

// API 설정 (Node.js + MySQL 백엔드 연동 예정)
const API_BASE_URL = '/api';

// 커뮤니티 페이지 초기화 함수 (index.js에서 호출)
function initCommunityPage() {
  console.log('커뮤니티 페이지 초기화 시작');
  
  // 초기 데이터 로드
  loadRealtimePosts();
  loadPopularPosts('today');
  
  // 30초마다 실시간 게시글 자동 새로고침
  startRealtimeRefresh();
  
  // 모달 외부 클릭 시 닫기 이벤트
  setupModalEvents();
  
  console.log('커뮤니티 페이지 초기화 완료');
}

// 실시간 게시글 로드
async function loadRealtimePosts() {
  const loadingEl = document.getElementById('live-posts-loading');
  const contentEl = document.getElementById('live-posts-content');
  const emptyEl = document.getElementById('live-posts-empty');
  
  if (!loadingEl || !contentEl || !emptyEl) {
    console.error('실시간 게시글 요소를 찾을 수 없습니다');
    return;
  }
  
  // 로딩 상태 표시
  loadingEl.style.display = 'flex';
  contentEl.style.display = 'none';
  emptyEl.style.display = 'none';
  
  try {
    // Node.js + MySQL 백엔드 API 호출
    const response = await fetch(`${API_BASE_URL}/posts/realtime`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    realtimePosts = posts;
    
    // 로딩 숨김
    loadingEl.style.display = 'none';
    
    if (posts && posts.length > 0) {
      renderRealtimePosts(posts);
      contentEl.style.display = 'flex';
      emptyEl.style.display = 'none';
    } else {
      contentEl.style.display = 'none';
      emptyEl.style.display = 'flex';
    }
    
  } catch (error) {
    console.error('실시간 게시글 로드 실패:', error);
    loadingEl.style.display = 'none';
    emptyEl.style.display = 'flex';
  }
}

// 인기 게시글 로드
async function loadPopularPosts(period = 'today') {
  const loadingEl = document.getElementById('hot-posts-loading');
  const contentEl = document.getElementById('hot-posts-content');
  const emptyEl = document.getElementById('hot-posts-empty');
  
  if (!loadingEl || !contentEl || !emptyEl) {
    console.error('인기 게시글 요소를 찾을 수 없습니다');
    return;
  }
  
  // 로딩 상태 표시
  loadingEl.style.display = 'flex';
  contentEl.style.display = 'none';
  emptyEl.style.display = 'none';
  
  try {
    // Node.js + MySQL 백엔드 API 호출
    const response = await fetch(`${API_BASE_URL}/posts/popular?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    popularPosts = posts;
    
    // 로딩 숨김
    loadingEl.style.display = 'none';
    
    if (posts && posts.length > 0) {
      renderPopularPosts(posts);
      contentEl.style.display = 'flex';
      emptyEl.style.display = 'none';
    } else {
      contentEl.style.display = 'none';
      emptyEl.style.display = 'flex';
    }
    
  } catch (error) {
    console.error('인기 게시글 로드 실패:', error);
    loadingEl.style.display = 'none';
    emptyEl.style.display = 'flex';
  }
}

// 실시간 게시글 렌더링
function renderRealtimePosts(posts) {
  const contentEl = document.getElementById('live-posts-content');
  if (!contentEl) return;
  
  contentEl.innerHTML = '';
  
  posts.forEach(post => {
    const postCard = createPostCard(post, false);
    contentEl.appendChild(postCard);
  });
}

// 인기 게시글 렌더링
function renderPopularPosts(posts) {
  const contentEl = document.getElementById('hot-posts-content');
  if (!contentEl) return;
  
  contentEl.innerHTML = '';
  
  posts.forEach((post, index) => {
    const postCard = createPostCard(post, true, index + 1);
    contentEl.appendChild(postCard);
  });
}

// 게시글 카드 생성
function createPostCard(post, isPopular = false, ranking = null) {
  const postCard = document.createElement('div');
  postCard.className = `post-card ${isPopular ? 'popular' : ''}`;
  postCard.onclick = () => openPostDetail(post);
  
  const timeAgo = getTimeAgo(post.created_at);
  
  postCard.innerHTML = `
    <div class="post-header">
      <span class="post-category">${getCategoryName(post.category)}</span>
      <span class="post-time">${timeAgo}</span>
    </div>
    <h4 class="post-title">${escapeHtml(post.title)}</h4>
    <p class="post-preview">${escapeHtml(post.content.substring(0, 100))}...</p>
    <div class="post-meta">
      <div class="post-author">
        <span class="author-avatar">👤</span>
        <span>${escapeHtml(post.author)}</span>
      </div>
      <div class="post-stats">
        <span class="stat-item">
          <span>👁️</span>
          <span>${post.views}</span>
        </span>
        <span class="stat-item">
          <span>❤️</span>
          <span>${post.likes}</span>
        </span>
        <span class="stat-item">
          <span>💬</span>
          <span>${post.comments_count}</span>
        </span>
      </div>
    </div>
  `;
  
  return postCard;
}

// 게시글 상세보기 모달 열기
async function openPostDetail(post) {
  const modal = document.getElementById('post-detail-modal');
  if (!modal) return;
  
  currentPost = post;
  
  // 모달 내용 업데이트
  document.getElementById('detail-post-title').textContent = post.title;
  document.getElementById('detail-post-author').textContent = post.author;
  document.getElementById('detail-post-date').textContent = formatDate(post.created_at);
  document.getElementById('detail-post-views').textContent = post.views;
  document.getElementById('detail-post-likes').textContent = post.likes;
  document.getElementById('detail-post-comments').textContent = post.comments_count;
  document.getElementById('detail-post-content').textContent = post.content;
  
  // 조회수 증가 API 호출
  try {
    await fetch(`${API_BASE_URL}/posts/${post.id}/view`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('조회수 증가 실패:', error);
  }
  
  // 댓글 로드
  loadComments(post.id);
  
  // 모달 표시
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 게시글 상세보기 모달 닫기
function closePostDetailModal() {
  const modal = document.getElementById('post-detail-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = '';
  currentPost = null;
  comments = [];
}

// 게시글 작성 모달 열기
function openWritePostModal() {
  const modal = document.getElementById('write-post-modal');
  if (!modal) return;
  
  // 폼 초기화
  document.getElementById('write-post-form').reset();
  
  // 모달 표시
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // 제목 입력란에 포커스
  setTimeout(() => {
    document.getElementById('post-title').focus();
  }, 300);
}

// 게시글 작성 모달 닫기
function closeWritePostModal() {
  const modal = document.getElementById('write-post-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// 게시글 작성 제출
async function submitPost(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const postData = {
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category')
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    showToast('게시글이 성공적으로 작성되었습니다!', 'success');
    closeWritePostModal();
    
    // 실시간 게시글 새로고침
    loadRealtimePosts();
    
  } catch (error) {
    console.error('게시글 작성 실패:', error);
    showToast('게시글 작성에 실패했습니다. 다시 시도해주세요.', 'error');
  }
}

// 댓글 로드
async function loadComments(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const commentsData = await response.json();
    comments = commentsData;
    
    renderComments(commentsData);
    
  } catch (error) {
    console.error('댓글 로드 실패:', error);
    document.getElementById('comments-list').innerHTML = '<p style="color: #94a3b8;">댓글을 불러올 수 없습니다.</p>';
  }
}

// 댓글 렌더링
function renderComments(commentsData) {
  const commentsList = document.getElementById('comments-list');
  const commentsCount = document.getElementById('comments-count');
  
  if (!commentsList || !commentsCount) return;
  
  commentsCount.textContent = commentsData.length;
  commentsList.innerHTML = '';
  
  if (commentsData.length === 0) {
    commentsList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 2rem;">첫 번째 댓글을 작성해보세요!</p>';
    return;
  }
  
  commentsData.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    
    commentItem.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">
          <span class="author-avatar">👤</span>
          <span>${escapeHtml(comment.author)}</span>
        </div>
        <span class="comment-time">${getTimeAgo(comment.created_at)}</span>
      </div>
      <div class="comment-content">${escapeHtml(comment.content)}</div>
      <div class="comment-actions">
        <span class="comment-action" onclick="likeComment(${comment.id})">좋아요</span>
        <span class="comment-action" onclick="replyComment(${comment.id})">답글</span>
      </div>
    `;
    
    commentsList.appendChild(commentItem);
  });
}

// 댓글 작성 제출
async function submitComment(event) {
  event.preventDefault();
  
  if (!currentPost) return;
  
  const commentInput = document.getElementById('comment-input');
  const content = commentInput.value.trim();
  
  if (!content) {
    showToast('댓글 내용을 입력해주세요.', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${currentPost.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    commentInput.value = '';
    showToast('댓글이 작성되었습니다!', 'success');
    
    // 댓글 다시 로드
    loadComments(currentPost.id);
    
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    showToast('댓글 작성에 실패했습니다. 다시 시도해주세요.', 'error');
  }
}

// 좋아요 토글
async function toggleLike() {
  if (!currentPost) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${currentPost.id}/like`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // UI 업데이트
    document.getElementById('detail-post-likes').textContent = result.likes;
    showToast('좋아요가 반영되었습니다!', 'success');
    
  } catch (error) {
    console.error('좋아요 실패:', error);
    showToast('좋아요 처리에 실패했습니다.', 'error');
  }
}

// 게시글 공유
function sharePost() {
  if (!currentPost) return;
  
  const url = `${window.location.origin}/community/post/${currentPost.id}`;
  
  if (navigator.share) {
    navigator.share({
      title: currentPost.title,
      url: url
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('링크가 클립보드에 복사되었습니다!', 'success');
    }).catch(() => {
      showToast('링크 복사에 실패했습니다.', 'error');
    });
  }
}

// 게시글 신고
function reportPost() {
  if (!currentPost) return;
  
  if (confirm('이 게시글을 신고하시겠습니까?')) {
    // 신고 API 호출
    fetch(`${API_BASE_URL}/posts/${currentPost.id}/report`, {
      method: 'POST'
    }).then(() => {
      showToast('신고가 접수되었습니다.', 'success');
    }).catch(() => {
      showToast('신고 처리에 실패했습니다.', 'error');
    });
  }
}

// 실시간 새로고침 시작
function startRealtimeRefresh() {
  if (realtimeRefreshInterval) {
    clearInterval(realtimeRefreshInterval);
  }
  
  realtimeRefreshInterval = setInterval(() => {
    loadRealtimePosts();
  }, 30000); // 30초마다
}

// 실시간 새로고침 중지
function stopRealtimeRefresh() {
  if (realtimeRefreshInterval) {
    clearInterval(realtimeRefreshInterval);
    realtimeRefreshInterval = null;
  }
}

// 모달 이벤트 설정
function setupModalEvents() {
  // 모달 외부 클릭 시 닫기
  document.addEventListener('click', (event) => {
    const writeModal = document.getElementById('write-post-modal');
    const detailModal = document.getElementById('post-detail-modal');
    
    if (event.target === writeModal) {
      closeWritePostModal();
    }
    
    if (event.target === detailModal) {
      closePostDetailModal();
    }
  });
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeWritePostModal();
      closePostDetailModal();
    }
  });
}

// 토스트 알림 표시
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notification');
  const messageEl = document.getElementById('toast-message');
  
  if (!toast || !messageEl) return;
  
  messageEl.textContent = message;
  toast.className = `toast-notification ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// 유틸리티 함수들
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  return formatDate(dateString);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getCategoryName(category) {
  const categories = {
    'general': '일반',
    'question': '질문',
    'info': '정보',
    'event': '이벤트'
  };
  return categories[category] || '일반';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  stopRealtimeRefresh();
});

// 전역 함수로 내보내기 (window 객체에 추가)
window.initCommunityPage = initCommunityPage;
window.loadRealtimePosts = loadRealtimePosts;
window.loadPopularPosts = loadPopularPosts;
window.openWritePostModal = openWritePostModal;
window.closeWritePostModal = closeWritePostModal;
window.submitPost = submitPost;
window.closePostDetailModal = closePostDetailModal;
window.submitComment = submitComment;
window.toggleLike = toggleLike;
window.sharePost = sharePost;
window.reportPost = reportPost;
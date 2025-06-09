// community.js - 커뮤니티 페이지 JavaScript

// 전역 변수
let currentCategory = 'all';
let currentPage = 1;
let totalPages = 1;
let currentPostId = null;
let isLoading = false;

// 페이지 초기화
function initCommunityPage() {
  console.log('커뮤니티 페이지 초기화 중...');
  loadCommunityStats();
  loadLivePosts();
  loadHotPosts();
  loadPosts(currentCategory, currentPage);
  
  // 이벤트 리스너 등록
  setupEventListeners();
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePostModal();
    }
  });
  
  // 모달 배경 클릭 시 닫기
  const modal = document.getElementById('post-detail-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePostModal();
      }
    });
  }
}

// ========== 데이터 로드 함수들 ==========

// 커뮤니티 통계 로드
async function loadCommunityStats() {
  try {
    const response = await fetch('/api/community/stats');
    if (!response.ok) throw new Error('통계 데이터 로드 실패');
    
    const stats = await response.json();
    
    // 통계 업데이트
    updateElement('total-posts-count', stats.totalPosts || 0);
    updateElement('active-users-count', stats.activeUsers || 0);
    updateElement('total-comments-count', stats.totalComments || 0);
    updateElement('hot-posts-count', stats.hotPosts || 0);
    
    updateElement('new-posts-today', `오늘 ${stats.newPostsToday || 0}개`);
    updateElement('active-users-today', `온라인 ${stats.onlineUsers || 0}명`);
    updateElement('new-comments-today', `오늘 ${stats.newCommentsToday || 0}개`);
    
  } catch (error) {
    console.error('커뮤니티 통계 로드 오류:', error);
    showMessage('통계 데이터를 불러올 수 없습니다', 'error');
  }
}

// 실시간 게시물 로드
async function loadLivePosts() {
  const container = document.getElementById('live-posts-content');
  
  try {
    showLoading(container);
    const response = await fetch('/api/community/posts/live');
    if (!response.ok) throw new Error('실시간 게시물 로드 실패');
    
    const posts = await response.json();
    renderPostsInCard(container, posts);
    
  } catch (error) {
    console.error('실시간 게시물 로드 오류:', error);
    showError(container, '실시간 게시물을 불러올 수 없습니다');
  }
}

// 인기 게시물 로드
async function loadHotPosts() {
  const container = document.getElementById('hot-posts-content');
  
  try {
    showLoading(container);
    const response = await fetch('/api/community/posts/hot');
    if (!response.ok) throw new Error('인기 게시물 로드 실패');
    
    const posts = await response.json();
    renderPostsInCard(container, posts);
    
  } catch (error) {
    console.error('인기 게시물 로드 오류:', error);
    showError(container, '인기 게시물을 불러올 수 없습니다');
  }
}

// 카테고리별 게시물 로드
async function loadPosts(category = 'all', page = 1) {
  if (isLoading) return;
  
  const container = document.getElementById('posts-list');
  isLoading = true;
  
  try {
    showLoading(container);
    
    const url = `/api/community/posts?category=${category}&page=${page}&limit=10`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('게시물 로드 실패');
    
    const data = await response.json();
    renderPostsList(container, data.posts);
    updatePagination(data.currentPage, data.totalPages);
    
    currentCategory = category;
    currentPage = page;
    totalPages = data.totalPages;
    
  } catch (error) {
    console.error('게시물 로드 오류:', error);
    showError(container, '게시물을 불러올 수 없습니다');
  } finally {
    isLoading = false;
  }
}

// ========== 렌더링 함수들 ==========

// 카드 내 게시물 렌더링
function renderPostsInCard(container, posts) {
  if (!posts || posts.length === 0) {
    showEmpty(container, '게시물이 없습니다', '첫 번째 게시물을 작성해보세요!');
    return;
  }

  container.innerHTML = '';
  posts.slice(0, 3).forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'notice-item';
    postElement.onclick = () => openPostModal(post.id);
    
    postElement.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${getCategoryName(post.category)}</span>
        <span class="notice-date">${formatTimeAgo(post.createdAt)}</span>
      </div>
      <div class="notice-title">${escapeHtml(post.title)}</div>
      <div class="notice-summary">${escapeHtml(post.content.slice(0, 100))}${post.content.length > 100 ? '...' : ''}</div>
      <div style="margin-top:0.5rem; color:#3b82f6; font-size:0.9rem; font-weight:600;">
        👤 ${escapeHtml(post.author)} | 👍 ${post.likes || 0} | 💬 ${post.comments || 0}
      </div>
    `;
    
    container.appendChild(postElement);
  });
}

// 게시물 목록 렌더링
function renderPostsList(container, posts) {
  if (!posts || posts.length === 0) {
    showEmpty(container, '게시물이 없습니다', '새로운 게시물을 작성해보세요!');
    return;
  }

  container.innerHTML = '';
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.onclick = () => openPostModal(post.id);
    
    postElement.innerHTML = `
      <div class="post-header">
        <span class="post-category">${getCategoryName(post.category)}</span>
        <span class="post-date">${formatTimeAgo(post.createdAt)}</span>
      </div>
      <div class="post-title">${escapeHtml(post.title)}</div>
      <div class="post-summary">${escapeHtml(post.content.slice(0, 150))}${post.content.length > 150 ? '...' : ''}</div>
      <div class="post-meta">
        <span class="post-author">👤 ${escapeHtml(post.author)}</span>
        <div class="post-stats">
          <span>👍 ${post.likes || 0}</span>
          <span>💬 ${post.comments || 0}</span>
          <span>👀 ${post.views || 0}</span>
        </div>
      </div>
    `;
    
    container.appendChild(postElement);
  });
}

// 페이지네이션 업데이트
function updatePagination(currentPage, totalPages) {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageNumbers = document.getElementById('page-numbers');
  
  // 이전/다음 버튼 상태
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  
  // 페이지 번호 생성
  pageNumbers.innerHTML = '';
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => goToPage(i);
    pageNumbers.appendChild(pageBtn);
  }
}

// ========== 이벤트 핸들러 함수들 ==========

// 카테고리 선택
function selectCategory(category) {
  // 탭 활성화 상태 변경
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-category="${category}"]`).classList.add('active');
  
  // 게시물 로드
  loadPosts(category, 1);
}

// 페이지 이동
function goToPage(page) {
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    loadPosts(currentCategory, page);
  }
}

function goToPrevPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function goToNextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

// 새로고침 함수들
function refreshLivePosts() {
  loadLivePosts();
  showMessage('실시간 게시물을 새로고침했습니다', 'success');
}

function refreshHotPosts() {
  loadHotPosts();
  showMessage('인기 게시물을 새로고침했습니다', 'success');
}

function showAllPosts() {
  selectCategory('all');
}

function showHotPosts() {
  selectCategory('all');
  // 추후 정렬 옵션 추가 가능
}

// ========== 게시물 작성 관련 함수들 ==========

// 게시물 작성
async function submitPost() {
  const category = document.getElementById('post-category').value;
  const title = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-content').value.trim();
  const tags = document.getElementById('post-tags').value.trim();
  
  // 유효성 검사
  if (!category) {
    showMessage('카테고리를 선택해주세요', 'error');
    return;
  }
  
  if (!title) {
    showMessage('제목을 입력해주세요', 'error');
    return;
  }
  
  if (!content) {
    showMessage('내용을 입력해주세요', 'error');
    return;
  }
  
  // 로그인 확인
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다', 'error');
    return;
  }
  
  try {
    const postData = {
      category,
      title,
      content,
      tags: tags.split('#').filter(tag => tag.trim()).map(tag => tag.trim()),
      author: currentUser
    };
    
    const response = await fetch('/api/community/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) throw new Error('게시물 작성 실패');
    
    const result = await response.json();
    showMessage('게시물이 성공적으로 작성되었습니다', 'success');
    
    // 폼 초기화
    clearPostForm();
    
    // 게시물 목록 새로고침
    loadPosts(currentCategory, 1);
    loadLivePosts();
    loadCommunityStats();
    
  } catch (error) {
    console.error('게시물 작성 오류:', error);
    showMessage('게시물 작성 중 오류가 발생했습니다', 'error');
  }
}

// 게시물 폼 초기화
function clearPostForm() {
  document.getElementById('post-category').value = '';
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  document.getElementById('post-tags').value = '';
}

// ========== 게시물 상세보기 모달 관련 함수들 ==========

// 게시물 상세보기 모달 열기
async function openPostModal(postId) {
  currentPostId = postId;
  const modal = document.getElementById('post-detail-modal');
  
  try {
    // 로딩 상태 표시
    showModalLoading();
    modal.style.display = 'block';
    
    // 게시물 데이터 로드
    const response = await fetch(`/api/community/posts/${postId}`);
    if (!response.ok) throw new Error('게시물 로드 실패');
    
    const post = await response.json();
    renderPostModal(post);
    
    // 댓글 로드
    loadComments(postId);
    
    // 조회수 증가
    incrementViews(postId);
    
  } catch (error) {
    console.error('게시물 로드 오류:', error);
    showMessage('게시물을 불러올 수 없습니다', 'error');
    closePostModal();
  }
}

// 모달 내용 렌더링
function renderPostModal(post) {
  document.getElementById('modal-post-title').textContent = post.title;
  document.getElementById('modal-post-category').textContent = getCategoryName(post.category);
  document.getElementById('modal-post-author').textContent = `👤 ${post.author}`;
  document.getElementById('modal-post-date').textContent = `📅 ${formatDateTime(post.createdAt)}`;
  document.getElementById('modal-post-views').textContent = `👀 ${post.views || 0}`;
  document.getElementById('modal-post-content').textContent = post.content;
  
  // 태그 렌더링
  const tagsContainer = document.getElementById('modal-post-tags');
  tagsContainer.innerHTML = '';
  if (post.tags && post.tags.length > 0) {
    post.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'post-tag';
      tagElement.textContent = `#${tag}`;
      tagsContainer.appendChild(tagElement);
    });
  }
  
  // 좋아요 수 업데이트
  document.getElementById('like-count').textContent = post.likes || 0;
  
  // 좋아요 상태 확인 (로그인한 사용자의 경우)
  checkLikeStatus(post.id);
}

// 모달 로딩 상태 표시
function showModalLoading() {
  document.getElementById('modal-post-title').textContent = '로딩 중...';
  document.getElementById('modal-post-content').innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <span style="margin-left: 0.5rem;">게시물을 불러오는 중...</span>
    </div>
  `;
}

// 게시물 모달 닫기
function closePostModal() {
  const modal = document.getElementById('post-detail-modal');
  modal.style.display = 'none';
  currentPostId = null;
}

// ========== 댓글 관련 함수들 ==========

// 댓글 로드
async function loadComments(postId) {
  const container = document.getElementById('comments-list');
  
  try {
    showLoading(container);
    
    const response = await fetch(`/api/community/posts/${postId}/comments`);
    if (!response.ok) throw new Error('댓글 로드 실패');
    
    const comments = await response.json();
    renderComments(container, comments);
    
    // 댓글 수 업데이트
    document.getElementById('comments-count').textContent = comments.length;
    
  } catch (error) {
    console.error('댓글 로드 오류:', error);
    showError(container, '댓글을 불러올 수 없습니다');
  }
}

// 댓글 렌더링
function renderComments(container, comments) {
  if (!comments || comments.length === 0) {
    showEmpty(container, '댓글이 없습니다', '첫 번째 댓글을 작성해보세요!');
    return;
  }

  container.innerHTML = '';
  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    
    commentElement.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${escapeHtml(comment.author)}</span>
        <span class="comment-date">${formatTimeAgo(comment.createdAt)}</span>
      </div>
      <div class="comment-content">${escapeHtml(comment.content)}</div>
    `;
    
    container.appendChild(commentElement);
  });
}

// 댓글 작성
async function submitComment() {
  const content = document.getElementById('comment-input').value.trim();
  
  if (!content) {
    showMessage('댓글 내용을 입력해주세요', 'error');
    return;
  }
  
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다', 'error');
    return;
  }
  
  if (!currentPostId) {
    showMessage('오류가 발생했습니다', 'error');
    return;
  }
  
  try {
    const commentData = {
      content,
      author: currentUser,
      postId: currentPostId
    };
    
    const response = await fetch(`/api/community/posts/${currentPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });
    
    if (!response.ok) throw new Error('댓글 작성 실패');
    
    showMessage('댓글이 작성되었습니다', 'success');
    
    // 댓글 입력창 초기화
    document.getElementById('comment-input').value = '';
    
    // 댓글 목록 새로고침
    loadComments(currentPostId);
    
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    showMessage('댓글 작성 중 오류가 발생했습니다', 'error');
  }
}

// ========== 게시물 액션 함수들 ==========

// 좋아요 토글
async function likePost() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다', 'error');
    return;
  }
  
  if (!currentPostId) return;
  
  try {
    const response = await fetch(`/api/community/posts/${currentPostId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: currentUser })
    });
    
    if (!response.ok) throw new Error('좋아요 처리 실패');
    
    const result = await response.json();
    
    // UI 업데이트
    document.getElementById('like-count').textContent = result.likes;
    document.getElementById('like-icon').textContent = result.liked ? '❤️' : '👍';
    
    showMessage(result.liked ? '좋아요!' : '좋아요 취소', 'success');
    
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    showMessage('좋아요 처리 중 오류가 발생했습니다', 'error');
  }
}

// 좋아요 상태 확인
async function checkLikeStatus(postId) {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) return;
  
  try {
    const response = await fetch(`/api/community/posts/${postId}/like-status?userId=${currentUser}`);
    if (response.ok) {
      const result = await response.json();
      document.getElementById('like-icon').textContent = result.liked ? '❤️' : '👍';
    }
  } catch (error) {
    console.error('좋아요 상태 확인 오류:', error);
  }
}

// 게시물 공유
function sharePost() {
  if (!currentPostId) return;
  
  const url = `${window.location.origin}/community/post/${currentPostId}`;
  
  if (navigator.share) {
    navigator.share({
      title: document.getElementById('modal-post-title').textContent,
      url: url
    }).catch(console.error);
  } else {
    // 클립보드에 복사
    navigator.clipboard.writeText(url).then(() => {
      showMessage('게시물 링크가 클립보드에 복사되었습니다', 'success');
    }).catch(() => {
      showMessage('링크 복사에 실패했습니다', 'error');
    });
  }
}

// 게시물 신고
function reportPost() {
  const currentUser = localStorage.getItem('currentLoggedInUser');
  if (!currentUser) {
    showMessage('로그인이 필요합니다', 'error');
    return;
  }
  
  if (confirm('이 게시물을 신고하시겠습니까?')) {
    // 실제 구현에서는 신고 모달을 띄우거나 API를 호출
    showMessage('신고가 접수되었습니다', 'success');
  }
}

// 조회수 증가
async function incrementViews(postId) {
  try {
    await fetch(`/api/community/posts/${postId}/view`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('조회수 업데이트 오류:', error);
  }
}

// ========== 유틸리티 함수들 ==========

// 엘리먼트 내용 업데이트
function updateElement(id, content) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = content;
  }
}

// 로딩 상태 표시
function showLoading(container) {
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <span style="margin-left: 0.5rem;">로딩 중...</span>
    </div>
  `;
}

// 에러 상태 표시
function showError(container, message) {
  container.innerHTML = `
    <div class="error-state">
      <h4>⚠️ 오류 발생</h4>
      <p>${message}</p>
    </div>
  `;
}

// 빈 상태 표시
function showEmpty(container, title, description) {
  container.innerHTML = `
    <div class="empty-state">
      <h4>📝 ${title}</h4>
      <p>${description}</p>
    </div>
  `;
}

// 카테고리 이름 변환
function getCategoryName(category) {
  const categoryNames = {
    'general': '일반',
    'study': '스터디',
    'club': '동아리',
    'event': '이벤트',
    'question': '질문',
    'notice': '공지'
  };
  return categoryNames[category] || '기타';
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 시간 전 형식으로 변환
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
}

// 날짜/시간 형식으로 변환
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
}

// 메시지 표시 (기존 showMessage 함수 사용)
function showMessage(message, type = 'info') {
  // 기존 index.js의 showMessage 함수 호출
  if (window.showMessage) {
    window.showMessage(message, type);
  } else {
    alert(message);
  }
}

// 전역으로 노출 (SPA에서 사용하기 위해)
window.initCommunityPage = initCommunityPage;
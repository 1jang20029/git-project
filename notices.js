// notices.js

/**
 * 페이지 초기화 함수
 *  - 공지 목록: GET /api/notifications
 *  - 각 공지를 #noticesList에 렌더링
 */
async function initNoticesPage() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('API 응답 오류');
    const notices = await res.json();
    renderNotices(notices);
  } catch (err) {
    console.error('공지사항 데이터 로드 실패:', err);
    renderNotices([]);
  }
}

/**
 * 공지사항 렌더링
 * @param {Array} notices - [{ id, title, content, category_name, is_emergency, scope, published_at, created_by_name, ... }, …]
 */
function renderNotices(notices) {
  const container = document.getElementById('noticesList');
  if (!container) return;
  container.innerHTML = '';

  notices.forEach((n) => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.onclick = () => viewNoticeDetail(n.id);

    // “요약”은 content의 앞부분(100자)만 잘라서 표시
    const summary = n.content.length > 100 ? n.content.slice(0, 100) + '…' : n.content;

    item.innerHTML = `
      <div class="notice-header">
        <span class="notice-category">${n.category_name || '일반'}</span>
        <span class="notice-date">${formatDate(n.published_at)}</span>
      </div>
      <div class="notice-title">${n.title}</div>
      <div class="notice-summary">${summary}</div>
      <div class="notice-meta">
        <span>${n.is_emergency ? '긴급' : ''}</span>
        <span>${n.scope === 'department' ? '학과공지' : '전체공지'}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

/**
 * 공지 상세 보기 (모달 등)
 */
function viewNoticeDetail(noticeId) {
  alert(`공지 ${noticeId} 상세보기는 준비 중입니다.`);
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
window.initNoticesPage = initNoticesPage;

// buildings.js

/**
 * 페이지가 SPA로 로드될 때 initBuildingsPage() 를 호출하기 위해
 * window 객체에 등록합니다.
 */
function initBuildingsPage() {
  const listEl = document.getElementById('building-list');
  // 로딩 표시
  listEl.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <span>건물 정보를 불러오는 중...</span>
    </div>
  `;

  // 백엔드 API 호출 (Node.js + MySQL)
  fetch('/api/buildings')
    .then(res => {
      if (!res.ok) throw new Error('API 응답 오류');
      return res.json();
    })
    .then(buildings => {
      if (!buildings.length) {
        listEl.innerHTML = `
          <div class="empty-state">
            <h3>등록된 건물이 없습니다</h3>
          </div>
        `;
        return;
      }
      // 데이터가 있으면 카드 형태로 렌더링
      listEl.innerHTML = '';
      buildings.forEach(b => {
        const card = document.createElement('div');
        card.className = 'building-card';
        card.onclick = () => showBuildingDetail(b.id);
        card.innerHTML = `
          <h3 class="building-name">${b.name}</h3>
          <p class="building-desc">${b.description}</p>
        `;
        listEl.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      listEl.innerHTML = `
        <div class="error-fallback">
          <h3>⚠️ 오류 발생</h3>
          <p>건물 정보를 불러올 수 없습니다</p>
        </div>
      `;
    });
}

/**
 * 사용자가 카드 클릭 시 호출됩니다.
 * 상세 페이지로 이동하거나 모달을 띄우는 로직을 구현하세요.
 */
function showBuildingDetail(buildingId) {
  // 예시: alert 대신 실제 상세 뷰로 라우팅하세요.
  alert(`건물 상세 (ID: ${buildingId}) 로 이동`);
}

// SPA에서 fragment 로드 후 initBuildingsPage 호출을 위해
window.initBuildingsPage = initBuildingsPage;

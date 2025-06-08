// buildings.js

// 0) 이 페이지 전용 CSS가 아직 로드되지 않았다면 동적으로 삽입
(function() {
  if (!document.getElementById('buildings-css')) {
    const link = document.createElement('link');
    link.id = 'buildings-css';
    link.rel = 'stylesheet';
    link.href = 'buildings.css';
    document.head.appendChild(link);
  }
})();

// 1) SPA에서 이 페이지가 보일 때 호출되는 초기화 함수
window.initBuildingsPage = async function() {
  await loadBuildingsPage();
};

// 2) 백엔드에서 건물 데이터를 불러와 화면에 렌더
async function loadBuildingsPage() {
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildingGrid(buildings);
    initializeBuildingsMap(buildings);
  } catch (err) {
    console.error('건물 페이지 로드 실패:', err);
    document.getElementById('buildingGrid').innerHTML =
      '<div style="padding:2rem; text-align:center;">건물 정보를 불러올 수 없습니다.</div>';
  }
}

// 3) 그리드에 카드 렌더링
function renderBuildingGrid(buildings) {
  const grid = document.getElementById('buildingGrid');
  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" onclick="zoomToBuilding(${b.position.lat}, ${b.position.lng})">
          📍 지도에서 보기
        </button>
        <button class="btn btn-outline" onclick="getDirections(${b.position.lat}, ${b.position.lng})">
          🧭 길찾기
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 4) 네이버 지도 초기화 및 마커 추가
function initializeBuildingsMap(buildings) {
  const container = document.getElementById('buildingsMap');

  // ─── 인증 실패 감지 ───
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API 인증 실패 또는 로드 실패');
    container.innerHTML = `
      <div class="error-fallback">
        <h3>⚠️ 오류 발생</h3>
        <p>네이버 지도 Open API 인증이 실패했습니다.</p>
      </div>
    `;
    return;
  }
  // ──────────────────────

  const center = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
  const map = new naver.maps.Map(container, {
    center,
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    zoomControl: false,
    logoControl: false,
    mapDataControl: false,
    scaleControl: false,
  });
  window._buildingsMap = map;

  buildings.forEach(b => {
    const pos = new naver.maps.LatLng(b.position.lat, b.position.lng);
    const marker = new naver.maps.Marker({ position: pos, map, title: b.name });
    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="
          padding:10px;
          background:#1e293b;
          color:white;
          border-radius:8px;
          border:1px solid #3b82f6;
        ">
          <strong>${b.name}</strong><br>
          <span>${b.description}</span>
        </div>
      `,
      backgroundColor: 'transparent',
      borderWidth: 0,
      anchorSize: new naver.maps.Size(0, 0),
    });
    naver.maps.Event.addListener(marker, 'click', () => {
      infoWindow.open(map, marker);
    });
  });
}

// 5) “지도에서 보기” 버튼: 해당 위치으로 줌
function zoomToBuilding(lat, lng) {
  if (window._buildingsMap) {
    const pos = new naver.maps.LatLng(lat, lng);
    window._buildingsMap.setCenter(pos);
    window._buildingsMap.setZoom(18);
  }
}

// 6) “길찾기” 버튼: 새 탭으로 네이버 지도 길찾기 화면 열기
function getDirections(lat, lng) {
  window.open(`https://map.naver.com/v5/directions/-/${lat},${lng}`, '_blank');
}

// 7) 오버레이 컨트롤: 확대/축소/초기화/내 위치
function buildingsZoomIn()    { if (window._buildingsMap) window._buildingsMap.setZoom(window._buildingsMap.getZoom() + 1); }
function buildingsZoomOut()   { if (window._buildingsMap) window._buildingsMap.setZoom(window._buildingsMap.getZoom() - 1); }
function buildingsResetView() {
  if (window._buildingsMap) {
    const home = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    window._buildingsMap.setCenter(home);
    window._buildingsMap.setZoom(16);
  }
}
function buildingsTrackUser() {
  if (!navigator.geolocation) {
    alert('위치 서비스를 지원하지 않습니다');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      const userPos = new naver.maps.LatLng(lat, lng);
      new naver.maps.Marker({
        position: userPos,
        map: window._buildingsMap,
        icon: {
          content: '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>',
          anchor: new naver.maps.Point(10, 10)
        }
      });
      window._buildingsMap.setCenter(userPos);
      window._buildingsMap.setZoom(17);
    },
    err => {
      alert('위치를 가져올 수 없습니다: ' + err.message);
    }
  );
}

// buildings.js
function initBuildingsPage() {
  initBuildingsMap();
  loadBuildingsData();
}

function initBuildingsMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    return;
  }
  const mapContainer = document.getElementById('buildingsMap');
  const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
  const mapOptions = {
    center: yeonsung,
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    zoomControl: false,
    logoControl: false,
    mapDataControl: false,
    scaleControl: false,
  };
  window.naverMap = new naver.maps.Map(mapContainer, mapOptions);
}

async function loadBuildingsData() {
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildings(buildings);
    addMapMarkers(buildings);
  } catch (err) {
    console.error('건물 데이터 로드 실패:', err);
  }
}

function renderBuildings(buildings) {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;
  grid.innerHTML = '';
  buildings.forEach((b) => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" onclick="showBuildingOnMap('${b.id}')">
          📍 지도에서 보기
        </button>
        <button class="btn btn-outline" onclick="getBuildingDirections('${b.id}')">
          🧭 길찾기
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addMapMarkers(buildings) {
  if (!window.naverMap) return;
  // 기존 마커 삭제
  if (window.mapMarkers) {
    window.mapMarkers.forEach(m => m.setMap(null));
  }
  if (window.infoWindows) {
    window.infoWindows.forEach(iw => iw.close());
  }
  window.mapMarkers = [];
  window.infoWindows = [];

  buildings.forEach((b) => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.position.lat, b.position.lng),
      map: window.naverMap,
      title: b.name,
    });
    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; background: #1e293b; color: white; border-radius: 8px; border: 1px solid #3b82f6;">
          <strong style="color: #3b82f6;">${b.name}</strong><br>
          <span style="color: #94a3b8;">${b.description}</span>
        </div>
      `,
      backgroundColor: 'transparent',
      borderWidth: 0,
      anchorSize: new naver.maps.Size(0, 0),
    });
    naver.maps.Event.addListener(marker, 'click', () => {
      window.infoWindows.forEach(iw => iw.close());
      infoWindow.open(window.naverMap, marker);
    });
    window.mapMarkers.push(marker);
    window.infoWindows.push(infoWindow);
  });
}

function showBuildingOnMap(buildingId) {
  // 메인 index.js의 showBuildingOnMap 함수가 호출됨
  window.showBuildingOnMap(buildingId);
}

function getBuildingDirections(buildingId) {
  window.showMessage('길찾기 기능은 준비 중입니다', 'info', '');
}

// 1) 페이지가 새로 삽입된 직후 바로 initBuildingsPage가 호출됨
document.addEventListener('DOMContentLoaded', () => {
  // 이 페이지는 동적으로 삽입되므로, 실제 호출은 parent scope에서 initBuildingsPage()
});

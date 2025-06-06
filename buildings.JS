let buildingsMap;
let buildingMarkers = [];
let buildingInfoWindows = [];

async function initBuildingsPage() {
  initializeNaverMap();
  await loadBuildingData();
  attachBuildingActions();
}

function initializeNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API 로드 실패');
    return;
  }

  const mapContainer = document.getElementById('buildingsMap');
  if (!mapContainer) return;

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
  buildingsMap = new naver.maps.Map(mapContainer, mapOptions);

  document.getElementById('buildings-zoom-in').addEventListener('click', () => {
    if (buildingsMap) buildingsMap.setZoom(buildingsMap.getZoom() + 1);
  });
  document.getElementById('buildings-zoom-out').addEventListener('click', () => {
    if (buildingsMap) buildingsMap.setZoom(buildingsMap.getZoom() - 1);
  });
  document.getElementById('buildings-reset').addEventListener('click', () => {
    if (buildingsMap) {
      buildingsMap.setCenter(yeonsung);
      buildingsMap.setZoom(16);
    }
  });
  document.getElementById('buildings-track-user').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('위치 서비스를 지원하지 않습니다');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        new naver.maps.Marker({
          position: userPos,
          map: buildingsMap,
          icon: {
            content:
              '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
            anchor: new naver.maps.Point(10, 10),
          },
        });
        buildingsMap.setCenter(userPos);
        buildingsMap.setZoom(17);
      },
      (err) => {
        console.error(err);
        alert('위치 정보를 가져올 수 없습니다');
      }
    );
  });
}

async function loadBuildingData() {
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildingCards(buildings);
    addMapMarkers(buildings);
  } catch (error) {
    console.error('건물 정보 로드 실패:', error);
    renderBuildingCards([]);
  }
}

function renderBuildingCards(buildings) {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;
  grid.innerHTML = '';

  buildings.forEach((b) => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.setAttribute('data-id', b.id);
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" data-action="viewOnMap" data-id="${b.id}">📍 지도에서 보기</button>
        <button class="btn btn-outline" data-action="getDirections" data-id="${b.id}">🧭 길찾기</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addMapMarkers(buildings) {
  if (!buildingsMap) return;
  buildingMarkers.forEach((m) => m.setMap(null));
  buildingInfoWindows.forEach((iw) => iw.close());
  buildingMarkers = [];
  buildingInfoWindows = [];

  buildings.forEach((b) => {
    if (!b.position || !b.position.lat || !b.position.lng) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.position.lat, b.position.lng),
      map: buildingsMap,
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
      buildingInfoWindows.forEach((iw) => iw.close());
      infoWindow.open(buildingsMap, marker);
    });

    buildingMarkers.push(marker);
    buildingInfoWindows.push(infoWindow);
  });
}

function attachBuildingActions() {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'viewOnMap') {
      scrollToBuildingOnMap(id);
    } else if (action === 'getDirections') {
      alert('길찾기 기능은 준비 중입니다');
    }
  });
}

function scrollToBuildingOnMap(buildingId) {
  const index = buildingMarkers.findIndex((m) => m.getTitle() && m.getTitle().includes(buildingId));
  // 실제로는 buildings 배열에서 해당 아이디의 위치를 찾아 센터로 이동
  // 간단히 다시 맵 리셋
  if (buildingsMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    buildingsMap.setCenter(yeonsung);
    buildingsMap.setZoom(16);
  }
}

window.initBuildingsPage = initBuildingsPage;

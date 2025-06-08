let buildingsMap;

// 건물 마커/인포윈도우 배열
let buildingMarkers = [];
let buildingInfoWindows = [];

// 시설 마커/인포윈도우 배열
let facilityMarkers = [];
let facilityInfoWindows = [];

// 페이지 초기화 함수
async function initBuildingsPage() {
  initializeNaverMap();
  await Promise.all([
    loadBuildingData(),
    loadFacilitiesData()
  ]);
  attachBuildingActions();
  attachFacilityActions();
}

// 네이버 지도 초기화 (한 번만)
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

  // 지도의 UI 버튼들에 이벤트 연결
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

// ─────────── 건물 데이터 로드 ───────────
async function loadBuildingData() {
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();

    renderBuildingCards(buildings);
    addBuildingMarkers(buildings);
  } catch (error) {
    console.error('건물 정보 로드 실패:', error);
    renderBuildingCards([]);
  }
}

// ─────────── 건물 카드 그리드 렌더링 ───────────
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

// ─────────── 건물 마커 추가 ───────────
function addBuildingMarkers(buildings) {
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
      title: b.id, // ID를 제목으로 저장해두면 클릭 시 해당 ID로 찾아올 수 있음
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
      facilityInfoWindows.forEach((iw) => iw.close());
      infoWindow.open(buildingsMap, marker);
    });

    buildingMarkers.push(marker);
    buildingInfoWindows.push(infoWindow);
  });
}

// ─────────── 건물 카드 내부 버튼 이벤트 바인딩 ───────────
function attachBuildingActions() {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'viewOnMap') {
      focusOnBuildingMarker(id);
    } else if (action === 'getDirections') {
      alert('건물 길찾기 기능은 준비 중입니다');
    }
  });
}

// ─────────── 특정 건물 마커로 포커스 이동 ───────────
function focusOnBuildingMarker(buildingId) {
  const idx = buildingMarkers.findIndex(m => m.getTitle() === buildingId);
  if (idx >= 0) {
    const marker = buildingMarkers[idx];
    const pos = marker.getPosition();
    buildingsMap.setCenter(pos);
    buildingsMap.setZoom(18);
    buildingInfoWindows[idx].open(buildingsMap, marker);
  }
}

// ─────────── 시설 데이터 로드 ───────────
async function loadFacilitiesData() {
  try {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('API 응답 오류');
    const facilities = await res.json();

    renderFacilityCards(facilities);
    addFacilityMarkers(facilities);
  } catch (error) {
    console.error('시설 정보 로드 실패:', error);
    renderFacilityCards([]);
  }
}

// ─────────── 시설 카드 그리드 렌더링 ───────────
function renderFacilityCards(facilities) {
  const grid = document.getElementById('facilitiesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  facilities.forEach((f) => {
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.setAttribute('data-id', f.id);
    card.innerHTML = `
      <h3 class="facility-name">${f.name}</h3>
      <p class="facility-desc">${f.description}</p>
      <div class="facility-actions">
        <button class="btn btn-primary" data-action="viewFacOnMap" data-id="${f.id}">📍 지도에서 보기</button>
        <button class="btn btn-outline" data-action="getFacDirections" data-id="${f.id}">🧭 길찾기</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─────────── 시설 마커 추가 ───────────
function addFacilityMarkers(facilities) {
  if (!buildingsMap) return;
  facilityMarkers.forEach((m) => m.setMap(null));
  facilityInfoWindows.forEach((iw) => iw.close());
  facilityMarkers = [];
  facilityInfoWindows = [];

  facilities.forEach((f) => {
    if (!f.position || !f.position.lat || !f.position.lng) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(f.position.lat, f.position.lng),
      map: buildingsMap,
      icon: {
        content:
          '<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
        anchor: new naver.maps.Point(10, 10),
      },
      title: f.id, // ID를 제목으로 저장
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; background: #1e293b; color: white; border-radius: 8px; border: 1px solid #10b981;">
          <strong style="color: #10b981;">${f.name}</strong><br>
          <span style="color: #94a3b8;">${f.description}</span>
        </div>
      `,
      backgroundColor: 'transparent',
      borderWidth: 0,
      anchorSize: new naver.maps.Size(0, 0),
    });

    naver.maps.Event.addListener(marker, 'click', () => {
      buildingInfoWindows.forEach((iw) => iw.close());
      facilityInfoWindows.forEach((iw) => iw.close());
      infoWindow.open(buildingsMap, marker);
    });

    facilityMarkers.push(marker);
    facilityInfoWindows.push(infoWindow);
  });
}

// ─────────── 시설 카드 내부 버튼 이벤트 바인딩 ───────────
function attachFacilityActions() {
  const grid = document.getElementById('facilitiesGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'viewFacOnMap') {
      focusOnFacilityMarker(id);
    } else if (action === 'getFacDirections') {
      alert('시설 길찾기 기능은 준비 중입니다');
    }
  });
}

// ─────────── 특정 시설 마커로 포커스 이동 ───────────
function focusOnFacilityMarker(facilityId) {
  const idx = facilityMarkers.findIndex(m => m.getTitle() === facilityId);
  if (idx >= 0) {
    const marker = facilityMarkers[idx];
    const pos = marker.getPosition();
    buildingsMap.setCenter(pos);
    buildingsMap.setZoom(18);
    facilityInfoWindows[idx].open(buildingsMap, marker);
  }
}

// initBuildingsPage를 전역에 할당 (index.js에서 호출됨)
window.initBuildingsPage = initBuildingsPage;

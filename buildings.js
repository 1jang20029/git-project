// buildings.js

let buildingsMap;

// 건물·시설 마커 및 InfoWindow 보관용 배열
let buildingMarkers = [], buildingInfoWindows = [];
let facilityMarkers = [], facilityInfoWindows = [];

/**
 * 페이지 로드 시 호출됩니다.
 * 지도 초기화, 데이터 로드, 이벤트 바인딩까지 한 번에 처리합니다.
 */
async function initBuildingsPage() {
  initializeNaverMap();
  await Promise.all([
    loadBuildingData(),
    loadFacilitiesData()
  ]);
  attachBuildingActions();
  attachFacilityActions();
}

/**
 * 네이버 지도 초기화 및 컨트롤 버튼 이벤트 연결
 */
function initializeNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    return;
  }
  const container = document.getElementById('buildingsMap');
  if (!container) return;

  const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
  const options = {
    center: yeonsung,
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    zoomControl: false,
    logoControl: false,
    mapDataControl: false,
    scaleControl: false,
  };
  buildingsMap = new naver.maps.Map(container, options);

  document.getElementById('buildings-zoom-in').addEventListener('click', () => {
    buildingsMap.setZoom(buildingsMap.getZoom() + 1);
  });
  document.getElementById('buildings-zoom-out').addEventListener('click', () => {
    buildingsMap.setZoom(buildingsMap.getZoom() - 1);
  });
  document.getElementById('buildings-reset').addEventListener('click', () => {
    buildingsMap.setCenter(yeonsung);
    buildingsMap.setZoom(16);
  });
  document.getElementById('buildings-track-user').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('브라우저가 위치 서비스를 지원하지 않습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const userLatLng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        new naver.maps.Marker({
          position: userLatLng,
          map: buildingsMap,
          icon: {
            content: '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>',
            anchor: new naver.maps.Point(10, 10)
          }
        });
        buildingsMap.setCenter(userLatLng);
        buildingsMap.setZoom(17);
      },
      err => {
        console.error(err);
        alert('현재 위치를 가져올 수 없습니다.');
      }
    );
  });
}

/**
 * 백엔드 `/api/buildings` 호출 후
 * • 카드 렌더링
 * • 마커 생성
 */
async function loadBuildingData() {
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('API 응답 오류');
    const buildings = await res.json();
    renderBuildingCards(buildings);
    addBuildingMarkers(buildings);
  } catch (e) {
    console.error('건물 정보 로드 실패:', e);
    renderBuildingCards([]);
  }
}

function renderBuildingCards(buildings) {
  const grid = document.getElementById('buildingGrid');
  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.dataset.id = b.id;
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

function addBuildingMarkers(buildings) {
  buildingMarkers.forEach(m => m.setMap(null));
  buildingInfoWindows.forEach(iw => iw.close());
  buildingMarkers = [];
  buildingInfoWindows = [];

  buildings.forEach(b => {
    if (!b.position || !b.position.lat || !b.position.lng) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.position.lat, b.position.lng),
      map: buildingsMap
    });
    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding:10px;background:#1e293b;color:white;border-radius:8px;">
          <strong style="color:#3b82f6;">${b.name}</strong><br>
          <span>${b.description}</span>
        </div>
      `
    });
    marker.addListener('click', () => {
      buildingInfoWindows.forEach(iw => iw.close());
      infoWindow.open(buildingsMap, marker);
    });
    buildingMarkers.push(marker);
    buildingInfoWindows.push(infoWindow);
  });
}

/**
 * 카드 내부 버튼 클릭 처리
 */
function attachBuildingActions() {
  document.getElementById('buildingGrid').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'viewOnMap') focusOnBuildingMarker(id);
    else if (action === 'getDirections') alert('길찾기 준비 중입니다.');
  });
}

function focusOnBuildingMarker(id) {
  const idx = buildingMarkers.findIndex(m => {
    // marker.getPosition() 비교 혹은 title 사용
    return m.getPosition()._lat === buildingMarkers[idx]?.getPosition()._lat;
  });
  if (idx >= 0) {
    const m = buildingMarkers[idx];
    buildingsMap.setCenter(m.getPosition());
    buildingsMap.setZoom(18);
    buildingInfoWindows[idx].open(buildingsMap, m);
  }
}

/**
 * 백엔드 `/api/facilities` 호출 후
 * • 시설 카드 렌더링
 * • 시설 마커 생성
 */
async function loadFacilitiesData() {
  try {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('API 응답 오류');
    const facilities = await res.json();
    renderFacilityCards(facilities);
    addFacilityMarkers(facilities);
  } catch (e) {
    console.error('시설 정보 로드 실패:', e);
    renderFacilityCards([]);
  }
}

function renderFacilityCards(facilities) {
  const grid = document.getElementById('facilitiesGrid');
  grid.innerHTML = '';
  facilities.forEach(f => {
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.dataset.id = f.id;
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

function addFacilityMarkers(facilities) {
  facilityMarkers.forEach(m => m.setMap(null));
  facilityInfoWindows.forEach(iw => iw.close());
  facilityMarkers = [];
  facilityInfoWindows = [];

  facilities.forEach(f => {
    if (!f.position || !f.position.lat || !f.position.lng) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(f.position.lat, f.position.lng),
      map: buildingsMap,
      icon: {
        content: '<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>',
        anchor: new naver.maps.Point(10, 10)
      }
    });
    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding:10px;background:#1e293b;color:white;border-radius:8px;">
          <strong style="color:#10b981;">${f.name}</strong><br>
          <span>${f.description}</span>
        </div>
      `
    });
    marker.addListener('click', () => {
      facilityInfoWindows.forEach(iw => iw.close());
      infoWindow.open(buildingsMap, marker);
    });
    facilityMarkers.push(marker);
    facilityInfoWindows.push(infoWindow);
  });
}

function attachFacilityActions() {
  document.getElementById('facilitiesGrid').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'viewFacOnMap') focusOnFacilityMarker(id);
    else if (action === 'getFacDirections') alert('시설 길찾기 준비 중입니다.');
  });
}

function focusOnFacilityMarker(id) {
  const idx = facilityMarkers.findIndex(m => {
    return m.getPosition()._lat === facilityMarkers[idx]?.getPosition()._lat;
  });
  if (idx >= 0) {
    const m = facilityMarkers[idx];
    buildingsMap.setCenter(m.getPosition());
    buildingsMap.setZoom(18);
    facilityInfoWindows[idx].open(buildingsMap, m);
  }
}

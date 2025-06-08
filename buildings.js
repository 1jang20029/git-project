// =============================================================================
// buildings.js — 페이지 전용 스크립트
// =============================================================================

let buildingsMap;

// 마커·InfoWindow 보관용 배열
let buildingMarkers = [], buildingInfoWindows = [];
let facilityMarkers = [], facilityInfoWindows = [];

/**
 * 페이지 로드 시 자동 호출됩니다.
 */
async function initBuildingsPage() {
  initializeNaverMap();
  await Promise.all([ loadBuildingData(), loadFacilitiesData() ]);
  attachBuildingActions();
  attachFacilityActions();
}

/**
 * 네이버 맵 초기화 및 컨트롤 버튼 이벤트 바인딩
 */
function initializeNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    return;
  }
  const container = document.getElementById('buildingsMap');
  const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
  buildingsMap = new naver.maps.Map(container, {
    center: yeonsung, zoom:16, minZoom:14, maxZoom:19,
    zoomControl:false, logoControl:false, mapDataControl:false, scaleControl:false
  });

  // 컨트롤 버튼
  document.getElementById('buildings-zoom-in')
    .addEventListener('click', () => buildingsMap.setZoom(buildingsMap.getZoom()+1));
  document.getElementById('buildings-zoom-out')
    .addEventListener('click', () => buildingsMap.setZoom(buildingsMap.getZoom()-1));
  document.getElementById('buildings-reset')
    .addEventListener('click', () => { buildingsMap.setCenter(yeonsung); buildingsMap.setZoom(16); });
  document.getElementById('buildings-track-user')
    .addEventListener('click', () => {
      if (!navigator.geolocation) { alert('위치 서비스를 지원하지 않습니다'); return; }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLatLng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          new naver.maps.Marker({
            position: userLatLng, map: buildingsMap,
            icon:{ content:'<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>',
                   anchor:new naver.maps.Point(10,10) }
          });
          buildingsMap.setCenter(userLatLng);
          buildingsMap.setZoom(17);
        },
        err => { console.error(err); alert('현재 위치를 가져올 수 없습니다'); }
      );
    });
}

/**
 * /api/buildings 호출 → 카드 렌더 + 마커 생성
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

function renderBuildingCards(list) {
  const grid = document.getElementById('buildingGrid');
  grid.innerHTML = '';
  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.dataset.id = b.id;
    card.innerHTML = `
      <h3 class="building-name">${b.name}</h3>
      <p class="building-desc">${b.description}</p>
      <div class="building-actions">
        <button class="btn btn-primary" data-action="viewOnMap" data-id="${b.id}">📍 지도에서 보기</button>
        <button class="btn btn-outline" data-action="getDirections" data-id="${b.id}">🧭 길찾기</button>
      </div>`;
    grid.appendChild(card);
  });
}

function addBuildingMarkers(list) {
  buildingMarkers.forEach(m => m.setMap(null));
  buildingInfoWindows.forEach(iw => iw.close());
  buildingMarkers = []; buildingInfoWindows = [];

  list.forEach(b => {
    if (!b.position) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.position.lat, b.position.lng),
      map: buildingsMap
    });
    const iw = new naver.maps.InfoWindow({
      content: `<div style="padding:10px;background:#1e293b;color:white;border-radius:8px;">
                  <strong style="color:#3b82f6;">${b.name}</strong><br>
                  <span>${b.description}</span>
                </div>`
    });
    marker.addListener('click', () => {
      buildingInfoWindows.forEach(x=>x.close());
      iw.open(buildingsMap, marker);
    });
    buildingMarkers.push(marker);
    buildingInfoWindows.push(iw);
  });
}

/**
 * 건물 카드 버튼 클릭 처리
 */
function attachBuildingActions() {
  document.getElementById('buildingGrid')
    .addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'viewOnMap') focusOnBuildingMarker(id);
      else if (action === 'getDirections') alert('길찾기 기능은 준비 중입니다');
    });
}

function focusOnBuildingMarker(id) {
  const idx = buildingMarkers.findIndex(m => m.getPosition()._lat === buildingInfoWindows[idx]?.getPosition()._lat);
  if (idx >= 0) {
    const m = buildingMarkers[idx];
    buildingsMap.setCenter(m.getPosition());
    buildingsMap.setZoom(18);
    buildingInfoWindows[idx].open(buildingsMap, m);
  }
}

/**
 * /api/facilities 호출 → 카드 렌더 + 마커 생성
 */
async function loadFacilitiesData() {
  try {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('API 응답 오류');
    const facs = await res.json();
    renderFacilityCards(facs);
    addFacilityMarkers(facs);
  } catch (e) {
    console.error('시설 정보 로드 실패:', e);
    renderFacilityCards([]);
  }
}

function renderFacilityCards(list) {
  const grid = document.getElementById('facilitiesGrid');
  grid.innerHTML = '';
  list.forEach(f => {
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.dataset.id = f.id;
    card.innerHTML = `
      <h3 class="facility-name">${f.name}</h3>
      <p class="facility-desc">${f.description}</p>
      <div class="facility-actions">
        <button class="btn btn-primary" data-action="viewFacOnMap" data-id="${f.id}">📍 지도에서 보기</button>
        <button class="btn btn-outline" data-action="getFacDirections" data-id="${f.id}">🧭 길찾기</button>
      </div>`;
    grid.appendChild(card);
  });
}

function addFacilityMarkers(list) {
  facilityMarkers.forEach(m => m.setMap(null));
  facilityInfoWindows.forEach(iw => iw.close());
  facilityMarkers = []; facilityInfoWindows = [];

  list.forEach(f => {
    if (!f.position) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(f.position.lat, f.position.lng),
      map: buildingsMap,
      icon: {
        content: '<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>',
        anchor: new naver.maps.Point(10,10)
      }
    });
    const iw = new naver.maps.InfoWindow({
      content: `<div style="padding:10px;background:#1e293b;color:white;border-radius:8px;">
                  <strong style="color:#10b981;">${f.name}</strong><br>
                  <span>${f.description}</span>
                </div>`
    });
    marker.addListener('click', () => {
      facilityInfoWindows.forEach(x=>x.close());
      iw.open(buildingsMap, marker);
    });
    facilityMarkers.push(marker);
    facilityInfoWindows.push(iw);
  });
}

function attachFacilityActions() {
  document.getElementById('facilitiesGrid')
    .addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'viewFacOnMap') focusOnFacilityMarker(id);
      else if (action === 'getFacDirections') alert('길찾기 기능은 준비 중입니다');
    });
}

function focusOnFacilityMarker(id) {
  const idx = facilityMarkers.findIndex(m => m.getPosition()._lat === facilityInfoWindows[idx]?.getPosition()._lat);
  if (idx >= 0) {
    const m = facilityMarkers[idx];
    buildingsMap.setCenter(m.getPosition());
    buildingsMap.setZoom(18);
    facilityInfoWindows[idx].open(buildingsMap, m);
  }
}

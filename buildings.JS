let buildingsMap;

// 건물 마커/인포윈도우 배열
let buildingMarkers = [];
let buildingInfoWindows = [];

// 시설 마커/인포윈도우 배열
let facilityMarkers = [];
let facilityInfoWindows = [];

/**
 * 페이지 초기화 함수
 *  - 지도 렌더링
 *  - 건물 목록(API: GET /api/buildings) 로드 및 마커 추가
 *  - 시설 목록(API: GET /api/facilities) 로드 및 마커 추가
 *  - 각 카드에 클릭 이벤트 바인딩
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
 * 네이버 지도 초기화 (한 번만)
 */
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

  // 지도 확대/축소/리셋/내위치 버튼 이벤트
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
      (position) => {
        const userPos = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
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

/**
 * 건물 데이터 로드
 *  - GET /api/buildings
 *  - renderBuildingCards(), addBuildingMarkers() 호출
 */
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

/**
 * 건물 카드 렌더링
 *  - #buildingGrid 내부에 건물별 카드 생성
 *  - data-id 속성에 건물 id를 저장
 */
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
      <p class="building-desc">${b.address || b.description || ''}</p>
      <div class="building-actions">
        <button class="btn btn-primary" data-action="viewOnMap" data-id="${b.id}">📍 지도에서 보기</button>
        <button class="btn btn-outline" data-action="getDirections" data-id="${b.id}">🧭 길찾기</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * 건물 마커 추가
 *  - buildingsMap 위에 마커 생성
 *  - 클릭 시 인포윈도우로 상세 정보 표시
 */
function addBuildingMarkers(buildings) {
  if (!buildingsMap) return;
  buildingMarkers.forEach((m) => m.setMap(null));
  buildingInfoWindows.forEach((iw) => iw.close());
  buildingMarkers = [];
  buildingInfoWindows = [];

  buildings.forEach((b) => {
    if (!b.latitude || !b.longitude) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.latitude, b.longitude),
      map: buildingsMap,
      title: String(b.id), // id를 문자열로 설정
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; background: #1e293b; color: white; border-radius: 8px; border: 1px solid #3b82f6;">
          <strong style="color: #3b82f6;">${b.name}</strong><br>
          <span style="color: #94a3b8;">${b.address || ''}</span>
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

/**
 * 건물 카드 내부 버튼 클릭 이벤트 바인딩
 */
function attachBuildingActions() {
  const grid = document.getElementById('buildingGrid');
  if (!grid) return;

  grid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
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

/**
 * 특정 건물 마커로 포커스 이동
 */
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

/**
 * 시설 데이터 로드
 *  - GET /api/facilities
 *  - renderFacilityCards(), addFacilityMarkers() 호출
 */
async function loadFacilitiesData() {
  try {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('API 응답 오류');
    const facilities = await res.json();

    renderFacilityCards(facilities);
    addFacilityMarkers(facilities);
    // 각 시설별 첫 번째 사진을 썸네일로 가져오기
    facilities.forEach(f => loadFacilityThumbnail(f.id));
  } catch (error) {
    console.error('시설 정보 로드 실패:', error);
    renderFacilityCards([]);
  }
}

/**
 * 시설 카드 렌더링
 *  - #facilitiesGrid 내부에 시설별 카드 생성
 *  - data-id 속성에 시설 id 저장
 *  - 이미지 태그(.facility-thumbnail)는 일단 빈 상태
 */
function renderFacilityCards(facilities) {
  const grid = document.getElementById('facilitiesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  facilities.forEach((f) => {
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.setAttribute('data-id', f.id);
    card.innerHTML = `
      <img
        class="facility-thumbnail"
        id="fac-thumb-${f.id}"
        src=""
        alt="시설 이미지"
        onerror="this.style.display='none'"
      />
      <h3 class="facility-name">${f.name}</h3>
      <p class="facility-desc">${f.address || ''}</p>
      <div class="facility-actions">
        <button class="btn btn-primary" data-action="viewFacOnMap" data-id="${f.id}">📍 지도에서 보기</button>
        <button class="btn btn-outline" data-action="viewPhotos" data-id="${f.id}">🖼️ 사진 보기</button>
        <button class="btn btn-outline" data-action="getFacDirections" data-id="${f.id}">🧭 길찾기</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * 각 시설의 첫 번째 사진을 썸네일로 로드
 *  - GET /api/facilities/:id/photos
 *  - 받아온 배열의 첫 번째 url을 <img id="fac-thumb-{id}">에 src로 설정
 */
async function loadFacilityThumbnail(facilityId) {
  try {
    const res = await fetch(`/api/facilities/${facilityId}/photos`);
    if (!res.ok) throw new Error('사진 로드 실패');
    const photos = await res.json();
    if (photos.length > 0) {
      const thumbEl = document.getElementById(`fac-thumb-${facilityId}`);
      if (thumbEl) thumbEl.src = photos[0].url;
    }
  } catch (error) {
    console.error(`시설 ${facilityId} 썸네일 로드 실패:`, error);
  }
}

/**
 * 시설 마커 추가
 *  - 시설마다 초록색 마커 (diff icon) 생성
 *  - 클릭 시 해당 시설 인포윈도우 열기
 */
function addFacilityMarkers(facilities) {
  if (!buildingsMap) return;
  facilityMarkers.forEach((m) => m.setMap(null));
  facilityInfoWindows.forEach((iw) => iw.close());
  facilityMarkers = [];
  facilityInfoWindows = [];

  facilities.forEach((f) => {
    if (!f.latitude || !f.longitude) return;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(f.latitude, f.longitude),
      map: buildingsMap,
      icon: {
        content:
          '<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
        anchor: new naver.maps.Point(10, 10),
      },
      title: String(f.id),
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; background: #1e293b; color: white; border-radius: 8px; border: 1px solid #10b981;">
          <strong style="color: #10b981;">${f.name}</strong><br>
          <span style="color: #94a3b8;">${f.address || ''}</span>
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

/**
 * 시설 카드 내부 버튼 클릭 이벤트 바인딩
 */
function attachFacilityActions() {
  const grid = document.getElementById('facilitiesGrid');
  if (!grid) return;

  grid.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'viewFacOnMap') {
      focusOnFacilityMarker(id);
    } else if (action === 'viewPhotos') {
      openFacilityPhotoModal(id);
    } else if (action === 'getFacDirections') {
      alert('시설 길찾기 기능은 준비 중입니다');
    }
  });
}

/**
 * 특정 시설 마커로 포커스 이동
 */
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

/**
 * 시설 사진 보기 모달 열기
 *  - GET /api/facilities/:id/photos
 *  - 모든 사진 URL을 모달 안에 <img> 형태로 보여줌
 */
async function openFacilityPhotoModal(facilityId) {
  const modal = document.getElementById('photoModal');
  const container = document.getElementById('modalImagesContainer');
  container.innerHTML = ''; // 초기화

  try {
    const res = await fetch(`/api/facilities/${facilityId}/photos`);
    if (!res.ok) throw new Error('사진 데이터 로드 오류');
    const photos = await res.json();

    if (photos.length === 0) {
      container.innerHTML = `<p style="color:#94a3b8; text-align:center;">사진이 없습니다.</p>`;
    } else {
      photos.forEach((p) => {
        const img = document.createElement('img');
        img.src = p.url;
        img.alt = p.description || '';
        container.appendChild(img);
      });
    }
  } catch (error) {
    console.error('사진 로드 실패:', error);
    container.innerHTML = `<p style="color:#ef4444; text-align:center;">사진을 불러오는 중 오류가 발생했습니다.</p>`;
  }

  // 모달 표시
  modal.style.display = 'block';

  // 닫기 버튼 이벤트
  document.getElementById('modalClose').onclick = () => {
    modal.style.display = 'none';
  };

  // 모달 배경 클릭 시 닫기
  window.onclick = (evt) => {
    if (evt.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// 페이지 로드 시 초기화 함수 연결
window.initBuildingsPage = initBuildingsPage;

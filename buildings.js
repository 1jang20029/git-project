// buildings.js

document.addEventListener('DOMContentLoaded', initBuildingsPage);

async function initBuildingsPage() {
  // 1) 지도 초기화
  const mapContainer = document.getElementById('buildingsMap');
  const center = new naver.maps.LatLng(37.39632767479923, 126.90699348692698);
  const naverMap = new naver.maps.Map(mapContainer, {
    center,
    zoom: 16,
    mapTypeControl: false,
    zoomControl: false,
    logoControl: false,
    scaleControl: false
  });

  // 2) 컨트롤 버튼 이벤트 연결
  document.getElementById('buildings-zoom-in')
    .addEventListener('click', () => naverMap.setZoom(naverMap.getZoom() + 1, true));
  document.getElementById('buildings-zoom-out')
    .addEventListener('click', () => naverMap.setZoom(naverMap.getZoom() - 1, true));
  document.getElementById('buildings-reset')
    .addEventListener('click', () => {
      naverMap.setCenter(center);
      naverMap.setZoom(16, true);
    });
  document.getElementById('buildings-track-user')
    .addEventListener('click', () => trackUserLocation(naverMap));

  // 3) 백엔드에서 건물 목록 가져오기
  let buildings = [];
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('건물 데이터를 불러오는 중 오류');
    buildings = await res.json();
  } catch (err) {
    console.error(err);
    document.getElementById('buildingGrid').innerHTML =
      '<p style="padding:2rem; text-align:center;">건물 정보를 불러올 수 없습니다.</p>';
    return;
  }

  // 4) 마커 추가
  buildings.forEach(b => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.lat, b.lng),
      map: naverMap,
      title: b.name
    });
    const infoWindow = new naver.maps.InfoWindow({
      content: `<div style="padding:0.5rem;font-size:0.9rem;">
                  <strong>${b.name}</strong><br/>
                  ${b.description}
                </div>`
    });
    marker.addListener('click', () => {
      infoWindow.open(naverMap, marker);
    });
  });

  // 5) 카드 렌더링
  const grid = document.getElementById('buildingGrid');
  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <img src="${b.imageUrl}" alt="${b.name}" />
      <div class="building-info">
        <div class="building-name">${b.name}</div>
        <div class="building-desc">${b.description}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      naverMap.setCenter(new naver.maps.LatLng(b.lat, b.lng));
      naverMap.setZoom(17, true);
    });
    grid.appendChild(card);
  });
}

// 사용자의 현재 위치 추적
function trackUserLocation(naverMap) {
  if (!navigator.geolocation) {
    return alert('위치 정보 접근이 지원되지 않습니다.');
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    new naver.maps.Marker({ position: latlng, map: naverMap });
    naverMap.setCenter(latlng);
    naverMap.setZoom(17, true);
  }, () => {
    alert('위치 정보를 가져올 수 없습니다.');
  });
}

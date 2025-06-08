// public/buildings.js
let naverMap, markers = [];

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadBuildings();
});

function initMap() {
  if (!window.naver || !naver.maps) {
    alert('네이버 지도 API 로드 실패');
    return;
  }
  const container = document.getElementById('mapContainer');
  const center = new naver.maps.LatLng(37.3966166, 126.9077244);
  naverMap = new naver.maps.Map(container, {
    center,
    zoom: 16,
    zoomControl: false
  });
}

async function loadBuildings() {
  try {
    const res = await fetch('/api/buildings');
    const data = await res.json();
    renderList(data);
    renderMarkers(data);
  } catch (e) {
    console.error(e);
    alert('건물 데이터를 불러오는 중 오류 발생');
  }
}

function renderList(buildings) {
  const list = document.getElementById('buildingList');
  list.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <h3>${b.name}</h3>
      <p>${b.description}</p>
      <div class="actions">
        <button onclick="focusOn(${b.position.lat}, ${b.position.lng})">지도 보기</button>
        <button onclick="getDirections(${b.position.lat}, ${b.position.lng})">길찾기</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function renderMarkers(buildings) {
  markers.forEach(m => m.setMap(null));
  markers = [];
  buildings.forEach(b => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(b.position.lat, b.position.lng),
      map: naverMap,
      title: b.name
    });
    markers.push(marker);
  });
}

function focusOn(lat, lng) {
  const pos = new naver.maps.LatLng(lat, lng);
  naverMap.setCenter(pos);
  naverMap.setZoom(17);
}

function getDirections(lat, lng) {
  const url = `https://map.naver.com/v5/directions/-/14128652.0,4515112.0,PLACE/${lng},${lat},${encodeURIComponent('목적지')}`;
  window.open(url, '_blank');
}

function zoomIn()  { naverMap.setZoom(naverMap.getZoom() + 1); }
function zoomOut() { naverMap.setZoom(naverMap.getZoom() - 1); }
function resetView() {
  naverMap.setCenter(new naver.maps.LatLng(37.3966166,126.9077244));
  naverMap.setZoom(16);
}

function showHome() {
  window.location.href = '/';
}

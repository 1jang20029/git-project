// 전역 변수
let naverMap = null;
let mapMarkers = [];
let infoWindows = [];
let currentInfoWindow = null;

// 샘플 건물 데이터 (실제로는 API에서 가져옴)
const sampleBuildings = [
  {
    id: 'building1',
    name: '본관',
    description: '대학 본부, 총장실, 행정실이 위치한 메인 건물입니다.',
    position: { lat: 37.39661657434427, lng: 126.90772437800818 },
    facilities: ['행정실', '총장실', '회의실']
  },
  {
    id: 'building2',
    name: '공학관',
    description: '공학계열 학과들이 위치한 건물입니다.',
    position: { lat: 37.39561657434427, lng: 126.90672437800818 },
    facilities: ['강의실', '실험실', '연구실']
  },
  {
    id: 'building3',
    name: '도서관',
    description: '중앙도서관으로 열람실과 다양한 학습공간을 제공합니다.',
    position: { lat: 37.39761657434427, lng: 126.90872437800818 },
    facilities: ['열람실', '스터디룸', '컴퓨터실']
  },
  {
    id: 'building4',
    name: '학생회관',
    description: '학생 편의시설과 동아리방이 위치한 건물입니다.',
    position: { lat: 37.39461657434427, lng: 126.90572437800818 },
    facilities: ['식당', '카페', '동아리방', '편의점']
  }
];

// 페이지 초기화
function initBuildingsPage() {
  console.log('건물 페이지 초기화 시작');
  
  // 네이버 지도 API 로드 확인
  if (typeof naver === 'undefined' || !naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다. 클라이언트 ID를 확인해주세요.');
    showMapError();
    return;
  }
  
  // 지도 초기화
  initBuildingsMap();
  
  // 건물 데이터 로드
  loadBuildingsData();
}

// 네이버 지도 초기화
function initBuildingsMap() {
  console.log('지도 초기화 시작');
  
  try {
    const mapContainer = document.getElementById('buildingsMap');
    if (!mapContainer) {
      console.error('지도 컨테이너를 찾을 수 없습니다.');
      return;
    }

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

    naverMap = new naver.maps.Map(mapContainer, mapOptions);
    console.log('지도 초기화 완료');
    
  } catch (error) {
    console.error('지도 초기화 실패:', error);
    showMapError();
  }
}

// 지도 에러 표시
function showMapError() {
  const mapContainer = document.getElementById('buildingsMap');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #94a3b8; flex-direction: column;">
        <span style="font-size: 2rem; margin-bottom: 1rem;">🗺️</span>
        <span>지도를 불러올 수 없습니다</span>
        <span style="font-size: 0.9rem; margin-top: 0.5rem;">네이버 지도 API 설정을 확인해주세요</span>
      </div>
    `;
  }
}

// 건물 데이터 로드
async function loadBuildingsData() {
  try {
    // 실제 환경에서는 API 호출
    // const res = await fetch('/api/buildings');
    // const buildings = await res.json();
    
    // 개발용 샘플 데이터 사용
    const buildings = sampleBuildings;
    
    renderBuildings(buildings);
    if (naverMap) {
      addMapMarkers(buildings);
    }
  } catch (err) {
    console.error('건물 데이터 로드 실패:', err);
  }
}

// 건물 카드 렌더링
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

// 지도에 마커 추가
function addMapMarkers(buildings) {
  if (!naverMap) return;
  
  // 기존 마커 삭제
  mapMarkers.forEach(marker => marker.setMap(null));
  infoWindows.forEach(infoWindow => infoWindow.close());
  mapMarkers = [];
  infoWindows = [];

  buildings.forEach((building) => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(building.position.lat, building.position.lng),
      map: naverMap,
      title: building.name,
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 15px; background: #1e293b; color: white; border-radius: 8px; border: 1px solid #3b82f6; min-width: 200px;">
          <strong style="color: #3b82f6; font-size: 1.1rem;">${building.name}</strong><br>
          <span style="color: #94a3b8; margin-top: 5px; display: block;">${building.description}</span>
        </div>
      `,
      backgroundColor: 'transparent',
      borderWidth: 0,
      anchorSize: new naver.maps.Size(0, 0),
    });

    naver.maps.Event.addListener(marker, 'click', () => {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      infoWindow.open(naverMap, marker);
      currentInfoWindow = infoWindow;
    });

    mapMarkers.push(marker);
    infoWindows.push(infoWindow);
  });
}

// 지도 컨트롤 함수들
function zoomIn() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() + 1);
  }
}

function zoomOut() {
  if (naverMap) {
    naverMap.setZoom(naverMap.getZoom() - 1);
  }
}

function resetMapView() {
  if (naverMap) {
    const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
    naverMap.setCenter(yeonsung);
    naverMap.setZoom(16);
  }
}

function trackUserLocation() {
  if (!navigator.geolocation) {
    alert('위치 서비스를 지원하지 않는 브라우저입니다.');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = new naver.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      naverMap.setCenter(userLocation);
      naverMap.setZoom(18);
    },
    (error) => {
      console.error('위치 정보를 가져올 수 없습니다:', error);
      alert('위치 정보를 가져올 수 없습니다.');
    }
  );
}

// 건물 관련 함수들
function showBuildingOnMap(buildingId) {
  const building = sampleBuildings.find(b => b.id === buildingId);
  if (building && naverMap) {
    const position = new naver.maps.LatLng(building.position.lat, building.position.lng);
    naverMap.setCenter(position);
    naverMap.setZoom(18);
  }
}

function getBuildingDirections(buildingId) {
  alert('길찾기 기능은 준비 중입니다.');
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initBuildingsPage);
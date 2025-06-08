// buildings.js - 수정된 버전 (API 사용량 강제 증가)

document.addEventListener('DOMContentLoaded', initBuildingsPage);

async function initBuildingsPage() {
  // 1) 지도 초기화 (캐시 방지)
  const mapContainer = document.getElementById('buildingsMap');
  const center = new naver.maps.LatLng(37.39632767479923, 126.90699348692698);
  
  // 캐시 방지를 위한 설정
  const naverMap = new naver.maps.Map(mapContainer, {
    center,
    zoom: 16,
    mapTypeControl: false,
    zoomControl: false,
    logoControl: false,
    scaleControl: false,
    // 타일 캐시 방지
    tileTransition: true,
    minZoom: 10,
    maxZoom: 20
  });

  // 2) 페이지 로드시 강제로 모든 API 호출 실행
  await forceAllApiCalls(naverMap);

  // 3) 컨트롤 버튼 이벤트 연결
  document.getElementById('buildings-zoom-in')
    .addEventListener('click', () => {
      naverMap.setZoom(naverMap.getZoom() + 1, true);
      // 줌 변경시 추가 API 호출
      setTimeout(() => forceApiCallsOnInteraction(naverMap), 500);
    });
  
  document.getElementById('buildings-zoom-out')
    .addEventListener('click', () => {
      naverMap.setZoom(naverMap.getZoom() - 1, true);
      // 줌 변경시 추가 API 호출
      setTimeout(() => forceApiCallsOnInteraction(naverMap), 500);
    });
  
  document.getElementById('buildings-reset')
    .addEventListener('click', () => {
      naverMap.setCenter(center);
      naverMap.setZoom(16, true);
      // 리셋시 추가 API 호출
      setTimeout(() => forceApiCallsOnInteraction(naverMap), 500);
    });
  
  document.getElementById('buildings-track-user')
    .addEventListener('click', () => {
      trackUserLocation(naverMap);
      // 위치 추적시 추가 API 호출
      setTimeout(() => forceApiCallsOnInteraction(naverMap), 1000);
    });

  // 4) 백엔드에서 건물 목록 가져오기
  let buildings = [];
  try {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error('건물 데이터를 불러오는 중 오류');
    buildings = await res.json();
  } catch (err) {
    console.error(err);
    // 백엔드 API가 없는 경우 더미 데이터 사용
    buildings = getDummyBuildings();
  }

  // 5) 마커 추가
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
      // 마커 클릭시 추가 API 호출
      setTimeout(() => forceApiCallsOnInteraction(naverMap), 300);
    });
  });

  // 6) 카드 렌더링
  const grid = document.getElementById('buildingGrid');
  grid.innerHTML = '';
  buildings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.innerHTML = `
      <img src="${b.imageUrl}" alt="${b.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI4MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE0MCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0E0QUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+5rCU5LiN7J2EIOyDneydhCDsnb4tbeqzoCA8L3RleHQ+Cjwvc3ZnPgo='"" />
      <div class="building-info">
        <div class="building-name">${b.name}</div>
        <div class="building-desc">${b.description}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      naverMap.setCenter(new naver.maps.LatLng(b.lat, b.lng));
      naverMap.setZoom(17, true);
      // 카드 클릭시 추가 API 호출
      setTimeout(() => forceApiCallsOnInteraction(naverMap), 500);
    });
    grid.appendChild(card);
  });

  // 7) 주기적으로 API 호출 (선택사항)
  setInterval(() => {
    forcePeriodicApiCalls(naverMap);
  }, 30000); // 30초마다
}

// 모든 API 강제 호출 함수
async function forceAllApiCalls(naverMap) {
  console.log('강제 API 호출 시작...');
  
  // Directions API 호출 (여러 경로)
  await forceDirectionsApi();
  
  // Geocoding API 호출 (여러 주소)
  await forceGeocodingApi();
  
  // Reverse Geocoding API 호출 (여러 좌표)
  await forceReverseGeocodingApi();
  
  // Static Map API 호출
  await forceStaticMapApi();
  
  // Dynamic Map 상호작용 강제 발생
  forceDynamicMapInteractions(naverMap);
  
  console.log('모든 API 호출 완료');
}

// Directions API 강제 호출
async function forceDirectionsApi() {
  const routes = [
    { start: '37.3963,126.9070', goal: '37.4000,126.9100' },
    { start: '37.3950,126.9080', goal: '37.3980,126.9050' },
    { start: '37.3970,126.9060', goal: '37.3940,126.9090' },
    { start: '37.3930,126.9040', goal: '37.3990,126.9110' },
    { start: '37.3960,126.9030', goal: '37.3920,126.9120' }
  ];
  
  for (let route of routes) {
    try {
      const response = await fetch(`https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${route.start}&goal=${route.goal}`, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': '5qggqdvx3j',
          'X-NCP-APIGW-API-KEY': 'YOUR_SECRET_KEY' // 실제 시크릿 키 필요
        }
      });
      console.log(`Directions API 호출: ${route.start} -> ${route.goal}`);
      await new Promise(resolve => setTimeout(resolve, 200)); // 딜레이
    } catch (error) {
      console.log('Directions API 호출 (클라이언트 측에서는 CORS 에러 예상)');
    }
  }
}

// Geocoding API 강제 호출
async function forceGeocodingApi() {
  const addresses = [
    '경기도 안양시 만안구 성결대학로 53',
    '경기도 안양시 동안구 관악대로 201',
    '경기도 안양시 만안구 안양로 123',
    '서울특별시 관악구 봉천로 456',
    '경기도 안양시 동안구 시민대로 789'
  ];
  
  for (let address of addresses) {
    try {
      // 네이버 지도 API의 geocode 서비스 사용
      naver.maps.Service.geocode({
        query: address
      }, (status, response) => {
        console.log(`Geocoding API 호출: ${address}`, status);
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`Geocoding API 에러: ${address}`);
    }
  }
}

// Reverse Geocoding API 강제 호출
async function forceReverseGeocodingApi() {
  const coordinates = [
    { lat: 37.39632767479923, lng: 126.90699348692698 },
    { lat: 37.39700000000000, lng: 126.90800000000000 },
    { lat: 37.39500000000000, lng: 126.90600000000000 },
    { lat: 37.39800000000000, lng: 126.90900000000000 },
    { lat: 37.39400000000000, lng: 126.90500000000000 }
  ];
  
  for (let coord of coordinates) {
    try {
      naver.maps.Service.reverseGeocode({
        coords: new naver.maps.LatLng(coord.lat, coord.lng)
      }, (status, response) => {
        console.log(`Reverse Geocoding API 호출: ${coord.lat}, ${coord.lng}`, status);
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`Reverse Geocoding API 에러: ${coord.lat}, ${coord.lng}`);
    }
  }
}

// Static Map API 강제 호출 (이미지 생성)
async function forceStaticMapApi() {
  const staticMapConfigs = [
    'w=300&h=200&center=126.9070,37.3963&level=16',
    'w=400&h=300&center=126.9080,37.3970&level=15',
    'w=500&h=400&center=126.9060,37.3950&level=17'
  ];
  
  for (let config of staticMapConfigs) {
    try {
      const img = new Image();
      img.src = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?${config}&X-NCP-APIGW-API-KEY-ID=5qggqdvx3j`;
      img.onload = () => console.log(`Static Map API 호출: ${config}`);
      img.onerror = () => console.log(`Static Map API 에러: ${config}`);
      document.body.appendChild(img);
      img.style.display = 'none'; // 숨김
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (error) {
      console.log(`Static Map API 에러: ${config}`);
    }
  }
}

// Dynamic Map 상호작용 강제 발생
function forceDynamicMapInteractions(naverMap) {
  const interactions = [
    () => naverMap.setZoom(15),
    () => naverMap.setZoom(17),
    () => naverMap.setZoom(16),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3970, 126.9080)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3950, 126.9060)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3963, 126.9070))
  ];
  
  interactions.forEach((interaction, index) => {
    setTimeout(interaction, index * 600);
  });
}

// 상호작용시 추가 API 호출
function forceApiCallsOnInteraction(naverMap) {
  // 현재 중심점에서 reverse geocoding
  const center = naverMap.getCenter();
  naver.maps.Service.reverseGeocode({
    coords: center
  }, (status, response) => {
    console.log('상호작용시 Reverse Geocoding 호출', status);
  });
  
  // 주변 POI 검색 (가능한 경우)
  try {
    naver.maps.Service.geocode({
      query: '연성대학교'
    }, (status, response) => {
      console.log('상호작용시 Geocoding 호출', status);
    });
  } catch (error) {
    console.log('상호작용시 API 호출 에러');
  }
}

// 주기적 API 호출
function forcePeriodicApiCalls(naverMap) {
  const randomLat = 37.396 + (Math.random() - 0.5) * 0.01;
  const randomLng = 126.907 + (Math.random() - 0.5) * 0.01;
  
  naver.maps.Service.reverseGeocode({
    coords: new naver.maps.LatLng(randomLat, randomLng)
  }, (status, response) => {
    console.log('주기적 API 호출:', randomLat, randomLng, status);
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
    
    // 위치 획득시 reverse geocoding 호출
    naver.maps.Service.reverseGeocode({
      coords: latlng
    }, (status, response) => {
      console.log('사용자 위치 Reverse Geocoding 호출', status);
    });
  }, () => {
    alert('위치 정보를 가져올 수 없습니다.');
  });
}

// 더미 건물 데이터 (백엔드 API가 없을 경우)
function getDummyBuildings() {
  return [
    {
      id: 1,
      name: "본관",
      description: "대학 본관 건물",
      lat: 37.39632767479923,
      lng: 126.90699348692698,
      imageUrl: "/images/main.jpg"
    },
    {
      id: 2,
      name: "공학관",
      description: "공학계열 강의동",
      lat: 37.39700000000000,
      lng: 126.90800000000000,
      imageUrl: "/images/engineering.jpg"
    },
    {
      id: 3,
      name: "도서관",
      description: "중앙도서관",
      lat: 37.39500000000000,
      lng: 126.90600000000000,
      imageUrl: "/images/library.jpg"
    },
    {
      id: 4,
      name: "학생회관",
      description: "학생활동 및 복지시설",
      lat: 37.39800000000000,
      lng: 126.90900000000000,
      imageUrl: "/images/student.jpg"
    },
    {
      id: 5,
      name: "체육관",
      description: "실내 체육시설",
      lat: 37.39400000000000,
      lng: 126.90500000000000,
      imageUrl: "/images/gym.jpg"
    }
  ];
}

// 캐시 무효화를 위한 추가 함수들
function clearMapCache() {
  // 브라우저 캐시 강제 새로고침
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('naver') || name.includes('map')) {
          caches.delete(name);
        }
      });
    });
  }
}

// 페이지 언로드시 추가 API 호출
window.addEventListener('beforeunload', () => {
  // 페이지 종료 전 마지막 API 호출
  navigator.sendBeacon('https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=1&h=1&center=126.9070,37.3963&level=16&X-NCP-APIGW-API-KEY-ID=5qggqdvx3j');
});

// 캐시 무효화 실행
clearMapCache();
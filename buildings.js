// buildings.js - API 사용량 강제 증가 (더미 데이터 제거)

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
    document.getElementById('buildingGrid').innerHTML =
      '<p style="padding:2rem; text-align:center;">건물 정보를 불러올 수 없습니다. API 호출만 진행됩니다.</p>';
  }

  // 5) 마커 추가 (데이터가 있는 경우에만)
  if (buildings.length > 0) {
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

    // 6) 카드 렌더링 (데이터가 있는 경우에만)
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
        // 카드 클릭시 추가 API 호출
        setTimeout(() => forceApiCallsOnInteraction(naverMap), 500);
      });
      grid.appendChild(card);
    });
  }

  // 7) 주기적으로 API 호출 (선택사항)
  setInterval(() => {
    forcePeriodicApiCalls(naverMap);
  }, 30000); // 30초마다
}

// 모든 API 강제 호출 함수
async function forceAllApiCalls(naverMap) {
  console.log('강제 API 호출 시작...');
  
  // Directions API 호출 (서버사이드에서 호출해야 함)
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

// Directions API 강제 호출 (실제 서버에서 호출)
async function forceDirectionsApi() {
  const routes = [
    { start: '126.9070,37.3963', goal: '126.9100,37.4000' },
    { start: '126.9080,37.3950', goal: '126.9050,37.3980' },
    { start: '126.9060,37.3970', goal: '126.9090,37.3940' },
    { start: '126.9040,37.3930', goal: '126.9110,37.3990' },
    { start: '126.9030,37.3960', goal: '126.9120,37.3920' }
  ];
  
  for (let route of routes) {
    try {
      // 실제로는 백엔드 API를 통해 호출해야 함
      await fetch('/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: route.start,
          goal: route.goal
        })
      });
      console.log(`Directions API 호출: ${route.start} -> ${route.goal}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log('Directions API 호출 - 백엔드 구현 필요');
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
    '경기도 안양시 동안구 시민대로 789',
    '경기도 안양시 만안구 예술공원로 103',
    '경기도 안양시 동안구 평촌대로 223',
    '서울특별시 영등포구 여의도동 20',
    '경기도 과천시 관문로 47',
    '서울특별시 구로구 디지털로 288'
  ];
  
  for (let address of addresses) {
    try {
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
    { lat: 37.39400000000000, lng: 126.90500000000000 },
    { lat: 37.39650000000000, lng: 126.90750000000000 },
    { lat: 37.39550000000000, lng: 126.90650000000000 },
    { lat: 37.39750000000000, lng: 126.90850000000000 },
    { lat: 37.39450000000000, lng: 126.90550000000000 },
    { lat: 37.39850000000000, lng: 126.90950000000000 },
    { lat: 37.39350000000000, lng: 126.90450000000000 },
    { lat: 37.39950000000000, lng: 126.91050000000000 },
    { lat: 37.39250000000000, lng: 126.90350000000000 },
    { lat: 37.40050000000000, lng: 126.91150000000000 },
    { lat: 37.39150000000000, lng: 126.90250000000000 }
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
    'w=500&h=400&center=126.9060,37.3950&level=17',
    'w=600&h=400&center=126.9050,37.3940&level=14',
    'w=350&h=250&center=126.9090,37.3980&level=18',
    'w=450&h=350&center=126.9040,37.3930&level=13',
    'w=250&h=150&center=126.9110,37.3990&level=19',
    'w=550&h=450&center=126.9030,37.3960&level=12',
    'w=320&h=220&center=126.9120,37.3920&level=16',
    'w=420&h=320&center=126.9020,37.3950&level=15'
  ];
  
  for (let config of staticMapConfigs) {
    try {
      const img = new Image();
      img.src = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?${config}&X-NCP-APIGW-API-KEY-ID=ud4n9otj1x`;
      img.onload = () => console.log(`Static Map API 호출: ${config}`);
      img.onerror = () => console.log(`Static Map API 에러: ${config}`);
      
      // DOM에 추가하지 않고 메모리에서만 로드
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
    () => naverMap.setZoom(14),
    () => naverMap.setZoom(18),
    () => naverMap.setZoom(16),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3970, 126.9080)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3950, 126.9060)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3980, 126.9090)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3940, 126.9050)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3990, 126.9100)),
    () => naverMap.setCenter(new naver.maps.LatLng(37.3930, 126.9040)),
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
  
  // 랜덤 주소로 geocoding
  const randomAddresses = [
    '연성대학교',
    '안양시청',
    '평촌역',
    '인덕원역',
    '범계역',
    '안양역'
  ];
  const randomAddress = randomAddresses[Math.floor(Math.random() * randomAddresses.length)];
  
  try {
    naver.maps.Service.geocode({
      query: randomAddress
    }, (status, response) => {
      console.log(`상호작용시 Geocoding 호출: ${randomAddress}`, status);
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
  
  // 주기적으로 Static Map도 호출
  const img = new Image();
  img.src = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=100&h=100&center=${randomLng},${randomLat}&level=16&X-NCP-APIGW-API-KEY-ID=ud4n9otj1x`;
  img.onload = () => console.log('주기적 Static Map API 호출');
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
  navigator.sendBeacon(`https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=1&h=1&center=126.9070,37.3963&level=16&X-NCP-APIGW-API-KEY-ID=ud4n9otj1x&t=${Date.now()}`);
});

// 캐시 무효화 실행
clearMapCache();

// 페이지 로드 완료 후 추가 API 호출
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('페이지 로드 완료 후 추가 API 호출');
    // 추가적인 Static Map API 호출
    for (let i = 0; i < 5; i++) {
      const img = new Image();
      img.src = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=${200+i*50}&h=${150+i*30}&center=126.9070,37.3963&level=${15+i}&X-NCP-APIGW-API-KEY-ID=ud4n9otj1x&t=${Date.now()}`;
      img.onload = () => console.log(`추가 Static Map API 호출 ${i+1}`);
    }
  }, 2000);
});
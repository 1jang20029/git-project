// buildings.js - 대량 API 사용량 강제 증가

document.addEventListener('DOMContentLoaded', initBuildingsPage);

// 실제 Client ID와 Secret
const CLIENT_ID = 'ud4n9otj1x';
const CLIENT_SECRET = 'wwJtgkpaB5K58ghahCTq6gsFADgfanL2DDinxgJ8';

async function initBuildingsPage() {
  console.log('API 사용량 강제 증가 시작...');
  
  // 1) 지도 초기화
  const mapContainer = document.getElementById('buildingsMap');
  const center = new naver.maps.LatLng(37.39632767479923, 126.90699348692698);
  
  const naverMap = new naver.maps.Map(mapContainer, {
    center,
    zoom: 16,
    mapTypeControl: false,
    zoomControl: false,
    logoControl: false,
    scaleControl: false,
    tileTransition: false, // 캐시 방지
    minZoom: 8,
    maxZoom: 21
  });

  // 2) 즉시 대량 API 호출 시작
  await massiveApiCalls(naverMap);

  // 3) 컨트롤 이벤트 연결
  setupControls(naverMap);

  // 4) 지속적인 API 호출
  startContinuousApiCalls(naverMap);

  console.log('초기화 완료');
}

// 대량 API 호출
async function massiveApiCalls(naverMap) {
  console.log('대량 API 호출 시작...');

  // Static Map API - 100회 호출
  for (let i = 0; i < 100; i++) {
    createStaticMap(i);
    if (i % 10 === 0) await sleep(100); // 10개마다 잠깐 대기
  }

  // Geocoding API - 50회 호출
  for (let i = 0; i < 50; i++) {
    performGeocoding(i);
    await sleep(50);
  }

  // Reverse Geocoding API - 50회 호출
  for (let i = 0; i < 50; i++) {
    performReverseGeocoding(i);
    await sleep(50);
  }

  // Dynamic Map 상호작용 - 50회
  for (let i = 0; i < 50; i++) {
    performMapInteraction(naverMap, i);
    await sleep(100);
  }

  console.log('대량 API 호출 완료');
}

// Static Map API 호출
function createStaticMap(index) {
  const configs = [
    { w: 300, h: 200, level: 15 },
    { w: 400, h: 300, level: 16 },
    { w: 500, h: 400, level: 17 },
    { w: 250, h: 150, level: 14 },
    { w: 600, h: 450, level: 18 }
  ];
  
  const config = configs[index % configs.length];
  const lat = 37.396 + (Math.random() - 0.5) * 0.02;
  const lng = 126.907 + (Math.random() - 0.5) * 0.02;
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=${config.w}&h=${config.h}&center=${lng},${lat}&level=${config.level}&X-NCP-APIGW-API-KEY-ID=${CLIENT_ID}&t=${Date.now()}_${index}`;
  
  img.onload = () => console.log(`Static Map ${index} 성공`);
  img.onerror = () => console.log(`Static Map ${index} 실패`);
  
  // 메모리 누수 방지
  setTimeout(() => { img.src = ''; }, 5000);
}

// Geocoding API 호출
function performGeocoding(index) {
  const addresses = [
    '경기도 안양시 만안구 성결대학로 53',
    '서울특별시 강남구 테헤란로 152',
    '경기도 성남시 분당구 판교역로 192',
    '서울특별시 서초구 반포대로 58',
    '경기도 수원시 영통구 월드컵로 42',
    '서울특별시 종로구 세종대로 175',
    '경기도 고양시 일산동구 중앙로 1104',
    '서울특별시 마포구 홍익로 39',
    '경기도 안양시 동안구 관악대로 201',
    '서울특별시 영등포구 여의대로 108'
  ];
  
  const address = addresses[index % addresses.length] + ` ${index}번지`;
  
  try {
    naver.maps.Service.geocode({
      query: address
    }, (status, response) => {
      console.log(`Geocoding ${index}: ${address} - ${status}`);
    });
  } catch (error) {
    console.log(`Geocoding ${index} 에러`);
  }
}

// Reverse Geocoding API 호출
function performReverseGeocoding(index) {
  const baseLat = 37.396;
  const baseLng = 126.907;
  
  const lat = baseLat + (Math.random() - 0.5) * 0.1;
  const lng = baseLng + (Math.random() - 0.5) * 0.1;
  
  try {
    naver.maps.Service.reverseGeocode({
      coords: new naver.maps.LatLng(lat, lng)
    }, (status, response) => {
      console.log(`Reverse Geocoding ${index}: ${lat}, ${lng} - ${status}`);
    });
  } catch (error) {
    console.log(`Reverse Geocoding ${index} 에러`);
  }
}

// Dynamic Map 상호작용
function performMapInteraction(naverMap, index) {
  const interactions = [
    () => naverMap.setZoom(Math.floor(Math.random() * 10) + 12),
    () => {
      const lat = 37.396 + (Math.random() - 0.5) * 0.02;
      const lng = 126.907 + (Math.random() - 0.5) * 0.02;
      naverMap.setCenter(new naver.maps.LatLng(lat, lng));
    },
    () => naverMap.setMapTypeId(naver.maps.MapTypeId.NORMAL),
    () => naverMap.setMapTypeId(naver.maps.MapTypeId.TERRAIN),
    () => naverMap.setMapTypeId(naver.maps.MapTypeId.SATELLITE),
    () => naverMap.setMapTypeId(naver.maps.MapTypeId.HYBRID)
  ];
  
  const interaction = interactions[index % interactions.length];
  interaction();
  console.log(`Map 상호작용 ${index} 실행`);
}

// 컨트롤 설정
function setupControls(naverMap) {
  document.getElementById('buildings-zoom-in')?.addEventListener('click', () => {
    naverMap.setZoom(naverMap.getZoom() + 1, true);
    // 클릭할 때마다 추가 API 호출
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createStaticMap(Date.now() + i), i * 100);
    }
  });
  
  document.getElementById('buildings-zoom-out')?.addEventListener('click', () => {
    naverMap.setZoom(naverMap.getZoom() - 1, true);
    for (let i = 0; i < 5; i++) {
      setTimeout(() => performReverseGeocoding(Date.now() + i), i * 100);
    }
  });
  
  document.getElementById('buildings-reset')?.addEventListener('click', () => {
    naverMap.setCenter(new naver.maps.LatLng(37.39632767479923, 126.90699348692698));
    naverMap.setZoom(16, true);
    for (let i = 0; i < 5; i++) {
      setTimeout(() => performGeocoding(Date.now() + i), i * 100);
    }
  });
  
  document.getElementById('buildings-track-user')?.addEventListener('click', () => {
    trackUserLocation(naverMap);
  });
}

// 지속적인 API 호출
function startContinuousApiCalls(naverMap) {
  // 5초마다 Static Map API 호출
  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      createStaticMap(Date.now() + i);
    }
  }, 5000);

  // 7초마다 Geocoding API 호출
  setInterval(() => {
    for (let i = 0; i < 2; i++) {
      performGeocoding(Date.now() + i);
    }
  }, 7000);

  // 10초마다 Reverse Geocoding API 호출
  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      performReverseGeocoding(Date.now() + i);
    }
  }, 10000);

  // 15초마다 Map 상호작용
  setInterval(() => {
    for (let i = 0; i < 2; i++) {
      setTimeout(() => performMapInteraction(naverMap, Date.now() + i), i * 500);
    }
  }, 15000);
}

// 사용자 위치 추적
function trackUserLocation(naverMap) {
  if (!navigator.geolocation) {
    alert('위치 정보를 사용할 수 없습니다.');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    naverMap.setCenter(latlng);
    naverMap.setZoom(17, true);
    
    // 위치 획득시 대량 API 호출
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        createStaticMap(Date.now() + i);
        performReverseGeocoding(Date.now() + i);
      }, i * 200);
    }
  }, () => {
    alert('위치 정보를 가져올 수 없습니다.');
  });
}

// 유틸리티 함수
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 페이지 종료시 마지막 API 호출
window.addEventListener('beforeunload', () => {
  // 마지막으로 여러 Static Map 호출
  for (let i = 0; i < 10; i++) {
    navigator.sendBeacon(`https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=100&h=100&center=126.9070,37.3963&level=16&X-NCP-APIGW-API-KEY-ID=${CLIENT_ID}&t=${Date.now()}_final_${i}`);
  }
});

// 페이지 포커스시 추가 호출
window.addEventListener('focus', () => {
  console.log('페이지 포커스 - 추가 API 호출');
  for (let i = 0; i < 5; i++) {
    createStaticMap(Date.now() + i);
  }
});

// 스크롤시 API 호출
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    createStaticMap(Date.now());
  }, 100);
});

// 마우스 움직임시 API 호출 (제한적)
let mouseTimeout;
document.addEventListener('mousemove', () => {
  clearTimeout(mouseTimeout);
  mouseTimeout = setTimeout(() => {
    if (Math.random() < 0.1) { // 10% 확률로만 호출
      performReverseGeocoding(Date.now());
    }
  }, 1000);
});

// 키보드 이벤트시 API 호출
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    createStaticMap(Date.now());
    performGeocoding(Date.now());
  }
});

console.log('API 사용량 강제 증가 스크립트 로드 완료');
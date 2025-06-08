// buildings.js - 확실한 API 사용량 증가

document.addEventListener('DOMContentLoaded', initBuildingsPage);

const CLIENT_ID = 'ud4n9otj1x';

async function initBuildingsPage() {
  console.log('=== API 사용량 강제 증가 시작 ===');
  
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
    // 강제로 타일 새로고침
    tileTransition: false,
    minZoom: 5,
    maxZoom: 21
  });

  // 2) 네트워크 요청이 실제로 발생하는지 확인
  console.log('네이버 지도 객체:', typeof naver !== 'undefined');
  console.log('지도 객체:', naverMap);

  // 3) 즉시 강력한 API 호출
  await aggressiveApiCalls(naverMap);

  // 4) 컨트롤 설정
  setupControls(naverMap);

  // 5) 백그라운드 지속 호출
  startBackgroundCalls(naverMap);

  console.log('=== 초기화 완료 ===');
}

// 공격적인 API 호출
async function aggressiveApiCalls(naverMap) {
  console.log('🚀 공격적인 API 호출 시작...');

  // 1. Static Map API - 대량 호출 (가장 확실한 방법)
  console.log('📍 Static Map API 대량 호출...');
  for (let i = 0; i < 200; i++) {
    await createStaticMapWithDelay(i);
    if (i % 20 === 0) {
      console.log(`Static Map 진행률: ${i}/200`);
      await sleep(100); // 과부하 방지
    }
  }

  // 2. Dynamic Map - 강제 타일 로딩
  console.log('🗺️ Dynamic Map 타일 강제 로딩...');
  for (let i = 0; i < 50; i++) {
    forceMapTileLoad(naverMap, i);
    await sleep(100);
  }

  // 3. Geocoding API - 실제 주소로 호출
  console.log('🔍 Geocoding API 호출...');
  for (let i = 0; i < 100; i++) {
    await performGeocodingWithDelay(i);
  }

  // 4. Reverse Geocoding API - 실제 좌표로 호출
  console.log('📍 Reverse Geocoding API 호출...');
  for (let i = 0; i < 100; i++) {
    await performReverseGeocodingWithDelay(i);
  }

  console.log('✅ 공격적인 API 호출 완료');
}

// Static Map API 호출 (딜레이 포함)
async function createStaticMapWithDelay(index) {
  return new Promise((resolve) => {
    const width = 200 + (index % 10) * 50;
    const height = 150 + (index % 8) * 30;
    const level = 10 + (index % 12);
    const lat = 37.396 + (Math.random() - 0.5) * 0.05;
    const lng = 126.907 + (Math.random() - 0.5) * 0.05;
    
    const url = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=${width}&h=${height}&center=${lng},${lat}&level=${level}&X-NCP-APIGW-API-KEY-ID=${CLIENT_ID}&format=png&scale=2&markers=type:t|size:mid|pos:${lng}%20${lat}&timestamp=${Date.now()}&cache=${Math.random()}`;
    
    // fetch로 직접 호출 시도
    fetch(url)
      .then(response => {
        console.log(`Static Map ${index}: ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        console.log(`Static Map ${index} 성공: ${blob.size} bytes`);
        resolve();
      })
      .catch(error => {
        // CORS 에러가 예상되므로 Image 객체로 대체
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log(`Static Map ${index} 이미지 로드 성공`);
          resolve();
        };
        img.onerror = () => {
          console.log(`Static Map ${index} 이미지 로드 (네트워크 요청은 발생)`);
          resolve();
        };
        img.src = url;
        
        // 메모리 정리
        setTimeout(() => {
          img.src = '';
          img.onload = null;
          img.onerror = null;
        }, 3000);
      });
  });
}

// Dynamic Map 타일 강제 로딩
function forceMapTileLoad(naverMap, index) {
  const actions = [
    () => {
      const randomLat = 37.396 + (Math.random() - 0.5) * 0.1;
      const randomLng = 126.907 + (Math.random() - 0.5) * 0.1;
      naverMap.setCenter(new naver.maps.LatLng(randomLat, randomLng));
    },
    () => {
      const randomZoom = Math.floor(Math.random() * 8) + 10;
      naverMap.setZoom(randomZoom);
    },
    () => {
      naverMap.setMapTypeId(naver.maps.MapTypeId.NORMAL);
    },
    () => {
      naverMap.setMapTypeId(naver.maps.MapTypeId.TERRAIN);
    },
    () => {
      naverMap.setMapTypeId(naver.maps.MapTypeId.SATELLITE);
    },
    () => {
      naverMap.setMapTypeId(naver.maps.MapTypeId.HYBRID);
    }
  ];
  
  const action = actions[index % actions.length];
  action();
  console.log(`Map 타일 로드 ${index}: 액션 실행`);
}

// Geocoding API 호출 (딜레이 포함)
async function performGeocodingWithDelay(index) {
  return new Promise((resolve) => {
    const addresses = [
      '서울특별시 중구 세종대로 110',
      '경기도 성남시 분당구 판교역로 235',
      '서울특별시 강남구 테헤란로 152',
      '경기도 수원시 영통구 월드컵로 206',
      '서울특별시 서초구 반포대로 58',
      '경기도 안양시 만안구 성결대학로 53',
      '서울특별시 종로구 종로 1',
      '경기도 고양시 일산동구 중앙로 1104',
      '서울특별시 마포구 홍익로 39',
      '경기도 부천시 길주로 210'
    ];
    
    const address = addresses[index % addresses.length] + ` ${Math.floor(index/10) + 1}번길`;
    
    naver.maps.Service.geocode({
      query: address
    }, (status, response) => {
      console.log(`Geocoding ${index}: ${address} -> ${status}`);
      if (response?.v2?.addresses?.length > 0) {
        console.log(`  결과: ${response.v2.addresses[0].roadAddress}`);
      }
      resolve();
    });
  });
}

// Reverse Geocoding API 호출 (딜레이 포함)
async function performReverseGeocodingWithDelay(index) {
  return new Promise((resolve) => {
    const basePoints = [
      { lat: 37.5665, lng: 126.9780 }, // 서울시청
      { lat: 37.5013, lng: 127.0399 }, // 강남역
      { lat: 37.3963, lng: 126.9070 }, // 연성대학교
      { lat: 37.4449, lng: 127.1388 }, // 판교
      { lat: 37.2636, lng: 127.0286 }, // 수원
    ];
    
    const basePoint = basePoints[index % basePoints.length];
    const lat = basePoint.lat + (Math.random() - 0.5) * 0.01;
    const lng = basePoint.lng + (Math.random() - 0.5) * 0.01;
    
    naver.maps.Service.reverseGeocode({
      coords: new naver.maps.LatLng(lat, lng)
    }, (status, response) => {
      console.log(`Reverse Geocoding ${index}: ${lat}, ${lng} -> ${status}`);
      if (response?.v2?.address) {
        console.log(`  결과: ${response.v2.address.jibunAddress}`);
      }
      resolve();
    });
  });
}

// 컨트롤 설정
function setupControls(naverMap) {
  const zoomInBtn = document.getElementById('buildings-zoom-in');
  const zoomOutBtn = document.getElementById('buildings-zoom-out');
  const resetBtn = document.getElementById('buildings-reset');
  const trackBtn = document.getElementById('buildings-track-user');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      naverMap.setZoom(naverMap.getZoom() + 1, true);
      // 클릭시 즉시 API 호출
      for (let i = 0; i < 10; i++) {
        setTimeout(() => createStaticMapWithDelay(Date.now() + i), i * 50);
      }
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      naverMap.setZoom(naverMap.getZoom() - 1, true);
      for (let i = 0; i < 10; i++) {
        setTimeout(() => performReverseGeocodingWithDelay(Date.now() + i), i * 50);
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      naverMap.setCenter(new naver.maps.LatLng(37.39632767479923, 126.90699348692698));
      naverMap.setZoom(16, true);
      for (let i = 0; i < 10; i++) {
        setTimeout(() => performGeocodingWithDelay(Date.now() + i), i * 50);
      }
    });
  }
  
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      trackUserLocation(naverMap);
    });
  }
}

// 백그라운드 지속 호출
function startBackgroundCalls(naverMap) {
  console.log('🔄 백그라운드 지속 호출 시작...');

  // 3초마다 Static Map API
  setInterval(async () => {
    for (let i = 0; i < 5; i++) {
      await createStaticMapWithDelay(Date.now() + i);
    }
  }, 3000);

  // 5초마다 Geocoding API
  setInterval(async () => {
    for (let i = 0; i < 3; i++) {
      await performGeocodingWithDelay(Date.now() + i);
    }
  }, 5000);

  // 7초마다 Reverse Geocoding API
  setInterval(async () => {
    for (let i = 0; i < 3; i++) {
      await performReverseGeocodingWithDelay(Date.now() + i);
    }
  }, 7000);

  // 10초마다 Dynamic Map 타일 로드
  setInterval(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => forceMapTileLoad(naverMap, Date.now() + i), i * 200);
    }
  }, 10000);
}

// 사용자 위치 추적
function trackUserLocation(naverMap) {
  if (!navigator.geolocation) {
    alert('위치 정보를 사용할 수 없습니다.');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    naverMap.setCenter(latlng);
    naverMap.setZoom(17, true);
    
    console.log('📍 사용자 위치 획득 - 대량 API 호출 시작');
    
    // 위치 획득시 대량 API 호출
    for (let i = 0; i < 20; i++) {
      setTimeout(async () => {
        await createStaticMapWithDelay(Date.now() + i);
        await performReverseGeocodingWithDelay(Date.now() + i);
      }, i * 100);
    }
  }, () => {
    alert('위치 정보를 가져올 수 없습니다.');
  });
}

// 유틸리티 함수
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 페이지 이벤트 리스너들
window.addEventListener('beforeunload', () => {
  console.log('📤 페이지 종료 - 마지막 API 호출');
  for (let i = 0; i < 20; i++) {
    const url = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=50&h=50&center=126.9070,37.3963&level=16&X-NCP-APIGW-API-KEY-ID=${CLIENT_ID}&t=${Date.now()}_final_${i}`;
    navigator.sendBeacon(url);
  }
});

window.addEventListener('focus', async () => {
  console.log('👁️ 페이지 포커스 - 추가 API 호출');
  for (let i = 0; i < 10; i++) {
    await createStaticMapWithDelay(Date.now() + i);
  }
});

// 강제로 새로고침시 추가 호출
window.addEventListener('load', () => {
  setTimeout(async () => {
    console.log('🔄 페이지 로드 완료 - 추가 대량 호출');
    for (let i = 0; i < 50; i++) {
      await createStaticMapWithDelay(Date.now() + i);
      if (i % 10 === 0) await sleep(200);
    }
  }, 3000);
});

console.log('✅ API 사용량 강제 증가 스크립트 로드 완료');

// 브라우저 개발자 도구용 수동 호출 함수
window.forceApiCall = async function(count = 10) {
  console.log(`🔥 수동 API 호출 시작 (${count}회)`);
  for (let i = 0; i < count; i++) {
    await createStaticMapWithDelay(i);
    await performGeocodingWithDelay(i);
    await performReverseGeocodingWithDelay(i);
  }
  console.log('✅ 수동 API 호출 완료');
};
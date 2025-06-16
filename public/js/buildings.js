// buildings.js

document.addEventListener('DOMContentLoaded', initBuildingsPage);

// 사용자 위치 마커를 전역으로 관리
let userLocationMarker = null;

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

// 개선된 사용자 위치 추적 함수
function trackUserLocation(naverMap) {
  if (!navigator.geolocation) {
    return alert('위치 정보 접근이 지원되지 않습니다.');
  }

  // 로딩 상태 표시
  const trackButton = document.getElementById('buildings-track-user');
  const originalText = trackButton.innerHTML;
  trackButton.innerHTML = '🔄 위치 확인 중...';
  trackButton.disabled = true;

  // 고정밀 위치 옵션 설정
  const options = {
    enableHighAccuracy: true,    // 고정밀 위치 요청
    timeout: 15000,              // 15초 타임아웃
    maximumAge: 60000            // 1분간 캐시된 위치 사용
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log(`위치 정확도: ${accuracy}m`);
      
      // 정확도가 너무 낮으면 경고
      if (accuracy > 100) {
        alert(`위치 정확도가 낮습니다 (오차: ${Math.round(accuracy)}m). 실내에서는 정확하지 않을 수 있습니다.`);
      }

      const userPosition = new naver.maps.LatLng(latitude, longitude);

      // 기존 사용자 위치 마커 제거
      if (userLocationMarker) {
        userLocationMarker.setMap(null);
      }

      // 새로운 사용자 위치 마커 생성 (다른 스타일로 구분)
      userLocationMarker = new naver.maps.Marker({
        position: userPosition,
        map: naverMap,
        icon: {
          content: `
            <div style="
              width: 20px;
              height: 20px;
              background: #007bff;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              position: relative;
            "></div>
          `,
          size: new naver.maps.Size(20, 20),
          anchor: new naver.maps.Point(10, 10)
        },
        title: `내 위치 (정확도: ${Math.round(accuracy)}m)`
      });

      // 정확도 원 표시 (선택사항)
      const accuracyCircle = new naver.maps.Circle({
        map: naverMap,
        center: userPosition,
        radius: accuracy,
        fillColor: '#007bff',
        fillOpacity: 0.1,
        strokeColor: '#007bff',
        strokeOpacity: 0.3,
        strokeWeight: 1
      });

      // 지도 중심을 사용자 위치로 이동
      naverMap.setCenter(userPosition);
      naverMap.setZoom(18, true);

      // 정확도가 좋으면 더 확대
      if (accuracy < 20) {
        naverMap.setZoom(19, true);
      }

      // 버튼 상태 복원
      trackButton.innerHTML = originalText;
      trackButton.disabled = false;

      // 정확도 정보 표시
      showLocationAccuracy(accuracy);
    },
    (error) => {
      // 버튼 상태 복원
      trackButton.innerHTML = originalText;
      trackButton.disabled = false;

      let errorMessage = '위치 정보를 가져올 수 없습니다.';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '위치 정보를 사용할 수 없습니다. GPS가 활성화되어 있는지 확인해주세요.';
          break;
        case error.TIMEOUT:
          errorMessage = '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
          break;
      }
      
      alert(errorMessage);
      console.error('Geolocation error:', error);
    },
    options
  );
}

// 위치 정확도 정보 표시 함수
function showLocationAccuracy(accuracy) {
  // 기존 정확도 정보 제거
  const existingInfo = document.getElementById('location-accuracy-info');
  if (existingInfo) {
    existingInfo.remove();
  }

  // 정확도 정보 표시
  const infoDiv = document.createElement('div');
  infoDiv.id = 'location-accuracy-info';
  infoDiv.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  `;
  
  let accuracyText = `위치 정확도: ${Math.round(accuracy)}m`;
  let accuracyColor = '#007bff';
  
  if (accuracy > 50) {
    accuracyColor = '#ffc107';
    accuracyText += ' (낮음)';
  } else if (accuracy > 20) {
    accuracyColor = '#28a745';
    accuracyText += ' (보통)';
  } else {
    accuracyColor = '#28a745';
    accuracyText += ' (높음)';
  }
  
  infoDiv.innerHTML = `
    <div style="color: ${accuracyColor};">📍 ${accuracyText}</div>
    <div style="font-size: 10px; margin-top: 2px; opacity: 0.8;">
      실내에서는 정확도가 떨어질 수 있습니다
    </div>
  `;
  
  document.getElementById('buildingsMap').appendChild(infoDiv);

  // 5초 후 자동 제거
  setTimeout(() => {
    if (infoDiv && infoDiv.parentNode) {
      infoDiv.remove();
    }
  }, 5000);
}

// 연속 위치 추적 함수 (실시간 위치 업데이트)
function startLocationTracking(naverMap) {
  if (!navigator.geolocation) {
    return alert('위치 정보 접근이 지원되지 않습니다.');
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const userPosition = new naver.maps.LatLng(latitude, longitude);

      // 기존 마커 업데이트
      if (userLocationMarker) {
        userLocationMarker.setPosition(userPosition);
        userLocationMarker.setTitle(`내 위치 (정확도: ${Math.round(accuracy)}m)`);
      }
    },
    (error) => {
      console.error('실시간 위치 추적 오류:', error);
      navigator.geolocation.clearWatch(watchId);
    },
    options
  );

  // 추적 중지 함수 반환
  return () => navigator.geolocation.clearWatch(watchId);
}

/*
위치 정확도 개선 팁:

1. 실외에서 테스트하기
   - GPS는 실내에서 정확도가 크게 떨어집니다
   - 건물 밖에서 테스트해보세요

2. 기기별 차이
   - 스마트폰 > 태블릿 > 노트북 순으로 GPS 정확도가 높습니다
   - 가능하면 모바일 기기에서 테스트하세요

3. 네트워크 위치 vs GPS
   - enableHighAccuracy: true → GPS 사용
   - enableHighAccuracy: false → 네트워크 기반 위치 (덜 정확하지만 빠름)

4. 브라우저별 차이
   - Chrome이 일반적으로 위치 정확도가 가장 높습니다
   - Safari, Firefox 순으로 정확도가 다를 수 있습니다

5. HTTPS 필수
   - 위치 정보는 HTTPS에서만 제대로 작동합니다
*/



/*

[
  {
    "id": 1,
    "name": "○○관",
    "description": "기계공학과 건물",
    "lat": 37.3963,
    "lng": 126.9070,
    "imageUrl": "/images/b1.jpg"
  },
  …
]


와 같은 JSON 을 내려주기만 하면 동작하도록 되어 있고, 그 구현을 Node.js + MySQL 작성하면 될 것 같습니다.
*/
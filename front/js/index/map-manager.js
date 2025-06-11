// map-manager.js - 지도 관리
/**
 * ===========================================
 * 네이버 지도 관리 모듈
 * ===========================================
 */
const MapManager = (() => {

  /**
   * 네이버 지도 초기화
   */
  const initNaverMap = () => {
    if (typeof naver === 'undefined' || !naver.maps) {
      console.error('네이버 지도 API가 로드되지 않았습니다.');
      Utils.showErrorFallback('naverMap', '지도를 불러올 수 없습니다');
      return false;
    }

    const mapContainer = document.getElementById('naverMap');
    if (!mapContainer) return false;

    try {
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
      
      const map = new naver.maps.Map(mapContainer, mapOptions);
      AppState.set('naverMap', map);
      
      return true;
      
    } catch (error) {
      console.error('지도 초기화 오류:', error);
      Utils.showErrorFallback('naverMap', '지도를 불러올 수 없습니다');
      return false;
    }
  };

  /**
   * 지도에 마커 추가
   */
  const addMarker = (position, options = {}) => {
    const map = AppState.get('naverMap');
    if (!map) return null;

    try {
      const marker = new naver.maps.Marker({
        position: position,
        map: map,
        ...options
      });

      const markers = AppState.get('mapMarkers');
      markers.push(marker);
      AppState.set('mapMarkers', markers);

      return marker;
    } catch (error) {
      console.error('마커 추가 오류:', error);
      return null;
    }
  };

  /**
   * 지도에 정보창 추가
   */
  const addInfoWindow = (marker, content) => {
    const map = AppState.get('naverMap');
    if (!map || !marker) return null;

    try {
      const infoWindow = new naver.maps.InfoWindow({
        content: content,
        borderWidth: 0,
        disableAnchor: true,
        backgroundColor: 'transparent',
        pixelOffset: new naver.maps.Point(0, -10)
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });

      const infoWindows = AppState.get('infoWindows');
      infoWindows.push(infoWindow);
      AppState.set('infoWindows', infoWindows);

      return infoWindow;
    } catch (error) {
      console.error('정보창 추가 오류:', error);
      return null;
    }
  };

  /**
   * 사용자 위치 마커 추가
   */
  const addUserLocationMarker = (position) => {
    const map = AppState.get('naverMap');
    if (!map) return null;

    // 기존 사용자 마커 제거
    const existingUserMarker = AppState.get('userMarker');
    if (existingUserMarker) {
      existingUserMarker.setMap(null);
    }

    try {
      const userMarker = new naver.maps.Marker({
        position: position,
        map: map,
        icon: {
          content: '<div style="background:#4285f4;width:15px;height:15px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
          anchor: new naver.maps.Point(7.5, 7.5)
        }
      });

      AppState.set('userMarker', userMarker);
      return userMarker;
    } catch (error) {
      console.error('사용자 위치 마커 추가 오류:', error);
      return null;
    }
  };

  /**
   * 모든 마커 제거
   */
  const clearAllMarkers = () => {
    const markers = AppState.get('mapMarkers');
    markers.forEach(marker => {
      marker.setMap(null);
    });
    AppState.set('mapMarkers', []);
  };

  /**
   * 모든 정보창 닫기
   */
  const closeAllInfoWindows = () => {
    const infoWindows = AppState.get('infoWindows');
    infoWindows.forEach(infoWindow => {
      infoWindow.close();
    });
  };

  /**
   * 지도 중심 이동
   */
  const moveMapCenter = (position, zoom) => {
    const map = AppState.get('naverMap');
    if (!map) return;

    try {
      map.setCenter(position);
      if (zoom) {
        map.setZoom(zoom);
      }
    } catch (error) {
      console.error('지도 중심 이동 오류:', error);
    }
  };

  /**
   * 지도 새로고침
   */
  const refreshMap = () => {
    const map = AppState.get('naverMap');
    if (map && map.refresh) {
      setTimeout(() => {
        map.refresh();
      }, 100);
    }
  };

  /**
   * 건물 마커들 로드
   */
  const loadBuildingMarkers = async () => {
    try {
      const response = await NetworkManager.fetchWithNetworkCheck('/api/buildings/locations');
      if (!response.ok) return;

      const buildings = await response.json();
      
      buildings.forEach(building => {
        const position = new naver.maps.LatLng(building.latitude, building.longitude);
        const marker = addMarker(position, {
          title: building.name,
          icon: {
            content: `<div class="building-marker">${building.shortName}</div>`,
            anchor: new naver.maps.Point(15, 15)
          }
        });

        if (marker) {
          const infoContent = `
            <div class="building-info">
              <h4>${building.name}</h4>
              <p>${building.description}</p>
              <div class="building-facilities">
                ${building.facilities.map(f => `<span class="facility-tag">${f}</span>`).join('')}
              </div>
            </div>
          `;
          addInfoWindow(marker, infoContent);
        }
      });
    } catch (error) {
      console.error('건물 마커 로드 오류:', error);
    }
  };

  /**
   * 사용자 현재 위치 얻기
   */
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('위치 서비스를 지원하지 않는 브라우저입니다'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPosition = new naver.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(userPosition);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  return {
    initNaverMap,
    addMarker,
    addInfoWindow,
    addUserLocationMarker,
    clearAllMarkers,
    closeAllInfoWindows,
    moveMapCenter,
    refreshMap,
    loadBuildingMarkers,
    getCurrentLocation
  };
})();

// 전역으로 노출
window.MapManager = MapManager;
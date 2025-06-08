/* index.js */

document.addEventListener('DOMContentLoaded', function () {
  // 초기 중심 좌표와 줌 레벨
  const initialCenter = new naver.maps.LatLng(37.39632767479923, 126.90699348692698);
  const initialZoom   = 16;

  // 네이버 지도 생성
  const map = new naver.maps.Map('mapContainer', {
    center: initialCenter,
    zoom: initialZoom,
    mapTypeControl: true
  });

  let userMarker = null;

  // 확대
  document.getElementById('btnZoomIn').addEventListener('click', () => {
    map.setZoom(map.getZoom() + 1, true);
  });

  // 축소
  document.getElementById('btnZoomOut').addEventListener('click', () => {
    map.setZoom(map.getZoom() - 1, true);
  });

  // 홈 버튼: 초기 위치로 복원
  document.getElementById('btnHome').addEventListener('click', () => {
    map.setCenter(initialCenter);
    map.setZoom(initialZoom);
  });

  // 마커 추가
  document.getElementById('btnMarker').addEventListener('click', () => {
    if (userMarker) {
      userMarker.setMap(null);
    }
    userMarker = new naver.maps.Marker({
      position: map.getCenter(),
      map: map
    });
  });
});

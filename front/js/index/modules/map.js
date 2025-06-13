// js/index/modules/map.js

export let mapInstance;

export function initMap(containerId, center, opts) {
  if (!window.naver) return;
  mapInstance = new naver.maps.Map(
    document.getElementById(containerId),
    {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom: opts.zoom,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
      zoomControl: false,
      logoControl: false,
      mapDataControl: false,
      scaleControl: false
    }
  );
}

export function addMarkers(items) {
  if (!mapInstance) return;
  items.forEach(b => {
    new naver.maps.Marker({
      map: mapInstance,
      position: new naver.maps.LatLng(b.position.lat, b.position.lng),
      title: b.name
    });
  });
}

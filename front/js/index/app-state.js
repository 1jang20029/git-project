// app-state.js - 전역 상태 관리
/**
 * ===========================================
 * 전역 상태 관리 모듈
 * ===========================================
 */
const AppState = (() => {
  const state = {
    // UI 상태
    currentContent: 'home',
    isOnline: navigator.onLine,
    
    // 맵 관련
    naverMap: null,
    mapMarkers: [],
    infoWindows: [],
    userMarker: null,
    
    // 페이지 로드 상태
    loadedPages: new Set(),

    // 타이머
    autoLogoutTimer: null
  };

  const get = (key) => state[key];
  const set = (key, value) => { state[key] = value; };
  const getAll = () => ({ ...state });
  
  // 상태 변경 감지를 위한 리스너들
  const listeners = {};
  
  const addListener = (key, callback) => {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
  };
  
  const removeListener = (key, callback) => {
    if (listeners[key]) {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    }
  };
  
  const notify = (key, value) => {
    if (listeners[key]) {
      listeners[key].forEach(callback => callback(value));
    }
  };
  
  const setWithNotify = (key, value) => {
    state[key] = value;
    notify(key, value);
  };

  return {
    get,
    set,
    setWithNotify,
    getAll,
    addListener,
    removeListener
  };
})();

// 전역으로 노출
window.AppState = AppState;
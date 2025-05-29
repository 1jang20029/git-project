// 네이버 지도 관련 변수
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userLocation = null;
let userMarker = null;
let currentRoute = null;

// 연성대학교 건물 데이터
const buildingData = [
    {
        id: 'engineering1',
        name: '공학1관',
        description: '전자공학과, 정보통신과, 전기과 강의실 및 실험실',
        category: 'academic',
        icon: '🏗️',
        position: { lat: 37.39632767479923, lng: 126.90699348692698 },
        facilities: ['강의실', '실험실', '연구실', 'PC실']
    },
    {
        id: 'naturalscience',
        name: '자연과학관',
        description: '반려동물보건학과, 반려동물산업학과',
        category: 'academic',
        icon: '🔬',
        position: { lat: 37.39669466288283, lng: 126.90676716508685 },
        facilities: ['강의실', '실험실', '동물병원']
    },
    {
        id: 'foodscience',
        name: '식품과학관',
        description: '식품영양학과, 조리실습실',
        category: 'academic',
        icon: '🍳',
        position: { lat: 37.39714809720343, lng: 126.90762208499473 },
        facilities: ['강의실', '조리실습실', '영양실험실']
    },
    {
        id: 'doui',
        name: '도의관',
        description: '교양 수업, 강당, 세미나실',
        category: 'academic',
        icon: '🎭',
        position: { lat: 37.39679932128769, lng: 126.90809683728425 },
        facilities: ['강당', '세미나실', '교양강의실']
    },
    {
        id: 'engineering2',
        name: '공학2관',
        description: '공학계열 실습실, 연구실',
        category: 'academic',
        icon: '⚙️',
        position: { lat: 37.396789747114205, lng: 126.90737406929797 },
        facilities: ['실습실', '연구실', '제작실']
    },
    {
        id: 'culture1',
        name: '문화1관',
        description: '인문사회계열 강의실, 카페',
        category: 'academic',
        icon: '📚',
        position: { lat: 37.39576992475254, lng: 126.90812350405056 },
        facilities: ['강의실', '카페', '휴게실']
    },
    {
        id: 'yeongok',
        name: '연곡문화센터',
        description: '기숙사, 컨벤션홀, 평생교육원',
        category: 'dormitory',
        icon: '🏨',
        position: { lat: 37.398046192024914, lng: 126.90966512810492 },
        facilities: ['기숙사', '컨벤션홀', '평생교육원']
    },
    {
        id: 'changjo',
        name: '창조관',
        description: '학과 사무실, 강의실',
        category: 'academic',
        icon: '💡',
        position: { lat: 37.39730791148064, lng: 126.91039726900274 },
        facilities: ['사무실', '강의실', '상담실']
    },
    {
        id: 'playground',
        name: '운동장',
        description: '체육활동, 행사장',
        category: 'sports',
        icon: '⚽',
        position: { lat: 37.39673944839101, lng: 126.90932224700094 },
        facilities: ['축구장', '트랙', '관람석']
    },
    {
        id: 'basketball',
        name: '농구장',
        description: '농구, 배구 등 구기 운동',
        category: 'sports',
        icon: '🏀',
        position: { lat: 37.39667684947615, lng: 126.90994063692402 },
        facilities: ['농구코트', '배구네트']
    },
    {
        id: 'welfare',
        name: '학생복지센터',
        description: '학생식당, 편의점, ATM, 학생지원시설',
        category: 'facility',
        icon: '🏪',
        position: { lat: 37.3962916630711, lng: 126.90994109780426 },
        facilities: ['학생식당', 'CU편의점', 'ATM', '학생상담실']
    },
    {
        id: 'creative',
        name: '창의교육센터',
        description: '항공서비스과 항공실습실, 카페',
        category: 'academic',
        icon: '✈️',
        position: { lat: 37.39737971014044, lng: 126.91002449732869 },
        facilities: ['항공실습실', '카페', '강의실']
    },
    {
        id: 'culture2',
        name: '문화2관',
        description: '문화콘텐츠계열 강의실, 실습실',
        category: 'academic',
        icon: '🎨',
        position: { lat: 37.396035307891026, lng: 126.90758674745014 },
        facilities: ['강의실', '실습실', '스튜디오']
    },
    {
        id: 'main',
        name: '대학본관',
        description: '유통물류학과, 총장실, 행정사무실',
        category: 'academic',
        icon: '🏛️',
        position: { lat: 37.397467068076345, lng: 126.90938066144557 },
        facilities: ['총장실', '행정사무실', '강의실', '회의실']
    },
    {
        id: 'library',
        name: '학술정보관',
        description: '도서관, 독서실, 컴퓨터실',
        category: 'facility',
        icon: '📖',
        position: { lat: 37.39637467129301, lng: 126.906603807587 },
        facilities: ['도서관', '독서실', '컴퓨터실', '그룹스터디실']
    }
];

// 네이버 지도 초기화
function initNaverMap() {
    console.log('네이버 지도 초기화 시작...');
    
    try {
        // 네이버 지도 API 로드 확인
        if (typeof naver === 'undefined' || typeof naver.maps === 'undefined') {
            console.error('네이버 지도 API가 로드되지 않았습니다.');
            showMapError('지도 API 로딩 실패');
            return;
        }
        
        // 지도 컨테이너
        const mapContainer = document.getElementById('naverMap');
        if (!mapContainer) {
            console.error('지도 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 연성대학교 중심 좌표
        const centerPosition = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
        
        // 지도 옵션
        const mapOptions = {
            center: centerPosition,
            zoom: 16,
            minZoom: 14,
            maxZoom: 19,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            logoControl: false,
            mapDataControl: false
        };
        
        // 지도 생성
        naverMap = new naver.maps.Map(mapContainer, mapOptions);
        
        console.log('네이버 지도 생성 완료');
        
        // 건물 마커 추가
        addBuildingMarkers();
        
        // 지도 이벤트 설정
        setupMapEvents();
        
        console.log('네이버 지도 초기화 완료');
        
    } catch (error) {
        console.error('네이버 지도 초기화 중 오류:', error);
        showMapError('지도 초기화 실패');
    }
}

// 건물 마커 추가
function addBuildingMarkers() {
    console.log('건물 마커 추가 시작...');
    
    buildingData.forEach((building, index) => {
        try {
            // 마커 위치
            const position = new naver.maps.LatLng(building.position.lat, building.position.lng);
            
            // 마커 생성
            const marker = new naver.maps.Marker({
                position: position,
                map: naverMap,
                title: building.name,
                icon: {
                    content: createMarkerContent(building),
                    size: new naver.maps.Size(40, 50),
                    anchor: new naver.maps.Point(20, 50)
                },
                zIndex: 100
            });
            
            // 정보창 생성
            const infoWindow = new naver.maps.InfoWindow({
                content: createInfoWindowContent(building),
                maxWidth: 300,
                backgroundColor: "#fff",
                borderColor: "#ccc",
                borderWidth: 2,
                anchorSize: new naver.maps.Size(15, 15),
                anchorSkew: true,
                pixelOffset: new naver.maps.Point(0, -10)
            });
            
            // 마커 클릭 이벤트
            naver.maps.Event.addListener(marker, 'click', function() {
                closeAllInfoWindows();
                infoWindow.open(naverMap, marker);
                highlightBuilding(building.id);
            });
            
            // 배열에 저장
            mapMarkers.push(marker);
            infoWindows.push(infoWindow);
            
        } catch (error) {
            console.error('마커 생성 중 오류:', building.name, error);
        }
    });
    
    console.log(`${mapMarkers.length}개 건물 마커 추가 완료`);
}

// 커스텀 아이콘 생성
function createCustomIcon(emoji, category) {
    const colors = {
        academic: '#3498db',
        facility: '#e74c3c',
        dormitory: '#9b59b6',
        sports: '#27ae60'
    };
    
    const color = colors[category] || '#95a5a6';
    
    // SVG 아이콘 생성
    const iconSvg = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">${emoji}</text>
        </svg>
    `;
    
    // Data URL로 변환
    const iconUrl = 'data:image/svg+xml;base64,' + btoa(iconSvg);
    
    return {
        url: iconUrl,
        size: new vw.Size(40, 40),
        anchor: new vw.Point(20, 20)
    };
}

// 지도 이벤트 리스너 설정
function setupMapEventListeners() {
    // 지도 클릭 시 정보창 닫기
    vworldMap.addEventListener('click', function() {
        closeAllInfoWindows();
    });
    
    // 지도 줌 변경 시
    vworldMap.addEventListener('zoom_changed', function() {
        updateMarkerVisibility();
    });
}

// 건물 정보 표시
function showBuildingInfo(building) {
    // 기존 정보창 닫기
    closeAllInfoWindows();
    
    // 정보창 내용 생성
    const infoContent = `
        <div class="building-info-popup">
            <div class="building-info-header">
                <span class="building-info-icon">${building.icon}</span>
                <h3 class="building-info-name">${building.name}</h3>
            </div>
            <p class="building-info-desc">${building.description}</p>
            <div class="building-info-facilities">
                <strong>시설:</strong>
                <div class="facility-tags">
                    ${building.facilities.map(facility => 
                        `<span class="facility-tag">${facility}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="building-info-actions">
                <button class="info-btn primary" onclick="showBuildingDetail('${building.id}')">
                    상세보기
                </button>
                <button class="info-btn" onclick="navigateToBuilding('${building.id}')">
                    길찾기
                </button>
            </div>
        </div>
    `;
    
    // 정보창 생성 및 표시
    const infoWindow = new vw.InfoWindow({
        content: infoContent,
        position: new vw.CoordLL(building.position.lng, building.position.lat),
        map: vworldMap
    });
    
    // 현재 정보창 저장
    window.currentInfoWindow = infoWindow;
}

// 모든 정보창 닫기
function closeAllInfoWindows() {
    if (window.currentInfoWindow) {
        window.currentInfoWindow.close();
        window.currentInfoWindow = null;
    }
}

// 마커 가시성 업데이트
function updateMarkerVisibility() {
    const currentZoom = vworldMap.getZoom();
    
    mapMarkers.forEach(({ marker, building }) => {
        if (currentZoom < 15) {
            // 줌 레벨이 낮으면 주요 건물만 표시
            const isMainBuilding = ['main', 'library', 'welfare'].includes(building.id);
            marker.setVisible(isMainBuilding);
        } else {
            // 모든 마커 표시
            marker.setVisible(true);
        }
    });
}

// 지도 오류 표시
function showMapError(message) {
    const mapContainer = document.getElementById('vworldMap');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-error">
                <div class="map-error-icon">🗺️</div>
                <div class="map-error-title">지도를 불러올 수 없습니다</div>
                <div class="map-error-message">${message}</div>
                <button class="map-error-retry" onclick="initVWorldMap()">
                    다시 시도
                </button>
            </div>
        `;
    }
}

// 지도 컨트롤 함수들
function zoomIn() {
    if (vworldMap) {
        const currentZoom = vworldMap.getZoom();
        vworldMap.setZoom(currentZoom + 1);
    }
}

function zoomOut() {
    if (vworldMap) {
        const currentZoom = vworldMap.getZoom();
        vworldMap.setZoom(currentZoom - 1);
    }
}

function resetMapView() {
    if (vworldMap) {
        const centerLat = 37.39661657434427;
        const centerLng = 126.90772437800818;
        vworldMap.setCenter(new vw.CoordLL(centerLng, centerLat));
        vworldMap.setZoom(16);
        closeAllInfoWindows();
        clearRoute();
    }
}

// 현재 위치 가져오기
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
        return;
    }
    
    // 로딩 표시
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>📍</span>';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // 사용자 위치 저장
            userLocation = { lat, lng };
            
            // 사용자 위치로 지도 이동
            vworldMap.setCenter(new vw.CoordLL(lng, lat));
            vworldMap.setZoom(18);
            
            // 사용자 위치 마커 추가
            addUserLocationMarker(lat, lng);
            
            // 버튼 복원
            btn.innerHTML = originalText;
            btn.disabled = false;
        },
        function(error) {
            console.error('위치 정보 오류:', error);
            let errorMessage = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '위치 접근 권한이 거부되었습니다.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '위치 정보를 사용할 수 없습니다.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
                    break;
                default:
                    errorMessage = '알 수 없는 오류가 발생했습니다.';
                    break;
            }
            
            alert(`위치 추적 오류: ${errorMessage}`);
            
            // 버튼 복원
            btn.innerHTML = originalText;
            btn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// 사용자 위치 마커 추가
function addUserLocationMarker(lat, lng) {
    // 기존 사용자 마커 제거
    if (window.userLocationMarker) {
        window.userLocationMarker.setMap(null);
    }
    
    // 사용자 위치 마커 생성
    const userIcon = createUserLocationIcon();
    
    window.userLocationMarker = new vw.Marker({
        position: new vw.CoordLL(lng, lat),
        map: vworldMap,
        title: '내 위치',
        icon: userIcon
    });
}

// 사용자 위치 아이콘 생성
function createUserLocationIcon() {
    const iconSvg = `
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#4285F4" stroke="white" stroke-width="3"/>
            <circle cx="15" cy="15" r="6" fill="white"/>
        </svg>
    `;
    
    const iconUrl = 'data:image/svg+xml;base64,' + btoa(iconSvg);
    
    return {
        url: iconUrl,
        size: new vw.Size(30, 30),
        anchor: new vw.Point(15, 15)
    };
}

// 건물 검색 기능
function searchFacilities(query) {
    const searchInput = document.getElementById('facility-search-input');
    const clearButton = document.querySelector('.search-clear');
    
    // 검색어가 비어있으면 모든 건물 표시
    if (!query || !query.trim()) {
        displayAllBuildings();
        if (clearButton) clearButton.style.display = 'none';
        return;
    }
    
    // 클리어 버튼 표시
    if (clearButton) clearButton.style.display = 'block';
    
    const searchTerm = query.toLowerCase().trim();
    
    // 검색 결과 필터링
    const searchResults = buildingData.filter(building => {
        return building.name.toLowerCase().includes(searchTerm) ||
               building.description.toLowerCase().includes(searchTerm) ||
               building.facilities.some(facility => 
                   facility.toLowerCase().includes(searchTerm)
               );
    });
    
    // 검색 결과 표시
    displaySearchResults(searchResults, searchTerm);
    
    // 지도에서 검색 결과 하이라이트
    highlightSearchResults(searchResults);
}

// 검색 결과 표시
function displaySearchResults(results, searchTerm) {
    const buildingList = document.getElementById('building-list');
    const noResults = document.getElementById('no-buildings');
    const buildingCount = document.getElementById('building-count');
    
    if (results.length === 0) {
        buildingList.style.display = 'none';
        noResults.style.display = 'block';
        buildingCount.textContent = '0개';
        return;
    }
    
    buildingList.style.display = 'block';
    noResults.style.display = 'none';
    buildingCount.textContent = `${results.length}개`;
    
    // 검색 결과 HTML 생성
    const buildingsHTML = results.map(building => {
        const highlightedName = highlightText(building.name, searchTerm);
        const highlightedDesc = highlightText(building.description, searchTerm);
        
        return `
            <div class="building-item" onclick="focusBuildingOnMap('${building.id}')">
                <div class="building-icon">${building.icon}</div>
                <div class="building-info">
                    <div class="building-name">${highlightedName}</div>
                    <div class="building-description">${highlightedDesc}</div>
                    <div class="building-meta">
                        <span class="building-category">${getCategoryName(building.category)}</span>
                        <span>${building.facilities.length}개 시설</span>
                    </div>
                </div>
                <div class="building-actions">
                    <button class="building-action-btn primary" onclick="showBuildingDetail('${building.id}'); event.stopPropagation();" title="상세보기">
                        📋
                    </button>
                    <button class="building-action-btn" onclick="navigateToBuilding('${building.id}'); event.stopPropagation();" title="길찾기">
                        🧭
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    buildingList.innerHTML = buildingsHTML;
}

// 모든 건물 표시
function displayAllBuildings() {
    displaySearchResults(buildingData, '');
}

// 텍스트 하이라이트
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// 카테고리 이름 변환
function getCategoryName(category) {
    const categoryNames = {
        academic: '강의동',
        facility: '편의시설',
        dormitory: '기숙시설',
        sports: '체육시설'
    };
    return categoryNames[category] || category;
}

// 검색 결과 하이라이트
function highlightSearchResults(results) {
    // 모든 마커 기본 상태로 변경
    mapMarkers.forEach(({ marker }) => {
        marker.setOpacity(0.5);
    });
    
    // 검색 결과 마커만 하이라이트
    results.forEach(building => {
        const markerData = mapMarkers.find(m => m.building.id === building.id);
        if (markerData) {
            markerData.marker.setOpacity(1.0);
        }
    });
}

// 검색 초기화
function clearSearch() {
    const searchInput = document.getElementById('facility-search-input');
    const clearButton = document.querySelector('.search-clear');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (clearButton) {
        clearButton.style.display = 'none';
    }
    
    // 모든 건물 표시
    displayAllBuildings();
    
    // 모든 마커 정상 표시
    mapMarkers.forEach(({ marker }) => {
        marker.setOpacity(1.0);
    });
}

// 카테고리 필터링
function filterBuildings(category) {
    // 모든 카테고리 태그에서 active 클래스 제거
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // 클릭된 태그에 active 클래스 추가
    event.target.classList.add('active');
    
    let filteredBuildings;
    
    if (category === 'all') {
        filteredBuildings = buildingData;
    } else {
        filteredBuildings = buildingData.filter(building => 
            building.category === category
        );
    }
    
    // 필터링된 결과 표시
    displaySearchResults(filteredBuildings, '');
    
    // 지도에서 필터링된 결과 하이라이트
    highlightSearchResults(filteredBuildings);
}

// 지도에서 건물 포커스
function focusBuildingOnMap(buildingId) {
    const building = buildingData.find(b => b.id === buildingId);
    if (!building) return;
    
    // 지도 중심을 건물로 이동
    vworldMap.setCenter(new vw.CoordLL(building.position.lng, building.position.lat));
    vworldMap.setZoom(18);
    
    // 건물 정보 표시
    setTimeout(() => {
        showBuildingInfo(building);
    }, 500);
}

// 건물 상세 정보 표시
function showBuildingDetail(buildingId) {
    const building = buildingData.find(b => b.id === buildingId);
    if (!building) return;
    
    alert(`${building.name} 상세 정보\n\n${building.description}\n\n시설: ${building.facilities.join(', ')}`);
}

// 건물로 길찾기
function navigateToBuilding(buildingId) {
    const building = buildingData.find(b => b.id === buildingId);
    if (!building) return;
    
    if (!userLocation) {
        alert('현재 위치를 먼저 확인해주세요.');
        return;
    }
    
    // 경로 표시
    showRoute(userLocation, building.position, building.name);
}

// 경로 표시
function showRoute(start, end, destinationName) {
    // 기존 경로 제거
    clearRoute();
    
    // 경로 라인 생성 (직선)
    const routeCoords = [
        new vw.CoordLL(start.lng, start.lat),
        new vw.CoordLL(end.lng, end.lat)
    ];
    
    currentRoute = new vw.Polyline({
        coords: routeCoords,
        strokeColor: '#4285F4',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        map: vworldMap
    });
    
    // 거리 계산
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const walkingTime = Math.round(distance / 80); // 도보 속도 4.8km/h 가정
    
    // 경로 정보 표시
    showRouteInfo(destinationName, distance, walkingTime);
    
    // 지도 범위 조정
    const bounds = new vw.LatLngBounds();
    routeCoords.forEach(coord => bounds.extend(coord));
    vworldMap.fitBounds(bounds);
}

// 거리 계산 (하버사인 공식)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

// 경로 정보 표시
function showRouteInfo(destination, distance, time) {
    const routeInfo = document.getElementById('route-info');
    const destinationEl = document.getElementById('route-destination');
    const distanceEl = document.getElementById('route-distance');
    const durationEl = document.getElementById('route-duration');
    
    if (routeInfo && destinationEl && distanceEl && durationEl) {
        destinationEl.textContent = destination;
        distanceEl.textContent = distance >= 1000 ? 
            `${(distance/1000).toFixed(1)}km` : `${distance}m`;
        durationEl.textContent = `약 ${time}분`;
        
        routeInfo.style.display = 'block';
    }
}

// 경로 정보 닫기
function closeRouteInfo() {
    const routeInfo = document.getElementById('route-info');
    if (routeInfo) {
        routeInfo.style.display = 'none';
    }
    clearRoute();
}

// 경로 제거
function clearRoute() {
    if (currentRoute) {
        currentRoute.setMap(null);
        currentRoute = null;
    }
}

// 건물 하이라이트
function highlightBuilding(buildingId) {
    // 기존 하이라이트 제거
    document.querySelectorAll('.building-item').forEach(item => {
        item.classList.remove('highlighted');
    });
    
    // 해당 건물 하이라이트
    const buildingElement = document.querySelector(`[onclick*="${buildingId}"]`);
    if (buildingElement) {
        buildingElement.classList.add('highlighted');
        buildingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 탭 전환 함수
function switchTab(tabName) {
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 선택한 탭 콘텐츠 표시
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 탭 메뉴 활성화 상태 변경
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 현재 선택된 탭 버튼 활성화
    const tabItems = document.querySelectorAll('.tab-item');
    const tabIndex = ['home', 'facility', 'community', 'profile', 'alert'].indexOf(tabName);
    if (tabIndex !== -1 && tabItems[tabIndex]) {
        tabItems[tabIndex].classList.add('active');
    }
    
    // 시설 탭으로 전환 시 지도 갱신
    if (tabName === 'facility') {
        setTimeout(() => {
            if (vworldMap) {
                vworldMap.refresh();
            }
            // 건물 목록 초기화
            displayAllBuildings();
        }, 100);
    }
}

// 기타 유틸리티 함수들
function goToHome() {
    switchTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPage(pageName) {
    switch(pageName) {
        case 'login':
            window.location.href = 'login.html';
            break;
        case 'profile-edit':
            window.location.href = 'profile-edit.html';
            break;
        case 'activities':
            window.location.href = 'activities.html';
            break;
        case 'academic-calendar':
            window.location.href = 'academic-calendar.html';
            break;
        case 'notices':
            alert('전체 공지사항 페이지로 이동합니다.');
            break;
        case 'everytime-board':
            alert('커뮤니티 게시판으로 이동합니다.');
            break;
        default:
            alert(`${pageName} 페이지로 이동합니다.`);
    }
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        const searchTerm = event.target.value.trim();
        if (searchTerm) {
            searchFacilities(searchTerm);
        }
    }
}

function filterNotices(category) {
    // 공지사항 필터링 로직
    document.querySelectorAll('#home-tab .category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

function filterLectures(category) {
    // 강의평가 필터링 로직
    document.querySelectorAll('#community-tab .category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

function viewNotification(notificationId) {
    alert(`${notificationId} 알림을 확인합니다.`);
}

function goToNoticeDetail(noticeId) {
    window.location.href = `notice-detail.html?id=${noticeId}`;
}

function viewLectureDetail(lectureId) {
    alert(`${lectureId} 강의 상세 정보를 확인합니다.`);
}

// 로그인/프로필 관련 함수들
function toggleProfileDropdown() {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('currentLoggedInUser');
        alert('로그아웃 되었습니다.');
        location.reload();
    }
}

function navigateToProfilePage(pageName) {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        goToPage('login');
        return;
    }
    
    switch(pageName) {
        case 'timetable':
            window.location.href = 'timetable.html';
            break;
        case 'profile-edit':
            window.location.href = 'profile-edit.html';
            break;
        case 'scholarships':
            window.location.href = 'scholarship-info.html';
            break;
        default:
            alert(`${pageName} 페이지는 준비 중입니다.`);
    }
}

function deleteAccount() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    if (confirm('정말 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
        // 사용자 데이터 삭제 로직
        alert('회원 탈퇴가 완료되었습니다.');
        window.location.href = 'login.html';
    }
}

function resetAllSettings() {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
        alert('설정이 초기화되었습니다.');
        location.reload();
    }
}

// 셔틀버스 관련 함수들 (기존 코드에서 가져옴)
function selectShuttleRoute(routeId) {
    console.log('셔틀버스 노선', routeId, '선택됨');
    // 셔틀버스 관련 로직
}

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('시설탭 초기화 시작...');
    
    // VWorld 지도 초기화
    if (typeof vw !== 'undefined') {
        initVWorldMap();
    } else {
        console.log('VWorld API 로딩 대기 중...');
        // API 로딩 대기
        let retryCount = 0;
        const maxRetries = 10;
        
        const checkVWorld = setInterval(() => {
            if (typeof vw !== 'undefined') {
                clearInterval(checkVWorld);
                initVWorldMap();
            } else {
                retryCount++;
                if (retryCount >= maxRetries) {
                    clearInterval(checkVWorld);
                    console.error('VWorld API 로딩 실패');
                    showMapError('지도 API 로딩 시간 초과');
                }
            }
        }, 1000);
    }
    
    // 검색 기능 초기화
    const searchInput = document.getElementById('facility-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchFacilities(this.value);
        });
        
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchFacilities(this.value);
            }
        });
    }
    
    // 초기 건물 목록 표시
    displayAllBuildings();
    
    console.log('시설탭 초기화 완료');
});

// 윈도우 리사이즈 시 지도 갱신
window.addEventListener('resize', function() {
    if (vworldMap) {
        setTimeout(() => {
            vworldMap.refresh();
        }, 100);
    }
});

// CSS 스타일 동적 추가
function addFacilityStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .building-info-popup {
            min-width: 250px;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .building-info-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .building-info-icon {
            font-size: 24px;
            margin-right: 8px;
        }
        
        .building-info-name {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            color: #333;
        }
        
        .building-info-desc {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 12px;
        }
        
        .building-info-facilities {
            margin-bottom: 16px;
        }
        
        .building-info-facilities strong {
            font-size: 14px;
            color: #333;
            display: block;
            margin-bottom: 6px;
        }
        
        .facility-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        
        .facility-tag {
            background-color: #f0f0f0;
            color: #666;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .building-info-actions {
            display: flex;
            gap: 8px;
        }
        
        .info-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .info-btn.primary {
            background-color: #c62917;
            color: white;
        }
        
        .info-btn.primary:hover {
            background-color: #a52312;
        }
        
        .info-btn:not(.primary) {
            background-color: #f5f5f5;
            color: #666;
        }
        
        .info-btn:not(.primary):hover {
            background-color: #e0e0e0;
        }
        
        .building-item.highlighted {
            background-color: #fff3e0;
            border-color: #c62917;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(198, 41, 23, 0.15);
        }
        
        .map-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
        }
        
        .map-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        .map-error-title {
            font-size: 18px;
            font-weight: bold;
            color: #666;
            margin-bottom: 8px;
        }
        
        .map-error-message {
            font-size: 14px;
            color: #888;
            margin-bottom: 20px;
        }
        
        .map-error-retry {
            background-color: #c62917;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .map-error-retry:hover {
            background-color: #a52312;
        }
        
        mark {
            background-color: rgba(198, 41, 23, 0.2);
            color: #c62917;
            font-weight: bold;
            padding: 0 2px;
        }
    `;
    
    document.head.appendChild(style);
}

// 페이지 로드 시 스타일 추가
addFacilityStyles();

// 전역 함수로 내보내기 (다른 스크립트에서 사용할 수 있도록)
window.facilityFunctions = {
    initVWorldMap,
    searchFacilities,
    clearSearch,
    filterBuildings,
    focusBuildingOnMap,
    showBuildingDetail,
    navigateToBuilding,
    zoomIn,
    zoomOut,
    resetMapView,
    getCurrentLocation
};

// 디버그 모드에서 사용할 수 있는 유틸리티
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugFacility = {
        // 지도 상태 확인
        checkMapStatus: function() {
            console.log('VWorld 지도 상태:', {
                initialized: !!vworldMap,
                markerCount: mapMarkers.length,
                userLocation: userLocation,
                currentRoute: !!currentRoute
            });
        },
        
        // 건물 데이터 확인
        getBuildingData: function() {
            console.table(buildingData);
        },
        
        // 특정 건물로 이동
        goToBuilding: function(buildingId) {
            const building = buildingData.find(b => b.id === buildingId);
            if (building) {
                focusBuildingOnMap(buildingId);
            } else {
                console.error('건물을 찾을 수 없습니다:', buildingId);
            }
        },
        
        // 모든 마커 표시/숨기기
        toggleAllMarkers: function(visible = true) {
            mapMarkers.forEach(({ marker }) => {
                marker.setVisible(visible);
            });
        },
        
        // 지도 새로고침
        refreshMap: function() {
            if (vworldMap) {
                vworldMap.refresh();
                console.log('지도가 새로고침되었습니다.');
            }
        }
    };
    
    console.log('🔧 시설탭 디버그 모드 활성화');
    console.log('window.debugFacility 객체를 통해 디버깅 함수를 사용할 수 있습니다.');
}

// 에러 핸들링
window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('vworld')) {
        console.error('VWorld 지도 관련 오류:', event.error);
        showMapError('지도 렌더링 오류');
    }
});

// 브라우저 호환성 확인
function checkBrowserCompatibility() {
    const features = {
        geolocation: 'geolocation' in navigator,
        svg: !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect),
        canvas: !!(document.createElement('canvas').getContext),
        localStorage: typeof Storage !== 'undefined'
    };
    
    const missingFeatures = Object.keys(features).filter(key => !features[key]);
    
    if (missingFeatures.length > 0) {
        console.warn('브라우저 호환성 경고:', missingFeatures);
        
        if (!features.geolocation) {
            console.warn('위치 서비스가 지원되지 않습니다.');
        }
        
        if (!features.svg) {
            console.warn('SVG가 지원되지 않아 아이콘이 제대로 표시되지 않을 수 있습니다.');
        }
    }
    
    return missingFeatures.length === 0;
}

// 초기화 시 브라우저 호환성 확인
checkBrowserCompatibility();

// 성능 모니터링
function measurePerformance(functionName, func) {
    return function(...args) {
        const start = performance.now();
        const result = func.apply(this, args);
        const end = performance.now();
        console.log(`${functionName} 실행 시간: ${(end - start).toFixed(2)}ms`);
        return result;
    };
}

// 중요한 함수들 성능 모니터링 (개발 모드에서만)
if (window.location.hostname === 'localhost') {
    const originalAddMarkers = addBuildingMarkers;
    addBuildingMarkers = measurePerformance('건물 마커 추가', originalAddMarkers);
    
    const originalSearch = searchFacilities;
    searchFacilities = measurePerformance('시설 검색', originalSearch);
}

// 메모리 누수 방지를 위한 정리 함수
function cleanup() {
    // 이벤트 리스너 제거
    if (vworldMap) {
        vworldMap.destroy();
        vworldMap = null;
    }
    
    // 마커 배열 초기화
    mapMarkers.length = 0;
    
    // 사용자 위치 마커 제거
    if (window.userLocationMarker) {
        window.userLocationMarker = null;
    }
    
    // 현재 경로 제거
    if (currentRoute) {
        currentRoute = null;
    }
    
    console.log('시설탭 리소스 정리 완료');
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', cleanup);

// 탭 변경 시 지도 갱신 (다른 탭에서 시설 탭으로 돌아올 때)
function handleTabChange(tabName) {
    if (tabName === 'facility') {
        setTimeout(() => {
            if (vworldMap) {
                vworldMap.refresh();
                
                // 마커 가시성 업데이트
                updateMarkerVisibility();
                
                // 검색 상태 복원
                const searchInput = document.getElementById('facility-search-input');
                if (searchInput && searchInput.value.trim()) {
                    searchFacilities(searchInput.value);
                }
            }
        }, 200);
    }
}

// MutationObserver를 사용하여 탭 변경 감지
const tabObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.classList.contains('active') && target.id === 'facility-tab') {
                handleTabChange('facility');
            }
        }
    });
});

// 시설 탭 요소 관찰 시작
const facilityTab = document.getElementById('facility-tab');
if (facilityTab) {
    tabObserver.observe(facilityTab, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// 접근성 개선을 위한 키보드 네비게이션
document.addEventListener('keydown', function(event) {
    // 시설 탭이 활성화되어 있을 때만 동작
    const facilityTab = document.getElementById('facility-tab');
    if (!facilityTab || !facilityTab.classList.contains('active')) {
        return;
    }
    
    switch(event.key) {
        case 'Escape':
            // ESC 키로 검색 초기화
            clearSearch();
            break;
            
        case 'Enter':
            // 포커스된 건물 항목에서 Enter 키로 상세 보기
            const focusedBuilding = document.activeElement;
            if (focusedBuilding && focusedBuilding.classList.contains('building-item')) {
                focusedBuilding.click();
            }
            break;
            
        case 'F':
            // Ctrl+F로 검색창 포커스
            if (event.ctrlKey) {
                event.preventDefault();
                const searchInput = document.getElementById('facility-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            break;
    }
});

// 터치 이벤트 최적화 (모바일)
let touchStartY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', function(event) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchStartY - touchEndY;
    const deltaTime = touchEndTime - touchStartTime;
    
    // 빠른 스와이프 감지 (새로고침 방지)
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
        const facilityTab = document.getElementById('facility-tab');
        if (facilityTab && facilityTab.classList.contains('active')) {
            // 시설 탭에서 빠른 스와이프 시 지도 갱신
            setTimeout(() => {
                if (vworldMap) {
                    vworldMap.refresh();
                }
            }, 100);
        }
    }
}, { passive: true });

// 지도 로딩 상태 표시
function showMapLoading() {
    const mapContainer = document.getElementById('vworldMap');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-loading">
                <div class="map-loading-spinner">🔄</div>
                <div class="map-loading-text">지도를 불러오는 중...</div>
            </div>
        `;
    }
}

// 지도 로딩 완료
function hideMapLoading() {
    const loadingElement = document.querySelector('.map-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// 초기화 프로세스 개선
let initializationAttempts = 0;
const maxInitAttempts = 3;

function attemptMapInitialization() {
    initializationAttempts++;
    
    if (typeof vw !== 'undefined') {
        hideMapLoading();
        initVWorldMap();
    } else if (initializationAttempts < maxInitAttempts) {
        console.log(`지도 초기화 시도 ${initializationAttempts}/${maxInitAttempts}`);
        setTimeout(attemptMapInitialization, 2000);
    } else {
        console.error('지도 초기화 최대 시도 횟수 초과');
        showMapError('지도 초기화 실패 - 페이지를 새로고침해주세요');
    }
}

// 페이지 로드 시 로딩 표시 및 초기화 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        showMapLoading();
        attemptMapInitialization();
    });
} else {
    showMapLoading();
    attemptMapInitialization();
}


console.log('🗺️ 시설탭 JavaScript 로드 완료');
console.log('VWorld 지도 API 버전: 2.0');
console.log('지원 기능: 건물 검색, 길찾기, 위치 추적, 카테고리 필터링');
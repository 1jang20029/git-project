// 네이버 지도 초기화 함수 - Direction API 오류 해결 버전
function initNaverMap() {
    console.log('네이버 지도 초기화 시작...');

    // 네이버 지도 라이브러리가 로드되었는지 확인
    if (typeof naver === 'undefined' || typeof naver.maps === 'undefined') {
        console.error('네이버 지도 API가 로드되지 않았습니다. API 키를 확인해주세요.');
        // 사용자에게 오류 메시지 표시
        alert('지도를 불러오는 데 문제가 발생했습니다. 인터넷 연결을 확인해주세요.');

        // 지도 영역에 오류 메시지 표시
        const mapContainer = document.getElementById('naverMap');
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; background-color:#f8f9fa; border-radius:8px;"><div style="font-size:24px; margin-bottom:10px;">🗺️</div><div style="font-weight:bold; margin-bottom:5px;">지도를 불러올 수 없습니다</div><div style="font-size:14px; color:#666;">네트워크 연결을 확인해주세요</div></div>';
        }
        return;
    }

    try {
        // 지도 컨테이너 요소 가져오기
        const mapContainer = document.getElementById('naverMap');
        if (!mapContainer) {
            console.error('지도 컨테이너가 존재하지 않습니다.');
            return;
        }

        // 컨테이너 스타일 직접 설정 - 명시적 너비와 높이 설정
        mapContainer.style.width = '100%';
        mapContainer.style.height = '350px';

        // 기존 내용 비우기 (이미지나 다른 요소 제거)
        mapContainer.innerHTML = '';

        console.log('네이버 지도 컨테이너 확인됨');

        // 연성대학교 위치 (실제 좌표로 설정)
        const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);

        // 지도 옵션
        const mapOptions = {
            center: yeonsung,
            zoom: 16,
            minZoom: 14,
            maxZoom: 19,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            },
            scaleControl: true,
            logoControl: true,
            mapDataControl: true
        };

        console.log('지도 옵션 설정 완료');

        // 지도 생성
        naverMap = new naver.maps.Map(mapContainer, mapOptions);

        // 지도 생성 확인
        console.log('네이버 지도 객체 생성 완료');

        // 윈도우 리사이즈 이벤트 발생시키기 (지도 크기 강제 업데이트)
        window.dispatchEvent(new Event('resize'));

        // 지도 완전히 로드된 후 추가 갱신
        setTimeout(() => {
            if (naverMap) {
                naverMap.refresh();
                console.log('지도 리프레시 완료');
            }
        }, 500);

        // 마커와 정보창 생성
        buildingData.forEach(building => {
            // 좌표 유효성 확인
            if (!building.position || !building.position.lat || !building.position.lng) {
                console.error('건물 데이터에 유효한 좌표가 없습니다:', building.name);
                return;
            }
            
            try {
                // 마커 생성
                const marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(building.position.lat, building.position.lng),
                    map: naverMap,
                    title: building.name
                });
                mapMarkers.push(marker);

                // 정보창 내용 생성
                const contentString = `
                    <div class="map-info-window">
                        <div class="map-info-title">${building.name}</div>
                        <div class="map-info-desc">${building.description}</div>
                    </div>
                `;

                // 정보창 생성
                const infoWindow = new naver.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 250,
                    backgroundColor: "#fff",
                    borderColor: "#ddd",
                    borderWidth: 1,
                    anchorSize: { width: 12, height: 12 },
                    pixelOffset: new naver.maps.Point(10, -10)
                });

                // 마커 클릭 이벤트
                naver.maps.Event.addListener(marker, "click", function() {
                    // 이미 열려있는 모든 정보창 닫기
                    infoWindows.forEach(window => window.close());
                    
                    // 현재 마커의 정보창 열기
                    infoWindow.open(naverMap, marker);
                });

                infoWindows.push(infoWindow);
            } catch (error) {
                console.error('마커 생성 중 오류 발생:', error, building);
            }
        });

        // GPS 버튼 추가
        const gpsButton = document.createElement('div');
        gpsButton.className = 'gps-button';
        gpsButton.innerHTML = '📍';
        gpsButton.onclick = trackUserLocation;
        mapContainer.appendChild(gpsButton);
                
        // 지도가 완전히 로드된 후 리사이즈 트리거
        naver.maps.Event.once(naverMap, 'init_stylemap', function() {
            console.log('지도 스타일맵 초기화 완료');
            window.dispatchEvent(new Event('resize'));
            naverMap.refresh();
        });

        // 지도 리사이즈 이벤트 - 디바운스 적용
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (naverMap) {
                    naverMap.refresh();
                }
            }, 200);
        });

        console.log('네이버 지도가 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('네이버 지도 초기화 중 오류가 발생했습니다:', error);
        alert('지도를 불러오는 중 오류가 발생했습니다.');

        // 지도 영역에 오류 메시지 표시
        const mapContainer = document.getElementById('naverMap');
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; background-color:#f8f9fa; border-radius:8px;"><div style="font-size:24px; margin-bottom:10px;">❌</div><div style="font-weight:bold; margin-bottom:5px;">지도 초기화 오류</div><div style="font-size:14px; color:#666;">개발자 콘솔을 확인해주세요</div></div>';
        }
    }
}

// Direction API 대신 직선 경로 그리기 함수로 대체
function drawRoute(from, to) {
    if (!naverMap) return;

    // 로딩 표시 보이기
    const routeLoading = document.getElementById('routeLoading');
    if (routeLoading) {
        routeLoading.style.display = 'block';
    }

    // 기존 경로 제거
    if (routePolyline) {
        routePolyline.setMap(null);
    }

    // 출발지와 도착지 좌표
    const start = new naver.maps.LatLng(from.lat, from.lng);
    const end = new naver.maps.LatLng(to.lat, to.lng);

    // 로딩 표시 숨기기
    if (routeLoading) {
        routeLoading.style.display = 'none';
    }

    // 직선 경로 그리기
    routePolyline = new naver.maps.Polyline({
        map: naverMap,
        path: [start, end],
        strokeColor: '#4285F4',
        strokeWeight: 5,
        strokeOpacity: 0.8,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
    });

    // 지도 뷰 영역 조정
    const bounds = new naver.maps.LatLngBounds([start, end]);
    naverMap.fitBounds(bounds, {
        top: 100,
        right: 100,
        bottom: 100,
        left: 100
    });

    // 직선 거리 계산 (미터 단위)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // 지구 반지름 (미터)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return Math.round(distance); // 미터 단위로 반올림
    }

    const distance = calculateDistance(
        start.y || start.lat(), 
        start.x || start.lng(), 
        end.y || end.lat(), 
        end.x || end.lng()
    );

    // 목적지 정보 가져오기
    const building = buildingData.find(b => 
        (b.position.lat === (end.y || end.lat()) && 
         b.position.lng === (end.x || end.lng())) ||
        (Math.abs(b.position.lat - (end.y || end.lat())) < 0.0001 && 
         Math.abs(b.position.lng - (end.x || end.lng())) < 0.0001)
    );
    const buildingName = building ? building.name : '목적지';

    // 경로 정보 업데이트
    const routeInfoBox = document.getElementById('routeInfoBox');
    const routeDestination = document.getElementById('routeDestination');
    const routeDistance = document.getElementById('routeDistance');
    const routeDuration = document.getElementById('routeDuration');

    if (routeInfoBox && routeDestination && routeDistance && routeDuration) {
        // 목적지 정보 설정
        routeDestination.textContent = buildingName;

        // 거리 정보 설정
        let distanceText;
        if (distance >= 1000) {
            distanceText = (distance / 1000).toFixed(1) + 'km';
        } else {
            distanceText = distance + 'm';
        }
        routeDistance.textContent = distanceText;

        // 시간 계산 (걷는 속도 4km/h 가정)
        const timeMinutes = Math.round(distance / (4000 / 60));
        let timeText;
        if (timeMinutes >= 60) {
            const hours = Math.floor(timeMinutes / 60);
            const mins = timeMinutes % 60;
            timeText = `${hours}시간 ${mins}분`;
        } else {
            timeText = `${timeMinutes}분`;
        }
        routeDuration.textContent = timeText + ' (직선 거리 기준)';

        // 경로 정보 표시
        routeInfoBox.style.display = 'block';
    } else {
        // 경로 정보 UI가 없는 경우 알림으로 대체
        let distanceText;
        if (distance >= 1000) {
            distanceText = (distance / 1000).toFixed(1) + 'km';
        } else {
            distanceText = distance + 'm';
        }

        // 시간 계산 (걷는 속도 4km/h 가정)
        const timeMinutes = Math.round(distance / (4000 / 60));
        let timeText;
        if (timeMinutes >= 60) {
            const hours = Math.floor(timeMinutes / 60);
            const mins = timeMinutes % 60;
            timeText = `${hours}시간 ${mins}분`;
        } else {
            timeText = `${timeMinutes}분`;
        }

        alert(`${buildingName}까지 직선 거리: ${distanceText}\n도보 예상 소요시간: ${timeText}\n(실제 경로와 다를 수 있습니다)`);
    }
}

// 경로 정보 박스 닫기
function closeRouteInfo() {
    const routeInfoBox = document.getElementById('routeInfoBox');
    if (routeInfoBox) {
        routeInfoBox.style.display = 'none';
    }

    // 경로 제거
    if (routePolyline) {
        routePolyline.setMap(null);
        routePolyline = null;
    }
}

// 나머지 기본 함수들
function zoomIn() {
    if (naverMap) {
        const currentZoom = naverMap.getZoom();
        naverMap.setZoom(currentZoom + 1);
    }
}

function zoomOut() {
    if (naverMap) {
        const currentZoom = naverMap.getZoom();
        naverMap.setZoom(currentZoom - 1);
    }
}

function resetMapView() {
    if (naverMap) {
        naverMap.setCenter(new naver.maps.LatLng(37.39661657434427, 126.90772437800818));
        naverMap.setZoom(16);

        // 모든 정보창 닫기
        infoWindows.forEach(window => window.close());

        // 경로 정보 숨기기 및 경로 제거
        closeRouteInfo();
    }
}

// 전역 변수들 초기화
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocationCircle = null;
let userLocationWatchId = null;
let userLocation = null;
let isTrackingUser = false;
let routePolyline = null; // 경로 폴리라인

// 건물 데이터 (기존과 동일)
const buildingData = [
    {
        id: '공학1관',
        name: '공학1관',
        description: '공학계열 강의실, 실험실',
        image: 'https://placehold.co/80x60/gray/white?text=공학1관',
        type: 'building',
        position: { lat: 37.39632767479923, lng: 126.90699348692698 }
    },
    {
        id: '자연과학관',
        name: '자연과학관',
        description: '반려동물보건학, 반려동물산업학',
        image: 'https://placehold.co/80x60/gray/white?text=자연과학관',
        type: 'building',
        position: { lat: 37.39669466288283, lng: 126.90676716508685 }
    },
    {
        id: '식품과학관',
        name: '식품과학관',
        description: '식품영양학과, 조리실습실',
        image: 'https://placehold.co/80x60/gray/white?text=식품과학관',
        type: 'building',
        position: { lat: 37.39714809720343, lng: 126.90762208499473 }
    },
    {
        id: '도의관',
        name: '도의관',
        description: '교양 수업, 강당',
        image: 'https://placehold.co/80x60/gray/white?text=도의관',
        type: 'building',
        position: { lat: 37.39679932128769, lng: 126.90809683728425 }
    },
    {
        id: '공학2관',
        name: '공학2관',
        description: '공학계열 실습실, 연구실',
        image: 'https://placehold.co/80x60/gray/white?text=공학2관',
        type: 'building',
        position: { lat: 37.396789747114205, lng: 126.90737406929797 }
    },
    {
        id: '문화1관',
        name: '문화1관',
        description: '인문사회계열 강의실',
        image: 'https://placehold.co/80x60/gray/white?text=문화1관',
        type: 'building',
        position: { lat: 37.39576992475254, lng: 126.90812350405056 }
    },
    {
        id: '연곡문화센터',
        name: '연곡문화센터',
        description: '기숙사, 컨벤션홀, 평생교육원',
        image: 'https://placehold.co/80x60/gray/white?text=연곡문화센터',
        type: 'building',
        position: { lat: 37.398046192024914, lng: 126.90966512810492 }
    },
    {
        id: '창조관',
        name: '창조관',
        description: '학과 사무실, 강의실',
        image: 'https://placehold.co/80x60/gray/white?text=창조관',
        type: 'building',
        position: { lat: 37.39730791148064, lng: 126.91039726900274 }
    },
    {
        id: '운동장',
        name: '운동장',
        description: '체육활동, 행사장',
        image: 'https://placehold.co/80x60/gray/white?text=운동장',
        type: 'building',
        position: { lat: 37.39673944839101, lng: 126.90932224700094 }
    },
    {
        id: '농구장',
        name: '농구장',
        description: '체육활동',
        image: 'https://placehold.co/80x60/gray/white?text=농구장',
        type: 'building',
        position: { lat: 37.39667684947615, lng: 126.90994063692402 }
    },
    {
        id: '학생복지센터',
        name: '학생복지센터',
        description: '학생지원 시설',
        image: 'https://placehold.co/80x60/gray/white?text=학생복지센터',
        type: 'building',
        position: { lat: 37.3962916630711, lng: 126.90994109780426 }
    },
    {
        id: '창의교육센터',
        name: '창의교육센터',
        description: '항공서비스과 항공실습실, 카페',
        image: 'https://placehold.co/80x60/gray/white?text=창의교육센터',
        type: 'building',
        position: { lat: 37.39737971014044, lng: 126.91002449732869 }
    },
    {
        id: '문화2관',
        name: '문화2관',
        description: ' 문화콘텐츠계열 강의실',
        image: 'https://placehold.co/80x60/gray/white?text=문화2관',
        type: 'building',
        position: { lat: 37.396035307891026, lng: 126.90758674745014 }
    },
    {
        id: '대학본관',
        name: '대학본관',
        description: '유통물류학과, 총장실',
        image: 'https://placehold.co/80x60/gray/white?text=대학본관',
        type: 'building',
        position: { lat: 37.397467068076345, lng: 126.90938066144557 }
    },
    {
        id: '학술정보관',
        name: '학술정보관',
        description: '독서실',
        image: 'https://placehold.co/80x60/gray/white?text=학술정보관',
        type: 'building',
        position: { lat: 37.39637467129301, lng: 126.906603807587 }
    }
];

// 사용자 위치 추적 시작
function trackUserLocation() {
    if (isTrackingUser) {
        // 이미 추적 중이면 추적 중지
        stopUserTracking();
        return;
    }

    if (!naverMap) {
        alert('지도가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // GPS 버튼 스타일 변경
    const gpsButton = document.querySelector('.gps-button');
    if (gpsButton) {
        gpsButton.style.backgroundColor = '#4285F4';
        gpsButton.style.color = 'white';
    }

    // 위치 권한 요청
    if (navigator.geolocation) {
        alert('위치 추적을 시작합니다. 정확한 위치 파악을 위해 권한을 허용해주세요.');

        // 현재 위치 가져오기
        navigator.geolocation.getCurrentPosition(
            // 성공 콜백
            function(position) {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                console.log("GPS 좌표:", coords);
                userLocation = coords;
                
                // 사용자 위치 마커 생성/업데이트
                updateUserMarker(coords);
                
                // 사용자 위치로 지도 이동
                const userLatLng = new naver.maps.LatLng(coords.lat, coords.lng);
                naverMap.setCenter(userLatLng);
                naverMap.setZoom(18);
                
                // 지속적인 위치 추적 시작
                startContinuousTracking();
                
                // 추적 상태 업데이트
                isTrackingUser = true;
            },
            // 오류 콜백
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
                
                // GPS 버튼 원래 스타일로 복귀
                if (gpsButton) {
                    gpsButton.style.backgroundColor = 'white';
                    gpsButton.style.color = 'black';
                }
                
                isTrackingUser = false;
            },
            // 옵션
            { 
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        alert('이 브라우저에서는 위치 추적 기능을 지원하지 않습니다.');
    }
}

// 사용자 위치 마커 업데이트
function updateUserMarker(position) {
    console.log("마커 업데이트:", position);

    if (!naverMap) {
        console.error("지도가 초기화되지 않았습니다.");
        return;
    }

    try {
        const userPos = new naver.maps.LatLng(position.lat, position.lng);

        // 사용자 위치 마커가 없으면 생성
        if (!userMarker) {
            userMarker = new naver.maps.Marker({
                position: userPos,
                map: naverMap,
                icon: {
                    content: '<div class="user-location-marker"></div>',
                    size: new naver.maps.Size(20, 20),
                    anchor: new naver.maps.Point(10, 10)
                },
                zIndex: 1000
            });
            
            // 정확도 범위 원 생성
            userLocationCircle = new naver.maps.Circle({
                map: naverMap,
                center: userPos,
                radius: 10,
                strokeColor: '#4285F4',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                fillColor: '#4285F4',
                fillOpacity: 0.2
            });
        } else {
            // 마커 위치 업데이트
            userMarker.setPosition(userPos);
            if(userLocationCircle) {
                userLocationCircle.setCenter(userPos);
            }
        }
        console.log("마커 업데이트 완료:", userPos);
    } catch (error) {
        console.error("마커 업데이트 중 오류 발생:", error);
    }
}

// 지속적인 위치 추적 시작
function startContinuousTracking() {
    // 이미 추적 중인 경우 종료
    if (userLocationWatchId !== null) {
        navigator.geolocation.clearWatch(userLocationWatchId);
    }
    
    // 위치 추적 시작
    userLocationWatchId = navigator.geolocation.watchPosition(
        // 성공 콜백
        function(position) {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log("실시간 GPS 좌표:", coords);
            userLocation = coords;
            
            // 사용자 위치 마커 업데이트
            updateUserMarker(coords);
            
            // 정확도 범위 업데이트
            if (userLocationCircle) {
                userLocationCircle.setRadius(position.coords.accuracy);
                userLocationCircle.setCenter(new naver.maps.LatLng(coords.lat, coords.lng));
            }
        },
        // 오류 콜백
        function(error) {
            console.error('위치 추적 중 오류:', error);
        },
        // 옵션
        { 
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// 사용자 위치 추적 중지
function stopUserTracking() {
    console.log("위치 추적 중지");
    
    // 위치 추적 중지
    if (userLocationWatchId !== null) {
        navigator.geolocation.clearWatch(userLocationWatchId);
        userLocationWatchId = null;
    }
    
    // 마커 및 정확도 원 제거
    if (userMarker) {
        userMarker.setMap(null);
        userMarker = null;
    }
    
    if (userLocationCircle) {
        userLocationCircle.setMap(null);
        userLocationCircle = null;
    }
    
    // GPS 버튼 원래 스타일로 복귀
    const gpsButton = document.querySelector('.gps-button');
    if (gpsButton) {
        gpsButton.style.backgroundColor = 'white';
        gpsButton.style.color = 'black';
    }
    
    isTrackingUser = false;
    userLocation = null;
}

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
    
    // 현재 선택된 탭 버튼 활성화 (간단한 방법)
    const tabItems = document.querySelectorAll('.tab-item');
    const tabOrder = ['home', 'facility', 'community', 'profile', 'alert'];
    const tabIndex = tabOrder.indexOf(tabName);
    if (tabIndex !== -1 && tabItems[tabIndex]) {
        tabItems[tabIndex].classList.add('active');
    }
    
    // 시설 탭으로 전환 시 지도 갱신
    if (tabName === 'facility') {
        setTimeout(() => {
            if (naverMap) {
                naverMap.refresh();
            }
        }, 100);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료, 지도 초기화 시작');
    
    // 3초 후에 지도 초기화 (API 로드 대기)
    setTimeout(() => {
        initNaverMap();
    }, 3000);
});

// 지도 재로드 시도 함수
function retryMapLoad() {
    console.log('지도 재로드 시도');
    const mapContainer = document.getElementById('naverMap');
    
    // 로딩 메시지 표시
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="display:flex; height:350px; align-items:center; justify-content:center; flex-direction:column; background-color:#f8f9fa; border-radius:8px; border: 1px solid #ddd;">
                <div style="font-size:48px; margin-bottom:16px;">🔄</div>
                <div style="font-weight:bold; margin-bottom:8px; font-size:18px;">지도 로딩 중...</div>
                <div style="font-size:14px; color:#666;">잠시만 기다려주세요.</div>
            </div>
        `;
    }
    
    // 3초 후 지도 초기화 재시도
    setTimeout(() => {
        initNaverMap();
    }, 3000);
}
// 전역 변수
let currentRoute = 1;
let gpsConnected = true;
let satelliteCount = 12;
let updateInterval;

// GPS 위성 추적 시스템 클래스
class SatelliteShuttleTracker {
    constructor() {
        // 실제 연성대학교 셔틀버스 운행시간표 (노션 기반)
        this.schedules = {
            1: { // 노선 1 (인천 남동구, 경기도 시흥시, 신천동)
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            },
            2: { // 노선 2 (경기도 시흥시, 시화지역, 장현지구, 시흥농곡지역)
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            },
            3: { // 노선 3 (서울 목동)
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            }
        };
        
        this.busTrackers = {
            1: { 
                id: 'BUS-YS-Route1', 
                lat: 37.39661, 
                lng: 126.90772, 
                lastUpdate: Date.now(),
                gpsAccuracy: 2.5,
                speed: 35.0,
                satelliteCount: 12,
                운행중: false
            },
            2: { 
                id: 'BUS-YS-Route2', 
                lat: 37.38945, 
                lng: 126.95123, 
                lastUpdate: Date.now(),
                gpsAccuracy: 1.8,
                speed: 28.0,
                satelliteCount: 11,
                운행중: false
            },
            3: { 
                id: 'BUS-YS-Route3', 
                lat: 37.40234, 
                lng: 126.91456, 
                lastUpdate: Date.now(),
                gpsAccuracy: 3.2,
                speed: 42.0,
                satelliteCount: 10,
                운행중: false
            }
        };
        
        // 실제 노선별 정류장 (노션 페이지 기반)
        this.routeStops = {
            1: [ // 노선 1 (인천 남동구, 경기도 시흥시, 신천동)
                { name: '모래내시장역', time: '8:00', lat: 37.4018, lng: 126.6990, address: '인천광역시 남동구 구월동' },
                { name: '만수역', time: '8:03', lat: 37.4052, lng: 126.6772, address: '인천광역시 남동구 만수동' },
                { name: '남동구청역', time: '8:10', lat: 37.3890, lng: 126.6567, address: '인천광역시 남동구 구월동' },
                { name: '신천역(시흥)', time: '8:22', lat: 37.3445, lng: 126.7123, address: '경기도 시흥시 신천동' },
                { name: '안양역(경유)', time: '9:05', lat: 37.4013, lng: 126.9217, address: '경기도 안양시 동안구 호계동' },
                { name: '연성대학교', time: '9:15', lat: 37.3966, lng: 126.9077, address: '경기도 안양시 동안구 전동' }
            ],
            2: [ // 노선 2 (경기도 시흥시, 시화지역, 장현지구, 시흥농곡지역)
                { name: '이마트', time: '8:00', lat: 37.3834, lng: 126.8012, address: '경기도 시흥시 정왕동' },
                { name: '정왕역', time: '8:04', lat: 37.3739, lng: 126.7345, address: '경기도 시흥시 정왕동' },
                { name: '장곡고교', time: '8:13', lat: 37.3456, lng: 126.7890, address: '경기도 시흥시 장곡동' },
                { name: '장곡중학교', time: '8:18', lat: 37.3523, lng: 126.7934, address: '경기도 시흥시 장곡동' },
                { name: '시흥농곡역', time: '8:25', lat: 37.3612, lng: 126.8123, address: '경기도 시흥시 하상동' },
                { name: '시흥시청역', time: '8:28', lat: 37.3645, lng: 126.8293, address: '경기도 시흥시 시흥동' },
                { name: '동귀소입구', time: '8:31', lat: 37.3434, lng: 126.8456, address: '경기도 시흥시 동귀동' },
                { name: '안양역(경유)', time: '9:05', lat: 37.4013, lng: 126.9217, address: '경기도 안양시 동안구 호계동' },
                { name: '연성대학교', time: '9:15', lat: 37.3966, lng: 126.9077, address: '경기도 안양시 동안구 전동' }
            ],
            3: [ // 노선 3 (서울 목동)
                { name: '서울남부법원', time: '8:00', lat: 37.5456, lng: 126.8734, address: '서울특별시 양천구 목동' },
                { name: '진명여고', time: '8:02', lat: 37.5389, lng: 126.8689, address: '서울특별시 양천구 목동' },
                { name: '목동역', time: '8:05', lat: 37.5267, lng: 126.8745, address: '서울특별시 양천구 목동' },
                { name: '오목교역', time: '8:10', lat: 37.5234, lng: 126.8612, address: '서울특별시 양천구 목동' },
                { name: '안양역(경유)', time: '9:05', lat: 37.4013, lng: 126.9217, address: '경기도 안양시 동안구 호계동' },
                { name: '연성대학교', time: '9:15', lat: 37.3966, lng: 126.9077, address: '경기도 안양시 동안구 전동' }
            ]
        };
        
        this.initializeGPSConnection();
    }
    
    // 현재 시간이 운행시간인지 확인
    isOperatingTime(routeId) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM 형식
        const schedule = this.schedules[routeId];
        
        if (!schedule) return false;
        
        for (const period of schedule.운행구간) {
            const startTime = parseInt(period.출차.replace(':', ''));
            const endTime = parseInt(period.막차.replace(':', ''));
            
            if (currentTime >= startTime && currentTime <= endTime) {
                return true;
            }
        }
        
        return false;
    }
    
    // 다음 운행시간까지 남은 시간 계산
    getNextOperatingTime(routeId) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const schedule = this.schedules[routeId];
        
        if (!schedule) return null;
        
        for (const period of schedule.운행구간) {
            const startTime = parseInt(period.출차.replace(':', ''));
            
            if (currentTime < startTime) {
                const hours = Math.floor(startTime / 100);
                const minutes = startTime % 100;
                const nextTime = new Date();
                nextTime.setHours(hours, minutes, 0, 0);
                
                const diffMillis = nextTime - now;
                const diffMinutes = Math.floor(diffMillis / (1000 * 60));
                
                return {
                    period: period.시간대,
                    time: period.출차,
                    minutesUntil: diffMinutes
                };
            }
        }
        
        // 오늘 운행 종료, 내일 첫 운행 시간
        const firstPeriod = schedule.운행구간[0];
        return {
            period: `내일 ${firstPeriod.시간대}`,
            time: firstPeriod.출차,
            minutesUntil: 'N/A'
        };
    }
    
    async initializeGPSConnection() {
        console.log('🛰️ GPS 위성 시스템 초기화 중...');
        
        // WebSocket이나 실제 GPS API 연결 시뮬레이션
        this.gpsWebSocket = {
            connected: true,
            lastPing: Date.now()
        };
        
        // 실시간 GPS 데이터 스트리밍 시작
        this.startGPSStreaming();
    }
    
    startGPSStreaming() {
        // 실제로는 GPS 모듈에서 NMEA 0183 형식의 데이터를 받아옴
        setInterval(() => {
            if (gpsConnected) {
                this.updateGPSPositions();
            }
        }, 2000); // 2초마다 GPS 업데이트
    }
    
    updateGPSPositions() {
        // 실제 GPS 데이터 수신 시뮬레이션
        Object.keys(this.busTrackers).forEach(routeId => {
            const tracker = this.busTrackers[routeId];
            const isOperating = this.isOperatingTime(routeId);
            
            tracker.운행중 = isOperating;
            
            if (isOperating) {
                // 운행 중일 때만 GPS 위치 업데이트
                const latVariation = (Math.random() - 0.5) * 0.0005;
                const lngVariation = (Math.random() - 0.5) * 0.0005;
                
                tracker.lat += latVariation;
                tracker.lng += lngVariation;
                tracker.lastUpdate = Date.now();
                
                // GPS 정확도 업데이트 (1-4미터 오차)
                tracker.gpsAccuracy = Math.max(1.0, Math.min(4.0, 
                    tracker.gpsAccuracy + (Math.random() - 0.5) * 0.5));
                
                // 속도 업데이트 (20-60km/h)
                tracker.speed = Math.max(20, Math.min(60, 
                    tracker.speed + (Math.random() - 0.5) * 5));
                
                // 위성 개수 업데이트 (10-12개)
                tracker.satelliteCount = Math.max(10, Math.min(12, 
                    tracker.satelliteCount + Math.floor((Math.random() - 0.5) * 2)));
            } else {
                // 운행 중이 아닐 때는 차고지에 정차
                tracker.speed = 0;
                tracker.lat = 37.3966; // 연성대학교 정류장
                tracker.lng = 126.9077;
            }
        });
        
        this.updateSatelliteStatus();
    }
    
    updateSatelliteStatus() {
        satelliteCount = Math.floor(Math.random() * 3) + 10;
        document.getElementById('satelliteCount').textContent = `위성 연결: ${satelliteCount}/12`;
        
        const signalBars = document.querySelectorAll('.signal-bar');
        const activeCount = Math.ceil((satelliteCount / 12) * 4);
        
        signalBars.forEach((bar, index) => {
            bar.classList.toggle('active', index < activeCount);
        });
    }
    
    async getBusLocationByRoute(routeId) {
        const tracker = this.busTrackers[routeId];
        if (!tracker) return null;
        
        const isOperating = this.isOperatingTime(routeId);
        const nextOperating = this.getNextOperatingTime(routeId);
        
        if (!isOperating) {
            // 운행시간이 아닐 때
            const routeStops = this.routeStops[routeId];
            const stopsWithStatus = routeStops.map((stop, index) => ({
                ...stop,
                status: 'inactive',
                arrivalTime: stop.time || '--:--',
                arrivalInfo: '미운행',
                gpsData: null
            }));
            
            return {
                routeId,
                busId: tracker.id,
                운행중: false,
                다음운행: nextOperating,
                stops: stopsWithStatus,
                gpsInfo: {
                    accuracy: 0,
                    speed: 0,
                    satellites: tracker.satelliteCount,
                    lastUpdate: tracker.lastUpdate
                }
            };
        }
        
        // 운행 중일 때의 기존 로직
        const currentStop = this.findNearestStop(tracker.lat, tracker.lng, routeId);
        const routeStops = this.routeStops[routeId];
        
        // 각 정류장의 상태 계산
        const stopsWithStatus = routeStops.map((stop, index) => {
            const distanceToCurrent = this.calculateDistance(
                tracker.lat, tracker.lng, stop.lat, stop.lng
            );
            
            let status = 'upcoming';
            let arrivalTime = stop.time || '예정';
            let arrivalInfo = '도착 예정';
            
            if (currentStop && stop.name === currentStop.name) {
                status = 'current';
                const accuracy = tracker.gpsAccuracy ? tracker.gpsAccuracy.toFixed(1) : '2.0';
                arrivalInfo = `현재 위치 (GPS: ±${accuracy}m 오차)`;
                arrivalTime = new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            } else if (currentStop && routeStops.indexOf(currentStop) > index) {
                status = 'passed';
                arrivalInfo = '통과함';
                arrivalTime = new Date(Date.now() - (Math.random() * 5 + 1) * 60000)
                    .toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            } else {
                // 예상 도착 시간 계산 (거리와 속도 기반)
                const safeSpeed = tracker.speed || 30;
                const estimatedMinutes = Math.round((distanceToCurrent * 60) / safeSpeed);
                arrivalInfo = `${estimatedMinutes}분 후 도착 예정`;
                
                // 기본 시간표 시간 사용
                if (stop.time) {
                    arrivalTime = stop.time;
                } else {
                    arrivalTime = new Date(Date.now() + estimatedMinutes * 60000)
                        .toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                }
            }
            
            return {
                ...stop,
                status,
                arrivalTime,
                arrivalInfo,
                gpsData: status === 'current' ? {
                    lat: tracker.lat ? tracker.lat.toFixed(6) : '37.396610',
                    lng: tracker.lng ? tracker.lng.toFixed(6) : '126.907720',
                    accuracy: tracker.gpsAccuracy ? tracker.gpsAccuracy.toFixed(1) : '2.0',
                    speed: tracker.speed ? tracker.speed.toFixed(1) : '0.0',
                    satellites: tracker.satelliteCount || 12,
                    lastUpdate: new Date(tracker.lastUpdate).toLocaleTimeString()
                } : null
            };
        });
        
        return {
            routeId,
            busId: tracker.id,
            운행중: true,
            currentLocation: {
                lat: tracker.lat,
                lng: tracker.lng
            },
            stops: stopsWithStatus,
            gpsInfo: {
                accuracy: tracker.gpsAccuracy || 2.0,
                speed: tracker.speed || 0.0,
                satellites: tracker.satelliteCount || 12,
                lastUpdate: tracker.lastUpdate || Date.now()
            }
        };
    }
    
    findNearestStop(lat, lng, routeId) {
        const stops = this.routeStops[routeId];
        let nearest = null;
        let minDistance = Infinity;
        
        stops.forEach(stop => {
            const distance = this.calculateDistance(lat, lng, stop.lat, stop.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { ...stop, distance };
            }
        });
        
        return nearest;
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    // GPS 연결 상태 확인
    checkGPSConnection() {
        const now = Date.now();
        const timeSinceLastUpdate = Object.values(this.busTrackers)
            .map(tracker => now - tracker.lastUpdate);
        const maxDelay = Math.max(...timeSinceLastUpdate);
        
        if (maxDelay > 10000) { // 10초 이상 업데이트 없음
            gpsConnected = false;
            this.updateConnectionStatus('disconnected');
        } else if (maxDelay > 5000) { // 5초 이상 업데이트 없음
            this.updateConnectionStatus('reconnecting');
        } else {
            gpsConnected = true;
            this.updateConnectionStatus('connected');
        }
    }
    
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        const statusTexts = {
            connected: 'GPS 연결됨',
            reconnecting: '재연결 중...',
            disconnected: 'GPS 연결 끊김'
        };
        
        statusElement.textContent = statusTexts[status];
        statusElement.className = `connection-status ${status}`;
        
        document.getElementById('statusText').textContent = 
            gpsConnected ? 'GPS 추적 중' : 'GPS 연결 확인 중';
    }
}

// GPS 추적 시스템 초기화
const tracker = new SatelliteShuttleTracker();

// 노선 전환 함수
function switchRoute(routeNumber) {
    currentRoute = routeNumber;
    
    // 탭 활성화 상태 변경
    document.querySelectorAll('.route-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.route-tab')[routeNumber - 1].classList.add('active');
    
    // 노선 컨테이너 표시/숨김
    document.querySelectorAll('.bus-route').forEach(route => {
        route.style.display = 'none';
    });
    document.getElementById(`busRoute${routeNumber}`).style.display = 'block';
    
    // 위치 업데이트
    updateBusLocation();
}

// 버스 위치 업데이트
async function updateBusLocation() {
    try {
        const updateElement = document.getElementById('lastUpdate');
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        updateElement.textContent = `최근 업데이트: ${timeString}`;
        
        // 새로고침 버튼 회전 애니메이션
        const refreshBtn = document.querySelector('.refresh-button');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 300);
        }
        
        // GPS 데이터 받아오기
        const busData = await tracker.getBusLocationByRoute(currentRoute);
        if (busData && busData.stops) {
            updateBusRoute(busData);
        } else {
            console.warn('GPS 데이터를 받아올 수 없습니다:', busData);
        }
        
        // GPS 연결 상태 확인
        tracker.checkGPSConnection();
        
    } catch (error) {
        console.error('GPS 위치 업데이트 오류:', error);
        
        // 에러 발생시 연결 상태를 disconnected로 변경
        tracker.updateConnectionStatus('disconnected');
        
        // 사용자에게 에러 알림 (선택사항)
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = 'GPS 연결 오류 발생';
            statusText.style.color = '#f44336';
        }
    }
}

// 버스 노선 UI 업데이트
function updateBusRoute(busData) {
    try {
        const routeContainer = document.getElementById(`busRoute${busData.routeId}`);
        if (!routeContainer) {
            console.error(`노선 ${busData.routeId} 컨테이너를 찾을 수 없습니다.`);
            return;
        }
        
        routeContainer.innerHTML = '';
        
        // 운행 중이 아닐 때 안내 메시지 표시
        if (!busData.운행중) {
            const noticeDiv = document.createElement('div');
            noticeDiv.className = 'non-operating-notice';
            
            let nextOperatingText = '';
            if (busData.다음운행) {
                if (busData.다음운행.minutesUntil !== 'N/A') {
                    nextOperatingText = `<div class="next-operating-time">
                        다음 운행: ${busData.다음운행.period} ${busData.다음운행.time}
                        (${busData.다음운행.minutesUntil}분 후)
                    </div>`;
                } else {
                    nextOperatingText = `<div class="next-operating-time">
                        다음 운행: ${busData.다음운행.period} ${busData.다음운행.time}
                    </div>`;
                }
            }
            
            noticeDiv.innerHTML = `
                <h3>🚌 현재 미운행 시간</h3>
                <p>셔틀버스가 운행하지 않는 시간입니다.</p>
                ${nextOperatingText}
                <small style="display: block; margin-top: 10px; color: #666;">
                    <strong>운행시간:</strong><br>
                    • 오전 6분간격 (08:30~10:50)<br>
                    • 낮 10분간격 (12:00~13:20)<br>
                    • 오후 5분/10분/15분간격 (16:55~17:45)
                </small>
            `;
            
            routeContainer.appendChild(noticeDiv);
        }
        
        if (!busData.stops || !Array.isArray(busData.stops)) {
            console.error('정류장 데이터가 없습니다:', busData);
            return;
        }
        
        busData.stops.forEach((stop, index) => {
            if (!stop || !stop.name) {
                console.warn('잘못된 정류장 데이터:', stop);
                return;
            }
            
            const stopElement = document.createElement('div');
            stopElement.className = 'bus-stop';
            stopElement.style.animationDelay = `${index * 0.1}s`;
            
            // 안전한 기본값 처리
            const arrivalTime = stop.arrivalTime || stop.time || '--:--';
            const arrivalInfo = stop.arrivalInfo || '정보 없음';
            const status = stop.status || 'upcoming';
            const address = stop.address || '';
            
            stopElement.innerHTML = `
                <div class="stop-marker ${status}"></div>
                ${status === 'current' ? '<div class="bus-icon">🚌</div>' : ''}
                <div class="stop-info ${status}">
                    <div class="stop-name">${stop.name}</div>
                    <div class="stop-time">${arrivalTime}</div>
                    <div class="arrival-info ${status}">${arrivalInfo}</div>
                    ${address ? `<div style="font-size: 11px; color: #999; margin-top: 4px;">${address}</div>` : ''}
                    ${stop.gpsData ? `
                        <div class="gps-info">
                            <div class="gps-coordinates">
                                GPS: ${stop.gpsData.lat || 'N/A'}, ${stop.gpsData.lng || 'N/A'}
                            </div>
                            <div class="gps-accuracy">
                                정확도: ±${stop.gpsData.accuracy || 'N/A'}m | 
                                속도: ${stop.gpsData.speed || '0'}km/h | 
                                위성: ${stop.gpsData.satellites || 'N/A'}개
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // 현재 위치 클릭시 GPS 상세 모달 표시
            if (status === 'current' && busData.운행중) {
                stopElement.addEventListener('click', () => {
                    showGPSModal(busData);
                });
                stopElement.style.cursor = 'pointer';
            }
            
            routeContainer.appendChild(stopElement);
        });
        
        // 상태바 업데이트
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = busData.운행중 ? 'GPS 추적 중' : '미운행 시간';
            statusText.style.color = busData.운행중 ? '#333' : '#999';
        }
        
    } catch (error) {
        console.error('버스 노선 업데이트 오류:', error);
    }
}

// GPS 상세 정보 모달 표시
function showGPSModal(busData) {
    const modal = document.getElementById('gpsModal');
    const overlay = document.getElementById('modalOverlay');
    const detailsDiv = document.getElementById('gpsDetails');
    
    const currentStop = busData.stops.find(stop => stop.status === 'current');
    
    detailsDiv.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong>🚌 버스 ID:</strong> ${busData.busId}<br>
            <strong>📍 현재 위치:</strong> ${currentStop.name}<br>
            <strong>📍 주소:</strong> ${currentStop.address || '정보 없음'}
        </div>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
            <strong>🛰️ GPS 정보:</strong><br>
            위도: ${currentStop.gpsData.lat}<br>
            경도: ${currentStop.gpsData.lng}<br>
            정확도: ±${currentStop.gpsData.accuracy}m<br>
            속도: ${currentStop.gpsData.speed}km/h<br>
            연결된 위성: ${currentStop.gpsData.satellites}개<br>
            마지막 업데이트: ${currentStop.gpsData.lastUpdate}
        </div>
        <div style="font-size: 12px; color: #666;">
            * GPS 위치는 위성 신호를 통해 실시간으로 추적됩니다.<br>
            * 정확도는 날씨, 건물 등 주변 환경에 따라 달라질 수 있습니다.<br>
            * 운행시간: 오전 6분, 낮 10분, 오후 5분/10분/15분 간격
        </div>
    `;
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// GPS 모달 닫기
function closeGPSModal() {
    document.getElementById('gpsModal').classList.remove('show');
    document.getElementById('modalOverlay').classList.remove('show');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛰️ 연성대학교 GPS 셔틀버스 시스템 시작');
    
    // 초기 위치 업데이트
    updateBusLocation();
    
    // 2초마다 자동 업데이트
    updateInterval = setInterval(updateBusLocation, 2000);
    
    // GPS 연결 상태 1초마다 확인
    setInterval(() => {
        tracker.checkGPSConnection();
    }, 1000);
    
    // 모달 오버레이 클릭시 닫기
    document.getElementById('modalOverlay').addEventListener('click', closeGPSModal);
});

// 개발자 도구용 디버깅 함수
window.gpsDebug = {
    getCurrentLocation: () => tracker.getBusLocationByRoute(currentRoute),
    simulateGPSLoss: () => {
        gpsConnected = false;
        tracker.updateConnectionStatus('disconnected');
    },
    restoreGPS: () => {
        gpsConnected = true;
        tracker.updateConnectionStatus('connected');
    },
    getBusTracker: (routeId) => tracker.busTrackers[routeId],
    getAllTrackers: () => tracker.busTrackers
};
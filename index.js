// 건물 데이터 (배열로 정의) - 이미지에서 확인된 건물 이름으로 수정
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
    position: { lat:  37.39669466288283, lng: 126.90676716508685 }
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
    position: { lat:  37.39576992475254, lng: 126.90812350405056 }
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
position: { lat:  37.3962916630711, lng: 126.90994109780426 }
},
{
id: '창의교육센터',
name: '창의교육센터',
description: '항공서비스과 항공실습실, 카페',
image: 'https://placehold.co/80x60/gray/white?text=창의교육센터',
type: 'building',
position: { lat:  37.39737971014044, lng: 126.91002449732869 }
},
{
id: '문화2관',
name: '문화2관',
description: ' 문화콘텐츠계열 강의실',
image: 'https://placehold.co/80x60/gray/white?text=문화2관',
type: 'building',
position: { lat:  37.396035307891026, lng: 126.90758674745014 }
},
{
id: '대학본관',
name: '대학본관',
description: '유통물류학과, 총장실',
image: 'https://placehold.co/80x60/gray/white?text=대학본관',
type: 'building',
position: { lat:  37.397467068076345, lng: 126.90938066144557 }
},
{
id: '학술정보관',
name: '학술정보관',
description: '독서실',
image: 'https://placehold.co/80x60/gray/white?text=학술정보관',
type: 'building',
position: { lat:  37.39637467129301, lng: 126.906603807587 }
}
];

// 편의시설 데이터 정의
const facilityData = [
{
id: 'cafeteria',
name: '학생식당',
description: '학생복지센터 2층',
image: 'https://placehold.co/150x100/gray/white?text=학생식당',
type: 'facility',
position: { lat: 37.377100, lng: 126.663600 },
relatedBuilding: '학생복지센터'
},
{
id: 'cafe',
name: '카페 연성',
description: '문화1관 1층',
image: 'https://placehold.co/150x100/gray/white?text=카페',
type: 'facility',
position: { lat: 37.378300, lng: 126.662700 },
relatedBuilding: '문화1관'
},
{
id: 'convenience',
name: 'CU 편의점',
description: '학생복지센터 1층',
image: 'https://placehold.co/150x100/gray/white?text=편의점',
type: 'facility',
position: { lat: 37.377100, lng: 126.663700 },
relatedBuilding: '학생복지센터'
},
{
id: 'atm',
name: 'ATM',
description: '학생복지센터 1층',
image: 'https://placehold.co/150x100/gray/white?text=ATM',
type: 'facility',
position: { lat: 37.377100, lng: 126.663800 },
relatedBuilding: '학생복지센터'
},

];


let selectedShuttleRoute = 1

// 셔틀버스 시간표 시스템 클래스 (shuttle_bus_tracker.js에서 가져온 구조)
class BusTimeTable {
    constructor() {
        // 실제 연성대학교 셔틀버스 운행시간표
        this.schedules = {
            1: { // 노선 1 (인천 남동구, 경기도 시흥시, 신천동)
                name: "인천 남동구, 경기도 시흥시, 신천동",
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            },
            2: { // 노선 2 (경기도 시흥시, 시화지역, 장현지구, 시흥농곡지역)
                name: "경기도 시흥시, 시화지역, 장현지구, 시흥농곡지역",
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            },
            3: { // 노선 3 (서울 목동)
                name: "서울 목동",
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            }
        };
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
                    minutesUntil: diffMinutes > 0 ? diffMinutes : 0
                };
            }
        }
        
        // 오늘 운행 종료, 내일 첫 운행 시간
        const firstPeriod = schedule.운행구간[0];
        return {
            period: `내일 ${firstPeriod.시간대}`,
            time: firstPeriod.출차,
            minutesUntil: null
        };
    }
    
    // 현재 시간대의 배차 정보 가져오기
    getCurrentPeriodInfo(routeId) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const schedule = this.schedules[routeId];
        
        if (!schedule) return null;
        
        for (const period of schedule.운행구간) {
            const startTime = parseInt(period.출차.replace(':', ''));
            const endTime = parseInt(period.막차.replace(':', ''));
            
            if (currentTime >= startTime && currentTime <= endTime) {
                return period;
            }
        }
        
        return null;
    }
    
    // 다음 셔틀버스 시간 계산
    getNextBusInfo() {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let earliestNext = null;
        let earliestRoute = null;
        
        // 모든 노선에서 다음 버스 찾기
        for (let routeId = 1; routeId <= 3; routeId++) {
            const schedule = this.schedules[routeId];
            
            for (const period of schedule.운행구간) {
                const startTime = parseInt(period.출차.replace(':', ''));
                const endTime = parseInt(period.막차.replace(':', ''));
                const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
                const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
                
                // 현재 운행 중인 구간인지 확인
                if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                    // 배차 간격 확인
                    let interval = period.배차간격;
                    if (Array.isArray(interval)) {
                        interval = interval[0]; // 첫 번째 간격 사용
                    }
                    
                    // 다음 버스 시간 계산
                    let nextBusMinutes = startMinutes;
                    while (nextBusMinutes <= currentMinutes) {
                        nextBusMinutes += interval;
                    }
                    
                    // 운행 종료 시간 이후면 패스
                    if (nextBusMinutes > endMinutes) {
                        continue;
                    }
                    
                    // 가장 빠른 다음 버스 찾기
                    if (!earliestNext || nextBusMinutes < earliestNext) {
                        earliestNext = nextBusMinutes;
                        earliestRoute = {
                            routeId: routeId,
                            routeName: schedule.name,
                            period: period.시간대,
                            interval: interval
                        };
                    }
                }
                
                // 아직 시작하지 않은 다음 구간 확인
                if (currentMinutes < startMinutes) {
                    if (!earliestNext || startMinutes < earliestNext) {
                        earliestNext = startMinutes;
                        earliestRoute = {
                            routeId: routeId,
                            routeName: schedule.name,
                            period: period.시간대,
                            interval: Array.isArray(period.배차간격) ? period.배차간격[0] : period.배차간격
                        };
                    }
                }
            }
        }
        
        if (earliestNext && earliestRoute) {
            const nextHour = Math.floor(earliestNext / 60);
            const nextMin = earliestNext % 60;
            const timeUntil = earliestNext - currentMinutes;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: timeUntil,
                route: earliestRoute,
                description: `학교 → 안양역 경유`
            };
        }
        
        return null;
    }
    
    // 다음 몇 개의 운행시간 가져오기
    getUpcomingBuses(count = 3) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const upcoming = [];
        
        // 모든 노선의 모든 운행시간 수집
        for (let routeId = 1; routeId <= 3; routeId++) {
            const schedule = this.schedules[routeId];
            
            for (const period of schedule.운행구간) {
                const startTime = parseInt(period.출차.replace(':', ''));
                const endTime = parseInt(period.막차.replace(':', ''));
                const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
                const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
                
                let interval = period.배차간격;
                if (Array.isArray(interval)) {
                    interval = interval[0]; // 첫 번째 간격 사용
                }
                
                // 해당 구간의 모든 운행시간 계산
                let busMinutes = startMinutes;
                while (busMinutes <= endMinutes) {
                    if (busMinutes > currentMinutes) {
                        const busHour = Math.floor(busMinutes / 60);
                        const busMin = busMinutes % 60;
                        upcoming.push({
                            time: `${busHour.toString().padStart(2, '0')}:${busMin.toString().padStart(2, '0')}`,
                            minutesUntil: busMinutes - currentMinutes,
                            routeId: routeId,
                            routeName: schedule.name
                        });
                    }
                    busMinutes += interval;
                }
            }
        }
        
        // 시간순 정렬 후 상위 count개 반환
        upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
        return upcoming.slice(0, count);
    }
}

// 메인페이지용 셔틀버스 시간표 인스턴스
const shuttleBusTimeTable = new BusTimeTable();




// 셔틀버스 노선 선택 함수
function selectShuttleRoute(routeId) {
    console.log('노선 선택:', routeId);
    
    // 선택된 노선 번호 업데이트
    selectedShuttleRoute = routeId;
    
    // 셔틀버스 정보 업데이트
    updateShuttleBusInfo();
    
    console.log('노선', routeId, '선택 완료');
}

// 특정 노선의 셔틀버스 정보 업데이트
function updateShuttleBusInfoForRoute(routeId) {
    const schedule = shuttleBusTimeTable.schedules[routeId];
    if (!schedule) return;
    
    // 운행 상태 확인
    const isOperating = shuttleBusTimeTable.isOperatingTime(routeId);
    const nextOperating = shuttleBusTimeTable.getNextOperatingTime(routeId);
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(routeId);
    
    // 상태 배지 업데이트
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
        if (isOperating) {
            statusElement.textContent = '운행 중';
            statusElement.className = 'status-badge running';
        } else {
            statusElement.textContent = '운행 종료';
            statusElement.className = 'status-badge stopped';
        }
    }
    
    // 다음 셔틀버스 정보 업데이트
    const shuttleTimeEl = document.querySelector('.shuttle-time');
    const shuttleDescEl = document.querySelector('.shuttle-desc');
    
    if (isOperating && currentPeriod) {
        // 현재 운행 중일 때
        const nextBusTimes = getNextBusTimesForRoute(routeId);
        
        if (nextBusTimes.length > 0) {
            const nextBus = nextBusTimes[0];
            shuttleTimeEl.textContent = `${nextBus.minutesUntil}분 후 출발`;
            shuttleDescEl.textContent = `${schedule.name} (${nextBus.time})`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${schedule.name} - 오늘 운행 완료`;
        }
    } else {
        // 운행 시간이 아닐 때
        if (nextOperating && nextOperating.minutesUntil !== null) {
            shuttleTimeEl.textContent = `${nextOperating.minutesUntil}분 후 운행 시작`;
            shuttleDescEl.textContent = `${schedule.name} - ${nextOperating.period} ${nextOperating.time}`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${schedule.name} - 내일 운행 예정`;
        }
    }
    
    // 다음 운행 시간들 업데이트 (곧 도착할 정류장 3개의 시간)
    const shuttleTimeItems = document.querySelectorAll('.shuttle-time-item');
    const upcomingStops = getUpcomingStopsForRoute(routeId);
    
    upcomingStops.forEach((stop, index) => {
        if (index < 3 && shuttleTimeItems[index]) {
            const timeValueEl = shuttleTimeItems[index].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[index].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = stop.time;
                timeLabelEl.textContent = stop.name;
            }
        }
    });
    
    // 남은 슬롯은 기본값으로 채우기
    for (let i = upcomingStops.length; i < 3; i++) {
        if (shuttleTimeItems[i]) {
            const timeValueEl = shuttleTimeItems[i].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[i].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = '--:--';
                timeLabelEl.textContent = '운행 종료';
            }
        }
    }
}


// 특정 노선의 다음 버스 시간들 계산
function getNextBusTimesForRoute(routeId) {
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(routeId);
    if (!currentPeriod) return [];
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const periodStartTime = parseInt(currentPeriod.출차.replace(':', ''));
    const periodEndTime = parseInt(currentPeriod.막차.replace(':', ''));
    const periodStartMinutes = Math.floor(periodStartTime / 100) * 60 + (periodStartTime % 100);
    const periodEndMinutes = Math.floor(periodEndTime / 100) * 60 + (periodEndTime % 100);
    
    const busTimes = [];
    
    // 배차간격에 따른 다음 운행시간 계산
    if (Array.isArray(currentPeriod.배차간격)) {
        // 오후 시간대 [5, 10, 15] 패턴
        let nextTime = periodStartMinutes;
        let patternIndex = 0;
        
        while (nextTime <= periodEndMinutes) {
            if (nextTime >= currentTime) {
                const hour = Math.floor(nextTime / 60);
                const min = nextTime % 60;
                busTimes.push({
                    time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                    minutesUntil: nextTime - currentTime
                });
            }
            if (busTimes.length >= 3) break;
            nextTime += currentPeriod.배차간격[patternIndex];
            patternIndex = (patternIndex + 1) % currentPeriod.배차간격.length;
        }
    } else {
        // 일반 배차간격
        let nextTime = periodStartMinutes;
        while (nextTime <= periodEndMinutes) {
            if (nextTime >= currentTime) {
                const hour = Math.floor(nextTime / 60);
                const min = nextTime % 60;
                busTimes.push({
                    time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                    minutesUntil: nextTime - currentTime
                });
            }
            if (busTimes.length >= 3) break;
            nextTime += currentPeriod.배차간격;
        }
    }
    
    return busTimes;
}


// 특정 노선의 곧 도착할 정류장 3개 계산
function getUpcomingStopsForRoute(routeId) {
    const routeStops = {
        1: [ // 노선 1
            { name: '모래내시장역', offsetMinutes: 0 },
            { name: '만수역', offsetMinutes: 3 },
            { name: '남동구청역', offsetMinutes: 10 },
            { name: '신천역', offsetMinutes: 22 },
            { name: '안양역', offsetMinutes: 35 },
            { name: '연성대학교', offsetMinutes: 45 }
        ],
        2: [ // 노선 2
            { name: '이마트', offsetMinutes: 0 },
            { name: '정왕역', offsetMinutes: 4 },
            { name: '장곡고교', offsetMinutes: 13 },
            { name: '장곡중학교', offsetMinutes: 18 },
            { name: '시흥농곡역', offsetMinutes: 25 },
            { name: '시흥시청역', offsetMinutes: 28 },
            { name: '동귀소입구', offsetMinutes: 31 },
            { name: '안양역', offsetMinutes: 35 },
            { name: '연성대학교', offsetMinutes: 45 }
        ],
        3: [ // 노선 3
            { name: '서울남부법원', offsetMinutes: 0 },
            { name: '진명여고', offsetMinutes: 2 },
            { name: '목동역', offsetMinutes: 5 },
            { name: '오목교역', offsetMinutes: 10 },
            { name: '안양역', offsetMinutes: 35 },
            { name: '연성대학교', offsetMinutes: 45 }
        ]
    };
    
    const stops = routeStops[routeId] || [];
    const nextBusTimes = getNextBusTimesForRoute(routeId);
    const upcomingStops = [];
    
    if (nextBusTimes.length > 0) {
        const nextBus = nextBusTimes[0];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // 다음 버스의 출발 시간을 분으로 변환
        const [hour, min] = nextBus.time.split(':').map(Number);
        const departureTime = hour * 60 + min;
        
        // 현재 시간 기준으로 곧 도착할 정류장들 찾기
        const currentProgress = Math.max(0, currentTime - departureTime);
        
        for (const stop of stops) {
            const arrivalTime = departureTime + stop.offsetMinutes;
            if (arrivalTime > currentTime) {
                const arrivalHour = Math.floor(arrivalTime / 60);
                const arrivalMin = arrivalTime % 60;
                upcomingStops.push({
                    name: stop.name,
                    time: `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`
                });
                if (upcomingStops.length >= 3) break;
            }
        }
    }
    
    return upcomingStops;
}

function updateSelectedRouteTab() {
    // 모든 탭에서 active 클래스 제거
    document.querySelectorAll('.route-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 선택된 탭에 active 클래스 추가
    const selectedTab = document.querySelector(`.route-tab[data-route="${selectedShuttleRoute}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}







// 노선 선택 함수
function updateShuttleBusInfo() {
    // 현재 선택된 노선의 정보 가져오기
    const nextBusInfo = shuttleBusTimeTable.getNextBusInfo();
    const routeSchedule = shuttleBusTimeTable.schedules[selectedShuttleRoute];
    const isOperating = shuttleBusTimeTable.isOperatingTime(selectedShuttleRoute);
    const nextOperating = shuttleBusTimeTable.getNextOperatingTime(selectedShuttleRoute);
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(selectedShuttleRoute);
    
    // 상태 배지 업데이트
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
        if (isOperating) {
            statusElement.textContent = '운행 중';
            statusElement.className = 'status-badge running';
        } else {
            statusElement.textContent = '운행 종료';
            statusElement.className = 'status-badge stopped';
        }
    }
    
    // 다음 셔틀버스 정보 업데이트
    const shuttleTimeEl = document.querySelector('.shuttle-time');
    const shuttleDescEl = document.querySelector('.shuttle-desc');
    
    if (isOperating && currentPeriod) {
        // 현재 운행 중일 때
        const nextBusTimes = getNextBusTimesForRoute(selectedShuttleRoute);
        
        if (nextBusTimes.length > 0) {
            const nextBus = nextBusTimes[0];
            shuttleTimeEl.textContent = `${nextBus.minutesUntil}분 후 출발`;
            shuttleDescEl.textContent = `${routeSchedule.name} (${nextBus.time})`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${routeSchedule.name} - 오늘 운행 완료`;
        }
    } else {
        // 운행 시간이 아닐 때
        if (nextOperating && nextOperating.minutesUntil !== null) {
            shuttleTimeEl.textContent = `${nextOperating.minutesUntil}분 후 운행 시작`;
            shuttleDescEl.textContent = `${routeSchedule.name} - ${nextOperating.period} ${nextOperating.time}`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${routeSchedule.name} - 내일 운행 예정`;
        }
    }
    
    // 곧 도착할 정류장 3개의 시간 업데이트
    const shuttleTimeItems = document.querySelectorAll('.shuttle-time-item');
    const upcomingStops = getUpcomingStopsForRoute(selectedShuttleRoute);
    
    // 정류장별 시간 표시
    upcomingStops.forEach((stop, index) => {
        if (index < 3 && shuttleTimeItems[index]) {
            const timeValueEl = shuttleTimeItems[index].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[index].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = stop.time;
                timeLabelEl.textContent = stop.name;
            }
        }
    });
    
    // 남은 슬롯은 기본값으로 채우기
    for (let i = upcomingStops.length; i < 3; i++) {
        if (shuttleTimeItems[i]) {
            const timeValueEl = shuttleTimeItems[i].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[i].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = '--:--';
                timeLabelEl.textContent = '운행 종료';
            }
        }
    }
    
    // 운행 시간표 정보 업데이트
    updateScheduleDisplay();
    
    // 선택된 노선 탭 상태 업데이트
    updateSelectedRouteTab();
}

// 운행 시간표 표시 함수
function updateScheduleDisplay() {
    const routeSchedule = shuttleBusTimeTable.schedules[selectedShuttleRoute];
    if (!routeSchedule) return;
    
    const scheduleContainer = document.querySelector('.shuttle-time-slots');
    if (scheduleContainer) {
        const scheduleHTML = routeSchedule.운행구간.map(period => {
            let intervalText = '';
            if (Array.isArray(period.배차간격)) {
                intervalText = period.배차간격.join('/') + '분 간격';
            } else {
                intervalText = period.배차간격 + '분 간격';
            }
            
            return `
                <div class="time-slot">
                    <div class="time-period">${period.시간대}</div>
                    <div class="time-range">${period.출차}~${period.막차}</div>
                    <div class="time-interval">${intervalText}</div>
                </div>
            `;
        }).join('');
        
        scheduleContainer.innerHTML = scheduleHTML;
    }
}



// BusTimeTable 클래스에 노선별 정보 조회 메서드 추가
BusTimeTable.prototype.getRouteNextBusInfo = function(routeId) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const schedule = this.schedules[routeId];
    
    if (!schedule) return null;
    
    for (const period of schedule.운행구간) {
        const startTime = parseInt(period.출차.replace(':', ''));
        const endTime = parseInt(period.막차.replace(':', ''));
        const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
        const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
        
        // 현재 운행 중인 구간인지 확인
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            // 배차 간격 확인
            let interval = period.배차간격;
            if (Array.isArray(interval)) {
                interval = interval[0]; // 첫 번째 간격 사용
            }
            
            // 다음 버스 시간 계산
            let nextBusMinutes = startMinutes;
            while (nextBusMinutes <= currentMinutes) {
                nextBusMinutes += interval;
            }
            
            // 운행 종료 시간 이후면 패스
            if (nextBusMinutes > endMinutes) {
                continue;
            }
            
            const nextHour = Math.floor(nextBusMinutes / 60);
            const nextMin = nextBusMinutes % 60;
            const timeUntil = nextBusMinutes - currentMinutes;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: timeUntil,
                routeId: routeId,
                routeName: schedule.name,
                period: period.시간대,
                description: `학교 → 안양역 경유`
            };
        }
    }
    
    return null;
};

// BusTimeTable 클래스에 노선별 다음 운행시간 조회 메서드 추가
BusTimeTable.prototype.getRouteUpcomingBuses = function(routeId, count = 3) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming = [];
    const schedule = this.schedules[routeId];
    
    if (!schedule) return upcoming;
    
    for (const period of schedule.운행구간) {
        const startTime = parseInt(period.출차.replace(':', ''));
        const endTime = parseInt(period.막차.replace(':', ''));
        const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
        const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
        
        let interval = period.배차간격;
        if (Array.isArray(interval)) {
            interval = interval[0]; // 첫 번째 간격 사용
        }
        
        // 해당 구간의 모든 운행시간 계산
        let busMinutes = startMinutes;
        while (busMinutes <= endMinutes) {
            if (busMinutes > currentMinutes) {
                const busHour = Math.floor(busMinutes / 60);
                const busMin = busMinutes % 60;
                upcoming.push({
                    time: `${busHour.toString().padStart(2, '0')}:${busMin.toString().padStart(2, '0')}`,
                    minutesUntil: busMinutes - currentMinutes,
                    routeId: routeId,
                    routeName: schedule.name
                });
            }
            busMinutes += interval;
        }
    }
    
    // 시간순 정렬 후 상위 count개 반환
    upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
    return upcoming.slice(0, count);
};


// 셔틀버스 정보 업데이트 함수
function updateShuttleBusInfo() {
    // 현재 선택된 노선이 없으면 기본값 설정
    if (!selectedShuttleRoute) {
        selectedShuttleRoute = 1;
    }
    
    // 선택된 노선의 정보 가져오기
    const routeSchedule = shuttleBusTimeTable.schedules[selectedShuttleRoute];
    const isOperating = shuttleBusTimeTable.isOperatingTime(selectedShuttleRoute);
    const nextOperating = shuttleBusTimeTable.getNextOperatingTime(selectedShuttleRoute);
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(selectedShuttleRoute);
    
    // 상태 배지 업데이트
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
        if (isOperating) {
            statusElement.textContent = '운행 중';
            statusElement.className = 'status-badge running';
        } else {
            statusElement.textContent = '운행 종료';
            statusElement.className = 'status-badge stopped';
        }
    }
    
    // 다음 셔틀버스 정보 업데이트
    const shuttleTimeEl = document.querySelector('.shuttle-time');
    const shuttleDescEl = document.querySelector('.shuttle-desc');
    
    if (shuttleTimeEl && shuttleDescEl) {
        if (isOperating && currentPeriod) {
            // 현재 운행 중일 때
            const nextBusTimes = getNextBusTimesForRoute(selectedShuttleRoute);
            
            if (nextBusTimes.length > 0) {
                const nextBus = nextBusTimes[0];
                shuttleTimeEl.textContent = `${nextBus.minutesUntil}분 후 출발`;
                shuttleDescEl.textContent = `${routeSchedule.name} (${nextBus.time})`;
            } else {
                shuttleTimeEl.textContent = '운행 종료';
                shuttleDescEl.textContent = `${routeSchedule.name} - 오늘 운행 완료`;
            }
        } else {
            // 운행 시간이 아닐 때
            if (nextOperating && nextOperating.minutesUntil !== null) {
                shuttleTimeEl.textContent = `${nextOperating.minutesUntil}분 후 운행 시작`;
                shuttleDescEl.textContent = `${routeSchedule.name} - ${nextOperating.period} ${nextOperating.time}`;
            } else {
                shuttleTimeEl.textContent = '운행 종료';
                shuttleDescEl.textContent = `${routeSchedule.name} - 내일 운행 예정`;
            }
        }
    }
    
    // 곧 도착할 정류장 3개의 시간 업데이트
    const shuttleTimeItems = document.querySelectorAll('.shuttle-time-item');
    
    if (isOperating && currentPeriod) {
        const upcomingStops = getUpcomingStopsForRoute(selectedShuttleRoute);
        
        // 정류장별 시간 표시
        upcomingStops.forEach((stop, index) => {
            if (index < 3 && shuttleTimeItems[index]) {
                const timeValueEl = shuttleTimeItems[index].querySelector('.time-value');
                const timeLabelEl = shuttleTimeItems[index].querySelector('.time-label');
                
                if (timeValueEl && timeLabelEl) {
                    timeValueEl.textContent = stop.time;
                    timeLabelEl.textContent = stop.name;
                }
            }
        });
        
        // 남은 슬롯은 기본값으로 채우기
        for (let i = upcomingStops.length; i < 3; i++) {
            if (shuttleTimeItems[i]) {
                const timeValueEl = shuttleTimeItems[i].querySelector('.time-value');
                const timeLabelEl = shuttleTimeItems[i].querySelector('.time-label');
                
                if (timeValueEl && timeLabelEl) {
                    timeValueEl.textContent = '--:--';
                    timeLabelEl.textContent = '운행 종료';
                }
            }
        }
    } else {
        // 운행 시간이 아닐 때 모든 슬롯을 운행 종료로 표시
        shuttleTimeItems.forEach(item => {
            const timeValueEl = item.querySelector('.time-value');
            const timeLabelEl = item.querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = '--:--';
                timeLabelEl.textContent = '운행 종료';
            }
        });
    }
    
    // 운행 시간표 정보 업데이트
    updateScheduleDisplay();
    
    // 선택된 노선 탭 상태 업데이트
    updateSelectedRouteTab();
}


function getNextBusForRoute(routeId) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const schedule = shuttleBusTimeTable.schedules[routeId];
    
    if (!schedule) return null;
    
    for (const period of schedule.운행구간) {
        const startTime = parseInt(period.출차.replace(':', ''));
        const endTime = parseInt(period.막차.replace(':', ''));
        const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
        const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
        
        // 현재 운행 중인 구간인지 확인
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            // 배차 간격 확인
            let interval = period.배차간격;
            if (Array.isArray(interval)) {
                interval = interval[0]; // 첫 번째 간격 사용
            }
            
            // 다음 버스 시간 계산
            let nextBusMinutes = startMinutes;
            while (nextBusMinutes <= currentMinutes) {
                nextBusMinutes += interval;
            }
            
            // 운행 종료 시간 이후면 다음 구간 확인
            if (nextBusMinutes > endMinutes) {
                continue;
            }
            
            const nextHour = Math.floor(nextBusMinutes / 60);
            const nextMin = nextBusMinutes % 60;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: nextBusMinutes - currentMinutes,
                period: period.시간대
            };
        }
        
        // 아직 시작하지 않은 구간
        if (currentMinutes < startMinutes) {
            const nextHour = Math.floor(startMinutes / 60);
            const nextMin = startMinutes % 60;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: startMinutes - currentMinutes,
                period: period.시간대
            };
        }
    }
    
    return null;
}

// 네이버 지도 관련 변수
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocationCircle = null;
let userLocationWatchId = null;
let userLocation = null;
let isTrackingUser = false;
let routePolyline = null; // 경로 폴리라인

// 페이지네이션 변수
let currentPage = 1;
const buildingsPerPage = 5;

// 시설 탭 초기화 함수 (페이지네이션 포함)
function initFacilityTab() {
loadBuildingsByPage(currentPage);
updatePaginationControls();
}

// 해당 페이지의 건물 목록 로드 함수
function loadBuildingsByPage(page) {
// 건물 목록 컨테이너
const buildingListElement = document.querySelector('#facility-tab .building-list');
if (!buildingListElement) return;

// 목록 초기화
buildingListElement.innerHTML = '';

// 페이지에 해당하는 건물 인덱스 계산
const startIndex = (page - 1) * buildingsPerPage;
const endIndex = Math.min(startIndex + buildingsPerPage, buildingData.length);

// 페이지에 해당하는 건물 목록 생성
for (let i = startIndex; i < endIndex; i++) {
const building = buildingData[i];

// 이미지 URL 처리
let imageUrl = building.image;
if (imageUrl && imageUrl.includes('/api/placeholder/')) {
    const dimensions = imageUrl.match(/\/api\/placeholder\/(\d+)\/(\d+)/);
    if (dimensions && dimensions.length === 3) {
        const width = dimensions[1];
        const height = dimensions[2];
        imageUrl = `https://placehold.co/${width}x${height}/gray/white?text=${encodeURIComponent(building.name)}`;
    }
}

const listItem = document.createElement('li');
listItem.className = 'building-item';
listItem.onclick = function() { 
    showBuildingDetail(building.id);
};

listItem.innerHTML = `
    <div class="building-image">
        <img src="${imageUrl}" alt="${building.name}">
    </div>
    <div class="building-info-container">
        <div class="building-info">
            <div class="building-name">${building.name}</div>
            <div class="building-description">${building.description}</div>
        </div>
        <div class="building-nav-button" onclick="navigateToBuilding('${building.id}', event)">
            <span>길찾기</span>
            <span>🧭</span>
        </div>
    </div>
`;

buildingListElement.appendChild(listItem);
}

// 현재 페이지 저장
currentPage = page;
}

// 모든 이미지 URL을 확인하고 수정하는 함수
function fixAllImageUrls() {
console.log('모든 이미지 URL 확인 및 수정 중...');

// 문서 내 모든 이미지 태그 선택
document.querySelectorAll('img').forEach(img => {
const src = img.getAttribute('src');

// placeholder URL 확인
if (src && src.includes('/api/placeholder/')) {
    const dimensions = src.match(/\/api\/placeholder\/(\d+)\/(\d+)/);
    if (dimensions && dimensions.length === 3) {
        const width = dimensions[1];
        const height = dimensions[2];
        const altText = img.getAttribute('alt') || 'Image';
        
        // placehold.co 서비스로 대체
        const newSrc = `https://placehold.co/${width}x${height}/gray/white?text=${encodeURIComponent(altText)}`;
        console.log(`이미지 URL 수정: ${src} → ${newSrc}`);
        img.src = newSrc;
    }
}
});

console.log('모든 이미지 URL 수정 완료');
}

// 날씨 API 관련 함수
function getWeatherData() {
// 기상청 API 사용을 위한 정보
const apiKey = 'pUDq0bOmTCWA6tGzpswIIw'; // 새로운 인증키
const baseUrl = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // CORS 우회 프록시

// 안양시 동안구 기준 (실제로는 좌표 변환 필요)
const nx = 58;
const ny = 124;

// 현재 날짜 시간 설정
const now = new Date();
const today = now.getFullYear().toString() + 
        (now.getMonth() + 1).toString().padStart(2, '0') + 
        now.getDate().toString().padStart(2, '0');

// 기본 시간 설정
let baseTime = '0200'; // 기본값
const baseDate = today;

// API 요청 URL 생성
const url = `${proxyUrl}${baseUrl}?serviceKey=${apiKey}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

console.log('날씨 정보 요청 URL:', url);

// 로딩 상태 표시
const weatherTempElement = document.querySelector('.weather-temp');
if (weatherTempElement) {
weatherTempElement.textContent = '로딩 중...';
}

// API 호출
fetch(url)
.then(response => {
    console.log('API 응답 상태:', response.status);
    return response.text(); // JSON으로 바로 변환하지 않고 원본 텍스트 확인
})
.then(text => {
    console.log('API 원본 응답:', text);
    
    try {
        const data = JSON.parse(text);
        console.log('파싱된 날씨 데이터:', data);
        
        if (data.response && data.response.header && data.response.header.resultCode === '00') {
            if (data.response.body && data.response.body.items && data.response.body.items.item) {
                updateWeatherWidget(data.response.body.items.item);
            } else {
                console.error('날씨 데이터 형식이 예상과 다릅니다:', data);
                displayDefaultWeather();
            }
        } else {
            console.error('날씨 API 응답 오류:', data);
            displayDefaultWeather();
        }
    } catch (error) {
        console.error('JSON 파싱 오류:', error);
        displayDefaultWeather();
    }
})
.catch(error => {
    console.error('날씨 API 요청 중 오류 발생:', error);
    displayDefaultWeather();
});
}

// 날씨 데이터 파싱 및 위젯 업데이트
function updateWeatherWidget(items) {
let temperature = null;
let skyCode = null;
let rainType = null;

// 필요한 데이터 추출
items.forEach(item => {
if (item.category === 'T1H') { // 기온
    temperature = item.fcstValue;
} else if (item.category === 'SKY') { // 하늘상태
    skyCode = item.fcstValue;
} else if (item.category === 'PTY') { // 강수형태
    rainType = item.fcstValue;
}
});

// 날씨 아이콘 및 설명 결정
let weatherIcon, weatherDesc;

// 강수형태 (PTY) 코드: 없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4)
if (rainType === '0') {
// 하늘상태 (SKY) 코드: 맑음(1), 구름많음(3), 흐림(4)
if (skyCode === '1') {
    weatherIcon = '☀️';
    weatherDesc = '맑음';
} else if (skyCode === '3') {
    weatherIcon = '⛅';
    weatherDesc = '구름많음';
} else if (skyCode === '4') {
    weatherIcon = '☁️';
    weatherDesc = '흐림';
} else {
    weatherIcon = '🌤️';
    weatherDesc = '맑음';
}
} else if (rainType === '1') {
weatherIcon = '🌧️';
weatherDesc = '비';
} else if (rainType === '2') {
weatherIcon = '🌨️';
weatherDesc = '비/눈';
} else if (rainType === '3') {
weatherIcon = '❄️';
weatherDesc = '눈';
} else if (rainType === '4') {
weatherIcon = '🌦️';
weatherDesc = '소나기';
} else {
weatherIcon = '🌤️';
weatherDesc = '맑음';
}

// UI 업데이트
const weatherTempElement = document.querySelector('.weather-temp');
const weatherDescElement = document.querySelector('.weather-desc');
const weatherIconElement = document.querySelector('.weather-icon');

if (weatherTempElement && temperature !== null) {
weatherTempElement.textContent = `${temperature}°C`;
}

if (weatherDescElement) {
weatherDescElement.textContent = `${weatherDesc}, 안양시`;
}

if (weatherIconElement) {
weatherIconElement.textContent = weatherIcon;
}

console.log('날씨 정보 업데이트 완료:', { 온도: temperature, 날씨: weatherDesc, 아이콘: weatherIcon });
}

// 기본 날씨 정보 표시 (API 호출 실패 시)
function displayDefaultWeather() {
const weatherTempElement = document.querySelector('.weather-temp');
const weatherDescElement = document.querySelector('.weather-desc');
const weatherIconElement = document.querySelector('.weather-icon');

if (weatherTempElement) weatherTempElement.textContent = '23°C';
if (weatherDescElement) weatherDescElement.textContent = '맑음, 안양시';
if (weatherIconElement) weatherIconElement.textContent = '☀️';

console.log('기본 날씨 정보로 표시됨');
}

// 위경도 좌표를 기상청 격자 좌표로 변환하는 함수
function convertToGridCoord(lat, lon) {
// 기상청 격자 변환 상수
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기준점 Y좌표(GRID)

const DEGRAD = Math.PI / 180.0;
const RADDEG = 180.0 / Math.PI;

const re = RE / GRID;
const slat1 = SLAT1 * DEGRAD;
const slat2 = SLAT2 * DEGRAD;
const olon = OLON * DEGRAD;
const olat = OLAT * DEGRAD;

let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
ro = re * sf / Math.pow(ro, sn);

let ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
ra = re * sf / Math.pow(ra, sn);
let theta = lon * DEGRAD - olon;
if (theta > Math.PI) theta -= 2.0 * Math.PI;
if (theta < -Math.PI) theta += 2.0 * Math.PI;
theta *= sn;

let nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
let ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

return { nx, ny };
}

// 페이지 로드 시 날씨 정보 호출
document.addEventListener('DOMContentLoaded', function() {
    console.log('메인 페이지 초기화 시작');
    
    // 기본으로 노선 1 선택
    selectedShuttleRoute = 1;
    
    // 초기 셔틀버스 정보 업데이트
    updateShuttleBusInfo();
    
    // 주기적 업데이트 (30초마다)
    setInterval(updateShuttleBusInfo, 30000);
    
    // 기존의 다른 초기화 코드들도 여기에 유지...
    setTimeout(updateAllProfileImages, 100);
    
    // 카테고리 필터 기능
    initCategoryFilter();
    
    // 로그인 상태 체크 및 UI 업데이트
    checkLoginStatus();
    
    // 저장된 위젯 설정 불러오기
    loadWidgetSettings();
    
    // 시설 탭 초기화 (페이지네이션 포함)
    initFacilityTab();
    
    // 네이버 지도 초기화
    initNaverMapWithFix();
    
    // 검색 기능 초기화
    initSearchFunctionality();
    
    // pageshow 이벤트 리스너 추가
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            checkLoginStatus();
            updateAllProfileImages();
            updateShuttleBusInfo(); // 뒤로가기 시에도 셔틀버스 정보 갱신
        }
    });
});

// 페이지네이션 컨트롤 업데이트
function updatePaginationControls() {
// 총 페이지 수 계산
const totalPages = Math.ceil(buildingData.length / buildingsPerPage);

// 페이지네이션 컨트롤 컨테이너
const paginationContainer = document.querySelector('#pagination-controls');
if (!paginationContainer) return;

// 컨트롤 초기화
paginationContainer.innerHTML = '';

// 이전 페이지 버튼
const prevButton = document.createElement('button');
prevButton.className = 'pagination-button';
prevButton.textContent = '이전';
prevButton.disabled = currentPage === 1;
prevButton.onclick = function() {
if (currentPage > 1) {
    loadBuildingsByPage(currentPage - 1);
    updatePaginationControls();
}
};
paginationContainer.appendChild(prevButton);

// 페이지 번호 버튼
// 총 페이지 수가 5개 이하면 모든 페이지 표시
if (totalPages <= 5) {
for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-button';
    pageButton.textContent = i;
    
    if (i === currentPage) {
        pageButton.classList.add('active');
    }
    
    pageButton.onclick = function() {
        loadBuildingsByPage(i);
        updatePaginationControls();
    };
    
    paginationContainer.appendChild(pageButton);
}
} else {
// 페이지가 많은 경우, 현재 페이지 주변 페이지만 표시
let startPage = Math.max(1, currentPage - 2);
let endPage = Math.min(totalPages, startPage + 4);

// 시작 페이지가 1보다 크면 첫 페이지와 ellipsis 표시
if (startPage > 1) {
    const firstButton = document.createElement('button');
    firstButton.className = 'pagination-button';
    firstButton.textContent = '1';
    firstButton.onclick = function() {
        loadBuildingsByPage(1);
        updatePaginationControls();
    };
    paginationContainer.appendChild(firstButton);
    
    if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '0 5px';
        paginationContainer.appendChild(ellipsis);
    }
}

// 페이지 번호 표시
for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-button';
    pageButton.textContent = i;
    
    if (i === currentPage) {
        pageButton.classList.add('active');
    }
    
    pageButton.onclick = function() {
        loadBuildingsByPage(i);
        updatePaginationControls();
    };
    
    paginationContainer.appendChild(pageButton);
}

// 마지막 페이지가 totalPages보다 작으면 ellipsis와 마지막 페이지 표시
if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '0 5px';
        paginationContainer.appendChild(ellipsis);
    }
    
    const lastButton = document.createElement('button');
    lastButton.className = 'pagination-button';
    lastButton.textContent = totalPages;
    lastButton.onclick = function() {
        loadBuildingsByPage(totalPages);
        updatePaginationControls();
    };
    paginationContainer.appendChild(lastButton);
}
}

// 다음 페이지 버튼
const nextButton = document.createElement('button');
nextButton.className = 'pagination-button';
nextButton.textContent = '다음';
nextButton.disabled = currentPage === totalPages;
nextButton.onclick = function() {
if (currentPage < totalPages) {
    loadBuildingsByPage(currentPage + 1);
    updatePaginationControls();
}
};
paginationContainer.appendChild(nextButton);
}

// 오늘의 모든 수업 가져오기
function getTodaysClasses() {
    const courses = loadTimetableData();
    const currentTime = getCurrentTimeInfo();
    const todaysClasses = [];
    
    // 일요일이면 빈 배열 반환
    if (currentTime.day === 0) {
        return todaysClasses;
    }
    
    // 오늘의 모든 수업 찾기
    courses.forEach(course => {
        course.times.forEach(time => {
            if (time.day === currentTime.day) {
                // 첫 번째 교시만 표시 (미리보기용)
                const startTime = periodTimes[time.start].start;
                const endTime = periodTimes[time.end].end;
                
                todaysClasses.push({
                    course: course,
                    startTime: startTime,
                    endTime: endTime,
                    startMinutes: timeToMinutes(startTime),
                    period: time.start
                });
            }
        });
    });
    
    // 시간 순으로 정렬
    todaysClasses.sort((a, b) => a.startMinutes - b.startMinutes);
    
    console.log('오늘의 수업 목록:', todaysClasses);
    return todaysClasses;
}

// 네이버 지도 초기화 함수 - 수정된 버전
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

// Direction 서비스 사용을 위한 스크립트 동적 로드
loadDirectionAPI();

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

// 회색 영역 문제 해결을 위한 스타일 동적 적용 함수
function fixMapGrayArea() {
// 회색 영역을 가리는 요소가 있는지 확인
const mapContainer = document.getElementById('naverMap');
if (mapContainer) {
// 회색 오버레이 요소가 있는지 확인하고 제거
const grayOverlays = mapContainer.querySelectorAll('div[style*="background-color: rgb(128, 128, 128)"]');
grayOverlays.forEach(overlay => {
    overlay.style.display = 'none';
});

// 지도 컨테이너 내부의 모든 div 요소 확인
const mapDivs = mapContainer.querySelectorAll('div');
mapDivs.forEach(div => {
    // width가 50%로 설정된 요소 찾기
    const style = getComputedStyle(div);
    if (style.width === '50%' || style.width.endsWith('50%')) {
        div.style.width = '100%';
        console.log('지도 요소 너비 수정: 50% → 100%');
    }
    
    // 회색 배경색을 가진 요소 찾기
    if (style.backgroundColor.includes('128') || 
        style.backgroundColor.includes('gray') || 
        style.backgroundColor.includes('grey')) {
        div.style.backgroundColor = 'transparent';
        console.log('회색 배경 요소 발견 및 수정');
    }
});
}
}

// 지도 초기화 완료 후 회색 영역 수정 함수 호출하는 함수
function initNaverMapWithFix() {
// 기본 초기화 함수 호출
initNaverMap();

// 지도가 로드된 후 회색 영역 수정
setTimeout(() => {
fixMapGrayArea();
}, 1000);
}

// 탭 전환 시 지도 크기 조정 및 새로고침을 처리하는 함수
function handleMapResize() {
// 지도 컨테이너 너비 업데이트
const mapContainer = document.getElementById('naverMap');
if (mapContainer) {
// 컨테이너가 보이는 상태인지 확인
const isVisible = getComputedStyle(mapContainer).display !== 'none';

if (isVisible && naverMap) {
    // 지도 갱신 및 크기 조정
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        naverMap.refresh();
        console.log('지도 크기 조정 및 갱신 완료');
    }, 100);
}
}
}

// Direction API 스크립트 동적 로드 함수
function loadDirectionAPI() {
if (window.naver && window.naver.maps && window.naver.maps.Direction) {
console.log('Direction API가 이미 로드되어 있습니다.');
return; // 이미 로드되어 있으면 중복 로드 방지
}

// Direction API 스크립트 엘리먼트 생성
const script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ikduyzmop9&submodules=direction';
script.async = true;
script.defer = true;

script.onload = function() {
console.log('Direction API 로드 완료');
};

script.onerror = function() {
console.error('Direction API 로드 실패');
alert('길 안내 기능을 로드하는 데 문제가 발생했습니다. 직선 경로로 안내합니다.');
};

// 헤드에 스크립트 추가
document.head.appendChild(script);
}

// Direction API 로드 여부를 확인하는 함수
function isDirectionAPILoaded() {
return window.naver && window.naver.maps && window.naver.maps.Direction;
}

// 경로 표시 함수 - 네이버 Direction 5 API 활용
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

// Direction API가 로드되었는지 확인
if (!isDirectionAPILoaded()) {
console.log('Direction API가 로드되지 않았습니다. 직선 경로로 대체합니다.');
// 로딩 표시 숨기기
if (routeLoading) {
    routeLoading.style.display = 'none';
}
drawStraightRoute(start, end);
return;
}

try {
// Direction 객체 생성
const direction = new naver.maps.Direction();

// Direction 옵션 설정
direction.setOptions({
    map: naverMap,
    // 출발지와 도착지 설정
    start: start,
    goal: end,
    // 경로 유형 (도보 경로)
    option: {
        goal_select: 0,
        car_type: 0,
        travel_mode: 3, // 3 = 도보
        avoid: [0],
        search_option: 0
    }
});

// Direction 실행 시 이벤트 리스너 등록
naver.maps.Event.addListener(direction, 'complete', function(result) {
    // 로딩 표시 숨기기
    if (routeLoading) {
        routeLoading.style.display = 'none';
    }
    
    if (result.route && result.route.paths && result.route.paths.length > 0) {
        // 첫 번째 경로 사용
        const path = result.route.paths[0];
        
        // 경로 시각화
        if (path.path && path.path.length > 0) {
            // 기존 경로 삭제
            if (routePolyline) {
                routePolyline.setMap(null);
            }
            
            // 경로 좌표 배열 생성
            const pathCoords = path.path.map(p => new naver.maps.LatLng(p[1], p[0]));
            
            // 경로 라인 생성
            routePolyline = new naver.maps.Polyline({
                map: naverMap,
                path: pathCoords,
                strokeColor: '#4285F4',
                strokeWeight: 5,
                strokeOpacity: 0.8,
                strokeLineCap: 'round',
                strokeLineJoin: 'round'
            });
            
            // 지도 뷰 영역 조정
            const bounds = new naver.maps.LatLngBounds(pathCoords);
            naverMap.fitBounds(bounds, {
                top: 100,
                right: 100,
                bottom: 100,
                left: 100
            });
            
            // 목적지 정보 가져오기
            const building = buildingData.find(b => 
                b.position.lat === to.lat && b.position.lng === to.lng);
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
                const distance = path.distance;
                if (distance >= 1000) {
                    routeDistance.textContent = (distance / 1000).toFixed(1) + 'km';
                } else {
                    routeDistance.textContent = distance + 'm';
                }
                
                // 시간 정보 설정
                const duration = path.duration;
                if (duration >= 3600) {
                    const hours = Math.floor(duration / 3600);
                    const mins = Math.floor((duration % 3600) / 60);
                    routeDuration.textContent = `${hours}시간 ${mins}분`;
                } else {
                    const mins = Math.floor(duration / 60);
                    routeDuration.textContent = `${mins}분`;
                }
                
                // 경로 정보 표시
                routeInfoBox.style.display = 'block';
            }
        } else {
            console.error('경로의 상세 좌표를 찾을 수 없습니다.');
            drawStraightRoute(start, end);
        }
    } else {
        console.error('경로 결과를 찾을 수 없습니다.');
        drawStraightRoute(start, end);
    }
});

// Direction 오류 발생 시 이벤트 리스너 등록
naver.maps.Event.addListener(direction, 'error', function(error) {
    console.error("Direction API 오류:", error);
    
    // 로딩 표시 숨기기
    if (routeLoading) {
        routeLoading.style.display = 'none';
    }
    
    alert('경로 검색 중 오류가 발생했습니다. 직선 경로로 안내합니다.');
    drawStraightRoute(start, end);
});
} catch (error) {
console.error('Direction API 사용 중 오류 발생:', error);

// 로딩 표시 숨기기
if (routeLoading) {
    routeLoading.style.display = 'none';
}

alert('길찾기 기능 사용 중 오류가 발생했습니다. 직선 경로로 안내합니다.');
drawStraightRoute(start, end);
}
}

// 직선 경로 표시 함수 (대체 방법)
function drawStraightRoute(start, end) {
// 직선 경로 그리기
routePolyline = new naver.maps.Polyline({
map: naverMap,
path: [start, end],
strokeColor: '#FF4500', // 다른 색상 사용하여 구분
strokeWeight: 5,
strokeOpacity: 0.8,
strokeLineCap: 'round',
strokeLineJoin: 'round',
strokeDasharray: [8, 4] // 점선으로 표시하여 실제 경로가 아님을 구분
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
// 네이버 맵 LatLng 객체의 distanceTo 메서드 대신 직접 거리 계산
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

// 길찾기 함수 - GPS 위치 정보 활용
function navigateToBuilding(buildingId, event) {
// 이벤트 버블링 방지
if (event) {
event.stopPropagation();
}

// 해당 건물의 데이터 찾기
const building = buildingData.find(b => b.id === buildingId);

if (!building) {
// 편의시설 데이터에서도 검색
const facility = facilityData.find(f => f.id === buildingId);
if (facility) {
    alert(`${facility.name}으로 길찾기를 시작합니다.`);
    
    // 지도를 표시하고 해당 시설로 이동
    switchTab('facility');
    
    // 검색 내용 초기화하고 원래 컨텐츠 표시
    clearSearch();
    
        // 사용자 위치가 있는지 확인
    if (getUserLocation()) {
        // 경로 표시 (사용자 위치 -> 시설)
        const destination = {
            lat: facility.position.lat, 
            lng: facility.position.lng
        };
        drawRoute(userLocation, destination);
    } else {
        // 위치 정보가 없으면 관련 건물로만 이동
        if (facility.relatedBuilding) {
            const relatedBuilding = buildingData.find(b => b.id === facility.relatedBuilding);
            if (relatedBuilding && naverMap) {
                setTimeout(() => {
                    const position = new naver.maps.LatLng(relatedBuilding.position.lat, relatedBuilding.position.lng);
                    naverMap.setCenter(position);
                    naverMap.setZoom(18);
                    
                    // 마커 찾기 및 정보창 열기
                    const markerIndex = mapMarkers.findIndex(marker => marker.getTitle() === relatedBuilding.name);
                    if (markerIndex !== -1) {
                        infoWindows.forEach(window => window.close());
                        infoWindows[markerIndex].open(naverMap, mapMarkers[markerIndex]);
                    }
                }, 300);
            }
        } else if (naverMap) {
            // 시설 자체의 위치를 사용
            setTimeout(() => {
                const position = new naver.maps.LatLng(facility.position.lat, facility.position.lng);
                naverMap.setCenter(position);
                naverMap.setZoom(18);
            }, 300);
        }
    }
} else {
    alert('해당 건물 또는 시설 정보를 찾을 수 없습니다.');
}
return;
}

// 건물이 있는 경우 처리
alert(`${building.name}으로 길찾기를 시작합니다.`);

// 지도를 표시하고 해당 건물로 이동
switchTab('facility');

// 검색 내용 초기화하고 원래 컨텐츠 표시
clearSearch();

// 사용자 위치 확인 및 경로 표시
if (getUserLocation()) {
// 경로 표시 (사용자 위치 -> 건물)
const destination = {
    lat: building.position.lat, 
    lng: building.position.lng
};
drawRoute(userLocation, destination);
} else {
// 위치 정보가 없으면 건물 위치로만 이동
if (naverMap) {
    setTimeout(() => {
        const position = new naver.maps.LatLng(building.position.lat, building.position.lng);
        naverMap.setCenter(position);
        naverMap.setZoom(18);
        
        // 마커 찾기 및 정보창 열기
        const markerIndex = mapMarkers.findIndex(marker => marker.getTitle() === building.name);
        if (markerIndex !== -1) {
            infoWindows.forEach(window => window.close());
            infoWindows[markerIndex].open(naverMap, mapMarkers[markerIndex]);
        }
        
        // 지도 갱신
        window.dispatchEvent(new Event('resize'));
        naverMap.refresh();
    }, 300);
} else {
    alert('지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
}
}
}

// 지도 줌인
function zoomIn() {
if (naverMap) {
const currentZoom = naverMap.getZoom();
naverMap.setZoom(currentZoom + 1);
}
}

// 지도 줌아웃
function zoomOut() {
if (naverMap) {
const currentZoom = naverMap.getZoom();
naverMap.setZoom(currentZoom - 1);
}
}

// 지도 초기 뷰로 리셋
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
        // 좌표 변환 - 한국 GPS 좌표 보정
        const wgs84Coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        console.log("원본 GPS 좌표:", wgs84Coords);
        
        // 네이버 맵은 EPSG:3857 좌표계를 사용합니다.
        // 한국에서는 위치 정보 보호법으로 인해 WGS84 좌표를 변환해야 합니다.
        // 네이버 지도 API의 변환 함수가 있다면 사용하고, 없으면 직접 변환합니다.
        let correctedCoords;
        
        if (naver && naver.maps && naver.maps.TransCoord) {
            // 네이버 지도 API TransCoord 사용(있을 경우)
            const naverLatLng = naver.maps.TransCoord.fromWGS84ToNaver(
                new naver.maps.LatLng(wgs84Coords.lat, wgs84Coords.lng)
            );
            correctedCoords = {
                lat: naverLatLng.y || naverLatLng.lat(),
                lng: naverLatLng.x || naverLatLng.lng()
            };
            console.log("네이버 변환 좌표:", correctedCoords);
        } else {
            // 수동 보정 (네이버 지도 API가 제공하는 변환 함수가 없을 경우)
            // 한국 GPS 좌표 보정 (대략적인 값, 정확한 알고리즘은 네이버 맵 API 참조)
            // 이 값들은 예시일 뿐 실제 정확한 값이 아닐 수 있음
            correctedCoords = wgs84Coords;
            console.log("수동 보정 좌표:", correctedCoords);
        }
        
        userLocation = correctedCoords;
        
        // 사용자 위치 마커 생성/업데이트
        updateUserMarker(correctedCoords);
        
        // 사용자 위치로 지도 이동
        const userLatLng = new naver.maps.LatLng(correctedCoords.lat, correctedCoords.lng);
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
            case error.UNKNOWN_ERROR:
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
        enableHighAccuracy: true,  // 높은 정확도 요청
        timeout: 15000,            // 시간 초과 늘림 (15초)
        maximumAge: 0              // 캐시된 위치 사용 안함
    }
);
} else {
alert('이 브라우저에서는 위치 추적 기능을 지원하지 않습니다.');

// GPS 버튼 원래 스타일로 복귀
if (gpsButton) {
    gpsButton.style.backgroundColor = 'white';
    gpsButton.style.color = 'black';
}
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
        radius: 10, // 기본 반경 10m
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
            // 좌표 변환 - 한국 GPS 좌표 보정
            const wgs84Coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log("실시간 GPS 좌표:", wgs84Coords);
            
            // 좌표 변환 시도
            let correctedCoords;
            
            if (naver && naver.maps && naver.maps.TransCoord) {
                // 네이버 지도 API TransCoord 사용(있을 경우)
                const naverLatLng = naver.maps.TransCoord.fromWGS84ToNaver(
                    new naver.maps.LatLng(wgs84Coords.lat, wgs84Coords.lng)
                );
                correctedCoords = {
                    lat: naverLatLng.y || naverLatLng.lat(),
                    lng: naverLatLng.x || naverLatLng.lng()
                };
                console.log("네이버 변환 좌표:", correctedCoords);
            } else {
                // 수동 보정
                correctedCoords = wgs84Coords;
                console.log("수동 보정 좌표:", correctedCoords);
            }
            
            userLocation = correctedCoords;
            
            // 사용자 위치 마커 업데이트
            updateUserMarker(correctedCoords);
            
            // 정확도 범위 업데이트
            if (userLocationCircle) {
                userLocationCircle.setRadius(position.coords.accuracy);
                userLocationCircle.setCenter(new naver.maps.LatLng(correctedCoords.lat, correctedCoords.lng));
            }
        },
        // 오류 콜백
        function(error) {
            console.error('위치 추적 중 오류:', error);
        },
        // 옵션
        { 
            enableHighAccuracy: true,  // 높은 정확도
            timeout: 15000,            // 시간 초과 15초
            maximumAge: 0              // 캐시된 위치 사용 안함
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

// 사용자 위치 확인 함수
function getUserLocation() {
    // 이미 위치 정보가 있는 경우
    if (userLocation) {
        return true;
    }
    
    // 위치 정보가 없으면 위치 추적 제안
    const confirmTracking = confirm('경로 안내를 위해 현재 위치 정보가 필요합니다. 위치 추적을 시작할까요?');
    if (confirmTracking) {
        trackUserLocation();
        return false; // 위치 정보를 가져오는 중이므로 아직 false 반환
    }
    
    return false;
}

function testLocationWithYeonsung() {
    if (!naverMap) {
        alert("지도가 초기화되지 않았습니다.");
        return;
    }
    
    // GPS 버튼 스타일 변경
    const gpsButton = document.querySelector('.gps-button');
    if (gpsButton) {
        gpsButton.style.backgroundColor = '#4285F4';
        gpsButton.style.color = 'white';
    }
    
    // 연성대학교 본관 위치를 기준으로 약간 이동한 위치 사용
    // 대학본관 위치: { lat: 37.397467068076345, lng: 126.90938066144557 }
    // 약간 다른 위치 계산 (북서쪽으로 약 50m)
    const testLocation = {
        lat: 37.397467068076345 + 0.0005, // 북쪽으로 약간 이동
        lng: 126.90938066144557 - 0.0005  // 서쪽으로 약간 이동
    };
    
    console.log("테스트 위치:", testLocation);
    
    // 테스트 위치를 사용자 위치로 설정
    userLocation = testLocation;
    
    // 사용자 위치 마커 생성/업데이트
    updateUserMarker(testLocation);
    
    // 사용자 위치로 지도 이동
    naverMap.setCenter(new naver.maps.LatLng(testLocation.lat, testLocation.lng));
    naverMap.setZoom(18);
    
    // 추적 상태 업데이트
    isTrackingUser = true;
    
    alert("테스트 모드: 연성대학교 근처 위치가 표시됩니다.");
}

// 초기화 시 현재 환경에 최적화된 위치 추적 메서드 선택
function initLocationTracking() {
    // GPS 버튼에 이벤트 핸들러 등록
    const gpsButton = document.querySelector('.gps-button');
    if (gpsButton) {
        // 기본적으로 trackUserLocation 함수 사용
        gpsButton.onclick = trackUserLocation;
        
        // 개발 모드나 테스트 모드에서는 testLocationWithYeonsung 함수 사용
        // 실제 환경에서는 아래 코드를 주석 처리
        // gpsButton.onclick = testLocationWithYeonsung;
    }
}

// 프로필 정보 업데이트 함수 (로그인 상태 관리 포함)
function updateProfileInfo(studentId) {
    const profileLoggedIn = document.getElementById('profile-logged-in');
    const profileLoginRequired = document.getElementById('profile-login-required');
    
    if (!studentId) {
        // 로그인되지 않은 상태 - 로그인 필요 화면 표시
        if (profileLoggedIn) profileLoggedIn.style.display = 'none';
        if (profileLoginRequired) profileLoginRequired.style.display = 'flex';
        return;
    }
    
    // 로그인된 상태 - 사용자 정보 표시
    if (profileLoggedIn) {
        // 실제 학번 가져오기 - 소셜 로그인과 일반 로그인 구분
        let actualStudentId = studentId;
        if (studentId.startsWith('naver_') || studentId.startsWith('kakao_') || studentId.startsWith('google_')) {
            // 소셜 로그인의 경우 별도로 저장된 실제 학번 조회
            actualStudentId = localStorage.getItem(`user_${studentId}_studentId`) || studentId;
        }
        
        const name = localStorage.getItem(`user_${studentId}_name`) || '사용자';
        const department = localStorage.getItem(`user_${studentId}_department`) || 'business';
        const grade = localStorage.getItem(`user_${studentId}_grade`) || '3';
        
        // 프로필 이름 업데이트
        const profileName = profileLoggedIn.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = name;
        }
        
        // 학과 및 학년 정보 업데이트
        const profileDetails = profileLoggedIn.querySelectorAll('.profile-detail');
        if (profileDetails.length >= 2 && department) {
            let departmentText = '';
            
            switch(department) {
                // 소셜 로그인에서 선택한 학과들 추가
                case '전자공학과':
                case '정보통신과':
                case '전기과':
                case '컴퓨터소프트웨어과':
                case '건축과':
                case '실내건축과':
                case '패션디자인비즈니스과':
                case '뷰티스타일리스트과_헤어디자인전공':
                case '뷰티스타일리스트과_메이크업전공':
                case '뷰티스타일리스트과_스킨케어전공':
                case '게임콘텐츠과':
                case '웹툰만화콘텐츠과':
                case '영상콘텐츠과_영상콘텐츠제작전공':
                case '영상콘텐츠과_뉴미디어콘텐츠전공':
                case '시각디자인과':
                case 'K-POP과':
                case '유통물류과':
                case '경영학과':
                case '세무회계과':
                case '국방군사학과':
                case '경찰경호보안과':
                case '사회복지과':
                case '사회복지경영과':
                case '유아교육과':
                case '유아특수재활과':
                case '사회복지과_아동심리보육전공':
                case '치위생과':
                case '치기공과':
                case '작업치료과':
                case '응급구조과':
                case '보건의료행정과':
                case '스포츠재활과':
                case '식품영양학과':
                case '반려동물보건과':
                case '반려동물산업과':
                case '항공서비스과':
                case '관광영어과':
                case '호텔관광과':
                case '호텔외식조리과':
                case '카페·베이커리과':
                case '호텔외식경영전공':
                case '자유전공학과':
                    departmentText = department;
                    break;
                default:
                    departmentText = department;
            }
            
            profileDetails[0].textContent = `${departmentText} | ${grade}학년`;
            profileDetails[1].textContent = `학번: ${actualStudentId}`;
        }
        
        // 로그인된 상태 요소 표시
        profileLoggedIn.style.display = 'flex';
        profileLoginRequired.style.display = 'none';
    }
    
    // 프로필 이미지도 업데이트
    updateAllProfileImages();
}

// 프로필 초기화 함수 (로그아웃 시 사용)
function resetProfileInfo() {
    const profileLoggedIn = document.getElementById('profile-logged-in');
    const profileLoginRequired = document.getElementById('profile-login-required');
    
    // 로그인 필요 상태로 되돌리기
    if (profileLoggedIn) profileLoggedIn.style.display = 'none';
    if (profileLoginRequired) profileLoginRequired.style.display = 'flex';
    
    // 프로필 이미지도 초기화
    const profileImage = profileLoginRequired.querySelector('.profile-image');
    if (profileImage) {
        profileImage.innerHTML = '👤';
    }
}

// 프로필 이미지 전체 업데이트 함수 (모든 화면에서 일관되게 업데이트)
function updateAllProfileImages() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) return;
    
    const profileImageType = localStorage.getItem(`user_${currentUser}_profileImageType`) || 'emoji';
    const profileImage = localStorage.getItem(`user_${currentUser}_profileImage`) || '👨‍🎓';
    const customProfileImage = localStorage.getItem(`user_${currentUser}_customProfileImage`);
    
    // 1. 헤더 프로필 이미지 업데이트
    const headerProfileImg = document.getElementById('headerProfileImg');
    const headerProfileContainer = document.querySelector('.header-profile-image');
    
    if (headerProfileContainer) {
        if (profileImageType === 'emoji') {
            headerProfileContainer.innerHTML = profileImage;
        } else if (profileImageType === 'custom' && customProfileImage) {
            if (headerProfileImg) {
                headerProfileImg.src = customProfileImage;
            } else {
                headerProfileContainer.innerHTML = `<img src="${customProfileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="프로필">`;
            }
        } else if (profileImageType === 'image') {
            if (headerProfileImg) {
                headerProfileImg.src = profileImage;
            } else {
                headerProfileContainer.innerHTML = `<img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="프로필">`;
            }
        } else {
            headerProfileContainer.innerHTML = '👤';
        }
    }
    
    // 2. 내 정보 탭의 프로필 이미지 업데이트 (로그인된 상태만)
    const profileTabImage = document.querySelector('#profile-logged-in .profile-image');
    if (profileTabImage) {
        if (profileImageType === 'emoji') {
            profileTabImage.innerHTML = profileImage;
        } else if (profileImageType === 'custom' && customProfileImage) {
            profileTabImage.innerHTML = '';
            const img = document.createElement('img');
            img.src = customProfileImage;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            profileTabImage.appendChild(img);
        } else if (profileImageType === 'image') {
            profileTabImage.innerHTML = '';
            const img = document.createElement('img');
            img.src = profileImage;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            profileTabImage.appendChild(img);
        } else {
            profileTabImage.innerHTML = '👤';
        }
    }
}

// 카테고리 필터 초기화
function initCategoryFilter() {
    const categoryTags = document.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // 이미 선택된 태그 클릭 시 무시
            if (this.classList.contains('active')) return;
            // 현재 활성화된 태그 비활성화 - 이 부분에서 오류 발생 가능
            const activeTag = document.querySelector('.category-tag.active');
            if (activeTag) { // null 체크 추가
                activeTag.classList.remove('active');
            }
            // 클릭한 태그 활성화
            this.classList.add('active');
        });
    });
}

// 탭 전환 함수 - 시설 탭으로 전환 시 페이지네이션 초기화 추가 (수정된 버전)
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
    for (let i = 0; i < tabItems.length; i++) {
        if (tabItems[i].onclick.toString().includes(`'${tabName}'`)) {
            tabItems[i].classList.add('active');
            break;
        }
    }
    
    // 시설 탭으로 전환 시 건물 목록 페이지네이션 초기화 및 지도 갱신
    if (tabName === 'facility') {
        // 첫 페이지 로드
        currentPage = 1;
        loadBuildingsByPage(currentPage);
        updatePaginationControls();
        
        // 지도 갱신 함수 호출
        handleMapResize();
    }
    
    // 프로필 탭으로 전환 시 프로필 정보 및 이미지 업데이트
    if (tabName === 'profile') {
        setTimeout(() => {
            // 로그인 상태 재확인 및 프로필 정보 업데이트
            checkLoginStatus();
            updateAllProfileImages();
        }, 100);
    }
    
    // 홈 탭으로 전환 시 시간표 미리보기 업데이트
    if (tabName === 'home') {
        setTimeout(() => {
            updateTimetablePreview();
        }, 200);
    }
}

// 메인 홈으로 이동
function goToHome() {
    switchTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 검색 열기
function openSearch() {
    alert('검색 기능을 실행합니다.');
    // 검색 입력창에 포커스
    document.querySelector('.search-input').focus();
}

// 검색 키 입력 처리
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        const searchTerm = event.target.value.trim();
        if (searchTerm) {
            alert(`'${searchTerm}'에 대한 검색을 시작합니다.`);
        }
    }
}

// 공지사항 필터링 - 알림 없이 필터링만 수행하도록 수정
function filterNotices(category) {
    // alert(`${category} 카테고리의 공지사항을 필터링합니다.`); // 알림 제거

    // 카테고리 태그 활성화 상태 변경
    document.querySelectorAll('.category-tag').forEach(tag => {
    tag.classList.remove('active');
});

// 선택된 카테고리 활성화
document.querySelectorAll('.category-tag').forEach(tag => {
    if (tag.textContent.toLowerCase().includes(category) || 
    (category === 'all' && tag.textContent === '전체')) {
        tag.classList.add('active');
    }
});
}

// 강의 필터링 - 알림 없이 필터링만 수행하도록 수정
function filterLectures(category) {
// alert(`${category} 카테고리의 강의를 필터링합니다.`); // 알림 제거

// 카테고리 태그 활성화 상태 변경
const communityTab = document.getElementById('community-tab');
communityTab.querySelectorAll('.category-tag').forEach(tag => {
    tag.classList.remove('active');
});

// 선택된 카테고리 활성화
communityTab.querySelectorAll('.category-tag').forEach(tag => {
    if (tag.textContent.toLowerCase().includes(category) || 
        (category === 'all' && tag.textContent === '전체')) {
        tag.classList.add('active');
    }
});
}

// 페이지 이동 함수
function goToPage(pageName) {
    // 페이지 이름에 따라 분기 처리
    switch(pageName) {
        case 'login':
            alert('로그인 페이지로 이동합니다.');
            window.location.href = 'login.html';
            break;
            
        case 'profile-edit':
            alert('프로필 수정 페이지로 이동합니다.');
            window.location.href = 'profile-edit.html';
            break;
            
        case 'shuttle':
            window.location.href = 'shuttle_bus_tracker.html';
            break;
            
        case 'academic-calendar':
            alert('학사일정 페이지로 이동합니다.');
            break;
            
        case 'notices':
            alert('전체 공지사항 페이지로 이동합니다.');
            break;
            
        case 'club-activities':
            alert('장학금 정보 페이지로 이동합니다.');
            break;
            
        case 'job-info':
            alert('취업/채용 정보 페이지로 이동합니다.');
            break;
            
        case 'activities':
            window.location.href = 'activities.html';
            break;
            
        default:
            alert(`${pageName} 페이지로 이동합니다.`);
    }
}

// 공지사항 상세 페이지로 이동 (알림 없이 바로 이동)
function goToNoticeDetail(noticeId) {
    // 알림창 없이 직접 상세 페이지로 이동
    window.location.href = `notice-detail.html?id=${noticeId}`;
}

// 강의 상세 보기
function viewLectureDetail(lectureId) {
    alert(`강의 ${lectureId} 상세 페이지로 이동합니다.`);
    // window.location.href = `lecture-detail.html?id=${lectureId}`;
}

// 알림 상세 보기
function viewNotification(notificationId) {
    alert(`${notificationId} 알림 상세 내용을 확인합니다.`);
}

// 건물 상세 보기 함수 수정
function showBuildingDetail(buildingId) {
    alert(`${buildingId} 상세 페이지로 이동합니다.`);
    
    // 해당 건물의 데이터 찾기
    const building = buildingData.find(b => b.id === buildingId);
    
    if (building && naverMap) {
        // 지도를 표시하고 해당 건물로 이동
        switchTab('facility');
        
        // 검색 초기화
        clearSearch();
        
        // 건물 위치로 지도 중심 이동
        const position = new naver.maps.LatLng(building.position.lat, building.position.lng);
        naverMap.setCenter(position);
        naverMap.setZoom(18); // 더 가깝게 줌인
        
        // 마커 찾기
        const markerIndex = mapMarkers.findIndex(marker => marker.getTitle() === building.name);
        
        if (markerIndex !== -1) {
            // 다른 모든 정보창 닫기
            infoWindows.forEach(window => window.close());
            
            // 해당 마커의 정보창 열기
            infoWindows[markerIndex].open(naverMap, mapMarkers[markerIndex]);
        }
    }
}
    
// 편의 시설 상세 보기
function showFacilityDetail(facilityId) {
    alert(`${facilityId} 시설 상세 정보를 확인합니다.`);
    // window.location.href = `facility-detail.html?id=${facilityId}`;
}

// 로그인 상태 확인 및 UI 업데이트
function checkLoginStatus() {
    // 로컬 스토리지에서 현재 로그인된 사용자 정보 가져오기
    const currentUser = localStorage.getItem('currentLoggedInUser');
    
    // 로그인 버튼과 프로필 드롭다운 컨테이너
    const loginButton = document.querySelector('.login-button');
    const profileDropdownContainer = document.querySelector('.profile-dropdown-container');
    
    if (currentUser) {
        // 로그인 상태: 로그인 버튼 숨기고 프로필 드롭다운 표시
        if (loginButton) loginButton.style.display = 'none';
        if (profileDropdownContainer) profileDropdownContainer.style.display = 'block';
        
        // 드롭다운 내 프로필 정보 업데이트
        updateDropdownProfileInfo(currentUser);
        
        // 프로필 탭의 정보도 업데이트
        updateProfileInfo(currentUser);
    } else {
        // 비로그인 상태: 로그인 버튼 표시, 프로필 드롭다운 숨김
        if (loginButton) loginButton.style.display = 'block';
        if (profileDropdownContainer) profileDropdownContainer.style.display = 'none';
        
        // 프로필 탭도 로그인 필요 상태로 초기화
        resetProfileInfo();
    }
}

// 드롭다운 프로필 정보 업데이트
function updateDropdownProfileInfo(studentId) {
    const dropdown = document.querySelector('.profile-dropdown');
    if (!dropdown) return;
    
    // 실제 학번 가져오기 - 소셜 로그인과 일반 로그인 구분
    let actualStudentId = studentId;
    if (studentId.startsWith('naver_') || studentId.startsWith('kakao_') || studentId.startsWith('google_')) {
        // 소셜 로그인의 경우 별도로 저장된 실제 학번 조회
        actualStudentId = localStorage.getItem(`user_${studentId}_studentId`) || studentId;
    }
    
    const name = localStorage.getItem(`user_${studentId}_name`) || '사용자';
    const department = localStorage.getItem(`user_${studentId}_department`) || 'business';
    const grade = localStorage.getItem(`user_${studentId}_grade`) || '3';
    
    // 이름 업데이트
    const nameElement = dropdown.querySelector('.dropdown-profile-name');
    if (nameElement) nameElement.textContent = name;
    
    // 학과 및 학년 정보 업데이트
    const detailElement = dropdown.querySelector('.dropdown-profile-detail');
    if (detailElement && department) {
        let departmentText = '';
        
        switch(department) {
            case 'computerScience':
                departmentText = '컴퓨터정보학과';
                break;
            case 'business':
                departmentText = '경영학과';
                break;
            case 'nursing':
                departmentText = '간호학과';
                break;
            case 'engineering':
                departmentText = '공학계열';
                break;
            case 'arts':
                departmentText = '예술계열';
                break;
            // 소셜 로그인에서 선택한 학과들 추가
            case '전자공학과':
            case '정보통신과':
            case '전기과':
            case '컴퓨터소프트웨어과':
            case '건축과':
            case '실내건축과':
            case '패션디자인비즈니스과':
            case '뷰티스타일리스트과_헤어디자인전공':
            case '뷰티스타일리스트과_메이크업전공':
            case '뷰티스타일리스트과_스킨케어전공':
            case '게임콘텐츠과':
            case '웹툰만화콘텐츠과':
            case '영상콘텐츠과_영상콘텐츠제작전공':
            case '영상콘텐츠과_뉴미디어콘텐츠전공':
            case '시각디자인과':
            case 'K-POP과':
            case '유통물류과':
            case '경영학과':
            case '세무회계과':
            case '국방군사학과':
            case '경찰경호보안과':
            case '사회복지과':
            case '사회복지경영과':
            case '유아교육과':
            case '유아특수재활과':
            case '사회복지과_아동심리보육전공':
            case '치위생과':
            case '치기공과':
            case '작업치료과':
            case '응급구조과':
            case '보건의료행정과':
            case '스포츠재활과':
            case '식품영양학과':
            case '반려동물보건과':
            case '반려동물산업과':
            case '항공서비스과':
            case '관광영어과':
            case '호텔관광과':
            case '호텔외식조리과':
            case '카페·베이커리과':
            case '호텔외식경영전공':
            case '자유전공학과':
                departmentText = department;
                break;
            default:
                departmentText = department;
        }
        
        detailElement.textContent = `${departmentText} | ${grade}학년`;
    }
    
    // 학번 업데이트 - 실제 학번 표시
    const studentIdElement = dropdown.querySelectorAll('.dropdown-profile-detail')[1];
    if (studentIdElement) {
        studentIdElement.textContent = `학번: ${actualStudentId}`;
    }
}

// 로그아웃 진행 중 플래그
let isLoggingOut = false;

// 로그아웃 기능
function logout() {
    // 이미 로그아웃 진행 중이면 중단
    if (isLoggingOut) {
        console.log('로그아웃이 이미 진행 중입니다.');
        return;
    }
    
    // 로그아웃 진행 상태 플래그 설정
    isLoggingOut = true;
    
    try {
        // 로그아웃 확인 (한 번만 물어봄)
        const confirmed = confirm('로그아웃 하시겠습니까?');
        
        if (confirmed) {
            // 로그아웃 실행
            console.log('로그아웃을 실행합니다.');
            
            // 현재 로그인 사용자 정보 삭제
            localStorage.removeItem('currentLoggedInUser');
            
            // 로그인 버튼과 프로필 드롭다운 컨테이너 요소 가져오기
            const loginButton = document.querySelector('.login-button');
            const profileDropdownContainer = document.querySelector('.profile-dropdown-container');
            
            // 로그인 버튼 표시, 프로필 드롭다운 숨김
            if (loginButton) loginButton.style.display = 'block';
            if (profileDropdownContainer) profileDropdownContainer.style.display = 'none';

            // 프로필 드롭다운이 열려있다면 닫기
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown) dropdown.classList.remove('active');
            
            // 프로필 탭 초기화
            resetProfileInfo();
            
            // 홈 탭으로 전환
            switchTab('home');

            // 로그아웃 완료 알림 (한 번만 표시)
            alert('로그아웃 되었습니다.');
            
            console.log('로그아웃이 완료되었습니다.');
        } else {
            console.log('로그아웃이 취소되었습니다.');
        }
    } catch (error) {
        console.error('로그아웃 처리 중 오류:', error);
        alert('로그아웃 처리 중 오류가 발생했습니다.');
    } finally {
        // 로그아웃 프로세스 완료 후 항상 플래그 초기화
        isLoggingOut = false;
    }
}

// 회원 탈퇴 함수
function deleteAccount() {
    // 현재 로그인된 사용자 확인
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    // 삭제 확인
    if (confirm('정말 회원 탈퇴하시겠습니까? 모든 계정 정보가 삭제됩니다.')) {
        // 사용자 관련 정보 삭제
        localStorage.removeItem(`user_${currentUser}_registered`);
        localStorage.removeItem(`user_${currentUser}_first_login`);
        localStorage.removeItem(`user_${currentUser}_name`);
        localStorage.removeItem(`user_${currentUser}_department`);
        localStorage.removeItem(`user_${currentUser}_grade`);
        localStorage.removeItem(`user_${currentUser}_email`);
        localStorage.removeItem(`user_${currentUser}_phone`);
        localStorage.removeItem(`user_${currentUser}_password`);
        localStorage.removeItem(`user_${currentUser}_profileImageType`);
        localStorage.removeItem(`user_${currentUser}_profileImage`);
        localStorage.removeItem(`user_${currentUser}_customProfileImage`);
        
        // 현재 로그인 상태 제거
        localStorage.removeItem('currentLoggedInUser');
        
        alert('회원 탈퇴가 완료되었습니다.');
        
        // 로그인 페이지로 이동
        window.location.href = 'login.html';
    }
}

// 모든 설정 초기화 함수
function resetAllSettings() {
    // 현재 로그인 상태 확인
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    if (confirm('모든 설정을 초기화하시겠습니까? 설정된 위젯, 메뉴, 개인화 옵션이 모두 기본값으로 돌아갑니다.')) {
        // 사용자 설정 초기화
        localStorage.removeItem(`user_${currentUser}_setup_completed`);
        localStorage.removeItem(`user_${currentUser}_profileImageType`);
        localStorage.removeItem(`user_${currentUser}_profileImage`);
        localStorage.removeItem(`user_${currentUser}_customProfileImage`);
        
        // 위젯 설정 초기화
        const defaultWidgets = [
            {
                name: '교내/대외활동',
                icon: '🎯',
                description: '다양한 교내/대외 활동 정보 확인'
            },
            {
                name: '학사일정',
                icon: '📅',
                description: '주요 일정 및 행사'
            },
            {
                name: '공지사항',
                icon: '📢',
                description: '공지사항'
            }
        ];
        localStorage.setItem('selectedWidgets', JSON.stringify(defaultWidgets));
        
        // 메뉴 설정 초기화
        const defaultMenus = [
            {
                name: '홈',
                icon: '🏠',
                order: 0
            },
            {
                name: '시설',
                icon: '🏫',
                order: 1
            },
            {
                name: '커뮤니티',
                icon: '💬',
                order: 2
            },
            {
                name: '내 정보',
                icon: '👤',
                order: 3
            },
            {
                name: '알림',
                icon: '🔔',
                order: 4
            }
        ];
        localStorage.setItem('activeMenus', JSON.stringify(defaultMenus));
        
        // 앱 재시작 (페이지 리로드)
        alert('모든 설정이 초기화되었습니다. 앱을 다시 시작합니다.');
        window.location.reload();
    }
}

// 프로필 드롭다운 토글 함수
function toggleProfileDropdown() {
    const dropdown = document.querySelector('.profile-dropdown');
    dropdown.classList.toggle('active');
    
    // 드롭다운 외부 클릭 시 닫기 이벤트 추가
    if (dropdown.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('click', closeProfileDropdown);
        }, 0);
    }
}

// 드롭다운 닫기 함수
function closeProfileDropdown(event) {
    const dropdown = document.querySelector('.profile-dropdown');
    const profileIcon = document.querySelector('.header-profile-image');
    
    if (!dropdown.contains(event.target) && event.target !== profileIcon) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeProfileDropdown);
    }
}

// 프로필 관련 페이지 네비게이션
function navigateToProfilePage(pageName) {
    // 현재 로그인 상태 확인
    const currentUser = localStorage.getItem('currentLoggedInUser');

    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        goToPage('login');
        return;
    }

    // 페이지 이름에 따라 분기 처리
    switch(pageName) {
        case 'timetable':
            alert('내 시간표 페이지로 이동합니다.');
            window.location.href = 'timetable.html';
            break;
    
        case 'my-courses':
            alert('내 수강 강의 페이지로 이동합니다.');
            // window.location.href = 'my-courses.html';
            break;

        case 'favorite-classrooms':
            alert('즐겨찾는 강의실 페이지로 이동합니다.');
            // window.location.href = 'favorite-classrooms.html';
            break;

        case 'profile-edit':
            alert('개인정보 수정 페이지로 이동합니다.');
            window.location.href = 'profile-edit.html';
            break;

        case 'grades':
            alert('성적 조회 페이지로 이동합니다.');
            // window.location.href = 'grades.html';
            break;
    
        case 'course-registration':
            alert('수강 신청 내역 페이지로 이동합니다.');
            // window.location.href = 'course-registration.html';
            break;
        
        case 'scholarships':
            // 장학금 내역 페이지로 이동 (따로 만들거나 기존 장학금 정보 페이지로 이동)
            window.location.href = 'scholarship-info.html';
            break;

        case 'tuition':
            alert('등록금 납부 내역 페이지로 이동합니다.');
            // window.location.href = 'tuition.html';
            break;

        case 'notification-settings':
            alert('알림 설정 페이지로 이동합니다.');
            // window.location.href = 'notification-settings.html';
            break;

        case 'widget-settings':
            alert('위젯 및 메뉴 설정 페이지로 이동합니다.');
            window.location.href = 'widget-settings.html';
            break;

        case 'app-info':
            alert('앱 정보 페이지로 이동합니다.');
            window.location.href = 'app-info.html';
            break;
        default:
            alert('준비 중인 기능입니다.');
    }
}


// 시간표 관련 데이터 가져오기 및 처리 함수
function loadTimetableData() {
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (!currentUser) {
        console.log('로그인되지 않은 상태입니다.');
        return [];
    }
    
    // 현재 학기 정보 계산
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let semester = 1;
    
    // 3-8월: 1학기, 9-2월: 2학기
    if (currentMonth >= 3 && currentMonth <= 8) {
        semester = 1;
    } else {
        semester = 2;
    }
    
    // 시간표 ID 가져오기
    const currentTimetable = JSON.parse(localStorage.getItem(`currentTimetable_user_${currentUser}`)) || { id: 1 };
    const coursesKey = `courses_${currentYear}_${semester}_${currentTimetable.id}_user_${currentUser}`;
    
    console.log('시간표 데이터 키:', coursesKey);
    const courses = JSON.parse(localStorage.getItem(coursesKey)) || [];
    console.log('시간표 데이터:', courses);
    
    return courses;
}

// 현재 시간 및 요일 정보 가져기기
function getCurrentTimeInfo() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0(일) ~ 6(토)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return {
        day: dayOfWeek, // 실제 요일 (월=1, 화=2, ..., 일=0)
        hour: currentHour,
        minute: currentMinute,
        totalMinutes: currentHour * 60 + currentMinute
    };
}

// 교시별 시간 정보 (시간표 페이지와 동일)
window.periods  = {
    1: { start: "09:30", end: "10:20" },
    2: { start: "10:30", end: "11:20" },
    3: { start: "11:30", end: "12:20" },
    4: { start: "12:30", end: "13:20" },
    5: { start: "13:30", end: "14:20" },
    6: { start: "14:30", end: "15:20" },
    7: { start: "15:30", end: "16:20" },
    8: { start: "16:30", end: "17:20" },
    9: { start: "17:30", end: "18:20" },
    10: { start: "18:30", end: "19:20" },
    11: { start: "19:30", end: "20:20" },
    12: { start: "20:30", end: "21:20" },
    13: { start: "21:30", end: "22:20" }
};

// 2. periodTimes 변수도 같은 값으로 설정
window.periodTimes = window.periods;

// 함수 내부의 periods 정의를 무력화
const originalUpdateTimetablePreview = updateTimetablePreview;  
updateTimetablePreview = function() {
    // periods 객체를 보존하기 위해 임시 저장
    const savedPeriods = window.periods;
    
    // 원래 함수 실행
    const result = originalUpdateTimetablePreview.apply(this, arguments);
    
    // periods 객체를 복원
    window.periods = savedPeriods;
    
    // 함수 실행 후 DOM에서 시간 직접 수정
    setTimeout(() => {
        const classItems = document.querySelectorAll('.class-item');
        classItems.forEach(item => {
            const timeEl = item.querySelector('.class-time');
            if (timeEl && timeEl.textContent === '09:00') {
                timeEl.textContent = '09:30';
                console.log('시간 수정: 09:00 → 09:30');
            }
        });
    }, 50);
    
    return result;
};

// 시간표 미리보기 다시 업데이트
updateTimetablePreview();

// 시간 문자열을 분으로 변환
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// 현재 수업 및 다음 수업 찾기
function findCurrentAndNextClass() {
    const courses = loadTimetableData();
    if (!courses || courses.length === 0) {
        console.log('시간표 데이터가 없습니다.');
        return { currentClass: null, nextClass: null };
    }
    
    const currentTime = getCurrentTimeInfo();
    console.log('현재 시간 정보:', currentTime);
    
    let currentClass = null;
    let nextClass = null;
    
    // 일요일이면 수업 없음
    if (currentTime.day === 0) {
        return { currentClass, nextClass };
    }
    
    let allTodaysClasses = [];
    
    // 오늘의 모든 수업 수집
    courses.forEach(course => {
        course.times.forEach(time => {
            if (time.day === currentTime.day) {
                for (let period = time.start; period <= time.end; period++) {
                    const startMinutes = timeToMinutes(periodTimes[period].start);
                    const endMinutes = timeToMinutes(periodTimes[period].end);
                    
                    allTodaysClasses.push({
                        course: course,
                        period: period,
                        startMinutes: startMinutes,
                        endMinutes: endMinutes,
                        startTime: periodTimes[period].start,
                        endTime: periodTimes[period].end
                    });
                }
            }
        });
    });
    
    console.log('오늘의 모든 수업:', allTodaysClasses);
    
    // 시간 순으로 정렬
    allTodaysClasses.sort((a, b) => a.startMinutes - b.startMinutes);
    
    // 현재 수강 중인 수업 찾기
    for (let classInfo of allTodaysClasses) {
        if (currentTime.totalMinutes >= classInfo.startMinutes && 
            currentTime.totalMinutes < classInfo.endMinutes) {
            currentClass = {
                ...classInfo,
                remainingMinutes: classInfo.endMinutes - currentTime.totalMinutes
            };
            break;
        }
    }
    
    // 다음 수업 찾기
    for (let classInfo of allTodaysClasses) {
        if (classInfo.startMinutes > currentTime.totalMinutes) {
            nextClass = {
                ...classInfo,
                minutesToStart: classInfo.startMinutes - currentTime.totalMinutes
            };
            break;
        }
    }
    
    console.log('현재 수업:', currentClass);
    console.log('다음 수업:', nextClass);
    
    return { currentClass, nextClass };
}

// 오늘의 모든 수업 가져오기
function getTodaysClasses(courses) {
    const currentTime = getCurrentTimeInfo();
    const todaysClasses = [];
    
    // 일요일이면 빈 배열 반환
    if (currentTime.day === 0) {
        return todaysClasses;
    }
    
    // 오늘의 모든 수업을 찾아 시간 순으로 정렬
    for (const course of courses) {
        for (const time of course.times) {
            if (time.day !== currentTime.day) continue;
            
            // 수업의 첫 번째 교시 정보만 추가 (미리보기용)
            todaysClasses.push({
                course: course,
                period: time.start,
                startTime: periodTimes[time.start].start,
                endTime: periodTimes[time.end].end,
                startMinutes: timeToMinutes(periodTimes[time.start].start)
            });
        }
    }
    
    // 시간 순으로 정렬
    todaysClasses.sort((a, b) => a.startMinutes - b.startMinutes);
    
    return todaysClasses;
}

// 시간표 미리보기 업데이트
function updateTimetablePreview() {
    console.log('=== 시간표 미리보기 업데이트 시작 ===');
    
    // 1. 날짜 업데이트
    const dateEl = document.querySelector('.timetable-date');
    if (dateEl) {
        const now = new Date();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]}) 시간표`;
        dateEl.textContent = dateStr;
    }
    
    // 2. 컨테이너 확인
    const classContainer = document.getElementById('timetable-preview-content');
    if (!classContainer) {
        console.error('시간표 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 3. 로그인 상태 확인
    const currentUser = localStorage.getItem('currentLoggedInUser');
    const statusEl = document.querySelector('.timetable-now');
    
    if (!currentUser) {
        console.log('로그인 상태가 아닙니다.');
        if (statusEl) {
            statusEl.textContent = '로그인 필요';
            statusEl.style.backgroundColor = '#888';
        }
        
        classContainer.innerHTML = `
            <div class="class-item">
                <div class="class-time">--:--</div>
                <div class="class-info">
                    <div class="class-name">로그인 후 시간표를 확인하세요</div>
                    <div class="class-location">로그인이 필요한 서비스입니다</div>
                </div>
            </div>
        `;
        return;
    }
    
    // 4. 디버깅: 모든 시간표 관련 키 찾기
    console.log('현재 로그인 사용자:', currentUser);
    console.log('=== localStorage의 모든 키 확인 ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('courses_') || key.includes('currentTimetable')) {
            console.log(`키: ${key}, 값: ${localStorage.getItem(key)}`);
        }
    }
    
    // 5. 시간표 데이터 로드
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const semester = (currentMonth >= 3 && currentMonth <= 8) ? 1 : 2;
        
        // 현재 시간표 ID 가져오기
        const currentTimetableKey = `currentTimetable_user_${currentUser}`;
        const currentTimetable = JSON.parse(localStorage.getItem(currentTimetableKey) || '{"id": 1}');
        console.log('현재 시간표 정보:', currentTimetable);
        
        // 시간표 데이터 키 생성 및 확인
        const coursesKey = `courses_${currentYear}_${semester}_${currentTimetable.id}_user_${currentUser}`;
        console.log('시간표 키:', coursesKey);
        
        // 데이터 존재 여부 확인
        const coursesData = localStorage.getItem(coursesKey);
        console.log('시간표 데이터 원본:', coursesData);
        
        let courses = [];
        if (coursesData) {
            try {
                courses = JSON.parse(coursesData);
                console.log('파싱된 시간표 데이터:', courses);
            } catch (e) {
                console.error('시간표 데이터 파싱 오류:', e);
                courses = [];
            }
        }
        
        // 6. 데이터가 없을 때 다른 가능한 키들 시도
        if (!Array.isArray(courses) || courses.length === 0) {
            console.log('기본 키로 데이터를 찾지 못함. 다른 키들 시도...');
            
            // 가능한 다른 키 형식들 시도
            const alternativeKeys = [
                `courses_${currentYear}_${semester}_1_user_${currentUser}`,
                `courses_${currentYear}_${semester}_${currentUser}`,
                `courses_user_${currentUser}`,
                `courses_${currentUser}`,
            ];
            
            for (const altKey of alternativeKeys) {
                console.log(`시도 중인 키: ${altKey}`);
                const altData = localStorage.getItem(altKey);
                if (altData) {
                    try {
                        const altCourses = JSON.parse(altData);
                        if (Array.isArray(altCourses) && altCourses.length > 0) {
                            courses = altCourses;
                            console.log(`성공! 키 ${altKey}에서 데이터 발견:`, courses);
                            break;
                        }
                    } catch (e) {
                        console.error(`키 ${altKey} 파싱 오류:`, e);
                    }
                }
            }
        }
        
        // 7. 여전히 데이터가 없으면 메시지 표시
        if (!Array.isArray(courses) || courses.length === 0) {
            console.log('모든 키 시도 후에도 시간표 데이터를 찾지 못함');
            if (statusEl) {
                statusEl.textContent = '시간표 없음';
                statusEl.style.backgroundColor = '#888';
            }
            
            classContainer.innerHTML = `
                <div class="class-item">
                    <div class="class-time">--:--</div>
                    <div class="class-info">
                        <div class="class-name">등록된 과목이 없습니다</div>
                        <div class="class-location">시간표에 과목을 추가해주세요</div>
                    </div>
                </div>
                <div class="class-item" style="border-top: 1px solid #eee; margin-top: 10px;">
                    <div class="class-time" style="width: 100%;">
                        <button onclick="navigateToTimetable()" style="
                            width: 100%; 
                            padding: 10px; 
                            background-color: #c62917; 
                            color: white; 
                            border: none; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            cursor: pointer;
                        ">
                            시간표로 이동
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // 8. 오늘의 수업 찾기
        const now = new Date();
        const currentDay = now.getDay(); // 0(일) ~ 6(토)
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        
        console.log('현재 요일:', currentDay, '현재 시간:', `${currentHour}:${currentMinute.toString().padStart(2, '0')}`, '총 분:', currentTotalMinutes);
        
        const todaysClasses = [];
        
        courses.forEach(course => {
            console.log('검사 중인 과목:', course);
            if (!course.times || !Array.isArray(course.times)) {
                console.log('시간 정보 없음:', course);
                return;
            }
            
            course.times.forEach(time => {
                console.log('시간 정보:', time, '현재 요일:', currentDay);
                if (time.day === currentDay) {
                    console.log('오늘 수업 발견:', course.name);
                    
                    // periodTimes 정의
                    const periods = {
                        1: { start: "09:00", end: "10:20" },
                        2: { start: "10:30", end: "11:50" },
                        3: { start: "12:00", end: "13:20" },
                        4: { start: "13:30", end: "14:50" },
                        5: { start: "15:00", end: "16:20" },
                        6: { start: "16:30", end: "17:50" },
                        7: { start: "18:00", end: "19:20" },
                        8: { start: "19:30", end: "20:50" },
                        9: { start: "21:00", end: "22:20" }
                    };
                    
                    const startTime = periods[time.start].start;
                    const endTime = periods[time.end].end;
                    
                    // 시간을 분으로 변환 (더 정확한 계산)
                    const [startHour, startMin] = startTime.split(':').map(Number);
                    const [endHour, endMin] = endTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;
                    
                    console.log(`수업 ${course.name}: ${startTime}(${startMinutes}분) ~ ${endTime}(${endMinutes}분), 현재: ${currentTotalMinutes}분`);
                    
                    todaysClasses.push({
                        course: course,
                        startTime: startTime,
                        endTime: endTime,
                        startMinutes: startMinutes,
                        endMinutes: endMinutes
                    });
                }
            });
        });
        
        // 시간 순으로 정렬
        todaysClasses.sort((a, b) => a.startMinutes - b.startMinutes);
        
        console.log('오늘의 수업 목록:', todaysClasses);
        
        if (todaysClasses.length === 0) {
            if (statusEl) {
                statusEl.textContent = '수업 없음';
                statusEl.style.backgroundColor = '#888';
            }
            
            classContainer.innerHTML = `
                <div class="class-item">
                    <div class="class-time">--:--</div>
                    <div class="class-info">
                        <div class="class-name">오늘 수업이 없습니다</div>
                        <div class="class-location">좋은 하루 보내세요!</div>
                    </div>
                </div>
                <div class="class-item" style="border-top: 1px solid #eee; margin-top: 10px;">
                    <div class="class-time" style="width: 100%;">
                        <button onclick="navigateToTimetable()" style="
                            width: 100%; 
                            padding: 10px; 
                            background-color: #c62917; 
                            color: white; 
                            border: none; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            cursor: pointer;
                        ">
                            시간표 보기
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // 9. 현재 수업 상태 확인 (더 정확한 로직)
        let currentClass = null;
        let hasUpcomingClass = false;
        let allClassesEnded = true;
        
        for (let cls of todaysClasses) {
            // 수업 시작 5분 전부터 "수강 예정"으로 표시
            const earlyStartMinutes = cls.startMinutes - 5;
            
            console.log(`수업 ${cls.course.name} 검사: ${cls.startMinutes} <= ${currentTotalMinutes} < ${cls.endMinutes}`);
            
            if (currentTotalMinutes >= cls.startMinutes && currentTotalMinutes < cls.endMinutes) {
                currentClass = cls;
                allClassesEnded = false;
                console.log('현재 수강 중인 강의:', currentClass.course.name);
                break;
            } else if (cls.startMinutes > currentTotalMinutes) {
                hasUpcomingClass = true;
                allClassesEnded = false;
            }
        }
        
        // 상태 배지 업데이트
        if (statusEl) {
            if (currentClass) {
                const remainingMinutes = currentClass.endMinutes - currentTotalMinutes;
                statusEl.textContent = `수강 중 (${remainingMinutes}분 남음)`;
                statusEl.style.backgroundColor = '#4caf50';
            } else if (hasUpcomingClass) {
                const nextClass = todaysClasses.find(cls => cls.startMinutes > currentTotalMinutes);
                if (nextClass) {
                    const minutesToStart = nextClass.startMinutes - currentTotalMinutes;
                    statusEl.textContent = `수강 예정 (${minutesToStart}분 후)`;
                } else {
                    statusEl.textContent = '수강 예정';
                }
                statusEl.style.backgroundColor = '#ff9800';
            } else if (allClassesEnded) {
                statusEl.textContent = '수강 종료';
                statusEl.style.backgroundColor = '#888';
            } else {
                statusEl.textContent = '수업 없음';
                statusEl.style.backgroundColor = '#888';
            }
        }
        
        // 10. 수업 목록 렌더링
        classContainer.innerHTML = '';
        todaysClasses.forEach(cls => {
            const classDiv = document.createElement('div');
            classDiv.className = 'class-item';
            
            let statusText = '';
            let statusColor = '#888';
            
            if (currentTotalMinutes >= cls.startMinutes && currentTotalMinutes < cls.endMinutes) {
                const remainingMinutes = cls.endMinutes - currentTotalMinutes;
                statusText = `수강 중 (${remainingMinutes}분 남음)`;
                statusColor = '#4caf50';
            } else if (cls.startMinutes > currentTotalMinutes) {
                const minutesToStart = cls.startMinutes - currentTotalMinutes;
                statusText = `수강 예정 (${minutesToStart}분 후)`;
                statusColor = '#ff9800';
            } else {
                statusText = '수강 종료';
                statusColor = '#888';
            }
            
            const professorName = cls.course.professor || '교수명 미정';
            const roomNumber = cls.course.room || '강의실 미정';
            
            classDiv.innerHTML = `
                <div class="class-time">${cls.startTime}</div>
                <div class="class-info">
                    <div class="class-name" style="color: ${statusColor};">${cls.course.name}</div>
                    <div class="class-location">${professorName} | ${roomNumber}</div>
                    <div style="color: ${statusColor}; font-size: 12px; margin-top: 4px; font-weight: bold;">
                        ${statusText}
                    </div>
                </div>
            `;
            classContainer.appendChild(classDiv);
        });
        
        // 시간표 이동 버튼 추가
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'class-item';
        buttonDiv.style.borderTop = '1px solid #eee';
        buttonDiv.style.marginTop = '10px';
        buttonDiv.innerHTML = `
            <div class="class-time" style="width: 100%;">
                <button onclick="navigateToTimetable()" style="
                    width: 100%; 
                    padding: 10px; 
                    background-color: #c62917; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    font-size: 14px; 
                    cursor: pointer;
                ">
                    시간표 보기
                </button>
            </div>
        `;
        classContainer.appendChild(buttonDiv);
        
    } catch (error) {
        console.error('시간표 미리보기 업데이트 중 오류:', error);
        
        if (statusEl) {
            statusEl.textContent = '오류 발생';
            statusEl.style.backgroundColor = '#f44336';
        }
        
        classContainer.innerHTML = `
            <div class="class-item">
                <div class="class-time">--:--</div>
                <div class="class-info">
                    <div class="class-name">시간표 로드 중 오류 발생</div>
                    <div class="class-location">페이지를 새로고침해주세요</div>
                </div>
            </div>
            <div class="class-item" style="border-top: 1px solid #eee; margin-top: 10px;">
                <div class="class-time" style="width: 100%;">
                    <button onclick="navigateToTimetable()" style="
                        width: 100%; 
                        padding: 10px; 
                        background-color: #c62917; 
                        color: white; 
                        border: none; 
                        border-radius: 6px; 
                        font-size: 14px; 
                        cursor: pointer;
                    ">
                        시간표 보기
                    </button>
                </div>
            </div>
        `;
    }
    
    console.log('=== 시간표 미리보기 업데이트 완료 ===');
}

// 저장된 위젯 설정 불러오기
function loadWidgetSettings() {
    // 로컬 스토리지에서 위젯 설정 가져오기
    const widgetsData = localStorage.getItem('selectedWidgets');
    
    let selectedWidgets;
    if (widgetsData) {
        selectedWidgets = JSON.parse(widgetsData);
    } else {
        // 기본 위젯 설정 (학식 제거, 셔틀버스 추가)
        selectedWidgets = [
            { name: '교내/대외활동', icon: '🌟', description: '공모전, 동아리, 봉사활동 정보' },
            { name: '학사일정', icon: '📅', description: '주요 일정 및 행사' },
            { name: '셔틀버스', icon: '🚌', description: '셔틀 시간표' }
        ];
        localStorage.setItem('selectedWidgets', JSON.stringify(selectedWidgets));
    }
    
    // 바로가기 메뉴 컨테이너
    const shortcutMenu = document.querySelector('.shortcut-menu');
    
    if (shortcutMenu && selectedWidgets.length > 0) {
        // 기존 메뉴 아이템 제거
        shortcutMenu.innerHTML = '';
        
        // 선택된 위젯 추가 (최대 5개)
        const maxWidgets = Math.min(selectedWidgets.length, 5);
        
        for (let i = 0; i < maxWidgets; i++) {
            const widget = selectedWidgets[i];
            
            const shortcutItem = document.createElement('div');
            shortcutItem.className = 'shortcut-item';
            
            const shortcutIcon = document.createElement('div');
            shortcutIcon.className = 'shortcut-icon';
            shortcutIcon.textContent = widget.icon;
            
            const shortcutText = document.createElement('div');
            shortcutText.className = 'shortcut-text';
            shortcutText.textContent = widget.name;
            
            shortcutItem.appendChild(shortcutIcon);
            shortcutItem.appendChild(shortcutText);
            shortcutMenu.appendChild(shortcutItem);
            
            // 위젯 클릭 이벤트 추가
            shortcutItem.addEventListener('click', function() {
                handleWidgetClick(widget.name);
            });
        }
    }
    
    // 하단 탭 메뉴 설정 불러오기
    loadTabMenuSettings();
}

// 하단 탭 메뉴 설정 불러오기
function loadTabMenuSettings() {
    const menuData = localStorage.getItem('activeMenus');
    
    if (menuData) {
        const activeMenus = JSON.parse(menuData);
        
        // 하단 탭 메뉴 컨테이너
        const tabMenu = document.querySelector('.tab-menu');
        
        if (tabMenu && activeMenus.length > 0) {
            // 기본 순서 정의 (홈 - 시설 - 커뮤니티 - 내정보 - 알림)
            const defaultOrder = [
                { name: '홈', icon: '🏠', order: 0 },
                { name: '시설', icon: '🏫', order: 1 },
                { name: '커뮤니티', icon: '💬', order: 2 },
                { name: '내 정보', icon: '👤', order: 3 },
                { name: '알림', icon: '🔔', order: 4 }
            ];
            
            // 기존 메뉴 아이템 제거
            tabMenu.innerHTML = '';
            
            // 활성화된 메뉴 추가
            defaultOrder.forEach((menu, index) => {
                const tabItem = document.createElement('div');
                tabItem.className = 'tab-item';
                if (index === 0) {
                    tabItem.classList.add('active');
                }
                
                // 탭 이름에 따라 ID 설정
                let tabId;
                switch (menu.name) {
                    case '홈':
                        tabId = 'home';
                        break;
                    case '시설':
                        tabId = 'facility';
                        break;
                    case '커뮤니티':
                        tabId = 'community';
                        break;
                    case '알림':
                        tabId = 'alert';
                        break;
                    case '내 정보':
                        tabId = 'profile';
                        break;
                    case '셔틀버스':
                        tabId = 'shuttle';
                        break;
                    case '강의평가':
                        tabId = 'lecture';
                        break;
                    default:
                        tabId = menu.name.toLowerCase();
                }
                
                tabItem.onclick = function() {
                    switchTab(tabId);
                };
                
                const tabIcon = document.createElement('span');
                tabIcon.className = 'tab-icon';
                tabIcon.textContent = menu.icon;
                
                const tabText = document.createElement('span');
                tabText.textContent = menu.name;
                
                tabItem.appendChild(tabIcon);
                tabItem.appendChild(tabText);
                tabMenu.appendChild(tabItem);
            });
            
            // 메뉴 설정 업데이트
            localStorage.setItem('activeMenus', JSON.stringify(defaultOrder));
        }
    } else {
        // 기본값으로 설정
        const defaultMenus = [
            { name: '홈', icon: '🏠', order: 0 },
            { name: '시설', icon: '🏫', order: 1 },
            { name: '커뮤니티', icon: '💬', order: 2 },
            { name: '내 정보', icon: '👤', order: 3 },
            { name: '알림', icon: '🔔', order: 4 }
        ];
        localStorage.setItem('activeMenus', JSON.stringify(defaultMenus));
    }
}

// 위젯 클릭 처리
function handleWidgetClick(widgetName) {
    // 위젯 이름에 따른 기능 처리
    switch (widgetName) {
        case '강의평가':
            switchTab('community');
            break;
        case '셔틀버스':
            goToPage('shuttle');
            break;
        case '장학금 정보':
            // 장학금 정보 페이지로 이동
            window.location.href = 'scholarship-info.html';
            break;
       case '내 시간표':
            navigateToProfilePage('timetable');
            break;
        case '공지사항':
            // 공지사항 섹션으로 스크롤
            const noticeSection = document.querySelector('.notice-list');
            if (noticeSection) {
                noticeSection.scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case '취업/채용':
            goToPage('job-info');
            break;
        case '교내/대외활동':
            window.location.href = 'activities.html';
            break;
        default:
            alert(`${widgetName} 기능은 준비 중입니다.`);
    }
}

// "undefined" 문제 해결을 위한 searchFacilities 함수 수정
// 검색 기능 수정 - "undefined" 문제 해결 및 검색 결과 UI 개선
function searchFacilities(query) {
    // 검색어가 비어있으면 원래 컨텐츠 표시
    if (!query || !query.trim()) {
        document.getElementById('search-results').style.display = 'none';
        document.getElementById('no-results').style.display = 'none';
        document.getElementById('original-content').style.display = 'block';
        
        // 지도 컨테이너가 전체적으로 표시되도록 추가
        const mapContainer = document.getElementById('naverMap');
        if (mapContainer) {
            mapContainer.style.width = '100%';
            mapContainer.style.height = '350px';
        }
        
        // 지도 갱신
        if (naverMap) {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                naverMap.refresh();
            }, 100);
        }
        return;
    }
    
    query = query.toLowerCase().trim();
    
    // 건물 및 편의시설 데이터 통합 검색
    const allFacilities = [...buildingData, ...facilityData];
    
    // 검색 결과와 관련성 점수 계산
    const scoredResults = allFacilities.map(item => {
        let score = 0;
        const name = item.name || '';
        const description = item.description || '';
        const id = item.id || '';
        const relatedBuilding = item.relatedBuilding || '';
        
        // 이름 매칭 - 가장 높은 점수
        if (name.toLowerCase() === query) {
            score += 100; // 정확한 일치
        } else if (name.toLowerCase().startsWith(query)) {
            score += 75; // 시작 부분 일치
        } else if (name.toLowerCase().includes(query)) {
            score += 50; // 부분 일치
        }
        
        // 설명 매칭
        if (description.toLowerCase().includes(query)) {
            score += 25;
        }
        
        // 빌딩 ID/관련 건물 매칭
        if (id.toLowerCase().includes(query)) {
            score += 40;
        }
        
        // 관련 건물 매칭 (편의시설의 경우)
        if (relatedBuilding.toLowerCase().includes(query)) {
            score += 35;
        }
        
        return { item, score };
    }).filter(result => result.score > 0); // 점수가 0보다 큰 결과만 포함
    
    // 점수에 따라 결과 정렬
    scoredResults.sort((a, b) => b.score - a.score);
    
    // 검색 결과 추출
    const results = scoredResults.map(result => result.item);
    
    // 검색 결과 컨테이너
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = '';
    
    // 결과 표시
    if (results.length > 0) {
        // 검색 결과 표시
        results.forEach(item => {
            // 명시적으로 변수 정의 (undefined 방지)
            const itemName = item.name || '';
            const itemDesc = item.description || '';
            const itemId = item.id || '';
            const itemImage = item.image || 'https://placehold.co/80x60/gray/white?text=이미지';
            
            const resultItem = document.createElement('div');
            resultItem.className = 'building-item';
            resultItem.onclick = function() {
                if (item.type === 'building') {
                    showBuildingDetail(itemId);
                } else {
                    showFacilityDetail(itemId);
                }
            };
            
            // 검색어 하이라이트 처리
            const highlightedName = highlightText(itemName, query);
            const highlightedDescription = highlightText(itemDesc, query);
            
            resultItem.innerHTML = `
                <div class="building-image">
                    <img src="${itemImage}" alt="${itemName}">
                </div>
                <div class="building-info-container">
                    <div class="building-info">
                        <div class="building-name">${highlightedName}</div>
                        <div class="building-description">${highlightedDescription}</div>
                    </div>
                    <div class="building-nav-button" onclick="navigateToBuilding('${itemId}', event)">
                        <span>길찾기</span>
                        <span>🧭</span>
                    </div>
                </div>
            `;
            
            searchResultsContainer.appendChild(resultItem);
        });
        
        // 검색 결과 표시, 원래 컨텐츠 숨기기
        searchResultsContainer.style.display = 'block';
        document.getElementById('no-results').style.display = 'none';
        document.getElementById('original-content').style.display = 'none';
    } else {
        // 검색 결과 없음 표시
        searchResultsContainer.style.display = 'none';
        document.getElementById('no-results').style.display = 'block';
        document.getElementById('original-content').style.display = 'none';
    }
    
    // 클리어 버튼 표시 여부 업데이트
    updateClearButton();
}
        
// 검색어 하이라이트 처리 함수
function highlightText(text, query) {
    if (!text || !query || query.trim() === '') return text;
    
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// 클리어 버튼 업데이트 함수
function updateClearButton() {
    const searchInput = document.getElementById('facility-search-input');
    const clearButton = document.querySelector('.search-clear');
    
    if (searchInput && clearButton) {
        if (searchInput.value.trim() !== '') {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    }
}

// 검색 초기화 함수 수정
function clearSearch() {
    const searchInput = document.getElementById('facility-search-input');
    if (searchInput) {
        searchInput.value = '';
        
        // 검색 결과 숨기기, 원래 컨텐츠 표시
        document.getElementById('search-results').style.display = 'none';
        document.getElementById('no-results').style.display = 'none';
        document.getElementById('original-content').style.display = 'block';
        
        // 클리어 버튼 숨기기
        const clearButton = document.querySelector('.search-clear');
        if (clearButton) {
            clearButton.style.display = 'none';
        }
        
        // 지도 컨테이너 전체화면으로 표시
        const mapContainer = document.getElementById('naverMap');
        if (mapContainer) {
            mapContainer.style.width = '100%';
            mapContainer.style.height = '350px';
        }
        
        // 지도 갱신
        if (naverMap) {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                naverMap.refresh();
            }, 100);
        }
    }
}

// 빠른 검색 실행 함수
function quickSearch(keyword) {
    const searchInput = document.getElementById('facility-search-input');
    if (searchInput) {
        searchInput.value = keyword;
        searchFacilities(keyword);
        updateClearButton();
    }
}

// 검색 기능 초기화
function initSearchFunctionality() {
    const searchInput = document.getElementById('facility-search-input');
    if (searchInput) {
        // Enter 키 처리
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchFacilities(this.value);
            }
        });
        
        // 포커스 아웃 시 검색 실행
        searchInput.addEventListener('blur', function() {
            searchFacilities(this.value);
        });
        
        // 검색창이 비워졌을 때 원래 내용 표시
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                document.getElementById('search-results').style.display = 'none';
                document.getElementById('no-results').style.display = 'none';
                document.getElementById('original-content').style.display = 'block';
            }
            updateClearButton();
        });
    }

    // 빠른 검색 버튼 활성화 코드
    const quickSearchButtons = document.querySelectorAll('.quick-search-buttons .category-tag');
    quickSearchButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 다른 모든 버튼 비활성화
            quickSearchButtons.forEach(btn => btn.classList.remove('active'));
            // 클릭한 버튼 활성화
            this.classList.add('active');
        });
    });
}

// 페이지 로드시 custom 텍스트를 실제 이미지로 변경하는 기능
document.addEventListener('DOMContentLoaded', function() {
    // Placeholder 이미지 URL 문제 해결을 위한 코드
    function fixPlaceholderImages() {
        console.log('Placeholder 이미지 URL 수정 중...');

        // 모든 img 태그 중 placeholder를 사용하는 것 찾기
        document.querySelectorAll('img[src*="/api/placeholder/"]').forEach(img => {
            const src = img.getAttribute('src');
            const dimensions = src.match(/\/api\/placeholder\/(\d+)\/(\d+)/);
            
            if (dimensions && dimensions.length === 3) {
                const width = dimensions[1];
                const height = dimensions[2];
                const altText = img.getAttribute('alt') || 'Image';
                
                // placehold.co 서비스로 대체
                const newSrc = `https://placehold.co/${width}x${height}/gray/white?text=${encodeURIComponent(altText)}`;
                console.log(`이미지 URL 수정: ${src} → ${newSrc}`);
                img.src = newSrc;
            }
        });

        console.log('Placeholder 이미지 URL 수정 완료');

        // 시간표 미리보기 초기화 (다른 초기화 완료 후)
        setTimeout(() => {
            console.log('시간표 미리보기 초기화');
            updateTimetablePreview();
            
            // 1분마다 시간표 미리보기 업데이트
            setInterval(updateTimetablePreview, 60000);
        }, 1000);
    }

    // 즉시 실행하여 모든 이미지 URL 수정
    fixPlaceholderImages();

    // 기존 초기화 코드 실행
    setTimeout(updateAllProfileImages, 100);

    // localStorage 변경 감지를 위한 이벤트 리스너
    window.addEventListener('storage', function(event) {
        // 프로필 관련 변경사항 감지
        if (event.key === 'profileUpdated' || 
            event.key === 'profileImageUpdated' || 
            event.key.includes('_profileImage') || 
            event.key.includes('_customProfileImage')) {
            updateAllProfileImages();
        }
    });


window.addEventListener('activityStatsUpdated', function() { 
    console.log('활동 통계 업데이트 이벤트 수신'); 
    updateActivityStats(); 
}); 

window.addEventListener('activityDeadlinesUpdated', function() { 
    console.log('활동 마감 정보 업데이트 이벤트 수신'); 
    updateActivityNotices(); 
});




    // 카테고리 필터 기능
    initCategoryFilter();

    // 로그인 상태 체크 및 UI 업데이트
    checkLoginStatus();

    // 저장된 위젯 설정 불러오기
    loadWidgetSettings();

    // 시설 탭 초기화 (페이지네이션 포함)
    initFacilityTab();

    // 네이버 지도 초기화 - 수정된 함수로 교체
    initNaverMapWithFix();

    // 검색 기능 초기화
    initSearchFunctionality();

    // pageshow 이벤트 리스너 추가 - 뒤로가기로 돌아왔을 때 정보 갱신
    window.addEventListener('pageshow', function(event) {
        // bfcache에서 페이지가 복원된 경우에도 실행
        if (event.persisted) {
            checkLoginStatus(); // 로그인 상태와 프로필 정보 다시 확인
            updateAllProfileImages(); // 프로필 이미지도 다시 확인
            fixPlaceholderImages(); // 이미지 URL도 다시 확인
        }
    });
});



// 시간표 페이지로 이동하는 함수
function navigateToTimetable() {
    window.location.href = 'timetable.html';
}

// 에러 처리 및 로깅 함수들
function logError(message, error) {
    console.error(`[ERROR] ${message}:`, error);
    // 실제 서비스에서는 에러 로깅 서비스로 전송
}

function logWarning(message) {
    console.warn(`[WARNING] ${message}`);
}

function logInfo(message) {
    console.log(`[INFO] ${message}`);
}

// 안전한 JSON 파싱 함수
function safeJSONParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        logError('JSON 파싱 실패', error);
        return defaultValue;
    }
}

// 안전한 로컬 스토리지 접근 함수
function safeGetLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? safeJSONParse(item, defaultValue) : defaultValue;
    } catch (error) {
        logError(`로컬 스토리지 접근 실패: ${key}`, error);
        return defaultValue;
    }
}

function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        logError(`로컬 스토리지 저장 실패: ${key}`, error);
        return false;
    }
}

// 디바운스 함수 (검색이나 리사이즈 이벤트 최적화용)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스로틀 함수 (스크롤 이벤트 최적화용)
function throttle(func, wait) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

// 네트워크 상태 확인 함수
function checkNetworkStatus() {
    return navigator.onLine;
}

// 브라우저 지원 여부 확인 함수들
function checkGeolocationSupport() {
    return 'geolocation' in navigator;
}

function checkLocalStorageSupport() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

// 성능 모니터링 함수
function measurePerformance(functionName, func) {
    return function(...args) {
        const start = performance.now();
        const result = func.apply(this, args);
        const end = performance.now();
        logInfo(`${functionName} 실행 시간: ${(end - start).toFixed(2)}ms`);
        return result;
    };
}

// 이벤트 리스너 등록 헬퍼 함수
function addEventListenerSafe(element, event, handler) {
    if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(event, handler);
        return true;
    }
    logWarning(`이벤트 리스너 등록 실패: ${event}`);
    return false;
}

// DOM 요소 안전 선택 함수
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        logError(`DOM 선택 실패: ${selector}`, error);
        return null;
    }
}

// URL 파라미터 파싱 함수
function getURLParameter(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

// 랜덤 ID 생성 함수
function generateRandomId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 시간 포맷팅 함수들
function formatTime(date) {
    return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDate(date) {
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// 텍스트 유틸리티 함수들
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 배열 유틸리티 함수들
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function groupBy(array, key) {
    return array.reduce((result, item) => {
        (result[item[key]] = result[item[key]] || []).push(item);
        return result;
    }, {});
}

// 딥 클론 함수 (간단한 객체용)
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const cloned = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// 객체 비교 함수
function isEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        
        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!isEqual(obj1[key], obj2[key])) return false;
        }
        return true;
    }
    
    return obj1 === obj2;
}

// 애니메이션 유틸리티 함수
function smoothScroll(target, duration = 500) {
    const targetElement = typeof target === 'string' ? 
        document.querySelector(target) : target;
    
    if (!targetElement) return;
    
    const targetPosition = targetElement.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// 쿠키 관리 함수들 (GDPR 등 고려용)
const CookieManager = {
    set: function(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    get: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    delete: function(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
    }
};

// 전역 에러 핸들러 등록
window.addEventListener('error', function(event) {
    logError('전역 JavaScript 에러', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Promise rejection 핸들러
window.addEventListener('unhandledrejection', function(event) {
    logError('처리되지 않은 Promise rejection', event.reason);
    event.preventDefault();
});

// 개발 환경 전용 디버깅 함수들
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugUtils = {
        // 로컬 스토리지 전체 출력
        dumpLocalStorage: function() {
            const storage = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                storage[key] = localStorage.getItem(key);
            }
            console.table(storage);
        },
        
        // 현재 사용자 정보 출력
        getCurrentUser: function() {
            const user = localStorage.getItem('currentLoggedInUser');
            if (user) {
                const userInfo = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(`user_${user}_`)) {
                        userInfo[key] = localStorage.getItem(key);
                    }
                }
                console.table(userInfo);
            } else {
                console.log('로그인된 사용자가 없습니다.');
            }
        },
        
        // 셔틀버스 정보 출력
        getBusInfo: function() {
            const info = shuttleBusTimeTable.getNextBusInfo();
            console.log('다음 셔틀버스 정보:', info);
            console.log('다음 3개 버스:', shuttleBusTimeTable.getUpcomingBuses(3));
        },
        
        // 지도 상태 확인
        checkMapStatus: function() {
            console.log('지도 초기화 상태:', !!naverMap);
            console.log('마커 개수:', mapMarkers.length);
            console.log('사용자 위치:', userLocation);
            console.log('위치 추적 상태:', isTrackingUser);
        },
        
        // 시간표 데이터 확인
        checkTimetableData: function() {
            const data = loadTimetableData();
            console.log('시간표 데이터:', data);
            console.log('오늘의 수업:', getTodaysClasses(data));
        }
    };
    
    console.log('🔧 디버그 유틸리티가 window.debugUtils로 등록되었습니다.');
    console.log('사용 가능한 함수들:', Object.keys(window.debugUtils));
}

// 컴포넌트별 초기화 상태 추적
const initializationStatus = {
    map: false,
    busSystem: false,
    timetable: false,
    profile: false,
    search: false
};

// 초기화 완료 체크 함수
function checkInitializationComplete() {
    const allInitialized = Object.values(initializationStatus).every(status => status);
    if (allInitialized) {
        logInfo('모든 컴포넌트 초기화 완료');
        // 초기화 완료 이벤트 발생
        window.dispatchEvent(new CustomEvent('appInitComplete'));
    }
}

// 앱 초기화 완료 이벤트 리스너
window.addEventListener('appInitComplete', function() {
    logInfo('앱 초기화가 완전히 완료되었습니다.');
    // 필요한 후처리 작업 수행
});

// 페이지 언로드 시 정리 작업
window.addEventListener('beforeunload', function(event) {
    // 위치 추적 중지
    if (isTrackingUser) {
        stopUserTracking();
    }
    
    // 인터벌 정리
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    
    // 기타 정리 작업
    logInfo('페이지 언로드: 정리 작업 완료');
});

// 유틸리티 함수 내보내기 (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        safeJSONParse,
        safeGetLocalStorage,
        safeSetLocalStorage,
        debounce,
        throttle,
        deepClone,
        isEqual,
        generateRandomId,
        formatTime,
        formatDate,
        CookieManager
    };
}

// 전역 네임스페이스 오염 방지를 위한 즉시 실행 함수로 래핑
(function() {
    'use strict';
    
    // 앱 전체 설정
    const APP_CONFIG = {
        version: '1.0.0',
        apiTimeout: 5000,
        mapRefreshInterval: 30000,
        timetableUpdateInterval: 60000,
        debounceDelay: 300,
        throttleDelay: 100
    };
    
    // 설정 접근 함수
    window.getAppConfig = function(key) {
        return key ? APP_CONFIG[key] : APP_CONFIG;
    };
    
    logInfo(`앱 초기화 완료 - 버전 ${APP_CONFIG.version}`);
})();


// 메인 페이지에서 대외활동 통계 표시

function displayActivityStats() {
    // 로컬 스토리지에서 통계 정보 가져오기
    const statsData = localStorage.getItem('activityStats');
    
    if (statsData) {
        const stats = JSON.parse(statsData);
        
        // 통계 표시 요소들 가져오기 - 정확한 선택자 사용
        // 여기서는 메인 페이지의 활동 통계 표시 부분의 구조에 맞게 선택자 작성
        const contestElement = document.querySelector('.activity-stat-item:nth-child(1) .activity-stat-number');
        const clubElement = document.querySelector('.activity-stat-item:nth-child(2) .activity-stat-number');
        const externalElement = document.querySelector('.activity-stat-item:nth-child(3) .activity-stat-number');
        
        // 값 업데이트
        if (contestElement) {
            // 진행 중인 공모전 개수 업데이트
            contestElement.textContent = stats.contestCount;
        }
        
        if (clubElement) {
            // 신입 모집 동아리 개수 업데이트
            clubElement.textContent = stats.clubCount;
        }
        
        if (externalElement) {
            // 대외활동 기회 개수 업데이트
            externalElement.textContent = stats.externalCount;
        }
        
        // 추가적으로 봉사활동 통계를 표시할 요소가 있다면
        const volunteerElement = document.querySelector('.activity-stat-item:nth-child(4) .activity-stat-number');
        if (volunteerElement) {
            volunteerElement.textContent = stats.volunteerCount;
        }
        
        console.log('활동 통계 업데이트 완료:', stats);
    } else {
        console.log('저장된 활동 통계가 없습니다.');
    }
}




// 활동 통계 실시간 업데이트 함수
function updateActivityStats() {
    const statsData = localStorage.getItem('activityStats');
    
    if (statsData) {
        const stats = JSON.parse(statsData);
        
        // 통계 표시 요소들 가져오기
        const contestElement = document.querySelector('.activity-stat-item:nth-child(1) .activity-stat-number');
        const clubElement = document.querySelector('.activity-stat-item:nth-child(2) .activity-stat-number');
        const externalElement = document.querySelector('.activity-stat-item:nth-child(3) .activity-stat-number');
        
        // 값 업데이트
        if (contestElement) contestElement.textContent = stats.contestCount;
        if (clubElement) clubElement.textContent = stats.clubCount;
        if (externalElement) clubElement.textContent = stats.externalCount;
        
        console.log('활동 통계 업데이트 완료:', stats);
    } else {
        console.log('저장된 활동 통계가 없습니다.');
    }
}



// 마감 임박 활동 정보 업데이트 함수
function updateActivityNotices() {
    const noticesContainer = document.querySelector('.activity-summary-notices');
    if (!noticesContainer) return;
    
    const urgentActivitiesData = localStorage.getItem('urgentActivities');
    
    if (urgentActivitiesData) {
        const urgentActivities = JSON.parse(urgentActivitiesData);
        
        if (urgentActivities.length > 0) {
            // 알림 컨테이너 비우기
            noticesContainer.innerHTML = '';
            
            // 마감 임박 활동들 표시
            urgentActivities.forEach(activity => {
                let noticeText = '';
                
                if (activity.daysLeft > 0) {
                    noticeText = `${activity.title} 마감 ${activity.daysLeft}일 남음`;
                } else {
                    noticeText = `${activity.title} 마감 임박!`;
                }
                
                const noticeItem = document.createElement('div');
                noticeItem.className = 'activity-notice-item';
                noticeItem.innerHTML = `
                    <span class="activity-notice-icon">${activity.icon}</span>
                    <span class="activity-notice-text">${noticeText}</span>
                `;
                
                noticesContainer.appendChild(noticeItem);
            });
            
            console.log('마감 임박 활동 정보 업데이트 완료:', urgentActivities);
        } else {
            noticesContainer.innerHTML = `
                <div class="activity-notice-item">
                    <span class="activity-notice-icon">📌</span>
                    <span class="activity-notice-text">현재 마감 임박한 활동이 없습니다</span>
                </div>
            `;
        }
    } else {
        noticesContainer.innerHTML = `
            <div class="activity-notice-item">
                <span class="activity-notice-icon">📌</span>
                <span class="activity-notice-text">활동 정보를 불러올 수 없습니다</span>
            </div>
        `;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    // 활동 통계 로드
    updateActivityStats();
    // 마감 임박 활동 정보 로드
    updateActivityNotices();
    // 5분마다 자동 갱신 (선택적)
    setInterval(function() {
        updateActivityStats();
        updateActivityNotices();
    }, 300000);
});
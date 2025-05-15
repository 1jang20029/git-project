// 전역 변수
let currentRoute = 1;
let timeInterval;

// 셔틀버스 시간표 시스템 클래스
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
        
        // 노선별 정류장 시간표
        this.routeStops = {
            1: [ // 노선 1
                { name: '모래내시장역', time: '8:00', status: 'stop' },
                { name: '만수역', time: '8:03', status: 'stop' },
                { name: '남동구청역', time: '8:10', status: 'stop' },
                { name: '신천역(시흥)', time: '8:22', status: 'stop' },
                { name: '안양역(경유)', time: '9:05', status: 'transfer' },
                { name: '연성대학교', time: '9:15', status: 'arrival' }
            ],
            2: [ // 노선 2
                { name: '이마트', time: '8:00', status: 'stop' },
                { name: '정왕역', time: '8:04', status: 'stop' },
                { name: '장곡고교', time: '8:13', status: 'stop' },
                { name: '장곡중학교', time: '8:18', status: 'stop' },
                { name: '시흥농곡역', time: '8:25', status: 'stop' },
                { name: '시흥시청역', time: '8:28', status: 'stop' },
                { name: '동귀소입구', time: '8:31', status: 'stop' },
                { name: '안양역(경유)', time: '9:05', status: 'transfer' },
                { name: '연성대학교', time: '9:15', status: 'arrival' }
            ],
            3: [ // 노선 3
                { name: '서울남부법원', time: '8:00', status: 'stop' },
                { name: '진명여고', time: '8:02', status: 'stop' },
                { name: '목동역', time: '8:05', status: 'stop' },
                { name: '오목교역', time: '8:10', status: 'stop' },
                { name: '안양역(경유)', time: '9:05', status: 'transfer' },
                { name: '연성대학교', time: '9:15', status: 'arrival' }
            ]
        };
        
        this.startTimeUpdate();
    }
    
    startTimeUpdate() {
        // 1초마다 현재 시간 업데이트
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('currentTime').textContent = timeString;
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
    
    // 시간표 기반 정류장 상태 계산
    getRouteTimeTable(routeId) {
        const isOperating = this.isOperatingTime(routeId);
        const nextOperating = this.getNextOperatingTime(routeId);
        const currentPeriod = this.getCurrentPeriodInfo(routeId);
        const routeStops = this.routeStops[routeId];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // 분 단위
        
        const stopsWithStatus = routeStops.map((stop, index) => {
            let status = 'upcoming';
            let arrivalInfo = '예정';
            
            if (isOperating && currentPeriod) {
                // 현재 운행 중일 때
                const [timeHour, timeMin] = stop.time.split(':').map(Number);
                const stopTime = timeHour * 60 + timeMin;
                
                // 배차간격을 고려한 대략적인 상태 계산
                if (currentTime >= stopTime + 5) {
                    status = 'passed';
                    arrivalInfo = '통과함';
                } else if (currentTime >= stopTime - 5 && currentTime < stopTime + 5) {
                    status = 'current';
                    arrivalInfo = `${currentPeriod.시간대} 운행 중`;
                } else {
                    status = 'upcoming';
                    const interval = Array.isArray(currentPeriod.배차간격) 
                        ? currentPeriod.배차간격[0] 
                        : currentPeriod.배차간격;
                    arrivalInfo = `${interval}분 간격 운행`;
                }
            } else {
                // 미운행 시간일 때
                status = 'inactive';
                arrivalInfo = '미운행';
            }
            
            return {
                ...stop,
                status,
                arrivalInfo
            };
        });
        
        return {
            routeId,
            routeName: this.schedules[routeId].name,
            운행중: isOperating,
            currentPeriod: currentPeriod,
            다음운행: nextOperating,
            stops: stopsWithStatus
        };
    }
}

// 시간표 시스템 초기화
const timetable = new BusTimeTable();

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
    
    // 시간표 업데이트
    updateSchedule();
}

// 시간표 업데이트
function updateSchedule() {
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
        
        // 시간표 데이터 가져오기
        const scheduleData = timetable.getRouteTimeTable(currentRoute);
        if (scheduleData && scheduleData.stops) {
            updateRouteDisplay(scheduleData);
            updateOperatingStatus(scheduleData);
        }
        
    } catch (error) {
        console.error('시간표 업데이트 오류:', error);
    }
}

// 운행 상태 업데이트
function updateOperatingStatus(scheduleData) {
    const operatingStatusElement = document.getElementById('operatingStatus');
    const statusTextElement = document.getElementById('statusText');
    
    if (scheduleData.운행중) {
        operatingStatusElement.textContent = '운행 중';
        operatingStatusElement.style.color = '#4caf50';
        statusTextElement.textContent = `${scheduleData.currentPeriod.시간대} 운행`;
    } else {
        operatingStatusElement.textContent = '미운행';
        operatingStatusElement.style.color = '#f44336';
        statusTextElement.textContent = '운행 시간 외';
    }
}

// 노선 표시 업데이트
function updateRouteDisplay(scheduleData) {
    try {
        const routeContainer = document.getElementById(`busRoute${scheduleData.routeId}`);
        if (!routeContainer) {
            console.error(`노선 ${scheduleData.routeId} 컨테이너를 찾을 수 없습니다.`);
            return;
        }
        
        routeContainer.innerHTML = '';
        
        // 운행 중이 아닐 때 안내 메시지 표시
        if (!scheduleData.운행중) {
            const noticeDiv = document.createElement('div');
            noticeDiv.className = 'non-operating-notice';
            
            let nextOperatingText = '';
            if (scheduleData.다음운행) {
                if (scheduleData.다음운행.minutesUntil !== null) {
                    nextOperatingText = `<div class="next-operating-time">
                        다음 운행: ${scheduleData.다음운행.period} ${scheduleData.다음운행.time}
                        (${scheduleData.다음운행.minutesUntil}분 후)
                    </div>`;
                } else {
                    nextOperatingText = `<div class="next-operating-time">
                        다음 운행: ${scheduleData.다음운행.period} ${scheduleData.다음운행.time}
                    </div>`;
                }
            }
            
            noticeDiv.innerHTML = `
                <h3>🚌 현재 미운행 시간</h3>
                <p><strong>${scheduleData.routeName}</strong> 노선이 운행하지 않는 시간입니다.</p>
                ${nextOperatingText}
                <div style="margin-top: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 6px;">
                    <strong>📋 운행시간 안내</strong><br>
                    • <strong>오전:</strong> 08:30~10:50 (6분 간격)<br>
                    • <strong>낮:</strong> 12:00~13:20 (10분 간격)<br>
                    • <strong>오후:</strong> 16:55~17:45 (5분/10분/15분 간격)
                </div>
            `;
            
            routeContainer.appendChild(noticeDiv);
        } else {
            // 운행 중일 때 현재 시간대 정보 표시
            const currentPeriodDiv = document.createElement('div');
            currentPeriodDiv.className = 'current-period-info';
            currentPeriodDiv.innerHTML = `
                <div style="background-color: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                    <strong>🚌 현재 ${scheduleData.currentPeriod.시간대} 운행 중</strong><br>
                    <span style="font-size: 14px; color: #2e7d32;">
                        ${scheduleData.currentPeriod.출차}~${scheduleData.currentPeriod.막차} • 
                        ${Array.isArray(scheduleData.currentPeriod.배차간격) 
                            ? scheduleData.currentPeriod.배차간격.join('/') + '분 간격'
                            : scheduleData.currentPeriod.배차간격 + '분 간격'}
                    </span>
                </div>
            `;
            routeContainer.appendChild(currentPeriodDiv);
        }
        
        // 정류장 목록 표시
        scheduleData.stops.forEach((stop, index) => {
            const stopElement = document.createElement('div');
            stopElement.className = 'bus-stop';
            stopElement.style.animationDelay = `${index * 0.1}s`;
            
            // 상태에 따른 아이콘 설정
            let statusIcon = '';
            if (stop.status === 'current') {
                statusIcon = '<div class="bus-icon">🚌</div>';
            }
            
            // 정류장 유형에 따른 스타일
            let stopTypeClass = '';
            let stopTypeIcon = '';
            if (stop.status === 'arrival') {
                stopTypeIcon = '🏫';
                stopTypeClass = 'arrival-stop';
            } else if (stop.status === 'transfer') {
                stopTypeIcon = '🚇';
                stopTypeClass = 'transfer-stop';
            } else {
                stopTypeIcon = '🚏';
            }
            
            stopElement.innerHTML = `
                <div class="stop-marker ${stop.status}"></div>
                ${statusIcon}
                <div class="stop-info ${stop.status} ${stopTypeClass}">
                    <div class="stop-name">
                        ${stopTypeIcon} ${stop.name}
                    </div>
                    <div class="stop-time">${stop.time}</div>
                    <div class="arrival-info ${stop.status}">${stop.arrivalInfo}</div>
                </div>
            `;
            
            routeContainer.appendChild(stopElement);
        });
        
    } catch (error) {
        console.error('노선 표시 업데이트 오류:', error);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚌 연성대학교 셔틀버스 시간표 시스템 시작');
    
    // 초기 시간표 업데이트
    updateSchedule();
    
    // 30초마다 자동 업데이트
    setInterval(updateSchedule, 30000);
});

// 개발자 도구용 디버깅 함수
window.busDebug = {
    getCurrentSchedule: () => timetable.getRouteTimeTable(currentRoute),
    getAllSchedules: () => {
        return [1, 2, 3].map(route => timetable.getRouteTimeTable(route));
    },
    isOperating: (route) => timetable.isOperatingTime(route),
    getNextTime: (route) => timetable.getNextOperatingTime(route)
};
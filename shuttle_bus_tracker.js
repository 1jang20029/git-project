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
    
    // 현재 사이클 정보 계산
    getCurrentCycleInfo(routeId) {
        const currentPeriod = this.getCurrentPeriodInfo(routeId);
        if (!currentPeriod) return null;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const periodStartTime = parseInt(currentPeriod.출차.replace(':', ''));
        const periodStartMinutes = Math.floor(periodStartTime / 100) * 60 + (periodStartTime % 100);
        
        // 배차 간격 가져오기
        let interval = currentPeriod.배차간격;
        if (Array.isArray(interval)) {
            // 오후의 경우 [5, 10, 15] 패턴을 순환
            const cycleCount = Math.floor((currentTime - periodStartMinutes) / 30); // 30분(5+10+15) 주기
            interval = interval[cycleCount % interval.length] || interval[0];
        }
        
        // 현재 사이클 번호 계산
        const cycleNumber = Math.floor((currentTime - periodStartMinutes) / interval);
        const cycleStartTime = periodStartMinutes + (cycleNumber * interval);
        const nextCycleStartTime = cycleStartTime + interval;
        
        // 사이클 내 진행률 계산 (총 소요시간: 대략 15분)
        const totalCycleTime = 15; // 첫 정류장부터 연성대학교까지 약 15분
        const cycleProgressTime = currentTime - cycleStartTime;
        const cycleProgress = Math.min(cycleProgressTime / totalCycleTime, 1);
        
        return {
            cycleNumber: cycleNumber + 1,
            cycleStartTime,
            nextCycleStartTime,
            cycleProgress,
            interval,
            totalCycleTime
        };
    }
    
    // 시간표 기반 정류장 상태 계산 (사이클 반복 고려)
    getRouteTimeTable(routeId) {
        const isOperating = this.isOperatingTime(routeId);
        const nextOperating = this.getNextOperatingTime(routeId);
        const currentPeriod = this.getCurrentPeriodInfo(routeId);
        const cycleInfo = this.getCurrentCycleInfo(routeId);
        const routeStops = this.routeStops[routeId];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let currentCycleNumber = cycleInfo ? cycleInfo.cycleNumber : 0;
        
        const stopsWithStatus = routeStops.map((stop, index) => {
            let status = 'upcoming';
            let arrivalInfo = '예정';
            
            if (isOperating && currentPeriod && cycleInfo) {
                // 정류장 기본 시간을 분 단위로 변환
                const [timeHour, timeMin] = stop.time.split(':').map(Number);
                const baseStopTime = timeHour * 60 + timeMin;
                
                // 현재 사이클의 이 정류장 예정 시간
                const currentCycleStopTime = cycleInfo.cycleStartTime + (baseStopTime - routeStops[0].time.split(':').map((h, i) => i === 0 ? parseInt(h) * 60 : parseInt(h)).reduce((a, b) => a + b, 0));
                
                // 사이클 진행률 기반 상태 계산
                const stopProgressInCycle = (baseStopTime - routeStops[0].time.split(':').map((h, i) => i === 0 ? parseInt(h) * 60 : parseInt(h)).reduce((a, b) => a + b, 0)) / cycleInfo.totalCycleTime;
                
                if (cycleInfo.cycleProgress > stopProgressInCycle + 0.05) {
                    // 현재 사이클에서 이미 통과
                    status = 'passed';
                    const nextCycleStopTime = cycleInfo.nextCycleStartTime + (baseStopTime - routeStops[0].time.split(':').map((h, i) => i === 0 ? parseInt(h) * 60 : parseInt(h)).reduce((a, b) => a + b, 0));
                    const nextArrivalMinutes = nextCycleStopTime - currentTime;
                    
                    if (nextArrivalMinutes > 0 && nextArrivalMinutes < cycleInfo.interval) {
                        arrivalInfo = `통과함 (다음 버스 ${nextArrivalMinutes}분 후)`;
                    } else {
                        arrivalInfo = `통과함 (${cycleInfo.interval}분 간격 운행)`;
                    }
                } else if (Math.abs(cycleInfo.cycleProgress - stopProgressInCycle) <= 0.05) {
                    // 현재 위치 근처
                    status = 'current';
                    arrivalInfo = `${currentCycleNumber}번째 운행 중`;
                } else {
                    // 아직 도달하지 않음
                    status = 'upcoming';
                    const arrivalInMinutes = Math.round((stopProgressInCycle - cycleInfo.cycleProgress) * cycleInfo.totalCycleTime);
                    
                    if (arrivalInMinutes > 0) {
                        arrivalInfo = `${arrivalInMinutes}분 후 도착 예정`;
                    } else {
                        arrivalInfo = `곧 도착 예정`;
                    }
                }
                
                // 현재 사이클의 예상 도착 시간 계산
                const currentCycleArrivalTime = cycleInfo.cycleStartTime + (baseStopTime - routeStops[0].time.split(':').map((h, i) => i === 0 ? parseInt(h) * 60 : parseInt(h)).reduce((a, b) => a + b, 0));
                const arrivalHour = Math.floor(currentCycleArrivalTime / 60);
                const arrivalMin = currentCycleArrivalTime % 60;
                stop.estimatedTime = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;
                
            } else {
                // 미운행 시간일 때
                status = 'inactive';
                arrivalInfo = '미운행';
                stop.estimatedTime = stop.time;
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
            cycleInfo: cycleInfo,
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
            // 운행 중일 때 현재 사이클 정보 표시
            const currentPeriodDiv = document.createElement('div');
            currentPeriodDiv.className = 'current-period-info';
            
            let cycleInfoHtml = '';
            if (scheduleData.cycleInfo) {
                const progressPercent = Math.round(scheduleData.cycleInfo.cycleProgress * 100);
                const nextCycleMinutes = Math.round((scheduleData.cycleInfo.nextCycleStartTime - (new Date().getHours() * 60 + new Date().getMinutes())));
                
                cycleInfoHtml = `
                    <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px;">
                            <strong>${scheduleData.cycleInfo.cycleNumber}번째 운행</strong> (진행률: ${progressPercent}%)
                        </span>
                        <span style="font-size: 12px; color: #666;">
                            다음 사이클: ${nextCycleMinutes}분 후
                        </span>
                    </div>
                    <div style="width: 100%; height: 6px; background-color: #e0e0e0; border-radius: 3px; margin-top: 8px;">
                        <div style="width: ${progressPercent}%; height: 100%; background-color: #4caf50; border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                `;
            }
            
            currentPeriodDiv.innerHTML = `
                <div style="background-color: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                    <strong>🚌 현재 ${scheduleData.currentPeriod.시간대} 운행 중</strong><br>
                    <span style="font-size: 14px; color: #2e7d32;">
                        ${scheduleData.currentPeriod.출차}~${scheduleData.currentPeriod.막차} • 
                        ${Array.isArray(scheduleData.currentPeriod.배차간격) 
                            ? scheduleData.currentPeriod.배차간격.join('/') + '분 간격'
                            : scheduleData.currentPeriod.배차간격 + '분 간격'}
                    </span>
                    ${cycleInfoHtml}
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
            
            // 예상 도착 시간 표시 (사이클 기반)
            const displayTime = stop.estimatedTime || stop.time;
            
            stopElement.innerHTML = `
                <div class="stop-marker ${stop.status}"></div>
                ${statusIcon}
                <div class="stop-info ${stop.status} ${stopTypeClass}">
                    <div class="stop-name">
                        ${stopTypeIcon} ${stop.name}
                    </div>
                    <div class="stop-time">${displayTime}</div>
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
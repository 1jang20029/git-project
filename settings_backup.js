// settings.js
// =============================================================================
// “설정” 뷰 내 다크/라이트 모드 스케줄링 & 알림 받기 토글 관리
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1) 요소 가져오기
  const themeModeSelect   = document.getElementById('themeModeSelect');
  const themeScheduleDiv  = document.getElementById('themeScheduleTimes');
  const lightStartTime    = document.getElementById('lightStartTime');
  const darkStartTime     = document.getElementById('darkStartTime');
  const notificationToggle= document.getElementById('notificationToggle');

  // 2) 로컬스토리지에서 이전 설정을 불러와서 초기화
  const savedThemeMode = localStorage.getItem('themeMode') || 'auto';
  const savedLightTime = localStorage.getItem('lightStartTime') || '07:00';
  const savedDarkTime  = localStorage.getItem('darkStartTime')  || '19:00';
  const savedNotify    = localStorage.getItem('enableNotification') === 'true';

  // (1) 테마 모드 select 
  themeModeSelect.value = savedThemeMode;

  // (2) 시간 입력 초기값
  lightStartTime.value = savedLightTime;
  darkStartTime.value  = savedDarkTime;

  // (3) 알림 토글 초기값
  notificationToggle.checked = savedNotify;

  // 3) UI 표시/숨김: '자동' 모드일 때만 시간 설정 보이기
  function updateScheduleVisibility() {
    if (themeModeSelect.value === 'auto') {
      themeScheduleDiv.style.display = 'flex';
    } else {
      themeScheduleDiv.style.display = 'none';
    }
  }
  updateScheduleVisibility();

  // 4) 테마 스위치 로직: 현재 시간에 맞춰서 'light-mode' 클래스 적용
  function applyThemeAccordingToSchedule() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const current = `${hh}:${mm}`;

    const mode = themeModeSelect.value;
    if (mode === 'light') {
      // 항상 라이트
      document.body.classList.remove('light-mode'); // 라이트 모드니까 클래스 제거
    } else if (mode === 'dark') {
      // 항상 다크
      document.body.classList.add('light-mode'); // 다크는 반대로 추가하지 않도록, body 기본이 다크일 때 light-mode 클래스 추가 안 함
      // 단, 만약 기본 CSS가 '라이트 모드'이고, 다크 모드를 클래스 추가로 표현하고 싶다면 
      // (예: body.classList.add('dark-mode')) 형태로 조정 필요
    } else {
      // 자동 모드 (auto)
      if (lightStartTime.value < darkStartTime.value) {
        // ex) 07:00 < 19:00 : 낮(07~19)은 라이트, 밤(19~24, 00~07)은 다크
        if (current >= lightStartTime.value && current < darkStartTime.value) {
          document.body.classList.remove('light-mode');
        } else {
          document.body.classList.add('light-mode');
        }
      } else {
        // ex) 19:00 < 07:00 (자정 넘는 경우)
        // 밤(00~07) 또는 밤(19~24)을 다크, 그 외(07~19) 라이트
        if (current >= darkStartTime.value || current < lightStartTime.value) {
          document.body.classList.add('light-mode');
        } else {
          document.body.classList.remove('light-mode');
        }
      }
    }
  }

  // 초기 로드 시 1회 적용
  applyThemeAccordingToSchedule();

  // 5) 이벤트 리스너 등록
  // (1) 모드 select 변경
  themeModeSelect.addEventListener('change', () => {
    localStorage.setItem('themeMode', themeModeSelect.value);
    updateScheduleVisibility();
    applyThemeAccordingToSchedule();
  });

  // (2) 시간 입력 변경
  lightStartTime.addEventListener('change', () => {
    localStorage.setItem('lightStartTime', lightStartTime.value);
    applyThemeAccordingToSchedule();
  });
  darkStartTime.addEventListener('change', () => {
    localStorage.setItem('darkStartTime', darkStartTime.value);
    applyThemeAccordingToSchedule();
  });

  // (3) 알림 받기 토글
  notificationToggle.addEventListener('change', () => {
    const enabled = notificationToggle.checked;
    localStorage.setItem('enableNotification', enabled);
    if (enabled) {
      alert('알림이 활성화되었습니다');
    } else {
      alert('알림이 비활성화되었습니다');
    }
  });

  // (4) 일정 주기마다 자동 적용 (예: 1분마다 테마 확인)
  setInterval(applyThemeAccordingToSchedule, 60 * 1000);
});

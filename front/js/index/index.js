// js/index/index.js

import { openTimetable, openCalendar, openShuttle } from './modules/nav.js';
import { closeAll }                         from './modules/dropdown.js';
import { initMap, addMarkers }              from './modules/map.js';
import { getJSON, loadStats }               from './modules/api.js';
import { fmtTime }                          from './modules/utils.js';

// 외부 페이지 URL
const PAGES = {
  timetable: 'pages/list/timetable.html',
  calendar:  'pages/list/academic-calendar.html',
  shuttle:   'pages/list/shuttle.html'
};

// 페이지 콘텐츠 전환 함수 (예시)
function showContent(key) {
  const sections = [
    'home', 'buildings', 'community',
    'lecture-review', 'notices'
  ];
  sections.forEach(id => {
    const el = document.getElementById(id + 'Content');
    if (el) el.style.display = id === key ? 'block' : 'none';
  });
  // active 클래스 토글
  document.querySelectorAll('#main-menu .nav-item').forEach(item => {
    item.classList.toggle('active', item.id === 'nav-' + key);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1) 맵 초기화
  initMap('naverMap', { lat:37.3966, lng:126.9077 }, { zoom:16, minZoom:14, maxZoom:19 });

  // 2) 통계 로드
  loadStats(renderStats);

  // 3) 건물 마커 추가
  try {
    const buildings = await getJSON('/api/buildings');
    addMarkers(buildings);
  } catch (e) {
    console.error('건물 데이터 로드 실패:', e);
  }

  // 4) 네비게이션 메뉴 클릭 처리
  document.getElementById('nav-home')
    .addEventListener('click', () => { closeAll(); showContent('home'); });
  document.getElementById('nav-buildings')
    .addEventListener('click', () => { closeAll(); showContent('buildings'); });
  document.getElementById('nav-community')
    .addEventListener('click', () => { closeAll(); showContent('community'); });
  document.getElementById('nav-lecture-review')
    .addEventListener('click', () => { closeAll(); showContent('lecture-review'); });
  document.getElementById('nav-notices')
    .addEventListener('click', () => { closeAll(); showContent('notices'); });

  // 5) 학생서비스 드롭다운 항목 클릭 (외부 페이지 이동)
  const studentItems = document.querySelectorAll('#nav-student-services .dropdown-item');
  studentItems[0].addEventListener('click', () => { closeAll(); openTimetable(PAGES.timetable); });
  studentItems[1].addEventListener('click', () => { closeAll(); openCalendar(PAGES.calendar); });
  studentItems[2].addEventListener('click', () => { closeAll(); openShuttle(PAGES.shuttle); });
});

function renderStats(s) {
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${s.totalBuildings}</div>
      <div class="stat-label">캠퍼스 건물</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.totalStudents}</div>
      <div class="stat-label">재학생 수</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.activeServices}</div>
      <div class="stat-label">운영 서비스</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${s.todayEvents}</div>
      <div class="stat-label">오늘 일정</div>
    </div>
  `;
}

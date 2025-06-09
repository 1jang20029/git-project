// timetable.js

const timetableStart = 8, timetableEnd = 20;
const STORAGE_KEY = 'timetable-courses-v1';

function loadCourses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveCourses(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderTimetable() {
  const tbody = document.querySelector('#timetable-table tbody');
  const courses = loadCourses();
  tbody.innerHTML = '';
  for (let hour = timetableStart; hour < timetableEnd; hour++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${String(hour).padStart(2, '0')}:00</td>`;
    for (let day = 1; day <= 5; day++) {
      const cellCourses = courses.filter(c =>
        Number(c.day) === day &&
        Number(c.start.split(':')[0]) <= hour &&
        Number(c.end.split(':')[0]) > hour
      );
      const td = document.createElement('td');
      if (cellCourses.length > 0) {
        cellCourses.forEach(course => {
          td.innerHTML = `
            <div class="timetable-course-block">
              <div class="course-title">${course.name}</div>
              <div class="course-room">${course.room || ''}</div>
              <button class="course-del-btn" onclick="removeCourse('${course.id}')">삭제</button>
            </div>
          `;
        });
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function openAddCourseModal() {
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('add-course-form').reset();
}
function closeAddCourseModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}
function saveCourse(e) {
  e.preventDefault();
  const name = document.getElementById('course-name').value.trim();
  const day = document.getElementById('course-day').value;
  const start = document.getElementById('course-start').value;
  const end = document.getElementById('course-end').value;
  const room = document.getElementById('course-room').value.trim();
  if (!name || !day || !start || !end) return;
  const id = 'c_' + Date.now() + Math.floor(Math.random() * 1000);
  const courses = loadCourses();
  courses.push({ id, name, day, start, end, room });
  saveCourses(courses);
  closeAddCourseModal();
  renderTimetable();
}
function removeCourse(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  let courses = loadCourses();
  courses = courses.filter(c => c.id !== id);
  saveCourses(courses);
  renderTimetable();
}
document.addEventListener('click', function(e) {
  if (e.target.id === 'modal-overlay') closeAddCourseModal();
});
document.addEventListener('DOMContentLoaded', renderTimetable);

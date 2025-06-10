// timetable.js
// PC 웹 브라우저 최적화 시간표 JavaScript (Node.js + MySQL 백엔드 연동)

document.addEventListener('DOMContentLoaded', async function() {
    // =============================================================================
    // 글로벌 상태
    // =============================================================================
    let courses = [];
    let settings = {
        showWeekend: true,
        showProfessor: true,
        showRoom: true,
        timeFormat24: true,
        appearance: 'dark'
    };
    let currentSemester = { year: 2023, term: 1 };
    let currentTimetable = null;
    let timetables = [];

    const timeData = [
        { period: 1, startTime: "9:00" },
        { period: 2, startTime: "10:00" },
        { period: 3, startTime: "11:00" },
        { period: 4, startTime: "12:00" },
        { period: 5, startTime: "13:00" },
        { period: 6, startTime: "14:00" },
        { period: 7, startTime: "15:00" },
        { period: 8, startTime: "16:00" },
        { period: 9, startTime: "17:00" },
        { period: 10, startTime: "18:00" }
    ];
    const dayData = ["", "월", "화", "수", "목", "금", "토"];
    const gradePoints = {
        "A+": 4.5, "A0": 4.0, "A-": 3.7,
        "B+": 3.3, "B0": 3.0, "B-": 2.7,
        "C+": 2.3, "C0": 2.0, "C-": 1.7,
        "D+": 1.3, "D0": 1.0, "D-": 0.7,
        "F": 0.0, "P": null, "NP": null
    };

    // =============================================================================
    // 초기화: 백엔드에서 설정·시간표·과목 불러오기
    // =============================================================================
    await loadSettings();
    await loadTimetables();

    // 최소 하나의 시간표 확보
    if (timetables.length === 0) {
        let initial = null;
        while (!initial) {
            initial = await addNewTimetable();
        }
        timetables = [initial];
    }
    currentTimetable = timetables[0];

    updateTimetableSelector();
    await loadCourses();

    setCurrentSemester();
    document.getElementById('semester-select').value =
        `${currentSemester.year}-${currentSemester.term}`;

    createTimetable();
    renderCourseList();
    calculateGrades();
    updatePageTitle();
    applySettingsToUI();
    setupEventListeners();

    // =============================================================================
    // 백엔드 연동 함수들
    // =============================================================================

    async function loadSettings() {
        try {
            const res = await fetch('/api/settings', { credentials: 'include' });
            if (!res.ok) throw new Error('설정 불러오기 실패');
            settings = await res.json();
            applySettings();
        } catch (e) {
            console.error(e);
        }
    }

    async function saveSettingsToBackend() {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('설정 저장 실패');
        } catch (e) {
            console.error(e);
            alert('설정 저장 중 오류 발생');
        }
    }

    async function loadTimetables() {
        try {
            const res = await fetch('/api/timetables', { credentials: 'include' });
            if (!res.ok) throw new Error('시간표 목록 불러오기 실패');
            timetables = await res.json();
        } catch (e) {
            console.error(e);
            timetables = [];
        }
    }

    async function addNewTimetable() {
        const name = prompt('새 시간표 이름을 입력하세요:', '새 시간표');
        if (!name) return null;
        try {
            const res = await fetch('/api/timetables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('시간표 추가 실패');
            return await res.json();
        } catch (e) {
            console.error(e);
            alert('시간표 추가 중 오류 발생');
            return null;
        }
    }

    async function deleteTimetableFromDropdown(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/timetables/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('삭제 실패');
            timetables = timetables.filter(t => t.id !== id);
            if (currentTimetable.id === id) currentTimetable = timetables[0];
            updateTimetableSelector();
            await loadCourses();
            createTimetable();
            renderCourseList();
            calculateGrades();
        } catch (e) {
            console.error(e);
            alert('삭제 중 오류 발생');
        }
    }
    window.deleteTimetableFromDropdown = deleteTimetableFromDropdown;
    window.deleteCurrentTimetable = () => deleteTimetableFromDropdown(currentTimetable.id);

    window.renameTimetable = async function() {
        const newName = prompt('시간표 이름을 입력하세요:', currentTimetable.name);
        if (!newName) return;
        try {
            const res = await fetch(`/api/timetables/${currentTimetable.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('이름 변경 실패');
            currentTimetable.name = newName;
            updateTimetableSelector();
            updatePageTitle();
        } catch (e) {
            console.error(e);
            alert('이름 변경 중 오류 발생');
        }
    };

    async function loadCourses() {
        try {
            const res = await fetch(
                `/api/timetables/${currentTimetable.id}/courses?year=${currentSemester.year}&term=${currentSemester.term}`,
                { credentials: 'include' }
            );
            if (!res.ok) throw new Error('과목 불러오기 실패');
            courses = await res.json();
        } catch (e) {
            console.error(e);
            courses = [];
        }
    }
    window.loadCourses = loadCourses;

    async function saveCourseToBackend(course) {
        const method = course.id ? 'PUT' : 'POST';
        const url = course.id
            ? `/api/timetables/${currentTimetable.id}/courses/${course.id}`
            : `/api/timetables/${currentTimetable.id}/courses`;
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
            credentials: 'include'
        });
        if (!res.ok) throw new Error('과목 저장 실패');
        return await res.json();
    }

    window.deleteCourse = async function(courseId) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(
                `/api/timetables/${currentTimetable.id}/courses/${courseId}`,
                { method: 'DELETE', credentials: 'include' }
            );
            if (!res.ok) throw new Error('삭제 실패');
            courses = courses.filter(c => c.id !== courseId);
            renderCourseList();
            renderCoursesOnTimetable();
            calculateGrades();
        } catch (e) {
            console.error(e);
            alert('과목 삭제 중 오류 발생');
        }
    };

    // =============================================================================
    // 설정 적용 함수
    // =============================================================================
    function applySettings() {
        applyAppearance(settings.appearance);
        createTimetable();
        renderCoursesOnTimetable();
    }

    function applySettingsToUI() {
        document.getElementById('show-professor').checked   = settings.showProfessor;
        document.getElementById('show-room').checked        = settings.showRoom;
        document.getElementById('theme-select').value       = settings.appearance;
        document.getElementById('time-format-select').value = settings.timeFormat24 ? '24' : '12';
        document.getElementById('weekend-select').value     = settings.showWeekend.toString();
    }

    window.openSettings = function() {
        settingsBackup = JSON.parse(JSON.stringify(settings));
        applySettingsToUI();
        document.getElementById('settings-modal').style.display = 'flex';
    };

    window.closeSettings = function() {
        if (settingsBackup) {
            settings = JSON.parse(JSON.stringify(settingsBackup));
            applySettings();
            settingsBackup = null;
        }
        document.getElementById('settings-modal').style.display = 'none';
    };

    window.saveSettings = function() {
        settings.showProfessor   = document.getElementById('show-professor').checked;
        settings.showRoom        = document.getElementById('show-room').checked;
        settings.appearance      = document.getElementById('theme-select').value;
        settings.timeFormat24    = document.getElementById('time-format-select').value === '24';
        settings.showWeekend     = document.getElementById('weekend-select').value === 'true';
        saveSettingsToBackend();
        applySettings();
        closeSettings();
    };

    function applyAppearance(mode) {
        document.body.classList.toggle('light-mode', mode === 'light');
        document.body.classList.toggle('dark-mode',  mode !== 'light');
    }

    // =============================================================================
    // 공통 유틸리티
    // =============================================================================
    function debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    }

    // =============================================================================
    // 시간표 생성 및 렌더링
    // =============================================================================
    function setCurrentSemester() {
        const now = new Date(), m = now.getMonth() + 1;
        if (m >= 3 && m <= 6)       currentSemester = { year: now.getFullYear(), term: 1 };
        else if (m >= 9 && m <= 12) currentSemester = { year: now.getFullYear(), term: 2 };
        else if (m >= 1 && m <= 2)  currentSemester = { year: now.getFullYear() - 1, term: 2 };
        else                        currentSemester = { year: now.getFullYear(), term: 1 };
    }

    function createTimetable() {
        const tbody = document.getElementById('timetable-body');
        tbody.innerHTML = '';
        for (const { period, startTime } of timeData) {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.className = 'time-col';
            if (settings.timeFormat24) {
                timeCell.innerHTML = `${period}교시<br>${startTime}`;
            } else {
                const [h, m] = startTime.split(':').map(Number);
                const ampm = h >= 12 ? '오후' : '오전';
                const dh = h > 12 ? h - 12 : h;
                timeCell.innerHTML = `${period}교시<br>${ampm} ${dh}:${String(m).padStart(2,'0')}`;
            }
            row.appendChild(timeCell);

            const maxDays = settings.showWeekend ? 6 : 5;
            for (let d = 1; d <= maxDays; d++) {
                const cell = document.createElement('td');
                cell.className = 'class-cell';
                cell.dataset.day = d;
                cell.dataset.period = period;
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        renderCoursesOnTimetable();
    }

    function renderCoursesOnTimetable() {
        const container = document.querySelector('.timetable-container');
        const first = container.querySelector('.class-cell[data-day="1"][data-period="1"]');
        if (!first) return;
        const w = first.getBoundingClientRect().width;
        const h = first.getBoundingClientRect().height;
        container.querySelectorAll('.class-item').forEach(e => e.remove());

        const colorMap = {
            'color-1':'#e57373','color-2':'#81c784','color-3':'#64b5f6','color-4':'#ba68c8',
            'color-5':'#ffb74d','color-6':'#4db6ac','color-7':'#7986cb','color-8':'#a1887f'
        };

        for (const c of courses) {
            for (const t of c.times) {
                if (t.day > (settings.showWeekend ? 6 : 5)) continue;
                const x = (t.day - 1) * w;
                const y = (t.start - 1) * h + h * 0.5;
                const height = (t.end - t.start + 1) * h;
                const block = document.createElement('div');
                block.className = 'class-item';
                Object.assign(block.style, {
                    position: 'absolute',
                    left: `${x}px`, top: `${y}px`,
                    width: `${w}px`, height: `${height}px`,
                    background: colorMap[c.color] || colorMap['color-1'],
                    color: '#fff', fontSize: '12px',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    textAlign: 'center', borderRadius: '4px'
                });
                const nameDiv = document.createElement('div');
                nameDiv.textContent = c.name;
                const infoDiv = document.createElement('div');
                const parts = [];
                if (settings.showProfessor && c.professor) parts.push(c.professor);
                if (settings.showRoom && c.room) parts.push(c.room);
                infoDiv.textContent = parts.join(' | ');
                infoDiv.style.fontSize = '10px';
                block.append(nameDiv, infoDiv);
                container.append(block);
            }
        }
    }

    function renderCourseList() {
        const list = document.getElementById('course-list');
        list.innerHTML = '';
        if (courses.length === 0) {
            const msg = document.createElement('div');
            msg.className = 'empty-state';
            msg.innerHTML = '<h3>📚 등록된 과목이 없습니다</h3>' +
                            '<p>과목 추가 버튼을 눌러 과목을 추가해보세요.</p>';
            list.append(msg);
            return;
        }
        for (const c of courses) {
            const li = document.createElement('li');
            li.className = 'course-item';
            const times = c.times.map(t => `${dayData[t.day]} ${t.start}교시~${t.end}교시`).join(', ');
            li.innerHTML = `
                <div class="course-info">
                    <div class="course-name">${c.name}</div>
                    <div class="course-details">${c.professor||''} | ${c.credits}학점</div>
                    <div class="course-details">${times} | ${c.room||''}</div>
                </div>
                <div class="course-actions">
                    <button onclick="openEditModal(${c.id})">✏️</button>
                    <button onclick="deleteCourse(${c.id})">🗑️</button>
                </div>
            `;
            list.append(li);
        }
    }

    function calculateGrades() {
        let totCr=0, totPt=0, majCr=0, majPt=0;
        for (const c of courses) {
            if (c.grade && gradePoints[c.grade] != null) {
                const cr = c.credits, pt = gradePoints[c.grade];
                totCr += cr; totPt += cr * pt;
                if (/전공/.test(c.type)) { majCr += cr; majPt += cr * pt; }
            }
        }
        document.getElementById('total-credits').textContent = totCr;
        document.getElementById('total-gpa').textContent     = totCr ? (totPt/totCr).toFixed(2) : "0.00";
        document.getElementById('major-gpa').textContent     = majCr ? (majPt/majCr).toFixed(2) : "0.00";
    }

    // ==================================================================================
    // 과목 모달 관련 함수들
    // ==================================================================================
    window.openAddCourseModal = function() {
        document.getElementById('modal-title').textContent = '과목 추가';
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        document.getElementById('time-slots').innerHTML = '';
        addTimeSlot();
        document.getElementById('course-modal').style.display = 'flex';
    };

    window.openEditModal = function(courseId) {
        const course = courses.find(x => x.id === courseId);
        if (!course) return;
        document.getElementById('modal-title').textContent = '과목 수정';
        document.getElementById('course-id').value = course.id;
        document.getElementById('course-name').value = course.name;
        document.getElementById('course-professor').value = course.professor || '';
        document.getElementById('course-credits').value = course.credits;
        document.getElementById('course-type').value = course.type;
        document.getElementById('course-room').value = course.room || '';
        document.getElementById('course-color').value = course.color;
        document.getElementById('course-grade').value = course.grade || '';
        document.getElementById('time-slots').innerHTML = '';
        for (const t of course.times) addTimeSlot(t.day, t.start, t.end);
        document.getElementById('course-modal').style.display = 'flex';
    };

    window.closeModal = function() {
        document.getElementById('course-modal').style.display = 'none';
    };

    window.selectColor = function(el) {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('course-color').value = el.dataset.color;
    };

    window.addTimeSlot = function(day=1,start=1,end=1) {
        const div = document.createElement('div');
        div.className = 'time-slot';
        div.innerHTML = `
            <select class="day-select"></select>
            <select class="start-select"></select>
            <select class="end-select"></select>
            <button type="button" onclick="removeTimeSlot(this)">❌</button>
        `;
        const ds = div.querySelector('.day-select'),
              ss = div.querySelector('.start-select'),
              es = div.querySelector('.end-select');
        for (let i=1; i<=6; i++) {
            ds.innerHTML += `<option value="${i}">${dayData[i]}요일</option>`;
        }
        for (let i=1; i<=9; i++) {
            ss.innerHTML += `<option value="${i}">${i}교시</option>`;
            es.innerHTML += `<option value="${i}">${i}교시</option>`;
        }
        ds.value = day; ss.value = start; es.value = end;
        ss.addEventListener('change',()=>{ if(+es.value<+ss.value) es.value=ss.value; });
        document.getElementById('time-slots').append(div);
    };

    window.removeTimeSlot = function(btn) {
        const slots = document.querySelectorAll('.time-slot');
        if (slots.length > 1) btn.closest('.time-slot').remove();
    };

    function showTimeError(text) {
        removeTimeError();
        const f = document.getElementById('course-form');
        const e = document.createElement('div');
        e.id = 'time-error'; e.textContent = text;
        e.style.color = '#ef4444'; e.style.marginBottom = '8px';
        f.prepend(e);
    }
    function removeTimeError() {
        const old = document.getElementById('time-error');
        if (old) old.remove();
    }

    function collectCourseForm() {
        const idVal = document.getElementById('course-id').value;
        const id = idVal ? parseInt(idVal,10) : null;
        const name = document.getElementById('course-name').value.trim();
        const professor = document.getElementById('course-professor').value.trim();
        const credits = parseInt(document.getElementById('course-credits').value,10);
        const type = document.getElementById('course-type').value;
        const room = document.getElementById('course-room').value.trim();
        const color = document.getElementById('course-color').value;
        const grade = document.getElementById('course-grade').value || null;

        const slots = Array.from(document.querySelectorAll('.time-slot')).map(s=>({
            day: parseInt(s.querySelector('.day-select').value,10),
            start: parseInt(s.querySelector('.start-select').value,10),
            end: parseInt(s.querySelector('.end-select').value,10)
        }));
        // 같은 과목 내 겹침 검사
        for (let i=0; i<slots.length; i++){
            for (let j=i+1; j<slots.length; j++){
                const a=slots[i],b=slots[j];
                if(a.day===b.day && a.start<=b.end && b.start<=a.end){
                    showTimeError('⚠️ 같은 과목 내에 시간이 겹칩니다.'); return null;
                }
            }
        }
        // 다른 과목과 겹침 검사
        for (const s of slots){
            for (const c of courses){
                if(id && c.id===id) continue;
                for (const t of c.times){
                    if(s.day===t.day && s.start<=t.end && t.start<=s.end){
                        showTimeError('⚠️ 해당 시간대에 이미 다른 과목이 있습니다.'); return null;
                    }
                }
            }
        }
        removeTimeError();
        return { id, name, professor, credits, type, room, color, grade, times: slots };
    }

    async function saveCourse(event) {
        event.preventDefault();
        const btn = document.getElementById('save-course-btn');
        if (btn.disabled) return;
        btn.disabled = true;
        const course = collectCourseForm();
        if (!course) { btn.disabled = false; return; }
        try {
            const saved = await saveCourseToBackend(course);
            courses = courses.filter(c=>c.id!==saved.id).concat(saved);
            renderCourseList();
            renderCoursesOnTimetable();
            calculateGrades();
            closeModal();
        } catch (_) {
            // error already shown
        } finally {
            btn.disabled = false;
        }
    }
    document.getElementById('save-course-btn').addEventListener('click', saveCourse);

    // ==================================================================================
    // ESC, 클릭, resize, semester change, goBack
    // ==================================================================================
    window.changeSemester = function() {
        const [y,t] = document.getElementById('semester-select').value.split('-').map(Number);
        currentSemester = { year: y, term: t };
        loadCourses().then(()=>{
            createTimetable();
            renderCourseList();
            calculateGrades();
        });
    };
    window.goToBack = () => window.history.back();
});

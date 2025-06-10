// timetable.js
// PC 웹 브라우저 최적화 시간표 JavaScript (Node.js + MySQL 백엔드 연동)

document.addEventListener('DOMContentLoaded', async function() {
    // =============================================================================
    // Globals
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
    // Initialization
    // =============================================================================
    await loadSettings();
    await loadTimetables();
    if (timetables.length) {
        currentTimetable = timetables[0];
    } else {
        const init = await addNewTimetable();
        if (init) timetables = [init], currentTimetable = init;
    }
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
    // Backend API Integration
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

    async function saveSettings() {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('설정 저장 실패');
            console.log('설정 저장 완료');
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
            renderCoursesOnTimetable();
            renderCourseList();
            calculateGrades();
        } catch (e) {
            console.error(e);
            alert('삭제 중 오류 발생');
        }
    }

    async function renameTimetable() {
        const newName = prompt('시간표 이름을 입력하세요:', currentTimetable.name);
        if (!newName) return;
        try {
            const res = await fetch(
                `/api/timetables/${currentTimetable.id}`, {
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
    }

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

    async function saveCourseToBackend(course) {
        const method = course.id ? 'PUT' : 'POST';
        const url = course.id
            ? `/api/timetables/${currentTimetable.id}/courses/${course.id}`
            : `/api/timetables/${currentTimetable.id}/courses`;
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(course),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('과목 저장 실패');
            return await res.json();
        } catch (e) {
            console.error(e);
            alert('과목 저장 중 오류 발생');
            throw e;
        }
    }

    async function deleteCourse(courseId) {
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
    }

    // =============================================================================
    // Settings UI
    // =============================================================================
    function applySettings() {
        applyAppearance(settings.appearance);
        createTimetable();
        renderCoursesOnTimetable();
    }
    function applySettingsToUI() {
        document.getElementById('show-professor').checked = settings.showProfessor;
        document.getElementById('show-room').checked      = settings.showRoom;
        document.getElementById('theme-select').value     = settings.appearance;
        document.getElementById('time-format-select').value =
            settings.timeFormat24 ? '24' : '12';
        document.getElementById('weekend-select').value   = settings.showWeekend.toString();
    }

    // =============================================================================
    // Event Listeners
    // =============================================================================
    function setupEventListeners() {
        document.addEventListener('keydown', handleEscapeKey);
        document.getElementById('course-modal')
            .addEventListener('click', handleModalOutsideClick);
        document.getElementById('settings-modal')
            .addEventListener('click', handleModalOutsideClick);
        document.addEventListener('click', handleDropdownOutsideClick);
        window.addEventListener('resize', debounce(handleWindowResize, 250));
        document.getElementById('semester-select')
            .addEventListener('change', changeSemester);
        document.getElementById('add-timetable-btn')
            .addEventListener('click', async () => {
                const t = await addNewTimetable();
                if (t) {
                    timetables.push(t);
                    selectTimetable(t.id);
                }
            });
        document.getElementById('rename-timetable-btn')
            .addEventListener('click', renameTimetable);
        document.getElementById('delete-timetable-btn')
            .addEventListener('click', () => deleteTimetableFromDropdown(currentTimetable.id));
        document.getElementById('open-settings-btn')
            .addEventListener('click', openSettings);
        document.getElementById('save-settings-btn')
            .addEventListener('click', async () => { await saveSettings(); closeSettings(); });
        document.getElementById('cancel-settings-btn')
            .addEventListener('click', closeSettings);
        document.getElementById('save-course-btn')
            .addEventListener('click', async e => {
                e.preventDefault();
                const course = collectCourseForm();
                const saved = await saveCourseToBackend(course);
                courses = courses.filter(c => c.id !== saved.id).concat(saved);
                renderCourseList();
                renderCoursesOnTimetable();
                calculateGrades();
                closeModal();
            });
        setupDepartmentSearch();
        setupGradeDropdown();
    }

    // =============================================================================
    // Utility
    // =============================================================================
    function debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    }

    // =============================================================================
    // Timetable Rendering
    // =============================================================================
    function setCurrentSemester() {
        const now = new Date(), m = now.getMonth()+1;
        if (3 <= m && m <= 6)    currentSemester = { year: now.getFullYear(), term:1 };
        else if (9 <= m && m <=12)currentSemester = { year: now.getFullYear(), term:2 };
        else if (1 <= m && m <=2) currentSemester = { year: now.getFullYear()-1, term:2 };
        else                      currentSemester = { year: now.getFullYear(), term:1 };
    }

    function createTimetable() {
        const tbody = document.getElementById('timetable-body');
        tbody.innerHTML = '';
        for (let i=0; i<timeData.length; i++) {
            const { period, startTime } = timeData[i];
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.className = 'time-col';
            if (settings.timeFormat24) {
                timeCell.innerHTML = `${period}교시<br>${startTime}`;
            } else {
                const [h, m] = startTime.split(':').map(Number);
                const ampm = h>=12?'오후':'오전';
                const dh = h>12?h-12:h;
                timeCell.innerHTML = `${period}교시<br>${ampm} ${dh}:${String(m).padStart(2,'0')}`;
            }
            row.appendChild(timeCell);

            const maxDays = settings.showWeekend?6:5;
            for (let d=1; d<=maxDays; d++) {
                const cell = document.createElement('td');
                cell.className = 'class-cell';
                cell.dataset.day = d;
                cell.dataset.period = period;
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        document.querySelectorAll('.timetable th, .timetable td').forEach(el=>{
            el.style.display='';
        });
        if (!settings.showWeekend) {
            document.querySelectorAll('th,td').forEach(el=>{
                if (el.dataset && el.dataset.day==='6') el.style.display='none';
            });
        }
        renderCoursesOnTimetable();
    }

    function renderCoursesOnTimetable() {
        const container = document.querySelector('.timetable-container');
        const firstCell = container.querySelector('.class-cell[data-day="1"][data-period="1"]');
        if (!firstCell) return;
        const base = container.getBoundingClientRect();
        const cellRect = firstCell.getBoundingClientRect();
        const w = cellRect.width, h = cellRect.height;
        container.querySelectorAll('.class-item').forEach(e=>e.remove());

        const colorMap = {
            'color-1':'#e57373','color-2':'#81c784','color-3':'#64b5f6','color-4':'#ba68c8',
            'color-5':'#ffb74d','color-6':'#4db6ac','color-7':'#7986cb','color-8':'#a1887f'
        };

        courses.forEach(course=>{
            course.times.forEach(t=>{
                if (t.day> (settings.showWeekend?6:5)) return;
                const x = (t.day-1)*w;
                const y = (t.start-1)*h + h*0.5;
                const height = (t.end - t.start +1)*h;
                const block = document.createElement('div');
                block.className='class-item';
                block.style.cssText=`
                    position:absolute;
                    left:${x}px; top:${y}px;
                    width:${w}px;height:${height}px;
                    background:${colorMap[course.color]||colorMap['color-1']};
                    color:#fff;font-size:12px;
                    display:flex;flex-direction:column;
                    justify-content:center;align-items:center;
                    text-align:center;border-radius:4px;
                `;
                const nameDiv = document.createElement('div');
                nameDiv.textContent=course.name;
                const infoParts=[];
                if(settings.showProfessor&&course.professor) infoParts.push(course.professor);
                if(settings.showRoom&&course.room) infoParts.push(course.room);
                const infoDiv=document.createElement('div');
                infoDiv.textContent=infoParts.join(' | ');
                infoDiv.style.fontSize='10px';
                block.append(nameDiv,infoDiv);
                container.append(block);
            });
        });
    }

    function renderCourseList() {
        const list = document.getElementById('course-list');
        list.innerHTML='';
        if(!courses.length){
            const msg=document.createElement('div');
            msg.className='empty-state';
            msg.innerHTML='<h3>📚 등록된 과목이 없습니다</h3><p>과목 추가 버튼을 눌러 과목을 추가하세요.</p>';
            list.append(msg);
            return;
        }
        courses.forEach(c=>{
            const li=document.createElement('li');li.className='course-item';
            const times=c.times.map(t=>{
                const day=dayData[t.day];
                return `${day} ${t.start}교시~${t.end}교시`;
            }).join(', ');
            li.innerHTML=`
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
        });
    }

    function calculateGrades() {
        let totCr=0, totPt=0, majCr=0, majPt=0;
        courses.forEach(c=>{
            if(c.grade&&gradePoints[c.grade]!=null){
                const cr=c.credits, pt=gradePoints[c.grade];
                totCr+=cr; totPt+=cr*pt;
                if(c.type.includes('전공')){
                    majCr+=cr; majPt+=cr*pt;
                }
            }
        });
        document.getElementById('total-credits').textContent=totCr;
        document.getElementById('total-gpa').textContent=(totCr?totPt/totCr:0).toFixed(2);
        document.getElementById('major-gpa').textContent=(majCr?majPt/majCr:0).toFixed(2);
    }

    // =============================================================================
    // Course Modal
    // =============================================================================
    function openAddCourseModal(){
        document.getElementById('modal-title').textContent='과목 추가';
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value='';
        document.getElementById('time-slots').innerHTML='';
        addTimeSlot();
        document.getElementById('course-modal').style.display='flex';
    }
    window.openAddCourseModal = openAddCourseModal;

    function openEditModal(id){
        const c=courses.find(x=>x.id===id); if(!c)return;
        document.getElementById('modal-title').textContent='과목 수정';
        document.getElementById('course-id').value=c.id;
        document.getElementById('course-name').value=c.name;
        document.getElementById('course-professor').value=c.professor;
        document.getElementById('course-credits').value=c.credits;
        document.getElementById('course-type').value=c.type;
        document.getElementById('course-room').value=c.room;
        document.getElementById('course-color').value=c.color;
        document.getElementById('course-grade').value=c.grade||'';
        const ts=document.getElementById('time-slots'); ts.innerHTML='';
        c.times.forEach(t=>addTimeSlot(t.day,t.start,t.end));
        document.getElementById('course-modal').style.display='flex';
    }
    window.openEditModal = openEditModal;

    function closeModal(){
        document.getElementById('course-modal').style.display='none';
    }
    window.closeModal = closeModal;

    function selectColor(el){
        document.querySelectorAll('.color-option').forEach(o=>o.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('course-color').value=el.dataset.color;
    }
    window.selectColor = selectColor;

    function addTimeSlot(day=1,start=1,end=1){
        const div=document.createElement('div');div.className='time-slot';
        div.innerHTML=`
            <select class="day-select"></select>
            <select class="start-select"></select>
            <select class="end-select"></select>
            <button onclick="removeTimeSlot(this)">❌</button>
        `;
        const ds=div.querySelector('.day-select'),
              ss=div.querySelector('.start-select'),
              es=div.querySelector('.end-select');
        dayData.slice(1).forEach((d,i)=>{
            ds.innerHTML+=`<option value="${i+1}">${d}</option>`;
            ss.innerHTML+=`<option value="${i+1}">${i+1}교시</option>`;
            es.innerHTML+=`<option value="${i+1}">${i+1}교시</option>`;
        });
        ds.value=day; ss.value=start; es.value=end;
        ss.addEventListener('change',()=>{ if(+es.value<+ss.value) es.value=ss.value; });
        document.getElementById('time-slots').append(div);
    }
    window.addTimeSlot = addTimeSlot;

    function removeTimeSlot(btn){
        const parent=btn.closest('.time-slot');
        if(document.querySelectorAll('.time-slot').length>1) parent.remove();
    }
    window.removeTimeSlot = removeTimeSlot;

    function showTimeError(msg){
        removeTimeError();
        const f=document.getElementById('course-form');
        const e=document.createElement('div');
        e.id='time-error'; e.textContent=msg;
        e.style.color='#ef4444'; f.prepend(e);
    }
    function removeTimeError(){ const old=document.getElementById('time-error'); if(old) old.remove(); }

    function collectCourseForm(){
        const id=document.getElementById('course-id').value;
        const name=document.getElementById('course-name').value.trim();
        const professor=document.getElementById('course-professor').value.trim();
        const credits=+document.getElementById('course-credits').value;
        const type=document.getElementById('course-type').value;
        const room=document.getElementById('course-room').value.trim();
        const color=document.getElementById('course-color').value;
        const grade=document.getElementById('course-grade').value||null;
        const slots=document.querySelectorAll('.time-slot');
        const times=Array.from(slots).map(s=>({
            day:+s.querySelector('.day-select').value,
            start:+s.querySelector('.start-select').value,
            end:+s.querySelector('.end-select').value
        }));
        return { id:id?+id:null, name, professor, credits, type, room, color, grade, times };
    }

    // =============================================================================
    // Settings Modal
    // =============================================================================
    let settingsBackup=null;
    function openSettings(){
        settingsBackup=JSON.parse(JSON.stringify(settings));
        applySettingsToUI();
        document.getElementById('settings-modal').style.display='flex';
    }
    window.openSettings=openSettings;

    function closeSettings(){
        if(settingsBackup){ settings=settingsBackup; applySettings(); settingsBackup=null; }
        document.getElementById('settings-modal').style.display='none';
    }
    window.closeSettings=closeSettings;

    // =============================================================================
    // Escape, clicks, resize, semester change
    // =============================================================================
    function handleEscapeKey(e){
        if(e.key==='Escape'){
            if(document.getElementById('course-modal').style.display==='flex') closeModal();
            else if(document.getElementById('settings-modal').style.display==='flex') closeSettings();
            const dd=document.getElementById('timetable-menu');
            if(dd&&dd.style.display==='block') dd.style.display='none';
        }
    }
    function handleModalOutsideClick(e){
        if(e.target===e.currentTarget){
            if(e.currentTarget.id==='course-modal') closeModal();
            else if(e.currentTarget.id==='settings-modal') closeSettings();
        }
    }
    function handleDropdownOutsideClick(e){
        const drop=document.querySelector('.custom-dropdown');
        if(drop&&!drop.contains(e.target)) document.getElementById('timetable-menu').style.display='none';
    }
    function handleWindowResize(){ createTimetable(); renderCoursesOnTimetable(); }
    function changeSemester(){
        const [y,t] = document.getElementById('semester-select').value.split('-').map(Number);
        currentSemester={year:y,term:t};
        loadCourses().then(()=>{
            createTimetable(); renderCourseList(); calculateGrades();
        });
    }

    // =============================================================================
    // Timetable selector and title
    // =============================================================================
    function updateTimetableSelector(){
        document.getElementById('selected-timetable').textContent=currentTimetable.name;
    }
    function selectTimetable(id){
        const t=timetables.find(x=>x.id===id); if(!t)return;
        currentTimetable=t;
        updateTimetableSelector();
        loadCourses().then(()=>{
            createTimetable(); renderCourseList(); calculateGrades();
        });
    }
    window.selectTimetable=selectTimetable;

    function updatePageTitle(){
        document.querySelector('.page-title').textContent=currentTimetable.name;
    }

    // =============================================================================
    // Appearance
    // =============================================================================
    function applyAppearance(mode){
        document.body.classList.toggle('light-mode',mode==='light');
        document.body.classList.toggle('dark-mode',mode!=='light');
    }

    // =============================================================================
    // Department & Grade dropdowns
    // =============================================================================
    function setupDepartmentSearch(){
        const depIn=document.getElementById('departmentInput'),
              dd=document.getElementById('departmentDropdown'),
              opts=dd.querySelectorAll('.department-option');
        depIn.addEventListener('input',()=>{
            const term=depIn.value.toLowerCase();
            dd.style.display=term?'block':'none';
            dd.querySelectorAll('.department-category').forEach(c=>c.style.display='none');
            opts.forEach(o=>{
                const ok=o.textContent.toLowerCase().includes(term);
                o.style.display=ok?'block':'none';
                if(ok){
                    let p=o.previousElementSibling;
                    while(p){
                        if(p.classList.contains('department-category')){ p.style.display='block'; break; }
                        p=p.previousElementSibling;
                    }
                }
            });
        });
        depIn.addEventListener('focus',()=>{ if(!depIn.value) dd.style.display='block'; });
        opts.forEach(o=>o.addEventListener('click',()=>{
            depIn.value=o.textContent;
            document.getElementById('selectedDepartment').value=o.dataset.value;
            dd.style.display='none';
        }));
        document.addEventListener('click',e=>{ if(!e.target.closest('.department-container')) dd.style.display='none'; });
    }
    function setupGradeDropdown(){
        const btn=document.getElementById('gradeDropdownBtn'),
              menu=document.getElementById('gradeDropdown'),
              sel=document.getElementById('selectedGrade');
        btn.addEventListener('click',()=>menu.classList.toggle('show'));
        menu.querySelectorAll('.grade-option').forEach(o=>o.addEventListener('click',()=>{
            btn.textContent=o.textContent; sel.value=o.dataset.value; menu.classList.remove('show');
        }));
        window.addEventListener('click',e=>{ if(!e.target.matches('.grade-button')&&!e.target.matches('.grade-option')) menu.classList.remove('show'); });
    }
});

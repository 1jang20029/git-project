// 페이지 로드 시 메뉴 아이템에 클릭 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    setupMenuItemClickListeners();
});

// 위젯 클릭 핸들러
function handleWidgetClick(element, action, url) {
    const widgetName = element.querySelector('.widget-name').textContent;
    
    // 셔틀버스 위젯인 경우 페이지 이동
    if (widgetName === '셔틀버스' && action === 'navigate') {
        window.location.href = url;
        return;
    }
    
    // 일반 위젯인 경우 토글
    if (action === 'toggle') {
        toggleWidget(element);
    }
}

// 메뉴 클릭 핸들러
function handleMenuClick(element, url) {
    const menuName = element.querySelector('.menu-name').textContent;
    
    // 셔틀버스 메뉴인 경우 페이지 이동
    if (menuName === '셔틀버스') {
        window.location.href = url;
        return;
    }
}

// 메뉴 아이템 클릭 이벤트 설정
function setupMenuItemClickListeners() {
    const menuItems = document.querySelectorAll('.menu-item.clickable');
    
    menuItems.forEach(item => {
        // before 가상 요소에 대한 클릭 이벤트를 감지하기 위해 전체 아이템에 클릭 이벤트 추가
        item.addEventListener('click', function(event) {
            // 드래그 핸들이나 토글 버튼을 직접 클릭한 경우는 제외
            if (!event.target.matches('.drag-handle') && 
                !event.target.matches('.menu-toggle') &&
                !event.target.closest('.drag-handle') &&
                !event.target.closest('.menu-toggle')) {
                
                // 해당 메뉴 아이템의 토글 버튼 찾기
                const toggle = this.querySelector('.menu-toggle');
                
                // 메뉴 이름이 '내 정보'인 경우 토글 비활성화
                const menuName = this.querySelector('.menu-name').textContent;
                if (menuName === '내 정보') {
                    return; // 내 정보는 토글 불가
                }
                
                // 셔틀버스 메뉴인 경우 페이지 이동
                if (menuName === '셔틀버스') {
                    handleMenuClick(this, 'shuttle-bus.html');
                    return;
                }
                
                // 토글 버튼 클릭 시와 동일한 동작 수행
                toggleMenu(toggle);
            }
        });
    });
}

// 위젯 선택/해제 토글
function toggleWidget(element) {
    // 이미 선택되어 있는 경우 (선택 해제하려는 경우)
    if(element.classList.contains('selected')) {
        element.classList.remove('selected');
        element.querySelector('.widget-checkbox').textContent = '';
    } 
    // 선택되어 있지 않은 경우 (선택하려는 경우)
    else {
        // 선택된 위젯 개수 확인
        const selectedCount = document.querySelectorAll('.widget-item.selected').length;
        if (selectedCount >= 5) {
            alert('위젯은 최대 5개까지만 선택할 수 있습니다.');
            return;
        }
        
        element.classList.add('selected');
        element.querySelector('.widget-checkbox').textContent = '✓';
    }
}

// 메뉴 활성화/비활성화 토글
function toggleMenu(element, isFixed = false) {
    // 내 정보 메뉴는 항상 활성화 (isFixed가 true인 경우)
    if (isFixed) return;
    
    // 토글 상태 변경
    element.classList.toggle('active');
    
    // 메뉴 아이템 상태 변경
    const menuItem = element.closest('.menu-item');
    menuItem.classList.toggle('disabled');
    
    // 상태 텍스트 변경
    const statusEl = menuItem.querySelector('.menu-status');
    if (element.classList.contains('active')) {
        statusEl.textContent = '활성화됨';
        
        // 활성화된 메뉴가 5개 이상인지 확인
        const activeMenus = document.querySelectorAll('.menu-toggle.active');
        if (activeMenus.length > 5) {
            alert('메뉴는 최대 5개까지 활성화할 수 있습니다.');
            toggleMenu(element); // 다시 토글해서 원래 상태로 돌림
            return;
        }
    } else {
        statusEl.textContent = '비활성화됨';
    }
}

// 드래그 앤 드롭 기능
let draggedItem = null;

function drag(event) {
    draggedItem = event.target;
    event.dataTransfer.setData('text/plain', event.target.id);
    setTimeout(() => {
        event.target.style.opacity = '0.5';
    }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    const menuList = document.getElementById('menuList');
    
    menuList.addEventListener('dragover', (event) => {
        event.preventDefault();
        const afterElement = getDragAfterElement(menuList, event.clientY);
        const draggable = document.querySelector('.menu-item[draggable="true"][style*="opacity: 0.5"]');
        if (afterElement == null) {
            menuList.appendChild(draggable);
        } else {
            menuList.insertBefore(draggable, afterElement);
        }
    });
    
    menuList.addEventListener('dragend', (event) => {
        event.target.style.opacity = '';
        draggedItem = null;
    });
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.menu-item[draggable="true"]:not([style*="opacity: 0.5"])')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 설정 저장
function saveSettings() {
    // 선택된 위젯
    const selectedWidgets = [];
    document.querySelectorAll('.widget-item.selected').forEach(widget => {
        selectedWidgets.push({
            name: widget.querySelector('.widget-name').textContent,
            icon: widget.querySelector('.widget-icon').textContent,
            description: widget.querySelector('.widget-description').textContent
        });
    });
    
    // 활성화된 메뉴
    const activeMenus = [];
    document.querySelectorAll('.menu-toggle.active').forEach(toggle => {
        const menuItem = toggle.closest('.menu-item');
        activeMenus.push({
            name: menuItem.querySelector('.menu-name').textContent,
            icon: menuItem.querySelector('.menu-icon').textContent,
            order: Array.from(menuItem.parentNode.children).indexOf(menuItem)
        });
    });
    
    // 로컬 스토리지에 저장
    localStorage.setItem('selectedWidgets', JSON.stringify(selectedWidgets));
    localStorage.setItem('activeMenus', JSON.stringify(activeMenus));
    
    // 현재 로그인한 사용자가 있다면 설정 완료 표시
    const currentUser = localStorage.getItem('currentLoggedInUser');
    if (currentUser) {
        localStorage.setItem(`user_${currentUser}_setup_completed`, 'true');
    }
    
    alert('설정이 저장되었습니다. 메인 페이지로 이동합니다.');
    window.location.href = "index.html";
}

// 설정 초기화
function resetSettings() {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
        // 기본 위젯으로 초기화 (처음 3개 선택)
        document.querySelectorAll('.widget-item').forEach((widget, index) => {
            if (index < 3) {
                widget.classList.add('selected');
                widget.querySelector('.widget-checkbox').textContent = '✓';
            } else {
                widget.classList.remove('selected');
                widget.querySelector('.widget-checkbox').textContent = '';
            }
        });
        
        // 메뉴 리스트 가져오기
        const menuList = document.getElementById('menuList');
        const items = Array.from(menuList.children);
        
        // 내 정보 메뉴 항목 찾기
        const myInfoMenu = items.find(item => 
            item.querySelector('.menu-name').textContent === '내 정보'
        );
        
        // 내 정보 메뉴가 있으면, 첫 번째 위치로 이동
        if(myInfoMenu) {
            menuList.insertBefore(myInfoMenu, menuList.firstChild);
        }
        
        // 기본 메뉴로 초기화 (처음 5개 활성화)
        items.forEach((item, index) => {
            const toggle = item.querySelector('.menu-toggle');
            const itemName = item.querySelector('.menu-name').textContent;
            
            if (index < 5) {
                toggle.classList.add('active');
                item.classList.remove('disabled');
                
                // 내 정보 메뉴는 비활성화 불가 상태로 표시
                if (itemName === '내 정보') {
                    item.querySelector('.menu-status').textContent = '기본 메뉴 (비활성화 불가)';
                } else {
                    item.querySelector('.menu-status').textContent = '활성화됨';
                }
            } else {
                toggle.classList.remove('active');
                item.classList.add('disabled');
                item.querySelector('.menu-status').textContent = '비활성화됨';
            }
        });
        
        alert('설정이 초기화되었습니다.');
    }
}

// 뒤로 가기
function goBack() {
    if (confirm('변경 사항을 저장하지 않고 나가시겠습니까?')) {
        window.history.back();
    }
}
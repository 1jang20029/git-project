document.addEventListener('DOMContentLoaded', function() {
    // 모든 맛집 데이터 삭제
    localStorage.removeItem('restaurants');


    // 모든 좋아요/별점/싫어요 데이터 삭제
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('restaurantLikes_') || 
                    key.startsWith('restaurantStars_') || 
                    key.startsWith('restaurantDislikes_') ||
                    key.includes('restaurants'))) {
            localStorage.removeItem(key);
        }
}



    window.location.reload();


    // 파란색 원형 '3' 버튼 제거 (floating-add-btn)
    const floatingButton = document.getElementById('floating-add-btn');
    if (floatingButton) {
        floatingButton.remove();
        console.log('파란색 원형 3 버튼이 제거되었습니다.');
    }

    // 초기 데이터 - 모든 값을 0으로 초기화
    const restaurantsData = [
        {
            id: 1,
            name: '지지고 안양 연성대점',
            location: '경기도 안양시 만안구 양화로37번길 23',
            hours: '월금 10:30-19:30, 토 12:00-18:00 (일요일 휴무)',
            menu: '지지고누들, 지지고라이스, 참치마요, 고기마요 등',
            features: '철판볶음우동과 컵밥이 인기이며, 맛있한 맛과 가성비 좋은 가격으로 학생들에게 사랑받는 곳입니다.',
            category: '한식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/GGgo-yeonsung.jpg',
                'images/GGgoPrice.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: '부대촌',
            location: '연성대학교 인근 맛집거리',
            hours: '10:00-21:00',
            menu: '제육볶음, 부대찌개',
            features: '오랜 전통을 가진 음식점으로, 학생들이 자주 찾는 곳입니다.',
            category: '한식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/budaechon.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            name: '달콩이네',
            location: '경기도 안양시 만안구 양화로36번길 9',
            hours: '11:00-21:00',
            menu: '해장국',
            features: '대로변이 아니어서 아는 사람만 아는 숨은 맛집으로, 해장국이 인기입니다.',
            category: '한식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/dalkong.jpg',
                'images/dalkongPrice.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            name: '갯마을 칼국수 보쌈',
            location: '경기도 안양시 만안구 양화로 25',
            hours: '매일 10:00-22:00',
            menu: '칼국수, 보쌈',
            features: '연성대 건축과 학생들이 추천하는 맛집으로, 칼국수와 보쌈이 인기입니다.',
            category: '한식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/gaesma-eul.jpg',
                'images/gaesma-eulPrice.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 5,
            name: '삼덕바베큐',
            location: '안양중앙시장 내',
            hours: '11:00-22:00',
            menu: '돼지고기, 소고기 바베큐',
            features: '훈연한 고기의 부드러움과 쫄깃함을 동시에 느낄 수 있는 BBQ 전문점입니다.',
            category: '한식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/samdeogbabekyu.jpg',
                'images/samdeogbabekyuPrice.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 6,
            name: '명가돈까스',
            location: '안양중앙시장 인근',
            hours: '11:00-21:00',
            menu: '돈까스, 국수',
            features: '오랜 전통을 자랑하는 돈까스 전문점으로, 바삭한 돈까스와 함께 나오는 국수나 밥의 조화가 일품입니다.',
            category: '일식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/myeong-gadonkkaseu.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 7,
            name: '원조닭꼬치',
            location: '안양중앙시장 내',
            hours: '11:00-20:00',
            menu: '닭꼬치',
            features: '부드러운 닭고기와 매콤달콤한 소스의 조화가 일품인 닭꼬치 전문점입니다.',
            category: '분식',
            likes: 0,
            stars: 0,
            dislikes: 0,
            images: [
                'images/wonjodalgkkochi.jpg',
                'images/wonjodalgkkochiFood.jpg'
            ],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        }
    ];

    // ===== 전역 상수 =====
    const CURRENT_USER_ID = getUserId(); // 현재 사용자 ID 가져오기
    
    // ===== 로컬 스토리지 관련 함수 =====
    // 현재 사용자 ID 생성 또는 가져오기
    function getUserId() {
        // 로그인 시스템에서 저장한 currentLoggedInUser ID를 우선적으로 사용
        let loggedInUserId = localStorage.getItem('currentLoggedInUser');
        
        // 로그인된 사용자 ID가 있으면 그것을 사용
        if (loggedInUserId) {
            console.log('로그인된 사용자 ID:', loggedInUserId);
            return loggedInUserId;
        }
        
        // 로그인되지 않은 경우 기존 로직 사용
        let userId = localStorage.getItem('currentUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('currentUserId', userId);
        }
        console.log('임시 사용자 ID:', userId);
        return userId;
    }
    
    // 맛집 데이터 불러오기 (모든 사용자가 공유)
    const loadRestaurantsFromStorage = function() {
        const storedData = localStorage.getItem('restaurants');
        let restaurants = storedData ? JSON.parse(storedData) : restaurantsData;
        
        // 각 맛집의 좋아요/별점/싫어요 수를 별도로 불러와 업데이트
        restaurants.forEach(restaurant => {
            const likesKey = `restaurantLikes_${restaurant.id}`;
            const starsKey = `restaurantStars_${restaurant.id}`;
            const dislikesKey = `restaurantDislikes_${restaurant.id}`;
            
            const likesData = localStorage.getItem(likesKey);
            const starsData = localStorage.getItem(starsKey);
            const dislikesData = localStorage.getItem(dislikesKey);
            
            restaurant.likes = likesData !== null ? parseInt(likesData) : 0;
            restaurant.stars = starsData !== null ? parseInt(starsData) : 0;
            restaurant.dislikes = dislikesData !== null ? parseInt(dislikesData) : 0;
        });
        
        return restaurants;
    };

    // 맛집 데이터 저장하기 (모든 사용자가 공유)
    const saveRestaurantsToStorage = function() {
        // 기본 맛집 정보 저장 (좋아요/별점/싫어요 수는 별도로 저장)
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
        
        // 각 맛집의 좋아요/별점/싫어요 수를 별도로 저장
        restaurants.forEach(restaurant => {
            const likesKey = `restaurantLikes_${restaurant.id}`;
            const starsKey = `restaurantStars_${restaurant.id}`;
            const dislikesKey = `restaurantDislikes_${restaurant.id}`;
            
            // 값이 undefined인 경우 0으로 저장
            const likes = restaurant.likes || 0;
            const stars = restaurant.stars || 0;
            const dislikes = restaurant.dislikes || 0;
            
            localStorage.setItem(likesKey, likes.toString());
            localStorage.setItem(starsKey, stars.toString());
            localStorage.setItem(dislikesKey, dislikes.toString());
        });
    };
    
    // 사용자 상호작용 데이터 불러오기 (각 사용자마다 독립적)
    const loadUserInteractions = function() {
        const storedData = localStorage.getItem(`userInteractions_${CURRENT_USER_ID}`);
        if (storedData) {
            return JSON.parse(storedData);
        }
        return {
            likedRestaurants: [],
            starredRestaurants: [],
            dislikedRestaurants: []
        };
    };
    
    // 사용자 상호작용 데이터 저장하기 (각 사용자마다 독립적)
    const saveUserInteractions = function() {
        localStorage.setItem(`userInteractions_${CURRENT_USER_ID}`, JSON.stringify(userInteractions));
    };
    
    // 인기 맛집 가져오기 (좋아요 기준 상위 3개)
    const getPopularRestaurants = function() {
        return [...restaurants]
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3);
    };

    // ===== 전역 상태 =====
    let restaurants = loadRestaurantsFromStorage();
    let userInteractions = loadUserInteractions();
    let currentCategory = '전체';
    let currentPage = 0;
    let restaurantsPerPage = window.innerWidth < 768 ? 2 : 3;
    let selectedRestaurant = null;
    let currentImageIndex = 0;
    let theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    let uploadedImagePreviews = []; // 파일 업로드 미리보기 URL 저장
    let isEditMode = false; // 수정 모드 여부
    let editingRestaurantId = null; // 현재 수정 중인 맛집 ID

    // ===== 요소 참조 =====
    const restaurantsGrid = document.getElementById('restaurants-grid');
    const restaurantDetail = document.getElementById('restaurant-detail');
    const restaurantsListSection = document.getElementById('restaurants-list-section');
    const mobileMenu = document.getElementById('mobile-menu');
    const discountPanel = document.getElementById('discount-panel');
    const addRestaurantModal = document.getElementById('add-restaurant-modal');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    const restaurantsCountTitle = document.getElementById('restaurants-count-title');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('restaurant-images');
    const previewContainer = document.getElementById('preview-container');
    const imagePreviews = document.getElementById('image-previews');
    const restaurantForm = document.getElementById('restaurant-form');
    
    // 모달 제목 요소 추가
    const modalTitle = document.querySelector('.modal-header h2');
    
    // 수정/삭제 버튼 추가
    let editDeleteButtonsHtml = `
        <div class="detail-admin-buttons">
            <button id="edit-restaurant-btn" class="action-btn edit-btn">
                <i class="fas fa-edit"></i> 수정하기
            </button>
            <button id="delete-restaurant-btn" class="action-btn delete-btn">
                <i class="fas fa-trash"></i> 삭제하기
            </button>
        </div>
    `;
    
    // 상세 페이지 컨텐츠 영역에 버튼 추가 (HTML에 해당 버튼들이 없다면 JS에서 추가)
    const detailContent = document.querySelector('.detail-content');
    if (detailContent) {
        // 이미 있는지 확인하고, 없으면 추가
        if (!document.querySelector('.detail-admin-buttons')) {
            const buttonDiv = document.createElement('div');
            buttonDiv.className = 'detail-admin-buttons';
            buttonDiv.innerHTML = editDeleteButtonsHtml;
            // 기존 elements 뒤에 추가
            detailContent.appendChild(buttonDiv);
        }
    }
    
    // 인기 맛집 섹션 추가 (메인 페이지에 추가)
    const addPopularRestaurantsSection = function() {
        // 메인 페이지에 인기 맛집 섹션이 존재하는지 확인
        const existingSection = document.getElementById('popular-restaurants-section');
        if (existingSection) {
            existingSection.remove(); // 기존 섹션 제거
        }
        
        // 인기 맛집 가져오기
        const popularRestaurants = getPopularRestaurants();
        
        // 인기 맛집이 없으면 섹션을 추가하지 않음
        if (popularRestaurants.length === 0) return;
        
        // 인기 맛집 섹션 생성
        const section = document.createElement('section');
        section.id = 'popular-restaurants-section';
        section.className = 'popular-restaurants-section';
        
        let sectionHtml = `
            <div class="section-header">
                <h2>인기 맛집 TOP 3</h2>
            </div>
            <div class="popular-restaurants-grid">
        `;
        
        // 인기 맛집 카드 추가
        popularRestaurants.forEach((restaurant, index) => {
            sectionHtml += `
                <div class="popular-restaurant-card" data-id="${restaurant.id}">
                    <div class="popular-rank">${index + 1}</div>
                    <div class="popular-image">
                        <img src="${restaurant.images[0]}" alt="${restaurant.name}">
                    </div>
                    <div class="popular-content">
                        <h3>${restaurant.name}</h3>
                        <div class="popular-category">${restaurant.category}</div>
                        <div class="popular-likes">
                            <i class="fas fa-thumbs-up"></i> ${restaurant.likes}
                        </div>
                    </div>
                </div>
            `;
        });
        
        sectionHtml += `</div>`;
        section.innerHTML = sectionHtml;
        
        // 메인 콘텐츠 영역에 인기 맛집 섹션 추가
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // 필터 컨테이너 뒤, 맛집 목록 섹션 앞에 추가
            const filterContainer = document.querySelector('.filter-container');
            if (filterContainer) {
                mainContent.insertBefore(section, filterContainer.nextSibling);
            } else {
                mainContent.prepend(section);
            }
            
            // 인기 맛집 카드 클릭 이벤트 추가
            const popularCards = document.querySelectorAll('.popular-restaurant-card');
            popularCards.forEach(card => {
                card.addEventListener('click', function() {
                    const restaurantId = parseInt(this.dataset.id);
                    showRestaurantDetail(restaurantId);
                });
            });
        }
    };

    // ===== 테마 설정 =====
    document.documentElement.setAttribute('data-theme', theme);
    
    document.getElementById('theme-toggle-btn').addEventListener('click', function() {
        theme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // ===== 반응형 설정 =====
    window.addEventListener('resize', function() {
        restaurantsPerPage = window.innerWidth < 768 ? 2 : 3;
        refreshRestaurantsList();
    });

    // ===== 모바일 메뉴 토글 =====
    document.getElementById('menu-toggle').addEventListener('click', function() {
        mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
    });

    // ===== 학생증 할인정보 토글 =====
    const toggleDiscountPanel = function() {
        discountPanel.classList.toggle('hidden');
        mobileMenu.style.display = 'none';
    };

    document.getElementById('student-discount-btn').addEventListener('click', toggleDiscountPanel);
    document.getElementById('mobile-discount-btn').addEventListener('click', toggleDiscountPanel);
    document.getElementById('close-discount').addEventListener('click', toggleDiscountPanel);

    // ===== 맛집 등록 모달 토글 =====
    const toggleAddRestaurantModal = function() {
        addRestaurantModal.classList.toggle('hidden');
        mobileMenu.style.display = 'none';
        
        // 모달이 닫히면 폼 초기화
        if (addRestaurantModal.classList.contains('hidden')) {
            resetRestaurantForm();
        }
    };

    // 맛집 등록 폼 초기화 함수
    const resetRestaurantForm = function() {
        isEditMode = false;
        editingRestaurantId = null;
        modalTitle.textContent = '새 맛집 등록하기';
        document.getElementById('submit-add').textContent = '등록하기';
        
        // 폼 필드 초기화
        restaurantForm.reset();
        
        // 이미지 미리보기 초기화
        uploadedImagePreviews = [];
        previewContainer.classList.add('hidden');
        imagePreviews.innerHTML = '';
    };

    document.getElementById('add-place-btn').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('mobile-add-btn').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('close-modal').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('cancel-add').addEventListener('click', toggleAddRestaurantModal);
    
    // ===== 맛집 등록/수정 버튼 이벤트 =====
    document.getElementById('submit-add').addEventListener('click', function() {
        // 폼에서 데이터 가져오기
        const restaurantName = document.getElementById('restaurant-name').value;
        const restaurantCategory = document.getElementById('restaurant-category').value;
        const restaurantLocation = document.getElementById('restaurant-location').value;
        const restaurantHours = document.getElementById('restaurant-hours').value;
        const restaurantMenu = document.getElementById('restaurant-menu').value;
        const restaurantFeatures = document.getElementById('restaurant-features').value;
        
        // 모든 필드가 입력되었는지 확인
        if (!restaurantName || !restaurantCategory || !restaurantLocation || 
            !restaurantHours || !restaurantMenu || !restaurantFeatures) {
            alert('모든 항목을 입력해주세요.');
            return;
        }
        
        // 이미지가 하나 이상 있는지 확인
        if (uploadedImagePreviews.length === 0) {
            alert('최소 1개 이상의 이미지를 업로드해주세요.');
            return;
        }

        if (isEditMode && editingRestaurantId) {
            // 수정 모드일 경우
            const restaurantIndex = restaurants.findIndex(r => r.id === editingRestaurantId);
            if (restaurantIndex !== -1) {
                // 기존 맛집 정보 업데이트
                restaurants[restaurantIndex].name = restaurantName;
                restaurants[restaurantIndex].category = restaurantCategory;
                restaurants[restaurantIndex].location = restaurantLocation;
                restaurants[restaurantIndex].hours = restaurantHours;
                restaurants[restaurantIndex].menu = restaurantMenu;
                restaurants[restaurantIndex].features = restaurantFeatures;
                restaurants[restaurantIndex].images = [...uploadedImagePreviews];
                restaurants[restaurantIndex].updatedAt = new Date().toISOString();
                
                // 수정은 생성한 사용자만 가능
                if (restaurants[restaurantIndex].createdBy === CURRENT_USER_ID) {
                    // 로컬 스토리지에 저장
                    saveRestaurantsToStorage();
                    
                    alert('맛집 정보가 수정되었습니다!');
                    
                    // 상세 페이지가 표시 중이고, 현재 수정된 맛집을 보고 있다면 정보 업데이트
                    if (selectedRestaurant && selectedRestaurant.id === editingRestaurantId) {
                        selectedRestaurant = restaurants[restaurantIndex];
                        updateRestaurantDetail(selectedRestaurant);
                    }
                } else {
                    alert('본인이 등록한 맛집만 수정할 수 있습니다.');
                }
            }
        } else {
            // 새 맛집 추가 모드
            const newId = restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
            
            // 새 맛집 객체 생성
            const newRestaurant = {
                id: newId,
                name: restaurantName,
                location: restaurantLocation,
                hours: restaurantHours,
                menu: restaurantMenu,
                features: restaurantFeatures,
                category: restaurantCategory,
                likes: 0,
                stars: 0,
                dislikes: 0,
                images: [...uploadedImagePreviews],
                createdBy: CURRENT_USER_ID,
                createdAt: new Date().toISOString()
            };
            
            // 맛집 배열에 추가
            restaurants.push(newRestaurant);
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            alert('새 맛집이 등록되었습니다!');
        }
        
        // 폼 초기화
        resetRestaurantForm();
        
        // 모달 닫기
        toggleAddRestaurantModal();
        
        // 맛집 목록 새로고침
        refreshRestaurantsList();
        
        // 인기 맛집 섹션 업데이트
        addPopularRestaurantsSection();
    });

    // ===== 파일 업로드 처리 =====
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files);
        }
    });

    function handleFiles(files) {
        previewContainer.classList.remove('hidden');
        imagePreviews.innerHTML = '';
        uploadedImagePreviews = []; // 미리보기 배열 초기화
        
        // 최대 5개 파일로 제한
        const maxFiles = 5;
        const filesToProcess = Array.from(files).slice(0, maxFiles);
        
        filesToProcess.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    uploadedImagePreviews.push(imageUrl); // 미리보기 URL 저장
                    
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${imageUrl}" alt="미리보기 이미지 ${index + 1}">
                        <div class="remove-preview" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </div>
                    `;
                    imagePreviews.appendChild(preview);
                    
                    preview.querySelector('.remove-preview').addEventListener('click', function() {
                        const idx = parseInt(this.getAttribute('data-index'));
                        uploadedImagePreviews.splice(idx, 1); // 배열에서 해당 이미지 제거
                        preview.remove();
                        
                        // 미리보기 인덱스 재설정
                        const allPreviews = imagePreviews.querySelectorAll('.image-preview');
                        allPreviews.forEach((prev, i) => {
                            prev.querySelector('.remove-preview').setAttribute('data-index', i);
                        });
                        
                        if (imagePreviews.children.length === 0) {
                            previewContainer.classList.add('hidden');
                        }
                    });
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    // ===== 카테고리 필터링 =====
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            currentPage = 0;
            
            // 활성화된 버튼 스타일 변경
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 맛집 목록 새로고침
            refreshRestaurantsList();
        });
    });

    // ===== 페이지네이션 =====
    prevPageButton.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            refreshRestaurantsList();
        }
    });

    nextPageButton.addEventListener('click', function() {
        const filteredRestaurants = getFilteredRestaurants();
        const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
        
        if (currentPage < totalPages - 1) {
            currentPage++;
            refreshRestaurantsList();
        }
    });

    // ===== URL 파라미터 처리 =====
    // URL에서 파라미터 가져오기
    function getURLParameters() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        
        return params;
    }
    
    // 페이지 로드 시 URL 파라미터 확인하여 맛집 상세 정보 표시
    function checkURLAndShowRestaurant() {
        // 페이지 새로고침 여부 확인 (performance.navigation.type === 1은 새로고침을 의미)
        if (performance.navigation.type === 1) {
            // 새로고침인 경우, URL의 id 파라미터 무시하고 맛집 목록 화면 표시
            restaurantDetail.classList.add('hidden');
            restaurantsListSection.classList.remove('hidden');
            selectedRestaurant = null;
            
            // URL에서 id 파라미터 제거
            history.replaceState({}, '', window.location.pathname);
            
            return; // 함수 실행 종료
        }
        
        const params = getURLParameters();
        
        // id 파라미터가 있으면 해당 맛집 상세 정보 표시
        if (params.id) {
            const restaurantId = parseInt(params.id);
            console.log(`URL 파라미터로 전달된 맛집 ID: ${restaurantId}`);
            
            // 해당 ID의 맛집 찾기
            const restaurant = restaurants.find(r => r.id === restaurantId);
            
            if (restaurant) {
                // 이미지 인덱스 파라미터가 있으면 해당 이미지 표시
                if (params.image) {
                    const imageIndex = parseInt(params.image);
                    if (imageIndex >= 0 && imageIndex < restaurant.images.length) {
                        currentImageIndex = imageIndex;
                    }
                }
                
                // 상세 정보 화면으로 바로 이동
                showRestaurantDetail(restaurantId);
                console.log(`맛집 '${restaurant.name}'의 상세 정보 페이지를 표시합니다.`);
            } else {
                console.error(`ID ${restaurantId}에 해당하는 맛집을 찾을 수 없습니다.`);
                // 맛집을 찾을 수 없을 경우 알림 표시 (선택사항)
                alert('요청하신 맛집 정보를 찾을 수 없습니다.');
            }
        }
    }
    
    // URL 업데이트 함수 추가 (새로고침 시 현재 상태 유지를 위해)
    function updateURL(restaurantId, imageIndex = 0) {
        // 현재 URL 정보 가져오기
        const url = new URL(window.location);
        
        if (restaurantId) {
            // 상세 정보 페이지인 경우 URL 파라미터 설정
            url.searchParams.set('id', restaurantId);
            url.searchParams.set('image', imageIndex);
        } else {
            // 목록 페이지인 경우 URL 파라미터 제거
            url.searchParams.delete('id');
            url.searchParams.delete('image');
        }
        
        // URL 업데이트 (페이지 새로고침 없이)
        history.pushState({}, '', url);
    }

    // ===== 맛집 상세 정보 업데이트 =====
    const updateRestaurantDetail = function(restaurant) {
        document.getElementById('detail-name').textContent = restaurant.name;
        document.getElementById('detail-category-badge').textContent = restaurant.category;
        document.getElementById('detail-location').textContent = restaurant.location;
        document.getElementById('detail-hours').textContent = restaurant.hours;
        document.getElementById('detail-menu').textContent = restaurant.menu;
        document.getElementById('detail-features').textContent = restaurant.features;
        document.getElementById('detail-likes').textContent = restaurant.likes;
        document.getElementById('detail-stars').textContent = restaurant.stars;
        document.getElementById('detail-dislikes').textContent = restaurant.dislikes;
        
        // 사용자의 상호작용 상태에 따른 버튼 UI 업데이트
        const likeBtn = document.getElementById('detail-like-btn');
        const starBtn = document.getElementById('detail-star-btn');
        const dislikeBtn = document.getElementById('detail-dislike-btn');
        
        // 좋아요 버튼 상태 업데이트
        if (userInteractions.likedRestaurants.includes(restaurant.id)) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
        
        // 추천해요 버튼 상태 업데이트
        if (userInteractions.starredRestaurants.includes(restaurant.id)) {
            starBtn.classList.add('active');
        } else {
            starBtn.classList.remove('active');
        }
        
        // 별로예요 버튼 상태 업데이트
        if (userInteractions.dislikedRestaurants.includes(restaurant.id)) {
            dislikeBtn.classList.add('active');
        } else {
            dislikeBtn.classList.remove('active');
        }
        
        // 수정/삭제 버튼 표시 여부 설정 (자신이 등록한 맛집만)
        const adminButtons = document.querySelector('.detail-admin-buttons');
        if (adminButtons) {
            console.log('상세 페이지 - 맛집 등록자:', restaurant.createdBy, '현재 사용자:', CURRENT_USER_ID);
            // 문자열로 변환하여 정확한 비교
            adminButtons.style.display = String(restaurant.createdBy) === String(CURRENT_USER_ID) ? 'flex' : 'none';
        }
        
        // 이미지 업데이트
        updateDetailImage();
    };

    // ===== 맛집 목록에서 상세 페이지로 이동 =====
    const showRestaurantDetail = function(restaurantId) {
        selectedRestaurant = restaurants.find(r => r.id === restaurantId);
        
        if (selectedRestaurant) {
            // 상세 정보 업데이트
            updateRestaurantDetail(selectedRestaurant);
            
            // 갤러리 컨트롤 업데이트
            const galleryControls = document.querySelector('.gallery-controls');
            galleryControls.style.display = selectedRestaurant.images.length > 1 ? 'flex' : 'none';
            
            // 화면 전환
            restaurantsListSection.classList.add('hidden');
            restaurantDetail.classList.remove('hidden');
            
            // URL 업데이트 - 상세 페이지로 이동했음을 표시
            updateURL(restaurantId, currentImageIndex);
            
            // 페이지 상단으로 스크롤
            window.scrollTo(0, 0);
        }
    };

    // ===== 상세 페이지 이미지 업데이트 =====
    const updateDetailImage = function() {
        if (selectedRestaurant) {
            document.getElementById('detail-image').src = selectedRestaurant.images[currentImageIndex];
            document.getElementById('image-counter').textContent = `${currentImageIndex + 1} / ${selectedRestaurant.images.length}`;
        }
    };

    // ===== 상세 페이지에서 목록으로 돌아가기 =====
    document.getElementById('back-to-list').addEventListener('click', function() {
        restaurantDetail.classList.add('hidden');
        restaurantsListSection.classList.remove('hidden');
        selectedRestaurant = null;
        
        // URL 업데이트 - 목록 페이지로 돌아감을 표시
        updateURL(null);
    });

    // ===== 갤러리 네비게이션 =====
    document.getElementById('prev-image').addEventListener('click', function() {
        if (selectedRestaurant && selectedRestaurant.images.length > 1) {
            currentImageIndex = (currentImageIndex - 1 + selectedRestaurant.images.length) % selectedRestaurant.images.length;
            updateDetailImage();
            
            // URL 업데이트 - 현재 보고 있는 이미지 인덱스 업데이트
            updateURL(selectedRestaurant.id, currentImageIndex);
        }
    });

    document.getElementById('next-image').addEventListener('click', function() {
        if (selectedRestaurant && selectedRestaurant.images.length > 1) {
            currentImageIndex = (currentImageIndex + 1) % selectedRestaurant.images.length;
            updateDetailImage();
            
            // URL 업데이트 - 현재 보고 있는 이미지 인덱스 업데이트
            updateURL(selectedRestaurant.id, currentImageIndex);
        }
    });

    // ===== 상세 페이지 수정/삭제 버튼 이벤트 =====
    // 이벤트 위임을 사용하여 동적으로 추가되는 버튼에 이벤트 핸들러 연결
    document.addEventListener('click', function(e) {
        // 수정 버튼 클릭
        if (e.target && (e.target.id === 'edit-restaurant-btn' || e.target.closest('#edit-restaurant-btn'))) {
            if (selectedRestaurant && selectedRestaurant.createdBy === CURRENT_USER_ID) {
                // 수정 모드 활성화
                isEditMode = true;
                editingRestaurantId = selectedRestaurant.id;
                
                // 모달 제목 변경
                modalTitle.textContent = '맛집 정보 수정하기';
                document.getElementById('submit-add').textContent = '수정완료';
                
                // 현재 맛집 정보를 폼에 채우기
                document.getElementById('restaurant-name').value = selectedRestaurant.name;
                document.getElementById('restaurant-category').value = selectedRestaurant.category;
                document.getElementById('restaurant-location').value = selectedRestaurant.location;
                document.getElementById('restaurant-hours').value = selectedRestaurant.hours;
                document.getElementById('restaurant-menu').value = selectedRestaurant.menu;
                document.getElementById('restaurant-features').value = selectedRestaurant.features;
                
                // 이미지 미리보기 설정
                uploadedImagePreviews = [...selectedRestaurant.images];
                previewContainer.classList.remove('hidden');
                imagePreviews.innerHTML = '';
                
                uploadedImagePreviews.forEach((imageUrl, idx) => {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${imageUrl}" alt="미리보기 이미지 ${idx + 1}">
                        <div class="remove-preview" data-index="${idx}">
                            <i class="fas fa-times"></i>
                        </div>
                    `;
                    imagePreviews.appendChild(preview);
                    
                    preview.querySelector('.remove-preview').addEventListener('click', function() {
                        const idx = parseInt(this.getAttribute('data-index'));
                        uploadedImagePreviews.splice(idx, 1);
                        preview.remove();
                        
                        const allPreviews = imagePreviews.querySelectorAll('.image-preview');
                        allPreviews.forEach((prev, i) => {
                            prev.querySelector('.remove-preview').setAttribute('data-index', i);
                        });
                        
                        if (imagePreviews.children.length === 0) {
                            previewContainer.classList.add('hidden');
                        }
                    });
                });
                
                // 모달 열기
                addRestaurantModal.classList.remove('hidden');
            } else {
                alert('본인이 등록한 맛집만 수정할 수 있습니다.');
            }
        }
        
        // 삭제 버튼 클릭
        if (e.target && (e.target.id === 'delete-restaurant-btn' || e.target.closest('#delete-restaurant-btn'))) {
            if (selectedRestaurant && selectedRestaurant.createdBy === CURRENT_USER_ID) {
                if (confirm(`'${selectedRestaurant.name}' 맛집을 정말 삭제하시겠습니까?`)) {
                    // 배열에서 해당 맛집 제거
                    const index = restaurants.findIndex(r => r.id === selectedRestaurant.id);
                    if (index !== -1) {
                        restaurants.splice(index, 1);
                        
                        // 로컬 스토리지에 저장
                        saveRestaurantsToStorage();
                        
                        // 사용자 상호작용 데이터에서도 해당 맛집 정보 제거
                        userInteractions.likedRestaurants = userInteractions.likedRestaurants.filter(id => id !== selectedRestaurant.id);
                        userInteractions.starredRestaurants = userInteractions.starredRestaurants.filter(id => id !== selectedRestaurant.id);
                        userInteractions.dislikedRestaurants = userInteractions.dislikedRestaurants.filter(id => id !== selectedRestaurant.id);
                        saveUserInteractions();
                        
                        // 알림 표시
                        alert(`'${selectedRestaurant.name}' 맛집 등록에서 삭제완료되었습니다.`);
                        
                        // 목록으로 돌아가기
                        restaurantDetail.classList.add('hidden');
                        restaurantsListSection.classList.remove('hidden');
                        selectedRestaurant = null;
                        
                        // URL 업데이트 - 목록 페이지로 돌아감을 표시
                        updateURL(null);
                        
                        // 맛집 목록 새로고침
                        refreshRestaurantsList();
                        
                        // 인기 맛집 섹션 업데이트
                        addPopularRestaurantsSection();
                    }
                }
            } else {
                alert('본인이 등록한 맛집만 삭제할 수 있습니다.');
            }
        }
    });

    // ===== 상세 페이지 반응 버튼 - 토글 기능 추가 =====
    document.getElementById('detail-like-btn').addEventListener('click', function() {
        if (selectedRestaurant) {
            // 좋아요 토글
            const restaurantId = selectedRestaurant.id;
            const likedIndex = userInteractions.likedRestaurants.indexOf(restaurantId);
            
            if (likedIndex !== -1) {
                // 이미 좋아요를 누른 상태에서 다시 클릭한 경우 - 현재 사용자의 좋아요만 취소
                userInteractions.likedRestaurants.splice(likedIndex, 1);
                selectedRestaurant.likes = Math.max(0, selectedRestaurant.likes - 1); // 음수 방지
                this.classList.remove('active');
            } else {
                // 처음 좋아요를 누른 경우 - 현재 사용자의 좋아요 추가
                userInteractions.likedRestaurants.push(restaurantId);
                selectedRestaurant.likes = (selectedRestaurant.likes || 0) + 1;
                this.classList.add('active');
            }
            
            // 사용자 상호작용 데이터 저장
            saveUserInteractions();
            
            // 맛집 데이터 저장
            saveRestaurantsToStorage();
            
            // UI 업데이트
            document.getElementById('detail-likes').textContent = selectedRestaurant.likes;
            
            // 목록에 있는 해당 맛집의 좋아요 수도 업데이트
            updateRestaurantInList(restaurantId);
            
            // 인기 맛집 섹션 업데이트
            addPopularRestaurantsSection();
        }
    });

    // 추천해요(별점) 버튼 이벤트 리스너 - 계정별로 독립적으로 동작
    document.getElementById('detail-star-btn').addEventListener('click', function() {
        if (selectedRestaurant) {
            // 추천해요 토글
            const restaurantId = selectedRestaurant.id;
            const starredIndex = userInteractions.starredRestaurants.indexOf(restaurantId);
            
            if (starredIndex !== -1) {
                // 이미 추천해요를 누른 상태에서 다시 클릭한 경우 - 현재 사용자의 추천만 취소
                userInteractions.starredRestaurants.splice(starredIndex, 1);
                selectedRestaurant.stars = Math.max(0, selectedRestaurant.stars - 1); // 음수 방지
                this.classList.remove('active');
            } else {
                // 처음 추천해요를 누른 경우 - 현재 사용자의 추천 추가
                userInteractions.starredRestaurants.push(restaurantId);
                selectedRestaurant.stars = (selectedRestaurant.stars || 0) + 1;
                this.classList.add('active');
            }
            
            // 사용자 상호작용 데이터 저장
            saveUserInteractions();
            
            // 맛집 데이터 저장
            saveRestaurantsToStorage();
            
            // UI 업데이트
            document.getElementById('detail-stars').textContent = selectedRestaurant.stars;
            
            // 목록에 있는 해당 맛집의 추천해요 수도 업데이트
            updateRestaurantInList(restaurantId);
        }
    });

    // 싫어요 버튼 이벤트 리스너 - 계정별로 독립적으로 동작
    document.getElementById('detail-dislike-btn').addEventListener('click', function() {
        if (selectedRestaurant) {
            // 싫어요 토글
            const restaurantId = selectedRestaurant.id;
            const dislikedIndex = userInteractions.dislikedRestaurants.indexOf(restaurantId);
            
            if (dislikedIndex !== -1) {
                // 이미 싫어요를 누른 상태에서 다시 클릭한 경우 - 현재 사용자의 싫어요만 취소
                userInteractions.dislikedRestaurants.splice(dislikedIndex, 1);
                selectedRestaurant.dislikes = Math.max(0, selectedRestaurant.dislikes - 1); // 음수 방지
                this.classList.remove('active');
            } else {
                // 처음 싫어요를 누른 경우 - 현재 사용자의 싫어요 추가
                userInteractions.dislikedRestaurants.push(restaurantId);
                selectedRestaurant.dislikes = (selectedRestaurant.dislikes || 0) + 1;
                this.classList.add('active');
            }
            
            // 사용자 상호작용 데이터 저장
            saveUserInteractions();
            
            // 맛집 데이터 저장
            saveRestaurantsToStorage();
            
            // UI 업데이트
            document.getElementById('detail-dislikes').textContent = selectedRestaurant.dislikes;
            
            // 목록에 있는 해당 맛집의 싫어요 수도 업데이트
            updateRestaurantInList(restaurantId);
        }
    });

    // ===== 목록에서 맛집 항목 업데이트 =====
    const updateRestaurantInList = function(id) {
        const restaurant = restaurants.find(r => r.id === id);
        if (!restaurant) return;
        
        const restaurantElement = document.querySelector(`.restaurant-card[data-id="${id}"]`);
        if (restaurantElement) {
            const likeElement = restaurantElement.querySelector('.like-bubble span');
            const starElement = restaurantElement.querySelector('.star-bubble span');
            const dislikeElement = restaurantElement.querySelector('.dislike-bubble span');
            
            if (likeElement) likeElement.textContent = restaurant.likes;
            if (starElement) starElement.textContent = restaurant.stars;
            if (dislikeElement) dislikeElement.textContent = restaurant.dislikes;
            
            // 버튼 상태 업데이트
            const likeButton = restaurantElement.querySelector('.like-btn');
            const starButton = restaurantElement.querySelector('.star-btn');
            const dislikeButton = restaurantElement.querySelector('.dislike-btn');
            
            if (likeButton) {
                if (userInteractions.likedRestaurants.includes(id)) {
                    likeButton.classList.add('active');
                } else {
                    likeButton.classList.remove('active');
                }
            }
            
            if (starButton) {
                if (userInteractions.starredRestaurants.includes(id)) {
                    starButton.classList.add('active');
                } else {
                    starButton.classList.remove('active');
                }
            }
            
            if (dislikeButton) {
                if (userInteractions.dislikedRestaurants.includes(id)) {
                    dislikeButton.classList.add('active');
                } else {
                    dislikeButton.classList.remove('active');
                }
            }
        }
    };

    // ===== 카테고리별 필터링된 맛집 가져오기 =====
    const getFilteredRestaurants = function() {
        return currentCategory === '전체'
            ? restaurants
            : restaurants.filter(r => r.category === currentCategory);
    };

    // ===== 현재 페이지에 표시할 맛집 가져오기 =====
    const getCurrentPageRestaurants = function() {
        const filteredRestaurants = getFilteredRestaurants();
        const startIndex = currentPage * restaurantsPerPage;
        return filteredRestaurants.slice(startIndex, startIndex + restaurantsPerPage);
    };

    // ===== 맛집 카드 생성 =====
    const createRestaurantCard = function(restaurant) {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.dataset.id = restaurant.id;
        
        // 디버깅을 위한 로그 추가
        console.log('맛집 카드 생성:', restaurant.id, '등록자:', restaurant.createdBy, '현재 사용자:', CURRENT_USER_ID);
        
        // 내가 등록한 맛집에 특별한 클래스 추가 - String으로 변환하여 정확한 비교
        if (String(restaurant.createdBy) === String(CURRENT_USER_ID)) {
            card.classList.add('user-created');
        }
        
        // 사용자가 좋아요/추천해요/별로예요를 눌렀는지 여부
        const isLiked = userInteractions.likedRestaurants.includes(restaurant.id);
        const isStarred = userInteractions.starredRestaurants.includes(restaurant.id);
        const isDisliked = userInteractions.dislikedRestaurants.includes(restaurant.id);
        
        // String으로 변환하여 정확한 비교
        const isCreator = String(restaurant.createdBy) === String(CURRENT_USER_ID);
        
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${restaurant.images[0]}" alt="${restaurant.name}" loading="lazy">
                <div class="card-category">${restaurant.category}</div>
                ${restaurant.images.length > 1 ? `<div class="card-image-count">1 / ${restaurant.images.length}</div>` : ''}
                ${isCreator ? '<div class="user-created-badge">등록</div>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${restaurant.name}</h3>
                <div class="card-ratings">
                    <div class="rating-bubble like-bubble">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${restaurant.likes}</span>
                    </div>
                    <div class="rating-bubble star-bubble">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.stars}</span>
                    </div>
                    <div class="rating-bubble dislike-bubble">
                        <i class="fas fa-thumbs-down"></i>
                        <span>${restaurant.dislikes}</span>
                    </div>
                </div>
                <div class="card-info">
                    <i class="fas fa-map-marker-alt"></i>
                    ${restaurant.location}
                </div>
                <div class="card-menu">
                    <i class="fas fa-utensils"></i>
                    ${restaurant.menu.split(',')[0]} 외
                </div>
                <div class="card-actions">
                    <button class="card-action-btn like-btn ${isLiked ? 'active' : ''}" title="좋아요">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button class="card-action-btn star-btn ${isStarred ? 'active' : ''}" title="추천해요">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="card-action-btn dislike-btn ${isDisliked ? 'active' : ''}" title="별로예요">
                        <i class="fas fa-thumbs-down"></i>
                    </button>
                </div>
            </div>
        `;
        
        // 맛집 카드 클릭 이벤트
        card.addEventListener('click', function(e) {
            // 버튼 클릭은 제외
            if (!e.target.closest('.card-action-btn')) {
                showRestaurantDetail(restaurant.id);
            }
        });
        
        // 반응 버튼 이벤트 - 토글 기능 추가
        const likeButton = card.querySelector('.like-btn');
        const starButton = card.querySelector('.star-btn');
        const dislikeButton = card.querySelector('.dislike-btn');
        
        // 카드의 좋아요 버튼 이벤트
        likeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 좋아요 토글
            const restaurantId = restaurant.id;
            const likedIndex = userInteractions.likedRestaurants.indexOf(restaurantId);
            
            if (likedIndex !== -1) {
                // 이미 좋아요를 누른 상태에서 다시 클릭한 경우
                userInteractions.likedRestaurants.splice(likedIndex, 1);
                restaurant.likes = Math.max(0, restaurant.likes - 1);
                this.classList.remove('active');
            } else {
                // 처음 좋아요를 누른 경우
                userInteractions.likedRestaurants.push(restaurantId);
                restaurant.likes = (restaurant.likes || 0) + 1;
                this.classList.add('active');
            }
            
            // 사용자 상호작용 데이터 저장
            saveUserInteractions();
            
            // 맛집 데이터 저장
            saveRestaurantsToStorage();
            
            // UI 업데이트
            updateRestaurantInList(restaurantId);
            
            // 인기 맛집 섹션 업데이트
            addPopularRestaurantsSection();
        });
        
        // 추천해요(별표) 버튼 이벤트 핸들러 추가
        starButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 추천해요 토글
            const restaurantId = restaurant.id;
            const starredIndex = userInteractions.starredRestaurants.indexOf(restaurantId);
            
            if (starredIndex !== -1) {
                // 이미 추천해요를 누른 상태에서 다시 클릭한 경우
                userInteractions.starredRestaurants.splice(starredIndex, 1);
                restaurant.stars = Math.max(0, restaurant.stars - 1); // 음수 방지
                this.classList.remove('active');
            } else {
                // 처음 추천해요를 누른 경우
                userInteractions.starredRestaurants.push(restaurantId);
                restaurant.stars = (restaurant.stars || 0) + 1;
                this.classList.add('active');
            }
            
            // 사용자 상호작용 데이터 저장
            saveUserInteractions();
            
            // 맛집 데이터 저장
            saveRestaurantsToStorage();
            
            // UI 업데이트
            updateRestaurantInList(restaurantId);
            
            // 인기 맛집 섹션 업데이트
            addPopularRestaurantsSection();
        });
        
        // 싫어요 버튼 이벤트 - 중복 제거하고 하나만 유지
        dislikeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 싫어요 토글
            const restaurantId = restaurant.id;
            const dislikedIndex = userInteractions.dislikedRestaurants.indexOf(restaurantId);
            
            if (dislikedIndex !== -1) {
                // 이미 싫어요를 누른 상태에서 다시 클릭한 경우
                userInteractions.dislikedRestaurants.splice(dislikedIndex, 1);
                restaurant.dislikes = Math.max(0, restaurant.dislikes - 1); // 음수 방지
                this.classList.remove('active');
            } else {
                // 처음 싫어요를 누른 경우
                userInteractions.dislikedRestaurants.push(restaurantId);
                restaurant.dislikes = (restaurant.dislikes || 0) + 1;
                this.classList.add('active');
            }
            
            // 사용자 상호작용 데이터 저장
            saveUserInteractions();
            
            // 맛집 데이터 저장
            saveRestaurantsToStorage();
            
            // UI 업데이트
            updateRestaurantInList(restaurantId);
            
            // 인기 맛집 섹션 업데이트
            addPopularRestaurantsSection();
        });
        
        return card;
    };

    // ===== 맛집 목록 새로고침 =====
    const refreshRestaurantsList = function() {
        // 기존 목록 비우기
        restaurantsGrid.innerHTML = '';
        
        // 필터링된 맛집 가져오기
        const filteredRestaurants = getFilteredRestaurants();
        const currentPageRestaurants = getCurrentPageRestaurants();
        
        // 페이지네이션 업데이트
        const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
        pageIndicator.textContent = totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '0 / 0';
        
        // 이전/다음 버튼 활성화/비활성화
        prevPageButton.disabled = currentPage === 0;
        nextPageButton.disabled = currentPage >= totalPages - 1 || totalPages === 0;
        
        // 맛집 카운트 타이틀 업데이트
        let titleText = '연성대 맛집 추천';
        if (currentCategory !== '전체') {
            titleText = `${currentCategory} (${filteredRestaurants.length}개)`;
        } else {
            titleText = `전체 맛집 (${filteredRestaurants.length}개)`;
        }
        restaurantsCountTitle.textContent = titleText;
        
        // 맛집 카드 추가
        currentPageRestaurants.forEach(restaurant => {
            const card = createRestaurantCard(restaurant);
            restaurantsGrid.appendChild(card);
        });
        
        // 결과가 없을 경우 메시지 표시
        if (currentPageRestaurants.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <p>해당 카테고리의 맛집이 없습니다.</p>
                <p>다른 카테고리를 선택하거나 맛집을 등록해 보세요!</p>
            `;
            restaurantsGrid.appendChild(emptyMessage);
        }
    };
    
    // 파란색 '3' 버튼을 감추기 위한 추가 CSS 스타일
    const additionalStyle = document.createElement('style');
    additionalStyle.textContent = `
        /* 파란색 '3' 버튼 관련 스타일 숨김 */
        .floating-btn, .fab, .float-btn, [class*="floating-add"], #floating-add-btn {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(additionalStyle);
    
    // 기존 스타일 정의
    const style = document.createElement('style');
    style.textContent = `
        /* 수정/삭제 버튼 스타일 */
        .detail-admin-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            gap: 10px;
        }
        
        .edit-btn {
            background-color: #f0f4ff;
            color: #3d5af1;
        }
        
        .delete-btn {
            background-color: #fff0f0;
            color: #e94057;
        }
        
        /* 내가 등록한 맛집 스타일 */
        .user-created-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: rgba(61, 90, 241, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 500;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        /* 상세 이미지 스타일 수정 */
        .detail-gallery {
            position: relative;
            height: auto;
            max-height: 500px;
            overflow: hidden;
        }

        #detail-image {
            width: 100%;
            height: auto;
            object-fit: contain;
            max-height: 500px;
        }
        
        /* 인기 맛집 섹션 스타일 */
        .popular-restaurants-section {
            margin-bottom: 30px;
            background-color: var(--background-light);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 2px 10px var(--shadow-color);
        }
        
        .popular-restaurants-section .section-header {
            margin-bottom: 15px;
        }
        
        .popular-restaurants-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .popular-restaurant-card {
            background-color: var(--card-color);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            box-shadow: 0 3px 8px var(--shadow-color);
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .popular-restaurant-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px var(--shadow-color);
        }
        
        .popular-rank {
            background-color: var(--primary-color);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            position: absolute;
            top: 5px;
            left: 5px;
            z-index: 2;
            font-size: 0.9rem;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .popular-image {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            position: relative;
        }
        
        .popular-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .popular-content {
            padding: 10px;
            flex-grow: 1;
        }
        
        .popular-content h3 {
            margin: 0 0 5px 0;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .popular-category {
            color: var(--text-light);
            font-size: 0.8rem;
            margin-bottom: 5px;
        }
        
        .popular-likes {
            color: var(--like-color);
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* 버튼 활성화 상태 스타일 */
        .card-action-btn.active, .action-btn.active {
            transform: scale(1.1);
        }
        
        .like-btn.active {
            background-color: #ffe0e0;
            color: var(--like-color);
        }
        
        .star-btn.active {
            background-color: #fff0c0;
            color: var(--star-color);
        }
        
        .dislike-btn.active {
            background-color: #e0e8ff;
            color: var(--dislike-color);
        }
        
        @media (max-width: 768px) {
            .popular-restaurants-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);

    // ===== 로컬 스토리지 데이터 초기화 함수 추가 =====
    window.resetLocalStorage = function() {
        if (confirm('모든 맛집 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.removeItem('restaurants');
            localStorage.removeItem(`userInteractions_${CURRENT_USER_ID}`);
            
            restaurants = [...restaurantsData]; // 초기 데이터로 복원
            userInteractions = {
                likedRestaurants: [],
                starredRestaurants: [],
                dislikedRestaurants: []
            };
            
            saveRestaurantsToStorage(); // 초기 데이터 저장
            saveUserInteractions(); // 사용자 상호작용 데이터 저장
            
            refreshRestaurantsList(); // 목록 새로고침
            addPopularRestaurantsSection(); // 인기 맛집 섹션 업데이트
            
            alert('맛집 데이터가 초기화되었습니다.');
            
            // 상세 페이지가 열려있다면 목록으로 돌아가기
            if (!restaurantDetail.classList.contains('hidden')) {
                restaurantDetail.classList.add('hidden');
                restaurantsListSection.classList.remove('hidden');
                selectedRestaurant = null;
                
                // URL 업데이트 - 목록 페이지로 돌아감을 표시
                updateURL(null);
            }
        }
    };

    // 페이지 로드 시 popstate 이벤트 리스너 추가
    // 뒤로가기/앞으로가기 시 URL 파라미터에 따라 상태 복원
    window.addEventListener('popstate', function(event) {
        checkURLAndShowRestaurant();
    });

    // 초기 맛집 목록 로드 및 인기 맛집 섹션 추가
    refreshRestaurantsList();
    addPopularRestaurantsSection();
    
    // URL 파라미터 확인하여 맛집 상세 정보 표시
    checkURLAndShowRestaurant();
});
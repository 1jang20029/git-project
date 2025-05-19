document.addEventListener('DOMContentLoaded', function() {
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false // 시스템 기본 데이터
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false
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
            userLiked: false,
            userStarred: false,
            userDisliked: false,
            userCreated: false
        }
    ];

    // ===== 로컬 스토리지 관련 함수 =====
    // 로컬 스토리지에서 맛집 데이터 불러오기
    const loadRestaurantsFromStorage = function() {
        const storedData = localStorage.getItem('restaurants');
        if (storedData) {
            return JSON.parse(storedData);
        }
        return restaurantsData; // 저장된 데이터가 없으면 초기 데이터 반환
    };

    // 로컬 스토리지에 맛집 데이터 저장하기
    const saveRestaurantsToStorage = function() {
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
    };

    // ===== 전역 상태 =====
    let restaurants = loadRestaurantsFromStorage();
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
    document.getElementById('floating-add-btn').addEventListener('click', toggleAddRestaurantModal);
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
                
                // 로컬 스토리지에 저장
                saveRestaurantsToStorage();
                
                alert('맛집 정보가 수정되었습니다!');
                
                // 상세 페이지가 표시 중이고, 현재 수정된 맛집을 보고 있다면 정보 업데이트
                if (selectedRestaurant && selectedRestaurant.id === editingRestaurantId) {
                    selectedRestaurant = restaurants[restaurantIndex];
                    updateRestaurantDetail(selectedRestaurant);
                }
            }
        } else {
            // 새 맛집 추가 모드
            const newId = Math.max(...restaurants.map(r => r.id)) + 1;
            
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
                userLiked: false,
                userStarred: false,
                userDisliked: false,
                userCreated: true // 사용자가 생성한 맛집임을 표시
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
        
        // 수정/삭제 버튼 표시 여부 설정
        const adminButtons = document.querySelector('.detail-admin-buttons');
        if (adminButtons) {
            adminButtons.style.display = restaurant.userCreated ? 'flex' : 'none';
        }
        
        // 이미지 업데이트
        updateDetailImage();
    };

    // ===== 맛집 목록에서 상세 페이지로 이동 =====
    const showRestaurantDetail = function(restaurantId) {
        selectedRestaurant = restaurants.find(r => r.id === restaurantId);
        currentImageIndex = 0;
        
        if (selectedRestaurant) {
            // 상세 정보 업데이트
            updateRestaurantDetail(selectedRestaurant);
            
            // 갤러리 컨트롤 업데이트
            const galleryControls = document.querySelector('.gallery-controls');
            galleryControls.style.display = selectedRestaurant.images.length > 1 ? 'flex' : 'none';
            
            // 화면 전환
            restaurantsListSection.classList.add('hidden');
            restaurantDetail.classList.remove('hidden');
            
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
    });

    // ===== 갤러리 네비게이션 =====
    document.getElementById('prev-image').addEventListener('click', function() {
        if (selectedRestaurant && selectedRestaurant.images.length > 1) {
            currentImageIndex = (currentImageIndex - 1 + selectedRestaurant.images.length) % selectedRestaurant.images.length;
            updateDetailImage();
        }
    });

    document.getElementById('next-image').addEventListener('click', function() {
        if (selectedRestaurant && selectedRestaurant.images.length > 1) {
            currentImageIndex = (currentImageIndex + 1) % selectedRestaurant.images.length;
            updateDetailImage();
        }
    });

    // ===== 상세 페이지 수정/삭제 버튼 이벤트 =====
    // 이벤트 위임을 사용하여 동적으로 추가되는 버튼에 이벤트 핸들러 연결
    document.addEventListener('click', function(e) {
        // 수정 버튼 클릭
        if (e.target && (e.target.id === 'edit-restaurant-btn' || e.target.closest('#edit-restaurant-btn'))) {
            if (selectedRestaurant && selectedRestaurant.userCreated) {
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
            }
        }
        
        // 삭제 버튼 클릭
        if (e.target && (e.target.id === 'delete-restaurant-btn' || e.target.closest('#delete-restaurant-btn'))) {
            if (selectedRestaurant && selectedRestaurant.userCreated) {
                if (confirm(`'${selectedRestaurant.name}' 맛집을 정말 삭제하시겠습니까?`)) {
                    // 배열에서 해당 맛집 제거
                    const index = restaurants.findIndex(r => r.id === selectedRestaurant.id);
                    if (index !== -1) {
                        restaurants.splice(index, 1);
                        
                        // 로컬 스토리지에 저장
                        saveRestaurantsToStorage();
                        
                        // 알림 표시
                        alert('맛집이 삭제되었습니다.');
                        
                        // 목록으로 돌아가기
                        restaurantDetail.classList.add('hidden');
                        restaurantsListSection.classList.remove('hidden');
                        selectedRestaurant = null;
                        
                        // 맛집 목록 새로고침
                        refreshRestaurantsList();
                    }
                }
            }
        }
    });

    // ===== 상세 페이지 반응 버튼 - 토글 기능 추가 =====
    document.getElementById('detail-like-btn').addEventListener('click', function() {
        if (selectedRestaurant) {
            // 토글 기능 구현
            if (selectedRestaurant.userLiked) {
                // 이미 좋아요를 누른 상태에서 다시 클릭한 경우
                selectedRestaurant.likes--;
                selectedRestaurant.userLiked = false;
            } else {
                // 처음 좋아요를 누른 경우
                selectedRestaurant.likes++;
                selectedRestaurant.userLiked = true;
            }
            
            document.getElementById('detail-likes').textContent = selectedRestaurant.likes;
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            // 목록에 있는 해당 맛집의 좋아요 수도 업데이트
            updateRestaurantInList(selectedRestaurant.id);
        }
    });

    document.getElementById('detail-star-btn').addEventListener('click', function() {
        if (selectedRestaurant) {
            // 토글 기능 구현
            if (selectedRestaurant.userStarred) {
                // 이미 별점을 준 상태에서 다시 클릭한 경우
                selectedRestaurant.stars--;
                selectedRestaurant.userStarred = false;
            } else {
                // 처음 별점을 주는 경우
                selectedRestaurant.stars++;
                selectedRestaurant.userStarred = true;
            }
            
            document.getElementById('detail-stars').textContent = selectedRestaurant.stars;
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            // 목록에 있는 해당 맛집의 별점 수도 업데이트
            updateRestaurantInList(selectedRestaurant.id);
        }
    });

    document.getElementById('detail-dislike-btn').addEventListener('click', function() {
        if (selectedRestaurant) {
            // 토글 기능 구현
            if (selectedRestaurant.userDisliked) {
                // 이미 싫어요를 누른 상태에서 다시 클릭한 경우
                selectedRestaurant.dislikes--;
                selectedRestaurant.userDisliked = false;
            } else {
                // 처음 싫어요를 누른 경우
                selectedRestaurant.dislikes++;
                selectedRestaurant.userDisliked = true;
            }
            
            document.getElementById('detail-dislikes').textContent = selectedRestaurant.dislikes;
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            // 목록에 있는 해당 맛집의 싫어요 수도 업데이트
            updateRestaurantInList(selectedRestaurant.id);
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
        
        // userCreated 맛집에 특별한 클래스 추가
        if (restaurant.userCreated) {
            card.classList.add('user-created');
        }
        
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${restaurant.images[0]}" alt="${restaurant.name}" loading="lazy">
                <div class="card-category">${restaurant.category}</div>
                ${restaurant.images.length > 1 ? `<div class="card-image-count">1 / ${restaurant.images.length}</div>` : ''}
                ${restaurant.userCreated ? '<div class="user-created-badge">내가 등록</div>' : ''}
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
                    <button class="card-action-btn like-btn" title="좋아요">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button class="card-action-btn star-btn" title="추천해요">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="card-action-btn dislike-btn" title="별로예요">
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
        
        likeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 토글 기능 구현
            if (restaurant.userLiked) {
                restaurant.likes--;
                restaurant.userLiked = false;
            } else {
                restaurant.likes++;
                restaurant.userLiked = true;
            }
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            updateRestaurantInList(restaurant.id);
        });
        
        starButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 토글 기능 구현
            if (restaurant.userStarred) {
                restaurant.stars--;
                restaurant.userStarred = false;
            } else {
                restaurant.stars++;
                restaurant.userStarred = true;
            }
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            updateRestaurantInList(restaurant.id);
        });
        
        dislikeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 토글 기능 구현
            if (restaurant.userDisliked) {
                restaurant.dislikes--;
                restaurant.userDisliked = false;
            } else {
                restaurant.dislikes++;
                restaurant.userDisliked = true;
            }
            
            // 로컬 스토리지에 저장
            saveRestaurantsToStorage();
            
            updateRestaurantInList(restaurant.id);
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
    
    // 새로 추가한 CSS 스타일을 동적으로 추가
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
    `;
    document.head.appendChild(style);

    // ===== 로컬 스토리지 데이터 초기화 함수 추가 =====
    window.resetLocalStorage = function() {
        if (confirm('모든 맛집 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.removeItem('restaurants');
            restaurants = [...restaurantsData]; // 초기 데이터로 복원
            saveRestaurantsToStorage(); // 초기 데이터 저장
            refreshRestaurantsList(); // 목록 새로고침
            alert('맛집 데이터가 초기화되었습니다.');
            
            // 상세 페이지가 열려있다면 목록으로 돌아가기
            if (!restaurantDetail.classList.contains('hidden')) {
                restaurantDetail.classList.add('hidden');
                restaurantsListSection.classList.remove('hidden');
                selectedRestaurant = null;
            }
        }
    };

    // 초기 맛집 목록 로드
    refreshRestaurantsList();
});
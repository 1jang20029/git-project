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
            userDisliked: false
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
            userDisliked: false
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
            userDisliked: false
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
                'imgaes/gaesma-eulPrice.jpg'
            ],
            userLiked: false,
            userStarred: false,
            userDisliked: false
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
            userDisliked: false
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
                'myeong-gadonkkaseu.jpg'
            ],
            userLiked: false,
            userStarred: false,
            userDisliked: false
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
            userDisliked: false
        }
    ];

    // ===== 전역 상태 =====
    let restaurants = [...restaurantsData];
    let currentCategory = '전체';
    let currentPage = 0;
    let restaurantsPerPage = window.innerWidth < 768 ? 2 : 3;
    let selectedRestaurant = null;
    let currentImageIndex = 0;
    let theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

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
    };

    document.getElementById('add-place-btn').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('mobile-add-btn').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('floating-add-btn').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('close-modal').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('cancel-add').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('submit-add').addEventListener('click', function() {
        // 데모 용 - 실제로는 DB에 저장하는 로직이 들어갑니다
        alert('맛집 등록이 완료되었습니다!');
        toggleAddRestaurantModal();
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
        
        // 최대 5개 파일로 제한
        const maxFiles = 5;
        const filesToProcess = Array.from(files).slice(0, maxFiles);
        
        filesToProcess.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="미리보기 이미지 ${index + 1}">
                        <div class="remove-preview" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </div>
                    `;
                    imagePreviews.appendChild(preview);
                    
                    preview.querySelector('.remove-preview').addEventListener('click', function() {
                        preview.remove();
                        
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

    // ===== 맛집 목록에서 상세 페이지로 이동 =====
    const showRestaurantDetail = function(restaurantId) {
        selectedRestaurant = restaurants.find(r => r.id === restaurantId);
        currentImageIndex = 0;
        
        if (selectedRestaurant) {
            // 상세 정보 업데이트
            document.getElementById('detail-name').textContent = selectedRestaurant.name;
            document.getElementById('detail-category-badge').textContent = selectedRestaurant.category;
            document.getElementById('detail-location').textContent = selectedRestaurant.location;
            document.getElementById('detail-hours').textContent = selectedRestaurant.hours;
            document.getElementById('detail-menu').textContent = selectedRestaurant.menu;
            document.getElementById('detail-features').textContent = selectedRestaurant.features;
            document.getElementById('detail-likes').textContent = selectedRestaurant.likes;
            document.getElementById('detail-stars').textContent = selectedRestaurant.stars;
            document.getElementById('detail-dislikes').textContent = selectedRestaurant.dislikes;
            
            // 이미지 업데이트
            updateDetailImage();
            
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
        
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${restaurant.images[0]}" alt="${restaurant.name}" loading="lazy">
                <div class="card-category">${restaurant.category}</div>
                ${restaurant.images.length > 1 ? `<div class="card-image-count">1 / ${restaurant.images.length}</div>` : ''}
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

    // 초기 맛집 목록 로드
    refreshRestaurantsList();
});
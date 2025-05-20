document.addEventListener('DOMContentLoaded', function() {
    // 파란색 원형 '3' 버튼 제거 (floating-add-btn)
    const floatingButton = document.getElementById('floating-add-btn');
    if (floatingButton) {
        floatingButton.remove();
        console.log('파란색 원형 3 버튼이 제거되었습니다.');
    }
    
    // 네이버 지도 관련 변수
    let naverMap = null;
    let currentMarker = null;
    // 연성대학교 좌표로 중심점 설정
    let defaultCenter = new naver.maps.LatLng(37.39746246553631, 126.90925361473495);
    // 걸어서 왕복 500m 거리로 변경
    const walkingRadius = 500; // 미터 단위로 500m로 수정
    let walkingCircle = null;
    
    // 범위 내 음식점들을 표시할 마커들
    let restaurantMarkers = [];
    // 현재 선택된 카테고리 (지도 필터링용)
    let mapCurrentCategory = '전체';

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
            latitude: 37.3967, // 좌표 추가
            longitude: 126.9077, // 좌표 추가
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
            latitude: 37.3978, // 좌표 추가
            longitude: 126.9088, // 좌표 추가
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
            latitude: 37.3985, // 좌표 추가
            longitude: 126.9101, // 좌표 추가
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
            latitude: 37.3971, // 좌표 추가
            longitude: 126.9095, // 좌표 추가
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
            latitude: 37.4011, // 좌표 추가
            longitude: 126.9170, // 좌표 추가
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
            latitude: 37.4002, // 좌표 추가
            longitude: 126.9143, // 좌표 추가
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
            latitude: 37.4005, // 좌표 추가
            longitude: 126.9160, // 좌표 추가
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
            
            // 좌표 데이터가 없다면 기본값 설정
            if (!restaurant.latitude) restaurant.latitude = 37.3975; // 연성대 기본 좌표
            if (!restaurant.longitude) restaurant.longitude = 126.9093; // 연성대 기본 좌표
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
    const mapFilterButtons = document.querySelectorAll('.map-filter-btn');
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
    
    // 두 지점 간의 거리 계산 함수 (하버사인 공식)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // 지구 반지름 (미터)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance; // 미터 단위
    }
    
    // 범위 내 음식점 찾기 함수
    function findRestaurantsInRadius(centerLat, centerLng, radius, category = '전체') {
        return restaurants.filter(restaurant => {
            const distance = calculateDistance(
                centerLat, centerLng, 
                restaurant.latitude, restaurant.longitude
            );
            // 카테고리 필터링 추가
            return distance <= radius && 
                (category === '전체' || restaurant.category === category);
        });
    }
    
    // 범위 내 음식점 마커 표시 함수
    function showRestaurantsInRadius() {
        // 기존 마커 제거
        clearRestaurantMarkers();
        
        // 범위 내 음식점 찾기 (카테고리 필터링 추가)
        const restaurantsInRadius = findRestaurantsInRadius(
            defaultCenter.lat(), defaultCenter.lng(), walkingRadius, mapCurrentCategory
        );
        
        // 음식점 마커 추가
        restaurantsInRadius.forEach(restaurant => {
            const position = new naver.maps.LatLng(restaurant.latitude, restaurant.longitude);
            
            // 카테고리별 아이콘 색상 지정
            let iconColor = '#e94057'; // 기본 색상
            switch(restaurant.category) {
                case '한식': iconColor = '#e94057'; break;
                case '중식': iconColor = '#ff9500'; break;
                case '일식': iconColor = '#8a2be2'; break;
                case '양식': iconColor = '#22cc88'; break;
                case '분식': iconColor = '#ff6b6b'; break;
                case '카페': iconColor = '#795548'; break;
                case '술집': iconColor = '#607d8b'; break;
            }
            
            const marker = new naver.maps.Marker({
                position: position,
                map: naverMap,
                title: restaurant.name,
                icon: {
                    content: `<div class="restaurant-marker" style="border-color: ${iconColor}">
                        <div class="restaurant-marker-name">${restaurant.name}</div>
                        <div class="restaurant-marker-category">${restaurant.category}</div>
                    </div>`,
                    anchor: new naver.maps.Point(15, 30)
                }
            });
            
            // 마커 클릭 이벤트 - 상세 정보 보기
            naver.maps.Event.addListener(marker, 'click', function() {
                showRestaurantDetail(restaurant.id);
                toggleAddRestaurantModal(); // 모달 닫기
            });
            
            restaurantMarkers.push(marker);
        });
        
        return restaurantsInRadius;
    }
    
    // 음식점 마커 모두 제거 함수
    function clearRestaurantMarkers() {
        restaurantMarkers.forEach(marker => {
            marker.setMap(null);
        });
        restaurantMarkers = [];
    }
    
    // 지도 초기화 함수 (맛집 등록 모달에서 제거)
    function initializeMap() {
        if (document.getElementById('campus-map')) {
            naverMap = new naver.maps.Map('campus-map', {
                center: defaultCenter,
                zoom: 15,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT
                }
            });
            
            // 연성대학교 위치 마커 (중심점)
            const universityMarker = new naver.maps.Marker({
                position: defaultCenter,
                map: naverMap,
                icon: {
                    content: `<div class="university-marker">
                        <div class="university-marker-name">연성대학교</div>
                        <i class="fas fa-university marker-icon-university"></i>
                    </div>`,
                    anchor: new naver.maps.Point(15, 30)
                }
            });
            
            // 걸어서 왕복 500m 거리 원 표시
            walkingCircle = new naver.maps.Circle({
                map: naverMap,
                center: defaultCenter,
                radius: walkingRadius,
                strokeColor: '#5347AA',
                strokeOpacity: 0.6,
                strokeWeight: 2,
                fillColor: '#5347AA',
                fillOpacity: 0.1
            });
            
            // 범위 내 음식점 표시
            const restaurantsInRadius = showRestaurantsInRadius();
            console.log(`${restaurantsInRadius.length}개의 음식점이 연성대학교에서 ${walkingRadius/1000}km 거리 내에 있습니다.`);
        }
    }

    // 마커 위치 설정 함수 (맛집 등록에서는 사용하지 않음)
    function setMarkerPosition(position) {
        // 숨겨진 필드에 좌표 값 저장
        if (document.getElementById('restaurant-latitude')) {
            document.getElementById('restaurant-latitude').value = position.y;
        }
        if (document.getElementById('restaurant-longitude')) {
            document.getElementById('restaurant-longitude').value = position.x;
        }
        
        // 주소 가져오기
        naver.maps.Service.reverseGeocode({
            location: new naver.maps.LatLng(position.y, position.x),
        }, function(status, response) {
            let address = '알 수 없는 주소';
            
            if (status === naver.maps.Service.Status.OK) {
                const result = response.result;
                const items = result.items;
                address = items[0].address;
            }
            
            // 입력 필드에 주소 표시
            if (document.getElementById('restaurant-location')) {
                document.getElementById('restaurant-location').value = address;
            }
            
            // 연성대학교로부터의 거리 계산
            const distance = calculateDistance(
                defaultCenter.lat(), defaultCenter.lng(),
                position.y, position.x
            );
            
            // 범위 내인지 확인하여 알림
            if (distance > walkingRadius) {
                alert(`선택한 위치는 연성대학교로부터 ${(distance/1000).toFixed(2)}km 떨어져 있어, ${(walkingRadius/1000).toFixed(2)}km 거리를 벗어납니다.`);
            } else {
                console.log(`선택한 위치는 연성대학교로부터 ${(distance/1000).toFixed(2)}km 떨어져 있습니다.`);
            }
        });
    }

    // 위치 검색 함수 (맛집 등록에서는 사용하지 않음)
    function searchLocation() {
        const address = document.getElementById('restaurant-location').value;
        if (!address) return;
        
        // 기본 좌표 사용
        const defaultLat = 37.39746246553631;
        const defaultLng = 126.90925361473495;
        
        // 맛집 등록 시 기본 좌표 설정
        if (document.getElementById('restaurant-latitude')) {
            document.getElementById('restaurant-latitude').value = defaultLat;
        }
        if (document.getElementById('restaurant-longitude')) {
            document.getElementById('restaurant-longitude').value = defaultLng;
        }
    }

    // 인기 맛집 섹션 추가 (메인 페이지에 추가) - 이 부분은 유지
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
        
        // 좌표 초기화 - 연성대학교 기본 좌표로 설정
        if (document.getElementById('restaurant-latitude')) {
            document.getElementById('restaurant-latitude').value = defaultCenter.lat();
        }
        if (document.getElementById('restaurant-longitude')) {
            document.getElementById('restaurant-longitude').value = defaultCenter.lng();
        }
    };

    document.getElementById('add-place-btn').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('mobile-add-btn').addEventListener('click', toggleAddRestaurantModal);
    // floating-add-btn 이벤트 리스너는 제거했지만 다른 버튼들의 기능은 유지합니다
    document.getElementById('close-modal').addEventListener('click', toggleAddRestaurantModal);
    document.getElementById('cancel-add').addEventListener('click', toggleAddRestaurantModal);
    
    // 위치 검색 버튼 이벤트 리스너 (맛집 등록에서는 사용하지 않음)
    if (document.getElementById('search-location-btn')) {
        document.getElementById('search-location-btn').addEventListener('click', function(e) {
            e.preventDefault();
            searchLocation();
        });
    }

    // 위치 입력 필드에서 엔터키 눌렀을 때 검색 (맛집 등록에서는 사용하지 않음)
    if (document.getElementById('restaurant-location')) {
        document.getElementById('restaurant-location').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation();
            }
        });
    }
    
    // ===== 맛집 등록/수정 버튼 이벤트 =====
    document.getElementById('submit-add').addEventListener('click', function() {
        // 폼에서 데이터 가져오기
        const restaurantName = document.getElementById('restaurant-name').value;
        const restaurantCategory = document.getElementById('restaurant-category').value;
        const restaurantLocation = document.getElementById('restaurant-location').value;
        const restaurantHours = document.getElementById('restaurant-hours').value;
        const restaurantMenu = document.getElementById('restaurant-menu').value;
        const restaurantFeatures = document.getElementById('restaurant-features').value;
        
        // 좌표는 기본값으로 연성대학교 좌표 사용
        const restaurantLatitude = defaultCenter.lat(); 
        const restaurantLongitude = defaultCenter.lng();
        
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
                restaurants[restaurantIndex].latitude = parseFloat(restaurantLatitude);
                restaurants[restaurantIndex].longitude = parseFloat(restaurantLongitude);
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
                latitude: parseFloat(restaurantLatitude),
                longitude: parseFloat(restaurantLongitude),
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
        
        // 범위 내 음식점 마커 업데이트
        if (naverMap) {
            showRestaurantsInRadius();
        }
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
    
    // ===== 지도 카테고리 필터링 =====
    mapFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            mapCurrentCategory = this.dataset.category;
            
            // 활성화된 버튼 스타일 변경
            mapFilterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 지도의 음식점 마커 새로고침
            showRestaurantsInRadius();
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
                        
                        // 맛집 목록 새로고침
                        refreshRestaurantsList();
                        
                        // 인기 맛집 섹션 업데이트
                        addPopularRestaurantsSection();
                        
                        // 범위 내 음식점 마커 업데이트
                        if (naverMap) {
                            showRestaurantsInRadius();
                        }
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
        
        // 연성대학교로부터의 거리 계산
        const distance = calculateDistance(
            defaultCenter.lat(), defaultCenter.lng(),
            restaurant.latitude, restaurant.longitude
        );
        const distanceText = (distance < 1000) ? 
            `학교에서 ${Math.round(distance)}m` : 
            `학교에서 ${(distance/1000).toFixed(1)}km`;
        
        // 500m 내 여부
        const isWithinRange = distance <= walkingRadius;
        const rangeClass = isWithinRange ? 'in-range' : 'out-of-range';
        const rangeText = isWithinRange ? 
            '500m 이내' : 
            '500m 초과';
        
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${restaurant.images[0]}" alt="${restaurant.name}" loading="lazy">
                <div class="card-category">${restaurant.category}</div>
                ${restaurant.images.length > 1 ? `<div class="card-image-count">1 / ${restaurant.images.length}</div>` : ''}
                ${isCreator ? '<div class="user-created-badge">등록</div>' : ''}
                <div class="distance-badge ${rangeClass}">${distanceText}</div>
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
                <div class="range-info ${rangeClass}">
                    <i class="fas fa-walking"></i> ${rangeText}
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
        
        /* 맛집 마커 스타일 */
        .restaurant-marker {
            padding: 6px 10px;
            background-color: white;
            border-radius: 4px;
            border: 2px solid #e94057;
            color: #333;
            font-weight: 500;
            font-size: 12px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            white-space: nowrap;
            position: relative;
        }
        
        .restaurant-marker:after {
            content: '';
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid white;
        }
        
        .restaurant-marker-name {
            font-size: 12px;
            margin-bottom: 3px;
        }
        
        .restaurant-marker-category {
            font-size: 10px;
            color: #777;
        }
        
        .marker-icon {
            color: #e94057;
            margin-right: 3px;
        }
        
        /* 연성대학교 마커 스타일 */
        .university-marker {
            padding: 6px 10px;
            background-color: white;
            border-radius: 4px;
            border: 2px solid #3d5af1;
            color: #333;
            font-weight: 500;
            font-size: 12px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            white-space: nowrap;
            position: relative;
        }
        
        .university-marker:after {
            content: '';
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid white;
        }
        
        .university-marker-name {
            font-size: 12px;
            margin-bottom: 3px;
        }
        
        .marker-icon-university {
            color: #3d5af1;
            margin-right: 3px;
        }
        
        /* 거리 및 범위 정보 스타일 */
        .distance-badge {
            position: absolute;
            bottom: 15px;
            left: 15px;
            padding: 4px 8px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 50px;
            font-size: 0.75rem;
        }
        
        .range-info {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.85rem;
            margin-bottom: 10px;
        }
        
        .in-range {
            color: #22cc88;
        }
        
        .out-of-range {
            color: #e94057;
        }
        
        /* 맛집 등록 모달에서 지도 관련 요소 숨김 */
        #map-container, #naver-map, .map-instructions, .location-input-container button {
            display: none !important;
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
            }
            
            // 범위 내 음식점 마커 업데이트
            if (naverMap) {
                showRestaurantsInRadius();
            }
        }
    };

    // 지도에서 카테고리 선택에 따른 맛집 필터링 기능 추가
    if (document.getElementById('campus-map-panel')) {
        // 캠퍼스 지도 패널 토글 기능
        const toggleCampusMapPanel = function() {
            const campusMapPanel = document.getElementById('campus-map-panel');
            campusMapPanel.classList.toggle('hidden');
            mobileMenu.style.display = 'none';
            
            // 패널이 열릴 때 캠퍼스 지도 초기화
            if (!campusMapPanel.classList.contains('hidden')) {
                // 약간의 지연을 주어 패널이 완전히 표시된 후 지도 초기화
                setTimeout(() => {
                    if (document.getElementById('campus-map')) {
                        naverMap = new naver.maps.Map('campus-map', {
                            center: defaultCenter,
                            zoom: 15,
                            zoomControl: true,
                            zoomControlOptions: {
                                position: naver.maps.Position.TOP_RIGHT
                            }
                        });
                        
                        // 연성대학교 위치 마커 (중심점)
                        const universityMarker = new naver.maps.Marker({
                            position: defaultCenter,
                            map: naverMap,
                            icon: {
                                content: `<div class="university-marker">
                                    <div class="university-marker-name">연성대학교</div>
                                    <i class="fas fa-university marker-icon-university"></i>
                                </div>`,
                                anchor: new naver.maps.Point(15, 30)
                            }
                        });
                        
                        // 걸어서 500m 범위 원 표시
                        walkingCircle = new naver.maps.Circle({
                            map: naverMap,
                            center: defaultCenter,
                            radius: walkingRadius,
                            strokeColor: '#5347AA',
                            strokeOpacity: 0.6,
                            strokeWeight: 2,
                            fillColor: '#5347AA',
                            fillOpacity: 0.1
                        });
                        
                        // 범위 내 음식점 표시
                        showRestaurantsInRadius();
                    }
                }, 300);
            }
        };
        
        // 캠퍼스 지도 버튼 이벤트 리스너
        document.getElementById('show-campus-map-btn').addEventListener('click', toggleCampusMapPanel);
        document.getElementById('mobile-campus-map-btn').addEventListener('click', toggleCampusMapPanel);
        document.getElementById('close-campus-map').addEventListener('click', toggleCampusMapPanel);
        
        // 지도 카테고리 필터 버튼 이벤트 리스너
        const mapFilterButtons = document.querySelectorAll('.map-filter-btn');
        mapFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                mapCurrentCategory = this.dataset.category;
                
                // 활성화된 버튼 스타일 변경
                mapFilterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 지도의 음식점 마커 새로고침
                showRestaurantsInRadius();
            });
        });
    }
    
    // 지도 기능 초기화
    initializeMap();

    // 초기 맛집 목록 로드 및 인기 맛집 섹션 추가
    refreshRestaurantsList();
    addPopularRestaurantsSection();
});
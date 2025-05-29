// 건물 데이터 (배열로 정의) - 이미지에서 확인된 건물 이름으로 수정
const buildingData = [
    {
        id: '공학1관',
        name: '공학1관',
        description: '공학계열 강의실, 실험실',
        image: 'https://placehold.co/80x60/gray/white?text=공학1관',
        type: 'building',
        position: { lat: 37.39632767479923, lng: 126.90699348692698 }
    },
    {
        id: '자연과학관',
        name: '자연과학관',
        description: '반려동물보건학, 반려동물산업학',
        image: 'https://placehold.co/80x60/gray/white?text=자연과학관',
        type: 'building',
        position: { lat:  37.39669466288283, lng: 126.90676716508685 }
    },
    {
        id: '식품과학관',
        name: '식품과학관',
        description: '식품영양학과, 조리실습실',
        image: 'https://placehold.co/80x60/gray/white?text=식품과학관',
        type: 'building',
        position: { lat: 37.39714809720343, lng: 126.90762208499473 }
    },
    {
        id: '도의관',
        name: '도의관',
        description: '교양 수업, 강당',
        image: 'https://placehold.co/80x60/gray/white?text=도의관',
        type: 'building',
        position: { lat: 37.39679932128769, lng: 126.90809683728425 }
    },
    {
        id: '공학2관',
        name: '공학2관',
        description: '공학계열 실습실, 연구실',
        image: 'https://placehold.co/80x60/gray/white?text=공학2관',
        type: 'building',
        position: { lat: 37.396789747114205, lng: 126.90737406929797 }
    },
    {
        id: '문화1관',
        name: '문화1관',
        description: '인문사회계열 강의실',
        image: 'https://placehold.co/80x60/gray/white?text=문화1관',
        type: 'building',
        position: { lat:  37.39576992475254, lng: 126.90812350405056 }
    },
    {
        id: '연곡문화센터',
        name: '연곡문화센터',
        description: '기숙사, 컨벤션홀, 평생교육원',
        image: 'https://placehold.co/80x60/gray/white?text=연곡문화센터',
        type: 'building',
        position: { lat: 37.398046192024914, lng: 126.90966512810492 }
    },
    {
        id: '창조관',
        name: '창조관',
        description: '학과 사무실, 강의실',
        image: 'https://placehold.co/80x60/gray/white?text=창조관',
        type: 'building',
    position: { lat: 37.39730791148064, lng: 126.91039726900274 }
    },
    {
    id: '운동장',
    name: '운동장',
    description: '체육활동, 행사장',
    image: 'https://placehold.co/80x60/gray/white?text=운동장',
    type: 'building',
    position: { lat: 37.39673944839101, lng: 126.90932224700094 }
    },
    {
    id: '농구장',
    name: '농구장',
    description: '체육활동',
    image: 'https://placehold.co/80x60/gray/white?text=농구장',
    type: 'building',
    position: { lat: 37.39667684947615, lng: 126.90994063692402 }
    },
    {
    id: '학생복지센터',
    name: '학생복지센터',
    description: '학생지원 시설',
    image: 'https://placehold.co/80x60/gray/white?text=학생복지센터',
    type: 'building',
    position: { lat:  37.3962916630711, lng: 126.90994109780426 }
    },
    {
    id: '창의교육센터',
    name: '창의교육센터',
    description: '항공서비스과 항공실습실, 카페',
    image: 'https://placehold.co/80x60/gray/white?text=창의교육센터',
    type: 'building',
    position: { lat:  37.39737971014044, lng: 126.91002449732869 }
    },
    {
    id: '문화2관',
    name: '문화2관',
    description: ' 문화콘텐츠계열 강의실',
    image: 'https://placehold.co/80x60/gray/white?text=문화2관',
    type: 'building',
    position: { lat:  37.396035307891026, lng: 126.90758674745014 }
    },
    {
    id: '대학본관',
    name: '대학본관',
    description: '유통물류학과, 총장실',
    image: 'https://placehold.co/80x60/gray/white?text=대학본관',
    type: 'building',
    position: { lat:  37.397467068076345, lng: 126.90938066144557 }
    },
    {
    id: '학술정보관',
    name: '학술정보관',
    description: '독서실',
    image: 'https://placehold.co/80x60/gray/white?text=학술정보관',
    type: 'building',
    position: { lat:  37.39637467129301, lng: 126.906603807587 }
    }
    ];

    // 편의시설 데이터 정의
    const facilityData = [
    {
    id: 'cafeteria',
    name: '학생식당',
    description: '학생복지센터 2층',
    image: 'https://placehold.co/150x100/gray/white?text=학생식당',
    type: 'facility',
    position: { lat: 37.377100, lng: 126.663600 },
    relatedBuilding: '학생복지센터'
    },
    {
    id: 'cafe',
    name: '카페 연성',
    description: '문화1관 1층',
    image: 'https://placehold.co/150x100/gray/white?text=카페',
    type: 'facility',
    position: { lat: 37.378300, lng: 126.662700 },
    relatedBuilding: '문화1관'
    },
    {
    id: 'convenience',
    name: 'CU 편의점',
    description: '학생복지센터 1층',
    image: 'https://placehold.co/150x100/gray/white?text=편의점',
    type: 'facility',
    position: { lat: 37.377100, lng: 126.663700 },
    relatedBuilding: '학생복지센터'
    },
    {
    id: 'atm',
    name: 'ATM',
    description: '학생복지센터 1층',
    image: 'https://placehold.co/150x100/gray/white?text=ATM',
    type: 'facility',
    position: { lat: 37.377100, lng: 126.663800 },
    relatedBuilding: '학생복지센터'
    },

];

// 2025학년도 연성대학교 학사일정 데이터
const academicScheduleData = {
    '1': [ // 1학기
        // 12-1월 겨울방학 기간
        {
            id: 1,
            title: '성적열람 및 이의신청기간',
            date: '2024-12-30',
            endDate: '2025-01-03',
            type: 'academic',
            description: '전기 성적열람 및 이의신청 기간',
            important: false
        },
        {
            id: 2,
            title: '신정',
            date: '2025-01-01',
            type: 'holiday',
            description: '신정 공휴일 (휴강)',
            important: false
        },
        {
            id: 3,
            title: '업무개시일',
            date: '2025-01-02',
            type: 'academic',
            description: '2025년 업무 시작',
            important: false
        },
        {
            id: 4,
            title: '시무식',
            date: '2025-01-03',
            type: 'event',
            description: '새해 시무식',
            important: false
        },
        {
            id: 5,
            title: '동계 계절학기',
            date: '2025-01-06',
            endDate: '2025-01-17',
            type: 'academic',
            description: '겨울학기 집중강의',
            important: false
        },
        {
            id: 6,
            title: '2학기 성적확정',
            date: '2025-01-07',
            type: 'academic',
            description: '전기 성적 최종 확정',
            important: false
        },
        {
            id: 7,
            title: '전기 졸업유예 접수기간',
            date: '2025-01-08',
            endDate: '2025-01-15',
            type: 'academic',
            description: '졸업유예 신청 기간',
            important: false
        },
        {
            id: 8,
            title: '교직원세미나',
            date: '2025-01-09',
            type: 'event',
            description: '교직원 연수',
            important: false
        },
        {
            id: 9,
            title: '국고사업 성과보고 및 협류 워크숍',
            date: '2025-01-10',
            type: 'event',
            description: '국고사업 성과발표',
            important: false
        },
        {
            id: 10,
            title: '동계계절학기 성적입력',
            date: '2025-01-17',
            endDate: '2025-01-20',
            type: 'academic',
            description: '동계학기 성적처리',
            important: false
        },
        {
            id: 11,
            title: '동계계절학기 성적열람 및 이의신청',
            date: '2025-01-21',
            endDate: '2025-01-22',
            type: 'academic',
            description: '동계학기 성적확인',
            important: false
        },
        {
            id: 12,
            title: '2025학년도 정시 면접/실기고사',
            date: '2025-01-22',
            endDate: '2025-01-26',
            type: 'academic',
            description: '신입생 정시모집',
            important: true
        },
        {
            id: 13,
            title: '입시공휴일',
            date: '2025-01-27',
            type: 'holiday',
            description: '입시 관련 휴무',
            important: false
        },
        {
            id: 14,
            title: '설날 연휴',
            date: '2025-01-28',
            endDate: '2025-01-30',
            type: 'holiday',
            description: '설날 연휴 (휴강)',
            important: true
        },
        // 2월 신학기 준비
        {
            id: 15,
            title: '전기진급 및 졸업사정회',
            date: '2025-02-03',
            type: 'academic',
            description: '진급 및 졸업 심사',
            important: true
        },
        {
            id: 16,
            title: '일반후학·전과·재입학 접수기간',
            date: '2025-02-03',
            endDate: '2025-02-07',
            type: 'registration',
            description: '일반후학 및 전과, 재입학 신청',
            important: false
        },
        {
            id: 17,
            title: '2025학년도 정시 합격자 발표',
            date: '2025-02-06',
            type: 'academic',
            description: '정시모집 합격자 발표',
            important: true
        },
        {
            id: 18,
            title: '2025학년도 정시 합격자 등록기간',
            date: '2025-02-10',
            endDate: '2025-02-12',
            type: 'registration',
            description: '정시합격자 등록 기간',
            important: true
        },
        {
            id: 19,
            title: '복학 접수기간',
            date: '2025-02-10',
            endDate: '2025-02-14',
            type: 'registration',
            description: '복학생 등록',
            important: false
        },
        {
            id: 20,
            title: '재학생(복학생) 수강신청 기간',
            date: '2025-02-10',
            endDate: '2025-02-18',
            type: 'registration',
            description: '재학생 및 복학생 수강신청',
            important: true
        },
        {
            id: 21,
            title: '제47회 학위수여식',
            date: '2025-02-12',
            type: 'event',
            description: '졸업식',
            important: true
        },
        {
            id: 22,
            title: '1학기 재학생 등록기간',
            date: '2025-02-17',
            endDate: '2025-02-21',
            type: 'registration',
            description: '재학생 등록금 납부',
            important: true
        },
        {
            id: 23,
            title: '2025학년도 입학식',
            date: '2025-02-21',
            type: 'event',
            description: '신입생 입학식',
            important: true
        },
        // 3월 개강
        {
            id: 24,
            title: '삼일절',
            date: '2025-03-01',
            type: 'holiday',
            description: '3·1절 공휴일 (휴강)',
            important: false
        },
        {
            id: 25,
            title: '대체공휴일',
            date: '2025-03-03',
            type: 'holiday',
            description: '3·1절 대체공휴일',
            important: false
        },
        {
            id: 26,
            title: '2025학년도 1학기 개강',
            date: '2025-03-04',
            type: 'academic',
            description: '1학기 수업 시작',
            important: true
        },
        {
            id: 27,
            title: '신입생 수강신청기간',
            date: '2025-03-04',
            endDate: '2025-03-07',
            type: 'registration',
            description: '신입생 수강신청',
            important: true
        },
        {
            id: 28,
            title: '대학생활 적응력 향상 프로그램',
            date: '2025-03-10',
            endDate: '2025-03-14',
            type: 'event',
            description: '신입생 적응 프로그램',
            important: false
        },
        {
            id: 29,
            title: '개교 48주년 기념일',
            date: '2025-03-15',
            type: 'holiday',
            description: '연성대학교 개교기념일',
            important: false
        },
        {
            id: 30,
            title: '수업일수 1/4선',
            date: '2025-03-28',
            type: 'academic',
            description: '수업 진도 체크포인트',
            important: false
        },
        // 4-5월 중간고사 및 행사
        {
            id: 31,
            title: '중간고사 평가 권장기간',
            date: '2025-04-21',
            endDate: '2025-05-02',
            type: 'exam',
            description: '1학기 중간고사 기간',
            important: true
        },
        {
            id: 32,
            title: '수업일수 2/4선',
            date: '2025-04-24',
            type: 'academic',
            description: '수업 진도 체크포인트',
            important: false
        },
        {
            id: 33,
            title: '근로자의날(임시휴일)',
            date: '2025-05-01',
            type: 'holiday',
            description: '근로자의날 휴강',
            important: false
        },
        {
            id: 34,
            title: '어린이날/부처님오신날',
            date: '2025-05-05',
            type: 'holiday',
            description: '어린이날 및 부처님오신날',
            important: false
        },
        {
            id: 35,
            title: '대체공휴일',
            date: '2025-05-06',
            type: 'holiday',
            description: '어린이날 대체공휴일',
            important: false
        },
        {
            id: 36,
            title: '제49회 양지체육대회(자율보강)',
            date: '2025-05-08',
            endDate: '2025-05-09',
            type: 'event',
            description: '체육대회',
            important: true
        },
        {
            id: 37,
            title: '수업일수 3/4선',
            date: '2025-05-26',
            type: 'academic',
            description: '수업 진도 체크포인트',
            important: false
        },
        // 6월 기말고사 및 방학
        {
            id: 38,
            title: '현충일',
            date: '2025-06-06',
            type: 'holiday',
            description: '현충일 공휴일',
            important: false
        },
        {
            id: 39,
            title: '공휴일 보강기간',
            date: '2025-06-10',
            endDate: '2025-06-13',
            type: 'academic',
            description: '공휴일 보강수업',
            important: false
        },
        {
            id: 40,
            title: '기말고사 권장기간',
            date: '2025-06-16',
            endDate: '2025-06-20',
            type: 'exam',
            description: '1학기 기말고사',
            important: true
        },
        {
            id: 41,
            title: '성적입력 기간',
            date: '2025-06-17',
            endDate: '2025-06-25',
            type: 'academic',
            description: '기말고사 성적 입력',
            important: false
        },
        {
            id: 42,
            title: '수업일수 4/4선',
            date: '2025-06-20',
            type: 'academic',
            description: '수업 완료',
            important: false
        },
        {
            id: 43,
            title: '하계방학 시작',
            date: '2025-06-23',
            type: 'holiday',
            description: '여름방학 시작',
            important: true
        },
        {
            id: 44,
            title: '하계 융합학기',
            date: '2025-06-23',
            endDate: '2025-07-01',
            type: 'academic',
            description: '여름 집중강의',
            important: false
        },
        {
            id: 45,
            title: '성적열람 및 이의신청기간',
            date: '2025-06-27',
            endDate: '2025-07-02',
            type: 'academic',
            description: '1학기 성적 확인',
            important: false
        }
    ],
    'summer': [ // 여름학기
        {
            id: 101,
            title: '하계 융합학기',
            date: '2025-06-23',
            endDate: '2025-07-01',
            type: 'academic',
            description: '여름학기 집중강의',
            important: false
        },
        {
            id: 102,
            title: '성적열람 및 이의신청기간',
            date: '2025-06-27',
            endDate: '2025-07-02',
            type: 'academic',
            description: '1학기 성적확인',
            important: false
        },
        {
            id: 103,
            title: '하계 계절학기',
            date: '2025-07-03',
            endDate: '2025-07-16',
            type: 'academic',
            description: '여름 계절학기',
            important: true
        },
        {
            id: 104,
            title: '교직원세미나',
            date: '2025-07-03',
            type: 'event',
            description: '교직원 연수',
            important: false
        },
        {
            id: 105,
            title: '1학기 성적확정/국고사업 성과보고 및 협류 워크숍',
            date: '2025-07-04',
            type: 'academic',
            description: '성적 확정 및 국고사업 보고',
            important: false
        },
        {
            id: 106,
            title: '후기 졸업유예 접수기간',
            date: '2025-07-07',
            endDate: '2025-07-11',
            type: 'academic',
            description: '졸업유예 신청',
            important: false
        },
        {
            id: 107,
            title: '진로박람회',
            date: '2025-07-10',
            endDate: '2025-07-11',
            type: 'event',
            description: '취업 진로박람회',
            important: true
        },
        {
            id: 108,
            title: '하계 계절학기 성적입력',
            date: '2025-07-16',
            endDate: '2025-07-17',
            type: 'academic',
            description: '여름학기 성적처리',
            important: false
        },
        {
            id: 109,
            title: '하계 계절학기 성적열람 및 성적이의신청',
            date: '2025-07-18',
            endDate: '2025-07-21',
            type: 'academic',
            description: '여름학기 성적확인',
            important: false
        },
        {
            id: 110,
            title: '하계방학 전체 휴무',
            date: '2025-07-28',
            endDate: '2025-08-01',
            type: 'holiday',
            description: '여름방학 휴무',
            important: false
        },
        {
            id: 111,
            title: '일반후학·전과·재입학 접수기간',
            date: '2025-08-04',
            endDate: '2025-08-08',
            type: 'registration',
            description: '후학 및 전과, 재입학 신청',
            important: false
        },
        {
            id: 112,
            title: '후기 졸업사정회',
            date: '2025-08-06',
            type: 'academic',
            description: '졸업심사',
            important: false
        },
        {
            id: 113,
            title: '복학 접수기간',
            date: '2025-08-11',
            endDate: '2025-08-14',
            type: 'registration',
            description: '복학 신청',
            important: false
        },
        {
            id: 114,
            title: '재학생(복학생) 수강신청 기간',
            date: '2025-08-11',
            endDate: '2025-08-19',
            type: 'registration',
            description: '2학기 수강신청',
            important: true
        },
        {
            id: 115,
            title: '광복절',
            date: '2025-08-15',
            type: 'holiday',
            description: '광복절 공휴일',
            important: false
        },
        {
            id: 116,
            title: '2학기 재학생 등록기간',
            date: '2025-08-18',
            endDate: '2025-08-22',
            type: 'registration',
            description: '2학기 등록금 납부',
            important: true
        },
        {
            id: 117,
            title: '2024학년도 후기 학위수여',
            date: '2025-08-20',
            type: 'event',
            description: '후기 졸업식',
            important: true
        }
    ],
    '2': [ // 2학기
        {
            id: 201,
            title: '2025학년도 2학기 개강',
            date: '2025-09-01',
            type: 'academic',
            description: '2학기 수업 시작',
            important: true
        },
        {
            id: 202,
            title: '2026학년도 수시1차 원서접수기간',
            date: '2025-09-08',
            endDate: '2025-09-30',
            type: 'academic',
            description: '수시모집 접수',
            important: false
        },
        {
            id: 203,
            title: '수업일수 1/4선',
            date: '2025-09-25',
            type: 'academic',
            description: '수업 진도 체크포인트',
            important: false
        },
        {
            id: 204,
            title: '개천절',
            date: '2025-10-03',
            type: 'holiday',
            description: '개천절 공휴일',
            important: false
        },
        {
            id: 205,
            title: '추석연휴',
            date: '2025-10-05',
            endDate: '2025-10-07',
            type: 'holiday',
            description: '추석 연휴 (휴강)',
            important: true
        },
        {
            id: 206,
            title: '대체공휴일',
            date: '2025-10-08',
            type: 'holiday',
            description: '추석 대체공휴일',
            important: false
        },
        {
            id: 207,
            title: '한글날',
            date: '2025-10-09',
            type: 'holiday',
            description: '한글날 공휴일',
            important: false
        },
        {
            id: 208,
            title: '임시휴업',
            date: '2025-10-10',
            type: 'holiday',
            description: '임시휴업일',
            important: false
        },
        {
            id: 209,
            title: '제49회 양지대축제',
            date: '2025-10-16',
            endDate: '2025-10-17',
            type: 'event',
            description: '대학축제',
            important: true
        },
        {
            id: 210,
            title: '2026학년도 수시1차 면접/실기고사',
            date: '2025-10-22',
            endDate: '2025-10-26',
            type: 'academic',
            description: '수시모집 면접 및 실기고사',
            important: true
        },
        {
            id: 211,
            title: '중간고사 평가 관찰기간',
            date: '2025-10-27',
            endDate: '2025-11-07',
            type: 'exam',
            description: '2학기 중간고사 기간',
            important: true
        },
        {
            id: 212,
            title: '수업일수 2/4선',
            date: '2025-10-30',
            type: 'academic',
            description: '수업 진도 체크포인트',
            important: false
        },
        {
            id: 213,
            title: '2026학년도 수시1차 합격자 발표',
            date: '2025-11-04',
            type: 'academic',
            description: '수시모집 합격자 발표',
            important: true
        },
{
            id: 214,
            title: '2026학년도 수시2차 원서접수기간',
            date: '2025-11-07',
            endDate: '2025-11-21',
            type: 'academic',
            description: '수시 2차 모집',
            important: false
        },
        {
            id: 215,
            title: 'Gem-Festival',
            date: '2025-11-20',
            endDate: '2025-11-21',
            type: 'event',
            description: '보석축제',
            important: true
        },
        {
            id: 216,
            title: '수업일수 3/4선',
            date: '2025-11-26',
            type: 'academic',
            description: '수업 진도 체크포인트',
            important: false
        },
        {
            id: 217,
            title: '2026학년도 수시2차 면접/실기고사',
            date: '2025-11-29',
            endDate: '2025-12-03',
            type: 'academic',
            description: '수시 2차 면접 및 실기고사',
            important: true
        },
        {
            id: 218,
            title: '공휴일 보강기간',
            date: '2025-12-08',
            endDate: '2025-12-15',
            type: 'academic',
            description: '공휴일 보강수업',
            important: false
        },
        {
            id: 219,
            title: '2026학년도 수시2차 합격자 발표',
            date: '2025-12-11',
            type: 'academic',
            description: '수시 2차 합격자 발표',
            important: true
        },
        {
            id: 220,
            title: '2026학년도 수시 합격자 등록기간',
            date: '2025-12-15',
            endDate: '2025-12-17',
            type: 'registration',
            description: '수시합격자 등록',
            important: true
        },
        {
            id: 221,
            title: '기말고사 기간',
            date: '2025-12-16',
            endDate: '2025-12-22',
            type: 'exam',
            description: '2학기 기말고사',
            important: true
        },
        {
            id: 222,
            title: '성적입력 기간',
            date: '2025-12-17',
            endDate: '2025-12-26',
            type: 'academic',
            description: '기말고사 성적 입력',
            important: false
        },
        {
            id: 223,
            title: '수업일수 4/4선',
            date: '2025-12-22',
            type: 'academic',
            description: '수업 완료',
            important: false
        },
        {
            id: 224,
            title: '동계방학 시작',
            date: '2025-12-23',
            type: 'holiday',
            description: '겨울방학 시작',
            important: true
        },
        {
            id: 225,
            title: '동계 융합학기',
            date: '2025-12-23',
            endDate: '2026-01-02',
            type: 'academic',
            description: '겨울 융합학기',
            important: false
        },
        {
            id: 226,
            title: '성탄절',
            date: '2025-12-25',
            type: 'holiday',
            description: '성탄절 공휴일',
            important: false
        },
        {
            id: 227,
            title: '2026학년도 정시 원서접수기간',
            date: '2025-12-29',
            endDate: '2026-01-14',
            type: 'academic',
            description: '정시모집 접수',
            important: true
        },
        {
            id: 228,
            title: '성적열람 및 이의신청기간',
            date: '2025-12-30',
            endDate: '2026-01-05',
            type: 'academic',
            description: '2학기 성적 확인',
            important: false
        }
    ],
    'winter': [ // 겨울학기
        {
            id: 301,
            title: '동계 융합학기',
            date: '2025-12-23',
            endDate: '2026-01-02',
            type: 'academic',
            description: '겨울 융합학기',
            important: false
        },
        {
            id: 302,
            title: '2026학년도 정시 원서접수기간',
            date: '2025-12-29',
            endDate: '2026-01-14',
            type: 'academic',
            description: '정시모집 접수',
            important: true
        },
        {
            id: 303,
            title: '성적열람 및 이의신청기간',
            date: '2025-12-30',
            endDate: '2026-01-05',
            type: 'academic',
            description: '2학기 성적확인',
            important: false
        },
        {
            id: 304,
            title: '신정',
            date: '2026-01-01',
            type: 'holiday',
            description: '신정 공휴일',
            important: false
        },
        {
            id: 305,
            title: '2026년 업무개시일',
            date: '2026-01-02',
            type: 'academic',
            description: '새해 업무 시작',
            important: false
        },
        {
            id: 306,
            title: '시무식',
            date: '2026-01-06',
            type: 'event',
            description: '신년 시무식',
            important: false
        },
        {
            id: 307,
            title: '동계 계절학기',
            date: '2026-01-06',
            endDate: '2026-01-19',
            type: 'academic',
            description: '겨울 계절학기',
            important: true
        },
        {
            id: 308,
            title: '2학기 성적확정',
            date: '2026-01-07',
            type: 'academic',
            description: '후기 성적 확정',
            important: false
        },
        {
            id: 309,
            title: '전기 졸업유예 접수기간',
            date: '2026-01-08',
            endDate: '2026-01-15',
            type: 'academic',
            description: '졸업유예 신청',
            important: false
        },
        {
            id: 310,
            title: '교직원세미나',
            date: '2026-01-08',
            type: 'event',
            description: '교직원 연수',
            important: false
        },
        {
            id: 311,
            title: '국고사업 성과보고 및 협류 워크숍',
            date: '2026-01-09',
            type: 'event',
            description: '국고사업 성과발표',
            important: false
        },
        {
            id: 312,
            title: '동계계절학기 성적입력',
            date: '2026-01-19',
            endDate: '2026-01-20',
            type: 'academic',
            description: '겨울학기 성적처리',
            important: false
        },
        {
            id: 313,
            title: '동계계절학기 성적열람 및 이의신청',
            date: '2026-01-21',
            endDate: '2026-01-22',
            type: 'academic',
            description: '겨울학기 성적확인',
            important: false
        },
        {
            id: 314,
            title: '2026학년도 정시 면접/실기고사',
            date: '2026-01-21',
            endDate: '2026-01-25',
            type: 'academic',
            description: '신입생 정시모집',
            important: true
        },
        {
            id: 315,
            title: '2026학년도 일반휴학·전과·재입학 접수기간',
            date: '2026-01-26',
            endDate: '2026-01-30',
            type: 'registration',
            description: '후학 및 전과, 재입학 신청',
            important: false
        },
        {
            id: 316,
            title: '전기진급 및 졸업사정회',
            date: '2026-01-28',
            type: 'academic',
            description: '진급 및 졸업 심사',
            important: true
        },
        {
            id: 317,
            title: '2026학년도 정시 합격자 발표',
            date: '2026-01-30',
            type: 'academic',
            description: '정시모집 합격자 발표',
            important: true
        },
        // 2026년 2월 일정 추가
        {
            id: 318,
            title: '복학 접수기간',
            date: '2026-02-02',
            endDate: '2026-02-06',
            type: 'registration',
            description: '복학 접수기간',
            important: false
        },
        {
            id: 319,
            title: '재학생(복학생) 수강신청 기간',
            date: '2026-02-02',
            endDate: '2026-02-10',
            type: 'registration',
            description: '재학생(복학생) 수강신청 기간',
            important: true
        },
        {
            id: 320,
            title: '2026학년도 정시 합격자 등록기간',
            date: '2026-02-03',
            endDate: '2026-02-05',
            type: 'registration',
            description: '2026학년도 정시 합격자 등록기간',
            important: true
        },
        {
            id: 321,
            title: '1학기 재학생 등록기간',
            date: '2026-02-09',
            endDate: '2026-02-13',
            type: 'registration',
            description: '1학기 재학생 등록기간',
            important: true
        },
        {
            id: 322,
            title: '제48회 학위수여식',
            date: '2026-02-11',
            type: 'event',
            description: '제48회 학위수여식',
            important: true
        },
        {
            id: 323,
            title: '설날 연휴',
            date: '2026-02-16',
            endDate: '2026-02-18',
            type: 'holiday',
            description: '설날 연휴',
            important: true
        },
        {
            id: 324,
            title: '2026학년도 입학식',
            date: '2026-02-24',
            type: 'event',
            description: '2026학년도 입학식',
            important: true
        }
    ]
};

let selectedShuttleRoute = 1

// 셔틀버스 시간표 시스템 클래스 (shuttle_bus_tracker.js에서 가져온 구조)
class BusTimeTable {
    constructor() {
        // 실제 연성대학교 셔틀버스 운행시간표
        this.schedules = {
            1: { // 노선 1 (인천 남동구, 경기도 시흥시, 신천동)
                name: "인천 남동구, 경기도 시흥시, 신천동",
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            },
            2: { // 노선 2 (경기도 시흥시, 시화지역, 장현지구, 시흥농곡지역)
                name: "경기도 시흥시, 시화지역, 장현지구, 시흥농곡지역",
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            },
            3: { // 노선 3 (서울 목동)
                name: "서울 목동",
                운행구간: [
                    { 시간대: "오전", 출차: "08:30", 막차: "10:50", 배차간격: 6 },
                    { 시간대: "낮", 출차: "12:00", 막차: "13:20", 배차간격: 10 },
                    { 시간대: "오후", 출차: "16:55", 막차: "17:45", 배차간격: [5, 10, 15] }
                ]
            }
        };
    }
    
    // 현재 시간이 운행시간인지 확인
    isOperatingTime(routeId) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM 형식
        const schedule = this.schedules[routeId];
        
        if (!schedule) return false;
        
        for (const period of schedule.운행구간) {
            const startTime = parseInt(period.출차.replace(':', ''));
            const endTime = parseInt(period.막차.replace(':', ''));
            
            if (currentTime >= startTime && currentTime <= endTime) {
                return true;
            }
        }
        
        return false;
    }
    
    // 다음 운행시간까지 남은 시간 계산
    getNextOperatingTime(routeId) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const schedule = this.schedules[routeId];
        
        if (!schedule) return null;
        
        for (const period of schedule.운행구간) {
            const startTime = parseInt(period.출차.replace(':', ''));
            
            if (currentTime < startTime) {
                const hours = Math.floor(startTime / 100);
                const minutes = startTime % 100;
                const nextTime = new Date();
                nextTime.setHours(hours, minutes, 0, 0);
                
                const diffMillis = nextTime - now;
                const diffMinutes = Math.floor(diffMillis / (1000 * 60));
                
                return {
                    period: period.시간대,
                    time: period.출차,
                    minutesUntil: diffMinutes > 0 ? diffMinutes : 0
                };
            }
        }
        
        // 오늘 운행 종료, 내일 첫 운행 시간
        const firstPeriod = schedule.운행구간[0];
        return {
            period: `내일 ${firstPeriod.시간대}`,
            time: firstPeriod.출차,
            minutesUntil: null
        };
    }
    
    // 현재 시간대의 배차 정보 가져오기
    getCurrentPeriodInfo(routeId) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const schedule = this.schedules[routeId];
        
        if (!schedule) return null;
        
        for (const period of schedule.운행구간) {
            const startTime = parseInt(period.출차.replace(':', ''));
            const endTime = parseInt(period.막차.replace(':', ''));
            
            if (currentTime >= startTime && currentTime <= endTime) {
                return period;
            }
        }
        
        return null;
    }
    
    // 다음 셔틀버스 시간 계산
    getNextBusInfo() {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let earliestNext = null;
        let earliestRoute = null;
        
        // 모든 노선에서 다음 버스 찾기
        for (let routeId = 1; routeId <= 3; routeId++) {
            const schedule = this.schedules[routeId];
            
            for (const period of schedule.운행구간) {
                const startTime = parseInt(period.출차.replace(':', ''));
                const endTime = parseInt(period.막차.replace(':', ''));
                const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
                const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
                
                // 현재 운행 중인 구간인지 확인
                if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                    // 배차 간격 확인
                    let interval = period.배차간격;
                    if (Array.isArray(interval)) {
                        interval = interval[0]; // 첫 번째 간격 사용
                    }
                    
                    // 다음 버스 시간 계산
                    let nextBusMinutes = startMinutes;
                    while (nextBusMinutes <= currentMinutes) {
                        nextBusMinutes += interval;
                    }
                    
                    // 운행 종료 시간 이후면 패스
                    if (nextBusMinutes > endMinutes) {
                        continue;
                    }
                    
                    // 가장 빠른 다음 버스 찾기
                    if (!earliestNext || nextBusMinutes < earliestNext) {
                        earliestNext = nextBusMinutes;
                        earliestRoute = {
                            routeId: routeId,
                            routeName: schedule.name,
                            period: period.시간대,
                            interval: interval
                        };
                    }
                }
                
                // 아직 시작하지 않은 다음 구간 확인
                if (currentMinutes < startMinutes) {
                    if (!earliestNext || startMinutes < earliestNext) {
                        earliestNext = startMinutes;
                        earliestRoute = {
                            routeId: routeId,
                            routeName: schedule.name,
                            period: period.시간대,
                            interval: Array.isArray(period.배차간격) ? period.배차간격[0] : period.배차간격
                        };
                    }
                }
            }
        }
        
        if (earliestNext && earliestRoute) {
            const nextHour = Math.floor(earliestNext / 60);
            const nextMin = earliestNext % 60;
            const timeUntil = earliestNext - currentMinutes;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: timeUntil,
                route: earliestRoute,
                description: `학교 → 안양역 경유`
            };
        }
        
        return null;
    }
    
    // 다음 몇 개의 운행시간 가져오기
    getUpcomingBuses(count = 3) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const upcoming = [];
        
        // 모든 노선의 모든 운행시간 수집
        for (let routeId = 1; routeId <= 3; routeId++) {
            const schedule = this.schedules[routeId];
            
            for (const period of schedule.운행구간) {
                const startTime = parseInt(period.출차.replace(':', ''));
                const endTime = parseInt(period.막차.replace(':', ''));
                const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
                const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
                
                let interval = period.배차간격;
                if (Array.isArray(interval)) {
                    interval = interval[0]; // 첫 번째 간격 사용
                }
                
                // 해당 구간의 모든 운행시간 계산
                let busMinutes = startMinutes;
                while (busMinutes <= endMinutes) {
                    if (busMinutes > currentMinutes) {
                        const busHour = Math.floor(busMinutes / 60);
                        const busMin = busMinutes % 60;
                        upcoming.push({
                            time: `${busHour.toString().padStart(2, '0')}:${busMin.toString().padStart(2, '0')}`,
                            minutesUntil: busMinutes - currentMinutes,
                            routeId: routeId,
                            routeName: schedule.name
                        });
                    }
                    busMinutes += interval;
                }
            }
        }
        
        // 시간순 정렬 후 상위 count개 반환
        upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
        return upcoming.slice(0, count);
    }
}

// 메인페이지용 셧틀버스 시간표 인스턴스
const shuttleBusTimeTable = new BusTimeTable();

// 전역 변수 선언
let timeInterval = null;
let shuttleBusInterval = null;
let timetableInterval = null;
let activityStatsInterval = null;
let restaurantInterval = null;

// 네이버 지도 관련 변수
let naverMap;
let mapMarkers = [];
let infoWindows = [];
let userMarker = null;
let userLocationCircle = null;
let userLocationWatchId = null;
let userLocation = null;
let isTrackingUser = false;
let routePolyline = null; // 경로 폴리라인

// 페이지네이션 변수
let currentPage = 1;
const buildingsPerPage = 5;

// 현재 뷰 모드 (기본값: 모바일/앱 모드)
let currentViewMode = 'mobile';

// 뷰 모드 감지 및 설정 함수
function detectViewMode() {
    const savedMode = localStorage.getItem('viewMode');
    if (savedMode) {
        currentViewMode = savedMode;
    } else {
        // 화면 크기에 따라 자동 감지
        currentViewMode = window.innerWidth > 768 ? 'browser' : 'mobile';
    }
    applyViewMode();
}

// 뷰 모드 적용 함수
function applyViewMode() {
    const browserContainer = document.querySelector('.browser-container');
    const mobileContainer = document.querySelector('.mobile-container');
    
    if (currentViewMode === 'browser') {
        if (browserContainer) browserContainer.style.display = 'block';
        if (mobileContainer) mobileContainer.style.display = 'none';
        document.body.classList.add('browser-mode');
        document.body.classList.remove('mobile-mode');
    } else {
        if (browserContainer) browserContainer.style.display = 'none';
        if (mobileContainer) mobileContainer.style.display = 'block';
        document.body.classList.add('mobile-mode');
        document.body.classList.remove('browser-mode');
    }
    
    // 지도가 있다면 리사이즈
    setTimeout(() => {
        if (naverMap) {
            naverMap.refresh();
        }
    }, 300);
}

// 뷰 모드 전환 함수
function toggleViewMode() {
    currentViewMode = currentViewMode === 'browser' ? 'mobile' : 'browser';
    localStorage.setItem('viewMode', currentViewMode);
    applyViewMode();
    
    // 사용자에게 전환 알림 (선택사항)
    const modeText = currentViewMode === 'browser' ? 'PC 버전' : '모바일 버전';
    console.log(`${modeText}으로 전환되었습니다.`);
}

// 셔틀버스 노선 선택 함수
function selectShuttleRoute(routeId) {
    console.log('노선 선택:', routeId);
    
    // 선택된 노선 번호 업데이트
    selectedShuttleRoute = routeId;
    
    // 셔틀버스 정보 업데이트
    updateShuttleBusInfo();
    
    console.log('노선', routeId, '선택 완료');
}

// 특정 노선의 셔틀버스 정보 업데이트
function updateShuttleBusInfoForRoute(routeId) {
    const schedule = shuttleBusTimeTable.schedules[routeId];
    if (!schedule) return;
    
    // 운행 상태 확인
    const isOperating = shuttleBusTimeTable.isOperatingTime(routeId);
    const nextOperating = shuttleBusTimeTable.getNextOperatingTime(routeId);
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(routeId);
    
    // 상태 배지 업데이트
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
        if (isOperating) {
            statusElement.textContent = '운행 중';
            statusElement.className = 'status-badge running';
        } else {
            statusElement.textContent = '운행 종료';
            statusElement.className = 'status-badge stopped';
        }
    }
    
    // 다음 셔틀버스 정보 업데이트
    const shuttleTimeEl = document.querySelector('.shuttle-time');
    const shuttleDescEl = document.querySelector('.shuttle-desc');
    
    if (isOperating && currentPeriod) {
        // 현재 운행 중일 때
        const nextBusTimes = getNextBusTimesForRoute(routeId);
        
        if (nextBusTimes.length > 0) {
            const nextBus = nextBusTimes[0];
            shuttleTimeEl.textContent = `${nextBus.minutesUntil}분 후 출발`;
            shuttleDescEl.textContent = `${schedule.name} (${nextBus.time})`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${schedule.name} - 오늘 운행 완료`;
        }
    } else {
        // 운행 시간이 아닐 때
        if (nextOperating && nextOperating.minutesUntil !== null) {
            shuttleTimeEl.textContent = `${nextOperating.minutesUntil}분 후 운행 시작`;
            shuttleDescEl.textContent = `${schedule.name} - ${nextOperating.period} ${nextOperating.time}`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${schedule.name} - 내일 운행 예정`;
        }
    }
    
    // 다음 운행 시간들 업데이트 (곧 도착할 정류장 3개의 시간)
    const shuttleTimeItems = document.querySelectorAll('.shuttle-time-item');
    const upcomingStops = getUpcomingStopsForRoute(routeId);
    
    upcomingStops.forEach((stop, index) => {
        if (index < 3 && shuttleTimeItems[index]) {
            const timeValueEl = shuttleTimeItems[index].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[index].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = stop.time;
                timeLabelEl.textContent = stop.name;
            }
        }
    });
    
    // 남은 슬롯은 기본값으로 채우기
    for (let i = upcomingStops.length; i < 3; i++) {
        if (shuttleTimeItems[i]) {
            const timeValueEl = shuttleTimeItems[i].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[i].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = '--:--';
                timeLabelEl.textContent = '운행 종료';
            }
        }
    }
}

// 특정 노선의 다음 버스 시간들 계산
function getNextBusTimesForRoute(routeId) {
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(routeId);
    if (!currentPeriod) return [];
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const periodStartTime = parseInt(currentPeriod.출차.replace(':', ''));
    const periodEndTime = parseInt(currentPeriod.막차.replace(':', ''));
    const periodStartMinutes = Math.floor(periodStartTime / 100) * 60 + (periodStartTime % 100);
    const periodEndMinutes = Math.floor(periodEndTime / 100) * 60 + (periodEndTime % 100);
    
    const busTimes = [];
    
    // 배차간격에 따른 다음 운행시간 계산
    if (Array.isArray(currentPeriod.배차간격)) {
        // 오후 시간대 [5, 10, 15] 패턴
        let nextTime = periodStartMinutes;
        let patternIndex = 0;
        
        while (nextTime <= periodEndMinutes) {
            if (nextTime >= currentTime) {
                const hour = Math.floor(nextTime / 60);
                const min = nextTime % 60;
                busTimes.push({
                    time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                    minutesUntil: nextTime - currentTime
                });
            }
            if (busTimes.length >= 3) break;
            nextTime += currentPeriod.배차간격[patternIndex];
            patternIndex = (patternIndex + 1) % currentPeriod.배차간격.length;
        }
    } else {
        // 일반 배차간격
        let nextTime = periodStartMinutes;
        while (nextTime <= periodEndMinutes) {
            if (nextTime >= currentTime) {
                const hour = Math.floor(nextTime / 60);
                const min = nextTime % 60;
                busTimes.push({
                    time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
                    minutesUntil: nextTime - currentTime
                });
            }
            if (busTimes.length >= 3) break;
            nextTime += currentPeriod.배차간격;
        }
    }
    
    return busTimes;
}

// 특정 노선의 곧 도착할 정류장 3개 계산
function getUpcomingStopsForRoute(routeId) {
    const routeStops = {
        1: [ // 노선 1
            { name: '모래내시장역', offsetMinutes: 0 },
            { name: '만수역', offsetMinutes: 3 },
            { name: '남동구청역', offsetMinutes: 10 },
            { name: '신천역', offsetMinutes: 22 },
            { name: '안양역', offsetMinutes: 35 },
            { name: '연성대학교', offsetMinutes: 45 }
        ],
        2: [ // 노선 2
            { name: '이마트', offsetMinutes: 0 },
            { name: '정왕역', offsetMinutes: 4 },
            { name: '장곡고교', offsetMinutes: 13 },
            { name: '장곡중학교', offsetMinutes: 18 },
            { name: '시흥농곡역', offsetMinutes: 25 },
            { name: '시흥시청역', offsetMinutes: 28 },
            { name: '동귀소입구', offsetMinutes: 31 },
            { name: '안양역', offsetMinutes: 35 },
            { name: '연성대학교', offsetMinutes: 45 }
        ],
        3: [ // 노선 3
            { name: '서울남부법원', offsetMinutes: 0 },
            { name: '진명여고', offsetMinutes: 2 },
            { name: '목동역', offsetMinutes: 5 },
            { name: '오목교역', offsetMinutes: 10 },
            { name: '안양역', offsetMinutes: 35 },
            { name: '연성대학교', offsetMinutes: 45 }
        ]
    };
    
    const stops = routeStops[routeId] || [];
    const nextBusTimes = getNextBusTimesForRoute(routeId);
    const upcomingStops = [];
    
    if (nextBusTimes.length > 0) {
        const nextBus = nextBusTimes[0];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // 다음 버스의 출발 시간을 분으로 변환
        const [hour, min] = nextBus.time.split(':').map(Number);
        const departureTime = hour * 60 + min;
        
        // 현재 시간 기준으로 곧 도착할 정류장들 찾기
        const currentProgress = Math.max(0, currentTime - departureTime);
        
        for (const stop of stops) {
            const arrivalTime = departureTime + stop.offsetMinutes;
            if (arrivalTime > currentTime) {
                const arrivalHour = Math.floor(arrivalTime / 60);
                const arrivalMin = arrivalTime % 60;
                upcomingStops.push({
                    name: stop.name,
                    time: `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`
                });
                if (upcomingStops.length >= 3) break;
            }
        }
    }
    
    return upcomingStops;
}

function updateSelectedRouteTab() {
    // 모든 탭에서 active 클래스 제거
    document.querySelectorAll('.route-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 선택된 탭에 active 클래스 추가
    const selectedTab = document.querySelector(`.route-tab[data-route="${selectedShuttleRoute}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// 노선 선택 함수
function updateShuttleBusInfo() {
    // 현재 선택된 노선의 정보 가져오기
    const nextBusInfo = shuttleBusTimeTable.getNextBusInfo();
    const routeSchedule = shuttleBusTimeTable.schedules[selectedShuttleRoute];
    const isOperating = shuttleBusTimeTable.isOperatingTime(selectedShuttleRoute);
    const nextOperating = shuttleBusTimeTable.getNextOperatingTime(selectedShuttleRoute);
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(selectedShuttleRoute);
    
    // 상태 배지 업데이트
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
        if (isOperating) {
            statusElement.textContent = '운행 중';
            statusElement.className = 'status-badge running';
        } else {
            statusElement.textContent = '운행 종료';
            statusElement.className = 'status-badge stopped';
        }
    }
    
    // 다음 셔틀버스 정보 업데이트
    const shuttleTimeEl = document.querySelector('.shuttle-time');
    const shuttleDescEl = document.querySelector('.shuttle-desc');
    
    if (isOperating && currentPeriod) {
        // 현재 운행 중일 때
        const nextBusTimes = getNextBusTimesForRoute(selectedShuttleRoute);
        
        if (nextBusTimes.length > 0) {
            const nextBus = nextBusTimes[0];
            shuttleTimeEl.textContent = `${nextBus.minutesUntil}분 후 출발`;
            shuttleDescEl.textContent = `${routeSchedule.name} (${nextBus.time})`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${routeSchedule.name} - 오늘 운행 완료`;
        }
    } else {
        // 운행 시간이 아닐 때
        if (nextOperating && nextOperating.minutesUntil !== null) {
            shuttleTimeEl.textContent = `${nextOperating.minutesUntil}분 후 운행 시작`;
            shuttleDescEl.textContent = `${routeSchedule.name} - ${nextOperating.period} ${nextOperating.time}`;
        } else {
            shuttleTimeEl.textContent = '운행 종료';
            shuttleDescEl.textContent = `${routeSchedule.name} - 내일 운행 예정`;
        }
    }
    
    // 곧 도착할 정류장 3개의 시간 업데이트
    const shuttleTimeItems = document.querySelectorAll('.shuttle-time-item');
    const upcomingStops = getUpcomingStopsForRoute(selectedShuttleRoute);
    
    // 정류장별 시간 표시
    upcomingStops.forEach((stop, index) => {
        if (index < 3 && shuttleTimeItems[index]) {
            const timeValueEl = shuttleTimeItems[index].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[index].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = stop.time;
                timeLabelEl.textContent = stop.name;
            }
        }
    });
    
    // 남은 슬롯은 기본값으로 채우기
    for (let i = upcomingStops.length; i < 3; i++) {
        if (shuttleTimeItems[i]) {
            const timeValueEl = shuttleTimeItems[i].querySelector('.time-value');
            const timeLabelEl = shuttleTimeItems[i].querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = '--:--';
                timeLabelEl.textContent = '운행 종료';
            }
        }
    }
    
    // 운행 시간표 정보 업데이트
    updateScheduleDisplay();
    
    // 선택된 노선 탭 상태 업데이트
    updateSelectedRouteTab();
}

// 운행 시간표 표시 함수
function updateScheduleDisplay() {
    const routeSchedule = shuttleBusTimeTable.schedules[selectedShuttleRoute];
    if (!routeSchedule) return;
    
    const scheduleContainer = document.querySelector('.shuttle-time-slots');
    if (scheduleContainer) {
        const scheduleHTML = routeSchedule.운행구간.map(period => {
            let intervalText = '';
            if (Array.isArray(period.배차간격)) {
                intervalText = period.배차간격.join('/') + '분 간격';
            } else {
                intervalText = period.배차간격 + '분 간격';
            }
            
            return `
                <div class="time-slot">
                    <div class="time-period">${period.시간대}</div>
                    <div class="time-range">${period.출차}~${period.막차}</div>
                    <div class="time-interval">${intervalText}</div>
                </div>
            `;
        }).join('');
        
        scheduleContainer.innerHTML = scheduleHTML;
    }
}

// BusTimeTable 클래스에 노선별 정보 조회 메서드 추가
BusTimeTable.prototype.getRouteNextBusInfo = function(routeId) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const schedule = this.schedules[routeId];
    
    if (!schedule) return null;
    
    for (const period of schedule.운행구간) {
        const startTime = parseInt(period.출차.replace(':', ''));
        const endTime = parseInt(period.막차.replace(':', ''));
        const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
        const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
        
        // 현재 운행 중인 구간인지 확인
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            // 배차 간격 확인
            let interval = period.배차간격;
            if (Array.isArray(interval)) {
                interval = interval[0]; // 첫 번째 간격 사용
            }
            
            // 다음 버스 시간 계산
            let nextBusMinutes = startMinutes;
            while (nextBusMinutes <= currentMinutes) {
                nextBusMinutes += interval;
            }
            
            // 운행 종료 시간 이후면 패스
            if (nextBusMinutes > endMinutes) {
                continue;
            }
            
            const nextHour = Math.floor(nextBusMinutes / 60);
            const nextMin = nextBusMinutes % 60;
            const timeUntil = nextBusMinutes - currentMinutes;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: timeUntil,
                routeId: routeId,
                routeName: schedule.name,
                period: period.시간대,
                description: `학교 → 안양역 경유`
            };
        }
    }
    
    return null;
};

// BusTimeTable 클래스에 노선별 다음 운행시간 조회 메서드 추가
BusTimeTable.prototype.getRouteUpcomingBuses = function(routeId, count = 3) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming = [];
    const schedule = this.schedules[routeId];
    
    if (!schedule) return upcoming;
    
    for (const period of schedule.운행구간) {
        const startTime = parseInt(period.출차.replace(':', ''));
        const endTime = parseInt(period.막차.replace(':', ''));
        const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
        const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
        
        let interval = period.배차간격;
        if (Array.isArray(interval)) {
            interval = interval[0]; // 첫 번째 간격 사용
        }
        
        // 해당 구간의 모든 운행시간 계산
        let busMinutes = startMinutes;
        while (busMinutes <= endMinutes) {
            if (busMinutes > currentMinutes) {
                const busHour = Math.floor(busMinutes / 60);
                const busMin = busMinutes % 60;
                upcoming.push({
                    time: `${busHour.toString().padStart(2, '0')}:${busMin.toString().padStart(2, '0')}`,
                    minutesUntil: busMinutes - currentMinutes,
                    routeId: routeId,
                    routeName: schedule.name
                });
            }
            busMinutes += interval;
        }
    }
    
    // 시간순 정렬 후 상위 count개 반환
    upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
    return upcoming.slice(0, count);
};

// 셔틀버스 정보 업데이트 함수
function updateShuttleBusInfo() {
    // 현재 선택된 노선이 없으면 기본값 설정
    if (!selectedShuttleRoute) {
        selectedShuttleRoute = 1;
    }
    
    // 선택된 노선의 정보 가져오기
    const routeSchedule = shuttleBusTimeTable.schedules[selectedShuttleRoute];
    const isOperating = shuttleBusTimeTable.isOperatingTime(selectedShuttleRoute);
    const nextOperating = shuttleBusTimeTable.getNextOperatingTime(selectedShuttleRoute);
    const currentPeriod = shuttleBusTimeTable.getCurrentPeriodInfo(selectedShuttleRoute);
    
    // 상태 배지 업데이트
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
        if (isOperating) {
            statusElement.textContent = '운행 중';
            statusElement.className = 'status-badge running';
        } else {
            statusElement.textContent = '운행 종료';
            statusElement.className = 'status-badge stopped';
        }
    }
    
    // 다음 셔틀버스 정보 업데이트
    const shuttleTimeEl = document.querySelector('.shuttle-time');
    const shuttleDescEl = document.querySelector('.shuttle-desc');
    
    if (shuttleTimeEl && shuttleDescEl) {
        if (isOperating && currentPeriod) {
            // 현재 운행 중일 때
            const nextBusTimes = getNextBusTimesForRoute(selectedShuttleRoute);
            
            if (nextBusTimes.length > 0) {
                const nextBus = nextBusTimes[0];
                shuttleTimeEl.textContent = `${nextBus.minutesUntil}분 후 출발`;
                shuttleDescEl.textContent = `${routeSchedule.name} (${nextBus.time})`;
            } else {
                shuttleTimeEl.textContent = '운행 종료';
                shuttleDescEl.textContent = `${routeSchedule.name} - 오늘 운행 완료`;
            }
        } else {
            // 운행 시간이 아닐 때
            if (nextOperating && nextOperating.minutesUntil !== null) {
                shuttleTimeEl.textContent = `${nextOperating.minutesUntil}분 후 운행 시작`;
                shuttleDescEl.textContent = `${routeSchedule.name} - ${nextOperating.period} ${nextOperating.time}`;
            } else {
                shuttleTimeEl.textContent = '운행 종료';
                shuttleDescEl.textContent = `${routeSchedule.name} - 내일 운행 예정`;
            }
        }
    }
    
    // 곧 도착할 정류장 3개의 시간 업데이트
    const shuttleTimeItems = document.querySelectorAll('.shuttle-time-item');
    
    if (isOperating && currentPeriod) {
        const upcomingStops = getUpcomingStopsForRoute(selectedShuttleRoute);
        
        // 정류장별 시간 표시
        upcomingStops.forEach((stop, index) => {
            if (index < 3 && shuttleTimeItems[index]) {
                const timeValueEl = shuttleTimeItems[index].querySelector('.time-value');
                const timeLabelEl = shuttleTimeItems[index].querySelector('.time-label');
                
                if (timeValueEl && timeLabelEl) {
                    timeValueEl.textContent = stop.time;
                    timeLabelEl.textContent = stop.name;
                }
            }
        });
        
        // 남은 슬롯은 기본값으로 채우기
        for (let i = upcomingStops.length; i < 3; i++) {
            if (shuttleTimeItems[i]) {
                const timeValueEl = shuttleTimeItems[i].querySelector('.time-value');
                const timeLabelEl = shuttleTimeItems[i].querySelector('.time-label');
                
                if (timeValueEl && timeLabelEl) {
                    timeValueEl.textContent = '--:--';
                    timeLabelEl.textContent = '운행 종료';
                }
            }
        }
    } else {
        // 운행 시간이 아닐 때 모든 슬롯을 운행 종료로 표시
        shuttleTimeItems.forEach(item => {
            const timeValueEl = item.querySelector('.time-value');
            const timeLabelEl = item.querySelector('.time-label');
            
            if (timeValueEl && timeLabelEl) {
                timeValueEl.textContent = '--:--';
                timeLabelEl.textContent = '운행 종료';
            }
        });
    }
    
    // 운행 시간표 정보 업데이트
    updateScheduleDisplay();
    
    // 선택된 노선 탭 상태 업데이트
    updateSelectedRouteTab();
}

function getNextBusForRoute(routeId) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const schedule = shuttleBusTimeTable.schedules[routeId];
    
    if (!schedule) return null;
    
    for (const period of schedule.운행구간) {
        const startTime = parseInt(period.출차.replace(':', ''));
        const endTime = parseInt(period.막차.replace(':', ''));
        const startMinutes = Math.floor(startTime / 100) * 60 + (startTime % 100);
        const endMinutes = Math.floor(endTime / 100) * 60 + (endTime % 100);
        
        // 현재 운행 중인 구간인지 확인
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            // 배차 간격 확인
            let interval = period.배차간격;
            if (Array.isArray(interval)) {
                interval = interval[0]; // 첫 번째 간격 사용
            }
            
            // 다음 버스 시간 계산
            let nextBusMinutes = startMinutes;
            while (nextBusMinutes <= currentMinutes) {
                nextBusMinutes += interval;
            }
            
            // 운행 종료 시간 이후면 다음 구간 확인
            if (nextBusMinutes > endMinutes) {
                continue;
            }
            
            const nextHour = Math.floor(nextBusMinutes / 60);
            const nextMin = nextBusMinutes % 60;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: nextBusMinutes - currentMinutes,
                period: period.시간대
            };
        }
        
        // 아직 시작하지 않은 구간
        if (currentMinutes < startMinutes) {
            const nextHour = Math.floor(startMinutes / 60);
            const nextMin = startMinutes % 60;
            
            return {
                time: `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`,
                minutesUntil: startMinutes - currentMinutes,
                period: period.시간대
            };
        }
    }
    
    return null;
}

// 시설 탭 초기화 함수 (페이지네이션 포함)
function initFacilityTab() {
    loadBuildingsByPage(currentPage);
    updatePaginationControls();
}

// 해당 페이지의 건물 목록 로드 함수
function loadBuildingsByPage(page) {
    // 건물 목록 컨테이너
    const buildingListElement = document.querySelector('#facility-tab .building-list');
    if (!buildingListElement) return;

    // 목록 초기화
    buildingListElement.innerHTML = '';

    // 페이지에 해당하는 건물 인덱스 계산
    const startIndex = (page - 1) * buildingsPerPage;
    const endIndex = Math.min(startIndex + buildingsPerPage, buildingData.length);

    // 페이지에 해당하는 건물 목록 생성
    for (let i = startIndex; i < endIndex; i++) {
        const building = buildingData[i];

        // 이미지 URL 처리
        let imageUrl = building.image;
        if (imageUrl && imageUrl.includes('/api/placeholder/')) {
            const dimensions = imageUrl.match(/\/api\/placeholder\/(\d+)\/(\d+)/);
            if (dimensions && dimensions.length === 3) {
                const width = dimensions[1];
                const height = dimensions[2];
                imageUrl = `https://placehold.co/${width}x${height}/gray/white?text=${encodeURIComponent(building.name)}`;
            }
        }

        const listItem = document.createElement('li');
        listItem.className = 'building-item';
        listItem.onclick = function() { 
            showBuildingDetail(building.id);
        };

        listItem.innerHTML = `
            <div class="building-image">
                <img src="${imageUrl}" alt="${building.name}">
            </div>
            <div class="building-info-container">
                <div class="building-info">
                    <div class="building-name">${building.name}</div>
                    <div class="building-description">${building.description}</div>
                </div>
                <div class="building-nav-button" onclick="navigateToBuilding('${building.id}', event)">
                    <span>길찾기</span>
                    <span>🧭</span>
                </div>
            </div>
        `;

        buildingListElement.appendChild(listItem);
    }

    // 현재 페이지 저장
    currentPage = page;
}

// 모든 이미지 URL을 확인하고 수정하는 함수
function fixAllImageUrls() {
    console.log('모든 이미지 URL 확인 및 수정 중...');

    // 문서 내 모든 이미지 태그 선택
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');

        // placeholder URL 확인
        if (src && src.includes('/api/placeholder/')) {
            const dimensions = src.match(/\/api\/placeholder\/(\d+)\/(\d+)/);
            if (dimensions && dimensions.length === 3) {
                const width = dimensions[1];
                const height = dimensions[2];
                const altText = img.getAttribute('alt') || 'Image';
                
                // placehold.co 서비스로 대체
                const newSrc = `https://placehold.co/${width}x${height}/gray/white?text=${encodeURIComponent(altText)}`;
                console.log(`이미지 URL 수정: ${src} → ${newSrc}`);
                img.src = newSrc;
            }
        }
    });

    console.log('모든 이미지 URL 수정 완료');
}

// 페이지네이션 컨트롤 업데이트
function updatePaginationControls() {
    // 총 페이지 수 계산
    const totalPages = Math.ceil(buildingData.length / buildingsPerPage);

    // 페이지네이션 컨트롤 컨테이너
    const paginationContainer = document.querySelector('#pagination-controls');
    if (!paginationContainer) return;

    // 컨트롤 초기화
    paginationContainer.innerHTML = '';

    // 이전 페이지 버튼
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button';
    prevButton.textContent = '이전';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = function() {
        if (currentPage > 1) {
            loadBuildingsByPage(currentPage - 1);
            updatePaginationControls();
        }
    };
    paginationContainer.appendChild(prevButton);

    // 페이지 번호 버튼
    // 총 페이지 수가 5개 이하면 모든 페이지 표시
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'pagination-button';
            pageButton.textContent = i;
            
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            
            pageButton.onclick = function() {
                loadBuildingsByPage(i);
                updatePaginationControls();
            };
            
            paginationContainer.appendChild(pageButton);
        }
    } else {
        // 페이지가 많은 경우, 현재 페이지 주변 페이지만 표시
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // 시작 페이지가 1보다 크면 첫 페이지와 ellipsis 표시
        if (startPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.className = 'pagination-button';
            firstButton.textContent = '1';
            firstButton.onclick = function() {
                loadBuildingsByPage(1);
                updatePaginationControls();
            };
            paginationContainer.appendChild(firstButton);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 5px';
                paginationContainer.appendChild(ellipsis);
            }
        }

        // 페이지 번호 표시
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'pagination-button';
            pageButton.textContent = i;
            
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            
            pageButton.onclick = function() {
                loadBuildingsByPage(i);
                updatePaginationControls();
            };
            
            paginationContainer.appendChild(pageButton);
        }

        // 마지막 페이지가 totalPages보다 작으면 ellipsis와 마지막 페이지 표시
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 5px';
                paginationContainer.appendChild(ellipsis);
            }
            
            const lastButton = document.createElement('button');
            lastButton.className = 'pagination-button';
            lastButton.textContent = totalPages;
            lastButton.onclick = function() {
                loadBuildingsByPage(totalPages);
                updatePaginationControls();
            };
            paginationContainer.appendChild(lastButton);
        }
    }

    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button';
    nextButton.textContent = '다음';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = function() {
        if (currentPage < totalPages) {
            loadBuildingsByPage(currentPage + 1);
            updatePaginationControls();
        }
    };
    paginationContainer.appendChild(nextButton);
}

// 오늘의 모든 수업 가져오기
function getTodaysClasses() {
    const courses = loadTimetableData();
    const currentTime = getCurrentTimeInfo();
    const todaysClasses = [];
    
    // 일요일이면 빈 배열 반환
    if (currentTime.day === 0) {
        return todaysClasses;
    }
    
    // 오늘의 모든 수업 찾기
    courses.forEach(course => {
        course.times.forEach(time => {
            if (time.day === currentTime.day) {
                // 첫 번째 교시만 표시 (미리보기용)
                const startTime = periodTimes[time.start].start;
                const endTime = periodTimes[time.end].end;
                
                todaysClasses.push({
                    course: course,
                    startTime: startTime,
                    endTime: endTime,
                    startMinutes: timeToMinutes(startTime),
                    period: time.start
                });
            }
        });
    });
    
    // 시간 순으로 정렬
    todaysClasses.sort((a, b) => a.startMinutes - b.startMinutes);
    
    console.log('오늘의 수업 목록:', todaysClasses);
    return todaysClasses;
}

// 네이버 지도 초기화 함수 - 수정된 버전
function initNaverMap() {
    console.log('네이버 지도 초기화 시작…');

    // 1) naver 객체 또는 maps 모듈, LatLng 생성자가 준비되지 않았으면 바로 중단
    if (
        typeof naver === 'undefined' ||
        !naver.maps ||
        typeof naver.maps.LatLng !== 'function'
    ) {
        console.error('네이버 지도 API가 로드되지 않았습니다. Client ID 또는 Allowed Origin을 확인하세요.');
        return;
    }

    try {
        // 2) 지도를 그릴 컨테이너가 문서에 없으면 중단
        const mapContainer = document.getElementById('naverMap');
        if (!mapContainer) {
            console.error('지도 컨테이너 엘리먼트(#naverMap)를 찾을 수 없습니다.');
            return;
        }

        // 3) 컨테이너 초기화
        mapContainer.style.width = '100%';
        mapContainer.style.height = '350px';
        mapContainer.innerHTML = '';

        // 4) 지도 생성
        const yeonsung = new naver.maps.LatLng(37.39661657434427, 126.90772437800818);
        const mapOptions = {
            center: yeonsung,
            zoom: 16,
            minZoom: 14,
            maxZoom: 19,
            zoomControl: true,
            zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
            scaleControl: true,
            logoControl: true,
            mapDataControl: true
        };
        naverMap = new naver.maps.Map(mapContainer, mapOptions);

        // 5) 지도 리사이즈 강제
        window.dispatchEvent(new Event('resize'));
        setTimeout(() => {
            if (naverMap) naverMap.refresh();
        }, 500);

        // 6) Direction API 로드 및 회색 영역 보정
        loadDirectionAPI();
        setTimeout(fixMapGrayArea, 1000);

        // 7) 마커, 정보창, GPS 버튼 등 나머지 초기화
        mapMarkers = [];
        infoWindows = [];
        buildingData.forEach(building => {
            if (!building.position) return;
            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(building.position.lat, building.position.lng),
                map: naverMap,
                title: building.name
            });
            mapMarkers.push(marker);

            const infoWindow = new naver.maps.InfoWindow({
                content: `
                    <div class="map-info-window">
                        <div class="map-info-title">${building.name}</div>
                        <div class="map-info-desc">${building.description}</div>
                    </div>
                `,
                maxWidth: 250,
                backgroundColor: "#fff",
                borderColor: "#ddd",
                borderWidth: 1,
                anchorSize: { width: 12, height: 12 },
                pixelOffset: new naver.maps.Point(10, -10)
            });
            naver.maps.Event.addListener(marker, "click", () => {
                infoWindows.forEach(iw => iw.close());
                infoWindow.open(naverMap, marker);
            });
            infoWindows.push(infoWindow);
        });

        // GPS 버튼
        const gpsButton = document.createElement('div');
        gpsButton.className = 'gps-button';
        gpsButton.innerHTML = '📍';
        gpsButton.onclick = trackUserLocation;
        mapContainer.appendChild(gpsButton);

        console.log('네이버 지도가 성공적으로 초기화되었습니다.');
    }
    catch (error) {
        console.error('네이버 지도 초기화 중 오류:', error);
        const mapContainer = document.getElementById('naverMap');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    display:flex; height:100%; 
                    align-items:center; justify-content:center; 
                    flex-direction:column; background-color:#f8f9fa;
                    border-radius:8px;
                ">
                    <div style="font-size:24px; margin-bottom:10px;">❌</div>
                    <div style="font-weight:bold; margin-bottom:5px;">
                        지도 초기화 오류
                    </div>
                    <div style="font-size:14px; color:#666;">
                        개발자 콘솔을 확인해주세요
                    </div>
                </div>
            `;
        }
    }
}

// 회색 영역 문제 해결을 위한 스타일 동적 적용 함수
function fixMapGrayArea() {
    // 회색 영역을 가리는 요소가 있는지 확인
    const mapContainer = document.getElementById('naverMap');
    if (mapContainer) {
        // 회색 오버레이 요소가 있는지 확인하고 제거
        const grayOverlays = mapContainer.querySelectorAll('div[style*="background-color: rgb(128, 128, 128)"]');
        grayOverlays.forEach(overlay => {
            overlay.style.display = 'none';
        });

        // 지도 컨테이너 내부의 모든 div 요소 확인
        const mapDivs = mapContainer.querySelectorAll('div');
        mapDivs.forEach(div => {
            // width가 50%로 설정된 요소 찾기
            const style = getComputedStyle(div);
            if (style.width === '50%' || style.width.endsWith('50%')) {
                div.style.width = '100%';
                console.log('지도 요소 너비 수정: 50% → 100%');
            }

            // 회색 배경색을 가진 요소 찾기
            if (
                style.backgroundColor.includes('128') ||
                style.backgroundColor.toLowerCase().includes('gray') ||
                style.backgroundColor.toLowerCase().includes('grey')
            ) {
                div.style.backgroundColor = 'transparent';
                console.log('회색 배경 요소 발견 및 수정');
            }
        });
    }
}

// 지도 초기화 완료 후 회색 영역 수정 함수 호출하는 함수
function initNaverMapWithFix() {
    // 기본 초기화 함수 호출
    initNaverMap();

    // 지도가 로드된 후 회색 영역 수정
    setTimeout(() => {
        fixMapGrayArea();
    }, 1000);
}

// 탭 전환 시 지도 크기 조정 및 새로고침을 처리하는 함수
function handleMapResize() {
    const mapContainer = document.getElementById('naverMap');
    if (!mapContainer || !window.naverMap) return;
    if (getComputedStyle(mapContainer).display === 'none') return;

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        try { naverMap.refresh(); console.log('지도 크기 조정 및 갱신 완료'); }
        catch (e) { /* 무시 */ }
    }, 100);
}

// Direction API 스크립트 동적 로드 함수
function loadDirectionAPI() {
    if (window.naver && window.naver.maps && window.naver.maps.Direction) {
        console.log('Direction API가 이미 로드되어 있습니다.');
        return; // 이미 로드되어 있으면 중복 로드 방지
    }

    // Direction API 스크립트 엘리먼트 생성
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ud4n9otj1x&submodules=direction';
    script.async = true;
    script.defer = true;

    script.onload = function() {
        console.log('Direction API 로드 완료');
    };

    script.onerror = function() {
        console.error('Direction API 로드 실패');
        alert('길 안내 기능을 로드하는 데 문제가 발생했습니다. 직선 경로로 안내합니다.');
    };

    // 헤드에 스크립트 추가
    document.head.appendChild(script);
}

// Direction API 로드 여부를 확인하는 함수
function isDirectionAPILoaded() {
    return window.naver && window.naver.maps && window.naver.maps.Direction;
}

// 브라우저 버전과 모바일 버전 전환 기능
function switchToBrowserView() {
    currentViewMode = 'browser';
    localStorage.setItem('viewMode', 'browser');
    applyViewMode();
}

function switchToMobileView() {
    currentViewMode = 'mobile';
    localStorage.setItem('viewMode', 'mobile');
    applyViewMode();
}

// 네비게이션 함수들
function goToHome() {
    if (currentViewMode === 'browser') {
        // 브라우저 모드에서는 섹션으로 스크롤
        const homeSection = document.querySelector('.browser-main-content');
        if (homeSection) {
            homeSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // 모바일 모드에서는 기존 방식
        switchTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function switchTab(tabName) {
    if (currentViewMode === 'browser') {
        // 브라우저 모드에서는 네비게이션 클릭 시 해당 섹션으로 스크롤
        const targetSection = document.querySelector(`#browser-${tabName}-section`);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // 모바일 모드에서는 기존 탭 전환 방식
        // 모든 탭 콘텐츠 숨기기
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        // 선택한 탭 콘텐츠 표시
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // 탭 메뉴 활성화 상태 변경
        document.querySelectorAll('.tab-item').forEach(item => {
            item.classList.remove('active');
        });
        const tabItems = document.querySelectorAll('.tab-item');
        for (let i = 0; i < tabItems.length; i++) {
            if (tabItems[i].onclick.toString().includes(`'${tabName}'`)) {
                tabItems[i].classList.add('active');
                break;
            }
        }

        // **시설 탭**으로 전환 시에만 맵 초기화
        if (tabName === 'facility') {
            // 페이지네이션 초기화
            currentPage = 1;
            loadBuildingsByPage(currentPage);
            updatePaginationControls();

            // 맵을 보이게 한 다음에 초기화
            initNaverMapWithFix();
        }

        // 프로필 탭 전환 시
        if (tabName === 'profile') {
            setTimeout(() => {
                checkLoginStatus();
                updateAllProfileImages();
            }, 100);
        }

        // 홈 탭으로 전환 시 시간표 미리보기 업데이트
        if (tabName === 'home') {
            setTimeout(() => {
                updateTimetablePreview();
            }, 200);
        }
    }
}

// 페이지 초기화 함수
function initializePage() {
    console.log('=== 페이지 초기화 시작 ===');
    
    // 뷰 모드 감지 및 적용
    detectViewMode();
    
    // 기본으로 노선 1 선택
    selectedShuttleRoute = 1;
    
    // 초기 셔틀버스 정보 업데이트
    updateShuttleBusInfo();
    
    // 주기적 업데이트 (30초마다)
    shuttleBusInterval = setInterval(updateShuttleBusInfo, 30000);
    
    // 프로필 이미지 업데이트
    setTimeout(updateAllProfileImages, 100);
    
    // 로그인 상태 체크 및 UI 업데이트
    checkLoginStatus();
    
    // 저장된 위젯 설정 불러오기
    loadWidgetSettings();
    
    // 시설 탭 초기화 (페이지네이션 포함)
    initFacilityTab();
    
    // 네이버 지도 초기화
    initNaverMapWithFix();
    
    // 검색 기능 초기화
    initSearchFunctionality();
    
    // Placeholder 이미지 URL 문제 해결
    fixAllImageUrls();
    
    // 시간표 미리보기 초기화
    setTimeout(() => {
        console.log('시간표 미리보기 초기화');
        updateTimetablePreview();
        
        // 1분마다 시간표 미리보기 업데이트
        timetableInterval = setInterval(updateTimetablePreview, 60000);
    }, 1000);
    
    // 활동 통계 표시
    displayActivityStats();
    updateActivityNotices();
    
    // 다가오는 학사일정 표시
    displayUpcomingAcademicSchedule();
    
    // 5분마다 자동 갱신
    activityStatsInterval = setInterval(displayActivityStats, 300000);
    
    // 맛집 스타일 추가
    addRestaurantStyles();
    
    // 인기 맛집 정보 표시
    displayPopularRestaurantsOnMainPage();
    
    // 5분마다 새로고침
    restaurantInterval = setInterval(displayPopularRestaurantsOnMainPage, 300000);
    
    console.log('=== 페이지 초기화 완료 ===');
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    
    // 화면 크기 변경 시 뷰 모드 자동 조정 (선택사항)
    window.addEventListener('resize', function() {
        if (currentViewMode === 'auto') {
            detectViewMode();
        }
    });
    
    // localStorage 변경 감지를 위한 이벤트 리스너
    window.addEventListener('storage', function(event) {
        console.log('Storage 변경 감지:', event.key);
        
        // 프로필 관련 변경사항 감지
        if (event.key === 'profileUpdated' || 
            event.key === 'profileImageUpdated' || 
            event.key.includes('_profileImage') || 
            event.key.includes('_customProfileImage')) {
            console.log('프로필 정보 업데이트');
            updateAllProfileImages();
        }
        
        // 활동 데이터 변경 감지
        if (event.key === 'activityStats' || event.key === 'urgentActivities') {
            console.log('활동 데이터가 다른 탭에서 변경됨:', event.key);
            displayActivityStats();
            updateActivityNotices();
        }
        
        // 맛집 데이터 변경 감지
        if (event.key === 'restaurants') {
            console.log('맛집 데이터 변경 감지');
            displayPopularRestaurantsOnMainPage();
        }
        
        // 학사일정 데이터 변경 감지
        if (event.key === 'academicScheduleUpdated') {
            console.log('학사일정 데이터 변경 감지');
            displayUpcomingAcademicSchedule();
        }
    });

    // pageshow 이벤트 리스너 추가 - 뒤로가기로 돌아왔을 때 정보 갱신
    window.addEventListener('pageshow', function(event) {
        console.log('페이지 복원 감지:', event.persisted);
        
        // bfcache에서 페이지가 복원된 경우에도 실행
        if (event.persisted) {
            checkLoginStatus();
            updateAllProfileImages();
            updateShuttleBusInfo();
            displayActivityStats();
            displayUpcomingAcademicSchedule();
            displayPopularRestaurantsOnMainPage();
        }
    });
});

// 수정된 페이지 언로드 시 정리 작업
window.addEventListener('beforeunload', function(event) {
    console.log('페이지 언로드 시작: 정리 작업 수행 중...');
    
    // 위치 추적 중지
    if (typeof isTrackingUser !== 'undefined' && isTrackingUser) {
        stopUserTracking();
        console.log('위치 추적 중지 완료');
    }
    
    // 모든 인터벌 정리
    const intervals = [
        { name: 'timeInterval', ref: timeInterval },
        { name: 'shuttleBusInterval', ref: shuttleBusInterval },
        { name: 'timetableInterval', ref: timetableInterval },
        { name: 'activityStatsInterval', ref: activityStatsInterval },
        { name: 'restaurantInterval', ref: restaurantInterval }
    ];
    
    intervals.forEach(interval => {
        if (interval.ref) {
            clearInterval(interval.ref);
            console.log(`${interval.name} 정리 완료`);
        }
    });
    
    console.log('페이지 언로드: 모든 정리 작업 완료');
});

// 전역 함수: 모든 타이머 정리 (디버깅용)
function clearAllIntervals() {
    const intervals = [timeInterval, shuttleBusInterval, timetableInterval, activityStatsInterval, restaurantInterval];
    intervals.forEach((interval, index) => {
        if (interval) {
            clearInterval(interval);
            console.log(`인터벌 ${index + 1} 정리 완료`);
        }
    });
    
    // 변수 초기화
    timeInterval = null;
    shuttleBusInterval = null;
    timetableInterval = null;
    activityStatsInterval = null;
    restaurantInterval = null;
    
    console.log('모든 타이머 정리 완료');
}

// 기타 모든 기존 함수들도 동일하게 유지
// (여기서는 생략하고 실제로는 기존 코드의 모든 함수들이 포함되어야 함)

console.log('연성대학교 캠퍼스 가이드 JavaScript 로드 완료');
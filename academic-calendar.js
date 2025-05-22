// 전역 변수
let currentDate = new Date();
let currentSemester = '1';
let currentFilter = 'all';

// 2025학년도 연성대학교 학사일정 데이터
const academicSchedule = {
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
            description: '정시모집 면접 및 실기고사',
            important: true
        },
        {
            id: 315,
            title: '일반후학·전과·재입학 접수기간',
            date: '2026-01-26',
            endDate: '2026-01-30',
            type: 'registration',
            description: '일반후학 및 전과, 재입학 신청',
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
        {
            id: 318,
            title: '복학 접수기간',
            date: '2026-02-02',
            endDate: '2026-02-06',
            type: 'registration',
            description: '복학생 등록',
            important: false
        },
        {
            id: 319,
            title: '재학생(복학생) 수강신청 기간',
            date: '2026-02-02',
            endDate: '2026-02-10',
            type: 'registration',
            description: '재학생 및 복학생 수강신청',
            important: true
        },
        {
            id: 320,
            title: '2026학년도 정시 합격자 등록기간',
            date: '2026-02-03',
            endDate: '2026-02-05',
            type: 'registration',
            description: '정시합격자 등록',
            important: true
        },
        {
            id: 321,
            title: '1학기 재학생 등록기간',
            date: '2026-02-09',
            endDate: '2026-02-13',
            type: 'registration',
            description: '1학기 등록금 납부',
            important: true
        },
        {
            id: 322,
            title: '제48회 학위수여식',
            date: '2026-02-11',
            type: 'event',
            description: '졸업식',
            important: true
        },
        {
            id: 323,
            title: '설날 연휴',
            date: '2026-02-16',
            endDate: '2026-02-18',
            type: 'holiday',
            description: '설날 연휴 (휴강)',
            important: true
        },
        {
            id: 324,
            title: '2026학년도 입학식',
            date: '2026-02-24',
            type: 'event',
            description: '신입생 입학식',
            important: true
        }
    ]
};

// 이벤트 타입 라벨
const eventTypeLabels = {
    academic: '학사일정',
    exam: '시험',
    holiday: '공휴일/방학',
    event: '행사',
    registration: '수강신청'
};

// 월 이름 배열
const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('eventDetailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailModal();
        }
    });
});

// 학기 변경
function changeSemester() {
    currentSemester = document.getElementById('semesterSelect').value;
    renderCalendar();
    renderEventsList();
    renderSummaryCards();
}

// 캘린더 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 현재 월 표시
    document.getElementById('currentMonth').textContent = 
        `${year}년 ${monthNames[month]}`;
    
    // 달력 생성
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    // 이전 달의 빈 날짜들
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayElement = createDayElement(
            prevMonthDays - i, 
            new Date(year, month - 1, prevMonthDays - i), 
            true
        );
        calendarBody.appendChild(dayElement);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(
            day, 
            new Date(year, month, day), 
            false
        );
        calendarBody.appendChild(dayElement);
    }
    
    // 다음 달의 빈 날짜들
    const totalCells = calendarBody.children.length;
    const remainingCells = 42 - totalCells; // 6주 * 7일
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(
            day, 
            new Date(year, month + 1, day), 
            true
        );
        calendarBody.appendChild(dayElement);
    }
}

// 날짜 요소 생성
function createDayElement(dayNumber, date, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday(date)) {
        dayElement.classList.add('today');
    }
    
    // 주말 표시
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
        dayElement.classList.add('sunday');
    } else if (dayOfWeek === 6) {
        dayElement.classList.add('saturday');
    }
    
    dayElement.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        <div class="day-events" id="events-${formatDate(date)}"></div>
    `;
    
    // 해당 날짜의 이벤트 표시
    if (!isOtherMonth) {
        renderDayEvents(date);
    }
    
    return dayElement;
}

// 특정 날짜의 이벤트 렌더링
function renderDayEvents(date) {
    const dateString = formatDate(date);
    const dayEvents = getEventsForDate(dateString);
    const eventsContainer = document.getElementById(`events-${dateString}`);
    
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-item ${event.type}`;
            eventElement.textContent = event.title;
            eventElement.title = event.description;
            
            // 이벤트 클릭 시 상세보기
            eventElement.addEventListener('click', function(e) {
                e.stopPropagation();
                showEventDetail(event);
            });
            
            eventsContainer.appendChild(eventElement);
        });
    }
}

// 주요 일정 요약 카드 렌더링
function renderSummaryCards() {
    const summaryCards = document.getElementById('summaryCards');
    const events = academicSchedule[currentSemester] || [];
    
    // 중요한 일정만 필터링하고 날짜순 정렬
    const importantEvents = events
        .filter(event => event.important)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4); // 최대 4개만 표시
    
    summaryCards.innerHTML = '';
    
    importantEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = `summary-card ${event.type}`;
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        card.innerHTML = `
            <h4>${event.title}</h4>
            <div class="date">${dateText}</div>
            <div class="description">${event.description}</div>
        `;
        
        card.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        summaryCards.appendChild(card);
    });
}

// 일정 목록 렌더링
function renderEventsList() {
    const eventsList = document.getElementById('eventsList');
    const monthlyTitle = document.getElementById('monthlyTitle');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthlyTitle.textContent = `${year}년 ${monthNames[month]} 학사일정`;
    
    // 현재 학기와 월의 이벤트 필터링
    const events = academicSchedule[currentSemester] || [];
    let monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
        const currentMonthStart = new Date(year, month, 1);
        const currentMonthEnd = new Date(year, month + 1, 0);
        
        return (eventDate <= currentMonthEnd && eventEndDate >= currentMonthStart);
    });
    
    // 필터 적용
    if (currentFilter !== 'all') {
        monthEvents = monthEvents.filter(event => event.type === currentFilter);
    }
    
    // 날짜순 정렬
    monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsList.innerHTML = '';
    
    if (monthEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">해당 조건의 일정이 없습니다.</p>';
        return;
    }
    
    monthEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventCard.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-date">${dateText}</div>
            </div>
            <div class="event-card-description">${event.description}</div>
            <span class="event-type ${event.type}">
                ${eventTypeLabels[event.type]}
                ${event.important ? ' ★' : ''}
            </span>
        `;
        
        eventCard.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        eventsList.appendChild(eventCard);
    });
}

// 일정 필터링
function filterEvents(type) {
    currentFilter = type;
    
    // 필터 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    renderEventsList();
}

// 유틸리티 함수들
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateKorean(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function getEventsForDate(dateString) {
    const events = academicSchedule[currentSemester] || [];
    return events.filter(event => {
        if (event.endDate) {
            // 기간이 있는 이벤트
            return dateString >= event.date && dateString <= event.endDate;
        } else {
            // 단일 날짜 이벤트
            return event.date === dateString;
        }
    });
}

// 월 네비게이션 함수들
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    renderEventsList();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    renderEventsList();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
    renderEventsList();
}

// 모달 관리 함수들
function showEventDetail(event) {
    document.getElementById('detailTitle').textContent = event.title;
    
    const dateText = event.endDate ? 
        `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
        formatDateKorean(event.date);
    
    document.getElementById('detailDate').textContent = dateText;
    
    // 기간 정보가 있으면 표시
    if (event.endDate) {
        document.getElementById('detailPeriod').style.display = 'flex';
        const startDate = new Date(event.date);
        const endDate = new Date(event.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('detailPeriodText').textContent = `${diffDays}일간`;
    } else {
        document.getElementById('detailPeriod').style.display = 'none';
    }
    
    document.getElementById('detailType').textContent = eventTypeLabels[event.type];
    document.getElementById('detailType').className = `event-type ${event.type}`;
    document.getElementById('detailDescription').textContent = event.description;
    
    // 장소 정보가 있으면 표시
    if (event.location) {
        document.getElementById('detailLocation').style.display = 'flex';
        document.getElementById('detailLocationText').textContent = event.location;
    } else {
        document.getElementById('detailLocation').style.display = 'none';
    }
    
    document.getElementById('eventDetailModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('eventDetailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 키보드 이벤트 처리
document.addEventListener('keydown', function(e) {
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
        if (document.getElementById('eventDetailModal').style.display === 'block') {
            closeDetailModal();
        }
    }
    
    // 화살표 키로 월 이동
    if (e.target === document.body) {
        if (e.key === 'ArrowLeft') {
            prevMonth();
        } else if (e.key === 'ArrowRight') {
            nextMonth();
        }
    }
});

// 학사일정 검색 기능
function searchSchedule(query) {
    if (!query.trim()) {
        renderEventsList();
        return;
    }
    
    const events = academicSchedule[currentSemester] || [];
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
    
    // 검색 결과를 리스트에 표시
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">검색 결과가 없습니다.</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;
        
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventCard.innerHTML = `
            <div class="event-card-header">
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-date">${dateText}</div>
            </div>
            <div class="event-card-description">${event.description}</div>
            <span class="event-type ${event.type}">
                ${eventTypeLabels[event.type]}
                ${event.important ? ' ★' : ''}
            </span>
        `;
        
        eventCard.addEventListener('click', function() {
            showEventDetail(event);
        });
        
        eventsList.appendChild(eventCard);
    });
}

// 학사일정 출력 기능
function printSchedule() {
    const printWindow = window.open('', '_blank');
    const semesterText = {
        '1': '1학기',
        'summer': '여름학기',
        '2': '2학기',
        'winter': '겨울학기'
    }[currentSemester];
    
    const events = academicSchedule[currentSemester] || [];
    
    let eventsList = '';
    events.forEach(event => {
        const dateText = event.endDate ? 
            `${formatDateKorean(event.date)} ~ ${formatDateKorean(event.endDate)}` :
            formatDateKorean(event.date);
        
        eventsList += `
            <tr>
                <td>${dateText}</td>
                <td>${event.title}</td>
                <td>${eventTypeLabels[event.type]}</td>
                <td>${event.description}</td>
                <td>${event.location || '-'}</td>
            </tr>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>2025학년도 ${semesterText} 학사일정</title>
            <style>
                body { 
                    font-family: 'Malgun Gothic', sans-serif; 
                    margin: 20px; 
                    font-size: 12px;
                }
                h1 { 
                    color: #1e3c72; 
                    border-bottom: 3px solid #667eea; 
                    padding-bottom: 10px; 
                    text-align: center;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left;
                }
                th { 
                    background: #f8f9ff; 
                    font-weight: bold;
                }
                tr:nth-child(even) { 
                    background: #f9f9f9; 
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 10px;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <h1>연성대학교 2025학년도 ${semesterText} 학사일정</h1>
            <table>
                <thead>
                    <tr>
                        <th>날짜</th>
                        <th>일정명</th>
                        <th>구분</th>
                        <th>상세내용</th>
                        <th>장소</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventsList}
                </tbody>
            </table>
            <div class="footer">
                <p>한국대학교 학사팀 | 문의: 02-1234-5678</p>
                <p>출력일: ${new Date().toLocaleDateString('ko-KR')}</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// 오늘의 일정 알림
function showTodaySchedule() {
    const today = formatDate(new Date());
    const todayEvents = getEventsForDate(today);
    
    if (todayEvents.length > 0) {
        let message = '오늘의 학사일정:\n\n';
        todayEvents.forEach(event => {
            message += `• ${event.title}\n  ${event.description}\n\n`;
        });
        alert(message);
    } else {
        alert('오늘은 예정된 학사일정이 없습니다.');
    }
}

// 다가오는 일정 알림 (일주일 내)
function showUpcomingSchedule() {
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const events = academicSchedule[currentSemester] || [];
    
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= oneWeekLater;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingEvents.length > 0) {
        let message = '다가오는 일주일 일정:\n\n';
        upcomingEvents.forEach(event => {
            const daysUntil = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
            message += `• ${event.title}\n  날짜: ${formatDateKorean(event.date)}\n  ${daysUntil}일 후\n\n`;
        });
        alert(message);
    } else {
        alert('다가오는 일주일 내 예정된 학사일정이 없습니다.');
    }
}

// 학기별 통계 정보
function getSemesterStats() {
    const events = academicSchedule[currentSemester] || [];
    const stats = {
        total: events.length,
        academic: events.filter(e => e.type === 'academic').length,
        exam: events.filter(e => e.type === 'exam').length,
        holiday: events.filter(e => e.type === 'holiday').length,
        event: events.filter(e => e.type === 'event').length,
        registration: events.filter(e => e.type === 'registration').length,
        important: events.filter(e => e.important).length
    };
    return stats;
}

// 캘린더 스타일 테마 변경
function changeTheme(theme) {
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('calendarTheme', theme);
}

// 저장된 테마 로드
function loadTheme() {
    const savedTheme = localStorage.getItem('calendarTheme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
}

// 즐겨찾기 일정 관리
let favoriteEvents = JSON.parse(localStorage.getItem('favoriteEvents')) || [];

function toggleFavorite(eventId) {
    const index = favoriteEvents.indexOf(eventId);
    if (index > -1) {
        favoriteEvents.splice(index, 1);
    } else {
        favoriteEvents.push(eventId);
    }
    localStorage.setItem('favoriteEvents', JSON.stringify(favoriteEvents));
    renderEventsList();
}

function isFavorite(eventId) {
    return favoriteEvents.includes(eventId);
}

// 월별 이벤트 개수 표시
function updateMonthEventCount() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const events = academicSchedule[currentSemester] || [];
    
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
        const currentMonthStart = new Date(year, month, 1);
        const currentMonthEnd = new Date(year, month + 1, 0);
        
        return (eventDate <= currentMonthEnd && eventEndDate >= currentMonthStart);
    });
    
    // 월 제목 옆에 이벤트 개수 표시
    const currentMonthElement = document.getElementById('currentMonth');
    const eventCount = monthEvents.length;
    currentMonthElement.innerHTML = `
        ${year}년 ${monthNames[month]}
        <span style="font-size: 0.6em; color: #667eea; margin-left: 10px;">
            (${eventCount}개 일정)
        </span>
    `;
}

// 달력 렌더링 함수 수정 (월별 이벤트 개수 추가)
const originalRenderCalendar = renderCalendar;
renderCalendar = function() {
    originalRenderCalendar();
    updateMonthEventCount();
};

// 반응형 네비게이션 처리
function handleResponsiveNavigation() {
    const calendarNav = document.querySelector('.calendar-nav');
    const currentMonth = document.getElementById('currentMonth');
    
    if (window.innerWidth <= 768) {
        // 모바일에서는 버튼을 더 작게
        document.querySelectorAll('.nav-btn, .today-btn').forEach(btn => {
            btn.style.padding = '10px 15px';
            btn.style.fontSize = '0.9rem';
        });
        
        // 월 제목도 더 작게
        currentMonth.style.fontSize = '1.5rem';
    } else {
        // 데스크톱에서는 원래 크기
        document.querySelectorAll('.nav-btn, .today-btn').forEach(btn => {
            btn.style.padding = '15px 20px';
            btn.style.fontSize = '1.1rem';
        });
        
        currentMonth.style.fontSize = '2.2rem';
    }
}

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', handleResponsiveNavigation);

// 스크롤 시 헤더 고정
function handleScrollHeader() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.zIndex = '100';
        header.style.marginBottom = '20px';
    } else {
        header.style.position = 'relative';
        header.style.marginBottom = '30px';
    }
}

window.addEventListener('scroll', handleScrollHeader);

// 캘린더 애니메이션 효과
function animateCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach((day, index) => {
        day.style.opacity = '0';
        day.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            day.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            day.style.opacity = '1';
            day.style.transform = 'translateY(0)';
        }, index * 20);
    });
}

// 데이터 내보내기 (JSON 형식)
function exportScheduleData() {
    const dataStr = JSON.stringify(academicSchedule, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic_schedule_2025.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('학사일정 데이터가 내보내기되었습니다.');
}

// CSV 형식으로 일정 내보내기
function exportScheduleCSV() {
    const events = academicSchedule[currentSemester] || [];
    let csvContent = '날짜,종료날짜,제목,구분,설명,장소,중요도\n';
    
    events.forEach(event => {
        const row = [
            event.date,
            event.endDate || '',
            `"${event.title}"`,
            eventTypeLabels[event.type],
            `"${event.description}"`,
            event.location || '',
            event.important ? '중요' : '일반'
        ].join(',');
        csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic_schedule_${currentSemester}_2025.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('학사일정이 CSV 파일로 내보내기되었습니다.');
}

// iCal 형식으로 일정 내보내기
function exportScheduleICal() {
    const events = academicSchedule[currentSemester] || [];
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//한국대학교//학사일정//KO'
    ].join('\n');
    
    events.forEach(event => {
        const startDate = event.date.replace(/-/g, '');
        const endDate = event.endDate ? event.endDate.replace(/-/g, '') : startDate;
        
        icalContent += '\n' + [
            'BEGIN:VEVENT',
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description}`,
            `LOCATION:${event.location || ''}`,
            `CATEGORIES:${eventTypeLabels[event.type]}`,
            `UID:${event.id}@university.ac.kr`,
            'END:VEVENT'
        ].join('\n');
    });
    
    icalContent += '\nEND:VCALENDAR';
    
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic_schedule_${currentSemester}_2025.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('학사일정이 iCal 파일로 내보내기되었습니다.');
}

// 접근성 향상을 위한 키보드 네비게이션
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                document.getElementById('semesterSelect').value = '1';
                changeSemester();
                break;
            case '2':
                document.getElementById('semesterSelect').value = '2';
                changeSemester();
                break;
            case 's':
                document.getElementById('semesterSelect').value = 'summer';
                changeSemester();
                break;
            case 'w':
                document.getElementById('semesterSelect').value = 'winter';
                changeSemester();
                break;
            case 't':
                goToToday();
                break;
            case 'p':
                printSchedule();
                break;
        }
    }
});

// 초기화 함수들을 페이지 로드 시 실행
window.addEventListener('load', function() {
    loadTheme();
    handleResponsiveNavigation();
    setTimeout(animateCalendar, 100);
});

// 페이지 가시성 API를 사용한 자동 새로고침
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 페이지가 다시 보일 때 오늘 날짜로 업데이트
        const today = new Date();
        if (today.toDateString() !== currentDate.toDateString()) {
            currentDate = today;
            renderCalendar();
            renderEventsList();
        }
    }
});

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }, function(err) {
            console.log('ServiceWorker registration failed');
        });
    });
}

// 알림 권한 요청 및 중요 일정 알림
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('알림 권한이 승인되었습니다.');
                checkImportantEvents();
            }
        });
    }
}

// 중요한 일정 확인 및 알림
function checkImportantEvents() {
    if (Notification.permission === 'granted') {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const events = academicSchedule[currentSemester] || [];
        
        const importantTomorrowEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return event.important && 
                   eventDate.toDateString() === tomorrow.toDateString();
        });
        
        importantTomorrowEvents.forEach(event => {
            new Notification(`내일 중요 일정: ${event.title}`, {
                body: event.description,
                icon: '/icon-192x192.png'
            });
        });
    }
}

// 페이지 로드 시 알림 권한 요청
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(requestNotificationPermission, 2000);
});
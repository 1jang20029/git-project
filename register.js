// 휴대폰 번호 자동 하이픈 추가 함수
function formatPhoneNumber(input) {
    // 숫자 이외의 문자 제거
    let phoneNumber = input.value.replace(/[^0-9]/g, '');
    
    // 하이픈 추가
    if (phoneNumber.length > 3 && phoneNumber.length <= 7) {
        // 010-1234 형식
        phoneNumber = phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3);
    } else if (phoneNumber.length > 7) {
        // 010-1234-5678 형식
        phoneNumber = phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7) + '-' + phoneNumber.substring(7);
    }
    
    // 입력 필드 값 업데이트
    input.value = phoneNumber;
    
    // 실시간 유효성 검사
    validatePhoneNumber(phoneNumber);
}

// 휴대폰 번호 유효성 검사
function validatePhoneNumber(phoneNumber) {
    const errorDiv = document.getElementById('phone-error');
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (phoneNumber && (!cleanNumber.startsWith('010') || cleanNumber.length !== 11)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 이메일 유효성 검사
function validateEmail(email) {
    const errorDiv = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    const errorDiv = document.getElementById('password-error');
    // 영문, 숫자, 특수문자를 포함한 8자 이상
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    
    if (password && !passwordRegex.test(password)) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 비밀번호 확인 유효성 검사
function validatePasswordConfirm(password, confirmPassword) {
    const errorDiv = document.getElementById('confirmPassword-error');
    
    if (confirmPassword && password !== confirmPassword) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// 역할별 ID 패턴 검증 함수
function validateIdPattern(role, id) {
    switch(role) {
        case 'student':
            // 학생: 10자리 숫자만 (예: 2024123456)
            return /^\d{10}$/.test(id);
        case 'professor':
            // 교수: 7자리 숫자만 (예: 2024001)
            return /^\d{7}$/.test(id);
        case 'staff':
            // 교직원: 7자리 숫자만 (예: 2024001)
            return /^\d{7}$/.test(id);
        default:
            return false;
    }
}

// 역할 변경 시 UI 업데이트
function updateUIByRole(role) {
    const idLabel = document.getElementById('idLabel');
    const idInput = document.getElementById('studentId');
    const idHint = document.getElementById('idHint');
    const gradeGroup = document.getElementById('gradeGroup');
    const approvalNotice = document.getElementById('approvalNotice');
    const verificationSection = document.getElementById('verificationSection');
    const verificationTitle = document.getElementById('verificationTitle');
    const staffOptions = document.querySelectorAll('.staff-option');
    const staffCategory = document.getElementById('staffCategory');
    
    // 기존 에러 메시지 숨기기
    document.getElementById('studentId-error').style.display = 'none';
    
    switch(role) {
        case 'student':
            idLabel.textContent = '학번';
            idInput.placeholder = '학번을 입력하세요';
            idHint.textContent = '예: 2024123456 (10자리)';
            gradeGroup.style.display = 'block';
            approvalNotice.style.display = 'none';
            verificationSection.style.display = 'none';
            
            // 교직원 부서 옵션 숨기기
            staffOptions.forEach(option => option.style.display = 'none');
            staffCategory.style.display = 'none';
            break;
            
        case 'professor':
            idLabel.textContent = '교번';
            idInput.placeholder = '교번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            approvalNotice.style.display = 'block';
            verificationSection.style.display = 'block';
            verificationTitle.textContent = '교수 신원 인증';
            
            // 교직원 부서 옵션 숨기기
            staffOptions.forEach(option => option.style.display = 'none');
            staffCategory.style.display = 'none';
            break;
            
        case 'staff':
            idLabel.textContent = '직번';
            idInput.placeholder = '직번을 입력하세요';
            idHint.textContent = '예: 2024001 (7자리)';
            gradeGroup.style.display = 'none';
            approvalNotice.style.display = 'block';
            verificationSection.style.display = 'block';
            verificationTitle.textContent = '교직원 신원 인증';
            
            // 교직원 부서 옵션 표시
            staffOptions.forEach(option => option.style.display = 'block');
            staffCategory.style.display = 'block';
            break;
    }
    
    // 입력값 초기화
    idInput.value = '';
    document.getElementById('departmentInput').value = '';
    document.getElementById('selectedDepartment').value = '';
    
    // 인증 관련 입력값 초기화
    if (verificationSection.style.display === 'block') {
        resetVerificationForm();
    }
}

// 학과 검색 기능
function setupDepartmentSearch() {
    const departmentInput = document.getElementById('departmentInput');
    const departmentDropdown = document.getElementById('departmentDropdown');
    const selectedDepartment = document.getElementById('selectedDepartment');
    const departmentOptions = document.querySelectorAll('.department-option');
    
    // 입력 시 검색 기능
    departmentInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        let hasVisibleOptions = false;
        
        if (searchTerm.length > 0) {
            departmentDropdown.style.display = 'block';
            
            // 카테고리와 옵션 필터링
            const categories = departmentDropdown.querySelectorAll('.department-category');
            const options = departmentDropdown.querySelectorAll('.department-option');
            
            // 모든 카테고리 숨기기
            categories.forEach(category => category.style.display = 'none');
            
            // 검색어와 일치하는 옵션 표시
            options.forEach(option => {
                const optionText = option.textContent.toLowerCase();
                if (optionText.includes(searchTerm)) {
                    option.style.display = 'block';
                    hasVisibleOptions = true;
                    
                    // 해당 옵션의 이전 카테고리 표시
                    let prevElement = option.previousElementSibling;
                    while (prevElement) {
                        if (prevElement.classList.contains('department-category')) {
                            prevElement.style.display = 'block';
                            break;
                        }
                        prevElement = prevElement.previousElementSibling;
                    }
                } else {
                    option.style.display = 'none';
                }
            });
            
            if (!hasVisibleOptions) {
                departmentDropdown.style.display = 'none';
            }
        } else {
            departmentDropdown.style.display = 'none';
        }
    });
    
    // 클릭 시 전체 드롭다운 표시
    departmentInput.addEventListener('focus', function() {
        if (this.value.length === 0) {
            departmentDropdown.style.display = 'block';
            
            // 모든 옵션과 카테고리 표시
            const categories = departmentDropdown.querySelectorAll('.department-category');
            const options = departmentDropdown.querySelectorAll('.department-option');
            
            categories.forEach(category => {
                if (category.id === 'staffCategory') {
                    // 교직원 카테고리는 역할에 따라 표시
                    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
                    category.style.display = selectedRole === 'staff' ? 'block' : 'none';
                } else {
                    category.style.display = 'block';
                }
            });
            
            options.forEach(option => {
                if (option.classList.contains('staff-option')) {
                    // 교직원 옵션은 역할에 따라 표시
                    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
                    option.style.display = selectedRole === 'staff' ? 'block' : 'none';
                } else {
                    option.style.display = 'block';
                }
            });
        }
    });
    
    // 옵션 클릭 이벤트
    departmentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            const text = this.textContent;
            
            departmentInput.value = text;
            selectedDepartment.value = value;
            departmentDropdown.style.display = 'none';
        });
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.department-container')) {
            departmentDropdown.style.display = 'none';
        }
    });
}

// 학년 드롭다운 기능
function setupGradeDropdown() {
    const dropdownBtn = document.getElementById('gradeDropdownBtn');
    const dropdown = document.getElementById('gradeDropdown');
    const options = document.querySelectorAll('.grade-option');
    const selectedGradeInput = document.getElementById('selectedGrade');
    
    // 드롭다운 표시/숨김 토글
    dropdownBtn.addEventListener('click', function() {
        dropdown.classList.toggle('show');
    });
    
    // 학년 옵션 선택 시
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            const text = this.textContent;
            
            // 버튼 텍스트 업데이트
            dropdownBtn.textContent = text;
            
            // 숨겨진 입력 필드에 값 설정
            selectedGradeInput.value = value;
            
            // 드롭다운 닫기
            dropdown.classList.remove('show');
        });
    });
    
    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.grade-button') && !event.target.matches('.grade-option')) {
            dropdown.classList.remove('show');
        }
    });
}

// OCR 라이브러리들 로드 상태 확인
let ocrLibrariesLoaded = {
    tesseract: false,
    opencv: false
};

// 여러 OCR 라이브러리 동적 로드
function loadOCRLibraries() {
    return new Promise((resolve, reject) => {
        if (ocrLibrariesLoaded.tesseract && ocrLibrariesLoaded.opencv) {
            resolve();
            return;
        }
        
        const promises = [];
        
        // Tesseract.js 로드
        if (!ocrLibrariesLoaded.tesseract) {
            const tesseractPromise = new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
                script.onload = () => {
                    ocrLibrariesLoaded.tesseract = true;
                    res();
                };
                script.onerror = rej;
                document.head.appendChild(script);
            });
            promises.push(tesseractPromise);
        }
        
        // OpenCV.js 로드 (이미지 전처리용)
        if (!ocrLibrariesLoaded.opencv) {
            const opencvPromise = new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
                script.onload = () => {
                    // OpenCV 초기화 대기
                    const checkOpenCV = () => {
                        if (typeof cv !== 'undefined' && cv.Mat) {
                            ocrLibrariesLoaded.opencv = true;
                            res();
                        } else {
                            setTimeout(checkOpenCV, 100);
                        }
                    };
                    checkOpenCV();
                };
                script.onerror = () => {
                    // OpenCV 로드 실패해도 진행
                    ocrLibrariesLoaded.opencv = false;
                    res();
                };
                document.head.appendChild(script);
            });
            promises.push(opencvPromise);
        }
        
        Promise.all(promises).then(resolve).catch(reject);
    });
}

// 이미지 전처리 (OpenCV 사용)
function preprocessImage(imageElement) {
    return new Promise((resolve) => {
        try {
            if (!ocrLibrariesLoaded.opencv || typeof cv === 'undefined') {
                // OpenCV 없으면 원본 반환
                resolve(imageElement);
                return;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            ctx.drawImage(imageElement, 0, 0);
            
            const src = cv.imread(canvas);
            const dst = new cv.Mat();
            
            // 그레이스케일 변환
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            
            // 가우시안 블러로 노이즈 제거
            const ksize = new cv.Size(3, 3);
            cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
            
            // 적응형 임계값으로 이진화
            cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
            
            // 결과를 캔버스에 출력
            cv.imshow(canvas, dst);
            
            // 메모리 정리
            src.delete();
            dst.delete();
            
            resolve(canvas);
        } catch (error) {
            console.warn('이미지 전처리 실패, 원본 사용:', error);
            resolve(imageElement);
        }
    });
}

// 여러 OCR 엔진으로 텍스트 추출
async function extractTextWithMultipleEngines(file) {
    const results = [];
    
    try {
        await loadOCRLibraries();
        
        // 이미지 로드
        const imageElement = await loadImageElement(file);
        
        // 1. 원본 이미지로 OCR
        try {
            const originalResult = await Tesseract.recognize(
                imageElement,
                'kor+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('원본 이미지 분석', Math.round(m.progress * 30));
                        }
                    }
                }
            );
            results.push({
                source: 'original',
                text: originalResult.data.text,
                confidence: originalResult.data.confidence
            });
        } catch (error) {
            console.warn('원본 이미지 OCR 실패:', error);
        }
        
        // 2. 전처리된 이미지로 OCR
        try {
            const preprocessedImage = await preprocessImage(imageElement);
            const preprocessedResult = await Tesseract.recognize(
                preprocessedImage,
                'kor+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('전처리 이미지 분석', 30 + Math.round(m.progress * 30));
                        }
                    }
                }
            );
            results.push({
                source: 'preprocessed',
                text: preprocessedResult.data.text,
                confidence: preprocessedResult.data.confidence
            });
        } catch (error) {
            console.warn('전처리 이미지 OCR 실패:', error);
        }
        
        // 3. 다른 설정으로 OCR
        try {
            updateOCRProgress('추가 분석', 60);
            const enhancedResult = await Tesseract.recognize(
                imageElement,
                'kor+eng',
                {
                    tessedit_pageseg_mode: '6', // 단일 블록 텍스트
                    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz가-힣 ',
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('추가 분석', 60 + Math.round(m.progress * 30));
                        }
                    }
                }
            );
            results.push({
                source: 'enhanced',
                text: enhancedResult.data.text,
                confidence: enhancedResult.data.confidence
            });
        } catch (error) {
            console.warn('향상된 OCR 실패:', error);
        }
        
        updateOCRProgress('분석 완료', 100);
        
    } catch (error) {
        console.error('OCR 처리 중 오류:', error);
        throw error;
    }
    
    return results;
}

// 이미지 엘리먼트 로드
function loadImageElement(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// OCR 진행 상황 업데이트 (향상됨)
function updateOCRProgress(stage, progress) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = `${stage}... ${progress}%`;
    }
}

// 시각적 패턴 분석 (카드 모양, 레이아웃 등)
async function analyzeVisualPatterns(file) {
    try {
        if (!ocrLibrariesLoaded.opencv || typeof cv === 'undefined') {
            return null;
        }
        
        const imageElement = await loadImageElement(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx.drawImage(imageElement, 0, 0);
        
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        
        // 그레이스케일 변환
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // 카드 모양 감지 (직사각형 검출)
        const edges = new cv.Mat();
        cv.Canny(gray, edges, 50, 150);
        
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        
        let hasCardShape = false;
        const imageArea = imageElement.width * imageElement.height;
        
        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            
            // 이미지의 10% 이상을 차지하는 직사각형이 있으면 카드로 판단
            if (area > imageArea * 0.1) {
                const approx = new cv.Mat();
                const peri = cv.arcLength(contour, true);
                cv.approxPolyDP(contour, approx, 0.02 * peri, true);
                
                if (approx.rows === 4) { // 사각형
                    hasCardShape = true;
                }
                
                approx.delete();
            }
            contour.delete();
        }
        
        // 메모리 정리
        src.delete();
        gray.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        
        return {
            hasCardShape: hasCardShape,
            aspectRatio: imageElement.width / imageElement.height
        };
        
    } catch (error) {
        console.warn('시각적 패턴 분석 실패:', error);
        return null;
    }
}

// 유연한 키워드 매칭 (오타 허용)
function fuzzyMatch(text, keyword) {
    const normalizedText = text.toLowerCase().replace(/\s+/g, '');
    const normalizedKeyword = keyword.toLowerCase();
    
    // 정확한 매칭
    if (normalizedText.includes(normalizedKeyword)) {
        return 3;
    }
    
    // 부분 매칭 (키워드의 70% 이상)
    const threshold = Math.ceil(normalizedKeyword.length * 0.7);
    let matchCount = 0;
    
    for (let i = 0; i <= normalizedKeyword.length - threshold; i++) {
        const substring = normalizedKeyword.substring(i, i + threshold);
        if (normalizedText.includes(substring)) {
            matchCount++;
        }
    }
    
    if (matchCount > 0) {
        return 2;
    }
    
    // 개별 문자 매칭 (50% 이상)
    let charMatches = 0;
    for (const char of normalizedKeyword) {
        if (normalizedText.includes(char)) {
            charMatches++;
        }
    }
    
    if (charMatches >= normalizedKeyword.length * 0.5) {
        return 1;
    }
    
    return 0;
}

// 향상된 텍스트 분석 (여러 OCR 결과 종합)
function analyzeExtractedTexts(ocrResults, visualPatterns) {
    console.log('OCR 결과들:', ocrResults);
    console.log('시각적 패턴:', visualPatterns);
    
    // 모든 OCR 결과 텍스트 결합
    const allTexts = ocrResults.map(result => result.text).join(' ');
    const normalizedText = allTexts.toLowerCase().replace(/\s+/g, ' ').trim();
    
    console.log('결합된 텍스트:', normalizedText);
    
    // 교직원증 관련 키워드 (유연한 매칭)
    const employeeCardKeywords = [
        '교직원증', '신분증', '사원증', '직원증', '교번', '직번', '사번',
        'employee', 'staff', 'id', 'card', '연성대학교', '대학교', '연성',
        '소속', '부서', '직급', '성명', '생년월일', '발급일',
        'yeonsung', 'university', 'college'
    ];
    
    // 임용서류 관련 키워드
    const appointmentKeywords = [
        '임용', '발령', '임명', '채용', '계약', '고용',
        'appointment', '임용장', '발령장', '계약서',
        '인사발령', '임용통지', '채용통지', '임용기간',
        '발령일', '임용일', '채용일', '계약기간', '근무기간',
        '인사명령', '발령사항', '임용사항', '인사명'
    ];
    
    // 급여명세서 관련 키워드
    const payslipKeywords = [
        '급여', '월급', '봉급', '임금', '소득', '급여명세',
        'salary', 'pay', '급여지급', '월급명세', '임금명세',
        '기본급', '수당', '공제', '실지급액', '급여계산서',
        '소득세', '국민연금', '건강보험', '고용보험',
        '지급총액', '공제총액', '차인지급액', '급여내역'
    ];
    
    // 제외할 키워드
    const excludeKeywords = [
        '시간표', '수업', '강의', '과제', '과목', '성적',
        'schedule', 'class', 'course', '학습', '교육과정',
        '출석', '학점', '평가', '과제물', '리포트'
    ];
    
    // 제외 키워드 체크
    for (let keyword of excludeKeywords) {
        if (fuzzyMatch(normalizedText, keyword) > 0) {
            return null;
        }
    }
    
    // 각 문서 유형별 점수 계산 (유연한 매칭)
    let employeeScore = 0;
    let appointmentScore = 0;
    let payslipScore = 0;
    
    // 시각적 패턴 보너스
    if (visualPatterns && visualPatterns.hasCardShape) {
        employeeScore += 2; // 카드 모양은 교직원증에 유리
    }
    
    // 교직원증 키워드 점수 계산
    for (let keyword of employeeCardKeywords) {
        const matchScore = fuzzyMatch(normalizedText, keyword);
        if (matchScore > 0) {
            if (keyword === '교직원증' || keyword === '신분증') {
                employeeScore += matchScore * 3; // 핵심 키워드
            } else if (keyword === '연성대학교' || keyword === '연성' || keyword === '대학교') {
                employeeScore += matchScore * 2; // 기관명
            } else if (keyword === '교번' || keyword === '직번' || keyword === '사번') {
                employeeScore += matchScore * 2; // 번호 관련
            } else {
                employeeScore += matchScore; // 일반 키워드
            }
        }
    }
    
    // 임용서류 키워드 점수 계산
    for (let keyword of appointmentKeywords) {
        const matchScore = fuzzyMatch(normalizedText, keyword);
        if (matchScore > 0) {
            if (keyword === '임용' || keyword === '발령' || keyword === '임용장' || keyword === '발령장') {
                appointmentScore += matchScore * 3; // 핵심 키워드
            } else if (keyword === '임용일' || keyword === '발령일' || keyword === '계약기간') {
                appointmentScore += matchScore * 2; // 날짜/기간 관련
            } else {
                appointmentScore += matchScore; // 일반 키워드
            }
        }
    }
    
    // 급여명세서 키워드 점수 계산
    for (let keyword of payslipKeywords) {
        const matchScore = fuzzyMatch(normalizedText, keyword);
        if (matchScore > 0) {
            if (keyword === '급여명세' || keyword === '급여' || keyword === '급여명세서') {
                payslipScore += matchScore * 3; // 핵심 키워드
            } else if (keyword === '기본급' || keyword === '실지급액' || keyword === '지급총액') {
                payslipScore += matchScore * 2; // 금액 관련
            } else if (keyword === '소득세' || keyword === '국민연금' || keyword === '건강보험') {
                payslipScore += matchScore * 2; // 공제 항목
            } else {
                payslipScore += matchScore; // 일반 키워드
            }
        }
    }
    
    console.log('점수:', { employeeScore, appointmentScore, payslipScore });
    
    // 최고 점수 유형 반환 (최소 2점 이상이어야 함)
    const maxScore = Math.max(employeeScore, appointmentScore, payslipScore);
    
    if (maxScore < 2) {
        return null; // 확신도가 낮음
    }
    
    if (employeeScore === maxScore && employeeScore >= 2) {
        return 'employeeCard';
    } else if (appointmentScore === maxScore && appointmentScore >= 2) {
        return 'appointmentDoc';
    } else if (payslipScore === maxScore && payslipScore >= 2) {
        return 'payslip';
    }
    
    return null;
}

// 고급 이미지 내용 분석 (모든 기술 통합)
async function analyzeImageContent(file, callback) {
    try {
        // PDF 파일은 OCR 처리하지 않음
        if (file.type === 'application/pdf') {
            callback(null);
            return;
        }
        
        // 이미지 파일만 OCR 처리
        if (file.type.startsWith('image/')) {
            try {
                // 1. 여러 OCR 엔진으로 텍스트 추출
                const ocrResults = await extractTextWithMultipleEngines(file);
                
                // 2. 시각적 패턴 분석
                const visualPatterns = await analyzeVisualPatterns(file);
                
                // 3. 종합 분석
                const detectedType = analyzeExtractedTexts(ocrResults, visualPatterns);
                
                callback(detectedType);
            } catch (error) {
                console.error('고급 이미지 분석 실패:', error);
                callback(null);
            }
        } else {
            callback(null); // 지원하지 않는 파일 형식
        }
        
    } catch (error) {
        console.error('이미지 분석 중 오류:', error);
        callback(null);
    }
}

// 사용자 확인 옵션 제공
function showUserConfirmationDialog(file, selectedMethod, callback) {
    // 기존 다이얼로그 제거
    const existingDialog = document.querySelector('.user-confirmation-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    const dialog = document.createElement('div');
    dialog.className = 'user-confirmation-dialog';
    dialog.innerHTML = `
        <div class="dialog-backdrop"></div>
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>수동 확인</h3>
                <button class="dialog-close" onclick="closeConfirmationDialog()">&times;</button>
            </div>
            <div class="dialog-body">
                <p>자동 인식에 실패했습니다. 업로드하신 파일을 직접 확인해주세요.</p>
                <div class="file-preview">
                    <img id="previewImage" src="" alt="업로드된 파일" style="max-width: 100%; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="confirmation-question">
                    <p><strong>이 파일이 ${getDocumentTypeName(selectedMethod)}이(가) 맞습니까?</strong></p>
                    <div class="dialog-buttons">
                        <button class="btn-yes" onclick="confirmUserVerification(true)">네, 맞습니다</button>
                        <button class="btn-no" onclick="confirmUserVerification(false)">아니오, 다른 파일입니다</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 이미지 미리보기 설정
    const previewImage = document.getElementById('previewImage');
    previewImage.src = URL.createObjectURL(file);
    
    // 콜백 저장 (전역에서 접근 가능하도록)
    window.userConfirmationCallback = callback;
}

// 사용자 확인 다이얼로그 닫기
function closeConfirmationDialog() {
    const dialog = document.querySelector('.user-confirmation-dialog');
    if (dialog) {
        dialog.remove();
    }
    if (window.userConfirmationCallback) {
        window.userConfirmationCallback(false, '사용자가 확인을 취소했습니다.');
        window.userConfirmationCallback = null;
    }
}

// 사용자 확인 결과 처리
function confirmUserVerification(isCorrect) {
    const dialog = document.querySelector('.user-confirmation-dialog');
    if (dialog) {
        dialog.remove();
    }
    
    if (window.userConfirmationCallback) {
        if (isCorrect) {
            window.userConfirmationCallback(true, '사용자가 올바른 서류임을 확인했습니다.');
        } else {
            window.userConfirmationCallback(false, '다른 종류의 서류를 업로드해주세요.');
        }
        window.userConfirmationCallback = null;
    }
}

// 파일과 선택된 인증 방법의 일치성 검증 (모든 기능 통합)
function validateFileMatch(file, selectedMethod, callback) {
    const loadingIndicator = showFileAnalysisLoading();
    
    analyzeImageContent(file, (detectedType) => {
        hideFileAnalysisLoading(loadingIndicator);
        
        let isValid = false;
        let message = '';
        
        if (detectedType === selectedMethod) {
            isValid = true;
            message = '올바른 서류가 인식되었습니다.';
            callback(isValid, message);
        } else if (detectedType === null) {
            // 자동 인식 실패 시 사용자 확인 요청
            showUserConfirmationDialog(file, selectedMethod, callback);
        } else {
            // 다른 유형의 문서가 감지된 경우
            const detectedName = getDocumentTypeName(detectedType);
            const expectedName = getDocumentTypeName(selectedMethod);
            message = `${detectedName}이(가) 인식되었습니다. ${expectedName}을(를) 업로드해주세요.`;
            callback(false, message);
        }
    });
}

// 문서 유형명 반환
function getDocumentTypeName(type) {
    switch(type) {
        case 'employeeCard': return '교직원증';
        case 'appointmentDoc': return '임용서류';
        case 'payslip': return '급여명세서';
        default: return '알 수 없는 문서';
    }
}

// 파일 분석 로딩 표시 (향상됨)
function showFileAnalysisLoading() {
    const uploadedFile = document.getElementById('uploadedFile');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'file-analysis-loading';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">고급 이미지 분석을 시작합니다...</div>
            <div class="loading-details">여러 OCR 엔진과 시각적 패턴 분석을 사용합니다</div>
        </div>
    `;
    
    uploadedFile.appendChild(loadingDiv);
    return loadingDiv;
}

// 파일 분석 로딩 숨기기
function hideFileAnalysisLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
    }
}

// 파일 검증 결과 표시
function showFileValidationResult(isValid, message) {
    // 기존 검증 결과 제거
    const existingResult = document.querySelector('.file-validation-result');
    if (existingResult) {
        existingResult.remove();
    }
    
    const uploadedFile = document.getElementById('uploadedFile');
    const resultDiv = document.createElement('div');
    resultDiv.className = `file-validation-result ${isValid ? 'valid' : 'invalid'}`;
    resultDiv.innerHTML = `
        <div class="validation-icon">${isValid ? '✅' : '❌'}</div>
        <div class="validation-message">${message}</div>
    `;
    
    uploadedFile.appendChild(resultDiv);
    
    // 파일 에러 메시지 숨기기/표시
    const fileError = document.getElementById('file-error');
    if (isValid) {
        fileError.style.display = 'none';
    } else {
        fileError.style.display = 'block';
        fileError.textContent = message;
    }
}

// 파일 업로드 관련 함수들
function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('verificationFile');
    const uploadedFile = document.getElementById('uploadedFile');
    const uploadPlaceholder = fileUploadArea.querySelector('.upload-placeholder');
    
    // 클릭으로 파일 선택
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 파일 선택 시
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // 드래그 앤 드롭
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

function handleFileUpload(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    // 파일 크기 검사
    if (file.size > maxSize) {
        alert('파일 크기가 10MB를 초과합니다.');
        return;
    }
    
    // 파일 형식 검사
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, PDF 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일 정보 표시
    displayUploadedFile(file);
    
    // 선택된 인증 방법 확인
    const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
    if (selectedMethod) {
        // 고급 파일 검증 (모든 기술 통합)
        validateFileMatch(file, selectedMethod.value, (isValid, message) => {
            showFileValidationResult(isValid, message);
        });
    }
}

function displayUploadedFile(file) {
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const uploadedFile = document.getElementById('uploadedFile');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    // 파일 정보 설정
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // UI 업데이트
    uploadPlaceholder.style.display = 'none';
    uploadedFile.style.display = 'flex';
}

function removeFile() {
    const fileInput = document.getElementById('verificationFile');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const uploadedFile = document.getElementById('uploadedFile');
    
    // 파일 입력 초기화
    fileInput.value = '';
    
    // 검증 결과 제거
    const validationResult = document.querySelector('.file-validation-result');
    if (validationResult) {
        validationResult.remove();
    }
    
    // 사용자 확인 다이얼로그 제거
    const dialog = document.querySelector('.user-confirmation-dialog');
    if (dialog) {
        dialog.remove();
    }
    
    // UI 업데이트
    uploadedFile.style.display = 'none';
    uploadPlaceholder.style.display = 'flex';
    
    // 파일 에러 메시지 숨기기
    document.getElementById('file-error').style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function resetVerificationForm() {
    // 인증 방법 선택 초기화
    const verificationMethods = document.querySelectorAll('input[name="verificationType"]');
    verificationMethods.forEach(method => method.checked = false);
    
    // 파일 업로드 초기화
    removeFile();
}

function validateVerification(selectedRole) {
    if (selectedRole !== 'professor' && selectedRole !== 'staff') {
        return true; // 학생은 인증 불필요
    }
    
    // 인증 방법 선택 확인
    const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
    if (!selectedMethod) {
        alert('인증 방법을 선택해주세요.');
        return false;
    }
    
    // 파일 업로드 확인
    const fileInput = document.getElementById('verificationFile');
    if (!fileInput.files || fileInput.files.length === 0) {
        document.getElementById('file-error').style.display = 'block';
        document.getElementById('file-error').textContent = '인증 서류를 업로드해주세요.';
        return false;
    }
    
    // 파일 검증 결과 확인
    const validationResult = document.querySelector('.file-validation-result');
    if (!validationResult || validationResult.classList.contains('invalid')) {
        alert('올바른 인증 서류를 업로드해주세요. 고급 이미지 인식과 사용자 확인을 통해 검증해주세요.');
        return false;
    }
    
    return true;
}

// 인증 방법 변경 시 파일 재검증
function setupVerificationMethodChange() {
    const verificationMethods = document.querySelectorAll('input[name="verificationType"]');
    verificationMethods.forEach(method => {
        method.addEventListener('change', function() {
            const fileInput = document.getElementById('verificationFile');
            if (fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                
                // 기존 검증 결과 제거
                const existingResult = document.querySelector('.file-validation-result');
                if (existingResult) {
                    existingResult.remove();
                }
                
                // 새로운 방법으로 재검증
                validateFileMatch(file, this.value, (isValid, message) => {
                    showFileValidationResult(isValid, message);
                });
            }
        });
    });
}

// 소셜 타입명 변환 함수
function getSocialTypeName(type) {
    switch(type) {
        case 'kakao': return '카카오';
        case 'google': return '구글';
        case 'naver': return '네이버';
        default: return '소셜';
    }
}

// 역할별 에러 메시지 반환
function getIdErrorMessage(role) {
    switch(role) {
        case 'student':
            return '10자리 숫자로 입력해주세요 (예: 2024123456)';
        case 'professor':
            return '7자리 숫자로 입력해주세요 (예: 2024001)';
        case 'staff':
            return '7자리 숫자로 입력해주세요 (예: 2024001)';
        default:
            return '올바른 형식으로 입력해주세요';
    }
}

// 뒤로가기 함수
function goBack() {
    window.location.href = "login.html";
}

// 회원가입 함수
function register() {
    // 선택된 역할 가져오기
    const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
    
    // 입력값 가져오기
    const studentId = document.getElementById('studentId').value;
    const name = document.getElementById('name').value;
    const department = document.getElementById('selectedDepartment').value || document.getElementById('departmentInput').value;
    const selectedGrade = document.getElementById('selectedGrade').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const agreePrivacy = document.getElementById('agreePrivacy').checked;
    
    // URL 파라미터에서 소셜 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const socialType = urlParams.get('social');
    const isSocialLogin = socialType ? true : false;
    
    // 소셜 로그인이 아닌 경우에만 비밀번호 확인
    let password = '';
    if (!isSocialLogin) {
        password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 비밀번호 유효성 검사
        if (!validatePassword(password)) {
            return;
        }
        
        // 비밀번호 일치 검사
        if (!validatePasswordConfirm(password, confirmPassword)) {
            return;
        }
    }
    
    // ID 패턴 검증
    if (!validateIdPattern(selectedRole, studentId)) {
        document.getElementById('studentId-error').style.display = 'block';
        document.getElementById('studentId-error').textContent = getIdErrorMessage(selectedRole);
        return;
    }
    
    // 필수 필드 검사
    if (!studentId || !name || !department || !phone || !email) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 휴대폰 번호 유효성 검사
    if (!validatePhoneNumber(phone)) {
        return;
    }
    
    // 이메일 유효성 검사
    if (!validateEmail(email)) {
        return;
    }
    
    // 학생인 경우 학년 필수
    if (selectedRole === 'student' && !selectedGrade) {
        alert('학년을 선택해주세요.');
        return;
    }
    
    // 교수/교직원 인증 검사
    if (!validateVerification(selectedRole)) {
        return;
    }
    
    // 약관 동의 검사
    if (!agreeTerms || !agreePrivacy) {
        alert('필수 약관에 동의해주세요.');
        return;
    }
    
    // 소셜 로그인 정보 가져오기
    let userId = studentId;
    
    if (isSocialLogin) {
        const socialId = sessionStorage.getItem('temp_social_id');
        if (socialId) {
            userId = socialId;
        }
    }
    
    // 권한 설정 (교수/교직원은 승인 대기 상태로 설정)
    let userRole = selectedRole;
    let roleStatus = 'approved'; // 기본은 승인됨
    
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        roleStatus = 'pending'; // 승인 대기
        userRole = 'student'; // 승인 전까지는 학생 권한으로 설정
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`user_${userId}_registered`, 'true');
    localStorage.setItem(`user_${userId}_first_login`, 'true');
    localStorage.setItem(`user_${userId}_studentId`, studentId);
    localStorage.setItem(`user_${userId}_name`, name);
    localStorage.setItem(`user_${userId}_department`, department);
    localStorage.setItem(`user_${userId}_phone`, phone);
    localStorage.setItem(`user_${userId}_email`, email);
    localStorage.setItem(`user_${userId}_role`, userRole);
    localStorage.setItem(`user_${userId}_requested_role`, selectedRole);
    localStorage.setItem(`user_${userId}_role_status`, roleStatus);
    
    // 학생인 경우에만 학년 저장
    if (selectedRole === 'student') {
        localStorage.setItem(`user_${userId}_grade`, selectedGrade);
    }
    
    // 소셜 로그인이 아닌 경우에만 비밀번호 저장
    if (!isSocialLogin) {
        localStorage.setItem(`user_${userId}_password`, password);
    } else {
        // 소셜 로그인 타입 저장
        localStorage.setItem(`user_${userId}_socialType`, socialType);
    }
    
    // 교수/교직원 인증 정보 저장
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
        const fileInput = document.getElementById('verificationFile');
        
        // 인증 방법 저장
        localStorage.setItem(`user_${userId}_verification_method`, selectedMethod.value);
        
        // 파일 정보 저장
        if (fileInput.files && fileInput.files.length > 0) {
            localStorage.setItem(`user_${userId}_verification_file`, fileInput.files[0].name);
            localStorage.setItem(`user_${userId}_verification_file_size`, fileInput.files[0].size);
            localStorage.setItem(`user_${userId}_verification_file_type`, fileInput.files[0].type);
        }
    }
    
    // 권한 승인 요청이 있는 경우 관리자 승인 목록에 추가
    if (selectedRole === 'professor' || selectedRole === 'staff') {
        let pendingApprovals = JSON.parse(localStorage.getItem('pending_role_approvals') || '[]');
        const selectedMethod = document.querySelector('input[name="verificationType"]:checked');
        const fileInput = document.getElementById('verificationFile');
        
        pendingApprovals.push({
            userId: userId,
            studentId: studentId,
            name: name,
            requestedRole: selectedRole,
            department: department,
            requestDate: new Date().toISOString(),
            status: 'pending',
            verificationMethod: selectedMethod ? selectedMethod.value : null,
            verificationFileName: fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : null,
            verificationFileType: fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].type : null
        });
        localStorage.setItem('pending_role_approvals', JSON.stringify(pendingApprovals));
        
        alert('회원가입이 완료되었습니다!\n\n고급 이미지 인식 기술과 시각적 패턴 분석으로 서류를 검증했습니다.\n교수/교직원 권한은 관리자 최종 승인 후 활성화됩니다.\n승인 전까지는 학생 권한으로 서비스를 이용하실 수 있습니다.');
    } else {
        alert('회원가입이 완료되었습니다!');
    }
    
    // 소셜 로그인 세션 데이터 정리
    if (isSocialLogin) {
        sessionStorage.removeItem('temp_social_id');
        sessionStorage.removeItem('temp_social_type');
        sessionStorage.removeItem('temp_social_name');
        sessionStorage.removeItem('temp_social_email');
        sessionStorage.removeItem('temp_social_profile_image');
        
        // 현재 로그인 사용자로 설정
        localStorage.setItem('currentLoggedInUser', userId);
        
        // 첫 로그인이므로 위젯 설정 페이지로 이동
        window.location.href = "widget-settings.html";
    } else {
        // 로그인 페이지로 이동 (새로 가입했다는 정보와 학번 전달)
        window.location.href = `login.html?newRegistration=true&studentId=${studentId}`;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 학년 드롭다운 설정
    setupGradeDropdown();
    
    // 학과 검색 기능 설정
    setupDepartmentSearch();
    
    // 파일 업로드 기능 설정
    setupFileUpload();
    
    // 인증 방법 변경 시 파일 재검증 설정
    setupVerificationMethodChange();
    
    // 역할 선택 라디오 버튼 이벤트
    const roleRadios = document.querySelectorAll('input[name="userRole"]');
    roleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateUIByRole(this.value);
        });
    });
    
    // URL 파라미터 확인하여 소셜 로그인 여부 판단
    const urlParams = new URLSearchParams(window.location.search);
    const socialType = urlParams.get('social');
    
    if (socialType) {
        // 소셜 로그인으로 온 경우, 세션 스토리지에서 정보 가져오기
        const socialId = sessionStorage.getItem('temp_social_id');
        
        if (socialId) {
            // 비밀번호 필드 숨기기
            document.getElementById('passwordFields').style.display = 'none';
            
            // 소셜 정보 표시
            document.getElementById('socialInfoBox').style.display = 'block';
            document.getElementById('socialType').textContent = getSocialTypeName(socialType);
            
            // 소셜 아이콘 설정
            const socialIconElem = document.getElementById('socialIcon');
            socialIconElem.textContent = socialType.charAt(0).toUpperCase();
            socialIconElem.className = `social-icon ${socialType}-icon`;
        }
    }
    
    // ID 입력 실시간 검증
    const idInput = document.getElementById('studentId');
    idInput.addEventListener('input', function() {
        const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
        const errorDiv = document.getElementById('studentId-error');
        
        if (this.value && !validateIdPattern(selectedRole, this.value)) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = getIdErrorMessage(selectedRole);
        } else {
            errorDiv.style.display = 'none';
        }
    });
    
    // 비밀번호 실시간 검증
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }
    
    // 비밀번호 확인 실시간 검증
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            validatePasswordConfirm(password, this.value);
        });
    }
    
    // 이메일 실시간 검증
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('input', function() {
        validateEmail(this.value);
    });
});
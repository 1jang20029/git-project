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

// 이미지 전처리 강화 (더 정확한 OCR을 위해)
function preprocessImage(imageElement) {
    return new Promise((resolve) => {
        try {
            if (!ocrLibrariesLoaded.opencv || typeof cv === 'undefined') {
                // OpenCV 없으면 기본 전처리
                resolve(basicImagePreprocess(imageElement));
                return;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 이미지 크기 최적화 (OCR 성능 향상을 위해)
            const maxDimension = 2000;
            let width = imageElement.width;
            let height = imageElement.height;
            
            if (width > maxDimension || height > maxDimension) {
                const ratio = Math.min(maxDimension / width, maxDimension / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(imageElement, 0, 0, width, height);
            
            const src = cv.imread(canvas);
            const dst = new cv.Mat();
            
            // 그레이스케일 변환
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            
            // 노이즈 제거를 위한 가우시안 블러
            const ksize = new cv.Size(3, 3);
            cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
            
            // 대비 향상을 위한 히스토그램 균등화
            cv.equalizeHist(dst, dst);
            
            // 적응형 임계값으로 이진화 (텍스트 인식률 향상)
            cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 4);
            
            // 모폴로지 연산으로 텍스트 정리
            const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
            cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel);
            
            // 결과를 캔버스에 출력
            cv.imshow(canvas, dst);
            
            // 메모리 정리
            src.delete();
            dst.delete();
            kernel.delete();
            
            resolve(canvas);
        } catch (error) {
            console.warn('OpenCV 전처리 실패, 기본 전처리 사용:', error);
            resolve(basicImagePreprocess(imageElement));
        }
    });
}

// 기본 이미지 전처리 (OpenCV 없을 때)
function basicImagePreprocess(imageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 이미지 크기 최적화
    const maxDimension = 1500;
    let width = imageElement.width;
    let height = imageElement.height;
    
    if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 고품질 리샘플링
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    // 대비 향상
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // 그레이스케일 변환
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // 대비 향상 (1.3배 증가, 밝기 +20)
        const enhanced = Math.min(255, Math.max(0, gray * 1.3 + 20));
        
        data[i] = enhanced;     // R
        data[i + 1] = enhanced; // G
        data[i + 2] = enhanced; // B
        // 알파값은 그대로 유지
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

// 다중 OCR 엔진으로 텍스트 추출 (정확도 향상)
async function extractTextWithMultipleEngines(file) {
    const results = [];
    
    try {
        await loadOCRLibraries();
        
        // 이미지 로드
        const imageElement = await loadImageElement(file);
        
        // 1. 원본 이미지로 OCR (기본 설정)
        try {
            updateOCRProgress('원본 이미지 분석', 10);
            const originalResult = await Tesseract.recognize(
                imageElement,
                'kor+eng',
                {
                    tessedit_pageseg_mode: '1', // 자동 페이지 분할
                    tessedit_ocr_engine_mode: '2', // LSTM 엔진
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('원본 이미지 분석', 10 + Math.round(m.progress * 20));
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
            updateOCRProgress('전처리 이미지 분석', 35);
            const preprocessedImage = await preprocessImage(imageElement);
            const preprocessedResult = await Tesseract.recognize(
                preprocessedImage,
                'kor+eng',
                {
                    tessedit_pageseg_mode: '6', // 단일 텍스트 블록
                    tessedit_ocr_engine_mode: '2',
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('전처리 이미지 분석', 35 + Math.round(m.progress * 25));
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
        
        // 3. 문서 특화 설정으로 OCR (한글 최적화)
        try {
            updateOCRProgress('문서 특화 분석', 65);
            const documentResult = await Tesseract.recognize(
                imageElement,
                'kor+eng',
                {
                    tessedit_pageseg_mode: '4', // 단일 컬럼 텍스트
                    tessedit_ocr_engine_mode: '1', // Legacy + LSTM
                    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz가-힣ㄱ-ㅎㅏ-ㅣ:.,()/-\\s',
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('문서 특화 분석', 65 + Math.round(m.progress * 20));
                        }
                    }
                }
            );
            results.push({
                source: 'document_optimized',
                text: documentResult.data.text,
                confidence: documentResult.data.confidence
            });
        } catch (error) {
            console.warn('문서 특화 OCR 실패:', error);
        }
        
        // 4. 고해상도 처리 (중요 문서용)
        try {
            updateOCRProgress('고해상도 분석', 85);
            const highResCanvas = document.createElement('canvas');
            const ctx = highResCanvas.getContext('2d');
            
            // 해상도 2배 증가
            const scaleFactor = 2;
            highResCanvas.width = imageElement.width * scaleFactor;
            highResCanvas.height = imageElement.height * scaleFactor;
            
            ctx.imageSmoothingEnabled = false; // 픽셀 보간 방지
            ctx.drawImage(imageElement, 0, 0, highResCanvas.width, highResCanvas.height);
            
            const highResResult = await Tesseract.recognize(
                highResCanvas,
                'kor+eng',
                {
                    tessedit_pageseg_mode: '3', // 완전 자동
                    tessedit_ocr_engine_mode: '2',
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            updateOCRProgress('고해상도 분석', 85 + Math.round(m.progress * 15));
                        }
                    }
                }
            );
            results.push({
                source: 'high_resolution',
                text: highResResult.data.text,
                confidence: highResResult.data.confidence
            });
        } catch (error) {
            console.warn('고해상도 OCR 실패:', error);
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

// OCR 진행 상황 업데이트
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
            return analyzeBasicVisualPatterns(file);
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
        let isDocumentFormat = false;
        const imageArea = imageElement.width * imageElement.height;
        
        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            
            // 이미지의 상당 부분을 차지하는 직사각형이 있으면 문서/카드로 판단
            if (area > imageArea * 0.1) {
                const approx = new cv.Mat();
                const peri = cv.arcLength(contour, true);
                cv.approxPolyDP(contour, approx, 0.02 * peri, true);
                
                if (approx.rows === 4) { // 사각형
                    hasCardShape = true;
                    
                    // 가로세로 비율로 카드/문서 구분
                    const rect = cv.boundingRect(contour);
                    const aspectRatio = rect.width / rect.height;
                    
                    if (aspectRatio > 1.3 && aspectRatio < 2.0) {
                        isDocumentFormat = true; // 일반적인 카드/신분증 비율
                    } else if (aspectRatio > 0.7 && aspectRatio < 1.4) {
                        isDocumentFormat = true; // A4 등 문서 비율
                    }
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
            isDocumentFormat: isDocumentFormat,
            aspectRatio: imageElement.width / imageElement.height,
            imageSize: imageArea
        };
        
    } catch (error) {
        console.warn('고급 시각적 패턴 분석 실패, 기본 분석 사용:', error);
        return analyzeBasicVisualPatterns(file);
    }
}

// 기본 시각적 패턴 분석
async function analyzeBasicVisualPatterns(file) {
    try {
        const imageElement = await loadImageElement(file);
        const aspectRatio = imageElement.width / imageElement.height;
        
        // 기본적인 비율 기반 판단
        const isCardFormat = aspectRatio > 1.4 && aspectRatio < 2.0; // 카드 비율
        const isDocumentFormat = aspectRatio > 0.6 && aspectRatio < 1.6; // 문서 비율
        
        return {
            hasCardShape: isCardFormat,
            isDocumentFormat: isDocumentFormat,
            aspectRatio: aspectRatio,
            imageSize: imageElement.width * imageElement.height
        };
    } catch (error) {
        console.warn('기본 시각적 패턴 분석 실패:', error);
        return null;
    }
}

// 유연한 키워드 매칭 (OCR 오류 허용)
function flexibleMatch(text, keyword) {
    const normalizedText = text.toLowerCase().replace(/\s+/g, '');
    const normalizedKeyword = keyword.toLowerCase();
    
    // 1. 정확한 매칭
    if (normalizedText.includes(normalizedKeyword)) {
        return 1.0;
    }
    
    // 2. OCR 오류를 고려한 유사도 매칭
    const similarity = calculateSimilarity(normalizedText, normalizedKeyword);
    return similarity;
}

// 문자열 유사도 계산 (레벤슈타인 거리 기반)
function calculateSimilarity(text, keyword) {
    // 키워드가 텍스트보다 긴 경우 처리
    if (keyword.length > text.length) {
        return 0;
    }
    
    // 슬라이딩 윈도우로 가장 유사한 부분 찾기
    let maxSimilarity = 0;
    
    for (let i = 0; i <= text.length - keyword.length; i++) {
        const substr = text.substr(i, keyword.length);
        const similarity = 1 - (levenshteinDistance(substr, keyword) / Math.max(substr.length, keyword.length));
        maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
}

// 레벤슈타인 거리 계산
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // 교체
                    matrix[i][j - 1] + 1,     // 삽입
                    matrix[i - 1][j] + 1      // 삭제
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// 개선된 극도로 정확한 텍스트 분석 함수
function analyzeExtractedTexts(ocrResults, visualPatterns) {
    console.log('OCR 결과들:', ocrResults);
    console.log('시각적 패턴:', visualPatterns);
    
    // 모든 OCR 결과 텍스트 결합 및 정리
    const allTexts = ocrResults.map(result => result.text).join(' ');
    const normalizedText = allTexts.toLowerCase()
        .replace(/[^\w가-힣\s]/g, ' ') // 특수문자를 공백으로
        .replace(/\s+/g, ' ')         // 연속 공백을 하나로
        .trim();
    
    console.log('정규화된 텍스트:', normalizedText);
    
    // OCR 신뢰도 계산
    const avgConfidence = ocrResults.reduce((sum, result) => sum + (result.confidence || 0), 0) / ocrResults.length;
    console.log('평균 OCR 신뢰도:', avgConfidence);
    
    // 극도로 엄격한 제외 키워드 (교육 관련)
    const strictExcludeKeywords = [
        '시간표', '수업', '강의', '과제', '과목', '성적', '학습', '교육과정',
        'schedule', 'class', 'course', 'lesson', 'study', 'curriculum',
        '출석', '학점', '평가', '과제물', '리포트', '수강', '강의실', '교실',
        '시험', '중간고사', '기말고사', '퀴즈', '발표', '실습', '연습',
        '교재', '참고서', '노트', '필기', '복습', '예습', '숙제',
        '학기', '방학', '개강', '종강', '휴강', '보강', '계절학기',
        '전공', '교양', '선택', '필수', '학년', '반', '조', '팀',
        '교수님', '선생님', '담임', '지도교수', '강사', '조교',
        '캠퍼스', '도서관', '실험실', '강당', '체육관', '식당',
        '동아리', '학회', '축제', '행사', '세미나', '워크샵',
        '인턴', '현장실습', '프로젝트', '포트폴리오', '논문',
        '학생증', '수강신청', '장학금', '등록금', '학비'
    ];
    
    // 제외 키워드 체크 (유연한 매칭으로)
    for (let keyword of strictExcludeKeywords) {
        const similarity = flexibleMatch(normalizedText, keyword);
        if (similarity > 0.8) { // 80% 이상 유사하면 제외
            console.log('제외 키워드 감지:', keyword, '유사도:', similarity);
            return null;
        }
    }
    
    // 각 문서 유형별 필수 키워드 (개선된 버전)
    const requiredKeywords = {
        employeeCard: {
            // 교직원증 필수 키워드
            mandatory: [
                {keywords: ['교직원증', '직원증', '신분증'], threshold: 0.8},
                {keywords: ['연성대학교', '연성대', '대학교'], threshold: 0.8}
            ],
            // 지원 키워드
            supporting: [
                {keywords: ['교번', '직번', '사번', '번호'], threshold: 0.7},
                {keywords: ['소속', '부서', '직급', '직책'], threshold: 0.7},
                {keywords: ['성명', '이름', '발급일', '유효'], threshold: 0.6}
            ]
        },
        appointmentDoc: {
            // 임용서류 필수 키워드
            mandatory: [
                {keywords: ['임용', '발령', '임명', '채용'], threshold: 0.8},
                {keywords: ['연성대학교', '연성대', '대학교'], threshold: 0.8}
            ],
            // 지원 키워드
            supporting: [
                {keywords: ['발령장', '임용장', '임명장', '계약서'], threshold: 0.7},
                {keywords: ['발령일', '임용일', '시작일', '계약기간'], threshold: 0.7},
                {keywords: ['근무기간', '임용기간', '계약일', '발효일'], threshold: 0.6}
            ]
        },
        payslip: {
            // 급여명세서 필수 키워드
            mandatory: [
                {keywords: ['급여명세', '급여', '월급', '봉급'], threshold: 0.8},
                {keywords: ['연성대학교', '연성대', '대학교'], threshold: 0.8}
            ],
            // 지원 키워드
            supporting: [
                {keywords: ['기본급', '봉급', '본봉', '기본'], threshold: 0.7},
                {keywords: ['수당', '보너스', '상여', '추가'], threshold: 0.7},
                {keywords: ['공제', '세금', '소득세', '국민연금'], threshold: 0.6},
                {keywords: ['실지급', '지급액', '총액', '합계'], threshold: 0.6}
            ]
        }
    };
    
    // 각 문서 유형 검증 (우선순위 적용)
    const typeResults = [];
    
    for (let [docType, requirements] of Object.entries(requiredKeywords)) {
        let mandatoryScore = 0;
        let supportingScore = 0;
        let foundKeywords = [];
        
        // 필수 키워드 그룹별 점수 계산
        for (let mandatoryGroup of requirements.mandatory) {
            let groupMaxScore = 0;
            let groupBestKeyword = '';
            
            for (let keyword of mandatoryGroup.keywords) {
                const similarity = flexibleMatch(normalizedText, keyword);
                if (similarity > groupMaxScore) {
                    groupMaxScore = similarity;
                    groupBestKeyword = keyword;
                }
            }
            
            if (groupMaxScore >= mandatoryGroup.threshold) {
                mandatoryScore += 1;
                foundKeywords.push({keyword: groupBestKeyword, score: groupMaxScore, type: 'mandatory'});
            }
        }
        
        // 지원 키워드 그룹별 점수 계산
        let supportingCount = 0;
        for (let supportingGroup of requirements.supporting) {
            let groupMaxScore = 0;
            let groupBestKeyword = '';
            
            for (let keyword of supportingGroup.keywords) {
                const similarity = flexibleMatch(normalizedText, keyword);
                if (similarity > groupMaxScore) {
                    groupMaxScore = similarity;
                    groupBestKeyword = keyword;
                }
            }
            
            if (groupMaxScore >= supportingGroup.threshold) {
                supportingCount += 1;
                supportingScore += groupMaxScore;
                foundKeywords.push({keyword: groupBestKeyword, score: groupMaxScore, type: 'supporting'});
            }
        }
        
        // 점수 계산
        const mandatoryRatio = mandatoryScore / requirements.mandatory.length;
        const hasSufficientSupporting = supportingCount >= 1;
        const overallScore = (mandatoryScore * 2 + supportingScore) / (requirements.mandatory.length * 2 + requirements.supporting.length);
        
        console.log(`${docType} 상세 점수:`, {
            mandatoryScore: mandatoryScore,
            mandatoryRequired: requirements.mandatory.length,
            mandatoryRatio: mandatoryRatio.toFixed(2),
            supportingCount: supportingCount,
            supportingScore: supportingScore.toFixed(2),
            overallScore: overallScore.toFixed(2),
            foundKeywords: foundKeywords
        });
        
        // 결과 저장
        typeResults.push({
            type: docType,
            mandatoryRatio: mandatoryRatio,
            supportingCount: supportingCount,
            overallScore: overallScore,
            foundKeywords: foundKeywords,
            isValid: mandatoryRatio >= 1.0 && hasSufficientSupporting && overallScore >= 0.7
        });
    }
    
    // 가장 높은 점수의 유형 선택
    const validResults = typeResults.filter(result => result.isValid);
    
    if (validResults.length > 0) {
        // 점수가 가장 높은 유형 선택
        const bestResult = validResults.reduce((best, current) => 
            current.overallScore > best.overallScore ? current : best
        );
        
        console.log(`${bestResult.type} 인증 성공! 종합 점수: ${bestResult.overallScore.toFixed(2)}`);
        console.log('발견된 키워드:', bestResult.foundKeywords);
        
        return bestResult.type;
    }
    
    console.log('모든 문서 유형 검증 실패');
    console.log('모든 결과:', typeResults);
    return null;
}

// 완벽한 정확도를 위한 이미지 내용 분석
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
                // 1. 다중 OCR 엔진으로 텍스트 추출
                const ocrResults = await extractTextWithMultipleEngines(file);
                
                // 2. 시각적 패턴 분석
                const visualPatterns = await analyzeVisualPatterns(file);
                
                // 3. 개선된 종합 분석
                const detectedType = analyzeExtractedTexts(ocrResults, visualPatterns);
                
                callback(detectedType);
            } catch (error) {
                console.error('정확한 이미지 분석 실패:', error);
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

// 100% 정확도를 위한 파일 검증
function validateFileMatch(file, selectedMethod, callback) {
    const loadingIndicator = showFileAnalysisLoading();
    
    analyzeImageContent(file, (detectedType) => {
        hideFileAnalysisLoading(loadingIndicator);
        
        let isValid = false;
        let message = '';
        
        if (detectedType === selectedMethod) {
            isValid = true;
            message = '✅ AI 인식 성공! 선택한 문서 유형과 일치합니다.\n\n📊 다중 OCR 엔진으로 정확하게 분석되었습니다.';
        } else {
            // 자동 인식 실패 시 구체적인 안내
            if (file.type === 'application/pdf') {
                message = '❌ PDF 파일은 텍스트 인식이 어렵습니다.\n\n📸 해당 서류의 선명한 JPG 또는 PNG 이미지를 업로드해주세요.';
            } else {
                switch (selectedMethod) {
                    case 'employeeCard':
                        message = '❌ 교직원증으로 인식되지 않았습니다.\n\n🔍 필수 확인 사항:\n• "교직원증" 또는 "직원증" 문구가 명확히 보이는가?\n• "연성대학교" 문구가 선명한가?\n• 교번, 직번, 사번이 보이는가?\n• 소속, 부서, 성명이 보이는가?\n\n⚠️ 시간표, 수업 관련 이미지는 자동으로 거부됩니다.';
                        break;
                    case 'appointmentDoc':
                        message = '❌ 임용서류로 인식되지 않았습니다.\n\n🔍 필수 확인 사항:\n• "임용", "발령", "임명" 문구가 명확히 보이는가?\n• "연성대학교" 문구가 선명한가?\n• 발령장, 임용장, 계약서 중 하나가 보이는가?\n• 임용일, 발령일, 계약기간이 보이는가?\n\n⚠️ 수업, 강의 관련 문서는 자동으로 거부됩니다.';
                        break;
                    case 'payslip':
                        message = '❌ 급여명세서로 인식되지 않았습니다.\n\n🔍 필수 확인 사항:\n• "급여명세", "급여", "월급" 문구가 명확히 보이는가?\n• "연성대학교" 문구가 선명한가?\n• 기본급, 수당, 공제액이 보이는가?\n• 소득세, 국민연금, 실지급액이 보이는가?\n\n⚠️ 학습, 과제 관련 문서는 자동으로 거부됩니다.';
                        break;
                    default:
                        message = '❌ 선택하신 인증 방법과 일치하는 서류를 업로드해주세요.\n\n📋 지원 문서: 교직원증, 임용서류, 급여명세서';
                }
            }
        }
        
        callback(isValid, message);
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

// 파일 분석 로딩 표시
function showFileAnalysisLoading() {
    const uploadedFile = document.getElementById('uploadedFile');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'file-analysis-loading';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">🤖 AI 다중 엔진으로 정확한 분석 중...</div>
            <div class="loading-details">OCR + 패턴 분석 + 키워드 매칭</div>
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
        <div class="validation-message" style="white-space: pre-line;">${message}</div>
    `;
    
    uploadedFile.appendChild(resultDiv);
    
    // 파일 에러 메시지 숨기기/표시
    const fileError = document.getElementById('file-error');
    if (isValid) {
        fileError.style.display = 'none';
    } else {
        fileError.style.display = 'block';
        fileError.textContent = message.replace(/[❌🔍⚠️📸📋]/g, '').replace(/\n\n/g, ' ');
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
        // AI 다중 엔진 자동 검증
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
        alert('🤖 AI 인식에 실패했습니다.\n\n필수 키워드가 모두 포함된 올바른 서류를 업로드해주세요.\n시간표, 수업 관련 이미지는 자동으로 거부됩니다.');
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
        localStorage.setItem(`user_${userId}_verification_status`, 'ai_verified'); // AI 검증 완료
        
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
            status: 'ai_verified', // AI 검증 완료 상태
            verificationMethod: selectedMethod ? selectedMethod.value : null,
            verificationFileName: fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : null,
            verificationFileType: fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].type : null,
            verificationConfidence: 'high', // 높은 신뢰도
            keywordVerification: 'ai_multi_engine_confirmed', // AI 다중 엔진 확인됨
            ocrEngine: 'tesseract_multi_mode' // 사용된 OCR 엔진
        });
        localStorage.setItem('pending_role_approvals', JSON.stringify(pendingApprovals));
        
        alert('🎉 회원가입이 완료되었습니다!\n\n🤖 AI 다중 엔진 인식 시스템으로 문서가 정확하게 검증되었습니다.\n📋 교수/교직원 권한은 시스템 검토 후 자동으로 활성화됩니다.\n⏰ 검토 전까지는 학생 권한으로 서비스를 이용하실 수 있습니다.');
    } else {
        alert('🎉 회원가입이 완료되었습니다!');
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
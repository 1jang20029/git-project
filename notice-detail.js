// 공지사항 상세 페이지 관리 클래스
class NoticeDetailManager {
    constructor() {
        this.currentNoticeId = null;
        this.currentNotice = null;
        this.notices = [];
        this.bookmarkedNotices = [];
        
        this.init();
    }
    
    init() {
        this.loadNotices();
        this.loadBookmarks();
        this.getCurrentNoticeId();
        this.loadNoticeDetail();
        this.checkAdminPermissions();
        this.setupEventListeners();
        this.setupScrollToTop();
    }
    
    // URL에서 공지사항 ID 가져오기
    getCurrentNoticeId() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentNoticeId = urlParams.get('id');
        
        if (!this.currentNoticeId) {
            this.showError();
            return;
        }
    }
    
    // 로컬 스토리지에서 공지사항 목록 로드
    loadNotices() {
        const storedNotices = localStorage.getItem('notices');
        if (storedNotices) {
            this.notices = JSON.parse(storedNotices);
        }
    }
    
    // 북마크 목록 로드
    loadBookmarks() {
        const currentUser = localStorage.getItem('currentLoggedInUser');
        if (currentUser) {
            const bookmarks = localStorage.getItem(`bookmarks_${currentUser}`);
            this.bookmarkedNotices = bookmarks ? JSON.parse(bookmarks) : [];
        }
    }
    
    // 북마크 상태 저장
    saveBookmarks() {
        const currentUser = localStorage.getItem('currentLoggedInUser');
        if (currentUser) {
            localStorage.setItem(`bookmarks_${currentUser}`, JSON.stringify(this.bookmarkedNotices));
        }
    }
    
    // 공지사항 상세 정보 로드
    loadNoticeDetail() {
        const loadingContainer = document.getElementById('loadingContainer');
        const errorContainer = document.getElementById('errorContainer');
        const noticeContent = document.getElementById('noticeContent');
        
        // 로딩 상태 표시
        loadingContainer.style.display = 'flex';
        errorContainer.style.display = 'none';
        noticeContent.style.display = 'none';
        
        // 실제 환경에서는 서버에서 데이터를 가져오는 시뮬레이션
        setTimeout(() => {
            const notice = this.notices.find(n => n.id === this.currentNoticeId);
            
            if (!notice) {
                this.showError();
                return;
            }
            
            this.currentNotice = notice;
            this.displayNoticeDetail();
            this.incrementViews();
            this.loadRelatedNotices();
            this.setupNavigation();
            
            loadingContainer.style.display = 'none';
            noticeContent.style.display = 'block';
        }, 1000);
    }
    
    // 오류 화면 표시
    showError() {
        const loadingContainer = document.getElementById('loadingContainer');
        const errorContainer = document.getElementById('errorContainer');
        const noticeContent = document.getElementById('noticeContent');
        
        loadingContainer.style.display = 'none';
        errorContainer.style.display = 'flex';
        noticeContent.style.display = 'none';
    }
    
    // 공지사항 상세 정보 표시
    displayNoticeDetail() {
        if (!this.currentNotice) return;
        
        const notice = this.currentNotice;
        
        // 배지 표시
        this.displayBadges();
        
        // 기본 정보 표시
        document.getElementById('noticeTitle').textContent = notice.title;
        document.getElementById('noticeAuthor').textContent = notice.author;
        document.getElementById('noticeDate').textContent = this.formatDate(notice.date);
        document.getElementById('noticeCategory').textContent = this.getCategoryName(notice.category);
        document.getElementById('noticeViews').textContent = (notice.views || 0).toLocaleString();
        
        // 본문 내용 표시
        this.displayNoticeBody();
        
        // 첨부파일 표시
        this.displayAttachments();
        
        // 북마크 상태 업데이트
        this.updateBookmarkIcon();
        
        // 페이지 제목 업데이트
        document.title = `${notice.title} - 연성대학교`;
    }
    
    // 배지 표시
    displayBadges() {
        const badgesContainer = document.getElementById('noticeBadges');
        const notice = this.currentNotice;
        
        let badgesHTML = '';
        
        if (notice.isUrgent) {
            badgesHTML += '<span class="badge urgent">긴급</span>';
        }
        if (notice.isImportant) {
            badgesHTML += '<span class="badge important">중요</span>';
        }
        if (notice.isPinned) {
            badgesHTML += '<span class="badge pinned">고정</span>';
        }
        
        // 새 글 여부 (3일 이내)
        const isNew = (Date.now() - new Date(notice.date).getTime()) < (3 * 24 * 60 * 60 * 1000);
        if (isNew) {
            badgesHTML += '<span class="badge new">새글</span>';
        }
        
        badgesContainer.innerHTML = badgesHTML;
    }
    
    // 본문 내용 표시
    displayNoticeBody() {
        const bodyContainer = document.getElementById('noticeBody');
        const notice = this.currentNotice;
        
        // 줄바꿈을 HTML로 변환하고 기본 포맷팅 적용
        let formattedContent = notice.content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/■\s*/g, '<h3>■ ')
            .replace(/▶\s*/g, '<h4>▶ ')
            .replace(/(\d+\.\s)/g, '<strong>$1</strong>')
            .replace(/-\s+/g, '• ');
        
        // 단락으로 감싸기
        if (!formattedContent.startsWith('<')) {
            formattedContent = '<p>' + formattedContent + '</p>';
        }
        
        bodyContainer.innerHTML = formattedContent;
    }
    
    // 첨부파일 표시
    displayAttachments() {
        const attachmentsSection = document.getElementById('attachmentsSection');
        const attachmentsList = document.getElementById('attachmentsList');
        const notice = this.currentNotice;
        
        if (!notice.attachments || notice.attachments.length === 0) {
            attachmentsSection.style.display = 'none';
            return;
        }
        
        attachmentsSection.style.display = 'block';
        
        const attachmentsHTML = notice.attachments.map(attachment => `
            <div class="attachment-item" onclick="downloadAttachment('${attachment.id}')">
                <div class="attachment-icon">${this.getFileIcon(attachment.type)}</div>
                <div class="attachment-info">
                    <div class="attachment-name">${attachment.name}</div>
                    <div class="attachment-size">${this.formatFileSize(attachment.size)}</div>
                </div>
                <div class="attachment-download">⬇️</div>
            </div>
        `).join('');
        
        attachmentsList.innerHTML = attachmentsHTML;
    }
    
    // 관련 공지사항 로드
    loadRelatedNotices() {
        const relatedContainer = document.getElementById('relatedList');
        const notice = this.currentNotice;
        
        // 같은 카테고리의 다른 공지사항 찾기 (최대 5개)
        const relatedNotices = this.notices
            .filter(n => n.id !== notice.id && n.category === notice.category)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (relatedNotices.length === 0) {
            document.getElementById('relatedNotices').style.display = 'none';
            return;
        }
        
        const relatedHTML = relatedNotices.map(related => `
            <div class="related-item" onclick="goToNotice('${related.id}')">
                <div class="related-category">${this.getCategoryName(related.category)}</div>
                <div class="related-title">${related.title}</div>
                <div class="related-date">${this.formatDate(related.date)}</div>
            </div>
        `).join('');
        
        relatedContainer.innerHTML = relatedHTML;
    }
    
    // 이전/다음 공지사항 네비게이션 설정
    setupNavigation() {
        const currentIndex = this.notices.findIndex(n => n.id === this.currentNoticeId);
        
        // 이전 공지사항
        if (currentIndex < this.notices.length - 1) {
            const prevNotice = this.notices[currentIndex + 1];
            const prevElement = document.getElementById('prevNotice');
            prevElement.style.display = 'block';
            prevElement.querySelector('.nav-title').textContent = prevNotice.title;
            prevElement.onclick = () => this.goToNotice(prevNotice.id);
        }
        
        // 다음 공지사항
        if (currentIndex > 0) {
            const nextNotice = this.notices[currentIndex - 1];
            const nextElement = document.getElementById('nextNotice');
            nextElement.style.display = 'block';
            nextElement.querySelector('.nav-title').textContent = nextNotice.title;
            nextElement.onclick = () => this.goToNotice(nextNotice.id);
        }
    }
    
    // 관리자 권한 확인
    checkAdminPermissions() {
        const currentUser = localStorage.getItem('currentLoggedInUser');
        const adminActions = document.getElementById('adminActions');
        
        const adminUsers = ['admin', 'administrator', '20250001'];
        
        if (currentUser && adminUsers.includes(currentUser)) {
            adminActions.style.display = 'flex';
        }
    }
    
    // 조회수 증가
    incrementViews() {
        if (!this.currentNotice) return;
        
        const notice = this.notices.find(n => n.id === this.currentNoticeId);
        if (notice) {
            notice.views = (notice.views || 0) + 1;
            this.currentNotice.views = notice.views;
            
            // 로컬 스토리지에 저장
            localStorage.setItem('notices', JSON.stringify(this.notices));
            
            // UI 업데이트
            document.getElementById('noticeViews').textContent = notice.views.toLocaleString();
        }
    }
    
    // 북마크 토글
    toggleBookmark() {
        const currentUser = localStorage.getItem('currentLoggedInUser');
        
        if (!currentUser) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        
        const noticeId = this.currentNoticeId;
        const index = this.bookmarkedNotices.indexOf(noticeId);
        
        if (index === -1) {
            // 북마크 추가
            this.bookmarkedNotices.push(noticeId);
            alert('북마크에 추가되었습니다.');
        } else {
            // 북마크 제거
            this.bookmarkedNotices.splice(index, 1);
            alert('북마크에서 제거되었습니다.');
        }
        
        this.saveBookmarks();
        this.updateBookmarkIcon();
    }
    
    // 북마크 아이콘 업데이트
    updateBookmarkIcon() {
        const bookmarkIcon = document.getElementById('bookmarkIcon');
        const isBookmarked = this.bookmarkedNotices.includes(this.currentNoticeId);
        
        if (isBookmarked) {
            bookmarkIcon.classList.add('bookmarked');
            bookmarkIcon.textContent = '🔖';
        } else {
            bookmarkIcon.classList.remove('bookmarked');
            bookmarkIcon.textContent = '🔖';
        }
    }
    
    // 공지사항 공유
    shareNotice() {
        const shareModal = document.getElementById('shareModal');
        const shareUrl = document.getElementById('shareUrl');
        
        // 현재 페이지 URL 설정
        shareUrl.value = window.location.href;
        
        shareModal.style.display = 'flex';
    }
    
    // 클립보드에 복사
    copyToClipboard() {
        const shareUrl = document.getElementById('shareUrl');
        shareUrl.select();
        shareUrl.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            alert('링크가 클립보드에 복사되었습니다.');
        } catch (err) {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다. 수동으로 복사해주세요.');
        }
        
        this.closeShareModal();
    }
    
    // 카카오톡 공유
    shareToKakao() {
        const notice = this.currentNotice;
        const url = window.location.href;
        
        // 실제 환경에서는 카카오 SDK를 사용
        alert(`카카오톡 공유 기능입니다.\n\n제목: ${notice.title}\nURL: ${url}`);
        this.closeShareModal();
    }
    
    // 이메일 공유
    shareToEmail() {
        const notice = this.currentNotice;
        const url = window.location.href;
        const subject = encodeURIComponent(`[연성대학교] ${notice.title}`);
        const body = encodeURIComponent(`안녕하세요,\n\n연성대학교 공지사항을 공유합니다.\n\n제목: ${notice.title}\n작성자: ${notice.author}\n\n자세한 내용은 아래 링크에서 확인하세요:\n${url}`);
        
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        this.closeShareModal();
    }
    
    // 공지사항 신고
    reportNotice() {
        const reportModal = document.getElementById('reportModal');
        reportModal.style.display = 'flex';
    }
    
    // 신고 제출
    submitReport() {
        const reason = document.getElementById('reportReason').value;
        const detail = document.getElementById('reportDetail').value;
        
        if (!reason) {
            alert('신고 사유를 선택해주세요.');
            return;
        }
        
        if (!detail.trim()) {
            alert('상세 내용을 입력해주세요.');
            return;
        }
        
        // 실제 환경에서는 서버로 신고 데이터를 전송
        const reportData = {
            noticeId: this.currentNoticeId,
            reason: reason,
            detail: detail,
            reportDate: new Date().toISOString(),
            reporter: localStorage.getItem('currentLoggedInUser') || 'anonymous'
        };
        
        console.log('신고 데이터:', reportData);
        
        alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
        this.closeReportModal();
    }
    
    // 공지사항 인쇄
    printNotice() {
        const printContent = `
            <html>
            <head>
                <title>${this.currentNotice.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .meta { color: #666; font-size: 14px; }
                    .content { margin-top: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">${this.currentNotice.title}</div>
                    <div class="meta">
                        작성자: ${this.currentNotice.author} | 
                        작성일: ${this.formatDate(this.currentNotice.date)} | 
                        카테고리: ${this.getCategoryName(this.currentNotice.category)}
                    </div>
                </div>
                <div class="content">
                    ${document.getElementById('noticeBody').innerHTML}
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
    
    // 스크롤 투 탑 설정
    setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTopBtn');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = 'block';
            } else {
                scrollBtn.style.display = 'none';
            }
        });
    }
    
    // 상단으로 스크롤
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (event) => {
            const shareModal = document.getElementById('shareModal');
            const reportModal = document.getElementById('reportModal');
            
            if (event.target === shareModal) {
                this.closeShareModal();
            }
            if (event.target === reportModal) {
                this.closeReportModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeShareModal();
                this.closeReportModal();
            }
        });
    }
    
    // 모달 닫기 함수들
    closeShareModal() {
        document.getElementById('shareModal').style.display = 'none';
    }
    
    closeReportModal() {
        document.getElementById('reportModal').style.display = 'none';
        document.getElementById('reportReason').value = '';
        document.getElementById('reportDetail').value = '';
    }
    
    // 유틸리티 함수들
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
    
    getCategoryName(category) {
        const categoryNames = {
            'academic': '학사',
            'scholarship': '장학',
            'job': '취업',
            'event': '행사',
            'department': '학과',
            'dormitory': '기숙사',
            'library': '도서관',
            'general': '일반'
        };
        return categoryNames[category] || category;
    }
    
    getFileIcon(fileType) {
        const iconMap = {
            'pdf': '📄',
            'doc': '📝',
            'docx': '📝',
            'hwp': '📝',
            'xls': '📊',
            'xlsx': '📊',
            'ppt': '📊',
            'pptx': '📊',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
            'zip': '📦',
            'rar': '📦'
        };
        return iconMap[fileType] || '📎';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 다른 공지사항으로 이동
    goToNotice(noticeId) {
        window.location.href = `notice-detail.html?id=${noticeId}`;
    }
}

// 글로벌 변수
let noticeDetailManager;

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    noticeDetailManager = new NoticeDetailManager();
});

// 글로벌 함수들
function goBack() {
    // 이전 페이지가 공지사항 목록인지 확인
    if (document.referrer.includes('notices.html')) {
        window.history.back();
    } else {
        window.location.href = 'notices.html';
    }
}

function goToNoticeList() {
    window.location.href = 'notices.html';
}

function toggleBookmark() {
    noticeDetailManager.toggleBookmark();
}

function shareNotice() {
    noticeDetailManager.shareNotice();
}

function closeShareModal() {
    noticeDetailManager.closeShareModal();
}

function copyToClipboard() {
    noticeDetailManager.copyToClipboard();
}

function shareToKakao() {
    noticeDetailManager.shareToKakao();
}

function shareToEmail() {
    noticeDetailManager.shareToEmail();
}

function reportNotice() {
    noticeDetailManager.reportNotice();
}

function closeReportModal() {
    noticeDetailManager.closeReportModal();
}

function submitReport() {
    noticeDetailManager.submitReport();
}

function printNotice() {
    noticeDetailManager.printNotice();
}

function scrollToTop() {
    noticeDetailManager.scrollToTop();
}

function editCurrentNotice() {
    if (noticeDetailManager.currentNoticeId) {
        window.location.href = `notices.html?edit=${noticeDetailManager.currentNoticeId}`;
    }
}

function deleteCurrentNotice() {
    if (!noticeDetailManager.currentNoticeId) return;
    
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        // 공지사항 삭제
        const notices = JSON.parse(localStorage.getItem('notices') || '[]');
        const updatedNotices = notices.filter(n => n.id !== noticeDetailManager.currentNoticeId);
        localStorage.setItem('notices', JSON.stringify(updatedNotices));
        
        alert('공지사항이 삭제되었습니다.');
        window.location.href = 'notices.html';
    }
}

function goToNotice(noticeId) {
    noticeDetailManager.goToNotice(noticeId);
}

function goToPrevNotice() {
    const prevElement = document.getElementById('prevNotice');
    if (prevElement.onclick) {
        prevElement.onclick();
    }
}

function goToNextNotice() {
    const nextElement = document.getElementById('nextNotice');
    if (nextElement.onclick) {
        nextElement.onclick();
    }
}

function downloadAttachment(attachmentId) {
    // 실제 환경에서는 서버에서 파일을 다운로드
    alert('파일 다운로드 기능입니다. 실제 환경에서 구현됩니다.');
}

// 페이지 언로드 시 조회수 저장
window.addEventListener('beforeunload', function() {
    if (noticeDetailManager && noticeDetailManager.notices) {
        localStorage.setItem('notices', JSON.stringify(noticeDetailManager.notices));
    }
});
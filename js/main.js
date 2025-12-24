// SPA路由功能
class Router {
    constructor() {
        this.routes = {
            '/': 'pages/home.html',
            '/characters': 'pages/characters.html',
            '/gallery': 'pages/gallery.html',
            '/about': 'pages/about.html'
        };
        
        this.contentElement = document.getElementById('app-content');
        this.init();
    }
    
    init() {
        // 监听链接点击
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]') || 
                (e.target.closest('a') && e.target.closest('a').hasAttribute('data-route'))) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route') || 
                             e.target.closest('a').getAttribute('data-route');
                this.navigate(route);
            }
        });
        
        // 监听浏览器历史变化
        window.addEventListener('popstate', () => {
            const path = this.normalizePath(window.location.pathname);
            if (path === '/') {
                // 首页内容已经在HTML中，不需要加载
                return;
            }
            this.loadContent(path);
        });
        
        // 初始加载 - 首页内容已经在HTML中，不需要加载
        // 只需要更新激活的导航链接
        const initialPath = this.normalizePath(window.location.pathname);
        this.updateActiveLink(initialPath === '/' ? '/' : initialPath);
    }
    
    normalizePath(path) {
        // 标准化路径：处理 index.html 和 /index.html
        if (path === '/index.html' || path === 'index.html' || path === '/' || !path) {
            return '/';
        }
        // 移除路径中的 index.html
        if (path.endsWith('index.html')) {
            return path.replace(/index\.html$/, '') || '/';
        }
        return path;
    }
    
    navigate(route) {
        history.pushState({}, '', route);
        this.loadContent(route);
        this.updateActiveLink(route);
    }
    
    async loadContent(route) {
        // 标准化路径
        const path = this.normalizePath(route);
        
        // 如果是首页，内容已经在HTML中，不需要加载
        if (path === '/') {
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const page = this.routes[path];
        if (!page) {
            console.error('未找到路由:', path);
            return;
        }
        
        try {
            this.showLoading();
            console.log('正在加载页面:', page, '路径:', path);
            const response = await fetch(page);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            this.contentElement.innerHTML = html;
            
            // 加载页面特定的JavaScript
            this.loadPageScript(path);
            
            // 初始化页面特定功能
            this.initPageFeatures(path);
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('加载页面失败:', error);
            console.error('尝试加载的页面路径:', page);
            
            // 检查是否使用 file:// 协议
            const isFileProtocol = window.location.protocol === 'file:';
            const errorMessage = isFileProtocol 
                ? '检测到您正在使用 file:// 协议打开文件。某些浏览器可能限制本地文件的 fetch 请求。建议使用本地 Web 服务器（如 Live Server）运行此网站。'
                : '请检查网络连接或稍后再试';
            
            this.contentElement.innerHTML = `
                <div class="error-page">
                    <h2>页面加载失败</h2>
                    <p>${errorMessage}</p>
                    <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">错误信息: ${error.message}</p>
                    <p style="font-size: 0.9rem; color: #999;">尝试加载: ${page}</p>
                    <div style="margin-top: 1.5rem;">
                        <button onclick="router.navigate('/')" style="margin-right: 1rem;">返回首页</button>
                        <button onclick="location.reload()">刷新页面</button>
                    </div>
                </div>
            `;
        }
    }
    
    loadPageScript(route) {
        const scripts = {
            '/characters': 'js/characters.js',
            '/gallery': 'js/gallery.js'
        };
        
        if (scripts[route]) {
            const script = document.createElement('script');
            script.src = scripts[route];
            script.defer = true;
            document.body.appendChild(script);
        }
    }
    
    initPageFeatures(path) {
        if (path === '/characters') {
            this.initCharacterFilter();
        }
    }
    
    initCharacterFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const species = button.dataset.species;
                this.filterCharacters(species);
                
                // 更新激活状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    filterCharacters(species) {
        const characters = document.querySelectorAll('.character-card');
        
        characters.forEach(card => {
            const cardSpecies = card.dataset.species;
            
            if (species === 'all' || cardSpecies === species) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    updateActiveLink(route) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            const linkRoute = link.getAttribute('href');
            if (linkRoute === route || (route === '/' && linkRoute === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    showLoading() {
        this.contentElement.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
    }
}

// 搜索功能
class Search {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchToggle = document.getElementById('search-toggle');
        this.searchContainer = document.querySelector('.search-container');
        this.searchResults = document.getElementById('search-results');
        this.characters = [];
        
        this.init();
        this.loadCharacters();
    }
    
    init() {
        this.searchToggle.addEventListener('click', () => {
            this.searchContainer.classList.toggle('active');
            if (this.searchContainer.classList.contains('active')) {
                setTimeout(() => this.searchInput.focus(), 300);
            }
        });
        
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        this.searchInput.addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                this.performSearch();
            } else {
                this.clearResults();
            }
        });
    }
    
    async loadCharacters() {
        try {
            const response = await fetch('data/characters.json');
            this.characters = await response.json();
        } catch (error) {
            console.error('加载角色数据失败:', error);
        }
    }
    
    performSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.clearResults();
            return;
        }
        
        const results = this.characters.filter(character => 
            character.name.toLowerCase().includes(query) ||
            character.species.toLowerCase().includes(query) ||
            character.description.toLowerCase().includes(query)
        );
        
        this.displayResults(results);
    }
    
    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = '<p class="no-results">没有找到相关结果</p>';
            this.searchResults.classList.add('active');
            return;
        }
        
        const html = results.map(character => `
            <div class="search-result-item" data-route="/characters">
                <div class="result-img">
                    <img src="${character.image}" alt="${character.name}">
                </div>
                <div class="result-info">
                    <h4>${character.name}</h4>
                    <p class="result-species">${character.species}</p>
                    <p class="result-desc">${character.description.substring(0, 100)}...</p>
                </div>
            </div>
        `).join('');
        
        this.searchResults.innerHTML = html;
        this.searchResults.classList.add('active');
        
        // 添加点击事件
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                router.navigate('/characters');
                this.searchContainer.classList.remove('active');
                this.clearResults();
                this.searchInput.value = '';
            });
        });
    }
    
    clearResults() {
        this.searchResults.innerHTML = '';
        this.searchResults.classList.remove('active');
    }
}

// 表单验证和提交
class FeedbackForm {
    constructor() {
        this.modal = document.getElementById('feedback-modal');
        this.form = document.getElementById('feedback-form');
        this.closeBtn = document.querySelector('.close-modal');
        this.feedbackBtn = document.getElementById('feedback-btn');
        
        this.init();
    }
    
    init() {
        // 打开模态框
        if (this.feedbackBtn) {
            this.feedbackBtn.addEventListener('click', () => {
                this.modal.classList.add('active');
            });
        }
        
        // 关闭模态框
        this.closeBtn.addEventListener('click', () => {
            this.modal.classList.remove('active');
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.remove('active');
            }
        });
        
        // 表单提交
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.submitForm();
            }
        });
        
        // 实时验证
        this.setupLiveValidation();
    }
    
    setupLiveValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }
    
    validateField(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let message = '';
        
        // 清除之前的错误状态
        field.classList.remove('error');
        
        if (field.required && !field.value.trim()) {
            isValid = false;
            message = '此字段为必填项';
        } else if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = '请输入有效的邮箱地址';
            }
        } else if (field.id === 'message' && field.value.trim().length < 10) {
            isValid = false;
            message = '留言至少需要10个字符';
        }
        
        if (!isValid) {
            field.classList.add('error');
            errorElement.textContent = message;
        } else {
            errorElement.textContent = '';
        }
        
        return isValid;
    }
    
    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async submitForm() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };
        
        // 显示提交状态
        const submitBtn = this.form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        submitBtn.disabled = true;
        
        try {
            // 模拟API调用
            await this.mockApiCall(formData);
            
            // 显示成功消息
            this.showSuccessMessage();
            
            // 重置表单
            this.form.reset();
            
            // 关闭模态框
            setTimeout(() => {
                this.modal.classList.remove('active');
            }, 2000);
            
        } catch (error) {
            this.showErrorMessage();
        } finally {
            // 恢复按钮状态
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    mockApiCall(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 模拟90%的成功率
                if (Math.random() < 0.9) {
                    console.log('反馈已提交:', data);
                    
                    // 保存到localStorage
                    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
                    feedbacks.push(data);
                    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
                    
                    resolve();
                } else {
                    reject(new Error('提交失败，请稍后重试'));
                }
            }, 1500);
        });
    }
    
    showSuccessMessage() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const errorElement = group.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
        
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>感谢您的反馈！我们已经收到您的留言。</p>
        `;
        
        const submitBtn = this.form.querySelector('.btn-submit');
        this.form.insertBefore(successMsg, submitBtn);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }
    
    showErrorMessage() {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>提交失败，请稍后重试</p>
        `;
        
        const submitBtn = this.form.querySelector('.btn-submit');
        this.form.insertBefore(errorMsg, submitBtn);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 3000);
    }
}

// 移动菜单功能
class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        
        this.init();
    }
    
    init() {
        this.menuBtn.addEventListener('click', () => {
            this.navLinks.classList.toggle('active');
            const icon = this.menuBtn.querySelector('i');
            
            if (this.navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // 点击链接后关闭菜单
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                this.navLinks.classList.remove('active');
                const icon = this.menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建路由器实例
    window.router = new Router();
    
    // 初始化搜索功能
    window.search = new Search();
    
    // 初始化反馈表单
    window.feedbackForm = new FeedbackForm();
    
    // 初始化移动菜单
    window.mobileMenu = new MobileMenu();
    
    // 添加反馈按钮（如果不存在）
    if (!document.getElementById('feedback-btn')) {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const feedbackBtn = document.createElement('button');
            feedbackBtn.id = 'feedback-btn';
            feedbackBtn.className = 'btn btn-secondary';
            feedbackBtn.innerHTML = '<i class="fas fa-comment-dots"></i> 意见反馈';
            document.querySelector('.hero-btns').appendChild(feedbackBtn);
        }
    }
    
    // 监听路由变化，重新绑定反馈按钮
    document.addEventListener('routeChanged', () => {
        setTimeout(() => {
            const existingFeedbackBtn = document.getElementById('feedback-btn');
            if (!existingFeedbackBtn) {
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    const feedbackBtn = document.createElement('button');
                    feedbackBtn.id = 'feedback-btn';
                    feedbackBtn.className = 'btn btn-secondary';
                    feedbackBtn.innerHTML = '<i class="fas fa-comment-dots"></i> 意见反馈';
                    document.querySelector('.hero-btns').appendChild(feedbackBtn);
                }
            }
        }, 100);
    });
});
// 水平滚动功能
function initHorizontalScroll() {
    const scrollContainer = document.querySelector('.characters-horizontal-grid');
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    const scrollProgress = document.querySelector('.scroll-progress');
    
    if (!scrollContainer) return;
    
    // 滚动步长（一个卡片的宽度 + 间距）
    const scrollStep = 370; // 350px卡片宽度 + 20px间距
    
    // 左滚动按钮
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: -scrollStep,
                behavior: 'smooth'
            });
        });
    }
    
    // 右滚动按钮
    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: scrollStep,
                behavior: 'smooth'
            });
        });
    }
    
    // 更新滚动进度指示器
    function updateScrollProgress() {
        const scrollWidth = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const scrollLeft = scrollContainer.scrollLeft;
        const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
        
        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }
        
        // 根据滚动位置显示/隐藏滚动按钮
        if (scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.style.opacity = scrollLeft <= 10 ? '0.5' : '1';
            scrollRightBtn.style.opacity = scrollLeft >= scrollWidth - 10 ? '0.5' : '1';
        }
    }
    
    // 监听滚动事件
    scrollContainer.addEventListener('scroll', updateScrollProgress);
    
    // 初始化进度条
    updateScrollProgress();
    
    // 鼠标滚轮水平滚动
    scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
    });
    
    // 触摸滑动支持
    let isDown = false;
    let startX;
    let scrollLeftStart;
    
    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.style.cursor = 'grabbing';
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeftStart = scrollContainer.scrollLeft;
    });
    
    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });
    
    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });
    
    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainer.scrollLeft = scrollLeftStart - walk;
    });
    
    // 设置初始光标
    scrollContainer.style.cursor = 'grab';
    
    // 为视频播放叠加层添加点击事件
    const videoOverlays = document.querySelectorAll('.video-play-overlay');
    videoOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.getAttribute('data-video');
            const modal = document.getElementById(`${videoId}-modal`);
            
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                const video = modal.querySelector('video');
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(e => {
                        console.log('自动播放被阻止:', e);
                    });
                }
            }
        });
    });
    
    // 为水平滚动卡片上的按钮添加点击事件
    const horizontalBtns = document.querySelectorAll('.learn-more-btn-horizontal');
    horizontalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.getAttribute('data-video');
            const modal = document.getElementById(`${videoId}-modal`);
            
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                const video = modal.querySelector('video');
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(e => {
                        console.log('自动播放被阻止:', e);
                    });
                }
            }
        });
    });
    
    // 点击整个卡片也可以触发视频
    const horizontalCards = document.querySelectorAll('.character-horizontal-card');
    horizontalCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的不是按钮或叠加层
            if (!e.target.closest('.learn-more-btn-horizontal') && !e.target.closest('.video-play-overlay')) {
                const videoBtn = this.querySelector('.learn-more-btn-horizontal');
                if (videoBtn) {
                    videoBtn.click();
                }
            }
        });
    });
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initHorizontalScroll();
    
    // 原有的其他JavaScript代码...
});// 视频模态框功能
class VideoModal {
    constructor() {
        this.modal = document.getElementById('video-modal');
        this.videoElement = document.getElementById('character-video');
        this.videoTitle = document.getElementById('video-title');
        this.videoDescription = document.getElementById('video-description');
        this.closeBtn = document.querySelector('#video-modal .close-modal');
        this.learnMoreBtns = document.querySelectorAll('.learn-more-btn');
        
        this.init();
    }
    
    init() {
        // 为"了解更多"按钮添加点击事件
        this.learnMoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(
                    btn.getAttribute('data-video'),
                    btn.getAttribute('data-title'),
                    btn.getAttribute('data-description')
                );
            });
        });
        
        // 关闭按钮点击事件
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 按ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    openModal(videoSrc, title, description) {
        // 设置视频源
        this.videoElement.src = videoSrc;
        
        // 设置标题和描述
        this.videoTitle.textContent = title;
        this.videoDescription.textContent = description;
        
        // 显示模态框
        this.modal.classList.add('active');
        
        // 开始播放视频
        this.videoElement.play().catch(e => {
            console.log('自动播放被阻止，用户需要手动播放:', e);
        });
        
        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        // 暂停视频
        this.videoElement.pause();
        
        // 隐藏模态框
        this.modal.classList.remove('active');
        
        // 恢复页面滚动
        document.body.style.overflow = '';
        
        // 重置视频源
        this.videoElement.src = '';
    }
}

// 在DOM加载完成后初始化视频模态框
document.addEventListener('DOMContentLoaded', function() {
    // 原有的JavaScript代码...
    
    // 初始化视频模态框
    window.videoModal = new VideoModal();
});// 英雄区域背景图片处理
function handleHeroBackground() {
    const heroBg = document.querySelector('.hero-bg-image');
    const heroBgWrapper = document.querySelector('.hero-bg-wrapper');
    
    if (heroBg) {
        // 图片加载成功
        heroBg.onload = function() {
            console.log('英雄区域背景图片加载成功');
            heroBg.style.opacity = '1';
        };
        
        // 图片加载失败
        heroBg.onerror = function() {
            console.log('英雄区域背景图片加载失败，使用备用背景');
            if (heroBgWrapper) {
                heroBgWrapper.classList.add('bg-fallback');
            }
        };
        
        // 预加载图片
        const preloadImg = new Image();
        preloadImg.src = heroBg.src;
    }
}

// 在DOM加载完成后调用
document.addEventListener('DOMContentLoaded', function() {
    handleHeroBackground();
    
    // 原有的其他JavaScript代码...
});
// 视频模态框功能
function initVideoModals() {
    // 获取所有视频模态框和关闭按钮
    const videoModals = document.querySelectorAll('.video-modal');
    const closeButtons = document.querySelectorAll('.close-video-modal');
    
    // 为每个关闭按钮添加点击事件
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = this.closest('.video-modal');
            if (modal) {
                closeVideoModal(modal);
            }
        });
    });
    
    // 点击模态框背景关闭
    videoModals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeVideoModal(this);
            }
        });
    });
    
    // 按ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.video-modal.active');
            if (activeModal) {
                closeVideoModal(activeModal);
            }
        }
    });
    
    // 关闭视频模态框的函数
    function closeVideoModal(modal) {
        // 移除激活类
        modal.classList.remove('active');
        
        // 暂停视频
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0; // 重置到开始
        }
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }
    
    // 为所有"观看介绍"按钮添加点击事件
    const watchButtons = document.querySelectorAll('.learn-more-btn-horizontal');
    watchButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const videoId = this.getAttribute('data-video');
            const modal = document.getElementById(`${videoId}-modal`);
            
            if (modal) {
                openVideoModal(modal);
            }
        });
    });
    
    // 为视频播放叠加层添加点击事件
    const videoOverlays = document.querySelectorAll('.video-play-overlay');
    videoOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const videoId = this.getAttribute('data-video');
            const modal = document.getElementById(`${videoId}-modal`);
            
            if (modal) {
                openVideoModal(modal);
            }
        });
    });
    
    // 打开视频模态框的函数
    function openVideoModal(modal) {
        // 添加激活类
        modal.classList.add('active');
        
        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
        
        // 自动播放视频
        const video = modal.querySelector('video');
        if (video) {
            video.currentTime = 0; // 重置到开始
            video.play().catch(e => {
                console.log('自动播放被阻止，用户需要手动播放:', e);
            });
        }
    }
}

// 水平滚动功能
function initHorizontalScroll() {
    const scrollContainer = document.querySelector('.characters-horizontal-grid');
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    const scrollProgress = document.querySelector('.scroll-progress');
    
    if (!scrollContainer) return;
    
    // 滚动步长（一个卡片的宽度 + 间距）
    const scrollStep = 370; // 350px卡片宽度 + 20px间距
    
    // 左滚动按钮
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: -scrollStep,
                behavior: 'smooth'
            });
        });
    }
    
    // 右滚动按钮
    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: scrollStep,
                behavior: 'smooth'
            });
        });
    }
    
    // 更新滚动进度指示器
    function updateScrollProgress() {
        const scrollWidth = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const scrollLeft = scrollContainer.scrollLeft;
        const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
        
        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }
        
        // 根据滚动位置显示/隐藏滚动按钮
        if (scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.style.opacity = scrollLeft <= 10 ? '0.5' : '1';
            scrollRightBtn.style.opacity = scrollLeft >= scrollWidth - 10 ? '0.5' : '1';
        }
    }
    
    // 监听滚动事件
    scrollContainer.addEventListener('scroll', updateScrollProgress);
    
    // 初始化进度条
    updateScrollProgress();
    
    // 鼠标滚轮水平滚动
    scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
    });
    
    // 触摸滑动支持
    let isDown = false;
    let startX;
    let scrollLeftStart;
    
    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.style.cursor = 'grabbing';
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeftStart = scrollContainer.scrollLeft;
    });
    
    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });
    
    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });
    
    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainer.scrollLeft = scrollLeftStart - walk;
    });
    
    // 设置初始光标
    scrollContainer.style.cursor = 'grab';
}

// 在DOM加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化视频模态框
    initVideoModals();
    
    // 初始化水平滚动
    initHorizontalScroll();
    
    // 原有的其他JavaScript代码...
    
    // 确保反馈按钮正常工作
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedbackBtn = feedbackModal?.querySelector('.close-modal');
    
    if (feedbackBtn && feedbackModal) {
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeFeedbackBtn && feedbackModal) {
        closeFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
            
            // 暂停模态框内的所有视频
            const videos = e.target.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });
});

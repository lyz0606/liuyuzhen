// 作品集页面JavaScript

// 作品数据
const galleryItems = [
    {
        id: 1,
        title: "动物城全景",
        category: "scene",
        description: "疯狂动物城的壮丽全景，展现了这座城市的多样性和活力。",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cdb89?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cdb89?w=400&h=300&fit=crop"
    },
    {
        id: 2,
        title: "朱迪和尼克",
        category: "character",
        description: "两位主角的经典合影，展现了他们深厚的友谊。",
        image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop"
    },
    {
        id: 3,
        title: "官方海报",
        category: "poster",
        description: "电影官方宣传海报，展现了动物城的魅力。",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop"
    },
    {
        id: 4,
        title: "城市夜景",
        category: "scene",
        description: "夜幕下的动物城，灯火通明，充满生机。",
        image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop"
    },
    {
        id: 5,
        title: "闪电的慢动作",
        category: "character",
        description: "树懒闪电的经典慢动作场景，令人忍俊不禁。",
        image: "https://images.unsplash.com/photo-1534361960057-19889c4c8c0a?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1534361960057-19889c4c8c0a?w=400&h=300&fit=crop"
    },
    {
        id: 6,
        title: "粉丝创作",
        category: "fanart",
        description: "粉丝创作的精彩同人作品，展现了大家对电影的热爱。",
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop"
    },
    {
        id: 7,
        title: "警局场景",
        category: "scene",
        description: "动物城警局的内部场景，朱迪工作的地方。",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
    },
    {
        id: 8,
        title: "角色集合",
        category: "character",
        description: "所有主要角色的集合图，展现了角色的多样性。",
        image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop"
    },
    {
        id: 9,
        title: "创意海报",
        category: "poster",
        description: "创意设计的电影海报，充满艺术感。",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop"
    }
];

let currentItems = [...galleryItems];
let currentIndex = 0;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    initFilters();
    initLightbox();
    initMobileMenu();
});

// 渲染作品网格
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    
    if (currentItems.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-images" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <h3>没有找到匹配的作品</h3>
                <p>请尝试其他分类</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = currentItems.map((item, index) => `
        <div class="gallery-item" data-category="${item.category}" data-index="${index}">
            <div class="gallery-image-wrapper">
                <img src="${item.thumbnail}" alt="${item.title}" class="gallery-image" 
                     onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.title)}'">
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <span class="gallery-category">${getCategoryName(item.category)}</span>
                        <h3 class="gallery-title-text">${item.title}</h3>
                        <p class="gallery-description">${item.description}</p>
                    </div>
                </div>
                <div class="gallery-zoom">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
        </div>
    `).join('');
    
    // 添加点击事件
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        'all': '全部',
        'scene': '场景',
        'character': '角色',
        'poster': '海报',
        'fanart': '同人作品'
    };
    return names[category] || category;
}

// 初始化筛选功能
function initFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 更新激活状态
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 获取分类
            const category = this.dataset.category;
            
            // 筛选作品
            if (category === 'all') {
                currentItems = [...galleryItems];
            } else {
                currentItems = galleryItems.filter(item => item.category === category);
            }
            
            // 重新渲染
            const grid = document.getElementById('gallery-grid');
            grid.style.opacity = '0';
            grid.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                renderGallery();
                grid.style.transition = 'all 0.3s ease';
                grid.style.opacity = '1';
                grid.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// 初始化灯箱
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    // 关闭灯箱
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // 上一张/下一张
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
        updateLightboxImage();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentItems.length;
        updateLightboxImage();
    });
    
    // 键盘导航
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
            updateLightboxImage();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % currentItems.length;
            updateLightboxImage();
        }
    });
}

// 打开灯箱
function openLightbox(index) {
    currentIndex = index;
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightboxImage();
}

// 更新灯箱图片
function updateLightboxImage() {
    const item = currentItems[currentIndex];
    if (!item) return;
    
    document.getElementById('lightbox-image').src = item.image;
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-description').textContent = item.description;
}

// 关闭灯箱
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// 移动菜单功能
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}


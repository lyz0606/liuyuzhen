// 角色页面JavaScript

// 角色数据
let allCharacters = [];
let filteredCharacters = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    initFilters();
    initMobileMenu();
});

// 加载角色数据
async function loadCharacters() {
    try {
        const response = await fetch('../data/characters.json');
        if (!response.ok) {
            throw new Error('无法加载角色数据');
        }
        allCharacters = await response.json();
        filteredCharacters = [...allCharacters];
        renderCharacters();
    } catch (error) {
        console.error('加载角色失败:', error);
        document.getElementById('characters-container').innerHTML = `
            <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"></i>
                <h3>无法加载角色数据</h3>
                <p>请检查网络连接或稍后再试</p>
            </div>
        `;
    }
}

// 渲染角色卡片
function renderCharacters() {
    const container = document.getElementById('characters-container');
    
    if (filteredCharacters.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <h3>没有找到匹配的角色</h3>
                <p>请尝试其他筛选条件</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredCharacters.map(character => `
        <div class="character-card" data-species="${character.species}">
            <div class="character-image-wrapper">
                <img src="../${character.image}" alt="${character.name}" class="character-img" 
                     onerror="this.src='https://via.placeholder.com/400x500?text=${encodeURIComponent(character.name)}'">
                <div class="character-overlay"></div>
                <div class="character-badge">${character.role}</div>
            </div>
            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                <div class="character-meta">
                    <span class="character-species">
                        <i class="fas fa-paw"></i> ${character.species}
                    </span>
                    <span class="character-role">${character.role}</span>
                </div>
                <p class="character-description">${character.description}</p>
                <div class="character-traits">
                    ${character.traits.map(trait => `
                        <span class="trait-tag">${trait}</span>
                    `).join('')}
                </div>
                <button class="character-action" onclick="showCharacterDetail(${character.id})">
                    查看详情 <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // 添加卡片交互效果
    addCardInteractions();
}

// 添加卡片交互效果
function addCardInteractions() {
    const cards = document.querySelectorAll('.character-card');
    
    cards.forEach(card => {
        // 鼠标进入效果
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
            
            // 添加光晕效果
            const glow = document.createElement('div');
            glow.className = 'card-glow';
            glow.style.cssText = `
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(74,111,165,0.2) 0%, transparent 70%);
                pointer-events: none;
                z-index: -1;
            `;
            this.appendChild(glow);
        });
        
        // 鼠标离开效果
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
            const glow = this.querySelector('.card-glow');
            if (glow) glow.remove();
        });
        
        // 点击效果
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// 初始化筛选功能
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新激活状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 获取筛选条件
            const species = this.dataset.species;
            
            // 筛选角色
            if (species === 'all') {
                filteredCharacters = [...allCharacters];
            } else {
                filteredCharacters = allCharacters.filter(char => char.species === species);
            }
            
            // 重新渲染
            renderCharacters();
            
            // 添加筛选动画
            const container = document.getElementById('characters-container');
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.3s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        });
    });
}

// 显示角色详情（可以扩展为模态框）
function showCharacterDetail(id) {
    const character = allCharacters.find(char => char.id === id);
    if (!character) return;
    
    // 创建详情模态框
    const modal = document.createElement('div');
    modal.className = 'character-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: var(--card-bg);
            border-radius: 20px;
            max-width: 600px;
            width: 100%;
            padding: 2rem;
            position: relative;
            animation: slideUp 0.3s ease;
        ">
            <button class="modal-close" onclick="this.closest('.character-modal').remove()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: var(--text-color);
            ">&times;</button>
            <img src="../${character.image}" alt="${character.name}" style="
                width: 100%;
                max-height: 400px;
                object-fit: cover;
                border-radius: 15px;
                margin-bottom: 1.5rem;
            " onerror="this.src='https://via.placeholder.com/600x400?text=${encodeURIComponent(character.name)}'">
            <h2 style="color: var(--primary-color); margin-bottom: 1rem;">${character.name}</h2>
            <p style="margin-bottom: 1rem;"><strong>物种:</strong> ${character.species}</p>
            <p style="margin-bottom: 1rem;"><strong>角色:</strong> ${character.role}</p>
            <p style="margin-bottom: 1.5rem; line-height: 1.8;">${character.description}</p>
            <div>
                <strong>特质:</strong>
                ${character.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
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

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);


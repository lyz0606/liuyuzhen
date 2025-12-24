// 主题管理
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // 应用保存的主题
        this.setTheme(this.currentTheme);
        
        // 切换主题
        this.themeToggle.addEventListener('click', () => {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
            this.saveTheme(newTheme);
        });
        
        // 监听系统主题变化
        this.watchSystemTheme();
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // 更新图标
        if (theme === 'dark') {
            this.themeIcon.classList.remove('fa-moon');
            this.themeIcon.classList.add('fa-sun');
            this.themeToggle.title = '切换到明亮模式';
        } else {
            this.themeIcon.classList.remove('fa-sun');
            this.themeIcon.classList.add('fa-moon');
            this.themeToggle.title = '切换到暗黑模式';
        }
    }
    
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
    
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 如果用户没有选择主题，跟随系统
        if (!localStorage.getItem('theme')) {
            this.handleSystemThemeChange(mediaQuery);
        }
        
        // 监听系统主题变化
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.handleSystemThemeChange(e);
            }
        });
    }
    
    handleSystemThemeChange(e) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.setTheme(systemTheme);
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});